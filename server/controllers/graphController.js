const Note = require("../models/Note");

exports.getGraph = async (req, res, next) => {
  try {
    const notes = await Note.find({ archived: false, user: req.user._id }, "title tags links");
    const nodes = notes.map((n) => ({
      id:    n._id.toString(),
      title: n.title,
      tags:  n.tags,
      val:   Math.max(4, Math.min(20, n.links.length * 2 + 4)),
    }));
    const edgeSet = new Set();
    const links   = [];
    for (const note of notes) {
      for (const targetId of note.links) {
        const a   = note._id.toString();
        const b   = targetId.toString();
        const key = [a, b].sort().join("--");
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          links.push({ source: a, target: b });
        }
      }
    }
    res.json({ nodes, links });
  } catch (err) { next(err); }
};