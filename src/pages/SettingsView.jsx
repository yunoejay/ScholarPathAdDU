import { backendStatus, getBackendStatusTone } from '../lib/backendStatus';

export default function SettingsView({ notificationPreferences, onUpdatePreferences }) {
  const updatePreference = (key, value) => {
    onUpdatePreferences({
      ...notificationPreferences,
      [key]: value,
    });
  };

  const updateDeadlineReminder = (key, value) => {
    onUpdatePreferences({
      ...notificationPreferences,
      deadlineReminders: {
        ...notificationPreferences.deadlineReminders,
        [key]: value,
      },
    });
  };

  return (
    <div className="view-stack">
      <section className="card">
        <h2>Notification Settings</h2>
        <p className="section-subtitle">Configure how you receive scholarship updates and deadline reminders.</p>

        <div className="settings-section">
          <h3>Notification Channels</h3>
          <div className="settings-grid">
            <label className="setting-toggle">
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationPreferences.smsEnabled}
                  onChange={(e) => updatePreference('smsEnabled', e.target.checked)}
                />
                <span className="slider" />
              </div>
              <div>
                <strong>SMS Notifications</strong>
                <p>Receive deadline alerts and status updates via text message</p>
              </div>
            </label>

            <label className="setting-toggle">
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationPreferences.emailEnabled}
                  onChange={(e) => updatePreference('emailEnabled', e.target.checked)}
                />
                <span className="slider" />
              </div>
              <div>
                <strong>Email Notifications</strong>
                <p>Get detailed updates delivered to your inbox</p>
              </div>
            </label>

            <label className="setting-toggle">
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationPreferences.inAppEnabled}
                  onChange={(e) => updatePreference('inAppEnabled', e.target.checked)}
                />
                <span className="slider" />
              </div>
              <div>
                <strong>In-App Notifications</strong>
                <p>See updates and alerts when you're logged in</p>
              </div>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Deadline Reminders</h3>
          <p className="section-subtitle">Choose when you want to be reminded about upcoming deadlines.</p>
          <div className="settings-grid">
            <label className="setting-toggle">
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationPreferences.deadlineReminders.oneWeekBefore}
                  onChange={(e) => updateDeadlineReminder('oneWeekBefore', e.target.checked)}
                />
                <span className="slider" />
              </div>
              <div>
                <strong>1 Week Before</strong>
                <p>Get reminded 7 days before a deadline</p>
              </div>
            </label>

            <label className="setting-toggle">
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationPreferences.deadlineReminders.threeDaysBefore}
                  onChange={(e) => updateDeadlineReminder('threeDaysBefore', e.target.checked)}
                />
                <span className="slider" />
              </div>
              <div>
                <strong>3 Days Before</strong>
                <p>Get a reminder 3 days before a deadline</p>
              </div>
            </label>

            <label className="setting-toggle">
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationPreferences.deadlineReminders.dayBefore}
                  onChange={(e) => updateDeadlineReminder('dayBefore', e.target.checked)}
                />
                <span className="slider" />
              </div>
              <div>
                <strong>Day Before</strong>
                <p>Get a final reminder the day before</p>
              </div>
            </label>
          </div>
        </div>

        <div className="settings-info">
          <div className={`backend-status ${getBackendStatusTone()}`}>
            <span className="backend-status-label">Backend</span>
            <strong>{backendStatus}</strong>
          </div>
          <p>💡 Backend Note: These settings will trigger automated Edge Functions once backend integration is complete.</p>
        </div>
      </section>
    </div>
  );
}
