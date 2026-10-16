/**
 * PROJECT: LAST SIGNAL - Title Screen Component
 */

import React, { useState } from 'react';
import { Volume2, VolumeX, Play, HelpCircle, Shield, Radio, Zap, AlertTriangle } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  isMuted,
  onToggleMute
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-8 bg-slate-950/90 backdrop-blur-sm text-slate-100 select-none">
      {/* Top Bar: Sound & Metadata */}
      <div className="w-full max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs tracking-widest text-slate-400 font-mono">
          <span>SPACECRAFT ECHO-7</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>ORBITAL SECTOR 9</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>YEAR 2189</span>
        </div>

        <button
          onClick={onToggleMute}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded hover:border-slate-700 transition-colors"
          title="Toggle Synthesizer Audio"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          <span>{isMuted ? 'SOUND: OFF' : 'SOUND: ON'}</span>
        </button>
      </div>

      {/* Main Centerpiece: Title Lockup & Hero */}
      <div className="flex flex-col items-center text-center max-w-3xl my-auto">
        {/* Bespoke Geometric Emblem */}
        <div className="relative mb-6">
          <svg className="w-20 h-20 text-cyan-400 animate-pulse" viewBox="0 0 100 100" fill="none">
            <polygon points="50,10 90,80 10,80" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 3" />
            <circle cx="50" cy="55" r="18" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="50" cy="55" r="5" fill="#f59e0b" />
            <line x1="50" y1="10" x2="50" y2="37" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="28" y1="70" x2="42" y2="60" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="72" y1="70" x2="58" y2="60" stroke="#38bdf8" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Title Lockup */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-3">
          PROJECT: <span className="text-cyan-400">LAST SIGNAL</span>
        </h1>

        <p className="text-base md:text-lg text-slate-300 max-w-xl mb-2 font-medium">
          When the stars go silent, become humanity&apos;s last hope.
        </p>

        <p className="text-xs md:text-sm text-slate-400 max-w-lg mb-8 leading-relaxed">
          Deep space spacecraft ECHO-7 has lost contact. The AI is hostile, suit life-support is dwindling, and humanity awaits the signal. Restore the tri-harmonic power grid, uncover three data fragments, and transmit through the anomaly.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onStartGame}
            className="flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START MISSION</span>
          </button>

          <button
            onClick={() => setShowHowToPlay(true)}
            className="flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded transition-all whitespace-nowrap cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>HOW TO PLAY</span>
          </button>
        </div>
      </div>

      {/* Control Hint Line */}
      <div className="w-full max-w-5xl flex items-center justify-center text-xs text-slate-400 font-mono tracking-wide">
        <span>WASD / Arrow Keys Move · E / Space Interact · ESC Pause</span>
      </div>

      {/* How To Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <span>MISSION DIRECTIVE & MANUAL</span>
              </h2>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-cyan-950/50 border border-cyan-800/40 rounded shrink-0">
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-0.5">1. Sequential Power Grid Restoral</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Activate the 3 power nodes in ascending geometric harmonic order: Node Δ (Reactor) → Node Σ (Engineering) → Node Ω (Life Support). Each terminal presents a geometric circuit routing matrix to balance electrical flux.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-950/50 border border-purple-800/40 rounded shrink-0">
                  <Radio className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-0.5">2. Data Fragment Recovery</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Locate all 3 glowing data crystals scattered in the Research Lab, Crew Quarters, and Observation Deck to recover decryption keys.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-950/50 border border-emerald-800/40 rounded shrink-0">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-0.5">3. Suit Energy & Life-Support</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Your suit battery drains slowly. Stand near the glowing green Recharge Pod in Life Support and press [E] to replenish energy.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-950/50 border border-amber-800/40 rounded shrink-0">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-0.5">4. Rogue Sentry-X & EMP Override</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Evade the security drone&apos;s red sensor cone in the Security Wing, or interact with the EMP Console to disable it for 45 seconds.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowHowToPlay(false)}
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
              >
                ACKNOWLEDGED
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
