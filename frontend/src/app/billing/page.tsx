"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  HardDrive, 
  Download, 
  ArrowRight, 
  Zap,
  ShieldCheck 
} from "lucide-react";
import { finDocApi } from "@/lib/api";
import { Organization, SubscriptionPlan } from "@/types";

export default function BillingPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);

  useEffect(() => {
    setOrg(finDocApi.getOrg());
    finDocApi.getPlans().then(setPlans);
  }, []);

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(true);
    setTimeout(async () => {
      const updatedOrg = await finDocApi.upgradePlan(planId);
      setOrg({ ...updatedOrg });
      setIsUpgrading(false);
      setUpgradeSuccess(`Successfully updated subscription to ${planId} tier!`);
      setTimeout(() => setUpgradeSuccess(null), 4000);
    }, 600);
  };

  const aiPct = org ? Math.round((org.ai_credits_used / org.ai_credits_limit) * 100) : 14;
  const storagePct = org ? Math.round((org.storage_used_mb / org.storage_limit_mb) * 100) : 3;

  return (
    <AppShell>
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <CreditCard className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Billing & Subscription Management
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Manage multi-tenant SaaS tiers, AI credit quotas, and Stripe billing invoices
            </p>
          </div>
        </div>

        {upgradeSuccess && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{upgradeSuccess}</span>
          </div>
        )}

        {/* Current Plan & Resource Meter Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Current Tier Overview */}
          <div className="lg:col-span-4 rounded-2xl glass-card border border-white/10 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                <span>Active Subscription</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  Renews Monthly
                </span>
              </div>
              <div className="text-2xl font-black text-white">{org?.plan || "PRO"} Tier</div>
              <p className="text-xs text-slate-400 mt-1">Acme Global Capital & Ventures</p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">Next Billing Date</span>
              <span className="font-semibold text-slate-200">October 1, 2026</span>
            </div>
          </div>

          {/* AI Credits Consumption Gauge */}
          <div className="lg:col-span-4 rounded-2xl glass-card border border-white/10 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Extraction Credits</span>
                </span>
                <span className="text-slate-300 font-bold">{aiPct}% Used</span>
              </div>
              <div className="text-2xl font-black text-white">
                {org ? (org.ai_credits_limit - org.ai_credits_used).toLocaleString() : "858"}{" "}
                <span className="text-xs font-normal text-slate-400">
                  / {org?.ai_credits_limit.toLocaleString() || "1,000"} Credits Remaining
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
                  style={{ width: `${aiPct}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Document Storage Meter */}
          <div className="lg:col-span-4 rounded-2xl glass-card border border-white/10 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <HardDrive className="h-3.5 w-3.5" />
                  <span>Cloud Document Storage</span>
                </span>
                <span className="text-slate-300 font-bold">{storagePct}% Used</span>
              </div>
              <div className="text-2xl font-black text-white">
                {org?.storage_used_mb || 348.5} MB{" "}
                <span className="text-xs font-normal text-slate-400">
                  / {(org ? org.storage_limit_mb / 1024 : 10).toFixed(0)} GB Quota
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-500" 
                  style={{ width: `${Math.max(storagePct, 4)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Tiers Matrix */}
        <div className="rounded-2xl glass-card border border-white/10 p-6 shadow-xl">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white">Available Subscription Plans</h3>
            <p className="text-xs text-slate-400">Instant plan upgrades with prorated billing</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((p) => {
              const isCurrent = org?.plan === p.id;
              return (
                <div
                  key={p.id}
                  className={`rounded-xl p-5 flex flex-col justify-between transition ${
                    isCurrent
                      ? "border-2 border-emerald-500/60 bg-emerald-950/20 shadow-glow-emerald"
                      : "border border-white/10 bg-slate-900/60 hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{p.name}</h4>
                      {isCurrent && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">${p.price_monthly}</span>
                      <span className="text-[10px] text-slate-400">/ mo</span>
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-emerald-400">
                      {p.ai_credits.toLocaleString()} Extractions / mo
                    </div>

                    <div className="my-4 border-t border-white/5" />

                    <ul className="space-y-2 text-[11px] text-slate-300">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => handleUpgrade(p.id)}
                      disabled={isCurrent || isUpgrading}
                      className={`w-full rounded-xl py-2 text-xs font-bold transition ${
                        isCurrent
                          ? "bg-slate-800 text-slate-400 cursor-default"
                          : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-glow-emerald"
                      }`}
                    >
                      {isCurrent ? "Active Plan" : `Upgrade to ${p.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoices History Table */}
        <div className="rounded-2xl glass-card border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Stripe Billing Invoices</h3>
            <span className="text-[11px] text-slate-400">Automated PDF Receipts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="p-3">Invoice Ref</th>
                  <th className="p-3">Billing Period</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {[
                  { ref: "in_1P98fX2eZvKYlo2C", period: "August 2026 - Professional Tier", amount: "$79.00 USD", status: "PAID", date: "Aug 1, 2026" },
                  { ref: "in_1P77aQ9eZvKYlo1A", period: "July 2026 - Professional Tier", amount: "$79.00 USD", status: "PAID", date: "Jul 1, 2026" },
                  { ref: "in_1P55kM2eZvKYlo9Z", period: "June 2026 - Professional Tier", amount: "$79.00 USD", status: "PAID", date: "Jun 1, 2026" },
                ].map((inv, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-slate-400">{inv.ref}</td>
                    <td className="p-3 font-medium text-slate-200">{inv.period}</td>
                    <td className="p-3 font-extrabold text-white">{inv.amount}</td>
                    <td className="p-3 text-center">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => alert(`Downloaded receipt ${inv.ref}`)}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold hover:underline"
                      >
                        <Download className="h-3 w-3" />
                        <span>PDF</span>
                      </button>
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
