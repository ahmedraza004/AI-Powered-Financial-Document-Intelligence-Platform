import re
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

DOC_TYPE_KEYWORDS = {
    'BALANCE_SHEET': [
        'balance sheet', 'total assets', 'current assets', 'liabilities', 
        'shareholders equity', 'stockholders equity', 'retained earnings'
    ],
    'BANK_STATEMENT': [
        'bank statement', 'account balance', 'opening balance', 'closing balance',
        'checking account', 'savings account', 'withdrawals', 'deposits', 'cleared transactions'
    ],
    'TAX_FORM': [
        'form 1040', 'form 1099', 'form w-2', 'form 1120', 'internal revenue service',
        'tax return', 'taxable income', 'social security number', 'employer identification number', 'ein', 'tax year'
    ],
    'AUDIT_REPORT': [
        'independent auditor', 'audit report', 'auditor\'s opinion', 'unqualified opinion',
        'financial statements audited', 'basis for opinion', 'management\'s responsibility'
    ],
    'PURCHASE_ORDER': [
        'purchase order', 'po number', 'p.o. #', 'vendor id', 'ship to', 'requisition', 'order date'
    ],
    'CONTRACT': [
        'agreement', 'terms and conditions', 'party of the first part', 'confidentiality',
        'effective date', 'indemnification', 'governing law', 'service agreement'
    ],
    'RECEIPT': [
        'receipt', 'sales receipt', 'cash receipt', 'amount tendered', 'change due', 'payment received'
    ],
    'INVOICE': [
        'invoice', 'invoice #', 'bill to', 'amount due', 'remit to', 'due date', 'subtotal'
    ]
}

def classify_document(text: str, file_name: str = "") -> str:
    """
    Classifies a document into one of the supported financial types using LLM or rule-based heuristics.
    """
    if not text:
        return 'UNKNOWN'

    clean_text = text.lower()
    clean_name = file_name.lower()

    # Heuristic scoring
    scores = {doc_type: 0 for doc_type in DOC_TYPE_KEYWORDS}

    # Match filename clues
    for doc_type, keywords in DOC_TYPE_KEYWORDS.items():
        if doc_type.lower().replace('_', ' ') in clean_name or doc_type.lower().replace('_', '') in clean_name:
            scores[doc_type] += 5
        for kw in keywords:
            if kw in clean_name:
                scores[doc_type] += 3

    # Match content keywords
    for doc_type, keywords in DOC_TYPE_KEYWORDS.items():
        for kw in keywords:
            matches = len(re.findall(r'\b' + re.escape(kw) + r'\b', clean_text))
            scores[doc_type] += matches * 2

    # Find highest score
    best_match = max(scores, key=scores.get)
    if scores[best_match] > 0:
        return best_match

    # If OpenAI API Key is available, use LLM classification
    api_key = getattr(settings, 'OPENAI_API_KEY', None)
    if api_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            prompt = f"""Classify the following financial document snippet into one of these exact categories:
- INVOICE
- RECEIPT
- TAX_FORM
- CONTRACT
- PURCHASE_ORDER
- BANK_STATEMENT
- BALANCE_SHEET
- AUDIT_REPORT
- FINANCIAL_REPORT
- UNKNOWN

Document snippet:
{text[:2000]}

Respond ONLY with the category name string."""
            response = client.chat.completions.create(
                model=getattr(settings, 'OPENAI_MODEL', 'gpt-4o'),
                messages=[{"role": "user", "content": prompt}],
                max_tokens=20,
                temperature=0.0
            )
            classified = response.choices[0].message.content.strip().upper()
            if classified in DOC_TYPE_KEYWORDS:
                return classified
        except Exception as err:
            logger.warning(f"OpenAI classification failed: {err}")

    return 'INVOICE'
