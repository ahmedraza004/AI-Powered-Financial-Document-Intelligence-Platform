"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Search, Files, Bot, AlertTriangle, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    router.push(`/chat?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onSearchClick={() => setSearchOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Global Command Palette / Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl rounded-2xl glass-dropdown border border-white/10 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-emerald-400" />
                <span className="font-bold text-slate-100 text-sm">FinDoc AI Global Search & Assistant</span>
              </div>
              <button 
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 'Show AWS invoices above $5000' or 'What is our ending cash balance?'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-emerald-500/30 bg-slate-900/90 py-3.5 pl-4 pr-12 text-sm text-slate-100 placeholder-slate-500 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-2.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"
                >
                  Ask AI
                </button>
              </div>
            </form>

            <div className="mt-6 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Suggested Financial Inquiries
              </div>
              {[
                { title: "What is our total AWS cloud spend in August 2026?", type: "RAG Query", href: "/chat?q=What+is+our+total+AWS+spend?" },
                { title: "Review Duplicate Invoice Alert #INV-AWS-8829104", type: "Fraud Alert", href: "/anomalies" },
                { title: "Inspect JPMorgan Chase commercial treasury statement", type: "Document", href: "/documents/doc-003" },
                { title: "Export complete corporate financial ledger to CSV/Excel", type: "Export", href: "/documents" },
              ].map((s, idx) => (
                <Link
                  key={idx}
                  href={s.href}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/40 p-3 text-xs text-slate-300 transition hover:border-emerald-500/30 hover:bg-slate-800/80 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      {s.type}
                    </span>
                    <span>{s.title}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
