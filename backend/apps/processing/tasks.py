import logging
try:
    from celery import shared_task
except ImportError:
    def shared_task(*args, **kwargs):
        def decorator(fn):
            return fn
        if len(args) == 1 and callable(args[0]):
            return args[0]
        return decorator
from apps.documents.models import Document, ExtractedData, AISummary
from apps.processing.parsers.pdf_parser import parse_pdf
from apps.processing.parsers.image_parser import parse_image
from apps.processing.parsers.tabular_parser import parse_tabular_or_docx
from apps.ai_engine.classifier import classify_document
from apps.ai_engine.extractor import extract_financial_data
from apps.ai_engine.summarizer import generate_ai_summary
from apps.anomalies.detector import detect_anomalies_for_document
from apps.search_rag.rag_service import chunk_and_index_document

logger = logging.getLogger(__name__)

@shared_task(bind=True, name="process_document_pipeline")
def process_document_pipeline(self_or_task, document_id=None):
    """
    Asynchronous Celery pipeline that processes uploaded financial documents.
    Can also be invoked directly as a synchronous function.
    """
    doc_id = document_id if document_id else self_or_task
    try:
        doc = Document.objects.get(id=doc_id)
        doc.status = 'PROCESSING'
        doc.save(update_fields=['status'])

        file_path = doc.file.path
        mime = doc.mime_type.lower()
        file_name = doc.file_name.lower()

        # Step 1: Parse Document Text & Pages
        if 'pdf' in mime or file_name.endswith('.pdf'):
            parsed = parse_pdf(file_path)
        elif any(ext in mime for ext in ['image', 'jpeg', 'png', 'tiff']) or file_name.endswith(('.jpg', '.jpeg', '.png')):
            parsed = parse_image(file_path)
        else:
            parsed = parse_tabular_or_docx(file_path, mime, file_name)

        if not parsed.get('success', False) and not parsed.get('full_text'):
            doc.status = 'FAILED'
            doc.processing_error = parsed.get('error', 'Failed to extract text from document')
            doc.save(update_fields=['status', 'processing_error'])
            return False

        doc.ocr_text = parsed.get('full_text', '')
        doc.page_count = parsed.get('page_count', 1)

        # Step 2: Auto-Classification
        if doc.doc_type == 'UNKNOWN':
            doc.doc_type = classify_document(doc.ocr_text, doc.file_name)

        doc.save(update_fields=['ocr_text', 'page_count', 'doc_type'])

        # Step 3: AI Structured Entity Extraction
        extracted = extract_financial_data(doc.ocr_text, doc.doc_type, doc.file_name)
        ExtractedData.objects.update_or_create(
            document=doc,
            defaults={
                "vendor_name": extracted.get("vendor_name", "Vendor"),
                "invoice_number": extracted.get("invoice_number", ""),
                "issue_date": extracted.get("issue_date"),
                "due_date": extracted.get("due_date"),
                "currency": extracted.get("currency", "USD"),
                "subtotal": extracted.get("subtotal"),
                "tax_amount": extracted.get("tax_amount"),
                "total_amount": extracted.get("total_amount"),
                "confidence_score": extracted.get("confidence_score", 0.95),
                "line_items": extracted.get("line_items", []),
                "bank_info": extracted.get("bank_info", {}),
                "raw_json": extracted.get("raw_json", {}),
            }
        )

        # Step 4: Anomaly & Fraud Detection Engine
        detect_anomalies_for_document(doc, extracted)

        # Step 5: AI Executive Summary Generation
        summary_dict = generate_ai_summary(doc.ocr_text, doc.doc_type, extracted)
        AISummary.objects.update_or_create(
            document=doc,
            defaults={
                "executive_summary": summary_dict.get("executive_summary", ""),
                "key_insights": summary_dict.get("key_insights", []),
                "risk_assessment": summary_dict.get("risk_assessment", "Low Risk"),
                "financial_ratios": summary_dict.get("financial_ratios", {}),
            }
        )

        # Step 6: Chunking & Vector Indexing for RAG Search
        chunk_and_index_document(doc, parsed.get('pages', []), doc.ocr_text)

        # Step 7: Complete pipeline
        doc.status = 'COMPLETED'
        doc.save(update_fields=['status'])
        logger.info(f"Successfully processed document: {doc.file_name} (ID: {doc.id})")
        return True

    except Exception as exc:
        logger.error(f"Pipeline error for doc {doc_id}: {str(exc)}", exc_info=True)
        try:
            doc = Document.objects.get(id=doc_id)
            doc.status = 'FAILED'
            doc.processing_error = str(exc)
            doc.save(update_fields=['status', 'processing_error'])
        except Exception:
            pass
        return False
