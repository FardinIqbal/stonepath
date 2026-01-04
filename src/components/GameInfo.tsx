'use client';

import { motion } from 'framer-motion';
import type { GameState, Stone } from '@/lib/go-engine';

interface GameInfoProps {
  gameState: GameState;
  score: { black: number; white: number };
  onPass: () => void;
  onUndo: () => void;
  onReset: () => void;
  onNewGame: (size: 9 | 13 | 19) => void;
}

export function GameInfo({
  gameState,
  score,
  onPass,
  onUndo,
  onReset,
  onNewGame,
}: GameInfoProps) {
  const currentSize = gameState.board.length as 9 | 13 | 19;

  return (
    <div className="flex flex-col gap-6 w-full max-w-xs">
      {/* Current turn indicator */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-5 border border-zinc-800">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Current Turn
        </h3>
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-8 h-8 rounded-full shadow-lg"
            style={{
              background:
                gameState.currentPlayer === 'black'
                  ? 'radial-gradient(ellipse at 30% 30%, #444, #000)'
                  : 'radial-gradient(ellipse at 30% 30%, #fff, #ddd)',
            }}
          />
          <span className="text-lg font-semibold capitalize">
            {gameState.currentPlayer}
          </span>
          {gameState.gameOver && (
            <span className="ml-auto text-sm text-zinc-500">Game Over</span>
          )}
        </div>
      </div>

      {/* Score panel */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-5 border border-zinc-800">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
          Score
        </h3>
        <div className="flex justify-between items-center">
          <PlayerScore
            color="black"
            captures={gameState.captures.black}
            territory={score.black}
            isWinner={gameState.winner === 'black'}
          />
          <div className="text-zinc-600 font-mono">vs</div>
          <PlayerScore
            color="white"
            captures={gameState.captures.white}
            territory={score.white}
            isWinner={gameState.winner === 'white'}
          />
        </div>
      </div>

      {/* Winner announcement */}
      {gameState.gameOver && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-5 border border-blue-500/30"
        >
          <h3 className="text-lg font-semibold text-center">
            {gameState.winner === 'tie'
              ? "It's a tie!"
              : `${gameState.winner === 'black' ? 'Black' : 'White'} wins!`}
          </h3>
          <p className="text-center text-sm text-zinc-400 mt-1">
            {score.black.toFixed(1)} - {score.white.toFixed(1)}
          </p>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={onPass}
            disabled={gameState.gameOver}
            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-sm"
          >
            Pass
          </button>
          <button
            onClick={onUndo}
            disabled={gameState.moveHistory.length === 0}
            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-sm"
          >
            Undo
          </button>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors text-sm"
        >
          Reset Game
        </button>
      </div>

      {/* Board size selector */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-5 border border-zinc-800">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Board Size
        </h3>
        <div className="flex gap-2">
          {([9, 13, 19] as const).map(size => (
            <button
              key={size}
              onClick={() => onNewGame(size)}
              className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                currentSize === size
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              {size}x{size}
            </button>
          ))}
        </div>
      </div>

      {/* Move count */}
      <div className="text-center text-xs text-zinc-600">
        Move {gameState.moveHistory.length}
      </div>
    </div>
  );
}

interface PlayerScoreProps {
  color: Stone;
  captures: number;
  territory: number;
  isWinner: boolean;
}

function PlayerScore({ color, captures, territory, isWinner }: PlayerScoreProps) {
  const isBlack = color === 'black';

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-6 h-6 rounded-full shadow-md ${isWinner ? 'ring-2 ring-yellow-400' : ''}`}
        style={{
          background: isBlack
            ? 'radial-gradient(ellipse at 30% 30%, #444, #000)'
            : 'radial-gradient(ellipse at 30% 30%, #fff, #ddd)',
        }}
      />
      <div className="text-center">
        <div className="text-2xl font-bold">{territory.toFixed(1)}</div>
        <div className="text-xs text-zinc-500">{captures} captures</div>
      </div>
    </div>
  );
}
