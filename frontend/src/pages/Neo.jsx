import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, PointElement, LineElement, BubbleController
} from 'chart.js';
import { Bar, Bubble, Doughnut } from 'react-chartjs-2';
import { neoAPI } from '../utils/api';
import { SectionHeader, Spinner, ErrorMessage, Badge, Button, Stat } from '../components/UI';
import styles from './Neo.module.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, BubbleController);

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#9dceff', font: { family: 'Space Mono', size: 11 } } },
    tooltip: {
      backgroundColor: 'rgba(7,13,24,0.95)',
      borderColor: 'rgba(74,122,181,0.4)',
      borderWidth: 1,
      titleColor: '#e8f4ff',
      bodyColor: '#9dceff',
      padding: 12,
    },
  },
};

function formatDist(km) {
  if (km >= 1e6) return `${(km / 1e6).toFixed(2)}M km`;
  return `${Math.round(km).toLocaleString()} km`;
}

export default function NeoPage() {
  const [neos, setNeos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [tab, setTab] = useState('table');

  const fetchNeos = async () => {
    setLoading(true);
    setError(null);
    try {
      const end = new Date(startDate);
      end.setDate(end.getDate() + 6);
      const data = await neoAPI.getFeed(startDate, end.toISOString().split('T')[0]);
      setNeos(data.neos || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNeos(); }, [startDate]);

  // Stats
  const hazardous = neos.filter(n => n.is_potentially_hazardous);
  const avgMiss = neos.length
    ? neos.reduce((s, n) => s + (n.close_approach?.miss_distance_km || 0), 0) / neos.length
    : 0;
  const fastest = neos.reduce((max, n) =>
    (n.close_approach?.velocity_kph || 0) > (max?.close_approach?.velocity_kph || 0) ? n : max, null);
  const closest = neos[0]; // already sorted by closest

  // Bar chart: miss distances of top 15
  const barData = {
    labels: neos.slice(0, 15).map(n => n.name.replace(/[()]/g, '').trim().slice(0, 10)),
    datasets: [{
      label: 'Miss Distance (km)',
      data: neos.slice(0, 15).map(n => n.close_approach?.miss_distance_km || 0),
      backgroundColor: neos.slice(0, 15).map(n =>
        n.is_potentially_hazardous ? 'rgba(239,68,68,0.7)' : 'rgba(42,127,212,0.7)'
      ),
      borderColor: neos.slice(0, 15).map(n =>
        n.is_potentially_hazardous ? 'rgba(239,68,68,1)' : 'rgba(42,127,212,1)'
      ),
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  // Bubble: size vs speed vs miss distance
  const bubbleData = {
    datasets: [{
      label: 'Safe',
      data: neos.filter(n => !n.is_potentially_hazardous).slice(0, 30).map(n => ({
        x: n.close_approach?.miss_distance_lunar || 0,
        y: n.close_approach?.velocity_kph || 0,
        r: Math.max(3, Math.min(20, n.estimated_diameter_km.max * 20)),
      })),
      backgroundColor: 'rgba(42,127,212,0.5)',
      borderColor: 'rgba(79,163,247,0.8)',
    }, {
      label: 'Potentially Hazardous',
      data: hazardous.slice(0, 10).map(n => ({
        x: n.close_approach?.miss_distance_lunar || 0,
        y: n.close_approach?.velocity_kph || 0,
        r: Math.max(5, Math.min(20, n.estimated_diameter_km.max * 20)),
      })),
      backgroundColor: 'rgba(239,68,68,0.5)',
      borderColor: 'rgba(239,68,68,0.9)',
    }],
  };

  // Doughnut: hazard breakdown
  const doughnutData = {
    labels: ['Safe', 'Potentially Hazardous'],
    datasets: [{
      data: [neos.length - hazardous.length, hazardous.length],
      backgroundColor: ['rgba(42,127,212,0.7)', 'rgba(239,68,68,0.7)'],
      borderColor: ['rgba(42,127,212,1)', 'rgba(239,68,68,1)'],
      borderWidth: 2,
    }],
  };

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <SectionHeader title="Near-Earth Objects" subtitle="Asteroids approaching our planet">
          <div className={styles.dateControl}>
            <label className={styles.dateLabel} htmlFor="neo-date">Week starting</label>
            <input
              id="neo-date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              max={maxDate.toISOString().split('T')[0]}
              className={styles.dateInput}
            />
          </div>
        </SectionHeader>

        {loading ? (
          <div className={styles.center}><Spinner size="lg" /></div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchNeos} />
        ) : (
          <>
            {/* Stats row */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <Stat label="Total NEOs" value={neos.length} accent="electric" />
              </div>
              <div className={styles.statCard}>
                <Stat label="Potentially Hazardous" value={hazardous.length} accent="danger" />
              </div>
              <div className={styles.statCard}>
                <Stat label="Closest Approach" value={closest ? formatDist(closest.close_approach?.miss_distance_km) : '—'} accent="amber" />
              </div>
              <div className={styles.statCard}>
                <Stat
                  label="Fastest Object"
                  value={fastest ? `${Math.round(fastest.close_approach?.velocity_kph / 1000).toLocaleString()}k` : '—'}
                  unit="km/h"
                  accent="green"
                />
              </div>
            </div>

            {/* Tab switcher */}
            <div className={styles.tabs}>
              {['table', 'charts'].map(t => (
                <button
                  key={t}
                  className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t === 'table' ? '☰ Data Table' : '◫ Charts'}
                </button>
              ))}
            </div>

            {tab === 'charts' && (
              <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>Miss Distance – Closest 15 Objects</h3>
                  <div className={styles.chartWrap}>
                    <Bar
                      data={barData}
                      options={{
                        ...CHART_DEFAULTS,
                        scales: {
                          x: { ticks: { color: '#4a7ab5', font: { family: 'Space Mono', size: 9 } }, grid: { color: 'rgba(74,122,181,0.1)' } },
                          y: { ticks: { color: '#4a7ab5', font: { family: 'Space Mono', size: 10 } }, grid: { color: 'rgba(74,122,181,0.1)' } },
                        },
                        plugins: {
                          ...CHART_DEFAULTS.plugins,
                          tooltip: {
                            ...CHART_DEFAULTS.plugins.tooltip,
                            callbacks: { label: ctx => `  ${formatDist(ctx.raw)}` },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>Hazard Classification</h3>
                  <div className={styles.chartWrapSm}>
                    <Doughnut data={doughnutData} options={{ ...CHART_DEFAULTS, cutout: '65%' }} />
                  </div>
                </div>

                <div className={`${styles.chartCard} ${styles.chartCardWide}`}>
                  <h3 className={styles.chartTitle}>Miss Distance (lunar) vs Velocity – bubble size = estimated diameter</h3>
                  <div className={styles.chartWrap}>
                    <Bubble
                      data={bubbleData}
                      options={{
                        ...CHART_DEFAULTS,
                        scales: {
                          x: {
                            title: { display: true, text: 'Lunar Distances', color: '#4a7ab5' },
                            ticks: { color: '#4a7ab5', font: { family: 'Space Mono', size: 10 } },
                            grid: { color: 'rgba(74,122,181,0.1)' },
                          },
                          y: {
                            title: { display: true, text: 'Velocity (km/h)', color: '#4a7ab5' },
                            ticks: { color: '#4a7ab5', font: { family: 'Space Mono', size: 10 } },
                            grid: { color: 'rgba(74,122,181,0.1)' },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {tab === 'table' && (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Miss Distance</th>
                      <th>Lunar Distance</th>
                      <th>Velocity</th>
                      <th>Est. Diameter</th>
                      <th>Hazard</th>
                    </tr>
                  </thead>
                  <tbody>
                    {neos.map(neo => (
                      <tr key={neo.id} className={neo.is_potentially_hazardous ? styles.rowHazard : ''}>
                        <td className={styles.neoName}>
                          <a href={neo.nasa_url} target="_blank" rel="noopener noreferrer" className={styles.neoLink}>
                            {neo.name.replace(/[()]/g, '').trim()}
                          </a>
                        </td>
                        <td className={styles.mono}>{neo.close_approach?.date}</td>
                        <td className={styles.mono}>{neo.close_approach ? formatDist(neo.close_approach.miss_distance_km) : '—'}</td>
                        <td className={styles.mono}>{neo.close_approach?.miss_distance_lunar?.toFixed(2)} LD</td>
                        <td className={styles.mono}>{neo.close_approach ? `${Math.round(neo.close_approach.velocity_kph).toLocaleString()} km/h` : '—'}</td>
                        <td className={styles.mono}>{neo.estimated_diameter_km.min.toFixed(3)}–{neo.estimated_diameter_km.max.toFixed(3)} km</td>
                        <td>
                          <Badge variant={neo.is_potentially_hazardous ? 'danger' : 'success'} size="sm">
                            {neo.is_potentially_hazardous ? 'YES' : 'NO'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
