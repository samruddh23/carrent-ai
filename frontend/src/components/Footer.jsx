import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Database, ShieldCheck, BookOpen, ExternalLink, Code } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">CarRent <span className="text-blue-400">AI</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              A comprehensive Data Mining and Business Intelligence (DMBI) academic project demonstrating regression analysis, decision tree traversal, and ensemble modeling on real automotive rental transaction datasets.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>1,914 Verified Records</span>
              </span>
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Data Leakage</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">User Portal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">Home Experience</Link>
              </li>
              <li>
                <Link to="/explore" className="text-slate-400 hover:text-white transition-colors">Explore Vehicles</Link>
              </li>
              <li>
                <Link to="/predict" className="text-slate-400 hover:text-white transition-colors">Rental Price Predictor</Link>
              </li>
              <li>
                <Link to="/history" className="text-slate-400 hover:text-white transition-colors">Prediction History</Link>
              </li>
            </ul>
          </div>

          {/* DMBI Laboratory */}
          <div>
            <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>DMBI Laboratory</span>
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/lab?tab=overview" className="text-slate-400 hover:text-indigo-300 transition-colors">Architecture & Pipeline</Link>
              </li>
              <li>
                <Link to="/lab?tab=dataset" className="text-slate-400 hover:text-indigo-300 transition-colors">Dataset Explorer (1.9k)</Link>
              </li>
              <li>
                <Link to="/lab?tab=eda" className="text-slate-400 hover:text-indigo-300 transition-colors">Exploratory Data Analysis</Link>
              </li>
              <li>
                <Link to="/lab?tab=evaluation" className="text-slate-400 hover:text-indigo-300 transition-colors">Model Evaluation (MAE/R²)</Link>
              </li>
              <li>
                <Link to="/lab?tab=simulator" className="text-slate-400 hover:text-indigo-300 transition-colors">Prediction Simulator</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 CarRent AI • Academic DMBI Capstone Mini-Project • All ML models fitted on real verified data.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="text-slate-400">Python Flask Backend • Scikit-learn • SQLite3 • React Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
