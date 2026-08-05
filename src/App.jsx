import { useEffect, useMemo, useState } from 'react';
import { announcements as seedAnnouncements, applications as seedApplications, degreePrograms, demoUsers, departmentReviews, documents as seedDocuments, notifications as seedNotifications, scholarships } from './lib/demoData';
import { getApplicationProgress, getDeadlineStatus, rankScholarships, searchScholarships } from './lib/eligibility';
import { getAcademicProgram } from './lib/academicPrograms';
import { getSupabaseSession, getUserProfile, resetPasswordForEmail, signInWithEmailPassword, signOutFromSupabase, signUpWithEmailPassword, updateUserProfile } from './lib/auth';
import AcademicProfileModal from './components/AcademicProfileModal';
import { NotificationDropdown } from './components/pageParts';
import LoginScreenPage from './pages/LoginScreen';
import DashboardViewPage from './pages/DashboardView';
import ScholarshipExplorerPage from './pages/ScholarshipExplorer';
import EligibilityCheckerPage from './pages/EligibilityChecker';
import ApplicationsViewPage from './pages/ApplicationsView';
import DocumentVaultViewPage from './pages/DocumentVaultView';
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

const getInitials = (fullName = '') => fullName
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0].toUpperCase())
  .join('') || 'SP';

const dateKey = (value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = value instanceof Date ? value : new Date(value);
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const reminderDateKey = (deadline, daysBefore) => {
  const reminderDate = new Date(`${deadline}T00:00:00`);
  reminderDate.setDate(reminderDate.getDate() - daysBefore);
  return dateKey(reminderDate);
};

const prependInAppNotification = (previous, notification) => (
  previous.notificationPreferences?.inAppEnabled
    ? [notification, ...previous.notifications]
    : previous.notifications
);

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

const defaultProfileDraft = {
  qpi: 2.86,
  householdIncome: 240000,
  degreeProgram: 'BS Computer Science',
  hasActiveGovernmentGrant: false,
  hasOtherActiveScholarship: false,
  citizenship: 'Filipino',
  isOnPrepaidPlan: false,
  hasSiblingOnAid: false,
  applicantType: 'current',
  yearLevel: 2,
  isHonorsGraduate: false,
  honorsRank: '',
  graduatingClassSize: '',
  hsStrand: '',
  hsAverage: '',
  sponsorTies: { gsisMemberDependent: false, afpDependent: false, usVeteranDependent: false },
};

const createInitialState = () => {
  const stored = readStoredState();
  // Force reset old dark theme by clearing stored state entirely if it has old theme
  if (stored && stored.theme === 'dark') {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }
    return {
      isAuthenticated: false,
      authUser: null,
      rememberMe: false,
      savedEmail: null,
      savedRole: 'student',
      viewerRole: 'student',
      activeView: 'dashboard',
      searchQuery: '',
      filters: { category: 'all', coverage: 'all', deadline: 'all', activeOnly: true },
      profileDraft: { ...defaultProfileDraft },
      notificationPreferences: {
        smsEnabled: true,
        emailEnabled: true,
        inAppEnabled: true,
        deadlineReminders: { oneWeekBefore: true, threeDaysBefore: true, dayBefore: true },
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
    filters: { category: 'all', coverage: 'all', deadline: 'all', activeOnly: true },
    profileDraft: { ...defaultProfileDraft },
    notificationPreferences: {
      smsEnabled: true,
      emailEnabled: true,
      inAppEnabled: true,
      deadlineReminders: { oneWeekBefore: true, threeDaysBefore: true, dayBefore: true },
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
      deadlineReminders: {
        ...defaults.notificationPreferences.deadlineReminders,
        ...(stored.notificationPreferences?.deadlineReminders ?? {}),
      },
    },
    applications: Array.isArray(stored.applications) && stored.applications.length ? stored.applications : defaults.applications,
    documents: Array.isArray(stored.documents) && stored.documents.length ? stored.documents : defaults.documents,
    notifications: Array.isArray(stored.notifications) && stored.notifications.length ? stored.notifications : defaults.notifications,
    announcements: Array.isArray(stored.announcements) && stored.announcements.length ? stored.announcements : defaults.announcements,
  };
};

function App() {
  const [state, setState] = useState(createInitialState);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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

  useEffect(() => {
    if (isBooting) {
      return undefined;
    }

    const syncDeadlineReminders = () => {
      setState((previous) => {
        if (!previous.notificationPreferences?.inAppEnabled || !previous.customDeadlines.length) {
          return previous;
        }

        const today = dateKey(new Date());
        const reminderOptions = [
          { key: 'oneWeekBefore', daysBefore: 7 },
          { key: 'threeDaysBefore', daysBefore: 3 },
          { key: 'dayBefore', daysBefore: 1 },
        ];
        const existingReminderKeys = new Set(
          previous.notifications.map((notification) => notification.sourceKey).filter(Boolean),
        );
        const dueReminders = [];

        previous.customDeadlines.forEach((deadline) => {
          reminderOptions.forEach(({ key, daysBefore }) => {
            if (!previous.notificationPreferences.deadlineReminders?.[key]) {
              return;
            }

            const reminderDate = reminderDateKey(deadline.deadline, daysBefore);
            const sourceKey = `deadline-reminder-${deadline.id}-${daysBefore}`;
            if (reminderDate > today || today > deadline.deadline || existingReminderKeys.has(sourceKey)) {
              return;
            }

            dueReminders.push({
              id: `not-${crypto.randomUUID()}`,
              sourceKey,
              title: `Reminder: "${deadline.title}" due in ${daysBefore} day${daysBefore === 1 ? '' : 's'}`,
              channel: 'In-app',
              body: daysBefore === 1
                ? 'Your deadline is tomorrow. Make sure all required documents are ready.'
                : `You have ${daysBefore} days to prepare documents and materials for this deadline.`,
              status: 'Unread',
              createdAt: today,
            });
          });
        });

        return dueReminders.length
          ? { ...previous, notifications: [...dueReminders, ...previous.notifications] }
          : previous;
      });
    };

    syncDeadlineReminders();
    const interval = window.setInterval(syncDeadlineReminders, 60 * 60 * 1000);
    window.addEventListener('focus', syncDeadlineReminders);
    document.addEventListener('visibilitychange', syncDeadlineReminders);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', syncDeadlineReminders);
      document.removeEventListener('visibilitychange', syncDeadlineReminders);
    };
  }, [isBooting]);

  useEffect(() => {
    if (isBooting) {
      return undefined;
    }

    let active = true;

    const hydrateSession = async () => {
      const result = await getSupabaseSession();
      if (!active || !result.session) {
        return;
      }

      const user = result.session.user;
      const resolvedRole = normalizeRole(user.user_metadata?.role);
      const account = resolveAccount(resolvedRole);

      updateState((previous) => ({
        ...previous,
        isAuthenticated: true,
        viewerRole: account.role,
        activeView: 'dashboard',
        authUser: {
          id: user.id,
          email: user.email,
          role: account.role,
          fullName: user.user_metadata?.full_name || account.fullName || user.email || 'Signed in user',
        },
      }));
    };

    hydrateSession();

    return () => {
      active = false;
    };
  }, [isBooting]);

  const roleKeyMap = {
    student: 'student',
    osa_admin: 'admin',
    department_chair: 'chair',
  };

  const normalizeRole = (roleValue) => {
    if (roleValue === 'osa_admin') {
      return 'osa_admin';
    }

    if (roleValue === 'department_chair') {
      return 'department_chair';
    }

    return 'student';
  };

  const resolveAccount = (roleValue) => {
    const normalizedRole = normalizeRole(roleValue);
    return normalizedRole === 'osa_admin'
      ? demoUsers.admin
      : normalizedRole === 'department_chair'
        ? demoUsers.chair
        : demoUsers.student;
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

  const visibleNotifications = state.notificationPreferences.inAppEnabled ? state.notifications : [];
  const unreadNotifications = useMemo(() => visibleNotifications.filter((entry) => entry.status === 'Unread'), [visibleNotifications]);
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

  const navigate = (view) => {
    updateState({ activeView: view });
    setIsMobileNavOpen(false);
  };

  const login = async (credentials) => {
    const authResult = await signInWithEmailPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authResult.success || authResult.fallback) {
      const resolvedRole = normalizeRole(authResult.user?.user_metadata?.role || credentials.role || 'student');
      const account = resolveAccount(resolvedRole);

      updateState((previous) => ({
        ...previous,
        isAuthenticated: true,
        viewerRole: account.role,
        activeView: 'dashboard',
        authUser: {
          id: authResult.user?.id || account.id,
          email: credentials.email,
          role: account.role,
          fullName: authResult.user?.user_metadata?.full_name || account.fullName,
        },
        rememberMe: credentials.rememberMe || false,
        savedEmail: credentials.rememberMe ? credentials.email : previous.savedEmail,
        savedRole: credentials.rememberMe ? account.role : previous.savedRole,
      }));

      return {
        success: true,
        fallback: authResult.fallback,
        message: authResult.message,
      };
    }

    return {
      success: false,
      fallback: false,
      message: authResult.message || 'Unable to sign in with that email and password.',
    };
  };

  const signup = async (credentials) => {
    const result = await signUpWithEmailPassword({
      email: credentials.email,
      password: credentials.password,
      fullName: credentials.fullName,
      role: credentials.role,
      studentId: credentials.studentId,
    });

    if (result.success) {
      return {
        success: true,
        message: result.message || 'Account created successfully.',
      };
    }

    return {
      success: false,
      message: result.message || 'Unable to create your account right now.',
    };
  };

  const requestPasswordReset = async (credentials) => {
    const result = await resetPasswordForEmail({ email: credentials.email });

    if (result.success) {
      return {
        success: true,
        message: result.message || 'Password reset link sent.',
      };
    }

    return {
      success: false,
      message: result.message || 'Unable to send a reset link right now.',
    };
  };

  const logout = async () => {
    await signOutFromSupabase();
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
      notifications: prependInAppNotification(previous, {
        id: `not-${crypto.randomUUID()}`,
        title: `${scholarship.title} added to your tracker`,
        channel: 'In-app',
        body: `A new draft application was created and linked to your document vault.`,
        status: 'Unread',
        createdAt: new Date().toISOString().slice(0, 10),
      }),
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
      notifications: prependInAppNotification(previous, {
        id: `not-${crypto.randomUUID()}`,
        title: 'Application submitted',
        channel: 'Email',
        body: 'Your scholarship application has been submitted to the centralized tracker.',
        status: 'Unread',
        createdAt: new Date().toISOString().slice(0, 10),
      }),
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
      notifications: prependInAppNotification(previous, {
        id: `not-${crypto.randomUUID()}`,
        title: `Application moved to ${status}`,
        channel: 'Email',
        body: 'OSA updated the status in the admin dashboard and triggered a status notification.',
        status: 'Unread',
        createdAt: new Date().toISOString().slice(0, 10),
      }),
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

  const deleteDocument = (documentId) => {
    const documentToDelete = state.documents.find((entry) => entry.id === documentId);
    if (!documentToDelete || !window.confirm(`Delete “${documentToDelete.title}” from your vault?`)) return;
    setState((previous) => ({
      ...previous,
      documents: previous.documents.filter((entry) => entry.id !== documentId),
      applications: previous.applications.map((entry) => ({
        ...entry,
        attachedDocuments: (entry.attachedDocuments || []).filter((id) => id !== documentId),
        documentStatus: (entry.attachedDocuments || []).filter((id) => id !== documentId).length ? entry.documentStatus : 'Pending',
      })),
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
      notifications: prependInAppNotification(previous, {
        id: `not-${crypto.randomUUID()}`,
        title: `${title} uploaded to Document Vault`,
        channel: 'In-app',
        body: 'The file is now reusable across multiple scholarship applications.',
        status: 'Unread',
        createdAt: new Date().toISOString().slice(0, 10),
      }),
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
        onSignUp={signup}
        onForgotPassword={requestPasswordReset}
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
          {state.authUser && (
            <div className="topbar-identity" title={`${state.authUser.fullName} · ${roleLabels[state.viewerRole]}`}>
              <span className="topbar-avatar" aria-hidden="true">{getInitials(state.authUser.fullName)}</span>
              <span className="topbar-identity-copy">
                <strong>{state.authUser.fullName}</strong>
                <span>{roleLabels[state.viewerRole]}</span>
              </span>
            </div>
          )}
          <NotificationDropdown
            notifications={visibleNotifications}
            announcements={state.announcements}
            onMarkRead={markNotificationRead}
          />
          <button
            type="button"
            className="mobile-nav-toggle topbar-menu-toggle"
            onClick={() => setIsMobileNavOpen((open) => !open)}
            aria-label={isMobileNavOpen ? 'Close page navigation' : 'Open page navigation'}
            aria-expanded={isMobileNavOpen}
          >
            <span aria-hidden="true">☰</span>
          </button>
          <button className="secondary-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      {isMobileNavOpen && (
        <>
          <button
            type="button"
            className="mobile-nav-backdrop"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close page navigation"
          />
          <aside className="mobile-nav-drawer" aria-label="Page navigation">
            <nav className="nav-list mobile-nav-list">
              <button className={state.activeView === 'dashboard' ? 'nav-active' : ''} onClick={() => navigate('dashboard')}>Dashboard</button>
              {state.viewerRole === 'student' && (
                <>
                  <button className={state.activeView === 'explore' ? 'nav-active' : ''} onClick={() => navigate('explore')}>Scholarships</button>
                  <button className={state.activeView === 'eligibility' ? 'nav-active' : ''} onClick={() => navigate('eligibility')}>Eligibility Checker</button>
                  <button className={state.activeView === 'applications' ? 'nav-active' : ''} onClick={() => navigate('applications')}>Applications</button>
                  <button className={state.activeView === 'vault' ? 'nav-active' : ''} onClick={() => navigate('vault')}>Document Vault</button>
                  <button className={state.activeView === 'calendar' ? 'nav-active' : ''} onClick={() => navigate('calendar')}>Calendar</button>
                </>
              )}
              {state.viewerRole === 'osa_admin' && <button className={state.activeView === 'admin' ? 'nav-active' : ''} onClick={() => navigate('admin')}>OSA Console</button>}
              {state.viewerRole === 'department_chair' && <button className={state.activeView === 'review' ? 'nav-active' : ''} onClick={() => navigate('review')}>Department Review</button>}
              <button className={state.activeView === 'settings' ? 'nav-active' : ''} onClick={() => navigate('settings')}>Settings</button>
            </nav>
          </aside>
        </>
      )}

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
                <button className={state.activeView === 'applications' ? 'nav-active' : ''} onClick={() => navigate('applications')}>Applications</button>
                <button className={state.activeView === 'vault' ? 'nav-active' : ''} onClick={() => navigate('vault')}>Document Vault</button>
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
              notifications={visibleNotifications}
              announcements={state.announcements}
              onOpenExplorer={() => navigate('explore')}
              onOpenEligibility={() => navigate('eligibility')}
              onSubmitApplication={submitApplication}
              onTrackScholarship={applyToScholarship}
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
              <ApplicationsViewPage
              applications={studentApplications}
              documents={studentDocuments}
              scholarships={scholarshipCatalog}
              onSubmit={submitApplication}
                onOpenVault={() => navigate('vault')}
            />
          )}

          {state.activeView === 'vault' && state.viewerRole === 'student' && (
            <DocumentVaultViewPage
              documents={studentDocuments}
              onUpload={addDocument}
              onDelete={deleteDocument}
              onOpenApplications={() => navigate('applications')}
            />
          )}

          {state.activeView === 'admin' && state.viewerRole === 'osa_admin' && (
            <AdminConsolePage
              applications={state.applications}
              documents={state.documents}
              announcements={state.announcements}
              notifications={visibleNotifications}
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
