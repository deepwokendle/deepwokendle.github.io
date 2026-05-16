import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  open: boolean;
  onNormalMode: () => void;
  onInfiniteMode: () => void;
  onLeaderboard: () => void;
  onMonsterIndex: () => void;
  onSuggestions: () => void;
  onAdminMonsters: () => void;
}

export default function Sidebar({
  open, onNormalMode, onInfiniteMode,
  onLeaderboard, onMonsterIndex, onSuggestions, onAdminMonsters,
}: Props) {
  const { isAdmin } = useAuth();
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <aside id="sidebar" className={open ? 'open border' : ''}>
      <nav>
        <ul id="sidebarOptions">
          <li><button onClick={onNormalMode}>Normal Mode</button></li>
          <li><button onClick={onInfiniteMode}>Infinite Mode</button></li>
          <li><button onClick={onLeaderboard}>Leaderboard</button></li>
          <li><button onClick={onMonsterIndex}>Monster Index</button></li>
          <li><button onClick={onSuggestions}>Suggestions</button></li>
          {isAdmin && (
            <li className="sidebar-admin-group">
              <button
                className="sidebar-admin-toggle"
                onClick={() => setAdminOpen(o => !o)}
              >
                Admin
                <span className={`sidebar-collapse-icon${adminOpen ? ' open' : ''}`}>▼</span>
              </button>
              {adminOpen && (
                <ul className="sidebar-admin-submenu">
                  <li><button onClick={onAdminMonsters}>Monsters</button></li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
