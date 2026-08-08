import { AnnouncementItem, Card, EmptyState, NotificationItem, ScholarshipRow, StatCard } from '../components/pageParts';
import { GraduationCap } from 'lucide-react';
import { fmtCurrency, fmtDate } from '../lib/formatters';
import logoImage from '../../pictures/logo.png';

export default function DashboardView({ profile, isFirstLogin, stats, applications, eligibleScholarships, notifications, announcements, onOpenExplorer, onOpenEligibility, onTrackScholarship, onMarkRead, onShowApplications, hasIncompleteProfile, onCompleteProfile }) {
  // Student Dashboard
  if (profile.role === 'student') {
    const heroHighlights = [
      {
        label: 'Discovery',
        value: `${stats.totalPrograms} programs`,
        note: 'Centralized and searchable scholarship catalog',
      },
      {
        label: 'Matching',
        value: `${stats.eligibleMatches} fit(s)`,
        note: 'Rule-based eligibility with exclusion overrides',
      },
      {
        label: 'Tracking',
        value: `${stats.openApplications} active`,
        note: 'Applications, documents, and notifications in one view',
      },
    ];

    return (
      <div className="blue-action-view grid gap-4">
        <section className="dashboard-hero grid gap-6 rounded-app border bg-app-card p-5 shadow-app backdrop-blur lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:p-7">
          <div className="dashboard-hero-copy">
            <p className="dashboard-welcome">{isFirstLogin ? 'Welcome!' : `Welcome back, ${profile.fullName || 'Scholar'}!`}</p>
            <h1>Find the right scholarship and take the next step.</h1>
            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-br from-ateneo-strong via-ateneo to-ateneo-bright px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60" onClick={onOpenExplorer}>Explore scholarships</button>
              <button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-app-border bg-app-surface px-4 py-2 text-sm font-semibold text-app-text transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60" onClick={onOpenEligibility}>Run eligibility check</button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div key={item.label} className="grid grid-rows-[auto_auto_1fr_auto] items-stretch gap-3 rounded-[18px] border border-app-border bg-app-surface p-4">
                  <span className="eyebrow">{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.note}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard-hero-summary grid content-start gap-3">
            <div className="dashboard-summary-card rounded-[18px] border border-app-border bg-app-surface p-4">
              <span>Student profile</span>
              <strong>{profile.degreeProgram}</strong>
              <p>QPI {profile.qpi ?? '—'} · Income {profile.householdIncome ? fmtCurrency(profile.householdIncome) : '—'}</p>
            </div>
            <div className="dashboard-summary-card rounded-[18px] border border-app-border bg-app-surface p-4">
              <span>Best match</span>
              <strong>{eligibleScholarships[0]?.title ?? 'No matches yet'}</strong>
              <p>{eligibleScholarships[0] ? `Deadline ${fmtDate(eligibleScholarships[0].deadline)}` : 'Adjust your profile inputs.'}</p>
            </div>
          </div>
        </section>

        {hasIncompleteProfile && (
          <section className="profile-reminder flex flex-col gap-4 rounded-app border border-amber-300/40 bg-gradient-to-r from-amber-400/15 via-orange-400/10 to-blue-500/10 p-5 shadow-app sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="eyebrow text-amber-700 dark:text-amber-200">Profile reminder</span>
              <h2 className="mt-1 text-xl font-bold text-app-text">Complete your academic profile</h2>
              <p className="mb-0 mt-1 max-w-2xl text-sm text-app-muted">Add your program, student number, household income, and QPI to improve Smart Eligibility Checker matches.</p>
            </div>
            <button type="button" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-amber-500/25" onClick={onCompleteProfile}>Complete profile</button>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Programs in catalog" value={stats.totalPrograms} note="Active scholarship opportunities" />
          <StatCard label="Eligible matches" value={stats.eligibleMatches} note="Smart Eligibility Checker results" />
          <StatCard label="Open applications" value={stats.openApplications} note="Drafts and submissions in progress" />
          <StatCard label="Unread alerts" value={stats.unreadNotifications} note="Deadline and status notifications" />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Card title="Top matches" action={<button className="link-btn" type="button" onClick={onShowApplications}>Open application workspace</button>}>
            <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
              {eligibleScholarships.length ? eligibleScholarships.map((scholarship) => (
                <ScholarshipRow key={scholarship.id} scholarship={scholarship} onApply={onTrackScholarship} />
              )) : <EmptyState title="No eligible matches yet" description="Try adjusting your QPI, income, or degree inputs in the Eligibility Checker." action={<button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-app-border bg-app-surface px-4 py-2 text-sm font-semibold text-app-text transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60" onClick={onOpenEligibility}>Check eligibility</button>} />}
            </div>
          </Card>

          <Card title="Notifications & announcements">
            <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
              {notifications.length ? notifications.slice(0, 3).map((entry) => (
                <NotificationItem key={entry.id} entry={entry} onMarkRead={onMarkRead} />
              )) : <EmptyState title="No new alerts" description="Deadline reminders and status updates appear here as you use the app." />}
              {announcements.slice(0, 2).map((entry) => (
                <AnnouncementItem key={entry.id} entry={entry} />
              ))}
            </div>
          </Card>
        </section>
      </div>
    );
  }

  // OSA Admin Dashboard
  if (profile.role === 'osa_admin') {
    return (
      <div className="grid gap-4">
        <section className="welcome-banner rounded-app border bg-app-card p-5 shadow-app backdrop-blur">
          <p className="welcome-message">Welcome, {profile.fullName || 'Administrator'}! Here's your OSA dashboard.</p>
        </section>

        <section className="grid gap-6 rounded-app border bg-app-card p-5 shadow-app backdrop-blur lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
          <div>
            <h1>Review applications and documents</h1>
          </div>
          <div className="grid content-start gap-3">
            <div className="rounded-[18px] border border-app-border bg-app-surface p-4">
              <span>Role</span>
              <strong>OSA Administrator</strong>
              <p>Applications, document verification, and announcements</p>
            </div>
            <div className="rounded-[18px] border border-blue-400/30 bg-blue-500/10 p-4">
              <span>Functions</span>
              <p>Use the OSA Console to review applications, verify documents, and share important announcements.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total applications" value={stats.openApplications} note="Submitted and under review" />
          <StatCard label="Programs available" value={stats.totalPrograms} note="Active scholarship pipelines" />
          <StatCard label="Unread alerts" value={stats.unreadNotifications} note="System notifications" />
        </section>

        <Card title="Quick access">
          <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
            <EmptyState 
              title="Ready to manage applications" 
              description="Use the OSA Console from the sidebar to review applications, verify student documents, and broadcast announcements to the scholarship community." 
            />
          </div>
        </Card>
      </div>
    );
  }

  // Department Chair Dashboard
  if (profile.role === 'department_chair') {
    return (
      <div className="grid gap-4">
        <section className="welcome-banner rounded-app border bg-app-card p-5 shadow-app backdrop-blur">
          <p className="welcome-message">Welcome, {profile.fullName || 'Chair'}! Review endorsements and insights.</p>
        </section>

        <section className="grid gap-6 rounded-app border bg-app-card p-5 shadow-app backdrop-blur lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
          <div>
            <h1>Review Grant-in-Aid applicants</h1>
          </div>
          <div className="grid content-start gap-3">
            <div className="rounded-[18px] border border-app-border bg-app-surface p-4">
              <span>Department</span>
              <strong>{profile.department}</strong>
              <p>GIA screening and endorsement decisions</p>
            </div>
            <div className="rounded-[18px] border border-blue-400/30 bg-blue-500/10 p-4">
              <span>Scope</span>
              <p>Review students in {profile.department} and assess their economic and academic eligibility for GIA support.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Applicants in review" value={stats.openApplications} note="Pending endorsement" />
          <StatCard label="Your department" value={profile.department} note="Endorsement scope" />
          <StatCard label="Unread alerts" value={stats.unreadNotifications} note="System notifications" />
        </section>

        <Card title="Quick access">
          <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
            <EmptyState 
              title="Ready to review endorsements" 
              description="Use the Department Review from the sidebar to filter and assess students within your department, then submit official GIA endorsements to OSA." 
            />
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
