'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, Clock, User, Phone, Car, Wrench,
  CheckCircle, XCircle, AlertCircle, Hourglass, X, ZoomIn,
} from 'lucide-react';
import { appointmentApi, Appointment } from '@/utils/api';

const STATUS_CONFIG: Record<string, { label: string; icon: (size?: number) => React.ReactNode; color: string; bg: string; border: string; desc: string }> = {
  pending: {
    label: 'Onay Bekleniyor',
    icon: (size = 28) => <Hourglass size={size} />,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    desc: 'Randevu talebiniz ustamıza iletildi. En kısa sürede değerlendirilecektir.',
  },
  approved: {
    label: 'Randevu Onaylandı',
    icon: (size = 28) => <CheckCircle size={size} />,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
    desc: 'Randevunuz onaylandı! Belirlenen tarih ve saatte servisimizde olmanız yeterli.',
  },
  rejected: {
    label: 'Randevu Reddedildi',
    icon: (size = 28) => <XCircle size={size} />,
    color: '#e51b24',
    bg: 'rgba(229,27,36,0.08)',
    border: 'rgba(229,27,36,0.25)',
    desc: 'Maalesef randevu talebiniz uygun bulunmadı. Başka bir tarih için tekrar talep oluşturabilirsiniz.',
  },
  cancelled: {
    label: 'Randevu İptal Edildi',
    icon: (size = 28) => <X size={size} />,
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.08)',
    border: 'rgba(107,114,128,0.25)',
    desc: 'Bu randevu iptal edilmiştir. Yeni randevu almak için lütfen tekrar başvurun.',
  },
};

const TR_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

function formatDateLong(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${parseInt(d)} ${TR_MONTHS[parseInt(m) - 1]} ${y}`;
}

function formatDateShort(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const [appt, setAppt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);

  const fetchAppt = async () => {
    try {
      setLoading(true);
      const data = await appointmentApi.getOne(id);
      setAppt(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchAppt(); }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-state">
          <div className="spinner" />
          <p>Randevu bilgisi yükleniyor…</p>
        </div>
      </div>
    );
  }

  if (error || !appt) {
    return (
      <div className="page-wrapper" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '48px 28px', borderTop: '4px solid var(--red)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(229,27,36,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--red)' }}>
            <AlertCircle size={28} />
          </div>
          <h2 className="font-heading" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10 }}>Randevu Bulunamadı</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 28 }}>
            #{id} numaralı randevu bulunamadı veya erişim izniniz yok.
          </p>
          <button className="btn btn-primary btn-block" onClick={() => router.push('/randevu')}>
            Yeni Randevu Oluştur
          </button>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;

  return (
    <div className="page-wrapper" style={{ maxWidth: 620 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Back */}
        <button className="btn btn-ghost" onClick={() => router.push('/')} style={{ paddingLeft: 0 }}>
          <ArrowLeft size={16} /> Ana Sayfaya Dön
        </button>

        {/* Tracking number */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 4 }}>
              Randevu Takip No
            </p>
            <h1 className="font-heading" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-1px', color: 'var(--blue)' }}>
              #{appt.id}
            </h1>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 8,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            color: cfg.color, fontWeight: 700, fontSize: '0.85rem',
          }}>
            {cfg.icon(16)}
            {cfg.label}
          </span>
        </div>

        {/* Status card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ borderTop: `4px solid ${cfg.color}` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: cfg.bg, border: `2px solid ${cfg.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: cfg.color, flexShrink: 0,
            }}>
              {cfg.icon(28)}
            </div>
            <div style={{ flex: 1 }}>
              <h2 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>{cfg.label}</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{cfg.desc}</p>
            </div>
          </div>

          {/* Confirmed date for approved */}
          {appt.status === 'approved' && appt.confirmedDate && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 'var(--r-md)', padding: '18px 20px',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Calendar size={20} style={{ color: '#10b981' }} />
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#10b981', marginBottom: 2 }}>Onaylanan Tarih</p>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{formatDateLong(appt.confirmedDate)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Clock size={20} style={{ color: '#10b981' }} />
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#10b981', marginBottom: 2 }}>Onaylanan Saat</p>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{appt.confirmedTime}</p>
                </div>
              </div>
              {appt.masterNote && (
                <div style={{ gridColumn: '1 / -1', paddingTop: 12, borderTop: '1px solid rgba(16,185,129,0.15)' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 6 }}>Usta Notu</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{appt.masterNote}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Rejection reason */}
          {appt.status === 'rejected' && appt.rejectionReason && (
            <div className="error-alert" style={{ marginTop: 8 }}>
              <AlertCircle size={16} />
              <div>
                <strong>Red Nedeni:</strong> {appt.rejectionReason}
              </div>
            </div>
          )}

          {/* Cancel reason */}
          {appt.status === 'cancelled' && appt.cancelReason && (
            <div style={{ background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.2)', borderRadius: 'var(--r-sm)', padding: '12px 16px', marginTop: 8, display: 'flex', gap: 10, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <div><strong>İptal Nedeni:</strong> {appt.cancelReason}</div>
            </div>
          )}
        </motion.div>

        {/* Appointment Details */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <h2 className="card-title font-heading" style={{ fontSize: '1rem', marginBottom: 20 }}>Randevu Detayları</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: <User size={16} />, label: 'Müşteri', value: appt.customerName },
              { icon: <Phone size={16} />, label: 'Telefon', value: appt.customerPhone },
              { icon: <Car size={16} />, label: 'Araç', value: `${appt.plate}${appt.brand ? ` — ${appt.brand}` : ''}` },
              { icon: <Wrench size={16} />, label: 'Usta', value: `${appt.master} Usta` },
              { icon: <Calendar size={16} />, label: 'Talep Edilen Tarih', value: formatDateLong(appt.requestedDate) },
              { icon: <Clock size={16} />, label: 'Talep Edilen Saat', value: appt.requestedTime },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: '1px solid var(--border-default)', gap: 12, flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
                  {row.icon}
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{row.label}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'right' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Problem Description */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
          <h2 className="card-title font-heading" style={{ fontSize: '1rem', marginBottom: 16 }}>Belirtilen Sorun</h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: appt.problemPhoto ? 20 : 0 }}>
            {appt.problemDesc}
          </p>

          {appt.problemPhoto && (
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 10 }}>
                Sorun Fotoğrafı
              </p>
              <div
                className="tl-gallery-thumb"
                style={{ maxWidth: 280, cursor: 'zoom-in' }}
                onClick={() => setLightbox(true)}
              >
                <img src={appt.problemPhoto} alt="Sorun fotoğrafı" style={{ width: '100%', borderRadius: 'var(--r-md)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
                >
                  <ZoomIn size={24} color="#fff" style={{ opacity: 0.8 }} />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {appt.status === 'rejected' || appt.status === 'cancelled' ? (
              <button className="btn btn-primary btn-block" onClick={() => router.push('/randevu')}>
                <Calendar size={16} /> Yeni Randevu Oluştur
              </button>
            ) : (
              <button className="btn btn-secondary btn-block" onClick={fetchAppt}>
                Durumu Yenile
              </button>
            )}
          </div>
        </motion.div>

      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && appt.problemPhoto && (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(false)}>
            <motion.img src={appt.problemPhoto} alt="Büyük fotoğraf" initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 250, damping: 25 }} />
            <div className="lightbox-caption">Müşteri Tarafından Yüklenen Sorun Fotoğrafı</div>
            <button onClick={() => setLightbox(false)} style={{ position: 'fixed', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
