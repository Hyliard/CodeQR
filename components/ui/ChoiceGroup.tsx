import type { ReactNode } from 'react';

export interface Choice<T extends string> {
  value: T;
  label: string;
  preview?: ReactNode;
}

interface Props<T extends string> {
  legend: string;
  name: string;
  value: T;
  options: Choice<T>[];
  onChange: (value: T) => void;
  className?: string;
}

/** Grupo de radios nativos con apariencia de tarjetas (flechas del teclado incluidas) */
export function ChoiceGroup<T extends string>({ legend, name, value, options, onChange, className = 'grid-cols-4' }: Props<T>) {
  return (
    <fieldset>
      <legend className="label">{legend}</legend>
      <div className={`grid gap-2 ${className}`}>
        {options.map((o) => (
          <label key={o.value} className="tile">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.preview}
            <span className="truncate font-medium">{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
