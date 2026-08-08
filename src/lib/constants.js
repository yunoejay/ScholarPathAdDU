export const coverageTypes = ['all', 'Full Tuition', 'Partial Tuition', 'Allowance'];
export const applicationStatuses = ['Draft', 'Submitted', 'Under Review', 'For Verification', 'Approved', 'Rejected'];
export const verificationStatuses = ['Pending', 'Verified', 'Rejected'];

export const documentTypeOptions = [
  { value: 'Income Proof', label: 'Income Doc' },
  { value: 'Transcript', label: 'Transcript' },
  { value: 'Enrollment', label: 'Enrollment' },
  { value: 'Clearance', label: 'Clearance' },
  { value: 'Government ID', label: 'Government ID' },
  { value: 'Recommendation Letter', label: 'Recommendation' },
  { value: 'Supporting Document', label: 'Supporting Doc' },
];

export const getDocumentTypeLabel = (value) => (
  documentTypeOptions.find((option) => option.value === value)?.label || value
);

export const citizenshipOptions = ['Filipino', 'Non-Filipino'];

export const applicantTypeOptions = [
  { value: 'first-year', label: 'Incoming first-year' },
  { value: 'transfer', label: 'Transfer student' },
  { value: 'current', label: 'Current AdDU student' },
];

export const honorsRankOptions = [
  { value: '', label: 'Not applicable' },
  { value: 'valedictorian', label: 'Valedictorian' },
  { value: 'salutatorian', label: 'Salutatorian' },
];

export const hsStrandOptions = [
  { value: '', label: 'Select strand' },
  { value: 'STEM', label: 'STEM' },
  { value: 'Non-STEM', label: 'Non-STEM (ABM, HUMSS, GAS, TVL, etc.)' },
];
