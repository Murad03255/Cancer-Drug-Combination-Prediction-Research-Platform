import React, { useState, useEffect } from 'react';
import { FaChartBar, FaTrophy, FaDna, FaLayerGroup, FaCheckCircle } from 'react-icons/fa';
import Plot from 'react-plotly.js';
import { getModelMetrics } from '../services/api';

export default function Benchmarks() {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    getModelMetrics().then(res => {
      if (res && res.length) setMetrics(res);
    }).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <FaTrophy /> Rigorous Benchmark Suite
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Model Comparison &amp; <span className="bg-gradient-to-r from-amber-400 to-teal-400 bg-clip-text text-transparent">Benchmarks</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Empirical evaluation on real DrugComb synergy experiments using GroupKFold drug-pair partitioning (zero data leakage).
        </p>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            name: 'XGBoost Regressor',
            type: 'Primary Production Engine',
            desc: 'Histogram gradient-boosted decision trees optimized for high interaction density across molecular fingerprints.',
            badge: 'Top Performer (r = 0.629)',
            badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
            borderColor: 'border-teal-500/40',
            auc: '0.811',
            r: '0.629',
            precision: '85.8%',
            rmse: '15.85',
          },
          {
            name: 'Random Forest',
            type: 'Ensemble Baseline',
            desc: 'Ensemble of bagging decision trees capturing non-linear biological pathways with minimum variance.',
            badge: 'Ensemble (r = 0.602)',
            badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
            borderColor: 'border-slate-800',
            auc: '0.776',
            r: '0.602',
            precision: '83.8%',
            rmse: '16.28',
          },
          {
            name: 'Ridge Regression',
            type: 'Linear Baseline',
            desc: 'L2-penalized linear model establishing reference baseline performance for non-interactive additive effects.',
            badge: 'Baseline (r = 0.269)',
            badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
            borderColor: 'border-slate-800',
            auc: '0.614',
            r: '0.269',
            precision: '0.0%',
            rmse: '19.65',
          },
        ].map((m, idx) => (
          <div key={idx} className={`glass-panel p-6 rounded-2xl border ${m.borderColor} shadow-xl space-y-5 relative`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${m.badgeColor}`}>
                {m.badge}
              </span>
              <span className="text-slate-500 text-xs font-mono">5-Fold CV</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">{m.name}</h3>
              <p className="text-xs text-indigo-300 font-medium">{m.type}</p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{m.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80">
                <div className="text-slate-500 text-[10px]">PEARSON CORRELATION (r)</div>
                <div className="font-bold text-white text-base mt-0.5">{m.r}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80">
                <div className="text-slate-500 text-[10px]">ROC-AUC</div>
                <div className="font-bold text-teal-400 text-base mt-0.5">{m.auc}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80">
                <div className="text-slate-500 text-[10px]">SYNERGY PRECISION</div>
                <div className="font-bold text-white text-base mt-0.5">{m.precision}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80">
                <div className="text-slate-500 text-[10px]">RMSE</div>
                <div className="font-bold text-slate-300 text-base mt-0.5">{m.rmse}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Plot */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FaChartBar className="text-amber-400" />
            Comparative Benchmark Bar Chart
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Pearson Correlation (r) &amp; ROC-AUC across validation folds</p>
        </div>

        <div className="w-full flex justify-center overflow-hidden">
          <Plot
            data={[
              {
                x: ['XGBoost', 'Random Forest', 'Ridge Baseline'],
                y: [0.629, 0.602, 0.269],
                name: 'Pearson r (Linear Concordance)',
                type: 'bar',
                marker: { color: '#14b8a6' }
              },
              {
                x: ['XGBoost', 'Random Forest', 'Ridge Baseline'],
                y: [0.811, 0.776, 0.614],
                name: 'ROC-AUC (Synergy Classification)',
                type: 'bar',
                marker: { color: '#6366f1' }
              },
              {
                x: ['XGBoost', 'Random Forest', 'Ridge Baseline'],
                y: [0.858, 0.838, 0.0],
                name: 'Precision (True Positive Ratio)',
                type: 'bar',
                marker: { color: '#f59e0b' }
              }
            ]}
            layout={{
              autosize: true,
              width: 750,
              height: 380,
              barmode: 'group',
              margin: { l: 40, r: 20, t: 30, b: 50 },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              font: { color: '#94a3b8', size: 11 },
              yaxis: { range: [0, 1.0], gridcolor: '#1e293b' },
              xaxis: { gridcolor: '#1e293b' },
              legend: { orientation: 'h', y: 1.15 }
            }}
            config={{ responsive: true, displayModeBar: false }}
          />
        </div>
      </div>
    </div>
  );
}
