import React, { useState, useEffect } from 'react';
import { epicAPI } from '../utils/api';
import { SectionHeader, Spinner, ErrorMessage, Badge, Select, Button, EmptyState } from '../components/UI';
import styles from './Epic.module.css';

export default function EpicPage() {
  const [images, setImages] = useState([]);
  const [dates, setDates] = useState([]);
  const [type, setType] = useState('natural');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [datesLoading, setDatesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    setDatesLoading(true);
    epicAPI.getDates(type)
      .then(data => {
        setDates(data || []);
        setSelectedDate(data?.[0]?.date || '');
      })
      .catch(() => {})
      .finally(() => setDatesLoading(false));
  }, [type]);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = selectedDate
        ? await epicAPI.getByDate(selectedDate, type)
        : await epicAPI.getLatest(type);
      setImages(data || []);
      setSlideIdx(0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!datesLoading) fetchImages();
  }, [selectedDate, type, datesLoading]);

  const current = images[slideIdx];

  const prev = () => setSlideIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setSlideIdx(i => (i + 1) % images.length);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <SectionHeader
          title="Earth from DSCOVR"
          subtitle="The full sunlit disc of Earth captured a million miles away"
        >
          <div className={styles.controls}>
            <Select value={type} onChange={e => setType(e.target.value)} id="type-select">
              <option value="natural">Natural Colour</option>
              <option value="enhanced">Enhanced</option>
            </Select>

            {dates.length > 0 && (
              <Select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} id="date-select">
                {dates.map(d => (
                  <option key={d.date} value={d.date}>{d.date}</option>
                ))}
              </Select>
            )}
          </div>
        </SectionHeader>

        {loading ? (
          <div className={styles.center}><Spinner size="lg" /></div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchImages} />
        ) : images.length === 0 ? (
          <EmptyState icon="🌍" title="No imagery available" message="Try selecting a different date or type." />
        ) : (
          <div className={styles.layout}>
            {/* Main viewer */}
            <div className={styles.viewer}>
              <div className={styles.earthContainer}>
                <img
                  key={current?.image_url}
                  src={current?.image_url}
                  alt={`Earth from EPIC - ${current?.date}`}
                  className={styles.earthImg}
                  onError={e => { e.target.src = current?.thumb_url; }}
                />
                {/* Scanline overlay */}
                <div className={styles.scanlines} aria-hidden="true" />
                <div className={styles.earthGlow} aria-hidden="true" />
              </div>

              {/* Navigation */}
              {images.length > 1 && (
                <div className={styles.slideNav}>
                  <Button variant="ghost" size="sm" onClick={prev}>← Prev</Button>
                  <span className={styles.slideCount}>
                    {slideIdx + 1} / {images.length}
                  </span>
                  <Button variant="ghost" size="sm" onClick={next}>Next →</Button>
                </div>
              )}
            </div>

            {/* Info panel */}
            <div className={styles.infoPanel}>
              <div className={styles.infoBadges}>
                <Badge variant="electric" size="sm">DSCOVR-EPIC</Badge>
                <Badge variant={type === 'enhanced' ? 'warning' : 'success'} size="sm">
                  {type === 'enhanced' ? 'Enhanced' : 'Natural'}
                </Badge>
              </div>

              <h2 className={styles.infoTitle}>Image {slideIdx + 1}</h2>

              {current && (
                <>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Date & Time</span>
                      <span className={styles.infoValue}>{current.date?.replace('T', ' ')?.replace('.000Z', '') ?? '—'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Centroid Lat</span>
                      <span className={styles.infoValue}>{current.centroid_coordinates?.lat?.toFixed(2)}°</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Centroid Lon</span>
                      <span className={styles.infoValue}>{current.centroid_coordinates?.lon?.toFixed(2)}°</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Sun J2000</span>
                      <span className={styles.infoValue}>
                        {current.sun_j2000_position
                          ? `${current.sun_j2000_position.x?.toFixed(0)}, ${current.sun_j2000_position.y?.toFixed(0)}`
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {current.caption && (
                    <p className={styles.caption}>{current.caption}</p>
                  )}
                </>
              )}

              {/* Thumbnail strip */}
              <div className={styles.thumbStrip}>
                {images.map((img, i) => (
                  <button
                    key={img.identifier || i}
                    className={`${styles.thumb} ${i === slideIdx ? styles.thumbActive : ''}`}
                    onClick={() => setSlideIdx(i)}
                    aria-label={`Image ${i + 1}`}
                  >
                    <img src={img.thumb_url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
