import type { ReactNode } from 'react';
import { ink } from '@/lib/color';
import type { FrameConfig } from '@/lib/qr/types';

// fuentes de sistema: así la vista previa coincide con lo exportado (el SVG exportado no carga webfonts)
export const FONT = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export interface FrameLayout {
  width: number;
  height: number;
  qr: { x: number; y: number; size: number };
  quiet: number;
  back?: ReactNode;
  front?: ReactNode;
}

interface LabelProps {
  y: number;
  text: string;
  color: string;
  size?: number;
  max?: number;
}

function Label({ y, text, color, size = 28, max = 330 }: LabelProps) {
  if (!text) return null;
  // aproximación del ancho; si no entra, se comprime en lugar de desbordar
  const fits = text.length * size * 0.56 <= max;
  return (
    <text
      x={200}
      y={y}
      fill={color}
      fontSize={size}
      fontWeight={700}
      fontFamily={FONT}
      textAnchor="middle"
      dominantBaseline="central"
      letterSpacing={0.3}
      {...(fits ? {} : { textLength: max, lengthAdjust: 'spacingAndGlyphs' })}
    >
      {text}
    </text>
  );
}

const ticket = (w: number, h: number, notch: number, r = 32, nr = 16) =>
  `M${r} 0H${w - r}A${r} ${r} 0 0 1 ${w} ${r}V${notch - nr}A${nr} ${nr} 0 0 0 ${w} ${notch + nr}` +
  `V${h - r}A${r} ${r} 0 0 1 ${w - r} ${h}H${r}A${r} ${r} 0 0 1 0 ${h - r}` +
  `V${notch + nr}A${nr} ${nr} 0 0 0 0 ${notch - nr}V${r}A${r} ${r} 0 0 1 ${r} 0Z`;

/** Todos los marcos usan 400 unidades de ancho; el alto varía según el diseño */
export function frameLayout({ id, text, color }: FrameConfig, bg: string): FrameLayout {
  const on = ink(color);

  switch (id) {
    case 'minimal':
      return {
        width: 400,
        height: 470,
        quiet: 2,
        qr: { x: 40, y: 36, size: 320 },
        back: <rect x={3} y={3} width={394} height={464} rx={34} fill={bg} stroke={color} strokeWidth={6} />,
        front: <Label y={418} text={text} color={color} size={30} />
      };

    case 'business':
      return {
        width: 400,
        height: 500,
        quiet: 2,
        qr: { x: 30, y: 30, size: 340 },
        back: (
          <>
            <rect width={400} height={500} rx={36} fill={color} />
            <rect x={20} y={20} width={360} height={360} rx={24} fill={bg} />
            <rect x={170} y={470} width={60} height={4} rx={2} fill={on} opacity={0.35} />
          </>
        ),
        front: <Label y={428} text={text} color={on} />
      };

    case 'whatsapp':
      return {
        width: 400,
        height: 520,
        quiet: 2,
        qr: { x: 34, y: 98, size: 332 },
        back: (
          <>
            <rect width={400} height={462} rx={40} fill={color} />
            <path d="M78 455L60 518L152 455Z" fill={color} />
            <rect x={24} y={88} width={352} height={352} rx={24} fill={bg} />
          </>
        ),
        front: <Label y={48} text={text} color={on} />
      };

    case 'restaurant':
      return {
        width: 400,
        height: 500,
        quiet: 2,
        qr: { x: 50, y: 112, size: 300 },
        back: (
          <>
            <rect x={2} y={2} width={396} height={496} rx={30} fill={bg} stroke={color} strokeWidth={4} />
            <rect x={14} y={14} width={372} height={472} rx={22} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="6 6" opacity={0.6} />
            <rect x={60} y={36} width={280} height={58} rx={29} fill={color} />
            {[180, 200, 220].map((cx) => (
              <circle key={cx} cx={cx} cy={448} r={4} fill={color} />
            ))}
          </>
        ),
        front: <Label y={65} text={text} color={on} size={26} max={240} />
      };

    case 'event':
      return {
        width: 400,
        height: 520,
        quiet: 2,
        qr: { x: 34, y: 34, size: 332 },
        back: (
          <>
            <path d={ticket(400, 520, 400)} fill={color} />
            <rect x={24} y={24} width={352} height={352} rx={20} fill={bg} />
            <line x1={34} y1={400} x2={366} y2={400} stroke={on} strokeWidth={2} strokeDasharray="8 8" opacity={0.45} />
          </>
        ),
        front: <Label y={460} text={text} color={on} />
      };

    case 'social': {
      const pill = Math.min(340, text.length * 15.5 + 72);
      const l = 64;
      return {
        width: 400,
        height: 500,
        quiet: 2,
        qr: { x: 50, y: 46, size: 300 },
        back: (
          <>
            <rect width={400} height={500} rx={36} fill={bg} />
            <path
              d={`M30 ${26 + l}V26H${30 + l}M${370 - l} 26H370V${26 + l}M370 ${370 - l}V370H${370 - l}M${30 + l} 370H30V${370 - l}`}
              fill="none"
              stroke={color}
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {text && <rect x={200 - pill / 2} y={402} width={pill} height={60} rx={30} fill={color} />}
          </>
        ),
        front: <Label y={432} text={text} color={on} max={pill - 40} />
      };
    }

    default:
      return { width: 400, height: 400, quiet: 3, qr: { x: 0, y: 0, size: 400 } };
  }
}
