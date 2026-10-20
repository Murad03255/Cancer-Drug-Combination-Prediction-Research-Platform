import React, { useState, useEffect, useRef } from 'react';
import {
  FaAtom,
  FaDna,
  FaFlask,
  FaCopy,
  FaCheck,
  FaExternalLinkAlt,
  FaProjectDiagram,
  FaVial,
  FaShieldAlt,
  FaBullseye,
  FaLink,
  FaMicroscope,
  FaExpand,
  FaCompress,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getPairMolecularData } from '../services/api';

// Animated floating particle system for background ambience
function ParticleField({ color = 'teal', count = 18 }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  const colorMap = {
    teal: 'bg-teal-400',
    indigo: 'bg-indigo-400',
    cyan: 'bg-cyan-400',
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${colorMap[color] || 'bg-teal-400'}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `moleculeFloat ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// Animated orbital ring that encircles the SVG canvas
function OrbitalRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className="w-[90%] h-[90%] rounded-full border border-teal-500/15"
        style={{ animation: 'orbitalSpin 20s linear infinite' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-teal-400 shadow-lg shadow-teal-400/50" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
      </div>
      <div
        className="absolute w-[70%] h-[70%] rounded-full border border-indigo-500/10"
        style={{ animation: 'orbitalSpin 14s linear infinite reverse' }}
      >
        <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50" />
      </div>
    </div>
  );
}

// Animated connection line between two drug cards
function SynergyBridge() {
  return (
    <div className="hidden lg:flex items-center justify-center relative" style={{ minHeight: '60px' }}>
      <div className="relative w-full flex items-center justify-center">
        {/* Central pulsing icon */}
        <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-teal-500/30"
          style={{ animation: 'synPulse 2s ease-in-out infinite' }}>
          <FaLink className="text-white text-sm" />
        </div>
        {/* Left line */}
        <div className="absolute left-0 right-1/2 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-teal-400/60 mr-5" />
        {/* Right line */}
        <div className="absolute left-1/2 right-0 h-px bg-gradient-to-l from-transparent via-indigo-500/40 to-indigo-400/60 ml-5" />
        {/* Traveling light dot */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal-300 shadow-md shadow-teal-300/80"
          style={{ animation: 'travelDot 3s linear infinite' }} />
      </div>
    </div>
  );
}

export default function MolecularViewer({ drugA, drugB }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('both');
  const [copiedSmiles, setCopiedSmiles] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [hoveredTarget, setHoveredTarget] = useState(null);

  useEffect(() => {
    if (!drugA || !drugB) return;
    let isMounted = true;
    setLoading(true);
    getPairMolecularData(drugA, drugB)
      .then((res) => { if (isMounted) setData(res); })
      .catch((err) => console.error('Failed to load molecular structures:', err))
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [drugA, drugB]);

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedSmiles(label);
    toast.success(`Copied ${label} SMILES!`);
    setTimeout(() => setCopiedSmiles(null), 2500);
  };

  if (!drugA || !drugB) return null;

  const molA = data?.drug_a;
  const molB = data?.drug_b;
  const pathway = data?.pathway_analysis;

  const renderCard = (mol, label, agentKey, colorScheme) => {
    if (!mol) return null;
    const isExpanded = expandedCard === agentKey;
    const colors = {
      teal: {
        badge: 'bg-teal-500/20 text-teal-300 border border-teal-500/40',
        glow: 'shadow-teal-500/20',
        accent: 'text-teal-400',
        accentBg: 'bg-teal-500/10',
        ring: 'border-teal-500/30',
        particle: 'teal',
        gradient: 'from-teal-500 to-emerald-400',
      },
      indigo: {
        badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
        glow: 'shadow-indigo-500/20',
        accent: 'text-indigo-400',
        accentBg: 'bg-indigo-500/10',
        ring: 'border-indigo-500/30',
        particle: 'indigo',
        gradient: 'from-indigo-500 to-purple-400',
      },
    };
    const c = colors[colorScheme] || colors.teal;

    return (
      <div
        className={`group relative glass-panel rounded-2xl border border-slate-800 overflow-hidden transition-all duration-500 hover:border-slate-600 ${
          isExpanded ? 'lg:col-span-2' : ''
        }`}
        style={{ animation: 'cardSlideIn 0.6s ease-out both' }}
      >
        {/* Ambient top gradient band */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.gradient} opacity-60`} />

        {/* Card content */}
        <div className="p-5 sm:p-6 space-y-4 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${c.badge}`}>
                  {label}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  MW: <span className="text-slate-200 font-bold">{mol.molecular_weight}</span> g/mol
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-1.5 tracking-tight">{mol.name}</h3>
              <p className="text-xs text-slate-400">{mol.brand_name || mol.drug_class}</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Expand toggle */}
              <button
                onClick={() => setExpandedCard(isExpanded ? null : agentKey)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition text-xs"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <FaCompress /> : <FaExpand />}
              </button>
              {mol.pubchem_cid && (
                <a
                  href={`https://pubchem.ncbi.nlm.nih.gov/compound/${mol.pubchem_cid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-mono text-slate-400 hover:text-teal-300 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 transition"
                  title="Open PubChem Database Entry"
                >
                  CID: {mol.pubchem_cid} <FaExternalLinkAlt className="text-[9px]" />
                </a>
              )}
            </div>
          </div>

          {/* 2D Chemical Structure SVG Canvas — Enhanced */}
          <div className={`relative w-full rounded-2xl bg-slate-950/95 border ${c.ring} overflow-hidden group/svg shadow-inner transition-all duration-300 ${
            isExpanded ? 'h-72' : 'h-52'
          }`}>
            {/* Particle system inside SVG canvas */}
            <ParticleField color={c.particle} count={12} />
            {/* Orbital decoration */}
            <OrbitalRings />

            {/* Label chip */}
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/95 border border-slate-800 text-[10px] text-slate-400 font-mono backdrop-blur-sm">
              <FaAtom className={`${c.accent} animate-spin`} style={{ animationDuration: '8s' }} /> 2D Skeletal Structure
            </div>

            {/* SVG Render or skeleton */}
            {mol.svg ? (
              <div
                className="relative z-10 w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:drop-shadow-lg p-3 transition-transform duration-700 group-hover/svg:scale-[1.03]"
                dangerouslySetInnerHTML={{ __html: mol.svg }}
              />
            ) : (
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
                <span className="text-xs text-slate-500 font-mono">Rendering chemical scaffold...</span>
              </div>
            )}

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-950 to-transparent z-15 pointer-events-none" />
          </div>

          {/* Key Molecular & Pharmacological Metrics Grid */}
          <div className={`grid gap-2 text-xs ${isExpanded ? 'grid-cols-4' : 'grid-cols-2'}`}>
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition group/metric">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Formula</span>
              <span className={`text-xs font-mono font-bold ${c.accent} group-hover/metric:brightness-125 transition`}>
                {mol.chemical_formula}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Class</span>
              <span className="text-xs font-bold text-indigo-300 truncate block" title={mol.drug_class}>
                {mol.drug_class}
              </span>
            </div>
            {isExpanded && mol.clinical_indications && (
              <div className="col-span-2 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Clinical Indications</span>
                <div className="flex flex-wrap gap-1">
                  {(mol.clinical_indications || []).slice(0, 3).map((ind, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[10px]">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Target Genes — Interactive chips */}
          {mol.targets && mol.targets.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <FaBullseye className={c.accent} /> Primary Gene Targets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {mol.targets.map((t, idx) => (
                  <span
                    key={idx}
                    onMouseEnter={() => setHoveredTarget(t)}
                    onMouseLeave={() => setHoveredTarget(null)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all duration-200 cursor-default ${
                      hoveredTarget === t
                        ? `${c.accentBg} ${c.accent} border ${c.ring} shadow-md ${c.glow} scale-105`
                        : 'bg-cyan-950/50 border border-cyan-800/50 text-cyan-300 hover:bg-cyan-900/60'
                    }`}
                    style={hoveredTarget === t ? { animation: 'targetPulse 0.6s ease-in-out' } : {}}
                  >
                    <FaDna className="inline mr-1 text-[8px] opacity-60" />{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mechanism of Action — Enhanced */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900/95 to-slate-950/90 border border-slate-800 text-xs space-y-2 hover:border-slate-700 transition">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <FaMicroscope className={c.accent} /> Mechanism of Action (MoA)
            </span>
            <p className="text-slate-300 text-[12px] leading-relaxed">{mol.moa}</p>
          </div>

          {/* SMILES with Quick Copy — Enhanced */}
          {mol.smiles && (
            <div className="group/smiles flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] hover:border-slate-700 transition">
              <div className="flex items-center gap-2 overflow-hidden mr-2">
                <span className="font-mono text-slate-500 text-[10px] uppercase flex-shrink-0">SMILES</span>
                <div className="relative overflow-hidden flex-1">
                  <span className="font-mono text-slate-400 truncate text-[10px] block">{mol.smiles}</span>
                  {/* Animated underline on hover */}
                  <div className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-teal-500 to-indigo-500 w-0 group-hover/smiles:w-full transition-all duration-500" />
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(mol.smiles, mol.name)}
                className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                  copiedSmiles === mol.name
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'text-slate-400 hover:text-teal-300 hover:bg-slate-800'
                }`}
                title="Copy SMILES String"
              >
                {copiedSmiles === mol.name ? <FaCheck className="text-xs" /> : <FaCopy className="text-xs" />}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <FaAtom className="text-xs" style={{ animation: 'orbitalSpin 4s linear infinite' }} />
            Molecular Structure & Pathway Explorer
          </div>
          <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
            Chemical Scaffolds & Biological{' '}
            <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">MoA</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real 2D chemical bond structures, gene targets, and pharmacodynamics for{' '}
            <span className="text-teal-300 font-semibold">{drugA}</span> &{' '}
            <span className="text-indigo-300 font-semibold">{drugB}</span>
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {[
            { key: 'both', label: 'Side-by-Side', active: 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md' },
            { key: 'agentA', label: 'Agent A', active: 'bg-slate-800 text-teal-300 border border-teal-500/30' },
            { key: 'agentB', label: 'Agent B', active: 'bg-slate-800 text-indigo-300 border border-indigo-500/30' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.key ? tab.active : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-14 h-14 border-3 border-teal-500/30 rounded-full" />
            <div className="absolute inset-0 w-14 h-14 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <FaAtom className="absolute inset-0 m-auto text-teal-400 text-lg animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-300 font-semibold">Loading Molecular Data</p>
            <p className="text-xs text-slate-500 font-mono mt-1">Fetching chemical structures and biological pathways...</p>
          </div>
        </div>
      ) : (
        <div className="relative z-10 space-y-6">
          {/* Pathway Synergy Rationale Banner — Enhanced */}
          {pathway && (
            <div className="relative p-5 rounded-2xl overflow-hidden border border-teal-500/30" style={{ animation: 'cardSlideIn 0.5s ease-out' }}>
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-950/50 via-slate-900/90 to-indigo-950/50" />
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(20, 184, 166, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
              }} />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <FaProjectDiagram className="text-white text-sm" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-teal-300 block">
                      {pathway.synergy_type || 'Molecular Pathway Synergy Rationale'}
                    </span>
                    <span className="text-[10px] text-slate-500">Pharmacological Basis for Combination</span>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">{pathway.rationale}</p>
                {pathway.clinical_evidence && (
                  <div className="flex items-center gap-2 text-xs text-cyan-300/80 font-mono pt-1 bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-800/50">
                    <FaShieldAlt className="text-teal-400 flex-shrink-0" />
                    <span>Evidence: {pathway.clinical_evidence}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cards Grid with synergy bridge */}
          {activeTab === 'both' ? (
            <div className="space-y-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderCard(molA, 'Agent A Compound', 'agentA', 'teal')}
                {renderCard(molB, 'Agent B Compound', 'agentB', 'indigo')}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {activeTab === 'agentA' && renderCard(molA, 'Agent A Compound', 'agentA', 'teal')}
              {activeTab === 'agentB' && renderCard(molB, 'Agent B Compound', 'agentB', 'indigo')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
