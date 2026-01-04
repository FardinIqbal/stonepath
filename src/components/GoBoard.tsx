'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
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
  const [hoveredPos, setHoveredPos] = useState<Position | null>(null);

  // Calculate cell size based on board size
  const getCellSize = () => {
    if (size === 9) return 48;
    if (size === 13) return 38;
    return 28; // 19x19
  };

  const cellSize = getCellSize();
  const stoneSize = cellSize * 0.88;
  const boardPadding = cellSize * 1.2;
  const gridSize = cellSize * (size - 1);
  const boardWidth = gridSize + boardPadding * 2;

  // Column labels (A-T, skipping I)
  const colLabels = 'ABCDEFGHJKLMNOPQRST'.slice(0, size).split('');

  const handleIntersectionClick = (x: number, y: number) => {
    if (disabled || gameState.gameOver) return;
    const pos = { x, y };
    if (isValidMove(gameState, pos)) {
      onPlaceStone(pos);
    }
  };

  return (
    <div className="relative select-none">
      {/* Board container */}
      <div
        className="relative rounded-2xl"
        style={{
          width: boardWidth,
          height: boardWidth,
          background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
          boxShadow: `
            0 0 0 1px rgba(255, 255, 255, 0.03),
            0 20px 50px -10px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.02)
          `,
        }}
      >
        {/* Subtle inner glow */}
        <div
          className="absolute inset-4 rounded-xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.01) 0%, transparent 70%)',
          }}
        />

        {/* Coordinate labels - columns */}
        {colLabels.map((label, i) => (
          <div
            key={`col-top-${i}`}
            className="absolute text-[9px] font-medium"
            style={{
              left: boardPadding + i * cellSize,
              top: 10,
              transform: 'translateX(-50%)',
              color: 'rgba(255, 255, 255, 0.2)',
              fontFamily: 'system-ui',
              letterSpacing: '0.05em',
            }}
          >
            {label}
          </div>
        ))}

        {/* Coordinate labels - rows */}
        {Array.from({ length: size }).map((_, i) => (
          <div
            key={`row-${i}`}
            className="absolute text-[9px] font-medium"
            style={{
              left: 12,
              top: boardPadding + i * cellSize,
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.2)',
              fontFamily: 'system-ui',
            }}
          >
            {size - i}
          </div>
        ))}

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
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth={i === 0 || i === size - 1 ? 1 : 0.5}
              />
              {/* Horizontal lines */}
              <line
                x1={boardPadding}
                y1={boardPadding + i * cellSize}
                x2={boardPadding + gridSize}
                y2={boardPadding + i * cellSize}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth={i === 0 || i === size - 1 ? 1 : 0.5}
              />
            </g>
          ))}

          {/* Star points (hoshi) */}
          {starPoints.map((point, i) => (
            <circle
              key={`star-${i}`}
              cx={boardPadding + point.x * cellSize}
              cy={boardPadding + point.y * cellSize}
              r={size === 19 ? 2.5 : 3}
              fill="rgba(255, 255, 255, 0.25)"
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
                className="absolute"
                style={{
                  left: boardPadding + x * cellSize - cellSize / 2,
                  top: boardPadding + y * cellSize - cellSize / 2,
                  width: cellSize,
                  height: cellSize,
                  cursor: canPlay ? 'pointer' : 'default',
                }}
                onClick={() => handleIntersectionClick(x, y)}
                onMouseEnter={() => canPlay && setHoveredPos({ x, y })}
                onMouseLeave={() => setHoveredPos(null)}
              >
                {/* Hover preview */}
                <AnimatePresence>
                  {canPlay && !stone && isHovered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
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
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(255, 255, 255, 0.15)',
                        border: gameState.currentPlayer === 'black'
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(255, 255, 255, 0.25)',
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
        damping: 25,
      }}
      className="absolute rounded-full"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        background: isBlack
          ? 'linear-gradient(145deg, #2a2a2a 0%, #0a0a0a 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #e0e0e0 100%)',
        boxShadow: isBlack
          ? `0 2px 8px rgba(0, 0, 0, 0.5),
             0 1px 2px rgba(0, 0, 0, 0.3),
             inset 0 1px 0 rgba(255, 255, 255, 0.05)`
          : `0 2px 8px rgba(0, 0, 0, 0.2),
             0 1px 2px rgba(0, 0, 0, 0.1),
             inset 0 -1px 0 rgba(0, 0, 0, 0.05)`,
      }}
    >
      {/* Subtle highlight */}
      <div
        className="absolute rounded-full"
        style={{
          left: '15%',
          top: '12%',
          width: '30%',
          height: '25%',
          background: isBlack
            ? 'radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 70%)',
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
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: '2px',
            background: isBlack
              ? 'rgba(255, 255, 255, 0.6)'
              : 'rgba(0, 0, 0, 0.5)',
          }}
        />
      )}
    </motion.div>
  );
}
