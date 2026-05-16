import { useState, useEffect, useRef } from 'react';
import Tooltip from './Tooltip';

export default function Fab() {
  const [open, setOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div ref={fabRef} className={`fab-container${open ? ' open' : ''}`}>
      <button className="fab-main" aria-label="More options" onClick={() => setOpen(o => !o)}>
        <span className="fab-icon">&lt;</span>
      </button>
      <div className="fab-actions">
        <Tooltip content="Discord Community" placement="left">
          <a
            className="fab-item"
            href="https://discord.gg/26VQY9ve8q"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/discord-logo.png" alt="Discord" />
          </a>
        </Tooltip>
        <Tooltip content="Buy me a coffee and support Deepwokendle!" placement="left">
          <a
            className="fab-item"
            href="https://ko-fi.com/ninpu/tip"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Ko-fi" />
          </a>
        </Tooltip>
      </div>
    </div>
  );
}
