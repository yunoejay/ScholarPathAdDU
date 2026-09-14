/**
 * Merge helper for the notification center.
 *
 * Locally generated deadline reminders live only in localStorage, while other
 * notifications come from the Supabase `notifications` table. When the Supabase
 * workspace is hydrated it must not wipe locally generated reminders, so
 * reminders (entries carrying a `sourceKey`) are preserved unless the same
 * reminder is already present server-side (matched by title, since the
 * server-side row does not carry the sourceKey).
 *
 * Non-reminder local entries are intentionally dropped: the Supabase workspace
 * is the source of truth for everything else.
 */
export const isLocalReminder = (notification) => Boolean(notification?.sourceKey);

export const mergeNotifications = (localNotifications, remoteNotifications) => {
  const remote = Array.isArray(remoteNotifications) ? remoteNotifications : [];
  const local = Array.isArray(localNotifications) ? localNotifications : [];

  if (!remote.length) {
    return local;
  }

  const remoteIds = new Set(remote.map((entry) => entry?.id).filter(Boolean));
  const remoteTitles = new Set(remote.map((entry) => entry?.title).filter(Boolean));
  const preserved = [];
  const seenSourceKeys = new Set();

  for (const entry of local) {
    if (!isLocalReminder(entry)) {
      continue;
    }
    if (remoteIds.has(entry.id) || remoteTitles.has(entry.title)) {
      continue;
    }
    if (seenSourceKeys.has(entry.sourceKey)) {
      continue;
    }
    seenSourceKeys.add(entry.sourceKey);
    preserved.push(entry);
  }

  return preserved.length ? [...preserved, ...remote] : remote;
};
