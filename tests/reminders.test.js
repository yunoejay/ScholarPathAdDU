import { describe, expect, it } from 'vitest';
import {
  REMINDER_OFFSETS,
  computeDueReminders,
  dateKey,
  reminderDateKey,
} from '../supabase/functions/_shared/reminders.js';

// Anchor tests to a fixed "today" so they never drift with the calendar.
const TODAY = '2026-09-08';
const inDays = (days) => dateKey(new Date(Date.parse(`${TODAY}T00:00:00`) + days * 24 * 60 * 60 * 1000));

describe('REMINDER_OFFSETS', () => {
  it('matches the manuscript reminder timing (7-day, 3-day, 1-day)', () => {
    expect(REMINDER_OFFSETS).toEqual({
      oneWeekBefore: 7,
      threeDaysBefore: 3,
      dayBefore: 1,
    });
  });
});

describe('dateKey / reminderDateKey', () => {
  it('formats dates as local YYYY-MM-DD keys', () => {
    expect(dateKey(new Date(2026, 8, 8))).toBe('2026-09-08');
    expect(dateKey('2026-12-31T00:00:00')).toBe('2026-12-31');
  });

  it('subtracts the reminder offset from the deadline', () => {
    expect(reminderDateKey('2026-09-08', 7)).toBe('2026-09-01');
    expect(reminderDateKey('2026-09-08', 3)).toBe('2026-09-05');
    expect(reminderDateKey('2026-09-08', 1)).toBe('2026-09-07');
  });

  it('rolls back across month boundaries', () => {
    expect(reminderDateKey('2026-03-01', 7)).toBe('2026-02-22');
    expect(reminderDateKey('2026-01-01', 3)).toBe('2025-12-29');
  });
});

describe('computeDueReminders', () => {
  it('returns nothing when no items are given', () => {
    expect(computeDueReminders({ today: TODAY, items: [] })).toEqual([]);
    expect(computeDueReminders({ today: TODAY })).toEqual([]);
  });

  it('returns the 7-day reminder three days before the deadline, plus the 3-day reminder on its date', () => {
    // Window rule (same as src/App.jsx): a reminder is due once its reminder
    // date has arrived, and stays deliverable until the deadline passes. So
    // with today = deadline - 3, the 7-day reminder is retroactively due and
    // the 3-day reminder is due exactly today; the 1-day is not yet.
    const due = computeDueReminders({
      today: TODAY,
      items: [{ id: 'sch-1', title: 'GIA Grant', deadline: inDays(3) }],
    });
    expect(due.map((entry) => entry.daysBefore).sort()).toEqual([3, 7]);
    expect(due.every((entry) => entry.sourceKey.startsWith('deadline-reminder-sch-1-'))).toBe(true);
  });

  it('skips reminders whose reminder date has not arrived yet', () => {
    // Deadline is 10 days out: even the 7-day reminder is not due yet.
    const due = computeDueReminders({
      today: TODAY,
      items: [{ id: 'sch-1', title: 'GIA Grant', deadline: inDays(10) }],
    });
    expect(due).toEqual([]);
  });

  it('includes a reminder on its exact due date (e.g. 7 days before)', () => {
    const deadline = inDays(7);
    const due = computeDueReminders({
      today: inDays(0),
      items: [{ id: 'sch-1', title: 'GIA Grant', deadline }],
    });
    expect(due).toHaveLength(1);
    expect(due[0]).toMatchObject({
      sourceKey: 'deadline-reminder-sch-1-7',
      daysBefore: 7,
      title: 'Reminder: "GIA Grant" due in 7 days',
    });
  });

  it('skips reminders after the deadline has passed', () => {
    const due = computeDueReminders({
      today: inDays(2),
      items: [{ id: 'sch-1', title: 'GIA Grant', deadline: inDays(-1) }],
    });
    expect(due).toEqual([]);
  });

  it('still delivers earlier reminders on the deadline day itself (window rule)', () => {
    // On the deadline day, `today > deadline` is false, so earlier offsets
    // remain deliverable (retroactively) - matching the client behavior.
    const deadline = inDays(1);
    const due = computeDueReminders({
      today: inDays(1),
      items: [{ id: 'sch-1', title: 'GIA Grant', deadline }],
    });
    expect(due.map((entry) => entry.daysBefore).sort()).toEqual([1, 3, 7]);
  });

  it('honors disabled reminder preferences', () => {
    const deadline = inDays(3);
    const items = [{ id: 'sch-1', title: 'GIA Grant', deadline }];

    const allOff = computeDueReminders({
      today: TODAY,
      items,
      reminderPreferences: { oneWeekBefore: false, threeDaysBefore: false, dayBefore: false },
    });
    expect(allOff).toEqual([]);

    // Offsets left undefined stay enabled (client defaults are all true);
    // explicitly disabling the 7-day reminder removes it.
    const withoutSevenDay = computeDueReminders({
      today: TODAY,
      items,
      reminderPreferences: { oneWeekBefore: false },
    });
    expect(withoutSevenDay.map((entry) => entry.daysBefore).sort()).toEqual([3]);
  });

  it('deduplicates against existingKeys across repeated runs', () => {
    const deadline = inDays(3);
    const items = [{ id: 'sch-1', title: 'GIA Grant', deadline }];

    const firstRun = computeDueReminders({ today: inDays(0), items });
    expect(firstRun.map((entry) => entry.sourceKey)).toContain('deadline-reminder-sch-1-3');

    const secondRun = computeDueReminders({
      today: inDays(0),
      items,
      existingKeys: new Set(firstRun.map((entry) => entry.sourceKey)),
    });
    expect(secondRun).toEqual([]);
  });

  it('ignores malformed items instead of throwing', () => {
    const due = computeDueReminders({
      today: TODAY,
      items: [null, { id: '', title: 'x', deadline: inDays(3) }, { id: 'sch-2', title: '', deadline: inDays(3) }, { id: 'sch-3' }],
    });
    expect(due).toEqual([]);
  });

  it('produces singular day label for 1-day reminders', () => {
    const due = computeDueReminders({
      today: inDays(1),
      items: [{ id: 'sch-1', title: 'GIA Grant', deadline: inDays(1) }],
    });
    const oneDay = due.find((entry) => entry.daysBefore === 1);
    expect(oneDay.title).toBe('Reminder: "GIA Grant" due in 1 day');
  });

  it('defaults kind to deadline and preserves provided kind', () => {
    const deadline = inDays(3);
    const items = [
      { id: 'sch-1', title: 'GIA Grant', deadline },
      { id: 'app-1', title: 'GIA Grant', deadline, kind: 'application' },
    ];
    const due = computeDueReminders({ today: inDays(0), items });
    const kinds = new Map(due.map((entry) => [entry.sourceKey, entry.kind]));
    expect(kinds.get('deadline-reminder-sch-1-3')).toBe('deadline');
    expect(kinds.get('deadline-reminder-app-1-3')).toBe('application');
  });
});
