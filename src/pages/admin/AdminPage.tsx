import type { Dish, Order, PackageWithDishes } from '@shared/types'
import { useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import {
  ApiError,
  apiFetch,
  clearAdminToken,
  getAdminToken,
  setAdminToken,
} from '../../lib/api-client'
import { formatDateTime, formatEuro } from '../../lib/format'
import {
  useAdminOrders,
  useAdminSession,
  usePackages,
  usePutSubstitutions,
  useUpdateDish,
} from '../../hooks/use-catering-api'
import styles from './AdminPage.module.css'

export function AdminPage() {
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [authed, setAuthed] = useState(Boolean(getAdminToken()))
  const queryClient = useQueryClient()

  const session = useAdminSession(authed)
  const orders = useAdminOrders(authed && session.isSuccess)
  const { data: packages } = usePackages()

  useEffect(() => {
    if (session.isError) {
      clearAdminToken()
      setAuthed(false)
      setLoginError('Password non valida o sessione scaduta.')
    }
  }, [session.isError])

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setLoginError(null)
    setAdminToken(password)
    try {
      await queryClient.fetchQuery({
        queryKey: ['admin-session'],
        queryFn: () => apiFetch<{ ok: boolean }>('/api/admin/session', {}, { admin: true }),
      })
      setAuthed(true)
    } catch (err) {
      clearAdminToken()
      setAuthed(false)
      setLoginError(err instanceof ApiError ? err.message : 'Accesso non riuscito')
    }
  }

  function handleLogout() {
    clearAdminToken()
    setAuthed(false)
    void queryClient.removeQueries({ queryKey: ['admin-session'] })
    void queryClient.removeQueries({ queryKey: ['admin-orders'] })
  }

  if (!authed) {
    return (
      <section className={styles.gate}>
        <p className="eyebrow">Admin</p>
        <h1>Area riservata</h1>
        <form className={styles.loginForm} onSubmit={(e) => void handleLogin(e)}>
          <label htmlFor="admin-pass">Password</label>
          <input
            id="admin-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {loginError ? <p className={styles.error}>{loginError}</p> : null}
          <button type="submit" className="btn-primary">
            Entra
          </button>
        </form>
      </section>
    )
  }

  if (session.isPending || session.isLoading) {
    return <p className={styles.gate}>Verifica accesso…</p>
  }

  if (session.isError) {
    return null
  }

  return (
    <div className={styles.admin}>
      <header className={styles.adminHeader}>
        <div>
          <p className="eyebrow">Pannello</p>
          <h1>Ordini e menù</h1>
        </div>
        <button type="button" className="btn-ghost" onClick={handleLogout}>
          Esci
        </button>
      </header>
      <AdminOrders orders={orders.data ?? []} loading={orders.isLoading} />
      <AdminMenuEditor packages={packages ?? []} />
    </div>
  )
}

function AdminOrders({ orders, loading }: { orders: Order[]; loading: boolean }) {
  return (
    <section className={styles.section}>
      <h2>Ordini</h2>
      {loading ? <p>Caricamento…</p> : null}
      <ul className={styles.orders}>
        {orders.map((order) => (
          <li key={order.id} className={styles.orderRow}>
            <div>
              <strong>{order.orderCode}</strong>
              <p>
                {order.packageName} · {order.guestCount} ospiti ·{' '}
                {formatEuro(order.totalCents)}
              </p>
              <p className={styles.muted}>{formatDateTime(order.createdAt)}</p>
            </div>
            <div>
              <p>Allergie: {order.allergyTags.join(', ') || '—'}</p>
              <p>Note: {order.allergyNotes || '—'}</p>
              <p>
                Sostituzioni:{' '}
                {Object.entries(order.substitutionLabels)
                  .map(([dishId, label]) => `${dishId}: ${label}`)
                  .join(' · ') || '—'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function AdminMenuEditor({ packages }: { packages: PackageWithDishes[] }) {
  const updateDish = useUpdateDish()
  const putSubs = usePutSubstitutions()
  const substitutable = useMemo(
    () => packages.flatMap((p) => p.dishes.filter((d) => d.substitutable)),
    [packages],
  )

  return (
    <section className={styles.section}>
      <h2>Piatti e sostituzioni</h2>
      <div className={styles.dishGrid}>
        {substitutable.map((dish) => (
          <DishEditor
            key={dish.id}
            dish={dish}
            saving={updateDish.isPending || putSubs.isPending}
            onSave={async (name, optionsText) => {
              await updateDish.mutateAsync({ id: dish.id, body: { name } })
              const options = optionsText
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
                .map((label, index) => ({ label, sortOrder: index }))
              if (options.length) {
                await putSubs.mutateAsync({ dishId: dish.id, options })
              }
            }}
          />
        ))}
      </div>
    </section>
  )
}

function DishEditor({
  dish,
  saving,
  onSave,
}: {
  dish: Dish
  saving: boolean
  onSave: (name: string, optionsText: string) => Promise<void>
}) {
  const [name, setName] = useState(dish.name)
  const [optionsText, setOptionsText] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  return (
    <article className={styles.dishCard}>
      <p className={styles.muted}>{dish.course}</p>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <label>
        Alternative (una per riga)
        <textarea
          rows={4}
          value={optionsText}
          onChange={(e) => setOptionsText(e.target.value)}
          placeholder="Es. Risotto radicchio"
        />
      </label>
      <button
        type="button"
        className="btn-ghost"
        disabled={saving}
        onClick={() =>
          void onSave(name, optionsText).then(() =>
            setMessage('Salvato (memoria Worker).'),
          )
        }
      >
        Salva
      </button>
      {message ? <p className={styles.muted}>{message}</p> : null}
    </article>
  )
}