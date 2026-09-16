import io
import logging
from pypdf import PdfReader

logger = logging.getLogger(__name__)

def parse_pdf(file_path_or_bytes):
    """
    Extracts text and page information from a PDF file.
    """
    try:
        if isinstance(file_path_or_bytes, bytes):
            reader = PdfReader(io.BytesIO(file_path_or_bytes))
        else:
            reader = PdfReader(file_path_or_bytes)
        
        page_count = len(reader.pages)
        pages_text = []
        full_text = []

        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            pages_text.append({
                "page_number": idx + 1,
                "text": page_text
            })
            full_text.append(f"--- Page {idx + 1} ---\n{page_text}")

        return {
            "success": True,
            "page_count": page_count,
            "full_text": "\n\n".join(full_text),
            "pages": pages_text
        }
    except Exception as e:
        logger.error(f"Error parsing PDF: {str(e)}")
        return {
            "success": False,
            "page_count": 1,
            "full_text": "",
            "pages": [],
            "error": str(e)
        }
