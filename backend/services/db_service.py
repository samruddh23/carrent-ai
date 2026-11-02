import sqlite3
import os
from config import DB_PATH, CATEGORY_NAMES, BRAND_NAMES, MODEL_NAMES, CITY_NAMES, PAYMENT_TYPE_NAMES, GENDER_NAMES

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        rental_duration REAL NOT NULL,
        car_category INTEGER NOT NULL,
        brand INTEGER NOT NULL,
        model INTEGER NOT NULL,
        city INTEGER NOT NULL,
        customer_age INTEGER NOT NULL,
        gender INTEGER NOT NULL,
        payment_type INTEGER NOT NULL,
        predicted_price REAL NOT NULL,
        estimated_price_usd REAL NOT NULL,
        model_used TEXT NOT NULL,
        notes TEXT
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS model_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name TEXT NOT NULL,
        mae REAL NOT NULL,
        mse REAL NOT NULL,
        rmse REAL NOT NULL,
        r2 REAL NOT NULL,
        trained_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()

def save_prediction(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO predictions (
        rental_duration, car_category, brand, model, city,
        customer_age, gender, payment_type, predicted_price,
        estimated_price_usd, model_used, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['rental_duration'],
        data['car_category'],
        data['brand'],
        data['model'],
        data['city'],
        data['customer_age'],
        data['gender'],
        data['payment_type'],
        data['predicted_price'],
        data.get('estimated_price_usd', 0.0),
        data['model_used'],
        data.get('notes', '')
    ))
    
    pred_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return pred_id

def get_predictions(limit=100, offset=0, search=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM predictions"
    params = []
    
    if search:
        query += " WHERE model_used LIKE ? OR notes LIKE ?"
        params.extend([f"%{search}%", f"%{search}%"])
        
    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    # Total count
    count_query = "SELECT COUNT(*) as count FROM predictions"
    if search:
        count_query += " WHERE model_used LIKE ? OR notes LIKE ?"
        cursor.execute(count_query, [f"%{search}%", f"%{search}%"])
    else:
        cursor.execute(count_query)
    total_count = cursor.fetchone()['count']
    
    results = []
    for row in rows:
        item = dict(row)
        # Enrich with human-readable labels
        item['category_name'] = CATEGORY_NAMES.get(item['car_category'], f"Category {item['car_category']}")
        item['brand_name'] = BRAND_NAMES.get(item['brand'], f"Brand {item['brand']}")
        item['model_name'] = MODEL_NAMES.get(item['model'], f"Model {item['model']}")
        item['city_name'] = CITY_NAMES.get(item['city'], f"City {item['city']}")
        item['gender_name'] = GENDER_NAMES.get(item['gender'], f"Gender {item['gender']}")
        item['payment_type_name'] = PAYMENT_TYPE_NAMES.get(item['payment_type'], f"Payment {item['payment_type']}")
        results.append(item)
        
    conn.close()
    return {'items': results, 'total': total_count}

def delete_prediction(pred_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM predictions WHERE id = ?", (pred_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def clear_predictions():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM predictions")
    conn.commit()
    conn.close()
    return True
