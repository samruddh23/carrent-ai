from flask import Blueprint, request, jsonify
from config import (
    CATEGORY_NAMES, BRAND_NAMES, MODEL_NAMES, BRAND_TO_MODELS,
    CITY_NAMES, CITY_TIERS, PAYMENT_TYPE_NAMES, GENDER_NAMES
)
from services.db_service import (
    save_prediction, get_predictions, delete_prediction, clear_predictions
)
from services.ml_service import (
    train_and_evaluate_models, get_models_metrics, predict_single,
    predict_multi_comparison, get_actual_vs_predicted, get_feature_importances,
    get_decision_tree_structure, trace_decision_path,
    get_random_forest_trees_breakdown, get_linear_regression_equation
)
from services.eda_service import (
    get_dataset_overview, get_numerical_statistics, get_categorical_distributions,
    get_target_distribution, get_bivariate_analysis, get_correlation_matrix,
    get_preprocessing_audit, get_paginated_records
)
from services.car_service import get_all_cars, get_car_by_id

api_bp = Blueprint('api', __name__)

# ==========================================
# METADATA & DROPDOWN OPTIONS
# ==========================================
@api_bp.route('/meta/options', methods=['GET'])
def get_meta_options():
    categories = [{'id': k, 'name': v} for k, v in CATEGORY_NAMES.items()]
    brands = [{'id': k, 'name': v} for k, v in BRAND_NAMES.items()]
    models = [{'id': k, 'name': v} for k, v in MODEL_NAMES.items()]
    cities = [{'id': k, 'name': v, 'tier': CITY_TIERS.get(k, 'Standard')} for k, v in CITY_NAMES.items()]
    payment_types = [{'id': k, 'name': v} for k, v in PAYMENT_TYPE_NAMES.items()]
    genders = [{'id': k, 'name': v} for k, v in GENDER_NAMES.items()]
    
    brand_models = {}
    for b_id, m_ids in BRAND_TO_MODELS.items():
        brand_models[b_id] = [{'id': mid, 'name': MODEL_NAMES.get(mid, f"Model {mid}")} for mid in m_ids]
        
    return jsonify({
        'categories': categories,
        'brands': brands,
        'models': models,
        'brand_models': brand_models,
        'cities': cities,
        'payment_types': payment_types,
        'genders': genders
    })

# ==========================================
# DATASET EXPLORER & PREPROCESSING
# ==========================================
@api_bp.route('/dataset/overview', methods=['GET'])
def dataset_overview():
    data = get_dataset_overview()
    return jsonify(data)

@api_bp.route('/dataset/records', methods=['GET'])
def dataset_records():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    sort_by = request.args.get('sort_by', 'Rental_ID')
    sort_dir = request.args.get('sort_dir', 'asc')
    
    filters = {
        'brand': request.args.get('brand'),
        'category': request.args.get('category'),
        'city': request.args.get('city')
    }
    data = get_paginated_records(page, per_page, sort_by, sort_dir, filters)
    return jsonify(data)

@api_bp.route('/dataset/statistics', methods=['GET'])
def dataset_statistics():
    data = get_numerical_statistics()
    return jsonify(data)

@api_bp.route('/dataset/categorical', methods=['GET'])
def dataset_categorical():
    data = get_categorical_distributions()
    return jsonify(data)

@api_bp.route('/preprocessing/audit', methods=['GET'])
def preprocessing_audit():
    data = get_preprocessing_audit()
    return jsonify(data)

# ==========================================
# EXPLORATORY DATA ANALYSIS (EDA)
# ==========================================
@api_bp.route('/eda/price-distribution', methods=['GET'])
def eda_price_distribution():
    bins = int(request.args.get('bins', 15))
    data = get_target_distribution(bins)
    return jsonify(data)

@api_bp.route('/eda/bivariate', methods=['GET'])
def eda_bivariate():
    data = get_bivariate_analysis()
    return jsonify(data)

@api_bp.route('/eda/correlation', methods=['GET'])
def eda_correlation():
    data = get_correlation_matrix()
    return jsonify(data)

# ==========================================
# MACHINE LEARNING ALGORITHMS & EVALUATION
# ==========================================
@api_bp.route('/models/metrics', methods=['GET'])
def models_metrics():
    metrics = get_models_metrics()
    return jsonify(metrics)

@api_bp.route('/models/train', methods=['POST'])
def train_models():
    metrics = train_and_evaluate_models(force_retrain=True)
    return jsonify({'status': 'success', 'message': 'Models retrained successfully', 'metrics': metrics})

@api_bp.route('/models/actual-vs-predicted', methods=['GET'])
def models_actual_vs_predicted():
    sample_size = int(request.args.get('sample_size', 80))
    points = get_actual_vs_predicted(sample_size)
    return jsonify(points)

@api_bp.route('/models/feature-importance', methods=['GET'])
def feature_importance():
    data = get_feature_importances()
    return jsonify(data)

@api_bp.route('/models/linear-regression/equation', methods=['GET'])
def linear_regression_equation():
    data = get_linear_regression_equation()
    return jsonify(data)

@api_bp.route('/models/decision-tree/structure', methods=['GET'])
def decision_tree_structure():
    max_nodes = int(request.args.get('max_nodes', 35))
    data = get_decision_tree_structure(max_nodes)
    return jsonify(data)

@api_bp.route('/models/decision-tree/trace', methods=['POST'])
def decision_tree_trace():
    payload = request.get_json(force=True)
    result = trace_decision_path(payload)
    return jsonify(result)

@api_bp.route('/models/random-forest/breakdown', methods=['POST'])
def random_forest_breakdown():
    payload = request.get_json(force=True)
    result = get_random_forest_trees_breakdown(payload)
    return jsonify(result)

# ==========================================
# PREDICTIONS & SIMULATOR
# ==========================================
@api_bp.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    model_name = data.get('model_name', 'Random Forest')
    
    # Required inference features
    input_features = {
        'Rental_Duration': float(data.get('Rental_Duration', 3)),
        'Car_Category': int(data.get('Car_Category', 1)),
        'Brand': int(data.get('Brand', 0)),
        'Model': int(data.get('Model', 0)),
        'City': int(data.get('City', 0)),
        'Customer_Age': int(data.get('Customer_Age', 30)),
        'Gender': int(data.get('Gender', 1)),
        'Payment_Type': int(data.get('Payment_Type', 0))
    }
    
    pred_res = predict_single(input_features, model_name)
    
    # Save to SQLite history
    save_flag = data.get('save_to_history', True)
    pred_id = None
    if save_flag:
        history_record = {
            'rental_duration': input_features['Rental_Duration'],
            'car_category': input_features['Car_Category'],
            'brand': input_features['Brand'],
            'model': input_features['Model'],
            'city': input_features['City'],
            'customer_age': input_features['Customer_Age'],
            'gender': input_features['Gender'],
            'payment_type': input_features['Payment_Type'],
            'predicted_price': pred_res['predicted_price_index'],
            'estimated_price_usd': pred_res['estimated_price_usd'],
            'model_used': model_name,
            'notes': data.get('notes', '')
        }
        pred_id = save_prediction(history_record)
        
    pred_res['prediction_id'] = pred_id
    pred_res['input'] = input_features
    return jsonify(pred_res)

@api_bp.route('/predict/compare', methods=['POST'])
def predict_compare():
    data = request.get_json(force=True)
    
    input_features = {
        'Rental_Duration': float(data.get('Rental_Duration', 3)),
        'Car_Category': int(data.get('Car_Category', 1)),
        'Brand': int(data.get('Brand', 0)),
        'Model': int(data.get('Model', 0)),
        'City': int(data.get('City', 0)),
        'Customer_Age': int(data.get('Customer_Age', 30)),
        'Gender': int(data.get('Gender', 1)),
        'Payment_Type': int(data.get('Payment_Type', 0))
    }
    
    comparison = predict_multi_comparison(input_features)
    
    # Save default (Random Forest) to history
    save_flag = data.get('save_to_history', True)
    pred_id = None
    if save_flag:
        rf_res = comparison['Random Forest']
        history_record = {
            'rental_duration': input_features['Rental_Duration'],
            'car_category': input_features['Car_Category'],
            'brand': input_features['Brand'],
            'model': input_features['Model'],
            'city': input_features['City'],
            'customer_age': input_features['Customer_Age'],
            'gender': input_features['Gender'],
            'payment_type': input_features['Payment_Type'],
            'predicted_price': rf_res['predicted_price_index'],
            'estimated_price_usd': rf_res['estimated_price_usd'],
            'model_used': 'Random Forest (Comparison Session)',
            'notes': 'Multi-model evaluation comparison'
        }
        pred_id = save_prediction(history_record)
        
    return jsonify({
        'prediction_id': pred_id,
        'input': input_features,
        'comparison': comparison
    })

# ==========================================
# PREDICTION HISTORY (SQLITE)
# ==========================================
@api_bp.route('/history', methods=['GET'])
def get_history():
    limit = int(request.args.get('limit', 50))
    offset = int(request.args.get('offset', 0))
    search = request.args.get('search')
    
    history_data = get_predictions(limit=limit, offset=offset, search=search)
    return jsonify(history_data)

@api_bp.route('/history/<int:pred_id>', methods=['DELETE'])
def remove_history_item(pred_id):
    success = delete_prediction(pred_id)
    if success:
        return jsonify({'status': 'success', 'message': f'Prediction {pred_id} deleted'})
    return jsonify({'status': 'error', 'message': 'Prediction not found'}), 404

@api_bp.route('/history/clear', methods=['POST'])
def clear_history():
    clear_predictions()
    return jsonify({'status': 'success', 'message': 'Prediction history cleared'})

# ==========================================
# VEHICLE CATALOG & DETAILS
# ==========================================
@api_bp.route('/cars', methods=['GET'])
def list_cars():
    cars = get_all_cars()
    return jsonify(cars)

@api_bp.route('/cars/<int:model_id>', methods=['GET'])
def car_details(model_id):
    car = get_car_by_id(model_id)
    if car:
        return jsonify(car)
    return jsonify({'status': 'error', 'message': 'Vehicle not found'}), 404
