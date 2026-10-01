'use client';

import { UtensilsCrossed } from 'lucide-react';
import { logoSrc } from '@/lib/qr/logos';
import { TEMPLATES } from '@/lib/qr/presets';
import { useQR } from '@/store/qr-store';

export function QRTemplateSelector() {
  const applyTemplate = useQR((s) => s.applyTemplate);

  return (
    <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
      {TEMPLATES.map((t) => (
        <li key={t.id} className="snap-start">
          <button
            type="button"
            onClick={() => applyTemplate(t.id)}
            className="group flex w-36 flex-col items-start gap-3 rounded-xl border border-line bg-elevated p-3 text-left transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10"
          >
            <span
              className="grid size-9 place-items-center rounded-lg text-white"
              style={{ background: `linear-gradient(135deg, ${t.frameColor}, ${t.design.fg ?? t.frameColor})` }}
            >
              {t.logo.kind === 'preset' ? (
                <img src={logoSrc(t.logo.id)} alt="" className="size-9 rounded-lg" />
              ) : (
                <UtensilsCrossed className="size-4" aria-hidden />
              )}
            </span>
            <span>
              <span className="block text-sm font-semibold">{t.label}</span>
              <span className="block text-[11px] leading-snug text-muted">{t.hint}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
