// Tsumego Puzzle Database
// Classic Go problems for training

import type { Puzzle } from './tsumego';

export const puzzles: Puzzle[] = [
  // ============ BEGINNER PUZZLES ============

  {
    id: 'b001',
    name: 'First Capture',
    difficulty: 'beginner',
    category: 'capture',
    description: 'Capture the white stone in atari.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 5, height: 5 },
    initialPosition: [
      '.....',
      '.BWB.',
      '..B..',
      '.....',
      '.....',
    ],
    playerColor: 'black',
    solution: [
      { position: { x: 1, y: 0 }, isCorrect: true },
    ],
    hint: 'The white stone has only one liberty left.',
  },

  {
    id: 'b002',
    name: 'Corner Kill',
    difficulty: 'beginner',
    category: 'life-death',
    description: 'Kill the white group in the corner.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 5, height: 5 },
    initialPosition: [
      'WW...',
      'BW...',
      'BB...',
      '.....',
      '.....',
    ],
    playerColor: 'black',
    solution: [
      { position: { x: 2, y: 0 }, isCorrect: true },
    ],
    hint: 'Reduce white\'s liberties.',
  },

  {
    id: 'b003',
    name: 'Simple Ladder',
    difficulty: 'beginner',
    category: 'capture',
    description: 'Start the ladder to capture white.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 6, height: 6 },
    initialPosition: [
      '......',
      '..W...',
      '.BW...',
      '..B...',
      '......',
      '......',
    ],
    playerColor: 'black',
    solution: [
      {
        position: { x: 3, y: 1 },
        responses: [
          {
            position: { x: 3, y: 2 },
            responses: [
              { position: { x: 4, y: 2 }, isCorrect: true },
            ],
          },
        ],
      },
    ],
    hint: 'Chase white diagonally.',
  },

  {
    id: 'b004',
    name: 'Snap Back',
    difficulty: 'beginner',
    category: 'capture',
    description: 'Use snapback to capture.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 5, height: 5 },
    initialPosition: [
      '.B...',
      'BWW..',
      'BBW..',
      '.BW..',
      '.....',
    ],
    playerColor: 'black',
    solution: [
      { position: { x: 0, y: 0 }, isCorrect: true },
    ],
    hint: 'Sacrifice to recapture more.',
  },

  // ============ EASY PUZZLES ============

  {
    id: 'e001',
    name: 'Eye Shape',
    difficulty: 'easy',
    category: 'life-death',
    description: 'Make two eyes to live.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 6, height: 4 },
    initialPosition: [
      'BBBBB.',
      'B...B.',
      'BBBBB.',
      '......',
    ],
    playerColor: 'black',
    solution: [
      { position: { x: 2, y: 1 }, isCorrect: true },
    ],
    hint: 'Divide the space into two eyes.',
  },

  {
    id: 'e002',
    name: 'Kill the Corner',
    difficulty: 'easy',
    category: 'life-death',
    description: 'Prevent white from making two eyes.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 5, height: 5 },
    initialPosition: [
      'WW.WW',
      'BWWWB',
      'BBBBB',
      '.....',
      '.....',
    ],
    playerColor: 'black',
    solution: [
      { position: { x: 2, y: 0 }, isCorrect: true },
    ],
    hint: 'Play in the vital point.',
  },

  {
    id: 'e003',
    name: 'Extend to Live',
    difficulty: 'easy',
    category: 'life-death',
    description: 'Extend to make eye space.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 7, height: 4 },
    initialPosition: [
      'BBB....',
      'W.B....',
      'WWB....',
      '.WB....',
    ],
    playerColor: 'black',
    solution: [
      { position: { x: 1, y: 0 }, isCorrect: true },
    ],
    hint: 'Make space for two eyes.',
  },

  {
    id: 'e004',
    name: 'Throw-in',
    difficulty: 'easy',
    category: 'capture',
    description: 'Use a throw-in to capture.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 5, height: 5 },
    initialPosition: [
      '.B...',
      'BWB..',
      'WWB..',
      'BWB..',
      '.B...',
    ],
    playerColor: 'black',
    solution: [
      { position: { x: 0, y: 2 }, isCorrect: true },
    ],
    hint: 'Sacrifice one to take two.',
  },

  // ============ MEDIUM PUZZLES ============

  {
    id: 'm001',
    name: 'L-Group Life',
    difficulty: 'medium',
    category: 'life-death',
    description: 'The L-group can live. Find the vital point.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 6, height: 5 },
    initialPosition: [
      'WWWW..',
      'W..W..',
      'WBBB..',
      '.BBB..',
      '......',
    ],
    playerColor: 'white',
    solution: [
      {
        position: { x: 2, y: 1 },
        responses: [
          {
            position: { x: 1, y: 1 },
            responses: [
              { position: { x: 3, y: 0 }, isCorrect: true },
            ],
          },
        ],
      },
    ],
    hint: 'The 1-2 point is often vital.',
  },

  {
    id: 'm002',
    name: 'Bent Four in Corner',
    difficulty: 'medium',
    category: 'life-death',
    description: 'Kill the bent four shape.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 5, height: 5 },
    initialPosition: [
      'W.WW.',
      'WWWB.',
      'BBBB.',
      '.....',
      '.....',
    ],
    playerColor: 'black',
    solution: [
      { position: { x: 1, y: 0 }, isCorrect: true },
    ],
    hint: 'The vital point prevents two eyes.',
  },

  {
    id: 'm003',
    name: 'Connect Under',
    difficulty: 'medium',
    category: 'connect',
    description: 'Connect your groups along the edge.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 7, height: 4 },
    initialPosition: [
      'BB.WBB.',
      '.BWWB..',
      '.BWB...',
      '.BBB...',
    ],
    playerColor: 'black',
    solution: [
      {
        position: { x: 2, y: 0 },
        responses: [
          {
            position: { x: 2, y: 1 },
            responses: [
              { position: { x: 1, y: 0 }, isCorrect: true },
            ],
          },
        ],
      },
    ],
    hint: 'Play on the first line.',
  },

  {
    id: 'm004',
    name: 'Squeeze Tesuji',
    difficulty: 'medium',
    category: 'capture',
    description: 'Use the squeeze technique.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 6, height: 6 },
    initialPosition: [
      '......',
      '.BWW..',
      '.BBW..',
      '..BW..',
      '..BB..',
      '......',
    ],
    playerColor: 'black',
    solution: [
      {
        position: { x: 4, y: 2 },
        responses: [
          {
            position: { x: 4, y: 1 },
            responses: [
              { position: { x: 3, y: 1 }, isCorrect: true },
            ],
          },
        ],
      },
    ],
    hint: 'Force white into bad shape.',
  },

  // ============ HARD PUZZLES ============

  {
    id: 'h001',
    name: 'Double Ko',
    difficulty: 'hard',
    category: 'life-death',
    description: 'Navigate the double ko to kill.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 6, height: 5 },
    initialPosition: [
      '.WWWW.',
      'BW..WB',
      'BWWWWB',
      'BBBBBB',
      '......',
    ],
    playerColor: 'black',
    solution: [
      {
        position: { x: 2, y: 1 },
        responses: [
          {
            position: { x: 3, y: 1 },
            responses: [
              { position: { x: 0, y: 0 }, isCorrect: true },
            ],
          },
        ],
      },
    ],
    hint: 'Create a ko threat first.',
  },

  {
    id: 'h002',
    name: 'Crane\'s Nest',
    difficulty: 'hard',
    category: 'capture',
    description: 'The famous crane\'s nest tesuji.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 6, height: 6 },
    initialPosition: [
      '......',
      '.WBB..',
      '.WWB..',
      '.WBB..',
      '.BBB..',
      '......',
    ],
    playerColor: 'black',
    solution: [
      { position: { x: 0, y: 2 }, isCorrect: true },
    ],
    hint: 'A sacrifice on the edge.',
  },

  {
    id: 'h003',
    name: 'Under the Stones',
    difficulty: 'hard',
    category: 'capture',
    description: 'Play under the stones tesuji.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 6, height: 6 },
    initialPosition: [
      '.BBBBB',
      '.BWWWB',
      '.BWW.B',
      '.BWWWB',
      '.BBBBB',
      '......',
    ],
    playerColor: 'black',
    solution: [
      {
        position: { x: 4, y: 2 },
        responses: [
          {
            position: { x: 4, y: 3 },
            responses: [
              { position: { x: 4, y: 1 }, isCorrect: true },
            ],
          },
        ],
      },
    ],
    hint: 'Fill from the inside.',
  },

  // ============ EXPERT PUZZLES ============

  {
    id: 'x001',
    name: 'Seki or Kill?',
    difficulty: 'expert',
    category: 'life-death',
    description: 'Find the killing move, not seki.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 6, height: 6 },
    initialPosition: [
      'WWWWW.',
      'W...WB',
      'W.W.WB',
      'WWWWWB',
      'BBBBBB',
      '......',
    ],
    playerColor: 'black',
    solution: [
      {
        position: { x: 3, y: 1 },
        responses: [
          {
            position: { x: 1, y: 1 },
            responses: [
              {
                position: { x: 1, y: 2 },
                responses: [
                  {
                    position: { x: 3, y: 2 },
                    responses: [
                      { position: { x: 2, y: 1 }, isCorrect: true },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    hint: 'Reduce eye space carefully.',
  },

  {
    id: 'x002',
    name: 'Liberty Race',
    difficulty: 'expert',
    category: 'capture',
    description: 'Win the capturing race.',
    boardSize: 9,
    viewport: { startX: 0, startY: 0, width: 7, height: 6 },
    initialPosition: [
      'BBBBB..',
      'BWWWB..',
      'BWW.B..',
      'B.WWBB.',
      'BWWBBB.',
      'BBBB...',
    ],
    playerColor: 'black',
    solution: [
      {
        position: { x: 1, y: 3 },
        responses: [
          {
            position: { x: 3, y: 2 },
            responses: [
              { position: { x: 4, y: 2 }, isCorrect: true },
            ],
          },
        ],
      },
    ],
    hint: 'Count liberties carefully.',
  },
];

// Get puzzles by difficulty
export function getPuzzlesByDifficulty(difficulty: Puzzle['difficulty']): Puzzle[] {
  return puzzles.filter((p) => p.difficulty === difficulty);
}

// Get puzzles by category
export function getPuzzlesByCategory(category: Puzzle['category']): Puzzle[] {
  return puzzles.filter((p) => p.category === category);
}

// Get a random puzzle
export function getRandomPuzzle(difficulty?: Puzzle['difficulty']): Puzzle {
  const filtered = difficulty ? getPuzzlesByDifficulty(difficulty) : puzzles;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// Get puzzle by ID
export function getPuzzleById(id: string): Puzzle | undefined {
  return puzzles.find((p) => p.id === id);
}

// Get next puzzle in sequence
export function getNextPuzzle(currentId: string): Puzzle | undefined {
  const index = puzzles.findIndex((p) => p.id === currentId);
  return index >= 0 && index < puzzles.length - 1 ? puzzles[index + 1] : undefined;
}

// Get difficulty stats
export function getDifficultyStats(): Record<Puzzle['difficulty'], number> {
  return {
    beginner: getPuzzlesByDifficulty('beginner').length,
    easy: getPuzzlesByDifficulty('easy').length,
    medium: getPuzzlesByDifficulty('medium').length,
    hard: getPuzzlesByDifficulty('hard').length,
    expert: getPuzzlesByDifficulty('expert').length,
  };
}
