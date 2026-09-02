import React from 'react';
import { motion } from 'motion/react';
import { ThemeMode } from '../types';

interface BackgroundAnimationProps {
  theme: ThemeMode;
}

interface FloatingItem {
  id: number;
  type: 'X' | 'O' | 'dot' | 'square';
  x: number; // initial percent
  y: number; // initial percent
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  rotate: number;
}

const FLOATING_ITEMS: FloatingItem[] = [
  { id: 1, type: 'X', x: 8, y: 15, size: 28, duration: 18, delay: 0, driftX: 30, driftY: -40, rotate: 45 },
  { id: 2, type: 'O', x: 85, y: 18, size: 34, duration: 22, delay: 1, driftX: -35, driftY: 35, rotate: -30 },
  { id: 3, type: 'X', x: 90, y: 70, size: 24, duration: 20, delay: 2, driftX: -25, driftY: -30, rotate: 60 },
  { id: 4, type: 'O', x: 12, y: 75, size: 30, duration: 24, delay: 0.5, driftX: 40, driftY: -25, rotate: 20 },
  { id: 5, type: 'X', x: 45, y: 8, size: 22, duration: 19, delay: 3, driftX: -20, driftY: 30, rotate: -45 },
  { id: 6, type: 'O', x: 50, y: 88, size: 26, duration: 25, delay: 1.5, driftX: 30, driftY: -35, rotate: 40 },
  { id: 7, type: 'dot', x: 25, y: 35, size: 8, duration: 14, delay: 2, driftX: 20, driftY: 20, rotate: 0 },
  { id: 8, type: 'dot', x: 75, y: 45, size: 10, duration: 16, delay: 0.8, driftX: -25, driftY: -20, rotate: 0 },
  { id: 9, type: 'square', x: 20, y: 55, size: 14, duration: 21, delay: 1.2, driftX: -15, driftY: 30, rotate: 90 },
  { id: 10, type: 'square', x: 80, y: 82, size: 16, duration: 23, delay: 2.5, driftX: 20, driftY: -25, rotate: -75 },
];

export const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const isNeon = theme === 'neon';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* 1. Large Ambient Drifting Aurora Orbs */}
      <motion.div
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -50, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute -top-24 -left-24 w-[460px] h-[460px] rounded-full blur-3xl transition-colors duration-1000 ${
          isNeon
            ? 'bg-cyan-500/25 opacity-70 mix-blend-screen'
            : isDark
            ? 'bg-blue-600/15 opacity-40 mix-blend-multiply sm:mix-blend-normal'
            : 'bg-blue-300/40 opacity-40 mix-blend-multiply sm:mix-blend-normal'
        }`}
      />

      <motion.div
        animate={{
          x: [0, -70, 40, 0],
          y: [0, 60, -40, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className={`absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full blur-3xl transition-colors duration-1000 ${
          isNeon
            ? 'bg-fuchsia-500/25 opacity-70 mix-blend-screen'
            : isDark
            ? 'bg-amber-500/15 opacity-35'
            : 'bg-amber-200/50 opacity-35'
        }`}
      />

      <motion.div
        animate={{
          x: [0, 50, -60, 0],
          y: [0, -60, 50, 0],
          scale: [0.95, 1.15, 1, 0.95],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
        className={`absolute -bottom-32 left-1/3 w-[520px] h-[520px] rounded-full blur-3xl transition-colors duration-1000 ${
          isNeon
            ? 'bg-indigo-500/25 opacity-60 mix-blend-screen'
            : isDark
            ? 'bg-indigo-600/12 opacity-30'
            : 'bg-indigo-200/40 opacity-30'
        }`}
      />

      <motion.div
        animate={{
          x: [0, -40, 50, 0],
          y: [0, 40, -30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className={`absolute bottom-10 -right-20 w-[400px] h-[400px] rounded-full blur-3xl transition-colors duration-1000 ${
          isNeon
            ? 'bg-cyan-400/20 opacity-60 mix-blend-screen'
            : isDark
            ? 'bg-emerald-600/10 opacity-25'
            : 'bg-emerald-200/35 opacity-25'
        }`}
      />

      {/* 2. Delicate Animated Grid Mesh with Moving Shimmer */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isNeon ? 'opacity-[0.12]' : isDark ? 'opacity-[0.035]' : 'opacity-[0.055]'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(to right, ${isNeon ? '#06b6d4' : isDark ? '#cbd5e1' : '#64748b'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isNeon ? '#06b6d4' : isDark ? '#cbd5e1' : '#64748b'} 1px, transparent 1px)
          `,
          backgroundSize: isNeon ? '40px 40px' : '48px 48px',
        }}
      />

      {/* Moving Light Shimmer across background */}
      <motion.div
        animate={{
          y: ['-100%', '200%'],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-x-0 h-64 pointer-events-none"
        style={{
          background: isNeon
            ? 'linear-gradient(180deg, transparent 0%, rgba(6, 182, 212, 0.18) 50%, transparent 100%)'
            : isDark
            ? 'linear-gradient(180deg, transparent 0%, rgba(245, 158, 11, 0.08) 50%, transparent 100%)'
            : 'linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.12) 50%, transparent 100%)',
        }}
      />

      {/* 3. Floating Tic-Tac-Toe Themed Particles (X, O, & geometric accents) */}
      {FLOATING_ITEMS.map((item) => (
        <motion.div
          key={item.id}
          initial={{
            x: 0,
            y: 0,
            rotate: 0,
            opacity: 0.1,
          }}
          animate={{
            x: [0, item.driftX, -item.driftX * 0.7, 0],
            y: [0, item.driftY, -item.driftY * 0.5, 0],
            rotate: [0, item.rotate, -item.rotate * 0.5, 0],
            opacity: isNeon
              ? [0.25, 0.65, 0.35, 0.25]
              : isDark
              ? [0.12, 0.28, 0.16, 0.12]
              : [0.15, 0.35, 0.2, 0.15],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: item.delay,
          }}
          style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
          }}
          className="flex items-center justify-center pointer-events-none"
        >
          {item.type === 'X' && (
            <svg
              width={item.size}
              height={item.size}
              viewBox="0 0 24 24"
              fill="none"
              stroke={isNeon ? '#00f0ff' : isDark ? '#60a5fa' : '#3b82f6'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isNeon ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]' : 'drop-shadow-xs'}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}

          {item.type === 'O' && (
            <svg
              width={item.size}
              height={item.size}
              viewBox="0 0 24 24"
              fill="none"
              stroke={isNeon ? '#ff007f' : isDark ? '#f59e0b' : '#d97706'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isNeon ? 'drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]' : 'drop-shadow-xs'}
            >
              <circle cx="12" cy="12" r="9" />
            </svg>
          )}

          {item.type === 'dot' && (
            <div
              style={{ width: item.size, height: item.size }}
              className={`rounded-full ${
                isNeon
                  ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                  : isDark
                  ? 'bg-amber-400/40'
                  : 'bg-blue-400/50'
              }`}
            />
          )}

          {item.type === 'square' && (
            <div
              style={{ width: item.size, height: item.size }}
              className={`rounded-sm border ${
                isNeon
                  ? 'border-fuchsia-400/60 bg-fuchsia-500/20 shadow-[0_0_8px_rgba(217,70,239,0.5)]'
                  : isDark
                  ? 'border-stone-600/40 bg-stone-800/20'
                  : 'border-stone-400/40 bg-stone-300/20'
              }`}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};
