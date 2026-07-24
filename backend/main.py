"""
main.py — Codentify backend API

Exposes one real endpoint the frontend calls: POST /compare
Accepts two uploaded files, runs them through the AI/ML engine
(AST parsing + trained Random Forest), and returns a similarity
score, a plagiarism prediction, and the model's confidence.
"""

import os
import shutil
import tempfile

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ml_engine.predict import compare_files

app = FastAPI(title="Codentify API", version="1.0")

# Allow the frontend (running on a different port/origin during development)
# to call this API directly from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten this to your actual frontend domain before going live
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_EXTENSIONS = {".java"}


class CompareResponse(BaseModel):
    similarity: float | None
    prediction: str | None
    confidence: float | None
    error: str | None = None


@app.get("/")
def health_check():
    """Simple endpoint to confirm the API is running."""
    return {"status": "ok", "service": "Codentify API"}


@app.post("/compare", response_model=CompareResponse)
async def compare(file_a: UploadFile = File(...), file_b: UploadFile = File(...)):
    """Compare two uploaded source files for structural plagiarism.

    Currently only .java files are supported, matching the trained model.
    """
    ext_a = os.path.splitext(file_a.filename)[1].lower()
    ext_b = os.path.splitext(file_b.filename)[1].lower()

    if ext_a not in SUPPORTED_EXTENSIONS or ext_b not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Only .java files are currently supported by the AI/ML engine. "
                f"Got '{file_a.filename}' and '{file_b.filename}'."
            ),
        )

    # Save both uploads to a temporary directory - the AST parser needs real
    # file paths on disk, not in-memory file objects.
    with tempfile.TemporaryDirectory() as tmp_dir:
        path_a = os.path.join(tmp_dir, f"a_{file_a.filename}")
        path_b = os.path.join(tmp_dir, f"b_{file_b.filename}")

        with open(path_a, "wb") as f:
            shutil.copyfileobj(file_a.file, f)
        with open(path_b, "wb") as f:
            shutil.copyfileobj(file_b.file, f)

        result = compare_files(path_a, path_b)

    if result.get("error"):
        raise HTTPException(status_code=422, detail=result["error"])

    return result
