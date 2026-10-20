import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Predict from './pages/Predict';
import Recommend from './pages/Recommend';
import Evaluate from './pages/Evaluate';
import Benchmarks from './pages/Benchmarks';
import SingleDrug from './pages/SingleDrug';
import SynergyFinder from './pages/SynergyFinder';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950 relative overflow-x-hidden">
        {/* Subtle background ambient mesh glow */}
        <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* Protected Research & Prediction Tools */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Predict />
                </ProtectedRoute>
              }
            />
            <Route
              path="/synergy-finder"
              element={
                <ProtectedRoute>
                  <SynergyFinder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/single-drug"
              element={
                <ProtectedRoute>
                  <SingleDrug />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommend"
              element={
                <ProtectedRoute>
                  <Recommend />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluate"
              element={
                <ProtectedRoute>
                  <Evaluate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benchmarks"
              element={
                <ProtectedRoute>
                  <Benchmarks />
                </ProtectedRoute>
              }
            />

            {/* Public Authentication Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '13px',
              borderRadius: '12px',
            },
          }}
        />
      </div>
    </Router>
  );
}
