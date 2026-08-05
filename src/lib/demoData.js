const today = new Date();
const dateFromToday = (days) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const getNextForm230Deadline = (from = today) => {
  const year = from.getFullYear();
  const lastFridayOf = (y, monthIndex) => {
    const lastDayOfMonth = new Date(y, monthIndex + 1, 0);
    const offsetToFriday = (lastDayOfMonth.getDay() - 5 + 7) % 7;
    lastDayOfMonth.setDate(lastDayOfMonth.getDate() - offsetToFriday);
    return lastDayOfMonth;
  };
  const candidates = [lastFridayOf(year, 3), lastFridayOf(year, 9), lastFridayOf(year + 1, 3)];
  const next = candidates.find((date) => date.getTime() >= from.getTime()) ?? candidates[candidates.length - 1];
  return next.toISOString().slice(0, 10);
};

const FORM_230_DEADLINE = getNextForm230Deadline();

export const degreePrograms = [
  'BS Computer Science',
  'BS Information Technology',
  'BS Business Administration',
  'BS Accountancy',
  'BS Psychology',
  'BS Civil Engineering',
  'BS Nursing',
  'BA Communication',
  'BS Biology',
  'BS Education',
  'BS Architecture',
  'BS Business Management',
  'BS Management Accounting',
];

const FORM_230_COVERAGE = 'Form 230-SCH general pool \u2014 judged by the College Scholarship Committee on need, academic standing, and service. Category A\u2013F award: \u20b15,000\u2013\u20b115,000 partial grant or full tuition. Confirm tier with OSA; no fund-specific criteria are separately published.';

const buildGeneralPoolEntry = (appendixNumber, title, category, origin) => ({
  appendixNumber,
  title,
  category,
  ruleFamily: 'general-pool',
  origin,
  applicationRoute: 'AdDU general process (Form 230-SCH)',
  isExternal: false,
  isMatchable: true,
  coverageType: 'Partial Tuition',
  coverage: FORM_230_COVERAGE,
  minimumQpi: 2.5,
  maximumIncome: 250000,
  eligibleDegrees: ['ALL'],
  allowsMultipleGrants: false,
  departmentScope: 'All departments (excluding BS Nursing and BS Architecture)',
  deadline: FORM_230_DEADLINE,
  isActive: true,
  tags: ['form-230', 'general-pool', category === 'Corporate & External' ? 'donor-funded' : 'endowment'],
});

const internalEndowmentFunds = [
  { n: 1, title: 'Antonio A. Villanueva Endowment Fund' },
  { n: 2, title: 'Ateneo Alumni Association of Canada' },
  { n: 3, title: 'Ateneo Alumni Association of Southern California' },
  { n: 4, title: 'Alfonso Frances Marie Ybanez' },
  { n: 5, title: 'Arts and Sciences Fund' },
  { n: 6, title: 'Rev. Fr. John Dotterweich SJ Scholarship Fund' },
  { n: 7, title: 'Rev. Fr. Rodolfo Malasmas SJ Scholarship Fund' },
  { n: 8, title: 'Bank of Philippine Islands (BPI) Foundation' },
  { n: 9, title: 'De La Paz Scholarship Fund' },
  { n: 10, title: 'Davao Jesuit Memorial Scholarship Fund' },
  { n: 11, title: 'Rev. Fr. Edmundo M. Martinez, SJ Endowment Fund' },
  { n: 13, title: 'Kalasag Scholarship Fund' },
  { n: 15, title: 'Montemayor Scholarship Fund' },
  { n: 16, title: 'St. Aloysius Gonzaga Scholarship Fund' },
  { n: 17, title: 'Sycip, Gorres, Velayo (SGV) and Company' },
  { n: 18, title: 'St. John Berchman Scholarship' },
  { n: 19, title: 'Vicente L. Babao Scholarship Foundation' },
  { n: 20, title: 'Jose & Avelina Buktaw Scholarship' },
  { n: 21, title: 'Rogelio Alama Scholarship' },
  { n: 22, title: 'SC Johnson and Son, Inc. Scholarship Grant' },
];

const corporateExternalFunds = [
  { n: 24, title: 'Alfonso Yuchenco (AY) Foundation, Inc.' },
  { n: 25, title: 'Antonio O. Floirendo Sr., Foundation, Inc.' },
  { n: 26, title: 'Archimedes and Samad Lu Foundation Scholarship Grant' },
  { n: 27, title: 'Ateneo Alumni Association of British Columbia' },
  { n: 28, title: 'Ben and Quennie Balaba Scholarship Grant' },
  { n: 29, title: 'Carmudi Philippines Scholarship Program' },
  { n: 30, title: 'Equitable PCIBank Foundation' },
  { n: 31, title: 'EMCOR, Inc.' },
  { n: 32, title: 'Jesus V. del Rosario (JVR) Foundation Scholarship' },
  { n: 33, title: 'Jollibee Foundation, Inc.' },
  { n: 34, title: 'Metrobank Foundation Scholarship Fund' },
  { n: 35, title: 'Nelly Kellog Van Shaik (NKVS) Scholarship' },
  { n: 36, title: 'PAGCOR Scholarship Fund' },
  { n: 37, title: 'Shoemart (SM) Foundation, Inc.' },
  { n: 38, title: 'Vicente B. Bello Scholarship' },
  { n: 39, title: 'Tanging Yaman Foundation' },
  { n: 40, title: 'Davao Light / Aboitiz Foundation (MICD Scholarship)' },
];

const internalEndowmentEntries = internalEndowmentFunds.map(({ n, title }) =>
  buildGeneralPoolEntry(n, title, 'Internal Endowment', 'AdDU Office of Student Affairs (donor-endowed fund)'));

const corporateExternalEntries = corporateExternalFunds.map(({ n, title }) =>
  buildGeneralPoolEntry(n, title, 'Corporate & External', title));

const giaEntry = {
  appendixNumber: 12,
  title: 'Grant-in-Aid (GIA)',
  category: 'Internal Endowment',
  ruleFamily: 'general-pool',
  origin: 'AdDU Office of Student Affairs',
  applicationRoute: 'Separate online application (own GIA portal, per level)',
  isExternal: false,
  isMatchable: true,
  coverageType: 'Full Tuition',
  coverage: 'Online GIA application (separate NEW vs. RENEWAL links). Tuition and partial allowance support for economically qualified students; not available to students covered by AdDU Employee Other Benefits (EOB).',
  minimumQpi: 2.5,
  maximumIncome: 250000,
  eligibleDegrees: ['ALL'],
  allowsMultipleGrants: false,
  departmentScope: 'All departments',
  deadline: FORM_230_DEADLINE,
  isActive: true,
  tags: ['gia', 'general-pool', 'priority'],
};

const jubileeHonorsEntry = {
  appendixNumber: 14,
  title: 'Jubilee Scholarship Fund (Valedictorian & Salutatorian)',
  category: 'Internal Endowment',
  ruleFamily: 'honors',
  origin: 'AdDU Office of Student Affairs',
  applicationRoute: 'Form 230-SCH general process + separate Valedictorian/Salutatorian track',
  isExternal: false,
  isMatchable: true,
  coverageType: 'Full Tuition',
  coverage: 'Valedictorian: 100% tuition, renewable 4 years. Salutatorian: 50% tuition. Requires official standing from a graduating class of 80+ students, entering as an AdDU first-year student.',
  minimumQpi: null,
  maximumIncome: null,
  eligibleDegrees: ['ALL'],
  allowsMultipleGrants: false,
  departmentScope: 'All departments',
  deadline: FORM_230_DEADLINE,
  isActive: true,
  tags: ['honors', 'first-year-only'],
};

const a1Entry = {
  appendixNumber: 23,
  title: 'A-1 Scholarship Program (Micro-Philanthropy)',
  category: 'Internal Endowment',
  ruleFamily: 'excluded',
  origin: 'AdDU Alumni & Donor Network',
  applicationRoute: 'Donor/alumni giving program \u2014 not a student application',
  isExternal: false,
  isMatchable: false,
  coverageType: 'Partial Tuition',
  coverage: 'Alumni pledge a recurring donation pooled to fund the general scholarship pool. Students cannot apply to A-1 directly.',
  minimumQpi: null,
  maximumIncome: null,
  eligibleDegrees: ['ALL'],
  allowsMultipleGrants: false,
  departmentScope: 'Not applicable',
  deadline: null,
  isActive: true,
  tags: ['donor-program', 'not-student-facing'],
};

const saProgramEntry = {
  appendixNumber: 54,
  title: 'Student Assistant (SA) Program',
  category: 'Specialized Service',
  ruleFamily: 'work-study',
  origin: 'AdDU Office of Student Affairs',
  applicationRoute: 'Separate AdDU application via the Office of Student Affairs',
  isExternal: false,
  isMatchable: true,
  coverageType: 'Allowance',
  coverage: 'Work-for-tuition arrangement for evening-program students. Minimum 6.5 hours of service per day, at least 22 days per month.',
  minimumQpi: null,
  maximumIncome: null,
  eligibleDegrees: ['BS Business Management', 'BS Management Accounting'],
  allowsMultipleGrants: true,
  departmentScope: 'BS Business Management, BS Management Accounting (evening programs)',
  deadline: dateFromToday(90),
  isActive: true,
  tags: ['work-study', 'rolling-basis'],
};

const governmentLinkedEntries = [
  { n: 41, title: 'CHED-Regional Scholarship Program', govProgram: 'CHED_REGIONAL', coverage: 'Apply directly with CHEDRO XI for Davao; AdDU only certifies enrollment.' },
  { n: 42, title: 'CHED-National Scholarship Program', govProgram: 'CHED_NATIONAL', coverage: 'Apply directly with CHEDRO XI for Davao; AdDU only certifies enrollment.' },
  { n: 43, title: 'CHED-CSSG (Special Study Grant)', govProgram: 'CHED_CSSG', coverage: 'Apply directly with CHEDRO XI for Davao; AdDU only certifies enrollment.' },
  { n: 44, title: 'Private Education Student Financial Assistance Program (PESFA)', govProgram: 'CHED_PESFA', coverage: 'For students at a private HEI. Apply via CHEDRO XI online portal; parental income generally must not exceed \u20b1400,000\u2013\u20b1500,000.' },
  { n: 45, title: 'State Scholarship Program (SSP)', govProgram: 'CHED_SSP', coverage: 'Reserved for SUC/LUC students \u2014 does not apply to AdDU.' },
  { n: 46, title: 'National Integration Study Grant Program (NISGP)', govProgram: 'CHED_NISGP', coverage: 'CHED-administered; confirm current availability directly with CHEDRO XI.' },
  { n: 47, title: 'Selected Ethnic Group Educational Assistance Program (SEGEAP)', govProgram: 'CHED_SEGEAP', coverage: 'CHED-administered; confirm current availability directly with CHEDRO XI.' },
  { n: 48, title: 'DOST-SEI Merit Scholarship Program', govProgram: 'DOST_MERIT', coverage: 'For incoming freshmen only. STEM-strand graduates or non-STEM top 5% may apply via the DOST-SEI E-Application System.' },
  { n: 49, title: 'DOST RA7687 Science and Technology Scholarship', govProgram: 'DOST_RA7687', coverage: 'Same freshman-only, STEM-strand gate as the DOST-SEI Merit Scholarship. Apply via DOST-SEI E-Application System.' },
  { n: 50, title: 'DOST Junior Level Assistance Program (JLAP)', govProgram: 'DOST_JLAP', coverage: 'For continuing (2nd year+) students. Opens periodically as JLSS \u2014 confirm current openings with DOST-SEI.' },
  { n: 51, title: 'Government Service Insurance System (GSIS) Scholarship Fund', govProgram: 'GSIS', coverage: 'For dependents of active GSIS members. Bundles GSP, GESP, and GSSP sub-programs. Apply directly via GSIS.' },
  { n: 52, title: 'AFP Educational Benefit System Office (AFPEBSO)', govProgram: 'AFPEBSO', coverage: 'For dependents of AFP/CAA personnel. Apply directly with AFPEBSO or the nearest AFP unit.' },
  { n: 53, title: 'US Department of Veterans Affairs Education Benefits', govProgram: 'US_VA', coverage: 'For qualifying dependents of US veterans. Apply directly via va.gov.' },
].map((entry) => ({
  appendixNumber: entry.n,
  title: entry.title,
  govProgram: entry.govProgram,
  category: 'State-Sponsored',
  ruleFamily: 'government-linked',
  origin: entry.govProgram.startsWith('CHED') ? 'Commission on Higher Education'
    : entry.govProgram.startsWith('DOST') ? 'Department of Science and Technology'
    : entry.govProgram === 'GSIS' ? 'Government Service Insurance System'
    : entry.govProgram === 'AFPEBSO' ? 'AFP Educational Benefit System Office'
    : 'US Department of Veterans Affairs',
  applicationRoute: entry.govProgram.startsWith('CHED') ? 'External \u2014 apply via CHEDRO XI'
    : entry.govProgram.startsWith('DOST') ? 'External \u2014 apply via DOST-SEI E-Application System'
    : entry.govProgram === 'GSIS' ? 'External \u2014 member-nominated, apply via GSIS'
    : entry.govProgram === 'AFPEBSO' ? 'External \u2014 apply via AFPEBSO or nearest AFP unit'
    : 'External \u2014 apply via US Department of Veterans Affairs',
  isExternal: true,
  isMatchable: true,
  coverageType: 'Full Tuition',
  coverage: entry.coverage,
  minimumQpi: null,
  maximumIncome: null,
  eligibleDegrees: ['ALL'],
  allowsMultipleGrants: true,
  departmentScope: 'All departments',
  deadline: null,
  isActive: true,
  tags: ['government', entry.govProgram === 'US_VA' ? 'us-va' : entry.govProgram.split('_')[0].toLowerCase()],
}));

const orderedScholarships = [
  ...internalEndowmentEntries,
  giaEntry,
  jubileeHonorsEntry,
  ...corporateExternalEntries,
  a1Entry,
  ...governmentLinkedEntries,
  saProgramEntry,
].sort((a, b) => a.appendixNumber - b.appendixNumber);

export const scholarships = orderedScholarships.map((scholarship, index) => ({
  id: `sch-${String(index + 1).padStart(3, '0')}`,
  ...scholarship,
}));

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

const scholarshipByTitle = Object.fromEntries(scholarships.map((s) => [s.title, s]));

export const applications = [
  {
    id: 'app-001',
    studentId: 'user-student',
    scholarshipId: scholarshipByTitle['Grant-in-Aid (GIA)']?.id ?? 'sch-012',
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
    scholarshipId: scholarshipByTitle['DOST-SEI Merit Scholarship Program']?.id ?? 'sch-048',
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
