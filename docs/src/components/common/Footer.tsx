import { useState } from 'react';
import PrivacyModal from './PrivacyModal';

export default function Footer() {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <PrivacyModal open={privacyOpen} closeable onClose={() => setPrivacyOpen(false)} />
      <footer className="footer">
        <span>&copy; 2026 Deepwokendle</span> |
        <button className="privacyLink privacy-link-btn" onClick={() => setPrivacyOpen(true)}>
          Privacy Policy
        </button>
      </footer>
    </>
  );
}
