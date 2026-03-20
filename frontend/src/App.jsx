import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import { Spinner } from './components/UI';
import './styles/global.css';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ApodPage   = lazy(() => import('./pages/Apod'));
const MarsPage   = lazy(() => import('./pages/Mars'));
const NeoPage    = lazy(() => import('./pages/Neo'));
const EpicPage   = lazy(() => import('./pages/Epic'));
const SearchPage = lazy(() => import('./pages/Search'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Animated star-field background */}
      <div className="starfield" aria-hidden="true">
        <div className="starfield-large" />
      </div>

      <Nav />

      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"       element={<Dashboard />} />
            <Route path="/apod"   element={<ApodPage />} />
            <Route path="/mars"   element={<MarsPage />} />
            <Route path="/neo"    element={<NeoPage />} />
            <Route path="/epic"   element={<EpicPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*"       element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', textAlign: 'center', padding: '24px' }}>
      <span style={{ fontSize: '4rem' }}>🌌</span>
      <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>404 — Lost in Space</h1>
      <p style={{ color: 'var(--text-secondary)' }}>This page drifted into a black hole.</p>
      <a href="/" style={{ color: 'var(--ion)', textDecoration: 'underline' }}>Return to Mission Control</a>
    </div>
  );
}