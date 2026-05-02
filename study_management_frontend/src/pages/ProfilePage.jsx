import { useEffect, useState } from 'react'
import { getProfile, updateProfile, getApiErrorMessage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import LoadingScreen from '../components/LoadingScreen'

const COLLEGES = [
  'City Engineering College',
  'Dayananda Sagar College of Engineering',
  'A P S College Of Engineering',
  'AMC Engineering College'
]

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8']
const YEARS = ['1st', '2nd', '3rd', '4th']

export default function ProfilePage() {
  const { user, refreshMe, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    semester: '',
    year: '',
    college_address: '',
    profile_image: ''
  })

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfile()
        if (data?.user) {
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            college: data.user.college || '',
            semester: data.user.semester || '',
            year: data.user.year || '',
            college_address: data.user.college_address || '',
            profile_image: data.user.profile_image || ''
          })
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load profile.'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profile_image: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const data = await updateProfile(formData)
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      // Refresh Auth context user to update navbar avatar
      await refreshMe()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update profile.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen label="Loading profile…" />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Settings</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Profile Settings
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your personal information and education details.
          </p>
        </div>
        {!isEditing && (
          <Button 
            variant="secondary" 
            onClick={() => setIsEditing(true)}
            className="shrink-0"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader title="Personal Information" />
          <CardBody className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-slate-50 bg-slate-100 shadow-sm relative group">
                {formData.profile_image ? (
                  <img src={formData.profile_image} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <svg className="h-full w-full text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer text-white text-[10px] font-bold uppercase tracking-wider text-center px-1">
                      Change<br/>Photo
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">{formData.name || 'Student'}</div>
                <div className="text-xs text-slate-500">{user?.username}</div>
                {isEditing && (
                  <div className="mt-2 text-xs text-slate-400 italic">Hover image to change photo</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Full Name">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    placeholder="e.g. John Doe"
                  />
                ) : (
                  <div className="text-sm text-slate-900 py-2 border-b border-transparent">{formData.name || 'Not set'}</div>
                )}
              </FormField>
              
              <FormField label="Username">
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none cursor-not-allowed"
                />
              </FormField>

              <FormField label="Email Address">
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    placeholder="john@example.com"
                  />
                ) : (
                  <div className="text-sm text-slate-900 py-2 border-b border-transparent">{formData.email || 'Not set'}</div>
                )}
              </FormField>

              <FormField label="Phone Number">
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    placeholder="+1 (555) 000-0000"
                  />
                ) : (
                  <div className="text-sm text-slate-900 py-2 border-b border-transparent">{formData.phone || 'Not set'}</div>
                )}
              </FormField>
            </div>
          </CardBody>
        </Card>

        {!isAdmin && (
          <Card>
            <CardHeader title="Education Details" />
            <CardBody className="space-y-4">
              <FormField label="College / University">
                {isEditing ? (
                  <select
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="">Select your college</option>
                    {COLLEGES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-slate-900 py-2 border-b border-transparent">{formData.college || 'Not set'}</div>
                )}
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Semester">
                  {isEditing ? (
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="">Select semester</option>
                      {SEMESTERS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-slate-900 py-2 border-b border-transparent">{formData.semester || 'Not set'}</div>
                  )}
                </FormField>

                <FormField label="Year">
                  {isEditing ? (
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="">Select year</option>
                      {YEARS.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-slate-900 py-2 border-b border-transparent">{formData.year || 'Not set'}</div>
                  )}
                </FormField>
              </div>

              <FormField label="College Address">
                {isEditing ? (
                  <textarea
                    name="college_address"
                    value={formData.college_address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 resize-none"
                    placeholder="Enter the full address of your college..."
                  />
                ) : (
                  <div className="text-sm text-slate-900 py-2 border-b border-transparent leading-relaxed">{formData.college_address || 'Not set'}</div>
                )}
              </FormField>
            </CardBody>
          </Card>
        )}

        {isEditing && (
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setIsEditing(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
