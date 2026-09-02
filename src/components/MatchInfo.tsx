import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Share2, Users, Bot, RotateCcw, ArrowLeft, Clock, Flame, Trophy } from 'lucide-react';
import { GameData, PlayerInfo, PlayerMark, PlayerStreak, ThemeMode } from '../types';

interface MatchInfoProps {
  game: GameData;
  currentUser: PlayerInfo | null;
  currentTurn: PlayerMark;
  winner: PlayerMark | 'draw' | null;
  onResetGame: () => void;
  onLeaveGame: () => void;
  isAiThinking?: boolean;
  theme: ThemeMode;
  userStreak?: PlayerStreak | null;
}

export const MatchInfo: React.FC<MatchInfoProps> = ({
  game,
  currentUser,
  currentTurn,
  winner,
  onResetGame,
  onLeaveGame,
  isAiThinking = false,
  theme,
  userStreak,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const isDark = theme === 'dark';
  const isNeon = theme === 'neon';

  const isPlayerX = currentUser?.uid === game.playerX.uid;
  const isPlayerO = currentUser?.uid === game.playerO?.uid;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(game.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('game', game.id);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Bar: Navigation and Mode */}
      <div className="flex items-center justify-between">
        <button
          id="back-to-lobby-button"
          onClick={onLeaveGame}
          className={`flex items-center gap-1.5 text-xs transition-colors py-1.5 px-3 rounded-xl border cursor-pointer ${
            isNeon
              ? 'text-cyan-300 hover:text-cyan-50 hover:bg-[#0c143d] border-cyan-500/40'
              : isDark
              ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-900 border-transparent hover:border-stone-800'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border-stone-200'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Win Streak Count Badge */}
          <div
            id="match-win-streak-badge"
            className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-semibold transition-all ${
              userStreak && userStreak.currentStreak > 0
                ? isNeon
                  ? 'bg-gradient-to-r from-amber-500/20 to-fuchsia-500/20 border-amber-400/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                  : isDark
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-xs'
                  : 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                : isNeon
                ? 'bg-[#060a22] border-cyan-950 text-cyan-500'
                : isDark
                ? 'bg-stone-900 border-stone-800 text-stone-400'
                : 'bg-stone-100 border-stone-200 text-stone-600'
            }`}
            title={`Current win streak: ${userStreak?.currentStreak ?? 0} | Best: ${userStreak?.bestStreak ?? 0}`}
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                userStreak && userStreak.currentStreak > 0
                  ? isNeon
                    ? 'text-amber-400 fill-amber-400 shadow-[0_0_8px_#f59e0b]'
                    : 'text-amber-500 fill-amber-500'
                  : isNeon
                  ? 'text-cyan-700'
                  : isDark
                  ? 'text-stone-500'
                  : 'text-stone-400'
              }`}
            />
            <span>
              Streak:{' '}
              <strong
                className={
                  userStreak && userStreak.currentStreak > 0
                    ? isNeon
                      ? 'text-amber-300 font-extrabold neon-text-glow-amber'
                      : 'text-amber-500 font-extrabold'
                    : ''
                }
              >
                {userStreak?.currentStreak ?? 0}
              </strong>
            </span>
            {userStreak && userStreak.bestStreak > 0 && (
              <span
                className={`text-[10px] ml-0.5 font-normal ${
                  isNeon ? 'text-amber-400/70' : isDark ? 'text-stone-400' : 'text-stone-500'
                }`}
              >
                (Best: {userStreak.bestStreak})
              </span>
            )}
          </div>

          {game.mode === 'ai' ? (
            <span
              className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-medium ${
                isNeon
                  ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300 shadow-[0_0_10px_rgba(217,70,239,0.3)]'
                  : isDark
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Match ({game.aiDifficulty?.toUpperCase() || 'HARD'})</span>
            </span>
          ) : (
            <span
              className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-medium ${
                isNeon
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : isDark
                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Multiplayer Match</span>
            </span>
          )}
        </div>
      </div>

      {/* Players Card */}
      <div
        className={`grid grid-cols-2 gap-3 rounded-2xl p-4 transition-colors duration-200 border ${
          isNeon
            ? 'bg-[#070d2b]/90 border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)]'
            : isDark
            ? 'bg-stone-900 border-stone-800 shadow-lg'
            : 'bg-white border-stone-200 shadow-md'
        }`}
      >
        {/* Player X */}
        <motion.div
          animate={currentTurn === 'X' && !winner ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
            currentTurn === 'X' && !winner
              ? isNeon
                ? 'bg-[#081842] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400'
                : isDark
                ? 'bg-blue-950/40 border-blue-500/70 shadow-md shadow-blue-950/20 ring-1 ring-blue-500/40'
                : 'bg-blue-50 border-blue-400 shadow-xs ring-1 ring-blue-400/40'
              : isNeon
              ? 'bg-[#04081c]/70 border-cyan-500/20'
              : isDark
              ? 'bg-stone-950/40 border-stone-800'
              : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg font-black text-xl flex items-center justify-center shrink-0 border ${
              isNeon
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 neon-text-glow-cyan shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : isDark
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                : 'bg-blue-100 border-blue-200 text-blue-600'
            }`}
          >
            X
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p
                className={`text-xs font-bold truncate ${
                  isNeon ? 'text-cyan-100' : isDark ? 'text-stone-200' : 'text-stone-900'
                }`}
              >
                {game.playerX.displayName}
              </p>
              {isPlayerX && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isNeon
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : isDark
                      ? 'bg-stone-800 text-stone-400'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  You
                </span>
              )}
            </div>
            {isPlayerX && (
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 border ${
                    userStreak && userStreak.currentStreak > 0
                      ? isNeon
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : isDark
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                      : isNeon
                      ? 'bg-[#030614] border-cyan-950 text-cyan-500'
                      : isDark
                      ? 'bg-stone-950/60 border-stone-800 text-stone-400'
                      : 'bg-stone-100 border-stone-200 text-stone-600'
                  }`}
                >
                  <Flame
                    className={`w-2.5 h-2.5 ${
                      userStreak && userStreak.currentStreak > 0
                        ? 'text-amber-500 fill-amber-500'
                        : isDark
                        ? 'text-stone-500'
                        : 'text-stone-400'
                    }`}
                  />
                  <span>Streak: {userStreak?.currentStreak ?? 0}</span>
                </span>
              </div>
            )}
            <p className="text-[11px] flex items-center gap-1 mt-0.5">
              {currentTurn === 'X' && !winner ? (
                <span className={`${isNeon ? 'text-cyan-400 font-bold neon-text-glow-cyan' : 'text-blue-500 font-medium'} flex items-center gap-1.5`}>
                  <motion.span
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className={`w-1.5 h-1.5 rounded-full ${isNeon ? 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]' : 'bg-blue-500'}`}
                  />
                  Their Turn
                </span>
              ) : (
                <span className={isNeon ? 'text-cyan-700' : isDark ? 'text-stone-500' : 'text-stone-400'}>
                  Waiting
                </span>
              )}
            </p>
          </div>
        </motion.div>

        {/* Player O */}
        <motion.div
          animate={currentTurn === 'O' && !winner ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
            currentTurn === 'O' && !winner
              ? isNeon
                ? 'bg-[#280922] border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)] ring-1 ring-rose-400'
                : isDark
                ? 'bg-amber-950/40 border-amber-500/70 shadow-md shadow-amber-950/20 ring-1 ring-amber-500/40'
                : 'bg-amber-50 border-amber-400 shadow-xs ring-1 ring-amber-400/40'
              : isNeon
              ? 'bg-[#04081c]/70 border-cyan-500/20'
              : isDark
              ? 'bg-stone-950/40 border-stone-800'
              : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg font-black text-xl flex items-center justify-center shrink-0 border ${
              isNeon
                ? 'bg-rose-500/20 border-rose-400 text-rose-300 neon-text-glow-magenta shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                : isDark
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-amber-100 border-amber-200 text-amber-600'
            }`}
          >
            O
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p
                className={`text-xs font-bold truncate ${
                  isNeon ? 'text-rose-100' : isDark ? 'text-stone-200' : 'text-stone-900'
                }`}
              >
                {game.playerO ? game.playerO.displayName : 'Waiting for Player...'}
              </p>
              {isPlayerO && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isNeon
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : isDark
                      ? 'bg-stone-800 text-stone-400'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  You
                </span>
              )}
            </div>
            {isPlayerO && (
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 border ${
                    userStreak && userStreak.currentStreak > 0
                      ? isNeon
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : isDark
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                      : isNeon
                      ? 'bg-[#030614] border-cyan-950 text-cyan-500'
                      : isDark
                      ? 'bg-stone-950/60 border-stone-800 text-stone-400'
                      : 'bg-stone-100 border-stone-200 text-stone-600'
                  }`}
                >
                  <Flame
                    className={`w-2.5 h-2.5 ${
                      userStreak && userStreak.currentStreak > 0
                        ? 'text-amber-500 fill-amber-500'
                        : isDark
                        ? 'text-stone-500'
                        : 'text-stone-400'
                    }`}
                  />
                  <span>Streak: {userStreak?.currentStreak ?? 0}</span>
                </span>
              </div>
            )}
            <p className="text-[11px] flex items-center gap-1 mt-0.5">
              {!game.playerO ? (
                <span className={`${isNeon ? 'text-rose-400 font-semibold' : 'text-amber-500 font-medium'}`}>Slot Open</span>
              ) : currentTurn === 'O' && !winner ? (
                <span className={`${isNeon ? 'text-rose-400 font-bold neon-text-glow-magenta' : 'text-amber-500 font-medium'} flex items-center gap-1.5`}>
                  <motion.span
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className={`w-1.5 h-1.5 rounded-full ${isNeon ? 'bg-rose-400 shadow-[0_0_6px_#f43f5e]' : 'bg-amber-500'}`}
                  />
                  {isAiThinking ? 'AI Thinking...' : 'Their Turn'}
                </span>
              ) : (
                <span className={isNeon ? 'text-cyan-700' : isDark ? 'text-stone-500' : 'text-stone-400'}>
                  Waiting
                </span>
              )}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Multiplayer Join Banner if waiting for Player 2 */}
      {game.mode === 'multiplayer' && !game.playerO && (
        <div
          className={`border rounded-2xl p-4 space-y-3 ${
            isNeon
              ? 'bg-[#071033]/90 border-cyan-500/40 text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
              : isDark
              ? 'bg-gradient-to-r from-blue-950/40 to-stone-900 border-blue-500/40'
              : 'bg-blue-50/80 border-blue-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <h3
                className={`text-sm font-bold flex items-center gap-2 ${
                  isNeon ? 'text-cyan-200' : isDark ? 'text-stone-100' : 'text-stone-900'
                }`}
              >
                <Share2 className={`w-4 h-4 ${isNeon ? 'text-cyan-400' : 'text-blue-500'}`} />
                <span>Invite Player 2 to Join</span>
              </h3>
              <p className={`text-xs ${isNeon ? 'text-cyan-400/80' : isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Share this short code or copy the match link to play with a friend.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Code Box */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                isNeon
                  ? 'bg-[#04081c] border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : isDark
                  ? 'bg-stone-950 border-stone-800'
                  : 'bg-white border-stone-300 shadow-xs'
              }`}
            >
              <span
                className={`text-xs uppercase font-medium ${
                  isNeon ? 'text-cyan-500' : isDark ? 'text-stone-500' : 'text-stone-400'
                }`}
              >
                Code:
              </span>
              <span
                className={`font-mono text-base font-black tracking-widest select-all ${
                  isNeon ? 'text-cyan-300 neon-text-glow-cyan' : isDark ? 'text-amber-400' : 'text-amber-600'
                }`}
              >
                {game.code}
              </span>
              <button
                id="copy-code-button"
                onClick={handleCopyCode}
                className={`p-1 rounded-md transition-colors ml-1 cursor-pointer ${
                  isNeon
                    ? 'text-cyan-400 hover:text-cyan-100 hover:bg-[#0e1c55]'
                    : isDark
                    ? 'text-stone-400 hover:text-white hover:bg-stone-800'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                }`}
                title="Copy Game Code"
              >
                {copiedCode ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Share Link Button */}
            <button
              id="copy-link-button"
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer ${
                isNeon
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Terminal Game Status or Result Banner with Spring Animation */}
      <AnimatePresence>
        {winner && (
          <motion.div
            key="winner-banner"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className={`p-4 rounded-2xl flex items-center justify-between border shadow-lg ${
              isNeon
                ? 'bg-[#080e30]/95 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.35)]'
                : isDark
                ? 'bg-stone-900 border-stone-800'
                : 'bg-white border-stone-200'
            }`}
          >
            <div>
              <h3
                className={`text-base font-extrabold flex items-center gap-2 ${
                  isNeon ? 'text-cyan-50' : isDark ? 'text-stone-100' : 'text-stone-900'
                }`}
              >
                {winner === 'draw' ? (
                  <span className={isNeon ? 'text-cyan-300 neon-text-glow-cyan' : ''}>🤝 The match is a Draw!</span>
                ) : winner === 'X' ? (
                  <span className={isNeon ? 'text-cyan-300 neon-text-glow-cyan' : isDark ? 'text-blue-400' : 'text-blue-600'}>
                    🏆 Player X Wins!
                  </span>
                ) : (
                  <span className={isNeon ? 'text-rose-400 neon-text-glow-magenta' : isDark ? 'text-amber-400' : 'text-amber-600'}>
                    🏆 Player O Wins!
                  </span>
                )}
              </h3>
              <p className={`text-xs mt-0.5 ${isNeon ? 'text-cyan-400/80' : isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Review turns below, roll back to try another move, or restart the match.
              </p>
              {userStreak !== undefined && userStreak !== null && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-bold border ${
                      userStreak.currentStreak > 0
                        ? isNeon
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                          : isDark
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                          : 'bg-amber-50 border-amber-300 text-amber-800'
                        : isNeon
                        ? 'bg-[#04081c] border-cyan-950 text-cyan-400'
                        : isDark
                        ? 'bg-stone-950 border-stone-800 text-stone-400'
                        : 'bg-stone-100 border-stone-200 text-stone-600'
                    }`}
                  >
                    <Flame
                      className={`w-3.5 h-3.5 ${
                        userStreak.currentStreak > 0
                          ? 'text-amber-400 fill-amber-400'
                          : isNeon
                          ? 'text-cyan-600'
                          : isDark
                          ? 'text-stone-500'
                          : 'text-stone-400'
                      }`}
                    />
                    <span>
                      Your Current Streak: <strong>{userStreak.currentStreak}</strong>
                    </span>
                    {userStreak.bestStreak > 0 && (
                      <span className="opacity-75 font-normal ml-0.5">
                        (All-Time Best: {userStreak.bestStreak})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            <motion.button
              id="reset-match-button"
              onClick={onResetGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer ${
                isNeon
                  ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 text-white shadow-[0_0_18px_rgba(6,182,212,0.5)]'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Round</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

