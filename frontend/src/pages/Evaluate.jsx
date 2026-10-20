import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFlask, FaUpload, FaFileCsv, FaCheckCircle, FaDownload, FaChartLine, FaSpinner } from 'react-icons/fa';
import Plot from 'react-plotly.js';
import toast from 'react-hot-toast';
import { evaluateCSV } from '../services/api';

export default function Evaluate() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      handleUpload(f);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  const handleUpload = async (f) => {
    const targetFile = f || file;
    if (!targetFile) {
      toast.error('Please select a CSV file to evaluate');
      return;
    }

    setLoading(true);
    try {
      const res = await evaluateCSV(targetFile);
      setMetrics(res);
      toast.success('Experimental assay evaluation complete!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Evaluation failed. Check CSV columns.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent =
      'drug_a,drug_b,cell_line,actual_synergy\n' +
      'Dabrafenib,Trametinib,A375,28.4\n' +
      '5-FU,Cisplatin,HCT116,14.6\n' +
      'Olaparib,Temozolomide,MCF7,19.2\n' +
      'Venetoclax,Ibrutinib,K-562,22.8\n' +
      'Erlotinib,Gefitinib,A549,-12.4\n' +
      'Imatinib,Nilotinib,K-562,-8.7\n' +
      'Paclitaxel,Cisplatin,SK-OV-3,11.5\n' +
      'Sorafenib,Regorafenib,HepG2,-15.1\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_experimental_assay.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded sample test CSV');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <FaFlask /> Wet-Lab Verification &amp; Benchmark Module
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Experimental Assay <span className="bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">Evaluation</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Upload wet-lab synergy screening data to quantitatively validate platform predictions with standard biostatistical metrics (RMSE, Pearson r, ROC-AUC).
          </p>
        </div>

        <button
          onClick={downloadSampleCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition shadow self-start md:self-auto"
        >
          <FaDownload className="text-teal-400" />
          Download Sample Template (.CSV)
        </button>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`glass-panel border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-teal-400 bg-teal-500/5'
            : 'border-slate-700/80 hover:border-slate-600 hover:bg-slate-900/40'
        }`}
      >
        <input {...getInputProps()} />
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-teal-400 text-2xl shadow-inner">
            {loading ? <FaSpinner className="animate-spin text-teal-400" /> : <FaUpload />}
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              {file ? file.name : 'Drop your experimental CSV here, or browse'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Requires columns: <code className="text-teal-300">drug_a</code>, <code className="text-teal-300">drug_b</code>, <code className="text-teal-300">cell_line</code>, <code className="text-teal-300">actual_synergy</code>
            </p>
          </div>
          {file && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs">
              <FaFileCsv className="text-teal-400" /> {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>
      </div>

      {/* Metrics & Plots */}
      {metrics && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Pearson Correlation (r)', val: metrics.pearson_r.toFixed(3), note: 'Linear concordance', color: 'text-teal-400' },
              { label: 'ROC-AUC Score', val: metrics.roc_auc ? metrics.roc_auc.toFixed(3) : 'N/A', note: 'Synergy discrimination', color: 'text-indigo-400' },
              { label: 'RMSE', val: metrics.rmse.toFixed(2), note: 'Root mean square error', color: 'text-slate-200' },
              { label: 'MAE', val: metrics.mae.toFixed(2), note: 'Mean absolute error', color: 'text-slate-200' },
              { label: 'F1 Score', val: metrics.f1_score ? metrics.f1_score.toFixed(3) : 'N/A', note: 'Harmonic mean', color: 'text-pink-400' },
              { label: 'Assayed Pairs', val: metrics.n_samples, note: 'Sample cohort size', color: 'text-amber-400' },
            ].map((stat, i) => (
              <div key={i} className="glass-panel p-4 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-medium">{stat.label}</div>
                <div className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.val}</div>
                <div className="text-[10px] text-slate-500 mt-1">{stat.note}</div>
              </div>
            ))}
          </div>

          {/* Interactive Plotly Scatter Plot: Predicted vs Actual */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl">
              <div className="border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FaChartLine className="text-teal-400" />
                  Observed vs Model-Predicted Synergy
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Gold diagonal denotes perfect agreement (y = x)</p>
              </div>

              <div className="w-full flex justify-center overflow-hidden">
                <Plot
                  data={[
                    {
                      x: metrics.predictions.map(p => p.actual),
                      y: metrics.predictions.map(p => p.predicted),
                      text: metrics.predictions.map(p => `${p.drug_a} + ${p.drug_b} (${p.cell_line})`),
                      mode: 'markers',
                      type: 'scatter',
                      marker: {
                        color: '#14b8a6',
                        size: 8,
                        opacity: 0.8,
                        line: { color: '#ffffff', width: 0.5 }
                      },
                      name: 'Assayed Pairs'
                    },
                    {
                      x: [-30, 40],
                      y: [-30, 40],
                      mode: 'lines',
                      line: { dash: 'dash', color: '#f59e0b', width: 1.5 },
                      name: 'Ideal (y = x)'
                    }
                  ]}
                  layout={{
                    autosize: true,
                    width: 550,
                    height: 380,
                    margin: { l: 50, r: 20, t: 20, b: 50 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    font: { color: '#94a3b8', size: 10 },
                    xaxis: { title: 'Lab Observed Score', gridcolor: '#1e293b' },
                    yaxis: { title: 'Predicted Synergy Score', gridcolor: '#1e293b' },
                    legend: { font: { size: 10 } }
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                />
              </div>
            </div>

            {/* Verification Table */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">Evaluated Experimental Samples</h3>
                <p className="text-xs text-slate-400 mt-0.5">Residual concordance</p>
              </div>

              <div className="overflow-y-auto max-h-[340px]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800">
                      <th className="pb-2 font-semibold">Pair</th>
                      <th className="pb-2 font-semibold text-right">Actual</th>
                      <th className="pb-2 font-semibold text-right">Pred.</th>
                      <th className="pb-2 font-semibold text-right">Residual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {metrics.predictions.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2 font-medium text-slate-200">
                          {p.drug_a} + {p.drug_b}
                          <div className="text-[10px] text-slate-500">{p.cell_line}</div>
                        </td>
                        <td className="py-2 text-right font-mono text-slate-300">{p.actual.toFixed(1)}</td>
                        <td className="py-2 text-right font-mono font-bold text-teal-400">{p.predicted.toFixed(1)}</td>
                        <td className="py-2 text-right font-mono text-slate-400">
                          ±{p.error.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
