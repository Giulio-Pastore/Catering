import type { CreateOrderInput } from '@shared/schemas/order'
import type { Dish, Order, PackageWithDishes, SubstitutionsByDish } from '@shared/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api-client'

export function usePackages() {
  return useQuery({
    queryKey: ['packages'],
    queryFn: () => apiFetch<PackageWithDishes[]>('/api/packages'),
  })
}

export function usePackageSubstitutions(packageId: string | null) {
  return useQuery({
    queryKey: ['substitutions', packageId],
    enabled: Boolean(packageId),
    queryFn: () =>
      apiFetch<SubstitutionsByDish[]>(`/api/packages/${packageId}/substitutions`),
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateOrderInput) =>
      apiFetch<Order>('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
  })
}

export function useAdminSession(enabled: boolean) {
  return useQuery({
    queryKey: ['admin-session'],
    enabled,
    retry: false,
    queryFn: () => apiFetch<{ ok: boolean }>('/api/admin/session', {}, { admin: true }),
  })
}

export function useAdminOrders(enabled: boolean) {
  return useQuery({
    queryKey: ['admin-orders'],
    enabled,
    queryFn: () => apiFetch<Order[]>('/api/admin/orders', {}, { admin: true }),
  })
}

export function useUpdateDish() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Dish> }) =>
      apiFetch<Dish>(`/api/admin/dishes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }, { admin: true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['packages'] })
    },
  })
}

export function usePutSubstitutions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      dishId,
      options,
    }: {
      dishId: string
      options: Array<{ id?: string; label: string; sortOrder: number }>
    }) =>
      apiFetch(`/api/admin/dishes/${dishId}/substitutions`, {
        method: 'PUT',
        body: JSON.stringify({ options }),
      }, { admin: true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['packages'] })
      void queryClient.invalidateQueries({ queryKey: ['substitutions'] })
    },
  })
}