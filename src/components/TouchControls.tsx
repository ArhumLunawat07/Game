/**
 * PROJECT: LAST SIGNAL - Optional On-Screen Touch Controls for Mobile/Tablet
 */

import React, { useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { Vector2D } from '../game/types';

interface TouchControlsProps {
  onMoveChange: (move: Vector2D) => void;
  onActionClick: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveChange,
  onActionClick
}) => {
  const activeKeys = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false
  });

  const updateVector = () => {
    let x = 0;
    let y = 0;
    if (activeKeys.current.left) x -= 1;
    if (activeKeys.current.right) x += 1;
    if (activeKeys.current.up) y -= 1;
    if (activeKeys.current.down) y += 1;
    onMoveChange({ x, y });
  };

  const handleTouchStart = (dir: 'up' | 'down' | 'left' | 'right') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    activeKeys.current[dir] = true;
    updateVector();
  };

  const handleTouchEnd = (dir: 'up' | 'down' | 'left' | 'right') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    activeKeys.current[dir] = false;
    updateVector();
  };

  return (
    <div className="absolute inset-x-0 bottom-6 z-20 pointer-events-none flex items-end justify-between px-6 select-none md:hidden">
      {/* Virtual D-Pad */}
      <div className="pointer-events-auto grid grid-cols-3 gap-2 w-36 h-36 p-1 bg-slate-950/60 border border-slate-800/80 rounded-full backdrop-blur-sm">
        <div />
        <button
          onTouchStart={handleTouchStart('up')}
          onTouchEnd={handleTouchEnd('up')}
          onMouseDown={handleTouchStart('up')}
          onMouseUp={handleTouchEnd('up')}
          className="flex items-center justify-center bg-slate-900/90 active:bg-cyan-900/80 border border-slate-700/80 rounded-md text-cyan-400"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        <button
          onTouchStart={handleTouchStart('left')}
          onTouchEnd={handleTouchEnd('left')}
          onMouseDown={handleTouchStart('left')}
          onMouseUp={handleTouchEnd('left')}
          className="flex items-center justify-center bg-slate-900/90 active:bg-cyan-900/80 border border-slate-700/80 rounded-md text-cyan-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-center text-[9px] font-mono text-slate-500">MOVE</div>
        <button
          onTouchStart={handleTouchStart('right')}
          onTouchEnd={handleTouchEnd('right')}
          onMouseDown={handleTouchStart('right')}
          onMouseUp={handleTouchEnd('right')}
          className="flex items-center justify-center bg-slate-900/90 active:bg-cyan-900/80 border border-slate-700/80 rounded-md text-cyan-400"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div />
        <button
          onTouchStart={handleTouchStart('down')}
          onTouchEnd={handleTouchEnd('down')}
          onMouseDown={handleTouchStart('down')}
          onMouseUp={handleTouchEnd('down')}
          className="flex items-center justify-center bg-slate-900/90 active:bg-cyan-900/80 border border-slate-700/80 rounded-md text-cyan-400"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <div />
      </div>

      {/* Action Button */}
      <button
        onClick={onActionClick}
        className="pointer-events-auto w-20 h-20 rounded-full bg-cyan-500/90 active:bg-cyan-400 border-2 border-cyan-300 flex flex-col items-center justify-center text-slate-950 font-bold shadow-xl shadow-cyan-500/30 font-mono transition-transform active:scale-95 cursor-pointer"
      >
        <Zap className="w-6 h-6 fill-current mb-0.5" />
        <span className="text-xs">ACTION</span>
      </button>
    </div>
  );
};
