import pytest
from apps.ai_engine.classifier import classify_document
from apps.ai_engine.extractor import extract_with_heuristic_nlp
from apps.ai_engine.summarizer import generate_ai_summary

class TestAIEngine:
    def test_document_classifier_invoice(self):
        sample_invoice_text = """
        INVOICE
        Invoice #: INV-2026-9901
        Bill To: Acme Global Capital
        Amount Due: $15,400.00
        Due Date: 2026-09-30
        """
        doc_type = classify_document(sample_invoice_text, "Invoice_Sept2026.pdf")
        assert doc_type == "INVOICE"

    def test_document_classifier_balance_sheet(self):
        sample_bs_text = """
        CONSOLIDATED BALANCE SHEET
        Total Current Assets: $4,500,000
        Liabilities & Stockholders Equity: $4,500,000
        Retained Earnings: $1,200,000
        """
        doc_type = classify_document(sample_bs_text, "Q2_Balance_Sheet.pdf")
        assert doc_type == "BALANCE_SHEET"

    def test_document_classifier_bank_statement(self):
        sample_bs_text = """
        COMMERCIAL BANK STATEMENT
        Checking Account Ending in 4019
        Opening Balance: $100,000
        Withdrawals & Deposits
        Closing Balance: $140,000
        """
        doc_type = classify_document(sample_bs_text, "Chase_Bank_Statement.pdf")
        assert doc_type == "BANK_STATEMENT"

    def test_heuristic_extraction(self):
        sample_text = """
        Amazon Web Services (AWS)
        INVOICE #INV-AWS-8829104
        Date: 2026-08-01
        Due Date: 2026-08-31
        Subtotal: $17,083.33
        Tax: $1,366.67
        Total Amount Due: $18,450.00
        """
        res = extract_with_heuristic_nlp(sample_text, "INVOICE", "aws_bill.pdf")
        assert "Amazon Web Services" in res["vendor_name"]
        assert res["invoice_number"] == "INV-AWS-8829104"
        assert res["total_amount"] == 18450.00
        assert res["confidence_score"] > 0.8
