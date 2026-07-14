export enum PlanType {
  FREE = 'free',
  ESENCIAL = 'esencial',
  ESTANDAR = 'estandar',
  PREMIUM = 'premium'
}
export interface PlanLimits {
  maxPhotos: number | null;
  maxMessages: number | null;
  galleryDays: number | null;
  watermark: boolean;
  branding: boolean;
}
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.FREE]: {
    maxPhotos: 25,
    maxMessages: 10,
    galleryDays: 3,
    watermark: true,
    branding: false
  },
  [PlanType.ESENCIAL]: {
    maxPhotos: 100,
    maxMessages: 50,
    galleryDays: 30,
    watermark: false,
    branding: false
  },
  [PlanType.ESTANDAR]: {
    maxPhotos: 250,
    maxMessages: null,
    galleryDays: 180,
    watermark: false,
    branding: true
  },
  [PlanType.PREMIUM]: {
    maxPhotos: null,
    maxMessages: null,
    galleryDays: 365,
    watermark: false,
    branding: true
  }
};