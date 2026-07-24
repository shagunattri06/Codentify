"""
predict.py

This is the ONE file your backend teammate needs to import.

Usage:
    from predict import compare_files
    result = compare_files("path/to/file1.java", "path/to/file2.java")
    # result = {"similarity": 0.87, "prediction": "plagiarized", "confidence": 0.91}
"""

import os
import joblib
import pandas as pd

try:
    from .ast_features import extract_ast_features, build_pair_features  # imported as a package (e.g. by the backend)
except ImportError:
    from ast_features import extract_ast_features, build_pair_features  # run directly as a script

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')

FEATURE_COLUMNS = [
    'ast_cosine_similarity', 'total_nodes_diff_ratio', 'max_depth_diff_ratio',
    'num_methods_diff_ratio', 'num_for_loops_diff_ratio', 'num_while_loops_diff_ratio',
    'num_if_statements_diff_ratio', 'num_method_calls_diff_ratio',
    'num_variable_decls_diff_ratio', 'num_assignments_diff_ratio',
    'num_binary_ops_diff_ratio', 'num_return_stmts_diff_ratio',
    'num_class_decls_diff_ratio', 'num_try_statements_diff_ratio',
    'num_array_creations_diff_ratio',
]

_model = None  # loaded once, reused for every call (loading is slow, predicting is fast)


def _get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"model.pkl not found at {MODEL_PATH}. "
                "Run train_and_save_model.py first."
            )
        _model = joblib.load(MODEL_PATH)
    return _model


def compare_files(file1_path, file2_path):
    """Compare two Java files and predict whether file2 is plagiarized from file1.

    Returns a dict:
        {
            "similarity": float (0-1, AST cosine similarity),
            "prediction": "plagiarized" | "not_plagiarized",
            "confidence": float (0-1, model's confidence in its prediction),
            "error": str (only present if something went wrong)
        }
    """
    feats1 = extract_ast_features(file1_path)
    feats2 = extract_ast_features(file2_path)

    if feats1 is None or feats2 is None:
        return {
            "similarity": None,
            "prediction": None,
            "confidence": None,
            "error": "Could not parse one or both files - check they are valid Java source files.",
        }

    pair_feats = build_pair_features(feats1, feats2)
    X = pd.DataFrame([[pair_feats[col] for col in FEATURE_COLUMNS]], columns=FEATURE_COLUMNS)

    model = _get_model()
    pred = model.predict(X)[0]
    proba = model.predict_proba(X)[0][1]  # probability of "plagiarized" class

    return {
        "similarity": round(pair_feats['ast_cosine_similarity'], 4),
        "prediction": "plagiarized" if pred == 1 else "not_plagiarized",
        "confidence": round(float(proba if pred == 1 else 1 - proba), 4),
    }


if __name__ == '__main__':
    # Quick manual test - update these paths to two real files before running directly
    import sys
    if len(sys.argv) == 3:
        result = compare_files(sys.argv[1], sys.argv[2])
        print(result)
    else:
        print("Usage: python predict.py <file1.java> <file2.java>")
