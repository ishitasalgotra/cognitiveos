const SOLUTIONS = {
  "deep-work-block": {
    label: "Deep Work Block",
    description: "90-min uninterrupted focus session with all notifications off",
    reduces: { distraction: 5, procrastination: 3, productivity: 4 },
    cost: 3,
  },
  "morning-pages": {
    label: "Morning Pages",
    description: "3 pages of stream-of-consciousness writing on waking",
    reduces: { anxiety: 4, clarity: 5, motivation: 2 },
    cost: 2,
  },
  "pomodoro": {
    label: "Pomodoro Technique",
    description: "25-min focused work + 5-min break cycles",
    reduces: { procrastination: 4, distraction: 3, productivity: 3 },
    cost: 1,
  },
  "sleep-hygiene": {
    label: "Sleep Hygiene Protocol",
    description: "Consistent bedtime, no screens 1hr before, dark/cool room",
    reduces: { sleep: 6, anxiety: 3, motivation: 2 },
    cost: 2,
  },
  "goal-clarity-session": {
    label: "Goal Clarity Session",
    description: "Write down your top 3 goals and weekly milestones",
    reduces: { clarity: 6, motivation: 5, procrastination: 3 },
    cost: 1,
  },
  "digital-detox": {
    label: "Digital Detox Hour",
    description: "One hour per day completely offline",
    reduces: { distraction: 6, anxiety: 4, clarity: 3 },
    cost: 2,
  },
  "exercise": {
    label: "Daily Exercise",
    description: "30 min of moderate aerobic exercise",
    reduces: { anxiety: 5, motivation: 4, sleep: 3 },
    cost: 3,
  },
};

const computeScore = (causeTree, appliedSolutions = []) => {
  const causeWeights = {};
  const flatten = (nodes) => {
    for (const node of nodes) {
      const key = node.concept.toLowerCase().replace(/\s+/g, "_");
      causeWeights[key] = (causeWeights[key] || 0) + node.weight;
      if (node.children?.length) flatten(node.children);
    }
  };
  flatten(causeTree);

  for (const solKey of appliedSolutions) {
    const sol = SOLUTIONS[solKey];
    if (!sol) continue;
    for (const [concept, delta] of Object.entries(sol.reduces)) {
      if (causeWeights[concept] !== undefined)
        causeWeights[concept] = Math.max(0, causeWeights[concept] - delta);
    }
  }

  const totalWeight = Object.values(causeWeights).reduce((a, b) => a + b, 0);
  const maxWeight   = Object.keys(causeWeights).length * 10 || 1;
  const score       = Math.round(100 - (totalWeight / maxWeight) * 100);
  return Math.max(0, Math.min(100, score));
};

exports.getSolutions = (_req, res) => {
  res.json(Object.entries(SOLUTIONS).map(([key, val]) => ({ key, ...val })));
};

exports.computeSimScore = (req, res, next) => {
  try {
    const { causeTree = [], appliedSolutions = [] } = req.body;
    if (!Array.isArray(causeTree))
      return res.status(400).json({ error: "causeTree must be an array" });
    const score = computeScore(causeTree, appliedSolutions);
    res.json({
      score,
      appliedSolutions: appliedSolutions.map((k) => SOLUTIONS[k]?.label).filter(Boolean),
      breakdown: {
        raw:      computeScore(causeTree, []),
        improved: score,
        delta:    score - computeScore(causeTree, []),
      },
    });
  } catch (err) { next(err); }
};