import { create } from "zustand";
import { notesApi, debuggerApi, simulateApi, graphApi } from "../api";
import toast from "react-hot-toast";

const useStore = create((set, get) => ({
  notes: [], activeNote: null, notesLoading: false,

  fetchNotes: async (params) => {
    set({ notesLoading: true });
    try {
      const { data } = await notesApi.list(params);
      set({ notes: data.data });
    } catch { toast.error("Failed to load notes"); }
    finally { set({ notesLoading: false }); }
  },

  setActiveNote: (note) => set({ activeNote: note }),

  createNote: async (payload) => {
    const { data } = await notesApi.create(payload);
    set((s) => ({ notes: [data, ...s.notes] }));
    toast.success("Note created");
    return data;
  },

  updateNote: async (id, payload) => {
    const { data } = await notesApi.update(id, payload);
    set((s) => ({
      notes:      s.notes.map((n) => (n._id === id ? data : n)),
      activeNote: s.activeNote?._id === id ? data : s.activeNote,
    }));
    toast.success("Note saved");
    return data;
  },

  deleteNote: async (id) => {
    await notesApi.delete(id);
    set((s) => ({
      notes:      s.notes.filter((n) => n._id !== id),
      activeNote: s.activeNote?._id === id ? null : s.activeNote,
    }));
    toast.success("Note deleted");
  },

  graphData: { nodes: [], links: [] }, graphLoading: false,

  fetchGraph: async () => {
    set({ graphLoading: true });
    try {
      const { data } = await graphApi.get();
      set({ graphData: data });
    } catch { toast.error("Failed to load graph"); }
    finally { set({ graphLoading: false }); }
  },

  debugResult: null, debugLoading: false,

  analyzeInput: async (input) => {
    set({ debugLoading: true, debugResult: null });
    try {
      const { data } = await debuggerApi.analyze(input);
      set({ debugResult: data });
      get().computeScore(data.causeTree, get().appliedSolutions);
    } catch { toast.error("Analysis failed"); }
    finally { set({ debugLoading: false }); }
  },

  solutions: [], appliedSolutions: [], scoreResult: null, simLoading: false,

  fetchSolutions: async () => {
    try {
      const { data } = await simulateApi.solutions();
      set({ solutions: data });
    } catch {}
  },

  toggleSolution: (key) => {
    const current = get().appliedSolutions;
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    set({ appliedSolutions: next });
    get().computeScore(get().debugResult?.causeTree || [], next);
  },

  computeScore: async (causeTree, appliedSolutions) => {
    if (!causeTree?.length) return;
    set({ simLoading: true });
    try {
      const { data } = await simulateApi.score({ causeTree, appliedSolutions });
      set({ scoreResult: data });
    } catch {}
    finally { set({ simLoading: false }); }
  },

  activePanel: "notes",
  setActivePanel: (p) => set({ activePanel: p }),
}));

export default useStore;