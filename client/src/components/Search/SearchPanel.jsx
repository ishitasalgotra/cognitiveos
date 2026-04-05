import React, { useState } from "react";
import { Search, Loader, FileText, Sparkles, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchApi } from "../../api";
import useStore from "../../hooks/useStore";
import toast from "react-hot-toast";

export default function SearchPanel() {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [mode, setMode]         = useState("text"); // "text" | "semantic"
  const [embedding, setEmbedding] = useState(false);
  const { setActiveNote, setActivePanel } = useStore();

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    try {
      if (mode === "text") {
        const { data } = await searchApi.text(query.trim(), 20);
        setResults(data.results || []);
      } else {
        const { data } = await searchApi.semantic(query.trim(), 8);
        setResults(data.results || []);
        if (data.hint) toast(data.hint, { icon: "💡" });
      }
    } catch (err) {
      if (err.response?.status === 503) {
        toast.error("AI service not running. Start the Python service first.");
      } else {
        toast.error("Search failed");
      }
      setResults([]);
    } finally { setLoading(false); }
  };

const embedAllNotes = async () => {
  setEmbedding(true);
  try {
    const baseUrl = process.env.REACT_APP_API_URL || "";
    const res = await fetch(`${baseUrl}/api/search/embed-all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("cos_token")}`,
      },
      body: JSON.stringify({ dry_run: false }),
    });
    const data = await res.json();
    if (data.embedded !== undefined) {
      toast.success(`Embedded ${data.embedded} notes!`);
    } else {
      toast.success("Notes embedded!");
    }
  } catch (err) {
    toast.error("Could not embed notes");
  } finally { setEmbedding(false); }
};

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex-shrink-0">
        <h2 className="font-display font-bold text-bright text-base">Search Notes</h2>
        <p className="font-body text-xs text-dim mt-0.5">
          Full-text or AI-powered semantic search
        </p>
      </div>

      {/* Mode toggle */}
      <div className="px-4 pt-3 pb-0 flex-shrink-0">
        <div className="flex rounded-xl bg-panel border border-border p-1 mb-3">
          <button onClick={() => setMode("text")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                        text-xs font-display transition-all
                        ${mode === "text"
                          ? "bg-cyan/10 text-cyan border border-cyan/20"
                          : "text-dim hover:text-ghost"}`}>
            <AlignLeft size={11} /> Full-text
          </button>
          <button onClick={() => setMode("semantic")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                        text-xs font-display transition-all
                        ${mode === "semantic"
                          ? "bg-violet/10 text-violet border border-violet/20"
                          : "text-dim hover:text-ghost"}`}>
            <Sparkles size={11} /> Semantic AI
          </button>
        </div>
      </div>

      {/* Semantic helper */}
      <AnimatePresence>
        {mode === "semantic" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg
                            bg-violet/8 border border-violet/20">
              <div>
                <p className="font-mono text-[10px] text-violet">AI Semantic Search</p>
                <p className="font-mono text-[10px] text-dim mt-0.5">
                  First embed your notes so AI can search them
                </p>
              </div>
              <button onClick={embedAllNotes} disabled={embedding}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg
                           bg-violet/10 text-violet border border-violet/20
                           text-xs font-display hover:bg-violet/20
                           disabled:opacity-50 transition-colors flex-shrink-0 ml-3">
                {embedding
                  ? <Loader size={11} className="animate-spin" />
                  : <Sparkles size={11} />
                }
                {embedding ? "Embedding…" : "Embed Notes"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="px-4 py-2 border-b border-border flex-shrink-0">
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl bg-panel border
                        transition-all
                        ${mode === "semantic"
                          ? "border-border focus-within:border-violet/40 focus-within:bg-violet/5"
                          : "border-border focus-within:border-cyan/40 focus-within:bg-cyan/5"}`}>
          {loading
            ? <Loader size={14} className={`${mode === "semantic" ? "text-violet" : "text-cyan"} animate-spin`} />
            : <Search size={14} className="text-dim" />
          }
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "semantic"
              ? "Ask anything — 'notes about focus strategies'…"
              : "Search titles, content, tags…"}
            className="flex-1 bg-transparent text-sm text-text font-body
                       outline-none placeholder:text-muted" />
          {query && (
            <button type="submit"
              className={`font-mono text-[11px] transition-colors
                          ${mode === "semantic" ? "text-violet hover:text-bright" : "text-cyan hover:text-bright"}`}>
              Enter ↵
            </button>
          )}
        </div>
      </form>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-12 text-dim">
              <Loader size={20} className={`animate-spin ${mode === "semantic" ? "text-violet" : "text-cyan"}`} />
              <p className="font-mono text-xs">
                {mode === "semantic" ? "AI searching…" : "Searching…"}
              </p>
            </motion.div>
          )}

          {!loading && searched && results.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2 py-12 text-dim">
              <span className="text-2xl">🔎</span>
              <p className="font-display text-sm">No results for "{query}"</p>
              {mode === "semantic" && (
                <p className="font-mono text-[10px] text-dim text-center px-4">
                  Make sure you clicked "Embed Notes" first
                </p>
              )}
            </motion.div>
          )}

          {!loading && results.length > 0 && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <p className="font-mono text-[11px] text-dim">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
                {mode === "semantic" && (
                  <span className="font-mono text-[10px] text-violet flex items-center gap-1">
                    <Sparkles size={9} /> AI ranked
                  </span>
                )}
              </div>

              {results.map((note, i) => (
                <motion.button key={note.id || note._id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => { setActiveNote(note); setActivePanel("notes"); }}
                  className={`w-full text-left px-4 py-3 rounded-xl border border-border
                              bg-panel transition-all group
                              ${mode === "semantic"
                                ? "hover:border-violet/30 hover:bg-violet/5"
                                : "hover:border-cyan/30 hover:bg-cyan/5"}`}>
                  <div className="flex items-start gap-2 mb-1">
                    <FileText size={13} className={`mt-0.5 flex-shrink-0
                                                    ${mode === "semantic" ? "text-violet" : "text-cyan"}`} />
                    <span className="font-display text-sm font-semibold text-text
                                     group-hover:text-bright transition-colors flex-1">
                      {note.title}
                    </span>
                    {/* Similarity score for semantic */}
                    {mode === "semantic" && note.score !== undefined && (
                      <span className="font-mono text-[10px] text-violet/60 flex-shrink-0">
                        {Math.round(note.score * 100)}%
                      </span>
                    )}
                  </div>

                  {(note.excerpt || note.content) && (
                    <p className="font-body text-xs text-dim line-clamp-2 ml-5">
                      {note.excerpt || note.content?.slice(0, 120)}
                    </p>
                  )}

                  {note.tags?.length > 0 && (
                    <div className="flex gap-1 mt-2 ml-5">
                      {note.tags.slice(0, 4).map((t) => (
                        <span key={t} className="tag-pill">{t}</span>
                      ))}
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}

          {!loading && !searched && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-3 py-12 text-dim">
              <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center">
                {mode === "semantic"
                  ? <Sparkles size={20} className="text-violet" />
                  : <Search size={20} className="text-cyan" />
                }
              </div>
              <p className="font-display text-xs text-center">
                {mode === "semantic"
                  ? "AI search finds notes by meaning,\nnot just keywords"
                  : "Search across all your notes"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}