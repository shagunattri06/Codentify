"""
ast_features.py

Parses Java source files into ASTs and extracts structural features.
This is the same logic from Notebook 1, turned into reusable functions
so it can be imported by other code instead of run cell-by-cell.
"""

import javalang
from collections import Counter
import numpy as np

# Must match the feature order used during model training
SCALAR_FEATURES = [
    'total_nodes', 'max_depth', 'num_methods', 'num_for_loops', 'num_while_loops',
    'num_if_statements', 'num_method_calls', 'num_variable_decls', 'num_assignments',
    'num_binary_ops', 'num_return_stmts', 'num_class_decls', 'num_try_statements',
    'num_array_creations',
]


def extract_ast_features(filepath):
    """Parse a Java file and extract a dict of structural features from its AST.

    Returns None if the file can't be parsed (e.g. syntax error).
    """
    with open(filepath, 'r', errors='ignore') as f:
        code_text = f.read()

    try:
        tree = javalang.parse.parse(code_text)
    except (javalang.parser.JavaSyntaxError, Exception):
        return None

    node_type_counts = Counter()
    total_nodes = 0
    max_depth = 0

    def walk(node, depth=0):
        nonlocal total_nodes, max_depth
        if isinstance(node, javalang.tree.Node):
            node_type_counts[type(node).__name__] += 1
            total_nodes += 1
            max_depth = max(max_depth, depth)
            for child in node.children:
                if isinstance(child, (list, tuple)):
                    for c in child:
                        walk(c, depth + 1)
                else:
                    walk(child, depth + 1)

    walk(tree)

    features = {
        'total_nodes': total_nodes,
        'max_depth': max_depth,
        'num_methods': node_type_counts.get('MethodDeclaration', 0),
        'num_for_loops': node_type_counts.get('ForStatement', 0),
        'num_while_loops': node_type_counts.get('WhileStatement', 0),
        'num_if_statements': node_type_counts.get('IfStatement', 0),
        'num_method_calls': node_type_counts.get('MethodInvocation', 0),
        'num_variable_decls': node_type_counts.get('LocalVariableDeclaration', 0),
        'num_assignments': node_type_counts.get('Assignment', 0),
        'num_binary_ops': node_type_counts.get('BinaryOperation', 0),
        'num_return_stmts': node_type_counts.get('ReturnStatement', 0),
        'num_class_decls': node_type_counts.get('ClassDeclaration', 0),
        'num_try_statements': node_type_counts.get('TryStatement', 0),
        'num_array_creations': node_type_counts.get('ArrayCreator', 0),
        'node_type_counter': node_type_counts,
    }
    return features


def cosine_sim_from_counters(c1, c2):
    """Cosine similarity between two node-type frequency distributions."""
    all_keys = set(c1.keys()) | set(c2.keys())
    v1 = np.array([c1.get(k, 0) for k in all_keys])
    v2 = np.array([c2.get(k, 0) for k in all_keys])
    if np.linalg.norm(v1) == 0 or np.linalg.norm(v2) == 0:
        return 0.0
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))


def build_pair_features(feats_a, feats_b):
    """Given two files' extracted features, build the similarity feature vector
    used as model input. Order of keys matches FEATURE_COLUMNS in predict.py.
    """
    feats = {
        'ast_cosine_similarity': cosine_sim_from_counters(
            feats_a['node_type_counter'], feats_b['node_type_counter']
        )
    }
    for col in SCALAR_FEATURES:
        a, b = feats_a[col], feats_b[col]
        max_val = max(a, b, 1)
        feats[f'{col}_diff_ratio'] = abs(a - b) / max_val
    return feats
