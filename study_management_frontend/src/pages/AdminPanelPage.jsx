import { useEffect, useState } from 'react'
import LoadingScreen from '../components/LoadingScreen'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { deleteUser, getApiErrorMessage, listSessionProgress, listUsers, listAllFlashcards } from '../services/api'

export default function AdminPanelPage() {
  const [users, setUsers] = useState([])
  const [sessions, setSessions] = useState([])
  const [cards, setCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyUserId, setBusyUserId] = useState(null)

  async function load() {
    setIsLoading(true)
    setError('')
    try {
      const [usersData, sessionsData, cardsData] = await Promise.all([listUsers(), listSessionProgress(), listAllFlashcards()])
      const userList = usersData?.users ?? usersData ?? []
      const sessionList = sessionsData?.sessions ?? sessionsData ?? []
      const cardList = cardsData?.cards ?? cardsData ?? []
      setUsers(Array.isArray(userList) ? userList : [])
      setSessions(Array.isArray(sessionList) ? sessionList : [])
      setCards(Array.isArray(cardList) ? cardList : [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load users.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function onDelete(id) {
    const ok = window.confirm('Delete this user? This cannot be undone.')
    if (!ok) return

    setBusyUserId(id)
    setError('')
    try {
      await deleteUser(id)
      setUsers((prev) => prev.filter((u) => (u.id ?? u._id) !== id))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete user.'))
    } finally {
      setBusyUserId(null)
    }
  }

  if (isLoading) return <LoadingScreen label="Loading users…" />

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Admin panel"
          description="View all users and delete accounts."
          right={
            <Button variant="secondary" onClick={load}>
              Reload
            </Button>
          }
        />
        <CardBody className="py-4">
          <div className="text-sm text-slate-600">
            Only admins can access this page. Deleting a user is permanent.
          </div>
        </CardBody>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader
          title="Student performance"
          description="Latest completed study sessions."
          right={
            <div className="text-xs font-semibold text-slate-500">
              Showing {Math.min(sessions.length, 200)} recent
            </div>
          }
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sessions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-slate-600" colSpan={3}>
                      No completed sessions yet.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {s.username || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">
                          {Math.round(s.score_percentage)}%
                        </span>{' '}
                        <span className="text-slate-500">
                          ({s.correct_answers}/{s.total_questions})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {s.status || 'completed'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="All Flashcards"
          description="A complete list of flashcards created by all users."
          right={
            <div className="text-xs font-semibold text-slate-500">
              Total: {cards.length}
            </div>
          }
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Created By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Question
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Answer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cards.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-slate-600" colSpan={4}>
                      No flashcards found.
                    </td>
                  </tr>
                ) : (
                  cards.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {c.owner_username || 'Unknown'}
                        {c.owner_role === 'admin' ? (
                          <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            Admin
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 whitespace-nowrap">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                           {c.category || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 max-w-[200px] truncate" title={c.question}>
                        {c.question}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 max-w-[200px] truncate" title={c.answer}>
                        {c.answer}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Role
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-slate-600" colSpan={4}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const id = u.id ?? u._id
                  return (
                    <tr key={id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {u.name || u.username || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{u.email || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {u.role || (u.isAdmin ? 'admin' : 'user')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="danger"
                          loading={busyUserId === id}
                          onClick={() => onDelete(id)}
                          className="px-3 py-2"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

