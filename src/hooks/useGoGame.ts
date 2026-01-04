'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  GameState,
  Position,
  BoardSize,
  Stone,
  createGame,
  playMove,
  pass,
  undoMove,
  resetGame,
  calculateScore,
} from '@/lib/go-engine';
import { useSound } from './useSound';

export type GameMode = 'local' | 'ai-black' | 'ai-white';
export type AIStrength = 'beginner' | 'intermediate' | 'strong';

interface UseGoGameOptions {
  boardSize?: BoardSize;
  mode?: GameMode;
  komi?: number;
  aiStrength?: AIStrength;
  soundEnabled?: boolean;
}

export function useGoGame(options: UseGoGameOptions = {}) {
  const {
    boardSize = 19,
    mode = 'local',
    komi = 6.5,
    aiStrength = 'intermediate',
    soundEnabled = true,
  } = options;

  const [gameState, setGameState] = useState<GameState>(() =>
    createGame(boardSize)
  );
  const [currentMode, setCurrentMode] = useState<GameMode>(mode);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const aiWorkerRef = useRef<Worker | null>(null);

  const {
    playStoneSound,
    playCaptureSound,
    playPassSound,
    playGameOverSound,
  } = useSound();

  // Check if it's AI's turn
  const isAITurn = useCallback(
    (state: GameState) => {
      if (state.gameOver) return false;
      if (currentMode === 'ai-black' && state.currentPlayer === 'black') return true;
      if (currentMode === 'ai-white' && state.currentPlayer === 'white') return true;
      return false;
    },
    [currentMode]
  );

  const placeStone = useCallback(
    (pos: Position) => {
      setGameState((current) => {
        const newState = playMove(current, pos);
        if (newState) {
          // Play sounds
          if (soundEnabled) {
            playStoneSound();
            const captureCount =
              newState.captures[current.currentPlayer] -
              current.captures[current.currentPlayer];
            if (captureCount > 0) {
              setTimeout(() => playCaptureSound(captureCount), 100);
            }
          }

          // Check for game over
          if (newState.gameOver && soundEnabled) {
            setTimeout(() => playGameOverSound(), 200);
          }

          return newState;
        }
        return current;
      });
    },
    [soundEnabled, playStoneSound, playCaptureSound, playGameOverSound]
  );

  const passMove = useCallback(() => {
    setGameState((current) => {
      const newState = pass(current);
      if (soundEnabled) {
        playPassSound();
        if (newState.gameOver) {
          setTimeout(() => playGameOverSound(), 200);
        }
      }
      return newState;
    });
  }, [soundEnabled, playPassSound, playGameOverSound]);

  const undo = useCallback(() => {
    setGameState((current) => {
      const newState = undoMove(current);
      return newState || current;
    });
  }, []);

  const reset = useCallback(() => {
    setGameState((current) => resetGame(current));
  }, []);

  const newGame = useCallback((size: BoardSize) => {
    setGameState(createGame(size));
  }, []);

  const setMode = useCallback((newMode: GameMode) => {
    setCurrentMode(newMode);
  }, []);

  // AI move logic (will be enhanced with TensorFlow.js later)
  useEffect(() => {
    if (isAITurn(gameState) && !isAIThinking) {
      setIsAIThinking(true);

      // Delay to make AI feel more natural
      const delay = 300 + Math.random() * 500;

      const timer = setTimeout(async () => {
        // Import AI dynamically to reduce initial bundle size
        const { getAIMove } = await import('@/lib/go-ai');
        const move = getAIMove(gameState, aiStrength);

        if (move) {
          placeStone(move);
        } else {
          passMove();
        }

        setIsAIThinking(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [gameState, isAITurn, isAIThinking, aiStrength, placeStone, passMove]);

  const score = calculateScore(gameState, komi);

  return {
    gameState,
    placeStone,
    passMove,
    undo,
    reset,
    newGame,
    score,
    mode: currentMode,
    setMode,
    isAIThinking,
    isAITurn: isAITurn(gameState),
  };
}
