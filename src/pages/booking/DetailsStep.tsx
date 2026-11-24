import { GUEST_MAX, GUEST_MIN } from '@shared/constants/limits'
import { Link, useNavigate } from 'react-router-dom'
import { useBookingDraft } from '../../features/booking/booking-draft-context'
import styles from './Booking.module.css'

export function DetailsStep() {
  const navigate = useNavigate()
  const {
    draft,
    allergyOptions,
    setGuestCount,
    toggleAllergy,
    setAllergyNotes,
  } = useBookingDraft()

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
      <p className="eyebrow">Passo 2</p>
      <h2>Ospiti e allergie</h2>
      <div className={styles.fieldRow}>
        <label htmlFor="guests">Numero ospiti ({GUEST_MIN}–{GUEST_MAX})</label>
        <input
          id="guests"
          type="number"
          min={GUEST_MIN}
          max={GUEST_MAX}
          value={draft.guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
        />
      </div>
      <div>
        <p>Allergie o preferenze rapide</p>
        <div className={styles.chips}>
          {allergyOptions.map((tag) => (
            <button
              key={tag}
              type="button"
              className={styles.chip}
              data-on={draft.allergyTags.includes(tag) ? 'true' : 'false'}
              onClick={() => toggleAllergy(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.fieldRow}>
        <label htmlFor="notes">Note aggiuntive</label>
        <textarea
          id="notes"
          rows={4}
          value={draft.allergyNotes}
          onChange={(e) => setAllergyNotes(e.target.value)}
          placeholder="Es. ospite celiaco al tavolo 3, no alcol in cucina…"
        />
      </div>
      <div className={styles.actions}>
        <Link to="/prenota" className="btn-ghost">
          ← Indietro
        </Link>
        <button type="button" className="btn-primary" onClick={() => navigate('/prenota/piatti')}>
          Continua
        </button>
      </div>
    </section>
  )
}