import React from 'react';
import { LogIn, LogOut, User, Wifi, Sun, Moon, Zap, Volume2, VolumeX } from 'lucide-react';
import { PlayerInfo, ThemeMode } from '../types';

interface HeaderProps {
  user: PlayerInfo | null;
  onGoogleSignIn: () => void;
  onGuestSignIn: () => void;
  onSignOut: () => void;
  isOnline: boolean;
  onReturnHome?: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onGoogleSignIn,
  onGuestSignIn,
  onSignOut,
  isOnline,
  onReturnHome,
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
}) => {
  const isDark = theme === 'dark';
  const isNeon = theme === 'neon';

  return (
    <header
      className={`w-full sticky top-0 z-30 shadow-xs transition-colors duration-200 border-b ${
        isNeon
          ? 'bg-[#060919]/90 backdrop-blur border-cyan-500/30 text-cyan-50 shadow-[0_4px_25px_rgba(6,182,212,0.15)]'
          : isDark
          ? 'bg-stone-900 border-stone-800 text-stone-100'
          : 'bg-white/95 backdrop-blur border-stone-200 text-stone-900'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo / App Name */}
        <div
          onClick={onReturnHome}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xl tracking-tighter shadow-sm ${
              isNeon
                ? 'bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-amber-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                : 'bg-gradient-to-tr from-amber-500 to-amber-400 text-stone-950'
            }`}
          >
            #
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight">
              <span className={isNeon ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-400' : ''}>
                Tic-Tac-Toe
              </span>
              <span
                className={`text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded border ${
                  isNeon
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 neon-text-glow-cyan'
                    : isDark
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                Event Sourced
              </span>
            </div>
          </div>
        </div>

        {/* Right Action: Connection, Theme toggle & Auth */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Firestore status */}
          <div
            className={`hidden sm:flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${
              isOnline
                ? isNeon
                  ? 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300 neon-box-cyan'
                  : isDark
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'
                : isNeon
                ? 'bg-[#080d28] border-stone-800 text-cyan-600'
                : isDark
                ? 'bg-stone-800 border-stone-700 text-stone-400'
                : 'bg-stone-100 border-stone-200 text-stone-500'
            }`}
            title={isOnline ? 'Firebase Connected' : 'Connecting to Firebase'}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>{isOnline ? 'Firebase Online' : 'Connecting'}</span>
          </div>

          {/* Sound FX Toggle Button */}
          {onToggleMute && (
            <button
              id="sound-toggle-button"
              type="button"
              onClick={onToggleMute}
              className={`p-2 rounded-xl border text-xs transition-colors flex items-center justify-center cursor-pointer ${
                isNeon
                  ? isMuted
                    ? 'bg-[#080d28] hover:bg-[#0e1642] border-cyan-500/20 text-cyan-700'
                    : 'bg-[#080d28] hover:bg-[#0e1642] border-cyan-500/40 text-cyan-400'
                  : isDark
                  ? isMuted
                    ? 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-500'
                    : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-emerald-400'
                  : isMuted
                  ? 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-400'
                  : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-emerald-600'
              }`}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              aria-label="Toggle Sound Effects"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          {/* Theme Mode Switcher with Neon Support */}
          <button
            id="theme-toggle-button"
            type="button"
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border text-xs transition-all flex items-center gap-1.5 justify-center cursor-pointer ${
              isNeon
                ? 'bg-[#091036] hover:bg-[#101a52] border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.45)]'
                : isDark
                ? 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-amber-400'
                : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-700'
            }`}
            title={
              isNeon
                ? 'Theme: Neon (Click to switch to Light)'
                : isDark
                ? 'Theme: Dark (Click to switch to Neon)'
                : 'Theme: Light (Click to switch to Dark)'
            }
            aria-label="Toggle Theme Mode"
          >
            {isNeon ? (
              <Zap className="w-4 h-4 fill-cyan-400 text-cyan-400" />
            ) : isDark ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider hidden xs:inline">
              {theme}
            </span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${
                  isNeon
                    ? 'bg-[#080d28] border-cyan-500/40 text-cyan-100'
                    : isDark
                    ? 'bg-stone-800/80 border-stone-700'
                    : 'bg-stone-100 border-stone-200'
                }`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className={`w-6 h-6 rounded-full object-cover border ${
                      isNeon ? 'border-cyan-400' : 'border-stone-400'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isNeon
                        ? 'bg-cyan-400 text-slate-950 shadow-[0_0_8px_#06b6d4]'
                        : 'bg-amber-500 text-stone-950'
                    }`}
                  >
                    {user.displayName?.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />}
                  </div>
                )}
                <span
                  className={`text-xs font-medium max-w-[120px] truncate hidden sm:inline ${
                    isNeon ? 'text-cyan-100' : isDark ? 'text-stone-200' : 'text-stone-800'
                  }`}
                >
                  {user.displayName}
                </span>
              </div>

              <button
                id="sign-out-button"
                onClick={onSignOut}
                className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
                  isNeon
                    ? 'bg-[#080d28] hover:bg-[#111c52] text-cyan-200 hover:text-cyan-50 border-cyan-500/40'
                    : isDark
                    ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border-stone-700'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 border-stone-200'
                }`}
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="google-sign-in-button"
                onClick={onGoogleSignIn}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all border ${
                  isNeon
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : isDark
                    ? 'bg-white hover:bg-stone-100 text-stone-900 border-transparent'
                    : 'bg-white hover:bg-stone-50 text-stone-900 border-stone-300 hover:border-stone-400'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Sign-In</span>
              </button>

              <button
                id="guest-sign-in-button"
                onClick={onGuestSignIn}
                className={`text-xs px-2.5 py-1.5 rounded-xl transition-colors border ${
                  isNeon
                    ? 'text-cyan-300 hover:text-cyan-100 hover:bg-[#0c143d] border-cyan-500/40'
                    : isDark
                    ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800 border-transparent'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border-stone-200'
                }`}
                title="Quick guest sign-in without Google account"
              >
                Guest
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

