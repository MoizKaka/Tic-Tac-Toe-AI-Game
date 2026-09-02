import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { PlayerStreak } from '../types';
import { handleFirestoreError, OperationType } from './gameService';

const LOCAL_STORAGE_PREFIX = 'ttt_streak_';

function getLocalFallback(userId: string): PlayerStreak {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore storage parse errors
  }
  return {
    userId,
    displayName: userId.startsWith('guest_') ? 'Guest Player' : 'Player',
    photoURL: null,
    currentStreak: 0,
    bestStreak: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    updatedAt: Date.now(),
  };
}

function saveLocalFallback(streak: PlayerStreak): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${streak.userId}`, JSON.stringify(streak));
  } catch {
    // Ignore storage write errors
  }
}

/**
 * Ensures player streak record has latest display name and avatar.
 */
export async function syncStreakPlayerInfo(
  userId: string,
  playerInfo: { displayName?: string | null; photoURL?: string | null }
): Promise<void> {
  if (!userId) return;

  const path = `streaks/${userId}`;
  const streakRef = doc(db, 'streaks', userId);

  try {
    const snap = await getDoc(streakRef);
    if (snap.exists()) {
      const data = snap.data() as PlayerStreak;
      const needsUpdate =
        (playerInfo.displayName && data.displayName !== playerInfo.displayName) ||
        (playerInfo.photoURL && data.photoURL !== playerInfo.photoURL);

      if (needsUpdate) {
        await setDoc(
          streakRef,
          {
            displayName: playerInfo.displayName || data.displayName || 'Player',
            photoURL: playerInfo.photoURL ?? data.photoURL ?? null,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      }
    }
  } catch (error) {
    console.warn(`Could not sync player info to streak (${path}):`, error);
  }
}

/**
 * Retrieves the current streak document for a user.
 */
export async function getPlayerStreak(userId: string): Promise<PlayerStreak> {
  if (!userId) {
    return getLocalFallback('anonymous');
  }

  const path = `streaks/${userId}`;
  const streakRef = doc(db, 'streaks', userId);

  try {
    const snap = await getDoc(streakRef);
    if (snap.exists()) {
      const data = snap.data() as PlayerStreak;
      saveLocalFallback(data);
      return data;
    }

    const defaultStreak: PlayerStreak = {
      userId,
      displayName: userId.startsWith('guest_') ? 'Guest Player' : 'Player',
      photoURL: null,
      currentStreak: 0,
      bestStreak: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
      updatedAt: Date.now(),
    };
    saveLocalFallback(defaultStreak);
    return defaultStreak;
  } catch (error) {
    console.warn(`Could not fetch streak from Firestore (${error}), using local cache:`, error);
    return getLocalFallback(userId);
  }
}

/**
 * Real-time subscription to the player's streak document.
 */
export function subscribeToPlayerStreak(
  userId: string,
  callback: (streak: PlayerStreak) => void
): Unsubscribe {
  if (!userId) {
    callback(getLocalFallback('anonymous'));
    return () => {};
  }

  const path = `streaks/${userId}`;
  const streakRef = doc(db, 'streaks', userId);

  // Deliver cached value immediately for fast render
  callback(getLocalFallback(userId));

  return onSnapshot(
    streakRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as PlayerStreak;
        saveLocalFallback(data);
        callback(data);
      } else {
        const fallback = getLocalFallback(userId);
        callback(fallback);
      }
    },
    (err) => {
      console.warn(`Firestore snapshot error for streak path ${path}:`, err);
      // Fallback on local cache if permission or network issue
      callback(getLocalFallback(userId));
    }
  );
}

/**
 * Records a completed game result (win, loss, or draw) and updates the win streak.
 * Includes match signature deduplication so repetitive events don't falsely increment.
 */
export async function recordGameOutcome(
  userId: string,
  gameSignature: string,
  outcome: 'win' | 'loss' | 'draw',
  playerInfo?: { displayName?: string | null; photoURL?: string | null }
): Promise<PlayerStreak> {
  if (!userId) return getLocalFallback('anonymous');

  const path = `streaks/${userId}`;
  const streakRef = doc(db, 'streaks', userId);

  let currentData = getLocalFallback(userId);

  try {
    const snap = await getDoc(streakRef);
    if (snap.exists()) {
      currentData = snap.data() as PlayerStreak;
    }
  } catch (err) {
    console.warn('Could not read existing streak document before updating, falling back:', err);
  }

  // Deduplication: prevent the same completed match from being counted twice
  if (currentData.lastGameId === gameSignature) {
    return currentData;
  }

  let nextCurrentStreak = currentData.currentStreak || 0;
  let nextBestStreak = currentData.bestStreak || 0;
  let nextTotalWins = currentData.totalWins || 0;
  let nextTotalLosses = currentData.totalLosses || 0;
  let nextTotalDraws = currentData.totalDraws || 0;

  if (outcome === 'win') {
    nextCurrentStreak += 1;
    nextBestStreak = Math.max(nextBestStreak, nextCurrentStreak);
    nextTotalWins += 1;
  } else if (outcome === 'loss') {
    nextCurrentStreak = 0;
    nextTotalLosses += 1;
  } else if (outcome === 'draw') {
    // Draws maintain current streak without incrementing it
    nextTotalDraws += 1;
  }

  const updatedStreak: PlayerStreak = {
    userId,
    displayName:
      playerInfo?.displayName ||
      currentData.displayName ||
      (userId.startsWith('guest_') ? 'Guest Player' : 'Player'),
    photoURL: playerInfo?.photoURL ?? currentData.photoURL ?? null,
    currentStreak: nextCurrentStreak,
    bestStreak: nextBestStreak,
    totalWins: nextTotalWins,
    totalLosses: nextTotalLosses,
    totalDraws: nextTotalDraws,
    lastGameId: gameSignature,
    updatedAt: Date.now(),
  };

  saveLocalFallback(updatedStreak);

  try {
    await setDoc(streakRef, updatedStreak, { merge: true });
  } catch (error) {
    console.error('Error writing streak update to Firestore:', error);
    handleFirestoreError(error, OperationType.UPDATE, path);
  }

  return updatedStreak;
}

/**
 * Queries Firestore for users with the highest win streaks.
 */
export async function getTopStreaks(
  maxCount: number = 10,
  sortBy: 'currentStreak' | 'bestStreak' = 'currentStreak'
): Promise<PlayerStreak[]> {
  const path = 'streaks';
  try {
    const streaksQuery = query(
      collection(db, 'streaks'),
      orderBy(sortBy, 'desc'),
      limit(maxCount)
    );

    const snapshot = await getDocs(streaksQuery);
    const results: PlayerStreak[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as PlayerStreak;
      results.push(data);
    });

    return results;
  } catch (error) {
    console.warn('Error fetching top streaks from Firestore:', error);
    return [];
  }
}

/**
 * Real-time subscription to the top players leaderboard in Firestore.
 */
export function subscribeToTopStreaks(
  callback: (streaks: PlayerStreak[]) => void,
  maxCount: number = 10,
  sortBy: 'currentStreak' | 'bestStreak' = 'currentStreak'
): Unsubscribe {
  const path = 'streaks';
  try {
    const streaksQuery = query(
      collection(db, 'streaks'),
      orderBy(sortBy, 'desc'),
      limit(maxCount)
    );

    return onSnapshot(
      streaksQuery,
      (snapshot) => {
        const results: PlayerStreak[] = [];
        snapshot.forEach((docSnap) => {
          results.push(docSnap.data() as PlayerStreak);
        });
        callback(results);
      },
      (error) => {
        console.warn('Leaderboard subscription error on streaks collection:', error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    console.warn('Failed to attach leaderboard listener:', error);
    return () => {};
  }
}
