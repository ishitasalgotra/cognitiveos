const Problem = require("../models/Problem");

const CONCEPT_MAP = {
  distraction: {
    keywords: ["distract", "focus", "attention", "scatter", "wander", "phone", "social media", "interrupt"],
    weight: 7,
    children: [
      { concept: "Digital overload",     weight: 8, children: [] },
      { concept: "Unclear priorities",   weight: 6, children: [] },
      { concept: "Environmental noise",  weight: 5, children: [] },
    ],
  },
  procrastination: {
    keywords: ["procrastinat", "delay", "avoid", "postpone", "lazy", "later", "tomorrow"],
    weight: 7,
    children: [
      { concept: "Fear of failure",      weight: 9, children: [] },
      { concept: "Task overwhelm",       weight: 8, children: [] },
      { concept: "Low motivation",       weight: 7, children: [] },
      { concept: "Perfectionism",        weight: 6, children: [] },
    ],
  },
  motivation: {
    keywords: ["motivat", "unmotivat", "energy", "drive", "inspired", "boring", "dull", "interest"],
    weight: 6,
    children: [
      { concept: "No clear goal",        weight: 8, children: [] },
      { concept: "Burnout",              weight: 7, children: [] },
      { concept: "Lack of reward loop",  weight: 6, children: [] },
    ],
  },
  anxiety: {
    keywords: ["anxious", "anxiety", "stress", "worry", "nervous", "overwhelm", "panic", "fear"],
    weight: 8,
    children: [
      { concept: "Cognitive overload",   weight: 8, children: [] },
      { concept: "Uncertainty",          weight: 7, children: [] },
      { concept: "High stakes pressure", weight: 6, children: [] },
    ],
  },
  productivity: {
    keywords: ["productiv", "efficien", "output", "work", "task", "accomplish", "done", "complete"],
    weight: 5,
    children: [
      { concept: "No system / workflow", weight: 7, children: [] },
      { concept: "Poor time blocking",   weight: 6, children: [] },
      { concept: "Context switching",    weight: 5, children: [] },
    ],
  },
  sleep: {
    keywords: ["sleep", "tired", "fatigue", "rest", "insomnia", "exhausted", "drowsy"],
    weight: 7,
    children: [
      { concept: "Irregular schedule",   weight: 7, children: [] },
      { concept: "Screen time at night", weight: 6, children: [] },
      { concept: "Caffeine dependency",  weight: 5, children: [] },
    ],
  },
  clarity: {
    keywords: ["confus", "clarity", "clear", "uncertain", "lost", "direction", "purpose", "meaning"],
    weight: 6,
    children: [
      { concept: "Values misalignment",  weight: 8, children: [] },
      { concept: "Information overload", weight: 6, children: [] },
      { concept: "Decision paralysis",   weight: 7, children: [] },
    ],
  },
};

const tokenise = (text) =>
  text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

const matchConcepts = (tokens) => {
  const matched = [];
  for (const [concept, data] of Object.entries(CONCEPT_MAP)) {
    const hit = tokens.some((tok) =>
      data.keywords.some((kw) => tok.includes(kw) || kw.includes(tok))
    );
    if (hit) matched.push({ concept, ...data });
  }
  return matched;
};

const fuzzyMatch = (input) => {
  const lower = input.toLowerCase();
  const scored = Object.entries(CONCEPT_MAP).map(([concept, data]) => {
    const score = data.keywords.reduce(
      (acc, kw) => acc + (lower.includes(kw.slice(0, 4)) ? 1 : 0), 0
    );
    return { concept, score, ...data };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 2).filter((c) => c.score > 0);
};

exports.debugProblem = async (req, res, next) => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== "string")
      return res.status(400).json({ error: "input string is required" });

    const tokens = tokenise(input);
    let matched  = matchConcepts(tokens);
    const usedFallback = matched.length === 0;
    if (usedFallback) matched = fuzzyMatch(input);

    const causeTree = matched.map(({ concept, weight, children }) => ({ concept, weight, children }));
    const keywords  = [...new Set(tokens)].slice(0, 10);
    const problem   = await Problem.create({ rawInput: input, keywords, causeTree });

    res.json({
      id: problem._id,
      keywords,
      causeTree,
      usedFallback,
      suggestions: usedFallback ? Object.keys(CONCEPT_MAP).slice(0, 4) : [],
    });
  } catch (err) { next(err); }
};

exports.getHistory = async (_req, res, next) => {
  try {
    const history = await Problem.find().sort({ createdAt: -1 }).limit(20);
    res.json(history);
  } catch (err) { next(err); }
};