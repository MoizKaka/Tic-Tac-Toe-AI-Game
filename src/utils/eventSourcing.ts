import { CellState, GameEvent, GameStateSnapshot, PlayerMark } from '../types';

export const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function checkBoardWinner(board: CellState[]): {
  winner: PlayerMark | 'draw' | null;
  winningLine: number[] | null;
} {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winningLine: combo };
    }
  }

  const isFull = board.every((cell) => cell !== null);
  if (isFull) {
    return { winner: 'draw', winningLine: null };
  }

  return { winner: null, winningLine: null };
}

export function createInitialSnapshot(): GameStateSnapshot {
  return {
    turnNumber: 0,
    board: Array(9).fill(null),
    currentTurn: 'X',
    winner: null,
    winningLine: null,
    lastMove: null,
  };
}

/**
 * Event Sourcing Replay Engine
 * Replays all past events in strict chronological sequence to reconstruct
 * the active game board state and historical step snapshots.
 */
export function replayEvents(events: GameEvent[]): {
  currentSnapshot: GameStateSnapshot;
  snapshots: GameStateSnapshot[];
} {
  // Sort events chronologically: by turnNumber ascending, then timestamp
  const sorted = [...events].sort((a, b) => {
    if (a.turnNumber !== b.turnNumber) {
      return a.turnNumber - b.turnNumber;
    }
    return a.timestamp - b.timestamp;
  });

  const snapshots: GameStateSnapshot[] = [createInitialSnapshot()];
  let currentBoard: CellState[] = Array(9).fill(null);
  let currentTurn: PlayerMark = 'X';
  let winner: PlayerMark | 'draw' | null = null;
  let winningLine: number[] | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const ev = sorted[i];

    if (ev.type === 'MOVE') {
      if (ev.position >= 0 && ev.position < 9) {
        // Apply move to new array clone
        currentBoard = [...currentBoard];
        currentBoard[ev.position] = ev.player;

        const check = checkBoardWinner(currentBoard);
        winner = check.winner;
        winningLine = check.winningLine;
        currentTurn = ev.player === 'X' ? 'O' : 'X';

        snapshots.push({
          turnNumber: ev.turnNumber,
          board: [...currentBoard],
          currentTurn,
          winner,
          winningLine,
          lastMove: {
            player: ev.player,
            position: ev.position,
          },
        });
      }
    } else if (ev.type === 'ROLLBACK') {
      const targetTurn = ev.restoredToTurn ?? 0;
      // Find the historical snapshot at targetTurn
      const targetSnapshot = snapshots.find((s) => s.turnNumber === targetTurn) || snapshots[0];

      currentBoard = [...targetSnapshot.board];
      currentTurn = targetSnapshot.currentTurn;
      winner = targetSnapshot.winner;
      winningLine = targetSnapshot.winningLine;

      snapshots.push({
        turnNumber: ev.turnNumber,
        board: [...currentBoard],
        currentTurn,
        winner,
        winningLine,
        lastMove: targetSnapshot.lastMove,
        restoredFrom: targetTurn,
      });
    } else if (ev.type === 'NEW_GAME') {
      currentBoard = Array(9).fill(null);
      currentTurn = 'X';
      winner = null;
      winningLine = null;

      snapshots.push({
        turnNumber: ev.turnNumber,
        board: [...currentBoard],
        currentTurn,
        winner,
        winningLine,
        lastMove: null,
      });
    }
  }

  const currentSnapshot = snapshots[snapshots.length - 1];
  return { currentSnapshot, snapshots };
}
