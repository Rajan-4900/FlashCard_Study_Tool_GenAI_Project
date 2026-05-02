import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../services/api'
import AuthShell from '../components/AuthShell'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  // For a college demo we allow selecting role at registration time.
  // In a real app, admin privileges should be assigned by the system, not self-selected.
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      setIsSubmitting(false)
      return
    }
    try {
      await register(form)
      // This backend's /register does not return a JWT.
      // Send the user to login for a clean “register → login → dashboard” flow.
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Make a small deck and start practicing today."
      footer={
        <>
          Already have an account?{' '}
          <Link className="font-semibold text-indigo-700 hover:text-indigo-800" to="/login">
            Sign in
          </Link>
          .
        </>
      }
    >
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
            autoComplete="new-password"
            required
            hint="Use at least 6 characters for a stronger password."
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Create account
          </Button>
        </form>
    </AuthShell>
  )
}

