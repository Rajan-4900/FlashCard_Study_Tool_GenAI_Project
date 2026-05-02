import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { login as apiLogin, register as apiRegister } from '../services/api'

const AuthContext = createContext(null)

/**
 * Auth state is intentionally simple:
 * - JWT stored in localStorage (per requirements)
 * - `user` cached in memory for navigation/permissions
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const cachedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null

  function parseJwt(jwt) {
    try {
      const [, payload] = jwt.split('.')
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const bootstrap = useCallback(async () => {
    if (!token) {
      // Restore cached user (optional) even when logged out.
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser))
        } catch {
          localStorage.removeItem('user')
        }
      }
      setIsLoading(false)
      return
    }
    // Backend does not provide /auth/me in this project.
    // We infer role from JWT claims and restore cached user details if present.
    const claims = parseJwt(token)
    const role = claims?.role

    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser)
        setUser(role ? { ...parsed, role } : parsed)
      } catch {
        localStorage.removeItem('user')
        setUser(role ? { role } : null)
      }
    } else {
      setUser(role ? { role } : null)
    }

    setIsLoading(false)
  }, [cachedUser, token])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  const login = useCallback(async (payload) => {
    const data = await apiLogin(payload)
    const nextToken = data?.token
    if (nextToken) localStorage.setItem('token', nextToken)
    if (data?.user) localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data?.user ?? null)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const data = await apiRegister(payload)
    // This backend's /register does not return a token.
    if (data?.user) localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data?.user ?? null)
    return data
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === 'admin' || user?.isAdmin === true,
      login,
      register,
      logout,
      refreshMe: bootstrap,
    }),
    [bootstrap, isLoading, login, logout, register, token, user],
  )

  // Keep this file as `.js` (per required structure) by avoiding JSX here.
  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

