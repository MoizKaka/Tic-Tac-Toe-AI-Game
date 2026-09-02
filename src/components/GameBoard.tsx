import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CellState, PlayerMark, ThemeMode } from '../types';

interface GameBoardProps {
  board: CellState[];
  winningLine: number[] | null;
  onCellClick: (index: number) => void;
  canMakeMove: boolean;
  currentTurn: PlayerMark;
  myMark: PlayerMark | null;
  isHistoricalView: boolean;
  historicalTurnNumber?: number;
  theme: ThemeMode;
}

// Line coordinates for SVG winning stroke on a 3x3 grid (normalized 0-300 coordinates)
const WINNING_LINE_COORDS: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {
  // Rows
  '0,1,2': { x1: 20, y1: 50, x2: 280, y2: 50 },
  '3,4,5': { x1: 20, y1: 150, x2: 280, y2: 150 },
  '6,7,8': { x1: 20, y1: 250, x2: 280, y2: 250 },
  // Columns
  '0,3,6': { x1: 50, y1: 20, x2: 50, y2: 280 },
  '1,4,7': { x1: 150, y1: 20, x2: 150, y2: 280 },
  '2,5,8': { x1: 250, y1: 20, x2: 250, y2: 280 },
  // Diagonals
  '0,4,8': { x1: 25, y1: 25, x2: 275, y2: 275 },
  '2,4,6': { x1: 275, y1: 25, x2: 25, y2: 275 },
};

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  winningLine,
  onCellClick,
  canMakeMove,
  currentTurn,
  myMark,
  isHistoricalView,
  historicalTurnNumber,
  theme,
}) => {
  const isDark = theme === 'dark';
  const isNeon = theme === 'neon';

  const winningKey = winningLine ? [...winningLine].sort((a, b) => a - b).join(',') : null;
  const lineCoords = winningKey ? WINNING_LINE_COORDS[winningKey] : null;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Historical view warning banner */}
      <AnimatePresence>
        {isHistoricalView && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className={`mb-4 px-4 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 ${
              isNeon
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200 neon-box-cyan'
                : isDark
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
            }`}
          >
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`inline-block w-2 h-2 rounded-full ${isNeon ? 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]' : 'bg-amber-400'}`}
            />
            <span>Viewing Historical Snapshot (Turn #{historicalTurnNumber})</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3x3 Board Frame */}
      <div
        className={`relative p-3 rounded-3xl transition-all duration-200 ${
          isNeon
            ? 'bg-[#060b24]/90 border-2 border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)]'
            : isDark
            ? 'bg-stone-900 border-2 border-stone-800 shadow-2xl shadow-stone-950/60'
            : 'bg-white border-2 border-stone-200 shadow-xl shadow-stone-300/40'
        }`}
      >
        <div
          className={`relative grid grid-cols-3 gap-2.5 sm:gap-3 p-2 sm:p-3 rounded-2xl border ${
            isNeon
              ? 'bg-[#030614]/95 border-cyan-500/20'
              : isDark
              ? 'bg-stone-950/80 border-transparent'
              : 'bg-stone-100/90 border-transparent'
          }`}
        >
          {board.map((cell, index) => {
            const isWinningCell = winningLine?.includes(index);
            const isInteractive = canMakeMove && cell === null && !isHistoricalView;

            let cellBgClass = '';
            if (cell === null) {
              if (isInteractive) {
                cellBgClass = isNeon
                  ? 'bg-[#091138]/70 hover:bg-[#0f1d5e] border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_16px_rgba(6,182,212,0.4)] cursor-pointer group'
                  : isDark
                  ? 'bg-stone-900/90 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 cursor-pointer group'
                  : 'bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 cursor-pointer group shadow-xs';
              } else {
                cellBgClass = isNeon
                  ? 'bg-[#06091e]/40 border border-cyan-950/40 cursor-not-allowed'
                  : isDark
                  ? 'bg-stone-900/40 border border-stone-800/40 cursor-not-allowed'
                  : 'bg-stone-100/60 border border-stone-200/60 cursor-not-allowed';
              }
            } else {
              cellBgClass = isNeon
                ? cell === 'X'
                  ? 'bg-[#071333] border border-cyan-500/40 cursor-default'
                  : 'bg-[#22071a] border border-rose-500/40 cursor-default'
                : isDark
                ? 'bg-stone-900 border border-stone-800 cursor-default'
                : 'bg-white border border-stone-200 cursor-default shadow-xs';
            }

            const winningClass = isWinningCell
              ? cell === 'X'
                ? isNeon
                  ? 'border-cyan-400 bg-cyan-950/70 shadow-[0_0_25px_rgba(34,211,238,0.7)] ring-2 ring-cyan-400'
                  : isDark
                  ? 'border-blue-500 bg-blue-950/50 shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/50'
                  : 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/20 ring-2 ring-blue-500/40'
                : isNeon
                ? 'border-rose-400 bg-rose-950/70 shadow-[0_0_25px_rgba(244,63,94,0.7)] ring-2 ring-rose-400'
                : isDark
                ? 'border-amber-500 bg-amber-950/50 shadow-lg shadow-amber-500/30 ring-2 ring-amber-500/50'
                : 'border-amber-500 bg-amber-50 shadow-md shadow-amber-500/20 ring-2 ring-amber-500/40'
              : '';

            return (
              <motion.button
                key={index}
                id={`board-cell-${index}`}
                type="button"
                disabled={!isInteractive}
                onClick={() => onCellClick(index)}
                whileHover={isInteractive ? { scale: 1.04, transition: { duration: 0.12 } } : {}}
                whileTap={isInteractive ? { scale: 0.94 } : {}}
                className={`
                  relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl font-black text-4xl sm:text-5xl md:text-6xl
                  flex items-center justify-center select-none transition-all
                  ${cellBgClass}
                  ${winningClass}
                `}
              >
                {/* Cell Content with Spring Pop-In Animation */}
                <AnimatePresence mode="wait">
                  {cell === 'X' && (
                    <motion.div
                      key={`cell-${index}-X`}
                      initial={{ scale: 0, rotate: -30, opacity: 0 }}
                      animate={
                        isWinningCell
                          ? {
                              scale: [1, 1.15, 1],
                              rotate: 0,
                              opacity: 1,
                              transition: {
                                scale: { repeat: Infinity, duration: 1.3, ease: 'easeInOut' },
                              },
                            }
                          : { scale: 1, rotate: 0, opacity: 1 }
                      }
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                      className={`font-black ${
                        isNeon
                          ? 'text-cyan-300 neon-text-glow-cyan drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                          : isDark
                          ? 'text-blue-400'
                          : 'text-blue-600'
                      }`}
                    >
                      X
                    </motion.div>
                  )}

                  {cell === 'O' && (
                    <motion.div
                      key={`cell-${index}-O`}
                      initial={{ scale: 0, rotate: 30, opacity: 0 }}
                      animate={
                        isWinningCell
                          ? {
                              scale: [1, 1.15, 1],
                              rotate: 0,
                              opacity: 1,
                              transition: {
                                scale: { repeat: Infinity, duration: 1.3, ease: 'easeInOut' },
                              },
                            }
                          : { scale: 1, rotate: 0, opacity: 1 }
                      }
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                      className={`font-black ${
                        isNeon
                          ? 'text-rose-400 neon-text-glow-magenta drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                          : isDark
                          ? 'text-amber-400'
                          : 'text-amber-600'
                      }`}
                    >
                      O
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Ghost preview when hovering empty cell on player's turn */}
                {isInteractive && (
                  <span
                    className={`opacity-0 group-hover:opacity-40 transition-opacity font-black select-none pointer-events-none ${
                      isNeon ? (myMark === 'O' ? 'text-rose-400' : 'text-cyan-400') : 'text-stone-400'
                    }`}
                  >
                    {myMark || currentTurn}
                  </span>
                )}

                {/* Subtle coordinate marker */}
                <span
                  className={`absolute bottom-1 right-1.5 text-[9px] font-mono font-normal pointer-events-none select-none ${
                    isNeon ? 'text-cyan-600/50' : isDark ? 'text-stone-700' : 'text-stone-400'
                  }`}
                >
                  {index}
                </span>
              </motion.button>
            );
          })}

          {/* Animated Winning Strike-Through Line */}
          {lineCoords && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 300 300"
            >
              <defs>
                <filter id="neon-laser-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <motion.line
                x1={lineCoords.x1}
                y1={lineCoords.y1}
                x2={lineCoords.x2}
                y2={lineCoords.y2}
                stroke={
                  isNeon
                    ? board[winningLine![0]] === 'X'
                      ? '#00f0ff'
                      : '#ff007f'
                    : board[winningLine![0]] === 'X'
                    ? '#3b82f6'
                    : '#f59e0b'
                }
                strokeWidth={isNeon ? '8' : '7'}
                strokeLinecap="round"
                filter={isNeon ? 'url(#neon-laser-glow)' : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.95 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

