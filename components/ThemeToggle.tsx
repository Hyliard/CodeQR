'use client';

import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  };

  // los íconos se alternan por CSS para no depender del estado en la hidratación
  return (
    <button type="button" onClick={toggle} className="btn size-9 p-0" aria-label="Cambiar tema">
      <Sun className="hidden size-4 dark:block" aria-hidden />
      <Moon className="size-4 dark:hidden" aria-hidden />
    </button>
  );
}
