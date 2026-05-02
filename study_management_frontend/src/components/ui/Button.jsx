import Spinner from '../Spinner'

const styles = {
  base:
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition ' +
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60',
  primary: 'bg-slate-900 text-white hover:bg-slate-800',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-100',
}

export default function Button({
  variant = 'primary',
  loading = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      {...props}
      className={[styles.base, styles[variant] || styles.primary, className].join(' ')}
      disabled={props.disabled || loading}
    >
      {loading ? <Spinner size={16} className="border-white/30 border-t-white" /> : null}
      {children}
    </button>
  )
}

