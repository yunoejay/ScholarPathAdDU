function SettingToggle({ checked, onChange, title, description }) {
  return (
    <label className="group flex cursor-pointer items-start gap-4 rounded-xl bg-app-surface p-4 transition-colors hover:bg-app-card">
      <span className="relative mt-0.5 h-7 w-12 shrink-0 rounded-full bg-slate-400/20 transition-colors has-[:checked]:bg-ateneo">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="pointer-events-none absolute bottom-[3px] left-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
      <span className="min-w-0">
        <strong className="block text-sm font-semibold text-app-text">{title}</strong>
        <span className="mt-1 block text-sm text-app-muted">{description}</span>
      </span>
    </label>
  );
}

export default function SettingsView({ notificationPreferences, onUpdatePreferences }) {
  const preferences = notificationPreferences || {
    smsEnabled: false,
    emailEnabled: false,
    inAppEnabled: true,
    deadlineReminders: { oneWeekBefore: true, threeDaysBefore: true, dayBefore: true },
  };

  const updatePreference = (key, value) => {
    onUpdatePreferences({
      ...preferences,
      [key]: value,
    });
  };

  const updateDeadlineReminder = (key, value) => {
    onUpdatePreferences({
      ...preferences,
      deadlineReminders: {
        ...preferences.deadlineReminders,
        [key]: value,
      },
    });
  };

  return (
    <div className="grid gap-4">
      <section className="page-title-bar rounded-app border bg-app-card p-5 shadow-app backdrop-blur">
        <h2 className="mt-2 text-xl font-bold text-app-text">Notification center settings</h2>

        <div className="mt-8 border-t border-app-border pt-6">
          <h3 className="m-0 text-lg font-semibold text-app-text">Notification Channels</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <SettingToggle
              checked={preferences.smsEnabled}
              onChange={(value) => updatePreference('smsEnabled', value)}
              title="SMS Notifications"
              description="Receive deadline alerts and status updates via text message"
            />
            <SettingToggle
              checked={preferences.emailEnabled}
              onChange={(value) => updatePreference('emailEnabled', value)}
              title="Email Notifications"
              description="Get detailed updates delivered to your inbox"
            />
            <SettingToggle
              checked={preferences.inAppEnabled}
              onChange={(value) => updatePreference('inAppEnabled', value)}
              title="In-App Notifications"
              description="See updates and alerts when you're logged in"
            />
          </div>
        </div>

        <div className="mt-8 border-t border-app-border pt-6">
          <h3 className="m-0 text-lg font-semibold text-app-text">Deadline Reminders</h3>
          <p className="mb-0 mt-2 text-sm text-app-muted">Choose when you want to be reminded about upcoming deadlines.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <SettingToggle
              checked={preferences.deadlineReminders.oneWeekBefore}
              onChange={(value) => updateDeadlineReminder('oneWeekBefore', value)}
              title="1 Week Before"
              description="Get reminded 7 days before a deadline"
            />
            <SettingToggle
              checked={preferences.deadlineReminders.threeDaysBefore}
              onChange={(value) => updateDeadlineReminder('threeDaysBefore', value)}
              title="3 Days Before"
              description="Get a reminder 3 days before a deadline"
            />
            <SettingToggle
              checked={preferences.deadlineReminders.dayBefore}
              onChange={(value) => updateDeadlineReminder('dayBefore', value)}
              title="Day Before"
              description="Get a final reminder the day before"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
