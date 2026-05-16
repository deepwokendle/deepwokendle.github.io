import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { setUnauthorizedHandler } from '../services/api';
import { confirm } from '../components/common/ConfirmDialog';
import { showToast } from '../utils/toast';

const decodeRole = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (
      payload['role'] ||
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      null
    );
  } catch {
    return null;
  }
};

interface AuthContextValue {
  token: string | null;
  username: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoginModalOpen: boolean;
  isLoginMode: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
  openLoginModal: (loginMode?: boolean) => void;
  closeLoginModal: () => void;
  toggleLoginSignupMode: () => void;
  resolveLogin: (token: string, username: string) => void;
  rejectLogin: () => void;
  waitForLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const pendingResolver = useRef<((value: void) => void) | null>(null);
  const pendingRejector = useRef<((reason?: unknown) => void) | null>(null);

  const login = useCallback((newToken: string, newUsername: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    setToken(newToken);
    setUsername(newUsername);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
  }, []);

  const openLoginModal = useCallback((loginMode = true) => {
    setIsLoginMode(loginMode);
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
    if (pendingRejector.current) {
      pendingRejector.current();
      pendingResolver.current = null;
      pendingRejector.current = null;
    }
  }, []);

  const toggleLoginSignupMode = useCallback(() => {
    setIsLoginMode(prev => !prev);
  }, []);

  const resolveLogin = useCallback((newToken: string, newUsername: string) => {
    login(newToken, newUsername);
    if (pendingResolver.current) {
      pendingResolver.current();
      pendingResolver.current = null;
      pendingRejector.current = null;
    }
  }, [login]);

  const rejectLogin = useCallback(() => {
    if (pendingRejector.current) {
      pendingRejector.current();
      pendingResolver.current = null;
      pendingRejector.current = null;
    }
  }, []);

  const waitForLogin = useCallback((): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      pendingResolver.current = resolve;
      pendingRejector.current = reject;
      openLoginModal(true);
    });
  }, [openLoginModal]);

  setUnauthorizedHandler(async () => {
    const hasToken = !!localStorage.getItem('token');
    logout();
    showToast.error(hasToken ? 'Your session has expired.' : 'You are not logged in.');
    const ok = await confirm({
      title: hasToken ? 'Expired Session' : 'Not Logged In',
      message: 'Do you wish to login?',
      confirmText: 'Yes',
      cancelText: 'No',
    });
    if (ok) openLoginModal(true);
  });

  const isAdmin = !!token && decodeRole(token) === 'Admin';

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        isLoggedIn: !!token,
        isAdmin,
        isLoginModalOpen,
        isLoginMode,
        login,
        logout,
        openLoginModal,
        closeLoginModal,
        toggleLoginSignupMode,
        resolveLogin,
        rejectLogin,
        waitForLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
