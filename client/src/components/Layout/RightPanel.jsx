import React, { useState } from "react";
import { Bug, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DebuggerPanel from "../Debugger/DebuggerPanel";
import SimulationPanel from "../Simulation/SimulationPanel";

const TABS = [
  { id: "debugger", icon: Bug, label: "Reality Debugger", color: "amber" },
  { id: "simulate", icon: Zap, label: "Simulation",       color: "rose"  },
];

export default function RightPanel() {
  const [tab, setTab] = useState("debugger");

  return (
    <aside className="relative z-10 flex flex-col w-[420px] flex-shrink-0
                      bg-surface border-l border-border overflow-hidden">
      <div className="flex border-b border-border flex-shrink-0">
        {TABS.map(({ id, icon: Icon, label, color }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 flex-1 px-4 py-3.5 text-xs font-display
                          border-b-2 transition-all duration-200
                          ${active
                            ? color === "amber"
                              ? "text-amber border-amber bg-panel/60"
                              : "text-rose border-rose bg-panel/60"
                            : "text-dim border-transparent hover:text-ghost"}`}>
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === "debugger"
            ? <motion.div key="debugger" className="h-full"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}>
                <DebuggerPanel />
              </motion.div>
            : <motion.div key="simulate" className="h-full"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}>
                <SimulationPanel />
              </motion.div>
          }
        </AnimatePresence>
      </div>
    </aside>
  );
}