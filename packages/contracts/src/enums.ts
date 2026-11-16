export const USER_ROLES = ['producer', 'buyer', 'service_provider', 'ngo', 'cooperative', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const QUALITY_GRADES = ['A', 'B', 'C', 'D'] as const;
export type QualityGrade = (typeof QUALITY_GRADES)[number];

export const HARVEST_LOT_STATUSES = [
  'PENDING_CLASSIFICATION',
  'NEEDS_REVIEW',
  'CLASSIFIED',
  'LISTED',
  'SOLD',
  'DONATION_OFFERED',
  'DONATED',
  'DISCARDED',
] as const;
export type HarvestLotStatus = (typeof HARVEST_LOT_STATUSES)[number];

export const LOT_DESTINATIONS = [
  'MARKETPLACE',
  'DISCOUNT_MARKETPLACE',
  'AUCTION',
  'INDUSTRY',
  'DONATION',
  'ANIMAL_FEED',
  'COMPOST',
] as const;
export type LotDestination = (typeof LOT_DESTINATIONS)[number];

export const ORDER_STATUSES = [
  'CREATED',
  'PAID',
  'ACCEPTED',
  'IN_TRANSIT',
  'DELIVERED',
  'SETTLED',
  'CANCELLED',
  'DISPUTED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const BUYER_TYPES = ['RETAIL', 'RESTAURANT', 'INDUSTRY', 'PUBLIC_PROCUREMENT', 'CONSUMER'] as const;
export type BuyerType = (typeof BUYER_TYPES)[number];

export const SERVICE_TYPES = [
  'TRANSPORT',
  'COLD_STORAGE',
  'PACKING',
  'GRADING',
  'TECHNICAL_ASSISTANCE',
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const DONATION_STATUSES = ['OFFERED', 'ACCEPTED', 'PICKED_UP', 'RECEIVED', 'EXPIRED'] as const;
export type DonationStatus = (typeof DONATION_STATUSES)[number];
