import { CellState, PlayerMark, AIDifficulty } from '../types';
import { checkBoardWinner } from './eventSourcing';

function getAvailableMoves(board: CellState[]): number[] {
  const moves: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      moves.push(i);
    }
  }
  return moves;
}

/**
 * Minimax recursive scoring
 * Human is minimizer (-10), AI is maximizer (+10)
 */
function minimax(
  board: CellState[],
  depth: number,
  isMaximizing: boolean,
  aiMark: PlayerMark,
  humanMark: PlayerMark
): number {
  const { winner } = checkBoardWinner(board);

  if (winner === aiMark) {
    return 10 - depth;
  }
  if (winner === humanMark) {
    return depth - 10;
  }
  if (winner === 'draw') {
    return 0;
  }

  const available = getAvailableMoves(board);
  if (available.length === 0) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of available) {
      board[move] = aiMark;
      const score = minimax(board, depth + 1, false, aiMark, humanMark);
      board[move] = null;
      bestScore = Math.max(bestScore, score);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of available) {
      board[move] = humanMark;
      const score = minimax(board, depth + 1, true, aiMark, humanMark);
      board[move] = null;
      bestScore = Math.min(bestScore, score);
    }
    return bestScore;
  }
}

/**
 * Finds the best move index using Minimax algorithm
 */
export function getAIMove(
  board: CellState[],
  aiMark: PlayerMark = 'O',
  difficulty: AIDifficulty = 'hard'
): number | null {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return null;

  const humanMark: PlayerMark = aiMark === 'X' ? 'O' : 'X';

  // Easy mode: mostly random
  if (difficulty === 'easy') {
    // 80% random, 20% optimal
    if (Math.random() < 0.8) {
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      return availableMoves[randomIndex];
    }
  }

  // Medium mode: 40% random mistake, 60% optimal
  if (difficulty === 'medium') {
    if (Math.random() < 0.4) {
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      return availableMoves[randomIndex];
    }
  }

  // Hard (Master Minimax): unbeatable algorithm
  let bestScore = -Infinity;
  let bestMove = availableMoves[0];

  for (const move of availableMoves) {
    board[move] = aiMark;
    const score = minimax(board, 0, false, aiMark, humanMark);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
