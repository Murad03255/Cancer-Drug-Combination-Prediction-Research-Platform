import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaDna, FaLock, FaEnvelope, FaUser, FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { signupUser } from '../services/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your full name or lab affiliation');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await signupUser(name.trim(), email.trim().toLowerCase(), password);
      localStorage.setItem('synergionco_token', res.access_token);
      localStorage.setItem('synergionco_user', JSON.stringify(res.user));
      // Dispatch storage event so Navbar updates immediately
      window.dispatchEvent(new Event('storage'));
      toast.success(`Welcome to Cancer Drug Combination Platform, ${res.user.name || res.user.email}!`);
      const targetPath = location.state?.from?.pathname || '/';
      navigate(targetPath, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
            <FaDna className="text-white text-xl animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white">Register Researcher</h2>
          <p className="text-xs text-slate-400">Join the cancer research and prediction platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Full Name / Lab Affiliation</label>
            <div className="relative flex items-center">
              <FaUser className="absolute left-3.5 text-slate-500 text-xs" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Alexander Fleming"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white text-xs outline-none transition"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative flex items-center">
              <FaEnvelope className="absolute left-3.5 text-slate-500 text-xs" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@oncolab.org"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white text-xs outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password (Min. 6 chars)</label>
            <div className="relative flex items-center">
              <FaLock className="absolute left-3.5 text-slate-500 text-xs" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white text-xs outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-500 hover:text-slate-300 text-xs"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
            <div className="relative flex items-center">
              <FaLock className="absolute left-3.5 text-slate-500 text-xs" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white text-xs outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-teal-400 to-indigo-400 hover:from-teal-300 hover:to-indigo-300 transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Registering Account...
              </>
            ) : (
              <>
                <FaUserPlus /> Complete Registration
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" state={location.state} className="text-teal-400 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
