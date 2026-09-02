import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { PlayerInfo, ThemeMode, UserProfile } from '../types';
import { handleFirestoreError, OperationType } from './gameService';

const LOCAL_THEME_KEY = 'ttt_selected_theme';

export function getLocalTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(LOCAL_THEME_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'neon') {
      return saved;
    }
  } catch {
    // Ignore local storage error
  }
  return 'neon';
}

export function saveLocalTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(LOCAL_THEME_KEY, theme);
  } catch {
    // Ignore local storage error
  }
}

/**
 * Fetches the user's persisted profile and theme preference from Firestore.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;

  const path = `users/${userId}`;
  const userRef = doc(db, 'users', userId);

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      if (data.theme === 'light' || data.theme === 'dark' || data.theme === 'neon') {
        saveLocalTheme(data.theme);
      }
      return data;
    }
    return null;
  } catch (error) {
    console.warn(`Could not fetch user profile from Firestore (${path}):`, error);
    return null;
  }
}

/**
 * Initializes or synchronizes the user profile in Firestore.
 * If a theme is already saved in their cloud profile, it returns the cloud theme.
 * Otherwise, it initializes the profile with their local theme preference.
 */
export async function syncUserProfile(
  user: PlayerInfo,
  fallbackTheme: ThemeMode
): Promise<ThemeMode> {
  if (!user.uid) return fallbackTheme;

  const path = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<UserProfile>;
      // If cloud already has a valid theme, respect cloud preference
      if (data.theme === 'light' || data.theme === 'dark' || data.theme === 'neon') {
        saveLocalTheme(data.theme);
        // Refresh display info if needed
        await setDoc(
          userRef,
          {
            displayName: user.displayName || 'Player',
            photoURL: user.photoURL || null,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
        return data.theme;
      }
    }

    // New profile or missing theme in cloud: persist current fallback theme
    const newProfile: UserProfile = {
      userId: user.uid,
      displayName: user.displayName || 'Player',
      photoURL: user.photoURL || null,
      theme: fallbackTheme,
      updatedAt: Date.now(),
    };

    await setDoc(userRef, newProfile, { merge: true });
    saveLocalTheme(fallbackTheme);
    return fallbackTheme;
  } catch (error) {
    console.warn(`Unable to sync user profile to Firestore (${path}):`, error);
    // Keep local fallback
    return fallbackTheme;
  }
}

/**
 * Updates the user's theme preference in Firestore and localStorage.
 */
export async function updateUserTheme(userId: string, theme: ThemeMode): Promise<void> {
  saveLocalTheme(theme);

  // If unauthenticated or no valid Firebase Auth user, persist locally only
  if (!userId || !auth.currentUser || auth.currentUser.uid !== userId) {
    return;
  }

  const path = `users/${userId}`;
  const userRef = doc(db, 'users', userId);

  try {
    await setDoc(
      userRef,
      {
        userId,
        theme,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error(`Error updating theme in Firestore (${path}):`, error);
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Real-time subscription to user profile changes (cross-device & multi-tab theme sync).
 */
export function subscribeToUserProfile(
  userId: string,
  onThemeUpdate: (theme: ThemeMode) => void
): Unsubscribe {
  if (!userId || !auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }

  const path = `users/${userId}`;
  const userRef = doc(db, 'users', userId);

  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<UserProfile>;
        if (data.theme === 'light' || data.theme === 'dark' || data.theme === 'neon') {
          saveLocalTheme(data.theme);
          onThemeUpdate(data.theme);
        }
      }
    },
    (err) => {
      console.warn(`Firestore user profile snapshot listener error for ${path}:`, err);
    }
  );
}
