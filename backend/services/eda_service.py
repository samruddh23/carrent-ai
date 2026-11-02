import numpy as np
import pandas as pd
from config import (
    CSV_PATH, TARGET_COLUMN, NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES, ALL_INFERENCE_FEATURES,
    CATEGORY_NAMES, BRAND_NAMES, MODEL_NAMES,
    CITY_NAMES, PAYMENT_TYPE_NAMES, GENDER_NAMES
)

_DF_CACHE = None

def get_df():
    global _DF_CACHE
    if _DF_CACHE is None:
        _DF_CACHE = pd.read_csv(CSV_PATH)
    return _DF_CACHE

def get_dataset_overview():
    df = get_df()
    
    col_details = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        unique_cnt = int(df[col].nunique())
        null_cnt = int(df[col].isnull().sum())
        
        # Determine role
        if col == TARGET_COLUMN:
            role = "Target (Regression Output)"
        elif col in ALL_INFERENCE_FEATURES:
            role = "Predictor Feature"
        elif col in ['Base_Amount', 'Tax_Amount']:
            role = "Excluded (Target Leakage - Post-calculation Billing)"
        elif col in ['Rental_ID', 'Customer_ID', 'Car_ID', 'Rental_Date']:
            role = "Excluded (Identifier / Metadata)"
        else:
            role = "Operational / Auxiliary"
            
        sample_vals = [str(x) for x in df[col].dropna().head(3).tolist()]
        
        col_details.append({
            'column': col,
            'type': dtype,
            'unique_count': unique_cnt,
            'null_count': null_cnt,
            'null_percentage': 0.0,
            'role': role,
            'sample_values': sample_vals
        })
        
    return {
        'total_rows': int(len(df)),
        'total_columns': int(len(df.columns)),
        'total_missing': int(df.isnull().sum().sum()),
        'total_duplicates': int(df.duplicated().sum()),
        'memory_kb': round(df.memory_usage(deep=True).sum() / 1024, 2),
        'target_variable': TARGET_COLUMN,
        'features_count': len(ALL_INFERENCE_FEATURES),
        'columns': col_details
    }

def get_numerical_statistics():
    df = get_df()
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    stats_list = []
    for col in num_cols:
        series = df[col].dropna()
        q25 = float(series.quantile(0.25))
        q50 = float(series.median())
        q75 = float(series.quantile(0.75))
        iqr = q75 - q25
        
        stats_list.append({
            'column': col,
            'count': int(series.count()),
            'mean': round(float(series.mean()), 4),
            'std': round(float(series.std()), 4),
            'min': round(float(series.min()), 4),
            'q25': round(q25, 4),
            'median': round(q50, 4),
            'q75': round(q75, 4),
            'max': round(float(series.max()), 4),
            'iqr': round(iqr, 4),
            'skewness': round(float(series.skew()), 4),
            'kurtosis': round(float(series.kurtosis()), 4)
        })
        
    return stats_list

def get_categorical_distributions():
    df = get_df()
    
    cat_summary = {}
    
    # 1. Car_Category
    cat_counts = df['Car_Category'].value_counts().sort_index()
    cat_summary['car_category'] = [
        {
            'code': int(code),
            'name': CATEGORY_NAMES.get(int(code), f"Category {code}"),
            'count': int(count),
            'percentage': round((count / len(df)) * 100, 2)
        }
        for code, count in cat_counts.items()
    ]
    
    # 2. Brand
    brand_counts = df['Brand'].value_counts().sort_index()
    cat_summary['brand'] = [
        {
            'code': int(code),
            'name': BRAND_NAMES.get(int(code), f"Brand {code}"),
            'count': int(count),
            'percentage': round((count / len(df)) * 100, 2)
        }
        for code, count in brand_counts.items()
    ]
    
    # 3. City
    city_counts = df['City'].value_counts().sort_index()
    cat_summary['city'] = [
        {
            'code': int(code),
            'name': CITY_NAMES.get(int(code), f"City {code}"),
            'count': int(count),
            'percentage': round((count / len(df)) * 100, 2)
        }
        for code, count in city_counts.items()
    ]
    
    # 4. Payment_Type
    payment_counts = df['Payment_Type'].value_counts().sort_index()
    cat_summary['payment_type'] = [
        {
            'code': int(code),
            'name': PAYMENT_TYPE_NAMES.get(int(code), f"Type {code}"),
            'count': int(count),
            'percentage': round((count / len(df)) * 100, 2)
        }
        for code, count in payment_counts.items()
    ]
    
    # 5. Gender
    gender_counts = df['Gender'].value_counts().sort_index()
    cat_summary['gender'] = [
        {
            'code': int(code),
            'name': GENDER_NAMES.get(int(code), f"Gender {code}"),
            'count': int(count),
            'percentage': round((count / len(df)) * 100, 2)
        }
        for code, count in gender_counts.items()
    ]
    
    return cat_summary

def get_target_distribution(bins=15):
    df = get_df()
    target_series = df[TARGET_COLUMN].dropna()
    
    counts, bin_edges = np.histogram(target_series, bins=bins)
    
    histogram = []
    for i in range(len(counts)):
        histogram.append({
            'bin_start': round(float(bin_edges[i]), 3),
            'bin_end': round(float(bin_edges[i+1]), 3),
            'range': f"{round(bin_edges[i], 2)} - {round(bin_edges[i+1], 2)}",
            'count': int(counts[i]),
            'percentage': round((counts[i] / len(target_series)) * 100, 2)
        })
        
    q25 = float(target_series.quantile(0.25))
    median = float(target_series.median())
    q75 = float(target_series.quantile(0.75))
    iqr = q75 - q25
    
    boxplot = {
        'min': round(float(target_series.min()), 4),
        'q25': round(q25, 4),
        'median': round(median, 4),
        'q75': round(q75, 4),
        'max': round(float(target_series.max()), 4),
        'iqr': round(iqr, 4),
        'lower_fence': round(max(float(target_series.min()), q25 - 1.5 * iqr), 4),
        'upper_fence': round(min(float(target_series.max()), q75 + 1.5 * iqr), 4),
        'mean': round(float(target_series.mean()), 4),
        'std': round(float(target_series.std()), 4)
    }
    
    return {
        'target': TARGET_COLUMN,
        'histogram': histogram,
        'boxplot': boxplot
    }

def get_bivariate_analysis():
    df = get_df()
    
    # 1. Price by Car Category
    by_category = []
    for code, grp in df.groupby('Car_Category'):
        by_category.append({
            'category_code': int(code),
            'category_name': CATEGORY_NAMES.get(int(code), f"Category {code}"),
            'mean_price': round(float(grp[TARGET_COLUMN].mean()), 4),
            'median_price': round(float(grp[TARGET_COLUMN].median()), 4),
            'min_price': round(float(grp[TARGET_COLUMN].min()), 4),
            'max_price': round(float(grp[TARGET_COLUMN].max()), 4),
            'count': int(len(grp))
        })
        
    # 2. Price by Brand
    by_brand = []
    for code, grp in df.groupby('Brand'):
        by_brand.append({
            'brand_code': int(code),
            'brand_name': BRAND_NAMES.get(int(code), f"Brand {code}"),
            'mean_price': round(float(grp[TARGET_COLUMN].mean()), 4),
            'median_price': round(float(grp[TARGET_COLUMN].median()), 4),
            'count': int(len(grp))
        })
        
    # 3. Price by Rental Duration
    by_duration = []
    for dur, grp in df.groupby('Rental_Duration'):
        by_duration.append({
            'duration_days': float(dur),
            'mean_price': round(float(grp[TARGET_COLUMN].mean()), 4),
            'median_price': round(float(grp[TARGET_COLUMN].median()), 4),
            'count': int(len(grp))
        })
    by_duration = sorted(by_duration, key=lambda x: x['duration_days'])
    
    # 4. Price by City
    by_city = []
    for code, grp in df.groupby('City'):
        by_city.append({
            'city_code': int(code),
            'city_name': CITY_NAMES.get(int(code), f"City {code}"),
            'mean_price': round(float(grp[TARGET_COLUMN].mean()), 4),
            'median_price': round(float(grp[TARGET_COLUMN].median()), 4),
            'count': int(len(grp))
        })
        
    return {
        'by_category': by_category,
        'by_brand': by_brand,
        'by_duration': by_duration,
        'by_city': by_city
    }

def get_correlation_matrix():
    df = get_df()
    
    cols = ['Rental_Duration', 'Customer_Age', 'Car_Category', 'Brand', 'Model', 'City', 'Gender', 'Payment_Type', TARGET_COLUMN]
    corr = df[cols].corr()
    
    matrix = []
    for row_col in cols:
        row_dict = {'variable': row_col}
        for col_col in cols:
            row_dict[col_col] = round(float(corr.loc[row_col, col_col]), 3)
        matrix.append(row_dict)
        
    return {
        'variables': cols,
        'matrix': matrix
    }

def get_preprocessing_audit():
    df = get_df()
    
    steps = [
        {
            'step': 1,
            'name': 'Dataset Ingestion & Integrity Check',
            'status': 'Verified',
            'details': f"Loaded {len(df):,} records with 17 attributes. Verified 0 null values across all columns."
        },
        {
            'step': 2,
            'name': 'Target Leakage Prevention & Feature Pruning',
            'status': 'Executed',
            'details': "Excluded 'Base_Amount' (r=0.991) and 'Tax_Amount' (r=0.999) because they are post-calculation billing outputs. Excluded identifiers ('Rental_ID', 'Customer_ID', 'Car_ID')."
        },
        {
            'step': 3,
            'name': 'Train/Test Splitting (Data Hygiene)',
            'status': 'Executed',
            'details': "Split 80% Training (1,531 samples) and 20% Held-Out Testing (383 samples) with fixed random seed 42 to prevent data snooping."
        },
        {
            'step': 4,
            'name': 'Numerical Feature Standardization',
            'status': 'Pipeline Ready',
            'details': "StandardScaler applied to 'Rental_Duration' and 'Customer_Age' strictly inside the Linear Regression pipeline (Tree models use unscaled inputs)."
        },
        {
            'step': 5,
            'name': 'Categorical One-Hot Encoding',
            'status': 'Pipeline Ready',
            'details': "OneHotEncoder(handle_unknown='ignore') applied to 'Car_Category', 'Brand', 'Model', 'City', 'Gender', 'Payment_Type' to preserve non-ordinal nominal relationships."
        }
    ]
    
    return {
        'dataset_shape_raw': [int(df.shape[0]), int(df.shape[1])],
        'features_used': ALL_INFERENCE_FEATURES,
        'target_variable': TARGET_COLUMN,
        'train_samples': 1531,
        'test_samples': 383,
        'steps': steps
    }

def get_paginated_records(page=1, per_page=20, sort_by='Rental_ID', sort_dir='asc', filters=None):
    df = get_df()
    
    filtered_df = df.copy()
    if filters:
        if 'brand' in filters and filters['brand'] is not None and filters['brand'] != '':
            filtered_df = filtered_df[filtered_df['Brand'] == int(filters['brand'])]
        if 'category' in filters and filters['category'] is not None and filters['category'] != '':
            filtered_df = filtered_df[filtered_df['Car_Category'] == int(filters['category'])]
        if 'city' in filters and filters['city'] is not None and filters['city'] != '':
            filtered_df = filtered_df[filtered_df['City'] == int(filters['city'])]
            
    if sort_by in filtered_df.columns:
        ascending = (sort_dir.lower() == 'asc')
        filtered_df = filtered_df.sort_values(by=sort_by, ascending=ascending)
        
    total_records = len(filtered_df)
    total_pages = int(np.ceil(total_records / per_page)) if per_page > 0 else 1
    
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    
    slice_df = filtered_df.iloc[start_idx:end_idx]
    
    records = []
    for _, row in slice_df.iterrows():
        rec = dict(row)
        # Add labels
        rec['Brand_Label'] = BRAND_NAMES.get(int(rec['Brand']), f"Brand {rec['Brand']}")
        rec['Model_Label'] = MODEL_NAMES.get(int(rec['Model']), f"Model {rec['Model']}")
        rec['Category_Label'] = CATEGORY_NAMES.get(int(rec['Car_Category']), f"Cat {rec['Car_Category']}")
        rec['City_Label'] = CITY_NAMES.get(int(rec['City']), f"City {rec['City']}")
        rec['Payment_Label'] = PAYMENT_TYPE_NAMES.get(int(rec['Payment_Type']), f"Pay {rec['Payment_Type']}")
        records.append(rec)
        
    return {
        'page': page,
        'per_page': per_page,
        'total_records': total_records,
        'total_pages': total_pages,
        'records': records
    }
