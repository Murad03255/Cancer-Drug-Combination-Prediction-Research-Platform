import React from 'react';
import { FaShieldAlt, FaExternalLinkAlt, FaDatabase } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      {/* Research Disclaimer Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-indigo-500/10 border-b border-slate-800/60 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs text-amber-200/90 font-medium text-center">
          <FaShieldAlt className="text-amber-400 shrink-0 text-sm" />
          <span>
            <strong>RESEARCH USE ONLY:</strong> Cancer Drug Combination Prediction &amp; Research Platform is a computational framework for wet-lab prioritization. It is <u>not</u> intended for clinical diagnosis, patient management, or medical decision-making.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300">Cancer Drug Combination Prediction &amp; Research Platform</span>
          <span>•</span>
          <span>Powered by XGBoost, Random Forest, & DrugComb DB</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1 hover:text-teal-400 transition">
            <FaDatabase /> 391,000+ Screened Combinations
          </span>
          <span>•</span>
          <a
            href="https://drugcomb.org/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-teal-400 transition"
          >
            DrugComb Consortium <FaExternalLinkAlt className="text-[10px]" />
          </a>
        </div>
      </div>
    </footer>
  );
}
