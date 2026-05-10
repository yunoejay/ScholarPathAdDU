const DEGREE_FALLBACK = 'ALL';

const toNumber = (value) => Number(String(value ?? '').replace(/[^\d.-]/g, '')) || 0;
const toDate = (value) => new Date(value);
const daysBetween = (dateA, dateB) => Math.round((dateB.getTime() - dateA.getTime()) / 86400000);

export const getDeadlineStatus = (deadline, today = new Date()) => {
  const due = toDate(deadline);
  const remainingDays = daysBetween(today, due);

  if (Number.isNaN(due.getTime())) {
    return { label: 'Unknown', tone: 'neutral', remainingDays: null };
  }

  if (remainingDays < 0) return { label: 'Closed', tone: 'danger', remainingDays };
  if (remainingDays <= 3) return { label: 'Urgent', tone: 'warning', remainingDays };
  if (remainingDays <= 14) return { label: 'Active', tone: 'success', remainingDays };
  return { label: 'Upcoming', tone: 'info', remainingDays };
};

export const getScholarshipFit = (profile, scholarship) => {
  const qpiMargin = Number(profile.qpi) - Number(scholarship.minimumQpi);
  const incomeMargin = Number(scholarship.maximumIncome) - Number(profile.householdIncome);
  const normalizedIncome = incomeMargin / 10000;
  return Number(((qpiMargin * 0.5) + (normalizedIncome * 0.5)).toFixed(2));
};

export const evaluateScholarship = (profile, scholarship) => {
  const reasons = [];
  const qpi = Number(profile.qpi);
  const income = Number(profile.householdIncome);
  const degree = profile.degreeProgram;
  const activeGovGrant = Boolean(profile.hasActiveGovernmentGrant);
  const deadlineStatus = getDeadlineStatus(scholarship.deadline);

  if (!scholarship.isActive || deadlineStatus.label === 'Closed') {
    reasons.push('Inactive or past deadline');
  }

  if (qpi < Number(scholarship.minimumQpi)) {
    reasons.push(`Needs QPI ${scholarship.minimumQpi}+`);
  }

  if (income > Number(scholarship.maximumIncome)) {
    reasons.push(`Income must be at or below ₱${Number(scholarship.maximumIncome).toLocaleString()}`);
  }

  const eligibleDegrees = scholarship.eligibleDegrees || [DEGREE_FALLBACK];
  const degreeAllowed = eligibleDegrees.includes(DEGREE_FALLBACK) || eligibleDegrees.includes(degree);
  if (!degreeAllowed) {
    reasons.push('Degree program not covered');
  }

  if (activeGovGrant && scholarship.allowsMultipleGrants === false) {
    reasons.push('Blocked by exclusion hierarchy');
  }

  const eligible = reasons.length === 0;
  return {
    eligible,
    reasons,
    fitScore: eligible ? getScholarshipFit(profile, scholarship) : null,
    deadlineStatus,
  };
};

export const searchScholarships = (scholarships, query, filters = {}) => {
  const normalizedQuery = query.trim().toLowerCase();
  const activeToday = new Date();

  return scholarships.filter((scholarship) => {
    const deadlineStatus = getDeadlineStatus(scholarship.deadline, activeToday);
    const haystack = [
      scholarship.title,
      scholarship.category,
      scholarship.origin,
      scholarship.description,
      scholarship.coverage,
      scholarship.departmentScope,
      scholarship.tags.join(' '),
    ]
      .join(' ')
      .toLowerCase();

    const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
    const matchesCategory = !filters.category || filters.category === 'all' || scholarship.category === filters.category;
    const matchesCoverage = !filters.coverage || filters.coverage === 'all' || scholarship.coverageType === filters.coverage;
    const matchesDeadline = !filters.deadline || filters.deadline === 'all'
      || (filters.deadline === 'open' && deadlineStatus.tone !== 'danger')
      || (filters.deadline === 'urgent' && deadlineStatus.tone === 'warning')
      || (filters.deadline === 'closed' && deadlineStatus.tone === 'danger');
    const matchesActive = filters.activeOnly ? scholarship.isActive && deadlineStatus.tone !== 'danger' : true;

    return matchesQuery && matchesCategory && matchesCoverage && matchesDeadline && matchesActive;
  });
};

export const rankScholarships = (profile, scholarships) => {
  return scholarships
    .map((scholarship) => {
      const evaluation = evaluateScholarship(profile, scholarship);
      return {
        ...scholarship,
        ...evaluation,
      };
    })
    .filter((grant) => grant.eligible)
    .sort((a, b) => {
      const aDeadline = new Date(a.deadline).getTime();
      const bDeadline = new Date(b.deadline).getTime();
      if (aDeadline !== bDeadline) return aDeadline - bDeadline;
      return (b.fitScore ?? 0) - (a.fitScore ?? 0);
    });
};

export const getApplicationProgress = (status) => {
  switch (status) {
    case 'Draft':
      return 15;
    case 'Submitted':
      return 35;
    case 'Under Review':
      return 60;
    case 'For Verification':
      return 75;
    case 'Approved':
      return 100;
    case 'Rejected':
      return 100;
    default:
      return 0;
  }
};
