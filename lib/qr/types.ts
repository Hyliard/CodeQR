export type QRTypeId =
  | 'url' | 'text' | 'wifi' | 'contact' | 'tel' | 'sms' | 'email' | 'geo' | 'event'
  | 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'youtube' | 'telegram'
  | 'mercadopago' | 'pix'
  | 'vcard' | 'bizcard';

export type QRCategory = 'basic' | 'social' | 'payment' | 'pro';

export type DotShape = 'square' | 'rounded' | 'dots' | 'diamond';
export type EyeShape = 'square' | 'rounded' | 'circle' | 'diamond';

export type GradientId = 'none' | 'blue' | 'purple' | 'green' | 'orange' | 'instagram' | 'custom';

export type LogoId =
  | 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'linkedin'
  | 'youtube' | 'telegram' | 'mercadopago' | 'pix';

export type FrameId = 'none' | 'minimal' | 'business' | 'whatsapp' | 'restaurant' | 'event' | 'social';

export type TemplateId = 'whatsapp' | 'instagram' | 'linkedin' | 'mercadopago' | 'restaurant';

export type ExportFormat = 'png' | 'jpg' | 'svg';

export type FieldKind = 'text' | 'url' | 'tel' | 'email' | 'number' | 'password' | 'textarea' | 'select' | 'datetime' | 'checkbox' | 'geo';

export interface Field {
  name: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  options?: { value: string; label: string }[];
  wide?: boolean;
  autoComplete?: string;
  maxLength?: number;
  hideWhen?: (values: FieldValues) => boolean;
}

export type FieldValues = Record<string, string>;

/** Resultado de codificar un tipo: payload listo o error asociado a un campo */
export type EncodeResult =
  | { ok: true; data: string }
  | { ok: false; error: string; field?: string; empty?: boolean };

export interface QRType {
  id: QRTypeId;
  label: string;
  category: QRCategory;
  fields: Field[];
  defaults?: FieldValues;
  encode: (v: FieldValues) => EncodeResult;
}

export interface Gradient {
  from: string;
  to: string;
  angle: number;
}

export interface Design {
  fg: string;
  bg: string;
  gradient: GradientId;
  custom: Gradient;
  dots: DotShape;
  eyes: EyeShape;
}

export type Logo =
  | { kind: 'none' }
  | { kind: 'preset'; id: LogoId }
  | { kind: 'custom'; src: string; name: string };

export interface FrameConfig {
  id: FrameId;
  text: string;
  color: string;
}

/**
 * Configuración serializable completa de un QR.
 * Pensada para persistirse tal cual en backend (QR dinámicos, estadísticas).
 */
export interface QRConfig {
  type: QRTypeId;
  values: Partial<Record<QRTypeId, FieldValues>>;
  design: Design;
  logo: Logo;
  frame: FrameConfig;
}
