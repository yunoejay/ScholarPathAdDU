import { useMemo, useState } from 'react';
import { Card, EmptyState } from '../components/pageParts';
import { getApplicationProgress } from '../lib/eligibility';
import { fmtDate, toPercent } from '../lib/formatters';

const statusTone = { Approved: 'success', Rejected: 'danger', Draft: 'neutral', Submitted: 'info', 'Under Review': 'info', 'For Verification': 'warning' };

export default function ApplicationsView({ applications, documents, scholarships, onSubmit, onOpenVault }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => applications.filter((entry) => {
    const matchesQuery = !query.trim() || entry.scholarshipTitle.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (status === 'all' || entry.status === status);
  }), [applications, query, status]);
  const selected = applications.find((entry) => entry.id === selectedId);
  const counts = { total: applications.length, active: applications.filter((a) => !['Approved', 'Rejected'].includes(a.status)).length, drafts: applications.filter((a) => a.status === 'Draft').length, completed: applications.filter((a) => ['Approved', 'Rejected'].includes(a.status)).length };

  const exportReport = (entry) => {
    const scholarship = scholarships.find((item) => item.id === entry.scholarshipId);
    const content = ['SCHOLARPATH ADDU — APPLICATION REPORT', '', `Application: ${entry.scholarshipTitle}`, `ID: ${entry.id}`, `Status: ${entry.status}`, `Progress: ${toPercent(getApplicationProgress(entry.status))}`, `Deadline: ${scholarship ? fmtDate(scholarship.deadline) : 'N/A'}`, `Documents: ${entry.attachedDocuments?.length || 0}`, `Submitted: ${entry.submittedAt ? fmtDate(entry.submittedAt) : 'Not yet'}`, '', entry.notes || ''].join('\n');
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
    link.download = `Application_${entry.scholarshipTitle.replace(/[^a-z0-9]+/gi, '_')}.txt`;
    link.click();
  };

  return <div className="view-stack">
    <div className="page-header">
      <div><span className="eyebrow">Student workspace</span><h1>Applications</h1><p>Track every scholarship application from draft to final decision.</p></div>
      <button className="secondary-btn" onClick={onOpenVault}>Open Document Vault</button>
    </div>
    <section className="stats-grid application-stats">
      <article className="card stat-card"><span>Total applications</span><strong>{counts.total}</strong><p>All tracked scholarships</p></article>
      <article className="card stat-card"><span>In progress</span><strong>{counts.active}</strong><p>Drafts and reviews</p></article>
      <article className="card stat-card"><span>Drafts</span><strong>{counts.drafts}</strong><p>Ready to complete</p></article>
      <article className="card stat-card"><span>Completed</span><strong>{counts.completed}</strong><p>Approved or rejected</p></article>
    </section>
    <Card title="Your applications">
      <div className="page-filters"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search applications" aria-label="Search applications" /><select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter applications by status"><option value="all">All statuses</option>{['Draft', 'Submitted', 'Under Review', 'For Verification', 'Approved', 'Rejected'].map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="list-stack">
        {filtered.length ? filtered.map((entry) => {
          const scholarship = scholarships.find((item) => item.id === entry.scholarshipId);
          const canSubmit = entry.status === 'Draft';
          return <article key={entry.id} className="mini-card application-card">
            <div className="card-head"><div><h3>{entry.scholarshipTitle}</h3><p>{scholarship?.category || 'Scholarship'} · Updated {fmtDate(entry.updatedAt)}</p></div><span className={`status-pill ${statusTone[entry.status] || 'info'}`}>{entry.status}</span></div>
            <div className="progress-track"><div style={{ width: `${getApplicationProgress(entry.status)}%` }} /></div>
            <div className="meta-grid"><span><strong>Progress</strong> {toPercent(getApplicationProgress(entry.status))}</span><span><strong>Documents</strong> {entry.documentStatus}</span><span><strong>Deadline</strong> {scholarship ? fmtDate(scholarship.deadline) : 'N/A'}</span></div>
            <p>{entry.notes}</p>
           <div className="button-row wrap"><button className="secondary-btn" type="button" onClick={() => setSelectedId(entry.id)}>View details</button>{canSubmit && <button className="primary-btn" type="button" onClick={() => { if (window.confirm('Submit this application for review? You can no longer edit this draft after submission.')) onSubmit(entry.id); }}>Submit application</button>}<button className="export-btn" type="button" onClick={() => exportReport(entry)}>Export report</button></div>
          </article>;
        }) : <EmptyState title={applications.length ? 'No matching applications' : 'No applications yet'} description={applications.length ? 'Try a different search or status filter.' : 'Track a scholarship from the explorer to create your first application.'} />}
      </div>
    </Card>
    {selected && <div className="modal-overlay" role="presentation" onClick={() => setSelectedId(null)}><div className="card application-detail-modal" role="dialog" aria-modal="true" aria-label="Application details" onClick={(e) => e.stopPropagation()}><div className="section-head"><h2>{selected.scholarshipTitle}</h2><button className="secondary-btn" onClick={() => setSelectedId(null)}>Close</button></div><p>{selected.notes}</p><div className="meta-grid"><span><strong>Status</strong> {selected.status}</span><span><strong>Attached documents</strong> {selected.attachedDocuments?.length || 0}</span><span><strong>Submitted</strong> {selected.submittedAt ? fmtDate(selected.submittedAt) : 'Not yet'}</span></div><h3>Linked vault files</h3>{selected.attachedDocuments?.length ? <ul className="detail-list">{selected.attachedDocuments.map((id) => <li key={id}>{documents.find((doc) => doc.id === id)?.title || 'Document unavailable'}</li>)}</ul> : <p className="muted-copy">No documents attached yet.</p>}</div></div>}
  </div>;
}