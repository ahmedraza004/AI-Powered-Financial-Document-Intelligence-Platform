import pytest
from decimal import Decimal
from apps.authentication.models import Organization, User
from apps.documents.models import Document, ExtractedData
from apps.anomalies.models import AnomalyAlert
from apps.anomalies.detector import detect_anomalies_for_document

@pytest.mark.django_db
class TestAnomalyEngine:
    def test_duplicate_invoice_detection(self):
        org = Organization.objects.create(name="Anomaly Test Org")
        user = User.objects.create_user(email="test@anomaly.org", organization=org)

        # 1. First doc
        doc1 = Document.objects.create(
            user=user,
            organization=org,
            file_name="Invoice_Original.pdf",
            status="COMPLETED",
            doc_type="INVOICE"
        )
        ExtractedData.objects.create(
            document=doc1,
            vendor_name="Microsoft Corporation",
            invoice_number="MSFT-99182",
            total_amount=Decimal("5000.00")
        )

        # 2. Second duplicate doc
        doc2 = Document.objects.create(
            user=user,
            organization=org,
            file_name="Invoice_Duplicate.pdf",
            status="PROCESSING",
            doc_type="INVOICE"
        )
        extracted_data_2 = {
            "vendor_name": "Microsoft Corporation",
            "invoice_number": "MSFT-99182",
            "total_amount": 5000.00,
            "subtotal": 5000.00,
            "tax_amount": 0.00,
            "due_date": None
        }

        alerts = detect_anomalies_for_document(doc2, extracted_data_2)
        assert len(alerts) >= 1
        assert any(a.anomaly_type == 'DUPLICATE_INVOICE' for a in alerts)

    def test_tax_calculation_discrepancy(self):
        org = Organization.objects.create(name="Tax Test Org")
        user = User.objects.create_user(email="test@tax.org", organization=org)
        doc = Document.objects.create(
            user=user,
            organization=org,
            file_name="Tax_Discrepancy.pdf",
            status="PROCESSING",
            doc_type="INVOICE"
        )
        extracted_data = {
            "vendor_name": "Hardware Corp",
            "invoice_number": "INV-1002",
            "subtotal": 1000.00,
            "tax_amount": 100.00,
            "total_amount": 1400.00,  # 1000 + 100 != 1400!
            "due_date": None
        }

        alerts = detect_anomalies_for_document(doc, extracted_data)
        assert any(a.anomaly_type == 'TAX_MISMATCH' for a in alerts)
