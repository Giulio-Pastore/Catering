import { NavLink, Outlet, useLocation } from 'react-router-dom'
import styles from './Booking.module.css'

const steps = [
  { path: '/prenota', label: 'Pacchetto' },
  { path: '/prenota/dettagli', label: 'Dettagli' },
  { path: '/prenota/piatti', label: 'Piatti' },
  { path: '/prenota/pagamento', label: 'Pagamento' },
  { path: '/prenota/conferma', label: 'Conferma' },
]

export function BookingLayout() {
  const { pathname } = useLocation()

  return (
    <div className={styles.layout}>
      <header className={styles.intro}>
        <p className="eyebrow">Prenotazione</p>
        <h1>Prenota il tuo catering</h1>
        <p className={styles.sub}>
          Quattro passaggi chiari: scegli il menù, raccontaci gli ospiti, conferma.
        </p>
      </header>
      <nav className={styles.stepNav} aria-label="Passaggi prenotazione">
        {steps.map((step) => (
          <NavLink
            key={step.path}
            to={step.path}
            className={({ isActive }) =>
              isActive || (step.path !== '/prenota' && pathname === step.path)
                ? `${styles.stepLink} ${styles.active}`
                : styles.stepLink
            }
            end={step.path === '/prenota'}
          >
            {step.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}