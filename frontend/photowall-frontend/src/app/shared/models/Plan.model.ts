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
