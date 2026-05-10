import { useEffect, useState } from 'react';
import { fmtDate } from '../lib/formatters';

export default function CalendarView({ scholarships, customDeadlines = [], onAddCustomDeadline, onDeleteCustomDeadline }) {
  const now = new Date();
  const todayInputValue = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const [displayMonth, setDisplayMonth] = useState(now.getMonth());
  const [displayYear, setDisplayYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (showAddForm) {
      setFormDate(todayInputValue);
      setFormError('');
    }
  }, [showAddForm, todayInputValue]);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(displayYear, displayMonth);
  const firstDay = getFirstDayOfMonth(displayYear, displayMonth);
  const monthName = new Date(displayYear, displayMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const upcomingDeadlines = scholarships
    .filter((s) => new Date(s.deadline) >= now)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  const getScholarshipsForDate = (day) => {
    if (!day) return [];
    const date = new Date(displayYear, displayMonth, day);
    return scholarships.filter(
      (s) => new Date(s.deadline).toDateString() === date.toDateString()
    );
  };

  const getCustomDeadlinesForDate = (day) => {
    if (!day) return [];
    const date = new Date(displayYear, displayMonth, day);
    return customDeadlines.filter(
      (d) => new Date(d.deadline).toDateString() === date.toDateString()
    );
  };

  const handleAddDeadline = (e) => {
    e.preventDefault();
    const normalizedTitle = formTitle.trim();

    if (!normalizedTitle) {
      setFormError('Please add a reminder title.');
      return;
    }

    if (!formDate || formDate < todayInputValue) {
      setFormError('Choose today or a future date.');
      return;
    }

    onAddCustomDeadline(normalizedTitle, formDate);
    setFormTitle('');
    setFormDate(todayInputValue);
    setFormError('');
    setShowAddForm(false);
  };

  const selectedDateScholarships = selectedDate ? getScholarshipsForDate(selectedDate) : [];

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="view-stack">
      <section className="card">
        <h2>Scholarship Deadline Calendar</h2>
        <div className="calendar-container">
          <div className="calendar-grid">
            <div className="calendar-nav">
              <button type="button" className="calendar-nav-btn" onClick={handlePrevMonth} aria-label="Previous month">←</button>
              <h3 className="calendar-month">{monthName}</h3>
              <button type="button" className="calendar-nav-btn" onClick={handleNextMonth} aria-label="Next month">→</button>
            </div>
            <div className="calendar-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="calendar-day-label">{day}</div>
              ))}
            </div>
            <div className="calendar-days">
              {days.map((day, idx) => {
                const dayScholarships = getScholarshipsForDate(day);
                const dayCustomDeadlines = getCustomDeadlinesForDate(day);
                const hasDeadlines = dayScholarships.length > 0 || dayCustomDeadlines.length > 0;
                const isSelected = selectedDate === day;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`calendar-cell ${day ? 'active' : 'empty'} ${dayScholarships.length > 0 ? 'has-deadline' : ''} ${dayCustomDeadlines.length > 0 ? 'has-custom-deadline' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => day && setSelectedDate(isSelected ? null : day)}
                    disabled={!day}
                    aria-label={day ? `${day}${hasDeadlines ? ` - ${dayScholarships.length} scholarship${dayScholarships.length !== 1 ? 's' : ''} and ${dayCustomDeadlines.length} custom deadline${dayCustomDeadlines.length !== 1 ? 's' : ''}` : ''}` : undefined}
                  >
                    {day}
                    {hasDeadlines && <span className="deadline-dot" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="upcoming-deadlines">
            <div className="upcoming-deadlines-header">
              <h3>{selectedDate ? `Deadlines on ${new Date(displayYear, displayMonth, selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Upcoming Deadlines'}</h3>
              {!selectedDate && (
                <button type="button" className="add-deadline-btn" onClick={() => setShowAddForm(!showAddForm)}>
                  {showAddForm ? 'Cancel' : '+ Add Reminder'}
                </button>
              )}
            </div>
            {selectedDate ? (
              selectedDateScholarships.length || getCustomDeadlinesForDate(selectedDate).length ? (
                <div className="deadline-list">
                  {selectedDateScholarships.map((scholarship) => {
                    const daysUntil = Math.ceil((new Date(scholarship.deadline) - now) / (1000 * 60 * 60 * 24));
                    const urgency = daysUntil <= 3 ? 'urgent' : daysUntil <= 7 ? 'warning' : 'info';
                    return (
                      <div key={scholarship.id} className={`deadline-item ${urgency}`}>
                        <div>
                          <strong>{scholarship.title}</strong>
                          <p>{fmtDate(scholarship.deadline)}</p>
                        </div>
                        <span className="days-left">{daysUntil} days</span>
                      </div>
                    );
                  })}
                  {getCustomDeadlinesForDate(selectedDate).map((customDeadline) => {
                    const daysUntil = Math.ceil((new Date(customDeadline.deadline) - now) / (1000 * 60 * 60 * 24));
                    const urgency = daysUntil <= 3 ? 'urgent' : daysUntil <= 7 ? 'warning' : 'info';
                    return (
                      <div key={customDeadline.id} className={`deadline-item custom-deadline ${urgency}`}>
                        <div>
                          <strong>{customDeadline.title}</strong>
                          <p>{fmtDate(customDeadline.deadline)}</p>
                        </div>
                        <div className="deadline-actions">
                          <span className="days-left">{daysUntil} days</span>
                          <button
                            type="button"
                            className="delete-deadline-btn"
                            onClick={() => onDeleteCustomDeadline(customDeadline.id)}
                            aria-label="Delete deadline"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-deadlines">No deadlines on this date</p>
              )
            ) : (
              upcomingDeadlines.length ? (
                <div className="deadline-list">
                  {upcomingDeadlines.map((scholarship) => {
                    const daysUntil = Math.ceil((new Date(scholarship.deadline) - now) / (1000 * 60 * 60 * 24));
                    const urgency = daysUntil <= 3 ? 'urgent' : daysUntil <= 7 ? 'warning' : 'info';
                    return (
                      <div key={scholarship.id} className={`deadline-item ${urgency}`}>
                        <div>
                          <strong>{scholarship.title}</strong>
                          <p>{fmtDate(scholarship.deadline)}</p>
                        </div>
                        <span className="days-left">{daysUntil} days</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-deadlines">No upcoming deadlines 🎉</p>
              )
            )}
          </div>
        </div>
      </section>

      {showAddForm && !selectedDate && (
        <div className="deadline-modal-backdrop" role="presentation" onClick={() => setShowAddForm(false)}>
          <div className="deadline-modal card" role="dialog" aria-modal="true" aria-labelledby="deadline-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="deadline-modal-head">
              <div>
                <span className="eyebrow">Custom reminder</span>
                <h3 id="deadline-modal-title">Add your own deadline</h3>
                <p>Use this for document prep, essay drafting, and other internal deadlines that need a reminder a week or five days ahead.</p>
              </div>
              <button type="button" className="deadline-modal-close" onClick={() => setShowAddForm(false)} aria-label="Close reminder modal">
                ✕
              </button>
            </div>

            <form className="add-deadline-form" onSubmit={handleAddDeadline}>
              <label>
                <span>Reminder title</span>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Gather documents"
                  required
                />
              </label>
              <label>
                <span>Deadline date</span>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  min={todayInputValue}
                  required
                />
              </label>
              <p className="deadline-form-note">Choose today or a future date. We’ll remind you 7 and 5 days before.</p>
              {formError && <p className="deadline-form-error">{formError}</p>}
              <div className="button-row">
                <button type="button" className="secondary-btn" onClick={() => { setShowAddForm(false); setFormError(''); }}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={!formTitle.trim() || !formDate || formDate < todayInputValue}>Create Reminder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
