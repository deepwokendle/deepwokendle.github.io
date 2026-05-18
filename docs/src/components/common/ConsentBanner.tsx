import { useState, useEffect } from 'react';
import PrivacyModal from './PrivacyModal';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const CONSENT_KEY = 'gdpr_consent_v1';

interface ConsentData {
  ads: boolean;
  analytics: boolean;
}

function applyConsent(data: ConsentData) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    ad_storage:         data.ads       ? 'granted' : 'denied',
    ad_user_data:       data.ads       ? 'granted' : 'denied',
    ad_personalization: data.ads       ? 'granted' : 'denied',
    analytics_storage:  data.analytics ? 'granted' : 'denied',
  });
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [adsOn, setAdsOn] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setVisible(true);
    } else {
      applyConsent(JSON.parse(stored) as ConsentData);
    }
  }, []);

  const save = (data: ConsentData) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...data, ts: Date.now() }));
    applyConsent(data);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <PrivacyModal open={privacyOpen} closeable onClose={() => setPrivacyOpen(false)} />
      <div className="consent-overlay">
      <div className="consent-modal border">
        {managing ? (
          <>
            <button className="consent-back" onClick={() => setManaging(false)}>
              ← Back
            </button>
            <h2 className="consent-title">Manage options</h2>
            <p className="consent-text">
              Choose which cookies you allow us to use.
            </p>
            <div className="consent-options">
              <label className="consent-option">
                <div>
                  <span className="consent-option-name">Personalized ads</span>
                  <span className="consent-option-desc">Cookies used to show ads based on your interests.</span>
                </div>
                <div className='border'>
                  <input type="checkbox" checked={adsOn} onChange={e => setAdsOn(e.target.checked)} />
                </div>
              </label>
              <label className="consent-option">
                <div>
                  <span className="consent-option-name">Analytics</span>
                  <span className="consent-option-desc">Cookies used to measure site traffic and usage.</span>
                </div>
                <div className='border'>
                  <input className='border' type="checkbox" checked={analyticsOn} onChange={e => setAnalyticsOn(e.target.checked)} />
                </div>
              </label>
            </div>
            <div className="consent-actions">
              <button className="consent-btn consent-btn--accept border" onClick={() => save({ ads: adsOn, analytics: analyticsOn })}>
                Save preferences
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="consent-title">Cookie Consent</h2>
            <p className="consent-text">
              We use cookies to serve ads and analyse site traffic. You can
              consent to all, decline, or manage your preferences individually.
            </p>
            <div className="consent-actions">
              <button className="consent-btn consent-btn--manage border" onClick={() => setManaging(true)}>
                Manage options
              </button>
              <button className="consent-btn consent-btn--deny border" onClick={() => save({ ads: false, analytics: false })}>
                Do not consent
              </button>
              <button className="consent-btn consent-btn--accept border" onClick={() => save({ ads: true, analytics: true })}>
                Consent
              </button>
            </div>
            <button className="consent-privacy-link" onClick={() => setPrivacyOpen(true)}>
              Privacy Policy
            </button>
          </>
        )}
      </div>
    </div>
    </>
  );
}
