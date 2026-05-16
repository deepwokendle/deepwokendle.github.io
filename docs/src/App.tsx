import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { ConfirmDialogProvider } from './components/common/ConfirmDialog';
import GamePage from './pages/GamePage';
import PrivacyPage from './pages/PrivacyPage';
import MonsterIndexPage from './pages/MonsterIndexPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminMonstersPage from './pages/admin/AdminMonstersPage';

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoggedIn } = useAuth();
  if (!isLoggedIn || !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ConfirmDialogProvider />
      <Toaster position="top-right" toastOptions={{ style: { background: 'transparent', boxShadow: 'none', padding: 0 } }} />
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/monsters" element={<MonsterIndexPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/privacy-policies.html" element={<PrivacyPage />} />
        <Route
          path="/admin/monsters"
          element={
            <RequireAdmin>
              <AdminMonstersPage />
            </RequireAdmin>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
