import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinDoc AI | Financial Document Intelligence SaaS Platform",
  description: "Autonomous AI-powered financial document parsing, multi-class classification, OCR extraction, anomaly fraud detection, and citation-backed RAG search for CFOs and enterprise finance teams.",
  keywords: ["Financial Document Intelligence", "OCR", "Invoice Parsing", "AI Accounting", "RAG Financial Assistant", "Fraud Anomaly Detection"],
  authors: [{ name: "FinDoc Intelligence Global" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        <div className="relative flex min-h-screen flex-col">
          <div className="radial-glow-top" />
          <main className="flex-1 relative z-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
