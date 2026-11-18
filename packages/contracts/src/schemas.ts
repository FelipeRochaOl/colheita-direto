import { z } from 'zod';
import {
  BUYER_TYPES,
  DONATION_STATUSES,
  HARVEST_LOT_STATUSES,
  LOT_DESTINATIONS,
  ORDER_STATUSES,
  QUALITY_GRADES,
  SERVICE_TYPES,
  USER_ROLES,
} from './enums';

const brazilianPhoneSchema = z.string().regex(/^\+55\d{10,11}$/, 'Telefone no formato +55DDDNUMERO');

export const geoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type GeoPoint = z.infer<typeof geoPointSchema>;

// ---------- Identidade ----------
export const requestOtpSchema = z.object({ phoneNumber: brazilianPhoneSchema });
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z.object({
  phoneNumber: brazilianPhoneSchema,
  code: z.string().length(6),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const authSessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    phoneNumber: z.string(),
    name: z.string().nullable(),
    roles: z.array(z.enum(USER_ROLES)),
  }),
});
export type AuthSession = z.infer<typeof authSessionSchema>;

// ---------- Perfis ----------
export const registerProducerSchema = z.object({
  name: z.string().min(2),
  farmName: z.string().min(2),
  farmLocation: geoPointSchema,
  city: z.string().min(2),
  state: z.string().length(2),
  crops: z.array(z.string()).min(1),
  familyFarmRegistration: z.string().optional(),
  acceptedPrivacyPolicyVersion: z.string(),
});
export type RegisterProducerInput = z.infer<typeof registerProducerSchema>;

export const registerBuyerSchema = z.object({
  name: z.string().min(2),
  buyerType: z.enum(BUYER_TYPES),
  document: z.string().min(11),
  deliveryLocation: geoPointSchema,
  deliveryAddress: z.string().min(5),
  acceptedPrivacyPolicyVersion: z.string(),
});
export type RegisterBuyerInput = z.infer<typeof registerBuyerSchema>;

export const registerServiceProviderSchema = z.object({
  name: z.string().min(2),
  document: z.string().min(11),
  serviceTypes: z.array(z.enum(SERVICE_TYPES)).min(1),
  baseLocation: geoPointSchema,
  serviceRadiusKm: z.number().positive().max(500),
  vehicleCapacityKg: z.number().positive().optional(),
  hasRefrigeration: z.boolean().default(false),
  acceptedPrivacyPolicyVersion: z.string(),
});
export type RegisterServiceProviderInput = z.infer<typeof registerServiceProviderSchema>;

export const registerNgoSchema = z.object({
  name: z.string().min(2),
  document: z.string().min(14),
  location: geoPointSchema,
  address: z.string().min(5),
  pickupRadiusKm: z.number().positive().max(200),
  acceptedPrivacyPolicyVersion: z.string(),
});
export type RegisterNgoInput = z.infer<typeof registerNgoSchema>;

// ---------- Edição de perfil ("Meus dados") ----------
// Telefone é a identidade do login (OTP) e documentos são conferidos na aprovação/pagamento: não mudam aqui.
export const updateProducerProfileSchema = registerProducerSchema.omit({ acceptedPrivacyPolicyVersion: true });
export type UpdateProducerProfileInput = z.infer<typeof updateProducerProfileSchema>;
export const producerProfileSchema = updateProducerProfileSchema.extend({ id: z.string() });
export type ProducerProfile = z.infer<typeof producerProfileSchema>;

export const updateBuyerProfileSchema = registerBuyerSchema.omit({ acceptedPrivacyPolicyVersion: true, document: true });
export type UpdateBuyerProfileInput = z.infer<typeof updateBuyerProfileSchema>;
export const buyerProfileSchema = updateBuyerProfileSchema.extend({
  id: z.string(),
  document: z.string(),
  phoneNumber: z.string(),
});
export type BuyerProfile = z.infer<typeof buyerProfileSchema>;

export const updateNgoProfileSchema = registerNgoSchema.omit({ acceptedPrivacyPolicyVersion: true, document: true });
export type UpdateNgoProfileInput = z.infer<typeof updateNgoProfileSchema>;
export const ngoProfileSchema = updateNgoProfileSchema.extend({
  id: z.string(),
  document: z.string(),
  phoneNumber: z.string(),
  isApproved: z.boolean(),
});
export type NgoProfile = z.infer<typeof ngoProfileSchema>;

// ---------- Lotes de colheita ----------
export const photoUploadUrlSchema = z.object({ uploadUrl: z.string().url(), photoKey: z.string() });
export type PhotoUploadUrl = z.infer<typeof photoUploadUrlSchema>;

export const createHarvestLotSchema = z.object({
  crop: z.string().min(2),
  quantityBoxes: z.number().int().positive(),
  boxWeightKg: z.number().positive(),
  photoKeys: z.array(z.string()).min(1).max(5),
  harvestedAt: z.string().datetime(),
});
export type CreateHarvestLotInput = z.infer<typeof createHarvestLotSchema>;

export const lotClassificationSchema = z.object({
  grade: z.enum(QUALITY_GRADES),
  confidence: z.number().min(0).max(1),
  defects: z.array(z.string()),
  estimatedWeightKg: z.number().nullable(),
  classifierName: z.string(),
});
export type LotClassification = z.infer<typeof lotClassificationSchema>;

export const harvestLotSchema = z.object({
  id: z.string(),
  producerId: z.string(),
  crop: z.string(),
  quantityBoxes: z.number(),
  boxWeightKg: z.number(),
  photoUrls: z.array(z.string()),
  status: z.enum(HARVEST_LOT_STATUSES),
  classification: lotClassificationSchema.nullable(),
  destination: z.enum(LOT_DESTINATIONS).nullable(),
  suggestedPricePerBox: z.number().nullable(),
  harvestedAt: z.string(),
  createdAt: z.string(),
});
export type HarvestLot = z.infer<typeof harvestLotSchema>;

export const confirmLotDestinationSchema = z.object({
  destination: z.enum(LOT_DESTINATIONS),
  pricePerBox: z.number().positive().optional(),
});
export type ConfirmLotDestinationInput = z.infer<typeof confirmLotDestinationSchema>;

// ---------- Marketplace ----------
export const offerSchema = z.object({
  id: z.string(),
  harvestLotId: z.string(),
  producerId: z.string(),
  producerName: z.string(),
  crop: z.string(),
  grade: z.enum(QUALITY_GRADES),
  availableBoxes: z.number(),
  boxWeightKg: z.number(),
  pricePerBox: z.number(),
  photoUrls: z.array(z.string()),
  location: geoPointSchema,
  city: z.string(),
  state: z.string(),
  distanceKm: z.number().nullable(),
});
export type Offer = z.infer<typeof offerSchema>;

export const searchOffersSchema = z.object({
  crop: z.string().optional(),
  grades: z.array(z.enum(QUALITY_GRADES)).optional(),
  maxDistanceKm: z.number().positive().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  maxPricePerBox: z.number().positive().optional(),
});
export type SearchOffersInput = z.infer<typeof searchOffersSchema>;

// ---------- Pedidos ----------
export const createOrderSchema = z.object({
  items: z
    .array(z.object({ offerId: z.string(), boxes: z.number().int().positive() }))
    .min(1),
  deliveryMode: z.enum(['PICKUP', 'PRODUCER_DELIVERY', 'PLATFORM_FREIGHT']),
  extraServices: z.array(z.enum(['COLD_STORAGE', 'PACKING'])).default([]),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  producerId: z.string(),
  items: z.array(
    z.object({ offerId: z.string(), crop: z.string(), boxes: z.number(), pricePerBox: z.number() }),
  ),
  productsTotal: z.number(),
  servicesTotal: z.number(),
  platformFee: z.number(),
  total: z.number(),
  status: z.enum(ORDER_STATUSES),
  payment: z
    .object({ pixQrCodeImage: z.string().nullable(), pixCopyPaste: z.string().nullable(), invoiceUrl: z.string().nullable() })
    .nullable(),
  createdAt: z.string(),
});
export type Order = z.infer<typeof orderSchema>;

// ---------- Doações ----------
export const donationSchema = z.object({
  id: z.string(),
  harvestLotId: z.string(),
  producerName: z.string(),
  crop: z.string(),
  quantityBoxes: z.number(),
  estimatedWeightKg: z.number(),
  pickupLocation: geoPointSchema,
  status: z.enum(DONATION_STATUSES),
  ngoId: z.string().nullable(),
  receivedWeightKg: z.number().nullable(),
  createdAt: z.string(),
});
export type Donation = z.infer<typeof donationSchema>;

export const confirmDonationReceiptSchema = z.object({ receivedWeightKg: z.number().positive() });
export type ConfirmDonationReceiptInput = z.infer<typeof confirmDonationReceiptSchema>;

// ---------- Indicadores ----------
export const impactIndicatorsSchema = z.object({
  activeProducers: z.number(),
  lotsClassified: z.number(),
  kilogramsSold: z.number(),
  kilogramsDonated: z.number(),
  utilizationRate: z.number(),
  averageHoursToSale: z.number().nullable(),
  revenueToProducers: z.number(),
});
export type ImpactIndicators = z.infer<typeof impactIndicatorsSchema>;

export const apiErrorSchema = z.object({ code: z.string(), message: z.string() });
export type ApiError = z.infer<typeof apiErrorSchema>;
