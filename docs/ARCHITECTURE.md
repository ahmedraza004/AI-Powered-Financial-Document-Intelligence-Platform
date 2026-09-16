# FinDoc AI - System Architecture & Technical Specifications

FinDoc AI is an enterprise-grade Financial Document Intelligence SaaS platform designed to process, classify, extract, validate, and query complex financial records (Invoices, Receipts, Bank Statements, 1099/W-2 Tax Forms, Master Service Agreements, Purchase Orders, and Balance Sheets).

---

## 1. High-Level Architecture

```mermaid
graph TD
    Client[Next.js 15 App Router<br/>React 19 + Tailwind + Recharts] -->|HTTPS / JWT Auth| API[Django 5 DRF API Gateway]
    API -->|Async Tasks| Celery[Celery Task Workers]
    Celery -->|Broker & Results| Redis[(Redis 7)]
    API -->|Relational & Vector Data| Postgres[(PostgreSQL 16 + pgvector)]
    API -->|File Storage| Storage[(AWS S3 / Cloudflare R2 / Local Media)]
    API -->|Billing & Credits| Stripe[Stripe SaaS Subscriptions]

    subgraph AI Pipeline Execution
        Celery --> OCR[Multi-Format Parser: PDF, Images, XLSX, DOCX]
        OCR --> Classifier[Multi-Class Financial Classifier]
        Classifier --> Extractor[AI Entity Extractor: GPT-4o + Pydantic Schema]
        Extractor --> Anomaly[Fraud & Anomaly Engine: Duplicates, Spikes, Tax Math]
        Anomaly --> Embedder[Semantic Vector Embedder & Chunker]
        Embedder --> Summary[AI Executive Summarizer & Risk Rating]
    end

    Client -->|RAG Question| RAG[RAG Retrieval & Hybrid Vector Search]
    RAG -->|Cited Context [1][2]| GPT[GPT-4o Synthesizer]
    GPT -->|Structured Answer + Citations| Client
```

---

## 2. Component Breakdown

### Frontend Layer (`frontend/`)
- **Next.js 15 & React 19**: Modern Server and Client App Router components with zero-layout-shift hydration.
- **Tailwind CSS & Glassmorphism Design System**: Custom luxury fintech slate/navy theme tokens (`#070b14`), radiant emerald accents (`#10b981`), glowing badges, and responsive navigation.
- **Recharts**: High-performance charting engine rendering monthly expenditure curves, invoice volume bars, and category distributions.
- **Dual-Mode Client Architecture**: Seamlessly interacts with the live Django REST backend when running, and gracefully supports client-side demo mode with rich simulated extractions for instant Vercel preview deployments.

### Backend API Layer (`backend/`)
- **Django 5 & Django REST Framework**: Scalable, secure API with SimpleJWT authentication, rate limiting, and CORS headers.
- **Enterprise 4-Tier RBAC**:
  - `ADMIN`: Full organization, subscription, team management, and document CRUD.
  - `MANAGER`: Document upload, metadata validation, and anomaly resolution.
  - `EMPLOYEE`: Document upload and RAG search queries.
  - `VIEWER (Auditor)`: Read-only ledger inspection, verification, and compliance exports.
- **Compliance Audit Trail**: Immutable logging capturing actor, action, timestamp, IP address, and target documents.

### AI & OCR Pipeline (`backend/apps/processing/` & `backend/apps/ai_engine/`)
1. **Multi-Format Ingestion**:
   - PDF: `pypdf` and `pdfplumber` for text extraction and page chunking.
   - Images: `pytesseract` and `Pillow` OCR engine.
   - Spreadsheets: `pandas` and `openpyxl` table matrix extraction.
   - Word: `python-docx` structured section parser.
2. **Auto-Classification**:
   - 8 Supported Classes: `INVOICE`, `RECEIPT`, `TAX_FORM`, `CONTRACT`, `PURCHASE_ORDER`, `BANK_STATEMENT`, `BALANCE_SHEET`, `AUDIT_REPORT`.
3. **Structured Entity Extraction**:
   - Pydantic Schema: Vendor, Invoice Number, Issue Date, Due Date, Currency, Subtotal, Tax Amount, Total Amount, Line Items, Bank Info (IBAN/Routing).
   - High-Precision Heuristic NLP fallback for zero-API-key offline testability.
4. **Real-time Fraud & Anomaly Detection**:
   - Rule 1: Duplicate invoice number and vendor match in organization history.
   - Rule 2: Outlier price spikes exceeding 2.5x vendor historical averages.
   - Rule 3: Tax arithmetic formula discrepancy check (`|Total - (Subtotal + Tax)| > $1.00`).
   - Rule 4: Overdue payment penalty detection.

### Search & RAG System (`backend/apps/search_rag/`)
- **Document Chunking**: Splits documents into ~500 character overlapping chunks.
- **Vector Embeddings**: 1536-dimensional OpenAI embeddings or deterministic fallback vectors.
- **Hybrid Retrieval**: Combines cosine similarity with keyword search.
- **Citation Attribution**: Every fact returned by the assistant includes a clickable link citing `[Document Name, Page #, Snippet]`.

---

## 3. Database Schema Overview

```
Organization
├── id: UUID
├── name: String
├── plan: FREE | PRO | BUSINESS | ENTERPRISE
├── ai_credits_limit: Int
└── ai_credits_used: Int

User
├── id: UUID
├── email: String (Unique)
├── name: String
├── role: ADMIN | MANAGER | EMPLOYEE | VIEWER
└── organization: FK(Organization)

Document
├── id: UUID
├── organization: FK(Organization)
├── user: FK(User)
├── file_name: String
├── doc_type: Enum
├── status: PENDING | PROCESSING | COMPLETED | FAILED
├── ocr_text: Text
└── ExtractedData (1-to-1)
    ├── vendor_name: String
    ├── invoice_number: String
    ├── issue_date: Date
    ├── due_date: Date
    ├── subtotal: Decimal
    ├── tax_amount: Decimal
    ├── total_amount: Decimal
    ├── confidence_score: Float
    └── line_items: JSON

AnomalyAlert
├── id: UUID
├── organization: FK(Organization)
├── document: FK(Document)
├── anomaly_type: DUPLICATE_INVOICE | UNUSUAL_AMOUNT | TAX_MISMATCH | LATE_PAYMENT_RISK
├── severity: HIGH | MEDIUM | LOW
└── status: OPEN | RESOLVED | DISMISSED

AuditLog
├── id: UUID
├── organization: FK(Organization)
├── user: FK(User)
├── action: String
├── document_name: String
├── details: Text
├── ip_address: IP
└── timestamp: DateTime
```
