import { describe, expect, it } from 'vitest';
import { isLocalReminder, mergeNotifications } from '../src/lib/notificationMerge';

const serverNotification = (overrides = {}) => ({
  id: 'not-server-1',
  title: 'Application submitted',
  channel: 'In-app',
  status: 'Unread',
  createdAt: '2026-09-01',
  ...overrides,
});

const localReminder = (overrides = {}) => ({
  id: 'not-local-1',
  sourceKey: 'deadline-reminder-custom-1-7',
  title: 'Reminder: "CHED TES submission" due in 7 days',
  channel: 'In-app',
  status: 'Unread',
  createdAt: '2026-09-01',
  ...overrides,
});

describe('isLocalReminder', () => {
  it('treats entries carrying a sourceKey as locally generated reminders', () => {
    expect(isLocalReminder(localReminder())).toBe(true);
  });

  it('treats server-backed entries without a sourceKey as non-local', () => {
    expect(isLocalReminder(serverNotification())).toBe(false);
    expect(isLocalReminder(undefined)).toBe(false);
  });
});

describe('mergeNotifications', () => {
  it('keeps local reminders when the Supabase workspace returns no notifications', () => {
    const local = [localReminder()];
    expect(mergeNotifications(local, [])).toEqual(local);
    expect(mergeNotifications(local, undefined)).toEqual(local);
  });

  it('preserves local reminders alongside hydrated server notifications', () => {
    const merged = mergeNotifications([localReminder()], [serverNotification()]);

    expect(merged).toHaveLength(2);
    expect(merged[0].sourceKey).toBe('deadline-reminder-custom-1-7');
    expect(merged[1].id).toBe('not-server-1');
  });

  it('does not duplicate a reminder that already exists server-side by title', () => {
    const local = [localReminder()];
    const remote = [serverNotification({ id: 'not-server-2', title: local[0].title })];

    const merged = mergeNotifications(local, remote);

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe('not-server-2');
  });

  it('does not duplicate a reminder that already exists server-side by id', () => {
    const local = [localReminder({ id: 'not-server-3' })];
    const remote = [serverNotification({ id: 'not-server-3', title: 'Different title' })];

    const merged = mergeNotifications(local, remote);

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe('not-server-3');
  });

  it('keeps only one entry per sourceKey', () => {
    const local = [
      localReminder({ id: 'not-local-a' }),
      localReminder({ id: 'not-local-b' }),
    ];

    const merged = mergeNotifications(local, [serverNotification()]);

    expect(merged.filter((entry) => entry.sourceKey)).toHaveLength(1);
  });

  it('drops non-reminder local entries so the workspace stays authoritative', () => {
    const local = [
      { id: 'not-local-seed', title: 'Welcome to ScholarPath AdDU' },
      localReminder(),
    ];

    const merged = mergeNotifications(local, [serverNotification()]);

    expect(merged.map((entry) => entry.id)).toEqual(['not-local-1', 'not-server-1']);
  });

  it('tolerates missing or malformed local notification collections', () => {
    expect(mergeNotifications(undefined, [serverNotification()])).toHaveLength(1);
    expect(mergeNotifications([], [serverNotification()])).toHaveLength(1);
    expect(mergeNotifications(null, null)).toEqual([]);
  });
});
