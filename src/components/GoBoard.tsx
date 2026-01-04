'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import type { GameState, Position, BoardSize, Stone } from '@/lib/go-engine';
import { getStarPoints, isValidMove } from '@/lib/go-engine';

interface GoBoardProps {
  gameState: GameState;
  onPlaceStone: (pos: Position) => void;
  disabled?: boolean;
}

export function GoBoard({ gameState, onPlaceStone, disabled = false }: GoBoardProps) {
  const size = gameState.board.length;
  const starPoints = useMemo(() => getStarPoints(size as BoardSize), [size]);

  // Calculate cell size based on board size
  const getCellSize = () => {
    if (size === 9) return 48;
    if (size === 13) return 36;
    return 28; // 19x19
  };

  const cellSize = getCellSize();
  const stoneSize = cellSize * 0.9;
  const boardPadding = cellSize;
  const boardSize = cellSize * (size - 1) + boardPadding * 2;

  const handleIntersectionClick = (x: number, y: number) => {
    if (disabled || gameState.gameOver) return;
    const pos = { x, y };
    if (isValidMove(gameState, pos)) {
      onPlaceStone(pos);
    }
  };

  const isStarPoint = (x: number, y: number) => {
    return starPoints.some(p => p.x === x && p.y === y);
  };

  return (
    <div className="relative select-none">
      {/* Board background with wood-like texture */}
      <div
        className="relative rounded-lg shadow-2xl"
        style={{
          width: boardSize,
          height: boardSize,
          background: 'linear-gradient(135deg, #c9a66b 0%, #e6c88a 50%, #c9a66b 100%)',
        }}
      >
        {/* Grid lines */}
        <svg
          width={boardSize}
          height={boardSize}
          className="absolute inset-0"
        >
          {/* Vertical lines */}
          {Array.from({ length: size }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={boardPadding + i * cellSize}
              y1={boardPadding}
              x2={boardPadding + i * cellSize}
              y2={boardPadding + (size - 1) * cellSize}
              stroke="#2a2a2a"
              strokeWidth={i === 0 || i === size - 1 ? 2 : 1}
              strokeOpacity={0.8}
            />
          ))}
          {/* Horizontal lines */}
          {Array.from({ length: size }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={boardPadding}
              y1={boardPadding + i * cellSize}
              x2={boardPadding + (size - 1) * cellSize}
              y2={boardPadding + i * cellSize}
              stroke="#2a2a2a"
              strokeWidth={i === 0 || i === size - 1 ? 2 : 1}
              strokeOpacity={0.8}
            />
          ))}
          {/* Star points (hoshi) */}
          {starPoints.map((point, i) => (
            <circle
              key={`star-${i}`}
              cx={boardPadding + point.x * cellSize}
              cy={boardPadding + point.y * cellSize}
              r={4}
              fill="#2a2a2a"
            />
          ))}
        </svg>

        {/* Intersection click areas and stones */}
        {Array.from({ length: size }).map((_, y) =>
          Array.from({ length: size }).map((_, x) => {
            const stone = gameState.board[y][x];
            const isLastMove = gameState.lastMove?.x === x && gameState.lastMove?.y === y;
            const canPlay = !disabled && !gameState.gameOver && isValidMove(gameState, { x, y });

            return (
              <div
                key={`${x}-${y}`}
                className="absolute cursor-pointer group"
                style={{
                  left: boardPadding + x * cellSize - cellSize / 2,
                  top: boardPadding + y * cellSize - cellSize / 2,
                  width: cellSize,
                  height: cellSize,
                }}
                onClick={() => handleIntersectionClick(x, y)}
              >
                {/* Hover preview */}
                {canPlay && !stone && (
                  <div
                    className="absolute opacity-0 group-hover:opacity-40 transition-opacity rounded-full pointer-events-none"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: stoneSize,
                      height: stoneSize,
                      background: gameState.currentPlayer === 'black'
                        ? 'radial-gradient(ellipse at 30% 30%, #555, #000)'
                        : 'radial-gradient(ellipse at 30% 30%, #fff, #ccc)',
                    }}
                  />
                )}

                {/* Placed stone */}
                <AnimatePresence>
                  {stone && (
                    <Stone
                      color={stone}
                      size={stoneSize}
                      isLastMove={isLastMove}
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

interface StoneProps {
  color: Stone;
  size: number;
  isLastMove: boolean;
}

function Stone({ color, size, isLastMove }: StoneProps) {
  const isBlack = color === 'black';

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 25,
        mass: 0.5,
      }}
      className="absolute rounded-full shadow-lg"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        background: isBlack
          ? 'radial-gradient(ellipse at 30% 30%, #444, #111 40%, #000 100%)'
          : 'radial-gradient(ellipse at 30% 30%, #fff, #f5f5f5 40%, #ddd 100%)',
        boxShadow: isBlack
          ? '2px 3px 8px rgba(0, 0, 0, 0.6), inset -1px -1px 2px rgba(255, 255, 255, 0.1)'
          : '2px 3px 8px rgba(0, 0, 0, 0.3), inset -1px -1px 2px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Last move indicator */}
      {isLastMove && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.3,
            height: size * 0.3,
            background: isBlack ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
          }}
        />
      )}
    </motion.div>
  );
}
