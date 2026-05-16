import { useOverlaySync } from '../hooks/useOverlaySync';

export default function PrivacyPage() {
  useOverlaySync();

  return (
    <main id="privacy-page">
      <div id="container" className="border" style={{ position: 'relative', overflow: 'visible' }}>
        <div className="privacy-content" style={{ lineHeight: 1.6, overflowY: 'auto', maxHeight: 500, paddingRight: 10 }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 10 }}>Privacy Policy</h1>

          <p>
            <strong>Deepwokendle</strong> is a fan-made guessing game inspired by the Roblox game
            <em>Deepwoken</em>. All credit for the original game and its content goes to the respective
            creators and rights holders of <em>Deepwoken</em>. Deepwokendle is an independent project
            and is not affiliated with the original developers.
          </p>

          <h2 style={{ fontSize: '1.3rem', marginTop: 20, marginBottom: 8 }}>Advertising</h2>
          <p>
            We use <strong>Google AdSense</strong> to display advertisements on this site. Google and
            other third-party advertising providers may use cookies and similar technologies to serve and
            personalize ads. You can opt out of personalized advertising by visiting
            <a href="https://www.google.com/settings/ads" className="underscoreAnimation" target="_blank" rel="noopener noreferrer">
              Google Ads Settings
            </a>.
          </p>

          <h2 style={{ fontSize: '1.3rem', marginTop: 20, marginBottom: 8 }}>Cookies</h2>
          <p>
            Cookies are small text files stored on your device to help the site function and to improve
            your user experience. On Deepwokendle cookies may be used for basic site functionality,
            remembering simple preferences, and allowing advertising partners to deliver ads.
          </p>

          <h2 style={{ fontSize: '1.3rem', marginTop: 20, marginBottom: 8 }}>Third-Party Services &amp; Data We Collect</h2>
          <p>
            The only user-provided data we store is a <strong>username</strong> and a
            <strong>hashed password</strong>. We do not require or store email addresses, phone numbers,
            or other personally identifying information.
          </p>

          <h2 style={{ fontSize: '1.3rem', marginTop: 20, marginBottom: 8 }}>Security</h2>
          <p>
            We take basic measures to protect stored account credentials (passwords stored hashed). If
            you believe your account has been compromised, contact us immediately.
          </p>

          <h2 style={{ fontSize: '1.3rem', marginTop: 20, marginBottom: 8 }}>Contact</h2>
          <p>
            Questions? Reach me through the
            <a href="https://discord.com/invite/26VQY9ve8q" className="underscoreAnimation" target="_blank" rel="noopener noreferrer">
              Discord community
            </a>.
          </p>

          <p style={{ marginTop: 12, fontSize: '0.9rem', opacity: 0.85 }}>
            <strong>Effective date:</strong> August 17, 2025.
          </p>
        </div>
      </div>
    </main>
  );
}
