'use client';

import { useMemo } from 'react';
import { create } from 'zustand';
import { QR_TYPES } from '@/lib/qr/encoders';
import { DEFAULT_DESIGN, DEFAULT_FRAME, TEMPLATES, frameText } from '@/lib/qr/presets';
import type { Design, FieldValues, FrameConfig, Logo, QRConfig, QRTypeId, TemplateId } from '@/lib/qr/types';

interface QRStore extends QRConfig {
  fileName: string;
  setType: (type: QRTypeId) => void;
  setValue: (name: string, value: string) => void;
  setDesign: (patch: Partial<Design>) => void;
  setLogo: (logo: Logo) => void;
  setFrame: (patch: Partial<FrameConfig>) => void;
  setFileName: (name: string) => void;
  applyTemplate: (id: TemplateId) => void;
  clearContent: () => void;
  resetDesign: () => void;
}

const EMPTY: FieldValues = {};
const initial = (type: QRTypeId) => QR_TYPES[type].defaults ?? EMPTY;

export const useQR = create<QRStore>()((set) => ({
  type: 'url',
  values: {},
  design: DEFAULT_DESIGN,
  logo: { kind: 'none' },
  frame: DEFAULT_FRAME,
  fileName: 'qr',

  setType: (type) => set({ type }),

  setValue: (name, value) =>
    set((s) => ({
      values: { ...s.values, [s.type]: { ...(s.values[s.type] ?? initial(s.type)), [name]: value } }
    })),

  setDesign: (patch) => set((s) => ({ design: { ...s.design, ...patch } })),

  setLogo: (logo) => set({ logo }),

  // al cambiar de marco se usa su texto por defecto, salvo que el usuario lo haya editado
  setFrame: (patch) =>
    set((s) => {
      const next = { ...s.frame, ...patch };
      if (patch.id && patch.text === undefined && (!s.frame.text || s.frame.text === frameText(s.frame.id))) {
        next.text = frameText(patch.id);
      }
      return { frame: next };
    }),

  setFileName: (fileName) => set({ fileName }),

  applyTemplate: (id) =>
    set((s) => {
      const t = TEMPLATES.find((x) => x.id === id);
      if (!t) return s;
      return {
        type: t.type ?? s.type,
        design: { ...s.design, ...t.design },
        logo: t.logo,
        frame: { id: t.frame, text: frameText(t.frame), color: t.frameColor }
      };
    }),

  clearContent: () => set((s) => ({ values: { ...s.values, [s.type]: initial(s.type) } })),

  resetDesign: () => set({ design: DEFAULT_DESIGN, logo: { kind: 'none' }, frame: DEFAULT_FRAME })
}));

export function useValues() {
  const type = useQR((s) => s.type);
  const values = useQR((s) => s.values[s.type]);
  return values ?? initial(type);
}

/** Payload final del QR, recalculado en cada cambio de contenido */
export function useEncoded() {
  const type = useQR((s) => s.type);
  const values = useValues();
  return useMemo(() => QR_TYPES[type].encode(values), [type, values]);
}
