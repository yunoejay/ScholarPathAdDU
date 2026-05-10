import { Card, EmptyState } from '../components/pageParts';
import { fmtCurrency } from '../lib/formatters';

export default function DepartmentReviewView({ profile, queue, onChangeApplication }) {
  return (
    <div className="view-stack">
      <section className="page-header card">
        <div>
          <span className="eyebrow">Department review</span>
          <h2>{profile.department} applicant screening</h2>
          <p>Department chairs can assess economic status and endorse Grant-in-Aid candidates.</p>
        </div>
      </section>

      <section className="card role-intro chair-intro">
        <div>
          <span className="eyebrow">Department chair view</span>
          <h3>Focused on economic screening and endorsement decisions.</h3>
          <p>This dashboard surfaces GIA applicants for review, even before the backend is connected.</p>
        </div>
        <div className="role-badges">
          <span className="pill">Endorsements</span>
          <span className="pill">GIA</span>
          <span className="pill">Economic status</span>
        </div>
      </section>

      <section className="split-grid">
        <Card title="Endorsement queue">
          <div className="list-stack">
            {queue.length ? queue.map((entry) => (
              <article key={entry.id} className="mini-card">
                <div className="card-head">
                  <div>
                    <h3>{entry.studentName}</h3>
                    <p>QPI {entry.qpi} · {fmtCurrency(entry.householdIncome)}</p>
                  </div>
                  <span className="status-pill info">{entry.status}</span>
                </div>
                <p>{entry.recommendation}</p>
                <div className="button-row wrap">
                  <button className="secondary-btn" onClick={() => onChangeApplication('app-001', 'For Verification')}>Mark as endorsed</button>
                  <button className="secondary-btn" onClick={() => onChangeApplication('app-001', 'Rejected')}>Flag for OSA review</button>
                </div>
              </article>
            )) : <EmptyState title="No applicants in queue" description="Department endorsements will appear here once student applications are routed for review." />}
          </div>
        </Card>

        <Card title="Department insights">
          <div className="list-stack">
            <div className="mini-card">
              <h3>Economic screening focus</h3>
              <p>Prioritize GIA candidates with verified income documents and active enrollment status.</p>
            </div>
            <div className="mini-card">
              <h3>Recommended workflow</h3>
              <p>Review submitted profiles, submit endorsements to OSA, and leave document validation to the admin queue.</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
