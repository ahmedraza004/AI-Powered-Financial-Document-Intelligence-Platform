"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { 
  ShieldCheck, 
  Search, 
  Download, 
  Filter, 
  Clock, 
  User as UserIcon, 
  Activity,
  Lock
} from "lucide-react";
import { finDocApi } from "@/lib/api";
import { AuditLogItem } from "@/types";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  useEffect(() => {
    finDocApi.getAuditLogs().then(setLogs);
  }, []);

  const filteredLogs = logs.filter(l => {
    if (actionFilter !== "ALL" && l.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.user_name.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.document_name.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportLogs = () => {
    const headers = ["Timestamp", "Actor", "Email", "Role", "Action", "Target", "Details", "IP Address"];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      `"${l.user_name}"`,
      `"${l.user_email}"`,
      l.user_role,
      l.action,
      `"${l.document_name}"`,
      `"${l.details}"`,
      l.ip_address || "192.168.1.1"
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance_audit_trail_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Enterprise Compliance Audit Trail
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Immutable SOC2 & GAAP activity logging capturing all uploads, AI extractions, role updates, and exports
            </p>
          </div>

          <button
            onClick={handleExportLogs}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-glow-emerald"
          >
            <Download className="h-4 w-4" />
            <span>Export Audit Log (CSV)</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/5 bg-slate-900/60 p-1">
            {[
              { label: "All Events", value: "ALL" },
              { label: "Uploads", value: "UPLOAD_DOCUMENT" },
              { label: "AI Processed", value: "DOCUMENT_PROCESSED" },
              { label: "Search Queries", value: "SEARCH_QUERY" },
              { label: "Data Exports", value: "EXPORT_DATA" },
              { label: "Plan Updates", value: "UPDATE_PLAN" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setActionFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  actionFilter === f.value
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search actors, actions, logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-hidden rounded-2xl glass-card border border-white/10 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="p-4">Timestamp (UTC)</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Document / Object</th>
                  <th className="p-4">Details</th>
                  <th className="p-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="font-semibold text-slate-100">{log.user_name}</span>
                        <span className="text-[10px] text-emerald-400 block font-mono">{log.user_role}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-200 border border-white/5">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-200 truncate max-w-xs">
                      {log.document_name || "—"}
                    </td>
                    <td className="p-4 text-slate-300 max-w-md text-xs leading-relaxed">
                      {log.details}
                    </td>
                    <td className="p-4 text-right font-mono text-[11px] text-slate-500">
                      {log.ip_address || "192.168.1.45"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
