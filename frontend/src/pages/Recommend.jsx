import React, { useState, useEffect } from 'react';
import { FaListOl, FaFilter, FaDownload, FaFire, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import Plot from 'react-plotly.js';
import toast from 'react-hot-toast';
import { getRecommendations, getCancerTypes, getCellLines } from '../services/api';

export default function Recommend() {
  const [cancerTypes, setCancerTypes] = useState([]);
  const [cellLines, setCellLines] = useState([]);
  const [selectedCancer, setSelectedCancer] = useState('Melanoma');
  const [selectedCellLine, setSelectedCellLine] = useState('');
  const [topN, setTopN] = useState(15);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    getCancerTypes().then(res => {
      if (res && res.length) {
        setCancerTypes(res);
        if (res.includes('Melanoma')) setSelectedCancer('Melanoma');
        else setSelectedCancer(res[0]);
      }
    }).catch(() => {});

    getCellLines().then(res => {
      if (res && res.length) setCellLines(res);
    }).catch(() => {});
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await getRecommendations(selectedCancer, selectedCellLine, topN);
      setData(res);
      toast.success(`Retrieved top ${res.recommendations?.length || 0} candidate pairs`);
    } catch (err) {
      toast.error('Failed to load candidate pairs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCancer) {
      fetchRecommendations();
    }
  }, [selectedCancer, selectedCellLine, topN]);

  // Construct Heatmap Data for Plotly from top pairs
  const generateHeatmapData = () => {
    if (!data || !data.recommendations || data.recommendations.length === 0) return null;

    const uniqueDrugs = Array.from(new Set([
      ...data.recommendations.map(r => r.drug_a),
      ...data.recommendations.map(r => r.drug_b)
    ])).slice(0, 10);

    const zValues = uniqueDrugs.map(d1 =>
      uniqueDrugs.map(d2 => {
        if (d1 === d2) return 0;
        const match = data.recommendations.find(
          r => (r.drug_a === d1 && r.drug_b === d2) || (r.drug_a === d2 && r.drug_b === d1)
        );
        return match ? match.synergy_score : null;
      })
    );

    return {
      z: zValues,
      x: uniqueDrugs,
      y: uniqueDrugs,
      type: 'heatmap',
      colorscale: [
        [0, '#f43f5e'],      // Antagonistic (rose)
        [0.45, '#334155'],   // Additive (slate)
        [0.55, '#334155'],
        [1, '#14b8a6']       // Synergistic (teal)
      ],
      hoverongaps: false,
      colorbar: {
        title: 'Bliss Score',
        titleside: 'top',
        tickcolor: '#94a3b8',
        tickfont: { color: '#94a3b8', size: 10 }
      }
    };
  };

  const heatmapPlot = generateHeatmapData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <FaFire /> High-Confidence Synergy Discovery
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Drug Combination <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">Recommendations</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Shortlist highest-scoring synergistic combinations prioritized specifically for wet-lab validation on distinct cancer lineages.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="glass-panel p-3 rounded-xl flex flex-wrap items-center gap-3 self-start md:self-auto border border-slate-800">
          <div className="flex items-center gap-2">
            <FaFilter className="text-slate-500 text-xs" />
            <select
              value={selectedCancer}
              onChange={(e) => setSelectedCancer(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-teal-500"
            >
              {cancerTypes.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCellLine}
              onChange={(e) => setSelectedCellLine(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-teal-500"
            >
              <option value="">All Cell Lines</option>
              {cellLines.map((cl, i) => (
                <option key={i} value={cl}>{cl}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Top:</span>
            <select
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
            >
              <option value={10}>10 Pairs</option>
              <option value={15}>15 Pairs</option>
              <option value={25}>25 Pairs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Ranked Recommendations Table */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 shadow-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FaListOl className="text-indigo-400" />
              Prioritized Combinations ({selectedCancer})
            </h2>
            {loading && <FaSpinner className="animate-spin text-teal-400 text-sm" />}
          </div>

          {data && data.recommendations && data.recommendations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800/80">
                    <th className="pb-3 font-semibold">Rank</th>
                    <th className="pb-3 font-semibold">Agent Combination</th>
                    <th className="pb-3 font-semibold text-right">Synergy Score</th>
                    <th className="pb-3 font-semibold text-right">Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {data.recommendations.map((rec) => (
                    <tr key={rec.rank} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 font-mono font-bold text-slate-400">
                        #{rec.rank}
                      </td>
                      <td className="py-3 font-bold text-white flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200">
                          {rec.drug_a}
                        </span>
                        <span className="text-slate-500 font-bold">+</span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200">
                          {rec.drug_b}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-teal-400">
                        +{rec.synergy_score.toFixed(2)}
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                          <FaCheckCircle className="text-[10px]" /> Synergistic
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              No combinations found for the selected filter.
            </div>
          )}
        </div>

        {/* Plotly Synergy Matrix Heatmap */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 shadow-2xl border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FaFire className="text-teal-400" />
              Pairwise Interaction Heatmap
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Synergy landscape across candidate agents</p>
          </div>

          {heatmapPlot ? (
            <div className="w-full flex justify-center overflow-hidden">
              <Plot
                data={[heatmapPlot]}
                layout={{
                  autosize: true,
                  width: 440,
                  height: 380,
                  margin: { l: 80, r: 20, t: 30, b: 80 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { color: '#94a3b8', size: 10 },
                  xaxis: { tickangle: -45, gridcolor: '#1e293b' },
                  yaxis: { gridcolor: '#1e293b' }
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Generating interaction matrix...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
