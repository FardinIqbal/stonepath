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
    if (size === 9) return 52;
    if (size === 13) return 40;
    return 30; // 19x19
  };

  const cellSize = getCellSize();
  const stoneSize = cellSize * 0.92;
  const boardPadding = cellSize * 1.4;
  const gridSize = cellSize * (size - 1);
  const boardSize = gridSize + boardPadding * 2;

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
      {/* Outer frame with shadow */}
      <div
        className="relative rounded-2xl p-1"
        style={{
          background: 'linear-gradient(145deg, #1a1612 0%, #2a231c 50%, #1a1612 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Board surface with kaya wood grain */}
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            width: boardSize,
            height: boardSize,
          }}
        >
          {/* Wood grain base */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(90deg,
                  rgba(180, 140, 80, 0.03) 0%,
                  rgba(200, 160, 100, 0.05) 15%,
                  rgba(180, 140, 80, 0.02) 30%,
                  rgba(190, 150, 90, 0.04) 45%,
                  rgba(180, 140, 80, 0.03) 60%,
                  rgba(200, 160, 100, 0.05) 75%,
                  rgba(180, 140, 80, 0.02) 100%
                ),
                linear-gradient(180deg,
                  #d4a55a 0%,
                  #dcb06a 10%,
                  #d4a55a 20%,
                  #dbb268 35%,
                  #d4a55a 50%,
                  #dcb06a 65%,
                  #d4a55a 80%,
                  #dbb268 90%,
                  #d4a55a 100%
                )
              `,
            }}
          />

          {/* Subtle grain texture overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              mixBlendMode: 'multiply',
            }}
          />

          {/* Coordinate labels - columns (letters) */}
          {colLabels.map((label, i) => (
            <div
              key={`col-${i}`}
              className="absolute text-[10px] font-medium tracking-wide"
              style={{
                left: boardPadding + i * cellSize,
                top: 8,
                transform: 'translateX(-50%)',
                color: 'rgba(60, 40, 20, 0.5)',
                fontFamily: 'system-ui',
              }}
            >
              {label}
            </div>
          ))}

          {/* Coordinate labels - rows (numbers) */}
          {Array.from({ length: size }).map((_, i) => (
            <div
              key={`row-${i}`}
              className="absolute text-[10px] font-medium"
              style={{
                left: 10,
                top: boardPadding + i * cellSize,
                transform: 'translateY(-50%)',
                color: 'rgba(60, 40, 20, 0.5)',
                fontFamily: 'system-ui',
              }}
            >
              {size - i}
            </div>
          ))}

          {/* Grid lines SVG */}
          <svg
            width={boardSize}
            height={boardSize}
            className="absolute inset-0 pointer-events-none"
          >
            <defs>
              {/* Grid line gradient for depth */}
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3a2a15" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#4a3520" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3a2a15" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {Array.from({ length: size }).map((_, i) => (
              <g key={`lines-${i}`}>
                {/* Vertical lines */}
                <line
                  x1={boardPadding + i * cellSize}
                  y1={boardPadding}
                  x2={boardPadding + i * cellSize}
                  y2={boardPadding + gridSize}
                  stroke="url(#lineGradient)"
                  strokeWidth={i === 0 || i === size - 1 ? 1.5 : 0.8}
                />
                {/* Horizontal lines */}
                <line
                  x1={boardPadding}
                  y1={boardPadding + i * cellSize}
                  x2={boardPadding + gridSize}
                  y2={boardPadding + i * cellSize}
                  stroke="url(#lineGradient)"
                  strokeWidth={i === 0 || i === size - 1 ? 1.5 : 0.8}
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
                fill="#3a2a15"
                opacity={0.85}
              />
            ))}
          </svg>

          {/* Intersection click areas and stones */}
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
                        animate={{ opacity: 0.5, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: stoneSize,
                          height: stoneSize,
                          background: gameState.currentPlayer === 'black'
                            ? 'radial-gradient(ellipse at 35% 25%, #666 0%, #222 40%, #000 100%)'
                            : 'radial-gradient(ellipse at 35% 25%, #fff 0%, #f0f0f0 40%, #d0d0d0 100%)',
                          boxShadow: gameState.currentPlayer === 'black'
                            ? '2px 3px 6px rgba(0, 0, 0, 0.4)'
                            : '2px 3px 6px rgba(0, 0, 0, 0.2)',
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
      initial={{ scale: 0, opacity: 0, y: -20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 20,
        mass: 0.8,
      }}
      className="absolute rounded-full"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        // Realistic stone gradients
        background: isBlack
          ? `radial-gradient(ellipse at 35% 25%,
              rgba(80, 80, 85, 1) 0%,
              rgba(40, 40, 45, 1) 25%,
              rgba(15, 15, 18, 1) 60%,
              rgba(5, 5, 8, 1) 100%)`
          : `radial-gradient(ellipse at 35% 25%,
              rgba(255, 255, 255, 1) 0%,
              rgba(245, 245, 240, 1) 25%,
              rgba(230, 228, 220, 1) 60%,
              rgba(210, 205, 195, 1) 100%)`,
        // Realistic shadows
        boxShadow: isBlack
          ? `2px 4px 8px rgba(0, 0, 0, 0.5),
             1px 2px 3px rgba(0, 0, 0, 0.3),
             inset -1px -1px 2px rgba(255, 255, 255, 0.08),
             inset 1px 1px 2px rgba(0, 0, 0, 0.3)`
          : `2px 4px 8px rgba(0, 0, 0, 0.25),
             1px 2px 3px rgba(0, 0, 0, 0.15),
             inset -1px -1px 3px rgba(0, 0, 0, 0.08),
             inset 1px 1px 2px rgba(255, 255, 255, 0.8)`,
      }}
    >
      {/* Glass-like highlight for black stones */}
      {isBlack && (
        <div
          className="absolute rounded-full"
          style={{
            left: '20%',
            top: '15%',
            width: '25%',
            height: '20%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Shell-like texture hint for white stones */}
      {!isBlack && (
        <div
          className="absolute rounded-full opacity-20"
          style={{
            left: '10%',
            top: '10%',
            width: '80%',
            height: '80%',
            background: 'radial-gradient(ellipse at 30% 30%, transparent 30%, rgba(200, 195, 180, 0.3) 60%, transparent 80%)',
          }}
        />
      )}

      {/* Last move indicator */}
      {isLastMove && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
          className="absolute rounded-sm"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.25,
            height: size * 0.25,
            background: isBlack ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
          }}
        />
      )}
    </motion.div>
  );
}
