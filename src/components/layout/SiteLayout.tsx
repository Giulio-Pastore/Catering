import { NavLink, Outlet, useLocation } from 'react-router-dom'
import styles from './SiteLayout.module.css'

export function SiteLayout() {
  const { pathname } = useLocation()
  const isBooking = pathname.startsWith('/prenota')

  return (
    <div className={styles.shell} data-booking={isBooking ? 'true' : 'false'}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.brand}>
          Convivio
        </NavLink>
        <nav className={styles.nav}>
          <a href="/#filosofia">Filosofia</a>
          <a href="/#come-funziona">Come funziona</a>
          <NavLink to="/prenota" className={styles.bookCta}>
            Prenota il tuo catering
          </NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>Cucina di stagione · Eventi intimi e tavole lunghe · Milano e hinterland</p>
      </footer>
    </div>
  )
}