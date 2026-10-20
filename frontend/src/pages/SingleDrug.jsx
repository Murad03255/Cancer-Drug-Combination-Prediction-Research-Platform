import React, { useState, useEffect } from 'react';
import { FaCapsules, FaFlask, FaCheckCircle, FaStar, FaBolt, FaLayerGroup, FaArrowUp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getHybridOptions, predictHybrid } from '../services/api';

const TCGA_LABELS = {
  'SKCM': 'Skin Cutaneous Melanoma',
  'BRCA': 'Breast Invasive Carcinoma',
  'LUAD': 'Lung Adenocarcinoma',
  'LUSC': 'Lung Squamous Cell Carcinoma',
  'COAD/READ': 'Colorectal Adenocarcinoma',
  'GBM': 'Glioblastoma Multiforme',
  'OV': 'Ovarian Serous Cystadenocarcinoma',
  'PRAD': 'Prostate Adenocarcinoma',
  'KIRC': 'Kidney Renal Clear Cell',
  'BLCA': 'Bladder Urothelial Carcinoma',
  'HNSC': 'Head & Neck Squamous Cell',
  'STAD': 'Stomach Adenocarcinoma',
  'PAAD': 'Pancreatic Adenocarcinoma',
  'LIHC': 'Liver Hepatocellular Carcinoma',
};

const PRESETS = [
  { test: 'Adherent', cancer: 'SKCM', drugs: 'Cisplatin, Docetaxel', label: 'Melanoma (Adherent)' },
  { test: 'Adherent', cancer: 'BRCA', drugs: 'Tamoxifen, Paclitaxel', label: 'Breast Cancer (BRCA)' },
  { test: 'Suspension', cancer: 'LAML', drugs: 'Cytarabine, Daunorubicin', label: 'Leukemia (Suspension)' },
];

export default function SingleDrug() {
  const [testOptions, setTestOptions] = useState([]);
  const [cancerOptions, setCancerOptions] = useState([]);
  const [availableDrugs, setAvailableDrugs] = useState([]);
  const [test, setTest] = useState('Adherent');
  const [cancerType, setCancerType] = useState('SKCM');
  const [drugsInput, setDrugsInput] = useState('Cisplatin, Docetaxel');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getHybridOptions()
      .then(res => {
        if (res.test_options) {
          setTestOptions(res.test_options);
          if (res.test_options.includes('Adherent')) setTest('Adherent');
          else setTest(res.test_options[0]);
        }
        if (res.cancer_options) {
          setCancerOptions(res.cancer_options);
          if (res.cancer_options.includes('SKCM')) setCancerType('SKCM');
          else setCancerType(res.cancer_options[0]);
        }
        if (res.available_drugs) setAvailableDrugs(res.available_drugs);
      })
      .catch(() => {});
  }, []);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    const parsedDrugs = drugsInput
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    if (!parsedDrugs.length) {
      toast.error('Please enter at least one medicine/drug name');
      return;
    }

    setLoading(true);
    try {
      const data = await predictHybrid(test, cancerType, parsedDrugs);
      setResult(data);
      toast.success('Hybrid drug sensitivity evaluated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to predict hybrid response');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (p) => {
    setTest(p.test);
    setCancerType(p.cancer);
    setDrugsInput(p.drugs);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <FaLayerGroup /> Hybrid Ensemble (Random Forest + XGBoost + KNN)
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
          Medicine Accuracy &amp; <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">Alternative Suggestions</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Assays individual drug sensitivity against GDSC cell-line growth profiles and recommends alternative therapeutics with higher predicted sensitivity.
        </p>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-slate-500 flex items-center gap-1"><FaFlask /> Presets:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(p)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-teal-300 transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Configuration */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-800">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaCapsules className="text-teal-400" />
              Patient / Cell Assay Parameters
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">GDSC Target Encoding &amp; Polynomial Features</p>
          </div>

          <form onSubmit={handlePredict} className="space-y-5">
            {/* Growth Properties */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Growth Properties (Test Type)
              </label>
              <select
                value={test}
                onChange={(e) => setTest(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-white text-sm font-medium outline-none transition cursor-pointer"
              >
                {testOptions.map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Cancer Type (TCGA Label) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Cancer Type (TCGA Label)
              </label>
              <select
                value={cancerType}
                onChange={(e) => setCancerType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-white text-sm font-medium outline-none transition cursor-pointer"
              >
                {cancerOptions.map((c, i) => (
                  <option key={i} value={c}>
                    {c} {TCGA_LABELS[c] ? `— ${TCGA_LABELS[c]}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Drugs Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Drug / Medicine Names (Comma-separated)
              </label>
              <input
                type="text"
                value={drugsInput}
                onChange={(e) => setDrugsInput(e.target.value)}
                placeholder="e.g. Cisplatin, Docetaxel, Camptothecin"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-white placeholder-slate-500 text-sm font-medium outline-none transition"
                required
              />
              <p className="text-[11px] text-slate-500">
                Supports 540+ GDSC pharmaceutical agents. Multiple drugs can be entered separated by commas.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-400 hover:from-teal-300 hover:to-cyan-200 transition-all shadow-lg shadow-teal-500/25 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Computing Hybrid Predictions...
                </>
              ) : (
                <>
                  <FaBolt className="text-slate-950" />
                  Evaluate Sensitivity &amp; Suggest
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results & Suggestions */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6 animate-fade-in">
              {/* Evaluated Input Medicines */}
              <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FaCheckCircle className="text-teal-400" />
                      Predicted Sensitivity (Hybrid Model)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Target: <span className="text-teal-300 font-semibold">{result.test}</span> • <span className="text-indigo-300 font-semibold">{result.cancer_type}</span>
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                    RF + XGB + KNN
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="pb-3 font-semibold">Medicine Name</th>
                        <th className="pb-3 font-semibold text-right">XGBoost</th>
                        <th className="pb-3 font-semibold text-right">KNN</th>
                        <th className="pb-3 font-semibold text-right text-teal-400">Combined Accuracy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {result.input_results.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="py-3 font-bold text-white flex items-center gap-2">
                            <FaCapsules className="text-teal-400" />
                            {r.drug}
                          </td>
                          <td className="py-3 text-right font-mono text-slate-300">{r.xgb_score.toFixed(4)}</td>
                          <td className="py-3 text-right font-mono text-slate-300">{r.knn_score.toFixed(4)}</td>
                          <td className="py-3 text-right font-mono font-bold text-teal-300 text-sm">
                            {r.combined_score.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Suggested Alternative Medicines */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl border border-teal-500/30">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <FaStar className="text-amber-400" />
                        Suggested Alternative Medicines
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Top candidate compounds with higher predicted sensitivity than current regimen (&gt; {result.min_input_score.toFixed(4)})
                      </p>
                    </div>
                    <span className="text-xs text-teal-400 flex items-center gap-1 font-semibold">
                      <FaArrowUp /> Top 8 Candidates
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {result.suggestions.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-teal-500/60 transition flex items-center justify-between shadow-md"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 text-xs font-mono font-bold">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{s.drug}</div>
                            <div className="text-[10px] text-teal-300/80">Enhanced Sensitivity</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-teal-400">
                            {s.score.toFixed(5)}
                          </div>
                          <div className="text-[10px] text-slate-500">Predicted Score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center space-y-4 border border-dashed border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600 text-2xl">
                <FaCapsules />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-bold text-white text-base">Ready for Sensitivity Inference</h3>
                <p className="text-xs text-slate-400">
                  Select cell growth properties, cancer type TCGA code, and medicine names to compute hybrid sensitivity and alternative recommendations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
