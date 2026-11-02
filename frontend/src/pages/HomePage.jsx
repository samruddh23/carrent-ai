import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, Sparkles, Compass, ShieldCheck, ArrowRight, BarChart3, 
  Cpu, Database, Clock, Users, Zap, CheckCircle2, Star, Layers
} from 'lucide-react';
import api from '../services/api';

export default function HomePage() {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [carsRes, metricsRes] = await Promise.all([
          api.getCars(),
          api.getModelMetrics()
        ]);
        setFeaturedCars(carsRes.slice(0, 6));
        setMetrics(metricsRes);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-b-3xl">
        {/* Background glow and subtle grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-950 pointer-events-none"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>DMBI Academic Machine Learning System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                Find Your Perfect Ride. <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                  Know Your Price.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Experience transparent car rentals driven by predictive machine learning. Estimate listed rental prices using actual regression models trained on verified vehicle rental transaction data.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/predict"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Predict Rental Price</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/explore"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold hover:-translate-y-0.5 transition-all text-sm"
                >
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span>Explore Dataset Cars</span>
                </Link>

                <Link
                  to="/lab"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-200 font-semibold text-sm transition-all"
                >
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>Data Mining Lab</span>
                </Link>
              </div>

              {/* Credibility badges */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div>
                  <span className="block text-2xl font-bold text-white">1,914</span>
                  <span className="text-xs text-slate-400">Verified Records</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-emerald-400">
                    {metrics ? `${(metrics['Decision Tree']?.r2 * 100).toFixed(1)}%` : '85.4%'}
                  </span>
                  <span className="text-xs text-slate-400">Peak R² Accuracy</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-blue-400">3 Models</span>
                  <span className="text-xs text-slate-400">LR, DT & RF</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-purple-400">Zero Leakage</span>
                  <span className="text-xs text-slate-400">Strict Data Hygiene</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-800/50 backdrop-blur-sm p-4">
                <img
                  src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern Luxury Car"
                  className="w-full h-64 sm:h-72 object-cover rounded-xl shadow-md"
                />

                {/* Floating Prediction Snippet Card */}
                <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Model Inference</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">Executive Sedan (Camry)</h4>
                      <p className="text-xs text-slate-400">Duration: 5 Days • Mumbai (Tier 1 Metro)</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Est. Rate</span>
                      <span className="text-lg font-extrabold text-blue-400">₹3,450<span className="text-xs font-normal text-slate-400">/day</span></span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-[85%]"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Intelligent Workflow</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How CarRent AI Predicts Pricing</h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Combining rigorous data engineering with modern regression algorithms to deliver transparent, unbiased rental estimates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Input Trip Attributes</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Specify your rental duration, preferred vehicle category, brand, model, city, and renter profile without any hidden variables.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Ensemble ML Evaluation</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Trained Scikit-learn pipelines evaluate feature weights through Linear Regression, recursive Decision Trees, and Random Forest ensembles simultaneously.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Explainable Price Estimation</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Receive a normalized rental price index, daily rate conversion, tree variance spread, and full decision traversal explanations.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES FROM DATASET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Dataset Inventory</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Featured Vehicle Listings</h2>
            <p className="text-slate-500 text-sm mt-1">Real vehicle models from the 1,914 rental dataset records.</p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View All 19 Models</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => (
              <div
                key={car.model_id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={car.image_url}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/95 text-slate-800 shadow-sm backdrop-blur-xs">
                      {car.category_name}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-900/90 text-white shadow-sm">
                      {car.brand_name}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{car.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{car.description}</p>
                    
                    {/* Specs chips */}
                    <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] text-slate-600 font-medium">
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        {car.transmission}
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        {car.fuel}
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        {car.seats} Seats
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Est. Rental Rate</span>
                      <span className="text-lg font-extrabold text-slate-900">
                        ₹{(car.estimated_daily_rate_inr ?? Math.round(car.estimated_daily_rate_usd * 83)).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500"> / day</span>
                    </div>

                    <Link
                      to={`/predict?model=${car.model_id}&brand=${car.brand_id}&category=${car.default_category}`}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-semibold text-xs transition-colors shadow-xs"
                    >
                      <span>Predict</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DATA MINING LAB BANNER / PROMO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                <span>Academic Examination & Viva Companion</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Inspect Real Algorithm Behavior in the Data Mining Lab
              </h2>
              <p className="text-indigo-200 text-sm leading-relaxed max-w-2xl">
                Dive deep into raw mathematical formulations, Scikit-learn decision tree splits, random forest tree variances, OLS regression coefficients, and correlation matrices generated directly from the 1,914 record dataset.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/lab"
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-all"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Launch DMBI Laboratory</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  to="/lab?tab=simulator"
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Interactive Prediction Simulator</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-300 block">Evaluated Metrics (Held-Out Test Set)</span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-black/20">
                  <span className="text-slate-300">Decision Tree R²:</span>
                  <span className="font-bold text-emerald-400">{metrics ? metrics['Decision Tree']?.r2 : '0.8545'}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-black/20">
                  <span className="text-slate-300">Random Forest R²:</span>
                  <span className="font-bold text-emerald-400">{metrics ? metrics['Random Forest']?.r2 : '0.8501'}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-black/20">
                  <span className="text-slate-300">Linear Regression R²:</span>
                  <span className="font-bold text-sky-400">{metrics ? metrics['Linear Regression']?.r2 : '0.8007'}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-black/20">
                  <span className="text-slate-300">Test Samples Split:</span>
                  <span className="font-bold text-white">383 (20%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
