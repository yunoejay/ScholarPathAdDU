import { useEffect, useMemo, useState } from 'react';
import { announcements as seedAnnouncements, applications as seedApplications, degreePrograms, demoUsers, departmentReviews, documents as seedDocuments, notifications as seedNotifications, scholarships } from './lib/demoData';
import { getApplicationProgress, getDeadlineStatus, rankScholarships, searchScholarships } from './lib/eligibility';
import LoginScreenPage from './pages/LoginScreen';
import DashboardViewPage from './pages/DashboardView';
import ScholarshipExplorerPage from './pages/ScholarshipExplorer';
import EligibilityCheckerPage from './pages/EligibilityChecker';
import ApplicationsAndVaultPage from './pages/ApplicationsAndVault';
import AdminConsolePage from './pages/AdminConsole';
import DepartmentReviewViewPage from './pages/DepartmentReviewView';
import CalendarViewPage from './pages/CalendarView';
import SettingsViewPage from './pages/SettingsView';
import logoImage from '../pictures/logo.png';

const storageKey = 'scholarpath-addu-demo-state';
const roleLabels = {
  student: 'Student',
  osa_admin: 'OSA Admin',
  department_chair: 'Department Chair',
};

const readStoredState = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const createInitialState = () => {
  const stored = readStoredState();
  // Force reset old dark theme by clearing stored state entirely if it has old theme
  if (stored && stored.theme === 'dark') {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }
    // Return fresh defaults with light theme
    return {
      isAuthenticated: false,
      authUser: null,
      rememberMe: false,
      savedEmail: null,
      savedRole: 'student',
      viewerRole: 'student',
      activeView: 'dashboard',
      searchQuery: '',
      filters: {
        category: 'all',
        coverage: 'all',
        deadline: 'all',
        activeOnly: true,
      },
      profileDraft: {
        qpi: 2.86,
        householdIncome: 240000,
        degreeProgram: 'BS Computer Science',
        hasActiveGovernmentGrant: false,
      },
      notificationPreferences: {
        smsEnabled: true,
        emailEnabled: true,
        inAppEnabled: true,
        deadlineReminders: {
          oneWeekBefore: true,
          threeDaysBefore: true,
          dayBefore: true,
        },
      },
      applications: seedApplications,
      documents: seedDocuments,
      notifications: seedNotifications,
      announcements: seedAnnouncements,
      customDeadlines: [],
      theme: 'light',
    };
  }
  const defaults = {
    isAuthenticated: false,
    authUser: null,
    rememberMe: false,
    savedEmail: null,
    savedRole: 'student',
    viewerRole: 'student',
    activeView: 'dashboard',
    searchQuery: '',
    filters: {
      category: 'all',
      coverage: 'all',
      deadline: 'all',
      activeOnly: true,
    },
    profileDraft: {
      qpi: 2.86,
      householdIncome: 240000,
      degreeProgram: 'BS Computer Science',
      hasActiveGovernmentGrant: false,
    },
    notificationPreferences: {
      smsEnabled: true,
      emailEnabled: true,
      inAppEnabled: true,
      deadlineReminders: {
        oneWeekBefore: true,
        threeDaysBefore: true,
        dayBefore: true,
      },
    },
    applications: seedApplications,
    documents: seedDocuments,
    notifications: seedNotifications,
    announcements: seedAnnouncements,
    customDeadlines: [],
    theme: 'light',
  };

  if (!stored) {
    return defaults;
  }

  return {
    ...defaults,
    ...stored,
    theme: stored.theme ?? 'light',
    authUser: stored.authUser ?? defaults.authUser,
    rememberMe: stored.rememberMe ?? defaults.rememberMe,
    savedEmail: stored.savedEmail ?? defaults.savedEmail,
    savedRole: stored.savedRole ?? defaults.savedRole,
    filters: {
      ...defaults.filters,
      ...(stored.filters ?? {}),
    },
    profileDraft: {
      ...defaults.profileDraft,
      ...(stored.profileDraft ?? {}),
    },
    notificationPreferences: {
      ...defaults.notificationPreferences,
      ...(stored.notificationPreferences ?? {}),
    },
    applications: Array.isArray(stored.applications) && stored.applications.length ? stored.applications : defaults.applications,
    documents: Array.isArray(stored.documents) && stored.documents.length ? stored.documents : defaults.documents,
    notifications: Array.isArray(stored.notifications) && stored.notifications.length ? stored.notifications : defaults.notifications,
    announcements: Array.isArray(stored.announcements) && stored.announcements.length ? stored.announcements : defaults.announcements,
  };
};

function App() {
  const [state, setState] = useState(createInitialState);
  // theme: 'dark' | 'light' — persisted in state
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    // Apply theme class to document root so body background updates
    if (state.theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, [state.theme]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  const roleKeyMap = {
    student: 'student',
    osa_admin: 'admin',
    department_chair: 'chair',
  };

  const currentProfile = demoUsers[roleKeyMap[state.viewerRole] || 'student'];

  const themeClass = state.theme === 'light' ? 'theme-light' : '';
  const studentMatchProfile = { ...demoUsers.student, ...state.profileDraft };
  const currentIdentity = state.viewerRole === 'student' ? { ...currentProfile, ...state.profileDraft } : currentProfile;
  const scholarshipCatalog = scholarships;

  const eligibleScholarships = useMemo(() => rankScholarships(studentMatchProfile, scholarshipCatalog), [studentMatchProfile, scholarshipCatalog]);
  const filteredScholarships = useMemo(
    () => searchScholarships(scholarshipCatalog, state.searchQuery, state.filters),
    [scholarshipCatalog, state.searchQuery, state.filters],
  );

  const studentApplications = useMemo(
    () => state.applications.filter((entry) => entry.studentId === currentProfile.id),
    [state.applications, currentProfile.id],
  );

  const studentDocuments = useMemo(
    () => state.documents.filter((entry) => entry.ownerId === currentProfile.id),
    [state.documents, currentProfile.id],
  );

  const unreadNotifications = useMemo(() => state.notifications.filter((entry) => entry.status === 'Unread'), [state.notifications]);
  const activeDeadlineCount = useMemo(
    () => scholarshipCatalog.filter((entry) => getDeadlineStatus(entry.deadline).tone !== 'danger').length,
    [scholarshipCatalog],
  );

  const stats = useMemo(() => ({
    totalPrograms: scholarshipCatalog.length,
    eligibleMatches: eligibleScholarships.length,
    openApplications: studentApplications.filter((entry) => entry.status !== 'Rejected' && entry.status !== 'Approved').length,
    unreadNotifications: unreadNotifications.length,
  }), [eligibleScholarships.length, scholarshipCatalog.length, studentApplications, unreadNotifications.length]);

  const updateState = (updater) => setState((previous) => {
    const nextState = typeof updater === 'function' ? updater(previous) : updater;
    return {
      ...previous,
      ...nextState,
    };
  });

  const switchRole = (role) => {
    updateState((previous) => ({
      viewerRole: role,
      activeView: 'dashboard',
      profileDraft: role === 'student' ? previous.profileDraft : previous.profileDraft,
    }));
  };

  const navigate = (view) => updateState({ activeView: view });

  const login = (credentials) => {
    const selectedRole = credentials.role || 'student';
    const account = selectedRole === 'osa_admin'
      ? demoUsers.admin
      : selectedRole === 'department_chair'
        ? demoUsers.chair
        : demoUsers.student;

    updateState((previous) => ({
      ...previous,
      isAuthenticated: true,
      viewerRole: account.role,
      activeView: 'dashboard',
      authUser: {
        email: credentials.email,
        role: account.role,
        fullName: account.fullName,
      },
      rememberMe: credentials.rememberMe || false,
      savedEmail: credentials.rememberMe ? credentials.email : previous.savedEmail,
      savedRole: credentials.rememberMe ? account.role : previous.savedRole,
    }));
  };

  const logout = () => {
    updateState((previous) => ({
      ...previous,
      isAuthenticated: false,
      authUser: null,
      viewerRole: 'student',
      activeView: 'dashboard',
    }));
  };

  const applyToScholarship = (scholarship) => {
    const alreadyExists = state.applications.some((entry) => entry.scholarshipId === scholarship.id && entry.studentId === currentProfile.id);
    if (alreadyExists) return;

    const eligibleDocs = studentDocuments.filter((doc) => doc.verificationStatus === 'Verified').map((doc) => doc.id);
    const nextApplication = {
      id: `app-${crypto.randomUUID()}`,
      studentId: currentProfile.id,
      scholarshipId: scholarship.id,
      scholarshipTitle: scholarship.title,
      status: 'Draft',
      documentStatus: eligibleDocs.length ? 'Verified' : 'Pending',
      submittedAt: null,
      updatedAt: new Date().toISOString().slice(0, 10),
      attachedDocuments: eligibleDocs,
      notes: 'Created from the scholarship explorer.',
    };

    setState((previous) => ({
      ...previous,
      applications: [nextApplication, ...previous.applications],
      notifications: [
        {
          id: `not-${crypto.randomUUID()}`,
          title: `${scholarship.title} added to your tracker`,
          channel: 'In-app',
          body: `A new draft application was created and linked to your document vault.`,
          status: 'Unread',
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...previous.notifications,
      ],
      activeView: 'applications',
    }));
  };

  const submitApplication = (applicationId) => {
    setState((previous) => ({
      ...previous,
      applications: previous.applications.map((entry) => entry.id === applicationId ? {
        ...entry,
        status: 'Submitted',
        submittedAt: entry.submittedAt ?? new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
      } : entry),
      notifications: [
        {
          id: `not-${crypto.randomUUID()}`,
          title: 'Application submitted',
          channel: 'Email',
          body: 'Your scholarship application has been submitted to the centralized tracker.',
          status: 'Unread',
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...previous.notifications,
      ],
    }));
  };

  const changeApplicationStatus = (applicationId, status) => {
    setState((previous) => ({
      ...previous,
      applications: previous.applications.map((entry) => entry.id === applicationId ? {
        ...entry,
        status,
        updatedAt: new Date().toISOString().slice(0, 10),
      } : entry),
      notifications: [
        {
          id: `not-${crypto.randomUUID()}`,
          title: `Application moved to ${status}`,
          channel: 'Email',
          body: 'OSA updated the status in the admin dashboard and triggered a status notification.',
          status: 'Unread',
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...previous.notifications,
      ],
    }));
  };

  const changeDocumentStatus = (documentId, verificationStatus) => {
    setState((previous) => ({
      ...previous,
      documents: previous.documents.map((entry) => entry.id === documentId ? {
        ...entry,
        verificationStatus,
      } : entry),
    }));
  };

  const addDocument = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('documentTitle') || '').trim();
    const fileField = formData.get('documentFile');
    const fileName = fileField instanceof File ? fileField.name.trim() : String(fileField || '').trim();
    const documentType = String(formData.get('documentType') || 'Supporting Document');

    if (!title || !fileName) return;

    const nextDocument = {
      id: `doc-${crypto.randomUUID()}`,
      ownerId: currentProfile.id,
      title,
      fileName,
      documentType,
      verificationStatus: 'Pending',
      sharedWith: [],
      uploadedAt: new Date().toISOString().slice(0, 10),
    };

    setState((previous) => ({
      ...previous,
      documents: [nextDocument, ...previous.documents],
      notifications: [
        {
          id: `not-${crypto.randomUUID()}`,
          title: `${title} uploaded to Document Vault`,
          channel: 'In-app',
          body: 'The file is now reusable across multiple scholarship applications.',
          status: 'Unread',
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...previous.notifications,
      ],
    }));

    event.currentTarget.reset();
  };

  const addAnnouncement = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('announcementTitle') || '').trim();
    const body = String(formData.get('announcementBody') || '').trim();
    if (!title || !body) return;

    setState((previous) => ({
      ...previous,
      announcements: [
        {
          id: `ann-${crypto.randomUUID()}`,
          title,
          body,
          audience: String(formData.get('announcementAudience') || 'Students'),
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...previous.announcements,
      ],
    }));

    event.currentTarget.reset();
  };

  const markNotificationRead = (notificationId) => {
    setState((previous) => ({
      ...previous,
      notifications: previous.notifications.map((entry) => entry.id === notificationId ? { ...entry, status: 'Read' } : entry),
    }));
  };

  const addCustomDeadline = (title, deadline) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (!title.trim() || Number.isNaN(deadlineDate.getTime()) || deadlineDate < startOfToday) {
      return;
    }

    const newDeadline = {
      id: `custom-${crypto.randomUUID()}`,
      title,
      deadline: deadline,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setState((previous) => {
      const updatedState = {
        ...previous,
        customDeadlines: [newDeadline, ...previous.customDeadlines],
      };

      // Generate reminder notifications 7 days and 5 days before deadline
      const reminderNotifications = [];
      const sevenDaysBefore = new Date(deadlineDate);
      sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);

      const fiveDaysBefore = new Date(deadlineDate);
      fiveDaysBefore.setDate(fiveDaysBefore.getDate() - 5);

      if (sevenDaysBefore > now) {
        reminderNotifications.push({
          id: `not-${crypto.randomUUID()}`,
          title: `Reminder: "${title}" due in 7 days`,
          channel: 'In-app',
          body: `You have 7 days to prepare documents and materials for this deadline. Start gathering required papers now.`,
          status: 'Unread',
          createdAt: sevenDaysBefore.toISOString().slice(0, 10),
        });
      }

      if (fiveDaysBefore > now) {
        reminderNotifications.push({
          id: `not-${crypto.randomUUID()}`,
          title: `Reminder: "${title}" due in 5 days`,
          channel: 'In-app',
          body: `5 days left. Make sure all required documents are ready and verified.`,
          status: 'Unread',
          createdAt: fiveDaysBefore.toISOString().slice(0, 10),
        });
      }

      updatedState.notifications = [...reminderNotifications, ...updatedState.notifications];
      return updatedState;
    });
  };

  const deleteCustomDeadline = (deadlineId) => {
    setState((previous) => ({
      ...previous,
      customDeadlines: previous.customDeadlines.filter((d) => d.id !== deadlineId),
    }));
  };

  const eligiblePreview = eligibleScholarships.slice(0, 6);
  const departmentQueue = departmentReviews.filter((entry) => entry.department === currentProfile.department);

  if (isBooting) {
    return (
      <div className="boot-screen">
        <div className="boot-card card">
          <span className="eyebrow">ScholarPath AdDU</span>
          <h1>Preparing your scholarship workspace</h1>
          <p>Loading a polished front-end review of the manuscript-driven experience.</p>
          <div className="skeleton-grid">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return (
      <LoginScreenPage
        onLogin={login}
        rememberedEmail={state.savedEmail}
        rememberedRole={state.savedRole}
        isRemembered={state.rememberMe}
        theme={state.theme}
        onToggleTheme={() => updateState((prev) => ({ theme: prev.theme === 'light' ? 'dark' : 'light' }))}
      />
    );
  }

  return (
    <div className={`app-shell ${themeClass}`}>
      <header className="topbar">
        <div className="topbar-brand-block">
          <div className="topbar-brand-row">
            <img src={logoImage} alt="Ateneo de Davao University logo" className="topbar-logo" />
            <div className="brand">ScholarPath AdDU</div>
          </div>
          <p className="subtitle"></p>
        </div>

        <div className="topbar-actions">
          {state.authUser && <span className="status-pill info">Signed in as {state.authUser.fullName}</span>}
          <button className="secondary-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <button
        type="button"
        className="theme-toggle floating-theme-toggle"
        onClick={() => updateState((prev) => ({ theme: prev.theme === 'light' ? 'dark' : 'light' }))}
        aria-label={state.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        title={state.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        <span className="theme-toggle-icon" aria-hidden="true">
          {state.theme === 'light' ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon-moon">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon-sun">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </button>

      <main className="layout">
        <aside className="sidebar card">
          <div className="profile-block">
            <div className="avatar">{currentProfile.fullName.slice(0, 1)}</div>
            <div>
              <h2>{currentProfile.fullName}</h2>
              <p>{roleLabels[state.viewerRole]} · {currentProfile.department}</p>
            </div>
          </div>

          <nav className="nav-list">
            <button className={state.activeView === 'dashboard' ? 'nav-active' : ''} onClick={() => navigate('dashboard')}>Dashboard</button>
            {state.viewerRole === 'student' && (
              <>
                <button className={state.activeView === 'explore' ? 'nav-active' : ''} onClick={() => navigate('explore')}>Scholarships</button>
                <button className={state.activeView === 'eligibility' ? 'nav-active' : ''} onClick={() => navigate('eligibility')}>Eligibility Checker</button>
                <button className={state.activeView === 'applications' ? 'nav-active' : ''} onClick={() => navigate('applications')}>Applications & Vault</button>
              </>
            )}
            {state.viewerRole === 'osa_admin' && <button className={state.activeView === 'admin' ? 'nav-active' : ''} onClick={() => navigate('admin')}>OSA Console</button>}
            {state.viewerRole === 'department_chair' && <button className={state.activeView === 'review' ? 'nav-active' : ''} onClick={() => navigate('review')}>Department Review</button>}
            {state.viewerRole === 'student' && <button className={state.activeView === 'calendar' ? 'nav-active' : ''} onClick={() => navigate('calendar')}>Calendar</button>}
            <button className={state.activeView === 'settings' ? 'nav-active' : ''} onClick={() => navigate('settings')}>Settings</button>
          </nav>

          <div className="sidebar-footer">
            <div className="mini-stat">
              <span>Programs</span>
              <strong>{stats.totalPrograms}</strong>
            </div>
            <div className="mini-stat">
              <span>Open deadlines</span>
              <strong>{activeDeadlineCount}</strong>
            </div>
            <div className="mini-stat">
              <span>Unread alerts</span>
              <strong>{stats.unreadNotifications}</strong>
            </div>
          </div>
        </aside>

        <section className="content-stack">
          {state.activeView === 'dashboard' && (
            <DashboardViewPage
              profile={currentIdentity}
              stats={stats}
              applications={studentApplications}
              eligibleScholarships={eligiblePreview}
              notifications={state.notifications}
              announcements={state.announcements}
              onOpenExplorer={() => navigate('explore')}
              onOpenEligibility={() => navigate('eligibility')}
              onSubmitApplication={submitApplication}
              onMarkRead={markNotificationRead}
              onShowApplications={() => navigate('applications')}
            />
          )}

          {state.activeView === 'explore' && (
            <ScholarshipExplorerPage
              profile={currentIdentity}
              scholarships={filteredScholarships}
              searchQuery={state.searchQuery}
              filters={state.filters}
              onSearchChange={(value) => updateState((previous) => ({ searchQuery: value }))}
              onFilterChange={(patch) => updateState((previous) => ({ filters: { ...previous.filters, ...patch } }))}
              onApply={applyToScholarship}
            />
          )}

          {state.activeView === 'eligibility' && (
            <EligibilityCheckerPage
              profileDraft={state.profileDraft}
              scholarships={scholarshipCatalog}
              onChange={(patch) => updateState((previous) => ({ profileDraft: { ...previous.profileDraft, ...patch } }))}
              onApply={applyToScholarship}
            />
          )}

          {state.activeView === 'applications' && (
            <ApplicationsAndVaultPage
              applications={studentApplications}
              documents={studentDocuments}
              scholarships={scholarshipCatalog}
              onUpload={addDocument}
              onSubmit={submitApplication}
            />
          )}

          {state.activeView === 'admin' && state.viewerRole === 'osa_admin' && (
            <AdminConsolePage
              applications={state.applications}
              documents={state.documents}
              announcements={state.announcements}
              notifications={state.notifications}
              onChangeApplication={changeApplicationStatus}
              onChangeDocument={changeDocumentStatus}
              onCreateAnnouncement={addAnnouncement}
              onMarkRead={markNotificationRead}
            />
          )}

          {state.activeView === 'review' && state.viewerRole === 'department_chair' && (
            <DepartmentReviewViewPage
              profile={currentProfile}
              queue={departmentQueue}
              applications={state.applications}
              onChangeApplication={changeApplicationStatus}
            />
          )}

          {state.activeView === 'settings' && (
            <SettingsViewPage
              notificationPreferences={state.notificationPreferences}
              onUpdatePreferences={(prefs) => updateState({ notificationPreferences: prefs })}
            />
          )}

          {state.activeView === 'calendar' && (
            <CalendarViewPage
              scholarships={scholarshipCatalog}
              customDeadlines={state.customDeadlines}
              onAddCustomDeadline={addCustomDeadline}
              onDeleteCustomDeadline={deleteCustomDeadline}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
