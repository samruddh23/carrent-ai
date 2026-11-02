import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Search, Trash2, RotateCcw, Sparkles, ArrowRight, Database, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionMsg, setActionMsg] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory({ search, limit: 100 });
      setHistory(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load prediction history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete prediction record #${id}?`)) return;
    try {
      await api.deleteHistoryItem(id);
      setActionMsg(`Record #${id} deleted.`);
      fetchHistory();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      console.error("Error deleting prediction:", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all prediction history?")) return;
    try {
      await api.clearHistory();
      setActionMsg("All prediction history cleared.");
      fetchHistory();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <Database className="w-3.5 h-3.5" />
            <span>SQLite Database Persistence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Prediction History</h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Persistent log of price estimations executed during your application sessions. Stored locally in the SQLite database (<code>carrent.db</code>).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
            >
              Clear All Logs
            </button>
          )}
          <Link
            to="/predict"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Prediction</span>
          </Link>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Search and Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by model or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-xs text-slate-500">
            Total Logged Queries: <strong className="text-slate-900">{total}</strong>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading database records...
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-slate-500">No prediction history recorded yet.</p>
            <Link
              to="/predict"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold"
            >
              <span>Run your first prediction</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Date / Time</th>
                  <th className="px-5 py-3">Algorithm</th>
                  <th className="px-5 py-3">Vehicle Details</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3 text-right">Predicted Index</th>
                  <th className="px-5 py-3 text-right">Est. Price (INR / USD)</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">#{item.id}</td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {item.timestamp ? item.timestamp.replace('T', ' ').substring(0, 16) : 'Just now'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.model_used.includes('Random Forest')
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : item.model_used.includes('Decision Tree')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {item.model_used}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{item.brand_name} {item.model_name}</div>
                      <div className="text-[10px] text-slate-400">{item.category_name}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">
                      {item.rental_duration} Days
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {item.city_name}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-800">
                      {item.predicted_price.toFixed(4)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-600 text-sm">
                      ₹{Math.round(item.estimated_price_usd * 83).toLocaleString('en-IN')}
                      <span className="text-[10px] text-slate-400 block">${item.estimated_price_usd.toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
