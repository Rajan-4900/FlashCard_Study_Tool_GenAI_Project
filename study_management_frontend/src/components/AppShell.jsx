import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SideItem({ to, label, id }) {
  return (
    <NavLink
      id={id}
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition',
          isActive ? 'bg-indigo-50 text-indigo-800' : 'text-slate-700 hover:bg-slate-100',
        ].join(' ')
      }
    >
      <span>{label}</span>
      <span className="text-xs text-slate-400">→</span>
    </NavLink>
  )
}

export default function AppShell({ children }) {
  const { isAdmin } = useAuth()
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-[76px] space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Navigation
            </div>
            <div className="mt-3 space-y-1">
              <SideItem id="tour-nav-dashboard" to="/dashboard" label="Dashboard" />
              <SideItem id="tour-nav-flashcards" to="/flashcards" label="Flashcards" />
              <SideItem id="tour-nav-study" to="/study" label="Study Mode" />
              {isAdmin ? <SideItem to="/admin" label="Admin Panel" /> : null}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tip
            </div>
            <div className="mt-2 text-sm text-slate-600">
              Keep cards short. One idea per card makes studying faster and more accurate.
            </div>
          </div>
        </div>
      </aside>

      <section className="min-w-0">{children}</section>
    </div>
  )
}

