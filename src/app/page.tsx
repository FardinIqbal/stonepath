'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GoBoard } from '@/components/GoBoard';
import { GameInfo } from '@/components/GameInfo';
import { useGoGame } from '@/hooks/useGoGame';
import { useTheme } from '@/lib/theme';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <main className="relative flex flex-col items-center min-h-screen px-4 py-6 md:py-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl flex items-center justify-between mb-6 md:mb-10"
        >
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">
              Stone<span className="text-foreground-muted">Path</span>
            </h1>
            <p className="text-foreground-muted text-xs md:text-sm mt-0.5 font-serif italic">
              The Ancient Game of Go
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Navigation */}
            <nav className="flex gap-1 text-sm">
              <span className="px-3 py-1.5 rounded-md bg-background-secondary text-foreground font-medium">
                Play
              </span>
              <Link
                href="/puzzles"
                className="px-3 py-1.5 rounded-md text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
              >
                Puzzles
              </Link>
            </nav>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-background-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </motion.header>

        {/* Game area - mobile: stacked, desktop: side by side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8 w-full max-w-4xl"
        >
          {/* Board */}
          <div className="flex justify-center">
            <GoBoard
              gameState={gameState}
              onPlaceStone={placeStone}
              disabled={isAIThinking}
            />
          </div>

          {/* Game info - full width on mobile */}
          <div className="w-full lg:w-auto lg:min-w-[280px]">
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
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 md:mt-12 text-center"
        >
          <p className="text-xs text-foreground-muted font-serif">
            Tap intersections to place stones
          </p>
          <p className="text-[10px] text-foreground-muted opacity-60 mt-1">
            Japanese Rules | Komi 6.5
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
