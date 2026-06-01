// Dynamic hostname resolver — supports local network phone devices
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:3001/api`;
  }
  return 'http://localhost:3001/api';
};

/* ─── Types ───────────────────────────────────── */
export interface ServicePhoto {
  id: number;
  photoData: string;
}

export interface ServiceRecord {
  id: number;
  date: string;
  km: number;
  desc: string;
  parts: string;
  master: string;
  photos: ServicePhoto[];
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  owner: string;
  phone: string;
  status: 'sirada' | 'bakimda' | 'test' | 'hazir' | 'teslim';
  lastUpdated: string;
  records?: ServiceRecord[];
}

export type AppointmentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Appointment {
  id: number;
  customerName: string;
  customerPhone: string;
  plate: string;
  brand: string;
  problemDesc: string;
  problemPhoto?: string;
  requestedDate: string;
  requestedTime: string;
  master: string;
  status: AppointmentStatus;
  rejectionReason?: string;
  cancelReason?: string;
  confirmedDate?: string;
  confirmedTime?: string;
  masterNote?: string;
  createdAt: string;
}

export type CalendarDay = {
  id: number;
  time: string;
  customerName: string;
  plate: string;
  master: string;
};

/* ─── Vehicles API ────────────────────────────── */
export const api = {
  async getVehicles(search?: string): Promise<Vehicle[]> {
    const url = new URL(getApiBaseUrl() + '/vehicles');
    if (search) url.searchParams.append('search', search);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Araçlar yüklenemedi.');
    return res.json();
  },

  async getVehicleByPlate(plate: string): Promise<Vehicle> {
    const clean = plate.toUpperCase().replace(/\s+/g, '');
    const res = await fetch(`${getApiBaseUrl()}/vehicles/${clean}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status === 404 ? 'Araç bulunamadı.' : 'Araç bilgisi alınamadı.');
    return res.json();
  },

  async createVehicle(data: {
    plate: string; brand: string; owner: string;
    phone: string; status: string; initialNotes?: string;
  }): Promise<Vehicle> {
    const res = await fetch(`${getApiBaseUrl()}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Araç kaydedilemedi.'); }
    return res.json();
  },

  async addRecord(plate: string, data: {
    km: number; desc: string; status: string;
    parts: string[]; master: string; photos?: string[];
  }): Promise<Vehicle> {
    const clean = plate.toUpperCase().replace(/\s+/g, '');
    const res = await fetch(`${getApiBaseUrl()}/vehicles/${clean}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Servis geçmişi eklenemedi.'); }
    return res.json();
  },
};

/* ─── Appointments API ────────────────────────── */
export const appointmentApi = {
  async create(data: {
    customerName: string; customerPhone: string;
    plate: string; brand?: string;
    problemDesc: string; problemPhoto?: string;
    requestedDate: string; requestedTime: string; master: string;
  }): Promise<Appointment> {
    const res = await fetch(`${getApiBaseUrl()}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Randevu oluşturulamadı.'); }
    return res.json();
  },

  async getAll(params?: { status?: string; master?: string; date?: string }): Promise<Appointment[]> {
    const url = new URL(getApiBaseUrl() + '/appointments');
    if (params?.status) url.searchParams.append('status', params.status);
    if (params?.master) url.searchParams.append('master', params.master);
    if (params?.date)   url.searchParams.append('date', params.date);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Randevular yüklenemedi.');
    return res.json();
  },

  async getOne(id: number): Promise<Appointment> {
    const res = await fetch(`${getApiBaseUrl()}/appointments/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status === 404 ? 'Randevu bulunamadı.' : 'Randevu bilgisi alınamadı.');
    return res.json();
  },

  async getCalendar(master?: string): Promise<Record<string, CalendarDay[]>> {
    const url = new URL(getApiBaseUrl() + '/appointments/calendar');
    if (master) url.searchParams.append('master', master);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Takvim yüklenemedi.');
    return res.json();
  },

  async approve(id: number, data: { confirmedDate: string; confirmedTime: string; masterNote?: string }): Promise<Appointment> {
    const res = await fetch(`${getApiBaseUrl()}/appointments/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Onaylanamadı.'); }
    return res.json();
  },

  async reject(id: number, data: { rejectionReason: string }): Promise<Appointment> {
    const res = await fetch(`${getApiBaseUrl()}/appointments/${id}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Reddedilemedi.'); }
    return res.json();
  },

  async cancel(id: number, data?: { cancelReason?: string }): Promise<Appointment> {
    const res = await fetch(`${getApiBaseUrl()}/appointments/${id}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {}),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'İptal edilemedi.'); }
    return res.json();
  },
};
