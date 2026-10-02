'use client';

import { Check, Copy, Download, FileImage, FileCode2 } from 'lucide-react';
import { useState, type RefObject } from 'react';
import { exportSvg } from '@/lib/qr/export';
import type { ExportFormat } from '@/lib/qr/types';
import { useQR } from '@/store/qr-store';

interface Props {
  svgRef: RefObject<SVGSVGElement | null>;
  ready: boolean;
  data: string;
}

const SIZES = [512, 1024, 2048] as const;

const FORMATS: { id: ExportFormat; label: string; icon: typeof Download }[] = [
  { id: 'png', label: 'PNG', icon: Download },
  { id: 'jpg', label: 'JPG', icon: FileImage },
  { id: 'svg', label: 'SVG', icon: FileCode2 }
];

export function QRDownloadButtons({ svgRef, ready, data }: Props) {
  const fileName = useQR((s) => s.fileName);
  const setFileName = useQR((s) => s.setFileName);
  const matte = useQR((s) => s.design.bg);
  const [width, setWidth] = useState<number>(1024);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function download(format: ExportFormat) {
    if (!svgRef.current) return;
    setBusy(format);
    setMsg(null);
    try {
      await exportSvg(svgRef.current, { format, name: fileName, width, matte });
    } catch {
      setMsg({ ok: false, text: 'No se pudo exportar la imagen.' });
    } finally {
      setBusy(null);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(data);
      setMsg({ ok: true, text: 'Contenido copiado.' });
    } catch {
      setMsg({ ok: false, text: 'No se pudo copiar.' });
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <label>
          <span className="label">Nombre del archivo</span>
          <input className="input" value={fileName} maxLength={60} placeholder="qr" onChange={(e) => setFileName(e.target.value)} />
        </label>
        <label>
          <span className="label">Tamaño</span>
          <select className="input pr-8" value={width} onChange={(e) => setWidth(Number(e.target.value))}>
            {SIZES.map((s) => (
              <option key={s} value={s}>{s}px</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {FORMATS.map(({ id, label, icon: Icon }, i) => (
          <button
            key={id}
            type="button"
            disabled={!ready || busy !== null}
            onClick={() => download(id)}
            className={`btn ${i === 0 ? 'btn-primary' : ''}`}
            aria-label={`Descargar ${label}`}
          >
            <Icon className="size-4" aria-hidden />
            {busy === id ? '…' : label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button type="button" className="btn h-9 px-3 text-xs" disabled={!ready} onClick={copy}>
          {msg?.ok ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          Copiar contenido
        </button>
        <p role="status" aria-live="polite" className={`text-xs ${msg?.ok ? 'text-accent' : 'text-danger'}`}>
          {msg?.text}
        </p>
      </div>
    </div>
  );
}
