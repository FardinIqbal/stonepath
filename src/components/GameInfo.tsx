'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GameState, Stone } from '@/lib/go-engine';
import type { GameMode, AIStrength } from '@/hooks/useGoGame';
import { useTheme } from '@/lib/theme';

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
  const { theme } = useTheme();
  const currentSize = gameState.board.length as 9 | 13 | 19;
  const isPlayerTurn = !isAIThinking && !gameState.gameOver;

  return (
    <div className="flex flex-col gap-4 w-full max-w-[280px]">
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
            className="py-3 px-4 rounded-lg text-center bg-background-secondary border border-border"
          >
            <div className="text-base font-serif font-semibold text-accent-gold">
              {gameState.winner === 'tie'
                ? 'Draw'
                : `${gameState.winner === 'black' ? 'Black' : 'White'} Wins`}
            </div>
            <div className="text-xs text-foreground-muted mt-1 font-serif">
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
          className="flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
            bg-background-secondary hover:bg-background-tertiary disabled:opacity-40 disabled:cursor-not-allowed
            border border-border text-foreground-secondary hover:text-foreground"
        >
          Pass
        </button>
        <button
          onClick={onUndo}
          disabled={gameState.moveHistory.length === 0 || isAIThinking}
          className="flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
            bg-background-secondary hover:bg-background-tertiary disabled:opacity-40 disabled:cursor-not-allowed
            border border-border text-foreground-secondary hover:text-foreground"
        >
          Undo
        </button>
        <button
          onClick={onReset}
          className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
            bg-background-secondary hover:bg-background-tertiary
            border border-border text-foreground-secondary hover:text-foreground"
        >
          Reset
        </button>
      </div>

      {/* Settings Section */}
      <div className="space-y-3 pt-1">
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
              <p className="text-xs text-foreground-muted mt-2 font-serif italic">
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
      <div className="text-center text-xs text-foreground-muted pt-1 font-serif italic">
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
  const { theme } = useTheme();
  const isBlack = color === 'black';

  return (
    <motion.div
      animate={isWinner ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
      className={`flex-1 py-3 px-3 rounded-lg transition-all duration-300 ${
        isCurrentTurn
          ? 'bg-background-secondary border-accent-gold/30'
          : 'bg-background-tertiary/50 border-border/50'
      } border`}
      style={{
        boxShadow: isWinner ? '0 0 20px rgba(212, 175, 55, 0.15)' : undefined,
      }}
    >
      <div className="flex items-center gap-2.5">
        {/* Stone indicator */}
        <div className="relative">
          <motion.div
            animate={isThinking ? { scale: [1, 1.1, 1] } : isCurrentTurn ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: isThinking ? 0.6 : 2 }}
            className="w-7 h-7 rounded-full"
            style={{
              background: isBlack
                ? 'radial-gradient(ellipse at 35% 25%, rgba(80, 80, 85, 1) 0%, rgba(15, 15, 18, 1) 60%, rgba(5, 5, 8, 1) 100%)'
                : 'radial-gradient(ellipse at 35% 25%, rgba(255, 255, 255, 1) 0%, rgba(230, 228, 220, 1) 60%, rgba(210, 205, 195, 1) 100%)',
              boxShadow: isBlack
                ? '1px 2px 4px rgba(0, 0, 0, 0.5)'
                : '1px 2px 4px rgba(0, 0, 0, 0.15)',
              border: isBlack
                ? '1px solid rgba(80, 80, 80, 0.3)'
                : '1px solid rgba(200, 200, 200, 0.5)',
            }}
          />
          {isWinner && (
            <div
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
              }}
            />
          )}
        </div>

        {/* Score info */}
        <div className="flex-1">
          <div className={`text-base font-semibold tabular-nums ${isCurrentTurn ? 'text-foreground' : 'text-foreground-secondary'}`}>
            {score.toFixed(1)}
          </div>
          <div className="text-[10px] text-foreground-muted uppercase tracking-wider font-serif">
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
                className="w-1.5 h-1.5 bg-accent-gold rounded-full"
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
      <div className="text-[10px] font-serif text-foreground-muted uppercase tracking-wider mb-1.5">
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
  const { theme } = useTheme();

  const colorStyles = {
    default: active
      ? theme === 'dark'
        ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/30'
        : 'bg-accent/10 text-accent border-accent/30'
      : '',
    green: active ? 'bg-emerald-600/20 text-emerald-500 border-emerald-500/30' : '',
    amber: active ? 'bg-amber-600/20 text-amber-500 border-amber-500/30' : '',
    rose: active ? 'bg-rose-600/20 text-rose-500 border-rose-500/30' : '',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200
        ${active
          ? colorStyles[color]
          : 'bg-background-tertiary/50 text-foreground-muted hover:bg-background-tertiary hover:text-foreground-secondary'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        border ${active ? '' : 'border-border/50'}
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
          className="w-3 h-3 border-2 border-accent-gold/30 border-t-accent-gold rounded-full"
        />
        <span className="text-xs text-accent-gold font-serif italic">Loading KataNet...</span>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className="flex items-center gap-2 mt-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
        <span className="text-xs text-emerald-500 font-serif italic">KataNet ready (~2 dan)</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 mt-2">
        <div className="w-2 h-2 bg-rose-500 rounded-full" />
        <span className="text-xs text-rose-500 font-serif italic">Failed to load</span>
      </div>
    );
  }

  return null;
}
