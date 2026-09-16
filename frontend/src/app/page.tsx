"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bot,
  FileSearch,
  AlertTriangle,
  Zap,
  CheckCircle2,
  FileText,
  BarChart3,
  Lock,
  Layers,
  Database,
  Cpu,
  Github,
  ChevronRight,
  DollarSign
} from "lucide-react";
import { INITIAL_PLANS } from "@/lib/mockData";

export default function LandingPage() {
  const [selectedDemo, setSelectedDemo] = useState<"aws" | "chase" | "audit">("aws");

  const DEMO_EXTRACTIONS = {
    aws: {
      title: "AWS Cloud Infrastructure Invoice",
      type: "INVOICE",
      vendor: "Amazon Web Services (AWS)",
      invoiceNumber: "INV-AWS-8829104",
      amount: "$18,450.00 USD",
      tax: "$1,366.67",
      confidence: "99.2%",
      risk: "Low Risk",
      summary: "Verified 18 EC2 compute instances and Aurora Multi-AZ database cluster. Egress dropped 12% vs prior period.",
      lineItems: [
        { name: "Amazon EC2 Elastic Compute", qty: 18, total: "$8,100.00" },
        { name: "Amazon Aurora PostgreSQL Cluster", qty: 4, total: "$5,000.00" },
        { name: "Amazon S3 Standard Storage", qty: 1, total: "$3,983.33" }
      ]
    },
    chase: {
      title: "JPMorgan Commercial Banking Statement",
      type: "BANK_STATEMENT",
      vendor: "JPMorgan Chase Bank, N.A.",
      invoiceNumber: "STMT-CHASE-082026",
      amount: "$340,500.00 USD",
      tax: "$0.00",
      confidence: "99.8%",
      risk: "Healthy Runway",
      summary: "Ending ledger balance of $340,500.00. Monthly net cash burn of $41,600 affords 8.2 months capital runway.",
      lineItems: [
        { name: "Commercial Operating Checking", qty: 1, total: "$285,400.00" },
        { name: "High Yield Treasury Sweep (5.15% APY)", qty: 1, total: "$55,100.00" }
      ]
    },
    audit: {
      title: "Deloitte Quarterly Financial Audit",
      type: "AUDIT_REPORT",
      vendor: "Deloitte & Touche LLP",
      invoiceNumber: "DEL-AUD-2026-Q2",
      amount: "$15,000.00 USD",
      tax: "$0.00",
      confidence: "97.5%",
      risk: "Clean Opinion",
      summary: "Unqualified (clean) certified audit opinion issued under standard U.S. GAAP guidelines. Zero ledger anomalies.",
      lineItems: [
        { name: "Financial Statement Controls Audit", qty: 1, total: "$15,000.00" }
      ]
    }
  };

  const currentDemo = DEMO_EXTRACTIONS[selectedDemo];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#070b14]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">FinDoc</span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-xs font-black text-emerald-400 border border-emerald-500/30">AI</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">Financial Document Intelligence</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="transition hover:text-emerald-400">Features</a>
            <a href="#demo" className="transition hover:text-emerald-400">Live AI Demo</a>
            <a href="#architecture" className="transition hover:text-emerald-400">Architecture</a>
            <a href="#pricing" className="transition hover:text-emerald-400">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 shadow-glow-emerald"
            >
              <span>Launch Platform</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="radial-glow-top" />
        <div className="mx-auto max-w-5xl px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-4 py-1.5 text-xs font-bold text-emerald-300 mb-8 shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
            <span>Next-Gen Financial Document Intelligence SaaS</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">v2.4 Production</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-[1.1]">
            Automate Financial Documents With <span className="text-emerald-400 underline decoration-emerald-500/40 decoration-wavy">Autonomous AI</span>
          </h1>

          <p className="mt-6 text-base text-slate-300 sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Extract structured data from Invoices, Bank Statements, Tax Forms, and Audit Reports in seconds.
            Detect duplicate billing fraud, chat with your ledger via citation-backed RAG, and streamline enterprise compliance.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-8 py-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 shadow-glow-emerald hover:scale-105 duration-150"
            >
              <span>Open SaaS Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#demo"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-7 py-4 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:border-emerald-500/40"
            >
              <span>Explore Interactive Demo</span>
            </a>
          </div>

          {/* Metrics ribbon */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 border-y border-white/10 py-8 bg-slate-900/30 backdrop-blur-md rounded-2xl">
            <div>
              <div className="text-3xl font-extrabold text-white">99.4%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Field Extraction Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-emerald-400">&lt; 1.2s</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Processing Time / Page</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-cyan-400">100%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">GAAP & IFRS Compliant</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-violet-400">0%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Duplicate Payout Risk</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Extraction Playground */}
      <section id="demo" className="py-20 border-t border-white/5 bg-[#0b1120]/50 relative">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 mb-3 border border-emerald-500/20">
              <Zap className="h-3.5 w-3.5" />
              <span>Interactive AI Inspector</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              See How FinDoc AI Deconstructs Any Financial File
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Select a sample document below to inspect extracted entities, arithmetic validations, and executive summaries in real time.
            </p>
          </div>

          {/* Document Switcher Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => setSelectedDemo("aws")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                selectedDemo === "aws"
                  ? "bg-emerald-500 text-slate-950 shadow-glow-emerald"
                  : "border border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>AWS Cloud Invoice ($18.4k)</span>
            </button>
            <button
              onClick={() => setSelectedDemo("chase")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                selectedDemo === "chase"
                  ? "bg-emerald-500 text-slate-950 shadow-glow-emerald"
                  : "border border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              <span>Chase Treasury Statement ($340.5k)</span>
            </button>
            <button
              onClick={() => setSelectedDemo("audit")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                selectedDemo === "audit"
                  ? "bg-emerald-500 text-slate-950 shadow-glow-emerald"
                  : "border border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Deloitte Audit Report</span>
            </button>
          </div>

          {/* Interactive Split Viewer Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-2xl glass-card border border-white/10 p-6 shadow-2xl">
            {/* Left: Document Raw OCR View */}
            <div className="lg:col-span-5 rounded-xl border border-white/5 bg-slate-950/80 p-5 font-mono text-xs text-slate-400 leading-relaxed shadow-inner">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 font-sans">
                <span className="font-bold text-slate-200">{currentDemo.title}</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-emerald-400 font-semibold border border-white/10">
                  OCR Extracted
                </span>
              </div>
              <div className="space-y-3 opacity-90 text-[11px]">
                <p className="text-emerald-400 font-semibold uppercase">{currentDemo.vendor}</p>
                <p>REF NO: {currentDemo.invoiceNumber}</p>
                <p>STATUS: VERIFIED GAAP ACCRUAL</p>
                <div className="my-4 border-t border-dashed border-white/10 pt-3">
                  <p className="font-semibold text-slate-300 mb-2">ITEMIZED CHARGES:</p>
                  {currentDemo.lineItems.map((item, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-white/5">
                      <span className="truncate pr-2">{item.name}</span>
                      <span className="text-slate-200 shrink-0">{item.total}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex justify-between font-bold text-slate-100 text-xs">
                  <span>TOTAL AMOUNT:</span>
                  <span className="text-emerald-400">{currentDemo.amount}</span>
                </div>
              </div>
            </div>

            {/* Right: AI Intelligence Insights & JSON */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Billed</div>
                  <div className="text-base font-extrabold text-white mt-1">{currentDemo.amount}</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400">AI Confidence</div>
                  <div className="text-base font-extrabold text-emerald-400 mt-1">{currentDemo.confidence}</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Risk Assessment</div>
                  <div className="text-base font-extrabold text-cyan-400 mt-1">{currentDemo.risk}</div>
                </div>
              </div>

              {/* AI Executive Summary Box */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Executive Financial Briefing</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{currentDemo.summary}</p>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Indexed for RAG Semantic Chat & Analytics</span>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition"
                >
                  <span>Open Full Inspector</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Feature Pillars */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built for High-Stakes Corporate Finance
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            From raw multi-page OCR scans to board-ready financial summaries and fraud defense.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Bot,
              title: "Citation-Backed RAG Chat",
              desc: "Ask complex questions like 'How much did we spend on marketing in Q2?' and receive answers with clickable page citations."
            },
            {
              icon: AlertTriangle,
              title: "Automated Fraud & Anomaly Engine",
              desc: "Detects duplicate vendor invoices, arithmetic tax mismatches, and sudden spending spikes before funds are disbursed."
            },
            {
              icon: FileSearch,
              title: "Hybrid Semantic & Vector Search",
              desc: "Search across hundreds of thousands of PDF chunks using natural language or structured metadata filters simultaneously."
            },
            {
              icon: ShieldCheck,
              title: "Multi-Class Auto Classification",
              desc: "Automatically classifies PDFs and scans into Invoices, Receipts, Tax Forms (1040/W-2), Bank Statements, and Contracts."
            },
            {
              icon: Lock,
              title: "Enterprise 4-Tier RBAC",
              desc: "Granular roles for Admin, Financial Manager, Staff Analyst, and Auditor/Viewer with complete compliance audit trails."
            },
            {
              icon: BarChart3,
              title: "Deep Spending Analytics",
              desc: "Instant breakdowns by vendor, category, monthly cashflow runway, and automated CSV/Excel/PDF ledger exports."
            }
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass-card glass-card-hover rounded-2xl p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-5 border border-emerald-500/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture Showcase */}
      <section id="architecture" className="py-20 border-t border-white/5 bg-[#0b1120]/40">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400 mb-3 border border-cyan-500/20">
            <Layers className="h-3.5 w-3.5" />
            <span>Modern Production Architecture</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Engineered for Scale, Security & Speed
          </h2>
          <p className="mt-3 text-sm text-slate-400 max-w-2xl mx-auto">
            Combining Next.js 15, Django 5, Celery asynchronous pipelines, pgvector embeddings, and GPT-4o.
          </p>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 text-left">
              <Cpu className="h-6 w-6 text-emerald-400 mb-3" />
              <div className="text-sm font-bold text-white">Next.js 15 + React 19</div>
              <div className="text-xs text-slate-400 mt-1">App Router, Tailwind, Recharts & Vercel Edge Optimized</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 text-left">
              <Database className="h-6 w-6 text-cyan-400 mb-3" />
              <div className="text-sm font-bold text-white">Django 5 + DRF + Celery</div>
              <div className="text-xs text-slate-400 mt-1">PostgreSQL, Redis Task Queue, SimpleJWT & REST APIs</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 text-left">
              <Sparkles className="h-6 w-6 text-violet-400 mb-3" />
              <div className="text-sm font-bold text-white">OpenAI GPT-4o & RAG</div>
              <div className="text-xs text-slate-400 mt-1">Vector Embeddings, Hybrid Retrieval & Structured JSON</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 text-left">
              <Lock className="h-6 w-6 text-rose-400 mb-3" />
              <div className="text-sm font-bold text-white">Stripe & Enterprise RBAC</div>
              <div className="text-xs text-slate-400 mt-1">SaaS Subscriptions, Credit Quotas & Audit Logging</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Transparent, Usage-Based SaaS Tiers
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Start free, then scale seamlessly as your financial document volume expands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 flex flex-col justify-between transition ${
                plan.popular
                  ? "glass-card border-2 border-emerald-500/50 shadow-glow-emerald relative"
                  : "glass-card border border-white/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-black text-slate-950 uppercase tracking-wider shadow">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">${plan.price_monthly}</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <div className="mt-2 text-xs font-semibold text-emerald-400">
                  {plan.ai_credits.toLocaleString()} AI Extractions / mo
                </div>

                <div className="my-6 border-t border-white/10" />

                <ul className="space-y-2.5 text-xs text-slate-300">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/dashboard"
                  className={`w-full flex items-center justify-center rounded-xl py-2.5 text-xs font-bold transition ${
                    plan.popular
                      ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-glow-emerald"
                      : "border border-white/10 bg-slate-900 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050810] py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-300">FinDoc AI Platform © 2026</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-emerald-400 transition">Dashboard</Link>
            <Link href="/documents" className="hover:text-emerald-400 transition">Documents</Link>
            <Link href="/chat" className="hover:text-emerald-400 transition">AI RAG Chat</Link>
            <Link href="/billing" className="hover:text-emerald-400 transition">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
