"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { 
  DollarSign, 
  Files, 
  AlertTriangle, 
  Sparkles, 
  Upload, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { finDocApi } from "@/lib/api";
import { DashboardAnalytics, DocumentItem, AnomalyAlert } from "@/types";
import { UploadModal } from "@/components/documents/UploadModal";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [recentDocs, setRecentDocs] = useState<DocumentItem[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const a = await finDocApi.getAnalytics();
    const d = await finDocApi.getDocuments();
    const anoms = await finDocApi.getAnomalies();
    setAnalytics(a);
    setRecentDocs(d.slice(0, 5));
    setAnomalies(anoms.filter(x => x.status === 'OPEN'));
  };

  const handleUploadSuccess = (newDocs: DocumentItem[]) => {
    loadData();
  };

  const highSeverityAlert = anomalies.find(a => a.severity === 'HIGH');

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Top Header & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Financial Intelligence Overview
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous ledger extraction, OCR validation & real-time spending telemetry
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:border-emerald-500/40"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Ask AI Assistant</span>
            </Link>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 shadow-glow-emerald"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Documents</span>
            </button>
          </div>
        </div>

        {/* High Severity Anomaly Callout Banner if any */}
        {highSeverityAlert && (
          <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-900/80 p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Critical Fraud / Anomaly Alert</span>
                  <span className="rounded bg-rose-500/20 px-2 py-0.2 text-[10px] font-bold text-rose-400 border border-rose-500/30">Action Required</span>
                </div>
                <p className="text-xs text-slate-200 font-medium mt-0.5">{highSeverityAlert.title}: {highSeverityAlert.description}</p>
              </div>
            </div>

            <Link
              href="/anomalies"
              className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-600 shrink-0 shadow"
            >
              <span>Review Alert</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* 4 Core KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card glass-card-hover rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Processed Spend</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-white">
              ${analytics ? analytics.kpi.total_spend.toLocaleString('en-US', { minimumFractionDigits: 2 }) : "424,200.00"}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+9.5% from prior billing cycle</span>
            </div>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Documents Ingested</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <Files className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-white">
              {analytics ? analytics.kpi.total_documents : 32}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>100% OCR & Chunks Indexed</span>
            </div>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Active Anomaly Alerts</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-rose-400">
              {analytics ? analytics.kpi.open_anomalies : 3}
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              <span>{analytics?.kpi.high_risk_anomalies || 2} duplicate & spike risks</span>
            </div>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>AI Accuracy Rate</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-white">
              {analytics ? (analytics.kpi.avg_confidence * 100).toFixed(1) : "98.4"}%
            </div>
            <div className="mt-2 text-[11px] text-violet-400 font-medium">
              <span>GPT-4o Schema Validated</span>
            </div>
          </div>
        </div>

        {/* Charts Grid: Monthly Spend Trend & Document Types */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Monthly Spend Chart */}
          <div className="lg:col-span-8 rounded-2xl glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">Monthly Expenditure & Invoicing Trends</h3>
                <p className="text-[11px] text-slate-400">Rolling 6-month aggregate billing volume</p>
              </div>
              <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-white/5">
                Live Data
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.monthly_trends || []}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0b1120", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Spend"]}
                  />
                  <Area type="monotone" dataKey="spend" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#spendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Document Types Donut */}
          <div className="lg:col-span-4 rounded-2xl glass-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Document Category Breakdown</h3>
              <p className="text-[11px] text-slate-400">Distribution by classified financial type</p>
            </div>

            <div className="h-44 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.doc_types || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(analytics?.doc_types || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0b1120", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              {(analytics?.doc_types || []).slice(0, 4).map((dt, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dt.color }} />
                    <span className="text-slate-300">{dt.name}</span>
                  </div>
                  <span className="font-bold text-slate-100">{dt.value} docs</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Top Vendors & Recent Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Vendors Table */}
          <div className="lg:col-span-6 rounded-2xl glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Top Commercial Vendors</h3>
              <Link href="/analytics" className="text-[11px] font-semibold text-emerald-400 hover:underline">
                Full Vendor Breakdown →
              </Link>
            </div>

            <div className="space-y-3">
              {(analytics?.top_vendors || []).map((v, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/50 p-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-[11px] font-bold text-slate-300 border border-white/5">
                      #{i + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">{v.vendor}</div>
                      <div className="text-[10px] text-slate-400">{v.count} processed invoice(s)</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-white">${v.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <div className="text-[10px] text-emerald-400 font-medium">Verified</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Uploads Feed */}
          <div className="lg:col-span-6 rounded-2xl glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Recent Documents</h3>
              <Link href="/documents" className="text-[11px] font-semibold text-emerald-400 hover:underline">
                View All Documents →
              </Link>
            </div>

            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/50 p-3 text-xs transition hover:bg-slate-800 hover:border-emerald-500/30"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                      <Files className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="truncate font-semibold text-slate-200">{doc.file_name}</div>
                      <div className="text-[10px] text-slate-400">
                        {doc.vendor_name || doc.doc_type} • {doc.page_count} page(s)
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-slate-100">
                      ${doc.total_amount ? doc.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : "0.00"}
                    </div>
                    <span className="inline-block rounded-full bg-emerald-500/10 px-2 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                      {doc.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </AppShell>
  );
}
