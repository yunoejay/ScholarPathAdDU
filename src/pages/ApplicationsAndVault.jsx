import { useState } from 'react';
import { Download } from 'lucide-react';
import { Card, EmptyState } from '../components/pageParts';
import { StatusBadge } from '../components/ui';
import { getApplicationProgress } from '../lib/eligibility';
import { fmtDate, toPercent } from '../lib/formatters';
import { SelectPicker } from './LoginScreen';

export default function ApplicationsAndVault({ applications, documents, scholarships, onUpload, onSubmit }) {
  const documentTypeOptions = [
    { value: 'Income Proof', label: 'Income Proof' },
    { value: 'Transcript', label: 'Transcript' },
    { value: 'Enrollment', label: 'Enrollment' },
    { value: 'Clearance', label: 'Clearance' },
    { value: 'Supporting Document', label: 'Supporting Document' },
  ];
  const [documentType, setDocumentType] = useState('Income Proof');

  const handleUpload = (event) => {
    onUpload(event);
    setDocumentType('Income Proof');
  };

  const downloadApplicationPDF = (application) => {
    const scholarship = scholarships.find((item) => item.id === application.scholarshipId);
    const content = `
SCHOLARSHIP APPLICATION - EXPORT
==================================
Application ID: ${application.id}
Scholarship: ${application.scholarshipTitle}
Category: ${scholarship?.category || 'N/A'}
Coverage: ${scholarship?.coverage || 'N/A'}

Status: ${application.status}
Document Status: ${application.documentStatus}
Progress: ${getApplicationProgress(application.status) * 100}%
Submitted: ${application.submittedAt ? fmtDate(application.submittedAt) : 'Not yet'}

Notes: ${application.notes}

Attached Documents: ${application.attachedDocuments.length}

Generated: ${new Date().toLocaleString()}
Exported from ScholarPath AdDU
    `.trim();

    const element = document.createElement('a');
    element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    element.download = `Application_${application.scholarshipTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 xl:grid-cols-2">
        <Card title="Applications">
          <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
            {applications.length ? applications.map((entry) => {
              const scholarship = scholarships.find((item) => item.id === entry.scholarshipId);
              return (
                <article key={entry.id} className="grid grid-rows-[auto_auto_1fr_auto] items-stretch gap-3 rounded-[18px] border border-app-border bg-app-surface p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3>{entry.scholarshipTitle}</h3>
                      <p>{scholarship?.category ?? 'Scholarship'}</p>
                    </div>
                    <StatusBadge tone={entry.status === 'Approved' ? 'success' : entry.status === 'Rejected' ? 'danger' : 'info'}>{entry.status}</StatusBadge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-app-muted">
                    <span><strong>Submitted</strong> {entry.submittedAt ? fmtDate(entry.submittedAt) : 'Not yet'}</span>
                    <span><strong>Docs</strong> {entry.documentStatus}</span>
                    <span><strong>Progress</strong> {toPercent(getApplicationProgress(entry.status))}</span>
                  </div>
                  <p>{entry.notes}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-app-border bg-app-surface px-4 py-2 text-sm font-semibold text-app-text transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => onSubmit(entry.id)}>Submit now</button>
                    <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-app-border bg-app-surface px-4 py-2 text-sm font-semibold text-app-text transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20" onClick={() => downloadApplicationPDF(entry)}>
                      <Download size={16} aria-hidden="true" />
                      Export PDF
                    </button>
                  </div>
                </article>
              );
            }) : <EmptyState title="No applications yet" description="Track a scholarship from the explorer to create your first application." />}
          </div>
        </Card>

        <Card title="Document Vault">
          <div className="mb-6">
            <div className="h-2 w-full overflow-hidden rounded-full bg-app-muted-surface">
              <div className="h-full rounded-full bg-ateneo transition-all" style={{ width: `${Math.min(100, (documents.length / 20) * 100)}%` }} />
            </div>
            <p className="mt-2 text-sm text-app-muted">{documents.length} of 20 documents · {documents.filter((d) => d.verificationStatus === 'Verified').length} verified</p>
          </div>

          <form className="grid gap-4" onSubmit={handleUpload}>
            <label>
              <span>Document title</span>
              <input name="documentTitle" placeholder="BIR-stamped ITR" />
            </label>
            <label>
              <span>Upload file</span>
              <input name="documentFile" type="file" />
            </label>
            <SelectPicker
              label="Type"
              value={documentType}
              onChange={setDocumentType}
              options={documentTypeOptions}
              idPrefix="vault-document-type"
            />
            <input type="hidden" name="documentType" value={documentType} />
            <button className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-br from-ateneo-strong via-ateneo to-ateneo-bright px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 w-full" type="submit">Upload once, reuse everywhere</button>
          </form>

          <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
            {documents.length ? documents.map((doc) => (
              <article key={doc.id} className="grid grid-rows-[auto_auto_1fr_auto] items-stretch gap-3 rounded-[18px] border border-app-border bg-app-surface p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3>{doc.title}</h3>
                    <p>{doc.fileName} · {doc.documentType}</p>
                  </div>
                  <StatusBadge tone={doc.verificationStatus === 'Verified' ? 'success' : doc.verificationStatus === 'Rejected' ? 'danger' : 'warning'}>{doc.verificationStatus}</StatusBadge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-app-muted">
                  <span><strong>Uploaded</strong> {fmtDate(doc.uploadedAt)}</span>
                  <span><strong>Shared with</strong> {doc.sharedWith.length} scholarships</span>
                </div>
              </article>
            )) : <EmptyState title="Document vault is empty" description="Upload once to reuse transcripts, IDs, and income proofs across multiple applications." />}
          </div>
        </Card>
      </section>
    </div>
  );
}
