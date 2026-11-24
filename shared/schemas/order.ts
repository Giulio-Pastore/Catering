import { z } from 'zod'
import { GUEST_MAX, GUEST_MIN } from '../constants/limits'
import type { PaymentMethod } from '../types'

const paymentMethods = ['carta', 'bonifico', 'contanti'] as const satisfies readonly PaymentMethod[]

export const createOrderSchema = z.object({
  packageId: z.string().min(1),
  guestCount: z.number().int().min(GUEST_MIN).max(GUEST_MAX),
  allergyTags: z.array(z.string()),
  allergyNotes: z.string().max(2000).default(''),
  substitutions: z.record(z.string(), z.string()),
  paymentMethod: z.enum(paymentMethods),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

export const updateDishSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  substitutable: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const putSubstitutionsSchema = z.object({
  options: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().min(1).max(200),
        sortOrder: z.number().int().min(0),
      }),
    )
    .min(1)
    .max(12),
})