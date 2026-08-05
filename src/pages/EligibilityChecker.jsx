import { useEffect, useState } from 'react';
import { degreePrograms } from '../lib/demoData';
import { rankScholarships } from '../lib/eligibility';
import { Card, EmptyState, ScholarshipRow } from '../components/pageParts';
import { SelectPicker } from './LoginScreen';

export default function EligibilityChecker({ profileDraft, scholarships, onChange, onApply }) {
  const [result, setResult] = useState([]);
  const [qpiText, setQpiText] = useState(String(profileDraft.qpi ?? ''));
  const [incomeText, setIncomeText] = useState(String(profileDraft.householdIncome ?? ''));
  const qpiValue = Number(profileDraft.qpi);
  const isQpiOutOfRange = Number.isFinite(qpiValue) && (qpiValue < 1 || qpiValue > 5);

  useEffect(() => {
    setQpiText(String(profileDraft.qpi ?? ''));
  }, [profileDraft.qpi]);

  useEffect(() => {
    setIncomeText(String(profileDraft.householdIncome ?? ''));
  }, [profileDraft.householdIncome]);

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
    onChange({ qpi: roundedValue });
  };

  const clampQpi = () => {
    if (qpiText.trim() === '') {
      setQpiText(String(profileDraft.qpi ?? ''));
      return;
    }

    const parsedValue = Number(qpiText);

    if (Number.isNaN(parsedValue)) {
      setQpiText(String(profileDraft.qpi ?? ''));
      return;
    }

    let normalizedValue = Math.round(parsedValue * 100) / 100;
    if (normalizedValue < 1) normalizedValue = 1;
    if (normalizedValue > 5) normalizedValue = 5;

    setQpiText(normalizedValue.toFixed(2));
    onChange({ qpi: normalizedValue });
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
    onChange({ householdIncome: roundedValue });
  };

  const clampIncome = () => {
    if (incomeText.trim() === '') {
      setIncomeText(String(profileDraft.householdIncome ?? ''));
      return;
    }

    const parsedValue = Number(incomeText);

    if (Number.isNaN(parsedValue)) {
      setIncomeText(String(profileDraft.householdIncome ?? ''));
      return;
    }

    const roundedValue = Math.round(parsedValue);
    setIncomeText(String(roundedValue));
    onChange({ householdIncome: roundedValue });
  };

  useEffect(() => {
    const numericQpi = Number(profileDraft.qpi);

    if (!Number.isFinite(numericQpi) || numericQpi < 1 || numericQpi > 5) {
      setResult([]);
      return;
    }

    const matches = rankScholarships(profileDraft, scholarships);
    setResult(matches.slice(0, 8));
  }, [profileDraft, scholarships]);

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
                  let value = Number(qpiText) || Number(profileDraft.qpi) || 1.00;
                  value = Math.round((value - 0.01) * 100) / 100;
                  if (value < 1.00) value = 1.00;
                  setQpiText(value.toFixed(2));
                  onChange({ qpi: value });
                }}>−</button>
                <input type="text" inputMode="decimal" value={qpiText} onChange={(event) => commitQpi(event.target.value)} onBlur={clampQpi} placeholder="1.00" />
                <button type="button" className="number-btn inc" onClick={() => {
                  let value = Number(qpiText) || Number(profileDraft.qpi) || 1.00;
                  value = Math.round((value + 0.01) * 100) / 100;
                  if (value > 5.00) value = 5.00;
                  setQpiText(value.toFixed(2));
                  onChange({ qpi: value });
                }}>+</button>
              </div>
              {isQpiOutOfRange && <span className="field-warning">QPI should be between 1.00 and 5.00.</span>}
            </label>
            <label>
              <span>Household income</span>
              <div className="number-input">
                <button type="button" className="number-btn dec" onClick={() => {
                  let value = Number(incomeText) || Number(profileDraft.householdIncome) || 0;
                  value = value - 1000;
                  setIncomeText(String(value));
                  onChange({ householdIncome: value });
                }}>−</button>
                <input type="text" inputMode="numeric" value={incomeText} onChange={(event) => commitIncome(event.target.value)} onBlur={clampIncome} placeholder="0" />
                <button type="button" className="number-btn inc" onClick={() => {
                  let value = Number(incomeText) || Number(profileDraft.householdIncome) || 0;
                  value = value + 1000;
                  setIncomeText(String(value));
                  onChange({ householdIncome: value });
                }}>+</button>
              </div>
            </label>
            <SelectPicker
              label="Degree program"
              value={profileDraft.degreeProgram}
              onChange={(value) => onChange({ degreeProgram: value })}
              options={degreePrograms.map((degree) => ({ value: degree, label: degree }))}
              idPrefix="eligibility-degree"
            />
            <label className="toggle-chip inline">
              <input type="checkbox" checked={profileDraft.hasActiveGovernmentGrant} onChange={(event) => onChange({ hasActiveGovernmentGrant: event.target.checked })} />
              Active government grant
            </label>
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
