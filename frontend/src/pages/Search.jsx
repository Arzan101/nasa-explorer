import React, { useState } from 'react';
import { searchAPI } from '../utils/api';
import { SectionHeader, Spinner, ErrorMessage, Button, Badge, Input, Select, EmptyState } from '../components/UI';
import styles from './Search.module.css';

const SUGGESTED = ['nebula', 'black hole', 'Apollo 11', 'Mars surface', 'Hubble', 'ISS', 'galaxy', 'solar flare'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [yearStart, setYearStart] = useState('');
  const [yearEnd, setYearEnd] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [lightbox, setLightbox] = useState(null);

  const doSearch = async (overrides = {}) => {
    const q = overrides.query ?? query;
    const pg = overrides.page ?? 1;
    if (!q || q.trim().length < 2) return;

    setLoading(true);
    setError(null);
    try {
      const params = { q, media_type: mediaType, page: pg };
      if (yearStart) params.year_start = yearStart;
      if (yearEnd) params.year_end = yearEnd;
      const data = await searchAPI.search(params);
      setResults(data);
      setPage(pg);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch();
  };

  const handleSuggestion = (s) => {
    setQuery(s);
    doSearch({ query: s });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <SectionHeader
          title="NASA Image & Video Library"
          subtitle="Search decades of space exploration media"
        />

        {/* Search form */}
        <form className={styles.searchForm} onSubmit={handleSubmit}>
          <div className={styles.searchInputRow}>
            <div className={styles.searchInputWrap}>
              <span className={styles.searchIcon}>◇</span>
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search NASA's entire media archive..."
                className={styles.searchInput}
                autoFocus
              />
            </div>
            <Button type="submit" variant="primary" loading={loading} disabled={!query || loading}>
              Search
            </Button>
          </div>

          <div className={styles.filters}>
            <Select id="media-type" value={mediaType} onChange={e => setMediaType(e.target.value)}>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </Select>
            <Input
              type="number"
              placeholder="Year from"
              value={yearStart}
              onChange={e => setYearStart(e.target.value)}
              min="1958"
              max={new Date().getFullYear()}
              className={styles.yearInput}
            />
            <Input
              type="number"
              placeholder="Year to"
              value={yearEnd}
              onChange={e => setYearEnd(e.target.value)}
              min="1958"
              max={new Date().getFullYear()}
              className={styles.yearInput}
            />
          </div>
        </form>

        {/* Suggestions */}
        {!results && !loading && (
          <div className={styles.suggestions}>
            <p className={styles.suggestLabel}>Try searching for</p>
            <div className={styles.suggestChips}>
              {SUGGESTED.map(s => (
                <button key={s} className={styles.chip} onClick={() => handleSuggestion(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && <div className={styles.center}><Spinner size="lg" /></div>}

        {/* Error */}
        {error && <ErrorMessage message={error} onRetry={() => doSearch()} />}

        {/* Results */}
        {results && !loading && (
          <>
            <div className={styles.resultsHeader}>
              <span className={styles.resultCount}>
                {results.total_hits?.toLocaleString()} results for "<span className={styles.queryHighlight}>{query}</span>"
              </span>
            </div>

            {results.items?.length === 0 ? (
              <EmptyState icon="🔭" title="No results found" message="Try different keywords or adjust the filters." />
            ) : (
              <div className={styles.grid}>
                {results.items.map((item, i) => (
                  <article
                    key={`${item.nasa_id}-${i}`}
                    className={styles.resultCard}
                    onClick={() => item.media_type === 'image' && setLightbox(item)}
                  >
                    {item.preview_url && item.media_type === 'image' ? (
                      <div className={styles.cardImage}>
                        <img
                          src={item.preview_url}
                          alt={item.title}
                          loading="lazy"
                          onError={e => { e.target.parentElement.style.display = 'none'; }}
                        />
                        <div className={styles.cardOverlay}>
                          <span className={styles.cardZoom}>🔍</span>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.cardNoImage}>
                        {item.media_type === 'video' ? '🎬' : '🎵'}
                      </div>
                    )}
                    <div className={styles.cardInfo}>
                      <div className={styles.cardMeta}>
                        <Badge variant="default" size="sm">{item.media_type || 'image'}</Badge>
                        {item.center && <span className={styles.center_badge}>{item.center}</span>}
                      </div>
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                      {item.description && <p className={styles.cardDesc}>{item.description}</p>}
                      {item.date_created && (
                        <span className={styles.cardDate}>
                          {new Date(item.date_created).getFullYear()}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {results.total_hits > 20 && (
              <div className={styles.pagination}>
                <Button
                  variant="ghost"
                  onClick={() => doSearch({ page: page - 1 })}
                  disabled={page === 1 || loading}
                >
                  ← Previous
                </Button>
                <span className={styles.pageInfo}>Page {page}</span>
                <Button
                  variant="ghost"
                  onClick={() => doSearch({ page: page + 1 })}
                  disabled={results.items?.length < 20 || loading}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>✕</button>
          <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            <img src={lightbox.preview_url} alt={lightbox.title} className={styles.lightboxImg} />
            <div className={styles.lightboxInfo}>
              <h3 className={styles.lightboxTitle}>{lightbox.title}</h3>
              <p className={styles.lightboxDesc}>{lightbox.description}</p>
              <div className={styles.lightboxMeta}>
                {lightbox.nasa_id && <Badge variant="electric" size="sm">ID: {lightbox.nasa_id}</Badge>}
                {lightbox.center && <Badge variant="default" size="sm">{lightbox.center}</Badge>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
