import { useState, useRef, useEffect } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
}

type Status = 'loading' | 'loaded' | 'error';

export default function ImageWithLoader({ src, alt, className }: Props) {
  const [status, setStatus] = useState<Status>('loading');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setStatus('loading');
    const img = imgRef.current;
    if (img?.complete) {
      setStatus(img.naturalWidth > 0 ? 'loaded' : 'error');
    }
  }, [src]);

  return (
    <div className={`img-loader-wrap${className ? ` ${className}` : ''}`}>
      {status !== 'loaded' && (
        <div className="img-loader-overlay">
          {status === 'loading'
            ? <div className="img-loader-spinner" />
            : <span className="img-loader-error-icon">?</span>
          }
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: status === 'loaded' ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />
    </div>
  );
}
