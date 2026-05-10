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
      <button className="secondary-btn" onClick={() => onApply(scholarship)}>Track in dashboard</button>
    </article>
  );
}

export function NotificationItem({ entry, onMarkRead }) {
  return (
    <article className="mini-card notification-card" onClick={() => onMarkRead(entry.id)}>
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

export function ApplicationProgressLabel({ status }) {
  return toPercent(getApplicationProgress(status));
}
