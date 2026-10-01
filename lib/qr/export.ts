import type { ExportFormat } from './types';

const MIME: Record<ExportFormat, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  svg: 'image/svg+xml'
};

export const safeName = (name: string) => name.trim().replace(/[\\/:*?"<>|]+/g, '').slice(0, 60) || 'qr';

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface ExportOptions {
  format: ExportFormat;
  name: string;
  width: number;
  /** relleno para JPG, que no soporta transparencia */
  matte: string;
}

export async function exportSvg(svg: SVGSVGElement, { format, name, width, matte }: ExportOptions) {
  const { width: vw, height: vh } = svg.viewBox.baseVal;
  const height = Math.round((width * vh) / vw);

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.removeAttribute('class');
  clone.removeAttribute('style');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  const xml = new XMLSerializer().serializeToString(clone);
  const file = `${safeName(name)}.${format}`;

  if (format === 'svg') return save(new Blob([xml], { type: MIME.svg }), file);

  const url = URL.createObjectURL(new Blob([xml], { type: MIME.svg }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas no disponible');

    if (format === 'jpg') {
      ctx.fillStyle = matte;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, MIME[format], 0.95));
    if (!blob) throw new Error('No se pudo generar la imagen');
    save(blob, file);
  } finally {
    URL.revokeObjectURL(url);
  }
}
