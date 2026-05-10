import { useState } from 'react';
import { Card, EmptyState } from '../components/pageParts';
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
    <div className="view-stack">
      <section className="split-grid">
        <Card title="Applications">
          <div className="list-stack">
            {applications.length ? applications.map((entry) => {
              const scholarship = scholarships.find((item) => item.id === entry.scholarshipId);
              return (
                <article key={entry.id} className="mini-card">
                  <div className="card-head">
                    <div>
                      <h3>{entry.scholarshipTitle}</h3>
                      <p>{scholarship?.category ?? 'Scholarship'}</p>
                    </div>
                    <span className={`status-pill ${entry.status === 'Approved' ? 'success' : entry.status === 'Rejected' ? 'danger' : 'info'}`}>{entry.status}</span>
                  </div>
                  <div className="meta-grid">
                    <span><strong>Submitted</strong> {entry.submittedAt ? fmtDate(entry.submittedAt) : 'Not yet'}</span>
                    <span><strong>Docs</strong> {entry.documentStatus}</span>
                    <span><strong>Progress</strong> {toPercent(getApplicationProgress(entry.status))}</span>
                  </div>
                  <p>{entry.notes}</p>
                  <div className="button-row">
                    <button className="secondary-btn" onClick={() => onSubmit(entry.id)}>Submit now</button>
                    <button className="export-btn" onClick={() => downloadApplicationPDF(entry)}>
                      <svg viewBox="0 0 24 24" className="export-icon" fill="none" stroke="currentColor">
                        <path d="M12 2v12M6 10l6 6 6-6M4 20h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Export PDF
                    </button>
                  </div>
                </article>
              );
            }) : <EmptyState title="No applications yet" description="Track a scholarship from the explorer to create your first application." />}
          </div>
        </Card>

        <Card title="Document Vault">
          <div className="vault-quota">
            <div className="quota-bar">
              <div className="quota-used" style={{ width: `${Math.min(100, (documents.length / 20) * 100)}%` }} />
            </div>
            <p className="quota-text">{documents.length} of 20 documents · {documents.filter((d) => d.verificationStatus === 'Verified').length} verified</p>
          </div>

          <form className="vault-form" onSubmit={handleUpload}>
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
            <button className="primary-btn full-width" type="submit">Upload once, reuse everywhere</button>
          </form>

          <div className="list-stack vault-list">
            {documents.length ? documents.map((doc) => (
              <article key={doc.id} className="mini-card doc-card">
                <div className="card-head">
                  <div>
                    <h3>{doc.title}</h3>
                    <p>{doc.fileName} · {doc.documentType}</p>
                  </div>
                  <span className={`status-pill ${doc.verificationStatus === 'Verified' ? 'success' : doc.verificationStatus === 'Rejected' ? 'danger' : 'warning'}`}>{doc.verificationStatus}</span>
                </div>
                <div className="meta-grid">
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
