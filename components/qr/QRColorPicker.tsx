'use client';

import { TriangleAlert } from 'lucide-react';
import { ChoiceGroup, type Choice } from '@/components/ui/ChoiceGroup';
import { ColorInput } from '@/components/ui/ColorInput';
import { contrast } from '@/lib/color';
import { GRADIENTS } from '@/lib/qr/presets';
import type { GradientId } from '@/lib/qr/types';
import { useQR } from '@/store/qr-store';

const swatch = (from: string, to: string) => (
  <span className="block h-7 w-full rounded-lg ring-1 ring-black/10" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} />
);

export function QRColorPicker() {
  const design = useQR((s) => s.design);
  const setDesign = useQR((s) => s.setDesign);
  const { gradient, custom } = design;

  const options: Choice<GradientId>[] = [
    { value: 'none', label: 'Sólido', preview: swatch(design.fg, design.fg) },
    ...(Object.entries(GRADIENTS) as [Exclude<GradientId, 'none' | 'custom'>, (typeof GRADIENTS)['blue']][]).map(([id, g]) => ({
      value: id,
      label: g.label,
      preview: swatch(g.from, g.to)
    })),
    { value: 'custom', label: 'Custom', preview: swatch(custom.from, custom.to) }
  ];

  // el tono con menos contraste contra el fondo es el que limita la lectura
  const inks = gradient === 'none' ? [design.fg] : gradient === 'custom' ? [custom.from, custom.to] : [GRADIENTS[gradient].from, GRADIENTS[gradient].to];
  const ratio = Math.min(...inks.map((c) => contrast(c, design.bg)));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <ColorInput label="Color QR" value={design.fg} onChange={(fg) => setDesign({ fg })} disabled={gradient !== 'none'} />
        <ColorInput label="Color fondo" value={design.bg} onChange={(bg) => setDesign({ bg })} />
      </div>

      <ChoiceGroup
        legend="Gradiente"
        name="gradient"
        value={gradient}
        options={options}
        onChange={(g) => setDesign({ gradient: g })}
        className="grid-cols-4 sm:grid-cols-7 lg:grid-cols-4 xl:grid-cols-7"
      />

      {gradient === 'custom' && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-line bg-bg/40 p-3">
          <ColorInput label="Inicio" value={custom.from} onChange={(from) => setDesign({ custom: { ...custom, from } })} />
          <ColorInput label="Fin" value={custom.to} onChange={(to) => setDesign({ custom: { ...custom, to } })} />
          <label className="col-span-2">
            <span className="label">Ángulo · {custom.angle}°</span>
            <input
              type="range"
              min={0}
              max={360}
              step={15}
              value={custom.angle}
              onChange={(e) => setDesign({ custom: { ...custom, angle: Number(e.target.value) } })}
              className="w-full accent-accent"
            />
          </label>
        </div>
      )}

      {ratio < 3 && (
        <p className="flex items-start gap-2 rounded-xl border border-warn/30 bg-warn/10 p-3 text-xs text-warn" role="alert">
          <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          Poco contraste entre el QR y el fondo ({ratio.toFixed(1)}:1). Algunos lectores podrían no escanearlo.
        </p>
      )}
    </div>
  );
}
