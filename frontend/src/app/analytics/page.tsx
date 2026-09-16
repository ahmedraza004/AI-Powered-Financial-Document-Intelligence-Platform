"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { 
  LineChart as LineChartIcon, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Building2, 
  Calendar, 
  Sparkles,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line 
} from "recharts";
import { finDocApi } from "@/lib/api";
import { DashboardAnalytics } from "@/types";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);

  useEffect(() => {
    finDocApi.getAnalytics().then(setAnalytics);
  }, []);

  return (
    <AppShell>
      <div className="space-y-8 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Financial Analytics & Spend Telemetry
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Multi-dimensional cost breakdowns, vendor concentration analysis, and cashflow projections
            </p>
          </div>

          <button
            onClick={() => alert("Quarterly Financial Intelligence Summary exported to PDF!")}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-glow-emerald"
          >
            <Download className="h-4 w-4" />
            <span>Generate Executive Report</span>
          </button>
        </div>

        {/* 4 Financial Health KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Burn Rate</span>
            <div className="mt-2 text-2xl font-black text-white">
              ${analytics ? analytics.financial_insights.monthly_burn_rate.toLocaleString('en-US', { minimumFractionDigits: 2 }) : "64,500.00"}
            </div>
            <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{analytics?.financial_insights.burn_rate_variance_pct || "+9.5%"} vs baseline</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estimated YTD Tax Liability</span>
            <div className="mt-2 text-2xl font-black text-white">
              ${analytics ? analytics.financial_insights.tax_liability_ytd.toLocaleString('en-US', { minimumFractionDigits: 2 }) : "28,400.00"}
            </div>
            <div className="mt-2 text-[11px] text-cyan-400 font-medium">
              <span>8.0% Effective Sales & VAT Rate</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Capital Runway Forecast</span>
            <div className="mt-2 text-2xl font-black text-emerald-400">8.2 Months</div>
            <div className="mt-2 text-[11px] text-slate-400">
              <span>Based on $340.5k JPMorgan Chase Cash</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Parser Confidence</span>
            <div className="mt-2 text-2xl font-black text-white">
              {analytics?.financial_insights.auto_extraction_accuracy || "98.2%"}
            </div>
            <div className="mt-2 text-[11px] text-violet-400 font-medium">
              <span>Zero Human Entry Overhead</span>
            </div>
          </div>
        </div>

        {/* Big Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bar Chart: Spend & Invoices by Month */}
          <div className="lg:col-span-7 rounded-2xl glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">Monthly Expenditure & Invoices Processed</h3>
                <p className="text-[11px] text-slate-400">Rolling volume and ledger aggregate spend</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.monthly_trends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0b1120", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Spend"]}
                  />
                  <Bar dataKey="spend" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart: Invoice Volume */}
          <div className="lg:col-span-5 rounded-2xl glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">Document Ingestion Velocity</h3>
                <p className="text-[11px] text-slate-400">Total monthly financial documents parsed</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.monthly_trends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0b1120", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Line type="monotone" dataKey="invoices" stroke="#06b6d4" strokeWidth={3} dot={{ fill: "#06b6d4" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Vendor Concentration Table */}
        <div className="rounded-2xl glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Vendor Spend Concentration Matrix</h3>
            <span className="text-[11px] text-slate-400">Total Ledger Impact</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Vendor / Supplier</th>
                  <th className="p-3 text-center">Invoice Count</th>
                  <th className="p-3 text-right">Aggregate Spend</th>
                  <th className="p-3 text-right">% of Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {(analytics?.top_vendors || []).map((v, i) => {
                  const totalAll = analytics?.kpi.total_spend || 100000;
                  const pct = ((v.total / totalAll) * 100).toFixed(1);
                  return (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-slate-400">#{i + 1}</td>
                      <td className="p-3 font-semibold text-slate-100">{v.vendor}</td>
                      <td className="p-3 text-center">{v.count}</td>
                      <td className="p-3 text-right font-extrabold text-white">${v.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
