'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, User, Phone, Car, Wrench, Camera,
  ArrowLeft, CheckCircle, ChevronRight, X, AlertCircle, Loader2,
} from 'lucide-react';
import { appointmentApi } from '@/utils/api';

/* ─── Time slots ──────────────────────────────── */
const TIME_SLOTS = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30',
];

/* ─── Helpers ─────────────────────────────────── */
const today = () => new Date().toISOString().split('T')[0];

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};

const TR_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const TR_DAYS_SHORT = ['Pz','Pt','Sa','Ça','Pe','Cu','Ct'];

function compressImage(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const MAX = 600;
        let { width, height } = img;
        if (width > height) { if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; } }
        else { if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; } }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/* ═══════════════════════════════════════════════
   MINI CALENDAR PICKER
═══════════════════════════════════════════════ */
function CalendarPicker({ selected, onSelect }: { selected: string; onSelect: (d: string) => void }) {
  const todayStr = today();
  const initDate = selected ? new Date(selected) : new Date();
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = (getFirstDayOfMonth(viewYear, viewMonth) + 6) % 7; // Mon-start

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--r-lg)',
      padding: '20px',
      userSelect: 'none',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.95rem' }}>
          {TR_MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
        {['Pt','Sa','Ça','Pe','Cu','Ct','Pz'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isPast = iso < todayStr;
          const isToday = iso === todayStr;
          const isSelected = iso === selected;
          const isSunday = (i % 7) === 6;

          return (
            <motion.button
              key={day}
              whileHover={!isPast ? { scale: 1.1 } : {}}
              whileTap={!isPast ? { scale: 0.95 } : {}}
              onClick={() => !isPast && onSelect(iso)}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '50%',
                border: 'none',
                cursor: isPast ? 'not-allowed' : 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: isToday || isSelected ? 700 : 500,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                background: isSelected
                  ? 'var(--blue)'
                  : isToday
                    ? 'rgba(0,162,232,0.12)'
                    : 'transparent',
                color: isSelected
                  ? '#fff'
                  : isPast
                    ? 'var(--text-muted)'
                    : isSunday
                      ? 'var(--red)'
                      : isToday
                        ? 'var(--blue)'
                        : 'var(--text-primary)',
                opacity: isPast ? 0.4 : 1,
                boxShadow: isSelected ? '0 0 12px var(--blue-glow)' : 'none',
                outline: isToday && !isSelected ? '2px solid rgba(0,162,232,0.3)' : 'none',
                outlineOffset: 1,
              }}
            >
              {day}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STEP INDICATOR
═══════════════════════════════════════════════ */
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32, justifyContent: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <motion.div
            animate={{
              background: i < current ? 'var(--blue)' : i === current ? 'var(--blue)' : 'var(--border-hover)',
              scale: i === current ? 1.15 : 1,
            }}
            style={{
              width: i === current ? 28 : 10,
              height: 10,
              borderRadius: 5,
              transition: 'all 0.3s ease',
            }}
          />
          {i < total - 1 && (
            <div style={{ flex: 1, maxWidth: 32, height: 2, background: i < current ? 'var(--blue)' : 'var(--border-default)', borderRadius: 1, transition: 'background 0.3s ease' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function RandevuPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: info, 1: problem, 2: datetime, 3: success
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [master, setMaster] = useState('Fatih');
  const [problemDesc, setProblemDesc] = useState('');
  const [problemPhoto, setProblemPhoto] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPlate = (v: string) => v.toUpperCase().replace(/[^A-Z0-9\s]/g, '');

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!customerName.trim()) e.customerName = 'Ad Soyad zorunlu';
      if (!customerPhone.trim()) e.customerPhone = 'Telefon zorunlu';
      if (!plate.trim()) e.plate = 'Plaka zorunlu';
      if (!master) e.master = 'Usta seçin';
    }
    if (s === 1) {
      if (!problemDesc.trim()) e.problemDesc = 'Sorunu açıklayın';
    }
    if (s === 2) {
      if (!selectedDate) e.date = 'Tarih seçin';
      if (!selectedTime) e.time = 'Saat seçin';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate(step)) setStep(s => s + 1); };
  const handleBack = () => { setStep(s => s - 1); setErrors({}); };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setProblemPhoto(compressed);
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!validate(2)) return;
    try {
      setSubmitting(true);
      const result = await appointmentApi.create({
        customerName,
        customerPhone,
        plate: plate.replace(/\s+/g, ''),
        brand,
        problemDesc,
        problemPhoto: problemPhoto || undefined,
        requestedDate: selectedDate,
        requestedTime: selectedTime,
        master,
      });
      setCreatedId(result.id);
      setStep(3);
    } catch (err: any) {
      setErrors({ submit: err.message || 'Randevu oluşturulamadı.' });
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.25 } },
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: 600 }}>
      {/* Back */}
      <button className="btn btn-ghost" onClick={() => router.push('/')} style={{ paddingLeft: 0, marginBottom: 28 }}>
        <ArrowLeft size={16} /> Ana Sayfaya Dön
      </button>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div className="hero-eyebrow" style={{ display: 'inline-flex', marginBottom: 12 }}>
          <span className="hero-eyebrow-dot" />
          MBAUTOLAB Randevu Sistemi
        </div>
        <h1 className="font-heading" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>
          Randevu Talebi Oluştur
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Bilgilerinizi girin, ustamız en kısa sürede onaylayacak.
        </p>
      </div>

      {step < 3 && <StepIndicator current={step} total={3} />}

      <AnimatePresence mode="wait">
        {/* ── STEP 0: Müşteri & Araç Bilgileri ─── */}
        {step === 0 && (
          <motion.div key="step0" variants={containerVariants} initial="hidden" animate="show" exit="exit">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title font-heading" style={{ fontSize: '1.1rem' }}>
                  <User size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--blue)' }} />
                  Müşteri & Araç Bilgileri
                </h2>
                <div className="card-title-underline" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Ad Soyad *</label>
                    <input className={`form-control${errors.customerName ? ' is-error' : ''}`} placeholder="Ahmet Yılmaz" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                    {errors.customerName && <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{errors.customerName}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telefon *</label>
                    <input className={`form-control${errors.customerPhone ? ' is-error' : ''}`} placeholder="0555 123 4567" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                    {errors.customerPhone && <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{errors.customerPhone}</span>}
                  </div>
                </div>

                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Araç Plakası *</label>
                    <div className={`plate-input-wrap mini${errors.plate ? ' is-error' : ''}`} style={{ border: errors.plate ? '2px solid var(--red)' : undefined }}>
                      <div className="plate-country" style={{ fontSize: '0.85rem', paddingBottom: 6 }}>TR</div>
                      <input type="text" className="plate-field" placeholder="34 MBA 99" value={plate} onChange={e => setPlate(formatPlate(e.target.value))} maxLength={12} />
                    </div>
                    {errors.plate && <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{errors.plate}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Marka / Model</label>
                    <input className="form-control" placeholder="BMW M5, Audi A4…" value={brand} onChange={e => setBrand(e.target.value)} />
                  </div>
                </div>

                {/* Master select */}
                <div className="form-group">
                  <label className="form-label">Usta Seçin *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {['Fatih', 'Mustafa'].map(name => (
                      <motion.button key={name} type="button" whileTap={{ scale: 0.97 }} onClick={() => setMaster(name)}
                        style={{
                          padding: '16px 12px', borderRadius: 'var(--r-md)',
                          border: master === name ? '2px solid var(--blue)' : '1.5px solid var(--border-default)',
                          background: master === name ? 'rgba(0,162,232,0.08)' : 'var(--bg-elevated)',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%',
                          background: master === name ? 'var(--blue)' : 'var(--bg-card)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: master === name ? '#fff' : 'var(--text-muted)',
                          fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif',
                          transition: 'all 0.2s ease',
                        }}>
                          {name[0]}
                        </div>
                        <div>
                          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.92rem', color: master === name ? 'var(--blue)' : 'var(--text-primary)', marginBottom: 2 }}>{name} Usta</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MBAUTOLAB Teknisyeni</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <button className="btn btn-primary btn-lg btn-block" onClick={handleNext}>
                  Devam Et <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 1: Problem Açıklama ─────────── */}
        {step === 1 && (
          <motion.div key="step1" variants={containerVariants} initial="hidden" animate="show" exit="exit">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title font-heading" style={{ fontSize: '1.1rem' }}>
                  <Wrench size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--blue)' }} />
                  Aracınızdaki Sorunu Anlatın
                </h2>
                <div className="card-title-underline" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Sorun Açıklaması *</label>
                  <textarea
                    className={`form-control${errors.problemDesc ? ' is-error' : ''}`}
                    rows={5}
                    placeholder="Aracımda son 1 haftadır fren sesi var, frenlerde titreşim hissediyorum. Ayrıca motor ışığı yanıyor..."
                    value={problemDesc}
                    onChange={e => setProblemDesc(e.target.value)}
                    style={{ minHeight: 130 }}
                  />
                  {errors.problemDesc && <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{errors.problemDesc}</span>}
                  <span className="form-help">{problemDesc.length} karakter — ne kadar detaylı olursa, usta o kadar hazırlıklı gelir.</span>
                </div>

                {/* Photo upload */}
                <div className="form-group">
                  <label className="form-label">Sorun Fotoğrafı (İsteğe Bağlı)</label>
                  {problemPhoto ? (
                    <div style={{ position: 'relative', display: 'inline-block', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1.5px solid var(--border-default)' }}>
                      <img src={problemPhoto} alt="Sorun fotoğrafı" style={{ display: 'block', maxHeight: 200, width: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={() => setProblemPhoto(null)}
                        style={{
                          position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="photo-add" style={{ aspectRatio: '16/7', borderRadius: 'var(--r-md)', cursor: 'pointer', flexDirection: 'row', gap: 12 }}>
                      <Camera size={28} className="photo-add-icon" />
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Fotoğraf Yükle veya Kameradan Çek</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>Hasar, ışık veya sorunlu alan fotoğrafı ekleyin</p>
                      </div>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                    </label>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary" onClick={handleBack} style={{ flex: 1 }}>
                    <ArrowLeft size={16} /> Geri
                  </button>
                  <button className="btn btn-primary" onClick={handleNext} style={{ flex: 2 }}>
                    Devam Et <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Tarih & Saat ─────────────── */}
        {step === 2 && (
          <motion.div key="step2" variants={containerVariants} initial="hidden" animate="show" exit="exit">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title font-heading" style={{ fontSize: '1.1rem' }}>
                  <Calendar size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--blue)' }} />
                  Tercih Ettiğiniz Tarih ve Saat
                </h2>
                <p className="card-subtitle">Usta randevunuzu onayladıktan sonra kesin saat belirlenecektir.</p>
                <div className="card-title-underline" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Calendar */}
                <div>
                  <p className="form-label" style={{ marginBottom: 10, display: 'block' }}>Tarih Seçin *</p>
                  <CalendarPicker selected={selectedDate} onSelect={setSelectedDate} />
                  {errors.date && <p style={{ color: 'var(--red)', fontSize: '0.78rem', marginTop: 6 }}>{errors.date}</p>}
                </div>

                {/* Selected date display */}
                {selectedDate && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(0,162,232,0.06)', border: '1px solid rgba(0,162,232,0.2)',
                      borderRadius: 'var(--r-sm)', padding: '10px 16px',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                    <Calendar size={16} style={{ color: 'var(--blue)' }} />
                    <span style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '0.92rem' }}>
                      {formatDate(selectedDate)} tarihini seçtiniz
                    </span>
                  </motion.div>
                )}

                {/* Time slots */}
                <div>
                  <p className="form-label" style={{ marginBottom: 10, display: 'block' }}>Saat Seçin *</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
                    {TIME_SLOTS.map(t => (
                      <motion.button key={t} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedTime(t)}
                        style={{
                          padding: '10px 6px', borderRadius: 'var(--r-sm)',
                          border: selectedTime === t ? '2px solid var(--blue)' : '1.5px solid var(--border-default)',
                          background: selectedTime === t ? 'rgba(0,162,232,0.1)' : 'var(--bg-elevated)',
                          color: selectedTime === t ? 'var(--blue)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                          transition: 'all 0.15s ease',
                          boxShadow: selectedTime === t ? '0 0 10px var(--blue-glow)' : 'none',
                        }}
                      >
                        <Clock size={12} />
                        {t}
                      </motion.button>
                    ))}
                  </div>
                  {errors.time && <p style={{ color: 'var(--red)', fontSize: '0.78rem', marginTop: 6 }}>{errors.time}</p>}
                </div>

                {/* Özet */}
                {selectedDate && selectedTime && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      borderRadius: 'var(--r-md)', padding: '16px 20px',
                    }}>
                    <p style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 12 }}>Randevu Özeti</p>
                    {[
                      { label: 'Müşteri', value: customerName },
                      { label: 'Araç', value: `${plate}${brand ? ` — ${brand}` : ''}` },
                      { label: 'Usta', value: `${master} Usta` },
                      { label: 'Tercih Edilen Tarih', value: formatDate(selectedDate) },
                      { label: 'Tercih Edilen Saat', value: selectedTime },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>{row.value}</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {errors.submit && (
                  <div className="error-alert">
                    <AlertCircle size={16} />{errors.submit}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary" onClick={handleBack} style={{ flex: 1 }}>
                    <ArrowLeft size={16} /> Geri
                  </button>
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !selectedDate || !selectedTime} style={{ flex: 2 }}>
                    {submitting ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle size={18} />}
                    {submitting ? 'Gönderiliyor…' : 'Randevu Talebini Gönder'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Başarı ───────────────────── */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }}>
            <div className="card" style={{ textAlign: 'center', padding: '48px 32px', borderTop: '4px solid var(--status-hazir)' }}>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
                style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px', color: 'var(--status-hazir)',
                }}
              >
                <CheckCircle size={40} />
              </motion.div>

              <h2 className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 10, letterSpacing: '-0.5px' }}>
                Randevu Talebiniz Alındı!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 28 }}>
                <strong>{master} Usta</strong> talebinizi inceleyecek ve en kısa sürede onaylayacaktır.<br />
                Randevu durumunuzu takip etmek için aşağıdaki linki saklayın.
              </p>

              {createdId && (
                <div style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--r-md)', padding: '14px 20px', marginBottom: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                }}>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>Randevu Takip No</p>
                    <p className="font-heading" style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--blue)' }}>#{createdId}</p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => router.push(`/randevu/${createdId}`)}>
                    Durumu Takip Et <ChevronRight size={14} />
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => router.push('/')}>
                  Ana Sayfaya Dön
                </button>
                <button className="btn btn-ghost" onClick={() => { setStep(0); setCreatedId(null); setCustomerName(''); setCustomerPhone(''); setPlate(''); setBrand(''); setProblemDesc(''); setProblemPhoto(null); setSelectedDate(''); setSelectedTime(''); }}>
                  Yeni Randevu Oluştur
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
