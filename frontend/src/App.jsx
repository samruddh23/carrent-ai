import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ExploreCarsPage from './pages/ExploreCarsPage';
import CarDetailsPage from './pages/CarDetailsPage';
import PredictionPage from './pages/PredictionPage';
import HistoryPage from './pages/HistoryPage';
import DataMiningLab from './pages/DataMiningLab';

export default function App() {
  const location = useLocation();
  const isLab = location.pathname.startsWith('/lab');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExploreCarsPage />} />
          <Route path="/cars/:id" element={<CarDetailsPage />} />
          <Route path="/predict" element={<PredictionPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/lab" element={<DataMiningLab />} />
        </Routes>
      </main>
      {!isLab && <Footer />}
    </div>
  );
}
