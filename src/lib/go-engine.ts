// Go Game Engine
// Implements full Go rules: captures, ko, scoring, territory

export type Stone = 'black' | 'white';
export type BoardSize = 9 | 13 | 19;
export type Position = { x: number; y: number };

export interface GameState {
  board: (Stone | null)[][];
  currentPlayer: Stone;
  captures: { black: number; white: number };
  lastMove: Position | null;
  koPosition: Position | null; // Position that can't be played due to ko
  passCount: number; // Consecutive passes
  moveHistory: Move[];
  gameOver: boolean;
  winner: Stone | 'tie' | null;
}

export interface Move {
  position: Position | null; // null = pass
  player: Stone;
  captures: Position[];
}

export interface Territory {
  black: number;
  white: number;
  neutral: number;
}

// Create initial game state
export function createGame(size: BoardSize = 19): GameState {
  const board: (Stone | null)[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(null));

  return {
    board,
    currentPlayer: 'black', // Black always plays first in Go
    captures: { black: 0, white: 0 },
    lastMove: null,
    koPosition: null,
    passCount: 0,
    moveHistory: [],
    gameOver: false,
    winner: null,
  };
}

// Get board size from state
export function getBoardSize(state: GameState): number {
  return state.board.length;
}

// Check if position is within board bounds
export function isValidPosition(state: GameState, pos: Position): boolean {
  const size = getBoardSize(state);
  return pos.x >= 0 && pos.x < size && pos.y >= 0 && pos.y < size;
}

// Get stone at position
export function getStone(state: GameState, pos: Position): Stone | null {
  if (!isValidPosition(state, pos)) return null;
  return state.board[pos.y][pos.x];
}

// Get adjacent positions
export function getAdjacent(state: GameState, pos: Position): Position[] {
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 },  // right
  ];

  return directions
    .map(d => ({ x: pos.x + d.x, y: pos.y + d.y }))
    .filter(p => isValidPosition(state, p));
}

// Find all stones in a connected group
export function getGroup(state: GameState, pos: Position): Position[] {
  const stone = getStone(state, pos);
  if (!stone) return [];

  const visited = new Set<string>();
  const group: Position[] = [];
  const stack: Position[] = [pos];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const key = `${current.x},${current.y}`;

    if (visited.has(key)) continue;
    if (getStone(state, current) !== stone) continue;

    visited.add(key);
    group.push(current);

    getAdjacent(state, current).forEach(adj => {
      if (!visited.has(`${adj.x},${adj.y}`)) {
        stack.push(adj);
      }
    });
  }

  return group;
}

// Count liberties (empty adjacent points) for a group
export function countLiberties(state: GameState, group: Position[]): number {
  const liberties = new Set<string>();

  group.forEach(pos => {
    getAdjacent(state, pos).forEach(adj => {
      if (getStone(state, adj) === null) {
        liberties.add(`${adj.x},${adj.y}`);
      }
    });
  });

  return liberties.size;
}

// Check if placing a stone at position would be suicide (illegal without capturing)
export function isSuicide(state: GameState, pos: Position, player: Stone): boolean {
  // Temporarily place the stone
  const tempBoard = state.board.map(row => [...row]);
  tempBoard[pos.y][pos.x] = player;
  const tempState = { ...state, board: tempBoard };

  // Get the group this stone would form
  const group = getGroup(tempState, pos);
  const liberties = countLiberties(tempState, group);

  // If the group has liberties, it's not suicide
  if (liberties > 0) return false;

  // Check if this move would capture enemy stones
  const enemy: Stone = player === 'black' ? 'white' : 'black';
  const wouldCapture = getAdjacent(tempState, pos).some(adj => {
    if (getStone(tempState, adj) === enemy) {
      const enemyGroup = getGroup(tempState, adj);
      return countLiberties(tempState, enemyGroup) === 0;
    }
    return false;
  });

  // Suicide is only if we have no liberties AND don't capture anything
  return !wouldCapture;
}

// Find stones that would be captured after placing a stone
export function findCaptures(state: GameState, pos: Position, player: Stone): Position[] {
  const enemy: Stone = player === 'black' ? 'white' : 'black';
  const captured: Position[] = [];
  const processed = new Set<string>();

  getAdjacent(state, pos).forEach(adj => {
    if (getStone(state, adj) === enemy) {
      const key = `${adj.x},${adj.y}`;
      if (!processed.has(key)) {
        const group = getGroup(state, adj);
        group.forEach(p => processed.add(`${p.x},${p.y}`));

        // Check liberties with the new stone placed
        const liberties = group.reduce((count, p) => {
          return count + getAdjacent(state, p).filter(a => {
            // The new stone position is not a liberty
            if (a.x === pos.x && a.y === pos.y) return false;
            return getStone(state, a) === null;
          }).length;
        }, 0);

        // Use a set to count unique liberties
        const uniqueLiberties = new Set<string>();
        group.forEach(p => {
          getAdjacent(state, p).forEach(a => {
            if (a.x === pos.x && a.y === pos.y) return;
            if (getStone(state, a) === null) {
              uniqueLiberties.add(`${a.x},${a.y}`);
            }
          });
        });

        if (uniqueLiberties.size === 0) {
          captured.push(...group);
        }
      }
    }
  });

  return captured;
}

// Check if a move is valid
export function isValidMove(state: GameState, pos: Position): boolean {
  // Can't play if game is over
  if (state.gameOver) return false;

  // Position must be on board
  if (!isValidPosition(state, pos)) return false;

  // Position must be empty
  if (getStone(state, pos) !== null) return false;

  // Can't play at ko position
  if (state.koPosition &&
      state.koPosition.x === pos.x &&
      state.koPosition.y === pos.y) {
    return false;
  }

  // Can't be suicide
  if (isSuicide(state, pos, state.currentPlayer)) return false;

  return true;
}

// Play a move
export function playMove(state: GameState, pos: Position): GameState | null {
  if (!isValidMove(state, pos)) return null;

  const newBoard = state.board.map(row => [...row]);
  const player = state.currentPlayer;
  const enemy: Stone = player === 'black' ? 'white' : 'black';

  // Place the stone
  newBoard[pos.y][pos.x] = player;

  // Find and remove captured stones
  const captures = findCaptures({ ...state, board: newBoard }, pos, player);
  captures.forEach(cap => {
    newBoard[cap.y][cap.x] = null;
  });

  // Check for ko situation (single stone capture that could be immediately recaptured)
  let koPosition: Position | null = null;
  if (captures.length === 1) {
    const capturedPos = captures[0];
    // Check if the captured stone position would be ko
    const tempState = { ...state, board: newBoard };
    const newGroup = getGroup(tempState, pos);
    if (newGroup.length === 1 && countLiberties(tempState, newGroup) === 1) {
      koPosition = capturedPos;
    }
  }

  // Update captures count
  const newCaptures = { ...state.captures };
  newCaptures[player] += captures.length;

  const move: Move = {
    position: pos,
    player,
    captures,
  };

  return {
    board: newBoard,
    currentPlayer: enemy,
    captures: newCaptures,
    lastMove: pos,
    koPosition,
    passCount: 0,
    moveHistory: [...state.moveHistory, move],
    gameOver: false,
    winner: null,
  };
}

// Pass turn
export function pass(state: GameState): GameState {
  if (state.gameOver) return state;

  const enemy: Stone = state.currentPlayer === 'black' ? 'white' : 'black';
  const newPassCount = state.passCount + 1;

  const move: Move = {
    position: null,
    player: state.currentPlayer,
    captures: [],
  };

  // Game ends after two consecutive passes
  if (newPassCount >= 2) {
    const score = calculateScore(state);
    let winner: Stone | 'tie' | null = null;

    if (score.black > score.white) winner = 'black';
    else if (score.white > score.black) winner = 'white';
    else winner = 'tie';

    return {
      ...state,
      currentPlayer: enemy,
      passCount: newPassCount,
      moveHistory: [...state.moveHistory, move],
      koPosition: null,
      gameOver: true,
      winner,
    };
  }

  return {
    ...state,
    currentPlayer: enemy,
    passCount: newPassCount,
    moveHistory: [...state.moveHistory, move],
    koPosition: null, // Ko is cleared after a pass
  };
}

// Calculate territory using flood fill
export function calculateTerritory(state: GameState): Territory {
  const size = getBoardSize(state);
  const visited = new Set<string>();
  const territory: Territory = { black: 0, white: 0, neutral: 0 };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (state.board[y][x] !== null) continue;

      const key = `${x},${y}`;
      if (visited.has(key)) continue;

      // Flood fill to find empty region
      const region: Position[] = [];
      const stack: Position[] = [{ x, y }];
      let touchesBlack = false;
      let touchesWhite = false;

      while (stack.length > 0) {
        const current = stack.pop()!;
        const currentKey = `${current.x},${current.y}`;

        if (visited.has(currentKey)) continue;

        const stone = getStone(state, current);

        if (stone === 'black') {
          touchesBlack = true;
          continue;
        }
        if (stone === 'white') {
          touchesWhite = true;
          continue;
        }

        visited.add(currentKey);
        region.push(current);

        getAdjacent(state, current).forEach(adj => {
          if (!visited.has(`${adj.x},${adj.y}`)) {
            stack.push(adj);
          }
        });
      }

      // Assign territory based on what colors the region touches
      if (touchesBlack && !touchesWhite) {
        territory.black += region.length;
      } else if (touchesWhite && !touchesBlack) {
        territory.white += region.length;
      } else {
        territory.neutral += region.length;
      }
    }
  }

  return territory;
}

// Calculate final score (Japanese rules: territory + captures)
// Komi: White gets extra points to compensate for black going first
export function calculateScore(state: GameState, komi: number = 6.5): { black: number; white: number } {
  const territory = calculateTerritory(state);

  return {
    black: territory.black + state.captures.black,
    white: territory.white + state.captures.white + komi,
  };
}

// Get star points (hoshi) for handicap placement reference
export function getStarPoints(size: BoardSize): Position[] {
  const points: Position[] = [];

  if (size === 9) {
    // 9x9 has one center point and 4 corner hoshi
    points.push({ x: 2, y: 2 }, { x: 6, y: 2 });
    points.push({ x: 4, y: 4 }); // center
    points.push({ x: 2, y: 6 }, { x: 6, y: 6 });
  } else if (size === 13) {
    // 13x13 has 9 hoshi
    const positions = [3, 6, 9];
    positions.forEach(y => {
      positions.forEach(x => {
        points.push({ x, y });
      });
    });
  } else if (size === 19) {
    // 19x19 has 9 hoshi
    const positions = [3, 9, 15];
    positions.forEach(y => {
      positions.forEach(x => {
        points.push({ x, y });
      });
    });
  }

  return points;
}

// Undo last move (for local play)
export function undoMove(state: GameState): GameState | null {
  if (state.moveHistory.length === 0) return null;

  // Replay all moves except the last one
  const size = getBoardSize(state) as BoardSize;
  let newState = createGame(size);

  const movesToReplay = state.moveHistory.slice(0, -1);

  for (const move of movesToReplay) {
    if (move.position === null) {
      newState = pass(newState);
    } else {
      const result = playMove(newState, move.position);
      if (result) {
        newState = result;
      } else {
        // This shouldn't happen if the original game was valid
        return null;
      }
    }
  }

  return newState;
}

// Reset game with same board size
export function resetGame(state: GameState): GameState {
  const size = getBoardSize(state) as BoardSize;
  return createGame(size);
}
