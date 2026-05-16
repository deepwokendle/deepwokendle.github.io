interface Props { visible: boolean }

export default function LoadingOverlay({ visible }: Props) {
  if (!visible) return null;
  return (
    <div id="loading-overlay" style={{ display: 'flex' }}>
      <div className="spinner" />
    </div>
  );
}
