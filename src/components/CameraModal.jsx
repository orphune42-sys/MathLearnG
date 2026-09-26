import React, { useRef, useEffect, useState } from 'react';
import { Camera, X } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      return;
    }

    setError('');
    let active = true;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Kamera tidak tersedia pada browser ini. Silakan gunakan opsi Unggah Foto.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Kamera tidak dapat diakses. Mohon beri izin akses kamera atau gunakan opsi Unggah Foto.');
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    const factor = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * factor);
    canvas.height = Math.round(video.videoHeight * factor);

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.78);

    onCapture(dataUrl);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(16, 35, 58, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16
    }}>
      <div className="card glass-dialog" style={{ width: '100%', maxWidth: 460, margin: 0 }}>
        <div className="row spread" style={{ marginBottom: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <Camera size={18} color="var(--blue-800)" />
            <h3 style={{ margin: 0 }}>Ambil Foto Jawaban</h3>
          </div>
          <button type="button" onClick={onClose} style={{ color: 'var(--muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <video ref={videoRef} autoPlay playsInline muted />

        {error && <div className="error">{error}</div>}

        <div className="row spread" style={{ marginTop: 16 }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Tutup
          </button>
          <button type="button" className="btn-accent" onClick={handleCapture} disabled={!!error}>
            <Camera size={15} />
            Ambil Foto
          </button>
        </div>
      </div>
    </div>
  );
}
