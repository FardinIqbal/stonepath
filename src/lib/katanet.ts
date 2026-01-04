// KataNet - TensorFlow.js implementation of KataGo neural network
// Provides ~2 dan strength Go AI running entirely in browser

import * as tf from '@tensorflow/tfjs';
import type { GameState, Position, Stone } from './go-engine';
import { isValidMove, getGroup, countLiberties, getStone, getBoardSize } from './go-engine';

// Model configuration
const INPUT_CHANNELS = 22;
const GLOBAL_INPUT_CHANNELS = 19;
const BOARD_SIZE = 19; // KataNet only supports 19x19

let model: tf.GraphModel | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

// Load the KataNet model
export async function loadKataNet(): Promise<void> {
  if (model) return;
  if (loadPromise) return loadPromise;

  isLoading = true;
  loadPromise = (async () => {
    try {
      // Use CPU backend for consistency
      await tf.setBackend('cpu');
      await tf.ready();

      model = await tf.loadGraphModel('/model/model.json');
      console.log('KataNet model loaded successfully');
    } catch (error) {
      console.error('Failed to load KataNet model:', error);
      throw error;
    } finally {
      isLoading = false;
    }
  })();

  return loadPromise;
}

// Check if model is loaded
export function isKataNetReady(): boolean {
  return model !== null;
}

// Check if model is currently loading
export function isKataNetLoading(): boolean {
  return isLoading;
}

// Convert game state to KataNet input tensors
function encodeBoard(state: GameState, aiPlayer: Stone): {
  binInputs: Float32Array;
  globalInputs: Float32Array;
} {
  const size = getBoardSize(state);
  if (size !== BOARD_SIZE) {
    throw new Error('KataNet only supports 19x19 boards');
  }

  const binInputs = new Float32Array(BOARD_SIZE * BOARD_SIZE * INPUT_CHANNELS);
  const globalInputs = new Float32Array(GLOBAL_INPUT_CHANNELS);

  const opponent: Stone = aiPlayer === 'black' ? 'white' : 'black';

  // Fill board features
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const sq = y * BOARD_SIZE + x;
      const baseIdx = sq * INPUT_CHANNELS;

      // Channel 0: Always 1.0 (valid position)
      binInputs[baseIdx + 0] = 1.0;

      const stone = state.board[y][x];

      if (stone === aiPlayer) {
        // Channel 1: AI player stones
        binInputs[baseIdx + 1] = 1.0;
      } else if (stone === opponent) {
        // Channel 2: Opponent stones
        binInputs[baseIdx + 2] = 1.0;
      }

      // Channels 3-5: Liberty features for stones
      if (stone !== null) {
        const group = getGroup(state, { x, y });
        const liberties = countLiberties(state, group);

        if (liberties === 1) binInputs[baseIdx + 3] = 1.0;
        else if (liberties === 2) binInputs[baseIdx + 4] = 1.0;
        else if (liberties === 3) binInputs[baseIdx + 5] = 1.0;
      }

      // Channel 6: Ko position
      if (state.koPosition && state.koPosition.x === x && state.koPosition.y === y) {
        binInputs[baseIdx + 6] = 1.0;
      }
    }
  }

  // Encode move history (channels 9-13)
  const history = state.moveHistory;
  const historyChannels = [9, 10, 11, 12, 13];

  for (let i = 0; i < Math.min(5, history.length); i++) {
    const moveIdx = history.length - 1 - i;
    const move = history[moveIdx];

    if (move.position) {
      const { x, y } = move.position;
      const sq = y * BOARD_SIZE + x;
      binInputs[sq * INPUT_CHANNELS + historyChannels[i]] = 1.0;
    } else {
      // Pass move - encode in global inputs
      globalInputs[i] = 1.0;
    }
  }

  // Global input channel 5: Komi (normalized)
  const selfKomi = aiPlayer === 'white' ? 6.5 + 1 : -6.5;
  globalInputs[5] = selfKomi / 20.0;

  return { binInputs, globalInputs };
}

// Get AI move using KataNet
export async function getKataNetMove(state: GameState): Promise<Position | null> {
  if (!model) {
    await loadKataNet();
  }

  if (!model) {
    console.error('KataNet model not available');
    return null;
  }

  const size = getBoardSize(state);
  if (size !== BOARD_SIZE) {
    console.warn('KataNet only supports 19x19, falling back to heuristic AI');
    return null;
  }

  const aiPlayer = state.currentPlayer;
  const { binInputs, globalInputs } = encodeBoard(state, aiPlayer);

  try {
    // Run inference
    const results = await model.executeAsync({
      'swa_model/bin_inputs': tf.tensor(binInputs, [1, BOARD_SIZE * BOARD_SIZE, INPUT_CHANNELS], 'float32'),
      'swa_model/global_inputs': tf.tensor(globalInputs, [1, GLOBAL_INPUT_CHANNELS], 'float32'),
    }) as tf.Tensor[];

    // Get policy output (move probabilities)
    // Policy output shape: [1, 2, 362] - we want the first 361 values (board positions)
    const policyTensor = results[1].reshape([-1]);
    const policyArray = await policyTensor.array() as number[];

    // Clean up tensors
    results.forEach(t => t.dispose());
    policyTensor.dispose();

    // Find top 10 moves by policy value
    const moveScores: { pos: number; score: number }[] = [];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
      moveScores.push({ pos: i, score: policyArray[i] });
    }
    moveScores.sort((a, b) => b.score - a.score);

    // Try moves in order of policy score until we find a legal one
    for (const { pos } of moveScores.slice(0, 20)) {
      const x = pos % BOARD_SIZE;
      const y = Math.floor(pos / BOARD_SIZE);
      const position = { x, y };

      if (isValidMove(state, position)) {
        return position;
      }
    }

    // No valid move found - pass
    return null;
  } catch (error) {
    console.error('KataNet inference error:', error);
    return null;
  }
}

// Get score estimate from KataNet
export async function getKataNetEval(state: GameState): Promise<{
  scoreLead: number;
  winRate: number;
} | null> {
  if (!model) return null;

  const size = getBoardSize(state);
  if (size !== BOARD_SIZE) return null;

  const aiPlayer = state.currentPlayer;
  const { binInputs, globalInputs } = encodeBoard(state, aiPlayer);

  try {
    const results = await model.executeAsync({
      'swa_model/bin_inputs': tf.tensor(binInputs, [1, BOARD_SIZE * BOARD_SIZE, INPUT_CHANNELS], 'float32'),
      'swa_model/global_inputs': tf.tensor(globalInputs, [1, GLOBAL_INPUT_CHANNELS], 'float32'),
    }) as tf.Tensor[];

    // Value output shape: [1, 3]
    // Index 2 is the score lead (normalized by 20)
    const valueArray = await results[3].array() as number[][];
    const scoreLead = valueArray[0][2] * 20;

    // Index 0 might be win probability
    const winRate = (valueArray[0][0] + 1) / 2; // Normalize from [-1, 1] to [0, 1]

    results.forEach(t => t.dispose());

    return { scoreLead, winRate };
  } catch (error) {
    console.error('KataNet eval error:', error);
    return null;
  }
}
