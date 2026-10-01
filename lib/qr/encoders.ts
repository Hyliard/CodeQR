import { pixPayload } from './pix';
import type { EncodeResult, FieldValues, QRCategory, QRType, QRTypeId } from './types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?\d{6,15}$/;
const USER = /^[\w.-]{1,100}$/;

const ok = (data: string): EncodeResult => ({ ok: true, data });
const fail = (error: string, field?: string, empty = false): EncodeResult => ({ ok: false, error, field, empty });

const get = (v: FieldValues, k: string) => (v[k] ?? '').trim();
const digits = (s: string) => s.replace(/[^\d+]/g, '');
// escape de vCard / iCalendar
const escText = (s: string) => s.replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n');
const escMe = (s: string) => s.replace(/([\\;,:"])/g, '\\$1');

export function toUrl(value: string) {
  let v = value.trim();
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    const url = new URL(v);
    return url.hostname.includes('.') || url.hostname === 'localhost' ? url : null;
  } catch {
    return null;
  }
}

function phone(v: FieldValues, key: string) {
  const raw = get(v, key);
  if (!raw) return fail('Ingresá un número.', key, true);
  const num = digits(raw);
  return PHONE.test(num) ? ok(num) : fail('Revisá el número.', key);
}

/** Acepta @usuario, usuario o un enlace completo al perfil */
function social(base: string, hint: string): QRType['encode'] {
  return (v) => {
    const raw = get(v, 'user');
    if (!raw) return fail(hint, 'user', true);

    if (/^https?:\/\//i.test(raw) || raw.includes('/')) {
      const url = toUrl(raw);
      return url ? ok(url.href) : fail('Ese enlace no es válido.', 'user');
    }

    const user = raw.replace(/^@/, '');
    return USER.test(user) ? ok(base + user) : fail('Usuario no válido.', 'user');
  };
}

const userField = (placeholder: string) => [
  { name: 'user', label: 'Usuario o enlace', kind: 'text' as const, placeholder, wide: true, autoComplete: 'off' }
];

function vcard(v: FieldValues): EncodeResult {
  const first = get(v, 'first');
  const last = get(v, 'last');
  if (!first && !last) return fail('Poné al menos el nombre.', 'first', true);

  const email = get(v, 'email');
  if (email && !EMAIL.test(email)) return fail('Revisá el email.', 'email');

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escText(last)};${escText(first)};;;`,
    `FN:${escText(`${first} ${last}`.trim())}`
  ];

  const add = (key: string, value: string) => value && lines.push(`${key}:${value}`);
  add('TEL;TYPE=CELL', digits(get(v, 'phone')));
  add('TEL;TYPE=WORK', digits(get(v, 'work')));
  add('EMAIL', email);
  add('ORG', escText(get(v, 'org')));
  add('TITLE', escText(get(v, 'role')));
  add('URL', get(v, 'web'));
  add('BDAY', get(v, 'birthday'));

  // contacto simple guarda la dirección en una línea, la vCard avanzada la separa
  const street = get(v, 'street') || get(v, 'address');
  const city = get(v, 'city');
  const region = get(v, 'region');
  const zip = get(v, 'zip');
  const country = get(v, 'country');
  if (street || city || region || zip || country) {
    add('ADR;TYPE=WORK', [ '', '', street, city, region, zip, country ].map(escText).join(';'));
  }

  add('NOTE', escText(get(v, 'note')));
  lines.push('END:VCARD');
  return ok(lines.join('\r\n'));
}

const types: QRType[] = [
  {
    id: 'url',
    label: 'Enlace',
    category: 'basic',
    fields: [{ name: 'url', label: 'Enlace', kind: 'url', placeholder: 'https://ejemplo.com', wide: true, autoComplete: 'url' }],
    encode: (v) => {
      if (!get(v, 'url')) return fail('Pegá un enlace para empezar.', 'url', true);
      const url = toUrl(get(v, 'url'));
      return url ? ok(url.href) : fail('Ese enlace no es válido. Ej: https://ejemplo.com', 'url');
    }
  },
  {
    id: 'text',
    label: 'Texto',
    category: 'basic',
    fields: [{ name: 'text', label: 'Texto', kind: 'textarea', placeholder: 'Escribí cualquier cosa…', wide: true, maxLength: 1200 }],
    encode: (v) => (v.text?.trim() ? ok(v.text) : fail('Escribí un texto.', 'text', true))
  },
  {
    id: 'wifi',
    label: 'WiFi',
    category: 'basic',
    defaults: { security: 'WPA' },
    fields: [
      { name: 'ssid', label: 'Nombre de la red', kind: 'text', placeholder: 'MiCasa_5G', wide: true, autoComplete: 'off' },
      { name: 'pass', label: 'Contraseña', kind: 'password', autoComplete: 'off', hideWhen: (v) => v.security === 'nopass' },
      {
        name: 'security', label: 'Seguridad', kind: 'select',
        options: [
          { value: 'WPA', label: 'WPA / WPA2' },
          { value: 'WEP', label: 'WEP' },
          { value: 'nopass', label: 'Sin contraseña' }
        ]
      },
      { name: 'hidden', label: 'Red oculta', kind: 'checkbox', wide: true }
    ],
    // formato estándar que leen las cámaras de Android e iOS
    encode: (v) => {
      const ssid = v.ssid ?? '';
      const pass = v.pass ?? '';
      const type = v.security || 'WPA';
      if (!ssid.trim()) return fail('Falta el nombre de la red.', 'ssid', true);
      if (type !== 'nopass' && !pass) return fail('Falta la contraseña.', 'pass');

      const p = type === 'nopass' ? '' : `P:${escMe(pass)};`;
      const h = v.hidden === 'true' ? 'H:true;' : '';
      return ok(`WIFI:T:${type};S:${escMe(ssid)};${p}${h};`);
    }
  },
  {
    id: 'contact',
    label: 'Contacto',
    category: 'basic',
    fields: [
      { name: 'first', label: 'Nombre', kind: 'text', autoComplete: 'given-name' },
      { name: 'last', label: 'Apellido', kind: 'text', autoComplete: 'family-name' },
      { name: 'phone', label: 'Teléfono', kind: 'tel', autoComplete: 'tel' },
      { name: 'email', label: 'Email', kind: 'email', autoComplete: 'email' },
      { name: 'org', label: 'Empresa', kind: 'text', autoComplete: 'organization' },
      { name: 'role', label: 'Cargo', kind: 'text', autoComplete: 'organization-title' },
      { name: 'web', label: 'Sitio web', kind: 'url', placeholder: 'https://', wide: true },
      { name: 'address', label: 'Dirección', kind: 'text', wide: true, autoComplete: 'street-address' }
    ],
    encode: vcard
  },
  {
    id: 'tel',
    label: 'Teléfono',
    category: 'basic',
    fields: [{ name: 'phone', label: 'Número', kind: 'tel', placeholder: '+54 9 11 1234 5678', wide: true }],
    encode: (v) => {
      const r = phone(v, 'phone');
      return r.ok ? ok(`tel:${r.data}`) : r;
    }
  },
  {
    id: 'sms',
    label: 'SMS',
    category: 'basic',
    fields: [
      { name: 'phone', label: 'Número', kind: 'tel', placeholder: '+54 9 11 1234 5678', wide: true },
      { name: 'body', label: 'Mensaje', kind: 'textarea', wide: true, maxLength: 300 }
    ],
    encode: (v) => {
      const r = phone(v, 'phone');
      return r.ok ? ok(`SMSTO:${r.data}:${get(v, 'body')}`) : r;
    }
  },
  {
    id: 'email',
    label: 'Email',
    category: 'basic',
    fields: [
      { name: 'to', label: 'Destinatario', kind: 'email', placeholder: 'hola@empresa.com', wide: true },
      { name: 'subject', label: 'Asunto', kind: 'text', wide: true },
      { name: 'body', label: 'Mensaje', kind: 'textarea', wide: true, maxLength: 600 }
    ],
    encode: (v) => {
      const to = get(v, 'to');
      if (!to) return fail('Ingresá un email.', 'to', true);
      if (!EMAIL.test(to)) return fail('Revisá el email.', 'to');

      const params = [
        get(v, 'subject') && `subject=${encodeURIComponent(get(v, 'subject'))}`,
        get(v, 'body') && `body=${encodeURIComponent(get(v, 'body'))}`
      ].filter(Boolean);
      return ok(`mailto:${to}${params.length ? `?${params.join('&')}` : ''}`);
    }
  },
  {
    id: 'geo',
    label: 'Ubicación',
    category: 'basic',
    fields: [{ name: 'coords', label: 'Coordenadas', kind: 'geo', placeholder: '-34.6037, -58.3816', wide: true }],
    // link de Maps y no geo:, la cámara de iOS no abre geo:
    encode: (v) => {
      const raw = get(v, 'coords');
      if (!raw) return fail('Pegá coordenadas o usá tu ubicación.', 'coords', true);

      const m = raw.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
      const lat = m ? Number(m[1]) : NaN;
      const lng = m ? Number(m[2]) : NaN;
      if (!m || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return fail('Usá el formato latitud, longitud. Ej: -34.6037, -58.3816', 'coords');
      }
      return ok(`https://maps.google.com/?q=${lat},${lng}`);
    }
  },
  {
    id: 'event',
    label: 'Evento',
    category: 'basic',
    fields: [
      { name: 'title', label: 'Título', kind: 'text', wide: true },
      { name: 'start', label: 'Inicio', kind: 'datetime' },
      { name: 'end', label: 'Fin', kind: 'datetime' },
      { name: 'place', label: 'Lugar', kind: 'text', wide: true },
      { name: 'notes', label: 'Descripción', kind: 'textarea', wide: true, maxLength: 400 }
    ],
    encode: (v) => {
      const title = get(v, 'title');
      if (!title) return fail('Ponele un título al evento.', 'title', true);
      if (!v.start) return fail('Falta la fecha de inicio.', 'start');

      const from = new Date(v.start);
      const to = v.end ? new Date(v.end) : new Date(from.getTime() + 3_600_000);
      if (to <= from) return fail('El fin tiene que ser después del inicio.', 'end');

      const stamp = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${escText(title)}`,
        `DTSTART:${stamp(from)}`,
        `DTEND:${stamp(to)}`
      ];
      if (get(v, 'place')) lines.push(`LOCATION:${escText(get(v, 'place'))}`);
      if (get(v, 'notes')) lines.push(`DESCRIPTION:${escText(get(v, 'notes'))}`);
      lines.push('END:VEVENT', 'END:VCALENDAR');
      return ok(lines.join('\r\n'));
    }
  },

  {
    id: 'whatsapp',
    label: 'WhatsApp',
    category: 'social',
    fields: [
      { name: 'phone', label: 'Número con código de país', kind: 'tel', placeholder: '+54 9 11 1234 5678', wide: true },
      { name: 'message', label: 'Mensaje inicial', kind: 'textarea', placeholder: 'Hola! Quiero más información', wide: true, maxLength: 300 }
    ],
    encode: (v) => {
      const r = phone(v, 'phone');
      if (!r.ok) return r;
      const msg = get(v, 'message');
      return ok(`https://wa.me/${r.data.replace('+', '')}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`);
    }
  },
  { id: 'instagram', label: 'Instagram', category: 'social', fields: userField('@tuempresa'), encode: social('https://instagram.com/', 'Ingresá tu usuario de Instagram.') },
  { id: 'facebook', label: 'Facebook', category: 'social', fields: userField('tu.pagina'), encode: social('https://facebook.com/', 'Ingresá tu página de Facebook.') },
  { id: 'tiktok', label: 'TikTok', category: 'social', fields: userField('@tucuenta'), encode: social('https://www.tiktok.com/@', 'Ingresá tu usuario de TikTok.') },
  { id: 'linkedin', label: 'LinkedIn', category: 'social', fields: userField('juan-perez'), encode: social('https://www.linkedin.com/in/', 'Ingresá tu perfil de LinkedIn.') },
  { id: 'youtube', label: 'YouTube', category: 'social', fields: userField('@tucanal'), encode: social('https://www.youtube.com/@', 'Ingresá tu canal de YouTube.') },
  { id: 'telegram', label: 'Telegram', category: 'social', fields: userField('@tuusuario'), encode: social('https://t.me/', 'Ingresá tu usuario de Telegram.') },

  {
    id: 'mercadopago',
    label: 'Mercado Pago',
    category: 'payment',
    fields: [{ name: 'link', label: 'Link de pago', kind: 'url', placeholder: 'https://mpago.la/xxxxxx', wide: true }],
    encode: (v) => {
      if (!get(v, 'link')) return fail('Pegá tu link de pago de Mercado Pago.', 'link', true);
      const url = toUrl(get(v, 'link'));
      const valid = url && /(^|\.)(mercadopago\.com(\.[a-z]{2})?|mpago\.(la|li))$/i.test(url.hostname);
      return valid ? ok(url.href) : fail('Tiene que ser un link de Mercado Pago (mpago.la o mercadopago.com).', 'link');
    }
  },
  {
    id: 'pix',
    label: 'PIX',
    category: 'payment',
    fields: [
      { name: 'key', label: 'Chave PIX', kind: 'text', placeholder: 'email, CPF, celular o aleatoria', wide: true, autoComplete: 'off' },
      { name: 'name', label: 'Beneficiario', kind: 'text', maxLength: 25 },
      { name: 'city', label: 'Ciudad', kind: 'text', maxLength: 15 },
      { name: 'amount', label: 'Monto (R$)', kind: 'number', placeholder: 'Opcional' },
      { name: 'txid', label: 'Referencia', kind: 'text', placeholder: 'Opcional', maxLength: 25 },
      { name: 'info', label: 'Descripción', kind: 'text', placeholder: 'Opcional', wide: true, maxLength: 40 }
    ],
    encode: (v) => {
      const key = get(v, 'key');
      if (!key) return fail('Ingresá tu chave PIX.', 'key', true);
      if (key.length > 77) return fail('La chave es demasiado larga.', 'key');
      if (!get(v, 'name')) return fail('Falta el nombre del beneficiario.', 'name');
      if (!get(v, 'city')) return fail('Falta la ciudad.', 'city');

      const amount = get(v, 'amount');
      if (amount && !(Number(amount) > 0)) return fail('El monto tiene que ser mayor a 0.', 'amount');

      return ok(pixPayload({ key, name: get(v, 'name'), city: get(v, 'city'), amount, txid: get(v, 'txid'), info: get(v, 'info') }));
    }
  },

  {
    id: 'vcard',
    label: 'vCard avanzada',
    category: 'pro',
    fields: [
      { name: 'first', label: 'Nombre', kind: 'text', autoComplete: 'given-name' },
      { name: 'last', label: 'Apellido', kind: 'text', autoComplete: 'family-name' },
      { name: 'org', label: 'Empresa', kind: 'text', autoComplete: 'organization' },
      { name: 'role', label: 'Cargo', kind: 'text', autoComplete: 'organization-title' },
      { name: 'phone', label: 'Celular', kind: 'tel', autoComplete: 'tel' },
      { name: 'work', label: 'Teléfono laboral', kind: 'tel' },
      { name: 'email', label: 'Email', kind: 'email', autoComplete: 'email' },
      { name: 'web', label: 'Sitio web', kind: 'url', placeholder: 'https://' },
      { name: 'street', label: 'Calle y número', kind: 'text', wide: true, autoComplete: 'street-address' },
      { name: 'city', label: 'Ciudad', kind: 'text', autoComplete: 'address-level2' },
      { name: 'region', label: 'Provincia / Estado', kind: 'text', autoComplete: 'address-level1' },
      { name: 'zip', label: 'Código postal', kind: 'text', autoComplete: 'postal-code' },
      { name: 'country', label: 'País', kind: 'text', autoComplete: 'country-name' },
      { name: 'birthday', label: 'Cumpleaños', kind: 'text', placeholder: 'AAAA-MM-DD' },
      { name: 'note', label: 'Nota', kind: 'textarea', wide: true, maxLength: 300 }
    ],
    encode: vcard
  },
  {
    id: 'bizcard',
    label: 'Tarjeta digital',
    category: 'pro',
    fields: [
      { name: 'name', label: 'Nombre completo', kind: 'text', wide: true, autoComplete: 'name' },
      { name: 'company', label: 'Empresa', kind: 'text', autoComplete: 'organization' },
      { name: 'phone', label: 'Teléfono', kind: 'tel', autoComplete: 'tel' },
      { name: 'email', label: 'Email', kind: 'email', autoComplete: 'email' },
      { name: 'web', label: 'Sitio web', kind: 'url', placeholder: 'https://' },
      { name: 'address', label: 'Dirección', kind: 'text', wide: true },
      { name: 'note', label: 'Bio / slogan', kind: 'text', wide: true, maxLength: 120 }
    ],
    // MECARD: más compacto que vCard, genera QR menos densos para tarjetas impresas
    encode: (v) => {
      const name = get(v, 'name');
      if (!name) return fail('Poné tu nombre.', 'name', true);
      const email = get(v, 'email');
      if (email && !EMAIL.test(email)) return fail('Revisá el email.', 'email');

      const parts = [
        `N:${escMe(name)}`,
        get(v, 'company') && `ORG:${escMe(get(v, 'company'))}`,
        get(v, 'phone') && `TEL:${digits(get(v, 'phone'))}`,
        email && `EMAIL:${escMe(email)}`,
        get(v, 'web') && `URL:${escMe(get(v, 'web'))}`,
        get(v, 'address') && `ADR:${escMe(get(v, 'address'))}`,
        get(v, 'note') && `NOTE:${escMe(get(v, 'note'))}`
      ].filter(Boolean);
      return ok(`MECARD:${parts.join(';')};;`);
    }
  }
];

export const QR_TYPES = Object.fromEntries(types.map((t) => [t.id, t])) as Record<QRTypeId, QRType>;

export const CATEGORIES: { id: QRCategory; label: string; types: QRType[] }[] = [
  { id: 'basic', label: 'Básicos', types: types.filter((t) => t.category === 'basic') },
  { id: 'social', label: 'Redes', types: types.filter((t) => t.category === 'social') },
  { id: 'payment', label: 'Pagos', types: types.filter((t) => t.category === 'payment') },
  { id: 'pro', label: 'Profesional', types: types.filter((t) => t.category === 'pro') }
];
