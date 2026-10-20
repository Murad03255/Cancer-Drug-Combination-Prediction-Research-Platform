import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { FaCube, FaFlask, FaDownload, FaSlidersH, FaCheckCircle, FaSpinner, FaLayerGroup } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getDoseResponseData } from '../services/api';

const DRUG_PAIRS = [
  { drugA: 'Navitoclax', drugB: 'AT-406', cellLine: 'A375', label: 'Navitoclax & AT-406' },
  { drugA: 'Dabrafenib', drugB: 'Trametinib', cellLine: 'A375', label: 'Dabrafenib & Trametinib' },
  { drugA: '5-FU', drugB: 'Cisplatin', cellLine: 'HCT116', label: '5-FU & Cisplatin' },
  { drugA: 'Olaparib', drugB: 'Temozolomide', cellLine: 'MCF7', label: 'Olaparib & Temozolomide' },
  { drugA: 'Venetoclax', drugB: 'Ibrutinib', cellLine: 'K-562', label: 'Venetoclax & Ibrutinib' },
];

export default function SynergyFinder() {
  const [selectedPair, setSelectedPair] = useState(DRUG_PAIRS[0]);
  const [method, setMethod] = useState('ZIP');
  const [readout, setReadout] = useState('inhibition');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // Toggles matching the image
  const [showDoseResponse, setShowDoseResponse] = useState(true);
  const [showSynergy, setShowSynergy] = useState(true);
  const [baselineCorrection, setBaselineCorrection] = useState(true);

  const fetchData = async (pair, m) => {
    setLoading(true);
    try {
      const res = await getDoseResponseData(pair.drugA, pair.drugB, pair.cellLine, m);
      setData(res);
    } catch (err) {
      toast.error('Failed to load dose-response & synergy surface');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedPair, method);
  }, [selectedPair, method]);

  const handleExport = () => {
    if (!data) return;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SynergyFinder_${data.drug_a}_${data.drug_b}_${data.method}.json`;
    a.click();
    toast.success('Synergy report exported!');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <FaCube /> SynergyFinder 3D Visualizer &amp; Dose-Response Suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Multi-Drug Dose-Response &amp; <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">3D Synergy Landscapes</span>
          </h1>
          <p className="text-slate-400 text-xs">
            Interactive checkerboard matrix, single-agent Hill dose-response curves, 2D contour maps, and 3D surface topologies.
          </p>
        </div>

        {/* Pair Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 glass-panel p-1.5 rounded-xl border border-slate-800">
          {DRUG_PAIRS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPair(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPair.label === p.label
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main SynergyFinder Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Control Sidebar (Matches SynergyFinder UI) */}
        <div className="lg:col-span-3 glass-panel rounded-2xl p-5 space-y-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FaSlidersH className="text-cyan-400" /> Assay Parameters
            </h3>
            {loading && <FaSpinner className="animate-spin text-cyan-400 text-xs" />}
          </div>

          {/* Readout Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Choose Readout</label>
            <select
              value={readout}
              onChange={(e) => setReadout(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
            >
              <option value="inhibition">Inhibition (%)</option>
              <option value="viability">Viability (%)</option>
            </select>
          </div>

          {/* Synergy Calculation Method */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Synergy Model (Method)</label>
            <div className="grid grid-cols-2 gap-2">
              {['ZIP', 'Bliss', 'Loewe', 'HSA'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                    method === m
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {m} Model
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {method === 'ZIP' && 'Zero Interaction Potency (reference standard)'}
              {method === 'Bliss' && 'Bliss Independence (probabilistic expectation)'}
              {method === 'Loewe' && 'Loewe Additivity (concentration addition)'}
              {method === 'HSA' && 'Highest Single Agent reference effect'}
            </p>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Visualize Dose-Response</span>
              <button
                onClick={() => setShowDoseResponse(!showDoseResponse)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${showDoseResponse ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showDoseResponse ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Calculate &amp; Render Synergy</span>
              <button
                onClick={() => setShowSynergy(!showSynergy)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${showSynergy ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showSynergy ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Baseline Correction</span>
              <button
                onClick={() => setBaselineCorrection(!baselineCorrection)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${baselineCorrection ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${baselineCorrection ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Mean Summary Score Banner */}
          {data && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-center">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Mean {data.method} Synergy (δ-score)
              </div>
              <div className={`text-2xl font-black ${data.mean_synergy_score > 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                {data.mean_synergy_score > 0 ? `+${data.mean_synergy_score.toFixed(3)}` : data.mean_synergy_score.toFixed(3)}
              </div>
              <div className="text-[10px] text-slate-400">
                Response: <span className="font-bold uppercase text-teal-300">{data.synergy_class}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <button
            onClick={handleExport}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition shadow flex items-center justify-center gap-2"
          >
            <FaDownload className="text-cyan-400" /> Save Full Report (JSON)
          </button>
        </div>

        {/* Right Dashboard Area (Dose-Response + Synergy Topologies) */}
        <div className="lg:col-span-9 space-y-6">
          {data ? (
            <>
              {/* TOP PANEL: Dose-Response Data (Hill Curve + 8x8 Checkerboard Heatmap) */}
              {showDoseResponse && (
                <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <FaFlask className="text-cyan-400" /> Dose-Response Data
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">
                      {data.drug_a} &amp; {data.drug_b} ({readout.toUpperCase()})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    {/* Dose-Response Hill Curve */}
                    <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                      <div className="text-xs font-bold text-slate-300 mb-1 text-center">
                        Dose-response curve for drug: <span className="text-cyan-300">{data.drug_a}</span>
                      </div>
                      <div className="w-full flex justify-center">
                        <Plot
                          data={[
                            {
                              x: data.single_agent_curve_a.smooth_concs,
                              y: data.single_agent_curve_a.smooth_inhibition,
                              mode: 'lines',
                              line: { color: '#06b6d4', width: 2.5 },
                              name: 'Hill Fit'
                            },
                            {
                              x: data.single_agent_curve_a.scatter_points.map(p => p.conc),
                              y: data.single_agent_curve_a.scatter_points.map(p => p.inhibition),
                              mode: 'markers',
                              marker: { color: '#f43f5e', size: 6 },
                              name: 'Observed'
                            }
                          ]}
                          layout={{
                            autosize: true,
                            width: 380,
                            height: 280,
                            margin: { l: 40, r: 20, t: 15, b: 40 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: '#94a3b8', size: 9 },
                            xaxis: { title: `${data.drug_a} (${data.unit_a})`, type: 'log', gridcolor: '#1e293b' },
                            yaxis: { title: 'Inhibition (%)', range: [0, 105], gridcolor: '#1e293b' },
                            showlegend: false
                          }}
                          config={{ responsive: true, displayModeBar: false }}
                        />
                      </div>
                    </div>

                    {/* 8x8 Checkerboard Matrix Heatmap */}
                    <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                      <div className="text-xs font-bold text-slate-300 mb-1 text-center">
                        Dose-response matrix (Inhibition %)
                      </div>
                      <div className="w-full flex justify-center">
                        <Plot
                          data={[
                            {
                              z: data.inhibition_matrix,
                              x: data.concs_b.map(c => `${c}`),
                              y: data.concs_a.map(c => `${c}`),
                              type: 'heatmap',
                              colorscale: [
                                [0, '#f8fafc'],
                                [0.3, '#fca5a5'],
                                [0.7, '#ef4444'],
                                [1, '#7f1d1d']
                              ],
                              showscale: true,
                              colorbar: {
                                title: '%',
                                thickness: 10,
                                len: 0.85,
                                tickfont: { size: 9, color: '#94a3b8' }
                              }
                            }
                          ]}
                          layout={{
                            autosize: true,
                            width: 400,
                            height: 280,
                            margin: { l: 50, r: 20, t: 15, b: 50 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: '#94a3b8', size: 9 },
                            xaxis: { title: `${data.drug_b} (${data.unit_b})`, tickangle: -45, gridcolor: '#1e293b' },
                            yaxis: { title: `${data.drug_a} (${data.unit_a})`, gridcolor: '#1e293b' }
                          }}
                          config={{ responsive: true, displayModeBar: false }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BOTTOM PANEL: 2D Synergy Contour Map + 3D Synergy Surface Plot */}
              {showSynergy && (
                <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <FaCube className="text-teal-400" /> Synergy Landscape Topologies
                    </h2>
                    <span className="text-xs text-teal-400 font-mono font-bold">
                      Mean δ-score: {data.mean_synergy_score > 0 ? `+${data.mean_synergy_score}` : data.mean_synergy_score}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    {/* 2D Synergy Contour Map */}
                    <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                      <div className="text-xs font-bold text-slate-300 mb-1 text-center">
                        2D Synergy Landscape ({data.method} model)
                      </div>
                      <div className="w-full flex justify-center">
                        <Plot
                          data={[
                            {
                              z: data.synergy_matrix,
                              x: data.concs_b.map(c => `${c}`),
                              y: data.concs_a.map(c => `${c}`),
                              type: 'contour',
                              colorscale: [
                                [0, '#ef4444'],      // Antagonistic (red)
                                [0.5, '#ffffff'],    // Additive / zero (white)
                                [1, '#10b981']       // Synergistic (green)
                              ],
                              contours: {
                                coloring: 'heatmap',
                                showlabels: true,
                                labelfont: { size: 9, color: '#0f172a' }
                              },
                              colorbar: {
                                title: 'δ-score',
                                thickness: 10,
                                len: 0.85,
                                tickfont: { size: 9, color: '#94a3b8' }
                              }
                            }
                          ]}
                          layout={{
                            autosize: true,
                            width: 390,
                            height: 310,
                            margin: { l: 50, r: 20, t: 15, b: 50 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: '#94a3b8', size: 9 },
                            xaxis: { title: `${data.drug_b} (${data.unit_b})`, tickangle: -45 },
                            yaxis: { title: `${data.drug_a} (${data.unit_a})` }
                          }}
                          config={{ responsive: true, displayModeBar: false }}
                        />
                      </div>
                    </div>

                    {/* 3D INTERACTIVE SYNERGY SURFACE (Rotatable 360 deg) */}
                    <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                      <div className="text-xs font-bold text-slate-300 mb-1 text-center flex items-center justify-center gap-1.5">
                        <FaCube className="text-teal-400" />
                        3D Interactive Synergy Surface (Rotate with Mouse)
                      </div>
                      <div className="w-full flex justify-center">
                        <Plot
                          data={[
                            {
                              z: data.synergy_matrix,
                              x: data.concs_b,
                              y: data.concs_a,
                              type: 'surface',
                              colorscale: [
                                [0, '#ef4444'],      // Antagonistic (red)
                                [0.5, '#f8fafc'],    // Neutral (white)
                                [1, '#10b981']       // Synergistic (green)
                              ],
                              showscale: true,
                              colorbar: {
                                title: 'δ',
                                thickness: 10,
                                len: 0.85,
                                tickfont: { size: 9, color: '#94a3b8' }
                              }
                            }
                          ]}
                          layout={{
                            autosize: true,
                            width: 420,
                            height: 310,
                            margin: { l: 10, r: 10, t: 10, b: 10 },
                            paper_bgcolor: 'transparent',
                            scene: {
                              xaxis: { title: `${data.drug_b}`, color: '#94a3b8', gridcolor: '#334155' },
                              yaxis: { title: `${data.drug_a}`, color: '#94a3b8', gridcolor: '#334155' },
                              zaxis: { title: 'Synergy', color: '#94a3b8', gridcolor: '#334155' },
                              camera: {
                                eye: { x: 1.5, y: -1.5, z: 1.2 }
                              }
                            }
                          }}
                          config={{ responsive: true, displayModeBar: false }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass-panel p-16 text-center text-slate-400 text-xs">
              Loading SynergyFinder simulation...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
