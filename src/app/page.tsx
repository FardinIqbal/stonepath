'use client';

import { motion } from 'framer-motion';
import { GoBoard } from '@/components/GoBoard';
import { GameInfo } from '@/components/GameInfo';
import { useGoGame } from '@/hooks/useGoGame';

export default function Home() {
  const {
    gameState,
    placeStone,
    passMove,
    undo,
    reset,
    newGame,
    score,
  } = useGoGame({ boardSize: 19 });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Gradient accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      <main className="relative flex flex-col items-center justify-center min-h-screen p-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Stone<span className="text-zinc-500">Path</span>
          </h1>
          <p className="text-zinc-500 text-sm">
            The ancient game of Go
          </p>
        </motion.header>

        {/* Game area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row items-center lg:items-start gap-8"
        >
          <GoBoard
            gameState={gameState}
            onPlaceStone={placeStone}
          />

          <GameInfo
            gameState={gameState}
            score={score}
            onPass={passMove}
            onUndo={undo}
            onReset={reset}
            onNewGame={newGame}
          />
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center text-xs text-zinc-600"
        >
          <p>Click intersections to place stones. Black plays first.</p>
          <p className="mt-1">Komi: 6.5 points for White</p>
        </motion.footer>
      </main>
    </div>
  );
}
