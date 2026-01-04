// Tsumego (Go Puzzles) - Life & Death Problems

export type PuzzleDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
export type PuzzleCategory = 'life-death' | 'capture' | 'escape' | 'connect' | 'cut';

export interface PuzzlePosition {
  x: number;
  y: number;
}

export interface PuzzleMove {
  position: PuzzlePosition;
  responses?: PuzzleMove[]; // Correct response sequences
  isCorrect?: boolean;
}

export interface Puzzle {
  id: string;
  name: string;
  difficulty: PuzzleDifficulty;
  category: PuzzleCategory;
  description: string;
  boardSize: 9 | 13 | 19;
  // Viewport for displaying only relevant portion
  viewport: {
    startX: number;
    startY: number;
    width: number;
    height: number;
  };
  // Initial position - 'B' for black, 'W' for white, '.' for empty
  initialPosition: string[];
  playerColor: 'black' | 'white';
  // Solution tree - correct move sequences
  solution: PuzzleMove[];
  // Hint text
  hint?: string;
}

export interface PuzzleState {
  puzzle: Puzzle;
  currentPosition: ('black' | 'white' | null)[][];
  moveHistory: PuzzlePosition[];
  status: 'solving' | 'correct' | 'incorrect';
  currentBranch: PuzzleMove[];
}

// Parse initial position string to board array
export function parsePosition(position: string[], viewport: Puzzle['viewport']): ('black' | 'white' | null)[][] {
  const board: ('black' | 'white' | null)[][] = [];

  for (let y = 0; y < viewport.height; y++) {
    const row: ('black' | 'white' | null)[] = [];
    const posY = viewport.startY + y;
    const line = position[posY] || '';

    for (let x = 0; x < viewport.width; x++) {
      const posX = viewport.startX + x;
      const char = line[posX] || '.';

      if (char === 'B' || char === 'X') {
        row.push('black');
      } else if (char === 'W' || char === 'O') {
        row.push('white');
      } else {
        row.push(null);
      }
    }
    board.push(row);
  }

  return board;
}

// Check if a move matches any in the solution tree
export function checkMove(
  move: PuzzlePosition,
  currentBranch: PuzzleMove[],
  solution: PuzzleMove[]
): { isCorrect: boolean; nextBranch: PuzzleMove[] } {
  const searchBranch = currentBranch.length > 0 ? currentBranch : solution;

  for (const solutionMove of searchBranch) {
    if (solutionMove.position.x === move.x && solutionMove.position.y === move.y) {
      return {
        isCorrect: true,
        nextBranch: solutionMove.responses || [],
      };
    }
  }

  return { isCorrect: false, nextBranch: [] };
}

// Get AI response move (opponent's best response)
export function getResponseMove(currentBranch: PuzzleMove[]): PuzzlePosition | null {
  if (currentBranch.length === 0) return null;

  // Return the first response in the branch (main line)
  const response = currentBranch[0];
  return response ? response.position : null;
}

// Check if puzzle is solved (reached end of solution tree)
export function isPuzzleSolved(currentBranch: PuzzleMove[], moveCount: number): boolean {
  // Puzzle is solved if we've made moves and reached a terminal node
  return moveCount > 0 && currentBranch.length === 0;
}

// Difficulty rating values
export const difficultyRatings: Record<PuzzleDifficulty, { min: number; max: number; label: string }> = {
  beginner: { min: 0, max: 500, label: '30-20 kyu' },
  easy: { min: 500, max: 800, label: '20-15 kyu' },
  medium: { min: 800, max: 1200, label: '15-5 kyu' },
  hard: { min: 1200, max: 1600, label: '5 kyu - 1 dan' },
  expert: { min: 1600, max: 2000, label: '2+ dan' },
};

// Category descriptions
export const categoryDescriptions: Record<PuzzleCategory, string> = {
  'life-death': 'Make your group live or kill the opponent',
  'capture': 'Capture the marked stones',
  'escape': 'Save your stones from capture',
  'connect': 'Connect your groups',
  'cut': 'Cut the opponent\'s stones apart',
};
