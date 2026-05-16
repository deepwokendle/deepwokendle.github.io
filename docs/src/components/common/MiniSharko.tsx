import { useRef, useState, useEffect } from 'react';

const images = ['/img/mini-sharko.png', '/img/mini-sharko-2.png'];
const SPEED = 120; // px/s
const OFFSCREEN = 70; // px past edge before turning

export default function MiniSharko() {
  const [src, setSrc] = useState(images[0]);
  const [exploding, setExploding] = useState(false);
  const [gone, setGone] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const posRef = useRef(-OFFSCREEN);
  const dirRef = useRef(1);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef(0);
  const imgIndexRef = useRef(0);

  useEffect(() => {
    const walkInterval = setInterval(() => {
      imgIndexRef.current = (imgIndexRef.current + 1) % images.length;
      setSrc(images[imgIndexRef.current]);
    }, 220);

    const animate = (time: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 2000;
      lastTimeRef.current = time;

      posRef.current += SPEED * dirRef.current * dt;

      const maxRight = window.innerWidth + OFFSCREEN;

      if (dirRef.current === 1 && posRef.current >= maxRight) {
        dirRef.current = -1;
      } else if (dirRef.current === -1 && posRef.current <= -OFFSCREEN) {
        dirRef.current = 1;
      }

      const container = containerRef.current;
      if (container) {
        container.style.left = `${posRef.current}px`;
      }
      if (imgRef.current) {
        imgRef.current.style.transform = dirRef.current === -1 ? 'scaleX(-1)' : '';
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(walkInterval);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleClick = () => {
    if (exploding || gone) return;
    const img = imgRef.current;
    if (!img) return;

    cancelAnimationFrame(rafRef.current);
    setExploding(true);

    const rect = img.getBoundingClientRect();
    const cols = 6, rows = 6;
    const pw = rect.width / cols;
    const ph = rect.height / rows;

    const wrap = document.createElement('div');
    wrap.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;pointer-events:none;overflow:visible;z-index:2000;`;
    document.body.appendChild(wrap);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const part = document.createElement('div');
        part.style.cssText = `position:absolute;width:${Math.ceil(pw)}px;height:${Math.ceil(ph)}px;left:${Math.round(c * pw)}px;top:${Math.round(r * ph)}px;background-image:url("${img.src}");background-position:-${Math.round(c * pw)}px -${Math.round(r * ph)}px;background-size:${rect.width}px ${rect.height}px;will-change:transform,opacity;transition:transform 1200ms cubic-bezier(.2,1,.3,1),opacity 1200ms linear;transform-origin:center;`;
        wrap.appendChild(part);
        const angle = Math.random() * Math.PI * 2;
        const dist = 150 + Math.random() * 700;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 200 * Math.random();
        const rot = Math.random() * 720 - 360;
        const scale = 0.6 + Math.random() * 1.8;
        setTimeout(() => {
          part.style.transform = `translate3d(${tx}px,${ty}px,0) rotate(${rot}deg) scale(${scale})`;
          part.style.opacity = '0';
        }, 20 + Math.random() * 150);
      }
    }

    setTimeout(() => { wrap.remove(); setGone(true); }, 2300);
  };

  if (gone) return null;

  return (
    <div
      ref={containerRef}
      className="mini-sharko-container"
      style={{ animation: 'none', left: `${posRef.current}px` }}
    >
      <img
        ref={imgRef}
        src={src}
        className="mini-sharko"
        alt="Mini Sharko"
        style={{ visibility: exploding ? 'hidden' : 'visible' }}
        onClick={handleClick}
      />
    </div>
  );
}
