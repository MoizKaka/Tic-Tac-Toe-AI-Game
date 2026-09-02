import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Award, Medal, Sparkles, RefreshCw, User, Shield, ChevronRight } from 'lucide-react';
import { PlayerInfo, PlayerStreak, ThemeMode } from '../types';
import { subscribeToTopStreaks, getTopStreaks } from '../services/streakService';

interface TopPlayersProps {
  currentUser: PlayerInfo | null;
  userStreak: PlayerStreak | null;
  theme: ThemeMode;
  onPlayNow: () => void;
  onBackToModes?: () => void;
}

export const TopPlayers: React.FC<TopPlayersProps> = ({
  currentUser,
  userStreak,
  theme,
  onPlayNow,
  onBackToModes,
}) => {
  const [streaks, setStreaks] = useState<PlayerStreak[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'currentStreak' | 'bestStreak'>('currentStreak');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isDark = theme === 'dark';
  const isNeon = theme === 'neon';

  useEffect(() => {
    setIsLoading(true);
    // Real-time subscription to top 10 players from Firestore
    const unsubscribe = subscribeToTopStreaks(
      (data) => {
        setStreaks(data);
        setIsLoading(false);
        setIsRefreshing(false);
      },
      10,
      sortBy
    );

    return () => unsubscribe();
  }, [sortBy]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await getTopStreaks(10, sortBy);
      setStreaks(fresh);
    } catch (err) {
      console.warn('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check if current user is in the top 10
  const userRankIndex = streaks.findIndex(
    (s) => currentUser?.uid && s.userId === currentUser.uid
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border flex items-center justify-center ${
                isNeon
                  ? 'bg-amber-500/15 border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : isDark
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-amber-100 border-amber-200 text-amber-700'
              }`}
            >
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className={`text-2xl font-black tracking-tight ${
                    isNeon
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-300 to-fuchsia-400 neon-text-glow-cyan'
                      : isDark
                      ? 'text-stone-100'
                      : 'text-stone-900'
                  }`}
                >
                  Top Players
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isNeon
                      ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : isDark
                      ? 'bg-stone-800 border-stone-700 text-emerald-400'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Leaderboard
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  isNeon ? 'text-cyan-300/80' : isDark ? 'text-stone-400' : 'text-stone-500'
                }`}
              >
                Ranked by real-time win streaks in Firestore
              </p>
            </div>
          </div>
        </div>

        {/* Sort & Action controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`p-1 rounded-xl border flex items-center text-xs ${
              isNeon
                ? 'bg-[#0a0f2e] border-cyan-500/30'
                : isDark
                ? 'bg-stone-900 border-stone-800'
                : 'bg-stone-100 border-stone-200'
            }`}
          >
            <button
              id="sort-current-streak-btn"
              type="button"
              onClick={() => setSortBy('currentStreak')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                sortBy === 'currentStreak'
                  ? isNeon
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.4)] font-bold'
                    : isDark
                    ? 'bg-stone-800 text-amber-300 font-bold shadow-xs'
                    : 'bg-white text-stone-900 font-bold shadow-xs'
                  : isNeon
                  ? 'text-cyan-400/70 hover:text-cyan-200'
                  : isDark
                  ? 'text-stone-400 hover:text-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Current Streak</span>
            </button>
            <button
              id="sort-best-streak-btn"
              type="button"
              onClick={() => setSortBy('bestStreak')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                sortBy === 'bestStreak'
                  ? isNeon
                    ? 'bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/50 shadow-[0_0_10px_rgba(217,70,239,0.4)] font-bold'
                    : isDark
                    ? 'bg-stone-800 text-amber-300 font-bold shadow-xs'
                    : 'bg-white text-stone-900 font-bold shadow-xs'
                  : isNeon
                  ? 'text-cyan-400/70 hover:text-cyan-200'
                  : isDark
                  ? 'text-stone-400 hover:text-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Best Streak</span>
            </button>
          </div>

          <button
            id="refresh-leaderboard-btn"
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh Leaderboard"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isNeon
                ? 'bg-[#0a0f2e] border-cyan-500/30 text-cyan-300 hover:text-cyan-100 hover:border-cyan-400'
                : isDark
                ? 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Current User Standing Card */}
      {currentUser && (
        <div
          className={`rounded-2xl p-4 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isNeon
              ? 'bg-[#0a0f2e]/90 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
              : isDark
              ? 'bg-stone-900 border-stone-800'
              : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Player'}
                className="w-10 h-10 rounded-full border border-cyan-500/50 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                  isNeon
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                    : isDark
                    ? 'bg-stone-800 text-stone-200 border-stone-700'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                {(currentUser.displayName || 'P').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${
                    isNeon ? 'text-cyan-100' : isDark ? 'text-stone-100' : 'text-stone-900'
                  }`}
                >
                  {currentUser.displayName || 'Guest Player'}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isNeon
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                      : isDark
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  You
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  isNeon ? 'text-cyan-400/80' : isDark ? 'text-stone-400' : 'text-stone-500'
                }`}
              >
                {userRankIndex !== -1
                  ? `Ranked #${userRankIndex + 1} on the Leaderboard`
                  : 'Play more matches to enter the Top 10!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
            <div className="text-center sm:text-right">
              <div className="text-[11px] uppercase tracking-wider text-stone-400">Current</div>
              <div
                className={`text-base font-extrabold flex items-center gap-1 ${
                  isNeon ? 'text-amber-300 neon-text-glow-cyan' : 'text-amber-500'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{userStreak?.currentStreak || 0} wins</span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="text-[11px] uppercase tracking-wider text-stone-400">Best</div>
              <div
                className={`text-base font-bold ${
                  isNeon ? 'text-fuchsia-300' : isDark ? 'text-stone-200' : 'text-stone-700'
                }`}
              >
                {userStreak?.bestStreak || 0}
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="text-[11px] uppercase tracking-wider text-stone-400">Record</div>
              <div className="text-xs font-mono font-medium text-stone-400">
                <span className="text-emerald-400 font-bold">{userStreak?.totalWins || 0}W</span> -{' '}
                <span className="text-rose-400">{userStreak?.totalLosses || 0}L</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium Highlights (if at least 2 players exist) */}
      {!isLoading && streaks.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {streaks.slice(0, 3).map((player, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            const rankMedal = isFirst ? '🥇' : isSecond ? '🥈' : '🥉';
            const rankTitle = isFirst ? '1st Champion' : isSecond ? '2nd Place' : '3rd Place';

            const borderHighlight = isFirst
              ? isNeon
                ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] bg-gradient-to-b from-[#181a3d] to-[#0a0f2e]'
                : isDark
                ? 'border-amber-500/80 bg-stone-900/90 shadow-md shadow-amber-500/10'
                : 'border-amber-300 bg-amber-50/50 shadow-md shadow-amber-200/40'
              : isSecond
              ? isNeon
                ? 'border-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.2)] bg-[#0a0f2e]'
                : isDark
                ? 'border-stone-700 bg-stone-900'
                : 'border-stone-200 bg-white shadow-xs'
              : isNeon
              ? 'border-fuchsia-400/70 shadow-[0_0_15px_rgba(217,70,239,0.2)] bg-[#0a0f2e]'
              : isDark
              ? 'border-stone-700 bg-stone-900'
              : 'border-stone-200 bg-white shadow-xs';

            return (
              <div
                key={player.userId || idx}
                className={`rounded-2xl p-4 border flex flex-col justify-between relative transition-all ${borderHighlight}`}
              >
                {isFirst && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-stone-950 shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-stone-950" />
                    <span>Streak Leader</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xl" title={rankTitle}>
                      {rankMedal}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isFirst
                          ? 'text-amber-400'
                          : isSecond
                          ? isNeon
                            ? 'text-cyan-300'
                            : 'text-stone-400'
                          : isNeon
                          ? 'text-fuchsia-300'
                          : 'text-amber-600'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {player.photoURL ? (
                      <img
                        src={player.photoURL}
                        alt={player.displayName || 'Player'}
                        className="w-9 h-9 rounded-full object-cover border border-stone-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border ${
                          isFirst
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                            : isNeon
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                            : isDark
                            ? 'bg-stone-800 text-stone-300 border-stone-700'
                            : 'bg-stone-100 text-stone-800 border-stone-300'
                        }`}
                      >
                        {(player.displayName || 'P').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="truncate">
                      <div
                        className={`text-sm font-bold truncate ${
                          isNeon ? 'text-cyan-50' : isDark ? 'text-stone-100' : 'text-stone-900'
                        }`}
                      >
                        {player.displayName || 'Anonymous Player'}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Total {player.totalWins || 0} Wins
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-700/40 flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-medium">
                    {sortBy === 'currentStreak' ? 'Current Streak' : 'Best Streak'}
                  </span>
                  <span
                    className={`text-sm font-black flex items-center gap-1 ${
                      isFirst
                        ? isNeon
                          ? 'text-amber-300 neon-text-glow-cyan'
                          : 'text-amber-500'
                        : isNeon
                        ? 'text-cyan-300'
                        : isDark
                        ? 'text-stone-200'
                        : 'text-stone-800'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>
                      {sortBy === 'currentStreak'
                        ? player.currentStreak
                        : player.bestStreak}{' '}
                      streak
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Leaderboard Table */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isNeon
            ? 'bg-[#0a0f2e]/90 border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)]'
            : isDark
            ? 'bg-stone-900 border-stone-800 shadow-lg'
            : 'bg-white border-stone-200 shadow-md shadow-stone-200/50'
        }`}
      >
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isNeon ? 'border-cyan-500/20 bg-[#060a22]' : isDark ? 'border-stone-800 bg-stone-950/40' : 'border-stone-200 bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Medal className={`w-4 h-4 ${isNeon ? 'text-cyan-400' : isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <h3
              className={`text-sm font-bold uppercase tracking-wider ${
                isNeon ? 'text-cyan-200' : isDark ? 'text-stone-200' : 'text-stone-700'
              }`}
            >
              Leaderboard Standings
            </h3>
          </div>
          <span
            className={`text-xs ${
              isNeon ? 'text-cyan-400/70' : isDark ? 'text-stone-400' : 'text-stone-500'
            }`}
          >
            {streaks.length} {streaks.length === 1 ? 'Player' : 'Players'} Ranked
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className={`text-xs ${isNeon ? 'text-cyan-300' : 'text-stone-400'}`}>
              Loading latest rankings from Firestore...
            </p>
          </div>
        ) : streaks.length === 0 ? (
          <div className="py-12 px-6 text-center space-y-4">
            <div
              className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border ${
                isNeon
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : isDark
                  ? 'bg-stone-800 border-stone-700 text-stone-400'
                  : 'bg-stone-100 border-stone-200 text-stone-500'
              }`}
            >
              <Trophy className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4
                className={`text-base font-bold ${
                  isNeon ? 'text-cyan-100' : isDark ? 'text-stone-100' : 'text-stone-900'
                }`}
              >
                Be the First Champion!
              </h4>
              <p
                className={`text-xs leading-relaxed ${
                  isNeon ? 'text-cyan-300/80' : isDark ? 'text-stone-400' : 'text-stone-600'
                }`}
              >
                No players have recorded a win streak yet. Start an AI match or challenge a friend right now to claim the #1 spot!
              </p>
            </div>
            <button
              id="empty-state-play-btn"
              type="button"
              onClick={onPlayNow}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
                isNeon
                  ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
              }`}
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>Start Match Now</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-800/40">
            {streaks.map((player, index) => {
              const isCurrentUser = currentUser?.uid && player.userId === currentUser.uid;
              const isTop3 = index < 3;
              const rankIcon =
                index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

              return (
                <div
                  key={player.userId || index}
                  className={`p-3.5 sm:px-5 flex items-center justify-between gap-3 transition-colors ${
                    isCurrentUser
                      ? isNeon
                        ? 'bg-cyan-500/10 border-l-4 border-l-cyan-400'
                        : isDark
                        ? 'bg-amber-500/10 border-l-4 border-l-amber-500'
                        : 'bg-amber-50 border-l-4 border-l-amber-500'
                      : isNeon
                      ? 'hover:bg-cyan-500/5'
                      : isDark
                      ? 'hover:bg-stone-800/50'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  {/* Left: Rank & Player info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-7 text-center font-bold text-sm ${
                        isTop3
                          ? 'text-base'
                          : isNeon
                          ? 'text-cyan-400/80 font-mono text-xs'
                          : isDark
                          ? 'text-stone-400 font-mono text-xs'
                          : 'text-stone-500 font-mono text-xs'
                      }`}
                    >
                      {rankIcon}
                    </div>

                    {player.photoURL ? (
                      <img
                        src={player.photoURL}
                        alt={player.displayName || 'Player'}
                        className="w-9 h-9 rounded-full object-cover border border-stone-700/60 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                          isCurrentUser
                            ? isNeon
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                              : 'bg-amber-500/20 text-amber-400 border-amber-400'
                            : isNeon
                            ? 'bg-stone-800 text-cyan-200 border-cyan-950'
                            : isDark
                            ? 'bg-stone-800 text-stone-300 border-stone-700'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {(player.displayName || 'P').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold truncate ${
                            isNeon ? 'text-cyan-50' : isDark ? 'text-stone-100' : 'text-stone-900'
                          }`}
                        >
                          {player.displayName || 'Player'}
                        </span>
                        {isCurrentUser && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              isNeon
                                ? 'bg-cyan-400 text-stone-950'
                                : 'bg-amber-500 text-stone-950'
                            }`}
                          >
                            You
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[11px] truncate flex items-center gap-2 ${
                          isNeon ? 'text-cyan-400/70' : isDark ? 'text-stone-400' : 'text-stone-500'
                        }`}
                      >
                        <span>
                          Best: <strong className="font-semibold">{player.bestStreak || 0}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          {player.totalWins || 0}W / {(player.totalLosses || 0) + (player.totalWins || 0) + (player.totalDraws || 0)} matches
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Streak metric */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-sm sm:text-base font-extrabold flex items-center justify-end gap-1 ${
                          isNeon
                            ? 'text-amber-300 neon-text-glow-cyan'
                            : isDark
                            ? 'text-amber-400'
                            : 'text-amber-600'
                        }`}
                      >
                        <Flame className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                        <span>{player.currentStreak || 0}</span>
                      </div>
                      <div
                        className={`text-[10px] uppercase font-semibold ${
                          isNeon ? 'text-cyan-400/70' : isDark ? 'text-stone-500' : 'text-stone-400'
                        }`}
                      >
                        Streak
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Navigation CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {onBackToModes && (
          <button
            id="back-to-modes-btn"
            type="button"
            onClick={onBackToModes}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isNeon
                ? 'bg-[#0a0f2e] border-cyan-500/40 text-cyan-200 hover:bg-[#121a4f]'
                : isDark
                ? 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            ← Back to Game Modes
          </button>
        )}

        <button
          id="leaderboard-play-cta-btn"
          type="button"
          onClick={onPlayNow}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isNeon
              ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)]'
              : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20'
          }`}
        >
          <Flame className="w-4 h-4 fill-current" />
          <span>Play Match to Increase Streak</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
