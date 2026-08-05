import { useEffect, useRef, useState } from 'react';
import { getApplicationProgress } from '../lib/eligibility';
import { fmtCurrency, fmtDate, toPercent } from '../lib/formatters';

export function Card({ title, action, children }) {
  return (
    <section className="card section-card">
      {(title || action) && (
        <div className="section-head">
          <h3>{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, note }) {
  return (
    <article className="card stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function ScholarshipRow({ scholarship, onApply, compact = false }) {
  return (
    <article className={`mini-card ${compact ? 'compact' : ''}`}>
      <div className="card-head">
        <div>
          <h3>{scholarship.title}</h3>
          <p>{scholarship.category} · {fmtDate(scholarship.deadline)}</p>
        </div>
        <span className={`status-pill ${scholarship.fitScore >= 0 ? 'success' : 'warning'}`}>{scholarship.fitScore ?? 'Match'}</span>
      </div>
      <div className="meta-grid">
        <span><strong>QPI</strong> {scholarship.minimumQpi}+ </span>
        <span><strong>Income</strong> ≤ {fmtCurrency(scholarship.maximumIncome)}</span>
      </div>
      <p>{scholarship.coverage}</p>
      <button className="secondary-btn" type="button" onClick={() => onApply(scholarship)}>Track in dashboard</button>
    </article>
  );
}

export function NotificationItem({ entry, onMarkRead }) {
  return (
    <article
      className="mini-card notification-card"
      tabIndex="0"
      role="button"
      aria-label={`${entry.status === 'Unread' ? 'Mark as read: ' : ''}${entry.title}`}
      onClick={() => onMarkRead(entry.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onMarkRead(entry.id);
        }
      }}
    >
      <div className="card-head">
        <div>
          <h3>{entry.title}</h3>
          <p>{entry.channel} · {fmtDate(entry.createdAt)}</p>
        </div>
        <span className={`status-pill ${entry.status === 'Unread' ? 'warning' : 'success'}`}>{entry.status}</span>
      </div>
      <p>{entry.body}</p>
    </article>
  );
}

export function AnnouncementItem({ entry }) {
  return (
    <article className="mini-card">
      <div className="card-head">
        <div>
          <h3>{entry.title}</h3>
          <p>{entry.audience} · {fmtDate(entry.createdAt)}</p>
        </div>
        <span className="pill">Announcement</span>
      </div>
      <p>{entry.body}</p>
    </article>
  );
}

export function NotificationDropdown({ notifications, announcements, onMarkRead }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const unreadCount = notifications.filter((entry) => entry.status === 'Unread').length;

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className={`notification-trigger ${unreadCount ? 'has-unread' : ''}`}
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        title="View notifications and announcements"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-menu" role="dialog" aria-label="Notifications and announcements">
          <div className="notification-menu-header">
            <div>
              <strong>Notifications</strong>
              <span>{unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'You are all caught up'}</span>
            </div>
            <button type="button" className="notification-close" onClick={() => setIsOpen(false)} aria-label="Close notifications">×</button>
          </div>
          <div className="notification-menu-list">
            {notifications.slice(0, 5).map((entry) => (
              <NotificationItem key={entry.id} entry={entry} onMarkRead={onMarkRead} />
            ))}
            {announcements.slice(0, 3).map((entry) => (
              <AnnouncementItem key={entry.id} entry={entry} />
            ))}
            {!notifications.length && !announcements.length && (
              <EmptyState title="No updates yet" description="New deadline reminders and announcements will appear here." />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ApplicationProgressLabel({ status }) {
  return toPercent(getApplicationProgress(status));
}
