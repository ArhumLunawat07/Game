/**
 * PROJECT: LAST SIGNAL - Victory Screen
 */

import React from 'react';
import { RotateCcw, Radio, CheckCircle2, Award, Zap, Database } from 'lucide-react';

interface VictoryModalProps {
  gameTime: number;
  energy: number;
  fragmentsCollected: number;
  totalFragments: number;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  gameTime,
  energy,
  fragmentsCollected,
  totalFragments,
  onPlayAgain
}) => {
  const minutes = Math.floor(gameTime / 60);
  const seconds = Math.floor(gameTime % 60);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Calculate efficiency rating
  let rating = 'STELLAR SURVIVOR';
  let badgeColor = 'text-cyan-400';
  if (gameTime < 180 && energy > 50) {
    rating = 'MASTER CHIEF ENGINEER (S-RANK)';
    badgeColor = 'text-amber-400';
  } else if (gameTime < 240) {
    rating = 'VETERAN ASTRO-SPECIALIST (A-RANK)';
    badgeColor = 'text-emerald-400';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-cyan-800/60 rounded-lg p-8 shadow-2xl text-center">
        {/* Pulsing Signal Beacon Icon */}
        <div className="w-16 h-16 mx-auto mb-4 p-3 bg-cyan-950/60 border border-cyan-500/60 rounded-full text-cyan-400 flex items-center justify-center animate-bounce">
          <Radio className="w-9 h-9" />
        </div>

        {/* Final Transmission Message from prompt */}
        <div className="text-xs font-mono tracking-widest text-emerald-400 mb-2 uppercase flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>DEEP SPACE TRANSMISSION BROADCASTING</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
          SIGNAL TRANSMITTED — <span className="text-cyan-400">HUMANITY IS NOT ALONE.</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed max-w-md mx-auto">
          The high-energy tachyon beam has pierced through the cosmic anomaly shroud. Across 60 light-years, listening stations are receiving ECHO-7&apos;s telemetry. You have saved the mission.
        </p>

        {/* Statistics Cluster */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Mission Time */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-md text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">COMPLETION TIME</div>
            <div className="text-lg font-bold font-mono text-white tabular-nums">{formattedTime}</div>
          </div>

          {/* Power Nodes */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-md text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>NODES</span>
            </div>
            <div className="text-lg font-bold font-mono text-amber-400 tabular-nums">3/3 (100%)</div>
          </div>

          {/* Data Recovered */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-md text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Database className="w-3 h-3 text-sky-400" />
              <span>DATA ARCHIVE</span>
            </div>
            <div className="text-lg font-bold font-mono text-sky-400 tabular-nums">{fragmentsCollected}/{totalFragments}</div>
          </div>
        </div>

        {/* Efficiency Rating Banner */}
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-md mb-6 flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <Award className={`w-5 h-5 ${badgeColor}`} />
            <div className="text-left">
              <div className="text-[10px] font-mono text-slate-400">ENGINEER CITATION</div>
              <div className={`text-xs font-bold font-mono ${badgeColor}`}>{rating}</div>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-400">
            SUIT BATTERY: <span className="text-white font-bold">{Math.round(energy)}%</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onPlayAgain}
          className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded shadow-lg shadow-cyan-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-4 h-4 fill-current" />
          <span>PLAY AGAIN</span>
        </button>
      </div>
    </div>
  );
};
