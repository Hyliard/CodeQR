'use client';

import { useState } from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
}

const HEX = /^#[0-9a-f]{6}$/i;

export function ColorInput({ label, value, onChange, disabled }: Props) {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);

  // sincroniza el texto cuando el color cambia desde afuera (templates, picker)
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }

  const commit = (v: string) => {
    const hex = v.startsWith('#') ? v : `#${v}`;
    setDraft(v);
    if (HEX.test(hex)) onChange(hex.toLowerCase());
  };

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex h-10 items-center gap-2 rounded-xl border border-line bg-elevated pr-3 pl-1.5 shadow-xs focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label}: selector`}
          className="size-7 shrink-0 cursor-pointer rounded-lg border border-line bg-transparent p-0 [&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
        />
        <input
          value={draft}
          disabled={disabled}
          onChange={(e) => commit(e.target.value.trim())}
          onBlur={() => setDraft(value)}
          aria-label={`${label}: hexadecimal`}
          aria-invalid={!HEX.test(draft.startsWith('#') ? draft : `#${draft}`)}
          maxLength={7}
          spellCheck={false}
          className="w-full min-w-0 bg-transparent font-mono text-sm uppercase outline-none aria-invalid:text-danger"
        />
      </div>
    </div>
  );
}
