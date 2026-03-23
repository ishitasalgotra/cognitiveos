import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Save, Trash2, Plus, X, Link, Eye, Edit3 } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import useStore from "../../hooks/useStore";
import { notesApi } from "../../api";
import ExportMenu from "./ExportMenu";

export default function NoteEditor() {
  const { activeNote, updateNote, deleteNote, setActiveNote, notes } = useStore();
  const [form, setForm]         = useState({ title: "", content: "", tags: [] });
  const [tagInput, setTagInput] = useState("");
  const [dirty, setDirty]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [preview, setPreview]   = useState(false);

  useEffect(() => {
    if (activeNote) {
      setForm({ title: activeNote.title || "", content: activeNote.content || "", tags: activeNote.tags || [] });
      setDirty(false);
    }
  }, [activeNote]);

  const field = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setDirty(true); };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput(""); setDirty(true);
  };

  const removeTag = (t) => { setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) })); setDirty(true); };

  const handleSave = useCallback(async () => {
    if (!dirty) return;
    setSaving(true);
    try { await updateNote(activeNote._id, form); setDirty(false); }
    finally { setSaving(false); }
  }, [dirty, form, activeNote, updateNote]);

  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this note?")) return;
    await deleteNote(activeNote._id);
  };

  const linkedIds     = activeNote?.links?.map((l) => l._id || l) || [];
  const linkedNotes   = notes.filter((n) => linkedIds.includes(n._id));
  const linkableNotes = notes.filter((n) => n._id !== activeNote?._id && !linkedIds.includes(n._id));

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
        <button onClick={() => setActiveNote(null)}
          className="p-1.5 rounded-lg text-dim hover:text-text hover:bg-muted/30 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 flex items-center gap-2">
          {dirty && <span className="font-mono text-[10px] text-amber">unsaved</span>}
        </div>

        {/* Export */}
<ExportMenu note={activeNote} />
        {/* Preview toggle */}
        <button onClick={() => setPreview((v) => !v)}
        
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display
                      border transition-colors
                      ${preview
                        ? "text-violet border-violet/30 bg-violet/10 hover:bg-violet/20"
                        : "text-dim border-border hover:text-text hover:bg-muted/30"}`}>
          {preview ? <><Edit3 size={12} /> Edit</> : <><Eye size={12} /> Preview</>}
        </button>

        <button onClick={() => setShowLinks((v) => !v)}
          className={`p-1.5 rounded-lg transition-colors ${showLinks ? "text-teal bg-teal/10" : "text-dim hover:text-text hover:bg-muted/30"}`}>
          <Link size={15} />
        </button>

        <button onClick={handleSave} disabled={!dirty || saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/10 text-teal
                     border border-teal/20 text-xs font-display hover:bg-teal/20
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <Save size={13} /> {saving ? "Saving…" : "Save"}
        </button>

        <button onClick={handleDelete}
          className="p-1.5 rounded-lg text-dim hover:text-rose hover:bg-rose/10 transition-colors">
          <Trash2 size={15} />
        </button>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-6 pb-4">
          {/* Title */}
          <input value={form.title} onChange={field("title")} placeholder="Note title…"
            className="w-full bg-transparent font-display font-bold text-2xl text-bright
                       outline-none placeholder:text-muted mb-4" />

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4 items-center">
            {form.tags.map((t) => (
              <span key={t} className="flex items-center gap-1 tag-pill">
                {t}
                <button onClick={() => removeTag(t)} className="hover:text-rose transition-colors"><X size={10} /></button>
              </span>
            ))}
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === ",") && (e.preventDefault(), addTag())}
              placeholder="+ add tag"
              className="bg-transparent font-mono text-xs text-dim outline-none
                         placeholder:text-muted w-20 focus:text-cyan transition-colors" />
          </div>

          {/* Content — Edit or Preview */}
          {preview ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="prose prose-invert prose-sm max-w-none
                         prose-headings:font-display prose-headings:text-bright
                         prose-p:text-text prose-p:leading-relaxed
                         prose-a:text-cyan prose-a:no-underline hover:prose-a:underline
                         prose-code:text-amber prose-code:bg-amber/10 prose-code:px-1 prose-code:rounded
                         prose-pre:bg-panel prose-pre:border prose-pre:border-border
                         prose-blockquote:border-cyan/30 prose-blockquote:text-dim
                         prose-strong:text-bright prose-em:text-ghost
                         prose-ul:text-text prose-ol:text-text
                         prose-li:marker:text-cyan
                         prose-hr:border-border
                         prose-table:text-text prose-th:text-bright prose-th:border-border
                         prose-td:border-border min-h-48">
              {form.content
                ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
                : <p className="text-muted italic">Nothing to preview yet…</p>
              }
            </motion.div>
          ) : (
            <TextareaAutosize value={form.content} onChange={field("content")}
              placeholder={`Start writing in **Markdown**...\n\n# Heading\n**bold**, *italic*, \`code\`\n- bullet lists\n> blockquotes`}
              minRows={12}
              className="w-full bg-transparent text-sm text-text leading-relaxed
                         outline-none resize-none placeholder:text-muted font-mono" />
          )}
        </div>

        {/* Links panel */}
        {showLinks && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="border-t border-border px-6 py-4">
            <h3 className="font-display text-xs font-semibold text-ghost mb-3 uppercase tracking-widest">
              Linked Notes
            </h3>
            {linkedNotes.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-4">
                {linkedNotes.map((n) => <LinkRow key={n._id} note={n} noteId={activeNote._id} action="remove" />)}
              </div>
            )}
            {linkableNotes.length > 0 && (
              <>
                <p className="font-mono text-[10px] text-dim mb-2">Add links:</p>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {linkableNotes.map((n) => <LinkRow key={n._id} note={n} noteId={activeNote._id} action="add" />)}
                </div>
              </>
            )}
            {linkedNotes.length === 0 && linkableNotes.length === 0 && (
              <p className="font-mono text-[10px] text-dim">No other notes to link yet.</p>
            )}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 px-6 py-2 border-t border-border flex-shrink-0">
        <span className="font-mono text-[10px] text-muted">
          Created {new Date(activeNote?.createdAt).toLocaleDateString()}
        </span>
        <span className="font-mono text-[10px] text-muted">{form.content.length} chars</span>
        <span className="font-mono text-[10px] text-muted">
          {form.content.split(/\s+/).filter(Boolean).length} words
        </span>
        <span className="font-mono text-[10px] text-violet ml-auto">MD</span>
      </div>
    </div>
  );
}

function LinkRow({ note, noteId, action }) {
  const [loading, setLoading] = useState(false);
  const toggle = async () => {
    setLoading(true);
    try {
      if (action === "add") await notesApi.updateLinks(noteId, { add: [note._id] });
      else await notesApi.updateLinks(noteId, { remove: [note._id] });
      const { data } = await notesApi.get(noteId);
      useStore.setState({ activeNote: data });
    } finally { setLoading(false); }
  };
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-panel border border-border">
      <span className="font-body text-xs text-text line-clamp-1">{note.title}</span>
      <button onClick={toggle} disabled={loading}
        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded font-display transition-colors
                    ${action === "add" ? "text-teal hover:bg-teal/10" : "text-rose hover:bg-rose/10"}`}>
        {action === "add" ? <Plus size={11} /> : <X size={11} />} {action}
      </button>
    </div>
  );
}