import logging
from datetime import datetime, date
from decimal import Decimal
from django.db.models import Avg, StdDev
from .models import AnomalyAlert
from apps.documents.models import Document, ExtractedData

logger = logging.getLogger(__name__)

def detect_anomalies_for_document(document: Document, extracted_data: dict) -> list:
    """
    Executes automated fraud and anomaly detection checks for a processed document.
    """
    alerts = []
    org = document.organization
    vendor_name = extracted_data.get('vendor_name', '').strip()
    invoice_num = extracted_data.get('invoice_number', '').strip()
    total = float(extracted_data.get('total_amount') or 0.0)
    subtotal = float(extracted_data.get('subtotal') or 0.0)
    tax = float(extracted_data.get('tax_amount') or 0.0)
    due_date_str = extracted_data.get('due_date')

    # Rule 1: Duplicate Invoice Check
    if invoice_num and vendor_name:
        existing_duplicate = ExtractedData.objects.filter(
            document__organization=org,
            vendor_name__iexact=vendor_name,
            invoice_number__iexact=invoice_num
        ).exclude(document=document).first()

        if existing_duplicate:
            alert = AnomalyAlert.objects.create(
                organization=org,
                document=document,
                anomaly_type='DUPLICATE_INVOICE',
                severity='HIGH',
                title=f"Duplicate Invoice #{invoice_num} Detected",
                description=f"An identical invoice #{invoice_num} from {vendor_name} was already processed in document '{existing_duplicate.document.file_name}'.",
                suggested_action="Verify with accounts payable whether this is an accidental double-submission before authorizing payout."
            )
            alerts.append(alert)

    # Rule 2: Tax Calculation Mismatch Check
    if subtotal > 0 and tax > 0 and total > 0:
        expected_total = subtotal + tax
        discrepancy = abs(total - expected_total)
        if discrepancy > 1.50:  # Allow small rounding tolerance
            alert = AnomalyAlert.objects.create(
                organization=org,
                document=document,
                anomaly_type='TAX_MISMATCH',
                severity='MEDIUM',
                title="Tax Calculation Discrepancy",
                description=f"Calculated Subtotal (${subtotal:,.2f}) + Tax (${tax:,.2f}) equals ${expected_total:,.2f}, which differs from the stated Total of ${total:,.2f} by ${discrepancy:,.2f}.",
                suggested_action="Review line-item rates and state/VAT tax percentages to correct the discrepancy."
            )
            alerts.append(alert)

    # Rule 3: Outlier / Spending Spike Check
    if vendor_name and total > 0:
        historical_stats = ExtractedData.objects.filter(
            document__organization=org,
            vendor_name__iexact=vendor_name
        ).exclude(document=document).aggregate(avg_amt=Avg('total_amount'))

        avg_spend = historical_stats.get('avg_amt')
        if avg_spend and float(avg_spend) > 0:
            if total > float(avg_spend) * 2.5 and total > 5000:
                alert = AnomalyAlert.objects.create(
                    organization=org,
                    document=document,
                    anomaly_type='UNUSUAL_AMOUNT',
                    severity='HIGH',
                    title=f"Unusual Spending Spike for {vendor_name}",
                    description=f"Invoice total of ${total:,.2f} is significantly higher than historical average (${float(avg_spend):,.2f}) for this vendor.",
                    suggested_action="Escalate to department head for budget variance authorization."
                )
                alerts.append(alert)

    # Rule 4: Immediate Late Payment Risk Check
    if due_date_str:
        try:
            if isinstance(due_date_str, str):
                due = datetime.strptime(due_date_str, '%Y-%m-%d').date()
            else:
                due = due_date_str
            
            today = date.today()
            if due < today:
                days_overdue = (today - due).days
                alert = AnomalyAlert.objects.create(
                    organization=org,
                    document=document,
                    anomaly_type='LATE_PAYMENT_RISK',
                    severity='MEDIUM' if days_overdue < 15 else 'HIGH',
                    title=f"Payment Overdue by {days_overdue} Days",
                    description=f"This document had a payment due date of {due.strftime('%b %d, %Y')}. Late fee penalty or credit hold risk.",
                    suggested_action="Schedule immediate remittance to maintain supplier discount terms."
                )
                alerts.append(alert)
        except Exception:
            pass

    return alerts
