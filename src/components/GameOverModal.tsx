/**
 * PROJECT: LAST SIGNAL - Game Over Screen
 */

import React from 'react';
import { RotateCcw, AlertOctagon, BatteryWarning } from 'lucide-react';

interface GameOverModalProps {
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRestart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-slate-900 border border-rose-900/60 rounded-lg p-8 shadow-2xl text-center">
        {/* Warning Icon */}
        <div className="w-16 h-16 mx-auto mb-4 p-3 bg-rose-950/50 border border-rose-800/60 rounded-full text-rose-500 flex items-center justify-center animate-pulse">
          <AlertOctagon className="w-10 h-10" />
        </div>

        <div className="text-xs font-mono tracking-widest text-rose-400 mb-1 uppercase">CRITICAL SYSTEM COLLAPSE</div>
        <h2 className="text-3xl font-black text-white mb-2">MISSION FAILED</h2>

        <p className="text-xs md:text-sm text-slate-300 mb-6 leading-relaxed">
          Suit life-support reserves have depleted into terminal shutdown. Spacecraft ECHO-7 drifts into the silence of the cosmic anomaly.
        </p>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-md mb-6 text-left flex items-start gap-3">
          <BatteryWarning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400">
            <strong className="text-slate-200 block mb-0.5">Tactical Advisory:</strong>
            Use the Life Support Recharge Pod in the North-West Wing to restore suit oxygen before attempting deep maintenance in the Engineering or Security wings.
          </div>
        </div>

        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-semibold text-slate-950 bg-rose-400 hover:bg-rose-300 rounded shadow-lg shadow-rose-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-4 h-4 fill-current" />
          <span>RETRY MISSION</span>
        </button>
      </div>
    </div>
  );
};
