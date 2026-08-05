import { useMemo, useState } from 'react';
import { Card, EmptyState } from '../components/pageParts';
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
  return <div className="view-stack">
    <div className="page-header"><div><span className="eyebrow">Reusable files</span><h1>Document Vault</h1><p>Upload, verify, and reuse scholarship documents in one workspace.</p></div><button className="secondary-btn" onClick={onOpenApplications}>View Applications</button></div>
    <section className="stats-grid application-stats">
      <article className="card stat-card"><span>Total documents</span><strong>{documents.length}</strong><p>of 20 available slots</p></article>
      <article className="card stat-card"><span>Verified</span><strong>{documents.filter((d) => d.verificationStatus === 'Verified').length}</strong><p>Ready to reuse</p></article>
      <article className="card stat-card"><span>Pending review</span><strong>{documents.filter((d) => d.verificationStatus === 'Pending').length}</strong><p>Awaiting OSA review</p></article>
      <article className="card stat-card"><span>Rejected</span><strong>{documents.filter((d) => d.verificationStatus === 'Rejected').length}</strong><p>Needs replacement</p></article>
    </section>
    <Card title="Upload a document"><form className="vault-form vault-upload-form" onSubmit={handleSubmit}><label><span>Document title</span><input name="documentTitle" required placeholder="BIR-stamped ITR" /></label><label><span>File</span><input name="documentFile" required type="file" accept=".pdf,.jpg,.jpeg,.png" /><small className="field-hint">PDF, JPG, or PNG · maximum 10 MB</small></label><SelectPicker label="Document type" value={type} onChange={setType} options={types.map((value) => ({ value, label: value }))} idPrefix="vault-document-type" /><input type="hidden" name="documentType" value={type} />{formError && <p className="form-error" role="alert">{formError}</p>}<button className="primary-btn" type="submit">Upload to vault</button></form></Card>
    <Card title="Your documents"><div className="page-filters"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents" aria-label="Search documents" /><select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter documents"><option value="all">All statuses</option><option>Verified</option><option>Pending</option><option>Rejected</option></select></div><div className="list-stack vault-list">{filtered.length ? filtered.map((doc) => <article key={doc.id} className="mini-card doc-card"><div className="card-head"><div><h3>{doc.title}</h3><p>{doc.fileName} · {doc.documentType}</p></div><span className={`status-pill ${doc.verificationStatus === 'Verified' ? 'success' : doc.verificationStatus === 'Rejected' ? 'danger' : 'warning'}`}>{doc.verificationStatus}</span></div><div className="meta-grid"><span><strong>Uploaded</strong> {fmtDate(doc.uploadedAt)}</span><span><strong>Used in</strong> {doc.sharedWith?.length || 0} applications</span></div><div className="button-row"><button className="secondary-btn" type="button" onClick={() => onDelete(doc.id)}>Delete</button></div></article>) : <EmptyState title={documents.length ? 'No matching documents' : 'Document vault is empty'} description={documents.length ? 'Try a different search or status filter.' : 'Upload transcripts, IDs, and income proofs once to reuse them.'} />}</div></Card>
  </div>;
}