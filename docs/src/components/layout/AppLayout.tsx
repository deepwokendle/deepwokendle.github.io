import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from '../sidebar/Sidebar';
import LoginModal from '../modals/LoginModal';
import SuggestMonsterModal from '../modals/SuggestMonsterModal';
import { useLayout } from '../../context/LayoutContext';

export default function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } = useLayout();
  const [suggestOpen, setSuggestOpen] = useState(false);

  // close sidebar when overlay is clicked (chat/other closers register their own listeners)
  useEffect(() => {
    const overlay = document.getElementById('overlay');
    if (!overlay) return;
    const handler = () => setSidebarOpen(false);
    overlay.addEventListener('click', handler);
    return () => overlay.removeEventListener('click', handler);
  }, [setSidebarOpen]);

  const close = () => setSidebarOpen(false);
  const go = (path: string) => { close(); navigate(path); };

  return (
    <>
      <div id="overlay" />

      <Header onHamburgerClick={() => setSidebarOpen(o => !o)} />

      <Sidebar
        open={sidebarOpen}
        onNormalMode={() => go('/')}
        onInfiniteMode={() => go('/?mode=infinite')}
        onLeaderboard={() => go('/leaderboard')}
        onMonsterIndex={() => go('/monsters')}
        onSuggestions={() => go('/suggestions')}
        onAdminMonsters={() => go('/admin/monsters')}
      />

      {children}

      <LoginModal />
      <SuggestMonsterModal open={suggestOpen} onClose={() => setSuggestOpen(false)} />
    </>
  );
}
