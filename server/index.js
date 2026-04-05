require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors({
  origin: [
    "http://localhost:3000",
    process.env.FRONTEND_URL || "https://your-app.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth",     require("./routes/auth"));
app.use("/api/notes",    require("./routes/notes"));
app.use("/api/graph",    require("./routes/graph"));
app.use("/api/debugger", require("./routes/debugger"));
app.use("/api/simulate", require("./routes/simulate"));
app.use("/api/search",   require("./routes/search"));

app.get("/api/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🧠 Cognitive OS API running on port ${PORT}`));