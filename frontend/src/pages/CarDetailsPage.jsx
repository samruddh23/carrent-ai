import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle2, Shield, Calendar, Fuel, Gauge, Users, Briefcase } from 'lucide-react';
import api from '../services/api';

export default function CarDetailsPage() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCar() {
      try {
        const data = await api.getCarDetails(id);
        setCar(data);
      } catch (err) {
        console.error("Failed to fetch car:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-slate-500 text-sm">Loading vehicle specification...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Vehicle Not Found</h2>
        <p className="text-slate-500 text-sm">The requested car model could not be located in the dataset catalog.</p>
        <Link to="/explore" className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Cars</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/explore" className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fleet Catalog</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Photos & Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-white">
            <img
              src={car.image_url}
              alt={car.name}
              className="w-full h-80 sm:h-96 object-cover"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Vehicle Overview</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{car.description}</p>
            
            {/* Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2 text-slate-700 text-xs">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{car.seats} Passengers</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 text-xs">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>{car.luggage}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 text-xs">
                <Gauge className="w-4 h-4 text-blue-600" />
                <span>{car.hp} Horsepower</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 text-xs">
                <Fuel className="w-4 h-4 text-blue-600" />
                <span>{car.mpg}</span>
              </div>
            </div>
          </div>

          {/* Full Technical Specifications */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Verified Technical Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-slate-500">Manufacturer (Brand):</span>
                <span className="font-bold text-slate-800">{car.brand_name} (Code {car.brand_id})</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-slate-500">Model Name:</span>
                <span className="font-bold text-slate-800">{car.name} (Code {car.model_id})</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-slate-500">Category Classification:</span>
                <span className="font-bold text-slate-800">{car.category_name} (Code {car.default_category})</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-slate-500">Model Year:</span>
                <span className="font-bold text-slate-800">{car.year}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-slate-500">Transmission:</span>
                <span className="font-bold text-slate-800">{car.transmission}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-slate-500">Powertrain / Fuel:</span>
                <span className="font-bold text-slate-800">{car.fuel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dataset Benchmarks & Prediction Trigger */}
        <div className="lg:col-span-5 space-y-6">
          {/* Price & Action Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Model Pricing Tier</span>
                <h1 className="text-2xl font-black text-slate-900">{car.name}</h1>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {car.category_name}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">Estimated Benchmark Rate</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-black text-slate-900">
                  ₹{(car.estimated_daily_rate_inr ?? Math.round(car.estimated_daily_rate_usd * 83)).toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-slate-500">/ day (${car.estimated_daily_rate_usd})</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Derived from regression price index {car.dataset_avg_price_index} on 1,914 rental listings.
              </p>
            </div>

            {/* Dataset Statistics Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">Historical Dataset Records</span>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Total Listing Instances:</span>
                <span className="font-semibold text-slate-800">{car.dataset_rental_count} transactions</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Average Rental Duration:</span>
                <span className="font-semibold text-slate-800">{car.dataset_avg_duration_days} days</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Observed Price Index Range:</span>
                <span className="font-semibold text-slate-800">{car.dataset_min_price_index} – {car.dataset_max_price_index}</span>
              </div>
            </div>

            {/* CTA: Open Price Predictor */}
            <Link
              to={`/predict?model=${car.model_id}&brand=${car.brand_id}&category=${car.default_category}`}
              className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Predict Custom Price for This Car</span>
            </Link>

            <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Evaluated through 3 Scikit-learn regression models</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
