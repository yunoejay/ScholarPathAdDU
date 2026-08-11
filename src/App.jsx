import { useEffect, useMemo, useState } from 'react';
import { LogOut, Menu, Moon, Sun, X } from 'lucide-react';
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
      hasLoggedInBefore: false,
      showFirstLoginWelcome: false,
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
      profileSkipped: false,
      theme: 'light',
    };
  }
  const defaults = {
    isAuthenticated: false,
    hasLoggedInBefore: false,
    showFirstLoginWelcome: false,
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
    profileSkipped: false,
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
    hasLoggedInBefore: stored.hasLoggedInBefore ?? defaults.hasLoggedInBefore,
    showFirstLoginWelcome: stored.showFirstLoginWelcome ?? defaults.showFirstLoginWelcome,
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
    customDeadlines: Array.isArray(stored.customDeadlines) ? stored.customDeadlines : defaults.customDeadlines,
    profileSkipped: stored.profileSkipped ?? defaults.profileSkipped,
  };
};

function App() {
  const [state, setState] = useState(createInitialState);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  // theme: 'dark' | 'light' — persisted in state
  const [isBooting, setIsBooting] = useState(true);
  const [profileOnboarding, setProfileOnboarding] = useState(null);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const updateState = (updater) => setState((previous) => {
    const nextState = typeof updater === 'function' ? updater(previous) : updater;
    return {
      ...previous,
      ...nextState,
    };
  });

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
      const profileResult = await getUserProfile(user.id);
      const profile = profileResult.profile;
      const userRole = profile?.role || user.user_metadata?.role || 'student';
      updateState((previous) => ({
        ...previous,
        isAuthenticated: true,
        viewerRole: userRole,
        activeView: 'dashboard',
        authUser: {
          id: user.id,
          email: user.email,
          role: userRole,
          fullName: profile?.full_name || user.user_metadata?.full_name || user.email || 'Signed in user',
          department: profile?.department || '',
          degreeProgram: profile?.degree_program || '',
          studentNumber: profile?.student_number || user.user_metadata?.student_id || '',
          qpi: profile?.qpi ?? '',
          householdIncome: profile?.household_income ?? '',
          hasActiveGovernmentGrant: profile?.has_active_government_grant ?? false,
        },
        profileDraft: profile?.degree_program
          ? { ...previous.profileDraft, degreeProgram: profile.degree_program }
          : previous.profileDraft,
      }));
      if (!profile?.degree_program || !profile?.student_number || profile?.qpi == null || profile?.household_income == null) {
        if (readStoredState()?.profileSkipped) return;
        setProfileOnboarding({ id: user.id, fullName: profile?.full_name || user.user_metadata?.full_name || user.email || 'Signed in user', initialProgram: profile?.degree_program || '', initialStudentNumber: profile?.student_number || user.user_metadata?.student_id || '', initialQpi: profile?.qpi ?? '', initialHouseholdIncome: profile?.household_income ?? '', initialHasActiveGovernmentGrant: profile?.has_active_government_grant ?? false });
      }
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

  const resolveAccount = (roleValue) => {
    const normalizedRole = roleValue === 'osa_admin' ? 'osa_admin' : roleValue === 'department_chair' ? 'department_chair' : 'student';
    return normalizedRole === 'osa_admin'
      ? demoUsers.admin
      : normalizedRole === 'department_chair'
        ? demoUsers.chair
        : demoUsers.student;
  };

  const currentProfile = demoUsers[roleKeyMap[state.viewerRole] || 'student'];

  const themeClass = state.theme === 'light' ? 'theme-light' : '';
  const studentMatchProfile = { ...demoUsers.student, ...state.profileDraft, ...(state.authUser || {}) };
  const currentIdentity = state.viewerRole === 'student'
    ? { ...currentProfile, ...state.profileDraft, ...(state.authUser || {}) }
    : currentProfile;
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
    const selectedRole = credentials.role || 'student';
    const authResult = await signInWithEmailPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authResult.success || authResult.fallback) {
      const resolvedRole = authResult.user?.user_metadata?.role || selectedRole;
      const account = resolveAccount(resolvedRole);
      const profileResult = authResult.user?.id ? await getUserProfile(authResult.user.id) : { profile: null };
      const profile = profileResult.profile;
      updateState((previous) => ({
        ...previous,
        isAuthenticated: true,
        hasLoggedInBefore: true,
        showFirstLoginWelcome: !previous.hasLoggedInBefore,
        viewerRole: account.role,
        activeView: 'dashboard',
        authUser: {
          id: authResult.user?.id || account.id,
          email: credentials.email,
          role: account.role,
          fullName: profile?.full_name || authResult.user?.user_metadata?.full_name || account.fullName,
          department: profile?.department || account.department,
          degreeProgram: profile?.degree_program || '',
          studentNumber: profile?.student_number || authResult.user?.user_metadata?.student_id || '',
          qpi: profile?.qpi ?? '',
          householdIncome: profile?.household_income ?? '',
        },
        rememberMe: credentials.rememberMe || false,
        savedEmail: credentials.rememberMe ? credentials.email : previous.savedEmail,
        savedRole: credentials.rememberMe ? account.role : previous.savedRole,
        profileDraft: profile?.degree_program
          ? { ...previous.profileDraft, degreeProgram: profile.degree_program }
          : previous.profileDraft,
      }));
      if (authResult.user?.id && (!profile?.degree_program || !profile?.student_number || profile?.qpi == null || profile?.household_income == null) && !readStoredState()?.profileSkipped) {
        setProfileOnboarding({ id: authResult.user.id, fullName: profile?.full_name || authResult.user?.user_metadata?.full_name || account.fullName, initialProgram: profile?.degree_program || '', initialStudentNumber: profile?.student_number || authResult.user?.user_metadata?.student_id || '', initialQpi: profile?.qpi ?? '', initialHouseholdIncome: profile?.household_income ?? '', initialHasActiveGovernmentGrant: profile?.has_active_government_grant ?? false });
      }

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
      showFirstLoginWelcome: false,
      authUser: null,
      viewerRole: 'student',
      activeView: 'dashboard',
    }));
    setProfileOnboarding(null);
  };

  const saveAcademicProfile = async (program, studentNumber, householdIncome, qpi, hasActiveGovernmentGrant) => {
    if (!program) {
      updateState({ profileSkipped: true });
      setProfileOnboarding(null);
      setProfileSaveError('');
      return;
    }

    setIsSavingProfile(true);
    setProfileSaveError('');
    const result = await updateUserProfile(profileOnboarding.id, {
      degreeProgram: program.value,
      department: program.department,
      studentNumber,
      householdIncome,
      qpi,
      hasActiveGovernmentGrant,
    });

    if (!result.success) {
      setProfileSaveError(result.message || 'Unable to save your academic profile.');
      setIsSavingProfile(false);
      return;
    }

    updateState((previous) => ({
      authUser: { ...previous.authUser, department: program.department, degreeProgram: program.value, studentNumber, householdIncome, qpi, hasActiveGovernmentGrant },
      profileDraft: { ...previous.profileDraft, degreeProgram: program.value, householdIncome, qpi, hasActiveGovernmentGrant },
      profileSkipped: false,
    }));
    setProfileOnboarding(null);
    setIsSavingProfile(false);
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

  const saveEligibilityProfile = async (profile) => {
    const profileUpdate = {
      degreeProgram: profile.degreeProgram,
      department: getAcademicProgram(profile.degreeProgram).department,
      studentNumber: state.authUser?.studentNumber || currentProfile.studentNumber,
      householdIncome: profile.householdIncome,
      qpi: profile.qpi,
      hasActiveGovernmentGrant: Boolean(profile.hasActiveGovernmentGrant),
    };

    if (!state.authUser?.id) {
      updateState((previous) => ({
        ...previous,
        profileDraft: { ...previous.profileDraft, ...profile },
        authUser: { ...previous.authUser, ...profileUpdate },
      }));
      return { success: true };
    }

    const result = await updateUserProfile(state.authUser.id, profileUpdate);
    if (!result.success) return result;

    updateState((previous) => ({
      ...previous,
      profileDraft: { ...previous.profileDraft, ...profile },
      authUser: { ...previous.authUser, ...profileUpdate },
    }));
    return result;
  };

  const eligiblePreview = eligibleScholarships.slice(0, 6);
  const departmentQueue = departmentReviews.filter((entry) => entry.department === currentProfile.department);
  const hasIncompleteStudentProfile = state.viewerRole === 'student' && (
    !currentIdentity.degreeProgram
    || !currentIdentity.studentNumber
    || currentIdentity.qpi == null
    || currentIdentity.qpi === ''
    || currentIdentity.householdIncome == null
    || currentIdentity.householdIncome === ''
  );

  const openAcademicProfile = () => {
    setProfileSaveError('');
    setProfileOnboarding({
      id: state.authUser?.id || currentIdentity.id,
      fullName: currentIdentity.fullName,
      initialProgram: currentIdentity.degreeProgram || '',
      initialStudentNumber: currentIdentity.studentNumber || '',
      initialQpi: currentIdentity.qpi ?? '',
      initialHouseholdIncome: currentIdentity.householdIncome ?? '',
      initialHasActiveGovernmentGrant: currentIdentity.hasActiveGovernmentGrant ?? false,
    });
  };

  const navigationItems = [
    { view: 'dashboard', label: 'Dashboard', visible: true },
    { view: 'explore', label: 'Scholarships', visible: state.viewerRole === 'student' },
    { view: 'eligibility', label: 'Eligibility Checker', visible: state.viewerRole === 'student' },
    { view: 'applications', label: 'Applications', visible: state.viewerRole === 'student' },
    { view: 'vault', label: 'Document Vault', visible: state.viewerRole === 'student' },
    { view: 'calendar', label: 'Calendar', visible: state.viewerRole === 'student' },
    { view: 'admin', label: 'OSA Console', visible: state.viewerRole === 'osa_admin' },
    { view: 'review', label: 'Department Review', visible: state.viewerRole === 'department_chair' },
    { view: 'settings', label: 'Settings', visible: true },
  ].filter((item) => item.visible);

  const renderNavigation = (className = '') => (
    <nav className={`grid gap-2 ${className}`} aria-label="Page navigation">
      {navigationItems.map((item) => (
        <button
          key={item.view}
          type="button"
          className={`min-h-11 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition hover:-translate-y-px hover:bg-app-surface focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${state.activeView === item.view ? 'bg-gradient-to-br from-blue-500/95 to-sky-400/70 text-white shadow-sm' : 'bg-app-surface text-app-text'}`}
          onClick={() => navigate(item.view)}
          aria-current={state.activeView === item.view ? 'page' : undefined}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );

  if (isBooting) {
    return (
      <div className="grid min-h-screen place-items-center bg-app-bg p-5 text-app-text">
        <div className="w-full max-w-3xl rounded-app border border-app-border bg-app-card p-6 shadow-app backdrop-blur sm:p-8">
          <span className="inline-flex items-center rounded-full border border-app-border bg-app-surface px-3 py-1 text-xs font-semibold text-app-text">ScholarPath AdDU</span>
          <h1 className="mt-4 text-2xl font-bold">Preparing your scholarship workspace</h1>
          <p className="mt-2 text-app-muted">Preparing your scholarship workspace…</p>
          <div className="mt-6 grid gap-3">
            <div className="h-[92px] animate-pulse rounded-[18px] bg-app-surface" />
            <div className="h-[92px] animate-pulse rounded-[18px] bg-app-surface" />
            <div className="h-[92px] animate-pulse rounded-[18px] bg-app-surface" />
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
    <div className={`min-h-screen max-w-[100vw] overflow-x-hidden bg-app-bg p-3 text-app-text sm:p-5 ${themeClass}`}>
      {profileOnboarding && (
        <AcademicProfileModal
          fullName={profileOnboarding.fullName}
          initialProgram={profileOnboarding.initialProgram}
          initialStudentNumber={profileOnboarding.initialStudentNumber}
          initialHouseholdIncome={profileOnboarding.initialHouseholdIncome}
          initialQpi={profileOnboarding.initialQpi}
          initialHasActiveGovernmentGrant={profileOnboarding.initialHasActiveGovernmentGrant}
          onSave={saveAcademicProfile}
          isSaving={isSavingProfile}
          errorMessage={profileSaveError}
        />
      )}
      <header className="app-header mb-5 flex min-w-0 items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="inline-flex max-w-full items-center gap-2">
            <img src={logoImage} alt="Ateneo de Davao University logo" className="h-11 w-11 shrink-0 rounded-full border border-white/20 bg-white/10 object-contain p-0.5 sm:h-14 sm:w-14" />
            <div className="truncate text-lg font-extrabold tracking-wide sm:text-xl">ScholarPath AdDU</div>
          </div>
        </div>

        <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-3">
          {state.authUser && (
            <div className="mr-1 inline-flex min-w-0 items-center gap-2" title={`${state.authUser.fullName} · ${roleLabels[state.viewerRole]}`}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ateneo to-sky-400 text-xs font-extrabold text-white" aria-hidden="true">{getInitials(state.authUser.fullName)}</span>
              <span className="hidden min-w-0 max-w-[12rem] leading-tight sm:grid">
                <strong className="truncate">{state.authUser.fullName}</strong>
                <span className="text-xs text-app-muted">{roleLabels[state.viewerRole]}</span>
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
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-app-border bg-app-surface text-app-text transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 lg:hidden"
            onClick={() => setIsMobileNavOpen((open) => !open)}
            aria-label={isMobileNavOpen ? 'Close page navigation' : 'Open page navigation'}
            aria-expanded={isMobileNavOpen}
          >
            {isMobileNavOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          </button>
          <button className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-app-border bg-app-surface px-3 py-2 text-app-text transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20" onClick={logout} aria-label="Logout" title="Logout">
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      {isMobileNavOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close page navigation"
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-[min(21rem,88vw)] overflow-y-auto border-l border-app-border bg-app-card p-5 shadow-2xl lg:hidden" aria-label="Page navigation">
            <div className="mb-5 flex justify-end">
              <button type="button" className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-app-text" onClick={() => setIsMobileNavOpen(false)} aria-label="Close page navigation"><X size={18} /></button>
            </div>
            {renderNavigation()}
          </aside>
        </>
      )}

      <button
        type="button"
        className="fixed bottom-4 left-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-app-border bg-app-surface text-app-text shadow-card transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 sm:bottom-5 sm:left-5"
        onClick={() => updateState((prev) => ({ theme: prev.theme === 'light' ? 'dark' : 'light' }))}
        aria-label={state.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        title={state.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        <span className="theme-toggle-icon" aria-hidden="true">
          {state.theme === 'light' ? <Moon className="icon-moon" size={20} /> : <Sun className="icon-sun" size={20} />}
        </span>
      </button>

      <main className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="sticky top-5 hidden h-fit rounded-app border border-app-border bg-app-card p-5 shadow-app backdrop-blur lg:block">
          <div className="flex items-center gap-4 border-b border-app-border pb-4">
            <div className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-[18px] bg-gradient-to-br from-blue-500/90 to-sky-500/50 text-lg font-extrabold text-white">{currentIdentity.fullName.slice(0, 1)}</div>
            <div className="min-w-0">
              <h2 className="m-0 text-base font-semibold text-app-text">{currentIdentity.fullName}</h2>
              <p className="mt-1 text-sm text-app-muted">{roleLabels[state.viewerRole]} · {currentIdentity.department}</p>
            </div>
          </div>

          {renderNavigation('my-4')}

          <div className="mt-4 grid gap-2">
            <div className="flex items-center justify-between gap-3 rounded-[18px] bg-app-surface p-3">
              <span className="text-xs text-app-muted">Programs</span>
              <strong className="text-lg text-app-text">{stats.totalPrograms}</strong>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-[18px] bg-app-surface p-3">
              <span className="text-xs text-app-muted">Open deadlines</span>
              <strong className="text-lg text-app-text">{activeDeadlineCount}</strong>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-[18px] bg-app-surface p-3">
              <span className="text-xs text-app-muted">Unread alerts</span>
              <strong className="text-lg text-app-text">{stats.unreadNotifications}</strong>
            </div>
          </div>
        </aside>

        <section className="blue-action-view grid min-w-0 gap-5">
          {state.activeView === 'dashboard' && (
            <DashboardViewPage
              profile={currentIdentity}
              isFirstLogin={state.showFirstLoginWelcome}
              stats={stats}
              applications={studentApplications}
              scholarships={scholarshipCatalog}
              customDeadlines={state.customDeadlines}
              eligibleScholarships={eligiblePreview}
              notifications={visibleNotifications}
              announcements={state.announcements}
              onOpenExplorer={() => navigate('explore')}
              onOpenEligibility={() => navigate('eligibility')}
              onSubmitApplication={submitApplication}
              onTrackScholarship={applyToScholarship}
              onMarkRead={markNotificationRead}
              onShowApplications={() => navigate('applications')}
              onOpenCalendar={() => navigate('calendar')}
              hasIncompleteProfile={hasIncompleteStudentProfile}
              onCompleteProfile={openAcademicProfile}
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
              onApply={applyToScholarship}
              onSaveProfile={saveEligibilityProfile}
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
