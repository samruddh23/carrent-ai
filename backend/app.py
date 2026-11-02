import os
from flask import Flask, jsonify
from flask_cors import CORS
from services.db_service import init_db
from services.ml_service import train_and_evaluate_models
from routes.api import api_bp

app = Flask(__name__)
# Enable CORS for all routes so frontend on any port can communicate seamlessly
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register Blueprint
app.register_blueprint(api_bp, url_prefix='/api')

@app.route('/')
def index():
    return jsonify({
        'application': 'CarRent AI - Smart Car Rental Price Prediction & Data Mining Analytics System',
        'mode': 'Flask REST API Backend',
        'status': 'Operational',
        'version': '1.0.0',
        'endpoints': {
            'metadata': '/api/meta/options',
            'dataset_overview': '/api/dataset/overview',
            'dataset_records': '/api/dataset/records',
            'preprocessing_audit': '/api/preprocessing/audit',
            'eda_distribution': '/api/eda/price-distribution',
            'eda_bivariate': '/api/eda/bivariate',
            'eda_correlation': '/api/eda/correlation',
            'model_metrics': '/api/models/metrics',
            'predict': '/api/predict',
            'predict_compare': '/api/predict/compare',
            'prediction_history': '/api/history',
            'catalog_cars': '/api/cars'
        }
    })

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Resource not found', 'code': 404}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error', 'message': str(e), 'code': 500}), 500

if __name__ == '__main__':
    print("Initializing SQLite Database...")
    init_db()
    print("Checking / training ML models...")
    train_and_evaluate_models()
    print("Starting CarRent AI Backend on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
