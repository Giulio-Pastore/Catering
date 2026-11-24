import { Link, useNavigate } from 'react-router-dom'
import { useBookingDraft } from '../../features/booking/booking-draft-context'
import { usePackageSubstitutions } from '../../hooks/use-catering-api'
import styles from './Booking.module.css'

export function DishesStep() {
  const navigate = useNavigate()
  const { draft, setSubstitution, clearSubstitution } = useBookingDraft()
  const { data: blocks, isLoading, error } = usePackageSubstitutions(draft.packageId)

  if (!draft.packageId) {
    return (
      <section className={styles.panel}>
        <p>Seleziona prima un pacchetto.</p>
        <Link to="/prenota" className="btn-ghost">
          ← Torna al passo 1
        </Link>
      </section>
    )
  }

  return (
    <section className={styles.panel}>
      <p className="eyebrow">Passo 3</p>
      <h2>Sostituzioni previste</h2>
      <p>
        Le alternative sono fisse e definite dal nostro team: puoi scegliere solo tra quelle
        elencate per ogni piatto sostituibile.
      </p>
      {isLoading ? <p>Caricamento opzioni…</p> : null}
      {error ? <p className={styles.error}>Errore nel caricamento delle sostituzioni.</p> : null}
      <div className={styles.packageList}>
        {blocks?.map((block) => (
          <div key={block.dishId} className={styles.subBlock}>
            <strong>{block.dishName}</strong>
            <div className={styles.fieldRow}>
              <label htmlFor={`sub-${block.dishId}`}>Alternativa</label>
              <select
                id={`sub-${block.dishId}`}
                value={draft.substitutions[block.dishId] ?? ''}
                onChange={(e) => {
                  const value = e.target.value
                  if (!value) clearSubstitution(block.dishId)
                  else setSubstitution(block.dishId, value)
                }}
              >
                <option value="">Nessuna sostituzione (piatto base)</option>
                {block.options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <Link to="/prenota/dettagli" className="btn-ghost">
          ← Indietro
        </Link>
        <button type="button" className="btn-primary" onClick={() => navigate('/prenota/pagamento')}>
          Continua
        </button>
      </div>
    </section>
  )
}