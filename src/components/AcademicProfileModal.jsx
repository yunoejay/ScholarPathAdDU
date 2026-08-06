import { useEffect, useState } from 'react';
import { academicPrograms, getAcademicProgram } from '../lib/academicPrograms';
import logoImage from '../../pictures/logo.png';
import { Button, FormField, ModalShell } from './ui';

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
    <ModalShell title="" onClose={undefined} aria-labelledby="academic-profile-title" overlayClassName="academic-profile-overlay" className="w-full max-w-[540px]">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-control border border-blue-500/20 bg-app-surface p-1 shadow-card">
            <img className="h-full w-full object-contain" src={logoImage} alt="Ateneo de Davao University logo" />
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-app-primary">AdDU student verification</span>
        </div>
        <h2 id="academic-profile-title" className="m-0 text-[clamp(1.55rem,4vw,2rem)] font-bold tracking-tight text-app-text">Which program are you taking?</h2>
        <p className="mt-2 text-sm leading-relaxed text-app-muted">
          Welcome{fullName ? `, ${fullName.split(' ')[0]}` : ''}! Add your academic details so ScholarPath can verify your AdDU enrollment and show relevant scholarships.
        </p>
        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <FormField label="AdDU student number" hint="Use the number shown on your AdDU ID or registration record.">
            <input className="min-h-12 rounded-control" value={studentNumber} onChange={(event) => { setStudentNumber(event.target.value.replace(/\D/g, '').slice(0, 12)); setValidationError(''); }} inputMode="numeric" autoComplete="off" placeholder="Enter Student ID No. (7 digits, alphanumeric)" required />
          </FormField>
          <FormField label="Program / Course">
            <select className="min-h-12 rounded-control" value={program} onChange={(event) => setProgram(event.target.value)} required>
              <option value="" disabled>Select your program</option>
              {academicPrograms.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </FormField>
          <FormField label="Annual household income" hint="Combined household income for one year, in Philippine pesos.">
            <input className="min-h-12 rounded-control" value={householdIncome} onChange={(event) => { setHouseholdIncome(event.target.value.replace(/[^\d]/g, '')); setValidationError(''); }} inputMode="numeric" autoComplete="off" placeholder="e.g. 240000" required />
          </FormField>
          <FormField label="Annual QPI" hint="Use your latest annual QPI on the AdDU 0.00–4.00 scale.">
            <input className="min-h-12 rounded-control" value={qpi} onChange={(event) => { setQpi(event.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')); setValidationError(''); }} inputMode="decimal" autoComplete="off" placeholder="e.g. 3.25" min="0" max="4" step="0.01" required />
          </FormField>
          <label className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-app-border bg-app-surface p-3 text-sm text-app-text">
            <input className="h-4 w-4 shrink-0 accent-[var(--primary)]" type="checkbox" checked={hasActiveGovernmentGrant} onChange={(event) => setHasActiveGovernmentGrant(event.target.checked)} />
            <span className="min-w-0 flex-1 leading-relaxed">I currently have an active government grant</span>
          </label>
          <small className="-mt-2 block text-xs leading-relaxed text-app-muted">This helps exclude scholarships that cannot be combined with another government grant.</small>
          {program && (
            <div className="rounded-control border border-blue-500/20 bg-blue-500/5 px-4 py-3">
              <span className="mb-1 block text-xs uppercase tracking-[0.08em] text-app-muted">School / Department</span>
              <strong className="text-app-primary">{selectedProgram.department}</strong>
            </div>
          )}
          {(validationError || errorMessage) && <div className="w-full rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-3 text-sm text-rose-200" role="alert">{validationError || errorMessage}</div>}
          <Button variant="primary" className="w-full" type="submit" disabled={!program || !studentNumber || householdIncome === '' || qpi === '' || isSaving}>
            {isSaving ? 'Saving profile…' : 'Continue to ScholarPath'}
          </Button>
        </form>
    </ModalShell>
  );
}
