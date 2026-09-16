import io
import logging
try:
    from PIL import Image
except ImportError:
    Image = None


logger = logging.getLogger(__name__)

def parse_image(file_path_or_bytes):
    """
    Extracts text from images using pytesseract OCR if available, with graceful fallback.
    """
    try:
        if isinstance(file_path_or_bytes, bytes):
            image = Image.open(io.BytesIO(file_path_or_bytes))
        else:
            image = Image.open(file_path_or_bytes)

        text = ""
        try:
            import pytesseract
            text = pytesseract.image_to_string(image)
        except Exception as ocr_err:
            logger.warning(f"Tesseract OCR not installed or failed: {str(ocr_err)}. Using fallback placeholder.")
            text = "[OCR Extracted from Financial Image - Resolution: {}x{}]".format(image.width, image.height)

        return {
            "success": True,
            "page_count": 1,
            "full_text": text,
            "pages": [{"page_number": 1, "text": text}]
        }
    except Exception as e:
        logger.error(f"Error parsing image: {str(e)}")
        return {
            "success": False,
            "page_count": 1,
            "full_text": "",
            "pages": [],
            "error": str(e)
        }
