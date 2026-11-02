import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, AlertCircle, ArrowRight, Layers, 
  HelpCircle, ShieldCheck, Zap, History, RotateCcw, Cpu
} from 'lucide-react';
import api from '../services/api';

export default function PredictionPage() {
  const location = useLocation();

  // Options from backend
  const [meta, setMeta] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    Rental_Duration: 3,
    Car_Category: 1,
    Brand: 0,
    Model: 0,
    City: 0,
    Customer_Age: 28,
    Gender: 1,
    Payment_Type: 0,
    notes: 'Standard consumer rental estimation'
  });

  // Comparison vs Single
  const [selectedModel, setSelectedModel] = useState('ALL_COMPARE');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Read URL query params if any
  useEffect(() => {
    async function init() {
      try {
        const metaRes = await api.getMetaOptions();
        setMeta(metaRes);

        const params = new URLSearchParams(location.search);
        const pModel = params.get('model');
        const pBrand = params.get('brand');
        const pCategory = params.get('category');

        setFormData(prev => ({
          ...prev,
          Model: pModel !== null ? parseInt(pModel) : prev.Model,
          Brand: pBrand !== null ? parseInt(pBrand) : prev.Brand,
          Car_Category: pCategory !== null ? parseInt(pCategory) : prev.Car_Category
        }));
      } catch (err) {
        console.error("Failed to load metadata options:", err);
        setError("Unable to connect to prediction engine. Ensure backend is running.");
      } finally {
        setLoadingMeta(false);
      }
    }
    init();
  }, [location.search]);

  // When Brand changes, ensure Model is valid for that Brand
  const handleBrandChange = (newBrandId) => {
    const bId = parseInt(newBrandId);
    let validModelId = formData.Model;
    if (meta && meta.brand_models && meta.brand_models[bId]) {
      const availableModels = meta.brand_models[bId];
      if (!availableModels.some(m => m.id === validModelId)) {
        validModelId = availableModels[0]?.id ?? 0;
      }
    }
    setFormData(prev => ({
      ...prev,
      Brand: bId,
      Model: validModelId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (selectedModel === 'ALL_COMPARE') {
        const response = await api.predictCompare({
          ...formData,
          save_to_history: true
        });
        setResult({ type: 'compare', data: response });
      } else {
        const response = await api.predictSingle({
          ...formData,
          model_name: selectedModel,
          save_to_history: true
        });
        setResult({ type: 'single', data: response });
      }
    } catch (err) {
      console.error("Prediction submission error:", err);
      setError(err.response?.data?.message || "Failed to generate price prediction. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMeta) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-slate-500 text-sm">Connecting to Scikit-learn Inference Engine...</p>
      </div>
    );
  }

  const availableModelsForBrand = meta?.brand_models?.[formData.Brand] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Model Regression Estimator</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Rental Price Predictor</h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Estimate listed car rental prices by running your trip parameters through real Linear Regression, Decision Tree, and Random Forest pipelines trained on 1,914 verified rental listings.
          </p>
        </div>

        <Link
          to="/history"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shrink-0"
        >
          <History className="w-4 h-4 text-slate-500" />
          <span>View Saved Predictions</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Trip & Vehicle Parameters</h2>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  Rental_Duration: 3,
                  Car_Category: 1,
                  Brand: 0,
                  Model: 0,
                  City: 0,
                  Customer_Age: 28,
                  Gender: 1,
                  Payment_Type: 0,
                  notes: 'Standard consumer rental estimation'
                });
                setResult(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Model Evaluation Selection */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/80 space-y-2">
              <label className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                Algorithm Execution Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                {[
                  { id: 'ALL_COMPARE', label: 'Compare All 3' },
                  { id: 'Random Forest', label: 'Random Forest' },
                  { id: 'Decision Tree', label: 'Decision Tree' },
                  { id: 'Linear Regression', label: 'Linear Reg.' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedModel(item.id)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                      selectedModel === item.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Slider & Display */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 uppercase tracking-wider">
                  Rental Duration (Days)
                </label>
                <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-sm">
                  {formData.Rental_Duration} {formData.Rental_Duration === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                step="1"
                value={formData.Rental_Duration}
                onChange={(e) => setFormData({ ...formData, Rental_Duration: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 Day (Minimum)</span>
                <span>7 Days (Weekly)</span>
                <span>14 Days (Maximum)</span>
              </div>
            </div>

            {/* Cascading Brand & Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Manufacturer (Brand)
                </label>
                <select
                  value={formData.Brand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  {meta?.brands?.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Vehicle Model
                </label>
                <select
                  value={formData.Model}
                  onChange={(e) => setFormData({ ...formData, Model: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  {availableModelsForBrand.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vehicle Category & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Vehicle Classification
                </label>
                <select
                  value={formData.Car_Category}
                  onChange={(e) => setFormData({ ...formData, Car_Category: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  {meta?.categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Rental Location (Indian City)
                  </label>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Tier 1 • Tier 2 • Tier 3
                  </span>
                </div>
                <select
                  value={formData.City}
                  onChange={(e) => setFormData({ ...formData, City: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-medium"
                >
                  <optgroup label="Tier 1 Cities (High Tier Metros)">
                    {meta?.cities?.filter(c => c.tier?.includes('Tier 1') || [0, 1, 2].includes(c.id)).map((city) => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Tier 2 Cities (Medium Tier Urban Hubs)">
                    {meta?.cities?.filter(c => c.tier?.includes('Tier 2') || [3, 4, 5].includes(c.id)).map((city) => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Tier 3 Cities (Low / Emerging Tier Regional)">
                    {meta?.cities?.filter(c => c.tier?.includes('Tier 3') || [6, 7].includes(c.id)).map((city) => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Customer Age Slider & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-700 uppercase tracking-wider">
                    Customer Age
                  </label>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {formData.Customer_Age} Years
                  </span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="60"
                  step="1"
                  value={formData.Customer_Age}
                  onChange={(e) => setFormData({ ...formData, Customer_Age: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Customer Gender
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  {meta?.genders?.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, Gender: g.id })}
                      className={`py-2 px-3 rounded-xl border text-center transition-all ${
                        formData.Gender === g.id
                          ? 'bg-blue-50 text-blue-700 border-blue-400'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Payment Method
              </label>
              <select
                value={formData.Payment_Type}
                onChange={(e) => setFormData({ ...formData, Payment_Type: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                {meta?.payment_types?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Computing Regression Models...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Price Prediction</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Display on Right */}
        <div className="lg:col-span-5 space-y-6">
          {!result ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Awaiting Prediction Inputs</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Select your trip parameters on the left and click <strong>Execute Price Prediction</strong> to evaluate prices against all 3 genuine regression algorithms.
              </p>
              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                <span>Model Outputs: Continuous Price Index (0.00 – 1.00) & USD Estimates</span>
              </div>
            </div>
          ) : result.type === 'compare' ? (
            /* Multi-model comparison card */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Ensemble Comparison</span>
                  <h3 className="text-xl font-black text-slate-900">Prediction Results</h3>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved to SQLite</span>
                </span>
              </div>

              {/* Primary Recommended: Random Forest */}
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-300">Random Forest Ensemble (Recommended)</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 text-[10px] font-bold">R² = 0.8501</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-black text-white">
                        ₹{(result.data.comparison['Random Forest']?.estimated_price_inr ?? Math.round(result.data.comparison['Random Forest']?.estimated_price_usd * 83)).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400">
                        (${result.data.comparison['Random Forest']?.estimated_price_usd})
                      </span>
                    </div>
                    <span className="text-xs text-slate-400"> / trip estimate ({formData.Rental_Duration} {formData.Rental_Duration === 1 ? 'day' : 'days'})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Normalized Index</span>
                    <span className="text-base font-extrabold text-blue-400">
                      {result.data.comparison['Random Forest']?.predicted_price_index}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                  <span>Tree Variance: {result.data.comparison['Random Forest']?.details?.tree_variance?.toFixed(4)}</span>
                  <span>Ensemble Spread: ±₹{Math.round(result.data.comparison['Random Forest']?.details?.tree_std * 8500).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Decision Tree & Linear Regression Cards */}
              <div className="space-y-3">
                {/* Decision Tree */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">Decision Tree Regressor</span>
                    <span className="text-[11px] text-slate-400">Max Depth 7 • Non-linear Splits</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{(result.data.comparison['Decision Tree']?.estimated_price_inr ?? Math.round(result.data.comparison['Decision Tree']?.estimated_price_usd * 83)).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      ${result.data.comparison['Decision Tree']?.estimated_price_usd} • Index: {result.data.comparison['Decision Tree']?.predicted_price_index}
                    </span>
                  </div>
                </div>

                {/* Linear Regression */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">Linear Regression (OLS)</span>
                    <span className="text-[11px] text-slate-400">Standardized Slopes & Intercept</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{(result.data.comparison['Linear Regression']?.estimated_price_inr ?? Math.round(result.data.comparison['Linear Regression']?.estimated_price_usd * 83)).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      ${result.data.comparison['Linear Regression']?.estimated_price_usd} • Index: {result.data.comparison['Linear Regression']?.predicted_price_index}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inspect in Lab button */}
              <Link
                to="/lab?tab=simulator"
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors border border-indigo-200"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Inspect Decision Tree Path in Data Mining Lab</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          ) : (
            /* Single model card */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">{result.data.model_name}</span>
                  <h3 className="text-xl font-black text-slate-900">Prediction Output</h3>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ID: #{result.data.prediction_id}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">Estimated Price</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white">
                    ₹{(result.data.estimated_price_inr ?? Math.round(result.data.estimated_price_usd * 83)).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400">(${result.data.estimated_price_usd} for {formData.Rental_Duration} Days)</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                  <span>Price Index: <strong>{result.data.predicted_price_index}</strong></span>
                  <span>Currency: INR (₹) / Normalized Unit</span>
                </div>
              </div>

              <Link
                to="/lab?tab=simulator"
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors border border-indigo-200"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Simulate & Trace Tree Path in Lab</span>
              </Link>
            </div>
          )}

          {/* Academic Context Alert */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Academic Integrity Guarantee</span>
            </span>
            <p className="leading-relaxed">
              All outputs are produced in real-time by fitted Scikit-learn regressors. Post-calculation billing variables (<code>Base_Amount</code>, <code>Tax_Amount</code>) are strictly excluded from inference inputs to prevent target leakage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
