import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { setUnauthorizedHandler, apiRefreshToken } from '../services/api';
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

const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const REFRESH_BEFORE_MS = 5 * 60 * 1000; // refresh 5 min before expiry

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
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always-fresh ref so the setTimeout callback never closes over stale state
  const doRefreshRef = useRef<() => Promise<void>>(async () => {});

  const scheduleRefresh = useCallback((currentToken: string) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const exp = getTokenExpiry(currentToken);
    if (!exp) return;
    const delay = exp - Date.now() - REFRESH_BEFORE_MS;
    if (delay <= 0) return; // token already expired or about to — let the 401 handler deal with it
    refreshTimerRef.current = setTimeout(() => {
      doRefreshRef.current();
    }, delay);
  }, []);

  const login = useCallback((newToken: string, newUsername: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    setToken(newToken);
    setUsername(newUsername);
    scheduleRefresh(newToken);
  }, [scheduleRefresh]);

  const logout = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
  }, []);

  // Update the refresh callback on every render so it always sees fresh state
  doRefreshRef.current = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;
    try {
      const res = await apiRefreshToken(currentToken);
      if (res.ok) {
        const { token: freshToken } = await res.json();
        login(freshToken, localStorage.getItem('username') ?? '');
      }
      // If not ok (e.g. token already expired): do nothing — next request will 401 and the handler fires
    } catch {
      // Network error: do nothing, next real request will handle it
    }
  };

  // Schedule refresh on mount if a token already exists (page reload case)
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) scheduleRefresh(stored);
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    });
  }, []);

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
