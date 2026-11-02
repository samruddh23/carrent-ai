import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from config import (
    CSV_PATH, MODELS_DIR, TARGET_COLUMN, NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES, ALL_INFERENCE_FEATURES,
    CATEGORY_NAMES, BRAND_NAMES, MODEL_NAMES, CITY_NAMES,
    GENDER_NAMES, PAYMENT_TYPE_NAMES, ESTIMATED_DAILY_BASE_USD,
    ESTIMATED_DAILY_MULTIPLIER_USD, ESTIMATED_DAILY_BASE_INR,
    ESTIMATED_DAILY_MULTIPLIER_INR
)

# Global in-memory cache for models and metrics
MODEL_REGISTRY = {}
DATA_CACHE = None
TEST_DATA_CACHE = None
METRICS_CACHE = {}

def get_raw_data():
    global DATA_CACHE
    if DATA_CACHE is None:
        DATA_CACHE = pd.read_csv(CSV_PATH)
    return DATA_CACHE

def train_and_evaluate_models(force_retrain=False):
    global MODEL_REGISTRY, TEST_DATA_CACHE, METRICS_CACHE
    
    os.makedirs(MODELS_DIR, exist_ok=True)
    metrics_path = os.path.join(MODELS_DIR, 'metrics.json')
    
    # Check if cached files exist and not force_retrain
    lr_file = os.path.join(MODELS_DIR, 'linear_regression.joblib')
    dt_file = os.path.join(MODELS_DIR, 'decision_tree.joblib')
    rf_file = os.path.join(MODELS_DIR, 'random_forest.joblib')
    
    if not force_retrain and os.path.exists(lr_file) and os.path.exists(dt_file) and os.path.exists(rf_file) and os.path.exists(metrics_path):
        try:
            MODEL_REGISTRY['Linear Regression'] = joblib.load(lr_file)
            MODEL_REGISTRY['Decision Tree'] = joblib.load(dt_file)
            MODEL_REGISTRY['Random Forest'] = joblib.load(rf_file)
            with open(metrics_path, 'r') as f:
                METRICS_CACHE = json.load(f)
            # Load test split for visualizer
            df = get_raw_data()
            X = df[ALL_INFERENCE_FEATURES]
            y = df[TARGET_COLUMN]
            _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            TEST_DATA_CACHE = (X_test, y_test)
            return METRICS_CACHE
        except Exception as e:
            print(f"Error loading saved models, retraining: {e}")
            
    df = get_raw_data()
    X = df[ALL_INFERENCE_FEATURES]
    y = df[TARGET_COLUMN]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    TEST_DATA_CACHE = (X_test, y_test)
    
    # Preprocessor for Linear Regression (scaled numericals + one-hot categoricals)
    preprocessor_lr = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), NUMERICAL_FEATURES),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CATEGORICAL_FEATURES)
        ]
    )
    
    # Preprocessor for Trees (unscaled numericals + one-hot categoricals)
    preprocessor_trees = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', NUMERICAL_FEATURES),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CATEGORICAL_FEATURES)
        ]
    )
    
    models = {
        'Linear Regression': Pipeline([
            ('preprocessor', preprocessor_lr),
            ('regressor', LinearRegression())
        ]),
        'Decision Tree': Pipeline([
            ('preprocessor', preprocessor_trees),
            ('regressor', DecisionTreeRegressor(random_state=42, max_depth=7, min_samples_split=10, min_samples_leaf=5))
        ]),
        'Random Forest': Pipeline([
            ('preprocessor', preprocessor_trees),
            ('regressor', RandomForestRegressor(random_state=42, n_estimators=60, max_depth=9, min_samples_split=6, n_jobs=-1))
        ])
    }
    
    metrics_summary = {}
    
    for name, pipe in models.items():
        pipe.fit(X_train, y_train)
        y_pred = pipe.predict(X_test)
        
        mae = float(mean_absolute_error(y_test, y_pred))
        mse = float(mean_squared_error(y_test, y_pred))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test, y_pred))
        
        metrics_summary[name] = {
            'mae': round(mae, 4),
            'mse': round(mse, 4),
            'rmse': round(rmse, 4),
            'r2': round(r2, 4),
            'training_samples': len(X_train),
            'testing_samples': len(X_test)
        }
        
        MODEL_REGISTRY[name] = pipe
        
    # Save models to disk
    joblib.dump(models['Linear Regression'], lr_file)
    joblib.dump(models['Decision Tree'], dt_file)
    joblib.dump(models['Random Forest'], rf_file)
    
    with open(metrics_path, 'w') as f:
        json.dump(metrics_summary, f, indent=2)
        
    METRICS_CACHE = metrics_summary
    return metrics_summary

def get_models_metrics():
    if not METRICS_CACHE:
        train_and_evaluate_models()
    return METRICS_CACHE

def predict_single(input_data, model_name='Random Forest'):
    if model_name not in MODEL_REGISTRY:
        train_and_evaluate_models()
    if model_name not in MODEL_REGISTRY:
        model_name = 'Random Forest'
        
    pipeline = MODEL_REGISTRY[model_name]
    df_sample = pd.DataFrame([input_data])[ALL_INFERENCE_FEATURES]
    
    pred_val = float(pipeline.predict(df_sample)[0])
    # Bound between 0.0 and 1.0 logically
    pred_bounded = max(0.0, min(1.0, pred_val))
    
    # Calculate estimated monetary values
    estimated_usd = round(ESTIMATED_DAILY_BASE_USD + (pred_bounded * ESTIMATED_DAILY_MULTIPLIER_USD * float(input_data['Rental_Duration'])), 2)
    estimated_inr = int(round(ESTIMATED_DAILY_BASE_INR + (pred_bounded * ESTIMATED_DAILY_MULTIPLIER_INR * float(input_data['Rental_Duration'])), -1))
    
    # Additional context based on model type
    model_details = {}
    if model_name == 'Random Forest':
        # Get predictions from individual trees to show variance
        rf_regressor = pipeline.named_steps['regressor']
        preprocessor = pipeline.named_steps['preprocessor']
        X_trans = preprocessor.transform(df_sample)
        tree_preds = [float(est.predict(X_trans)[0]) for est in rf_regressor.estimators_]
        model_details['tree_variance'] = float(np.var(tree_preds))
        model_details['tree_std'] = round(float(np.std(tree_preds)), 4)
        model_details['tree_min'] = round(float(np.min(tree_preds)), 4)
        model_details['tree_max'] = round(float(np.max(tree_preds)), 4)
        model_details['sample_tree_predictions'] = [round(p, 4) for p in tree_preds[:10]]
    elif model_name == 'Linear Regression':
        lr_regressor = pipeline.named_steps['regressor']
        model_details['intercept'] = round(float(lr_regressor.intercept_), 4)
        
    return {
        'model_name': model_name,
        'predicted_price_index': round(pred_bounded, 4),
        'raw_prediction': round(pred_val, 4),
        'estimated_price_inr': estimated_inr,
        'estimated_price_usd': estimated_usd,
        'currency_label': 'INR (₹) / Normalized Unit',
        'details': model_details
    }

def predict_multi_comparison(input_data):
    results = {}
    for name in ['Linear Regression', 'Decision Tree', 'Random Forest']:
        results[name] = predict_single(input_data, name)
    return results

def get_actual_vs_predicted(sample_size=100):
    if not MODEL_REGISTRY or TEST_DATA_CACHE is None:
        train_and_evaluate_models()
        
    X_test, y_test = TEST_DATA_CACHE
    indices = np.random.RandomState(42).choice(len(X_test), size=min(sample_size, len(X_test)), replace=False)
    
    X_sample = X_test.iloc[indices]
    y_actual = y_test.iloc[indices].values
    
    points = []
    preds = {}
    for name, pipe in MODEL_REGISTRY.items():
        preds[name] = pipe.predict(X_sample)
        
    for i in range(len(indices)):
        pt = {
            'index': int(i + 1),
            'actual': round(float(y_actual[i]), 4),
            'lr_pred': round(float(preds['Linear Regression'][i]), 4),
            'dt_pred': round(float(preds['Decision Tree'][i]), 4),
            'rf_pred': round(float(preds['Random Forest'][i]), 4),
            'lr_residual': round(float(y_actual[i] - preds['Linear Regression'][i]), 4),
            'dt_residual': round(float(y_actual[i] - preds['Decision Tree'][i]), 4),
            'rf_residual': round(float(y_actual[i] - preds['Random Forest'][i]), 4),
        }
        points.append(pt)
        
    return points

def get_feature_importances():
    if not MODEL_REGISTRY:
        train_and_evaluate_models()
        
    # Get feature names after One-Hot Encoding
    pipe_trees = MODEL_REGISTRY['Random Forest']
    preprocessor = pipe_trees.named_steps['preprocessor']
    
    cat_encoder = preprocessor.named_transformers_['cat']
    cat_feature_names = cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES).tolist()
    all_feature_names = NUMERICAL_FEATURES + cat_feature_names
    
    # 1. Random Forest importances
    rf_regressor = pipe_trees.named_steps['regressor']
    rf_importances = rf_regressor.feature_importances_
    
    # 2. Decision Tree importances
    dt_regressor = MODEL_REGISTRY['Decision Tree'].named_steps['regressor']
    dt_importances = dt_regressor.feature_importances_
    
    # 3. Linear Regression coefficients
    lr_regressor = MODEL_REGISTRY['Linear Regression'].named_steps['regressor']
    lr_coefs = lr_regressor.coef_
    
    # Aggregate importance by high-level feature groups
    group_rf = {feat: 0.0 for feat in ALL_INFERENCE_FEATURES}
    group_dt = {feat: 0.0 for feat in ALL_INFERENCE_FEATURES}
    group_lr = {feat: 0.0 for feat in ALL_INFERENCE_FEATURES}
    
    detailed_features = []
    for name, rf_val, dt_val, lr_val in zip(all_feature_names, rf_importances, dt_importances, lr_coefs):
        detailed_features.append({
            'feature': name,
            'rf_importance': round(float(rf_val), 4),
            'dt_importance': round(float(dt_val), 4),
            'lr_coefficient': round(float(lr_val), 4),
            'lr_abs_impact': round(float(abs(lr_val)), 4)
        })
        
        # Determine parent group
        parent = None
        for orig in ALL_INFERENCE_FEATURES:
            if name.startswith(orig):
                parent = orig
                break
        if parent:
            group_rf[parent] += float(rf_val)
            group_dt[parent] += float(dt_val)
            group_lr[parent] += float(abs(lr_val))
            
    grouped_summary = []
    for feat in ALL_INFERENCE_FEATURES:
        grouped_summary.append({
            'feature': feat,
            'rf_importance': round(group_rf[feat], 4),
            'dt_importance': round(group_dt[feat], 4),
            'lr_importance': round(group_lr[feat], 4)
        })
        
    grouped_summary = sorted(grouped_summary, key=lambda x: x['rf_importance'], reverse=True)
    detailed_features = sorted(detailed_features, key=lambda x: x['rf_importance'], reverse=True)
    
    return {
        'grouped': grouped_summary,
        'detailed_top20': detailed_features[:20]
    }

def get_decision_tree_structure(max_nodes=35):
    """Extract simplified tree representation for interactive visualization and decision traversal."""
    if not MODEL_REGISTRY:
        train_and_evaluate_models()
        
    pipe = MODEL_REGISTRY['Decision Tree']
    preprocessor = pipe.named_steps['preprocessor']
    regressor = pipe.named_steps['regressor']
    
    cat_encoder = preprocessor.named_transformers_['cat']
    feature_names = NUMERICAL_FEATURES + cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES).tolist()
    
    tree = regressor.tree_
    
    nodes = []
    def traverse(node_id, depth):
        if node_id >= len(tree.children_left) or len(nodes) >= max_nodes:
            return
            
        is_leaf = tree.children_left[node_id] == tree.children_right[node_id]
        feature_idx = tree.feature[node_id]
        feat_name = feature_names[feature_idx] if feature_idx >= 0 else "Leaf"
        
        node_info = {
            'id': int(node_id),
            'depth': int(depth),
            'is_leaf': bool(is_leaf),
            'samples': int(tree.n_node_samples[node_id]),
            'value': round(float(tree.value[node_id][0][0]), 4),
            'impurity': round(float(tree.impurity[node_id]), 4),
            'feature': feat_name,
            'threshold': round(float(tree.threshold[node_id]), 4) if not is_leaf else None,
            'left_child': int(tree.children_left[node_id]) if not is_leaf else None,
            'right_child': int(tree.children_right[node_id]) if not is_leaf else None
        }
        nodes.append(node_info)
        
        if not is_leaf:
            traverse(tree.children_left[node_id], depth + 1)
            traverse(tree.children_right[node_id], depth + 1)
            
    traverse(0, 0)
    return {
        'total_nodes': int(tree.node_count),
        'max_depth': int(regressor.get_depth()),
        'leaves': int(regressor.get_n_leaves()),
        'nodes': nodes
    }

def trace_decision_path(input_data):
    """Traces step-by-step traversal path through the Decision Tree for a user input sample."""
    if not MODEL_REGISTRY:
        train_and_evaluate_models()
        
    pipe = MODEL_REGISTRY['Decision Tree']
    preprocessor = pipe.named_steps['preprocessor']
    regressor = pipe.named_steps['regressor']
    
    cat_encoder = preprocessor.named_transformers_['cat']
    feature_names = NUMERICAL_FEATURES + cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES).tolist()
    
    df_sample = pd.DataFrame([input_data])[ALL_INFERENCE_FEATURES]
    X_trans = preprocessor.transform(df_sample)
    
    decision_path_csr = regressor.decision_path(X_trans)
    node_indices = decision_path_csr.indices
    
    tree = regressor.tree_
    steps = []
    
    for step_num, node_id in enumerate(node_indices):
        is_leaf = tree.children_left[node_id] == tree.children_right[node_id]
        node_val = round(float(tree.value[node_id][0][0]), 4)
        
        if is_leaf:
            steps.append({
                'step': step_num + 1,
                'node_id': int(node_id),
                'type': 'Leaf Node (Terminal Decision)',
                'description': f"Reached leaf node. Final predicted price index = {node_val}",
                'samples_in_node': int(tree.n_node_samples[node_id]),
                'prediction_value': node_val
            })
        else:
            feat_idx = tree.feature[node_id]
            feat_name = feature_names[feat_idx]
            threshold = round(float(tree.threshold[node_id]), 4)
            sample_val = round(float(X_trans[0, feat_idx]), 4)
            
            # Determine which child was taken
            next_node = node_indices[step_num + 1] if step_num + 1 < len(node_indices) else None
            went_left = (next_node == tree.children_left[node_id])
            
            condition_str = f"{feat_name} <= {threshold}"
            decision_eval = "True (Branch Left)" if went_left else "False (Branch Right)"
            
            steps.append({
                'step': step_num + 1,
                'node_id': int(node_id),
                'type': 'Decision Split',
                'feature_evaluated': feat_name,
                'sample_feature_value': sample_val,
                'threshold': threshold,
                'condition': condition_str,
                'decision_taken': decision_eval,
                'next_node': int(next_node) if next_node is not None else None,
                'node_current_value': node_val,
                'samples_in_node': int(tree.n_node_samples[node_id])
            })
            
    final_pred = round(float(pipe.predict(df_sample)[0]), 4)
    return {
        'input_data': input_data,
        'final_prediction': final_pred,
        'total_steps': len(steps),
        'traversal_path': steps
    }

def get_random_forest_trees_breakdown(input_data):
    """Returns predictions across individual trees in the Random Forest ensemble for Viva demo."""
    if not MODEL_REGISTRY:
        train_and_evaluate_models()
        
    pipe = MODEL_REGISTRY['Random Forest']
    preprocessor = pipe.named_steps['preprocessor']
    regressor = pipe.named_steps['regressor']
    
    df_sample = pd.DataFrame([input_data])[ALL_INFERENCE_FEATURES]
    X_trans = preprocessor.transform(df_sample)
    
    tree_preds = [float(est.predict(X_trans)[0]) for est in regressor.estimators_]
    
    ensemble_mean = float(np.mean(tree_preds))
    ensemble_std = float(np.std(tree_preds))
    
    # Histogram of tree predictions
    counts, bin_edges = np.histogram(tree_preds, bins=10)
    hist_data = []
    for i in range(len(counts)):
        hist_data.append({
            'range': f"{round(bin_edges[i], 3)} - {round(bin_edges[i+1], 3)}",
            'count': int(counts[i]),
            'midpoint': round((bin_edges[i] + bin_edges[i+1]) / 2, 3)
        })
        
    trees_sample = []
    for i, pred in enumerate(tree_preds[:20]):
        trees_sample.append({
            'tree_index': i + 1,
            'prediction': round(pred, 4),
            'deviation_from_mean': round(pred - ensemble_mean, 4)
        })
        
    return {
        'total_estimators': len(tree_preds),
        'ensemble_mean': round(ensemble_mean, 4),
        'ensemble_std': round(ensemble_std, 4),
        'ensemble_min': round(float(np.min(tree_preds)), 4),
        'ensemble_max': round(float(np.max(tree_preds)), 4),
        'histogram': hist_data,
        'first_20_trees': trees_sample
    }

def get_linear_regression_equation():
    """Extracts weights, bias and formula for Linear Regression Viva examination."""
    if not MODEL_REGISTRY:
        train_and_evaluate_models()
        
    pipe = MODEL_REGISTRY['Linear Regression']
    preprocessor = pipe.named_steps['preprocessor']
    regressor = pipe.named_steps['regressor']
    
    cat_encoder = preprocessor.named_transformers_['cat']
    feature_names = NUMERICAL_FEATURES + cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES).tolist()
    
    intercept = float(regressor.intercept_)
    coefficients = regressor.coef_
    
    terms = []
    for feat, coef in zip(feature_names, coefficients):
        terms.append({
            'feature': feat,
            'coefficient': round(float(coef), 4),
            'impact': 'Positive' if coef > 0 else 'Negative',
            'abs_weight': round(float(abs(coef)), 4)
        })
        
    # Sort by absolute weight
    terms = sorted(terms, key=lambda x: x['abs_weight'], reverse=True)
    
    formula_preview = f"Total_Paid = {round(intercept, 4)} "
    for t in terms[:5]:
        sign = "+ " if t['coefficient'] >= 0 else "- "
        formula_preview += f"{sign}{abs(t['coefficient'])} * {t['feature']} "
    formula_preview += "+ ... [all terms]"
    
    return {
        'model': 'Ordinary Least Squares (OLS) Linear Regression',
        'formula_preview': formula_preview,
        'intercept': round(intercept, 4),
        'total_coefficients': len(terms),
        'coefficients': terms
    }
