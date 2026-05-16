import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/sidebar/Sidebar';
import ChatSidebar from '../components/chat/ChatSidebar';
import GameBoard from '../components/game/GameBoard';
import LoginModal from '../components/modals/LoginModal';
import SuggestMonsterModal from '../components/modals/SuggestMonsterModal';
import LoadingOverlay from '../components/common/LoadingOverlay';
import Footer from '../components/common/Footer';
import Fab from '../components/common/Fab';
import MiniSharko from '../components/common/MiniSharko';
import { useGame } from '../hooks/useGame';
import { useMonsters } from '../hooks/useMonsters';
import { useSignalR } from '../hooks/useSignalR';
import { useAuth } from '../context/AuthContext';
import type { GameMode } from '../types';

export default function GamePage() {
  const { waitForLogin } = useAuth();
  const navigate = useNavigate();
  const { monsters, loadMonsters, isLoadingMonsters } = useMonsters();
  const { messages, sendMessage, loadOlderMessages, hasMoreHistory } = useSignalR();
  const {
    randomCharacter, guesses, amountsGuessed, infiniteStreak,
    isLoading, nextResetUtc, alreadyGuessed, isDisabled, isAwaitingNext,
    initNormalMode, initInfiniteMode, guessCharacter,
  } = useGame();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<GameMode>('normal');
  const [unreadCount, setUnreadCount] = useState(0);
  const prevLastMessageIdRef = useRef<string | undefined>(undefined);

  const closeSidebars = () => { 
    setSidebarOpen(false); 
    setChatOpen(false); 
  };

  const startNormalMode = useCallback(async () => {
    closeSidebars();
    setCurrentMode('normal');
    const m = await loadMonsters();
    initNormalMode(m);
  }, [loadMonsters, initNormalMode]);

  const startInfiniteMode = useCallback(async () => {
    closeSidebars();
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

  useEffect(() => {
    startNormalMode();
  }, []);

  useEffect(() => {
    const handler = () => startInfiniteMode();
    window.addEventListener('game:initInfinite', handler);
    return () => window.removeEventListener('game:initInfinite', handler);
  }, [startInfiniteMode]);

  useEffect(() => {
    const overlay = document.getElementById('overlay');
    if (!overlay) return;
    const handler = () => closeSidebars();
    overlay.addEventListener('click', handler);
    return () => overlay.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    const anyOpen = sidebarOpen || chatOpen;
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.toggle('visible', anyOpen);
  }, [sidebarOpen, chatOpen]);

  useEffect(() => {
    if (!messages.length) return;
    const lastMsg = messages[messages.length - 1];
    const lastId = lastMsg.id ?? `${lastMsg.user}|${lastMsg.message}`;
    if (prevLastMessageIdRef.current !== undefined && lastId !== prevLastMessageIdRef.current && !chatOpen) {
      setUnreadCount(prev => prev + 1);
    }
    prevLastMessageIdRef.current = lastId;
  }, [messages]);

  const handleGuess = (monsterId: number) => {
    if (!monsters) return;
    guessCharacter(monsterId, monsters, currentMode);
  };

  const loading = isLoading || isLoadingMonsters;

  return (
    <>
      <LoadingOverlay visible={loading} />

      <div id="overlay" />

      <Header onHamburgerClick={() => { setSidebarOpen(o => !o); if (chatOpen) setChatOpen(false); }} />

      <Sidebar
        open={sidebarOpen}
        onNormalMode={startNormalMode}
        onInfiniteMode={startInfiniteMode}
        onSuggestNpc={() => { closeSidebars(); setSuggestOpen(true); }}
        onLeaderboard={() => { closeSidebars(); navigate('/leaderboard'); }}
        onMonsterIndex={() => { closeSidebars(); navigate('/monsters'); }}
        onAdminMonsters={() => { closeSidebars(); navigate('/admin/monsters'); }}
      />

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
            {monsters && (
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
                onGuess={handleGuess}
                onInitInfinite={startInfiniteMode}
              />
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

      <LoginModal />
      <SuggestMonsterModal open={suggestOpen} onClose={() => setSuggestOpen(false)} />
    </>
  );
}
