'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { Puzzle, PuzzlePosition } from '@/lib/tsumego';
import { parsePosition, checkMove, getResponseMove, isPuzzleSolved } from '@/lib/tsumego';

interface PuzzleBoardProps {
  puzzle: Puzzle;
  onSolved: () => void;
  onFailed: () => void;
}

export function PuzzleBoard({ puzzle, onSolved, onFailed }: PuzzleBoardProps) {
  const { viewport, playerColor } = puzzle;
  const [position, setPosition] = useState(() => parsePosition(puzzle.initialPosition, viewport));
  const [moveHistory, setMoveHistory] = useState<PuzzlePosition[]>([]);
  const [currentBranch, setCurrentBranch] = useState(puzzle.solution);
  const [status, setStatus] = useState<'solving' | 'correct' | 'incorrect'>('solving');
  const [lastMove, setLastMove] = useState<PuzzlePosition | null>(null);
  const [hoveredPos, setHoveredPos] = useState<PuzzlePosition | null>(null);

  const cellSize = 44;
  const stoneSize = cellSize * 0.92;
  const boardPadding = cellSize * 0.8;
  const gridWidth = cellSize * (viewport.width - 1);
  const gridHeight = cellSize * (viewport.height - 1);
  const boardWidth = gridWidth + boardPadding * 2;
  const boardHeight = gridHeight + boardPadding * 2;

  const isPlayerTurn = useMemo(() => {
    return status === 'solving' && moveHistory.length % 2 === 0;
  }, [status, moveHistory.length]);

  const currentPlayer = useMemo(() => {
    const turns = moveHistory.length;
    if (turns % 2 === 0) return playerColor;
    return playerColor === 'black' ? 'white' : 'black';
  }, [moveHistory.length, playerColor]);

  const handleClick = (x: number, y: number) => {
    if (status !== 'solving' || !isPlayerTurn) return;
    if (position[y][x] !== null) return;

    const move: PuzzlePosition = { x, y };

    // Check if move is correct
    const result = checkMove(move, currentBranch, puzzle.solution);

    if (result.isCorrect) {
      // Place the stone
      const newPosition = position.map((row) => [...row]);
      newPosition[y][x] = playerColor;
      setPosition(newPosition);
      setMoveHistory([...moveHistory, move]);
      setLastMove(move);

      // Check if solved
      if (isPuzzleSolved(result.nextBranch, moveHistory.length + 1)) {
        setStatus('correct');
        setTimeout(onSolved, 500);
      } else {
        // AI responds
        setCurrentBranch(result.nextBranch);
        setTimeout(() => {
          const response = getResponseMove(result.nextBranch);
          if (response) {
            const afterResponse = newPosition.map((row) => [...row]);
            afterResponse[response.y][response.x] = playerColor === 'black' ? 'white' : 'black';
            setPosition(afterResponse);
            setMoveHistory((prev) => [...prev, response]);
            setLastMove(response);

            // Update branch after response
            const responseBranch = result.nextBranch[0]?.responses || [];
            setCurrentBranch(responseBranch);

            // Check if solved after response
            if (isPuzzleSolved(responseBranch, moveHistory.length + 2)) {
              setStatus('correct');
              setTimeout(onSolved, 500);
            }
          }
        }, 400);
      }
    } else {
      // Wrong move
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
            className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium"
          >
            Correct!
          </motion.div>
        )}
        {status === 'incorrect' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm font-medium"
          >
            Try again
          </motion.div>
        )}
        {status === 'solving' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/30 text-zinc-400 text-sm"
          >
            {playerColor === 'black' ? 'Black' : 'White'} to play
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board */}
      <div className="relative select-none">
        <div
          className="relative rounded-xl p-0.5"
          style={{
            background: 'linear-gradient(145deg, #1a1612 0%, #2a231c 50%, #1a1612 100%)',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div
            className="relative rounded-lg overflow-hidden"
            style={{ width: boardWidth, height: boardHeight }}
          >
            {/* Wood background */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg,
                  #d4a55a 0%, #dcb06a 10%, #d4a55a 20%,
                  #dbb268 35%, #d4a55a 50%, #dcb06a 65%,
                  #d4a55a 80%, #dbb268 90%, #d4a55a 100%)`,
              }}
            />

            {/* Grid */}
            <svg
              width={boardWidth}
              height={boardHeight}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Lines */}
              {Array.from({ length: viewport.width }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={boardPadding + i * cellSize}
                  y1={boardPadding}
                  x2={boardPadding + i * cellSize}
                  y2={boardPadding + gridHeight}
                  stroke="#3a2a15"
                  strokeWidth={0.8}
                  strokeOpacity={0.8}
                />
              ))}
              {Array.from({ length: viewport.height }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1={boardPadding}
                  y1={boardPadding + i * cellSize}
                  x2={boardPadding + gridWidth}
                  y2={boardPadding + i * cellSize}
                  stroke="#3a2a15"
                  strokeWidth={0.8}
                  strokeOpacity={0.8}
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
                    className="absolute"
                    style={{
                      left: boardPadding + x * cellSize - cellSize / 2,
                      top: boardPadding + y * cellSize - cellSize / 2,
                      width: cellSize,
                      height: cellSize,
                      cursor: canPlay ? 'pointer' : 'default',
                    }}
                    onClick={() => handleClick(x, y)}
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
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: stoneSize,
                            height: stoneSize,
                            background: playerColor === 'black'
                              ? 'radial-gradient(ellipse at 35% 25%, #666 0%, #222 40%, #000 100%)'
                              : 'radial-gradient(ellipse at 35% 25%, #fff 0%, #f0f0f0 40%, #d0d0d0 100%)',
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
      </div>

      {/* Retry button */}
      {status !== 'solving' && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={resetPuzzle}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
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
      initial={{ scale: 0, opacity: 0, y: -15 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 20,
      }}
      className="absolute rounded-full"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        background: isBlack
          ? 'radial-gradient(ellipse at 35% 25%, rgba(80, 80, 85, 1) 0%, rgba(40, 40, 45, 1) 25%, rgba(15, 15, 18, 1) 60%, rgba(5, 5, 8, 1) 100%)'
          : 'radial-gradient(ellipse at 35% 25%, rgba(255, 255, 255, 1) 0%, rgba(245, 245, 240, 1) 25%, rgba(230, 228, 220, 1) 60%, rgba(210, 205, 195, 1) 100%)',
        boxShadow: isBlack
          ? '2px 3px 6px rgba(0, 0, 0, 0.5), inset -1px -1px 2px rgba(255, 255, 255, 0.08)'
          : '2px 3px 6px rgba(0, 0, 0, 0.25), inset -1px -1px 3px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Last move / incorrect indicator */}
      {isLastMove && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute rounded-sm"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.25,
            height: size * 0.25,
            background: isIncorrect
              ? '#ef4444'
              : isBlack
              ? 'rgba(255, 255, 255, 0.7)'
              : 'rgba(0, 0, 0, 0.6)',
          }}
        />
      )}
    </motion.div>
  );
}
