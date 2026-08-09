import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { academicProgramCategories, academicPrograms } from '../lib/academicPrograms';
import { rankScholarships } from '../lib/eligibility';
import { Card, EmptyState, ScholarshipRow } from '../components/pageParts';
import { SelectPicker } from './LoginScreen';

export default function EligibilityChecker({ profileDraft, scholarships, onApply, onSaveProfile }) {
  const [result, setResult] = useState([]);
  const [editableProfile, setEditableProfile] = useState(profileDraft);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [qpiText, setQpiText] = useState(String(editableProfile.qpi ?? ''));
  const [incomeText, setIncomeText] = useState(String(editableProfile.householdIncome ?? ''));
  const qpiValue = Number(editableProfile.qpi);
  const hasTemporaryChanges = JSON.stringify(editableProfile) !== JSON.stringify(profileDraft);
  const isQpiOutOfRange = Number.isFinite(qpiValue) && (qpiValue < 0 || qpiValue > 4);

  useEffect(() => {
    setEditableProfile(profileDraft);
    setQpiText(String(profileDraft.qpi ?? ''));
    setIncomeText(String(profileDraft.householdIncome ?? ''));
    setSaveMessage('');
  }, [profileDraft]);

  const updateEditableProfile = (patch) => {
    setSaveMessage('');
    setEditableProfile((previous) => ({ ...previous, ...patch }));
  };

  const resetToSavedProfile = () => {
    setEditableProfile(profileDraft);
    setQpiText(String(profileDraft.qpi ?? ''));
    setIncomeText(String(profileDraft.householdIncome ?? ''));
    setSaveMessage('');
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setSaveMessage('');
    const result = await onSaveProfile(editableProfile);
    setSaveMessage(result?.success ? 'Saved to your profile and annual QPI history.' : (result?.message || 'Unable to save your profile.'));
    setIsSavingProfile(false);
  };

  const commitQpi = (rawValue) => {
    const normalizedValue = rawValue.trim();

    if (normalizedValue === '') {
      setQpiText('');
      return;
    }

    const parsedValue = Number(normalizedValue);

    if (Number.isNaN(parsedValue)) {
      setQpiText(normalizedValue);
      return;
    }

    const roundedValue = Math.round(parsedValue * 100) / 100;
    setQpiText(normalizedValue);
    updateEditableProfile({ qpi: roundedValue });
  };

  const clampQpi = () => {
    if (qpiText.trim() === '') {
      setQpiText(String(editableProfile.qpi ?? ''));
      return;
    }

    const parsedValue = Number(qpiText);

    if (Number.isNaN(parsedValue)) {
      setQpiText(String(editableProfile.qpi ?? ''));
      return;
    }

    let normalizedValue = Math.round(parsedValue * 100) / 100;
    if (normalizedValue < 0) normalizedValue = 0;
    if (normalizedValue > 4) normalizedValue = 4;

    setQpiText(normalizedValue.toFixed(2));
    updateEditableProfile({ qpi: normalizedValue });
  };

  const commitIncome = (rawValue) => {
    const normalizedValue = rawValue.trim();

    if (normalizedValue === '') {
      setIncomeText('');
      return;
    }

    const parsedValue = Number(normalizedValue);

    if (Number.isNaN(parsedValue)) {
      setIncomeText(normalizedValue);
      return;
    }

    const roundedValue = Math.round(parsedValue);
    setIncomeText(normalizedValue);
    updateEditableProfile({ householdIncome: roundedValue });
  };

  const clampIncome = () => {
    if (incomeText.trim() === '') {
      setIncomeText(String(editableProfile.householdIncome ?? ''));
      return;
    }

    const parsedValue = Number(incomeText);

    if (Number.isNaN(parsedValue)) {
      setIncomeText(String(editableProfile.householdIncome ?? ''));
      return;
    }

    const roundedValue = Math.round(parsedValue);
    setIncomeText(String(roundedValue));
    updateEditableProfile({ householdIncome: roundedValue });
  };

  useEffect(() => {
    const numericQpi = Number(editableProfile.qpi);

    if (!Number.isFinite(numericQpi) || numericQpi < 0 || numericQpi > 4) {
      setResult([]);
      return;
    }

    const matches = rankScholarships(editableProfile, scholarships);
    setResult(matches.slice(0, 8));
  }, [editableProfile, scholarships]);

  return (
    <div className="blue-action-view grid gap-4">
      <section className="page-title-bar flex flex-col items-start justify-between gap-4 rounded-app border bg-app-card p-5 shadow-app backdrop-blur md:flex-row">
        <div className="page-title-copy">
          <span className="page-section-label">Smart Eligibility Checker</span>
          <h2>Check QPI, income, and degree eligibility</h2>
        </div>
        <div className="page-metric eligible-grants-metric rounded-2xl border border-app-border bg-app-surface p-4 text-center sm:min-w-36">
          <strong>{result.length}</strong>
          <span>Eligible grants</span>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card title="Student profile input">
          <div className="grid gap-4">
            <label>
              <span>QPI</span>
              <div className="flex items-center gap-3">
                <button type="button" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-app-border bg-app-surface text-app-text" onClick={() => {
                  let value = Number(qpiText) || Number(editableProfile.qpi) || 0.00;
                  value = Math.round((value - 0.01) * 100) / 100;
                  if (value < 0.00) value = 0.00;
                  setQpiText(value.toFixed(2));
                  updateEditableProfile({ qpi: value });
                }}><Minus size={16} /></button>
                <input type="text" inputMode="decimal" value={qpiText} onChange={(event) => commitQpi(event.target.value)} onBlur={clampQpi} placeholder="0.00" />
                <button type="button" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-app-border bg-app-surface text-app-text" onClick={() => {
                  let value = Number(qpiText) || Number(editableProfile.qpi) || 0.00;
                  value = Math.round((value + 0.01) * 100) / 100;
                  if (value > 4.00) value = 4.00;
                  setQpiText(value.toFixed(2));
                  updateEditableProfile({ qpi: value });
                }}><Plus size={16} /></button>
              </div>
              {isQpiOutOfRange && <span className="field-warning">QPI should be between 0.00 and 4.00.</span>}
            </label>
            <label>
              <span>Household income</span>
              <div className="flex items-center gap-3">
                <button type="button" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-app-border bg-app-surface text-app-text" onClick={() => {
                  let value = Number(incomeText) || Number(editableProfile.householdIncome) || 0;
                  value = value - 1000;
                  setIncomeText(String(value));
                  updateEditableProfile({ householdIncome: value });
                }}><Minus size={16} /></button>
                <input type="text" inputMode="numeric" value={incomeText} onChange={(event) => commitIncome(event.target.value)} onBlur={clampIncome} placeholder="0" />
                <button type="button" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-app-border bg-app-surface text-app-text" onClick={() => {
                  let value = Number(incomeText) || Number(editableProfile.householdIncome) || 0;
                  value = value + 1000;
                  setIncomeText(String(value));
                  updateEditableProfile({ householdIncome: value });
                }}><Plus size={16} /></button>
              </div>
            </label>
            <SelectPicker
              label="Degree program"
              value={editableProfile.degreeProgram}
              onChange={(value) => updateEditableProfile({ degreeProgram: value })}
              options={academicProgramCategories.flatMap((category) => [
                { value: `category-${category}`, label: category, isGroup: true },
                ...academicPrograms
                  .filter((program) => program.category === category)
                  .map((program) => ({ value: program.value, label: program.label })),
              ])}
              idPrefix="eligibility-degree"
            />
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-app-border bg-app-surface p-3 text-sm font-semibold text-app-text">
              <input type="checkbox" checked={editableProfile.hasActiveGovernmentGrant} onChange={(event) => updateEditableProfile({ hasActiveGovernmentGrant: event.target.checked })} />
              Active government grant
            </label>
          </div>
          <div className="mt-6 grid gap-3">
            <div className={`rounded-xl border p-3 text-sm text-app-muted ${hasTemporaryChanges ? 'border-amber-400/30 bg-amber-500/10' : 'border-app-border bg-app-surface'}`}>
              {hasTemporaryChanges ? 'Using temporary checker values. Your saved profile has not changed.' : 'Using your saved profile values.'}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {hasTemporaryChanges && <button type="button" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-app-border bg-app-surface px-4 py-2 text-sm font-semibold text-app-text transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60" onClick={resetToSavedProfile}>Reset to saved profile</button>}
              <button type="button" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-br from-ateneo-strong via-ateneo to-ateneo-bright px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60" onClick={handleSaveProfile} disabled={!hasTemporaryChanges || isSavingProfile}>
                {isSavingProfile ? 'Saving…' : 'Save as my profile'}
              </button>
            </div>
            {saveMessage && <span className="field-hint">{saveMessage}</span>}
          </div>
        </Card>

        <Card title="Matched scholarships">
          <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
            {result.length ? result.map((scholarship) => (
              <ScholarshipRow key={scholarship.id} scholarship={scholarship} onApply={onApply} compact />
            )) : <EmptyState title="No matches for this profile" description="Adjust QPI, income, degree, or grant status to see matching scholarships here." />}
          </div>
        </Card>
      </section>
    </div>
  );
}
