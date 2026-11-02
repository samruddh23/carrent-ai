# CarRent AI – Smart Car Rental Price Prediction & Data Mining Analytics System

> **Academic DMBI (Data Mining and Business Intelligence) Capstone Mini-Project**  
> Developed with real Scikit-learn regression models, zero data leakage, SQLite persistence, and interactive Viva explanation tools.

---

## 🌟 Executive Summary

**CarRent AI** is a full-stack, machine-learning-powered web platform that bridges consumer-facing car rental exploration with an interactive academic **Data Mining Laboratory**.

Unlike mockups or static UI templates, **every major button, form, chart, metric, and tree traversal is driven by real Scikit-learn pipelines and actual transaction records**.

### The Two Application Modes
1. **User Portal**: Designed for consumers looking to explore vehicles, inspect technical specifications, calculate custom rental rates, and track prediction history.
2. **Data Mining Laboratory**: Designed for professors, examiners, and evaluators to inspect CRISP-DM methodology, explore raw dataset distributions, verify target leakage elimination, examine OLS regression equations, trace real-time Decision Tree branch decisions, and analyze Random Forest ensemble variances.

---

## 📊 Dataset Verification & Audit Report

| Metric / Dimension | Verified Audit Value |
| :--- | :--- |
| **Primary Dataset** | `Cleaned_Car_Rental_Dataset_2026.csv` |
| **Total Verified Records** | **1,914 transactions** |
| **Total Attributes** | **17 columns** |
| **Missing Values (Nulls)** | **0 (Zero nulls across all 17 columns)** |
| **Duplicates** | **0 duplicate rows** |
| **Target Variable** | `Total_Paid` (Normalized rental index: `0.00` to `1.00`) |
| **Target Mean / Std** | Mean = `0.3151`, Std = `0.2232` |
| **Train / Test Partition** | **80% Training (1,531 rows) : 20% Held-Out Testing (383 rows)** (`random_state=42`) |

### Critical Target Leakage Elimination
During exploratory feature correlation auditing, two columns displayed artificial near-perfect correlations with the target:
- `Base_Amount`: $r = 0.991$
- `Tax_Amount`: $r = 0.999$

**Reason**: In car rental accounting, `Total_Paid = Base_Amount - Discount_Amount + Tax_Amount`. Using post-calculation billing outputs as input features would cause the model to merely learn billing arithmetic rather than estimating price from vehicle attributes.  
**Resolution**: `Base_Amount`, `Tax_Amount`, and identifiers (`Rental_ID`, `Customer_ID`, `Car_ID`) are **strictly excluded** from inference inputs.

### Verified Inference Features (8 Attributes)
1. `Rental_Duration` (1 to 14 days)
2. `Car_Category` (0: Compact, 1: Sedan, 2: SUV, 3: Luxury, 4: Electric)
3. `Brand` (Toyota, Hyundai, Honda, BMW, Mercedes-Benz, Audi, Tesla)
4. `Model` (19 verified models partitioned strictly by Brand)
5. `City` (8 major metropolitan areas)
6. `Customer_Age` (21 to 60 years)
7. `Gender` (0: Female, 1: Male)
8. `Payment_Type` (Credit Card, Debit Card, Net Banking, Digital Wallet, Corporate)

---

## 🧠 Machine Learning Model Evaluation (Held-Out Test Set: 383 Samples)

All metrics are computed on the held-out 20% test partition:

| Model Architecture | MAE | MSE | RMSE | Coefficient of Determination ($R^2$) |
| :--- | :---: | :---: | :---: | :---: |
| **Decision Tree Regressor** (`max_depth=7`) | **0.0564** | **0.0066** | **0.0811** | **85.45% ($R^2 = 0.8545$)** |
| **Random Forest Regressor** (60 Estimators) | **0.0563** | **0.0068** | **0.0823** | **85.01% ($R^2 = 0.8501$)** |
| **Linear Regression (OLS)** (Standardized) | **0.0733** | **0.0090** | **0.0949** | **80.07% ($R^2 = 0.8007$)** |

---

## 🏗️ Architecture & Technology Stack

```
carrent-ai/
├── backend/
│   ├── app.py                      # Flask REST API entrypoint & CORS config
│   ├── config.py                   # Verified feature mappings, brands, models, and limits
│   ├── requirements.txt            # Python dependencies (Flask, scikit-learn, pandas, joblib)
│   ├── carrent.db                  # SQLite database for persistent prediction logs
│   ├── data/
│   │   └── Cleaned_Car_Rental_Dataset_2026.csv   # 1,914 transaction records
│   ├── models_store/               # Joblib serialized Scikit-learn pipelines & metrics JSON
│   ├── routes/
│   │   └── api.py                  # All REST endpoints (dataset, eda, models, predict, history)
│   └── services/
│       ├── ml_service.py           # Training, evaluation, tree traversal, ensemble breakdown
│       ├── eda_service.py          # Summary statistics, bivariate analyses, histograms
│       ├── db_service.py           # SQLite CRUD operations
│       └── car_service.py          # Catalog of 19 models with photos & specifications
│
└── frontend/
    ├── package.json                # React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios
    ├── vite.config.js              # Vite server & proxy configuration
    ├── tailwind.config.js          # Automotive slate/indigo color palettes
    └── src/
        ├── App.jsx                 # Client-side routing (React Router DOM)
        ├── components/
        │   ├── Navbar.jsx          # Mode switcher (User Portal vs. Data Mining Lab)
        │   ├── Footer.jsx          # Academic citations & dataset disclosures
        │   └── VivaAccordion.jsx   # Interactive viva defence explanations & math formulas
        ├── pages/
        │   ├── HomePage.jsx        # Landing hero, KPI cards, and featured cars
        │   ├── ExploreCarsPage.jsx # Fleet explorer with brand/category filters
        │   ├── CarDetailsPage.jsx  # Detailed vehicle specs & historical benchmarks
        │   ├── PredictionPage.jsx  # Form with cascading dropdowns & multi-model comparison
        │   ├── HistoryPage.jsx     # SQLite prediction log table with search & deletion
        │   └── DataMiningLab.jsx   # Complete 10-module academic lab with charts & simulators
        └── services/
            └── api.js              # Centralized Axios client for Flask API
```

---

## 🚀 Step-by-Step Execution Guide

### Prerequisites
- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)

### 1. Launch the Backend Server (Port 5000)

```powershell
# Open terminal 1
cd d:\Projects\carrent-ai\backend
pip install -r requirements.txt
python app.py
```

*The backend will automatically initialize `carrent.db` and train/load the 3 machine learning pipelines.*  
Backend will be live at: **`http://localhost:5000`**

### 2. Launch the Frontend Application (Port 5173)

```powershell
# Open terminal 2
cd d:\Projects\carrent-ai\frontend
npm install
npm run dev
```

Frontend will be live at: **`http://localhost:5173`**

---

## 🧪 Data Mining Laboratory Modules (Academic Evaluation Guide)

The Data Mining Lab contains 10 interactive sections accessible via the sidebar:

1. **Overview & Methodology**: High-level CRISP-DM flowchart and verified dataset statistics.
2. **Dataset Explorer**: Server-side paginated table with dynamic filters by Brand, Category, and City. Shows null checks.
3. **Data Preprocessing**: Full audit of data cleaning, train/test partition (80:20), and target leakage elimination proof.
4. **Exploratory Data Analysis**: Recharts histogram for `Total_Paid`, boxplot 5-number summary, bivariate price by vehicle category, and duration trends.
5. **Linear Regression Lab**: Displays the exact mathematical formula preview, intercept ($\beta_0 = 0.3843$), and ranked standardized feature weights ($|\beta_j|$).
6. **Decision Tree Regressor**: Interactive step-by-step decision traversal tracer. Shows which binary condition was tested, sample values, and leaf convergence.
7. **Random Forest Ensemble**: Distribution of individual predictions across all 60 trees, displaying ensemble mean and empirical variance.
8. **Model Evaluation & Comparison**: Side-by-side comparison table of MAE, MSE, RMSE, and $R^2$, plus Actual vs. Predicted scatter plot.
9. **Feature Importance**: Bar chart comparing Gini/variance reduction importance against OLS coefficient magnitude.
10. **Prediction Simulator**: Live interactive sandbox allowing students and evaluators to manipulate trip parameters and inspect immediate pipeline outputs.

---

## 🎓 Academic Viva Cheat-Sheet

- **Q: Why exclude Base_Amount and Tax_Amount?**  
  *A: They have correlation coefficients $r = 0.991$ and $r = 0.999$ because total paid is computed after rental completion. Retaining them causes target leakage.*
- **Q: What loss function was minimized?**  
  *A: Linear Regression minimizes Ordinary Least Squares (Residual Sum of Squares). Decision Trees and Random Forests minimize Variance / Mean Squared Error at each binary split.*
- **Q: How are categorical variables handled?**  
  *A: Categoricals (`Brand`, `Model`, `City`, `Car_Category`, `Gender`, `Payment_Type`) are processed with `OneHotEncoder(handle_unknown='ignore')` to avoid imposing artificial ordinal scales.*
- **Q: Why does Decision Tree / Random Forest outperform Linear Regression?**  
  *A: Car rental pricing contains non-linear interactions (e.g., luxury SUV in a high-demand metro vs. economy compact in a small city). Tree partitions capture non-linear step-function boundaries.*

---

## ⚖️ License & Academic Integrity
This project is built strictly for academic Data Mining and Business Intelligence (DMBI) coursework. All statistics, models, and predictions are backed by actual data science code.
