from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class LineItemSchema(BaseModel):
    description: str = Field(description="Description of line item / product / service")
    quantity: float = Field(default=1.0, description="Quantity of item")
    unit_price: float = Field(default=0.0, description="Unit price of item")
    total: float = Field(default=0.0, description="Total amount for item")

class FinancialExtractionSchema(BaseModel):
    doc_type: str = Field(default="INVOICE", description="Classified type: INVOICE, RECEIPT, TAX_FORM, CONTRACT, PURCHASE_ORDER, BANK_STATEMENT, BALANCE_SHEET, AUDIT_REPORT")
    vendor_name: str = Field(default="", description="Name of company or vendor billing")
    invoice_number: str = Field(default="", description="Invoice or reference number")
    issue_date: Optional[str] = Field(default=None, description="Issue date in YYYY-MM-DD format")
    due_date: Optional[str] = Field(default=None, description="Due date in YYYY-MM-DD format")
    currency: str = Field(default="USD", description="Currency symbol or 3-letter code (USD, EUR, GBP, etc.)")
    subtotal: Optional[float] = Field(default=None, description="Subtotal amount before tax")
    tax_amount: Optional[float] = Field(default=None, description="Tax / VAT amount")
    total_amount: Optional[float] = Field(default=None, description="Total net or gross amount")
    confidence_score: float = Field(default=0.95, description="Confidence score from 0.0 to 1.0")
    line_items: List[LineItemSchema] = Field(default_factory=list, description="Extracted line items")
    bank_info: Dict[str, Any] = Field(default_factory=dict, description="IBAN, routing, swift, or account numbers")

class AISummarySchema(BaseModel):
    executive_summary: str = Field(description="2-3 sentence executive financial briefing")
    key_insights: List[str] = Field(default_factory=list, description="List of bullet points on key commercial & financial terms")
    risk_assessment: str = Field(default="Low Risk", description="Risk assessment: Low Risk, Moderate Risk, or High Risk with explanation")
    financial_ratios: Dict[str, Any] = Field(default_factory=dict, description="Financial ratios, metrics, or payment terms extracted")
