import { useEffect } from 'react';
import { useLayout } from '../context/LayoutContext';

export function useOverlaySync(extraVisible = false) {
  const { sidebarOpen } = useLayout();
  useEffect(() => {
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.toggle('visible', sidebarOpen || extraVisible);
  }, [sidebarOpen, extraVisible]);
}
