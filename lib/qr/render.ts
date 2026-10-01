import { create } from 'qrcode';
import type { DotShape, EyeShape } from './types';

export type Level = 'L' | 'M' | 'Q' | 'H';

export interface Matrix {
  size: number;
  level: Level;
  dark: (row: number, col: number) => boolean;
}

/**
 * Con logo se necesita corrección alta (H/Q) para tolerar los módulos tapados.
 * Si el contenido no entra, se baja el nivel hasta encontrar uno válido.
 */
export function buildMatrix(text: string, withLogo: boolean): Matrix | null {
  const levels: Level[] = withLogo ? ['H', 'Q'] : ['Q', 'M', 'L'];

  for (const level of levels) {
    try {
      const { modules } = create(text, { errorCorrectionLevel: level });
      const { size } = modules;
      return {
        size,
        level,
        dark: (r, c) => r >= 0 && c >= 0 && r < size && c < size && Boolean(modules.get(r, c))
      };
    } catch {
      // no entra en este nivel, probamos el siguiente
    }
  }
  return null;
}

const n = (x: number) => +x.toFixed(3);

const arc = (r: number, x: number, y: number) => (r ? `A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y)}` : '');

/** Rectángulo con radio independiente por esquina [tl, tr, br, bl] */
type Radii = [number, number, number, number];

function roundRect(x: number, y: number, w: number, h: number, [a, b, c, d]: Radii = [0, 0, 0, 0]) {
  return (
    `M${n(x + a)} ${n(y)}H${n(x + w - b)}${arc(b, x + w, y + b)}` +
    `V${n(y + h - c)}${arc(c, x + w - c, y + h)}` +
    `H${n(x + d)}${arc(d, x, y + h - d)}` +
    `V${n(y + a)}${arc(a, x + a, y)}Z`
  );
}

const circle = (cx: number, cy: number, r: number) =>
  `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0Z`;

const diamond = (cx: number, cy: number, r: number) =>
  `M${n(cx)} ${n(cy - r)}L${n(cx + r)} ${n(cy)}L${n(cx)} ${n(cy + r)}L${n(cx - r)} ${n(cy)}Z`;

export const isEye = (r: number, c: number, size: number) =>
  (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);

export function modulesPath(m: Matrix, shape: DotShape, skip: (r: number, c: number) => boolean = () => false) {
  let d = '';

  for (let r = 0; r < m.size; r++) {
    for (let c = 0; c < m.size; c++) {
      if (!m.dark(r, c) || skip(r, c)) continue;

      switch (shape) {
        case 'square':
          d += `M${c} ${r}h1v1h-1z`;
          break;
        case 'dots':
          d += circle(c + 0.5, r + 0.5, 0.45);
          break;
        case 'diamond':
          // levemente más grande que el módulo: con menos cobertura algunos lectores fallan
          d += diamond(c + 0.5, r + 0.5, 0.68);
          break;
        case 'rounded': {
          // solo se redondean las esquinas sin vecinos, así los módulos contiguos se ven fluidos
          const top = m.dark(r - 1, c);
          const bottom = m.dark(r + 1, c);
          const left = m.dark(r, c - 1);
          const right = m.dark(r, c + 1);
          const k = 0.5;
          d += roundRect(c, r, 1, 1, [
            !top && !left ? k : 0,
            !top && !right ? k : 0,
            !bottom && !right ? k : 0,
            !bottom && !left ? k : 0
          ]);
          break;
        }
      }
    }
  }
  return d;
}

/** Un ojo (finder pattern) de 7x7: marco exterior (evenodd) y centro por separado */
export function eye(shape: EyeShape, x: number, y: number) {
  const cx = x + 3.5;
  const cy = y + 3.5;

  switch (shape) {
    case 'square':
      return { outer: roundRect(x, y, 7, 7) + roundRect(x + 1, y + 1, 5, 5), inner: roundRect(x + 2, y + 2, 3, 3) };
    case 'rounded':
      return {
        outer: roundRect(x, y, 7, 7, [2.2, 2.2, 2.2, 2.2]) + roundRect(x + 1, y + 1, 5, 5, [1.4, 1.4, 1.4, 1.4]),
        inner: roundRect(x + 2, y + 2, 3, 3, [0.9, 0.9, 0.9, 0.9])
      };
    case 'circle':
      return { outer: circle(cx, cy, 3.5) + circle(cx, cy, 2.5), inner: circle(cx, cy, 1.5) };
    case 'diamond':
      return { outer: diamond(cx, cy, 3.5) + diamond(cx, cy, 2.5), inner: diamond(cx, cy, 1.5) };
  }
}

export function eyesPath(size: number, shape: EyeShape) {
  const parts = [eye(shape, 0, 0), eye(shape, size - 7, 0), eye(shape, 0, size - 7)];
  return {
    outer: parts.map((p) => p.outer).join(''),
    inner: parts.map((p) => p.inner).join('')
  };
}

/** Área central (en módulos) que se libera para el logo, centrada en la grilla */
export function logoArea(size: number, level: Level) {
  let span = Math.round(size * (level === 'H' ? 0.24 : 0.18));
  if ((size - span) % 2) span++;
  const start = (size - span) / 2;
  return { start, span };
}
