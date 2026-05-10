import { applicationStatuses, verificationStatuses } from '../lib/constants';
import { Card, EmptyState, AnnouncementItem, NotificationItem, StatCard } from '../components/pageParts';
import { fmtDate } from '../lib/formatters';

export default function AdminConsole({ applications, documents, announcements, notifications, onChangeApplication, onChangeDocument, onCreateAnnouncement, onMarkRead }) {
  const pendingDocuments = documents.filter((entry) => entry.verificationStatus === 'Pending');
  const reviewApplications = applications.filter((entry) => entry.status === 'Submitted' || entry.status === 'Under Review' || entry.status === 'For Verification');

  return (
    <div className="view-stack">
      <section className="stats-grid">
        <StatCard label="Pending applications" value={reviewApplications.length} note="Workflow queue for OSA" />
        <StatCard label="Documents for review" value={pendingDocuments.length} note="Blocking final application processing" />
        <StatCard label="Announcements" value={announcements.length} note="Broadcast queue and updates" />
        <StatCard label="Active notifications" value={notifications.length} note="Status mutations trigger alerts" />
      </section>

      <section className="card role-intro admin-intro">
        <div>
          <span className="eyebrow">OSA console</span>
          <h3>Review applications, verify documents, and publish announcements.</h3>
          <p>This view is preloaded with queue items so it stays visible even before backend integration.</p>
        </div>
        <div className="role-badges">
          <span className="pill">Applications</span>
          <span className="pill">Documents</span>
          <span className="pill">Announcements</span>
          <span className="pill">Notifications</span>
        </div>
      </section>

      <section className="split-grid">
        <Card title="Application review queue">
          <div className="list-stack">
            {reviewApplications.length ? reviewApplications.map((entry) => (
              <article key={entry.id} className="mini-card">
                <div className="card-head">
                  <div>
                    <h3>{entry.scholarshipTitle}</h3>
                    <p>{entry.status} · Updated {fmtDate(entry.updatedAt)}</p>
                  </div>
                  <span className="pill">Admin</span>
                </div>
                <div className="button-row wrap">
                  {applicationStatuses.filter((status) => status !== entry.status).map((status) => (
                    <button key={status} className="secondary-btn" onClick={() => onChangeApplication(entry.id, status)}>{status}</button>
                  ))}
                </div>
              </article>
            )) : <EmptyState title="No applications in review" description="Submitted applications will appear here for the OSA workflow." />}
          </div>
        </Card>

        <Card title="Document verification">
          <div className="list-stack">
            {pendingDocuments.length ? pendingDocuments.map((doc) => (
              <article key={doc.id} className="mini-card">
                <div className="card-head">
                  <div>
                    <h3>{doc.title}</h3>
                    <p>{doc.fileName} · {doc.documentType}</p>
                  </div>
                  <span className="status-pill warning">Pending</span>
                </div>
                <div className="button-row wrap">
                  {verificationStatuses.map((status) => (
                    <button key={status} className="secondary-btn" onClick={() => onChangeDocument(doc.id, status)}>{status}</button>
                  ))}
                </div>
              </article>
            )) : <EmptyState title="All documents are verified" description="Pending files will show up here when students upload support documents." />}
          </div>
        </Card>
      </section>

      <section className="split-grid">
        <Card title="Broadcast announcement">
          <form className="form-grid stacked" onSubmit={onCreateAnnouncement}>
            <label>
              <span>Audience</span>
              <select name="announcementAudience">
                <option>Students</option>
                <option>OSA Admin</option>
                <option>Department Chairs</option>
                <option>All users</option>
              </select>
            </label>
            <label>
              <span>Title</span>
              <input name="announcementTitle" placeholder="Application window update" />
            </label>
            <label>
              <span>Body</span>
              <textarea name="announcementBody" rows="4" placeholder="Share scholarship deadlines, reviews, or office notices here." />
            </label>
            <button className="primary-btn" type="submit">Publish announcement</button>
          </form>
        </Card>

        <Card title="Recent announcements">
          <div className="list-stack">
            {announcements.length ? announcements.map((entry) => (
              <AnnouncementItem key={entry.id} entry={entry} />
            )) : <EmptyState title="No announcements yet" description="Publish scholarship updates and office notices from this panel." />}
          </div>
        </Card>
      </section>

      <section className="split-grid">
        <Card title="Notification feed">
          <div className="list-stack">
            {notifications.length ? notifications.slice(0, 3).map((entry) => (
              <NotificationItem key={entry.id} entry={entry} onMarkRead={onMarkRead} />
            )) : <EmptyState title="No notification activity" description="Status changes and deadline alerts will appear here." />}
          </div>
        </Card>

        <Card title="OSA workflow snapshot">
          <div className="mini-card workflow-snapshot">
            <h3>Today’s queue</h3>
            <p>{reviewApplications.length} application(s) awaiting review · {pendingDocuments.length} document(s) pending verification</p>
            <div className="meta-grid">
              <span><strong>Submitters</strong> Students</span>
              <span><strong>Audience</strong> Internal staff</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
