import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, signInWithGoogle, signInAsGuest, logoutUser, testFirestoreConnection } from './firebase';
import { Header } from './components/Header';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';
import { MatchInfo } from './components/MatchInfo';
import { TurnHistory } from './components/TurnHistory';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { useSoundEffects } from './hooks/useSoundEffects';
import {
  createNewGame,
  findGameByCodeOrId,
  joinGame,
  subscribeToGame,
  subscribeToGameEvents,
  recordMoveEvent,
  recordRollbackEvent,
  recordResetGameEvent,
} from './services/gameService';
import { replayEvents } from './utils/eventSourcing';
import { getAIMove } from './utils/minimax';
import { subscribeToPlayerStreak, recordGameOutcome } from './services/streakService';
import {
  getLocalTheme,
  updateUserTheme,
  syncUserProfile,
  subscribeToUserProfile,
} from './services/userService';
import { AIDifficulty, GameData, GameEvent, PlayerInfo, PlayerMark, PlayerStreak, ThemeMode } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<PlayerInfo | null>(null);
  const [userStreak, setUserStreak] = useState<PlayerStreak | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => getLocalTheme());
  const soundEffects = useSoundEffects();

  const handleToggleTheme = () => {
    soundEffects.playToggle();
    setTheme((prev) => {
      const next: ThemeMode = prev === 'neon' ? 'light' : prev === 'light' ? 'dark' : 'neon';
      if (currentUser?.uid) {
        updateUserTheme(currentUser.uid, next).catch((err) =>
          console.warn('Failed to sync theme to Firestore profile:', err)
        );
      } else {
        updateUserTheme('', next);
      }
      return next;
    });
  };

  // Active game state
  const [activeGame, setActiveGame] = useState<GameData | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [selectedTurnNumber, setSelectedTurnNumber] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Reference to prevent AI double moves
  const isAiMovePending = useRef(false);

  // 1. Auth & Connection Listener
  useEffect(() => {
    testFirestoreConnection().then((connected) => setIsOnline(connected));

    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName || (user.isAnonymous ? 'Guest Player' : 'Player'),
          photoURL: user.photoURL,
          isAnonymous: user.isAnonymous,
        });
      } else {
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1.1 Subscribe to player's win streak in Firestore
  useEffect(() => {
    if (!currentUser?.uid) {
      setUserStreak(null);
      return;
    }

    const unsubStreak = subscribeToPlayerStreak(currentUser.uid, (streak) => {
      setUserStreak(streak);
    });

    return () => unsubStreak();
  }, [currentUser?.uid]);

  // 1.2 Subscribe to player's Firestore user profile and synchronize theme across devices
  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    let isSubscribed = true;

    // Pull theme from cloud profile or initialize if first time
    syncUserProfile(currentUser, theme).then((cloudTheme) => {
      if (isSubscribed && cloudTheme) {
        setTheme(cloudTheme);
      }
    });

    // Real-time listener: changes on one device/tab update others instantly
    const unsubProfile = subscribeToUserProfile(currentUser.uid, (syncedTheme) => {
      setTheme((prev) => (prev !== syncedTheme ? syncedTheme : prev));
    });

    return () => {
      isSubscribed = false;
      unsubProfile();
    };
  }, [currentUser?.uid]);

  // 2. URL parameter deep linking (?game=ID or ?code=CODE)
  useEffect(() => {
    if (isAuthLoading) return;

    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    const gameCode = params.get('code');
    const target = gameId || gameCode;

    if (target && !activeGame) {
      handleAutoJoinFromUrl(target);
    }
  }, [isAuthLoading]);

  const handleAutoJoinFromUrl = async (target: string) => {
    try {
      setIsStarting(true);
      // If user not signed in yet, auto sign in anonymously for instant play
      let user = currentUser;
      if (!user) {
        const anonUser = await signInAsGuest();
        user = {
          uid: anonUser.uid,
          displayName: 'Guest Player',
          isAnonymous: true,
        };
        setCurrentUser(user);
      }

      const game = await findGameByCodeOrId(target);
      if (game) {
        const joined = await joinGame(game.id, user);
        setActiveGame(joined);
      } else {
        setJoinError(`Could not find match for code/link: "${target}"`);
      }
    } catch (err) {
      console.error('Error auto-joining game:', err);
      setJoinError('Failed to join match from link.');
    } finally {
      setIsStarting(false);
    }
  };

  // 3. Subscriptions to Active Game & Events
  useEffect(() => {
    if (!activeGame?.id) return;

    const unsubGame = subscribeToGame(activeGame.id, (updatedGame) => {
      if (updatedGame) {
        setActiveGame(updatedGame);
      } else {
        setActiveGame(null);
      }
    });

    const unsubEvents = subscribeToGameEvents(activeGame.id, (evs) => {
      setEvents(evs);
    });

    return () => {
      unsubGame();
      unsubEvents();
    };
  }, [activeGame?.id]);

  // 4. Event Sourcing Replay Engine
  const { currentSnapshot, snapshots } = useMemo(() => {
    return replayEvents(events);
  }, [events]);

  // The board state displayed: either the historical snapshot or the current active snapshot
  const displayedSnapshot = useMemo(() => {
    if (selectedTurnNumber !== null) {
      const snap = snapshots.find((s) => s.turnNumber === selectedTurnNumber);
      if (snap) return snap;
    }
    return currentSnapshot;
  }, [selectedTurnNumber, snapshots, currentSnapshot]);

  // 5. Determine current player's mark ('X' or 'O')
  const myMark: PlayerMark | null = useMemo(() => {
    if (!currentUser || !activeGame) return null;
    if (currentUser.uid === activeGame.playerX.uid) return 'X';
    if (currentUser.uid === activeGame.playerO?.uid) return 'O';
    return null;
  }, [currentUser, activeGame]);

  // Can the current user make a move right now?
  const canMakeMove = useMemo(() => {
    if (!activeGame || !currentUser) return false;
    if (activeGame.status !== 'in_progress') return false;
    if (selectedTurnNumber !== null) return false; // In historical inspection mode
    if (currentSnapshot.winner !== null) return false;

    // In AI mode, user is X and currentTurn must be X
    if (activeGame.mode === 'ai') {
      return currentSnapshot.currentTurn === 'X' && !isAiThinking;
    }

    // In multiplayer mode, must be participant and must match currentTurn
    return myMark === currentSnapshot.currentTurn;
  }, [activeGame, currentUser, selectedTurnNumber, currentSnapshot, myMark, isAiThinking]);

  // 6. AI Move Trigger (Deterministic Minimax)
  useEffect(() => {
    if (
      !activeGame ||
      activeGame.mode !== 'ai' ||
      activeGame.status !== 'in_progress' ||
      currentSnapshot.winner !== null ||
      selectedTurnNumber !== null ||
      currentSnapshot.currentTurn !== 'O' ||
      isAiMovePending.current
    ) {
      return;
    }

    isAiMovePending.current = true;
    setIsAiThinking(true);

    const timer = setTimeout(async () => {
      try {
        const aiMove = getAIMove(
          currentSnapshot.board,
          'O',
          activeGame.aiDifficulty || 'hard'
        );

        if (aiMove !== null && activeGame) {
          const nextTurnNumber =
            events.length === 0 ? 1 : events[events.length - 1].turnNumber + 1;

          await recordMoveEvent(activeGame.id, nextTurnNumber, 'O', aiMove, 'ai-bot');
        }
      } catch (error) {
        console.error('Error making AI move:', error);
      } finally {
        isAiMovePending.current = false;
        setIsAiThinking(false);
      }
    }, 450); // Natural delay

    return () => {
      clearTimeout(timer);
      isAiMovePending.current = false;
      setIsAiThinking(false);
    };
  }, [activeGame, currentSnapshot, selectedTurnNumber, events]);

  // Audio effect triggers based on incoming game events
  const prevEventsLengthRef = useRef(0);
  const prevWinnerRef = useRef<string | null>(null);

  useEffect(() => {
    if (events.length > prevEventsLengthRef.current && events.length > 0) {
      const latestEvent = events[events.length - 1];
      if (latestEvent.type === 'MOVE' && latestEvent.player) {
        soundEffects.playMove(latestEvent.player);
      } else if (latestEvent.type === 'ROLLBACK') {
        soundEffects.playRollback();
      } else if (latestEvent.type === 'RESET') {
        soundEffects.playGameStart();
      }
    }
    prevEventsLengthRef.current = events.length;
  }, [events, soundEffects]);

  // Audio effect triggers on win / draw condition
  useEffect(() => {
    if (displayedSnapshot.winner && displayedSnapshot.winner !== prevWinnerRef.current) {
      if (displayedSnapshot.winner === 'draw') {
        soundEffects.playDraw();
      } else {
        soundEffects.playWin();
      }
    }
    prevWinnerRef.current = displayedSnapshot.winner;
  }, [displayedSnapshot.winner, soundEffects]);

  // Track player win streak in Firestore when a match finishes
  useEffect(() => {
    if (!activeGame || !currentUser?.uid) return;
    if (!currentSnapshot.winner) return;

    const isPlayerX = currentUser.uid === activeGame.playerX.uid;
    const isPlayerO = currentUser.uid === activeGame.playerO?.uid;

    // Only update stats if the current user is an active participant in this match
    if (!isPlayerX && !isPlayerO) return;

    let outcome: 'win' | 'loss' | 'draw' = 'draw';
    if (currentSnapshot.winner === 'draw') {
      outcome = 'draw';
    } else if (
      (currentSnapshot.winner === 'X' && isPlayerX) ||
      (currentSnapshot.winner === 'O' && isPlayerO)
    ) {
      outcome = 'win';
    } else {
      outcome = 'loss';
    }

    // Match signature based on game ID, turn count, and result to guarantee idempotency
    const matchSignature = `${activeGame.id}_t${currentSnapshot.turnNumber}_${currentSnapshot.winner}`;
    recordGameOutcome(currentUser.uid, matchSignature, outcome).catch((err) => {
      console.warn('Failed to record win streak in Firestore:', err);
    });
  }, [activeGame?.id, currentSnapshot.winner, currentSnapshot.turnNumber, currentUser?.uid]);

  // Handlers
  const handleGoogleSignIn = async () => {
    soundEffects.playClick();
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign-in failed:', error);
    }
  };

  const handleGuestSignIn = async () => {
    soundEffects.playClick();
    try {
      await signInAsGuest();
    } catch (error) {
      console.error('Guest sign-in failed:', error);
    }
  };

  const handleSignOut = async () => {
    soundEffects.playClick();
    try {
      await logoutUser();
      setActiveGame(null);
      setEvents([]);
      setSelectedTurnNumber(null);
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  const handleStartAIGame = async (difficulty: AIDifficulty) => {
    setJoinError(null);
    soundEffects.playGameStart();
    try {
      setIsStarting(true);
      let user = currentUser;
      if (!user) {
        const anon = await signInAsGuest();
        user = { uid: anon.uid, displayName: 'Guest Player', isAnonymous: true };
        setCurrentUser(user);
      }

      const game = await createNewGame(user, 'ai', difficulty);
      setActiveGame(game);
      setEvents([]);
      setSelectedTurnNumber(null);
    } catch (error) {
      console.error('Error starting AI game:', error);
      setJoinError(error instanceof Error ? error.message : 'Failed to start AI game.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCreateMultiplayerGame = async () => {
    setJoinError(null);
    soundEffects.playGameStart();
    try {
      setIsStarting(true);
      let user = currentUser;
      if (!user) {
        const anon = await signInAsGuest();
        user = { uid: anon.uid, displayName: 'Guest Player', isAnonymous: true };
        setCurrentUser(user);
      }

      const game = await createNewGame(user, 'multiplayer');
      setActiveGame(game);
      setEvents([]);
      setSelectedTurnNumber(null);

      // Update URL query string with game ID for easy sharing
      const url = new URL(window.location.href);
      url.searchParams.set('game', game.id);
      window.history.pushState({}, '', url.toString());
    } catch (error) {
      console.error('Error creating multiplayer game:', error);
      setJoinError(error instanceof Error ? error.message : 'Failed to create multiplayer match.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleJoinGame = async (codeOrId: string) => {
    setJoinError(null);
    soundEffects.playClick();
    try {
      setIsStarting(true);
      let user = currentUser;
      if (!user) {
        const anon = await signInAsGuest();
        user = { uid: anon.uid, displayName: 'Guest Player', isAnonymous: true };
        setCurrentUser(user);
      }

      const foundGame = await findGameByCodeOrId(codeOrId);
      if (!foundGame) {
        setJoinError(`No match found with code "${codeOrId}". Check for typos.`);
        return;
      }

      soundEffects.playGameStart();
      const joinedGame = await joinGame(foundGame.id, user);
      setActiveGame(joinedGame);
      setEvents([]);
      setSelectedTurnNumber(null);

      const url = new URL(window.location.href);
      url.searchParams.set('game', joinedGame.id);
      window.history.pushState({}, '', url.toString());
    } catch (error: any) {
      console.error('Error joining game:', error);
      setJoinError(error?.message || 'Unable to join game.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCellClick = async (position: number) => {
    if (!canMakeMove || !activeGame || !currentUser || !myMark) return;

    try {
      const nextTurnNumber =
        events.length === 0 ? 1 : events[events.length - 1].turnNumber + 1;

      await recordMoveEvent(
        activeGame.id,
        nextTurnNumber,
        myMark,
        position,
        currentUser.uid
      );
    } catch (error) {
      console.error('Error submitting move:', error);
    }
  };

  const handleRollbackToTurn = async (targetTurn: number) => {
    if (!activeGame || !currentUser || isRollingBack) return;

    try {
      setIsRollingBack(true);
      const nextTurnNumber =
        events.length === 0 ? 1 : events[events.length - 1].turnNumber + 1;

      await recordRollbackEvent(
        activeGame.id,
        nextTurnNumber,
        targetTurn,
        currentUser.uid
      );

      // Return user to live view
      setSelectedTurnNumber(null);
    } catch (error) {
      console.error('Error rolling back:', error);
    } finally {
      setIsRollingBack(false);
    }
  };

  const handleResetGame = async () => {
    if (!activeGame || !currentUser) return;

    try {
      const nextTurnNumber =
        events.length === 0 ? 1 : events[events.length - 1].turnNumber + 1;

      await recordResetGameEvent(activeGame.id, nextTurnNumber, currentUser.uid);
      setSelectedTurnNumber(null);
    } catch (error) {
      console.error('Error resetting game:', error);
    }
  };

  const handleLeaveGame = () => {
    soundEffects.playClick();
    setActiveGame(null);
    setEvents([]);
    setSelectedTurnNumber(null);

    // Clean up query param
    const url = new URL(window.location.href);
    url.searchParams.delete('game');
    url.searchParams.delete('code');
    window.history.pushState({}, '', url.toString());
  };

  const isDark = theme === 'dark';
  const isNeon = theme === 'neon';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 relative overflow-x-hidden ${
        isNeon
          ? 'bg-[#030614] text-cyan-50 selection:bg-cyan-500/30 selection:text-cyan-200'
          : isDark
          ? 'bg-stone-950 text-stone-100 selection:bg-amber-500/30 selection:text-amber-200'
          : 'bg-stone-50 text-stone-900 selection:bg-amber-500/20 selection:text-amber-900'
      }`}
    >
      {/* Moving Background Animation */}
      <BackgroundAnimation theme={theme} />

      <Header
        user={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGuestSignIn={handleGuestSignIn}
        onSignOut={handleSignOut}
        isOnline={isOnline}
        onReturnHome={handleLeaveGame}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isMuted={soundEffects.isMuted}
        onToggleMute={soundEffects.toggleMute}
      />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!activeGame ? (
            <motion.div
              key="lobby-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <Lobby
                onStartAIGame={handleStartAIGame}
                onCreateMultiplayerGame={handleCreateMultiplayerGame}
                onJoinGame={handleJoinGame}
                isStarting={isStarting}
                joinError={joinError}
                theme={theme}
              />
            </motion.div>
          ) : (
            <motion.div
              key="game-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full space-y-6"
            >
              {/* Top Match Info & Controls */}
              <MatchInfo
                game={activeGame}
                currentUser={currentUser}
                currentTurn={displayedSnapshot.currentTurn}
                winner={displayedSnapshot.winner}
                onResetGame={handleResetGame}
                onLeaveGame={handleLeaveGame}
                isAiThinking={isAiThinking}
                theme={theme}
                userStreak={userStreak}
              />

              {/* Board and Event-Sourcing Timeline Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Game Board */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center">
                  <GameBoard
                    board={displayedSnapshot.board}
                    winningLine={displayedSnapshot.winningLine}
                    onCellClick={handleCellClick}
                    canMakeMove={canMakeMove}
                    currentTurn={displayedSnapshot.currentTurn}
                    myMark={myMark}
                    isHistoricalView={selectedTurnNumber !== null}
                    historicalTurnNumber={selectedTurnNumber ?? undefined}
                    theme={theme}
                  />

                  {/* Status caption under board */}
                  <div className="mt-4 text-center">
                    {selectedTurnNumber !== null ? (
                      <p
                        className={`text-xs font-medium ${
                          isNeon ? 'text-cyan-300 neon-text-glow-cyan' : isDark ? 'text-amber-400' : 'text-amber-700'
                        }`}
                      >
                        Inspect historical board state. Click "Resume Live" or "Roll Back to Turn" to proceed.
                      </p>
                    ) : displayedSnapshot.winner ? (
                      <p
                        className={`text-xs font-medium ${
                          isNeon ? 'text-cyan-400/80' : isDark ? 'text-stone-400' : 'text-stone-600'
                        }`}
                      >
                        Match finished. Use history below to roll back, or start a new round.
                      </p>
                    ) : activeGame.status === 'waiting' ? (
                      <p
                        className={`text-xs font-medium animate-pulse ${
                          isNeon ? 'text-cyan-300 neon-text-glow-cyan' : isDark ? 'text-blue-400' : 'text-blue-600'
                        }`}
                      >
                        Waiting for player 2 to join using match code{' '}
                        <span
                          className={`font-mono font-bold ${
                            isNeon ? 'text-cyan-300 neon-text-glow-cyan' : isDark ? 'text-amber-400' : 'text-amber-600'
                          }`}
                        >
                          {activeGame.code}
                        </span>
                        ...
                      </p>
                    ) : canMakeMove ? (
                      <p
                        className={`text-xs font-semibold flex items-center justify-center gap-1.5 ${
                          isNeon ? 'text-cyan-300 neon-text-glow-cyan' : isDark ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isNeon ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]' : 'bg-emerald-500'} animate-ping`}></span>
                        Your turn to play as {myMark}! Click any available cell.
                      </p>
                    ) : (
                      <p
                        className={`text-xs ${
                          isNeon ? 'text-cyan-600' : isDark ? 'text-stone-400' : 'text-stone-600'
                        }`}
                      >
                        {isAiThinking
                          ? 'AI Minimax is computing move...'
                          : `Waiting for ${displayedSnapshot.currentTurn}'s move...`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Event Sourcing Turn History & Rollback Panel */}
                <div className="lg:col-span-5">
                  <TurnHistory
                    events={events}
                    snapshots={snapshots}
                    selectedTurnNumber={selectedTurnNumber}
                    onSelectTurn={setSelectedTurnNumber}
                    onRollbackToTurn={handleRollbackToTurn}
                    isRollingBack={isRollingBack}
                    canRollback={
                      Boolean(currentUser) &&
                      (currentUser?.uid === activeGame.playerX.uid ||
                        currentUser?.uid === activeGame.playerO?.uid ||
                        activeGame.mode === 'ai')
                    }
                    theme={theme}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer
        className={`relative z-10 border-t py-4 text-center text-xs ${
          isNeon
            ? 'border-cyan-500/20 text-cyan-500/80 bg-[#030614]/80'
            : isDark
            ? 'border-stone-900 text-stone-500'
            : 'border-stone-200 text-stone-500'
        }`}
      >
        <p>
          Event-Sourced Tic-Tac-Toe • Real-time Firestore Sync • Pure Minimax AI (Zero LLM calls)
        </p>
      </footer>
    </div>
  );
}
