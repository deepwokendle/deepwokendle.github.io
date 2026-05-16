import { useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { apiLogin, apiRegister } from '../../services/api';
import { showToast } from '../../utils/toast';
import styles from './LoginModal.module.css';

export default function LoginModal() {
  const { isLoggedIn, username, isLoginModalOpen, isLoginMode, closeLoginModal, toggleLoginSignupMode, resolveLogin, logout } = useAuth();
  const [usernameVal, setUsernameVal] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleLogin = async () => {
    if (!usernameVal || !password) return;
    setLoading(true);
    try {
      const res = await apiLogin(usernameVal, password);
      if (!res.ok) throw new Error('Invalid username or password.');
      const result = await res.json();
      resolveLogin(result.token, result.user?.username ?? usernameVal);
      closeLoginModal();
      showToast.success('Login successful!');
    } catch (err: any) {
      Swal.fire({ title: 'Error!', text: err.message, icon: 'error', confirmButtonText: 'Okay!', showCloseButton: true });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await apiRegister(usernameVal, password);
      if (!res.ok) { const t = await res.text(); throw new Error(t || 'Registration failed.'); }
      Swal.fire({ icon: 'success', title: 'Registration successful!', text: 'You can now log in.', confirmButtonText: 'Great!', showCloseButton: true });
      toggleLoginSignupMode();
    } catch (err: any) {
      showToast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Escape') closeLoginModal(); };

  return (
    <div className="modal-overlay show" onKeyDown={handleKey} onClick={closeLoginModal}>
      <div className={`border ${styles.card}`} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={closeLoginModal}>✕</button>

        {!isLoggedIn ? (
          <>
            <p className={styles.heading}>{isLoginMode ? 'Login' : 'Sign Up'}</p>
            <div className={styles.divider} />

            <div className={styles.field}>
              <input
                className={`border ${styles.input}`}
                type="text"
                placeholder="Username"
                value={usernameVal}
                onChange={e => setUsernameVal(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <input
                className={`border ${styles.input} ${styles.inputPadRight}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') isLoginMode ? handleLogin() : handleRegister(); }}
              />
              <i
                className={`fas fa-eye${showPassword ? '-slash' : ''} ${styles.eyeIcon}`}
                onClick={() => setShowPassword(s => !s)}
              />
            </div>

            <div className={styles.btnRow}>
              <button className="btn border" onClick={isLoginMode ? handleLogin : handleRegister} disabled={loading}>
                {isLoginMode ? 'Login' : 'Sign Up'}
              </button>
              <button className="btn border" onClick={closeLoginModal}>Close</button>
            </div>

            <a onClick={toggleLoginSignupMode} className={styles.switchLink}>
              {isLoginMode ? 'Create an account →' : 'Already have an account? →'}
            </a>
          </>
        ) : (
          <div className={styles.profileWrap}>
            <i className={`fa-solid fa-user ${styles.profileIcon}`} />
            <span className={styles.profileName}>{username}</span>
            <a onClick={() => { logout(); closeLoginModal(); }} className={styles.logoutLink}>
              Logout →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
