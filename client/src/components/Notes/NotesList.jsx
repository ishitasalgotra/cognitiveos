import React, { useState } from "react";
import { Plus, Search, Tag } from "lucide-react";
import { motion } from "framer-motion";
import useStore from "../../hooks/useStore";

export default function NotesList() {
  const { notes, notesLoading, setActiveNote, createNote } = useStore();
  const [search, setSearch] = useState("");

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.tags?.some((t) => t.includes(search.toLowerCase()))
  );

  const handleNew = async () => {
    const note = await createNote({ title: "Untitled Note", content: "", tags: [], links: [] });
    setActiveNote(note);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <h1 className="font-display font-bold text-bright text-base tracking-tight">Second Brain</h1>
        <button onClick={handleNew}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                     bg-cyan/10 text-cyan border border-cyan/20 text-xs font-display
                     hover:bg-cyan/20 transition-colors">
          <Plus size={13} /> New Note
        </button>
      </div>

      <div className="px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-panel border border-border">
          <Search size={13} className="text-dim" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter notes..."
            className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-muted font-body" />
        </div>
      </div>

      <div className="px-5 py-2 flex gap-4 flex-shrink-0">
        <span className="font-mono text-xs text-dim">
          <span className="text-cyan">{notes.length}</span> notes
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {notesLoading ? (
          <div className="flex flex-col gap-2 mt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-panel border border-border animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-dim">
            <p className="font-display text-sm">No notes yet</p>
            <button onClick={handleNew} className="text-cyan text-xs font-display hover:underline">
              Create your first note →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 mt-1">
            {filtered.map((note, i) => {
              const date = new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              return (
                <motion.button key={note._id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setActiveNote(note)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-border
                             bg-panel hover:border-cyan/30 hover:bg-cyan/5
                             transition-all duration-200 group">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-display text-sm font-semibold text-text
                                     group-hover:text-bright transition-colors line-clamp-1">
                      {note.title}
                    </span>
                    <span className="font-mono text-[10px] text-muted flex-shrink-0">{date}</span>
                  </div>
                  {note.excerpt && (
                    <p className="text-xs text-dim line-clamp-2 mb-2 font-body">{note.excerpt}</p>
                  )}
                  {note.tags?.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {note.tags.slice(0, 3).map((t) => (
                        <span key={t} className="tag-pill">{t}</span>
                      ))}
                    </div>
                  )}
                  {note.links?.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Tag size={10} className="text-teal" />
                      <span className="font-mono text-[10px] text-teal">{note.links.length} link{note.links.length > 1 ? "s" : ""}</span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}