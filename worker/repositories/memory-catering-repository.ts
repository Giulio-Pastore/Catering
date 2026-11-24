import type { CreateOrderInput } from '@shared/schemas/order'
import type {
  CateringPackage,
  Dish,
  Order,
  PackageWithDishes,
  SubstitutionOption,
  SubstitutionsByDish,
  UpdateDishBody,
} from '@shared/types'
import {
  seedDishes,
  seedOrders,
  seedPackages,
  seedSubstitutions,
} from '../seed'
import type {
  CateringRepository,
  SubstitutionOptionList,
} from './catering-repository'

function clone<T>(value: T): T {
  return structuredClone(value)
}

let store: {
  packages: CateringPackage[]
  dishes: Dish[]
  substitutions: SubstitutionOption[]
  orders: Order[]
} | null = null

function getStore() {
  if (!store) {
    store = {
      packages: clone(seedPackages),
      dishes: clone(seedDishes),
      substitutions: clone(seedSubstitutions),
      orders: clone(seedOrders),
    }
  }
  return store
}

function makeOrderCode(): string {
  const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase()
  return `CV-2026-${suffix}`
}

export class MemoryCateringRepository implements CateringRepository {
  async listPackages(): Promise<PackageWithDishes[]> {
    const data = getStore()
    return data.packages.map((pkg) => ({
      ...pkg,
      dishes: data.dishes
        .filter((d) => d.packageId === pkg.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
  }

  async getPackageSubstitutions(packageId: string): Promise<SubstitutionsByDish[]> {
    const data = getStore()
    const dishes = data.dishes.filter(
      (d) => d.packageId === packageId && d.substitutable,
    )
    return dishes.map((dish) => ({
      dishId: dish.id,
      dishName: dish.name,
      defaultDishId: dish.id,
      options: data.substitutions
        .filter((s) => s.dishId === dish.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const data = getStore()
    const pkg = data.packages.find((p) => p.id === input.packageId)
    if (!pkg) throw new RepositoryError('Pacchetto non trovato', 404)

    const substitutionMap = await this.getPackageSubstitutions(pkg.id)
    const labelByOption = new Map<string, string>()
    for (const block of substitutionMap) {
      for (const opt of block.options) {
        labelByOption.set(opt.id, opt.label)
      }
    }

    for (const [dishId, optionId] of Object.entries(input.substitutions)) {
      const dish = data.dishes.find((d) => d.id === dishId)
      if (!dish || dish.packageId !== pkg.id) {
        throw new RepositoryError('Sostituzione non valida per questo menù', 400)
      }
      if (!dish.substitutable) {
        throw new RepositoryError(`Il piatto ${dish.name} non è sostituibile`, 400)
      }
      const allowed = data.substitutions.some(
        (s) => s.dishId === dishId && s.id === optionId,
      )
      if (!allowed) {
        throw new RepositoryError('Opzione di sostituzione non consentita', 400)
      }
    }

    const substitutionLabels: Record<string, string> = {}
    for (const [dishId, optionId] of Object.entries(input.substitutions)) {
      substitutionLabels[dishId] = labelByOption.get(optionId) ?? optionId
    }

    const order: Order = {
      id: crypto.randomUUID(),
      orderCode: makeOrderCode(),
      packageId: pkg.id,
      packageName: pkg.name,
      guestCount: input.guestCount,
      allergyTags: input.allergyTags,
      allergyNotes: input.allergyNotes,
      substitutions: input.substitutions,
      substitutionLabels,
      paymentMethod: input.paymentMethod,
      totalCents: pkg.pricePerGuestCents * input.guestCount,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    }

    data.orders.unshift(order)
    return order
  }

  async getOrderByCode(code: string): Promise<Order | null> {
    return getStore().orders.find((o) => o.orderCode === code) ?? null
  }

  async listOrders(): Promise<Order[]> {
    return [...getStore().orders].sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    )
  }

  async updateDish(dishId: string, body: UpdateDishBody): Promise<Dish> {
    const data = getStore()
    const index = data.dishes.findIndex((d) => d.id === dishId)
    if (index === -1) throw new RepositoryError('Piatto non trovato', 404)
    const updated: Dish = { ...data.dishes[index]!, ...body }
    data.dishes[index] = updated
    if (!updated.substitutable) {
      data.substitutions = data.substitutions.filter((s) => s.dishId !== dishId)
    }
    return updated
  }

  async putDishSubstitutions(
    dishId: string,
    options: Array<{ id?: string; label: string; sortOrder: number }>,
  ): Promise<SubstitutionOptionList> {
    const data = getStore()
    const dish = data.dishes.find((d) => d.id === dishId)
    if (!dish) throw new RepositoryError('Piatto non trovato', 404)
    if (!dish.substitutable) {
      throw new RepositoryError('Il piatto non è contrassegnato come sostituibile', 400)
    }

    const nextOptions: SubstitutionOption[] = options.map((opt) => ({
      id: opt.id ?? `sub-${dishId}-${crypto.randomUUID().slice(0, 8)}`,
      dishId,
      label: opt.label,
      sortOrder: opt.sortOrder,
    }))

    data.substitutions = [
      ...data.substitutions.filter((s) => s.dishId !== dishId),
      ...nextOptions,
    ]

    return {
      dishId,
      options: nextOptions.map((o) => ({
        id: o.id,
        label: o.label,
        sortOrder: o.sortOrder,
      })),
    }
  }
}

export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'RepositoryError'
  }
}

let singleton: MemoryCateringRepository | null = null

export function getMemoryRepository(): CateringRepository {
  singleton ??= new MemoryCateringRepository()
  return singleton
}