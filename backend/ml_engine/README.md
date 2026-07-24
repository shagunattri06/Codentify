# AI/ML Engine — Code Plagiarism Detector

This folder is a self-contained module. The backend does not need to know anything about AST parsing or machine learning — it just imports one function.

## For the backend teammate

```python
from ml_engine.predict import compare_files

result = compare_files("path/to/original.java", "path/to/submission.java")
# {"similarity": 0.94, "prediction": "plagiarized", "confidence": 0.89}
```

That's the entire integration. `result["prediction"]` is either `"plagiarized"` or `"not_plagiarized"`, and `result["confidence"]` is how sure the model is (0 to 1).

## Files in this folder

| File | Purpose |
|---|---|
| `predict.py` | **The only file you need to import.** Contains `compare_files()`. |
| `ast_features.py` | Internal — parses Java files into ASTs and extracts structural features. |
| `model.pkl` | The trained Random Forest model (already trained, ready to use). |
| `train_and_save_model.py` | Only needed if retraining the model on new/updated data. |
| `data/pairs_features.csv` | The training data the model was built from (kept for reference/reproducibility). |

## Requirements

```
pip install javalang scikit-learn joblib pandas numpy
```

## Notes for the report

- Only Java files are supported (via the `javalang` parser).
- The model was trained on the IR-Plag-Dataset (467 files, 7 programming tasks, plagiarism levels L1-L6).
- Detection accuracy varies by how heavily the code was rewritten — see the project's Notebook 2 for the full per-level evaluation breakdown.
