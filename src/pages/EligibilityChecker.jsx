import { useEffect, useState } from 'react';
import { academicPrograms } from '../lib/academicPrograms';
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
    <div className="view-stack">
      <section className="page-header card">
        <div>
          <span className="eyebrow">Smart Eligibility Checker</span>
          <h2>Check QPI, income, and degree eligibility</h2>
          <p>Rules follow the forward-chaining approach described in the manuscript, including exclusion overrides. The backend will be wired in later.</p>
        </div>
        <div className="search-summary">
          <div>
            <strong>{result.length}</strong>
            <span>Eligible grants</span>
          </div>
        </div>
      </section>

      <section className="split-grid">
        <Card title="Student profile input">
          <div className="form-grid">
            <label>
              <span>QPI</span>
              <div className="number-input">
                <button type="button" className="number-btn dec" onClick={() => {
                  let value = Number(qpiText) || Number(editableProfile.qpi) || 0.00;
                  value = Math.round((value - 0.01) * 100) / 100;
                  if (value < 0.00) value = 0.00;
                  setQpiText(value.toFixed(2));
                  updateEditableProfile({ qpi: value });
                }}>−</button>
                <input type="text" inputMode="decimal" value={qpiText} onChange={(event) => commitQpi(event.target.value)} onBlur={clampQpi} placeholder="0.00" />
                <button type="button" className="number-btn inc" onClick={() => {
                  let value = Number(qpiText) || Number(editableProfile.qpi) || 0.00;
                  value = Math.round((value + 0.01) * 100) / 100;
                  if (value > 4.00) value = 4.00;
                  setQpiText(value.toFixed(2));
                  updateEditableProfile({ qpi: value });
                }}>+</button>
              </div>
              {isQpiOutOfRange && <span className="field-warning">QPI should be between 0.00 and 4.00.</span>}
            </label>
            <label>
              <span>Household income</span>
              <div className="number-input">
                <button type="button" className="number-btn dec" onClick={() => {
                  let value = Number(incomeText) || Number(editableProfile.householdIncome) || 0;
                  value = value - 1000;
                  setIncomeText(String(value));
                  updateEditableProfile({ householdIncome: value });
                }}>−</button>
                <input type="text" inputMode="numeric" value={incomeText} onChange={(event) => commitIncome(event.target.value)} onBlur={clampIncome} placeholder="0" />
                <button type="button" className="number-btn inc" onClick={() => {
                  let value = Number(incomeText) || Number(editableProfile.householdIncome) || 0;
                  value = value + 1000;
                  setIncomeText(String(value));
                  updateEditableProfile({ householdIncome: value });
                }}>+</button>
              </div>
            </label>
            <SelectPicker
              label="Degree program"
              value={editableProfile.degreeProgram}
              onChange={(value) => updateEditableProfile({ degreeProgram: value })}
              options={academicPrograms.map((program) => ({ value: program.value, label: program.label }))}
              idPrefix="eligibility-degree"
            />
            <label className="toggle-chip inline">
              <input type="checkbox" checked={editableProfile.hasActiveGovernmentGrant} onChange={(event) => updateEditableProfile({ hasActiveGovernmentGrant: event.target.checked })} />
              Active government grant
            </label>
          </div>
          <div className="eligibility-actions">
            <div className={`temporary-profile-note ${hasTemporaryChanges ? 'temporary-profile-note--active' : ''}`}>
              {hasTemporaryChanges ? 'Using temporary checker values. Your saved profile has not changed.' : 'Using your saved profile values.'}
            </div>
            <div className="button-row">
              {hasTemporaryChanges && <button type="button" className="secondary-btn" onClick={resetToSavedProfile}>Reset to saved profile</button>}
              <button type="button" className="primary-btn" onClick={handleSaveProfile} disabled={!hasTemporaryChanges || isSavingProfile}>
                {isSavingProfile ? 'Saving…' : 'Save as my profile'}
              </button>
            </div>
            {saveMessage && <span className="field-hint">{saveMessage}</span>}
          </div>
        </Card>

        <Card title="Matched scholarships">
          <div className="list-stack">
            {result.length ? result.map((scholarship) => (
              <ScholarshipRow key={scholarship.id} scholarship={scholarship} onApply={onApply} compact />
            )) : <EmptyState title="No matches for this profile" description="Adjust QPI, income, degree, or grant status to see matching scholarships here." />}
          </div>
        </Card>
      </section>
    </div>
  );
}
