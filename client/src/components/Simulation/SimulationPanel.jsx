import React from "react";
import { TrendingUp, CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";
import useStore from "../../hooks/useStore";

function ScoreRing({ score }) {
  const r = 52, circ = 2 * Math.PI * r;
  const fill  = circ - (circ * score) / 100;
  const color = score >= 70 ? "#00b894" : score >= 40 ? "#ffb347" : "#ff6b8a";
  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1e2730" strokeWidth="8" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={fill}
          className="score-ring" style={{ filter: `drop-shadow(0 0 8px ${color}88)` }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display font-bold text-3xl text-bright">{score}</span>
        <span className="font-mono text-[10px] text-dim">FOCUS</span>
      </div>
    </div>
  );
}

export default function SimulationPanel() {
  const { solutions, appliedSolutions, toggleSolution, scoreResult, simLoading, debugResult } = useStore();
  const score    = scoreResult?.score ?? 0;
  const rawScore = scoreResult?.breakdown?.raw ?? 0;
  const delta    = scoreResult?.breakdown?.delta ?? 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex-shrink-0">
        <h2 className="font-display font-bold text-bright text-sm">Simulation Engine</h2>
        <p className="font-body text-xs text-dim mt-0.5">Apply solutions to reduce causes and boost your score.</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center py-6 border-b border-border">
          {simLoading
            ? <div className="w-9 h-9 border-2 border-rose/30 border-t-rose rounded-full animate-spin" />
            : <ScoreRing score={score} />
          }
          {delta !== 0 && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-mono
                          ${delta > 0 ? "bg-teal/10 text-teal" : "bg-rose/10 text-rose"}`}>
              <TrendingUp size={11} />
              {delta > 0 ? "+" : ""}{delta} pts from {rawScore}
            </motion.div>
          )}
          {!debugResult && (
            <p className="font-mono text-[11px] text-dim mt-3 text-center px-6">
              Run the Debugger first to generate a cause tree
            </p>
          )}
        </div>

        {appliedSolutions.length > 0 && (
          <div className="px-4 py-3 border-b border-border">
            <p className="font-display text-[10px] uppercase tracking-widest text-ghost mb-2">
              Active ({appliedSolutions.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {appliedSolutions.map((key) => {
                const sol = solutions.find((s) => s.key === key);
                return sol ? (
                  <span key={key} className="font-mono text-[11px] px-2 py-0.5 bg-teal/10 text-teal border border-teal/20 rounded">
                    {sol.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        <div className="px-4 py-4">
          <p className="font-display text-[10px] uppercase tracking-widest text-ghost mb-3">Solution Catalogue</p>
          {solutions.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-dim">
              <p className="font-mono text-xs">Loading solutions…</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {solutions.map((sol, i) => {
                const active = appliedSolutions.includes(sol.key);
                return (
                  <motion.div key={sol.key}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => toggleSolution(sol.key)}
                    className={`px-3.5 py-3 rounded-xl border cursor-pointer transition-all duration-200
                                ${active ? "border-teal/40 bg-teal/8 shadow-glow-teal" : "border-border bg-panel hover:border-teal/20 hover:bg-teal/5"}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {active ? <CheckCircle2 size={14} className="text-teal" /> : <Circle size={14} className="text-dim" />}
                        <span className={`font-display text-xs font-semibold ${active ? "text-teal" : "text-text"}`}>{sol.label}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3].map((d) => (
                          <div key={d} className={`w-1.5 h-1.5 rounded-full ${d <= sol.cost ? "bg-amber" : "bg-muted"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="font-body text-[11px] text-dim ml-5 mb-2 leading-relaxed">{sol.description}</p>
                    <div className="flex flex-wrap gap-1 ml-5">
                      {Object.entries(sol.reduces || {}).map(([concept, delta]) => (
                        <span key={concept} className="font-mono text-[10px] px-1.5 py-0.5 bg-teal/8 text-teal/70 border border-teal/15 rounded">
                          -{delta} {concept}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}