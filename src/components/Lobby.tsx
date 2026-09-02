import React, { useState } from 'react';
import { Bot, Users, Play, ArrowRight, ShieldCheck, History, Sparkles } from 'lucide-react';
import { AIDifficulty, GameMode, ThemeMode } from '../types';

interface LobbyProps {
  onStartAIGame: (difficulty: AIDifficulty) => void;
  onCreateMultiplayerGame: () => void;
  onJoinGame: (codeOrId: string) => void;
  isStarting: boolean;
  joinError: string | null;
  theme: ThemeMode;
}

export const Lobby: React.FC<LobbyProps> = ({
  onStartAIGame,
  onCreateMultiplayerGame,
  onJoinGame,
  isStarting,
  joinError,
  theme,
}) => {
  const [difficulty, setDifficulty] = useState<AIDifficulty>('hard');
  const [joinCode, setJoinCode] = useState('');
  const isDark = theme === 'dark';
  const isNeon = theme === 'neon';

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      onJoinGame(joinCode.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Welcome */}
      <div className="text-center space-y-3">
        <h1
          className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            isNeon
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-amber-300 neon-text-glow-cyan'
              : isDark
              ? 'text-stone-100'
              : 'text-stone-900'
          }`}
        >
          Tic-Tac-Toe
        </h1>
        <p
          className={`text-sm sm:text-base max-w-xl mx-auto leading-relaxed ${
            isNeon ? 'text-cyan-100/90' : isDark ? 'text-stone-400' : 'text-stone-600'
          }`}
        >
          Play against a deterministic{' '}
          <strong
            className={
              isNeon
                ? 'text-fuchsia-300 font-semibold neon-text-glow-magenta'
                : isDark
                ? 'text-amber-400 font-semibold'
                : 'text-amber-700 font-semibold'
            }
          >
            Minimax AI
          </strong>{' '}
          or challenge friends via short game codes with real-time{' '}
          <strong
            className={
              isNeon
                ? 'text-cyan-300 font-semibold neon-text-glow-cyan'
                : isDark
                ? 'text-amber-400 font-semibold'
                : 'text-amber-700 font-semibold'
            }
          >
            Event Sourcing
          </strong>{' '}
          and state rollbacks.
        </p>
      </div>

      {/* Main Game Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Play vs Minimax AI */}
        <div
          className={`rounded-2xl p-6 flex flex-col justify-between transition-all border ${
            isNeon
              ? 'bg-[#0a0f2e]/90 border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:border-cyan-400/80 hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]'
              : isDark
              ? 'bg-stone-900 border-stone-800 shadow-xl hover:border-stone-700'
              : 'bg-white border-stone-200 shadow-lg shadow-stone-200/50 hover:border-stone-300'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  isNeon
                    ? 'bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.4)]'
                    : isDark
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-amber-50 border-amber-200 text-amber-600'
                }`}
              >
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2
                  className={`text-xl font-bold ${
                    isNeon ? 'text-cyan-50' : isDark ? 'text-stone-100' : 'text-stone-900'
                  }`}
                >
                  Play Against AI
                </h2>
                <p className={`text-xs ${isNeon ? 'text-cyan-400/80' : isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  Deterministic Minimax algorithm (No LLM)
                </p>
              </div>
            </div>

            <p
              className={`text-sm leading-relaxed ${
                isNeon ? 'text-cyan-100/80' : isDark ? 'text-stone-300' : 'text-stone-600'
              }`}
            >
              Test your skills against an algorithmic opponent. Select your preferred difficulty level:
            </p>

            {/* Difficulty Selector */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {(
                [
                  { id: 'easy', label: 'Casual', desc: 'Relaxed' },
                  { id: 'medium', label: 'Balanced', desc: 'Occasional mistakes' },
                  { id: 'hard', label: 'Master', desc: 'Unbeatable Minimax' },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  id={`ai-diff-${lvl.id}`}
                  type="button"
                  onClick={() => setDifficulty(lvl.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    difficulty === lvl.id
                      ? isNeon
                        ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200 font-bold shadow-[0_0_12px_rgba(217,70,239,0.5)]'
                        : isDark
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-xs'
                        : 'bg-amber-50 border-amber-400 text-amber-900 font-semibold shadow-xs'
                      : isNeon
                      ? 'bg-[#060920] border-cyan-950 text-cyan-300 hover:border-cyan-500/40 hover:text-cyan-100'
                      : isDark
                      ? 'bg-stone-800/60 border-stone-700/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <div className="text-xs font-bold">{lvl.label}</div>
                  <div
                    className={`text-[10px] truncate mt-0.5 ${
                      isNeon ? 'text-cyan-400/70' : isDark ? 'text-stone-400' : 'text-stone-500'
                    }`}
                  >
                    {lvl.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            id="start-ai-button"
            onClick={() => onStartAIGame(difficulty)}
            disabled={isStarting}
            className={`mt-6 w-full py-3 px-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isNeon
                ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 text-white shadow-[0_0_20px_rgba(217,70,239,0.6)] hover:shadow-[0_0_30px_rgba(217,70,239,0.85)]'
                : 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 shadow-md shadow-amber-500/20'
            } disabled:opacity-50`}
          >
            <Play className={`w-4 h-4 ${isNeon ? 'fill-white' : 'fill-stone-950'}`} />
            <span>{isStarting ? 'Starting Match...' : 'Start AI Match'}</span>
          </button>
        </div>

        {/* Card 2: Multiplayer with Friend */}
        <div
          className={`rounded-2xl p-6 flex flex-col justify-between transition-all border ${
            isNeon
              ? 'bg-[#0a0f2e]/90 border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:border-cyan-400/80 hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]'
              : isDark
              ? 'bg-stone-900 border-stone-800 shadow-xl hover:border-stone-700'
              : 'bg-white border-stone-200 shadow-lg shadow-stone-200/50 hover:border-stone-300'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  isNeon
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : isDark
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-blue-50 border-blue-200 text-blue-600'
                }`}
              >
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2
                  className={`text-xl font-bold ${
                    isNeon ? 'text-cyan-50' : isDark ? 'text-stone-100' : 'text-stone-900'
                  }`}
                >
                  Play with a Friend
                </h2>
                <p className={`text-xs ${isNeon ? 'text-cyan-400/80' : isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  Real-time sync via short code or share link
                </p>
              </div>
            </div>

            <p
              className={`text-sm leading-relaxed ${
                isNeon ? 'text-cyan-100/80' : isDark ? 'text-stone-300' : 'text-stone-600'
              }`}
            >
              Create a new multiplayer match to get a 6-character code, or join an existing match using your friend's code:
            </p>

            {/* Create Match button */}
            <button
              id="create-multiplayer-button"
              onClick={onCreateMultiplayerGame}
              disabled={isStarting}
              className={`w-full py-2.5 px-4 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isNeon
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.85)]'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
              } disabled:opacity-50`}
            >
              <Users className="w-4 h-4" />
              <span>Create New Multiplayer Match</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div
                className={`flex-grow border-t ${
                  isNeon ? 'border-cyan-500/20' : isDark ? 'border-stone-800' : 'border-stone-200'
                }`}
              ></div>
              <span
                className={`flex-shrink mx-3 text-xs uppercase font-medium ${
                  isNeon ? 'text-cyan-500/70' : isDark ? 'text-stone-500' : 'text-stone-400'
                }`}
              >
                Or join with code
              </span>
              <div
                className={`flex-grow border-t ${
                  isNeon ? 'border-cyan-500/20' : isDark ? 'border-stone-800' : 'border-stone-200'
                }`}
              ></div>
            </div>

            {/* Join Code Form */}
            <form onSubmit={handleJoinSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  id="game-code-input"
                  type="text"
                  placeholder="Enter 6-letter code (e.g. X9K2PW)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={16}
                  className={`flex-1 rounded-xl px-3.5 py-2 text-sm uppercase tracking-wider font-mono outline-none transition-all border ${
                    isNeon
                      ? 'bg-[#060a20] border-cyan-500/40 focus:border-cyan-300 text-cyan-100 placeholder-cyan-700/60 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : isDark
                      ? 'bg-stone-800 border-stone-700 focus:border-blue-500 text-stone-100 placeholder-stone-500'
                      : 'bg-stone-50 border-stone-300 focus:border-blue-500 text-stone-900 placeholder-stone-400'
                  }`}
                />
                <button
                  id="join-game-button"
                  type="submit"
                  disabled={!joinCode.trim() || isStarting}
                  className={`px-4 py-2 disabled:opacity-40 font-semibold text-sm rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isNeon
                      ? 'bg-[#0c1642] hover:bg-[#152366] text-cyan-200 hover:text-cyan-50 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : isDark
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border-stone-700'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 hover:text-stone-950 border-stone-300'
                  }`}
                >
                  <span>Join</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {joinError && (
                <p className="text-rose-400 text-xs mt-1 font-medium">{joinError}</p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Feature Highlights Banner */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t ${
          isNeon ? 'border-cyan-500/20' : isDark ? 'border-stone-800/80' : 'border-stone-200'
        }`}
      >
        <div
          className={`rounded-xl p-4 flex items-start gap-3 border ${
            isNeon
              ? 'bg-[#060a22]/75 border-cyan-500/30 text-cyan-100'
              : isDark
              ? 'bg-stone-900/50 border-stone-800/60'
              : 'bg-white border-stone-200 shadow-xs'
          }`}
        >
          <History className={`w-5 h-5 shrink-0 mt-0.5 ${isNeon ? 'text-cyan-400 neon-text-glow-cyan' : isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          <div>
            <h4 className={`text-xs font-bold ${isNeon ? 'text-cyan-100' : isDark ? 'text-stone-200' : 'text-stone-800'}`}>
              Event Sourced Turns
            </h4>
            <p className={`text-[11px] mt-0.5 ${isNeon ? 'text-cyan-400/80' : isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Every turn is saved as a discrete event document in Firestore subcollection.
            </p>
          </div>
        </div>

        <div
          className={`rounded-xl p-4 flex items-start gap-3 border ${
            isNeon
              ? 'bg-[#060a22]/75 border-cyan-500/30 text-cyan-100'
              : isDark
              ? 'bg-stone-900/50 border-stone-800/60'
              : 'bg-white border-stone-200 shadow-xs'
          }`}
        >
          <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${isNeon ? 'text-fuchsia-400 neon-text-glow-magenta' : isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <div>
            <h4 className={`text-xs font-bold ${isNeon ? 'text-cyan-100' : isDark ? 'text-stone-200' : 'text-stone-800'}`}>
              Time Travel & Rollback
            </h4>
            <p className={`text-[11px] mt-0.5 ${isNeon ? 'text-cyan-400/80' : isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Inspect any historical turn and restore the game state directly to that point.
            </p>
          </div>
        </div>

        <div
          className={`rounded-xl p-4 flex items-start gap-3 border ${
            isNeon
              ? 'bg-[#060a22]/75 border-cyan-500/30 text-cyan-100'
              : isDark
              ? 'bg-stone-900/50 border-stone-800/60'
              : 'bg-white border-stone-200 shadow-xs'
          }`}
        >
          <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${isNeon ? 'text-emerald-400' : isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <div>
            <h4 className={`text-xs font-bold ${isNeon ? 'text-cyan-100' : isDark ? 'text-stone-200' : 'text-stone-800'}`}>
              Pure Minimax AI
            </h4>
            <p className={`text-[11px] mt-0.5 ${isNeon ? 'text-cyan-400/80' : isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Deterministic game tree search with 0% external LLM calls for instant play.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

