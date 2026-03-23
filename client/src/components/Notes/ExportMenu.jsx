import React, { useState } from "react";
import { Download, FileText, File, Loader, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { marked } from "marked";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ExportMenu({ note }) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState("");

  // ── Export as Markdown (.md) ──────────────────────────────────────────────
  const exportMarkdown = () => {
    setLoading("md");
    try {
      const meta = [
        `---`,
        `title: ${note.title}`,
        `tags: ${note.tags?.join(", ") || ""}`,
        `created: ${new Date(note.createdAt).toLocaleDateString()}`,
        `updated: ${new Date(note.updatedAt).toLocaleDateString()}`,
        `---`,
        ``,
        `# ${note.title}`,
        ``,
      ].join("\n");

      const content  = meta + (note.content || "");
      const blob     = new Blob([content], { type: "text/markdown" });
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement("a");
      a.href         = url;
      a.download     = `${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(""); setOpen(false); }
  };

  // ── Export as PDF ─────────────────────────────────────────────────────────
  const exportPDF = async () => {
    setLoading("pdf");
    try {
      // Build a hidden HTML div to render
      const container       = document.createElement("div");
      container.style.cssText = `
        position: fixed; top: -9999px; left: -9999px;
        width: 794px; padding: 60px;
        background: #ffffff; color: #1a1a2e;
        font-family: Georgia, serif; font-size: 14px; line-height: 1.8;
      `;

      const html = marked.parse(note.content || "");
      container.innerHTML = `
        <style>
          h1,h2,h3 { font-family: 'Arial', sans-serif; color: #0a0a1a; margin-top: 24px; }
          h1 { font-size: 28px; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; }
          h2 { font-size: 20px; }
          h3 { font-size: 16px; }
          p  { margin: 12px 0; }
          code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: monospace; }
          pre  { background: #f4f4f4; padding: 16px; border-radius: 8px; overflow: hidden; }
          blockquote { border-left: 3px solid #00b894; padding-left: 16px; color: #555; margin: 16px 0; }
          ul,ol { padding-left: 24px; }
          li { margin: 4px 0; }
          table { border-collapse: collapse; width: 100%; margin: 16px 0; }
          th,td { border: 1px solid #ddd; padding: 8px 12px; }
          th { background: #f4f4f4; font-weight: bold; }
          hr { border: none; border-top: 1px solid #e0e0e0; margin: 24px 0; }
          .meta { color: #888; font-size: 12px; margin-bottom: 32px; font-family: monospace; }
        </style>
        <h1>${note.title}</h1>
        <div class="meta">
          Tags: ${note.tags?.join(", ") || "none"} &nbsp;·&nbsp;
          Created: ${new Date(note.createdAt).toLocaleDateString()} &nbsp;·&nbsp;
          Updated: ${new Date(note.updatedAt).toLocaleDateString()}
        </div>
        ${html}
      `;

      document.body.appendChild(container);
      const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
      document.body.removeChild(container);

      const imgData  = canvas.toDataURL("image/png");
      const pdf      = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const pdfW     = pdf.internal.pageSize.getWidth();
      const pdfH     = pdf.internal.pageSize.getHeight();
      const imgW     = canvas.width;
      const imgH     = canvas.height;
      const ratio    = pdfW / imgW;
      const totalH   = imgH * ratio;
      let   position = 0;

      // Multi-page support
      while (position < totalH) {
        if (position > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -position, pdfW, totalH);
        position += pdfH;
      }

      pdf.save(`${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`);
    } catch (e) {
      console.error(e);
    } finally { setLoading(""); setOpen(false); }
  };

  // ── Export as plain text ──────────────────────────────────────────────────
  const exportText = () => {
    setLoading("txt");
    try {
      const content = `${note.title}\n${"=".repeat(note.title.length)}\n\nTags: ${note.tags?.join(", ") || "none"}\nCreated: ${new Date(note.createdAt).toLocaleDateString()}\n\n${note.content || ""}`;
      const blob    = new Blob([content], { type: "text/plain" });
      const url     = URL.createObjectURL(blob);
      const a       = document.createElement("a");
      a.href        = url;
      a.download    = `${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(""); setOpen(false); }
  };

  const EXPORTS = [
    { id: "md",  icon: FileText, label: "Markdown (.md)",   sub: "With frontmatter",   action: exportMarkdown, color: "cyan"   },
    { id: "pdf", icon: File,     label: "PDF Document",     sub: "Rendered + styled",  action: exportPDF,      color: "teal"   },
    { id: "txt", icon: FileText, label: "Plain Text (.txt)", sub: "No formatting",     action: exportText,     color: "violet" },
  ];

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display
                    border transition-colors
                    ${open
                      ? "text-teal border-teal/30 bg-teal/10"
                      : "text-dim border-border hover:text-text hover:bg-muted/30"}`}>
        <Download size={13} /> Export
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{    opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-9 z-50 w-56 rounded-xl border border-border
                         bg-panel shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="font-display text-xs text-ghost">Export note as</span>
                <button onClick={() => setOpen(false)} className="text-dim hover:text-text">
                  <X size={12} />
                </button>
              </div>

              {EXPORTS.map(({ id, icon: Icon, label, sub, action, color }) => (
                <button key={id} onClick={action} disabled={!!loading}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/20
                             transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                                   bg-${color}/10 border border-${color}/20`}>
                    {loading === id
                      ? <Loader size={12} className={`text-${color} animate-spin`} />
                      : <Icon size={12} className={`text-${color}`} />
                    }
                  </div>
                  <div className="text-left">
                    <p className="font-display text-xs text-text">{label}</p>
                    <p className="font-mono text-[10px] text-dim">{sub}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}