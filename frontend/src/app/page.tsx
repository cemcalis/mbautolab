'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, QrCode, CheckCircle, Printer, Wrench, ArrowRight,
  ShieldCheck, Clock, Award, Star, Activity, Settings, HelpCircle, 
  PhoneCall, MapPin, ChevronDown, Check, Users, ShieldAlert, BadgeCheck
} from 'lucide-react';
import QrScannerModal from '@/components/QrScannerModal';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};



const STATS = [
  { icon: <Award size={20} />, number: '15+', label: 'Yıllık Sektör Deneyimi' },
  { icon: <Users size={20} />, number: '2', label: 'Uzman Baş Usta (Fatih & Mustafa)' },
  { icon: <CheckCircle size={20} />, number: '10.000+', label: 'Başarılı Servis Kaydı' },
  { icon: <Star size={20} />, number: '%99.8', label: 'Müşteri Memnuniyeti' },
];

const SERVICES = [
  {
    icon: <Settings size={24} />,
    title: 'Periyodik Bakım',
    desc: 'Motor yağı, filtreler, sıvı kontrolleri ve 30+ nokta araç check-up hizmeti.',
    details: ['Mobil 1 Yağ Teknolojisi', 'Orijinal Filtre Setleri', 'Detaylı Kontrol Raporu']
  },
  {
    icon: <Wrench size={24} />,
    title: 'Motor & Şanzıman',
    desc: 'Detaylı motor rektifiyesi, şanzıman revizyonu ve mekanik arıza onarımları.',
    details: ['Garantili Revizyon', 'Tork Değerinde Sıkım', 'Orijinal Yedek Parça']
  },
  {
    icon: <Activity size={24} />,
    title: 'Arıza Tespit (OBD)',
    desc: 'Lisanslı arıza tespit cihazlarımızla elektronik beyin (ECU) taraması ve kodlama.',
    details: ['Detaylı Hata Kodu Analizi', 'Canlı Veri Takibi', 'Sensör Kalibrasyonları']
  },
  {
    icon: <CheckCircle size={24} />,
    title: 'Fren & Süspansiyon',
    desc: 'Disk, balata değişimi, kaliper bakımı, amortisör ve alt takım elemanları onarımı.',
    details: ['Brembo & TRW Ürünleri', 'Hidrolik Testi', 'Süspansiyon Ayarları']
  },
  {
    icon: <ShieldAlert size={24} />,
    title: 'Elektrik & Beyin',
    desc: 'Kablo tesisat tamiri, şarj/marş dinamosu bakımı ve akü performans testleri.',
    details: ['Varta Akü Bayiliği', 'Tesisat Yenileme', 'Elektronik Modül Onarımı']
  },
  {
    icon: <ShieldCheck size={24} />,
    title: 'Egzoz & Emisyon',
    desc: 'Katalizör, partikül filtresi (DPF) temizliği ve egzoz sistemi kaçak onarımları.',
    details: ['DPF Rejenerasyonu', 'Emisyon Standart Uyumu', 'Performans Egzoz Bakımı']
  },
];

const FAQS = [
  {
    q: 'QR Kodlu Araç Takip Sistemi nasıl çalışır?',
    a: 'Servisimize ilk kez gelen her araca özel bir QR kod etiketi atanır ve aracın torpido gözüne veya kapı içine yapıştırılır. Ustalarımız araç üzerinde işlem yaptıkça değiştirilen parçaların fotoğraflarını, yapılan işlemleri ve güncel kilometreyi sisteme kaydeder. Siz de bu QR kodu telefonunuzla taratarak şifresiz ve üyeliksiz şekilde tüm servis geçmişinize anında ulaşabilirsiniz.'
  },
  {
    q: 'Değiştirilen eski parçaları ve fotoğrafları görebilir miyim?',
    a: 'Kesinlikle. MB AUTOLAB olarak en hassas olduğumuz konu şeffaflıktır. Aracınızdan sökülen eski parçaların fotoğrafları sisteme yüklenir ve parça kutuları teslimat esnasında bagajınızda size teslim edilir. QR kod sayfanızda hangi parçanın ne zaman değiştiğini fotoğraflı kanıtıyla görürsünüz.'
  },
  {
    q: 'Randevu talebi oluşturduktan sonra süreç nasıl ilerler?',
    a: 'Web sitemizden oluşturduğunuz randevu talebi usta panelimize anında düşer. Seçtiğiniz usta (Fatih veya Mustafa Usta) takvim uygunluğuna göre talebinizi inceler, saat veya tarihi kesinleştirip onaylar. Onay durumu ve usta notu randevu takip sayfanızda anlık olarak güncellenir.'
  },
  {
    q: 'Hangi marka ve model araçlara bakıyorsunuz?',
    a: 'Binek ve hafif ticari tüm marka/model araçlara hizmet vermekteyiz. Özellikle yeni nesil Alman (BMW, Mercedes, Audi, Volkswagen) ve Japon araçlarının gelişmiş elektronik beyin arıza tespit işlemlerinde uzman kadroya sahibiz.'
  },
];

export default function Home() {
  const router = useRouter();
  const [searchPlate, setSearchPlate] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedPlate, setFocusedPlate] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const formatPlate = (val: string) => val.toUpperCase().replace(/[^A-Z0-9\s]/g, '');

  const handleSearch = async () => {
    if (!searchPlate.trim()) return;
    setLoading(true);
    const clean = searchPlate.replace(/\s+/g, '');
    router.push(`/arac/${clean}`);
  };

  const handleScanSuccess = (decoded: string) => {
    setIsScannerOpen(false);
    let plate = decoded;
    try {
      if (decoded.startsWith('http')) {
        const u = new URL(decoded);
        const segs = u.pathname.split('/');
        const idx = segs.indexOf('arac');
        plate = idx !== -1 && segs[idx + 1] ? segs[idx + 1] : u.searchParams.get('plaka') || decoded;
      }
    } catch {}
    const clean = formatPlate(plate).replace(/\s+/g, '');
    if (clean) router.push(`/arac/${clean}`);
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: 60 }}>
      <motion.div variants={container} initial="hidden" animate="show">

        {/* ── HERO SECTION ───────────────────────────── */}
        <motion.div variants={item} className="hero" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="hero-eyebrow" style={{ display: 'inline-flex', margin: '0 auto 16px' }}>
            <span className="hero-eyebrow-dot" />
            MB AUTOLAB · Kurumsal & Dijital Oto Servis
          </div>

          <h1 className="hero-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1.15, fontWeight: 900 }}>
            Aracınızın Tüm Geçmişi<br />
            <span className="gradient-word">Tek Bir QR Kodda</span>
          </h1>

          <p className="hero-sub" style={{ maxWidth: 640, margin: '16px auto 0', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
            Fatih ve Mustafa Usta'nın profesyonel dokunuşlarıyla yapılan tüm bakım kayıtları, parça fotoğrafları ve kilometre verileri dijital güvence altında.
          </p>
        </motion.div>

        {/* ── SEARCH CARD ────────────────────────────── */}
        <motion.div variants={item} style={{ marginBottom: 48 }}>
          <div className="card" style={{ borderTop: '3px solid var(--blue)', maxWidth: 680, margin: '0 auto' }}>
            <div className="card-header" style={{ textAlign: 'center' }}>
              <h2 className="card-title font-heading" style={{ fontSize: '1.25rem', fontWeight: 800 }}>Plakadan Dijital Geçmiş Sorgula</h2>
              <p className="card-subtitle">Plakanızı yazın ya da araca yapıştırılmış QR kodu taratın</p>
              <div className="card-title-underline" style={{ margin: '10px auto 0' }} />
            </div>

            {/* Plate input */}
            <div style={{ marginBottom: 20 }}>
              <div
                className={`plate-input-wrap${focusedPlate ? ' focused' : ''}`}
                style={{ maxWidth: 380, margin: '0 auto' }}
              >
                <div className="plate-country">
                  <span className="plate-country-stars" style={{ fontSize: '0.65rem' }}>★ ★ ★</span>
                  TR
                </div>
                <input
                  type="text"
                  className="plate-field"
                  placeholder="34 MBA 99"
                  value={searchPlate}
                  onChange={e => setSearchPlate(formatPlate(e.target.value))}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  onFocus={() => setFocusedPlate(true)}
                  onBlur={() => setFocusedPlate(false)}
                  maxLength={12}
                  autoComplete="off"
                  spellCheck={false}
                  style={{ fontSize: '1.5rem', letterSpacing: '1px' }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSearch}
                disabled={loading || !searchPlate.trim()}
                style={{ minWidth: 190 }}
              >
                {loading ? (
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                ) : (
                  <Search size={18} />
                )}
                Sorgula & İncele
              </button>
              <button
                className="btn btn-accent btn-lg"
                onClick={() => setIsScannerOpen(true)}
                style={{ minWidth: 190 }}
              >
                <QrCode size={18} />
                Hızlı QR Kod Tara
              </button>
            </div>


          </div>
        </motion.div>

        {/* ── STATS BAR ──────────────────────────────── */}
        <motion.div variants={item} style={{ marginBottom: 56 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-lg)',
            padding: '24px 20px',
          }}>
            {STATS.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 14px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(0,162,232,0.08)', border: '1.5px solid rgba(0,162,232,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)'
                }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '1.65rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    lineHeight: 1.1
                  }}>{s.number}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── THE QR WORKFLOW (NASIL ÇALIŞIR?) ────────── */}
        <motion.div variants={item} style={{ marginBottom: 56 }}>
          <div className="card" style={{ padding: '36px 30px' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div className="section-label" style={{ display: 'inline-block' }}>Dijital Takip Süreci</div>
              <h2 className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 8 }}>Nasıl Çalışır?</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 4 }}>Aracınızın kabulünden teslimatına kadar 100% şeffaf adımlar</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
              {[
                { num: '01', title: 'Kabul & QR Kart Ataması', desc: 'Servise girdiğinizde aracınız sisteme eklenir ve ona özel QR Kod basılarak torpido bölmesine yapıştırılır.' },
                { num: '02', title: 'Ustadan Canlı Kayıt', desc: 'Fatih veya Mustafa Usta, bakım esnasında değişen her parçanın, yapılan her işlemin fotoğrafını çekerek QR profiline işler.' },
                { num: '03', title: 'Sorgulama & Arşiv', desc: 'Telefonunuzun kamerasıyla QR kodu taratarak yapılan tüm işlemleri, km geçmişini ve parça fotoğraflarını anlık görün.' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
                  <div style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1,
                  }}>
                    {s.num}
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── SERVICES SECTION ───────────────────────── */}
        <motion.div variants={item} style={{ marginBottom: 56 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div className="section-label" style={{ display: 'inline-block' }}>Profesyonel Hizmetlerimiz</div>
            <h2 className="font-heading" style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: 8 }}>Neler Yapıyoruz?</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 4 }}>Gelişmiş ekipmanlar ve usta tecrübesiyle her marka araca premium mühendislik çözümleri</p>
          </div>

          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {SERVICES.map((s, i) => (
              <motion.div
                key={i}
                className="feature-card"
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '28px 24px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--r-lg)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: 'var(--r-md)',
                  background: 'rgba(0,162,232,0.06)', border: '1px solid rgba(0,162,232,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)',
                  marginBottom: 20
                }}>
                  {s.icon}
                </div>
                <h3 className="feature-title" style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginBottom: 10 }}>{s.title}</h3>
                <p className="feature-desc" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{s.desc}</p>
                
                {/* Tech list */}
                <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {s.details.map((d, dIdx) => (
                    <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <Check size={12} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── WHY CHOOSE US (NEDEN BİZ?) ──────────────── */}
        <motion.div variants={item} style={{ marginBottom: 56 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-lg)',
            padding: '36px 30px',
            alignItems: 'center'
          }}>
            <div>
              <div className="section-label" style={{ marginBottom: 12 }}>Kurumsal Standartlar</div>
              <h2 className="font-heading" style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.25, color: 'var(--text-primary)' }}>
                Neden MB AUTOLAB?<br />
                <span className="gradient-word">Farkımız Şeffaflık</span>
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 14, marginBottom: 24 }}>
                Geleneksel sanayi tecrübesini dijital çağın şeffaflığıyla harmanladık. MB AUTOLAB çatısı altında yapılan hiçbir işlem kapalı kapılar ardında kalmaz.
              </p>
              <button className="btn btn-primary" onClick={() => router.push('/randevu')} style={{ gap: 8 }}>
                <Clock size={16} /> Randevu Talebi Oluştur <ArrowRight size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { title: 'Çift Usta Kontrolü', desc: 'Fatih ve Mustafa Usta her kritik işlemi ortaklaşa kontrol eder ve dijital imzayla onaylar.' },
                { title: 'Sözlü Değil, Fotoğraflı Güvence', desc: 'Değişen her parçanın eski ve yeni hallerini gösteren fotoğraflar veritabanımıza süresiz olarak kaydedilir.' },
                { title: 'Plakadan Kolay Takip', desc: 'Aracınızın durumunu öğrenmek için servisi aramanıza gerek yok. Plaka sorgulayarak hangi aşamada olduğunu anında görebilirsiniz.' },
                { title: 'TSE Standartlarında Ekipman', desc: 'Arıza tespiti ve mekanik kalibrasyonlarda en güncel teknolojik bilgisayar sistemlerini kullanıyoruz.' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 14, background: 'var(--bg-card)', padding: '16px 20px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border-default)' }}>
                  <div style={{ color: 'var(--blue)', marginTop: 3 }}><BadgeCheck size={20} /></div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{item.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── FAQ (SIKÇA SORULAN SORULAR) ──────────────── */}
        <motion.div variants={item} style={{ marginBottom: 56 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div className="section-label" style={{ display: 'inline-block' }}>Merak Edilenler</div>
            <h2 className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 8 }}>Sıkça Sorulan Sorular</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 4 }}>Dijital oto servisimiz ve çalışma prensiplerimiz hakkında bilmek istedikleriniz</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 800, margin: '0 auto' }}>
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  style={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border-default)', 
                    borderRadius: 'var(--r-md)', 
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: isOpen ? '0 4px 12px rgba(0,0,0,0.03)' : 'none'
                  }}
                >
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: isOpen ? 'var(--blue)' : 'var(--text-primary)',
                      gap: 12
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <HelpCircle size={16} style={{ color: isOpen ? 'var(--blue)' : 'var(--text-muted)' }} />
                      {faq.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div style={{ 
                          padding: '0 24px 20px', 
                          fontSize: '0.88rem', 
                          color: 'var(--text-secondary)', 
                          lineHeight: 1.65,
                          borderTop: '1px solid var(--border-default)',
                          paddingTop: 16
                        }}>
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── CONTACT & FOOTER SECTION ─────────────────── */}
        <motion.div variants={item}>
          <div className="card" style={{ borderTop: '3px solid var(--blue)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, color: '#fff', fontSize: '1.2rem',
              }}>
                <PhoneCall size={20} />
              </div>
              <div>
                <h2 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 800 }}>İletişim & Lokasyon</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Bizimle iletişime geçin veya konumumuzu haritada görün</p>
              </div>
            </div>

            {/* Corporate Contacts Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 30 }}>

              {/* WhatsApp 1 */}
              <motion.a
                href="https://wa.me/905488582702"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px', borderRadius: 'var(--r-md)',
                  background: 'rgba(37,211,102,0.06)',
                  border: '1.5px solid rgba(37,211,102,0.2)',
                  textDecoration: 'none', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(37,211,102,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25d366', flexShrink: 0 }}>
                  <i className="fa-brands fa-whatsapp" style={{ fontSize: 20 }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(37,211,102,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Fatih Usta WhatsApp</p>
                  <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>+90 548 858 27 02</p>
                </div>
              </motion.a>

              {/* WhatsApp 2 */}
              <motion.a
                href="https://wa.me/905391080870"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px', borderRadius: 'var(--r-md)',
                  background: 'rgba(37,211,102,0.06)',
                  border: '1.5px solid rgba(37,211,102,0.2)',
                  textDecoration: 'none', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(37,211,102,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25d366', flexShrink: 0 }}>
                  <i className="fa-brands fa-whatsapp" style={{ fontSize: 20 }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(37,211,102,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Mustafa Usta WhatsApp</p>
                  <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>+90 539 108 08 70</p>
                </div>
              </motion.a>

              {/* Instagram */}
              <motion.a
                href="https://www.instagram.com/mb.autolab?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px', borderRadius: 'var(--r-md)',
                  background: 'linear-gradient(135deg, rgba(131,58,180,0.06), rgba(253,29,29,0.06))',
                  border: '1.5px solid rgba(200,70,140,0.2)',
                  textDecoration: 'none', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                  <i className="fa-brands fa-instagram" style={{ fontSize: 18 }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', background: 'linear-gradient(90deg, #833ab4, #fd1d1d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Instagram Profilimiz</p>
                  <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>@mb.autolab</p>
                </div>
              </motion.a>

              {/* Google Maps Location */}
              <motion.a
                href="https://maps.app.goo.gl/qX78u5sq5nLgRusAA"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px', borderRadius: 'var(--r-md)',
                  background: 'rgba(66,133,244,0.06)',
                  border: '1.5px solid rgba(66,133,244,0.2)',
                  textDecoration: 'none', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(66,133,244,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={18} style={{ color: '#ea4335' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: '#4285f4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2, opacity: 0.9 }}>Haritada Gör</p>
                  <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>Konumu Google Maps'te Aç</p>
                </div>
              </motion.a>
            </div>

            {/* Corporate Address & Operating Hours Footer Panel */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
              borderTop: '1px solid var(--border-default)',
              paddingTop: 24,
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>


              <div>
                <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, fontFamily: 'Space Grotesk, sans-serif' }}>Çalışma Saatleri</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Hafta İçi:</span><strong>08:30 - 18:00</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cumartesi:</span><strong>09:00 - 15:00</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pazar:</span><span style={{ color: 'var(--red)', fontWeight: 700 }}>Kapalı</span></div>
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, fontFamily: 'Space Grotesk, sans-serif' }}>Dijital Altyapı</h4>
                <p style={{ lineHeight: 1.6 }}>
                  Her aracın işlem geçmişi şifreli QR bulutumuzda saklanır. Bakım detaylarınızı ömür boyu sorgulayabilirsiniz.
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-default)', marginTop: 24, paddingTop: 18, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} MB AUTOLAB. Tüm hakları saklıdır. Professional Car Service Systems.
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <QrScannerModal
            onClose={() => setIsScannerOpen(false)}
            onScanSuccess={handleScanSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
