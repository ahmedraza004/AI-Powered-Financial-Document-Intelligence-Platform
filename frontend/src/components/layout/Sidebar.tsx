"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Files,
  Bot,
  AlertTriangle,
  LineChart,
  ShieldCheck,
  Users2,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  Home
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Document Hub", href: "/documents", icon: Files },
  { label: "AI RAG Chat", href: "/chat", icon: Bot, badge: "GPT-4o" },
  { label: "Fraud & Anomalies", href: "/anomalies", icon: AlertTriangle, badge: "3" },
  { label: "Analytics & Spend", href: "/analytics", icon: LineChart },
  { label: "Audit Trail", href: "/audit", icon: ShieldCheck },
  { label: "Team & RBAC", href: "/team", icon: Users2 },
  { label: "Billing & Plans", href: "/billing", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-white/5 bg-[#0b1120] px-4 py-5 md:flex">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
          <Sparkles className="h-5 w-5 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-white">FinDoc</span>
            <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">AI</span>
          </div>
          <span className="text-[10px] text-slate-400 tracking-wide font-medium">Document Intelligence</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="mt-8 flex flex-1 flex-col space-y-1.5">
        <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Platform Suite
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-slate-300 hover:bg-slate-900/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 transition ${isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400"}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  item.badge === "3" 
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" 
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Promo & Landing Page Link */}
      <div className="mt-auto space-y-2 pt-4 border-t border-white/5">
        <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/30 to-slate-900/80 p-3.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold text-emerald-300">Hybrid AI Pipeline</span>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400 leading-relaxed">
            Multi-modal OCR + GPT-4o entity extraction & RAG search enabled.
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition"
        >
          <div className="flex items-center gap-2">
            <Home className="h-3.5 w-3.5" />
            <span>Product Landing</span>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}
