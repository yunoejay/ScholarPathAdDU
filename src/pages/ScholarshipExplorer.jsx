import { Card, EmptyState } from '../components/pageParts';
import { fmtCurrency, fmtDate } from '../lib/formatters';
import { coverageTypes } from '../lib/constants';
import { getDeadlineStatus } from '../lib/eligibility';
import { SelectPicker } from './LoginScreen';

export default function ScholarshipExplorer({ profile, scholarships, searchQuery, filters, onSearchChange, onFilterChange, onApply }) {
  const activeFilterCount = [filters.category, filters.coverage, filters.deadline].filter((value) => value !== 'all').length + (filters.activeOnly ? 1 : 0);

  return (
    <div className="view-stack">
      <section className="page-header card">
        <div>
          <span className="eyebrow">Scholarship explorer</span>
          <h2>Search the centralized repository</h2>
          <p>Compound filters mirror the manuscript's dynamic faceted search approach.</p>
        </div>
        <div className="search-summary">
          <div>
            <strong>{scholarships.length}</strong>
            <span>Visible programs</span>
          </div>
          <div>
            <strong>{profile.hasActiveGovernmentGrant ? 'Gov grant active' : 'No gov grant'}</strong>
            <span>Exclusion logic status</span>
          </div>
          <div>
            <strong>{activeFilterCount}</strong>
            <span>Active filters</span>
          </div>
        </div>
      </section>

      <section className="card filter-bar">
        <input value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search by scholarship name, category, coverage, or origin" />
        <SelectPicker
          label="Category"
          value={filters.category}
          onChange={(value) => onFilterChange({ category: value })}
          options={[
            { value: 'all', label: 'All categories' },
            { value: 'Internal Endowment', label: 'Internal Endowment' },
            { value: 'Corporate & External', label: 'Corporate & External' },
            { value: 'State-Sponsored', label: 'State-Sponsored' },
            { value: 'Specialized Service', label: 'Specialized Service' },
          ]}
          idPrefix="explorer-category"
        />
        <SelectPicker
          label="Coverage"
          value={filters.coverage}
          onChange={(value) => onFilterChange({ coverage: value })}
          options={coverageTypes.map((item) => ({ value: item, label: item === 'all' ? 'All coverage' : item }))}
          idPrefix="explorer-coverage"
        />
        <SelectPicker
          label="Deadline"
          value={filters.deadline}
          onChange={(value) => onFilterChange({ deadline: value })}
          options={[
            { value: 'all', label: 'Any deadline' },
            { value: 'open', label: 'Open only' },
            { value: 'urgent', label: 'Urgent only' },
            { value: 'closed', label: 'Closed only' },
          ]}
          idPrefix="explorer-deadline"
        />
        <label className="toggle-chip">
          <input type="checkbox" checked={filters.activeOnly} onChange={(event) => onFilterChange({ activeOnly: event.target.checked })} />
          Active only
        </label>
      </section>

      <section className="catalog-grid">
        {scholarships.length ? scholarships.map((scholarship) => {
          const deadline = getDeadlineStatus(scholarship.deadline);
          return (
            <article key={scholarship.id} className="card scholarship-card">
              <div className="card-head">
                <div>
                  <span className="pill">{scholarship.category}</span>
                  <h3>{scholarship.title}</h3>
                </div>
                <span className={`status-pill ${deadline.tone}`}>{deadline.label}</span>
              </div>

              <p>{scholarship.coverage}</p>

              <div className="meta-grid">
                <span><strong>QPI</strong> {scholarship.minimumQpi}+</span>
                <span><strong>Income</strong> ≤ {fmtCurrency(scholarship.maximumIncome)}</span>
                <span><strong>Deadline</strong> {fmtDate(scholarship.deadline)}</span>
                <span><strong>Degrees</strong> {scholarship.eligibleDegrees.includes('ALL') ? 'All programs' : scholarship.eligibleDegrees.length}</span>
              </div>

              <div className="tag-row">
                {scholarship.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
              </div>

              <button className="primary-btn full-width" onClick={() => onApply(scholarship)}>Apply / track</button>
            </article>
          );
        }) : <EmptyState title="No scholarships match your filters" description="Relax the filters or use a broader search term to surface more programs." action={<button className="secondary-btn" onClick={() => { onSearchChange(''); onFilterChange({ category: 'all', coverage: 'all', deadline: 'all', activeOnly: true }); }}>Reset filters</button>} />}
      </section>
    </div>
  );
}
