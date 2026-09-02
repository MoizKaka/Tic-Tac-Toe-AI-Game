import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, RotateCcw, Eye, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { GameEvent, GameStateSnapshot, PlayerMark, ThemeMode } from '../types';

interface TurnHistoryProps {
  events: GameEvent[];
  snapshots: GameStateSnapshot[];
  selectedTurnNumber: number | null;
  onSelectTurn: (turnNumber: number | null) => void;
  onRollbackToTurn: (targetTurn: number) => void;
  isRollingBack: boolean;
  canRollback: boolean;
  theme: ThemeMode;
}

const POSITION_LABELS = [
  'Top-Left',
  'Top-Center',
  'Top-Right',
  'Middle-Left',
  'Center',
  'Middle-Right',
  'Bottom-Left',
  'Bottom-Center',
  'Bottom-Right',
];

export const TurnHistory: React.FC<TurnHistoryProps> = ({
  events,
  snapshots,
  selectedTurnNumber,
  onSelectTurn,
  onRollbackToTurn,
  isRollingBack,
  canRollback,
  theme,
}) => {
  const isDark = theme === 'dark';
  const isNeon = theme === 'neon';
  const latestTurn = snapshots[snapshots.length - 1]?.turnNumber ?? 0;
  const isViewingHistorical = selectedTurnNumber !== null && selectedTurnNumber < latestTurn;

  return (
    <div
      className={`w-full rounded-2xl p-4 transition-colors duration-200 border space-y-4 ${
        isNeon
          ? 'bg-[#060a22]/90 border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)]'
          : isDark
          ? 'bg-stone-900 border-stone-800 shadow-xl'
          : 'bg-white border-stone-200 shadow-md'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between pb-3 border-b ${
          isNeon ? 'border-cyan-500/20' : isDark ? 'border-stone-800' : 'border-stone-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <History className={`w-4 h-4 ${isNeon ? 'text-cyan-400 neon-text-glow-cyan' : isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          <h3
            className={`text-sm font-bold ${
              isNeon ? 'text-cyan-100' : isDark ? 'text-stone-100' : 'text-stone-900'
            }`}
          >
            Event-Sourced History
          </h3>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
              isNeon
                ? 'bg-[#030614] border border-cyan-500/30 text-cyan-300'
                : isDark
                ? 'bg-stone-800 text-stone-400'
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            {snapshots.length - 1} {snapshots.length === 2 ? 'Turn' : 'Turns'}
          </span>
        </div>

        {isViewingHistorical ? (
          <button
            id="resume-live-button"
            onClick={() => onSelectTurn(null)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              isNeon
                ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/35 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : isDark
                ? 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 border-blue-500/40'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Resume Live</span>
          </button>
        ) : (
          <span
            className={`text-[11px] flex items-center gap-1 font-medium ${
              isNeon ? 'text-cyan-400 neon-text-glow-cyan' : isDark ? 'text-emerald-400' : 'text-emerald-600'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isNeon ? 'bg-cyan-400' : 'bg-emerald-500'} animate-ping`}></span>
            Live Synced
          </span>
        )}
      </div>

      {/* Historical preview & Rollback Banner */}
      <AnimatePresence>
        {isViewingHistorical && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border overflow-hidden ${
              isNeon
                ? 'bg-[#04122e] border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : isDark
                ? 'bg-amber-950/40 border-amber-500/40'
                : 'bg-amber-50 border-amber-300 shadow-xs'
            }`}
          >
            <div>
              <div
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  isNeon ? 'text-cyan-200' : isDark ? 'text-amber-300' : 'text-amber-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inspecting Board at Turn #{selectedTurnNumber}</span>
              </div>
              <p
                className={`text-[11px] mt-0.5 ${
                  isNeon ? 'text-cyan-400/80' : isDark ? 'text-stone-400' : 'text-stone-600'
                }`}
              >
                You can restore the match to this exact step to replay alternative moves.
              </p>
            </div>

            <motion.button
              id="confirm-rollback-button"
              onClick={() => onRollbackToTurn(selectedTurnNumber)}
              disabled={isRollingBack || !canRollback}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 disabled:opacity-50 font-bold text-xs rounded-lg transition-all shadow-xs shrink-0 cursor-pointer ${
                isNeon
                  ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isRollingBack ? 'Restoring...' : `Roll Back to Turn #${selectedTurnNumber}`}</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Timeline List */}
      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {snapshots.map((snapshot) => {
            const isSelected =
              (selectedTurnNumber === null && snapshot.turnNumber === latestTurn) ||
              selectedTurnNumber === snapshot.turnNumber;

            const isLatest = snapshot.turnNumber === latestTurn;

            // Find corresponding event
            const event = events.find((e) => e.turnNumber === snapshot.turnNumber);

            let label = 'Match initialized';
            let badgeColor = isNeon
              ? 'bg-[#030614] border border-cyan-500/30 text-cyan-400'
              : isDark
              ? 'bg-stone-800 text-stone-400'
              : 'bg-stone-200 text-stone-600';
            let symbol = '#';

            if (snapshot.turnNumber === 0) {
              label = 'Game initialized (Empty Board)';
            } else if (event?.type === 'ROLLBACK') {
              label = `Restored state back to Turn #${event.restoredToTurn ?? 0}`;
              badgeColor = isNeon
                ? 'bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.4)]'
                : isDark
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-amber-100 text-amber-800 border border-amber-300';
              symbol = '↺';
            } else if (snapshot.lastMove) {
              const posName = POSITION_LABELS[snapshot.lastMove.position] || `pos ${snapshot.lastMove.position}`;
              label = `Player ${snapshot.lastMove.player} placed on ${posName}`;
              badgeColor =
                snapshot.lastMove.player === 'X'
                  ? isNeon
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                    : isDark
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                  : isNeon
                  ? 'bg-rose-500/25 text-rose-300 border border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                  : isDark
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-amber-100 text-amber-800 border border-amber-200';
              symbol = snapshot.lastMove.player;
            }

            return (
              <motion.div
                key={snapshot.turnNumber}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.18 }}
                onClick={() => onSelectTurn(isLatest ? null : snapshot.turnNumber)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                  isSelected
                    ? isNeon
                      ? 'bg-[#0a153d] border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : isDark
                      ? 'bg-stone-800 border-amber-500/60 text-stone-100 shadow-sm'
                      : 'bg-amber-50/90 border-amber-400 text-stone-900 shadow-xs'
                    : isNeon
                    ? 'bg-[#04081c]/60 hover:bg-[#081238] border-cyan-950 text-cyan-300/80'
                    : isDark
                    ? 'bg-stone-950/40 hover:bg-stone-800/60 border-stone-800 text-stone-300'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${badgeColor}`}
                  >
                    {symbol}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-semibold ${
                          isNeon ? 'text-cyan-100' : isDark ? 'text-stone-200' : 'text-stone-900'
                        }`}
                      >
                        {snapshot.turnNumber === 0 ? 'Start' : `Turn #${snapshot.turnNumber}`}
                      </span>
                      {isLatest && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isNeon
                              ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/50'
                              : isDark
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[11px] truncate ${
                        isNeon ? 'text-cyan-400/80' : isDark ? 'text-stone-400' : 'text-stone-500'
                      }`}
                    >
                      {label}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1 shrink-0 ${
                    isNeon ? 'text-cyan-400' : isDark ? 'text-stone-500' : 'text-stone-400'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

