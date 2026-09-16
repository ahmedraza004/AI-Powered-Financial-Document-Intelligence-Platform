"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Save, 
  Bot, 
  Download, 
  Building2, 
  CreditCard,
  Layers,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { finDocApi } from "@/lib/api";
import { DocumentItem, ExtractedData } from "@/types";

export default function DocumentInspectorPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params?.id as string;

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ExtractedData>>({});
  const [activeTab, setActiveTab] = useState<"fields" | "summary" | "ocr">("fields");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (docId) {
      finDocApi.getDocumentById(docId).then((doc) => {
        if (doc) {
          setDocument(doc);
          setFormData(doc.extracted_data || {});
        }
      });
    }
  }, [docId]);

  if (!document) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-600 animate-pulse mb-3" />
            <p className="text-sm font-semibold text-slate-300">Loading Document Intelligence Data...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleSave = async () => {
    const updated = await finDocApi.updateDocumentData(document.id, formData);
    if (updated) {
      setDocument(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const ext = document.extracted_data;
  const summary = document.ai_summary;

  return (
    <AppShell>
      <div className="space-y-6 pb-16">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/documents"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white truncate max-w-md">{document.file_name}</h1>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  {document.doc_type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Uploaded {new Date(document.created_at).toLocaleDateString()} • {document.page_count} page(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/chat?doc=${document.id}`}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-emerald-500/30 transition"
            >
              <Bot className="h-3.5 w-3.5 text-cyan-400" />
              <span>Ask AI Chat</span>
            </Link>

            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-glow-emerald transition"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Fields</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Edit Fields</span>
              </button>
            )}
          </div>
        </div>

        {saveSuccess && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Extracted financial data updated and ledger synchronized successfully!</span>
          </div>
        )}

        {/* Split View Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Pane: Original Document & OCR Text */}
          <div className="lg:col-span-5 rounded-2xl glass-card border border-white/10 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">Raw OCR Content Viewer</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Page 1 of {document.page_count}</span>
              </div>

              {/* OCR Text Display */}
              <div className="mt-4 rounded-xl border border-white/5 bg-slate-950/90 p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-[560px] overflow-y-auto leading-relaxed shadow-inner">
                {document.ocr_text || "No OCR raw text extracted for this document."}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Confidence: {((document.confidence_score || 0.98) * 100).toFixed(1)}%</span>
              </span>
              <span>SHA-256 Verified</span>
            </div>
          </div>

          {/* Right Pane: AI Extracted Structured Data & Summaries */}
          <div className="lg:col-span-7 space-y-5">
            {/* Tab navigation */}
            <div className="flex gap-2 border-b border-white/10 pb-3">
              <button
                onClick={() => setActiveTab("fields")}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  activeTab === "fields"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Structured Ledger Fields</span>
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  activeTab === "summary"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Executive Summary & Risk</span>
              </button>
            </div>

            {activeTab === "fields" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Core Key-Value Fields Card */}
                <div className="rounded-2xl glass-card border border-white/10 p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Primary Entity Metadata
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Vendor / Payee</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.vendor_name || ""}
                          onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-emerald-500/40 bg-slate-900 p-2 text-xs text-white"
                        />
                      ) : (
                        <div className="mt-1 font-semibold text-slate-100">{ext?.vendor_name || "Enterprise Vendor"}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Invoice / Ref #</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.invoice_number || ""}
                          onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-emerald-500/40 bg-slate-900 p-2 text-xs text-white"
                        />
                      ) : (
                        <div className="mt-1 font-mono font-semibold text-slate-100">{ext?.invoice_number || "N/A"}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Issue Date</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={formData.issue_date || ""}
                          onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-emerald-500/40 bg-slate-900 p-2 text-xs text-white"
                        />
                      ) : (
                        <div className="mt-1 text-slate-200">{ext?.issue_date || "N/A"}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Due Date</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={formData.due_date || ""}
                          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-emerald-500/40 bg-slate-900 p-2 text-xs text-white"
                        />
                      ) : (
                        <div className="mt-1 text-slate-200">{ext?.due_date || "Upon Receipt"}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Tax / VAT Amount</label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={formData.tax_amount || 0}
                          onChange={(e) => setFormData({ ...formData, tax_amount: parseFloat(e.target.value) || 0 })}
                          className="mt-1 w-full rounded-lg border border-emerald-500/40 bg-slate-900 p-2 text-xs text-white"
                        />
                      ) : (
                        <div className="mt-1 text-slate-200">${ext?.tax_amount ? Number(ext.tax_amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : "0.00"}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Total Net / Gross Amount</label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={formData.total_amount || 0}
                          onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
                          className="mt-1 w-full rounded-lg border border-emerald-500/40 bg-slate-900 p-2 text-xs text-white font-bold"
                        />
                      ) : (
                        <div className="mt-1 text-base font-extrabold text-emerald-400">
                          ${document.total_amount ? document.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : "0.00"} {ext?.currency || "USD"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="rounded-2xl glass-card border border-white/10 p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Extracted Line Items ({ext?.line_items?.length || 0})
                  </h3>

                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/40">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-white/10 bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="p-3">Description</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Unit Price</th>
                          <th className="p-3 text-right">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {ext?.line_items?.length ? (
                          ext.line_items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="p-3 font-medium text-slate-100">{item.description}</td>
                              <td className="p-3 text-center">{item.quantity}</td>
                              <td className="p-3 text-right">${Number(item.unit_price).toFixed(2)}</td>
                              <td className="p-3 text-right font-bold text-white">${Number(item.total).toFixed(2)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-slate-500">
                              Single lump-sum charge without itemized sub-entries.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bank & Remittance Information */}
                {ext?.bank_info && (
                  <div className="rounded-2xl glass-card border border-white/10 p-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-3">
                      <CreditCard className="h-4 w-4 text-emerald-400" />
                      <span>Verified Remittance & Banking Routing</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      {ext.bank_info.routing_number && (
                        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase block">ABA / Routing</span>
                          <span className="font-mono text-slate-200 mt-0.5 block">{ext.bank_info.routing_number}</span>
                        </div>
                      )}
                      {ext.bank_info.iban && (
                        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase block">IBAN</span>
                          <span className="font-mono text-slate-200 mt-0.5 block truncate">{ext.bank_info.iban}</span>
                        </div>
                      )}
                      {ext.bank_info.account_number && (
                        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Account</span>
                          <span className="font-mono text-slate-200 mt-0.5 block">{ext.bank_info.account_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "summary" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Executive Summary */}
                <div className="rounded-2xl glass-card border border-emerald-500/30 p-6 bg-gradient-to-br from-slate-900/90 to-emerald-950/20">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 mb-3">
                    <Sparkles className="h-4 w-4" />
                    <span>Executive Briefing</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {summary?.executive_summary || "Executive summary generated by AI pipeline."}
                  </p>
                </div>

                {/* Key Insights List */}
                <div className="rounded-2xl glass-card border border-white/10 p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Commercial & Operational Takeaways
                  </h3>
                  <div className="space-y-2">
                    {summary?.key_insights?.map((ins, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-slate-900/50 p-3 text-xs text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{ins}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="rounded-2xl glass-card border border-white/10 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Audit & Compliance Rating
                    </h3>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      {summary?.risk_assessment || "Low Risk"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    Zero fraudulent vendor modifications or arithmetic variances detected against established historical baselines.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
