import { Link } from 'react-router-dom'
import { usePackages } from '../hooks/use-catering-api'
import { formatEuro } from '../lib/format'
import styles from './LandingPage.module.css'

export function LandingPage() {
  const { data: packages } = usePackages()
  const featured = packages?.find((p) => p.slug === 'convivio') ?? packages?.[1]

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">Catering di stagione</p>
          <h1 className="editorial-lead">
            Tavole calde,
            <br />
            racconti lungo il piatto.
          </h1>
          <p className={styles.lead}>
            Portiamo in casa vostra una cucina lenta e luminosa: prodotti scelti,
            servizio discreto, atmosfera da cena tra amici.
          </p>
          <Link to="/prenota" className="btn-primary">
            Prenota il tuo catering
          </Link>
        </div>
        <div className={`${styles.heroVisual} texture-blob`} aria-hidden="true">
          <span className={styles.monoStamp}>Convivio</span>
          <p className={styles.quote}>
            «La mise en place inizia dal respiro della sala.»
          </p>
        </div>
      </section>

      <section id="filosofia" className={styles.philosophy}>
        <div>
          <p className="eyebrow">Filosofia</p>
          <h2>Ingredienti veri, gesti misurati</h2>
        </div>
        <div className={styles.philosophyBody}>
          <p>
            Ogni menù nasce dal mercato del mattino. Cotture che rispettano il prodotto,
            abbinamenti sobri, niente fuochi d’artificio.
          </p>
          <blockquote>
            Crediamo nel ritmo della tavola: antipasti condivisi, piatti serviti al momento,
            conversazione che non ha fretta.
          </blockquote>
        </div>
      </section>

      <section id="come-funziona" className={styles.flow}>
        <p className="eyebrow">Come funziona</p>
        <ol className={styles.steps}>
          <li>
            <span>01</span>
            <div>
              <h3>Scegli il pacchetto</h3>
              <p>Terra, Convivio o Festa: tre percorsi con personalità diverse.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Personalizza</h3>
              <p>Ospiti, allergie e sostituzioni previste per primi e secondi.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Conferma</h3>
              <p>Riepilogo trasparente e conferma con codice dedicato.</p>
            </div>
          </li>
        </ol>
      </section>

      {featured ? (
        <section className={styles.preview}>
          <ImageHint />
          <div className={styles.previewText}>
            <p className="eyebrow">In evidenza</p>
            <h2>{featured.name}</h2>
            <p>{featured.description}</p>
            <p className={styles.price}>da {formatEuro(featured.pricePerGuestCents)} a persona</p>
            <Link to="/prenota" className="btn-ghost">
              Vedi tutti i menù in prenotazione →
            </Link>
          </div>
        </section>
      ) : null}

      <section className={styles.ctaBand}>
        <h2>Organizziamo la tua prossima tavola</h2>
        <Link to="/prenota" className="btn-primary">
          Prenota il tuo catering
        </Link>
      </section>
    </div>
  )
}

function ImageHint() {
  return (
    <div className={styles.previewVisual} aria-hidden="true">
      <div className={styles.plateMark} />
      <span>Olio · Erbe · Fuoco lento</span>
    </div>
  )
}