export default function FormField({ label, children }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      {children}
    </div>
  )
}
