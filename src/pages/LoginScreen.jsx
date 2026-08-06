import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronDown, Eye, EyeOff, LoaderCircle, Moon, Sun } from 'lucide-react';
import bgImage from '../../pictures/picture1.png';
import logoImage from '../../pictures/logo.png';
import { signInWithGoogle } from '../lib/auth';

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
    <div className="relative grid gap-2" ref={pickerRef} onKeyDown={handleKeyDown}>
      <span className="text-sm font-semibold text-app-text">{label}</span>
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-control border border-app-border bg-app-surface px-4 py-3 text-left text-app-text shadow-sm transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${idPrefix}-role-list`}
      >
        <span className="min-w-0 truncate text-sm font-semibold">{selectedOption.label}</span>
        <ChevronDown className="h-5 w-5 shrink-0 text-app-muted" size={18} aria-hidden="true" />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[18] border-0 bg-slate-950/10 backdrop-blur-[1px]"
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
              className={`flex w-full items-center rounded-xl px-3 py-3 text-left text-sm text-app-text transition hover:bg-blue-500/10 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${value === option.value || roleOptions[activeIndex].value === option.value ? 'bg-blue-500/10' : ''}`}
              onClick={() => chooseRole(option.value)}
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
    <div className={`relative grid gap-2 ${open ? 'z-[31]' : ''}`} ref={pickerRef} onKeyDown={handleKeyDown}>
      <span className="text-sm font-semibold text-app-text">{label}</span>
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-control border border-app-border bg-app-surface px-4 py-3 text-left text-app-text shadow-sm transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${idPrefix}-list`}
      >
        <strong className="truncate text-sm">{selectedOption.label}</strong>
        <ChevronDown className="h-5 w-5 shrink-0 text-app-muted" size={18} aria-hidden="true" />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[18] border-0 bg-slate-950/10 backdrop-blur-[1px]"
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

export default function LoginScreen({ onLogin, onSignUp, onForgotPassword, rememberedEmail, isRemembered, theme, onToggleTheme }) {
  const [email, setEmail] = useState(rememberedEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(isRemembered || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackTone, setFeedbackTone] = useState('info');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

  const submitLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedbackMessage('');
    setFeedbackTone('info');

    const result = await onLogin({ email, password, rememberMe });

    if (result?.success) {
      setFeedbackMessage(result.fallback ? 'Signed in using the demo mode fallback.' : 'Signed in successfully.');
      setFeedbackTone(result.fallback ? 'info' : 'success');
    } else {
      setFeedbackMessage(result?.message || 'Unable to sign in. Please check your credentials.');
      setFeedbackTone('error');
    }

    setIsSubmitting(false);
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setFeedbackMessage('');
    setFeedbackTone('info');

    const result = await onForgotPassword({ email: forgotEmail });

    if (result?.success) {
      setResetSent(true);
      setFeedbackMessage(result.message);
      setFeedbackTone('success');
      return;
    }

    setFeedbackMessage(result?.message || 'Unable to send a reset link right now.');
    setFeedbackTone('error');
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    setFeedbackMessage('');
    setFeedbackTone('info');

    const result = await onSignUp({
      fullName: createAccountData.fullName,
      email: createAccountData.email,
      password: createAccountData.password,
      role: createAccountData.role,
      studentId: createAccountData.studentId,
      verificationCode: createAccountData.verificationCode,
    });

    console.log('handleCreateAccount - result:', result);

    if (result?.success) {
      setCreateAccountSuccess(true);
      setFeedbackMessage(result.message);
      setFeedbackTone('success');
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
        setFeedbackMessage('');
        setFeedbackTone('info');
      }, 2000);
      return;
    }

    const errorMsg = result?.message || 'Unable to create your account right now.';
    console.error('handleCreateAccount - error:', errorMsg);
    setFeedbackMessage(errorMsg);
    setFeedbackTone('error');
  };

   const updateCreateAccountData = (field, value) => {
     setCreateAccountData(prev => ({ ...prev, [field]: value }));
   };

   const handleGoogleSignIn = async () => {
     setIsGoogleLoading(true);
     setFeedbackMessage('');
     setFeedbackTone('info');

     const result = await signInWithGoogle();

     if (result?.success && result?.fallback) {
       setFeedbackMessage(
         result?.message?.includes('not configured')
           ? 'Google Sign-In requires Supabase configuration. Please add your Supabase credentials to enable OAuth. Contact your administrator to set up Google OAuth provider in the Supabase dashboard.'
           : 'Google Sign-In is currently unavailable. Please try email sign-in instead.'
       );
       setFeedbackTone('info');
     } else if (result?.success) {
       setFeedbackMessage('Redirecting to Google sign-in...');
       setFeedbackTone('success');
     } else {
       const errorMsg = result?.message || 'Unable to sign in with Google.';
       if (errorMsg.includes('provider') || errorMsg.includes('enabled')) {
         setFeedbackMessage(
           'Google Sign-In is not yet configured. Your administrator needs to enable the Google provider in the Supabase Authentication settings. You can still sign in with your email and password.'
         );
       } else {
         setFeedbackMessage(errorMsg);
       }
       setFeedbackTone('error');
     }

     setIsGoogleLoading(false);
   };

   const togglePasswordVisibility = () => {
     setShowPassword((prev) => !prev);
   };

   return (
     <div className="login-screen" style={{ '--login-bg': `url(${bgImage})` }}>
      <div className="login-overlay" />
      <button
        type="button"
         className="fixed bottom-4 left-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-app-border bg-app-surface text-app-text shadow-card transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 sm:bottom-5 sm:left-5"
        onClick={onToggleTheme}
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
         <span aria-hidden="true">
          {theme === 'light' ? <Moon className="icon-moon" size={20} /> : <Sun className="icon-sun" size={20} />}
        </span>
      </button>
      {!showCreateAccount ? (
         <section className="grid w-full max-w-5xl gap-5 rounded-app border border-app-border bg-app-card p-5 shadow-app backdrop-blur sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
           <div className="grid content-start gap-4 rounded-app bg-gradient-to-br from-blue-500/10 to-slate-950/20 p-5 sm:p-6">
             <div className="inline-flex items-center gap-3">
               <img src={logoImage} alt="Ateneo de Davao University logo" className="h-12 w-12 rounded-full border border-white/20 bg-white/10 object-contain p-1" />
               <span className="text-xl font-extrabold text-app-text">ScholarPath AdDU</span>
            </div>
             <h1 className="hidden text-3xl font-extrabold leading-tight text-app-text sm:block lg:text-5xl">Sign in to your scholarship workspace</h1>
          </div>

           <form className="grid content-center gap-4 p-1 sm:p-3" onSubmit={submitLogin}>
             <label className="grid gap-2">
               <span className="text-sm font-semibold text-app-text">Email</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" />
            </label>
             <label className="grid gap-2">
               <span className="text-sm font-semibold text-app-text">Password</span>
               <div className="relative">
                 <input
                   value={password}
                   onChange={(event) => setPassword(event.target.value)}
                   type={showPassword ? 'text' : 'password'}
                   placeholder="Password"
                   id="login-password-input"
                 />
                 <button
                   type="button"
                  className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-app-muted hover:bg-app-surface hover:text-app-text focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                   onClick={togglePasswordVisibility}
                   aria-label={showPassword ? 'Hide password' : 'Show password'}
                   title={showPassword ? 'Hide password' : 'Show password'}
                   tabIndex={-1}
                 >
                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
               </div>
             </label>
             <div className="flex flex-wrap items-center justify-between gap-3">
               <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-app-text">
                 <input className="h-4 w-4 accent-[var(--primary)]" type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                 <span>Remember me</span>
              </label>
               <button type="button" className="text-sm font-semibold text-app-primary hover:opacity-80" onClick={() => {
                setFeedbackMessage('');
                setFeedbackTone('info');
                setResetSent(false);
                setShowForgotPassword(true);
              }}>Forgot password?</button>
            </div>
            {feedbackMessage && (
               <div className={`feedback-banner w-full rounded-xl border px-3 py-3 text-sm ${feedbackTone === 'error' ? 'feedback-banner--error border-rose-400/30 bg-rose-500/10 text-rose-200' : feedbackTone === 'success' ? 'feedback-banner--success border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'feedback-banner--info border-sky-400/30 bg-sky-500/10 text-sky-200'}`} role="status">
                {feedbackMessage}
              </div>
            )}
            <button className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-br from-ateneo-strong via-ateneo to-ateneo-bright px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 full-width" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
             <div className="flex items-center gap-3 text-sm text-app-muted before:h-px before:flex-1 before:bg-app-border after:h-px after:flex-1 after:bg-app-border">
               <span>or</span>
             </div>
             <button
               type="button"
               className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-app-border bg-app-surface px-4 py-2 text-sm font-semibold text-app-text transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
               onClick={handleGoogleSignIn}
               disabled={isGoogleLoading}
             >
               {isGoogleLoading ? (
                  <span className="inline-flex items-center gap-2">
                   <LoaderCircle className="spinner-icon" size={20} />
                   Signing in...
                 </span>
               ) : (
                 <>
                     <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#1f2937"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34a853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fbbc05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ea4335"/>
                    </svg>
                 </>
               )}
             </button>
            <button type="button" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-app-border bg-app-surface px-4 py-2 text-sm font-semibold text-app-text transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 full-width" onClick={() => {
              setFeedbackMessage('');
              setFeedbackTone('info');
              setShowCreateAccount(true);
            }}>Create account</button>
          </form>
        </section>
      ) : (
         <section className="grid w-full max-w-2xl gap-5 rounded-app border border-app-border bg-app-card p-5 shadow-app backdrop-blur sm:p-6">
           <div className="relative grid gap-3">
             <button type="button" className="inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-app-primary hover:bg-app-surface focus:outline-none focus:ring-4 focus:ring-blue-500/20" onClick={() => {
              setFeedbackMessage('');
              setFeedbackTone('info');
              setShowCreateAccount(false);
            }} title="Back to sign in">
              <ArrowLeft size={16} /> Back
            </button>
             <h1 className="m-0 text-center text-2xl font-bold text-app-text">Create your account</h1>
          </div>

          {feedbackMessage && !createAccountSuccess && (
             <div className={`feedback-banner w-full rounded-xl border px-3 py-3 text-sm ${feedbackTone === 'error' ? 'feedback-banner--error border-rose-400/30 bg-rose-500/10 text-rose-200' : feedbackTone === 'success' ? 'feedback-banner--success border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'feedback-banner--info border-sky-400/30 bg-sky-500/10 text-sky-200'}`} role="status">
              {feedbackMessage}
            </div>
          )}

          {createAccountSuccess ? (
            <div className="grid place-items-center gap-4 p-4 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-400"><Check size={24} /></div>
              <p className="m-0 text-lg font-semibold text-app-text">Account created successfully!</p>
              <p className="m-0 text-sm text-app-muted">You can now sign in with your email and password.</p>
              <button type="button" className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-gradient-to-br from-ateneo-strong via-ateneo to-ateneo-bright px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => {
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
            <form className="grid gap-4" onSubmit={handleCreateAccount}>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-app-text">Full Name</span>
                <input
                  type="text"
                  value={createAccountData.fullName}
                  onChange={(e) => updateCreateAccountData('fullName', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-app-text">Email</span>
                <input
                  type="email"
                  value={createAccountData.email}
                  onChange={(e) => updateCreateAccountData('email', e.target.value)}
                  placeholder="AdDU Email"
                  required
                />
              </label>
              <RolePicker
                label="Role"
                value={createAccountData.role}
                onChange={(nextRole) => updateCreateAccountData('role', nextRole)}
                idPrefix="create-account"
              />
              {createAccountData.role !== 'student' && (
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-app-text">Verification Code</span>
                  <input
                    type="text"
                    value={createAccountData.verificationCode}
                    onChange={(e) => updateCreateAccountData('verificationCode', e.target.value)}
                    placeholder="Enter verification code"
                    required
                  />
                </label>
              )}
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-app-text">Password</span>
                <input
                  type="password"
                  value={createAccountData.password}
                  onChange={(e) => updateCreateAccountData('password', e.target.value)}
                  placeholder="Password"
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-app-text">Confirm Password</span>
                <input
                  type="password"
                  value={createAccountData.confirmPassword}
                  onChange={(e) => updateCreateAccountData('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </label>
              <button className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-gradient-to-br from-ateneo-strong via-ateneo to-ateneo-bright px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60" type="submit">Create account</button>
              <button type="button" className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-app-border bg-app-surface px-4 py-2 text-sm font-semibold text-app-text transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => {
                setFeedbackMessage('');
                setFeedbackTone('info');
                setShowCreateAccount(false);
              }}>Back to sign in</button>
            </form>
          )}
        </section>
      )}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="w-full max-w-[420px] rounded-app border border-app-border bg-app-card p-5 shadow-app backdrop-blur" onClick={(e) => e.stopPropagation()}>
            <h2 className="m-0 text-2xl font-bold text-app-text">Reset your password</h2>
            <p className="mt-2 text-sm text-app-muted">Enter your email address and we'll send you a password reset link.</p>
            {feedbackMessage && (
              <div className={`feedback-banner w-full rounded-xl border px-3 py-3 text-sm ${feedbackTone === 'error' ? 'feedback-banner--error border-rose-400/30 bg-rose-500/10 text-rose-200' : feedbackTone === 'success' ? 'feedback-banner--success border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'feedback-banner--info border-sky-400/30 bg-sky-500/10 text-sky-200'}`} role="status">
                {feedbackMessage}
              </div>
            )}
            {resetSent ? (
              <div className="grid place-items-center gap-3 py-6 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-400"><Check size={24} /></div>
                <p className="m-0 text-sm text-app-text">Reset link sent to <strong>{forgotEmail}</strong></p>
                <p className="m-0 text-sm text-app-muted">Check your email for further instructions.</p>
              </div>
            ) : (
                <form className="grid gap-4" onSubmit={handleForgotPassword}>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-app-text">Email address</span>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(event) => setForgotEmail(event.target.value)}
                    placeholder="AdDU Email"
                    required
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
              <button type="button" className="text-sm font-semibold text-app-primary hover:opacity-80" onClick={() => {
                setFeedbackMessage('');
                setFeedbackTone('info');
                setResetSent(false);
                setShowForgotPassword(true);
              }}>Forgot password?</button>
                  <button type="submit" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-br from-ateneo-strong via-ateneo to-ateneo-bright px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60" disabled={!forgotEmail}>Send reset link</button>
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
