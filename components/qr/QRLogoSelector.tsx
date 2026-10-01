'use client';

import { ImageUp, X } from 'lucide-react';
import { useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { LOGOS, logoSrc } from '@/lib/qr/logos';
import { useQR } from '@/store/qr-store';

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED: Record<string, RegExp> = {
  'image/png': /\.png$/i,
  'image/jpeg': /\.jpe?g$/i,
  'image/svg+xml': /\.svg$/i
};

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function QRLogoSelector() {
  const logo = useQR((s) => s.logo);
  const setLogo = useQR((s) => s.setLogo);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const errId = useId();

  async function load(file: File | undefined) {
    if (!file) return;
    setError('');

    // se valida MIME y extensión: el MIME solo depende del nombre en algunos SO
    if (!ALLOWED[file.type]?.test(file.name)) return setError('Formato no soportado. Usá PNG, JPG o SVG.');
    if (file.size > MAX_BYTES) return setError('La imagen supera los 2 MB.');

    try {
      const src = await readFile(file);
      // confirma que el navegador realmente puede decodificarla
      const img = new Image();
      img.src = src;
      await img.decode();
      setLogo({ kind: 'custom', src, name: file.name });
    } catch {
      setError('No se pudo leer la imagen.');
    }
  }

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    void load(e.target.files?.[0]);
    e.target.value = '';
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    void load(e.dataTransfer.files[0]);
  };

  const presetId = logo.kind === 'preset' ? logo.id : logo.kind;

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="label">Logos rápidos</legend>
        <div className="grid grid-cols-5 gap-2">
          <label className="tile aspect-square justify-center p-1.5">
            <input type="radio" name="logo" className="sr-only" checked={presetId === 'none'} onChange={() => setLogo({ kind: 'none' })} />
            <X className="size-5" aria-hidden />
            <span className="sr-only">Sin logo</span>
          </label>
          {LOGOS.map((l) => (
            <label key={l.id} className="tile aspect-square justify-center p-1.5" title={l.label}>
              <input
                type="radio"
                name="logo"
                className="sr-only"
                checked={presetId === l.id}
                onChange={() => setLogo({ kind: 'preset', id: l.id })}
              />
              <img src={logoSrc(l.id)} alt="" className="size-7 rounded-lg" />
              <span className="sr-only">{l.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <span className="label">Logo personalizado</span>
        {logo.kind === 'custom' ? (
          <div className="flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/5 p-3">
            <img src={logo.src} alt="Vista previa del logo" className="size-12 rounded-lg bg-white object-contain p-1 ring-1 ring-line" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{logo.name}</p>
              <p className="text-xs text-muted">Aplicado al centro del QR</p>
            </div>
            <button type="button" className="btn h-8 px-3 text-xs" onClick={() => inputRef.current?.click()}>
              Cambiar
            </button>
            <button type="button" className="btn size-8 p-0" aria-label="Quitar logo" onClick={() => setLogo({ kind: 'none' })}>
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            aria-describedby={error ? errId : undefined}
            className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
              drag ? 'border-accent bg-accent/10' : 'border-line hover:border-muted/50 hover:bg-elevated'
            }`}
          >
            <span className="grid size-10 place-items-center rounded-full bg-accent/10 text-accent">
              <ImageUp className="size-5" aria-hidden />
            </span>
            <span className="text-sm font-medium">Subí o arrastrá tu logo</span>
            <span className="text-xs text-muted">PNG, JPG o SVG · máx. 2 MB</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={onPick}
        />
        {error && (
          <p id={errId} role="alert" className="mt-2 text-xs text-danger">{error}</p>
        )}
      </div>
    </div>
  );
}
