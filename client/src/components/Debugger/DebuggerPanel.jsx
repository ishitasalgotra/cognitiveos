import React, { useState } from "react";
import { Send, Loader, AlertTriangle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../hooks/useStore";

export default function DebuggerPanel() {
  const { analyzeInput, debugResult, debugLoading } = useStore();
  const [input, setInput] = useState("");

  const handleSubmit = (e) => { e.preventDefault(); if (input.trim()) analyzeInput(input.trim()); };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex-shrink-0">
        <h2 className="font-display font-bold text-bright text-sm">Reality Debugger</h2>
        <p className="font-body text-xs text-dim mt-0.5">Describe a problem. Get a causal breakdown.</p>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-3 border-b border-border flex-shrink-0">
        <div className="relative">
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSubmit(e))}
            placeholder="e.g. I can't focus on work, keep getting distracted by my phone…"
            rows={3}
            className="w-full bg-panel border border-border rounded-xl px-4 py-3 pr-12
                       text-sm text-text font-body outline-none resize-none
                       placeholder:text-muted focus:border-amber/40 focus:bg-amber/5 transition-all duration-200" />
          <button type="submit" disabled={!input.trim() || debugLoading}
            className="absolute right-3 bottom-3 p-2 rounded-lg bg-amber/10 text-amber
                       border border-amber/20 hover:bg-amber/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            {debugLoading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {debugLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-10 text-dim">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-amber/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-t-amber border-amber/20 animate-spin" />
              </div>
              <p className="font-mono text-xs">Analyzing root causes…</p>
            </motion.div>
          )}
          {!debugLoading && debugResult && (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4">
              <div>
                <p className="font-display text-[10px] uppercase tracking-widest text-ghost mb-2">Extracted Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {debugResult.keywords.map((kw) => (
                    <span key={kw} className="font-mono text-[11px] px-2 py-0.5 bg-amber/10 text-amber border border-amber/20 rounded">{kw}</span>
                  ))}
                </div>
              </div>
              {debugResult.usedFallback && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-rose/10 border border-rose/20">
                  <AlertTriangle size={13} className="text-rose mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-display text-xs text-rose font-semibold">Fuzzy match used</p>
                    <p className="font-body text-xs text-dim mt-0.5">Try: {debugResult.suggestions.join(", ")}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="font-display text-[10px] uppercase tracking-widest text-ghost mb-3">Cause Tree</p>
                <div className="flex flex-col gap-2">
                  {debugResult.causeTree.map((cause, i) => (
                    <CauseNode key={cause.concept} cause={cause} depth={0} index={i} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {!debugLoading && !debugResult && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-3 py-12 text-dim">
              <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center">
                <span className="text-xl">🔍</span>
              </div>
              <p className="font-display text-xs text-center">Describe your problem above<br />to trace its root causes</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CauseNode({ cause, depth, index }) {
  const [open, setOpen] = useState(true);
  const hasChildren = cause.children?.length > 0;
  const weightColor = cause.weight >= 8 ? "text-rose border-rose/30 bg-rose/8" :
                      cause.weight >= 6 ? "text-amber border-amber/30 bg-amber/8" :
                                          "text-teal border-teal/30 bg-teal/8";
  const barColor = cause.weight >= 8 ? "bg-rose" : cause.weight >= 6 ? "bg-amber" : "bg-teal";

  return (
    <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`cause-node ${depth > 0 ? "ml-4 border-l border-border pl-3" : ""}`}>
      <div onClick={() => hasChildren && setOpen((v) => !v)}
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border bg-panel/60
                    ${depth === 0 ? "border-border" : "border-border/50"}
                    ${hasChildren ? "cursor-pointer hover:border-amber/30 hover:bg-amber/5" : ""}
                    transition-all duration-150`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {hasChildren && (
            <ChevronRight size={12} className={`text-dim flex-shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
          )}
          <span className="font-body text-xs text-text truncate">{cause.concept}</span>
        </div>
        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${weightColor} flex-shrink-0 ml-2`}>
          w{cause.weight}
        </span>
      </div>
      <div className="mx-3 mt-1 mb-1 h-0.5 rounded bg-muted/30 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${(cause.weight / 10) * 100}%` }}
          transition={{ delay: index * 0.06 + 0.1, duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded ${barColor}`} />
      </div>
      <AnimatePresence>
        {open && hasChildren && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-1.5 mt-1.5 overflow-hidden">
            {cause.children.map((child, i) => (
              <CauseNode key={child.concept} cause={child} depth={depth + 1} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}