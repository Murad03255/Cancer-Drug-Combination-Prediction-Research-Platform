import React, { useState, useEffect } from 'react';
import { FaFlask, FaDna, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaBolt, FaInfoCircle, FaRandom } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { predictSynergy, getDrugs, getCellLines } from '../services/api';
import MolecularViewer from '../components/MolecularViewer';
import ExplainableAI from '../components/ExplainableAI';
import ClinicalDossierPDF from '../components/ClinicalDossierPDF';

const QUICK_PRESETS = [
  { drugA: 'Dabrafenib', drugB: 'Trametinib', cellLine: 'A375', label: 'Melanoma (BRAF + MEK)' },
  { drugA: '5-FU', drugB: 'Cisplatin', cellLine: 'HCT116', label: 'Colorectal (Chemo Duo)' },
  { drugA: 'Olaparib', drugB: 'Temozolomide', cellLine: 'MCF7', label: 'Breast (PARP + Alkylating)' },
  { drugA: 'Venetoclax', drugB: 'Ibrutinib', cellLine: 'K-562', label: 'Leukemia (BCL2 + BTK)' },
];

export default function Predict() {
  const [drugs, setDrugs] = useState([]);
  const [cellLines, setCellLines] = useState([]);
  const [drugA, setDrugA] = useState('Dabrafenib');
  const [drugB, setDrugB] = useState('Trametinib');
  const [cellLine, setCellLine] = useState('A375');
  const [model, setModel] = useState('xgboost');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getDrugs().then(res => {
      if (res && res.length) {
        setDrugs(res);
        if (!res.includes('Dabrafenib')) setDrugA(res[0]);
        if (!res.includes('Trametinib')) setDrugB(res[1] || res[0]);
      }
    }).catch(() => {});

    getCellLines().then(res => {
      if (res && res.length) {
        setCellLines(res);
        if (!res.includes('A375')) setCellLine(res[0]);
      }
    }).catch(() => {});
  }, []);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    if (!drugA || !drugB || !cellLine) {
      toast.error('Please select Drug A, Drug B, and a Cancer Cell Line');
      return;
    }
    if (drugA.trim().toLowerCase() === drugB.trim().toLowerCase()) {
      toast.error('Drug A and Drug B must be distinct compounds');
      return;
    }

    setLoading(true);
    try {
      const data = await predictSynergy(drugA, drugB, cellLine, model);
      setResult(data);
      toast.success('Synergy evaluated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset) => {
    setDrugA(preset.drugA);
    setDrugB(preset.drugB);
    setCellLine(preset.cellLine);
  };

  const getSynergyBadge = (synergyClass, score) => {
    if (synergyClass === 'synergistic' || score > 10) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 shadow-lg shadow-teal-500/20">
          <FaCheckCircle className="text-xl text-teal-400 animate-bounce" />
          <div>
            <div className="font-extrabold text-sm uppercase tracking-wider">Synergistic Response</div>
            <div className="text-xs text-teal-200/80">Enhanced therapeutic efficacy (Bliss &gt; 10)</div>
          </div>
        </div>
      );
    } else if (synergyClass === 'antagonistic' || score < -10) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 shadow-lg shadow-rose-500/20">
          <FaTimesCircle className="text-xl text-rose-400" />
          <div>
            <div className="font-extrabold text-sm uppercase tracking-wider">Antagonistic Response</div>
            <div className="text-xs text-rose-200/80">Counter-productive / adverse combination (Bliss &lt; -10)</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/20">
          <FaExclamationTriangle className="text-xl text-amber-400" />
          <div>
            <div className="font-extrabold text-sm uppercase tracking-wider">Additive / Neutral</div>
            <div className="text-xs text-amber-200/80">No marked synergistic boost (-10 ≤ Bliss ≤ 10)</div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider">
          <FaBolt /> Supervised Drug-Pair Synergy Prediction
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
          Predict Cancer Drug Combination <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">Synergy</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Screen combinations across 391,000+ experimental DrugComb profiles using gradient-boosted trees and deep representation learning.
        </p>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-slate-500 flex items-center gap-1"><FaFlask /> Quick Presets:</span>
          {QUICK_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(p)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-teal-300 transition"
            >
              {p.drugA} + {p.drugB} ({p.label})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form + Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Configuration Card */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaFlask className="text-teal-400" /> Assay Configuration
            </h2>
            <span className="text-xs text-slate-400 font-mono">Bliss Independence</span>
          </div>

          <form onSubmit={handlePredict} className="space-y-5">
            {/* Drug A */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                First Agent (Drug A)
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="drugs-list-a"
                  value={drugA}
                  onChange={(e) => setDrugA(e.target.value)}
                  placeholder="Select or type Drug A (e.g. Dabrafenib)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-white placeholder-slate-500 text-sm font-medium outline-none transition"
                  required
                />
                <datalist id="drugs-list-a">
                  {drugs.map((d, i) => <option key={`a-${i}`} value={d} />)}
                </datalist>
              </div>
            </div>

            {/* Drug B */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Second Agent (Drug B)
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="drugs-list-b"
                  value={drugB}
                  onChange={(e) => setDrugB(e.target.value)}
                  placeholder="Select or type Drug B (e.g. Trametinib)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-white placeholder-slate-500 text-sm font-medium outline-none transition"
                  required
                />
                <datalist id="drugs-list-b">
                  {drugs.map((d, i) => <option key={`b-${i}`} value={d} />)}
                </datalist>
              </div>
            </div>

            {/* Cancer Cell Line */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Target Cancer Cell Line
              </label>
              <div className="relative">
                <select
                  value={cellLine}
                  onChange={(e) => setCellLine(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-white text-sm font-medium outline-none transition cursor-pointer"
                >
                  {cellLines.map((cl, i) => (
                    <option key={`cl-${i}`} value={cl}>{cl}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Model Architecture Selection */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Inference Architecture
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'xgboost', label: 'XGBoost', desc: 'Main / Highest Acc.' },
                  { id: 'random_forest', label: 'Random Forest', desc: 'Ensemble' },
                  { id: 'ridge', label: 'Ridge', desc: 'Linear Baseline' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModel(m.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      model === m.id
                        ? 'bg-teal-500/15 border-teal-500/60 text-teal-300 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="text-xs font-bold leading-none">{m.label}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 hover:from-teal-300 hover:to-cyan-200 transition-all shadow-lg shadow-teal-500/25 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Evaluating Molecular Pair...
                </>
              ) : (
                <>
                  <FaBolt className="text-slate-950" />
                  Evaluate Synergy Response
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output & Interpretation Panel */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Status & Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Primary Target Output</span>
                  <h3 className="text-2xl font-black text-white mt-0.5">
                    {result.drug_a} + {result.drug_b}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assayed on <span className="text-indigo-400 font-semibold">{result.cell_line}</span>
                    {result.cancer_type && result.cancer_type !== 'Unknown' && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        {result.cancer_type}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <ClinicalDossierPDF result={result} />
                  {getSynergyBadge(result.synergy_class, result.synergy_score)}
                </div>
              </div>

              {/* Key Quantitative Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Bliss Synergy Score</div>
                  <div className={`text-3xl font-black mt-1 ${result.synergy_score > 10 ? 'text-teal-400' : result.synergy_score < -10 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {result.synergy_score > 0 ? `+${result.synergy_score.toFixed(2)}` : result.synergy_score.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">&gt; 10 indicates synergy</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Model Agreement</div>
                  <div className="text-3xl font-black text-white mt-1">
                    {(result.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Cross-model consensus</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Active Model</div>
                  <div className="text-xl font-bold text-indigo-300 mt-2 uppercase tracking-wide">
                    {result.model_used}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">GroupKFold validated</div>
                </div>
              </div>

              {/* Multi-Model Comparison Accordion */}
              {result.all_predictions && (
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Model Architecture Comparison</span>
                    <span className="text-[11px] text-slate-500 font-normal">Score (Bliss)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                      <div className="text-slate-500 font-mono text-[10px]">XGBOOST</div>
                      <div className="font-bold text-teal-300 mt-1">{result.all_predictions.xgboost}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                      <div className="text-slate-500 font-mono text-[10px]">RANDOM FOREST</div>
                      <div className="font-bold text-indigo-300 mt-1">{result.all_predictions.random_forest}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                      <div className="text-slate-500 font-mono text-[10px]">RIDGE BASELINE</div>
                      <div className="font-bold text-slate-400 mt-1">{result.all_predictions.ridge}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-teal-500/30 text-center">
                      <div className="text-teal-400 font-mono text-[10px]">ENSEMBLE MEAN</div>
                      <div className="font-bold text-teal-400 mt-1">{result.all_predictions.ensemble}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Explainable AI (XAI) Feature Attribution & Waterfall */}
              <ExplainableAI result={result} />
            </div>
          ) : (
            /* Empty State Placeholder */
            <div className="glass-card rounded-2xl p-12 text-center space-y-4 border border-dashed border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600 text-2xl">
                <FaDna />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-bold text-white text-base">Ready for Assay Inference</h3>
                <p className="text-xs text-slate-400">
                  Select your two active pharmacological agents and target cell line on the left to evaluate synergy.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2D Molecular Chemical Structure & Biological MoA Explorer */}
      <MolecularViewer drugA={drugA} drugB={drugB} />
    </div>
  );
}
