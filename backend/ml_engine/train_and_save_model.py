"""
train_and_save_model.py

Trains the Random Forest model on pairs_features.csv (built by Notebook 1)
and saves the trained model to disk as a .pkl file, so it can be loaded
instantly later without retraining. Run this once after Notebook 1 has
produced data/pairs_features.csv.
"""

import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier

FEATURE_COLUMNS = [
    'ast_cosine_similarity', 'total_nodes_diff_ratio', 'max_depth_diff_ratio',
    'num_methods_diff_ratio', 'num_for_loops_diff_ratio', 'num_while_loops_diff_ratio',
    'num_if_statements_diff_ratio', 'num_method_calls_diff_ratio',
    'num_variable_decls_diff_ratio', 'num_assignments_diff_ratio',
    'num_binary_ops_diff_ratio', 'num_return_stmts_diff_ratio',
    'num_class_decls_diff_ratio', 'num_try_statements_diff_ratio',
    'num_array_creations_diff_ratio',
]


def train_and_save(csv_path='data/pairs_features.csv', model_out='model.pkl'):
    df = pd.read_csv(csv_path)

    X = df[FEATURE_COLUMNS]
    y = df['label']

    # Train on the FULL dataset for the final deployed model - the notebook's
    # train/test split was for honest evaluation only; once we've measured
    # performance, the deployed model should learn from everything available.
    model = RandomForestClassifier(
        n_estimators=200, max_depth=6, class_weight='balanced', random_state=42
    )
    model.fit(X, y)

    joblib.dump(model, model_out)
    print(f"Model trained on {len(df)} pairs and saved to {model_out}")
    return model


if __name__ == '__main__':
    train_and_save()
