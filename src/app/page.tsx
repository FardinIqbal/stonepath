'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
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
    mode,
    setMode,
    strength,
    setStrength,
    isAIThinking,
    kataNetStatus,
  } = useGoGame({ boardSize: 19, mode: 'local' });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Subtle ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-900/5 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-gradient-to-t from-zinc-800/10 via-transparent to-transparent blur-3xl" />
      </div>

      <main className="relative flex flex-col items-center min-h-screen px-4 py-8 md:py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-light tracking-tight">
            Stone<span className="text-zinc-500">Path</span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-600 text-sm mt-2 tracking-wide"
          >
            Master the ancient game of Go
          </motion.p>

          {/* Navigation */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-6 mt-4"
          >
            <span className="text-sm text-white border-b border-white/20 pb-1">
              Play
            </span>
            <Link
              href="/puzzles"
              className="text-sm text-zinc-500 hover:text-white transition-colors pb-1"
            >
              Puzzles
            </Link>
          </motion.nav>
        </motion.header>

        {/* Game area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10"
        >
          <GoBoard
            gameState={gameState}
            onPlaceStone={placeStone}
            disabled={isAIThinking}
          />

          <GameInfo
            gameState={gameState}
            score={score}
            mode={mode}
            strength={strength}
            isAIThinking={isAIThinking}
            kataNetStatus={kataNetStatus}
            onPass={passMove}
            onUndo={undo}
            onReset={reset}
            onNewGame={newGame}
            onModeChange={setMode}
            onStrengthChange={setStrength}
          />
        </motion.div>

        {/* Footer hints */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 md:mt-16 text-center space-y-1"
        >
          <p className="text-xs text-zinc-600">
            Click intersections to place stones
          </p>
          <p className="text-[10px] text-zinc-700">
            Japanese rules | Komi 6.5
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
