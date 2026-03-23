from __future__ import annotations
import os
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
import numpy as np

load_dotenv()

app = FastAPI(title="Cognitive OS AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("⏳ Loading sentence-transformers model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("✅ Model loaded!")

MONGO_URI  = os.getenv("MONGO_URI", "mongodb+srv://salgotraishita353_db_user:octopus@cluster0.gfbj27x.mongodb.net/cognitiveos")
client     = MongoClient(MONGO_URI)
db         = client["cognitiveos"]
notes_col  = db["notes"]

# ── Pydantic models ────────────────────────────────────────────────────────────

class SimilarityRequest(BaseModel):
    query: str
    top_k: int = 5

class EmbedRequest(BaseModel):
    note_id: str
    text:    str

class EmbedAllRequest(BaseModel):
    dry_run: bool = False

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "model": "all-MiniLM-L6-v2"}


@app.post("/embed")
def embed_note(req: EmbedRequest):
    """Store embedding for a single note."""
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is empty")
    vec = model.encode(text).tolist()
    notes_col.update_one(
        {"_id": __import__("bson").ObjectId(req.note_id)},
        {"$set": {"embedding": vec}}
    )
    return {"note_id": req.note_id, "dims": len(vec)}


@app.post("/embed-all")
def embed_all_notes(req: EmbedAllRequest = EmbedAllRequest()):
    """Embed every note that doesn't have an embedding yet."""
    notes = list(notes_col.find(
        {"archived": {"$ne": True}},
        {"_id": 1, "title": 1, "content": 1}
    ))
    updated = 0
    for note in notes:
        text = f"{note.get('title', '')} {note.get('content', '')}".strip()
        if not text:
            continue
        vec = model.encode(text).tolist()
        if not req.dry_run:
            notes_col.update_one({"_id": note["_id"]}, {"$set": {"embedding": vec}})
        updated += 1
    return {"embedded": updated, "dry_run": req.dry_run}


@app.post("/similarity")
def similarity_search(req: SimilarityRequest):
    """Find top-k notes most similar to the query."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="query is empty")

    query_vec = model.encode(req.query)

    docs = list(notes_col.find(
        {"embedding": {"$exists": True, "$ne": []}, "archived": {"$ne": True}},
        {"_id": 1, "title": 1, "tags": 1, "content": 1, "embedding": 1}
    ))

    if not docs:
        return {"query": req.query, "results": [], "hint": "No embedded notes. Call /embed-all first."}

    ids        = [str(d["_id"]) for d in docs]
    titles     = [d.get("title", "") for d in docs]
    tags       = [d.get("tags", []) for d in docs]
    excerpts   = [d.get("content", "")[:120] for d in docs]
    embeddings = np.array([d["embedding"] for d in docs], dtype=np.float32)

    # Cosine similarity
    q_norm   = query_vec / (np.linalg.norm(query_vec) + 1e-10)
    e_norms  = embeddings / (np.linalg.norm(embeddings, axis=1, keepdims=True) + 1e-10)
    scores   = (e_norms @ q_norm).tolist()

    ranked = sorted(
        zip(ids, titles, tags, excerpts, scores),
        key=lambda x: x[4], reverse=True
    )[:req.top_k]

    return {
        "query": req.query,
        "results": [
            {"id": id_, "title": title, "tags": t, "excerpt": ex, "score": round(score, 4)}
            for id_, title, t, ex, score in ranked
        ],
    }
