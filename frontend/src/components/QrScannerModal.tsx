'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Camera, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  onScanSuccess: (decoded: string) => void;
  isUstaScanner?: boolean;
}

export default function QrScannerModal({ onClose, onScanSuccess, isUstaScanner }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<any>(null);
  const containerId = 'qr-scanner-container';

  useEffect(() => {
    let scanner: any;

    const start = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        scanner = new Html5QrcodeScanner(
          containerId,
          {
            fps: 12,
            qrbox: { width: 220, height: 220 },
            rememberLastUsedCamera: true,
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
          },
          false
        );

        scanner.render(
          (decoded: string) => {
            scanner.clear().catch(() => {});
            onScanSuccess(decoded);
          },
          (err: any) => {
            // Silently ignore scan errors (no match yet)
          }
        );

        scannerRef.current = scanner;
        setScanning(true);
      } catch (e) {
        setError('Kamera başlatılamadı. Lütfen kamera izinlerini kontrol edin.');
      }
    };

    start();

    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, []);

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="modal-panel"
        style={{ maxWidth: 420 }}
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="modal-handle" />

        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title font-heading">
            <QrCode size={18} style={{ color: 'var(--red)' }} />
            {isUstaScanner ? 'QR Tara — Hızlı Güncelle' : 'QR Kod ile Araç Sorgula'}
          </h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
          {isUstaScanner
            ? 'Aracın üzerindeki QR kodu taratın. Servis güncelleme ekranı otomatik açılacaktır.'
            : 'Aracınızdaki QR kodu taratın. Servis geçmişiniz otomatik yüklenecektir.'}
        </p>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="error-alert"
              style={{ marginBottom: 16 }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanner viewport */}
        <div style={{ position: 'relative', borderRadius: 'var(--r-md)', overflow: 'hidden', marginBottom: 16 }}>
          {/* Corner guides */}
          <div className="scanner-corner sc-tl" style={{ zIndex: 10 }} />
          <div className="scanner-corner sc-tr" style={{ zIndex: 10 }} />
          <div className="scanner-corner sc-bl" style={{ zIndex: 10 }} />
          <div className="scanner-corner sc-br" style={{ zIndex: 10 }} />
          {scanning && <div className="scanner-laser" />}

          {/* html5-qrcode renders into this div */}
          <div
            id={containerId}
            style={{
              width: '100%',
              borderRadius: 'var(--r-md)',
              overflow: 'hidden',
              background: '#000',
            }}
          />
        </div>

        {/* Loading hint */}
        {!scanning && !error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: '0.85rem', justifyContent: 'center', padding: '12px 0' }}>
            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            Kamera başlatılıyor…
          </div>
        )}

        {/* Instructions */}
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-sm)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          <Camera size={16} style={{ flexShrink: 0, marginTop: 1, color: 'var(--blue)' }} />
          <span>QR kodu çerçeve içine alın, otomatik okunacaktır. İzin kutusuna <strong>"İzin Ver"</strong> deyin.</span>
        </div>

        {/* Close */}
        <button className="btn btn-secondary btn-block" style={{ marginTop: 16 }} onClick={onClose}>
          Kamerayı Kapat
        </button>
      </motion.div>
    </motion.div>
  );
}
