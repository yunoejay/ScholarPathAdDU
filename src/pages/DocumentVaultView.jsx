import { useMemo, useState } from 'react';
import { Card, EmptyState } from '../components/pageParts';
import { StatusBadge } from '../components/ui';
import { SelectPicker } from './LoginScreen';
import { fmtDate } from '../lib/formatters';

export default function DocumentVaultView({ documents, onUpload, onDelete, onOpenApplications }) {
  const types = ['Income Proof', 'Transcript', 'Enrollment', 'Clearance', 'Supporting Document'];
  const [type, setType] = useState(types[0]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [formError, setFormError] = useState('');
  const filtered = useMemo(() => documents.filter((doc) => {
    const text = `${doc.title} ${doc.fileName} ${doc.documentType}`.toLowerCase();
    return (!query.trim() || text.includes(query.trim().toLowerCase())) && (status === 'all' || doc.verificationStatus === status);
  }), [documents, query, status]);
  const handleSubmit = (event) => {
    const file = event.currentTarget.documentFile.files[0];
    if (!event.currentTarget.documentTitle.value.trim() || !file) { event.preventDefault(); setFormError('Add a document title and choose a file.'); return; }
    if (file.size > 10 * 1024 * 1024) { event.preventDefault(); setFormError('Files must be 10 MB or smaller.'); return; }
    setFormError('');
    onUpload(event);
    setType(types[0]);
  };
  return <div className="grid gap-4">
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row"><div><span className="eyebrow">Reusable files</span><h1>Document Vault</h1><p>Upload, verify, and reuse scholarship documents in one workspace.</p></div><button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-app-border bg-app-surface px-4 py-2 text-sm font-semibold text-app-text transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60" onClick={onOpenApplications}>View Applications</button></div>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-app border bg-app-card p-5 shadow-app backdrop-blur"><span>Total documents</span><strong>{documents.length}</strong><p>of 20 available slots</p></article>
      <article className="rounded-app border bg-app-card p-5 shadow-app backdrop-blur"><span>Verified</span><strong>{documents.filter((d) => d.verificationStatus === 'Verified').length}</strong><p>Ready to reuse</p></article>
      <article className="rounded-app border bg-app-card p-5 shadow-app backdrop-blur"><span>Pending review</span><strong>{documents.filter((d) => d.verificationStatus === 'Pending').length}</strong><p>Awaiting OSA review</p></article>
      <article className="rounded-app border bg-app-card p-5 shadow-app backdrop-blur"><span>Rejected</span><strong>{documents.filter((d) => d.verificationStatus === 'Rejected').length}</strong><p>Needs replacement</p></article>
    </section>
    <Card title="Upload a document"><form className="grid gap-4" onSubmit={handleSubmit}><label><span>Document title</span><input name="documentTitle" required placeholder="BIR-stamped ITR" /></label><label><span>File</span><input name="documentFile" required type="file" accept=".pdf,.jpg,.jpeg,.png" /><small className="field-hint">PDF, JPG, or PNG · maximum 10 MB</small></label><SelectPicker label="Document type" value={type} onChange={setType} options={types.map((value) => ({ value, label: value }))} idPrefix="vault-document-type" /><input type="hidden" name="documentType" value={type} />{formError && <p className="form-error" role="alert">{formError}</p>}<button className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-br from-ateneo-strong via-ateneo to-ateneo-bright px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60" type="submit">Upload to vault</button></form></Card>
    <Card title="Your documents"><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents" aria-label="Search documents" /><select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter documents"><option value="all">All statuses</option><option>Verified</option><option>Pending</option><option>Rejected</option></select></div><div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">{filtered.length ? filtered.map((doc) => <article key={doc.id} className="grid grid-rows-[auto_auto_1fr_auto] items-stretch gap-3 rounded-[18px] border border-app-border bg-app-surface p-4"><div className="flex items-start justify-between gap-4"><div><h3>{doc.title}</h3><p>{doc.fileName} · {doc.documentType}</p></div><StatusBadge tone={doc.verificationStatus === 'Verified' ? 'success' : doc.verificationStatus === 'Rejected' ? 'danger' : 'warning'}>{doc.verificationStatus}</StatusBadge></div><div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-app-muted"><span><strong>Uploaded</strong> {fmtDate(doc.uploadedAt)}</span><span><strong>Used in</strong> {doc.sharedWith?.length || 0} applications</span></div><div className="flex flex-wrap items-center gap-3"><button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-app-border bg-app-surface px-4 py-2 text-sm font-semibold text-app-text transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={() => onDelete(doc.id)}>Delete</button></div></article>) : <EmptyState title={documents.length ? 'No matching documents' : 'Document vault is empty'} description={documents.length ? 'Try a different search or status filter.' : 'Upload transcripts, IDs, and income proofs once to reuse them.'} />}</div></Card>
  </div>;
}