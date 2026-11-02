import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Cpu, History, Search, Compass, Menu, X, Sparkles, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isLab = location.pathname.startsWith('/lab');

  const navLinks = [
    { name: 'Home', path: '/', icon: Car },
    { name: 'Explore Cars', path: '/explore', icon: Compass },
    { name: 'Predict Price', path: '/predict', icon: Sparkles },
    { name: 'Prediction History', path: '/history', icon: History },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">CarRent</span>
                <span className="px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-blue-100 text-blue-700">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">DMBI Intelligent Pricing</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Data Mining Lab CTA Button */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/lab"
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all ${
                isLab
                  ? 'bg-gradient-to-r from-indigo-700 to-purple-800 text-white ring-2 ring-indigo-400 ring-offset-2'
                  : 'bg-slate-900 text-white hover:bg-indigo-900 hover:shadow-indigo-500/20'
              }`}
            >
              <Cpu className="w-4 h-4 text-indigo-300 animate-pulse" />
              <span>Data Mining Lab</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/30 text-indigo-200">Viva Mode</span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <Link
              to="/lab"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-300" />
              <span>Lab</span>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/lab"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-semibold bg-indigo-900 text-white shadow-sm"
            >
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-indigo-300" />
                <span>Enter Data Mining Lab</span>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-300" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
