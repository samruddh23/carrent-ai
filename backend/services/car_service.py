import pandas as pd
from config import CSV_PATH, BRAND_NAMES, MODEL_NAMES, CATEGORY_NAMES, CITY_NAMES

# Curated vehicle specs and photography for each model
VEHICLE_CATALOG = {
    0: {
        "model_id": 0, "brand_id": 0, "default_category": 0,
        "name": "Toyota Corolla", "year": 2023, "fuel": "Gasoline", "transmission": "Automatic",
        "seats": 5, "doors": 4, "hp": 169, "mpg": 35, "luggage": "2 Large Bags",
        "image_url": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80",
        "description": "Reliable, fuel-efficient compact sedan ideal for city commutes and weekend trips."
    },
    1: {
        "model_id": 1, "brand_id": 4, "default_category": 3,
        "name": "Mercedes-Benz C-Class", "year": 2024, "fuel": "Mild Hybrid", "transmission": "9G-TRONIC",
        "seats": 5, "doors": 4, "hp": 255, "mpg": 28, "luggage": "3 Large Bags",
        "image_url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
        "description": "Sophisticated styling, premium leather cabin, and state-of-the-art MBUX infotainment."
    },
    2: {
        "model_id": 2, "brand_id": 0, "default_category": 1,
        "name": "Toyota Camry", "year": 2023, "fuel": "Gasoline / Hybrid", "transmission": "Direct Shift 8-Speed",
        "seats": 5, "doors": 4, "hp": 203, "mpg": 32, "luggage": "3 Large Bags",
        "image_url": "https://images.unsplash.com/photo-1626084922123-57a552504975?auto=format&fit=crop&w=800&q=80",
        "description": "Smooth highway cruiser offering supreme comfort, spacious rear legroom, and refined acoustics."
    },
    3: {
        "model_id": 3, "brand_id": 1, "default_category": 0,
        "name": "Hyundai Elantra", "year": 2023, "fuel": "Gasoline", "transmission": "Smartstream IVT",
        "seats": 5, "doors": 4, "hp": 147, "mpg": 37, "luggage": "2 Bags",
        "image_url": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
        "description": "Sharp parametric jewel styling with class-leading digital cockpit and tech features."
    },
    4: {
        "model_id": 4, "brand_id": 4, "default_category": 3,
        "name": "Mercedes-Benz E-Class", "year": 2024, "fuel": "Turbocharged Hybrid", "transmission": "Automatic",
        "seats": 5, "doors": 4, "hp": 375, "mpg": 26, "luggage": "4 Bags",
        "image_url": "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80",
        "description": "The quintessential executive saloon with acoustic glass and executive seat massage."
    },
    5: {
        "model_id": 5, "brand_id": 6, "default_category": 4,
        "name": "Tesla Model 3", "year": 2024, "fuel": "All-Electric", "transmission": "Single-Speed Fixed",
        "seats": 5, "doors": 4, "hp": 283, "mpg": "132 MPGe", "luggage": "2 Bags + Frunk",
        "image_url": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
        "description": "Minimalist all-electric performance with instant torque, Autopilot capability, and supercharging."
    },
    6: {
        "model_id": 6, "brand_id": 6, "default_category": 4,
        "name": "Tesla Model Y", "year": 2024, "fuel": "All-Electric", "transmission": "Dual Motor AWD",
        "seats": 5, "doors": 4, "hp": 384, "mpg": "122 MPGe", "luggage": "4 Bags + Frunk",
        "image_url": "https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?auto=format&fit=crop&w=800&q=80",
        "description": "Spacious electric utility vehicle with panoramic glass roof, generous cargo space, and long range."
    },
    7: {
        "model_id": 7, "brand_id": 5, "default_category": 1,
        "name": "Audi A4", "year": 2023, "fuel": "TFSI Gasoline", "transmission": "7-Speed S tronic",
        "seats": 5, "doors": 4, "hp": 261, "mpg": 29, "luggage": "3 Bags",
        "image_url": "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80",
        "description": "Precision German engineering featuring Audi quattro all-wheel drive and Virtual Cockpit."
    },
    8: {
        "model_id": 8, "brand_id": 6, "default_category": 4,
        "name": "Tesla Model S", "year": 2024, "fuel": "All-Electric Tri-Motor", "transmission": "Direct Drive",
        "seats": 5, "doors": 5, "hp": 670, "mpg": "120 MPGe", "luggage": "4 Large Bags",
        "image_url": "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
        "description": "Supercar-level acceleration wrapped in a luxury electric liftback with ultra-long range."
    },
    9: {
        "model_id": 9, "brand_id": 5, "default_category": 3,
        "name": "Audi A6", "year": 2023, "fuel": "V6 Turbo Hybrid", "transmission": "S tronic Dual-Clutch",
        "seats": 5, "doors": 4, "hp": 335, "mpg": 24, "luggage": "3 Bags",
        "image_url": "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
        "description": "Stunning matrix LED headlights, dual touchscreens, and effortless highway cruising dynamics."
    },
    10: {
        "model_id": 10, "brand_id": 5, "default_category": 2,
        "name": "Audi Q5", "year": 2023, "fuel": "Gasoline Turbo", "transmission": "7-Speed Automatic",
        "seats": 5, "doors": 5, "hp": 261, "mpg": 25, "luggage": "4 Bags",
        "image_url": "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80",
        "description": "Premium midsize luxury crossover combining agility, adaptive suspension, and luxury trim."
    },
    11: {
        "model_id": 11, "brand_id": 3, "default_category": 1,
        "name": "BMW 3 Series", "year": 2024, "fuel": "TwinPower Turbo", "transmission": "8-Speed Steptronic",
        "seats": 5, "doors": 4, "hp": 255, "mpg": 30, "luggage": "3 Bags",
        "image_url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
        "description": "The benchmark sports sedan featuring 50:50 weight distribution and dynamic handling."
    },
    12: {
        "model_id": 12, "brand_id": 2, "default_category": 0,
        "name": "Honda Civic", "year": 2023, "fuel": "Gasoline", "transmission": "CVT",
        "seats": 5, "doors": 4, "hp": 158, "mpg": 36, "luggage": "2 Bags",
        "image_url": "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80",
        "description": "Sporty, responsive handling with high resale value and bulletproof reliability."
    },
    13: {
        "model_id": 13, "brand_id": 2, "default_category": 2,
        "name": "Honda CR-V", "year": 2024, "fuel": "Gasoline / Hybrid", "transmission": "E-CVT",
        "seats": 5, "doors": 5, "hp": 204, "mpg": 34, "luggage": "4 Large Bags",
        "image_url": "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=800&q=80",
        "description": "Versatile compact SUV with massive cargo volume and class-leading safety scores."
    },
    14: {
        "model_id": 14, "brand_id": 4, "default_category": 2,
        "name": "Mercedes-Benz GLC", "year": 2024, "fuel": "Turbo Mild Hybrid", "transmission": "9-Speed Automatic",
        "seats": 5, "doors": 5, "hp": 255, "mpg": 26, "luggage": "3 Large Bags",
        "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
        "description": "Compact luxury crossover providing silky ride comfort and off-road driving modes."
    },
    15: {
        "model_id": 15, "brand_id": 3, "default_category": 3,
        "name": "BMW 5 Series", "year": 2024, "fuel": "Inline-6 Mild Hybrid", "transmission": "8-Speed Sport Auto",
        "seats": 5, "doors": 4, "hp": 375, "mpg": 27, "luggage": "3 Bags",
        "image_url": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80",
        "description": "Executive luxury express equipped with BMW Curved Display and active lane steering."
    },
    16: {
        "model_id": 16, "brand_id": 1, "default_category": 2,
        "name": "Hyundai Tucson", "year": 2023, "fuel": "Gasoline / Hybrid", "transmission": "8-Speed Automatic",
        "seats": 5, "doors": 5, "hp": 187, "mpg": 29, "luggage": "3 Bags",
        "image_url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
        "description": "Futuristic exterior design with hidden daytime running lights and expansive quiet cabin."
    },
    17: {
        "model_id": 17, "brand_id": 3, "default_category": 2,
        "name": "BMW X5", "year": 2024, "fuel": "TwinPower Turbo V6", "transmission": "8-Speed Steptronic",
        "seats": 5, "doors": 5, "hp": 375, "mpg": 25, "luggage": "4 Bags",
        "image_url": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
        "description": "Sports Activity Vehicle offering majestic commanding road presence and xDrive AWD."
    },
    18: {
        "model_id": 18, "brand_id": 1, "default_category": 2,
        "name": "Hyundai Santa Fe", "year": 2024, "fuel": "Turbo Gasoline", "transmission": "8-Speed Wet Dual Clutch",
        "seats": 6, "doors": 5, "hp": 277, "mpg": 24, "luggage": "4 Bags",
        "image_url": "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80",
        "description": "Bold boxy adventure SUV with reclining captain chairs and terrace-style tailgate."
    }
}

def get_all_cars():
    """Returns all 19 catalog cars enriched with dataset statistics."""
    df = pd.read_csv(CSV_PATH)
    
    # Calculate dataset stats per model
    stats = df.groupby('Model').agg({
        'Total_Paid': ['mean', 'min', 'max', 'count'],
        'Rental_Duration': 'mean'
    }).reset_index()
    
    stats.columns = ['model_id', 'mean_price', 'min_price', 'max_price', 'rental_count', 'avg_duration']
    stats_dict = stats.set_index('model_id').to_dict(orient='index')
    
    cars = []
    for model_id, car_data in VEHICLE_CATALOG.items():
        car = dict(car_data)
        car['brand_name'] = BRAND_NAMES.get(car['brand_id'], "Unknown")
        car['category_name'] = CATEGORY_NAMES.get(car['default_category'], "Standard")
        
        m_stat = stats_dict.get(model_id, {})
        car['dataset_avg_price_index'] = round(float(m_stat.get('mean_price', 0.3)), 4)
        car['dataset_min_price_index'] = round(float(m_stat.get('min_price', 0.05)), 4)
        car['dataset_max_price_index'] = round(float(m_stat.get('max_price', 0.95)), 4)
        car['dataset_rental_count'] = int(m_stat.get('rental_count', 0))
        car['dataset_avg_duration_days'] = round(float(m_stat.get('avg_duration', 5.0)), 1)
        
        # Approximate daily estimate for portal preview ($35 to $120/day and ₹2,500 to ₹9,500/day)
        estimated_daily_usd = round(40.0 + (car['dataset_avg_price_index'] * 120.0), 2)
        estimated_daily_inr = int(round(2200.0 + (car['dataset_avg_price_index'] * 7200.0), -1))
        car['estimated_daily_rate_usd'] = estimated_daily_usd
        car['estimated_daily_rate_inr'] = estimated_daily_inr
        
        cars.append(car)
        
    return cars

def get_car_by_id(model_id):
    cars = get_all_cars()
    for c in cars:
        if c['model_id'] == int(model_id):
            return c
    return None
