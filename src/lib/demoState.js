const today = new Date();
const dateFromToday = (days) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const demoUsers = {
  student: {
    id: 'user-student',
    role: 'student',
    fullName: 'Eriel John Espinosa',
    email: 'eriel@student.addu.edu.ph',
    phone: '+63 912 345 6789',
    department: 'BS Information Technology',
    degreeProgram: 'BS Information Technology',
    qpi: 2.86,
    householdIncome: 240000,
    citizenship: 'Filipino',
    isOnPrepaidPlan: false,
    hasSiblingOnAid: false,
    hasOtherActiveScholarship: false,
    hasActiveGovernmentGrant: false,
    academicStanding: 'good',
    applicantType: 'current',
    yearLevel: 2,
    isHonorsGraduate: false,
    honorsRank: '',
    graduatingClassSize: '',
    hsStrand: '',
    hsAverage: '',
    sponsorTies: { gsisMemberDependent: false, afpDependent: false, usVeteranDependent: false },
    bio: 'Undergraduate student looking for scholarship matches and deadline alerts.',
  },
  admin: {
    id: 'user-admin',
    role: 'osa_admin',
    fullName: 'OSA Administrator',
    email: 'osa@addu.edu.ph',
    phone: '+63 917 000 0000',
    department: 'Office of Student Affairs',
    degreeProgram: 'Administration',
    qpi: null,
    householdIncome: null,
    hasActiveGovernmentGrant: false,
    bio: 'Reviews applications, documents, announcements, and analytics.',
  },
  chair: {
    id: 'user-chair',
    role: 'department_chair',
    fullName: 'Department Chair',
    email: 'chair@addu.edu.ph',
    phone: '+63 918 000 0000',
    department: 'BS Computer Science',
    degreeProgram: 'BS Computer Science',
    qpi: null,
    householdIncome: null,
    hasActiveGovernmentGrant: false,
    bio: 'Evaluates GIA recommendations and endorses qualified students.',
  },
};

export const applications = [
  {
    id: 'app-001',
    studentId: 'user-student',
    scholarshipId: 'sch-012',
    scholarshipTitle: 'Grant-in-Aid (GIA)',
    status: 'Under Review',
    documentStatus: 'Verified',
    submittedAt: dateFromToday(-3),
    updatedAt: dateFromToday(-1),
    attachedDocuments: ['doc-001', 'doc-002'],
    notes: 'Awaiting final OSA screening.',
  },
  {
    id: 'app-002',
    studentId: 'user-student',
    scholarshipId: 'sch-048',
    scholarshipTitle: 'DOST-SEI Merit Scholarship Program',
    status: 'Draft',
    documentStatus: 'Pending',
    submittedAt: null,
    updatedAt: dateFromToday(-2),
    attachedDocuments: ['doc-001'],
    notes: 'Profile saved for later submission.',
  },
];

export const documents = [
  {
    id: 'doc-001',
    ownerId: 'user-student',
    title: 'Academic Transcript',
    fileName: 'transcript.pdf',
    documentType: 'Transcript',
    verificationStatus: 'Verified',
    sharedWith: ['Grant-in-Aid (GIA)', 'DOST-SEI Merit Scholarship Program'],
    uploadedAt: dateFromToday(-8),
  },
  {
    id: 'doc-002',
    ownerId: 'user-student',
    title: 'BIR-stamped ITR',
    fileName: 'itr.pdf',
    documentType: 'Income Proof',
    verificationStatus: 'Pending',
    sharedWith: ['Grant-in-Aid (GIA)'],
    uploadedAt: dateFromToday(-4),
  },
  {
    id: 'doc-003',
    ownerId: 'user-student',
    title: 'Certificate of Enrollment',
    fileName: 'coe.pdf',
    documentType: 'Enrollment',
    verificationStatus: 'Verified',
    sharedWith: ['DOST-SEI Merit Scholarship Program'],
    uploadedAt: dateFromToday(-2),
  },
];

export const notifications = [
  {
    id: 'not-001',
    title: 'GIA deadline reminder',
    channel: 'SMS',
    body: 'Your Grant-in-Aid application is due soon. Upload any missing documents now.',
    status: 'Unread',
    createdAt: dateFromToday(-1),
  },
  {
    id: 'not-002',
    title: 'Application status update',
    channel: 'Email',
    body: 'Your Grant-in-Aid application was moved to Under Review by OSA.',
    status: 'Unread',
    createdAt: dateFromToday(-1),
  },
  {
    id: 'not-003',
    title: 'Document verified',
    channel: 'In-app',
    body: 'Your academic transcript has been verified and can be reused across applications.',
    status: 'Read',
    createdAt: dateFromToday(-5),
  },
];

export const announcements = [
  {
    id: 'ann-001',
    title: 'OSA Scholarship Window Open',
    body: 'Students can now search, match, and submit scholarship applications from the centralized dashboard.',
    audience: 'Students',
    createdAt: dateFromToday(-2),
  },
  {
    id: 'ann-002',
    title: 'Document Review Queue Updated',
    body: 'Admin reviewers should clear pending proof-of-income documents before application finalization.',
    audience: 'OSA Admin',
    createdAt: dateFromToday(-1),
  },
];

export const departmentReviews = [
  {
    id: 'rev-001',
    applicationId: 'app-001',
    studentName: 'Maria Clara Santos',
    department: 'BS Computer Science',
    qpi: 3.12,
    householdIncome: 210000,
    status: 'For Endorsement',
    recommendation: 'Qualified for GIA.',
  },
  {
    id: 'rev-002',
    applicationId: 'app-002',
    studentName: 'John Paul Dizon',
    department: 'BS Information Technology',
    qpi: 2.84,
    householdIncome: 280000,
    status: 'Pending Documents',
    recommendation: 'Awaiting verified ITR before endorsement.',
  },
  {
    id: 'rev-003',
    applicationId: 'app-001',
    studentName: 'Eleanor Cruz',
    department: 'BS Computer Science',
    qpi: 3.45,
    householdIncome: 180000,
    status: 'Endorsed',
    recommendation: 'Submitted to OSA for final approval.',
  },
];