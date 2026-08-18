import { hasSupabaseConfig, supabase } from './supabaseClient';

const toScholarship = (row) => ({
  ...row,
  minimumQpi: row.minimum_qpi,
  maximumIncome: row.maximum_income,
  eligibleDegrees: row.eligible_degrees || [],
  allowsMultipleGrants: row.allows_multiple_grants,
  departmentScope: row.department_scope,
  isActive: row.is_active,
  coverageType: row.coverage_type,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  ruleFamily: row.rule_family,
  govProgram: row.gov_program,
  isMatchable: row.is_matchable,
  applicationRoute: row.application_route,
  isExternal: row.is_external,
  appendixNumber: row.appendix_number,
});

const toDocument = (row) => ({
  ...row,
  ownerId: row.owner_id,
  fileName: row.file_name,
  documentType: row.document_type,
  verificationStatus: row.verification_status,
  storagePath: row.storage_path,
  sharedWith: row.shared_with || [],
  uploadedAt: row.uploaded_at,
});

const toApplication = (row, scholarshipById, documentIdsByApplication) => ({
  ...row,
  studentId: row.student_id,
  scholarshipId: row.scholarship_id,
  scholarshipTitle: scholarshipById[row.scholarship_id]?.title || 'Scholarship application',
  documentStatus: row.document_status,
  submittedAt: row.submitted_at,
  updatedAt: row.updated_at,
  attachedDocuments: documentIdsByApplication[row.id] || [],
});

const toAcademicProgram = (row) => ({
  id: row.id,
  value: row.value,
  label: row.label,
  department: row.department,
  category: row.category,
});

const toAnnouncement = (row) => ({ ...row, createdAt: row.created_at });
const toNotification = (row) => ({ ...row, profileId: row.profile_id, createdAt: row.created_at });
const toDepartmentReview = (row) => ({
  ...row,
  applicationId: row.application_id,
  studentName: row.student_name,
  householdIncome: row.household_income,
  createdAt: row.created_at,
});

const ensureReady = () => hasSupabaseConfig && supabase;

export const loadSupabaseWorkspace = async ({ role, userId, department }) => {
  if (!ensureReady()) return { success: false, fallback: true };

  const [scholarshipsResult, applicationsResult, documentsResult, announcementsResult, notificationsResult, reviewsResult] = await Promise.all([
    supabase.from('scholarships').select('*').order('deadline', { ascending: true }),
    supabase.from('applications').select('*').order('updated_at', { ascending: false }),
    supabase.from('documents').select('*').order('uploaded_at', { ascending: false }),
    supabase.from('announcements').select('*').order('created_at', { ascending: false }),
    supabase.from('notifications').select('*').eq('profile_id', userId).order('created_at', { ascending: false }),
    role === 'department_chair'
      ? supabase.from('department_reviews').select('*').eq('department', department).order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);
  const failed = [scholarshipsResult, applicationsResult, documentsResult, announcementsResult, notificationsResult, reviewsResult].find((result) => result.error);
  if (failed) return { success: false, fallback: false, message: failed.error.message };

  const scholarships = (scholarshipsResult.data || []).map(toScholarship);
  const scholarshipById = Object.fromEntries(scholarships.map((entry) => [entry.id, entry]));
  const documents = (documentsResult.data || []).map(toDocument);
  const documentIdsByApplication = {};
  const applicationIds = (applicationsResult.data || []).map((entry) => entry.id);
  if (applicationIds.length) {
    const linksResult = await supabase.from('application_documents').select('application_id, document_id').in('application_id', applicationIds);
    if (linksResult.error) return { success: false, fallback: false, message: linksResult.error.message };
    (linksResult.data || []).forEach((link) => {
      documentIdsByApplication[link.application_id] = [...(documentIdsByApplication[link.application_id] || []), link.document_id];
    });
  }

  return {
    success: true,
    fallback: false,
    scholarships,
    applications: (applicationsResult.data || []).map((entry) => toApplication(entry, scholarshipById, documentIdsByApplication)),
    documents,
    announcements: (announcementsResult.data || []).map(toAnnouncement),
    notifications: (notificationsResult.data || []).map(toNotification),
    departmentReviews: (reviewsResult.data || []).map(toDepartmentReview),
  };
};

export const loadSupabaseAcademicPrograms = async () => {
  if (!ensureReady()) return { success: false, fallback: true };

  const result = await supabase.from('academic_programs').select('*').order('sort_order', { ascending: true });
  if (result.error) return { success: false, fallback: false, message: result.error.message };

  return {
    success: true,
    fallback: false,
    academicPrograms: (result.data || []).map(toAcademicProgram),
  };
};

export const updateSupabaseApplicationStatus = (applicationId, status) => (
  ensureReady() ? supabase.from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', applicationId) : Promise.resolve({ error: null })
);

export const createSupabaseApplication = async ({ studentId, scholarshipId, documentStatus, attachedDocuments, notes }) => {
  if (!ensureReady()) return { data: null, error: null };
  const result = await supabase.from('applications').insert({ student_id: studentId, scholarship_id: scholarshipId, document_status: documentStatus, notes }).select().single();
  if (result.error || !result.data || !attachedDocuments?.length) return result;
  const links = await supabase.from('application_documents').insert(attachedDocuments.map((documentId) => ({ application_id: result.data.id, document_id: documentId })));
  return links.error ? { data: null, error: links.error } : result;
};

export const submitSupabaseApplication = (applicationId) => (
  ensureReady()
    ? supabase.from('applications').update({ status: 'Submitted', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', applicationId)
    : Promise.resolve({ error: null })
);

export const createSupabaseDocument = ({ ownerId, title, fileName, documentType }) => (
  ensureReady()
    ? supabase.from('documents').insert({ owner_id: ownerId, title, file_name: fileName, document_type: documentType }).select().single()
    : Promise.resolve({ data: null, error: null })
);

export const deleteSupabaseDocument = (documentId) => (
  ensureReady() ? supabase.from('documents').delete().eq('id', documentId) : Promise.resolve({ error: null })
);

export const updateSupabaseDocumentStatus = (documentId, verificationStatus) => (
  ensureReady() ? supabase.from('documents').update({ verification_status: verificationStatus }).eq('id', documentId) : Promise.resolve({ error: null })
);

export const createSupabaseAnnouncement = ({ title, body, audience, createdBy }) => (
  ensureReady() ? supabase.from('announcements').insert({ title, body, audience, created_by: createdBy }).select().single() : Promise.resolve({ data: null, error: null })
);

export const markSupabaseNotificationRead = (notificationId) => (
  ensureReady() ? supabase.from('notifications').update({ status: 'Read' }).eq('id', notificationId) : Promise.resolve({ error: null })
);