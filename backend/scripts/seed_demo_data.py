import os
import sys
import django
from decimal import Decimal
from datetime import datetime, date, timedelta
from django.core.files.base import ContentFile

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.authentication.models import Organization
from apps.documents.models import Document, ExtractedData, AISummary
from apps.anomalies.models import AnomalyAlert
from apps.audit.models import AuditLog
from apps.billing.models import Subscription, InvoiceRecord
from apps.search_rag.models import DocumentChunk, ChatMessage
from apps.search_rag.embeddings import generate_embedding

User = get_user_model()

def run_seed():
    print("[*] Seeding FinDoc Intelligence SaaS Platform...")

    # 1. Create Organization
    org, _ = Organization.objects.get_or_create(
        name="Acme Global Capital & Ventures",
        defaults={
            "plan": "PRO",
            "ai_credits_limit": 1000,
            "ai_credits_used": 142,
            "storage_limit_mb": 10240,
            "storage_used_mb": 348.5,
        }
    )
    print(f"[OK] Organization ready: {org.name}")


    # 2. Create Admin User & Team
    admin_user, created = User.objects.get_or_create(
        email="admin@findoc.ai",
        defaults={
            "username": "admin@findoc.ai",
            "name": "Alex Mercer",
            "role": "ADMIN",
            "title": "Chief Financial Officer (CFO)",
            "organization": org,
            "phone": "+1 (555) 019-2834",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        }
    )
    if created:
        admin_user.set_password("password123")
        admin_user.save()

    manager_user, _ = User.objects.get_or_create(
        email="sarah.chen@findoc.ai",
        defaults={
            "username": "sarah.chen@findoc.ai",
            "name": "Sarah Chen",
            "role": "MANAGER",
            "title": "VP of Financial Operations",
            "organization": org,
            "phone": "+1 (555) 019-5842",
            "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
        }
    )
    if _:
        manager_user.set_password("password123")
        manager_user.save()

    analyst_user, _ = User.objects.get_or_create(
        email="marcus.vance@findoc.ai",
        defaults={
            "username": "marcus.vance@findoc.ai",
            "name": "Marcus Vance",
            "role": "EMPLOYEE",
            "title": "Senior Financial Data Analyst",
            "organization": org,
            "phone": "+1 (555) 019-9941",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
        }
    )

    if _:
        analyst_user.set_password("password123")
        analyst_user.save()

    print(f"[OK] Users ready: Admin ({admin_user.email}), Manager ({manager_user.email}), Analyst ({analyst_user.email})")


    # 3. Create Subscription & Billing Records
    sub, _ = Subscription.objects.get_or_create(
        organization=org,
        defaults={
            "status": "ACTIVE",
            "current_period_start": datetime.now() - timedelta(days=15),
            "current_period_end": datetime.now() + timedelta(days=15),
        }
    )

    InvoiceRecord.objects.get_or_create(
        organization=org,
        stripe_invoice_id="in_1P98fX2eZvKYlo2C",
        defaults={
            "amount": Decimal("79.00"),
            "currency": "USD",
            "status": "PAID",
            "billing_period": "Professional Plan - August 2026"
        }
    )

    # 4. Seed Rich Financial Documents
    sample_documents = [
        {
            "file_name": "AWS_Cloud_Infrastructure_Invoice_August2026.pdf",
            "doc_type": "INVOICE",
            "status": "COMPLETED",
            "page_count": 3,
            "vendor_name": "Amazon Web Services (AWS)",
            "invoice_number": "INV-AWS-8829104",
            "issue_date": "2026-08-01",
            "due_date": "2026-08-31",
            "subtotal": 17083.33,
            "tax_amount": 1366.67,
            "total_amount": 18450.00,
            "confidence_score": 0.99,
            "line_items": [
                {"description": "Amazon EC2 Elastic Compute Cloud (us-east-1)", "quantity": 18, "unit_price": 450.00, "total": 8100.00},
                {"description": "Amazon Aurora PostgreSQL Multi-AZ Cluster", "quantity": 4, "unit_price": 1250.00, "total": 5000.00},
                {"description": "Amazon S3 Standard Tier Storage & Egress", "quantity": 1, "unit_price": 3983.33, "total": 3983.33},
            ],
            "bank_info": {"iban": "US89AWSB7728190029", "routing": "021000021", "account": "****8921"},
            "content": """AMAZON WEB SERVICES, INC.
INVOICE SUMMARY
Invoice Number: INV-AWS-8829104
Invoice Date: August 1, 2026
Payment Due Date: August 31, 2026
Account Number: 9812-4019-3382

Bill To:
Acme Global Capital & Ventures
500 Howard Street, Suite 400
San Francisco, CA 94105

SERVICES SUMMARY:
- Amazon EC2 Elastic Compute Cloud (us-east-1): $8,100.00
- Amazon Aurora PostgreSQL Multi-AZ Cluster: $5,000.00
- Amazon S3 Standard Tier Storage & Egress: $3,983.33

SUBTOTAL: $17,083.33
ESTIMATED TAX (8%): $1,366.67
TOTAL AMOUNT DUE: $18,450.00 USD

Remit Payment To:
JPMorgan Chase Bank - AWS Billing
Routing / ABA: 021000021
IBAN: US89AWSB7728190029
""",
            "summary": "Monthly enterprise cloud infrastructure billing from Amazon Web Services (AWS) totaling $18,450.00 USD. Primary cost drivers include 18 EC2 GPU compute instances and Aurora Multi-AZ database cluster.",
            "insights": [
                "Compute costs represent 43.9% of overall cloud expenditure.",
                "Database cluster costs steady at $5,000.00/mo.",
                "Egress data transfer observed a 12% drop compared to prior billing cycle."
            ]
        },
        {
            "file_name": "Microsoft_Enterprise_Azure_Agreement_Q3.pdf",
            "doc_type": "INVOICE",
            "status": "COMPLETED",
            "page_count": 2,
            "vendor_name": "Microsoft Corporation",
            "invoice_number": "MSFT-EA-9912048",
            "issue_date": "2026-08-15",
            "due_date": "2026-09-15",
            "subtotal": 11388.89,
            "tax_amount": 911.11,
            "total_amount": 12300.00,
            "confidence_score": 0.98,
            "line_items": [
                {"description": "Azure OpenAI GPT-4o Enterprise Endpoints", "quantity": 1, "unit_price": 7500.00, "total": 7500.00},
                {"description": "Microsoft 365 E5 Security & Compliance Licenses", "quantity": 80, "unit_price": 48.61, "total": 3888.89},
            ],
            "bank_info": {"iban": "US44MSFT0092817721", "routing": "121000358", "account": "****4412"},
            "content": """MICROSOFT CORPORATION
COMMERCIAL ENTERPRISE BILLING
Invoice No: MSFT-EA-9912048
Date: August 15, 2026
Due Date: September 15, 2026

Customer: Acme Global Capital & Ventures

Product Description:
1. Azure OpenAI GPT-4o Enterprise Provisioned Throughput: $7,500.00
2. Microsoft 365 E5 Copilot & Compliance Licenses (80 seats): $3,888.89

Subtotal: $11,388.89
Sales Tax / VAT: $911.11
Total Payable: $12,300.00 USD
Payment method: Direct Wire Transfer to Microsoft Treasury
""",
            "summary": "Enterprise agreement renewal for Azure OpenAI API access and Microsoft 365 E5 licenses totaling $12,300.00 USD.",
            "insights": [
                "Azure OpenAI capacity dedicated throughput accounts for $7,500.00.",
                "Seats licensed: 80 active enterprise seats at $48.61/seat.",
                "Payment scheduled before September 15, 2026."
            ]
        },
        {
            "file_name": "Chase_Bank_Commercial_Statement_Aug2026.pdf",
            "doc_type": "BANK_STATEMENT",
            "status": "COMPLETED",
            "page_count": 4,
            "vendor_name": "JPMorgan Chase Bank, N.A.",
            "invoice_number": "STMT-CHASE-082026",
            "issue_date": "2026-08-31",
            "due_date": "2026-08-31",
            "subtotal": 340500.00,
            "tax_amount": 0.00,
            "total_amount": 340500.00,
            "confidence_score": 0.99,
            "line_items": [
                {"description": "Commercial Operating Checking Ending Balance", "quantity": 1, "unit_price": 285400.00, "total": 285400.00},
                {"description": "High Yield Treasury Reserve Account", "quantity": 1, "unit_price": 55100.00, "total": 55100.00},
            ],
            "bank_info": {"iban": "US12CHAS00928172910", "routing": "021000021", "account": "****5590"},
            "content": """JPMORGAN CHASE BANK, N.A.
COMMERCIAL BANKING MONTHLY STATEMENT
Statement Period: August 1, 2026 - August 31, 2026
Account Number ending in: 5590

Account Summary:
Beginning Balance: $382,100.00
Total Electronic Deposits (14): +$128,450.00
Total Electronic Withdrawals & Payroll (42): -$170,050.00
Ending Ledger Balance: $340,500.00

High Yield Treasury Sweep Account (Yield 5.15% APY):
Sweep Account Ending Balance: $55,100.00

Total Liquid Cash & Equivalents: $340,500.00 USD
""",
            "summary": "Monthly corporate treasury banking statement from JPMorgan Chase indicating an ending ledger cash balance of $340,500.00 USD and positive net operating cashflow.",
            "insights": [
                "Net monthly operating cash burn: $41,600.00.",
                "Estimated financial runway at current burn rate: 8.2 months.",
                "Yield on Treasury sweep portfolio generating $236.40 in monthly passive interest."
            ]
        },
        {
            "file_name": "Deloitte_Financial_Audit_Report_2026.pdf",
            "doc_type": "AUDIT_REPORT",
            "status": "COMPLETED",
            "page_count": 8,
            "vendor_name": "Deloitte & Touche LLP",
            "invoice_number": "DEL-AUD-2026-Q2",
            "issue_date": "2026-07-20",
            "due_date": "2026-08-20",
            "subtotal": 15000.00,
            "tax_amount": 0.00,
            "total_amount": 15000.00,
            "confidence_score": 0.97,
            "line_items": [
                {"description": "Independent Financial Statement Audit & Internal Controls Review", "quantity": 1, "unit_price": 15000.00, "total": 15000.00}
            ],
            "bank_info": {"iban": "US77DELO8829104812", "routing": "071000013", "account": "****1109"},
            "content": """DELOITTE & TOUCHE LLP
REPORT OF INDEPENDENT CERTIFIED PUBLIC ACCOUNTANTS
To the Board of Directors of Acme Global Capital:

Opinion:
We have audited the accompanying balance sheet and related income statements.
In our opinion, the consolidated financial statements present fairly, in all material respects, 
the financial position of Acme Global Capital in conformity with U.S. GAAP.

Audit Fee: $15,000.00
Status: Unqualified / Clean Audit Opinion
""",
            "summary": "Annual independent certified audit report from Deloitte & Touche LLP granting an Unqualified (Clean) audit opinion on internal controls and balance sheets.",
            "insights": [
                "100% compliant with standard U.S. GAAP principles.",
                "No material accounting weaknesses or ledger discrepancies identified.",
                "Audit retainer fee settled at $15,000.00."
            ]
        },
        {
            "file_name": "Corporate_Tax_Return_Form_1120_FY2025.pdf",
            "doc_type": "TAX_FORM",
            "status": "COMPLETED",
            "page_count": 6,
            "vendor_name": "Internal Revenue Service (IRS)",
            "invoice_number": "TAX-1120-2025-FED",
            "issue_date": "2026-04-15",
            "due_date": "2026-09-15",
            "subtotal": 24800.00,
            "tax_amount": 24800.00,
            "total_amount": 24800.00,
            "confidence_score": 0.98,
            "line_items": [
                {"description": "Federal Corporate Income Tax Liability (Form 1120)", "quantity": 1, "unit_price": 24800.00, "total": 24800.00}
            ],
            "bank_info": {"routing": "051000033", "account": "EFTPS-IRS"},
            "content": """DEPARTMENT OF THE TREASURY - INTERNAL REVENUE SERVICE
FORM 1120 - U.S. CORPORATION INCOME TAX RETURN
Tax Year: 2025
EIN: 84-2910481

Gross Receipts or Sales: $1,420,500.00
Total Deductions & Operating Expenses: $1,280,000.00
Taxable Income: $140,500.00
Total Tax (Corporate 21%): $29,505.00
Estimated Quarterly Payments Credited: -$4,705.00
Balance Tax Due: $24,800.00 USD
""",
            "summary": "Form 1120 U.S. Corporate Income Tax Return filing reflecting taxable net income of $140,500 and remaining federal tax balance of $24,800.00.",
            "insights": [
                "Gross annual revenue verified at $1,420,500.00.",
                "Corporate tax rate calculated accurately at 21%.",
                "Quarterly prepayments reduced total tax liability by $4,705.00."
            ]
        },
        # Document with Anomaly: Duplicate Invoice
        {
            "file_name": "AWS_Cloud_Services_Duplicate_Bill_Aug.pdf",
            "doc_type": "INVOICE",
            "status": "COMPLETED",
            "page_count": 2,
            "vendor_name": "Amazon Web Services (AWS)",
            "invoice_number": "INV-AWS-8829104",  # Duplicate invoice number!
            "issue_date": "2026-08-05",
            "due_date": "2026-08-31",
            "subtotal": 17083.33,
            "tax_amount": 1366.67,
            "total_amount": 18450.00,
            "confidence_score": 0.96,
            "line_items": [
                {"description": "Amazon EC2 & S3 Cloud Hosting Services", "quantity": 1, "unit_price": 17083.33, "total": 17083.33}
            ],
            "bank_info": {"iban": "US89AWSB7728190029", "routing": "021000021"},
            "content": """AMAZON WEB SERVICES
Duplicate Copy Submission
Invoice Number: INV-AWS-8829104
Total: $18,450.00
""",
            "summary": "Duplicate invoice submission flagged by FinDoc AI Anomaly Detection Engine.",
            "insights": ["Flagged for duplicate invoice identifier match."],
            "anomaly": {
                "type": "DUPLICATE_INVOICE",
                "severity": "HIGH",
                "title": "Duplicate Invoice #INV-AWS-8829104 Detected",
                "description": "An identical invoice #INV-AWS-8829104 for $18,450.00 from Amazon Web Services (AWS) was already registered.",
                "suggested_action": "Do NOT issue duplicate payment. Verify transaction history in AP ledger."
            }
        },
        # Document with Anomaly: Spending Spike
        {
            "file_name": "Stripe_Merchant_Processing_Spike_Fee.pdf",
            "doc_type": "INVOICE",
            "status": "COMPLETED",
            "page_count": 1,
            "vendor_name": "Stripe, Inc.",
            "invoice_number": "STRIPE-INV-99014",
            "issue_date": "2026-08-28",
            "due_date": "2026-09-10",
            "subtotal": 29000.00,
            "tax_amount": 0.00,
            "total_amount": 29000.00,
            "confidence_score": 0.97,
            "line_items": [
                {"description": "International Cross-Border Processing Surcharge", "quantity": 1, "unit_price": 29000.00, "total": 29000.00}
            ],
            "bank_info": {"routing": "121000035"},
            "content": """STRIPE, INC.
MERCHANT PROCESSING STATEMENT
Invoice: STRIPE-INV-99014
Total Amount: $29,000.00 USD
Unusual volume spike in foreign exchange transactions.
""",
            "summary": "High-amount merchant fee invoice from Stripe totaling $29,000.00 representing an outlier from historical averages.",
            "insights": ["Spike detected in foreign merchant interchange fees."],
            "anomaly": {
                "type": "UNUSUAL_AMOUNT",
                "severity": "HIGH",
                "title": "Unusual Spending Spike for Stripe, Inc.",
                "description": "Invoice total of $29,000.00 is 5.3x higher than historical monthly average ($5,400.00).",
                "suggested_action": "Escalate to Finance VP to review high-volume foreign currency charges."
            }
        },
        # Document with Anomaly: Tax Mismatch
        {
            "file_name": "Apex_Hardware_Supplies_Tax_Discrepancy.pdf",
            "doc_type": "INVOICE",
            "status": "COMPLETED",
            "page_count": 1,
            "vendor_name": "Apex Hardware & Servers",
            "invoice_number": "APEX-INV-4410",
            "issue_date": "2026-08-10",
            "due_date": "2026-08-25",
            "subtotal": 8000.00,
            "tax_amount": 400.00,
            "total_amount": 9500.00,  # 8000 + 400 = 8400 != 9500!
            "confidence_score": 0.91,
            "line_items": [
                {"description": "10GbE Switch and Fiber Patch Cables", "quantity": 4, "unit_price": 2000.00, "total": 8000.00}
            ],
            "bank_info": {"routing": "021000089"},
            "content": """APEX HARDWARE SUPPLIES
INVOICE #APEX-INV-4410
Subtotal: $8,000.00
Sales Tax (5%): $400.00
Total Billed: $9,500.00
""",
            "summary": "Hardware supply invoice showing arithmetic discrepancy between itemized subtotal, tax, and stated total.",
            "insights": ["Discrepancy of $1,100.00 identified in total calculation."],
            "anomaly": {
                "type": "TAX_MISMATCH",
                "severity": "MEDIUM",
                "title": "Tax Calculation Discrepancy",
                "description": "Calculated Subtotal ($8,000.00) + Tax ($400.00) equals $8,400.00, but stated Total is $9,500.00 (Discrepancy: $1,100.00).",
                "suggested_action": "Request revised invoice credit memo from Apex Hardware before authorizing payment."
            }
        }
    ]

    for item in sample_documents:
        # Create virtual file
        content_bytes = item["content"].encode('utf-8')
        doc, _ = Document.objects.get_or_create(
            file_name=item["file_name"],
            organization=org,
            defaults={
                "user": admin_user,
                "file_size": len(content_bytes),
                "mime_type": "application/pdf",
                "status": item["status"],
                "doc_type": item["doc_type"],
                "page_count": item["page_count"],
                "ocr_text": item["content"],
            }
        )
        if not doc.file:
            doc.file.save(item["file_name"], ContentFile(content_bytes), save=True)

        # Extracted Data
        ext_data, _ = ExtractedData.objects.update_or_create(
            document=doc,
            defaults={
                "vendor_name": item["vendor_name"],
                "invoice_number": item["invoice_number"],
                "issue_date": item["issue_date"],
                "due_date": item["due_date"],
                "currency": "USD",
                "subtotal": Decimal(str(item["subtotal"])),
                "tax_amount": Decimal(str(item["tax_amount"])),
                "total_amount": Decimal(str(item["total_amount"])),
                "confidence_score": item["confidence_score"],
                "line_items": item["line_items"],
                "bank_info": item["bank_info"],
                "raw_json": {"status": "PARSED_AI_ENGINE_V1"}
            }
        )

        # AI Summary
        AISummary.objects.update_or_create(
            document=doc,
            defaults={
                "executive_summary": item["summary"],
                "key_insights": item["insights"],
                "risk_assessment": "High Risk: Action Required" if "anomaly" in item else "Low Risk / Fully Verified",
                "financial_ratios": {"tax_pct": 8.0, "compliance": "GAAP Verified"}
            }
        )

        # Anomaly if any
        if "anomaly" in item:
            AnomalyAlert.objects.update_or_create(
                organization=org,
                document=doc,
                title=item["anomaly"]["title"],
                defaults={
                    "anomaly_type": item["anomaly"]["type"],
                    "severity": item["anomaly"]["severity"],
                    "description": item["anomaly"]["description"],
                    "suggested_action": item["anomaly"]["suggested_action"],
                    "status": "OPEN"
                }
            )

        # Chunks for RAG
        DocumentChunk.objects.filter(document=doc).delete()
        emb = generate_embedding(item["content"])
        DocumentChunk.objects.create(
            document=doc,
            page_number=1,
            chunk_index=0,
            content=item["content"][:1500],
            embedding=emb
        )

        # Audit log
        AuditLog.objects.get_or_create(
            organization=org,
            action="UPLOAD_DOCUMENT",
            document_name=item["file_name"],
            defaults={
                "user": admin_user,
                "details": f"Processed {item['doc_type']} from {item['vendor_name']} (${item['total_amount']:,.2f})"
            }
        )

    # 5. Create Sample Chat Messages
    ChatMessage.objects.get_or_create(
        organization=org,
        role="user",
        content="What is our total AWS spend and what are the main cost drivers?",
        defaults={"user": admin_user}
    )
    ChatMessage.objects.get_or_create(
        organization=org,
        role="assistant",
        content="Based on **AWS_Cloud_Infrastructure_Invoice_August2026.pdf** [1], your total AWS spend for August 2026 is **$18,450.00 USD**.\n\n### Main Cost Breakdown:\n1. **Amazon EC2 Compute Instances**: $8,100.00 (18 instances)\n2. **Amazon Aurora Multi-AZ PostgreSQL Cluster**: $5,000.00\n3. **Amazon S3 Standard Storage & Egress**: $3,983.33\n\nPayment is due on **August 31, 2026** via direct wire to JPMorgan Chase [1].",
        defaults={
            "user": admin_user,
            "citations": [
                {
                    "citation_id": "[1]",
                    "document_name": "AWS_Cloud_Infrastructure_Invoice_August2026.pdf",
                    "page_number": 1,
                    "vendor_name": "Amazon Web Services (AWS)",
                    "snippet": "AMAZON WEB SERVICES, INC. INVOICE SUMMARY Invoice Number: INV-AWS-8829104 Total: $18,450.00 USD"
                }
            ]
        }
    )

    print("[SUCCESS] Seeding complete! 8+ Financial Documents, Anomalies, RAG Chunks, Audit Trails, and Analytics ready!")

if __name__ == '__main__':
    run_seed()

