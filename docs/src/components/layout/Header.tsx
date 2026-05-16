import { useAuth } from '../../context/AuthContext';

interface Props {
  onHamburgerClick: () => void;
}

export default function Header({ onHamburgerClick }: Props) {
  const { username, openLoginModal } = useAuth();

  return (
    <header id="main-header">
      <button id="hamburger" aria-label="Abrir menu" onClick={onHamburgerClick}>
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>
      <h1>DEEPWOKENDLE</h1>
      <div className="header-right">
        {username && <span className="header-username">{username}</span>}
        <button className="header-user-btn" onClick={() => openLoginModal(true)} aria-label="Login">
          <i className="fa-solid fa-user" />
        </button>
      </div>
    </header>
  );
}
