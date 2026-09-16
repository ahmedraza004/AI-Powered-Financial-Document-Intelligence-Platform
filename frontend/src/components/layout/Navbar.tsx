"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bell, 
  Search, 
  Sparkles, 
  Shield, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  Zap
} from "lucide-react";
import { finDocApi } from "@/lib/api";
import { User, Organization, AnomalyAlert } from "@/types";

interface NavbarProps {
  onSearchClick?: () => void;
}

export function Navbar({ onSearchClick }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setUser(finDocApi.getUser());
    setOrg(finDocApi.getOrg());
    finDocApi.getAnomalies().then(setAnomalies);
  }, []);

  const openAnomaliesCount = anomalies.filter(a => a.status === 'OPEN').length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#0b1120]/80 px-6 backdrop-blur-xl">
      {/* Left section: Org Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-slate-900/90 px-3 py-1.5 shadow-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-100">{org?.name || "Acme Global Ventures"}</span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                {org?.plan || "PRO"}
              </span>
            </div>
          </div>
        </div>

        {/* Global Quick Search */}
        <button 
          onClick={onSearchClick}
          className="hidden md:flex items-center gap-2.5 rounded-lg border border-white/5 bg-slate-900/50 px-3.5 py-1.5 text-xs text-slate-400 transition hover:border-white/10 hover:text-slate-200"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span>Ask AI or search financial records...</span>
          <kbd className="ml-4 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">⌘K</kbd>
        </button>
      </div>

      {/* Right section: AI Credits, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* AI Credits Meter */}
        <Link 
          href="/billing"
          className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-300 transition hover:bg-emerald-900/50"
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span>{org ? (org.ai_credits_limit - org.ai_credits_used).toLocaleString() : "858"} AI Credits</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 bg-slate-900/80 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <Bell className="h-4 w-4" />
            {openAnomaliesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg">
                {openAnomaliesCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl glass-dropdown p-4 text-xs shadow-2xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-semibold text-slate-100">Live AI Financial Alerts</span>
                <span className="text-[10px] text-emerald-400 font-medium">{openAnomaliesCount} active</span>
              </div>
              <div className="mt-2.5 space-y-2 max-h-64 overflow-y-auto">
                {anomalies.slice(0, 3).map((a) => (
                  <Link 
                    key={a.id} 
                    href="/anomalies"
                    onClick={() => setShowNotifications(false)}
                    className="block rounded-lg border border-white/5 bg-slate-900/60 p-2.5 transition hover:bg-slate-800/80 hover:border-rose-500/30"
                  >
                    <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-[11px]">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{a.title}</span>
                    </div>
                    <p className="mt-1 text-slate-400 line-clamp-2 text-[10px]">{a.description}</p>
                  </Link>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-white/10 text-center">
                <Link 
                  href="/anomalies" 
                  onClick={() => setShowNotifications(false)}
                  className="text-emerald-400 font-semibold hover:underline text-[11px]"
                >
                  View All Anomalies →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-slate-900/60 px-2.5 py-1.5">
          <div className="h-7 w-7 overflow-hidden rounded-full bg-slate-800 border border-emerald-500/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
              alt={user?.name || "User"} 
              className="h-full w-full object-cover" 
            />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-100">{user?.name || "Alex Mercer"}</div>
            <div className="text-[10px] text-emerald-400">{user?.role || "ADMIN"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
