"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { 
  Bot, 
  Send, 
  Sparkles, 
  FileText, 
  ExternalLink, 
  Trash2, 
  ChevronRight, 
  Building2, 
  Loader2,
  Info
} from "lucide-react";
import Link from "next/link";
import { finDocApi } from "@/lib/api";
import { ChatMessage, DocumentItem, Citation } from "@/types";

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialDocId = searchParams.get("doc") || "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finDocApi.getChatHistory().then(setMessages);
    finDocApi.getDocuments().then(setDocuments);

    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    setInputQuery("");
    setIsLoading(true);

    try {
      const responseMsg = await finDocApi.sendChatMessage(query, selectedDocId || undefined);
      const updatedHistory = await finDocApi.getChatHistory();
      setMessages(updatedHistory);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    await finDocApi.clearChat();
    setMessages([]);
  };

  const SUGGESTIONS = [
    "What is our total AWS cloud infrastructure spend?",
    "Summarize key findings from the Deloitte Financial Audit Report",
    "What is our liquid cash balance and monthly runway?",
    "Show any pending duplicate or anomalous invoice alerts",
    "List all vendor invoices due in the next 30 days"
  ];

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto">
        {/* Top Header & Document Context Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Bot className="h-4 w-4" />
              </div>
              <h1 className="text-lg font-bold text-white">Financial Document RAG Assistant</h1>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                GPT-4o Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ask financial queries with exact document citations and ledger references
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Target Document Selector */}
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-400 focus:outline-none"
            >
              <option value="">All Uploaded Documents ({documents.length})</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.file_name} ({d.doc_type})
                </option>
              ))}
            </select>

            <button
              onClick={handleClearChat}
              className="rounded-xl border border-white/10 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
              title="Clear Chat History"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 text-emerald-400 mb-4 border border-emerald-500/20 shadow-glow-emerald">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="text-base font-bold text-white">Ask Anything About Your Financial Ledger</h2>
              <p className="text-xs text-slate-400 max-w-md mt-1 mb-6">
                FinDoc AI searches across all ingested invoices, tax records, and banking statements to return verified answers with direct citations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl w-full">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s)}
                    className="rounded-xl border border-white/5 bg-slate-900/60 p-3 text-left text-xs text-slate-300 transition hover:border-emerald-500/40 hover:bg-slate-800 hover:text-white"
                  >
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-bold shrink-0 shadow">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}

                  <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? "bg-emerald-600 text-white font-medium rounded-tr-sm shadow-md"
                      : "glass-card border border-white/10 text-slate-200 rounded-tl-sm shadow-lg space-y-3"
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Citations Box if Assistant Message */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Cited Financial Sources ({msg.citations.length})
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.citations.map((c, i) => (
                            <div
                              key={i}
                              onClick={() => setActiveCitation(c)}
                              className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/60 p-2.5 text-[11px] text-slate-300 hover:border-emerald-500/40 hover:bg-slate-900 cursor-pointer transition"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400">
                                  {c.citation_id}
                                </span>
                                <span className="font-semibold text-slate-200 truncate">{c.document_name}</span>
                                <span className="text-slate-500">Page {c.page_number}</span>
                              </div>
                              <ExternalLink className="h-3.5 w-3.5 text-slate-500 shrink-0 ml-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="glass-card border border-white/10 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-300 flex items-center gap-2">
                <span>Retrieving chunks & generating grounded financial response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="shrink-0 pt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative"
          >
            <input
              type="text"
              placeholder="Ask a question about your invoices, statements, or spending..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/90 py-3.5 pl-4 pr-14 text-xs text-slate-100 placeholder-slate-500 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50 shadow-glow-emerald"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Citation Preview Modal */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg rounded-2xl glass-dropdown border border-white/10 p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-100">{activeCitation.document_name}</span>
                <span className="text-[10px] text-slate-400">Page {activeCitation.page_number}</span>
              </div>
              <button
                onClick={() => setActiveCitation(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-slate-950 p-4 font-mono text-xs text-slate-300 leading-relaxed">
              &quot;{activeCitation.snippet}&quot;
            </div>

            <div className="mt-5 flex justify-end">
              {activeCitation.document_id && (
                <Link
                  href={`/documents/${activeCitation.document_id}`}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
                >
                  <span>Open Full Document</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center text-xs text-slate-400">
          Loading AI Financial Assistant...
        </div>
      </AppShell>
    }>
      <ChatContent />
    </Suspense>
  );
}
