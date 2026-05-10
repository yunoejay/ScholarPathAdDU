import { useEffect, useRef, useState } from 'react';
import bgImage from '../../pictures/picture1.png';
import logoImage from '../../pictures/logo.png';

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'osa_admin', label: 'OSA Admin' },
  { value: 'department_chair', label: 'Department Chair' },
];

function RolePicker({ label, value, onChange, idPrefix }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (open) {
      const currentIndex = roleOptions.findIndex((option) => option.value === value);
      setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [open, value]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const selectedOption = roleOptions.find((option) => option.value === value) ?? roleOptions[0];

  const chooseRole = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (!open) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((previous) => (previous + 1) % roleOptions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((previous) => (previous - 1 + roleOptions.length) % roleOptions.length);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(roleOptions.length - 1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      chooseRole(roleOptions[activeIndex].value);
    }
  };

  return (
    <div className="field-group role-picker" ref={pickerRef} onKeyDown={handleKeyDown}>
      <span>{label}</span>
      <button
        type="button"
        className="role-picker-trigger"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${idPrefix}-role-list`}
      >
        <span className="role-picker-trigger-content">
          <span className="role-picker-trigger-text">
            <strong>{selectedOption.label}</strong>
          </span>
        </span>
        <svg viewBox="0 0 20 20" className="role-picker-caret" aria-hidden="true">
          <path d="M5.5 8l4.5 4.5L14.5 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="role-picker-backdrop"
            aria-label={`Close ${label.toLowerCase()} menu`}
            onClick={() => setOpen(false)}
            tabIndex={-1}
          />
          <div className="role-picker-menu role-picker-menu--open" id={`${idPrefix}-role-list`} role="listbox" aria-label={label}>
          {roleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={`role-picker-option ${value === option.value ? 'is-selected' : ''} ${roleOptions[activeIndex].value === option.value ? 'is-active' : ''}`}
              onClick={() => chooseRole(option.value)}
            >
              <span className="role-picker-option-text">
                <strong>{option.label}</strong>
              </span>
            </button>
          ))}
          </div>
        </>
      )}
    </div>
  );
}

function SelectPicker({ label, value, onChange, options, idPrefix }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (open) {
      const currentIndex = options.findIndex((option) => option.value === value);
      setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [open, value, options]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  const chooseOption = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (!open) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((previous) => (previous + 1) % options.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((previous) => (previous - 1 + options.length) % options.length);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      chooseOption(options[activeIndex].value);
    }
  };

  return (
    <div className="field-group select-picker" ref={pickerRef} onKeyDown={handleKeyDown}>
      <span>{label}</span>
      <button
        type="button"
        className="select-picker-trigger"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${idPrefix}-list`}
      >
        <span className="select-picker-trigger-text">
          <strong>{selectedOption.label}</strong>
        </span>
        <svg viewBox="0 0 20 20" className="select-picker-caret" aria-hidden="true">
          <path d="M5.5 8l4.5 4.5L14.5 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="select-picker-backdrop"
            aria-label={`Close ${label.toLowerCase()} menu`}
            onClick={() => setOpen(false)}
            tabIndex={-1}
          />
          <div className="select-picker-menu select-picker-menu--open" id={`${idPrefix}-list`} role="listbox" aria-label={label}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className={`select-picker-option ${value === option.value ? 'is-selected' : ''} ${options[activeIndex].value === option.value ? 'is-active' : ''}`}
                onClick={() => chooseOption(option.value)}
              >
                <strong>{option.label}</strong>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function LoginScreen({ onLogin, rememberedEmail, rememberedRole, isRemembered, theme, onToggleTheme }) {
  const [email, setEmail] = useState(rememberedEmail || 'student@addu.edu.ph');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState(rememberedRole || 'student');
  const [rememberMe, setRememberMe] = useState(isRemembered || false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [createAccountData, setCreateAccountData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: '',
    verificationCode: '',
  });
  const [createAccountSuccess, setCreateAccountSuccess] = useState(false);

  const submitLogin = (event) => {
    event.preventDefault();
    onLogin({ email, password, role, rememberMe });
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();
    setResetSent(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setResetSent(false);
      setForgotEmail('');
    }, 2000);
  };

  const handleCreateAccount = (event) => {
    event.preventDefault();
    if (createAccountData.password !== createAccountData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setCreateAccountSuccess(true);
    setTimeout(() => {
      setShowCreateAccount(false);
      setCreateAccountSuccess(false);
      setCreateAccountData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        studentId: '',
        verificationCode: '',
      });
    }, 2000);
  };

  const updateCreateAccountData = (field, value) => {
    setCreateAccountData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="login-screen" style={{ '--login-bg': `url(${bgImage})` }}>
      <div className="login-overlay" />
      <button
        type="button"
        className="theme-toggle floating-theme-toggle login-theme-toggle"
        onClick={onToggleTheme}
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        <span className="theme-toggle-icon" aria-hidden="true">
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon-moon">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon-sun">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </button>
      {!showCreateAccount ? (
        <section className="login-card card">
          <div className="login-hero">
            <div className="login-brand-row">
              <img src={logoImage} alt="Ateneo de Davao University logo" className="login-logo" />
            </div>
            <h1>Sign in to your scholarship workspace</h1>
          </div>

          <form className="login-form" onSubmit={submitLogin}>
            <RolePicker label="Role" value={role} onChange={setRole} idPrefix="login" />
            <label>
              <span>Email</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="name@addu.edu.ph" />
            </label>
            <label>
              <span>Password</span>
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Enter password" />
            </label>
            <div className="login-remember-row">
              <label className="checkbox-label">
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                <span>Remember me</span>
              </label>
              <button type="button" className="forgot-link" onClick={() => setShowForgotPassword(true)}>Forgot password?</button>
            </div>
            <button className="primary-btn full-width" type="submit">Sign in</button>
            <div className="login-divider">
              <span>or</span>
            </div>
            <button type="button" className="google-btn full-width">
              <svg viewBox="0 0 24 24" className="google-icon" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#1f2937"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34a853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fbbc05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ea4335"/>
              </svg>
              Sign in with Google
            </button>
            <div className="login-divider">
              <span>or</span>
            </div>
            <button type="button" className="secondary-btn full-width" onClick={() => setShowCreateAccount(true)}>Create account</button>
            <p className="login-note">Sign in with your Ateneo account.</p>
          </form>
        </section>
      ) : (
        <section className="login-card card create-account-view">
          <div className="create-account-header">
            <button type="button" className="back-btn" onClick={() => setShowCreateAccount(false)} title="Back to sign in">
              ← Back
            </button>
            <h1>Create your account</h1>
          </div>

          {createAccountSuccess ? (
            <div className="success-message">
              <div className="check-icon">✓</div>
              <p>Account created successfully!</p>
              <p className="success-note">You can now sign in with your email and password.</p>
              <button type="button" className="primary-btn full-width" onClick={() => {
                setShowCreateAccount(false);
                setCreateAccountSuccess(false);
                setCreateAccountData({
                  fullName: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  role: 'student',
                  studentId: '',
                  verificationCode: '',
                });
              }}>Back to sign in</button>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleCreateAccount}>
              <label>
                <span>Full Name</span>
                <input
                  type="text"
                  value={createAccountData.fullName}
                  onChange={(e) => updateCreateAccountData('fullName', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={createAccountData.email}
                  onChange={(e) => updateCreateAccountData('email', e.target.value)}
                  placeholder="name@addu.edu.ph"
                  required
                />
              </label>
              <RolePicker
                label="Role"
                value={createAccountData.role}
                onChange={(nextRole) => updateCreateAccountData('role', nextRole)}
                idPrefix="create-account"
              />
              {createAccountData.role === 'student' && (
                <label>
                  <span>Student ID</span>
                  <input
                    type="text"
                    value={createAccountData.studentId}
                    onChange={(e) => updateCreateAccountData('studentId', e.target.value)}
                    placeholder="e.g., 123456"
                    required
                  />
                </label>
              )}
              {createAccountData.role !== 'student' && (
                <label>
                  <span>Verification Code</span>
                  <input
                    type="text"
                    value={createAccountData.verificationCode}
                    onChange={(e) => updateCreateAccountData('verificationCode', e.target.value)}
                    placeholder="Enter verification code"
                    required
                  />
                </label>
              )}
              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={createAccountData.password}
                  onChange={(e) => updateCreateAccountData('password', e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </label>
              <label>
                <span>Confirm Password</span>
                <input
                  type="password"
                  value={createAccountData.confirmPassword}
                  onChange={(e) => updateCreateAccountData('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </label>
              <button className="primary-btn full-width" type="submit">Create account</button>
              <button type="button" className="secondary-btn full-width" onClick={() => setShowCreateAccount(false)}>Back to sign in</button>
            </form>
          )}
        </section>
      )}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
            <h2>Reset your password</h2>
            <p className="modal-subtitle">Enter your email address and we'll send you a password reset link.</p>
            {resetSent ? (
              <div className="reset-success">
                <div className="check-icon">✓</div>
                <p>Reset link sent to <strong>{forgotEmail}</strong></p>
                <p className="reset-note">Check your email for further instructions.</p>
              </div>
            ) : (
              <form className="modal-form" onSubmit={handleForgotPassword}>
                <label>
                  <span>Email address</span>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(event) => setForgotEmail(event.target.value)}
                    placeholder="name@addu.edu.ph"
                    required
                  />
                </label>
                <div className="modal-actions">
                  <button type="button" className="secondary-btn" onClick={() => setShowForgotPassword(false)}>Cancel</button>
                  <button type="submit" className="primary-btn" disabled={!forgotEmail}>Send reset link</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { SelectPicker };
