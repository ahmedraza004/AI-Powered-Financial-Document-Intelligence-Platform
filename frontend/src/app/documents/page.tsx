"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { 
  Files, 
  Search, 
  Upload, 
  Download, 
  Filter, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Bot, 
  ChevronRight,
  RefreshCw,
  Eye
} from "lucide-react";
import Link from "next/link";
import { finDocApi } from "@/lib/api";
import { DocumentItem, DocumentType } from "@/types";
import { UploadModal } from "@/components/documents/UploadModal";

export default function DocumentHubPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const docs = await finDocApi.getDocuments();
    setDocuments(docs);
  };

  useEffect(() => {
    let result = documents;
    if (activeCategory !== "ALL") {
      result = result.filter(d => d.doc_type === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(d => 
        d.file_name.toLowerCase().includes(q) ||
        (d.vendor_name && d.vendor_name.toLowerCase().includes(q)) ||
        (d.extracted_data?.invoice_number && d.extracted_data.invoice_number.toLowerCase().includes(q))
      );
    }
    setFilteredDocs(result);
  }, [documents, search, activeCategory]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredDocs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDocs.map(d => d.id));
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this document?")) {
      await finDocApi.deleteDocument(id);
      loadDocuments();
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    setIsExporting(true);
    setTimeout(() => {
      const dataToExport = filteredDocs.map(d => ({
        id: d.id,
        file_name: d.file_name,
        doc_type: d.doc_type,
        vendor: d.vendor_name || 'N/A',
        invoice_number: d.extracted_data?.invoice_number || 'N/A',
        issue_date: d.extracted_data?.issue_date || 'N/A',
        due_date: d.extracted_data?.due_date || 'N/A',
        subtotal: d.extracted_data?.subtotal || 0,
        tax: d.extracted_data?.tax_amount || 0,
        total_amount: d.total_amount || 0,
        confidence_score: d.confidence_score || 0.95
      }));

      let fileContent = "";
      let mimeType = "";
      let fileName = `financial_ledger_export_${Date.now()}`;

      if (format === 'json') {
        fileContent = JSON.stringify(dataToExport, null, 2);
        mimeType = "application/json";
        fileName += ".json";
      } else {
        const headers = ["File Name", "Document Type", "Vendor", "Invoice #", "Issue Date", "Due Date", "Subtotal", "Tax", "Total Amount", "Confidence"];
        const rows = dataToExport.map(d => [
          `"${d.file_name}"`,
          d.doc_type,
          `"${d.vendor}"`,
          `"${d.invoice_number}"`,
          d.issue_date,
          d.due_date,
          d.subtotal,
          d.tax,
          d.total_amount,
          `${(d.confidence_score * 100).toFixed(1)}%`
        ]);
        fileContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        mimeType = "text/csv";
        fileName += ".csv";
      }

      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 500);
  };

  const CATEGORIES = [
    { label: "All Documents", value: "ALL" },
    { label: "Invoices", value: "INVOICE" },
    { label: "Bank Statements", value: "BANK_STATEMENT" },
    { label: "Tax Forms", value: "TAX_FORM" },
    { label: "Contracts & POs", value: "CONTRACT" },
    { label: "Audit Reports", value: "AUDIT_REPORT" },
  ];

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Header and Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Document Intelligence Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Search, filter, inspect and export your organization&apos;s financial documents
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl border border-white/10 bg-slate-900/80 p-1">
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                disabled={isExporting}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                <Download className="h-3.5 w-3.5 text-cyan-400" />
                <span>JSON</span>
              </button>
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 shadow-glow-emerald"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Documents</span>
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/5 bg-slate-900/60 p-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeCategory === cat.value
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendor, file, invoice #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-hidden rounded-2xl glass-card border border-white/10 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredDocs.length}
                      onChange={handleSelectAll}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="p-4">Document File</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Vendor / Payee</th>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4 text-right">Total Amount</th>
                  <th className="p-4 text-center">Confidence</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-400">
                      <FileText className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                      <p className="text-sm font-semibold">No documents found</p>
                      <p className="text-xs text-slate-500 mt-1">Try changing your filters or upload new financial documents.</p>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const isSelected = selectedIds.includes(doc.id);
                    return (
                      <tr 
                        key={doc.id}
                        className={`transition hover:bg-slate-800/40 ${isSelected ? "bg-emerald-950/20" : ""}`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(doc.id)}
                            className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="p-4">
                          <Link 
                            href={`/documents/${doc.id}`}
                            className="flex items-center gap-3 font-semibold text-slate-100 hover:text-emerald-400 group"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="truncate max-w-[200px] sm:max-w-xs">
                              <span className="truncate block group-hover:underline">{doc.file_name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {doc.page_count} page(s) • {(doc.file_size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          </Link>
                        </td>
                        <td className="p-4">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300 border border-white/5">
                            {doc.doc_type}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-200">
                          {doc.vendor_name || "Enterprise Vendor"}
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-400">
                          {doc.extracted_data?.invoice_number || "N/A"}
                        </td>
                        <td className="p-4 text-right font-extrabold text-white text-sm">
                          ${doc.total_amount ? doc.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : "0.00"}
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                            <Sparkles className="h-3 w-3" />
                            <span>{((doc.confidence_score || 0.98) * 100).toFixed(1)}%</span>
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/documents/${doc.id}`}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition"
                              title="Inspect Extracted Data"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/chat?doc=${doc.id}`}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition"
                              title="Ask AI about this document"
                            >
                              <Bot className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={(e) => handleDelete(doc.id, e)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
                              title="Delete Document"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => loadDocuments()}
      />
    </AppShell>
  );
}
