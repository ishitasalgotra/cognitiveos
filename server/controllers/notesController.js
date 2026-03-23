const Note = require("../models/Note");

const parsePagination = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  return { skip: (page - 1) * limit, limit, page };
};

exports.getNotes = async (req, res, next) => {
  try {
    const { skip, limit, page } = parsePagination(req.query);
    // Get notes belonging to this user OR notes with no user (legacy)
    const filter = {
      archived: false,
      $or: [{ user: req.user._id }, { user: { $exists: false } }, { user: null }]
    };
    if (req.query.tag) filter.tags = req.query.tag.toLowerCase();
    const [notes, total] = await Promise.all([
      Note.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).populate("links", "title tags"),
      Note.countDocuments(filter),
    ]);
    res.json({ data: notes, page, limit, total });
  } catch (err) { next(err); }
};

exports.getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [{ user: req.user._id }, { user: { $exists: false } }, { user: null }]
    }).populate("links", "title tags excerpt");
    if (!note || note.archived) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (err) { next(err); }
};

exports.createNote = async (req, res, next) => {
  try {
    const { title, content, tags, links } = req.body;
    const note = await Note.create({ title, content, tags, links, user: req.user._id });
    res.status(201).json(note);
  } catch (err) { next(err); }
};

exports.updateNote = async (req, res, next) => {
  try {
    const { title, content, tags, links } = req.body;
    // Try to find by user first, fall back to no-user notes
    let note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, content, tags, links, user: req.user._id },
      { new: true, runValidators: true }
    ).populate("links", "title tags");

    // Legacy note with no user — assign to current user and update
    if (!note) {
      note = await Note.findOneAndUpdate(
        { _id: req.params.id, $or: [{ user: { $exists: false } }, { user: null }] },
        { title, content, tags, links, user: req.user._id },
        { new: true, runValidators: true }
      ).populate("links", "title tags");
    }

    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (err) { next(err); }
};

exports.deleteNote = async (req, res, next) => {
  try {
    let note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { archived: true },
      { new: true }
    );
    // Legacy note fallback
    if (!note) {
      note = await Note.findOneAndUpdate(
        { _id: req.params.id, $or: [{ user: { $exists: false } }, { user: null }] },
        { archived: true },
        { new: true }
      );
    }
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note archived", id: note._id });
  } catch (err) { next(err); }
};

exports.updateLinks = async (req, res, next) => {
  try {
    const { add = [], remove = [] } = req.body;
    let note = await Note.findOne({
      _id: req.params.id,
      $or: [{ user: req.user._id }, { user: { $exists: false } }, { user: null }]
    });
    if (!note) return res.status(404).json({ error: "Note not found" });
    const currentLinks = note.links.map(String);
    note.links = [
      ...currentLinks.filter((id) => !remove.includes(id)),
      ...add.filter((id) => !currentLinks.includes(id)),
    ];
    // Assign user if missing
    if (!note.user) note.user = req.user._id;
    await note.save();
    await note.populate("links", "title tags");
    res.json(note);
  } catch (err) { next(err); }
};