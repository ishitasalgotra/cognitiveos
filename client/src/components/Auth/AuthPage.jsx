import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader } from "lucide-react";
import useAuth from "../../hooks/useAuth";

export default function AuthPage() {
  const [mode, setMode]         = useState("login"); // "login" | "register"
  const [form, setForm]         = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const { login, register }     = useAuth();

  const field = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen w-screen bg-void items-center justify-center overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-cyan/20 border border-cyan/30
                          flex items-center justify-center mb-4 animate-glow-cyan">
            <span className="font-display font-bold text-cyan text-xl">C</span>
          </div>
          <h1 className="font-display font-bold text-bright text-2xl">Cognitive OS</h1>
          <p className="font-body text-dim text-sm mt-1">Your second brain, debugger & simulator</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl border border-border p-6">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-panel border border-border p-1 mb-6">
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-xs font-display transition-all
                            ${mode === m ? "bg-cyan/10 text-cyan border border-cyan/20" : "text-dim hover:text-ghost"}`}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence>
              {mode === "register" && (
                <motion.div key="name"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}>
                  <label className="font-mono text-[11px] text-dim mb-1.5 block">Name</label>
                  <input value={form.name} onChange={field("name")} placeholder="Your name"
                    className="w-full bg-panel border border-border rounded-xl px-4 py-3
                               text-sm text-text font-body outline-none
                               placeholder:text-muted focus:border-cyan/40 transition-all" />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="font-mono text-[11px] text-dim mb-1.5 block">Email</label>
              <input value={form.email} onChange={field("email")}
                type="email" placeholder="you@example.com"
                className="w-full bg-panel border border-border rounded-xl px-4 py-3
                           text-sm text-text font-body outline-none
                           placeholder:text-muted focus:border-cyan/40 transition-all" />
            </div>

            <div>
              <label className="font-mono text-[11px] text-dim mb-1.5 block">Password</label>
              <div className="relative">
                <input value={form.password} onChange={field("password")}
                  type={showPass ? "text" : "password"} placeholder="••••••••"
                  className="w-full bg-panel border border-border rounded-xl px-4 py-3 pr-12
                             text-sm text-text font-body outline-none
                             placeholder:text-muted focus:border-cyan/40 transition-all" />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-ghost transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-rose text-xs font-mono px-3 py-2 rounded-lg bg-rose/10 border border-rose/20">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-cyan/10 text-cyan border border-cyan/20
                         font-display text-sm hover:bg-cyan/20 disabled:opacity-50
                         disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
              {loading
                ? <><Loader size={14} className="animate-spin" /> {mode === "login" ? "Signing in…" : "Creating account…"}</>
                : mode === "login" ? "Sign In" : "Create Account"
              }
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-[11px] text-dim mt-4">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-cyan hover:underline">
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}