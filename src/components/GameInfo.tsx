'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GameState, Stone } from '@/lib/go-engine';
import type { GameMode, AIStrength } from '@/hooks/useGoGame';

interface GameInfoProps {
  gameState: GameState;
  score: { black: number; white: number };
  mode: GameMode;
  strength: AIStrength;
  isAIThinking: boolean;
  kataNetStatus: 'not-loaded' | 'loading' | 'ready' | 'error';
  onPass: () => void;
  onUndo: () => void;
  onReset: () => void;
  onNewGame: (size: 9 | 13 | 19) => void;
  onModeChange: (mode: GameMode) => void;
  onStrengthChange: (strength: AIStrength) => void;
}

export function GameInfo({
  gameState,
  score,
  mode,
  strength,
  isAIThinking,
  kataNetStatus,
  onPass,
  onUndo,
  onReset,
  onNewGame,
  onModeChange,
  onStrengthChange,
}: GameInfoProps) {
  const currentSize = gameState.board.length as 9 | 13 | 19;
  const isPlayerTurn = !isAIThinking && !gameState.gameOver;

  return (
    <div className="flex flex-col gap-6 w-full max-w-xs">
      {/* Game Mode Selector */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-5 border border-zinc-800">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Game Mode
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onModeChange('local')}
            className={`px-3 py-2 rounded-lg font-medium text-xs transition-all ${
              mode === 'local'
                ? 'bg-white text-black'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            2 Player
          </button>
          <button
            onClick={() => onModeChange('ai-white')}
            className={`px-3 py-2 rounded-lg font-medium text-xs transition-all ${
              mode === 'ai-white'
                ? 'bg-white text-black'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            vs AI
          </button>
          <button
            onClick={() => onModeChange('ai-black')}
            className={`px-3 py-2 rounded-lg font-medium text-xs transition-all ${
              mode === 'ai-black'
                ? 'bg-white text-black'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            AI First
          </button>
        </div>
        {mode !== 'local' && (
          <p className="text-xs text-zinc-500 mt-2">
            {mode === 'ai-white' ? 'You play Black (first)' : 'AI plays Black (first)'}
          </p>
        )}
      </div>

      {/* AI Strength Selector (only when playing vs AI) */}
      {mode !== 'local' && (
        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-5 border border-zinc-800">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            AI Strength
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onStrengthChange('beginner')}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                strength === 'beginner'
                  ? 'bg-green-600 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => onStrengthChange('intermediate')}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                strength === 'intermediate'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => onStrengthChange('katanet')}
              disabled={currentSize !== 19}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                strength === 'katanet'
                  ? 'bg-red-600 text-white'
                  : currentSize !== 19
                  ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              KataNet
            </button>
          </div>
          {strength === 'katanet' && (
            <div className="mt-2">
              {kataNetStatus === 'loading' && (
                <p className="text-xs text-blue-400 flex items-center gap-2">
                  <span className="animate-spin">...</span>
                  Loading neural network (~12MB)
                </p>
              )}
              {kataNetStatus === 'ready' && (
                <p className="text-xs text-green-400">KataNet ready (~2 dan)</p>
              )}
              {kataNetStatus === 'error' && (
                <p className="text-xs text-red-400">Failed to load KataNet</p>
              )}
            </div>
          )}
          {currentSize !== 19 && strength !== 'katanet' && (
            <p className="text-xs text-zinc-500 mt-2">
              KataNet requires 19x19 board
            </p>
          )}
        </div>
      )}

      {/* Current turn indicator */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-5 border border-zinc-800">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          {isAIThinking ? 'AI Thinking...' : 'Current Turn'}
        </h3>
        <div className="flex items-center gap-3">
          <motion.div
            animate={
              isAIThinking
                ? { scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }
                : { scale: [1, 1.05, 1] }
            }
            transition={{
              repeat: Infinity,
              duration: isAIThinking ? 0.8 : 2,
            }}
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
          <AnimatePresence>
            {isAIThinking && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="ml-auto"
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        delay: i * 0.2,
                      }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
      <AnimatePresence>
        {gameState.gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
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
      </AnimatePresence>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={onPass}
            disabled={!isPlayerTurn}
            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-sm"
          >
            Pass
          </button>
          <button
            onClick={onUndo}
            disabled={gameState.moveHistory.length === 0 || isAIThinking}
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
          {([9, 13, 19] as const).map((size) => (
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
      <motion.div
        animate={isWinner ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
        className={`w-6 h-6 rounded-full shadow-md ${
          isWinner ? 'ring-2 ring-yellow-400' : ''
        }`}
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
