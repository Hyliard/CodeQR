import type { LogoId } from './types';

// Íconos simplificados propios (no son los assets oficiales de cada marca)
const tile = (fill: string, body: string, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${defs}<rect width="48" height="48" rx="12" fill="${fill}"/>${body}</svg>`;

const SVG: Record<LogoId, string> = {
  whatsapp: tile(
    '#25D366',
    '<path d="M24 10.5a13.5 13.5 0 0 0-11.7 20.2L10.5 37.5l7-1.8A13.5 13.5 0 1 0 24 10.5z" fill="none" stroke="#fff" stroke-width="2.8" stroke-linejoin="round"/>' +
      '<path d="M19.2 17.4c.5-.5 1.3-.4 1.7.2l1.2 2c.3.5.2 1.1-.2 1.5l-.8.7c.8 1.6 2 2.8 3.6 3.6l.7-.8c.4-.4 1-.5 1.5-.2l2 1.2c.6.4.7 1.2.2 1.7l-.9.9c-.9.9-2.200 1.100-3.300.5-2.900-1.500-5.200-3.800-6.700-6.700-.6-1.100-.4-2.400.5-3.300z" fill="#fff"/>'
  ),
  instagram: tile(
    'url(#ig)',
    '<rect x="12" y="12" width="24" height="24" rx="7" fill="none" stroke="#fff" stroke-width="3"/>' +
      '<circle cx="24" cy="24" r="5.5" fill="none" stroke="#fff" stroke-width="3"/><circle cx="31" cy="17" r="1.8" fill="#fff"/>',
    '<defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".35" stop-color="#fa7e1e"/><stop offset=".65" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs>'
  ),
  facebook: tile(
    '#1877F2',
    '<path d="M26.5 38V26.2h4l.6-4.7h-4.6v-3c0-1.4.4-2.300 2.300-2.300h2.500v-4.200c-.4-.1-1.900-.2-3.600-.2-3.600 0-6 2.200-6 6.200v3.500H17.800v4.700h3.900V38z" fill="#fff"/>'
  ),
  tiktok: tile(
    '#121212',
    ['#25F4EE', '#FE2C55', '#fff']
      .map(
        (c, i) =>
          `<path transform="translate(${[-1, 1, 0][i]} ${[-1, 1, 0][i]})" d="M26 10h4.600c.4 3 2.400 5.100 5.400 5.400v4.600c-2 0-3.800-.6-5.400-1.700V28.500a8.300 8.300 0 1 1-8.300-8.300v4.700a3.600 3.600 0 1 0 3.700 3.600z" fill="${c}"/>`
      )
      .join('')
  ),
  linkedin: tile(
    '#0A66C2',
    '<rect x="12.500" y="20" width="5" height="15.500" fill="#fff"/><circle cx="15" cy="14.300" r="2.900" fill="#fff"/>' +
      '<path d="M21.500 20h4.800v2.200c.7-1.300 2.400-2.600 4.900-2.600 5.100 0 6 3.300 6 7.600v7.800h-5v-6.900c0-1.700 0-3.800-2.300-3.800s-2.700 1.800-2.700 3.700v7H21.500z" fill="#fff"/>'
  ),
  youtube: tile('#FF0033', '<path d="M19.500 15.500v17l14-8.500z" fill="#fff"/>'),
  telegram: tile(
    '#229ED9',
    '<path d="M10.800 23.400l24-9.300c1.100-.4 2.100.3 1.700 2L32.400 35c-.3 1.300-1.100 1.600-2.200 1l-6-4.400-2.900 2.800c-.3.3-.6.6-1.200.6l.4-6.100 11.100-10c.5-.4-.1-.7-.7-.3L17.100 27.100l-5.900-1.800c-1.300-.4-1.300-1.300.3-1.800z" fill="#fff"/>'
  ),
  mercadopago: tile(
    '#009EE3',
    '<ellipse cx="24" cy="24" rx="16" ry="11" fill="none" stroke="#fff" stroke-width="2.800"/>' +
      '<path d="M15.500 25.500l4.500-4 3.500 2.500 3-2.500 5.500 4.500M20 27.500l2.500 2M23.500 27l2.500 2" fill="none" stroke="#fff" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/>'
  ),
  pix: tile(
    '#32BCAD',
    '<rect x="15" y="15" width="18" height="18" rx="4.500" transform="rotate(45 24 24)" fill="none" stroke="#fff" stroke-width="3.500"/>' +
      '<rect x="21" y="21" width="6" height="6" rx="1.200" transform="rotate(45 24 24)" fill="#fff"/>'
  )
};

export const LOGOS: { id: LogoId; label: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'mercadopago', label: 'Mercado Pago' },
  { id: 'pix', label: 'PIX' }
];

const cache = new Map<LogoId, string>();

/** Data URL: necesario para que el logo viaje embebido al exportar PNG/JPG/SVG */
export function logoSrc(id: LogoId) {
  let src = cache.get(id);
  if (!src) {
    src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SVG[id])}`;
    cache.set(id, src);
  }
  return src;
}
