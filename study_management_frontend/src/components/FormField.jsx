export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  error,
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={[
          'w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition',
          error
            ? 'border-rose-300 ring-4 ring-rose-100 focus:border-rose-400'
            : 'border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100',
        ].join(' ')}
      />
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  )
}

