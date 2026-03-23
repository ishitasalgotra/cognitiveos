const Note = require("../models/Note");

exports.textSearch = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) return res.status(400).json({ error: "q param is required" });
    const notes = await Note.find(
      { $text: { $search: q }, archived: false },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(Math.min(50, parseInt(limit)))
      .populate("links", "title");
    res.json({ query: q, results: notes });
  } catch (err) { next(err); }
};

exports.semanticSearch = async (req, res, next) => {
  try {
    const { query, topK = 5 } = req.body;
    if (!query) return res.status(400).json({ error: "query is required" });

    const pythonUrl = process.env.PYTHON_SERVICE_URL;
    if (!pythonUrl)
      return res.status(503).json({ error: "AI service not configured" });

    const response = await fetch(`${pythonUrl}/similarity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, top_k: topK }),
    });

    if (!response.ok) throw new Error(`Python service error: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    if (err.message?.includes("fetch") || err.code === "ECONNREFUSED") {
      return res.status(503).json({ error: "AI service not running. Start the Python service first." });
    }
    next(err);
  }
};

exports.embedAll = async (req, res, next) => {
  try {
    const pythonUrl = process.env.PYTHON_SERVICE_URL;
    if (!pythonUrl)
      return res.status(503).json({ error: "AI service not configured" });

    const response = await fetch(`${pythonUrl}/embed-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) throw new Error(`Python service error: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    if (err.code === "ECONNREFUSED" || err.message?.includes("fetch")) {
      return res.status(503).json({ error: "AI service not running" });
    }
    next(err);
  }
};
