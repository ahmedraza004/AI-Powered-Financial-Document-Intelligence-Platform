"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { 
  Users2, 
  UserPlus, 
  ShieldCheck, 
  Check, 
  X, 
  Trash2, 
  Building2, 
  Mail, 
  Sparkles 
} from "lucide-react";
import { finDocApi } from "@/lib/api";
import { User, Role } from "@/types";

export default function TeamPage() {
  const [members, setMembers] = useState<User[]>([
    {
      id: "usr-01",
      email: "admin@findoc.ai",
      name: "Alex Mercer",
      role: "ADMIN",
      title: "Chief Financial Officer (CFO)",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-15T09:00:00Z"
    },
    {
      id: "usr-02",
      email: "sarah.chen@findoc.ai",
      name: "Sarah Chen",
      role: "MANAGER",
      title: "VP of Financial Operations",
      avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-02-10T10:30:00Z"
    },
    {
      id: "usr-03",
      email: "marcus.vance@findoc.ai",
      name: "Marcus Vance",
      role: "EMPLOYEE",
      title: "Senior Financial Data Analyst",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-03-01T14:15:00Z"
    },
    {
      id: "usr-04",
      email: "elena.rostova@deloitte-audit.com",
      name: "Elena Rostova",
      role: "VIEWER",
      title: "External Financial Auditor",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-04-18T16:00:00Z"
    }
  ]);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("EMPLOYEE");
  const [inviteTitle, setInviteTitle] = useState("Financial Analyst");

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    const newMember: User = {
      id: `usr-${Date.now()}`,
      email: inviteEmail,
      name: inviteName,
      role: inviteRole,
      title: inviteTitle,
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      created_at: new Date().toISOString()
    };

    setMembers([...members, newMember]);
    setInviteEmail("");
    setInviteName("");
    setIsInviteOpen(false);
  };

  const handleRoleChange = (userId: string, newRole: Role) => {
    setMembers(members.map(m => m.id === userId ? { ...m, role: newRole } : m));
  };

  const handleRemoveMember = (userId: string) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      setMembers(members.filter(m => m.id !== userId));
    }
  };

  const PERMISSION_MATRIX = [
    { permission: "Upload Financial Documents (PDF/Scans/Excel)", admin: true, manager: true, employee: true, viewer: false },
    { permission: "Edit Extracted Metadata & Line Items", admin: true, manager: true, employee: false, viewer: false },
    { permission: "Ask AI Assistant with RAG Search", admin: true, manager: true, employee: true, viewer: true },
    { permission: "Resolve Fraud & Anomaly Alerts", admin: true, manager: true, employee: false, viewer: false },
    { permission: "Export Financial Ledgers (CSV/JSON/PDF)", admin: true, manager: true, employee: true, viewer: true },
    { permission: "Manage Team Members & Assign Roles", admin: true, manager: false, employee: false, viewer: false },
    { permission: "Billing & Stripe Subscription Upgrades", admin: true, manager: false, employee: false, viewer: false },
  ];

  return (
    <AppShell>
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Users2 className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Team & Role-Based Access Control (RBAC)
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Manage organization members, granular permissions, and auditor access privileges
            </p>
          </div>

          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-glow-emerald"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Team Member</span>
          </button>
        </div>

        {/* Team Members List */}
        <div className="rounded-2xl glass-card border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Active Members ({members.length})</h3>
            <span className="text-[11px] text-emerald-400 font-semibold">Acme Global Ventures</span>
          </div>

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-900/50 p-4 text-xs hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-800 border border-emerald-500/30 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{member.name}</span>
                      <span className="rounded bg-emerald-500/10 px-2 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        {member.role}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">{member.title} • {member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                    disabled={member.id === "usr-01"}
                    className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-400 focus:outline-none disabled:opacity-50"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="VIEWER">VIEWER (AUDITOR)</option>
                  </select>

                  {member.id !== "usr-01" && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
                      title="Remove Member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Granular Permission Matrix Table */}
        <div className="rounded-2xl glass-card border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Role Permission Matrix</h3>
              <p className="text-[11px] text-slate-400">Security & compliance enforcement table</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="p-3">Platform Capability</th>
                  <th className="p-3 text-center">Admin</th>
                  <th className="p-3 text-center">Manager</th>
                  <th className="p-3 text-center">Employee</th>
                  <th className="p-3 text-center">Viewer (Auditor)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {PERMISSION_MATRIX.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="p-3 font-medium text-slate-200">{p.permission}</td>
                    <td className="p-3 text-center">
                      {p.admin ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <X className="h-4 w-4 text-slate-600 mx-auto" />}
                    </td>
                    <td className="p-3 text-center">
                      {p.manager ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <X className="h-4 w-4 text-slate-600 mx-auto" />}
                    </td>
                    <td className="p-3 text-center">
                      {p.employee ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <X className="h-4 w-4 text-slate-600 mx-auto" />}
                    </td>
                    <td className="p-3 text-center">
                      {p.viewer ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <X className="h-4 w-4 text-slate-600 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-2xl glass-dropdown border border-white/10 p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Invite Team Member</h3>
              </div>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Work Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Treasury Auditor"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Role & Access Level</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 p-2.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value="MANAGER">Financial Manager (Full edit & resolve)</option>
                  <option value="EMPLOYEE">Staff Analyst (Upload & view)</option>
                  <option value="VIEWER">Auditor / Viewer (Read-only ledger)</option>
                  <option value="ADMIN">Organization Admin</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-glow-emerald"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
