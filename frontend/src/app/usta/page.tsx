'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, User, LogOut, QrCode, Plus, Car, Search,
  Wrench, Eye, Camera, X, Check, ChevronRight, ChevronLeft,
  Gauge, Calendar, AlertCircle, Loader2, Package,
  ArrowLeft, ShieldCheck, CalendarDays, Clock,
  CheckCircle, XCircle, Phone, ZoomIn, MessageSquare,
} from 'lucide-react';
import { api, Vehicle, appointmentApi, Appointment, CalendarDay } from '@/utils/api';
import QrScannerModal from '@/components/QrScannerModal';

/* ─── Animations ─────────────────────────────── */
const containerAnim = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemAnim = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } };

/* ─── Constants ──────────────────────────────── */
const STATUS_OPTIONS = [
  { value: 'sirada', label: 'Sırada / Beklemede' },
  { value: 'bakimda', label: 'Bakımda / İşlem Yapılıyor' },
  { value: 'test', label: 'Test Sürüşünde' },
  { value: 'hazir', label: 'Teslim Edilmeye Hazır' },
  { value: 'teslim', label: 'Teslim Edildi (Arşivle)' },
];
const STATUS_LABEL: Record<string, string> = { sirada: 'Sırada', bakimda: 'Bakımda', test: 'Testte', hazir: 'Hazır', teslim: 'Teslim' };

const TR_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const TR_DAYS = ['Pt','Sa','Ça','Pe','Cu','Ct','Pz'];

const TIME_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];

function compressImage(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const MAX = 480;
        let { width, height } = img;
        if (width > height) { if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; } }
        else { if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; } }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.68));
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function formatDate(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${parseInt(d)} ${TR_MONTHS[parseInt(m) - 1]} ${y}`;
}

function today() { return new Date().toISOString().split('T')[0]; }
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { return (new Date(y, m, 1).getDay() + 6) % 7; } // Mon-start

/* ═══════════════════════════════════════════════
   PROFESSIONAL CALENDAR COMPONENT (Usta)
═══════════════════════════════════════════════ */
function UstaCalendar({ calendarData, onDayClick, selectedDay }: {
  calendarData: Record<string, CalendarDay[]>;
  onDayClick: (date: string) => void;
  selectedDay: string;
}) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = today();

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
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={prevMonth} className="ctrl-btn"><ChevronLeft size={17} /></button>
        <div style={{ textAlign: 'center' }}>
          <p className="font-heading" style={{ fontWeight: 700, fontSize: '1.05rem' }}>{TR_MONTHS[viewMonth]} {viewYear}</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {Object.keys(calendarData).filter(d => d.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`)).length} randevulu gün
          </p>
        </div>
        <button onClick={nextMonth} className="ctrl-btn"><ChevronRight size={17} /></button>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
          {TR_DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 0' }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const appts = calendarData[iso] || [];
            const isToday = iso === todayStr;
            const isSelected = iso === selectedDay;
            const hasAppts = appts.length > 0;

            return (
              <motion.button
                key={day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDayClick(iso)}
                title={hasAppts ? `${appts.length} randevu` : undefined}
                style={{
                  aspectRatio: '1',
                  borderRadius: 'var(--r-sm)',
                  border: isSelected ? '2px solid var(--blue)' : isToday ? '2px solid rgba(0,162,232,0.3)' : '1.5px solid transparent',
                  background: isSelected ? 'rgba(0,162,232,0.12)' : isToday ? 'rgba(0,162,232,0.05)' : hasAppts ? 'rgba(0,162,232,0.04)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  position: 'relative',
                  transition: 'all 0.15s ease',
                  padding: 4,
                }}
              >
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: isSelected || isToday || hasAppts ? 700 : 400,
                  color: isSelected ? 'var(--blue)' : isToday ? 'var(--blue)' : 'var(--text-primary)',
                  lineHeight: 1,
                }}>
                  {day}
                </span>
                {hasAppts && (
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '100%' }}>
                    {appts.slice(0, 3).map((_, ai) => (
                      <div key={ai} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }} />
                    ))}
                    {appts.length > 3 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-default)', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {[
          { color: 'var(--blue)', label: 'Randevulu Gün' },
          { color: 'rgba(0,162,232,0.3)', label: 'Bugün' },
          { color: 'rgba(0,162,232,0.12)', label: 'Seçili Gün' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   APPROVE MODAL
═══════════════════════════════════════════════ */
function ApproveModal({ appt, onClose, onDone }: { appt: Appointment; onClose: () => void; onDone: () => void }) {
  const [date, setDate] = useState(appt.requestedDate);
  const [time, setTime] = useState(appt.requestedTime);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await appointmentApi.approve(appt.id, { confirmedDate: date, confirmedTime: time, masterNote: note });
      onDone();
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div className="modal-panel" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="modal-title font-heading" style={{ color: 'var(--status-hazir)' }}><CheckCircle size={18} /> Randevuyu Onayla</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)', padding: '12px 16px', marginBottom: 20, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{appt.customerName}</strong> — {appt.plate}{appt.brand ? ` (${appt.brand})` : ''}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Onaylanan Tarih *</label>
              <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} min={today()} />
            </div>
            <div className="form-group">
              <label className="form-label">Onaylanan Saat *</label>
              <select className="form-control" value={time} onChange={e => setTime(e.target.value)}>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Usta Notu (İsteğe Bağlı)</label>
            <textarea className="form-control" rows={2} placeholder="Müşteriye iletmek istediğiniz not…" value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>İptal</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading || !date || !time}>
              {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={16} />}
              Onayla
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   REJECT MODAL
═══════════════════════════════════════════════ */
function RejectModal({ appt, onClose, onDone }: { appt: Appointment; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason.trim()) return;
    try {
      setLoading(true);
      await appointmentApi.reject(appt.id, { rejectionReason: reason });
      onDone();
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div className="modal-panel" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="modal-title font-heading" style={{ color: 'var(--red)' }}><XCircle size={18} /> Randevuyu Reddet</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ background: 'rgba(229,27,36,0.06)', border: '1px solid rgba(229,27,36,0.15)', borderRadius: 'var(--r-sm)', padding: '12px 16px', marginBottom: 20, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{appt.customerName}</strong> — {appt.requestedDate} {appt.requestedTime}
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Red Nedeni *</label>
          <textarea className="form-control" rows={3} placeholder="Uygun tarihte yer kalmadı / Belirtilen tarihte kapalıyız…" value={reason} onChange={e => setReason(e.target.value)} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>İptal</button>
          <button className="btn btn-danger" onClick={submit} disabled={loading || !reason.trim()}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <XCircle size={16} />}
            Reddet
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CANCEL MODAL
═══════════════════════════════════════════════ */
function CancelModal({ appt, onClose, onDone }: { appt: Appointment; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await appointmentApi.cancel(appt.id, { cancelReason: reason });
      onDone();
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div className="modal-panel" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="modal-title font-heading"><X size={18} /> Randevuyu İptal Et</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
          Bu işlem geri alınamaz. Müşteriye iptal nedeni iletilecektir.
        </p>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">İptal Nedeni (İsteğe Bağlı)</label>
          <textarea className="form-control" rows={2} placeholder="Beklenmedik durum nedeniyle…" value={reason} onChange={e => setReason(e.target.value)} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-danger" onClick={submit} disabled={loading}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <X size={16} />}
            İptal Et
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   APPOINTMENT CARD
═══════════════════════════════════════════════ */
function AppointmentCard({ appt, onApprove, onReject, onCancel, onView }: {
  appt: Appointment;
  onApprove: () => void; onReject: () => void; onCancel: () => void; onView: () => void;
}) {
  const statusColors: Record<string, string> = { pending: 'var(--status-sirada)', approved: 'var(--status-hazir)', rejected: 'var(--red)', cancelled: 'var(--status-teslim)' };
  const statusLabels: Record<string, string> = { pending: 'Bekliyor', approved: 'Onaylandı', rejected: 'Reddedildi', cancelled: 'İptal' };

  return (
    <motion.div
      className="card"
      style={{ padding: '20px 22px', cursor: 'pointer' }}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-lg)' }}
      onClick={onView}
    >
      {/* Status stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: statusColors[appt.status] || 'var(--blue)', borderRadius: '16px 16px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{appt.customerName}</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 8px', borderRadius: 4, background: `${statusColors[appt.status]}18`, color: statusColors[appt.status] }}>
              {statusLabels[appt.status] || appt.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="plate-badge">
              <span className="plate-badge-country" style={{ fontSize: '0.55rem', padding: '2px 5px' }}>TR</span>
              <span className="plate-badge-text" style={{ fontSize: '0.82rem', letterSpacing: '1px', padding: '2px 8px' }}>{appt.plate}</span>
            </div>
            {appt.brand && <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>{appt.brand}</span>}
          </div>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--blue)', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', flexShrink: 0 }}>#{appt.id}</span>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Calendar size={13} style={{ color: 'var(--blue)', flexShrink: 0 }} />
          {appt.status === 'approved' && appt.confirmedDate ? formatDate(appt.confirmedDate) : formatDate(appt.requestedDate)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Clock size={13} style={{ color: 'var(--blue)', flexShrink: 0 }} />
          {appt.status === 'approved' && appt.confirmedTime ? appt.confirmedTime : appt.requestedTime}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Phone size={13} style={{ color: 'var(--blue)', flexShrink: 0 }} />
          {appt.customerPhone}
        </div>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {appt.problemDesc}
      </p>

      {/* Actions — stop propagation so card click doesn't also fire */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
        {appt.status === 'pending' && (
          <>
            <button className="btn btn-sm" onClick={onApprove}
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--status-hazir)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>
              <CheckCircle size={14} /> Onayla
            </button>
            <button className="btn btn-sm btn-danger" onClick={onReject}>
              <XCircle size={14} /> Reddet
            </button>
          </>
        )}
        {appt.status === 'approved' && (
          <button className="btn btn-sm btn-danger" onClick={onCancel}>
            <X size={14} /> İptal Et
          </button>
        )}
        <button className="btn btn-sm btn-secondary" onClick={onView}>
          <Eye size={14} /> Detay
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function UstaPanel() {
  const router = useRouter();

  /* Auth */
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authMaster, setAuthMaster] = useState('Fatih');
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  /* Dashboard */
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleLoading, setVehicleLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'appointments' | 'calendar'>('list');

  /* Appointments */
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [apptFilter, setApptFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'>('pending');
  const [apptMasterFilter, setApptMasterFilter] = useState<string>('me');
  const [calendarData, setCalendarData] = useState<Record<string, CalendarDay[]>>({});
  const [selectedCalDay, setSelectedCalDay] = useState('');
  const [apptDetailId, setApptDetailId] = useState<number | null>(null);
  const [apptDetail, setApptDetail] = useState<Appointment | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [approveTarget, setApproveTarget] = useState<Appointment | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [photoLightbox, setPhotoLightbox] = useState<string | null>(null);

  /* QR Scanner */
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  /* New Vehicle Form */
  const [newPlate, setNewPlate] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStatus, setNewStatus] = useState('bakimda');
  const [newNotes, setNewNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  /* Service Record Modal */
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [updateStatus, setUpdateStatus] = useState('bakimda');
  const [updateKm, setUpdateKm] = useState('');
  const [updateDesc, setUpdateDesc] = useState('');
  const [updateParts, setUpdateParts] = useState('');
  const [tempPhotos, setTempPhotos] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  /* ─── Fetch ─────────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem('mbautolab_master');
    if (saved) {
      setCurrentUser(saved);
      // Pre-fetch pending appointments on load so badge count shows immediately
      appointmentApi.getAll({ master: saved, status: 'pending' })
        .then(setAppointments)
        .catch(err => console.error("Initial appointments fetch error:", err));
    }
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (currentUser && (activeTab === 'appointments')) fetchAppointments();
    if (currentUser && activeTab === 'calendar') { fetchAppointments(); fetchCalendar(); }
  }, [activeTab, currentUser, apptFilter, apptMasterFilter]);

  const fetchVehicles = async () => {
    try { setVehicleLoading(true); setVehicles(await api.getVehicles()); }
    catch (err) { console.error("fetchVehicles error:", err); }
    finally { setVehicleLoading(false); }
  };

  const fetchAppointments = async () => {
    try {
      setApptLoading(true);
      const params: any = {};
      
      if (apptMasterFilter === 'me') {
        if (currentUser) params.master = currentUser;
      } else if (apptMasterFilter !== 'all') {
        params.master = apptMasterFilter;
      }
      
      if (apptFilter !== 'all') params.status = apptFilter;
      setAppointments(await appointmentApi.getAll(params));
    } catch (err) { console.error("fetchAppointments error:", err); }
    finally { setApptLoading(false); }
  };

  const fetchCalendar = async () => {
    try { 
      let masterParam = undefined;
      if (apptMasterFilter === 'me') {
        masterParam = currentUser || undefined;
      } else if (apptMasterFilter !== 'all') {
        masterParam = apptMasterFilter;
      }
      setCalendarData(await appointmentApi.getCalendar(masterParam)); 
    }
    catch (err) { console.error("fetchCalendar error:", err); }
  };

  const openApptDetail = async (id: number) => {
    setApptDetailId(id);
    setDetailLoading(true);
    try { setApptDetail(await appointmentApi.getOne(id)); }
    catch (err) { console.error("openApptDetail error:", err); }
    finally { setDetailLoading(false); }
  };

  const closeApptDetail = () => { setApptDetailId(null); setApptDetail(null); };

  /* ─── Auth ──────────────────────────────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    await new Promise(r => setTimeout(r, 500));
    if (authPin === '1234') {
      setCurrentUser(authMaster);
      localStorage.setItem('mbautolab_master', authMaster);
      setAuthPin(''); setAuthError(false);
      fetchVehicles();
    } else { setAuthError(true); setAuthPin(''); }
    setAuthLoading(false);
  };

  const handleLogout = () => { setCurrentUser(null); localStorage.removeItem('mbautolab_master'); setActiveTab('list'); };

  /* ─── Vehicle ───────────────────────────────── */
  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newBrand || !newOwner || !newPhone) return;
    try {
      setCreating(true);
      await api.createVehicle({ plate: newPlate, brand: newBrand, owner: newOwner, phone: newPhone, status: newStatus, initialNotes: newNotes });
      setCreateSuccess(true);
      setTimeout(() => { setCreateSuccess(false); setNewPlate(''); setNewBrand(''); setNewOwner(''); setNewPhone(''); setNewStatus('bakimda'); setNewNotes(''); fetchVehicles(); setActiveTab('list'); }, 1500);
    } catch (err: any) { alert(err.message); }
    finally { setCreating(false); }
  };

  const openUpdateModal = (v: Vehicle) => {
    setSelectedVehicle(v);
    setUpdateStatus(v.status);
    const last = v.records?.[0];
    setUpdateKm(last ? last.km.toString() : '');
    setUpdateDesc(''); setUpdateParts(''); setTempPhotos([]); setUpdateSuccess(false);
  };

  const closeModal = () => { setSelectedVehicle(null); setTempPhotos([]); };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const compressed = await Promise.all(files.map(compressImage));
    setTempPhotos(prev => [...prev, ...compressed]);
    e.target.value = '';
  };

  const handleServiceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !updateDesc) return;
    try {
      setUpdating(true);
      const parts = updateParts ? updateParts.split(',').map(p => p.trim()).filter(Boolean) : [];
      await api.addRecord(selectedVehicle.id, { km: parseInt(updateKm) || 0, desc: updateDesc, status: updateStatus, parts, master: currentUser || 'Fatih', photos: tempPhotos });
      setUpdateSuccess(true);
      await fetchVehicles();
      setTimeout(closeModal, 1500);
    } catch (err: any) { alert(err.message); }
    finally { setUpdating(false); }
  };

  const handleScanSuccess = async (decoded: string) => {
    setIsScannerOpen(false);
    let plate = decoded;
    try {
      if (decoded.startsWith('http')) {
        const u = new URL(decoded); const segs = u.pathname.split('/'); const idx = segs.indexOf('arac');
        plate = idx !== -1 && segs[idx + 1] ? segs[idx + 1] : u.searchParams.get('plaka') || decoded;
      }
    } catch {}
    const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    try { const v = await api.getVehicleByPlate(clean); openUpdateModal(v); }
    catch { alert(`Okunan plaka: ${clean}\nVeritabanında kayıt bulunamadı.`); }
  };

  const filtered = vehicles.filter(v => {
    const q = searchQuery.toLowerCase();
    return v.plate.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q) || v.owner.toLowerCase().includes(q);
  });
  const active = vehicles.filter(v => v.status !== 'teslim');
  const pending = appointments.filter(a => a.status === 'pending').length;
  const formatPlate = (s: string) => s.toUpperCase().replace(/[^A-Z0-9\s]/g, '');

  /* ── LOGIN ──────────────────────────────────── */
  if (!currentUser) {
    return (
      <div className="page-wrapper">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button className="btn btn-ghost" onClick={() => router.push('/')} style={{ paddingLeft: 0, marginBottom: 32 }}>
            <ArrowLeft size={16} /> Ana Sayfaya Dön
          </button>
          <div style={{ maxWidth: 440, margin: '0 auto' }}>
            <div className="card" style={{ borderTop: '3px solid var(--blue)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#fff', fontSize: '1.8rem', boxShadow: '0 0 0 12px rgba(0,162,232,0.08), var(--shadow-md)' }}>
                <Key size={32} />
              </div>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h1 className="font-heading" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Usta Paneli Girişi</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Devam etmek için kimliğinizi doğrulayın</p>
              </div>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Usta Seçin</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {['Fatih', 'Mustafa'].map(name => (
                      <motion.button key={name} type="button" whileTap={{ scale: 0.97 }} onClick={() => setAuthMaster(name)}
                        style={{ padding: '14px 12px', borderRadius: 'var(--r-md)', border: authMaster === name ? '2px solid var(--blue)' : '1.5px solid var(--border-default)', background: authMaster === name ? 'rgba(0,162,232,0.08)' : 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s ease' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: authMaster === name ? 'var(--blue)' : 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: authMaster === name ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s ease' }}>
                          <User size={18} />
                        </div>
                        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.92rem', color: authMaster === name ? 'var(--blue)' : 'var(--text-primary)' }}>{name} Usta</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Giriş Şifresi</label>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
                    {[0,1,2,3].map(i => (
                      <motion.div key={i} className={`auth-pin-dot ${authPin.length > i ? 'filled' : ''}`} animate={authPin.length > i ? { scale: [1,1.3,1] } : {}} transition={{ duration: 0.15 }} />
                    ))}
                  </div>
                  <motion.div animate={authError ? { x: [-8,8,-6,6,0] } : {}} transition={{ duration: 0.4 }}>
                    <input type="password" className={`form-control${authError ? ' is-error' : ''}`} placeholder="••••" maxLength={6} inputMode="numeric" value={authPin} onChange={e => { setAuthPin(e.target.value); setAuthError(false); }} style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '8px', fontFamily: 'monospace' }} required />
                  </motion.div>
                  <AnimatePresence>
                    {authError && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="error-alert" style={{ marginTop: 8 }}>
                        <AlertCircle size={16} /> Yanlış şifre! Lütfen tekrar deneyin.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={authLoading}>
                  {authLoading ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ShieldCheck size={18} />}
                  {authLoading ? 'Doğrulanıyor…' : 'Giriş Yap'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Demo şifre: 1234</p>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ══ DASHBOARD ══════════════════════════════ */
  const dayAppts = selectedCalDay ? (calendarData[selectedCalDay] || []) : [];

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Dashboard Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid var(--border-default)', paddingBottom: 16 }}>
          <div>
            <h1 className="font-heading" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Usta Kontrol Paneli
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-hazir)', display: 'inline-block' }} />
              {currentUser} Usta oturumu aktif · {active.length} araç kayıtlı {pending > 0 && <span>· <span style={{ color: 'var(--status-sirada)', fontWeight: 700 }}>{pending} bekleyen randevu</span></span>}
            </p>
          </div>
          <div>
            <button className="btn btn-accent btn-sm" onClick={() => setIsScannerOpen(true)}>
              <QrCode size={15} /> QR Kod Tara
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '4px 0' }}>
            {([
              { key: 'list' as const,         label: 'Araçlar',    icon: <Car size={14} />,         badge: active.length,     badgeColor: '' },
              { key: 'appointments' as const,  label: 'Randevular', icon: <CalendarDays size={14} />, badge: pending || 0,      badgeColor: pending > 0 ? '#f59e0b' : '' },
              { key: 'calendar' as const,      label: 'Takvim',     icon: <Calendar size={14} />,    badge: 0,                 badgeColor: '' },
              { key: 'create' as const,        label: 'Yeni Araç',  icon: <Plus size={14} />,        badge: 0,                 badgeColor: '' },
            ] as const).map(t => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '9px 18px',
                    borderRadius: 50,
                    border: isActive ? '2px solid var(--blue)' : '1.5px solid rgba(128,128,128,0.25)',
                    background: isActive ? 'rgba(0,162,232,0.12)' : 'rgba(128,128,128,0.06)',
                    color: isActive ? 'var(--blue)' : 'var(--text-secondary)',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: isActive ? '0 0 12px rgba(0,162,232,0.15)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.icon}
                  {t.label}
                  {t.badge > 0 && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 20,
                      height: 20,
                      padding: '0 6px',
                      borderRadius: 10,
                      background: t.badgeColor ? `${t.badgeColor}22` : 'rgba(0,162,232,0.12)',
                      border: `1px solid ${t.badgeColor ? `${t.badgeColor}44` : 'rgba(0,162,232,0.2)'}`,
                      color: t.badgeColor || 'var(--blue)',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                    }}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ══ VEHICLES ══════════════════════════════ */}
          {activeTab === 'list' && pending > 0 && (
            <motion.div
              key="pending-banner"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1.5px solid rgba(245,158,11,0.3)',
                borderRadius: 'var(--r-md)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 4,
                cursor: 'pointer',
              }}
              onClick={() => setActiveTab('appointments')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', border: '1.5px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
                  <CalendarDays size={18} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f59e0b', marginBottom: 2 }}>
                    {pending} Bekleyen Randevu Talebi
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Onay bekleyen randevular var — incele ve onayla</p>
                </div>
              </div>
              <button className="btn btn-sm" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>
                Randevulara Git <ChevronRight size={14} />
              </button>
            </motion.div>
          )}

          {activeTab === 'list' && (
            <motion.div key="list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              <div className="search-wrap">
                <Search size={17} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input type="text" className="search-input" placeholder="Plaka, marka veya müşteri adı ile ara…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              {vehicleLoading ? (
                <div className="loading-state"><div className="spinner" /><p>Araçlar yükleniyor…</p></div>
              ) : filtered.length === 0 ? (
                <div className="card"><div className="empty-state"><div className="empty-state-icon"><Car size={28} /></div><p className="empty-state-title">{searchQuery ? 'Araç Bulunamadı' : 'Henüz Araç Yok'}</p><p className="empty-state-sub">{searchQuery ? `"${searchQuery}" için kayıt yok.` : 'Yeni araç kaydı sekmesinden araç ekleyin.'}</p>{!searchQuery && <button className="btn btn-primary" onClick={() => setActiveTab('create')}><Plus size={16} /> Araç Ekle</button>}</div></div>
              ) : (
                <motion.div className="vehicle-grid" variants={containerAnim} initial="hidden" animate="show">
                  {filtered.map(v => (
                    <motion.div key={v.id} className="vehicle-card" variants={itemAnim} whileHover={{ y: -4 }}>
                      <div className="vc-head">
                        <div className="plate-badge"><span className="plate-badge-country" style={{ fontSize: '0.6rem', padding: '3px 5px' }}>TR</span><span className="plate-badge-text" style={{ fontSize: '0.92rem', letterSpacing: '1.5px', padding: '3px 10px' }}>{v.plate}</span></div>
                        <span className={`status-badge status-${v.status}`} style={{ fontSize: '0.7rem' }}>{STATUS_LABEL[v.status] || v.status}</span>
                      </div>
                      <div className="vc-meta">
                        {[{ label: 'Araç', value: v.brand }, { label: 'Müşteri', value: v.owner }, { label: 'Son Güncelleme', value: v.lastUpdated || 'Yeni Kayıt' }].map(r => (
                          <div key={r.label} className="vc-meta-row"><span>{r.label}</span><strong style={{ fontSize: '0.82rem' }}>{r.value}</strong></div>
                        ))}
                      </div>
                      <div className="vc-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openUpdateModal(v)}><Wrench size={14} /> Servis Ekle</button>
                        <button className="btn btn-primary btn-sm" onClick={() => router.push(`/arac/${v.id}`)}><Eye size={14} /> Detay/QR</button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ══ APPOINTMENTS ══════════════════════════ */}
          {activeTab === 'appointments' && (
            <motion.div key="appts" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              {/* Usta Filtresi */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, background: 'var(--bg-elevated)', padding: '10px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Usta Filtresi:</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { key: 'me', label: `Ben (${currentUser} Usta)` },
                    { key: 'all', label: 'Tüm Ustalar' },
                    { key: 'Fatih', label: 'Fatih Usta' },
                    { key: 'Mustafa', label: 'Mustafa Usta' },
                  ].map(m => (
                    <button key={m.key} onClick={() => setApptMasterFilter(m.key)}
                      style={{
                        padding: '5px 12px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'Space Grotesk, sans-serif',
                        border: apptMasterFilter === m.key ? '1.5px solid var(--blue)' : '1px solid var(--border-default)',
                        background: apptMasterFilter === m.key ? 'rgba(0,162,232,0.1)' : 'var(--bg-card)',
                        color: apptMasterFilter === m.key ? 'var(--blue)' : 'var(--text-muted)',
                        transition: 'all 0.15s ease',
                      }}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {[
                  { key: 'pending', label: 'Bekleyen', color: 'var(--status-sirada)' },
                  { key: 'approved', label: 'Onaylı', color: 'var(--status-hazir)' },
                  { key: 'all', label: 'Tümü', color: 'var(--blue)' },
                  { key: 'rejected', label: 'Reddedilen', color: 'var(--red)' },
                  { key: 'cancelled', label: 'İptal', color: 'var(--text-muted)' },
                ].map(f => (
                  <button key={f.key} onClick={() => setApptFilter(f.key as any)}
                    style={{
                      padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                      fontFamily: 'Space Grotesk, sans-serif',
                      border: apptFilter === f.key ? `1.5px solid ${f.color}` : '1.5px solid var(--border-default)',
                      background: apptFilter === f.key ? `${f.color}14` : 'var(--bg-elevated)',
                      color: apptFilter === f.key ? f.color : 'var(--text-muted)',
                      transition: 'all 0.15s ease',
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>

              {apptLoading ? (
                <div className="loading-state"><div className="spinner" /><p>Randevular yükleniyor…</p></div>
              ) : appointments.length === 0 ? (
                <div className="card">
                  <div className="empty-state">
                    <div className="empty-state-icon"><CalendarDays size={28} /></div>
                    <p className="empty-state-title">Randevu Bulunamadı</p>
                    <p className="empty-state-sub">Bu filtre için herhangi bir randevu bulunmuyor.</p>
                  </div>
                </div>
              ) : (
                <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} variants={containerAnim} initial="hidden" animate="show">
                  {appointments.map(appt => (
                    <motion.div key={appt.id} variants={itemAnim}>
                      <AppointmentCard
                        appt={appt}
                        onApprove={() => setApproveTarget(appt)}
                        onReject={() => setRejectTarget(appt)}
                        onCancel={() => setCancelTarget(appt)}
                        onView={() => openApptDetail(appt.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ══ CALENDAR ══════════════════════════════ */}
          {activeTab === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
              
              {/* Usta Filtresi (Takvim için) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-elevated)', padding: '10px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Usta Takvimi:</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { key: 'me', label: `Ben (${currentUser} Usta)` },
                    { key: 'all', label: 'Tüm Ustalar' },
                    { key: 'Fatih', label: 'Fatih Usta' },
                    { key: 'Mustafa', label: 'Mustafa Usta' },
                  ].map(m => (
                    <button key={m.key} onClick={() => setApptMasterFilter(m.key)}
                      style={{
                        padding: '5px 12px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'Space Grotesk, sans-serif',
                        border: apptMasterFilter === m.key ? '1.5px solid var(--blue)' : '1px solid var(--border-default)',
                        background: apptMasterFilter === m.key ? 'rgba(0,162,232,0.1)' : 'var(--bg-card)',
                        color: apptMasterFilter === m.key ? 'var(--blue)' : 'var(--text-muted)',
                        transition: 'all 0.15s ease',
                      }}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <UstaCalendar calendarData={calendarData} onDayClick={day => setSelectedCalDay(day === selectedCalDay ? '' : day)} selectedDay={selectedCalDay} />

              {selectedCalDay && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
                  <h2 className="card-title font-heading" style={{ fontSize: '1rem', marginBottom: 16 }}>
                    <Calendar size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--blue)' }} />
                    {formatDate(selectedCalDay)} — {dayAppts.length} Randevu
                  </h2>
                  {dayAppts.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '20px 0', textAlign: 'center' }}>Bu günde onaylı randevu yok.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {dayAppts.map(a => (
                        <motion.div key={a.id} whileHover={{ x: 4 }} onClick={() => openApptDetail(a.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-default)', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 'var(--r-sm)', background: 'rgba(0,162,232,0.08)', border: '1px solid rgba(0,162,232,0.2)', flexShrink: 0 }}>
                            <Clock size={16} style={{ color: 'var(--blue)', display: 'block', marginBottom: 2 }} />
                            <span style={{ display: 'none' }}></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 'var(--r-sm)', background: 'rgba(0,162,232,0.08)', border: '1px solid rgba(0,162,232,0.2)', flexShrink: 0, flexDirection: 'column', gap: 0 }}>
                            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'var(--blue)', lineHeight: 1 }}>{a.time}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 3 }}>{a.customerName}</p>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <div className="plate-badge"><span className="plate-badge-country" style={{ fontSize: '0.55rem', padding: '2px 4px' }}>TR</span><span className="plate-badge-text" style={{ fontSize: '0.78rem', padding: '2px 7px' }}>{a.plate}</span></div>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.master} Usta</span>
                            </div>
                          </div>
                          <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ══ CREATE VEHICLE ════════════════════════ */}
          {activeTab === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title font-heading"><Car size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--blue)' }} />Yeni Araç Kaydı</h2>
                  <p className="card-subtitle">QR kod otomatik oluşturulacaktır.</p>
                  <div className="card-title-underline" />
                </div>
                <AnimatePresence>
                  {createSuccess && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="success-alert" style={{ marginBottom: 20 }}>
                      <Check size={16} /> Araç başarıyla kaydedildi!
                    </motion.div>
                  )}
                </AnimatePresence>
                <form onSubmit={handleCreateVehicle} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Araç Plakası *</label>
                      <div className="plate-input-wrap mini"><div className="plate-country" style={{ fontSize: '0.85rem', paddingBottom: 6 }}>TR</div><input type="text" className="plate-field" placeholder="34 MBA 99" value={newPlate} onChange={e => setNewPlate(formatPlate(e.target.value))} required /></div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Marka / Model *</label>
                      <input type="text" className="form-control" placeholder="BMW M5, Audi A4…" value={newBrand} onChange={e => setNewBrand(e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Müşteri Adı *</label>
                      <input type="text" className="form-control" placeholder="Cem Yılmaz" value={newOwner} onChange={e => setNewOwner(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Telefon *</label>
                      <input type="tel" className="form-control" placeholder="0555 123 4567" value={newPhone} onChange={e => setNewPhone(e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Başlangıç Durumu</label>
                    <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>{STATUS_OPTIONS.slice(0, 4).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">İlk Yapılan İşlem / Şikayet</label>
                    <textarea className="form-control" rows={3} placeholder="Örn: 120.000 KM periyodik bakım yapılacak." value={newNotes} onChange={e => setNewNotes(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={creating || createSuccess}>
                    {creating ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={18} />}
                    {creating ? 'Kaydediliyor…' : 'Aracı Kaydet'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══ SERVICE RECORD MODAL ══════════════════ */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
            <motion.div className="modal-panel" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="modal-handle" />
              <div className="modal-header">
                <h2 className="modal-title font-heading"><Wrench size={18} style={{ color: 'var(--blue)' }} />Servis Kaydı Ekle</h2>
                <button className="modal-close" onClick={closeModal}><X size={16} /></button>
              </div>
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-sm)', padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="plate-badge"><span className="plate-badge-country" style={{ fontSize: '0.6rem', padding: '3px 5px' }}>TR</span><span className="plate-badge-text" style={{ fontSize: '0.9rem', padding: '3px 10px' }}>{selectedVehicle.plate}</span></div>
                <div><p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedVehicle.brand}</p><p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedVehicle.owner}</p></div>
              </div>
              <AnimatePresence>{updateSuccess && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="success-alert" style={{ marginBottom: 16 }}><Check size={16} /> Servis kaydı güncellendi!</motion.div>}</AnimatePresence>
              <form onSubmit={handleServiceUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-grid form-grid-2">
                  <div className="form-group"><label className="form-label">Güncel Durum *</label><select className="form-control" value={updateStatus} onChange={e => setUpdateStatus(e.target.value)}>{STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Kilometre (KM)</label><div className="input-icon-wrap"><Gauge size={15} className="input-icon" /><input type="number" className="form-control" placeholder="124500" value={updateKm} onChange={e => setUpdateKm(e.target.value)} /></div></div>
                </div>
                <div className="form-group"><label className="form-label">Yapılan İşlem *</label><textarea className="form-control" rows={3} placeholder="Yağ filtresi, motor yağı yenilendi…" value={updateDesc} onChange={e => setUpdateDesc(e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Değişen Parçalar</label><div className="input-icon-wrap"><Package size={15} className="input-icon" /><input type="text" className="form-control" placeholder="Hava Filtresi, Yağ Filtresi (virgülle ayırın)" value={updateParts} onChange={e => setUpdateParts(e.target.value)} /></div></div>
                <div className="form-group">
                  <label className="form-label">Parça Fotoğrafları</label>
                  <div className="photo-grid">
                    {tempPhotos.map((p, i) => (<div key={i} className="photo-thumb"><img src={p} alt="" /><button type="button" className="photo-remove" onClick={() => setTempPhotos(prev => prev.filter((_, idx) => idx !== i))}><X size={11} /></button></div>))}
                    <label className="photo-add"><Camera size={22} className="photo-add-icon" /><span>Ekle</span><input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoUpload} /></label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>İptal</button>
                  <button type="submit" className="btn btn-primary" disabled={updating || updateSuccess || !updateDesc}>
                    {updating ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={16} />}
                    {updating ? 'Kaydediliyor…' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ APPOINTMENT DETAIL MODAL ══════════════ */}
      <AnimatePresence>
        {apptDetailId !== null && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => { if (e.target === e.currentTarget) closeApptDetail(); }}>
            <motion.div className="modal-panel" style={{ maxWidth: 560 }} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="modal-handle" />
              <div className="modal-header">
                <h2 className="modal-title font-heading"><CalendarDays size={18} style={{ color: 'var(--blue)' }} />Randevu Detayı #{apptDetailId}</h2>
                <button className="modal-close" onClick={closeApptDetail}><X size={16} /></button>
              </div>

              {detailLoading ? (
                <div className="loading-state" style={{ padding: '40px 0' }}><div className="spinner" /></div>
              ) : apptDetail ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div className="plate-badge"><span className="plate-badge-country" style={{ fontSize: '0.6rem', padding: '3px 5px' }}>TR</span><span className="plate-badge-text" style={{ fontSize: '0.9rem', padding: '3px 10px' }}>{apptDetail.plate}</span></div>
                    {apptDetail.brand && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{apptDetail.brand}</span>}
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>{apptDetail.status}</span>
                  </div>

                  {[
                    { label: 'Müşteri', value: apptDetail.customerName },
                    { label: 'Telefon', value: apptDetail.customerPhone },
                    { label: 'Usta', value: `${apptDetail.master} Usta` },
                    { label: 'Talep Tarihi', value: `${formatDate(apptDetail.requestedDate)} — ${apptDetail.requestedTime}` },
                    ...(apptDetail.confirmedDate ? [{ label: 'Onaylanan', value: `${formatDate(apptDetail.confirmedDate)} — ${apptDetail.confirmedTime}` }] : []),
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-default)', fontSize: '0.88rem', gap: 10 }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{r.label}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 700, textAlign: 'right' }}>{r.value}</span>
                    </div>
                  ))}

                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 8 }}>Belirtilen Sorun</p>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)', padding: '12px 16px' }}>{apptDetail.problemDesc}</p>
                  </div>

                  {apptDetail.problemPhoto && (
                    <div>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 8 }}>Sorun Fotoğrafı</p>
                      <div style={{ borderRadius: 'var(--r-md)', overflow: 'hidden', cursor: 'zoom-in', maxWidth: 300 }} onClick={() => setPhotoLightbox(apptDetail.problemPhoto!)}>
                        <img src={apptDetail.problemPhoto} alt="Sorun" style={{ width: '100%', display: 'block' }} />
                      </div>
                    </div>
                  )}

                  {apptDetail.masterNote && (
                    <div className="success-alert"><MessageSquare size={15} /><div><strong>Usta Notu:</strong> {apptDetail.masterNote}</div></div>
                  )}
                  {apptDetail.rejectionReason && (
                    <div className="error-alert"><AlertCircle size={15} /><div><strong>Red Nedeni:</strong> {apptDetail.rejectionReason}</div></div>
                  )}

                  <div className="modal-footer" style={{ flexWrap: 'wrap' }}>
                    {apptDetail.status === 'pending' && (
                      <>
                        <button className="btn btn-sm" onClick={() => { closeApptDetail(); setApproveTarget(apptDetail); }} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--status-hazir)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}><CheckCircle size={14} /> Onayla</button>
                        <button className="btn btn-sm btn-danger" onClick={() => { closeApptDetail(); setRejectTarget(apptDetail); }}><XCircle size={14} /> Reddet</button>
                      </>
                    )}
                    {apptDetail.status === 'approved' && (
                      <button className="btn btn-sm btn-danger" onClick={() => { closeApptDetail(); setCancelTarget(apptDetail); }}><X size={14} /> İptal Et</button>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={closeApptDetail} style={{ marginLeft: 'auto' }}>Kapat</button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ APPROVE / REJECT / CANCEL MODALS ════ */}
      <AnimatePresence>
        {approveTarget && <ApproveModal appt={approveTarget} onClose={() => setApproveTarget(null)} onDone={() => { setApproveTarget(null); fetchAppointments(); fetchCalendar(); }} />}
        {rejectTarget && <RejectModal appt={rejectTarget} onClose={() => setRejectTarget(null)} onDone={() => { setRejectTarget(null); fetchAppointments(); }} />}
        {cancelTarget && <CancelModal appt={cancelTarget} onClose={() => setCancelTarget(null)} onDone={() => { setCancelTarget(null); fetchAppointments(); fetchCalendar(); }} />}
      </AnimatePresence>

      {/* Photo lightbox */}
      <AnimatePresence>
        {photoLightbox && (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPhotoLightbox(null)}>
            <motion.img src={photoLightbox} alt="Büyük fotoğraf" initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 250, damping: 25 }} />
            <div className="lightbox-caption">Müşteri Sorun Fotoğrafı</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Scanner */}
      <AnimatePresence>
        {isScannerOpen && <QrScannerModal onClose={() => setIsScannerOpen(false)} onScanSuccess={handleScanSuccess} isUstaScanner />}
      </AnimatePresence>
    </div>
  );
}
