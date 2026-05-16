import { useState, useEffect, useRef } from 'react';
import type { MatchResult } from '../../types';
import FitText from './FitText';

interface Props {
  result?: MatchResult | 'picture';
  children: React.ReactNode;
  delay?: number;
  instant?: boolean;
}

export default function FlipCard({ result, children, delay = 0, instant = false }: Props) {
  const [flipped, setFlipped] = useState(instant);
  const [fitKey, setFitKey] = useState(0);
  const isText = result && result !== 'picture';
  const textContent = isText && typeof children === 'string' ? children : null;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (instant) return;
    timerRef.current = setTimeout(() => {
      setFlipped(true);
      if (textContent !== null) {
        setTimeout(() => setFitKey(k => k + 1), 650);
      }
    }, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [delay, textContent, instant]);

  return (
    <div className={`flip-card${flipped ? ' flipped' : ''}`}>
      <div className="flip-card-inner">
        <div className="flip-card-front" />
        <div className={`flip-card-back border${isText ? ` item ${result}` : ''}`}>
          {textContent !== null
            ? <FitText key={fitKey}>{textContent}</FitText>
            : children}
        </div>
      </div>
    </div>
  );
}
