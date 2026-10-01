'use client';

import {
  BookUser, CalendarDays, Contact, IdCard, Link2, Mail, MapPin, MessageSquare, Phone, Type, Wifi, type LucideIcon
} from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { CATEGORIES, QR_TYPES } from '@/lib/qr/encoders';
import { logoSrc } from '@/lib/qr/logos';
import type { LogoId, QRCategory, QRTypeId } from '@/lib/qr/types';
import { useQR } from '@/store/qr-store';

const ICONS: Partial<Record<QRTypeId, LucideIcon>> = {
  url: Link2,
  text: Type,
  wifi: Wifi,
  contact: Contact,
  tel: Phone,
  sms: MessageSquare,
  email: Mail,
  geo: MapPin,
  event: CalendarDays,
  vcard: BookUser,
  bizcard: IdCard
};

function TypeIcon({ id }: { id: QRTypeId }) {
  const Icon = ICONS[id];
  if (Icon) return <Icon className="size-5" aria-hidden />;
  // redes y pagos usan su logo
  return <img src={logoSrc(id as LogoId)} alt="" className="size-5 rounded-md" />;
}

export function QRTypeSelector() {
  const type = useQR((s) => s.type);
  const setType = useQR((s) => s.setType);
  const current = QR_TYPES[type].category;

  const [tab, setTab] = useState<QRCategory>(current);
  const [seen, setSeen] = useState(type);

  // si el tipo cambia desde afuera (p. ej. un template) se sigue su categoría
  if (type !== seen) {
    setSeen(type);
    setTab(current);
  }

  const onKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = CATEGORIES[(i + step + CATEGORIES.length) % CATEGORIES.length];
    if (!next) return;
    setTab(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  const active = CATEGORIES.find((c) => c.id === tab) ?? CATEGORIES[0];

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Categorías" className="grid grid-cols-4 gap-1 rounded-xl border border-line bg-bg/60 p-1">
        {CATEGORIES.map((c, i) => (
          <button
            key={c.id}
            id={`tab-${c.id}`}
            type="button"
            role="tab"
            aria-selected={tab === c.id}
            aria-controls="type-panel"
            tabIndex={tab === c.id ? 0 : -1}
            onClick={() => setTab(c.id)}
            onKeyDown={(e) => onKey(e, i)}
            className="relative rounded-lg px-2 py-1.5 text-xs font-medium text-muted transition hover:text-fg aria-selected:bg-elevated aria-selected:text-fg aria-selected:shadow-sm"
          >
            {c.label}
            {current === c.id && tab !== c.id && (
              <span className="absolute top-1 right-1.5 size-1.5 rounded-full bg-accent" aria-label="(seleccionado)" />
            )}
          </button>
        ))}
      </div>

      <fieldset id="type-panel" role="tabpanel" aria-labelledby={`tab-${active?.id}`}>
        <legend className="sr-only">Tipo de QR</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {active?.types.map((t) => (
            <label key={t.id} className="tile py-3">
              <input
                type="radio"
                name="qr-type"
                value={t.id}
                checked={type === t.id}
                onChange={() => setType(t.id)}
                className="sr-only"
              />
              <TypeIcon id={t.id} />
              <span className="w-full truncate text-center font-medium">{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
