import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'rounded-md px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-slate-900 text-white'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link 
          to={isAuthenticated ? "/dashboard" : "/"} 
          className="flex items-center gap-3 group transition-opacity hover:opacity-90"
        >
          <div className="h-10 w-10 overflow-hidden rounded-xl shadow-sm bg-white border border-slate-100 group-hover:border-indigo-200 transition-colors">
            <img src="/logo.png" alt="Study Manager Logo" className="h-full w-full object-cover" />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold text-slate-900 tracking-tight">Study Manager</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {isAuthenticated ? (
            <>
              <NavItem id="tour-nav-dashboard" to="/dashboard" end>
                Dashboard
              </NavItem>
              <NavItem id="tour-nav-flashcards" to="/flashcards">Flashcards</NavItem>
              <NavItem id="tour-nav-study" to="/study">Study</NavItem>
              {isAdmin ? <NavItem to="/admin">Admin</NavItem> : null}
            </>
          ) : (
            <>
              <NavItem to="/login">Login</NavItem>
              <NavItem to="/register">Register</NavItem>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 hover:bg-slate-100 md:hidden"
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {isAuthenticated ? (
            <>
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 rounded-full py-1 pl-3 pr-1 text-slate-700 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <span className="text-sm font-semibold hidden sm:block">
                    {user?.name || user?.username || (isAdmin ? 'Admin' : 'User')}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 overflow-hidden shadow-sm border border-slate-300">
                    {user?.profile_image ? (
                      <img src={user.profile_image} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || user?.username}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || (isAdmin ? 'Administrator' : 'Student')}</p>
                      </div>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          navigate('/profile')
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Your Profile
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          logout()
                          navigate('/login')
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 font-medium transition-colors border-t border-slate-100"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <button
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 md:hidden"
              onClick={() => {
                setMobileOpen(false)
                navigate('/login')
              }}
            >
              Login
            </button>
          )}
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-1">
              {isAuthenticated ? (
                <>
                  <NavItem to="/dashboard" end>
                    Dashboard
                  </NavItem>
                  <NavItem to="/flashcards">Flashcards</NavItem>
                  <NavItem to="/study">Study</NavItem>
                  {isAdmin ? <NavItem to="/admin">Admin</NavItem> : null}
                  <button
                    className="mt-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                    onClick={() => {
                      setMobileOpen(false)
                      logout()
                      navigate('/login')
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavItem to="/login">Login</NavItem>
                  <NavItem to="/register">Register</NavItem>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

