/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
        body:    ["'DM Sans'", "sans-serif"],
      },
      colors: {
        void:    "#080b0f",
        surface: "#0e1318",
        panel:   "#131920",
        border:  "#1e2730",
        muted:   "#2a3542",
        dim:     "#4a5a6a",
        ghost:   "#6a7d8f",
        text:    "#c8d8e8",
        bright:  "#e8f4ff",
        cyan:    "#00d4ff",
        teal:    "#00b894",
        amber:   "#ffb347",
        rose:    "#ff6b8a",
        violet:  "#a78bfa",
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-up":   "slideUp 0.35s ease forwards",
        "glow-cyan":  "glowCyan 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        glowCyan: { from: { boxShadow: "0 0 8px #00d4ff44" }, to: { boxShadow: "0 0 24px #00d4ff99" } },
      },
      boxShadow: {
        "glow-cyan":  "0 0 20px #00d4ff33",
        "glow-teal":  "0 0 20px #00b89433",
        "glow-amber": "0 0 20px #ffb34733",
        "inner-dark": "inset 0 1px 0 rgba(255,255,255,0.04)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};