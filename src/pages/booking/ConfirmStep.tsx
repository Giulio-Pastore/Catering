import type { Order } from '@shared/types'
import { Link, useLocation } from 'react-router-dom'
import { formatDateTime, formatEuro } from '../../lib/format'
import styles from './Booking.module.css'

function readStoredOrder(): Order | null {
  try {
    const raw = sessionStorage.getItem('convivio_last_order')
    return raw ? (JSON.parse(raw) as Order) : null
  } catch {
    return null
  }
}

export function ConfirmStep() {
  const location = useLocation()
  const stateOrder = (location.state as { order?: Order } | null)?.order
  const order = stateOrder ?? readStoredOrder()

  if (!order) {
    return (
      <section className={styles.panel}>
        <p>Nessuna conferma recente. Avvia una nuova prenotazione.</p>
        <Link to="/prenota" className="btn-primary">
          Prenota il tuo catering
        </Link>
      </section>
    )
  }

  return (
    <section className={styles.panel}>
      <p className="eyebrow">Passo 5</p>
      <h2>Ordine confermato</h2>
      <div className={styles.confirmBox}>
        <p>Codice prenotazione</p>
        <p className={styles.code}>{order.orderCode}</p>
        <p>Stato: {order.status === 'confirmed' ? 'Confermato' : order.status}</p>
        <p>Creato il {formatDateTime(order.createdAt)}</p>
        <p>
          {order.packageName} · {order.guestCount} ospiti · {formatEuro(order.totalCents)}
        </p>
      </div>
      <Link to="/" className="btn-ghost">
        Torna alla home
      </Link>
    </section>
  )
}