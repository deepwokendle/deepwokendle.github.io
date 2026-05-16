import { useRef, useLayoutEffect } from 'react';

interface Props {
  children: string;
}

export default function FitText({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const span = spanRef.current;
    if (!container || !span) return;

    const maxSize = 14;
    const minSize = 4;
    let size = maxSize;
    span.style.fontSize = `${size}px`;

    while (
      size > minSize &&
      (span.scrollWidth > container.clientWidth || span.scrollHeight > container.clientHeight)
    ) {
      size -= 0.5;
      span.style.fontSize = `${size}px`;
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px',
        boxSizing: 'border-box',
      }}
    >
      <span
        ref={spanRef}
        style={{ display: 'block', textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.1 }}
      >
        {children}
      </span>
    </div>
  );
}
