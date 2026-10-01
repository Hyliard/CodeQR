import { ChevronDown, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** Card colapsable basada en <details>: accesible por teclado sin JS extra */
export function Section({ title, description, icon: Icon, defaultOpen = true, children }: Props) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-line bg-surface/80 shadow-sm shadow-black/5 backdrop-blur-sm">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl px-5 py-4 select-none [&::-webkit-details-marker]:hidden">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/15">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="truncate text-xs text-muted">{description}</p>}
        </span>
        <ChevronDown className="size-4 text-muted transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-line px-5 py-5">{children}</div>
    </details>
  );
}
