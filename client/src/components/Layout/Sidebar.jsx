import React from "react";
import { Brain, GitBranch, Bug, Zap, Search } from "lucide-react";
import useStore from "../../hooks/useStore";

const NAV = [
  { id: "notes",    icon: Brain,     label: "Notes",    color: "cyan"   },
  { id: "graph",    icon: GitBranch, label: "Graph",    color: "teal"   },
  { id: "debugger", icon: Bug,       label: "Debugger", color: "amber"  },
  { id: "simulate", icon: Zap,       label: "Simulate", color: "rose"   },
  { id: "search",   icon: Search,    label: "Search",   color: "violet" },
];

const COLORS = {
  cyan:   { active: "text-cyan border-cyan bg-cyan/10",     glow: "shadow-glow-cyan"  },
  teal:   { active: "text-teal border-teal bg-teal/10",     glow: "shadow-glow-teal"  },
  amber:  { active: "text-amber border-amber bg-amber/10",  glow: "shadow-glow-amber" },
  rose:   { active: "text-rose border-rose bg-rose/10",     glow: ""                  },
  violet: { active: "text-violet border-violet bg-violet/10", glow: ""                },
};

export default function Sidebar() {
  const { activePanel, setActivePanel } = useStore();

  return (
    <aside className="relative z-10 flex flex-col items-center w-16 py-6 gap-2
                      bg-surface border-r border-border flex-shrink-0">
      <div className="mb-6 flex flex-col items-center">
        <div className="w-8 h-8 rounded-lg bg-cyan/20 border border-cyan/30
                        flex items-center justify-center animate-glow-cyan">
          <span className="font-display font-bold text-cyan text-sm">C</span>
        </div>
      </div>

      {NAV.map(({ id, icon: Icon, label, color }) => {
        const isActive = activePanel === id;
        const { active, glow } = COLORS[color];
        return (
          <button key={id} title={label} onClick={() => setActivePanel(id)}
            className={`group relative w-10 h-10 rounded-xl border transition-all duration-200
                        flex items-center justify-center
                        ${isActive
                          ? `${active} ${glow}`
                          : "text-dim border-transparent hover:text-ghost hover:bg-muted/30"}`}>
            <Icon size={18} />
            <span className="pointer-events-none absolute left-14 px-2 py-1 rounded-md
                             bg-panel border border-border text-xs text-text whitespace-nowrap
                             opacity-0 group-hover:opacity-100 transition-opacity z-50 font-body">
              {label}
            </span>
          </button>
        );
      })}

      <div className="mt-auto">
        <span className="font-mono text-[10px] text-muted rotate-90 block origin-center">v0.1</span>
      </div>
    </aside>
  );
}