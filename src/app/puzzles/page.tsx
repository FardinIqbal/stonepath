'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PuzzleBoard } from '@/components/PuzzleBoard';
import { usePuzzle } from '@/hooks/usePuzzle';
import { difficultyRatings, categoryDescriptions } from '@/lib/tsumego';
import type { PuzzleDifficulty, PuzzleCategory } from '@/lib/tsumego';

const difficultyColors: Record<PuzzleDifficulty, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  easy: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  hard: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  expert: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const categoryIcons: Record<PuzzleCategory, string> = {
  'life-death': '',
  capture: '',
  escape: '',
  connect: '',
  cut: '',
};

export default function PuzzlesPage() {
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
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-900/5 via-transparent to-transparent blur-3xl" />
      </div>

      <main className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <Link
              href="/"
              className="text-zinc-500 hover:text-zinc-300 text-sm mb-2 inline-block transition-colors"
            >
              ← Back to Game
            </Link>
            <h1 className="text-2xl font-light tracking-tight">
              Tsumego <span className="text-zinc-500">Puzzles</span>
            </h1>
            <p className="text-zinc-600 text-sm mt-1">
              Train your reading with life & death problems
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div className="text-xl font-semibold text-white">{stats.solved}</div>
              <div className="text-zinc-500 text-xs">Solved</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-amber-400">{stats.streak}</div>
              <div className="text-zinc-500 text-xs">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-zinc-400">{stats.completion}%</div>
              <div className="text-zinc-500 text-xs">Complete</div>
            </div>
          </div>
        </motion.header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Puzzle list sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-72 flex-shrink-0"
          >
            {/* Quick actions */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => selectRandom()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-sm font-medium transition-colors"
              >
                Random Puzzle
              </button>
            </div>

            {/* Difficulty filter */}
            <div className="mb-4">
              <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
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
            <div className="space-y-1.5 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {filteredPuzzles.map((puzzle) => {
                const solved = isPuzzleSolved(puzzle.id);
                const isActive = currentPuzzle?.id === puzzle.id;

                return (
                  <button
                    key={puzzle.id}
                    onClick={() => selectPuzzle(puzzle)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-zinc-700/80 border-zinc-600'
                        : 'bg-zinc-800/40 hover:bg-zinc-800/80 border-zinc-800/50'
                    } border`}
                  >
                    <div className="flex items-center gap-2">
                      {solved && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        </div>
                      )}
                      <span className={`text-sm ${solved ? 'text-zinc-300' : 'text-zinc-400'}`}>
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
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-medium text-white mb-1">
                      {currentPuzzle.name}
                    </h2>
                    <p className="text-sm text-zinc-500 mb-3">
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
                      <span className="text-xs text-zinc-500">
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
                  <div className="flex gap-3 mt-6">
                    {currentPuzzle.hint && (
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className="px-4 py-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 text-sm transition-colors border border-zinc-700/50"
                      >
                        {showHint ? 'Hide Hint' : 'Show Hint'}
                      </button>
                    )}
                    <button
                      onClick={nextPuzzle}
                      className="px-4 py-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 text-sm transition-colors border border-zinc-700/50"
                    >
                      Next Puzzle →
                    </button>
                  </div>

                  {/* Hint text */}
                  <AnimatePresence>
                    {showHint && currentPuzzle.hint && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-sm"
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
                  className="flex flex-col items-center justify-center h-96 text-center"
                >
                  <div className="text-6xl mb-4 opacity-20">
                    {categoryIcons['life-death']}
                  </div>
                  <h2 className="text-xl font-medium text-zinc-400 mb-2">
                    Select a Puzzle
                  </h2>
                  <p className="text-sm text-zinc-600 mb-6">
                    Choose from the list or try a random puzzle
                  </p>
                  <button
                    onClick={() => selectRandom()}
                    className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 font-medium transition-colors"
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
  const colorClass = color && active ? difficultyColors[color] : '';

  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
        active
          ? color
            ? colorClass
            : 'bg-white text-black'
          : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60'
      } border ${active && !color ? 'border-transparent' : 'border-zinc-700/30'}`}
    >
      {children}
    </button>
  );
}
