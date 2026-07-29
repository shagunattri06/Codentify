# Codentify Backend

A FastAPI server that exposes the AI/ML plagiarism-detection engine to the frontend.

## Setup

```bash
cd backend
pip install -r requirements.txt
```

## Run it

```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
Uvicorn running on http://0.0.0.0:8000
```

Visit `http://localhost:8000` in a browser — you should see `{"status":"ok","service":"Codentify API"}`.
Visit `http://localhost:8000/docs` for interactive API docs (FastAPI generates this automatically) — useful for testing the `/compare` endpoint directly without the frontend.

## API

### `POST /compare`

Accepts two file uploads (`file_a`, `file_b`) as `multipart/form-data`. Currently **only `.java` files** are supported (matching the trained model).

**Response:**
```json
{
  "similarity": 0.94,
  "prediction": "plagiarized",
  "confidence": 0.89,
  "error": null
}
```

If an unsupported file type is uploaded, it returns a `400` with a clear error message instead of a fake/wrong result.

## How this connects to the frontend

`script.js` (already updated) calls this API from the browser:

```js
const BACKEND_URL = 'http://localhost:8000';
```

**Before running the frontend, make sure this backend is running first** — the "Compare" button on the site sends the two uploaded files here and shows whatever comes back.

If you deploy the backend somewhere later (Render, Railway, etc.), update `BACKEND_URL` in `script.js` to point at the deployed URL instead of `localhost`.

In the current version of our project, the plagiarism detection model works only with Java source files. While our platform is intended to support 20+ programming languages in the future, each language requires its own AST parser and processing pipeline. Since developing and training models for multiple languages was beyond the scope of this project, we implemented support for Java first. Expanding language support is one of the key future improvements planned for the project.
