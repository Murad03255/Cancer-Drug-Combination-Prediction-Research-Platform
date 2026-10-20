import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaDna, FaChartBar, FaFlask, FaListOl, FaUser, FaSignOutAlt, FaCircle, FaCapsules, FaCube } from 'react-icons/fa';
import { getHealth } from '../services/api';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [health, setHealth] = useState({ status: 'connecting', model_loaded: false });

  useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem('synergionco_user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch (e) { setUser(null); }
      } else {
        setUser(null);
      }
    };

    syncUser();
    window.addEventListener('storage', syncUser);

    getHealth()
      .then(res => setHealth(res))
      .catch(() => setHealth({ status: 'offline', model_loaded: false }));

    return () => window.removeEventListener('storage', syncUser);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('synergionco_token');
    localStorage.removeItem('synergionco_user');
    setUser(null);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Pair Prediction', path: '/', icon: <FaDna className="text-teal-400" /> },
    { name: 'SynergyFinder 3D', path: '/synergy-finder', icon: <FaCube className="text-emerald-400" /> },
    { name: 'Medicine Suggestions (Hybrid)', path: '/single-drug', icon: <FaCapsules className="text-cyan-400" /> },
    { name: 'Discovery & Recommendations', path: '/recommend', icon: <FaListOl className="text-indigo-400" /> },
    { name: 'Lab Evaluation', path: '/evaluate', icon: <FaFlask className="text-pink-400" /> },
    { name: 'Model Benchmarks', path: '/benchmarks', icon: <FaChartBar className="text-amber-400" /> },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
              <FaDna className="text-white text-xl animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-teal-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                Cancer Drug Prediction<span className="text-teal-400 font-mono text-xs ml-1 px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/30">Platform</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Cancer Drug Combination Prediction &amp; Research Platform</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-slate-800 text-teal-300 shadow-inner border border-slate-700/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: System Status & User Profile */}
          <div className="flex items-center gap-3">
            {/* Live Model Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
              <FaCircle className={`text-[8px] ${health.model_loaded ? 'text-teal-400 animate-ping' : 'text-amber-500'}`} />
              <span className="text-slate-400 text-[11px]">
                {health.model_loaded ? 'DrugComb AI Online' : 'Connecting...'}
              </span>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
                  <FaUser className="text-teal-400" />
                  <span className="font-semibold">{user.name || user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-md shadow-teal-500/20 transition hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
