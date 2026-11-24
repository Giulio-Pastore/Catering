import type { CreateOrderInput } from '@shared/schemas/order'
import type {
  Dish,
  Order,
  PackageWithDishes,
  SubstitutionsByDish,
  UpdateDishBody,
} from '@shared/types'

export interface CateringRepository {
  listPackages(): Promise<PackageWithDishes[]>
  getPackageSubstitutions(packageId: string): Promise<SubstitutionsByDish[]>
  createOrder(input: CreateOrderInput): Promise<Order>
  getOrderByCode(code: string): Promise<Order | null>
  listOrders(): Promise<Order[]>
  updateDish(dishId: string, body: UpdateDishBody): Promise<Dish>
  putDishSubstitutions(
    dishId: string,
    options: Array<{ id?: string; label: string; sortOrder: number }>,
  ): Promise<SubstitutionOptionList>
}

export interface SubstitutionOptionList {
  dishId: string
  options: Array<{ id: string; label: string; sortOrder: number }>
}