/**
 * PROJECT: LAST SIGNAL - Sci-Fi Mathematics Geometric Circuit Routing Interface
 */

import React, { useState } from 'react';
import { CIRCUIT_PUZZLES } from '../game/puzzleData';
import { sound } from '../game/audio';
import { Zap, RotateCcw, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';

interface CircuitModalProps {
  nodeId: 'DELTA' | 'SIGMA' | 'OMEGA';
  onSolve: (nodeId: 'DELTA' | 'SIGMA' | 'OMEGA') => void;
  onClose: () => void;
}

export const CircuitModal: React.FC<CircuitModalProps> = ({
  nodeId,
  onSolve,
  onClose
}) => {
  const config = CIRCUIT_PUZZLES[nodeId];

  // Active path of node IDs selected by player
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Check if current path matches any valid puzzle solution
  const checkSolution = (path: string[]) => {
    for (const valid of config.validPaths) {
      if (path.length === valid.length && path.every((node, idx) => node === valid[idx])) {
        return true;
      }
    }
    return false;
  };

  const handleNodeClick = (clickedId: string) => {
    if (isSuccess) return;
    setErrorFeedback(null);

    sound.playCircuitClick();

    if (selectedPath.length === 0) {
      // Start path at this node
      setSelectedPath([clickedId]);
      return;
    }

    const lastNode = selectedPath[selectedPath.length - 1];

    // Clicking the same last node cancels selection
    if (lastNode === clickedId && selectedPath.length === 1) {
      setSelectedPath([]);
      return;
    }

    // Append to path
    const newPath = [...selectedPath, clickedId];
    setSelectedPath(newPath);

    // If matches solution, mark as ready to engage
    if (checkSolution(newPath)) {
      setIsSuccess(true);
      sound.playPowerRestored();
    }
  };

  const handleReset = () => {
    sound.playBlip();
    setSelectedPath([]);
    setIsSuccess(false);
    setErrorFeedback(null);
  };

  const handleCommit = () => {
    if (isSuccess) {
      onSolve(nodeId);
      onClose();
    } else {
      sound.playCircuitError();
      setErrorFeedback('HARMONIC MISMATCH: Geometric loop is incomplete or does not meet required resonance threshold.');
    }
  };

  // Calculate current mathematical sum or progress
  const currentValue = selectedPath.reduce((acc, id) => {
    const nodeObj = config.nodes.find(n => n.id === id);
    return acc + (nodeObj?.value || 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-950/60 border border-cyan-800/50 rounded text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400">NODE [{config.symbol}]</span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs font-mono text-slate-400">{config.name.toUpperCase()}</span>
              </div>
              <h2 className="text-base font-bold text-white tracking-wide">{config.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors cursor-pointer"
          >
            ABORT [ESC]
          </button>
        </div>

        {/* Scientific Mathematics Formula & Theory Bar */}
        <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[11px] block sm:inline">MATHEMATICAL MODEL: </span>
            <span className="text-cyan-300 font-semibold">{config.mathSubtitle}</span>
          </div>

          <div className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 tabular-nums">
            <span>TARGET: </span>
            <span className="text-amber-400 font-bold">{config.targetValue}</span>
            <span className="text-slate-500 mx-1.5">|</span>
            <span>CURRENT: </span>
            <span className={`font-bold ${isSuccess ? 'text-emerald-400' : 'text-slate-200'}`}>{currentValue}</span>
          </div>
        </div>

        {/* Theory & Instructions Box */}
        <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800/40 text-xs text-slate-300 leading-relaxed">
          <p className="mb-1 text-slate-400">{config.theoryExplanation}</p>
          <p className="text-cyan-400 font-medium">Objective: {config.targetObjective}</p>
        </div>

        {/* Interactive Geometric SVG Canvas */}
        <div className="relative w-full h-72 bg-slate-950 flex items-center justify-center p-4">
          <svg className="w-full h-full max-w-md" viewBox="0 0 100 100">
            {/* Background geometric grid markings */}
            <circle cx="50" cy="50" r="42" stroke="rgba(51, 65, 85, 0.2)" strokeWidth="0.75" strokeDasharray="2 2" fill="none" />
            <circle cx="50" cy="50" r="28" stroke="rgba(51, 65, 85, 0.15)" strokeWidth="0.75" fill="none" />

            {/* Render connected paths */}
            {selectedPath.map((nodeId, idx) => {
              if (idx === selectedPath.length - 1) return null;
              const nextId = selectedPath[idx + 1];
              const fromNode = config.nodes.find(n => n.id === nodeId);
              const toNode = config.nodes.find(n => n.id === nextId);
              if (!fromNode || !toNode) return null;

              return (
                <g key={`edge-${idx}`}>
                  {/* Glowing wide backing line */}
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isSuccess ? '#10b981' : '#38bdf8'}
                    strokeWidth="3.5"
                    strokeOpacity="0.4"
                  />
                  {/* Core electric wire */}
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isSuccess ? '#34d399' : '#00f0ff'}
                    strokeWidth="1.5"
                    strokeDasharray={isSuccess ? 'none' : '3 1.5'}
                    className={isSuccess ? '' : 'animate-pulse'}
                  />
                </g>
              );
            })}

            {/* Render Geometric Nodes */}
            {config.nodes.map(node => {
              const isSelected = selectedPath.includes(node.id);
              const isLastSelected = selectedPath[selectedPath.length - 1] === node.id;

              return (
                <g
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  {/* Selection pulse halo */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="9"
                      fill="none"
                      stroke={isSuccess ? '#10b981' : '#38bdf8'}
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      opacity="0.8"
                    />
                  )}

                  {/* Node Body */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="6.5"
                    fill={isLastSelected ? '#38bdf8' : (isSelected ? '#0369a1' : '#1e293b')}
                    stroke={isSuccess ? '#10b981' : (isSelected ? '#38bdf8' : '#64748b')}
                    strokeWidth="1.5"
                  />

                  {/* Node Symbol Label */}
                  <text
                    x={node.x}
                    y={node.y + 1}
                    fill={isLastSelected ? '#030712' : '#ffffff'}
                    fontSize="3.8"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-mono"
                  >
                    {node.symbol}
                  </text>

                  {/* Node Component Value text */}
                  <text
                    x={node.x}
                    y={node.y + (node.y > 50 ? 11 : -9)}
                    fill="#94a3b8"
                    fontSize="2.8"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {node.label} ({node.value > 0 ? `${node.value}` : 'PIN'})
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Current Path Indicator */}
          <div className="absolute bottom-3 left-4 text-xs font-mono text-slate-400">
            <span>ROUTE: </span>
            <span className="text-cyan-300 font-bold">
              {selectedPath.length > 0 ? selectedPath.join(' → ') : 'Select starting vertex'}
            </span>
          </div>
        </div>

        {/* Error Feedback if any */}
        {errorFeedback && (
          <div className="px-6 py-2.5 bg-rose-950/40 border-t border-rose-900/40 flex items-center gap-2 text-xs font-mono text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorFeedback}</span>
          </div>
        )}

        {/* Success Banner if loop completed */}
        {isSuccess && (
          <div className="px-6 py-2.5 bg-emerald-950/40 border-t border-emerald-900/40 flex items-center justify-between text-xs font-mono text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>CIRCUIT LOOP CLOSED · HARMONIC RESONANCE ACHIEVED</span>
            </div>
            <span className="text-[10px] text-emerald-400/80">READY TO ENERGIZE</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET PATH</span>
          </button>

          <button
            onClick={handleCommit}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-semibold font-mono rounded transition-all cursor-pointer ${
              isSuccess
                ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-cyan-500/80 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/10'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{isSuccess ? 'LOCK RESONANCE & ENERGIZE' : 'VERIFY CIRCUIT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
