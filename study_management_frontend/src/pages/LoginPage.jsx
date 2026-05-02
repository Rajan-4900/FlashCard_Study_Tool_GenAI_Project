import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../services/api'
import AuthShell from '../components/AuthShell'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = useMemo(() => location.state?.from || '/dashboard', [location.state])

  const [form, setForm] = useState({ username: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your flashcards and jump into Study Mode."
      footer={
        <>
          New here?{' '}
          <Link className="font-semibold text-indigo-700 hover:text-indigo-800" to="/register">
            Create an account
          </Link>
          .
        </>
      }
    >
        {location.state?.registered ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Account created. Please sign in.
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={onSubmit} autoComplete="on">
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            placeholder="e.g., rajan"
            autoComplete="username"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Sign in
          </Button>
        </form>
    </AuthShell>
  )
}

