import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import useStore from "../../hooks/useStore";
import NotesList from "../Notes/NotesList";
import NoteEditor from "../Notes/NoteEditor";
import GraphView from "../Graph/GraphView";
import SearchPanel from "../Search/SearchPanel";

export default function LeftPanel() {
  const { activePanel, activeNote } = useStore();

  return (
    <main className="relative z-10 flex flex-col flex-1 min-w-0 border-r border-border overflow-hidden">
      {/* Notes */}
      {activePanel === "notes" && !activeNote && <NotesList />}
      {activePanel === "notes" &&  activeNote && <NoteEditor />}

      {/* Graph */}
      {activePanel === "graph" && <GraphView />}

      {/* Search */}
      {activePanel === "search" && <SearchPanel />}

      {/* Default empty state */}
      {activePanel !== "notes" && activePanel !== "graph" && activePanel !== "search" && (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-dim">
          <div className="w-16 h-16 rounded-2xl border border-border flex items-center justify-center">
            <span className="text-2xl">🧠</span>
          </div>
          <p className="font-display text-sm">Select a panel to begin</p>
        </div>
      )}
    </main>
  );
}