import { Link, useNavigate } from 'react-router-dom'
import { useBookingDraft } from '../../features/booking/booking-draft-context'
import { usePackages } from '../../hooks/use-catering-api'
import { formatEuro } from '../../lib/format'
import styles from './Booking.module.css'

export function PackageStep() {
  const { data: packages, isLoading, error } = usePackages()
  const { draft, setPackageId } = useBookingDraft()
  const navigate = useNavigate()

  if (isLoading) return <p>Caricamento menù…</p>
  if (error) return <p className={styles.error}>Impossibile caricare i pacchetti.</p>

  return (
    <section className={styles.panel}>
      <p className="eyebrow">Passo 1</p>
      <h2>Scegli il percorso</h2>
      <div className={styles.packageList}>
        {packages?.map((pkg) => (
          <label
            key={pkg.id}
            className={styles.packageOption}
            data-selected={draft.packageId === pkg.id ? 'true' : 'false'}
          >
            <input
              type="radio"
              name="package"
              checked={draft.packageId === pkg.id}
              onChange={() => setPackageId(pkg.id)}
            />
            <div className={styles.packageMeta}>
              <h3>{pkg.name}</h3>
              <p>{pkg.positioning}</p>
              <p>{pkg.description}</p>
              <ul className={styles.menuPreview}>
                {pkg.dishes.map((d) => (
                  <li key={d.id}>
                    {d.course}: {d.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <strong>{formatEuro(pkg.pricePerGuestCents)}</strong>
              <div>/ persona</div>
            </div>
          </label>
        ))}
      </div>
      <div className={styles.actions}>
        <Link to="/" className="btn-ghost">
          ← Torna alla home
        </Link>
        <button
          type="button"
          className="btn-primary"
          disabled={!draft.packageId}
          onClick={() => navigate('/prenota/dettagli')}
        >
          Continua
        </button>
      </div>
    </section>
  )
}