'use client';

import { Eye, EyeOff, Eraser, LocateFixed } from 'lucide-react';
import { useState } from 'react';
import { QR_TYPES } from '@/lib/qr/encoders';
import type { Field, QRTypeId } from '@/lib/qr/types';
import { useEncoded, useQR, useValues } from '@/store/qr-store';

const INPUT_TYPE: Partial<Record<Field['kind'], string>> = {
  url: 'url',
  tel: 'tel',
  email: 'email',
  number: 'number',
  datetime: 'datetime-local'
};

export function QRContentForm() {
  const type = useQR((s) => s.type);
  // remonta el formulario al cambiar de tipo para resetear estado local
  return <ContentFields key={type} type={type} />;
}

function ContentFields({ type }: { type: QRTypeId }) {
  const values = useValues();
  const setValue = useQR((s) => s.setValue);
  const clear = useQR((s) => s.clearContent);
  const result = useEncoded();

  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [showPass, setShowPass] = useState(false);
  const [geoMsg, setGeoMsg] = useState('');

  // los errores solo se muestran después de salir del campo, no mientras se escribe
  const error = !result.ok && !result.empty && result.field && touched.has(result.field) ? result : null;
  const touch = (name: string) => setTouched((t) => (t.has(name) ? t : new Set(t).add(name)));

  const locate = () => {
    if (!navigator.geolocation) return setGeoMsg('Tu navegador no comparte la ubicación.');
    setGeoMsg('Buscando ubicación…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setValue('coords', `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
        setGeoMsg('Ubicación lista.');
      },
      () => setGeoMsg('No se pudo obtener tu ubicación. Pegala a mano.')
    );
  };

  const fields = QR_TYPES[type].fields.filter((f) => !f.hideWhen?.(values));

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const id = `f-${type}-${f.name}`;
          const value = values[f.name] ?? '';
          const invalid = error?.field === f.name;
          const common = {
            id,
            name: f.name,
            placeholder: f.placeholder,
            autoComplete: f.autoComplete,
            maxLength: f.maxLength,
            'aria-invalid': invalid || undefined,
            'aria-describedby': invalid ? `${id}-err` : undefined,
            onBlur: () => touch(f.name)
          };

          if (f.kind === 'checkbox') {
            return (
              <label key={f.name} className="flex cursor-pointer items-center gap-2.5 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={value === 'true'}
                  onChange={(e) => setValue(f.name, e.target.checked ? 'true' : '')}
                  className="size-4 rounded accent-accent"
                />
                {f.label}
              </label>
            );
          }

          let control;
          if (f.kind === 'textarea') {
            control = <textarea {...common} rows={3} className="input" value={value} onChange={(e) => setValue(f.name, e.target.value)} />;
          } else if (f.kind === 'select') {
            control = (
              <select {...common} className="input" value={value} onChange={(e) => setValue(f.name, e.target.value)}>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            );
          } else if (f.kind === 'password') {
            control = (
              <div className="relative">
                <input
                  {...common}
                  type={showPass ? 'text' : 'password'}
                  spellCheck={false}
                  className="input pr-10"
                  value={value}
                  onChange={(e) => setValue(f.name, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPass}
                  className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted hover:text-fg"
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            );
          } else if (f.kind === 'geo') {
            control = (
              <div className="flex gap-2">
                <input {...common} inputMode="decimal" className="input" value={value} onChange={(e) => setValue(f.name, e.target.value)} />
                <button type="button" className="btn shrink-0" onClick={locate}>
                  <LocateFixed className="size-4" aria-hidden />
                  <span className="hidden sm:inline">Mi ubicación</span>
                </button>
              </div>
            );
          } else {
            control = (
              <input
                {...common}
                type={INPUT_TYPE[f.kind] ?? 'text'}
                step={f.kind === 'number' ? '0.01' : undefined}
                min={f.kind === 'number' ? 0 : undefined}
                className="input"
                value={value}
                onChange={(e) => setValue(f.name, e.target.value)}
              />
            );
          }

          return (
            <div key={f.name} className={f.wide ? 'sm:col-span-2' : undefined}>
              <label htmlFor={id} className="label">{f.label}</label>
              {control}
              {invalid && (
                <p id={`${id}-err`} className="mt-1.5 text-xs text-danger">{error?.error}</p>
              )}
              {f.kind === 'geo' && (
                <p className="mt-1.5 text-xs text-muted" aria-live="polite">
                  {geoMsg || 'En Google Maps, clic derecho sobre el lugar y copiá las coordenadas.'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="btn h-8 px-3 text-xs"
          onClick={() => {
            clear();
            setTouched(new Set());
            setGeoMsg('');
          }}
        >
          <Eraser className="size-3.5" aria-hidden />
          Limpiar
        </button>
      </div>
    </form>
  );
}
