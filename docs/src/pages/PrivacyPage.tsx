import { useOverlaySync } from '../hooks/useOverlaySync';
import PrivacyModal from '../components/common/PrivacyModal';

export default function PrivacyPage() {
  useOverlaySync();
  return <PrivacyModal open={true} closeable={false} />;
}
