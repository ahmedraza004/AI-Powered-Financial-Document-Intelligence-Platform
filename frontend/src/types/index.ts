export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'VIEWER';
export type PlanTier = 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  title: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: PlanTier;
  ai_credits_limit: number;
  ai_credits_used: number;
  storage_limit_mb: number;
  storage_used_mb: number;
  members_count: number;
}

export type DocumentType = 
  | 'INVOICE' 
  | 'RECEIPT' 
  | 'TAX_FORM' 
  | 'CONTRACT' 
  | 'PURCHASE_ORDER' 
  | 'BANK_STATEMENT' 
  | 'BALANCE_SHEET' 
  | 'AUDIT_REPORT'
  | 'FINANCIAL_REPORT'
  | 'UNKNOWN';

export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface BankInfo {
  iban?: string;
  routing_number?: string;
  account_number?: string;
  swift_bic?: string;
}

export interface ExtractedData {
  id: string;
  vendor_name: string;
  invoice_number: string;
  issue_date: string | null;
  due_date: string | null;
  currency: string;
  subtotal: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  confidence_score: number;
  line_items: LineItem[];
  bank_info: BankInfo;
  raw_json?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AISummary {
  id: string;
  executive_summary: string;
  key_insights: string[];
  risk_assessment: string;
  financial_ratios: Record<string, any>;
  created_at: string;
}

export type AnomalyType = 
  | 'DUPLICATE_INVOICE' 
  | 'UNUSUAL_AMOUNT' 
  | 'TAX_MISMATCH' 
  | 'VENDOR_DISCREPANCY' 
  | 'LATE_PAYMENT_RISK';

export type AnomalySeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type AnomalyStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED';

export interface AnomalyAlert {
  id: string;
  document: string;
  document_name: string;
  vendor_name: string;
  total_amount: number;
  anomaly_type: AnomalyType;
  severity: AnomalySeverity;
  title: string;
  description: string;
  suggested_action: string;
  status: AnomalyStatus;
  resolved_by_name?: string;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  file_name: string;
  file_url?: string;
  file_size: number;
  mime_type: string;
  status: DocumentStatus;
  doc_type: DocumentType;
  page_count: number;
  uploaded_by?: string;
  vendor_name?: string;
  total_amount?: number;
  confidence_score?: number;
  ocr_text?: string;
  extracted_data?: ExtractedData;
  ai_summary?: AISummary;
  anomalies?: AnomalyAlert[];
  created_at: string;
  updated_at: string;
}

export interface Citation {
  citation_id: string;
  document_id?: string;
  document_name: string;
  page_number: number;
  vendor_name?: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  user_name?: string;
  created_at: string;
}

export interface MonthlyTrend {
  month: string;
  spend: number;
  invoices: number;
  receipts: number;
}

export interface DocTypeDist {
  name: string;
  value: number;
  color: string;
}

export interface TopVendor {
  vendor: string;
  total: number;
  count: number;
}

export interface FinancialInsights {
  monthly_burn_rate: number;
  burn_rate_variance_pct: string;
  tax_liability_ytd: number;
  auto_extraction_accuracy: string;
  credits_remaining: number;
  credits_total: number;
  storage_used_mb: number;
  storage_total_mb: number;
}

export interface DashboardAnalytics {
  kpi: {
    total_spend: number;
    total_documents: number;
    completed_documents: number;
    open_anomalies: number;
    high_risk_anomalies: number;
    avg_confidence: number;
  };
  monthly_trends: MonthlyTrend[];
  doc_types: DocTypeDist[];
  top_vendors: TopVendor[];
  financial_insights: FinancialInsights;
}

export interface AuditLogItem {
  id: string;
  user_name: string;
  user_email: string;
  user_role: Role;
  action: string;
  document_name: string;
  details: string;
  ip_address?: string;
  timestamp: string;
}

export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  price_monthly: number;
  ai_credits: number;
  storage_gb: number;
  max_users: number;
  popular?: boolean;
  features: string[];
}
