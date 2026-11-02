import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
CSV_PATH = os.path.join(DATA_DIR, 'Cleaned_Car_Rental_Dataset_2026.csv')
DB_PATH = os.path.join(BASE_DIR, 'carrent.db')
MODELS_DIR = os.path.join(BASE_DIR, 'models_store')

# Target and Feature Specifications
TARGET_COLUMN = 'Total_Paid'
NUMERICAL_FEATURES = ['Rental_Duration', 'Customer_Age']
CATEGORICAL_FEATURES = ['Car_Category', 'Brand', 'Model', 'City', 'Gender', 'Payment_Type']
ALL_INFERENCE_FEATURES = ['Rental_Duration', 'Car_Category', 'Brand', 'Model', 'City', 'Customer_Age', 'Gender', 'Payment_Type']

# Excluded columns (to prevent target leakage and data snooping)
EXCLUDED_COLUMNS = ['Rental_ID', 'Customer_ID', 'Car_ID', 'Rental_Date', 'Base_Amount', 'Discount_Amount', 'Tax_Amount', 'Rental_Status']

# Domain Human-Readable Mappings
CATEGORY_NAMES = {
    0: "Compact / Economy",
    1: "Executive Sedan",
    2: "Compact / Midsize SUV",
    3: "Premium Luxury",
    4: "Electric / Hybrid"
}

BRAND_NAMES = {
    0: "Toyota",
    1: "Hyundai",
    2: "Honda",
    3: "BMW",
    4: "Mercedes-Benz",
    5: "Audi",
    6: "Tesla"
}

MODEL_NAMES = {
    0: "Corolla",
    1: "C-Class",
    2: "Camry",
    3: "Elantra",
    4: "E-Class",
    5: "Model 3",
    6: "Model Y",
    7: "A4",
    8: "Model S",
    9: "A6",
    10: "Q5",
    11: "3 Series",
    12: "Civic",
    13: "CR-V",
    14: "GLC SUV",
    15: "5 Series",
    16: "Tucson",
    17: "X5",
    18: "Santa Fe"
}

BRAND_TO_MODELS = {
    0: [0, 2],
    1: [3, 16, 18],
    2: [12, 13],
    3: [11, 15, 17],
    4: [1, 4, 14],
    5: [7, 9, 10],
    6: [5, 6, 8]
}

CITY_NAMES = {
    0: "Mumbai (Tier 1 - High Tier Metro)",
    1: "Delhi NCR (Tier 1 - High Tier Capital)",
    2: "Bengaluru (Tier 1 - High Tier Tech Hub)",
    3: "Pune (Tier 2 - Medium Tier Auto Hub)",
    4: "Hyderabad (Tier 2 - Medium Tier Urban)",
    5: "Ahmedabad (Tier 2 - Medium Tier Commercial)",
    6: "Jaipur (Tier 3 - Low / Emerging Tier)",
    7: "Indore (Tier 3 - Low / Emerging Tier)"
}

CITY_TIERS = {
    0: "Tier 1 (High Tier)",
    1: "Tier 1 (High Tier)",
    2: "Tier 1 (High Tier)",
    3: "Tier 2 (Medium Tier)",
    4: "Tier 2 (Medium Tier)",
    5: "Tier 2 (Medium Tier)",
    6: "Tier 3 (Low Tier)",
    7: "Tier 3 (Low Tier)"
}

GENDER_NAMES = {
    0: "Female",
    1: "Male"
}

PAYMENT_TYPE_NAMES = {
    0: "Credit Card",
    1: "Debit Card",
    2: "Net Banking / UPI",
    3: "Digital Wallet",
    4: "Corporate Account"
}

# Currency and Scaling Context
CURRENCY_CODE = "INR (₹) / Normalized Unit"
PRICE_UNIT_LABEL = "Normalized Rental Price Index (0.0 to 1.0)"
ESTIMATED_DAILY_BASE_INR = 1800.0
ESTIMATED_DAILY_MULTIPLIER_INR = 8500.0
ESTIMATED_DAILY_BASE_USD = 25.0
ESTIMATED_DAILY_MULTIPLIER_USD = 110.0
