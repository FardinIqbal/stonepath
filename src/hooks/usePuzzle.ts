'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Puzzle, PuzzleDifficulty } from '@/lib/tsumego';
import { puzzles, getPuzzlesByDifficulty, getNextPuzzle, getRandomPuzzle } from '@/lib/puzzle-database';

interface PuzzleProgress {
  solved: string[];
  attempted: string[];
  streak: number;
  bestStreak: number;
  totalSolved: number;
}

const STORAGE_KEY = 'stonepath-puzzle-progress';

function loadProgress(): PuzzleProgress {
  if (typeof window === 'undefined') {
    return { solved: [], attempted: [], streak: 0, bestStreak: 0, totalSolved: 0 };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load puzzle progress:', e);
  }

  return { solved: [], attempted: [], streak: 0, bestStreak: 0, totalSolved: 0 };
}

function saveProgress(progress: PuzzleProgress): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save puzzle progress:', e);
  }
}

export function usePuzzle() {
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [progress, setProgress] = useState<PuzzleProgress>(loadProgress);
  const [filter, setFilter] = useState<PuzzleDifficulty | 'all'>('all');
  const [showHint, setShowHint] = useState(false);

  // Load progress on mount
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  // Get filtered puzzle list
  const filteredPuzzles = filter === 'all' ? puzzles : getPuzzlesByDifficulty(filter);

  // Select a puzzle
  const selectPuzzle = useCallback((puzzle: Puzzle) => {
    setCurrentPuzzle(puzzle);
    setShowHint(false);
  }, []);

  // Select random puzzle
  const selectRandom = useCallback((difficulty?: PuzzleDifficulty) => {
    const puzzle = getRandomPuzzle(difficulty);
    selectPuzzle(puzzle);
  }, [selectPuzzle]);

  // Handle puzzle solved
  const onSolved = useCallback(() => {
    if (!currentPuzzle) return;

    setProgress((prev) => {
      const newProgress = {
        ...prev,
        solved: prev.solved.includes(currentPuzzle.id)
          ? prev.solved
          : [...prev.solved, currentPuzzle.id],
        attempted: prev.attempted.includes(currentPuzzle.id)
          ? prev.attempted
          : [...prev.attempted, currentPuzzle.id],
        streak: prev.streak + 1,
        bestStreak: Math.max(prev.bestStreak, prev.streak + 1),
        totalSolved: prev.totalSolved + 1,
      };
      saveProgress(newProgress);
      return newProgress;
    });
  }, [currentPuzzle]);

  // Handle puzzle failed
  const onFailed = useCallback(() => {
    if (!currentPuzzle) return;

    setProgress((prev) => {
      const newProgress = {
        ...prev,
        attempted: prev.attempted.includes(currentPuzzle.id)
          ? prev.attempted
          : [...prev.attempted, currentPuzzle.id],
        streak: 0,
      };
      saveProgress(newProgress);
      return newProgress;
    });
  }, [currentPuzzle]);

  // Go to next puzzle
  const nextPuzzle = useCallback(() => {
    if (!currentPuzzle) return;

    const next = getNextPuzzle(currentPuzzle.id);
    if (next) {
      selectPuzzle(next);
    } else {
      // Loop back or get random
      selectRandom();
    }
  }, [currentPuzzle, selectPuzzle, selectRandom]);

  // Check if puzzle is solved
  const isPuzzleSolved = useCallback(
    (puzzleId: string) => progress.solved.includes(puzzleId),
    [progress.solved]
  );

  // Check if puzzle was attempted
  const isPuzzleAttempted = useCallback(
    (puzzleId: string) => progress.attempted.includes(puzzleId),
    [progress.attempted]
  );

  // Get completion stats
  const getStats = useCallback(() => {
    const total = puzzles.length;
    const solved = progress.solved.length;
    const attempted = progress.attempted.length;

    return {
      total,
      solved,
      attempted,
      completion: Math.round((solved / total) * 100),
      streak: progress.streak,
      bestStreak: progress.bestStreak,
      totalSolved: progress.totalSolved,
    };
  }, [progress]);

  // Reset progress
  const resetProgress = useCallback(() => {
    const fresh = { solved: [], attempted: [], streak: 0, bestStreak: 0, totalSolved: 0 };
    setProgress(fresh);
    saveProgress(fresh);
  }, []);

  return {
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
    isPuzzleAttempted,
    getStats,
    showHint,
    setShowHint,
    resetProgress,
  };
}
