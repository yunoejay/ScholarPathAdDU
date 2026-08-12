import { Button, Card, EmptyState, Panel, StatusBadge } from '../components/ui';
import { StatCard } from '../components/pageParts';
import { fmtCurrency } from '../lib/formatters';

export default function DepartmentReviewView({ profile, queue, onChangeApplication }) {
  const pendingCount = queue.filter((entry) => entry.status !== 'Endorsed').length;
  const endorsedCount = queue.filter((entry) => entry.status === 'Endorsed').length;
  const linkedCount = queue.filter((entry) => entry.applicationId).length;

  return (
    <div className="grid gap-5">
      <section className="page-title-bar flex flex-col items-start justify-between gap-4 rounded-app border bg-app-card p-5 shadow-app backdrop-blur md:flex-row md:items-center">
        <div className="page-title-copy">
          <span className="page-section-label">Department Chair workspace</span>
          <h2>{profile.department || 'Department'} applicant screening</h2>
          <p className="mt-2 max-w-2xl text-sm text-app-muted">Review submitted GIA applicants, record your endorsement, and route decisions to OSA.</p>
        </div>
        <StatusBadge tone="info">{queue.length} queued</StatusBadge>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Awaiting decision" value={pendingCount} note="Applicants requiring review" />
        <StatCard label="Endorsed" value={endorsedCount} note="Already routed to OSA" />
        <StatCard label="Linked applications" value={linkedCount} note="Ready for status updates" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <Card title="Endorsement queue" action={<StatusBadge tone={pendingCount ? 'warning' : 'success'}>{pendingCount} awaiting decision</StatusBadge>} className="min-w-0">
          <div className="grid max-h-[620px] gap-3 overflow-y-auto pr-1">
            {queue.length ? queue.map((entry) => (
              <article key={entry.id} className="grid gap-3 rounded-[18px] border border-app-border bg-app-surface p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate">{entry.studentName}</h3>
                    <p className="mt-1">QPI {entry.qpi} · {fmtCurrency(entry.householdIncome)}</p>
                  </div>
                  <StatusBadge tone="info">{entry.status}</StatusBadge>
                </div>
                <div className="rounded-xl bg-app-card/60 p-3 text-sm text-app-muted">{entry.recommendation || 'No recommendation has been recorded.'}</div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-app-border pt-3">
                  <span className="text-xs text-app-muted">{entry.applicationId ? 'Application linked' : 'No application linked'}</span>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" disabled={!entry.applicationId || entry.status === 'Endorsed'} onClick={() => onChangeApplication(entry.applicationId, 'For Verification')}>Endorse</Button>
                    <Button type="button" disabled={!entry.applicationId} onClick={() => onChangeApplication(entry.applicationId, 'Rejected')}>Flag for OSA</Button>
                  </div>
                </div>
              </article>
            )) : <EmptyState title="No applicants in queue" description="Department endorsements will appear here once student applications are routed for review." />}
          </div>
        </Card>

        <Card title="Review guidance" action={<StatusBadge tone="info">GIA workflow</StatusBadge>} className="min-w-0">
          <div className="grid gap-3">
            <Panel className="grid gap-3">
              <h3>Economic screening focus</h3>
              <p className="text-sm text-app-muted">Prioritize GIA candidates with verified income documents and active enrollment status.</p>
            </Panel>
            <Panel className="grid gap-3">
              <h3>Recommended workflow</h3>
              <p className="text-sm text-app-muted">Review submitted profiles, endorse qualified applicants, and leave document validation to the OSA queue.</p>
            </Panel>
          </div>
        </Card>
      </section>
    </div>
  );
}
