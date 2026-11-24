export type Course = 'antipasto' | 'primo' | 'secondo' | 'contorno' | 'dessert'

export type PaymentMethod = 'carta' | 'bonifico' | 'contanti'

export type OrderStatus = 'confirmed' | 'pending' | 'cancelled'

export interface CateringPackage {
  id: string
  slug: string
  name: string
  description: string
  pricePerGuestCents: number
  positioning: string
}

export interface Dish {
  id: string
  packageId: string
  course: Course
  name: string
  description: string
  sortOrder: number
  substitutable: boolean
}

export interface SubstitutionOption {
  id: string
  dishId: string
  label: string
  sortOrder: number
}

export interface PackageWithDishes extends CateringPackage {
  dishes: Dish[]
}

export interface SubstitutionsByDish {
  dishId: string
  dishName: string
  defaultDishId: string
  options: SubstitutionOption[]
}

export interface CreateOrderBody {
  packageId: string
  guestCount: number
  allergyTags: string[]
  allergyNotes: string
  substitutions: Record<string, string>
  paymentMethod: PaymentMethod
}

export interface Order {
  id: string
  orderCode: string
  packageId: string
  packageName: string
  guestCount: number
  allergyTags: string[]
  allergyNotes: string
  substitutions: Record<string, string>
  substitutionLabels: Record<string, string>
  paymentMethod: PaymentMethod
  totalCents: number
  status: OrderStatus
  createdAt: string
}

export interface UpdateDishBody {
  name?: string
  description?: string
  substitutable?: boolean
  sortOrder?: number
}

export interface PutSubstitutionsBody {
  options: Array<{ label: string; sortOrder: number; id?: string }>
}