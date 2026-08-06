const clsx = (...values) => values.flat(Infinity).filter(Boolean).join(' ');

export const buttonClasses = {
  base: 'inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60',
  primary: 'bg-gradient-to-br from-ateneo-strong via-ateneo to-ateneo-bright text-white shadow-sm',
  secondary: 'border border-app-border bg-app-surface text-app-text',
  ghost: 'border border-transparent text-app-muted hover:bg-app-surface hover:text-app-text',
  danger: 'border border-rose-400/30 bg-rose-500/10 text-rose-200',
};

export function Button({ variant = 'secondary', className = '', children, ...props }) {
  return <button className={clsx(buttonClasses.base, buttonClasses[variant], className)} {...props}>{children}</button>;
}

export function Card({ title, action, children, className = '', ...props }) {
  return (
    <section className={clsx('rounded-app border bg-app-card p-5 shadow-app backdrop-blur', className)} {...props}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && <h3>{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Panel({ children, className = '', ...props }) {
  return <div className={clsx('rounded-[18px] border border-app-border bg-app-surface p-4', className)} {...props}>{children}</div>;
}

const statusClasses = {
  success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  danger: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  warning: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  info: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  neutral: 'border-app-border bg-app-surface text-app-text',
};

export function StatusBadge({ tone = 'neutral', children, className = '' }) {
  return <span className={clsx('inline-flex w-fit items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold', statusClasses[tone] || statusClasses.neutral, className)}>{children}</span>;
}

export function FormField({ label, hint, error, children, className = '' }) {
  return (
    <label className={clsx('grid gap-2', className)}>
      <span className="text-sm font-semibold text-app-text">{label}</span>
      {children}
      {hint && <small className="field-hint">{hint}</small>}
      {error && <span className="text-sm text-rose-300" role="alert">{error}</span>}
    </label>
  );
}

export function EmptyState({ title, description, action, className = '' }) {
  return (
    <div className={clsx('rounded-app border border-dashed border-app-border p-6 text-center text-app-muted', className)}>
      <strong>{title}</strong>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function ModalShell({ title, closeLabel = 'Close', onClose, children, className = '', overlayClassName = '', ...props }) {
  return (
    <div className={clsx('modal-overlay', overlayClassName)} role="presentation" onClick={onClose}>
      <section className={clsx('rounded-app border bg-app-card p-5 shadow-app backdrop-blur', className)} role="dialog" aria-modal="true" aria-label={title || undefined} onClick={(event) => event.stopPropagation()} {...props}>
        {(title || onClose) && (
          <div className="mb-4 flex items-start justify-between gap-4">
            {title && <h2>{title}</h2>}
            {onClose && <Button variant="secondary" type="button" onClick={onClose}>{closeLabel}</Button>}
          </div>
        )}
        {children}
      </section>
    </div>
  );
}