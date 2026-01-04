// Go AI - Heuristic-based move selection
// Provides reasonable play while TensorFlow.js KataGo integration is being set up

import {
  GameState,
  Position,
  Stone,
  isValidMove,
  getAdjacent,
  getStone,
  getGroup,
  countLiberties,
  findCaptures,
  getBoardSize,
} from './go-engine';

type AIStrength = 'beginner' | 'intermediate' | 'strong';

interface ScoredMove {
  position: Position;
  score: number;
}

// Get all valid moves on the board
function getValidMoves(state: GameState): Position[] {
  const size = getBoardSize(state);
  const moves: Position[] = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const pos = { x, y };
      if (isValidMove(state, pos)) {
        moves.push(pos);
      }
    }
  }

  return moves;
}

// Score a potential move based on various heuristics
function scoreMove(state: GameState, pos: Position, player: Stone): number {
  let score = 0;
  const size = getBoardSize(state);
  const enemy: Stone = player === 'black' ? 'white' : 'black';

  // 1. Capture priority - high score for capturing enemy stones
  const captures = findCaptures(state, pos, player);
  score += captures.length * 50;

  // 2. Extension - connect to friendly stones
  const friendlyNeighbors = getAdjacent(state, pos).filter(
    (adj) => getStone(state, adj) === player
  );
  score += friendlyNeighbors.length * 10;

  // 3. Approach enemy weak groups
  const enemyNeighbors = getAdjacent(state, pos).filter(
    (adj) => getStone(state, adj) === enemy
  );

  enemyNeighbors.forEach((adj) => {
    const group = getGroup(state, adj);
    const liberties = countLiberties(state, group);
    // Attack groups with few liberties
    if (liberties <= 2) {
      score += (3 - liberties) * 20;
    }
  });

  // 4. Protect own weak groups
  friendlyNeighbors.forEach((adj) => {
    const group = getGroup(state, adj);
    const liberties = countLiberties(state, group);
    // Defend groups with few liberties
    if (liberties <= 2) {
      score += (3 - liberties) * 25;
    }
  });

  // 5. Star point bonus (good for influence)
  const starPoints = getStarPointsForSize(size);
  if (starPoints.some((sp) => sp.x === pos.x && sp.y === pos.y)) {
    score += 8;
  }

  // 6. Edge/corner penalty for opening
  if (state.moveHistory.length < 20) {
    const distFromEdge = Math.min(pos.x, pos.y, size - 1 - pos.x, size - 1 - pos.y);
    if (distFromEdge === 0) score -= 15; // First line
    else if (distFromEdge === 1) score -= 5; // Second line
    else if (distFromEdge === 2) score += 3; // Third line (good)
    else if (distFromEdge === 3) score += 5; // Fourth line (influence)
  }

  // 7. Avoid playing too close to existing stones in opening
  if (state.moveHistory.length < 10) {
    let nearbyStones = 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (dx === 0 && dy === 0) continue;
        const checkPos = { x: pos.x + dx, y: pos.y + dy };
        if (getStone(state, checkPos)) nearbyStones++;
      }
    }
    if (nearbyStones === 0) score += 5;
  }

  // 8. Create eyes (liberty preservation)
  const emptyNeighbors = getAdjacent(state, pos).filter(
    (adj) => getStone(state, adj) === null
  );
  if (emptyNeighbors.length >= 2) {
    score += 2;
  }

  // 9. Penalize self-atari (putting own group in atari)
  // Simulate the move
  const tempBoard = state.board.map((row) => [...row]);
  tempBoard[pos.y][pos.x] = player;
  const tempState = { ...state, board: tempBoard };
  const newGroup = getGroup(tempState, pos);
  const newLiberties = countLiberties(tempState, newGroup);

  if (newLiberties === 1 && captures.length === 0) {
    // Self-atari without capturing
    score -= 30;
  }

  // 10. Corner territory value
  const cornerDist = Math.min(
    Math.min(pos.x, pos.y),
    Math.min(pos.x, size - 1 - pos.y),
    Math.min(size - 1 - pos.x, pos.y),
    Math.min(size - 1 - pos.x, size - 1 - pos.y)
  );
  if (cornerDist <= 4 && state.moveHistory.length < 30) {
    score += 3;
  }

  return score;
}

function getStarPointsForSize(size: number): Position[] {
  if (size === 9) {
    return [
      { x: 2, y: 2 }, { x: 6, y: 2 },
      { x: 4, y: 4 },
      { x: 2, y: 6 }, { x: 6, y: 6 },
    ];
  } else if (size === 13) {
    return [
      { x: 3, y: 3 }, { x: 6, y: 3 }, { x: 9, y: 3 },
      { x: 3, y: 6 }, { x: 6, y: 6 }, { x: 9, y: 6 },
      { x: 3, y: 9 }, { x: 6, y: 9 }, { x: 9, y: 9 },
    ];
  } else {
    return [
      { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 15, y: 3 },
      { x: 3, y: 9 }, { x: 9, y: 9 }, { x: 15, y: 9 },
      { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 },
    ];
  }
}

// Main AI function - returns best move or null for pass
export function getAIMove(
  state: GameState,
  strength: AIStrength = 'intermediate'
): Position | null {
  const validMoves = getValidMoves(state);

  if (validMoves.length === 0) {
    return null; // Pass
  }

  // Score all moves
  const scoredMoves: ScoredMove[] = validMoves.map((pos) => ({
    position: pos,
    score: scoreMove(state, pos, state.currentPlayer),
  }));

  // Sort by score (descending)
  scoredMoves.sort((a, b) => b.score - a.score);

  // Apply randomness based on strength
  let moveIndex = 0;

  switch (strength) {
    case 'beginner':
      // Pick from top 10 moves randomly, with heavy bias toward worse moves
      const beginnerPool = scoredMoves.slice(0, Math.min(15, scoredMoves.length));
      moveIndex = Math.floor(Math.random() * beginnerPool.length);
      break;

    case 'intermediate':
      // Pick from top 5 moves with some randomness
      const intermediatePool = scoredMoves.slice(0, Math.min(5, scoredMoves.length));
      // Weighted random - prefer higher scores
      const weights = intermediatePool.map((_, i) => Math.pow(0.6, i));
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;
      for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          moveIndex = i;
          break;
        }
      }
      break;

    case 'strong':
      // Pick from top 3 moves, heavily weighted toward best
      const strongPool = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
      const strongWeights = strongPool.map((_, i) => Math.pow(0.3, i));
      const strongTotal = strongWeights.reduce((a, b) => a + b, 0);
      let strongRandom = Math.random() * strongTotal;
      for (let i = 0; i < strongWeights.length; i++) {
        strongRandom -= strongWeights[i];
        if (strongRandom <= 0) {
          moveIndex = i;
          break;
        }
      }
      break;
  }

  // If all moves have very negative scores, consider passing
  if (scoredMoves[moveIndex].score < -20) {
    // Late game - might be time to pass
    if (state.moveHistory.length > 50) {
      return null;
    }
  }

  return scoredMoves[moveIndex].position;
}

// Utility for opening book moves (common joseki starting points)
export function getOpeningMove(state: GameState): Position | null {
  const size = getBoardSize(state);
  const moveNumber = state.moveHistory.length;

  if (moveNumber >= 8) return null; // Opening phase over

  // Common opening patterns
  if (size === 19) {
    const corners = [
      { x: 3, y: 3 },
      { x: 15, y: 3 },
      { x: 3, y: 15 },
      { x: 15, y: 15 },
      { x: 3, y: 4 },
      { x: 4, y: 3 },
      { x: 15, y: 4 },
      { x: 4, y: 15 },
      { x: 16, y: 3 },
      { x: 3, y: 16 },
      { x: 16, y: 15 },
      { x: 15, y: 16 },
    ];

    // Shuffle and find first valid
    const shuffled = corners.sort(() => Math.random() - 0.5);
    for (const pos of shuffled) {
      if (isValidMove(state, pos)) {
        return pos;
      }
    }
  }

  return null;
}
