import type { Design, FrameConfig, FrameId, Gradient, GradientId, Logo, QRTypeId, TemplateId } from './types';

export const GRADIENTS: Record<Exclude<GradientId, 'none' | 'custom'>, Gradient & { label: string }> = {
  blue: { label: 'Azul', from: '#1d4ed8', to: '#0891b2', angle: 45 },
  purple: { label: 'Morado', from: '#7c3aed', to: '#db2777', angle: 45 },
  green: { label: 'Verde', from: '#047857', to: '#4d7c0f', angle: 45 },
  orange: { label: 'Naranja', from: '#c2410c', to: '#dc2626', angle: 45 },
  instagram: { label: 'Instagram', from: '#dd2a7b', to: '#8134af', angle: 60 }
};

export const FRAMES: { id: FrameId; label: string; text: string }[] = [
  { id: 'none', label: 'Sin marco', text: '' },
  { id: 'minimal', label: 'Minimal', text: 'Escanéame' },
  { id: 'business', label: 'Business', text: 'Información Comercial' },
  { id: 'whatsapp', label: 'WhatsApp', text: 'Chatea con nosotros' },
  { id: 'restaurant', label: 'Restaurant', text: 'Ver Menú' },
  { id: 'event', label: 'Event', text: 'Detalles del Evento' },
  { id: 'social', label: 'Social', text: 'Síguenos' }
];

export const frameText = (id: FrameId) => FRAMES.find((f) => f.id === id)?.text ?? '';

export const DEFAULT_DESIGN: Design = {
  fg: '#1a1b26',
  bg: '#ffffff',
  gradient: 'none',
  custom: { from: '#7aa2f7', to: '#bb9af7', angle: 45 },
  dots: 'square',
  eyes: 'square'
};

export const DEFAULT_FRAME: FrameConfig = { id: 'none', text: '', color: '#3d59a1' };

export interface Template {
  id: TemplateId;
  label: string;
  hint: string;
  type?: QRTypeId;
  design: Partial<Design>;
  logo: Logo;
  frame: FrameId;
  frameColor: string;
}

export const TEMPLATES: Template[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    hint: 'Logo, verde y marco de chat',
    type: 'whatsapp',
    design: { fg: '#075e54', gradient: 'none', dots: 'rounded', eyes: 'rounded' },
    logo: { kind: 'preset', id: 'whatsapp' },
    frame: 'whatsapp',
    frameColor: '#25d366'
  },
  {
    id: 'instagram',
    label: 'Instagram',
    hint: 'Logo y gradiente IG',
    type: 'instagram',
    design: { gradient: 'instagram', dots: 'dots', eyes: 'rounded' },
    logo: { kind: 'preset', id: 'instagram' },
    frame: 'social',
    frameColor: '#c13584'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    hint: 'Azul corporativo',
    type: 'linkedin',
    design: { fg: '#0a66c2', gradient: 'none', dots: 'square', eyes: 'square' },
    logo: { kind: 'preset', id: 'linkedin' },
    frame: 'business',
    frameColor: '#0a66c2'
  },
  {
    id: 'mercadopago',
    label: 'Mercado Pago',
    hint: 'Colores institucionales',
    type: 'mercadopago',
    design: { fg: '#00428a', gradient: 'none', dots: 'rounded', eyes: 'circle' },
    logo: { kind: 'preset', id: 'mercadopago' },
    frame: 'business',
    frameColor: '#009ee3'
  },
  {
    id: 'restaurant',
    label: 'Restaurante',
    hint: 'Marco menú y tonos cálidos',
    type: 'url',
    design: { fg: '#7c2d12', gradient: 'orange', dots: 'rounded', eyes: 'rounded' },
    logo: { kind: 'none' },
    frame: 'restaurant',
    frameColor: '#c2410c'
  }
];
