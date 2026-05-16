import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCroppedImageBlob } from '../../utils/cropImage';
import styles from './ImageCropModal.module.css';

interface Props {
  imageSrc: string;
  onConfirm: (file: File, previewUrl: string) => void;
  onCancel: () => void;
  aspect?: number;
}

export default function ImageCropModal({ imageSrc, onConfirm, onCancel, aspect = 3 / 4 }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedArea) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedArea);
      const file = new File([blob], `monster_${Date.now()}.webp`, { type: 'image/webp' });
      const url = URL.createObjectURL(blob);
      onConfirm(file, url);
    } catch {
      // fallback: pass original
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], `monster_${Date.now()}`, { type: blob.type });
      onConfirm(file, imageSrc);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={`modal-overlay show ${styles.overlay}`} onClick={onCancel}>
      <div className={`border ${styles.cropModal}`} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Crop Image</h2>
        <p className={styles.hint}>Drag to reposition · Scroll to zoom</p>

        <div className={styles.cropArea}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
            style={{
              containerStyle: { borderRadius: 6 },
            }}
          />
        </div>

        <div className={styles.zoomRow}>
          <span>+</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className={styles.zoomSlider}
          />
          <span>{zoom.toFixed(1)}x</span>
        </div>

        <div className={`modal-buttons ${styles.actions}`}>
          <button className="btn" onClick={onCancel} disabled={processing}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={processing}>
            {processing ? 'Processing…' : 'Use Crop'}
          </button>
        </div>
      </div>
    </div>
  );
}
