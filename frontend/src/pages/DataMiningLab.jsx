import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Cpu, Database, Sparkles, BarChart2, GitFork, Layers,
  CheckCircle2, Sliders, RefreshCw, AlertTriangle, ArrowRight,
  TrendingUp, Activity, HelpCircle, ChevronRight, Binary, FileText
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, Cell
} from 'recharts';
import api from '../services/api';
import VivaAccordion from '../components/VivaAccordion';

export default function DataMiningLab() {
  const location = useLocation();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('overview');

  // Load tab from URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Tab 1: Overview
  const [overview, setOverview] = useState(null);
  const [metrics, setMetrics] = useState(null);

  // Tab 2: Dataset Explorer
  const [recordsData, setRecordsData] = useState({ records: [], total_records: 0, total_pages: 1, page: 1 });
  const [page, setPage] = useState(1);
  const [filterBrand, setFilterBrand] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [tableLoading, setTableLoading] = useState(false);

  // Tab 3: Preprocessing
  const [audit, setAudit] = useState(null);

  // Tab 4: EDA
  const [priceDist, setPriceDist] = useState(null);
  const [bivariate, setBivariate] = useState(null);
  const [correlation, setCorrelation] = useState(null);

  // Tab 5: Linear Regression
  const [lrEquation, setLrEquation] = useState(null);

  // Tab 6: Decision Tree
  const [dtStructure, setDtStructure] = useState(null);
  const [dtPath, setDtPath] = useState(null);

  // Tab 7: Random Forest
  const [rfBreakdown, setRfBreakdown] = useState(null);

  // Tab 8: Evaluation & Comparison
  const [actualVsPred, setActualVsPred] = useState([]);

  // Tab 9: Feature Importance
  const [featureImportance, setFeatureImportance] = useState(null);

  // Tab 10: Simulator inputs
  const [simInput, setSimInput] = useState({
    Rental_Duration: 4,
    Car_Category: 2,
    Brand: 1,
    Model: 3,
    City: 0,
    Customer_Age: 32,
    Gender: 1,
    Payment_Type: 0
  });
  const [simResults, setSimResults] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // Retrain state
  const [retraining, setRetraining] = useState(false);
  const [retrainMsg, setRetrainMsg] = useState(null);

  // Initial Fetch
  useEffect(() => {
    async function loadInitial() {
      try {
        const [overviewRes, metricsRes, auditRes, priceRes, bivarRes, corrRes, lrRes, dtStructRes, featRes] = await Promise.all([
          api.getDatasetOverview(),
          api.getModelMetrics(),
          api.getPreprocessingAudit(),
          api.getPriceDistribution(15),
          api.getBivariateAnalysis(),
          api.getCorrelationMatrix(),
          api.getLinearRegressionEquation(),
          api.getDecisionTreeStructure(30),
          api.getFeatureImportance()
        ]);
        setOverview(overviewRes);
        setMetrics(metricsRes);
        setAudit(auditRes);
        setPriceDist(priceRes);
        setBivariate(bivarRes);
        setCorrelation(corrRes);
        setLrEquation(lrRes);
        setDtStructure(dtStructRes);
        setFeatureImportance(featRes);
      } catch (err) {
        console.error("Lab initial load error:", err);
      }
    }
    loadInitial();
  }, []);

  // Fetch paginated dataset records
  useEffect(() => {
    async function fetchTable() {
      setTableLoading(true);
      try {
        const res = await api.getDatasetRecords({
          page,
          per_page: 15,
          brand: filterBrand,
          category: filterCategory,
          city: filterCity
        });
        setRecordsData(res);
      } catch (err) {
        console.error("Table records fetch error:", err);
      } finally {
        setTableLoading(false);
      }
    }
    fetchTable();
  }, [page, filterBrand, filterCategory, filterCity]);

  // Fetch actual vs predicted for evaluation
  useEffect(() => {
    if (activeTab === 'evaluation') {
      api.getActualVsPredicted(60).then(setActualVsPred).catch(console.error);
    }
  }, [activeTab]);

  // Run Simulator / Tree Trace
  const runSimulator = async () => {
    setSimLoading(true);
    try {
      const [compRes, traceRes, rfRes] = await Promise.all([
        api.predictCompare({ ...simInput, save_to_history: false }),
        api.traceDecisionPath(simInput),
        api.getRandomForestBreakdown(simInput)
      ]);
      setSimResults(compRes.comparison);
      setDtPath(traceRes);
      setRfBreakdown(rfRes);
    } catch (err) {
      console.error("Simulator run error:", err);
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'decision_tree' || activeTab === 'random_forest' || activeTab === 'simulator') {
      runSimulator();
    }
  }, [activeTab]);

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      const res = await api.retrainModels();
      setMetrics(res.metrics);
      setRetrainMsg("Models successfully retrained on 80:20 split.");
      setTimeout(() => setRetrainMsg(null), 4000);
    } catch (err) {
      console.error("Retrain error:", err);
    } finally {
      setRetraining(false);
    }
  };

  const navItems = [
    { id: 'overview', label: '1. Overview & Pipeline', icon: Activity },
    { id: 'dataset', label: '2. Dataset Explorer', icon: Database },
    { id: 'preprocessing', label: '3. Data Preprocessing', icon: Sliders },
    { id: 'eda', label: '4. Exploratory Data Analysis', icon: BarChart2 },
    { id: 'linear_regression', label: '5. Linear Regression Lab', icon: TrendingUp },
    { id: 'decision_tree', label: '6. Decision Tree Regressor', icon: GitFork },
    { id: 'random_forest', label: '7. Random Forest Ensemble', icon: Layers },
    { id: 'evaluation', label: '8. Model Evaluation & Metrics', icon: CheckCircle2 },
    { id: 'importance', label: '9. Feature Importance', icon: Sparkles },
    { id: 'simulator', label: '10. Prediction Simulator', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 sticky top-16 z-40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">CarRent AI Data Mining Laboratory</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                DMBI Examination Rig
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Trained on 1,914 Verified Rental Listings • 80:20 Train-Test Split</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {retrainMsg && (
            <span className="text-xs text-emerald-400 font-medium">{retrainMsg}</span>
          )}
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Retraining Pipelines...' : 'Retrain All 3 Models'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-950/50 p-4 space-y-1 shrink-0 hidden lg:block">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Laboratory Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                  active
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          <div className="pt-6 border-t border-slate-800 mt-6 px-3">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">Live Model R²</span>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Decision Tree:</span>
                <span className="font-mono text-emerald-400 font-bold">{metrics?.['Decision Tree']?.r2 ?? '0.8545'}</span>
              </div>
              <div className="flex justify-between">
                <span>Random Forest:</span>
                <span className="font-mono text-emerald-400 font-bold">{metrics?.['Random Forest']?.r2 ?? '0.8501'}</span>
              </div>
              <div className="flex justify-between">
                <span>Linear Reg.:</span>
                <span className="font-mono text-sky-400 font-bold">{metrics?.['Linear Regression']?.r2 ?? '0.8007'}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto max-w-full">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Module 01</span>
                <h2 className="text-2xl font-black text-white">System Architecture & DMBI Methodology</h2>
                <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                  CarRent AI applies the Cross-Industry Standard Process for Data Mining (CRISP-DM) framework to solve automotive rental price prediction using supervised regression techniques.
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Dataset Records</span>
                  <span className="text-2xl font-black text-white">{overview?.total_rows ?? '1,914'}</span>
                  <span className="text-[11px] text-emerald-400 block mt-1">100% Clean • 0 Nulls</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Attributes</span>
                  <span className="text-2xl font-black text-white">{overview?.total_columns ?? '17'}</span>
                  <span className="text-[11px] text-blue-400 block mt-1">8 Used for Inference</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Split Ratio</span>
                  <span className="text-2xl font-black text-indigo-300">80 : 20</span>
                  <span className="text-[11px] text-slate-400 block mt-1">1,531 Train / 383 Test</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Best R² Score</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {metrics ? `${(metrics['Decision Tree']?.r2 * 100).toFixed(1)}%` : '85.4%'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">Decision Tree / RF</span>
                </div>
              </div>

              {/* CRISP-DM Workflow Flowchart */}
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>CRISP-DM End-to-End Pipeline Execution</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-indigo-400 font-bold block">1. Business Understanding</span>
                    <p className="text-slate-400 text-[11px]">Estimate listed car rental prices from user parameters to remove price ambiguity.</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-blue-400 font-bold block">2. Data Understanding</span>
                    <p className="text-slate-400 text-[11px]">1,914 transactions verified. Discovered target <code>Total_Paid</code> in [0.0, 1.0].</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold block">3. Data Preparation</span>
                    <p className="text-slate-400 text-[11px]">Pruned target leakages (Base_Amount, Tax_Amount). One-hot encoded nominals.</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-purple-400 font-bold block">4. Modeling</span>
                    <p className="text-slate-400 text-[11px]">Trained OLS Linear Regression, Decision Tree, and Random Forest pipelines.</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold block">5. Evaluation & Viva</span>
                    <p className="text-slate-400 text-[11px]">Evaluated MAE, MSE, RMSE, R² on held-out test split. Residual diagnostics.</p>
                  </div>
                </div>
              </div>

              {/* Viva Insights */}
              <VivaAccordion
                title="Academic Defense: Why Regression Instead of Classification?"
                question="Why is car rental price prediction formulated as a regression problem rather than a classification task?"
                answer="Rental price is an intrinsically continuous numerical quantity. Framing it as classification would require arbitrary binning (e.g. Cheap, Medium, Expensive), resulting in severe discretization error and loss of granular variance. Regression algorithms output continuous point estimates, allowing precise calculation of daily rates and residual errors."
                formula="y = f(X) \in \mathbb{R}^+, \quad \text{Loss} = \frac{1}{n} \sum_{i=1}^n (y_i - \hat{y}_i)^2"
                keyPoints={[
                  "Target variable Total_Paid is a continuous float bounded between 0.00 and 1.00.",
                  "Regression allows direct computation of standard statistical error metrics: MAE, MSE, RMSE, and R².",
                  "Preserves subtle marginal variations between different vehicle trims, cities, and durations."
                ]}
              />
            </div>
          )}

          {/* TAB 2: DATASET EXPLORER */}
          {activeTab === 'dataset' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Module 02</span>
                  <h2 className="text-2xl font-black text-white">Dataset Explorer & Attribute Discovery</h2>
                  <p className="text-sm text-slate-400">
                    Direct server-side inspection of all 1,914 records loaded into Pandas memory.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>0 Missing Values Across 17 Columns</span>
                </div>
              </div>

              {/* Filters */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Filter Brand</label>
                  <select
                    value={filterBrand}
                    onChange={(e) => { setFilterBrand(e.target.value); setPage(1); }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">All Brands</option>
                    <option value="0">Toyota (0)</option>
                    <option value="1">Hyundai (1)</option>
                    <option value="2">Honda (2)</option>
                    <option value="3">BMW (3)</option>
                    <option value="4">Mercedes-Benz (4)</option>
                    <option value="5">Audi (5)</option>
                    <option value="6">Tesla (6)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Filter Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">All Categories</option>
                    <option value="0">Compact / Economy (0)</option>
                    <option value="1">Executive Sedan (1)</option>
                    <option value="2">Compact/Midsize SUV (2)</option>
                    <option value="3">Premium Luxury (3)</option>
                    <option value="4">Electric / Hybrid (4)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Filter City</label>
                  <select
                    value={filterCity}
                    onChange={(e) => { setFilterCity(e.target.value); setPage(1); }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">All Indian Cities</option>
                    <optgroup label="Tier 1 (High Tier Metros)">
                      <option value="0">Mumbai (Tier 1)</option>
                      <option value="1">Delhi NCR (Tier 1)</option>
                      <option value="2">Bengaluru (Tier 1)</option>
                    </optgroup>
                    <optgroup label="Tier 2 (Medium Tier Hubs)">
                      <option value="3">Pune (Tier 2)</option>
                      <option value="4">Hyderabad (Tier 2)</option>
                      <option value="5">Ahmedabad (Tier 2)</option>
                    </optgroup>
                    <optgroup label="Tier 3 (Low / Emerging Tier)">
                      <option value="6">Jaipur (Tier 3)</option>
                      <option value="7">Indore (Tier 3)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Rental ID</th>
                        <th className="px-4 py-3">Brand & Model</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3">City</th>
                        <th className="px-4 py-3">Age</th>
                        <th className="px-4 py-3">Base Amt (Leakage)</th>
                        <th className="px-4 py-3">Tax Amt (Leakage)</th>
                        <th className="px-4 py-3 text-right">Target Total_Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {tableLoading ? (
                        <tr>
                          <td colSpan="9" className="text-center py-10 text-slate-500">Loading dataset rows...</td>
                        </tr>
                      ) : recordsData.records.map((r) => (
                        <tr key={r.Rental_ID} className="hover:bg-slate-900/50">
                          <td className="px-4 py-2.5 text-slate-400 font-sans font-bold">#{r.Rental_ID}</td>
                          <td className="px-4 py-2.5 text-white font-sans">
                            {r.Brand_Label} {r.Model_Label}
                          </td>
                          <td className="px-4 py-2.5 text-slate-400 font-sans">{r.Category_Label}</td>
                          <td className="px-4 py-2.5 text-slate-300">{r.Rental_Duration}d</td>
                          <td className="px-4 py-2.5 text-slate-400 font-sans">{r.City_Label}</td>
                          <td className="px-4 py-2.5 text-slate-400">{r.Customer_Age}y</td>
                          <td className="px-4 py-2.5 text-amber-500/80 line-through text-[11px]">{r.Base_Amount}</td>
                          <td className="px-4 py-2.5 text-amber-500/80 line-through text-[11px]">{r.Tax_Amount}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-emerald-400 text-sm">
                            {r.Total_Paid.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Page <strong>{page}</strong> of {recordsData.total_pages} ({recordsData.total_records} rows matched)</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(recordsData.total_pages, page + 1))}
                      disabled={page >= recordsData.total_pages}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATA PREPROCESSING */}
          {activeTab === 'preprocessing' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Module 03</span>
                <h2 className="text-2xl font-black text-white">Data Preprocessing & Target Leakage Prevention</h2>
                <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                  Inspect the pipeline audit showing how raw transaction records are cleaned, partitioned, and encoded prior to estimator fitting.
                </p>
              </div>

              {/* Preprocessing Steps Timeline */}
              <div className="space-y-3">
                {audit?.steps?.map((step) => (
                  <div key={step.step} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      0{step.step}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white">{step.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                          {step.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{step.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Target Leakage Spotlight */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2 text-xs">
                <div className="flex items-center space-x-2 font-bold text-amber-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Target Leakage Audit: Why Base_Amount and Tax_Amount Were Pruned</span>
                </div>
                <p className="leading-relaxed">
                  During preliminary correlation scanning, <code>Base_Amount</code> showed a correlation coefficient of <strong>r = 0.991</strong> with <code>Total_Paid</code>, and <code>Tax_Amount</code> showed <strong>r = 0.999</strong>. This occurs because in car rental billing software, total paid is computed as <code>Total_Paid = Base_Amount - Discount_Amount + Tax_Amount</code>.
                </p>
                <p className="leading-relaxed">
                  Allowing these post-calculation billing outputs into the model would constitute severe target leakage (the model would simply learn addition rather than predicting rental price from vehicle attributes). They are permanently excluded from all model pipelines.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: EXPLORATORY DATA ANALYSIS (EDA) */}
          {activeTab === 'eda' && (
            <div className="space-y-8">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Module 04</span>
                <h2 className="text-2xl font-black text-white">Exploratory Data Analysis (EDA)</h2>
                <p className="text-sm text-slate-400">
                  Interactive distributions, boxplot metrics, and bivariate aggregations computed from the 1,914 listings.
                </p>
              </div>

              {/* Target Price Distribution Chart */}
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Target Variable Distribution (Total_Paid)</h3>
                    <p className="text-xs text-slate-400">Histogram of listed rental price index across 15 equal bins.</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-400">Mean: <strong className="text-white">{priceDist?.boxplot?.mean}</strong></span>
                    <span className="ml-3 text-slate-400">Median: <strong className="text-emerald-400">{priceDist?.boxplot?.median}</strong></span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priceDist?.histogram || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="range" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Rental Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bivariate: Price by Car Category */}
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                <h3 className="text-base font-bold text-white">Average Price Index by Car Category</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bivariate?.by_category || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="category_name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 0.8]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                      <Bar dataKey="mean_price" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Mean Price Index" />
                      <Bar dataKey="median_price" fill="#818cf8" radius={[4, 4, 0, 0]} name="Median Price Index" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bivariate: Price vs Rental Duration */}
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                <h3 className="text-base font-bold text-white">Mean Rental Price vs. Rental Duration (Days)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bivariate?.by_duration || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="duration_days" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                      <Line type="monotone" dataKey="mean_price" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} name="Mean Price Index" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LINEAR REGRESSION */}
          {activeTab === 'linear_regression' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Module 05</span>
                <h2 className="text-2xl font-black text-white">Ordinary Least Squares (OLS) Linear Regression</h2>
                <p className="text-sm text-slate-400">
                  Parametric regression model establishing baseline linear coefficients and intercept.
                </p>
              </div>

              {/* Equation Box */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                <span className="text-slate-500 uppercase tracking-wider block font-bold text-[10px]">Fitted Regression Formula:</span>
                <p className="text-indigo-300 break-words leading-relaxed">{lrEquation?.formula_preview}</p>
                <div className="pt-2 border-t border-slate-800 text-slate-400 flex space-x-4">
                  <span>Intercept (\beta_0): <strong className="text-white">{lrEquation?.intercept}</strong></span>
                  <span>Evaluated R²: <strong className="text-sky-400">{metrics?.['Linear Regression']?.r2}</strong></span>
                  <span>MAE: <strong className="text-sky-400">{metrics?.['Linear Regression']?.mae}</strong></span>
                </div>
              </div>

              {/* Top Coefficients Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-800 font-bold text-sm text-white">
                  Coefficients Ranked by Absolute Weight (|\beta_j|)
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="px-4 py-2.5">Feature Term</th>
                        <th className="px-4 py-2.5">Coefficient (\beta)</th>
                        <th className="px-4 py-2.5">Directional Impact</th>
                        <th className="px-4 py-2.5 text-right">Absolute Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {lrEquation?.coefficients?.slice(0, 15).map((coef, i) => (
                        <tr key={i} className="hover:bg-slate-900/40">
                          <td className="px-4 py-2 text-slate-300">{coef.feature}</td>
                          <td className={`px-4 py-2 font-bold ${coef.coefficient >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {coef.coefficient >= 0 ? `+${coef.coefficient}` : coef.coefficient}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              coef.impact === 'Positive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {coef.impact}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right text-slate-200">{coef.abs_weight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <VivaAccordion
                title="Academic Viva: OLS Loss Function & Assumptions"
                question="What mathematical objective function does Linear Regression optimize, and what are its core assumptions?"
                answer="OLS estimates weights \beta to minimize the Residual Sum of Squares (RSS). The fundamental assumptions are: 1. Linearity of the relationship, 2. Homoscedasticity (constant variance of error terms), 3. Independence of errors, 4. Absence of multicollinearity among predictor variables."
                formula="\min_{\beta} \sum_{i=1}^n \left( y_i - \beta_0 - \sum_{j=1}^p \beta_j X_{ij} \right)^2"
                keyPoints={[
                  "Features were normalized via StandardScaler before fitting the OLS estimator.",
                  "Categorical variables were one-hot encoded to avoid imposing spurious ordinal scales.",
                  "Achieves R² = 0.8007, serving as a solid linear benchmark."
                ]}
              />
            </div>
          )}

          {/* TAB 6: DECISION TREE */}
          {activeTab === 'decision_tree' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Module 06</span>
                <h2 className="text-2xl font-black text-white">Decision Tree Regressor & Traversal Tracer</h2>
                <p className="text-sm text-slate-400">
                  Recursive binary splitting based on variance reduction (MSE criterion). Real-time traversal tracer.
                </p>
              </div>

              {/* Tree Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Nodes</span>
                  <span className="text-xl font-bold text-white">{dtStructure?.total_nodes}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Max Tree Depth</span>
                  <span className="text-xl font-bold text-white">{dtStructure?.max_depth}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Leaf Partitions</span>
                  <span className="text-xl font-bold text-white">{dtStructure?.leaves}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Held-Out Test R²</span>
                  <span className="text-xl font-bold text-emerald-400">{metrics?.['Decision Tree']?.r2}</span>
                </div>
              </div>

              {/* Decision Path Traversal for Active Sample */}
              {dtPath && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <GitFork className="w-4 h-4 text-emerald-400" />
                      <span>Live Traversal Path for Sample Input ({dtPath.total_steps} Steps)</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Final Output Index = {dtPath.final_prediction}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {dtPath.traversal_path.map((step) => (
                      <div key={step.step} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {step.step}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">
                              Node #{step.node_id} • {step.type}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              Samples in Node: {step.samples_in_node}
                            </span>
                          </div>

                          {step.condition ? (
                            <div className="text-slate-300 font-mono text-[11px] flex flex-wrap gap-2 pt-1">
                              <span>Condition: <code>{step.condition}</code></span>
                              <span className="text-slate-500">|</span>
                              <span>Sample Value: <code>{step.sample_feature_value}</code></span>
                              <span className="text-slate-500">|</span>
                              <span className="font-bold text-indigo-400">Evaluated: {step.decision_taken}</span>
                            </div>
                          ) : (
                            <div className="text-emerald-400 font-mono text-[11px] pt-1">
                              {step.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <VivaAccordion
                title="Academic Viva: Variance Reduction in Tree Regressors"
                question="How does a Decision Tree Regressor determine the best feature and split point at each internal node?"
                answer="Unlike classification trees that use Gini Impurity or Information Gain, regression trees optimize for Variance Reduction (Mean Squared Error). At each candidate split point s for feature j, it partitions the region into R_1 and R_2, seeking to minimize the sum of squared errors between target values and region means."
                formula="\text{MSE}(R) = \frac{1}{|R|} \sum_{i \in R} (y_i - \bar{y}_R)^2, \quad \Delta \text{Variance} = \text{MSE}_{\text{parent}} - \sum_{k=1}^2 \frac{|R_k|}{|R_{\text{parent}}|} \text{MSE}(R_k)"
                keyPoints={[
                  "The algorithm greedily selects the feature and threshold that yields maximum variance reduction.",
                  "Max depth is constrained to prevent overfitting on training data noise.",
                  "Yields non-linear partition boundaries, easily handling categorical vehicle tiers."
                ]}
              />
            </div>
          )}

          {/* TAB 7: RANDOM FOREST */}
          {activeTab === 'random_forest' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Module 07</span>
                <h2 className="text-2xl font-black text-white">Random Forest Regressor & Ensemble Variance</h2>
                <p className="text-sm text-slate-400">
                  Ensemble of 60 decorrelated bootstrap decision trees aggregated via uniform averaging.
                </p>
              </div>

              {/* Ensemble Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Estimators</span>
                  <span className="text-xl font-bold text-white">60 Trees</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ensemble Mean</span>
                  <span className="text-xl font-bold text-white">{rfBreakdown?.ensemble_mean}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tree Std Dev (\sigma)</span>
                  <span className="text-xl font-bold text-indigo-300">±{rfBreakdown?.ensemble_std}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Test Set R²</span>
                  <span className="text-xl font-bold text-emerald-400">{metrics?.['Random Forest']?.r2}</span>
                </div>
              </div>

              {/* Individual Tree Predictions Histogram */}
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Spread of Individual Estimator Predictions (60 Trees)</h3>
                  <span className="text-xs text-slate-400">Variance: <strong>{rfBreakdown ? (rfBreakdown.ensemble_std ** 2).toFixed(5) : '0'}</strong></span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rfBreakdown?.histogram || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="range" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                      <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} name="Trees in Bin" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <VivaAccordion
                title="Academic Viva: Bagging and Variance Reduction"
                question="Why does Random Forest outperform a single Decision Tree?"
                answer="A single decision tree has high variance and easily overfits small fluctuations in data. Random Forest employs Bootstrap Aggregating (Bagging) combined with random feature subspace sampling. Averaging B decorrelated trees reduces variance by a factor approaching 1/B while maintaining low bias."
                formula="\hat{f}_{\text{RF}}(x) = \frac{1}{B} \sum_{b=1}^B T_b(x), \quad \text{Var}(\text{Ensemble}) = \rho \sigma^2 + \frac{1-\rho}{B} \sigma^2"
                keyPoints={[
                  "Bootstrap resampling samples n observations with replacement.",
                  "Feature subspace sampling prevents dominant features from masking other subtle signals.",
                  "Provides an empirical uncertainty metric (standard deviation across estimators)."
                ]}
              />
            </div>
          )}

          {/* TAB 8: MODEL EVALUATION & COMPARISON */}
          {activeTab === 'evaluation' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Module 08</span>
                <h2 className="text-2xl font-black text-white">Model Evaluation & Benchmark Comparison</h2>
                <p className="text-sm text-slate-400">
                  Comprehensive performance metrics calculated strictly on the held-out 20% test partition (383 samples).
                </p>
              </div>

              {/* Metrics Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3">Algorithm</th>
                      <th className="px-5 py-3">Mean Absolute Error (MAE)</th>
                      <th className="px-5 py-3">Mean Squared Error (MSE)</th>
                      <th className="px-5 py-3">Root MSE (RMSE)</th>
                      <th className="px-5 py-3 text-right">Coefficient of Determination (R²)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {metrics && Object.entries(metrics).map(([modelName, m]) => (
                      <tr key={modelName} className="hover:bg-slate-900/40">
                        <td className="px-5 py-3 font-sans font-bold text-white">{modelName}</td>
                        <td className="px-5 py-3 text-slate-300">{m.mae}</td>
                        <td className="px-5 py-3 text-slate-300">{m.mse}</td>
                        <td className="px-5 py-3 text-slate-300">{m.rmse}</td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-400 text-sm">
                          {(m.r2 * 100).toFixed(2)}% ({m.r2})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actual vs Predicted Scatter Plot */}
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Actual vs. Predicted Price Index (Test Set Samples)</h3>
                  <span className="text-xs text-slate-400">Ideal Fit = Diagonal y = x</span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" dataKey="actual" name="Actual Price Index" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis type="number" dataKey="rf_pred" name="Predicted Index" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                      <Scatter name="Random Forest Predictions" data={actualVsPred} fill="#38bdf8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: FEATURE IMPORTANCE */}
          {activeTab === 'importance' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Module 09</span>
                <h2 className="text-2xl font-black text-white">Feature Importance Comparison</h2>
                <p className="text-sm text-slate-400">
                  Global attribute importance across models: Variance reduction (Tree models) vs standardized OLS coefficients.
                </p>
              </div>

              {/* Grouped Importance Chart */}
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                <h3 className="text-base font-bold text-white">Relative Feature Importance (Grouped Predictors)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureImportance?.grouped || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="feature" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={120} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                      <Legend />
                      <Bar dataKey="rf_importance" fill="#a855f7" name="Random Forest Gini" />
                      <Bar dataKey="dt_importance" fill="#10b981" name="Decision Tree Variance" />
                      <Bar dataKey="lr_importance" fill="#38bdf8" name="Linear Reg. |Coef|" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: PREDICTION SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Module 10</span>
                <h2 className="text-2xl font-black text-white">Interactive Prediction Simulator & Viva Sandbox</h2>
                <p className="text-sm text-slate-400">
                  Adjust parameters in real-time to observe immediate responses across all 3 trained pipelines and trace the Decision Tree branch traversal.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Simulator Controls */}
                <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-slate-300">Rental Duration (Days)</label>
                    <span className="font-mono text-indigo-400">{simInput.Rental_Duration} Days</span>
                  </div>
                  <input
                    type="range" min="1" max="14" step="1"
                    value={simInput.Rental_Duration}
                    onChange={(e) => setSimInput({ ...simInput, Rental_Duration: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Car Category</label>
                    <select
                      value={simInput.Car_Category}
                      onChange={(e) => setSimInput({ ...simInput, Car_Category: parseInt(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="0">Compact / Economy</option>
                      <option value="1">Executive Sedan</option>
                      <option value="2">Compact/Midsize SUV</option>
                      <option value="3">Premium Luxury</option>
                      <option value="4">Electric / Hybrid</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Brand</label>
                    <select
                      value={simInput.Brand}
                      onChange={(e) => setSimInput({ ...simInput, Brand: parseInt(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="0">Toyota</option>
                      <option value="1">Hyundai</option>
                      <option value="2">Honda</option>
                      <option value="3">BMW</option>
                      <option value="4">Mercedes-Benz</option>
                      <option value="5">Audi</option>
                      <option value="6">Tesla</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Rental Location (Indian City Tier)</label>
                    <select
                      value={simInput.City}
                      onChange={(e) => setSimInput({ ...simInput, City: parseInt(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    >
                      <optgroup label="Tier 1 Cities (High Tier Metros)">
                        <option value="0">Mumbai (Tier 1 Metro)</option>
                        <option value="1">Delhi NCR (Tier 1 Capital)</option>
                        <option value="2">Bengaluru (Tier 1 Tech Hub)</option>
                      </optgroup>
                      <optgroup label="Tier 2 Cities (Medium Tier Hubs)">
                        <option value="3">Pune (Tier 2 Auto Hub)</option>
                        <option value="4">Hyderabad (Tier 2 Urban)</option>
                        <option value="5">Ahmedabad (Tier 2 Commercial)</option>
                      </optgroup>
                      <optgroup label="Tier 3 Cities (Low / Emerging Tier)">
                        <option value="6">Jaipur (Tier 3 Regional)</option>
                        <option value="7">Indore (Tier 3 Regional)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2">
                    <label className="font-bold text-slate-300">Customer Age</label>
                    <span className="font-mono text-indigo-400">{simInput.Customer_Age} Years</span>
                  </div>
                  <input
                    type="range" min="21" max="60" step="1"
                    value={simInput.Customer_Age}
                    onChange={(e) => setSimInput({ ...simInput, Customer_Age: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />

                  <button
                    onClick={runSimulator}
                    disabled={simLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md mt-4"
                  >
                    {simLoading ? 'Simulating...' : 'Simulate & Re-evaluate Pipelines'}
                  </button>
                </div>

                {/* Simulator Side-by-Side Outputs */}
                <div className="lg:col-span-7 space-y-4">
                  {simResults && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-purple-400 block">Random Forest</span>
                        <div className="text-2xl font-black text-white">
                          ₹{(simResults['Random Forest']?.estimated_price_inr ?? Math.round(simResults['Random Forest']?.estimated_price_usd * 83)).toLocaleString('en-IN')}
                        </div>
                        <span className="text-slate-400 block font-mono text-[11px]">
                          ${simResults['Random Forest']?.estimated_price_usd} • Index: {simResults['Random Forest']?.predicted_price_index}
                        </span>
                        <span className="text-[10px] text-purple-300 block">
                          Tree Std: ±₹{Math.round(simResults['Random Forest']?.details?.tree_std * 8500).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block">Decision Tree</span>
                        <div className="text-2xl font-black text-white">
                          ₹{(simResults['Decision Tree']?.estimated_price_inr ?? Math.round(simResults['Decision Tree']?.estimated_price_usd * 83)).toLocaleString('en-IN')}
                        </div>
                        <span className="text-slate-400 block font-mono text-[11px]">
                          ${simResults['Decision Tree']?.estimated_price_usd} • Index: {simResults['Decision Tree']?.predicted_price_index}
                        </span>
                        <span className="text-[10px] text-emerald-300 block">
                          Exact Leaf Match
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-sky-400 block">Linear Reg.</span>
                        <div className="text-2xl font-black text-white">
                          ₹{(simResults['Linear Regression']?.estimated_price_inr ?? Math.round(simResults['Linear Regression']?.estimated_price_usd * 83)).toLocaleString('en-IN')}
                        </div>
                        <span className="text-slate-400 block font-mono text-[11px]">
                          ${simResults['Linear Regression']?.estimated_price_usd} • Index: {simResults['Linear Regression']?.predicted_price_index}
                        </span>
                        <span className="text-[10px] text-sky-300 block">
                          Linear Slope Addition
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Decision Tree path for simulator */}
                  {dtPath && (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                      <div className="font-bold text-white flex items-center space-x-2">
                        <GitFork className="w-4 h-4 text-emerald-400" />
                        <span>Decision Tree Real-Time Decision Steps ({dtPath.total_steps} Steps)</span>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-[11px]">
                        {dtPath.traversal_path.map((s) => (
                          <div key={s.step} className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                            <span className="text-slate-300">Step {s.step}: {s.condition || s.description}</span>
                            <span className="text-indigo-400 font-bold">{s.decision_taken || 'Terminal'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
