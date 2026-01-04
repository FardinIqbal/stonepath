'use client';

import { useState, useCallback, useEffect } from 'react';
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
  getBoardSize,
} from '@/lib/go-engine';
import { useSound } from './useSound';

export type GameMode = 'local' | 'ai-black' | 'ai-white';
export type AIStrength = 'beginner' | 'intermediate' | 'katanet';

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
  const [currentStrength, setCurrentStrength] = useState<AIStrength>(aiStrength);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [kataNetStatus, setKataNetStatus] = useState<'not-loaded' | 'loading' | 'ready' | 'error'>('not-loaded');

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

  const setStrength = useCallback((strength: AIStrength) => {
    setCurrentStrength(strength);
  }, []);

  // Load KataNet when strength is set to katanet
  useEffect(() => {
    if (currentStrength === 'katanet' && kataNetStatus === 'not-loaded') {
      const loadModel = async () => {
        setKataNetStatus('loading');
        try {
          const { loadKataNet } = await import('@/lib/katanet');
          await loadKataNet();
          setKataNetStatus('ready');
        } catch (error) {
          console.error('Failed to load KataNet:', error);
          setKataNetStatus('error');
        }
      };
      loadModel();
    }
  }, [currentStrength, kataNetStatus]);

  // AI move logic
  useEffect(() => {
    if (isAITurn(gameState) && !isAIThinking) {
      setIsAIThinking(true);

      // Delay to make AI feel more natural
      const delay = currentStrength === 'katanet' ? 100 : 300 + Math.random() * 500;

      const timer = setTimeout(async () => {
        let move: Position | null = null;

        const size = getBoardSize(gameState);

        // Use KataNet for 19x19 when available and selected
        if (currentStrength === 'katanet' && size === 19 && kataNetStatus === 'ready') {
          try {
            const { getKataNetMove } = await import('@/lib/katanet');
            move = await getKataNetMove(gameState);
          } catch (error) {
            console.error('KataNet move error:', error);
          }
        }

        // Fall back to heuristic AI
        if (!move) {
          const { getAIMove } = await import('@/lib/go-ai');
          const heuristicStrength = currentStrength === 'katanet' ? 'strong' : currentStrength;
          move = getAIMove(gameState, heuristicStrength as 'beginner' | 'intermediate' | 'strong');
        }

        if (move) {
          placeStone(move);
        } else {
          passMove();
        }

        setIsAIThinking(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [gameState, isAITurn, isAIThinking, currentStrength, kataNetStatus, placeStone, passMove]);

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
    strength: currentStrength,
    setStrength,
    isAIThinking,
    isAITurn: isAITurn(gameState),
    kataNetStatus,
  };
}
