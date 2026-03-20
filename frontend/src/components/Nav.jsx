import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './Nav.module.css';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '⬡' },
  { path: '/apod', label: 'APOD', icon: '✦' },
  { path: '/neo', label: 'Asteroids', icon: '◈' },
  { path: '/epic', label: 'Earth', icon: '◎' },
  { path: '/search', label: 'Search', icon: '◇' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoText}>NASA<span className={styles.logoAccent}>Explorer</span></span>
        </NavLink>

        <ul className={`${styles.navList} ${menuOpen ? styles.navOpen : ''}`}>
          {NAV_ITEMS.map(({ path, label, icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === '/'}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              >
                <span className={styles.navIcon}>{icon}</span>
                <span className={styles.navLabel}>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={`${styles.menuLine} ${menuOpen ? styles.menuLineOpen1 : ''}`} />
          <span className={`${styles.menuLine} ${menuOpen ? styles.menuLineOpen2 : ''}`} />
          <span className={`${styles.menuLine} ${menuOpen ? styles.menuLineOpen3 : ''}`} />
        </button>
      </nav>
    </header>
  );
}