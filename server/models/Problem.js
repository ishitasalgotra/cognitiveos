const mongoose = require("mongoose");

const CauseSchema = new mongoose.Schema(
  {
    concept: { type: String, required: true },
    weight:  { type: Number, default: 1, min: 0, max: 10 },
    children: [],
  },
  { _id: false }
);

const ProblemSchema = new mongoose.Schema(
  {
    rawInput: { type: String, required: true },
    keywords: [String],
    causeTree: [CauseSchema],
    scoreSnapshot: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Problem", ProblemSchema);