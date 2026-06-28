import PrivacyContent from './PrivacyContent';

interface Props {
  open: boolean;
  closeable?: boolean;
  onClose?: () => void;
}

export default function PrivacyModal({ open, closeable = true, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="privacy-modal-overlay"
      onClick={closeable ? onClose : undefined}
    >
      <div className="privacy-modal border" onClick={e => e.stopPropagation()}>
        {closeable && (
          <button className="privacy-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        )}
        <PrivacyContent />
      </div>
    </div>
  );
}
