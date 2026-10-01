import { useId, useMemo, type Ref } from 'react';
import { logoSrc } from '@/lib/qr/logos';
import { GRADIENTS } from '@/lib/qr/presets';
import { eyesPath, isEye, logoArea, modulesPath, type Matrix } from '@/lib/qr/render';
import type { Design, FrameConfig, Gradient, Logo } from '@/lib/qr/types';
import { frameLayout } from './frames';

interface Props {
  matrix: Matrix;
  design: Design;
  logo: Logo;
  frame: FrameConfig;
  label?: string;
  className?: string;
  ref?: Ref<SVGSVGElement>;
}

function gradientOf(design: Design): Gradient | null {
  if (design.gradient === 'none') return null;
  if (design.gradient === 'custom') return design.custom;
  return GRADIENTS[design.gradient];
}

/**
 * SVG final (marco + QR). Es la misma fuente que se exporta,
 * por eso todo va inline: gradientes, logo como data URL y fuentes de sistema.
 */
export function QRGraphic({ matrix, design, logo, frame, label = 'Código QR', className, ref }: Props) {
  const gid = `g${useId().replace(/[^\w-]/g, '')}`;
  const { size, level } = matrix;
  const hasLogo = logo.kind !== 'none';

  const paths = useMemo(() => {
    const area = hasLogo ? logoArea(size, level) : null;
    const covered = (r: number, c: number) =>
      !!area && r >= area.start && r < area.start + area.span && c >= area.start && c < area.start + area.span;

    return {
      area,
      modules: modulesPath(matrix, design.dots, (r, c) => isEye(r, c, size) || covered(r, c)),
      eyes: eyesPath(size, design.eyes)
    };
  }, [matrix, size, level, hasLogo, design.dots, design.eyes]);

  const layout = frameLayout(frame, design.bg);
  const { qr, quiet } = layout;
  const view = size + quiet * 2;

  const gradient = gradientOf(design);
  const paint = gradient ? `url(#${gid})` : design.fg;
  const rad = ((gradient?.angle ?? 0) * Math.PI) / 180;
  const half = size / 2;

  const src = logo.kind === 'preset' ? logoSrc(logo.id) : logo.kind === 'custom' ? logo.src : null;
  const { area } = paths;
  const pad = area ? area.span * 0.1 : 0;

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-label={label}
      className={className}
    >
      {layout.back}

      <svg x={qr.x} y={qr.y} width={qr.size} height={qr.size} viewBox={`${-quiet} ${-quiet} ${view} ${view}`} shapeRendering={design.dots === 'square' ? 'crispEdges' : undefined}>
        {gradient && (
          <defs>
            <linearGradient
              id={gid}
              gradientUnits="userSpaceOnUse"
              x1={half - Math.cos(rad) * half}
              y1={half - Math.sin(rad) * half}
              x2={half + Math.cos(rad) * half}
              y2={half + Math.sin(rad) * half}
            >
              <stop offset="0" stopColor={gradient.from} />
              <stop offset="1" stopColor={gradient.to} />
            </linearGradient>
          </defs>
        )}

        <rect x={-quiet} y={-quiet} width={view} height={view} rx={quiet * 0.6} fill={design.bg} />
        <path d={paths.modules} fill={paint} />
        <path d={paths.eyes.outer} fill={paint} fillRule="evenodd" shapeRendering="geometricPrecision" />
        <path d={paths.eyes.inner} fill={paint} shapeRendering="geometricPrecision" />

        {area && src && (
          <>
            <rect x={area.start} y={area.start} width={area.span} height={area.span} rx={area.span * 0.22} fill={design.bg} />
            <image
              href={src}
              x={area.start + pad}
              y={area.start + pad}
              width={area.span - pad * 2}
              height={area.span - pad * 2}
              preserveAspectRatio="xMidYMid meet"
            />
          </>
        )}
      </svg>

      {layout.front}
    </svg>
  );
}
