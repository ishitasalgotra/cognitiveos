const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title can be at most 200 characters"],
    },
    content: { type: String, default: "" },
    tags: {
      type: [String],
      default: [],
      set: (tags) => tags.map((t) => t.toLowerCase().trim()),
    },
    links: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
    embedding: { type: [Number], default: [], select: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

NoteSchema.index({ title: "text", content: "text", tags: "text" });
NoteSchema.index({ tags: 1 });
NoteSchema.index({ createdAt: -1 });

NoteSchema.virtual("excerpt").get(function () {
  return this.content ? this.content.slice(0, 160) : "";
});

module.exports = mongoose.model("Note", NoteSchema);