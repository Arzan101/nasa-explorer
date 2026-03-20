import React, { useState, useEffect } from 'react';
import { marsAPI } from '../utils/api';
import { SectionHeader, Spinner, ErrorMessage, Button, Select, Badge, EmptyState } from '../components/UI';
import styles from './Mars.module.css';

const ROVERS = ['curiosity', 'perseverance', 'opportunity', 'spirit'];
const CAMERAS = {
  curiosity: ['fhaz', 'rhaz', 'mast', 'chemcam', 'mahli', 'mardi', 'navcam'],
  perseverance: ['navcam_left', 'navcam_right', 'front_hazcam_left_a', 'rear_hazcam_left', 'skycam', 'sherloc_watson'],
  opportunity: ['fhaz', 'rhaz', 'navcam', 'pancam'],
  spirit: ['fhaz', 'rhaz', 'navcam', 'pancam'],
};

const ROVER_COLORS = {
  curiosity: '#e74c3c',
  perseverance: '#f39c12',
  opportunity: '#3498db',
  spirit: '#9b59b6',
};

const DEFAULT_SOLS = { curiosity: 1000, perseverance: 100, opportunity: 100, spirit: 100 };

export default function MarsPage() {
  const [rover, setRover] = useState('curiosity');
  const [camera, setCamera] = useState('');
  const [sol, setSol] = useState(1000);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [manifests, setManifests] = useState([]);

  useEffect(() => {
    marsAPI.getRovers().then(setManifests).catch(() => {});
  }, []);

  useEffect(() => {
    setSol(DEFAULT_SOLS[rover] || 100);
    setCamera('');
  }, [rover]);

  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);
    setPhotos([]);
    try {
      const params = { rover, sol };
      if (camera) params.camera = camera;
      const data = await marsAPI.getPhotos(params);
      setPhotos(data.photos || []);
      if ((data.photos || []).length === 0) {
        setError('No photos found for this sol/camera combination. Try a different sol number or camera.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPhotos(); }, []);

  const roverManifest = manifests.find(m => m.name?.toLowerCase() === rover);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <SectionHeader title="Mars Rovers" subtitle="Photos beamed back from the Red Planet" />

        {/* Rover selector */}
        <div className={styles.roverTabs}>
          {ROVERS.map(r => (
            <button
              key={r}
              className={`${styles.roverTab} ${rover === r ? styles.roverTabActive : ''}`}
              style={{ '--rover-color': ROVER_COLORS[r] }}
              onClick={() => setRover(r)}
            >
              <span className={styles.roverDot} />
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Manifest card */}
        {roverManifest && (
          <div className={styles.manifestCard}>
            <div className={styles.manifestItem}>
              <span className={styles.manifestLabel}>Status</span>
              <Badge variant={roverManifest.status === 'active' ? 'success' : roverManifest.status === 'unknown' ? 'default' : 'warning'} size="sm">
                {roverManifest.status || '—'}
              </Badge>
            </div>
            <div className={styles.manifestItem}>
              <span className={styles.manifestLabel}>Landing Date</span>
              <span className={styles.manifestValue}>{roverManifest.landing_date || '—'}</span>
            </div>
            <div className={styles.manifestItem}>
              <span className={styles.manifestLabel}>Max Sol</span>
              <span className={styles.manifestValue}>{roverManifest.max_sol?.toLocaleString() || '—'}</span>
            </div>
            <div className={styles.manifestItem}>
              <span className={styles.manifestLabel}>Total Photos</span>
              <span className={styles.manifestValue}>{roverManifest.total_photos?.toLocaleString() || '—'}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label htmlFor="sol-input" className={styles.controlLabel}>Sol (Mars Day)</label>
            <input
              id="sol-input"
              type="number"
              value={sol}
              onChange={e => setSol(e.target.value)}
              min="0"
              max={roverManifest?.max_sol || 9999}
              className={styles.solInput}
            />
          </div>

          <Select
            label="Camera"
            id="camera-select"
            value={camera}
            onChange={e => setCamera(e.target.value)}
          >
            <option value="">All Cameras</option>
            {(CAMERAS[rover] || []).map(cam => (
              <option key={cam} value={cam}>{cam.toUpperCase()}</option>
            ))}
          </Select>

          <Button variant="primary" onClick={fetchPhotos} loading={loading} disabled={loading}>
            Fetch Photos
          </Button>
        </div>

        {/* Results */}
        {loading ? (
          <div className={styles.loadingGrid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={styles.photoSkeleton} />
            ))}
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : photos.length === 0 ? (
          <EmptyState icon="🤖" title="No photos found" message="Try adjusting the Sol number or changing the camera filter." />
        ) : (
          <div className={styles.photoGrid}>
            {photos.map(photo => (
              <button
                key={photo.id}
                className={styles.photoCard}
                onClick={() => setLightbox(photo)}
                aria-label={`View photo from ${photo.camera?.full_name}`}
              >
                <img
                  src={photo.img_src}
                  alt={`Mars - ${photo.camera?.name}`}
                  className={styles.photoImg}
                  loading="lazy"
                />
                <div className={styles.photoOverlay}>
                  <span className={styles.photoCam}>{photo.camera?.name}</span>
                  <span className={styles.photoDate}>{photo.earth_date}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <p className={styles.photoCount}>
          {!loading && photos.length > 0 && `Showing ${photos.length} photos`}
        </p>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)} aria-label="Close">✕</button>
          <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            <img src={lightbox.img_src} alt={lightbox.camera?.full_name} className={styles.lightboxImg} />
            <div className={styles.lightboxInfo}>
              <div className={styles.lightboxMeta}>
                <Badge variant="mars" size="sm">{lightbox.rover?.name}</Badge>
                <Badge variant="default" size="sm">{lightbox.camera?.name}</Badge>
              </div>
              <p className={styles.lightboxCamera}>{lightbox.camera?.full_name}</p>
              <p className={styles.lightboxDate}>Earth date: {lightbox.earth_date} · Sol {lightbox.sol}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}