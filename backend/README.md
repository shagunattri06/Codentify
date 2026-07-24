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

## Known limitation (be upfront about this with faculty/users)

The trained model currently only supports **Java** source files, even though the site's marketing copy mentions "20+ languages." Extending to other languages would need separate AST parsers per language — worth flagging as a "Future Work" item in the report rather than silently over-promising.
