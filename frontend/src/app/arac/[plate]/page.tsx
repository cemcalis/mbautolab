'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Gauge, Clock, User, Phone, Calendar,
  Wrench, CheckCircle, Package, Printer, Download,
  Hourglass, CarFront, TestTubeDiagonal, Handshake,
  ZoomIn, X
} from 'lucide-react';
import QRCode from 'qrcode';
import { api, Vehicle } from '@/utils/api';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const STATUS_STEPS = [
  { key: 'sirada',  label: 'Sırada',   icon: <Hourglass size={18} /> },
  { key: 'bakimda', label: 'Bakımda',  icon: <Wrench size={18} /> },
  { key: 'test',    label: 'Testte',   icon: <Gauge size={18} /> },
  { key: 'hazir',   label: 'Hazır',    icon: <CheckCircle size={18} /> },
  { key: 'teslim',  label: 'Teslim',   icon: <Handshake size={18} /> },
];

const STATUS_TEXT: Record<string, string> = {
  sirada:  'Sırada / Beklemede',
  bakimda: 'Bakımda / İşlem Yapılıyor',
  test:    'Test Sürüşünde',
  hazir:   'Teslim Edilmeye Hazır',
  teslim:  'Müşteriye Teslim Edildi',
};

export default function VehicleDetail() {
  const params = useParams();
  const router = useRouter();
  const plateParam = params.plate as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [lightbox, setLightbox] = useState<{ src: string; date: string } | null>(null);

  useEffect(() => {
    if (!plateParam) return;
    (async () => {
      try {
        setLoading(true);
        const data = await api.getVehicleByPlate(plateParam);
        setVehicle(data);
      } catch (e: any) {
        setError(e.message || 'Araç bilgileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    })();
  }, [plateParam]);

  useEffect(() => {
    if (!vehicle) return;
    const url = `${window.location.origin}/arac/${vehicle.id}`;
    QRCode.toDataURL(url, { width: 320, margin: 1.5, color: { dark: '#000', light: '#fff' } })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [vehicle]);

  const maskPhone = (p: string) => {
    const c = p.replace(/\s+/g, '');
    return c.length < 7 ? c : `${c.slice(0, 4)} *** ** ${c.slice(-2)}`;
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-state">
          <div className="spinner" />
          <p>Araç bilgileri yükleniyor…</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="page-wrapper">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 440, margin: '48px auto' }}>
          <div className="card" style={{ borderTop: '4px solid var(--red)', textAlign: 'center', padding: '48px 32px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(229,27,36,0.08)', border: '1px solid rgba(229,27,36,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', color: 'var(--red)', fontSize: '1.8rem',
            }}>
              <X size={28} />
            </div>
            <h2 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 10 }}>Araç Bulunamadı</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 28, lineHeight: 1.65 }}>
              {error || `"${plateParam}" plakasına ait kayıt sistemimizde bulunamadı. Plakayı kontrol edip tekrar deneyin.`}
            </p>
            <button className="btn btn-primary btn-block" onClick={() => router.push('/')}>
              <ArrowLeft size={16} /> Ana Sayfaya Dön
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const activeIdx = STATUS_STEPS.findIndex(s => s.key === vehicle.status);

  return (
    <div className="page-wrapper">
      <motion.div variants={container} initial="hidden" animate="show" className="gap-24" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Back */}
        <motion.div variants={item}>
          <button className="btn btn-ghost" onClick={() => router.push('/')} style={{ paddingLeft: 0 }}>
            <ArrowLeft size={16} />
            <span>Arama Ekranına Dön</span>
          </button>
        </motion.div>

        {/* ── Vehicle Overview Card ─────────────────── */}
        <motion.div variants={item}>
          <div className="card">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div className="plate-badge">
                  <span className="plate-badge-country">TR</span>
                  <span className="plate-badge-text">{vehicle.plate}</span>
                </div>
                <div>
                  <h1 className="font-heading" style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
                    {vehicle.brand}
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 2 }}>
                    {vehicle.records?.length || 0} servis kaydı
                  </p>
                </div>
              </div>
              <span className={`status-badge status-${vehicle.status}`}>
                {STATUS_TEXT[vehicle.status] || vehicle.status}
              </span>
            </div>

            {/* Meta Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px 24px',
              marginBottom: 24,
            }}>
              {[
                { icon: <User size={15} />, label: 'Müşteri', value: vehicle.owner },
                { icon: <Phone size={15} />, label: 'Telefon', value: maskPhone(vehicle.phone) },
                { icon: <Calendar size={15} />, label: 'Son Güncelleme', value: vehicle.lastUpdated || '—' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    marginTop: 2,
                    color: 'var(--blue)',
                    flexShrink: 0,
                  }}>
                    {m.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>
                      {m.label}
                    </p>
                    <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Status Tracker */}
            <div className="tracker-wrap">
              <p className="tracker-label">Servis Aşama Durumu</p>
              <div className="tracker-steps">
                {STATUS_STEPS.map((s, i) => {
                  const cls = i === activeIdx ? 'active' : i < activeIdx ? 'completed' : '';
                  return (
                    <div key={s.key} className={`tracker-step ${cls}`}>
                      <div className="tracker-step-dot">{s.icon}</div>
                      <span className="tracker-step-label">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Timeline ──────────────────────────────── */}
        <motion.div variants={item}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Clock size={20} color="var(--blue)" />
            <h2 className="font-heading" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Servis Geçmişi Zaman Tüneli</h2>
            {vehicle.records && vehicle.records.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: 'rgba(0,162,232,0.1)',
                border: '1px solid rgba(0,162,232,0.2)',
                color: 'var(--blue)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 20,
              }}>
                {vehicle.records.length} kayıt
              </span>
            )}
          </div>

          {!vehicle.records || vehicle.records.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon"><Wrench size={28} /></div>
                <p className="empty-state-title">Servis Kaydı Yok</p>
                <p className="empty-state-sub">Bu araç için henüz servis geçmişi girilmemiş.</p>
              </div>
            </div>
          ) : (
            <div className="timeline">
              {vehicle.records.map((rec, idx) => (
                <motion.div
                  key={rec.id}
                  className="timeline-item"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="timeline-dot" />
                  <div className="timeline-card">
                    {/* Header */}
                    <div className="tl-header">
                      <div>
                        <p className="tl-date">{rec.date}</p>
                        <p className="tl-km">
                          <Gauge size={13} />
                          {rec.km.toLocaleString('tr-TR')} KM
                        </p>
                      </div>
                      <span className="tl-master">
                        <User size={12} />
                        {rec.master} Usta
                      </span>
                    </div>

                    {/* Description */}
                    <p className="tl-desc">{rec.desc}</p>

                    {/* Parts */}
                    {rec.parts && rec.parts.trim() !== '' && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                          Değişen Parçalar
                        </p>
                        <div className="tl-parts">
                          {rec.parts.split(',').map((p, pi) => (
                            <span key={pi} className="part-chip">
                              <Package size={11} />
                              {p.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Photo Gallery */}
                    {rec.photos && rec.photos.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                          Fotoğraflar ({rec.photos.length})
                        </p>
                        <div className="tl-gallery">
                          {rec.photos.map(ph => (
                            <motion.div
                              key={ph.id}
                              className="tl-gallery-thumb"
                              whileHover={{ scale: 1.05 }}
                              onClick={() => setLightbox({ src: ph.photoData, date: rec.date })}
                            >
                              <img src={ph.photoData} alt="Parça fotoğrafı" />
                              <div style={{
                                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.15s',
                              }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.3)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
                              >
                                <ZoomIn size={22} color="#fff" style={{ opacity: 0.8 }} />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── QR Card ───────────────────────────────── */}
        <motion.div variants={item}>
          <div className="card" style={{ borderTop: '3px solid var(--blue)' }}>
            <div className="qr-card-inner">
              {qrDataUrl && (
                <div className="qr-image-box">
                  <img src={qrDataUrl} alt="Araç QR Kodu" />
                </div>
              )}
              <div className="qr-text-box">
                <h2 className="qr-title font-heading">Bu Aracın QR Kodu</h2>
                <p className="qr-desc">
                  Bu QR kodu çıktı alıp aracınızın ön camına veya torpidosuna yapıştırın.
                  Telefonla taratarak anlık servis geçmişine ulaşın.
                </p>
                <div className="qr-btn-row">
                  <button className="btn btn-primary" onClick={() => window.print()}>
                    <Printer size={15} /> QR Kartı Yazdır
                  </button>
                  {qrDataUrl && (
                    <button className="btn btn-secondary" onClick={() => {
                      const a = document.createElement('a');
                      a.download = `MBAUTOLAB_QR_${vehicle.plate.replace(/\s+/g, '_')}.png`;
                      a.href = qrDataUrl;
                      a.click();
                    }}>
                      <Download size={15} /> PNG İndir
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={lightbox.src}
              alt="Büyük görüntü"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            />
            <div className="lightbox-caption">
              {lightbox.date} Tarihli Bakım Fotoğrafı — MBAUTOLAB
            </div>
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: 'fixed', top: 20, right: 20,
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print Template */}
      {qrDataUrl && (
        <div className="print-ticket" style={{ display: 'none' }}>
          <div style={{ textAlign: 'center', fontFamily: 'sans-serif', padding: 24 }}>
            <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 2, marginBottom: 4 }}>MBAUTOLAB</div>
            <div style={{ fontSize: 11, color: '#666', letterSpacing: 3, marginBottom: 16, textTransform: 'uppercase' }}>Akıllı Servis Takip</div>
            <img src={qrDataUrl} style={{ width: 180, height: 180, display: 'block', margin: '0 auto 12px' }} alt="QR" />
            <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: 4, border: '3px solid #000', padding: '6px 20px', display: 'inline-block', borderRadius: 4, marginBottom: 12 }}>
              {vehicle.plate}
            </div>
            <p style={{ fontSize: 10, color: '#555', maxWidth: 200, margin: '0 auto', lineHeight: 1.6 }}>
              QR kodu taratarak servis geçmişini görün
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
