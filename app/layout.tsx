import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'QR Studio — Generador de códigos QR',
  description: 'Creá códigos QR personalizados para enlaces, WiFi, redes, pagos y más. Logos, marcos y exportación en alta calidad.'
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1a1b26' },
    { media: '(prefers-color-scheme: light)', color: '#eef0f7' }
  ]
};

// se aplica antes de pintar para evitar el parpadeo de tema
const themeScript = `document.documentElement.dataset.theme=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
