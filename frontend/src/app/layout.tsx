import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MBAUTOLAB | Akıllı Oto Servis Takip Sistemi",
  description:
    "MBAUTOLAB profesyonel oto servis takip sistemi. Fatih ve Mustafa Usta güvencesiyle aracınızın bakım geçmişini, parça değişimlerini ve servis durumunu anlık görün.",
  keywords: "oto servis, araç takip, bakım geçmişi, QR kod, MBAUTOLAB",
  openGraph: {
    title: "MBAUTOLAB | Akıllı Oto Servis Takip",
    description: "Aracınızın servis geçmişini QR kod ile anında sorgulayın.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" data-theme="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body>
        {/* Ambient background glows */}
        <div className="bg-glow bg-glow-1" />
        <div className="bg-glow bg-glow-2" />

        {/* Sticky Navbar */}
        <Navbar />

        {/* Page Content */}
        <main style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </main>

        {/* Footer */}
        <footer className="site-footer" style={{ position: 'relative', zIndex: 1 }}>
          <div className="footer-inner">
            <p className="footer-brand">© 2026 MBAUTOLAB — Tüm Hakları Saklıdır</p>
            <p className="footer-sub">Fatih Usta &amp; Mustafa Usta tarafından titizlikle hizmet verilmektedir.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
