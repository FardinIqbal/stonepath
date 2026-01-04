'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { GameState, Position, BoardSize, Stone } from '@/lib/go-engine';
import { getStarPoints, isValidMove } from '@/lib/go-engine';
import { useTheme } from '@/lib/theme';

interface GoBoardProps {
  gameState: GameState;
  onPlaceStone: (pos: Position) => void;
  disabled?: boolean;
}

export function GoBoard({ gameState, onPlaceStone, disabled = false }: GoBoardProps) {
  const { theme } = useTheme();
  const size = gameState.board.length;
  const starPoints = useMemo(() => getStarPoints(size as BoardSize), [size]);
  const [hoveredPos, setHoveredPos] = useState<Position | null>(null);

  // Mobile-first: smaller cells, responsive sizing
  const getCellSize = () => {
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      if (screenWidth < 400) {
        // Small phones
        if (size === 9) return 32;
        if (size === 13) return 24;
        return 16;
      }
      if (screenWidth < 768) {
        // Mobile
        if (size === 9) return 36;
        if (size === 13) return 28;
        return 18;
      }
    }
    // Desktop
    if (size === 9) return 44;
    if (size === 13) return 34;
    return 26;
  };

  const cellSize = getCellSize();
  const stoneSize = cellSize * 0.9;
  const boardPadding = cellSize * 0.8;
  const gridSize = cellSize * (size - 1);
  const boardWidth = gridSize + boardPadding * 2;

  const handleIntersectionClick = (x: number, y: number) => {
    if (disabled || gameState.gameOver) return;
    const pos = { x, y };
    if (isValidMove(gameState, pos)) {
      onPlaceStone(pos);
    }
  };

  // Theme-aware colors
  const colors = theme === 'dark' ? {
    board: '#1E3A2F',
    boardGradient: 'linear-gradient(145deg, #243D32 0%, #1A332A 100%)',
    lines: '#C9A962',
    linesOpacity: 0.7,
    starPoints: '#D4AF37',
    shadow: 'rgba(0, 0, 0, 0.4)',
  } : {
    board: '#D4B896',
    boardGradient: 'linear-gradient(145deg, #DCC4A0 0%, #CCAB88 100%)',
    lines: '#6B4423',
    linesOpacity: 0.8,
    starPoints: '#5C4033',
    shadow: 'rgba(0, 0, 0, 0.15)',
  };

  return (
    <div className="relative select-none no-select">
      {/* Board container */}
      <div
        className="relative rounded-lg"
        style={{
          width: boardWidth,
          height: boardWidth,
          background: colors.boardGradient,
          boxShadow: `
            0 4px 6px ${colors.shadow},
            0 10px 20px ${colors.shadow},
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        {/* Grid lines SVG */}
        <svg
          width={boardWidth}
          height={boardWidth}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Grid lines */}
          {Array.from({ length: size }).map((_, i) => (
            <g key={`lines-${i}`}>
              {/* Vertical lines */}
              <line
                x1={boardPadding + i * cellSize}
                y1={boardPadding}
                x2={boardPadding + i * cellSize}
                y2={boardPadding + gridSize}
                stroke={colors.lines}
                strokeWidth={i === 0 || i === size - 1 ? 1.5 : 0.75}
                strokeOpacity={colors.linesOpacity}
              />
              {/* Horizontal lines */}
              <line
                x1={boardPadding}
                y1={boardPadding + i * cellSize}
                x2={boardPadding + gridSize}
                y2={boardPadding + i * cellSize}
                stroke={colors.lines}
                strokeWidth={i === 0 || i === size - 1 ? 1.5 : 0.75}
                strokeOpacity={colors.linesOpacity}
              />
            </g>
          ))}

          {/* Star points (hoshi) */}
          {starPoints.map((point, i) => (
            <circle
              key={`star-${i}`}
              cx={boardPadding + point.x * cellSize}
              cy={boardPadding + point.y * cellSize}
              r={size === 19 ? 3 : 3.5}
              fill={colors.starPoints}
              opacity={0.9}
            />
          ))}
        </svg>

        {/* Intersections and stones */}
        {Array.from({ length: size }).map((_, y) =>
          Array.from({ length: size }).map((_, x) => {
            const stone = gameState.board[y][x];
            const isLastMove = gameState.lastMove?.x === x && gameState.lastMove?.y === y;
            const canPlay = !disabled && !gameState.gameOver && isValidMove(gameState, { x, y });
            const isHovered = hoveredPos?.x === x && hoveredPos?.y === y;

            return (
              <div
                key={`${x}-${y}`}
                className="absolute tap-target"
                style={{
                  left: boardPadding + x * cellSize - cellSize / 2,
                  top: boardPadding + y * cellSize - cellSize / 2,
                  width: cellSize,
                  height: cellSize,
                  cursor: canPlay ? 'pointer' : 'default',
                }}
                onClick={() => handleIntersectionClick(x, y)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleIntersectionClick(x, y);
                }}
                onMouseEnter={() => canPlay && setHoveredPos({ x, y })}
                onMouseLeave={() => setHoveredPos(null)}
              >
                {/* Hover preview */}
                <AnimatePresence>
                  {canPlay && !stone && isHovered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 0.4, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.1 }}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: stoneSize,
                        height: stoneSize,
                        background: gameState.currentPlayer === 'black'
                          ? 'radial-gradient(circle at 30% 30%, #444 0%, #111 100%)'
                          : 'radial-gradient(circle at 30% 30%, #fff 0%, #ddd 100%)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Placed stone */}
                <AnimatePresence>
                  {stone && (
                    <GoStone
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

interface GoStoneProps {
  color: Stone;
  size: number;
  isLastMove: boolean;
}

function GoStone({ color, size, isLastMove }: GoStoneProps) {
  const isBlack = color === 'black';

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 28,
      }}
      className="absolute rounded-full"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        // High contrast stone gradients
        background: isBlack
          ? 'radial-gradient(circle at 30% 25%, #4a4a4a 0%, #1a1a1a 40%, #050505 100%)'
          : 'radial-gradient(circle at 30% 25%, #ffffff 0%, #f0f0f0 40%, #d8d8d8 100%)',
        // Strong shadows for visibility
        boxShadow: isBlack
          ? `0 3px 6px rgba(0, 0, 0, 0.4),
             0 1px 2px rgba(0, 0, 0, 0.3),
             inset 0 1px 1px rgba(255, 255, 255, 0.1)`
          : `0 3px 6px rgba(0, 0, 0, 0.25),
             0 1px 2px rgba(0, 0, 0, 0.15),
             inset 0 -1px 1px rgba(0, 0, 0, 0.05),
             inset 0 1px 1px rgba(255, 255, 255, 0.9)`,
        // Border for extra visibility
        border: isBlack
          ? '1px solid rgba(80, 80, 80, 0.3)'
          : '1px solid rgba(200, 200, 200, 0.5)',
      }}
    >
      {/* Highlight */}
      <div
        className="absolute rounded-full"
        style={{
          left: '18%',
          top: '15%',
          width: '28%',
          height: '22%',
          background: isBlack
            ? 'radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 70%)',
        }}
      />

      {/* Last move indicator */}
      {isLastMove && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 500 }}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: '2px',
            background: isBlack
              ? 'rgba(255, 255, 255, 0.8)'
              : 'rgba(0, 0, 0, 0.7)',
          }}
        />
      )}
    </motion.div>
  );
}
