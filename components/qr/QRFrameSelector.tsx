'use client';

import { ChoiceGroup } from '@/components/ui/ChoiceGroup';
import { ColorInput } from '@/components/ui/ColorInput';
import { FRAMES } from '@/lib/qr/presets';
import { useQR } from '@/store/qr-store';
import { frameLayout } from './frames';

function FrameThumb({ id, color, bg }: { id: (typeof FRAMES)[number]['id']; color: string; bg: string }) {
  const meta = FRAMES.find((f) => f.id === id);
  const layout = frameLayout({ id, color, text: meta?.text ?? '' }, bg);
  const { x, y, size } = layout.qr;
  const inset = size * 0.08;

  return (
    <svg viewBox={`0 0 ${layout.width} ${layout.height}`} className="h-14 w-auto" aria-hidden>
      {layout.back}
      <rect x={x + inset} y={y + inset} width={size - inset * 2} height={size - inset * 2} rx={18} fill="currentColor" opacity={0.25} />
      {layout.front}
    </svg>
  );
}

export function QRFrameSelector() {
  const frame = useQR((s) => s.frame);
  const bg = useQR((s) => s.design.bg);
  const setFrame = useQR((s) => s.setFrame);
  const off = frame.id === 'none';

  return (
    <div className="space-y-5">
      <ChoiceGroup
        legend="Marco"
        name="frame"
        value={frame.id}
        onChange={(id) => setFrame({ id })}
        className="grid-cols-4 sm:grid-cols-7 lg:grid-cols-4 xl:grid-cols-7"
        options={FRAMES.map((f) => ({
          value: f.id,
          label: f.label,
          preview: f.id === 'none'
            ? <span className="grid h-14 place-items-center"><span className="size-10 rounded-lg border-2 border-dashed border-current opacity-40" /></span>
            : <FrameThumb id={f.id} color={frame.color} bg={bg} />
        }))}
      />

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label>
          <span className="label">Texto del marco</span>
          <input
            className="input"
            value={frame.text}
            maxLength={32}
            disabled={off}
            placeholder={off ? 'Elegí un marco' : 'Escanéame'}
            onChange={(e) => setFrame({ text: e.target.value })}
          />
        </label>
        <div className="sm:w-40">
          <ColorInput label="Color del marco" value={frame.color} disabled={off} onChange={(color) => setFrame({ color })} />
        </div>
      </div>
    </div>
  );
}
