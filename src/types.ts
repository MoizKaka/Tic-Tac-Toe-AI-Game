export type PlayerMark = 'X' | 'O';

export type CellState = PlayerMark | null;

export interface PlayerInfo {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  isAnonymous?: boolean;
}

export type GameMode = 'ai' | 'multiplayer';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'waiting' | 'in_progress' | 'completed' | 'draw';

export interface GameEvent {
  id: string;
  turnNumber: number;
  type: 'MOVE' | 'ROLLBACK' | 'NEW_GAME';
  player: PlayerMark;
  position: number; // 0-8, or -1 for non-move events
  uid: string;
  timestamp: number;
  restoredToTurn?: number;
}

export interface GameData {
  id: string;
  code: string;
  mode: GameMode;
  aiDifficulty?: AIDifficulty;
  playerX: PlayerInfo;
  playerO: PlayerInfo | null;
  status: GameStatus;
  winner: PlayerMark | 'draw' | null;
  currentTurn: PlayerMark;
  createdAt: number;
  updatedAt: number;
}

export interface GameStateSnapshot {
  turnNumber: number;
  board: CellState[];
  currentTurn: PlayerMark;
  winner: PlayerMark | 'draw' | null;
  winningLine: number[] | null;
  lastMove: {
    player: PlayerMark;
    position: number;
  } | null;
  restoredFrom?: number;
}

export interface PlayerStreak {
  userId: string;
  currentStreak: number;
  bestStreak: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  lastGameId?: string;
  updatedAt: number;
}

export type ThemeMode = 'light' | 'dark' | 'neon';

export interface UserProfile {
  userId: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  theme: ThemeMode;
  updatedAt: number;
}
