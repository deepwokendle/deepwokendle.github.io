import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatSidebar from '../components/chat/ChatSidebar';
import GameBoard from '../components/game/GameBoard';
import LoadingOverlay from '../components/common/LoadingOverlay';
import GameSkeleton from '../components/common/GameSkeleton';
import Footer from '../components/common/Footer';
import Fab from '../components/common/Fab';
import MiniSharko from '../components/common/MiniSharko';
import { useGame } from '../hooks/useGame';
import { useMonsters } from '../hooks/useMonsters';
import { useSignalR } from '../hooks/useSignalR';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { useOverlaySync } from '../hooks/useOverlaySync';
import type { GameMode } from '../types';

export default function GamePage() {
  const { waitForLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const { sidebarOpen, setSidebarOpen } = useLayout();
  const { monsters, loadMonsters } = useMonsters();
  const { messages, sendMessage, loadOlderMessages, hasMoreHistory } = useSignalR();
  const {
    randomCharacter, guesses, amountsGuessed, infiniteStreak,
    isLoading, nextResetUtc, alreadyGuessed, isDisabled, isAwaitingNext,
    infiniteResult, initNormalMode, initInfiniteMode, guessCharacter,
  } = useGame();

  const [chatOpen, setChatOpen] = useState(false);
  const chatOpenRef = useRef(false);
  const [currentMode, setCurrentMode] = useState<GameMode>('normal');
  const [unreadCount, setUnreadCount] = useState(0);
  const prevLastMessageIdRef = useRef<string | undefined>(undefined);
  const modeRef = useRef<string | null | undefined>(undefined);

  useOverlaySync(chatOpen);

  const startNormalMode = useCallback(async () => {
    setCurrentMode('normal');
    const m = await loadMonsters();
    initNormalMode(m);
  }, [loadMonsters, initNormalMode]);

  const startInfiniteMode = useCallback(async () => {
    setCurrentMode('infinite');
    const m = await loadMonsters();
    const needsLogin = await initInfiniteMode(m);
    if (needsLogin) {
      try {
        await waitForLogin();
        initInfiniteMode(m);
      } catch {
        // user dismissed the login modal
      }
    }
  }, [loadMonsters, initInfiniteMode, waitForLogin]);

  // initialize on mount and react to URL mode param changes
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (modeRef.current === mode) return;
    modeRef.current = mode;
    if (mode === 'infinite') {
      startInfiniteMode();
    } else {
      startNormalMode();
    }
  }, [searchParams, startNormalMode, startInfiniteMode]);

  // game:initInfinite event fires from within the game UI to re-initialize infinite mode
  useEffect(() => {
    const handler = () => startInfiniteMode();
    window.addEventListener('game:initInfinite', handler);
    return () => window.removeEventListener('game:initInfinite', handler);
  }, [startInfiniteMode]);

  // overlay click closes chat (AppLayout handles closing sidebar)
  useEffect(() => {
    const overlay = document.getElementById('overlay');
    if (!overlay) return;
    const handler = () => setChatOpen(false);
    overlay.addEventListener('click', handler);
    return () => overlay.removeEventListener('click', handler);
  }, []);

  // sidebar opening should close chat
  useEffect(() => {
    if (sidebarOpen) setChatOpen(false);
  }, [sidebarOpen]);

  useEffect(() => { chatOpenRef.current = chatOpen; }, [chatOpen]);

  useEffect(() => {
    if (!messages.length) return;
    const lastMsg = messages[messages.length - 1];
    const lastId = lastMsg.id ?? `${lastMsg.user}|${lastMsg.message}`;
    if (prevLastMessageIdRef.current !== undefined && lastId !== prevLastMessageIdRef.current && !chatOpenRef.current && !lastMsg.isSystem) {
      setUnreadCount(prev => prev + 1);
    }
    prevLastMessageIdRef.current = lastId;
  }, [messages]);

  const handleGuess = (monsterId: number) => {
    if (!monsters) return;
    guessCharacter(monsterId, monsters, currentMode);
  };

  return (
    <>
      <LoadingOverlay visible={isLoading && !!monsters} />

      <ChatSidebar
        open={chatOpen}
        messages={messages}
        onSendMessage={sendMessage}
        loadOlderMessages={loadOlderMessages}
        hasMoreHistory={hasMoreHistory}
      />

      <div className="ad-layout">
        <div className="ad-side" />
        <section id="mainGame">
          <div id="container" className="border">
            {monsters ? (
              <GameBoard
                mode={currentMode}
                guesses={guesses}
                randomCharacter={randomCharacter}
                amountsGuessed={amountsGuessed}
                infiniteStreak={infiniteStreak}
                isDisabled={isDisabled}
                isAwaitingNext={isAwaitingNext}
                alreadyGuessed={alreadyGuessed}
                nextResetUtc={nextResetUtc}
                monsters={monsters}
                infiniteResult={infiniteResult}
                onGuess={handleGuess}
                onInitInfinite={startInfiniteMode}
              />
            ) : (
              <GameSkeleton />
            )}
          </div>
        </section>
        <div className="ad-side" />
      </div>

      <div className="chat-container">
        <button
          className="chat-main"
          id="chatButton"
          aria-label="Chat"
          onClick={() => {
            setChatOpen(o => {
              if (!o) setUnreadCount(0);
              return !o;
            });
            if (sidebarOpen) setSidebarOpen(false);
          }}
        >
          <i className="far fa-comment" />
          {unreadCount > 0 && (
            <span className="chat-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      </div>

      <Footer />
      <Fab />
      <MiniSharko />
    </>
  );
}
