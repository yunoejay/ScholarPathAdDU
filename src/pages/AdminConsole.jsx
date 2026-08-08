import { applicationStatuses, verificationStatuses } from '../lib/constants';
import { AnnouncementItem, NotificationItem, StatCard } from '../components/pageParts';
import { Button, Card, EmptyState, FormField, Panel, StatusBadge } from '../components/ui';
import { fmtDate } from '../lib/formatters';

export default function AdminConsole({ applications, documents, announcements, notifications, onChangeApplication, onChangeDocument, onCreateAnnouncement, onMarkRead }) {
  const pendingDocuments = documents.filter((entry) => entry.verificationStatus === 'Pending');
  const reviewApplications = applications.filter((entry) => entry.status === 'Submitted' || entry.status === 'Under Review' || entry.status === 'For Verification');

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending applications" value={reviewApplications.length} note="Workflow queue for OSA" />
        <StatCard label="Documents for review" value={pendingDocuments.length} note="Blocking final application processing" />
        <StatCard label="Announcements" value={announcements.length} note="Broadcast queue and updates" />
        <StatCard label="Active notifications" value={notifications.length} note="Status mutations trigger alerts" />
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-app border bg-app-card p-5 shadow-app backdrop-blur md:flex-row">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-ateneo-bright">OSA console</span>
          <h3 className="mt-1">Review applications, verify documents, and publish announcements.</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Applications', 'Documents', 'Announcements', 'Notifications'].map((label) => <StatusBadge key={label}>{label}</StatusBadge>)}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card title="Application review queue">
          <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
            {reviewApplications.length ? reviewApplications.map((entry) => (
              <article key={entry.id} className="grid grid-rows-[auto_auto_1fr_auto] items-stretch gap-3 rounded-[18px] border border-app-border bg-app-surface p-4">
                <div className="flex min-w-0 items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3>{entry.scholarshipTitle}</h3>
                    <p>{entry.status} · Updated {fmtDate(entry.updatedAt)}</p>
                  </div>
                  <StatusBadge>Admin</StatusBadge>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {applicationStatuses.filter((status) => status !== entry.status).map((status) => (
                    <Button key={status} type="button" onClick={() => onChangeApplication(entry.id, status)}>{status}</Button>
                  ))}
                </div>
              </article>
            )) : <EmptyState title="No applications in review" description="Submitted applications will appear here for the OSA workflow." />}
          </div>
        </Card>

        <Card title="Document verification">
          <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
            {pendingDocuments.length ? pendingDocuments.map((doc) => (
              <article key={doc.id} className="grid grid-rows-[auto_auto_1fr_auto] items-stretch gap-3 rounded-[18px] border border-app-border bg-app-surface p-4">
                <div className="flex min-w-0 items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3>{doc.title}</h3>
                    <p>{doc.fileName} · {doc.documentType}</p>
                  </div>
                  <StatusBadge tone="warning">Pending</StatusBadge>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {verificationStatuses.map((status) => (
                    <Button key={status} type="button" onClick={() => onChangeDocument(doc.id, status)}>{status}</Button>
                  ))}
                </div>
              </article>
            )) : <EmptyState title="All documents are verified" description="Pending files will show up here when students upload support documents." />}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card title="Broadcast announcement">
          <form className="grid gap-4" onSubmit={onCreateAnnouncement}>
            <FormField label="Audience">
              <select name="announcementAudience">
                <option>Students</option>
                <option>OSA Admin</option>
                <option>Department Chairs</option>
                <option>All users</option>
              </select>
            </FormField>
            <FormField label="Title">
              <input name="announcementTitle" placeholder="Application window update" />
            </FormField>
            <FormField label="Body">
              <textarea name="announcementBody" rows="4" placeholder="Share scholarship deadlines, reviews, or office notices here." />
            </FormField>
            <Button variant="primary" type="submit">Publish announcement</Button>
          </form>
        </Card>

        <Card title="Recent announcements">
          <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
            {announcements.length ? announcements.map((entry) => (
              <AnnouncementItem key={entry.id} entry={entry} />
            )) : <EmptyState title="No announcements yet" description="Publish scholarship updates and office notices from this panel." />}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card title="Notification feed">
          <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
            {notifications.length ? notifications.slice(0, 3).map((entry) => (
              <NotificationItem key={entry.id} entry={entry} onMarkRead={onMarkRead} />
            )) : <EmptyState title="No notification activity" description="Status changes and deadline alerts will appear here." />}
          </div>
        </Card>

        <Card title="OSA workflow snapshot">
          <Panel className="grid grid-rows-[auto_auto_1fr_auto] items-stretch gap-3">
            <h3>Today’s queue</h3>
            <p className="text-sm text-app-muted">{reviewApplications.length} application(s) awaiting review · {pendingDocuments.length} document(s) pending verification</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-app-muted">
              <span><strong>Submitters</strong> Students</span>
              <span><strong>Audience</strong> Internal staff</span>
            </div>
          </Panel>
        </Card>
      </section>
    </div>
  );
}
