import React from 'react';
import styles from './UI.module.css';

// Loading skeleton
export function Skeleton({ width, height, className = '' }) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

// Error message
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className={styles.errorBox} role="alert">
      <span className={styles.errorIcon}>⚠</span>
      <p className={styles.errorText}>{message || 'Something went wrong'}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

// Badge
export function Badge({ children, variant = 'default', size = 'md' }) {
  return (
    <span className={`${styles.badge} ${styles[`badge-${variant}`]} ${styles[`badge-${size}`]}`}>
      {children}
    </span>
  );
}

// Card
export function Card({ children, className = '', glow = false, onClick }) {
  return (
    <div
      className={`${styles.card} ${glow ? styles.cardGlow : ''} ${onClick ? styles.cardClickable : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
}

// Stat item
export function Stat({ label, value, unit, accent }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={`${styles.statValue} ${accent ? styles[`accent-${accent}`] : ''}`}>
        {value}
        {unit && <span className={styles.statUnit}>{unit}</span>}
      </span>
    </div>
  );
}

// Section header
export function SectionHeader({ title, subtitle, children }) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
      </div>
      {children && <div className={styles.sectionActions}>{children}</div>}
    </div>
  );
}

// Button
export function Button({ children, variant = 'primary', size = 'md', disabled, loading, onClick, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[`btn-${variant}`]} ${styles[`btn-${size}`]}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? <span className={styles.btnSpinner} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

// Input
export function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className={styles.inputWrapper}>
      {label && <label htmlFor={id} className={styles.inputLabel}>{label}</label>}
      <input id={id} className={`${styles.input} ${error ? styles.inputError : ''} ${className}`} {...props} />
      {error && <span className={styles.inputErrorMsg}>{error}</span>}
    </div>
  );
}

// Select
export function Select({ label, id, children, className = '', ...props }) {
  return (
    <div className={styles.inputWrapper}>
      {label && <label htmlFor={id} className={styles.inputLabel}>{label}</label>}
      <select id={id} className={`${styles.select} ${className}`} {...props}>
        {children}
      </select>
    </div>
  );
}

// Empty state
export function EmptyState({ icon = '🔭', title, message }) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon}>{icon}</span>
      <p className={styles.emptyTitle}>{title}</p>
      {message && <p className={styles.emptyMessage}>{message}</p>}
    </div>
  );
}

// Spinner
export function Spinner({ size = 'md', label = 'Loading...' }) {
  return (
    <div className={`${styles.spinnerWrap} ${styles[`spinner-${size}`]}`} role="status">
      <div className={styles.spinner} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
