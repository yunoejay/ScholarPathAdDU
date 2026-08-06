import { Button, Card, EmptyState, Panel, StatusBadge } from '../components/ui';
import { fmtCurrency } from '../lib/formatters';

export default function DepartmentReviewView({ profile, queue, onChangeApplication }) {
  return (
    <div className="grid gap-4">
      <section className="flex flex-col items-start justify-between gap-4 md:flex-row rounded-app border bg-app-card p-5 shadow-app backdrop-blur">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-ateneo-bright">Department review</span>
          <h2>{profile.department} applicant screening</h2>
          <p>Department chairs can assess economic status and endorse Grant-in-Aid candidates.</p>
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-app border bg-app-card p-5 shadow-app backdrop-blur md:flex-row">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-ateneo-bright">Department chair view</span>
          <h3 className="mt-1">Focused on economic screening and endorsement decisions.</h3>
          <p className="mt-1 text-sm text-app-muted">This dashboard surfaces GIA applicants for review, even before the backend is connected.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Endorsements', 'GIA', 'Economic status'].map((label) => <StatusBadge key={label}>{label}</StatusBadge>)}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card title="Endorsement queue">
          <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
            {queue.length ? queue.map((entry) => (
              <article key={entry.id} className="grid grid-rows-[auto_auto_1fr_auto] items-stretch gap-3 rounded-[18px] border border-app-border bg-app-surface p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3>{entry.studentName}</h3>
                    <p>QPI {entry.qpi} · {fmtCurrency(entry.householdIncome)}</p>
                  </div>
                  <StatusBadge tone="info">{entry.status}</StatusBadge>
                </div>
                <p>{entry.recommendation}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" disabled={!entry.applicationId} onClick={() => onChangeApplication(entry.applicationId, 'For Verification')}>Mark as endorsed</Button>
                  <Button type="button" disabled={!entry.applicationId} onClick={() => onChangeApplication(entry.applicationId, 'Rejected')}>Flag for OSA review</Button>
                </div>
              </article>
            )) : <EmptyState title="No applicants in queue" description="Department endorsements will appear here once student applications are routed for review." />}
          </div>
        </Card>

        <Card title="Department insights">
          <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
            <Panel className="grid grid-rows-[auto_auto_1fr_auto] items-stretch gap-3">
              <h3>Economic screening focus</h3>
              <p>Prioritize GIA candidates with verified income documents and active enrollment status.</p>
            </Panel>
            <Panel className="grid grid-rows-[auto_auto_1fr_auto] items-stretch gap-3">
              <h3>Recommended workflow</h3>
              <p>Review submitted profiles, submit endorsements to OSA, and leave document validation to the admin queue.</p>
            </Panel>
          </div>
        </Card>
      </section>
    </div>
  );
}
