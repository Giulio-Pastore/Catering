import type { PaymentMethod } from '@shared/types'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBookingDraft } from '../../features/booking/booking-draft-context'
import { useCreateOrder, usePackages } from '../../hooks/use-catering-api'
import { formatEuro } from '../../lib/format'
import styles from './Booking.module.css'

const methods: Array<{ id: PaymentMethod; label: string }> = [
  { id: 'carta', label: 'Carta (mock)' },
  { id: 'bonifico', label: 'Bonifico (mock)' },
  { id: 'contanti', label: 'Contanti all’evento (mock)' },
]

export function PaymentStep() {
  const navigate = useNavigate()
  const { draft, setPaymentMethod, resetDraft } = useBookingDraft()
  const { data: packages } = usePackages()
  const createOrder = useCreateOrder()
  const [error, setError] = useState<string | null>(null)

  const pkg = packages?.find((p) => p.id === draft.packageId)
  const totalCents = useMemo(
    () => (pkg ? pkg.pricePerGuestCents * draft.guestCount : 0),
    [draft.guestCount, pkg],
  )

  if (!draft.packageId || !pkg) {
    return (
      <section className={styles.panel}>
        <p>Seleziona prima un pacchetto.</p>
        <Link to="/prenota" className="btn-ghost">
          ← Torna al passo 1
        </Link>
      </section>
    )
  }

  async function handleConfirm() {
    if (!draft.paymentMethod) {
      setError('Seleziona un metodo di pagamento mock.')
      return
    }
    setError(null)
    try {
      const order = await createOrder.mutateAsync({
        packageId: draft.packageId!,
        guestCount: draft.guestCount,
        allergyTags: draft.allergyTags,
        allergyNotes: draft.allergyNotes,
        substitutions: draft.substitutions,
        paymentMethod: draft.paymentMethod,
      })
      sessionStorage.setItem('convivio_last_order', JSON.stringify(order))
      resetDraft()
      navigate('/prenota/conferma', { state: { order } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la conferma')
    }
  }

  return (
    <section className={styles.panel}>
      <p className="eyebrow">Passo 4</p>
      <h2>Riepilogo e pagamento mock</h2>
      <div className={styles.subBlock}>
        <div className={styles.summaryRow}>
          <span>Pacchetto</span>
          <strong>{pkg.name}</strong>
        </div>
        <div className={styles.summaryRow}>
          <span>Ospiti</span>
          <strong>{draft.guestCount}</strong>
        </div>
        <div className={styles.summaryRow}>
          <span>Totale stimato</span>
          <span className={styles.summaryTotal}>{formatEuro(totalCents)}</span>
        </div>
      </div>
      <div className={styles.radioList}>
        {methods.map((m) => (
          <label key={m.id}>
            <input
              type="radio"
              name="payment"
              checked={draft.paymentMethod === m.id}
              onChange={() => setPaymentMethod(m.id)}
            />
            {m.label}
          </label>
        ))}
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        <Link to="/prenota/piatti" className="btn-ghost">
          ← Indietro
        </Link>
        <button
          type="button"
          className="btn-primary"
          disabled={createOrder.isPending}
          onClick={() => void handleConfirm()}
        >
          {createOrder.isPending ? 'Conferma in corso…' : 'Conferma ordine'}
        </button>
      </div>
    </section>
  )
}