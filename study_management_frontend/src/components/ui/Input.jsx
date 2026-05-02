export default function Input({
  label,
  hint,
  error,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={['space-y-1.5', className].join(' ')}>
      {label ? (
        <label htmlFor={props.id || props.name} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <input
        {...props}
        className={[
          'w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition',
          error
            ? 'border-rose-300 ring-4 ring-rose-100 focus:border-rose-400'
            : 'border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100',
          inputClassName,
        ].join(' ')}
      />
      {error ? <p className="text-xs text-rose-600">{error}</p> : hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

