export const fmtCurrency = (value) => `₱${Number(value || 0).toLocaleString()}`;
export const fmtDate = (value) => new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
export const toPercent = (value) => `${Math.max(0, Math.min(100, Math.round(value)))}%`;
