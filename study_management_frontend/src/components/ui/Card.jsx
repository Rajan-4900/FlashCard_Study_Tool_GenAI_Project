export default function Card({ className = '', children }) {
  return (
    <div className={['rounded-3xl border border-slate-200 bg-white shadow-sm', className].join(' ')}>
      {children}
    </div>
  )
}

export function CardHeader({ title, description, right }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
      <div className="min-w-0">
        <div className="text-base font-semibold tracking-tight text-slate-900">{title}</div>
        {description ? <div className="mt-1 text-sm text-slate-600">{description}</div> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )
}

export function CardBody({ className = '', children }) {
  return <div className={['px-6 py-5', className].join(' ')}>{children}</div>
}

