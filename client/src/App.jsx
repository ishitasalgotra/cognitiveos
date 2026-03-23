import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Layout/Sidebar";
import LeftPanel from "./components/Layout/LeftPanel";
import RightPanel from "./components/Layout/RightPanel";
import TopBar from "./components/Layout/TopBar";
import AuthPage from "./components/Auth/AuthPage";
import useStore from "./hooks/useStore";
import useAuth from "./hooks/useAuth";
import "./styles/globals.css";

export default function App() {
  const { fetchNotes, fetchSolutions, fetchGraph } = useStore();
  const { user, authReady, init } = useAuth();

  useEffect(() => { init(); }, []);

  useEffect(() => {
    if (user) {
      fetchNotes();
      fetchSolutions();
      fetchGraph();
    }
  }, [user]);

  if (!authReady) {
    return (
      <div className="flex h-screen w-screen bg-void items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
          <span className="font-mono text-xs text-dim">Loading Cognitive OS…</span>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-void">
      <TopBar />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Ambient glows */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal/5 rounded-full blur-3xl" />
        </div>
        <Sidebar />
        <LeftPanel />
        <RightPanel />
      </div>

      <Toaster position="bottom-right"
        toastOptions={{
          style: {
            background: "#131920", color: "#c8d8e8",
            border: "1px solid #1e2730",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
          },
        }} />
    </div>
  );
}