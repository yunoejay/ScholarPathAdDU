import { useMemo, useState } from 'react';
import { Card, EmptyState } from '../components/pageParts';
import { Button, ModalShell, StatusBadge } from '../components/ui';
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

  return <div className="grid gap-4">
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
      <div><span className="eyebrow">Student workspace</span><h1>Applications</h1><p>Track every scholarship application from draft to final decision.</p></div>
      <Button onClick={onOpenVault}>Open Document Vault</Button>
    </div>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-app border bg-app-card p-5 shadow-app backdrop-blur"><span>Total applications</span><strong>{counts.total}</strong><p>All tracked scholarships</p></article>
      <article className="rounded-app border bg-app-card p-5 shadow-app backdrop-blur"><span>In progress</span><strong>{counts.active}</strong><p>Drafts and reviews</p></article>
      <article className="rounded-app border bg-app-card p-5 shadow-app backdrop-blur"><span>Drafts</span><strong>{counts.drafts}</strong><p>Ready to complete</p></article>
      <article className="rounded-app border bg-app-card p-5 shadow-app backdrop-blur"><span>Completed</span><strong>{counts.completed}</strong><p>Approved or rejected</p></article>
    </section>
    <Card title="Your applications">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search applications" aria-label="Search applications" /><select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter applications by status"><option value="all">All statuses</option>{['Draft', 'Submitted', 'Under Review', 'For Verification', 'Approved', 'Rejected'].map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
        {filtered.length ? filtered.map((entry) => {
          const scholarship = scholarships.find((item) => item.id === entry.scholarshipId);
          const canSubmit = entry.status === 'Draft';
          return <article key={entry.id} className="grid grid-rows-[auto_auto_1fr_auto] items-stretch gap-3 rounded-[18px] border border-app-border bg-app-surface p-4">
            <div className="flex items-start justify-between gap-4"><div><h3>{entry.scholarshipTitle}</h3><p>{scholarship?.category || 'Scholarship'} · Updated {fmtDate(entry.updatedAt)}</p></div><StatusBadge tone={statusTone[entry.status] || 'info'}>{entry.status}</StatusBadge></div>
            <div className="h-2 overflow-hidden rounded-full bg-app-muted-surface"><div style={{ width: `${getApplicationProgress(entry.status)}%` }} /></div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-app-muted"><span><strong>Progress</strong> {toPercent(getApplicationProgress(entry.status))}</span><span><strong>Documents</strong> {entry.documentStatus}</span><span><strong>Deadline</strong> {scholarship ? fmtDate(scholarship.deadline) : 'N/A'}</span></div>
            <p>{entry.notes}</p>
           <div className="flex flex-wrap items-center gap-3 wrap"><Button type="button" onClick={() => setSelectedId(entry.id)}>View details</Button>{canSubmit && <Button variant="primary" type="button" onClick={() => { if (window.confirm('Submit this application for review? You can no longer edit this draft after submission.')) onSubmit(entry.id); }}>Submit application</Button>}<button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-app-border bg-app-surface px-4 py-2 text-sm font-semibold text-app-text transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20" type="button" onClick={() => exportReport(entry)}>Export report</button></div>
          </article>;
        }) : <EmptyState title={applications.length ? 'No matching applications' : 'No applications yet'} description={applications.length ? 'Try a different search or status filter.' : 'Track a scholarship from the explorer to create your first application.'} />}
      </div>
    </Card>
    {selected && <ModalShell title={selected.scholarshipTitle} onClose={() => setSelectedId(null)} className="application-detail-modal"><p>{selected.notes}</p><div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-app-muted"><span><strong>Status</strong> {selected.status}</span><span><strong>Attached documents</strong> {selected.attachedDocuments?.length || 0}</span><span><strong>Submitted</strong> {selected.submittedAt ? fmtDate(selected.submittedAt) : 'Not yet'}</span></div><h3>Linked vault files</h3>{selected.attachedDocuments?.length ? <ul className="grid gap-2 pl-5 text-app-muted">{selected.attachedDocuments.map((id) => <li key={id}>{documents.find((doc) => doc.id === id)?.title || 'Document unavailable'}</li>)}</ul> : <p className="text-app-muted">No documents attached yet.</p>}</ModalShell>}
  </div>;
}