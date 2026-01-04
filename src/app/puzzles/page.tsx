'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PuzzleBoard } from '@/components/PuzzleBoard';
import { usePuzzle } from '@/hooks/usePuzzle';
import { useTheme } from '@/lib/theme';
import { difficultyRatings, categoryDescriptions } from '@/lib/tsumego';
import type { PuzzleDifficulty, PuzzleCategory } from '@/lib/tsumego';

const difficultyColors: Record<PuzzleDifficulty, string> = {
  beginner: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  easy: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  hard: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
  expert: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
};

export default function PuzzlesPage() {
  const { theme, toggleTheme } = useTheme();
  const {
    currentPuzzle,
    selectPuzzle,
    selectRandom,
    nextPuzzle,
    onSolved,
    onFailed,
    filter,
    setFilter,
    filteredPuzzles,
    isPuzzleSolved,
    getStats,
    showHint,
    setShowHint,
  } = usePuzzle();

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <main className="relative max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8"
        >
          <div>
            <Link
              href="/"
              className="text-foreground-muted hover:text-foreground text-sm mb-2 inline-block transition-colors font-serif"
            >
              Back to Game
            </Link>
            <h1 className="text-2xl font-serif font-semibold tracking-tight">
              Tsumego <span className="text-foreground-muted">Puzzles</span>
            </h1>
            <p className="text-foreground-muted text-sm mt-1 font-serif italic">
              Train your reading with life & death problems
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex gap-4 sm:gap-6 text-sm">
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">{stats.solved}</div>
                <div className="text-foreground-muted text-[10px] uppercase tracking-wider font-serif">Solved</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-accent-gold">{stats.streak}</div>
                <div className="text-foreground-muted text-[10px] uppercase tracking-wider font-serif">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground-secondary">{stats.completion}%</div>
                <div className="text-foreground-muted text-[10px] uppercase tracking-wider font-serif">Complete</div>
              </div>
            </div>

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

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Puzzle list sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-64 flex-shrink-0"
          >
            {/* Quick actions */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => selectRandom()}
                className="flex-1 px-4 py-2.5 rounded-md bg-accent-gold/20 hover:bg-accent-gold/30 text-accent-gold text-sm font-medium transition-colors border border-accent-gold/30"
              >
                Random Puzzle
              </button>
            </div>

            {/* Difficulty filter */}
            <div className="mb-4">
              <div className="text-[10px] font-serif text-foreground-muted uppercase tracking-wider mb-2">
                Filter by Difficulty
              </div>
              <div className="flex flex-wrap gap-1.5">
                <FilterButton
                  active={filter === 'all'}
                  onClick={() => setFilter('all')}
                >
                  All
                </FilterButton>
                {(['beginner', 'easy', 'medium', 'hard', 'expert'] as const).map((diff) => (
                  <FilterButton
                    key={diff}
                    active={filter === diff}
                    onClick={() => setFilter(diff)}
                    color={diff}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </FilterButton>
                ))}
              </div>
            </div>

            {/* Puzzle list */}
            <div className="space-y-1.5 max-h-[calc(100vh-340px)] overflow-y-auto pr-1 hide-scrollbar">
              {filteredPuzzles.map((puzzle) => {
                const solved = isPuzzleSolved(puzzle.id);
                const isActive = currentPuzzle?.id === puzzle.id;

                return (
                  <button
                    key={puzzle.id}
                    onClick={() => selectPuzzle(puzzle)}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-background-secondary border-accent-gold/30'
                        : 'bg-background-tertiary/50 hover:bg-background-secondary border-border/50'
                    } border`}
                  >
                    <div className="flex items-center gap-2">
                      {solved && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        </div>
                      )}
                      <span className={`text-sm font-serif ${solved ? 'text-foreground' : 'text-foreground-secondary'}`}>
                        {puzzle.name}
                      </span>
                      <span
                        className={`ml-auto text-[10px] px-1.5 py-0.5 rounded border ${
                          difficultyColors[puzzle.difficulty]
                        }`}
                      >
                        {puzzle.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.aside>

          {/* Main puzzle area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <AnimatePresence mode="wait">
              {currentPuzzle ? (
                <motion.div
                  key={currentPuzzle.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col items-center"
                >
                  {/* Puzzle info */}
                  <div className="text-center mb-5">
                    <h2 className="text-xl font-serif font-medium text-foreground mb-1">
                      {currentPuzzle.name}
                    </h2>
                    <p className="text-sm text-foreground-muted font-serif italic mb-3">
                      {currentPuzzle.description}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <span
                        className={`text-xs px-2 py-1 rounded border ${
                          difficultyColors[currentPuzzle.difficulty]
                        }`}
                      >
                        {currentPuzzle.difficulty}
                      </span>
                      <span className="text-xs text-foreground-muted font-serif">
                        {categoryDescriptions[currentPuzzle.category]}
                      </span>
                    </div>
                  </div>

                  {/* Puzzle board */}
                  <PuzzleBoard
                    key={currentPuzzle.id}
                    puzzle={currentPuzzle}
                    onSolved={() => {
                      onSolved();
                    }}
                    onFailed={onFailed}
                  />

                  {/* Hint and next */}
                  <div className="flex gap-3 mt-5">
                    {currentPuzzle.hint && (
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className="px-4 py-2 rounded-md bg-background-secondary hover:bg-background-tertiary text-sm transition-colors border border-border text-foreground-secondary hover:text-foreground"
                      >
                        {showHint ? 'Hide Hint' : 'Show Hint'}
                      </button>
                    )}
                    <button
                      onClick={nextPuzzle}
                      className="px-4 py-2 rounded-md bg-background-secondary hover:bg-background-tertiary text-sm transition-colors border border-border text-foreground-secondary hover:text-foreground"
                    >
                      Next Puzzle
                    </button>
                  </div>

                  {/* Hint text */}
                  <AnimatePresence>
                    {showHint && currentPuzzle.hint && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 px-4 py-3 rounded-md bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-sm font-serif italic"
                      >
                        {currentPuzzle.hint}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-80 text-center"
                >
                  <h2 className="text-xl font-serif font-medium text-foreground-secondary mb-2">
                    Select a Puzzle
                  </h2>
                  <p className="text-sm text-foreground-muted font-serif italic mb-6">
                    Choose from the list or try a random puzzle
                  </p>
                  <button
                    onClick={() => selectRandom()}
                    className="px-6 py-3 rounded-md bg-accent-gold/20 hover:bg-accent-gold/30 text-accent-gold font-medium transition-colors border border-accent-gold/30"
                  >
                    Start Random Puzzle
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: PuzzleDifficulty;
}

function FilterButton({ active, onClick, children, color }: FilterButtonProps) {
  const { theme } = useTheme();
  const colorClass = color && active ? difficultyColors[color] : '';

  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
        active
          ? color
            ? colorClass
            : theme === 'dark'
            ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/30'
            : 'bg-accent/10 text-accent border-accent/30'
          : 'bg-background-tertiary/50 text-foreground-muted hover:bg-background-tertiary'
      } border ${active && !color ? '' : 'border-border/50'}`}
    >
      {children}
    </button>
  );
}
