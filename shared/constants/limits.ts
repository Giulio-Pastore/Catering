export const GUEST_MIN = 8
export const GUEST_MAX = 120

export const ALLERGY_QUICK_OPTIONS = [
  'glutine',
  'lattosio',
  'uova',
  'frutta a guscio',
  'vegano',
] as const

export type AllergyQuickOption = (typeof ALLERGY_QUICK_OPTIONS)[number]