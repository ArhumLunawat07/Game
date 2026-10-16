/**
 * PROJECT: LAST SIGNAL - Low-Occlusion In-Game HUD
 */

import React from 'react';
import { Volume2, VolumeX, Pause, BatteryCharging, AlertCircle, Database, Radio, Zap } from 'lucide-react';
import { Interactable } from '../game/types';

interface GameHUDProps {
  energy: number;
  fragmentsCollected: number;
  totalFragments: number;
  nodesActivated: number;
  totalNodes: number;
  currentObjective: string;
  nearbyInteractable: Interactable | null;
  droneDisabledTimer: number;
  gameTime: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onTriggerInteract: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  energy,
  fragmentsCollected,
  totalFragments,
  nodesActivated,
  totalNodes,
  currentObjective,
  nearbyInteractable,
  droneDisabledTimer,
  gameTime,
  isMuted,
  onToggleMute,
  onPause,
  onTriggerInteract
}) => {
  const isEnergyLow = energy < 25;
  const minutes = Math.floor(gameTime / 60);
  const seconds = Math.floor(gameTime % 60);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 md:p-6 select-none">
      {/* Top Bar Perimeter Cluster */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Suit Life Support & Data Count */}
        <div className="flex flex-col gap-2.5">
          {/* Suit Energy Gauge */}
          <div className="pointer-events-auto flex items-center gap-3 px-3.5 py-2 bg-slate-950/80 border border-slate-800/80 rounded-md backdrop-blur-sm">
            <div className={`p-1.5 rounded ${isEnergyLow ? 'bg-rose-950 text-rose-400 animate-pulse' : 'bg-slate-900 text-cyan-400'}`}>
              <BatteryCharging className="w-4 h-4" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-4 text-xs font-mono mb-1">
                <span className="text-slate-400 uppercase tracking-wider text-[10px]">SUIT LIFE SUPPORT</span>
                <span className={`font-bold tabular-nums ${isEnergyLow ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {energy}%
                </span>
              </div>
              <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isEnergyLow ? 'bg-rose-500 shadow-sm shadow-rose-500' : 'bg-cyan-400 shadow-sm shadow-cyan-400'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, energy))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mission Progress Cluster */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Power Nodes */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-slate-800/80 rounded-md text-xs font-mono text-slate-300 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">NODES</span>
              <span className="font-bold tabular-nums text-white">{nodesActivated}/{totalNodes}</span>
            </div>

            {/* Data Fragments */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-slate-800/80 rounded-md text-xs font-mono text-slate-300 backdrop-blur-sm">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-400">DATA</span>
              <span className="font-bold tabular-nums text-white">{fragmentsCollected}/{totalFragments}</span>
            </div>

            {/* Drone EMP countdown if active */}
            {droneDisabledTimer > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-950/80 border border-blue-800/80 rounded-md text-xs font-mono text-blue-300 backdrop-blur-sm">
                <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-400 text-[10px]">EMP</span>
                <span className="font-bold tabular-nums">{droneDisabledTimer}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Top Right: Objective Banner & Controls */}
        <div className="flex items-center gap-3">
          {/* Active Directive Readout */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-slate-950/80 border border-slate-800/80 rounded-md text-xs font-mono text-slate-200 backdrop-blur-sm">
            <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
            <span className="text-slate-400 text-[10px] tracking-wider uppercase">DIRECTIVE:</span>
            <span className="font-medium text-slate-100">{currentObjective}</span>
          </div>

          {/* Mission Timer */}
          <div className="pointer-events-auto px-3 py-2 bg-slate-950/80 border border-slate-800/80 rounded-md text-xs font-mono tabular-nums text-slate-300 backdrop-blur-sm">
            {formattedTime}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="pointer-events-auto p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 rounded-md text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="pointer-events-auto p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 rounded-md text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Pause Game [ESC]"
          >
            <Pause className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Center Bottom: Contextual Proximity Prompt */}
      {nearbyInteractable && (
        <div className="self-center mb-6 pointer-events-auto animate-bounce">
          <button
            onClick={onTriggerInteract}
            className="flex items-center gap-3 px-5 py-2.5 bg-cyan-950/90 border border-cyan-500/80 rounded-full text-slate-100 shadow-xl shadow-cyan-500/20 backdrop-blur-md cursor-pointer hover:bg-cyan-900 transition-all hover:scale-105 active:scale-95"
          >
            <span className="px-2 py-0.5 bg-cyan-400 text-slate-950 text-xs font-black rounded font-mono">
              E
            </span>
            <span className="text-xs font-semibold tracking-wide text-cyan-200">
              {nearbyInteractable.actionText.toUpperCase()}
            </span>
          </button>
        </div>
      )}

      {/* Bottom Perimeter Left: Station Room Indicator */}
      <div className="flex items-center justify-between w-full">
        <div className="text-[11px] font-mono text-slate-400 tracking-wider">
          <span>ECHO-7 TELEMETRY</span>
          <span className="mx-2 text-slate-600">·</span>
          <span>NOVA ENGINEER STATUS: ACTIVE</span>
        </div>

        <div className="text-[11px] font-mono text-slate-400 tracking-wider">
          <span>HOLD [E] OR CLICK PROMPT TO ENGAGE</span>
        </div>
      </div>
    </div>
  );
};
