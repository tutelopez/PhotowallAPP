export enum PlanType {
  FREE = 'free',
  ESENCIAL = 'esencial',
  ESTANDAR = 'estandar',
  PREMIUM = 'premium'
}
export interface PlanUsage {
  plan: PlanType;
  maxPhotos: number | null;
  currentPhotos: number;
  maxMessages: number | null;
  currentMessages: number;
  watermark: boolean;
  branding: boolean;
  galleryDays: number | null;
}
export const PLAN_LABELS: Record<PlanType, string> = {
  [PlanType.FREE]: 'Gratis',
  [PlanType.ESENCIAL]: 'Esencial',
  [PlanType.ESTANDAR]: 'Estándar',
  [PlanType.PREMIUM]: 'Premium'
};
export interface PlanCatalogEntry {
  plan: PlanType;
  name: string;
  priceCOP: number;
  priceUSD: number;
  tagline: string;
  features: string[];
  highlighted?: boolean;
};
export const PLAN_CATALOG: PlanCatalogEntry[] = [
  {
    plan: PlanType.FREE,
    name: 'Gratis',
    priceCOP: 0,
    priceUSD: 0,
    tagline: 'Para probar la app antes de tu evento',
    features: ['Hasta 25 fotos', 'Hasta 10 mensajes en pantalla', 'Galería activa 3 días', 'Marca de agua PhotoWall']
  },
  {
    plan: PlanType.ESENCIAL,
    name: 'Esencial',
    priceCOP: 55000,
    priceUSD: 16.99,
    tagline: 'Ideal para cumpleaños y reuniones pequeñas',
    features: ['Hasta 100 fotos y videos', 'Hasta 50 mensajes en pantalla', 'Galería activa 30 días', 'Sin marca de agua', 'Descarga en ZIP']
  },
  {
    plan: PlanType.ESTANDAR,
    name: 'Estándar',
    priceCOP: 95000,
    priceUSD: 29.99,
    tagline: 'El favorito para bodas y quince años',
    features: ['Hasta 250 fotos y videos', 'Mensajes ilimitados', 'Galería activa 6 meses', 'Personalización de color', 'Descarga en ZIP'],
    highlighted: true
  },
  {
    plan: PlanType.PREMIUM,
    name: 'Premium',
    priceCOP: 165000,
    priceUSD: 49.99,
    tagline: 'Todo sin límites para el evento perfecto',
    features: ['Fotos y videos ilimitados', 'Mensajes ilimitados', 'Galería activa 12 meses', 'Personalización de color', 'Descarga en ZIP', 'Soporte prioritario']
  }
];
