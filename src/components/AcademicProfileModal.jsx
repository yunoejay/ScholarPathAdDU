import { useEffect, useState } from 'react';
import { academicPrograms, getAcademicProgram } from '../lib/academicPrograms';
import logoImage from '../../pictures/logo.png';

export default function AcademicProfileModal({ fullName, initialProgram, initialStudentNumber, initialHouseholdIncome, initialQpi, initialHasActiveGovernmentGrant, onSave, isSaving, errorMessage }) {
  const [program, setProgram] = useState(initialProgram || '');
  const [studentNumber, setStudentNumber] = useState(initialStudentNumber || '');
  const [householdIncome, setHouseholdIncome] = useState(initialHouseholdIncome ?? '');
  const [qpi, setQpi] = useState(initialQpi ?? '');
  const [hasActiveGovernmentGrant, setHasActiveGovernmentGrant] = useState(Boolean(initialHasActiveGovernmentGrant));
  const [validationError, setValidationError] = useState('');
  const selectedProgram = getAcademicProgram(program || academicPrograms[0].value);

  useEffect(() => {
    setProgram(initialProgram || '');
    setStudentNumber(initialStudentNumber || '');
    setHouseholdIncome(initialHouseholdIncome ?? '');
    setQpi(initialQpi ?? '');
    setHasActiveGovernmentGrant(Boolean(initialHasActiveGovernmentGrant));
  }, [initialProgram, initialStudentNumber, initialHouseholdIncome, initialQpi, initialHasActiveGovernmentGrant]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalizedStudentNumber = studentNumber.trim();
    if (!program) return;
    if (!/^\d{4,12}$/.test(normalizedStudentNumber)) {
      setValidationError('Enter your AdDU student number using 4–12 digits.');
      return;
    }

    const normalizedIncome = Number(householdIncome);
    if (!Number.isFinite(normalizedIncome) || normalizedIncome < 0) {
      setValidationError('Enter a valid annual household income in Philippine pesos.');
      return;
    }

    const normalizedQpi = Number(qpi);
    if (!Number.isFinite(normalizedQpi) || normalizedQpi < 0 || normalizedQpi > 4) {
      setValidationError('Enter your annual QPI from 0.00 to 4.00.');
      return;
    }

    setValidationError('');
    onSave(selectedProgram, normalizedStudentNumber, Math.round(normalizedIncome), Math.round(normalizedQpi * 100) / 100, hasActiveGovernmentGrant);
  };

  return (
    <div className="modal-overlay academic-profile-overlay" role="presentation">
      <section className="modal-card card academic-profile-modal" role="dialog" aria-modal="true" aria-labelledby="academic-profile-title">
        <div className="academic-profile-topline">
          <div className="academic-profile-icon">
            <img src={logoImage} alt="Ateneo de Davao University logo" />
          </div>
          <span className="eyebrow">AdDU student verification</span>
        </div>
        <h2 id="academic-profile-title">Which program are you taking?</h2>
        <p className="modal-subtitle">
          Welcome{fullName ? `, ${fullName.split(' ')[0]}` : ''}! Add your academic details so ScholarPath can verify your AdDU enrollment and show relevant scholarships.
        </p>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            <span>AdDU student number</span>
            <input value={studentNumber} onChange={(event) => { setStudentNumber(event.target.value.replace(/\D/g, '').slice(0, 12)); setValidationError(''); }} inputMode="numeric" autoComplete="off" placeholder="Enter Student ID No. (7 digits, alphanumeric)" required />
            <small className="field-hint">Use the number shown on your AdDU ID or registration record.</small>
          </label>
          <label>
            <span>Program / Course</span>
            <select value={program} onChange={(event) => setProgram(event.target.value)} required>
              <option value="" disabled>Select your program</option>
              {academicPrograms.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span>Annual household income</span>
            <input value={householdIncome} onChange={(event) => { setHouseholdIncome(event.target.value.replace(/[^\d]/g, '')); setValidationError(''); }} inputMode="numeric" autoComplete="off" placeholder="e.g. 240000" required />
            <small className="field-hint">Combined household income for one year, in Philippine pesos.</small>
          </label>
          <label>
            <span>Annual QPI</span>
            <input value={qpi} onChange={(event) => { setQpi(event.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')); setValidationError(''); }} inputMode="decimal" autoComplete="off" placeholder="e.g. 3.25" min="0" max="4" step="0.01" required />
            <small className="field-hint">Use your latest annual QPI on the AdDU 0.00–4.00 scale.</small>
          </label>
          <label className="toggle-chip inline academic-profile-grant-toggle">
            <input type="checkbox" checked={hasActiveGovernmentGrant} onChange={(event) => setHasActiveGovernmentGrant(event.target.checked)} />
            <span>I currently have an active government grant</span>
          </label>
          <small className="field-hint academic-profile-grant-hint">This helps exclude scholarships that cannot be combined with another government grant.</small>
          {program && (
            <div className="academic-department-preview">
              <span>School / Department</span>
              <strong>{selectedProgram.department}</strong>
            </div>
          )}
          {(validationError || errorMessage) && <div className="feedback-banner feedback-banner--error">{validationError || errorMessage}</div>}
          <button className="primary-btn full-width" type="submit" disabled={!program || !studentNumber || householdIncome === '' || qpi === '' || isSaving}>
            {isSaving ? 'Saving profile…' : 'Continue to ScholarPath'}
          </button>
        </form>
      </section>
    </div>
  );
}
