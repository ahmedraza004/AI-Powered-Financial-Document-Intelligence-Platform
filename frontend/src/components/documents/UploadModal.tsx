"use client";

import React, { useState, useRef } from "react";
import { 
  Upload, 
  X, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import { finDocApi } from "@/lib/api";
import { DocumentItem } from "@/types";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (docs: DocumentItem[]) => void;
}

export function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUploadSubmit = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setProgress(25);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 250);

    try {
      const uploadedDocs = await finDocApi.uploadDocuments(files);
      setProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setFiles([]);
        onUploadSuccess(uploadedDocs);
        onClose();
      }, 400);
    } catch (err) {
      setIsUploading(false);
      clearInterval(interval);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl rounded-2xl glass-dropdown border border-white/10 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Upload Financial Documents</h3>
              <p className="text-[11px] text-slate-400">Auto-OCR, Entity Extraction, Classification & Anomaly Check</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-emerald-400 bg-emerald-950/20 shadow-glow-emerald"
              : "border-white/15 bg-slate-900/40 hover:border-emerald-500/40 hover:bg-slate-900/70"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.docx,.csv"
            onChange={handleChange}
            className="hidden"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-3 shadow-inner">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-slate-200">
            Click to browse or drop financial documents here
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Supports PDF, Scanned Images (PNG/JPG), Excel, DOCX, CSV (Max 25MB)
          </p>
        </div>

        {/* Selected Files Preview */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Files to Process ({files.length})
            </div>
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-xs text-slate-300"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate font-medium">{file.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                AI Pipeline Processing OCR & Extractions...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={files.length === 0 || isUploading}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50 shadow-glow-emerald"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Process with AI ({files.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
