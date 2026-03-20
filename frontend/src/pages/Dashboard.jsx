import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apodAPI, neoAPI } from '../utils/api';
import { Spinner, Badge } from '../components/UI';
import styles from './Dashboard.module.css';

const MODULES = [
  { path: '/apod',   icon: '✦', title: 'Picture of the Day',    subtitle: 'Daily cosmic imagery from NASA',               color: 'amber' },
  { path: '/neo',    icon: '◈', title: 'Near-Earth Objects',     subtitle: 'Track asteroids approaching Earth',            color: 'electric' },
  { path: '/epic',   icon: '◎', title: 'Earth from Space',       subtitle: 'DSCOVR EPIC satellite imagery',               color: 'green' },
  { path: '/search', icon: '◇', title: 'Image Library',          subtitle: "Search NASA's vast media archive",            color: 'ion' },
];

export default function Dashboard() {
  const [apod, setApod] = useState(null);
  const [neoCount, setNeoCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [apodData, neoData] = await Promise.allSettled([
          apodAPI.getToday(),
          neoAPI.getFeed(),
        ]);
        if (apodData.status === 'fulfilled') setApod(apodData.value);
        if (neoData.status === 'fulfilled') setNeoCount(neoData.value.element_count);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}><span className={styles.dot} />NASA Open Data Explorer</div>
          <h1 className={styles.heroTitle}>Explore the<br /><span className={styles.heroGradient}>Universe</span></h1>
          <p className={styles.heroSub}>Real-time data from NASA's APIs — asteroids, Earth imagery, daily astronomy and beyond.</p>
          <div className={styles.heroCtas}>
            <Link to="/apod" className={styles.ctaPrimary}>Today's Space Photo</Link>
            <Link to="/neo" className={styles.ctaSecondary}>Track Asteroids</Link>
          </div>
        </div>

        <div className={styles.heroVisual}>
          {loading ? (
            <div className={styles.apodSkeleton}><Spinner size="lg" /></div>
          ) : apod?.url ? (
            <div className={styles.apodPreview}>
              {apod.media_type === 'image' ? (
                <img src={apod.url} alt={apod.title} className={styles.apodImg} />
              ) : (
                <div className={styles.apodVideo}><span>🎬</span><span>Video: {apod.title}</span></div>
              )}
              <div className={styles.apodCaption}>
                <Badge variant="electric" size="sm">Today's APOD</Badge>
                <p className={styles.apodTitle}>{apod.title}</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.statsBar}>
        <div className={styles.statItem}><span className={styles.statNum}>{neoCount ?? '—'}</span><span className={styles.statDesc}>Asteroids tracked this week</span></div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}><span className={styles.statNum}>4</span><span className={styles.statDesc}>APIs integrated</span></div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}><span className={styles.statNum}>∞</span><span className={styles.statDesc}>Images in library</span></div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}><span className={styles.statNum}>Live</span><span className={styles.statDesc}>NASA API data</span></div>
      </section>

      <section className={styles.modules}>
        <h2 className={styles.modulesHeading}>What do you want to explore?</h2>
        <div className={styles.moduleGrid}>
          {MODULES.map((mod) => (
            <Link key={mod.path} to={mod.path} className={`${styles.moduleCard} ${styles[`module-${mod.color}`]}`}>
              <span className={styles.moduleIcon}>{mod.icon}</span>
              <div>
                <h3 className={styles.moduleTitle}>{mod.title}</h3>
                <p className={styles.moduleSub}>{mod.subtitle}</p>
              </div>
              <span className={styles.moduleArrow}>→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}