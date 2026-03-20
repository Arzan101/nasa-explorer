import React, { useState, useEffect } from 'react';
import { apodAPI } from '../utils/api';
import { SectionHeader, Spinner, ErrorMessage, Button, Input, Badge } from '../components/UI';
import styles from './Apod.module.css';

function ApodCard({ item, featured = false }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!item) return null;

  return (
    <article className={`${styles.apodCard} ${featured ? styles.apodFeatured : ''}`}>
      <div className={styles.apodMedia}>
        {item.media_type === 'image' ? (
          <>
            {!imgLoaded && <div className={styles.imgPlaceholder}><Spinner /></div>}
            <img
              src={featured ? (item.hdurl || item.url) : item.url}
              alt={item.title}
              className={`${styles.apodImage} ${imgLoaded ? styles.imgVisible : ''}`}
              onLoad={() => setImgLoaded(true)}
              loading="lazy"
            />
          </>
        ) : (
          <div className={styles.videoEmbed}>
            <iframe src={item.url} title={item.title} frameBorder="0" allowFullScreen className={styles.iframe} />
          </div>
        )}
        <div className={styles.mediaOverlay}>
          <Badge variant="electric" size="sm">{item.media_type === 'video' ? '▶ Video' : '📷 Image'}</Badge>
        </div>
      </div>

      <div className={styles.apodInfo}>
        <div className={styles.apodMeta}>
          <span className={styles.apodDate}>{new Date(item.date).toLocaleDateString('en-IE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          {item.copyright && <span className={styles.apodCopyright}>© {item.copyright.trim()}</span>}
        </div>
        <h2 className={`${styles.apodTitle} ${featured ? styles.apodTitleLarge : ''}`}>{item.title}</h2>
        {featured && <p className={styles.apodExplanation}>{item.explanation}</p>}
        {!featured && <p className={styles.apodExplanationShort}>{item.explanation?.slice(0, 120)}...</p>}
      </div>
    </article>
  );
}

export default function ApodPage() {
  const [today, setToday] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateInput, setDateInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchToday = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apodAPI.getToday();
      setToday(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGallery = async () => {
    setGalleryLoading(true);
    try {
      const data = await apodAPI.getRandom(8);
      setGallery(Array.isArray(data) ? data : [data]);
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
    fetchGallery();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateSearch = async (e) => {
    e.preventDefault();
    if (!dateInput) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apodAPI.getByDate(dateInput);
      setToday(data);
      setSelectedDate(dateInput);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetToToday = () => {
    setSelectedDate(null);
    setDateInput('');
    fetchToday();
  };

  const maxDate = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <SectionHeader title="Astronomy Picture of the Day" subtitle="NASA's daily window to the cosmos">
          <form className={styles.dateForm} onSubmit={handleDateSearch}>
            <Input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} max={maxDate} min="1995-06-16" className={styles.dateInput} />
            <Button type="submit" variant="secondary" size="sm" disabled={!dateInput}>Go</Button>
            {selectedDate && <Button variant="ghost" size="sm" onClick={resetToToday}>Today</Button>}
          </form>
        </SectionHeader>

        {loading ? (
          <div className={styles.loadingState}><Spinner size="lg" /></div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={resetToToday} />
        ) : (
          <ApodCard item={today} featured />
        )}

        <div className={styles.gallerySection}>
          <div className={styles.galleryHeader}>
            <h3 className={styles.galleryTitle}>Random Discoveries</h3>
            <Button variant="ghost" size="sm" onClick={fetchGallery} loading={galleryLoading}>Shuffle ↺</Button>
          </div>
          {galleryLoading ? (
            <div className={styles.galleryGrid}>
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.gallerySkeleton} />)}
            </div>
          ) : (
            <div className={styles.galleryGrid}>
              {gallery.map((item, i) => <ApodCard key={`${item.date}-${i}`} item={item} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}