import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  updateDoc,
  addDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { AIDifficulty, GameData, GameEvent, GameMode, PlayerInfo, PlayerMark } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function generateShortGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit ambiguous characters like O, 0, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createNewGame(
  creator: PlayerInfo,
  mode: GameMode,
  aiDifficulty: AIDifficulty = 'hard'
): Promise<GameData> {
  const gamesRef = collection(db, 'games');
  const newGameDoc = doc(gamesRef);
  const code = generateShortGameCode();

  const gameData: GameData = {
    id: newGameDoc.id,
    code,
    mode,
    aiDifficulty,
    playerX: creator,
    playerO:
      mode === 'ai'
        ? {
            uid: 'ai-bot',
            displayName: `AI Minimax (${aiDifficulty.toUpperCase()})`,
            photoURL: null,
          }
        : null,
    status: mode === 'ai' ? 'in_progress' : 'waiting',
    winner: null,
    currentTurn: 'X',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const path = `games/${newGameDoc.id}`;
  try {
    await setDoc(newGameDoc, gameData);
    return gameData;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function findGameByCodeOrId(codeOrId: string): Promise<GameData | null> {
  const clean = codeOrId.trim().toUpperCase();

  // Try direct doc ID match first
  try {
    const docRef = doc(db, 'games', codeOrId.trim());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as GameData;
    }
  } catch {
    // continue to code query
  }

  // Try code query
  const q = query(collection(db, 'games'), where('code', '==', clean), limit(1));
  try {
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as GameData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'games');
  }
}

export async function joinGame(
  gameId: string,
  joiningPlayer: PlayerInfo
): Promise<GameData> {
  const path = `games/${gameId}`;
  const gameRef = doc(db, 'games', gameId);
  let snap;
  try {
    snap = await getDoc(gameRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (!snap.exists()) {
    throw new Error('Game not found.');
  }

  const game = snap.data() as GameData;

  // If already playerX or playerO, just return
  if (game.playerX.uid === joiningPlayer.uid) {
    return game;
  }
  if (game.playerO?.uid === joiningPlayer.uid) {
    return game;
  }

  // If slot available, join as playerO
  if (!game.playerO) {
    const updates: Partial<GameData> = {
      playerO: joiningPlayer,
      status: 'in_progress',
      updatedAt: Date.now(),
    };
    try {
      await updateDoc(gameRef, updates);
      return { ...game, ...updates };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  return game;
}

export function subscribeToGame(
  gameId: string,
  callback: (game: GameData | null) => void
): Unsubscribe {
  const path = `games/${gameId}`;
  const gameRef = doc(db, 'games', gameId);
  return onSnapshot(
    gameRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as GameData);
      } else {
        callback(null);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeToGameEvents(
  gameId: string,
  callback: (events: GameEvent[]) => void
): Unsubscribe {
  const path = `games/${gameId}/events`;
  const eventsRef = collection(db, 'games', gameId, 'events');
  return onSnapshot(
    eventsRef,
    (snapshot) => {
      const events: GameEvent[] = [];
      snapshot.forEach((d) => {
        events.push({
          id: d.id,
          ...(d.data() as Omit<GameEvent, 'id'>),
        });
      });
      // Sort by turnNumber ascending, then timestamp
      events.sort((a, b) => a.turnNumber - b.turnNumber || a.timestamp - b.timestamp);
      callback(events);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function recordMoveEvent(
  gameId: string,
  turnNumber: number,
  player: PlayerMark,
  position: number,
  uid: string
): Promise<void> {
  const eventsPath = `games/${gameId}/events`;
  const eventsRef = collection(db, 'games', gameId, 'events');
  try {
    await addDoc(eventsRef, {
      turnNumber,
      type: 'MOVE',
      player,
      position,
      uid,
      timestamp: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, eventsPath);
  }

  // Touch game doc to trigger update
  const gamePath = `games/${gameId}`;
  const gameRef = doc(db, 'games', gameId);
  try {
    await updateDoc(gameRef, {
      updatedAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, gamePath);
  }
}

export async function recordRollbackEvent(
  gameId: string,
  turnNumber: number,
  targetTurn: number,
  uid: string
): Promise<void> {
  const eventsPath = `games/${gameId}/events`;
  const eventsRef = collection(db, 'games', gameId, 'events');
  try {
    await addDoc(eventsRef, {
      turnNumber,
      type: 'ROLLBACK',
      player: 'X',
      position: -1,
      uid,
      timestamp: Date.now(),
      restoredToTurn: targetTurn,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, eventsPath);
  }

  const gamePath = `games/${gameId}`;
  const gameRef = doc(db, 'games', gameId);
  try {
    await updateDoc(gameRef, {
      status: 'in_progress',
      updatedAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, gamePath);
  }
}

export async function recordResetGameEvent(
  gameId: string,
  turnNumber: number,
  uid: string
): Promise<void> {
  const eventsPath = `games/${gameId}/events`;
  const eventsRef = collection(db, 'games', gameId, 'events');
  try {
    await addDoc(eventsRef, {
      turnNumber,
      type: 'NEW_GAME',
      player: 'X',
      position: -1,
      uid,
      timestamp: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, eventsPath);
  }

  const gamePath = `games/${gameId}`;
  const gameRef = doc(db, 'games', gameId);
  try {
    await updateDoc(gameRef, {
      status: 'in_progress',
      updatedAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, gamePath);
  }
}
