"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ArrowRight, 
  Sparkles,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { finDocApi } from "@/lib/api";
import { AnomalyAlert, AnomalySeverity } from "@/types";

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "RESOLVED">("ALL");

  useEffect(() => {
    loadAnomalies();
  }, []);

  const loadAnomalies = async () => {
    const list = await finDocApi.getAnomalies();
    setAnomalies(list);
  };

  const handleStatusChange = async (id: string, newStatus: 'RESOLVED' | 'DISMISSED' | 'OPEN') => {
    await finDocApi.updateAnomalyStatus(id, newStatus);
    loadAnomalies();
  };

  const filtered = anomalies.filter(a => {
    if (activeFilter === "ALL") return a.status === 'OPEN';
    if (activeFilter === "HIGH") return a.status === 'OPEN' && a.severity === 'HIGH';
    if (activeFilter === "MEDIUM") return a.status === 'OPEN' && a.severity === 'MEDIUM';
    if (activeFilter === "RESOLVED") return a.status === 'RESOLVED' || a.status === 'DISMISSED';
    return true;
  });

  const highCount = anomalies.filter(a => a.status === 'OPEN' && a.severity === 'HIGH').length;
  const medCount = anomalies.filter(a => a.status === 'OPEN' && a.severity === 'MEDIUM').length;
  const resolvedCount = anomalies.filter(a => a.status === 'RESOLVED').length;

  return (
    <AppShell>
      <div className="space-y-8 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Fraud & Anomaly Defense Center
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated heuristics and AI detection for duplicate invoices, outlier spikes, and tax calculation discrepancies
            </p>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-rose-500/30 bg-gradient-to-br from-slate-900 to-rose-950/20">
            <div className="flex items-center justify-between text-rose-300 text-xs font-bold uppercase tracking-wider">
              <span>High Severity Risks</span>
              <ShieldAlert className="h-4 w-4 text-rose-400" />
            </div>
            <div className="mt-3 text-3xl font-black text-rose-400">{highCount}</div>
            <div className="mt-1 text-[11px] text-slate-400">Immediate duplicate payment or surge risks</div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/20">
            <div className="flex items-center justify-between text-amber-300 text-xs font-bold uppercase tracking-wider">
              <span>Medium Variances</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-3 text-3xl font-black text-amber-400">{medCount}</div>
            <div className="mt-1 text-[11px] text-slate-400">Tax formula calculation discrepancies</div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950/20">
            <div className="flex items-center justify-between text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span>Resolved Issues</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-3 text-3xl font-black text-emerald-400">{resolvedCount}</div>
            <div className="mt-1 text-[11px] text-slate-400">Verified and audited by finance team</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-3">
          {[
            { label: "Active Open Alerts", value: "ALL", count: highCount + medCount },
            { label: "High Severity", value: "HIGH", count: highCount },
            { label: "Medium Variances", value: "MEDIUM", count: medCount },
            { label: "Resolved & Closed", value: "RESOLVED", count: resolvedCount },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeFilter === tab.value
                  ? "bg-slate-800 text-white border border-white/20 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span className="rounded-full bg-slate-900 px-2 py-0.2 text-[10px] text-slate-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Anomaly Alerts List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl glass-card border border-white/10 p-12 text-center text-slate-400">
              <ShieldCheck className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
              <h3 className="text-base font-bold text-white">All Financial Records Clean</h3>
              <p className="text-xs text-slate-400 mt-1">No pending anomalies or billing discrepancies under this filter.</p>
            </div>
          ) : (
            filtered.map((alert) => {
              const isHigh = alert.severity === 'HIGH';
              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl glass-card border p-6 transition shadow-xl ${
                    alert.status === 'RESOLVED'
                      ? "border-emerald-500/20 bg-slate-900/40"
                      : isHigh
                      ? "border-rose-500/40 bg-gradient-to-r from-rose-950/20 via-slate-900/90 to-slate-900/90"
                      : "border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-slate-900/90"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          isHigh
                            ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}>
                          {alert.severity} SEVERITY
                        </span>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                          {alert.anomaly_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-white">{alert.title}</h3>
                      <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">{alert.description}</p>

                      {/* Suggested Action Box */}
                      <div className="mt-3 rounded-xl border border-white/5 bg-slate-950/60 p-3 text-xs text-slate-300 flex items-start gap-2.5">
                        <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-200">Recommended Action: </span>
                          <span>{alert.suggested_action}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right action controls */}
                    <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Flagged Document</div>
                        <div className="text-xs font-bold text-slate-200 truncate max-w-[180px]">{alert.document_name}</div>
                        <div className="text-xs font-bold text-emerald-400">${Number(alert.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {alert.status === 'OPEN' ? (
                          <>
                            <button
                              onClick={() => handleStatusChange(alert.id, 'RESOLVED')}
                              className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleStatusChange(alert.id, 'DISMISSED')}
                              className="rounded-xl border border-white/10 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                            >
                              Dismiss
                            </button>
                          </>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Resolved by {alert.resolved_by_name || "Alex Mercer"}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
