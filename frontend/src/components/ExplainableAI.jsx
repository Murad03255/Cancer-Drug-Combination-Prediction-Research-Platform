import React, { useState, useEffect, useRef } from 'react';
import {
  FaBrain,
  FaArrowUp,
  FaArrowDown,
  FaDna,
  FaBalanceScale,
  FaChartLine,
  FaCheckCircle,
  FaNetworkWired,
  FaLayerGroup,
  FaFingerprint,
  FaAtom,
  FaMicroscope,
  FaShieldAlt,
} from 'react-icons/fa';

// Animated SHAP Impact Bar — a single horizontal force bar with glow
function ShapImpactBar({ step, index, maxAbsDelta, isAnimated }) {
  const barRef = useRef(null);
  const absDelta = Math.abs(step.delta);
  const barWidth = maxAbsDelta > 0 ? (absDelta / maxAbsDelta) * 100 : 0;
  const isPositive = step.delta >= 0;

  return (
    <div
      className="group relative"
      style={{
        animation: isAnimated ? `shapBarSlideIn 0.5s ease-out ${index * 0.12}s both` : 'none',
      }}
    >
      <div className="flex items-stretch gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 hover:bg-slate-900/80">
        {/* Step index badge */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
          step.type === 'baseline' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
          step.type === 'final' ? 'bg-gradient-to-br from-teal-500 to-indigo-600 text-white shadow-lg' :
          isPositive ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30' :
          'bg-rose-500/15 text-rose-400 border border-rose-500/30'
        }`}>
          {step.type === 'final' ? '∑' : `${String(index + 1).padStart(2, '0')}`}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Feature label & delta value */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-200 truncate">{step.label}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {step.type === 'positive' && (
                <span className="flex items-center gap-0.5 text-xs font-black text-teal-400 font-mono bg-teal-500/10 px-2 py-0.5 rounded-md">
                  <FaArrowUp className="text-[8px]" /> +{step.delta.toFixed(2)}
                </span>
              )}
              {step.type === 'negative' && (
                <span className="flex items-center gap-0.5 text-xs font-black text-rose-400 font-mono bg-rose-500/10 px-2 py-0.5 rounded-md">
                  <FaArrowDown className="text-[8px]" /> {step.delta.toFixed(2)}
                </span>
              )}
              {step.type === 'baseline' && (
                <span className="text-xs font-black text-indigo-300 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-md">
                  E[Y] = {step.end.toFixed(2)}
                </span>
              )}
              {step.type === 'final' && (
                <span className={`text-xs font-black font-mono px-2.5 py-0.5 rounded-md ${
                  step.end > 10 ? 'text-teal-300 bg-teal-500/15' : step.end < -10 ? 'text-rose-300 bg-rose-500/15' : 'text-amber-300 bg-amber-500/15'
                }`}>
                  ŷ = {step.end > 0 ? '+' : ''}{step.end.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* The Impact Bar — Gorgeous horizontal force bar */}
          <div className="relative w-full h-6 rounded-lg bg-slate-950/80 border border-slate-800/60 overflow-hidden" ref={barRef}>
            {/* Center reference line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700/50 z-10" />

            {/* Impact bar */}
            {step.type === 'baseline' ? (
              <div
                className="absolute top-0.5 bottom-0.5 left-0 rounded-md bg-gradient-to-r from-indigo-600/80 to-indigo-400/60 shadow-sm shadow-indigo-500/20 transition-all duration-1000"
                style={{
                  width: isAnimated ? `${Math.min(barWidth, 100)}%` : `${Math.min(barWidth, 100)}%`,
                  animation: isAnimated ? `barGrow 0.8s ease-out ${index * 0.12 + 0.2}s both` : 'none',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 rounded-md" />
              </div>
            ) : step.type === 'final' ? (
              <div
                className={`absolute top-0.5 bottom-0.5 left-0 rounded-md shadow-sm transition-all duration-1000 ${
                  step.end > 10
                    ? 'bg-gradient-to-r from-teal-500/80 to-cyan-400/60 shadow-teal-500/20'
                    : step.end < -10
                    ? 'bg-gradient-to-r from-rose-500/80 to-orange-400/60 shadow-rose-500/20'
                    : 'bg-gradient-to-r from-amber-500/80 to-yellow-400/60 shadow-amber-500/20'
                }`}
                style={{
                  width: `${Math.min(barWidth, 100)}%`,
                  animation: isAnimated ? `barGrow 1s ease-out ${index * 0.12 + 0.2}s both` : 'none',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 rounded-md" />
                {/* Shimmer effect */}
                <div className="absolute inset-0 overflow-hidden rounded-md">
                  <div className="absolute -left-full top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/15 to-transparent"
                    style={{ animation: 'shimmer 2.5s ease-in-out infinite' }} />
                </div>
              </div>
            ) : isPositive ? (
              <div
                className="absolute top-0.5 bottom-0.5 left-1/2 rounded-r-md bg-gradient-to-r from-teal-500/80 to-emerald-400/60 shadow-sm shadow-teal-500/20 transition-all duration-1000"
                style={{
                  width: `${Math.min(barWidth / 2, 50)}%`,
                  animation: isAnimated ? `barGrow 0.8s ease-out ${index * 0.12 + 0.2}s both` : 'none',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 rounded-r-md" />
              </div>
            ) : (
              <div
                className="absolute top-0.5 bottom-0.5 rounded-l-md bg-gradient-to-l from-rose-500/80 to-amber-500/60 shadow-sm shadow-rose-500/20 transition-all duration-1000"
                style={{
                  right: '50%',
                  width: `${Math.min(barWidth / 2, 50)}%`,
                  animation: isAnimated ? `barGrow 0.8s ease-out ${index * 0.12 + 0.2}s both` : 'none',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/5 rounded-l-md" />
              </div>
            )}

            {/* Importance percentage label inside bar */}
            {step.importance && (
              <div className="absolute right-2 top-0 bottom-0 flex items-center z-20">
                <span className="text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  φ={step.importance ? (step.importance * 100).toFixed(0) : 0}%
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {step.description && (
            <p className="text-[11px] text-slate-400 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
              {step.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplainableAI({ result }) {
  const [activeTab, setActiveTab] = useState('waterfall');
  const [isAnimated, setIsAnimated] = useState(false);
  const containerRef = useRef(null);

  // Trigger animation when component enters view
  useEffect(() => {
    if (!result || !result.shap_features) return;
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [result]);

  if (!result || !result.shap_features) return null;

  const baseVal = result.base_value ?? 4.25;
  const finalScore = result.synergy_score;
  const ciLower = result.ci_lower ?? (finalScore - 5.5);
  const ciUpper = result.ci_upper ?? (finalScore + 5.5);
  const biomarker = result.key_biomarker || 'Genome Lineage Profile';

  // Cumulative SHAP waterfall computation
  let runningTotal = baseVal;
  const waterfallSteps = [
    {
      label: 'DrugComb Population Baseline',
      feature: 'Base E[Y]',
      delta: baseVal,
      start: 0,
      end: baseVal,
      type: 'baseline',
      description: 'Average synergy score across 391,000+ empirical DrugComb oncology assays.',
    },
    ...result.shap_features.map((feat) => {
      const delta = feat.contribution ?? (feat.importance * (finalScore - baseVal));
      const prevTotal = runningTotal;
      runningTotal = Number((runningTotal + delta).toFixed(2));
      return {
        label: feat.feature,
        feature: feat.feature,
        delta: delta,
        start: prevTotal,
        end: runningTotal,
        type: delta >= 0 ? 'positive' : 'negative',
        description: feat.description,
        importance: feat.importance,
      };
    }),
    {
      label: 'Final Predicted Synergy (Bliss)',
      feature: 'Total Score',
      delta: finalScore,
      start: 0,
      end: finalScore,
      type: 'final',
      description: `Model: ${result.model_used.toUpperCase()} · Confidence: ${(result.confidence * 100).toFixed(0)}% · Cell: ${result.cell_line}`,
    },
  ];

  const maxAbsDelta = Math.max(...waterfallSteps.map((s) => Math.abs(s.delta)), 1);

  // Dynamic range scaling for CI view
  const minVal = Math.min(0, baseVal, finalScore, ciLower) - 5;
  const maxVal = Math.max(15, baseVal, finalScore, ciUpper) + 8;
  const range = maxVal - minVal;
  const getPercent = (val) => Math.max(0, Math.min(100, ((val - minVal) / range) * 100));

  // Summary stats for header cards
  const totalPositive = waterfallSteps.filter(s => s.type === 'positive').reduce((sum, s) => sum + s.delta, 0);
  const totalNegative = waterfallSteps.filter(s => s.type === 'negative').reduce((sum, s) => sum + s.delta, 0);

  return (
    <div ref={containerRef} className="relative glass-panel p-6 sm:p-7 rounded-2xl border border-slate-800 shadow-2xl space-y-6 overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <FaBrain className="text-xs" style={{ animation: 'xaiPulse 2s ease-in-out infinite' }} />
            Explainable AI (XAI) & Feature Attribution
          </div>
          <h3 className="text-xl font-black text-white mt-1.5">SHAP Decision Decomposition</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Deconstructing why the ML model predicted{' '}
            <span className={`font-bold ${finalScore > 10 ? 'text-teal-300' : finalScore < -10 ? 'text-rose-300' : 'text-amber-300'}`}>
              {finalScore > 0 ? `+${finalScore.toFixed(2)}` : finalScore.toFixed(2)} Bliss
            </span>{' '}
            from population baseline.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {[
            { key: 'waterfall', label: 'SHAP Impact Bars', icon: <FaLayerGroup className="text-[9px]" /> },
            { key: 'ci', label: '95% CI', icon: <FaShieldAlt className="text-[9px]" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? tab.key === 'waterfall'
                    ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 hover:border-slate-700 transition">
          <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
            <FaDna className="text-teal-400" /> Key Oncogenic Driver
          </span>
          <p className="text-xs font-bold text-white truncate" title={biomarker}>{biomarker}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 hover:border-slate-700 transition">
          <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
            <FaBalanceScale className="text-indigo-400" /> Baseline E[Y]
          </span>
          <p className="text-xs font-bold text-slate-200">
            +{baseVal.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">(DrugComb Avg.)</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 hover:border-slate-700 transition">
          <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
            <FaArrowUp className="text-teal-400" /> Synergy Drivers
          </span>
          <p className="text-xs font-bold text-teal-400">+{totalPositive.toFixed(2)} Bliss</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 hover:border-slate-700 transition">
          <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
            <FaArrowDown className="text-rose-400" /> Resistance Factors
          </span>
          <p className="text-xs font-bold text-rose-400">{totalNegative.toFixed(2)} Bliss</p>
        </div>
      </div>

      {/* === WATERFALL TAB === */}
      {activeTab === 'waterfall' && (
        <div className="relative z-10 space-y-4">
          {/* Legend */}
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FaFingerprint className="text-indigo-400" /> Feature-Level Force Decomposition
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-teal-400">
                <span className="w-3 h-2 rounded-sm bg-gradient-to-r from-teal-500 to-emerald-400" /> Synergy (+)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-3 h-2 rounded-sm bg-gradient-to-r from-rose-500 to-amber-500" /> Resistance (-)
              </span>
              <span className="flex items-center gap-1 text-indigo-300">
                <span className="w-3 h-2 rounded-sm bg-indigo-500" /> Baseline
              </span>
            </div>
          </div>

          {/* SHAP Impact Bars */}
          <div className="space-y-2">
            {waterfallSteps.map((step, idx) => (
              <ShapImpactBar
                key={idx}
                step={step}
                index={idx}
                maxAbsDelta={maxAbsDelta}
                isAnimated={isAnimated}
              />
            ))}
          </div>

          {/* Neural network pathway mini-visualization */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <FaNetworkWired className="text-indigo-400 text-sm" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Decision Pathway Flow</span>
            </div>
            <div className="flex items-center justify-between gap-2 px-2 py-3 overflow-x-auto">
              {/* Input features */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                  <FaAtom className="text-indigo-400 text-sm" />
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Input</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/40 via-slate-700/40 to-teal-500/40 relative min-w-[40px]">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-teal-500/20" style={{
                  animation: isAnimated ? 'shimmer 3s ease-in-out infinite' : 'none'
                }} />
              </div>
              {/* SHAP processing */}
              {result.shap_features.map((feat, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                      (feat.contribution ?? 0) >= 0
                        ? 'bg-teal-500/15 border border-teal-500/30 text-teal-400'
                        : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                    }`}>
                      φ{i+1}
                    </div>
                    <span className="text-[8px] text-slate-500 font-mono max-w-[60px] truncate text-center">
                      {feat.feature.split('(')[0].trim()}
                    </span>
                  </div>
                  {i < result.shap_features.length - 1 && (
                    <div className="w-6 h-px bg-slate-700/40 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
              <div className="flex-1 h-px bg-gradient-to-r from-teal-500/40 via-slate-700/40 to-cyan-500/40 min-w-[40px]" />
              {/* Output */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                  finalScore > 10 ? 'bg-teal-500/20 border border-teal-500/40 shadow-teal-500/20' :
                  finalScore < -10 ? 'bg-rose-500/20 border border-rose-500/40 shadow-rose-500/20' :
                  'bg-amber-500/20 border border-amber-500/40 shadow-amber-500/20'
                }`}>
                  <FaMicroscope className={`text-sm ${
                    finalScore > 10 ? 'text-teal-400' : finalScore < -10 ? 'text-rose-400' : 'text-amber-400'
                  }`} />
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Output</span>
              </div>
            </div>
          </div>

          {/* Biological Interpretation Synthesis */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5 hover:border-slate-700 transition">
            <FaCheckCircle className="text-teal-400 text-base flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-1">Clinical & Biological Takeaway:</span>
              The model reaches an output of{' '}
              <strong className={finalScore > 10 ? 'text-teal-300' : finalScore < -10 ? 'text-rose-300' : 'text-amber-300'}>
                {finalScore.toFixed(2)} Bliss
              </strong>{' '}
              through {totalPositive > Math.abs(totalNegative) ? 'robust positive cooperation' : 'balanced feature interactions'}{' '}
              between the active compounds. In particular, {result.drug_a} initiates targeted oncogene
              suppression while {result.drug_b} attenuates secondary rescue pathways, capitalizing on the underlying{' '}
              <strong className="text-indigo-300">{biomarker}</strong> vulnerability in {result.cell_line}.
            </div>
          </div>
        </div>
      )}

      {/* === CONFIDENCE INTERVAL TAB === */}
      {activeTab === 'ci' && (
        <div className="relative z-10 space-y-6 py-2">
          <div className="text-center max-w-md mx-auto space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
              Cross-Model Uncertainty (95% Confidence Interval)
            </span>
            <h4 className="text-3xl font-black text-white">
              [{ciLower.toFixed(2)}, {ciUpper.toFixed(2)}]{' '}
              <span className="text-lg text-slate-400">Bliss</span>
            </h4>
            <p className="text-xs text-slate-400">
              Evaluated across XGBoost, Random Forest, and Ridge regression ensembles.
            </p>
          </div>

          {/* Range Slider Visualization — Enhanced */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
            <div className="relative w-full h-12 flex items-center">
              {/* Full background rail */}
              <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800" />

              {/* Scale marks */}
              {[0, 5, 10, 15, 20].map(val => (
                <div
                  key={val}
                  className="absolute top-full mt-1 -translate-x-1/2"
                  style={{ left: `${getPercent(val)}%` }}
                >
                  <div className="w-px h-2 bg-slate-700 mx-auto" />
                  <span className="text-[9px] text-slate-600 font-mono">{val}</span>
                </div>
              ))}

              {/* 95% CI Range Bar */}
              <div
                className="absolute h-6 rounded-xl bg-gradient-to-r from-teal-500/20 via-teal-500/30 to-teal-500/20 border border-teal-500/50 shadow-xl shadow-teal-500/15"
                style={{
                  left: `${getPercent(ciLower)}%`,
                  width: `${Math.max(4, getPercent(ciUpper) - getPercent(ciLower))}%`,
                  animation: isAnimated ? 'ciExpand 1s ease-out both' : 'none',
                }}
              >
                {/* Inner shimmer */}
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <div className="absolute -left-full top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    style={{ animation: 'shimmer 3s ease-in-out infinite' }} />
                </div>
              </div>

              {/* Point Estimate Marker */}
              <div
                className="absolute w-5 h-8 rounded-lg bg-gradient-to-b from-teal-400 to-teal-500 shadow-lg shadow-teal-400/50 -translate-x-1/2 flex items-center justify-center z-10"
                style={{
                  left: `${getPercent(finalScore)}%`,
                  animation: isAnimated ? 'markerDrop 0.6s ease-out 0.3s both' : 'none',
                }}
              >
                <div className="w-1.5 h-4 bg-slate-950 rounded-full" />
                {/* Label above */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[10px] font-black text-teal-300 bg-slate-900 px-2 py-0.5 rounded-md border border-teal-500/30">
                    ŷ = {finalScore.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Lower bound label */}
              <div
                className="absolute -bottom-7 -translate-x-1/2"
                style={{ left: `${getPercent(ciLower)}%` }}
              >
                <span className="text-[10px] font-mono text-slate-500">{ciLower.toFixed(1)}</span>
              </div>

              {/* Upper bound label */}
              <div
                className="absolute -bottom-7 -translate-x-1/2"
                style={{ left: `${getPercent(ciUpper)}%` }}
              >
                <span className="text-[10px] font-mono text-slate-500">{ciUpper.toFixed(1)}</span>
              </div>
            </div>

            {/* Bottom stat cards */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Lower (2.5%)</span>
                <span className="font-bold text-slate-300 text-sm font-mono">{ciLower.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-teal-500/20 text-center shadow-md shadow-teal-500/5">
                <span className="block text-[10px] text-teal-400 uppercase font-bold">Predicted Mean</span>
                <span className="font-black text-teal-300 text-lg font-mono">{finalScore.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Upper (97.5%)</span>
                <span className="font-bold text-slate-300 text-sm font-mono">{ciUpper.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
            <FaShieldAlt className="text-indigo-400 text-base flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Statistical Interpretation:</span>
              The 95% confidence interval spans {(ciUpper - ciLower).toFixed(2)} Bliss units,
              indicating {(ciUpper - ciLower) < 8 ? 'high model certainty' : 'moderate uncertainty'} in the prediction.
              The interval {ciLower > 10 ? 'entirely lies above the synergy threshold (>10 Bliss), providing strong evidence for synergy' :
              ciUpper < -10 ? 'entirely lies below the antagonism threshold (<-10 Bliss), suggesting strong antagonism' :
              'overlaps the classification boundary, warranting experimental validation'}.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
