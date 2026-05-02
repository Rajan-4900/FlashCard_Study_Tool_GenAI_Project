import { Outlet } from 'react-router-dom'
import AppShell from './AppShell'

export default function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

