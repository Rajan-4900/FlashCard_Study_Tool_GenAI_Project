import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'

export default function AppLayout() {
  const location = useLocation()
  const hideNav = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="min-h-full">
      {hideNav ? null : <Navbar />}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

