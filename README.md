# 🏦 FinDoc AI — Enterprise Financial Document Intelligence SaaS Platform

[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015%20%2F%20React%2019-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Django 5](https://img.shields.io/badge/Backend-Django%205%20%2F%20DRF-092E20?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![OpenAI GPT-4o](https://img.shields.io/badge/AI-OpenAI%20GPT--4o%20%2B%20RAG-412991?style=for-the-badge&logo=openai)](https://openai.com/)
[![Celery](https://img.shields.io/badge/Async-Celery%20%2B%20Redis-37814A?style=for-the-badge&logo=celery)](https://docs.celeryq.dev/)
[![pgvector](https://img.shields.io/badge/Vector%20Search-PostgreSQL%20%2B%20pgvector-336791?style=for-the-badge&logo=postgresql)](https://github.com/pgvector/pgvector)
[![Stripe](https://img.shields.io/badge/SaaS%20Billing-Stripe%20Subscriptions-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com/)
[![Vercel Ready](https://img.shields.io/badge/Deployment-Vercel%20%2B%20Docker-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![CI Status](https://img.shields.io/badge/Tests-11%20Passed%20%2F%20100%25-10b981?style=for-the-badge&logo=pytest)](https://docs.pytest.org/)

---

## 🌟 Executive Summary

**FinDoc AI** is an autonomous, multi-tenant **Financial Document Intelligence SaaS Platform** built for CFOs, enterprise audit teams, and financial analysts. It transforms raw, unstructured financial documents (**Invoices, Bank Statements, 1099/W-2 Tax Forms, Financial Reports, Independent Audit Reports, Balance Sheets, Purchase Orders, Receipts, and Contracts**) into structured ledger data with AI entity extraction, real-time fraud & anomaly detection, semantic search, and citation-backed conversational RAG assistants.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([Enterprise Client / Browser]) -->|HTTPS / Next.js 15 UI| Frontend[Next.js 15 App Router<br/>React 19 + Tailwind + Recharts + Lucide]
    Frontend -->|REST API / JWT| Backend[Django 5 REST Framework API Gateway]
    Backend -->|Background Tasks| Celery[Celery Async Task Worker]
    Celery -->|Broker & Cache| Redis[(Redis 7)]
    Backend -->|Data & Vector Storage| Postgres[(PostgreSQL 16 + pgvector)]
    Backend -->|Cloud Storage| Storage[(AWS S3 / Cloudflare R2 / Local Media)]
    
    subgraph AI Processing & Ingestion Pipeline
        Celery --> OCR[Multi-Format OCR Parser: PDF, Images, Excel, Word]
        OCR --> Classifier[Multi-Class Document Classifier]
        Classifier --> Extractor[AI Entity Extractor: GPT-4o + Pydantic Schema]
        Extractor --> Anomaly[Fraud & Anomaly Engine: Duplicates, Spikes, Tax Math]
        Anomaly --> Embedder[Vector Embeddings & Chunker: text-embedding-3-small]
        Embedder --> Summary[AI Executive Summarizer & Risk Rating]
    end

    Backend -->|SaaS Billing & Quotas| Stripe[Stripe Billing Gateway]
    Backend -->|RAG Question Query| RAG[Hybrid Semantic & Keyword Retrieval Engine]
    RAG -->|Cited Context [1][2]| GPT[GPT-4o Synthesizer]
    GPT -->|Structured Answer + Page Citations| Frontend
```

---

## 💎 Portfolio Killer Features

| Capability | Technical Implementation | Value to Enterprise |
|---|---|---|
| 🤖 **Citation-Backed RAG Chat** | Hybrid pgvector + Keyword Retriever + GPT-4o | Query multi-year financial ledgers and receive answers with exact clickable source page citations. |
| 🛡️ **Automated Fraud & Anomaly Defense** | Deterministic heuristics & statistical variance engines | Catches duplicate invoices, tax calculation math errors, and sudden price surges before disbursement. |
| ⚡ **Multi-Modal Document Parsing** | `pypdf`, `pdfplumber`, `pytesseract`, `openpyxl`, `pandas`, `python-docx` | Seamlessly ingests complex PDF vectors, image scans, financial spreadsheets, and contracts. |
| 📑 **Multi-Class Auto Classification** | Heuristics + Cosine similarity + Zero-shot classification | Automatically categorizes files into Invoices, Receipts, Tax Forms, Bank Statements, POs, and Audit Reports. |
| 🏢 **Multi-Tenant SaaS & Stripe Billing** | Stripe Subscriptions, Webhooks, AI credit quotas & storage meters | 4 pricing tiers (Free, Pro, Business, Enterprise) with instant credit tracking and usage meters. |
| 🔐 **Enterprise 4-Tier RBAC & Audit Trail** | SimpleJWT + Custom permissions + Immutable audit loggers | Role permissions (Admin, Manager, Employee, Viewer/Auditor) with full GAAP/SOC2 activity tracking. |
| 📊 **Deep Financial Spend Telemetry** | Recharts dynamic responsive data visualization | Real-time burn rates, cashflow runway forecasts, category donuts, and vendor concentration tables. |
| 📥 **Multi-Format Ledger Exports** | Instant streaming serializers for CSV, JSON, Excel, and PDF | Export verified accounting ledgers in one click for ERP integration (NetSuite, QuickBooks, SAP). |

---

## 🛠️ Complete Tech Stack

### **Frontend**
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + Custom Luxury Fintech Dark-Mode Design System (`#070b14`)
- **Data Visualization**: Recharts (Monthly spend curves, volume bars, donut categories)
- **Icons & UI Primitives**: Lucide React + Glassmorphism Backdrop Blurs
- **Dual-Mode Architecture**: Connected to live Django backend + instant interactive client-side demo fallback for zero-config Vercel preview!

### **Backend**
- **Framework**: Django 5.0+ & Django REST Framework (DRF)
- **Authentication**: SimpleJWT (Access tokens & Refresh token rotation)
- **Task Queue**: Celery + Redis Task Broker (with synchronous fallback toggle)
- **Database**: PostgreSQL with `pgvector` extension (and SQLite local dev support)
- **AI & NLP**: OpenAI GPT-4o / GPT-5 API + Deterministic Heuristic Fallback Engine
- **OCR Engine**: Tesseract OCR, PyPDF, PDFPlumber, Pillow, OpenPyXL, Pandas, python-docx
- **Billing**: Stripe API (Checkout sessions, webhooks, usage metering)

### **DevOps & Infrastructure**
- **Containers**: Docker & Docker Compose (`docker-compose.yml`, `docker-compose.prod.yml`)
- **Web Server & Reverse Proxy**: Nginx + Gunicorn + WhiteNoise
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`) testing Pytest and Next.js builds on push
- **Cloud & Edge**: Vercel ready (`vercel.json`), AWS EC2/ECS, Railway, Render, Linux VPS

---

## 🚀 Quick Start Guide

### Option 1: One-Command Launch with Docker Compose (Recommended)

Run the entire platform (PostgreSQL + pgvector, Redis, Celery Worker, Django REST API, and Next.js Frontend):

```bash
# 1. Clone the repository
git clone https://github.com/ahmedraza004/AI-Powered-Financial-Document-Intelligence-Platform.git
cd AI-Powered-Financial-Document-Intelligence-Platform

# 2. Launch with Docker Compose
docker compose up -d --build
```

Access the applications:
- **Frontend Dashboard**: `http://localhost:3000`
- **Django REST API**: `http://localhost:8000/api/`
- **Django Admin**: `http://localhost:8000/admin/`

---

### Option 2: Local Development Setup

#### 1. Backend (Django 5 + DRF)
```bash
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Seed realistic demo data (Invoices, Bank Statements, Audit Reports, Anomalies)
python scripts/seed_demo_data.py

# Run backend development server
python manage.py runserver
```

#### 2. Frontend (Next.js 15)
```bash
cd frontend

# Install dependencies
npm install

# Run Next.js development server
npm run dev
```

Visit `http://localhost:3000` to interact with the platform.

---

## 🧪 Running Automated Tests

The platform includes an automated `pytest` backend test suite covering authentication, document parsers, Pydantic schemas, anomaly detection rules, and RAG embeddings:

```bash
cd backend
python -m pytest
```

Output:
```
============================= test session starts =============================
platform win32 -- Python 3.14.6, pytest-9.1.1
django: version: 6.1.1, settings: core.settings
collected 11 items

tests/test_anomalies.py ..                                               [ 18%]
tests/test_auth.py ...                                                   [ 45%]
tests/test_ai_extraction.py ....                                         [ 81%]
tests/test_rag_search.py ..                                              [100%]

======================= 11 passed in 14.51s =======================
```

To test the frontend build:
```bash
cd frontend
npm run build
```

---

## 🌐 Deploying to Vercel

The frontend is configured with `frontend/vercel.json` for one-click deployment:

1. Import this repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set `NEXT_PUBLIC_API_URL` to your backend URL (optional — runs with full interactive demo mode if omitted).
4. Click **Deploy**!

---

## 📚 Documentation & Technical References

- **[Architecture & Pipeline Deep Dive](file:///docs/ARCHITECTURE.md)**: Detailed component interactions, data flows, and schema models.
- **[REST API Documentation](file:///docs/API_DOCUMENTATION.md)**: Exhaustive endpoint specifications, authentication headers, request/response examples.
- **[Production Deployment Guide](file:///docs/DEPLOYMENT_GUIDE.md)**: Step-by-step guides for AWS ECS, Linux VPS, Docker Compose, and Vercel.

---

## 🔒 Enterprise Security & Compliance

- **Role-Based Access Control (RBAC)**: Enforced across all endpoints with Admin, Manager, Employee, and Viewer roles.
- **Immutable Audit Logging**: Every upload, view, edit, delete, export, and search is recorded with timestamps and IP addresses.
- **Data Protection**: OWASP compliance, JWT token blacklisting on logout, SQL injection protection, and CSP headers.

---

## 👨‍💻 Author & Contact

- **GitHub**: [@ahmedraza004](https://github.com/ahmedraza004)
- **Project Repository**: [AI-Powered-Financial-Document-Intelligence-Platform](https://github.com/ahmedraza004/AI-Powered-Financial-Document-Intelligence-Platform)
- **License**: MIT License
