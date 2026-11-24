import {
  createOrderSchema,
  putSubstitutionsSchema,
  updateDishSchema,
} from '@shared/schemas/order'
import { Hono } from 'hono'
import type { Env } from './env'
import { adminAuth } from './middleware/admin-auth'
import {
  getMemoryRepository,
  RepositoryError,
} from './repositories/memory-catering-repository'

const api = new Hono<{ Bindings: Env }>()

function repo() {
  return getMemoryRepository()
}

api.get('/api/packages', async (c) => {
  return c.json(await repo().listPackages())
})

api.get('/api/packages/:id/substitutions', async (c) => {
  const packageId = c.req.param('id')
  return c.json(await repo().getPackageSubstitutions(packageId))
})

api.post('/api/orders', async (c) => {
  const parsed = createOrderSchema.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json(
      { error: 'Dati ordine non validi', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  try {
    const order = await repo().createOrder(parsed.data)
    return c.json(order, { status: 201 })
  } catch (err) {
    if (err instanceof RepositoryError) {
      return c.json({ error: err.message }, { status: err.status as 400 | 404 })
    }
    throw err
  }
})

api.get('/api/orders/:code', async (c) => {
  const order = await repo().getOrderByCode(c.req.param('code'))
  if (!order) return c.json({ error: 'Ordine non trovato' }, { status: 404 })
  return c.json(order)
})

const admin = new Hono<{ Bindings: Env }>()
admin.use('*', adminAuth)

admin.get('/session', (c) => c.json({ ok: true }))

admin.get('/orders', async (c) => {
  return c.json(await repo().listOrders())
})

admin.patch('/dishes/:id', async (c) => {
  const parsed = updateDishSchema.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json(
      { error: 'Payload non valido', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  try {
    const dish = await repo().updateDish(c.req.param('id'), parsed.data)
    return c.json(dish)
  } catch (err) {
    if (err instanceof RepositoryError) {
      return c.json({ error: err.message }, { status: err.status as 400 | 404 })
    }
    throw err
  }
})

admin.put('/dishes/:id/substitutions', async (c) => {
  const parsed = putSubstitutionsSchema.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json(
      { error: 'Payload non valido', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  try {
    const result = await repo().putDishSubstitutions(c.req.param('id'), parsed.data.options)
    return c.json(result)
  } catch (err) {
    if (err instanceof RepositoryError) {
      return c.json({ error: err.message }, { status: err.status as 400 | 404 })
    }
    throw err
  }
})

api.route('/api/admin', admin)

export { api }