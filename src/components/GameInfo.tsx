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
    <div className="flex flex-col gap-5 w-full max-w-[280px]">
      {/* Player Cards */}
      <div className="flex gap-3">
        <PlayerCard
          color="black"
          captures={gameState.captures.black}
          score={score.black}
          isCurrentTurn={gameState.currentPlayer === 'black'}
          isWinner={gameState.winner === 'black'}
          isThinking={isAIThinking && gameState.currentPlayer === 'black'}
        />
        <PlayerCard
          color="white"
          captures={gameState.captures.white}
          score={score.white}
          isCurrentTurn={gameState.currentPlayer === 'white'}
          isWinner={gameState.winner === 'white'}
          isThinking={isAIThinking && gameState.currentPlayer === 'white'}
        />
      </div>

      {/* Winner announcement */}
      <AnimatePresence>
        {gameState.gameOver && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="py-4 px-5 rounded-xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 165, 90, 0.15) 0%, rgba(180, 140, 80, 0.1) 100%)',
              border: '1px solid rgba(212, 165, 90, 0.3)',
            }}
          >
            <div className="text-lg font-semibold text-amber-200/90">
              {gameState.winner === 'tie'
                ? 'Draw'
                : `${gameState.winner === 'black' ? 'Black' : 'White'} Wins`}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {score.black.toFixed(1)} - {score.white.toFixed(1)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Controls */}
      <div className="flex gap-2">
        <button
          onClick={onPass}
          disabled={!isPlayerTurn}
          className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            bg-zinc-800/60 hover:bg-zinc-700/60 disabled:opacity-40 disabled:cursor-not-allowed
            border border-zinc-700/50 hover:border-zinc-600/50"
        >
          Pass
        </button>
        <button
          onClick={onUndo}
          disabled={gameState.moveHistory.length === 0 || isAIThinking}
          className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            bg-zinc-800/60 hover:bg-zinc-700/60 disabled:opacity-40 disabled:cursor-not-allowed
            border border-zinc-700/50 hover:border-zinc-600/50"
        >
          Undo
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            bg-zinc-800/60 hover:bg-zinc-700/60
            border border-zinc-700/50 hover:border-zinc-600/50"
        >
          Reset
        </button>
      </div>

      {/* Settings Section */}
      <div className="space-y-4 pt-2">
        {/* Game Mode */}
        <SettingSection title="Mode">
          <div className="flex gap-1.5">
            <ToggleButton
              active={mode === 'local'}
              onClick={() => onModeChange('local')}
            >
              2P
            </ToggleButton>
            <ToggleButton
              active={mode === 'ai-white'}
              onClick={() => onModeChange('ai-white')}
            >
              vs AI
            </ToggleButton>
            <ToggleButton
              active={mode === 'ai-black'}
              onClick={() => onModeChange('ai-black')}
            >
              AI First
            </ToggleButton>
          </div>
        </SettingSection>

        {/* AI Strength - only when vs AI */}
        {mode !== 'local' && (
          <SettingSection title="AI Level">
            <div className="flex gap-1.5">
              <ToggleButton
                active={strength === 'beginner'}
                onClick={() => onStrengthChange('beginner')}
                color="green"
              >
                Easy
              </ToggleButton>
              <ToggleButton
                active={strength === 'intermediate'}
                onClick={() => onStrengthChange('intermediate')}
                color="amber"
              >
                Medium
              </ToggleButton>
              <ToggleButton
                active={strength === 'katanet'}
                onClick={() => onStrengthChange('katanet')}
                disabled={currentSize !== 19}
                color="rose"
              >
                KataNet
              </ToggleButton>
            </div>
            {strength === 'katanet' && (
              <KataNetStatus status={kataNetStatus} />
            )}
            {currentSize !== 19 && strength !== 'katanet' && (
              <p className="text-xs text-zinc-500 mt-2">
                KataNet requires 19x19
              </p>
            )}
          </SettingSection>
        )}

        {/* Board Size */}
        <SettingSection title="Board">
          <div className="flex gap-1.5">
            {([9, 13, 19] as const).map((size) => (
              <ToggleButton
                key={size}
                active={currentSize === size}
                onClick={() => onNewGame(size)}
              >
                {size}x{size}
              </ToggleButton>
            ))}
          </div>
        </SettingSection>
      </div>

      {/* Move count */}
      <div className="text-center text-xs text-zinc-600 pt-2">
        Move {gameState.moveHistory.length}
      </div>
    </div>
  );
}

interface PlayerCardProps {
  color: Stone;
  captures: number;
  score: number;
  isCurrentTurn: boolean;
  isWinner: boolean;
  isThinking: boolean;
}

function PlayerCard({ color, captures, score, isCurrentTurn, isWinner, isThinking }: PlayerCardProps) {
  const isBlack = color === 'black';

  return (
    <motion.div
      animate={isWinner ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
      className={`flex-1 py-4 px-4 rounded-xl transition-all duration-300 ${
        isCurrentTurn
          ? 'bg-zinc-800/80 border-zinc-600/50'
          : 'bg-zinc-900/40 border-zinc-800/30'
      } border`}
      style={{
        boxShadow: isWinner ? '0 0 20px rgba(212, 165, 90, 0.2)' : undefined,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Stone indicator */}
        <div className="relative">
          <motion.div
            animate={isThinking ? { scale: [1, 1.1, 1] } : isCurrentTurn ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: isThinking ? 0.6 : 2 }}
            className="w-8 h-8 rounded-full"
            style={{
              background: isBlack
                ? 'radial-gradient(ellipse at 35% 25%, rgba(80, 80, 85, 1) 0%, rgba(15, 15, 18, 1) 60%, rgba(5, 5, 8, 1) 100%)'
                : 'radial-gradient(ellipse at 35% 25%, rgba(255, 255, 255, 1) 0%, rgba(230, 228, 220, 1) 60%, rgba(210, 205, 195, 1) 100%)',
              boxShadow: isBlack
                ? '1px 2px 4px rgba(0, 0, 0, 0.5)'
                : '1px 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          />
          {isWinner && (
            <div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
              }}
            />
          )}
        </div>

        {/* Score info */}
        <div className="flex-1">
          <div className={`text-lg font-semibold tabular-nums ${isCurrentTurn ? 'text-white' : 'text-zinc-400'}`}>
            {score.toFixed(1)}
          </div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
            {captures} captured
          </div>
        </div>

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  delay: i * 0.15,
                }}
                className="w-1.5 h-1.5 bg-amber-500 rounded-full"
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <div>
      <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  color?: 'default' | 'green' | 'amber' | 'rose';
  children: React.ReactNode;
}

function ToggleButton({ active, onClick, disabled, color = 'default', children }: ToggleButtonProps) {
  const colorStyles = {
    default: active ? 'bg-white text-black' : '',
    green: active ? 'bg-emerald-600 text-white' : '',
    amber: active ? 'bg-amber-600 text-white' : '',
    rose: active ? 'bg-rose-600 text-white' : '',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
        ${active
          ? colorStyles[color]
          : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-300'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        border border-transparent ${active ? '' : 'border-zinc-700/30'}
      `}
    >
      {children}
    </button>
  );
}

interface KataNetStatusProps {
  status: 'not-loaded' | 'loading' | 'ready' | 'error';
}

function KataNetStatus({ status }: KataNetStatusProps) {
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 mt-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-3 h-3 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
        />
        <span className="text-xs text-blue-400">Loading KataNet...</span>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className="flex items-center gap-2 mt-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
        <span className="text-xs text-emerald-400">KataNet ready (~2 dan)</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 mt-2">
        <div className="w-2 h-2 bg-rose-500 rounded-full" />
        <span className="text-xs text-rose-400">Failed to load</span>
      </div>
    );
  }

  return null;
}
