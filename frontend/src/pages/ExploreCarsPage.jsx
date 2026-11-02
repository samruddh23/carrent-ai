import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Sparkles, ArrowRight, Check, Compass, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';

export default function ExploreCarsPage() {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('name_asc');

  useEffect(() => {
    async function fetchCars() {
      try {
        const data = await api.getCars();
        setCars(data);
        setFilteredCars(data);
      } catch (err) {
        console.error("Failed to load cars catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, []);

  useEffect(() => {
    let result = [...cars];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.brand_name.toLowerCase().includes(q) ||
        c.category_name.toLowerCase().includes(q)
      );
    }

    // Brand filter
    if (selectedBrand !== 'ALL') {
      result = result.filter(c => c.brand_id === parseInt(selectedBrand));
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter(c => c.default_category === parseInt(selectedCategory));
    }

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.estimated_daily_rate_usd - b.estimated_daily_rate_usd);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.estimated_daily_rate_usd - a.estimated_daily_rate_usd);
    } else if (sortBy === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredCars(result);
  }, [search, selectedBrand, selectedCategory, sortBy, cars]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Dataset-Backed Vehicle Fleet</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Fleet Models</h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Browse all 19 unique vehicle models represented in the 1,914 rental records. Each vehicle displays verified technical specifications and authentic historical transaction benchmarks.
          </p>
        </div>

        <Link
          to="/predict"
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md transition-all shrink-0 self-start md:self-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Price Predictor</span>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search model, brand or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Brand select */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="ALL">All Manufacturers (Brands)</option>
              <option value="0">Toyota</option>
              <option value="1">Hyundai</option>
              <option value="2">Honda</option>
              <option value="3">BMW</option>
              <option value="4">Mercedes-Benz</option>
              <option value="5">Audi</option>
              <option value="6">Tesla</option>
            </select>
          </div>

          {/* Category select */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="ALL">All Vehicle Categories</option>
              <option value="0">Compact / Economy</option>
              <option value="1">Executive Sedan</option>
              <option value="2">Compact / Midsize SUV</option>
              <option value="3">Premium Luxury</option>
              <option value="4">Electric / Hybrid</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="name_asc">Sort: Name (A-Z)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing <strong className="text-slate-800">{filteredCars.length}</strong> of {cars.length} vehicle models</span>
          {(search || selectedBrand !== 'ALL' || selectedCategory !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedBrand('ALL');
                setSelectedCategory('ALL');
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : filteredCars.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <p className="text-slate-500 text-sm">No vehicles match your current filter criteria.</p>
          <button
            onClick={() => { setSearch(''); setSelectedBrand('ALL'); setSelectedCategory('ALL'); }}
            className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <div
              key={car.model_id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Photo */}
              <div className="relative h-52 overflow-hidden bg-slate-100">
                <img
                  src={car.image_url}
                  alt={car.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
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

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">{car.name}</h3>
                    <span className="text-xs text-slate-400 font-medium">Model ID: {car.model_id}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{car.description}</p>

                  {/* Specifications */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-600">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between">
                      <span className="text-slate-400">Transmission:</span>
                      <span className="font-semibold">{car.transmission}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between">
                      <span className="text-slate-400">Fuel:</span>
                      <span className="font-semibold">{car.fuel}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between">
                      <span className="text-slate-400">Power:</span>
                      <span className="font-semibold">{car.hp} HP</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between">
                      <span className="text-slate-400">Capacity:</span>
                      <span className="font-semibold">{car.seats} Seats</span>
                    </div>
                  </div>

                  {/* Dataset records insight */}
                  <div className="mt-3 p-2.5 rounded-lg bg-blue-50/50 border border-blue-100/60 flex items-center justify-between text-[11px] text-blue-900">
                    <span>Dataset Samples: <strong>{car.dataset_rental_count} rentals</strong></span>
                    <span>Avg Duration: <strong>{car.dataset_avg_duration_days} days</strong></span>
                  </div>
                </div>

                {/* Card footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Est. Daily Rate</span>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xl font-extrabold text-slate-900">
                        ₹{(car.estimated_daily_rate_inr ?? Math.round(car.estimated_daily_rate_usd * 83)).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500">/day</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">${car.estimated_daily_rate_usd}/day equivalent</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/cars/${car.model_id}`}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Details
                    </Link>
                    <Link
                      to={`/predict?model=${car.model_id}&brand=${car.brand_id}&category=${car.default_category}`}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Predict</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
