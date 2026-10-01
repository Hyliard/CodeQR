'use client';

import { CheckCircle2, CircleDashed, TriangleAlert } from 'lucide-react';
import { useDeferredValue, useMemo, useRef, useState } from 'react';
import { QR_TYPES } from '@/lib/qr/encoders';
import { buildMatrix } from '@/lib/qr/render';
import { useEncoded, useQR } from '@/store/qr-store';
import { QRDownloadButtons } from './QRDownloadButtons';
import { QRGraphic } from './QRGraphic';

// se muestra difuminado mientras todavía no hay contenido válido
const SAMPLE = 'https://qr.studio/preview';

export function QRPreview() {
  const result = useEncoded();
  const type = useQR((s) => s.type);
  const design = useQR((s) => s.design);
  const logo = useQR((s) => s.logo);
  const frame = useQR((s) => s.frame);
  const svgRef = useRef<SVGSVGElement>(null);

  // conserva el último QR válido para no "saltar" mientras se escribe
  const [last, setLast] = useState<string | null>(null);
  if (result.ok && result.data !== last) setLast(result.data);

  const data = useDeferredValue(result.ok ? result.data : (last ?? SAMPLE));
  const hasLogo = logo.kind !== 'none';
  const matrix = useMemo(() => buildMatrix(data, hasLogo), [data, hasLogo]);

  const ready = result.ok && !!matrix;
  const status = !result.ok
    ? { tone: result.empty ? 'idle' : 'error', text: result.error }
    : !matrix
      ? { tone: 'error', text: hasLogo ? 'Demasiado contenido para un QR con logo. Quitá el logo o acortá el texto.' : 'Es demasiado contenido para un QR, acortalo un poco.' }
      : { tone: 'ok', text: 'Listo para descargar' };

  const Icon = status.tone === 'ok' ? CheckCircle2 : status.tone === 'error' ? TriangleAlert : CircleDashed;

  return (
    <section aria-labelledby="preview-title" className="overflow-hidden rounded-3xl border border-line bg-surface/80 shadow-xl shadow-black/10 backdrop-blur-sm">
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <h2 id="preview-title" className="text-sm font-semibold">Vista previa</h2>
          <p className="text-xs text-muted">Se actualiza en tiempo real</p>
        </div>
        {matrix && (
          <div className="flex gap-1.5 text-[11px] font-medium text-muted">
            <span className="rounded-full border border-line bg-elevated px-2.5 py-1">{QR_TYPES[type].label}</span>
            <span className="hidden rounded-full border border-line bg-elevated px-2.5 py-1 sm:inline" title="Nivel de corrección de errores">
              ECC {matrix.level}
            </span>
            <span className="hidden rounded-full border border-line bg-elevated px-2.5 py-1 sm:inline">
              {matrix.size}×{matrix.size}
            </span>
          </div>
        )}
      </header>

      <div className="relative grid place-items-center bg-[radial-gradient(circle_at_center,var(--glow),transparent_70%)] px-6 py-8 sm:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(var(--line)_1px,transparent_1px)] [background-size:18px_18px]"
        />
        {matrix ? (
          <QRGraphic
            ref={svgRef}
            matrix={matrix}
            design={design}
            logo={logo}
            frame={frame}
            label={`Código QR de ${QR_TYPES[type].label}`}
            className={`relative h-auto w-full max-w-[280px] drop-shadow-2xl transition duration-300 sm:max-w-[360px] ${ready ? '' : 'opacity-40 blur-[3px] grayscale'}`}
          />
        ) : (
          <div className="relative grid aspect-square w-full max-w-[280px] place-items-center rounded-3xl border border-dashed border-line text-sm text-muted sm:max-w-[360px]">
            Sin vista previa
          </div>
        )}
      </div>

      <p
        role="status"
        aria-live="polite"
        className={`flex items-center justify-center gap-2 border-t border-line px-5 py-3 text-center text-xs font-medium ${
          status.tone === 'ok' ? 'text-emerald-500 dark:text-emerald-400' : status.tone === 'error' ? 'text-danger' : 'text-muted'
        }`}
      >
        <Icon className="size-3.5 shrink-0" aria-hidden />
        {status.text}
      </p>

      <div className="border-t border-line p-5 sm:p-6">
        <QRDownloadButtons svgRef={svgRef} ready={ready} data={result.ok ? result.data : ''} />
      </div>
    </section>
  );
}
