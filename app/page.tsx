import { QrCode } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { QRGenerator } from '@/components/qr/QRGenerator';

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line/70 bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-linear-to-br from-accent to-accent-2 text-white shadow-lg shadow-accent/25">
              <QrCode className="size-4" aria-hidden />
            </span>
            QR Studio
            <span className="rounded-full border border-line bg-elevated px-2 py-0.5 text-[10px] font-medium text-muted">Beta</span>
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8 max-w-2xl lg:mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Códigos QR con{' '}
            <span className="bg-linear-to-r from-accent via-accent-2 to-cyan bg-clip-text text-transparent">identidad propia</span>
          </h1>
          <p className="mt-3 text-sm text-pretty text-muted sm:text-base">
            Enlaces, WiFi, redes, pagos y tarjetas digitales. Personalizá colores, formas, logo y marco, y descargá en alta calidad.
          </p>
        </div>

        <QRGenerator />
      </main>

      <footer className="mx-auto max-w-7xl px-4 py-10 text-xs text-muted sm:px-6">
        Generado 100% en tu navegador · ningún dato sale de tu dispositivo.
      </footer>
    </>
  );
}
