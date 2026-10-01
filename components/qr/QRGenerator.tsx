'use client';

import { Frame, ImageIcon, LayoutTemplate, ListTree, Palette, PenLine, RotateCcw, Shapes } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { QR_TYPES } from '@/lib/qr/encoders';
import { useQR } from '@/store/qr-store';
import { QRColorPicker } from './QRColorPicker';
import { QRContentForm } from './QRContentForm';
import { QRFrameSelector } from './QRFrameSelector';
import { QRLogoSelector } from './QRLogoSelector';
import { QRPreview } from './QRPreview';
import { QRShapeSelector } from './QRShapeSelector';
import { QRTemplateSelector } from './QRTemplateSelector';
import { QRTypeSelector } from './QRTypeSelector';

export function QRGenerator() {
  const type = useQR((s) => s.type);
  const resetDesign = useQR((s) => s.resetDesign);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-8">
      {/* en mobile la vista previa va primero */}
      <aside className="order-first lg:sticky lg:top-24 lg:order-last">
        <QRPreview />
      </aside>

      <div className="space-y-4">
        <Section title="Templates" description="Empezá con un estilo listo" icon={LayoutTemplate}>
          <QRTemplateSelector />
        </Section>

        <Section title="Tipo de QR" description="Qué va a abrir al escanearlo" icon={ListTree}>
          <QRTypeSelector />
        </Section>

        <Section title="Contenido" description={QR_TYPES[type].label} icon={PenLine}>
          <QRContentForm />
        </Section>

        <Section title="Apariencia" description="Colores y gradientes" icon={Palette}>
          <QRColorPicker />
        </Section>

        <Section title="Formas" description="Módulos y ojos" icon={Shapes} defaultOpen={false}>
          <QRShapeSelector />
        </Section>

        <Section title="Logo" description="Marca al centro del QR" icon={ImageIcon} defaultOpen={false}>
          <QRLogoSelector />
        </Section>

        <Section title="Marco" description="Llamado a la acción" icon={Frame} defaultOpen={false}>
          <QRFrameSelector />
        </Section>

        <div className="flex justify-end">
          <button type="button" className="btn h-9 text-xs text-muted" onClick={resetDesign}>
            <RotateCcw className="size-3.5" aria-hidden />
            Restablecer diseño
          </button>
        </div>
      </div>
    </div>
  );
}
