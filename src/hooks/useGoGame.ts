'use client';

import { useState, useCallback } from 'react';
import {
  GameState,
  Position,
  BoardSize,
  createGame,
  playMove,
  pass,
  undoMove,
  resetGame,
  calculateScore,
} from '@/lib/go-engine';

export type GameMode = 'local' | 'ai';

interface UseGoGameOptions {
  boardSize?: BoardSize;
  mode?: GameMode;
  komi?: number;
}

export function useGoGame(options: UseGoGameOptions = {}) {
  const { boardSize = 19, mode = 'local', komi = 6.5 } = options;

  const [gameState, setGameState] = useState<GameState>(() =>
    createGame(boardSize)
  );

  const placeStone = useCallback((pos: Position) => {
    setGameState(current => {
      const newState = playMove(current, pos);
      return newState || current;
    });
  }, []);

  const passMove = useCallback(() => {
    setGameState(current => pass(current));
  }, []);

  const undo = useCallback(() => {
    setGameState(current => {
      const newState = undoMove(current);
      return newState || current;
    });
  }, []);

  const reset = useCallback(() => {
    setGameState(current => resetGame(current));
  }, []);

  const newGame = useCallback((size: BoardSize) => {
    setGameState(createGame(size));
  }, []);

  const score = calculateScore(gameState, komi);

  return {
    gameState,
    placeStone,
    passMove,
    undo,
    reset,
    newGame,
    score,
    mode,
  };
}
