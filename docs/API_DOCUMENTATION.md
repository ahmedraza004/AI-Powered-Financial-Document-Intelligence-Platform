# FinDoc AI - REST API Documentation

Base URL: `http://localhost:8000/api`

All authenticated endpoints require an `Authorization: Bearer <access_token>` header.

---

## 1. Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register a new organization and admin user | No |
| `POST` | `/api/auth/login/` | Obtain JWT access and refresh token pair | No |
| `POST` | `/api/auth/refresh/` | Refresh expired access token | No |
| `GET` | `/api/auth/me/` | Fetch current user profile and role | Yes |
| `PATCH` | `/api/auth/me/` | Update profile fields | Yes |
| `GET` | `/api/auth/team/` | List all organization members | Yes |
| `POST` | `/api/auth/team/` | Invite a new team member | Yes (Admin/Manager) |
| `PATCH` | `/api/auth/team/<id>/` | Update user RBAC role | Yes (Admin) |
| `DELETE` | `/api/auth/team/<id>/` | Remove team member | Yes (Admin) |

### Sample Login Response:
```json
{
  "user": {
    "id": "usr-admin-001",
    "email": "admin@findoc.ai",
    "name": "Alex Mercer",
    "role": "ADMIN",
    "organization": {
      "id": "org-001",
      "name": "Acme Global Ventures",
      "plan": "PRO",
      "ai_credits_limit": 1000,
      "ai_credits_used": 142
    }
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

---

## 2. Documents & Uploads

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/documents/` | List documents (supports `?doc_type=`, `?status=`, `?search=`) | Yes |
| `POST` | `/api/documents/` | Multi-part upload (triggers OCR & AI extraction) | Yes (Admin/Manager/Employee) |
| `GET` | `/api/documents/<id>/` | Deep document details, extracted JSON & AI summary | Yes |
| `PATCH` | `/api/documents/<id>/` | Update extracted fields or document metadata | Yes (Admin/Manager) |
| `DELETE` | `/api/documents/<id>/` | Permanently delete document & embeddings | Yes (Admin) |
| `GET` | `/api/documents/export/` | Export financial ledger (`?format=csv` or `?format=json`) | Yes |

---

## 3. RAG AI Assistant & Hybrid Search

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/search/` | Hybrid vector & keyword search | Yes |
| `GET` | `/api/search/chat/` | Get organization conversational chat history | Yes |
| `POST` | `/api/search/chat/` | Ask financial question to RAG Assistant | Yes |
| `DELETE` | `/api/search/chat/` | Clear chat history | Yes |

### Sample RAG Request:
```json
{
  "query": "What is our total AWS spend and what are the main cost drivers?",
  "doc_ids": []
}
```

### Sample RAG Response:
```json
{
  "id": "chat-msg-991",
  "query": "What is our total AWS spend and what are the main cost drivers?",
  "answer": "Based on AWS_Cloud_Infrastructure_Invoice_August2026.pdf [1], your total AWS spend is $18,450.00 USD...",
  "citations": [
    {
      "citation_id": "[1]",
      "document_name": "AWS_Cloud_Infrastructure_Invoice_August2026.pdf",
      "page_number": 1,
      "vendor_name": "Amazon Web Services (AWS)",
      "snippet": "AMAZON WEB SERVICES, INC. INVOICE SUMMARY Total: $18,450.00 USD"
    }
  ],
  "created_at": "2026-08-01T12:10:05Z"
}
```

---

## 4. Fraud & Anomaly Defense

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/anomalies/` | List anomaly alerts (`?status=OPEN`, `?severity=HIGH`) | Yes |
| `PATCH` | `/api/anomalies/<id>/` | Update alert status (`RESOLVED`, `DISMISSED`, `OPEN`) | Yes (Admin/Manager) |

---

## 5. Financial Analytics & Spend Telemetry

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/analytics/dashboard/` | Full dashboard KPIs, monthly trends & vendor matrix | Yes |

---

## 6. Audit Trail & Compliance

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/audit/` | Fetch immutable audit logs (`?action=`, `?search=`) | Yes |

---

## 7. SaaS Billing & Subscriptions

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/billing/plans/` | List available subscription tiers and feature matrix | No |
| `GET` | `/api/billing/overview/` | Active plan status, usage meters & invoices | Yes |
| `POST` | `/api/billing/upgrade/` | Switch / upgrade subscription plan | Yes (Admin) |
