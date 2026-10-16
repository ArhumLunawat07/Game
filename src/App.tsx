/**
 * PROJECT: LAST SIGNAL - Main Application Component
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/gameEngine';
import { GameState, DataFragment, Interactable } from './game/types';
import { sound } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { CircuitModal } from './components/CircuitModal';
import { LogModal } from './components/LogModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { TouchControls } from './components/TouchControls';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // App UI State
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  // HUD stats
  const [hudStats, setHudStats] = useState({
    energy: 100,
    fragmentsCollected: 0,
    totalFragments: 3,
    nodesActivated: 0,
    totalNodes: 3,
    currentObjective: 'Restore 3 Power Nodes across station',
    nearbyInteractable: null as Interactable | null,
    droneDisabledTimer: 0,
    gameTime: 0
  });

  // Modal states
  const [activePuzzleNode, setActivePuzzleNode] = useState<'DELTA' | 'SIGMA' | 'OMEGA' | null>(null);
  const [activeLog, setActiveLog] = useState<{
    title: string;
    content: string;
    author?: string;
    timestamp?: string;
    isDataFragment?: boolean;
  } | null>(null);

  // Initialize Game Engine on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const engine = new GameEngine(canvas, {
      onStateChange: (newState) => {
        setGameState(newState);
      },
      onOpenCircuitPuzzle: (nodeId) => {
        setActivePuzzleNode(nodeId);
      },
      onOpenDataLog: (fragment: DataFragment) => {
        setActiveLog({
          title: fragment.title,
          content: fragment.logText,
          author: fragment.author,
          timestamp: fragment.timestamp,
          isDataFragment: true
        });
      },
      onOpenHintModal: (title: string, content: string) => {
        setActiveLog({
          title,
          content,
          isDataFragment: false
        });
      },
      onHudUpdate: (stats) => {
        setHudStats(stats);
      },
      onTransmissionComplete: () => {
        setGameState('VICTORY');
      }
    });

    engineRef.current = engine;
    engine.startLoop();

    const handleResize = () => {
      if (canvasRef.current && engineRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        engineRef.current.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stopLoop();
    };
  }, []);

  // Keyboard shortcut to start game from Title screen
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState === 'TITLE' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleStartGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  const handleStartGame = () => {
    sound.playBlip();
    if (engineRef.current) {
      engineRef.current.startNewGame();
    }
  };

  const handleToggleMute = () => {
    const newMute = sound.toggleMute();
    setIsMuted(newMute);
  };

  const handlePause = () => {
    sound.playBlip();
    if (engineRef.current) {
      engineRef.current.setPaused(true);
    }
  };

  const handleResume = () => {
    sound.playBlip();
    if (engineRef.current) {
      engineRef.current.setPaused(false);
    }
  };

  const handleRestart = () => {
    sound.playBlip();
    if (engineRef.current) {
      engineRef.current.startNewGame();
    }
  };

  const handleSolvePuzzle = (nodeId: 'DELTA' | 'SIGMA' | 'OMEGA') => {
    if (engineRef.current) {
      engineRef.current.completePowerNode(nodeId);
    }
    setActivePuzzleNode(null);
  };

  const handleTriggerInteract = () => {
    if (engineRef.current) {
      engineRef.current.triggerInteraction();
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 60FPS Hardware-Accelerated 2D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair"
      />

      {/* Title Screen Overlay */}
      {gameState === 'TITLE' && (
        <TitleScreen
          onStartGame={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* In-Game HUD (Visible during gameplay and cutscenes) */}
      {(gameState === 'PLAYING' || gameState === 'TRANSMITTING' || gameState === 'PAUSED') && (
        <GameHUD
          energy={hudStats.energy}
          fragmentsCollected={hudStats.fragmentsCollected}
          totalFragments={hudStats.totalFragments}
          nodesActivated={hudStats.nodesActivated}
          totalNodes={hudStats.totalNodes}
          currentObjective={hudStats.currentObjective}
          nearbyInteractable={hudStats.nearbyInteractable}
          droneDisabledTimer={hudStats.droneDisabledTimer}
          gameTime={hudStats.gameTime}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onTriggerInteract={handleTriggerInteract}
        />
      )}

      {/* Mobile / Touchscreen On-Screen Controls */}
      {gameState === 'PLAYING' && (
        <TouchControls
          onMoveChange={(move) => {
            if (engineRef.current) {
              engineRef.current.virtualMove = move;
            }
          }}
          onActionClick={handleTriggerInteract}
        />
      )}

      {/* Transmission Cinematics Banner Overlay */}
      {gameState === 'TRANSMITTING' && (
        <div className="absolute inset-x-0 top-24 z-30 flex flex-col items-center justify-center p-4 pointer-events-none text-center">
          <div className="px-6 py-3 bg-purple-950/80 border border-purple-500/80 rounded-lg shadow-2xl backdrop-blur-md animate-pulse">
            <div className="text-xs font-mono text-purple-300 tracking-widest uppercase mb-1">
              HIGH-ENERGY ARRAY ENGAGED
            </div>
            <div className="text-lg font-bold text-white tracking-wide">
              FOCUSING TACHYON BEAM ACROSS ANOMALY FREQUENCIES...
            </div>
          </div>
        </div>
      )}

      {/* Interactive Circuit Routing Modal */}
      {activePuzzleNode && (
        <CircuitModal
          nodeId={activePuzzleNode}
          onSolve={handleSolvePuzzle}
          onClose={() => setActivePuzzleNode(null)}
        />
      )}

      {/* Data Fragment Log & Hint Modal */}
      {activeLog && (
        <LogModal
          title={activeLog.title}
          content={activeLog.content}
          author={activeLog.author}
          timestamp={activeLog.timestamp}
          isDataFragment={activeLog.isDataFragment}
          onClose={() => setActiveLog(null)}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal onRestart={handleRestart} />
      )}

      {/* Victory Screen */}
      {gameState === 'VICTORY' && (
        <VictoryModal
          gameTime={hudStats.gameTime}
          energy={hudStats.energy}
          fragmentsCollected={hudStats.fragmentsCollected}
          totalFragments={hudStats.totalFragments}
          onPlayAgain={handleRestart}
        />
      )}
    </div>
  );
}
