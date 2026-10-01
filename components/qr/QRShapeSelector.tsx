'use client';

import { ChoiceGroup } from '@/components/ui/ChoiceGroup';
import { eye, modulesPath, type Matrix } from '@/lib/qr/render';
import type { DotShape, EyeShape } from '@/lib/qr/types';
import { useQR } from '@/store/qr-store';

// patrón fijo para las miniaturas
const PATTERN = [1, 1, 0, 1, 1, 1, 0, 1, 1];
const sample: Matrix = {
  size: 3,
  level: 'L',
  dark: (r, c) => r >= 0 && c >= 0 && r < 3 && c < 3 && PATTERN[r * 3 + c] === 1
};

const DOTS: { value: DotShape; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'diamond', label: 'Diamond' }
];

const EYES: { value: EyeShape; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
  { value: 'diamond', label: 'Diamond' }
];

const Thumb = ({ view, children }: { view: string; children: React.ReactNode }) => (
  <svg viewBox={view} className="size-9 text-fg" aria-hidden>
    {children}
  </svg>
);

export function QRShapeSelector() {
  const dots = useQR((s) => s.design.dots);
  const eyes = useQR((s) => s.design.eyes);
  const setDesign = useQR((s) => s.setDesign);

  return (
    <div className="space-y-5">
      <ChoiceGroup
        legend="Forma de los módulos"
        name="dots"
        value={dots}
        onChange={(v) => setDesign({ dots: v })}
        options={DOTS.map((o) => ({
          ...o,
          preview: (
            <Thumb view="-0.3 -0.3 3.6 3.6">
              <path d={modulesPath(sample, o.value)} fill="currentColor" />
            </Thumb>
          )
        }))}
      />

      <ChoiceGroup
        legend="Ojos (esquinas)"
        name="eyes"
        value={eyes}
        onChange={(v) => setDesign({ eyes: v })}
        options={EYES.map((o) => {
          const p = eye(o.value, 0, 0);
          return {
            ...o,
            preview: (
              <Thumb view="-0.5 -0.5 8 8">
                <path d={p.outer} fill="currentColor" fillRule="evenodd" />
                <path d={p.inner} fill="currentColor" />
              </Thumb>
            )
          };
        })}
      />
    </div>
  );
}
