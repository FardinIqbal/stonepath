'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import type { Puzzle, PuzzlePosition } from '@/lib/tsumego';
import { parsePosition, checkMove, getResponseMove, isPuzzleSolved } from '@/lib/tsumego';
import { useTheme } from '@/lib/theme';

interface PuzzleBoardProps {
  puzzle: Puzzle;
  onSolved: () => void;
  onFailed: () => void;
}

export function PuzzleBoard({ puzzle, onSolved, onFailed }: PuzzleBoardProps) {
  const { theme } = useTheme();
  const { viewport, playerColor } = puzzle;
  const [position, setPosition] = useState(() => parsePosition(puzzle.initialPosition, viewport));
  const [moveHistory, setMoveHistory] = useState<PuzzlePosition[]>([]);
  const [currentBranch, setCurrentBranch] = useState(puzzle.solution);
  const [status, setStatus] = useState<'solving' | 'correct' | 'incorrect'>('solving');
  const [lastMove, setLastMove] = useState<PuzzlePosition | null>(null);
  const [hoveredPos, setHoveredPos] = useState<PuzzlePosition | null>(null);

  // Mobile-first responsive sizing
  const getCellSize = () => {
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      const maxWidth = Math.min(screenWidth - 48, 400); // 48px for padding
      const baseSize = maxWidth / Math.max(viewport.width, viewport.height);
      return Math.min(Math.max(baseSize, 28), 44);
    }
    return 40;
  };

  const cellSize = getCellSize();
  const stoneSize = cellSize * 0.88;
  const boardPadding = cellSize * 0.6;
  const gridWidth = cellSize * (viewport.width - 1);
  const gridHeight = cellSize * (viewport.height - 1);
  const boardWidth = gridWidth + boardPadding * 2;
  const boardHeight = gridHeight + boardPadding * 2;

  const isPlayerTurn = status === 'solving' && moveHistory.length % 2 === 0;

  // Theme-aware colors
  const colors = useMemo(() => theme === 'dark' ? {
    board: '#1E3A2F',
    boardGradient: 'linear-gradient(145deg, #243D32 0%, #1A332A 100%)',
    lines: '#C9A962',
    linesOpacity: 0.6,
  } : {
    board: '#D4B896',
    boardGradient: 'linear-gradient(145deg, #DCC4A0 0%, #CCAB88 100%)',
    lines: '#6B4423',
    linesOpacity: 0.7,
  }, [theme]);

  const currentPlayer = (() => {
    const turns = moveHistory.length;
    if (turns % 2 === 0) return playerColor;
    return playerColor === 'black' ? 'white' : 'black';
  })();

  const handleClick = (x: number, y: number) => {
    if (status !== 'solving' || !isPlayerTurn) return;
    if (position[y][x] !== null) return;

    const move: PuzzlePosition = { x, y };
    const result = checkMove(move, currentBranch, puzzle.solution);

    if (result.isCorrect) {
      const newPosition = position.map((row) => [...row]);
      newPosition[y][x] = playerColor;
      setPosition(newPosition);
      setMoveHistory([...moveHistory, move]);
      setLastMove(move);

      if (isPuzzleSolved(result.nextBranch, moveHistory.length + 1)) {
        setStatus('correct');
        setTimeout(onSolved, 500);
      } else {
        setCurrentBranch(result.nextBranch);
        setTimeout(() => {
          const response = getResponseMove(result.nextBranch);
          if (response) {
            const afterResponse = newPosition.map((row) => [...row]);
            afterResponse[response.y][response.x] = playerColor === 'black' ? 'white' : 'black';
            setPosition(afterResponse);
            setMoveHistory((prev) => [...prev, response]);
            setLastMove(response);

            const responseBranch = result.nextBranch[0]?.responses || [];
            setCurrentBranch(responseBranch);

            if (isPuzzleSolved(responseBranch, moveHistory.length + 2)) {
              setStatus('correct');
              setTimeout(onSolved, 500);
            }
          }
        }, 400);
      }
    } else {
      const newPosition = position.map((row) => [...row]);
      newPosition[y][x] = playerColor;
      setPosition(newPosition);
      setLastMove(move);
      setStatus('incorrect');
      setTimeout(onFailed, 800);
    }
  };

  const resetPuzzle = () => {
    setPosition(parsePosition(puzzle.initialPosition, viewport));
    setMoveHistory([]);
    setCurrentBranch(puzzle.solution);
    setStatus('solving');
    setLastMove(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Status indicator */}
      <AnimatePresence mode="wait">
        {status === 'correct' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-serif"
          >
            Correct!
          </motion.div>
        )}
        {status === 'incorrect' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-serif"
          >
            Try again
          </motion.div>
        )}
        {status === 'solving' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2 rounded-md bg-background-secondary border border-border text-foreground-secondary text-sm font-serif"
          >
            {playerColor === 'black' ? 'Black' : 'White'} to play
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board */}
      <div className="relative select-none no-select">
        <div
          className="relative rounded-lg"
          style={{
            width: boardWidth,
            height: boardHeight,
            background: colors.boardGradient,
            boxShadow: theme === 'dark'
              ? '0 4px 6px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 4px 6px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          }}
        >
          {/* Grid */}
          <svg
            width={boardWidth}
            height={boardHeight}
            className="absolute inset-0 pointer-events-none"
          >
            {Array.from({ length: viewport.width }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={boardPadding + i * cellSize}
                y1={boardPadding}
                x2={boardPadding + i * cellSize}
                y2={boardPadding + gridHeight}
                stroke={colors.lines}
                strokeWidth={i === 0 || i === viewport.width - 1 ? 1.5 : 0.75}
                strokeOpacity={colors.linesOpacity}
              />
            ))}
            {Array.from({ length: viewport.height }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={boardPadding}
                y1={boardPadding + i * cellSize}
                x2={boardPadding + gridWidth}
                y2={boardPadding + i * cellSize}
                stroke={colors.lines}
                strokeWidth={i === 0 || i === viewport.height - 1 ? 1.5 : 0.75}
                strokeOpacity={colors.linesOpacity}
              />
            ))}
          </svg>

          {/* Intersections */}
          {Array.from({ length: viewport.height }).map((_, y) =>
            Array.from({ length: viewport.width }).map((_, x) => {
              const stone = position[y]?.[x];
              const isLast = lastMove?.x === x && lastMove?.y === y;
              const canPlay = status === 'solving' && isPlayerTurn && stone === null;
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
                  onClick={() => handleClick(x, y)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleClick(x, y);
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
                          background: playerColor === 'black'
                            ? 'radial-gradient(circle at 30% 30%, #444 0%, #111 100%)'
                            : 'radial-gradient(circle at 30% 30%, #fff 0%, #ddd 100%)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Stone */}
                  <AnimatePresence>
                    {stone && (
                      <PuzzleStone
                        color={stone}
                        size={stoneSize}
                        isLastMove={isLast}
                        isIncorrect={status === 'incorrect' && isLast}
                      />
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Retry button */}
      {status !== 'solving' && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={resetPuzzle}
          className="px-4 py-2 rounded-md bg-background-secondary hover:bg-background-tertiary text-sm font-medium transition-colors border border-border text-foreground-secondary hover:text-foreground"
        >
          Try Again
        </motion.button>
      )}
    </div>
  );
}

interface PuzzleStoneProps {
  color: 'black' | 'white';
  size: number;
  isLastMove: boolean;
  isIncorrect?: boolean;
}

function PuzzleStone({ color, size, isLastMove, isIncorrect }: PuzzleStoneProps) {
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
          ? 'radial-gradient(circle at 30% 25%, #4a4a4a 0%, #1a1a1a 40%, #050505 100%)'
          : 'radial-gradient(circle at 30% 25%, #ffffff 0%, #f0f0f0 40%, #d8d8d8 100%)',
        boxShadow: isBlack
          ? `0 3px 6px rgba(0, 0, 0, 0.4),
             0 1px 2px rgba(0, 0, 0, 0.3),
             inset 0 1px 1px rgba(255, 255, 255, 0.1)`
          : `0 3px 6px rgba(0, 0, 0, 0.25),
             0 1px 2px rgba(0, 0, 0, 0.15),
             inset 0 -1px 1px rgba(0, 0, 0, 0.05),
             inset 0 1px 1px rgba(255, 255, 255, 0.9)`,
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

      {/* Last move / incorrect indicator */}
      {isLastMove && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: '2px',
            background: isIncorrect
              ? '#ef4444'
              : isBlack
              ? 'rgba(255, 255, 255, 0.8)'
              : 'rgba(0, 0, 0, 0.7)',
          }}
        />
      )}
    </motion.div>
  );
}
