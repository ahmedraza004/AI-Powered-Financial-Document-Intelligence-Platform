"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@findoc.ai");
  const [password, setPassword] = useState("password123");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  const fillCredentials = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("password123");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b14] px-4 py-12">
      <div className="radial-glow-top" />
      <div className="relative z-10 w-full max-w-md rounded-2xl glass-card border border-white/10 p-8 shadow-2xl">
        {/* Brand */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 mb-4">
            <Sparkles className="h-6 w-6 text-slate-950" />
          </div>
          <h1 className="text-xl font-black text-white">Sign In to FinDoc AI</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Financial Document Intelligence Platform
          </p>
        </div>

        {/* Quick Demo Logins */}
        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
            1-Click Demo Access
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillCredentials("admin@findoc.ai")}
              className="flex-1 rounded-lg bg-slate-900/80 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300 transition border border-white/5"
            >
              CFO (Admin)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("sarah.chen@findoc.ai")}
              className="flex-1 rounded-lg bg-slate-900/80 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300 transition border border-white/5"
            >
              VP Finance (Manager)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Work Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-glow-emerald"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-emerald-400 hover:underline">
            Create organization
          </Link>
        </div>
      </div>
    </div>
  );
}
