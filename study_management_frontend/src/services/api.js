import axios from 'axios'

/**
 * Axios instance used across the app.
 *
 * Configure your backend base URL via:
 * - VITE_API_BASE_URL=http://localhost:5000/api
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
})

export function getApiErrorMessage(err, fallback = 'Something went wrong.') {
  // Flask routes in this project often return { error: "..." } (not { message }).
  const apiMsg = err?.response?.data?.message || err?.response?.data?.error
  return apiMsg || err?.message || fallback
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Normalize “no response” errors (network/CORS/etc.)
    if (!error?.response) {
      return Promise.reject(
        new Error('Network error. Please check your connection and API URL.'),
      )
    }
    return Promise.reject(error)
  },
)

// ---- Auth ----
export async function getProfile() {
  const { data } = await api.get('/profile')
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.put('/profile', payload)
  return data
}

export async function login(payload) {
  // Backend (Flask) expects: { username, password }
  // Backend returns: { access_token, user, message }
  const { data } = await api.post('/login', payload)
  return { token: data?.access_token, user: data?.user, raw: data }
}

export async function register(payload) {
  // Backend (Flask) expects: { username, password, role? }
  // Backend returns: { message, user }
  const { data } = await api.post('/register', payload)
  return { token: null, user: data?.user, raw: data }
}

// ---- Flashcards ----
export async function listFlashcards(params) {
  // Backend returns: { cards: [...] }
  const { data } = await api.get('/cards', { params })
  return data
}

export async function createFlashcard(payload) {
  // Backend expects: { question, answer }
  // Backend returns: { card }
  const { data } = await api.post('/cards', payload)
  return data
}

export async function updateFlashcard(id, payload) {
  const { data } = await api.put(`/cards/${id}`, payload)
  return data
}

export async function deleteFlashcard(id) {
  const { data } = await api.delete(`/cards/${id}`)
  return data
}

// ---- Admin ----
export async function listUsers() {
  const { data } = await api.get('/users')
  return data
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/users/${id}`)
  return data
}

export async function listAllFlashcards() {
  const { data } = await api.get('/cards/all')
  return data
}

// ---- Study sessions ----
export async function saveSessionProgress(payload) {
  const { data } = await api.post('/study/session', payload)
  return data
}

export async function listSessionProgress() {
  const { data } = await api.get('/progress/sessions')
  return data
}

