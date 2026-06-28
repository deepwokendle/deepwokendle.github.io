import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <span>&copy; 2026 Deepwokendle</span> |
      <Link className="underscoreAnimation privacyLink" to="/privacy">
        Privacy Policy
      </Link>
    </footer>
  );
}
