import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createFlashcard,
  deleteFlashcard,
  getApiErrorMessage,
  listFlashcards,
  updateFlashcard,
} from '../services/api'
import LoadingScreen from '../components/LoadingScreen'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'

function EmptyState() {
  return (
    <Card>
      <CardBody className="py-12 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-700">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M8 9h8M8 13h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="mt-4 text-base font-semibold text-slate-900">No flashcards yet</div>
        <p className="mt-2 text-sm text-slate-600">
          Create your first card to unlock Study Mode.
        </p>
      </CardBody>
    </Card>
  )
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <div className="space-y-1.5">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <textarea
        value={value}
        onChange={onChange}
        rows={5}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  )
}

export default function FlashcardManagerPage() {
  const { user, isAdmin } = useAuth()
  const [cards, setCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editing, setEditing] = useState(null) // raw card
  const [isSaving, setIsSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [extraCategories, setExtraCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('study_manager_extra_categories')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [draft, setDraft] = useState({ front: '', back: '', category: '' })

  const filteredCards = useMemo(() => {
    let result = cards
    if (categoryFilter) {
      result = result.filter(c => c.category === categoryFilter)
    }
    const q = query.trim().toLowerCase()
    if (!q) return result
    return result.filter((c) =>
      `${c.front ?? c.question ?? ''} ${c.back ?? c.answer ?? ''}`.toLowerCase().includes(q),
    )
  }, [cards, query, categoryFilter])

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await listFlashcards()
      const list = data?.flashcards ?? data?.cards ?? data ?? []
      setCards(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load flashcards.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    localStorage.setItem('study_manager_extra_categories', JSON.stringify(extraCategories))
  }, [extraCategories])

  const allCategories = useMemo(() => {
    const fromCards = cards.map((c) => c.category).filter(Boolean)
    const combined = [...new Set([...fromCards, ...extraCategories])]
    return combined.sort((a, b) => a.localeCompare(b))
  }, [cards, extraCategories])

  function openCreate() {
    setEditing(null)
    setDraft({ front: '', back: '', category: categoryFilter || (allCategories[0] || '') })
    setModalOpen(true)
  }

  function handleAddCategory() {
    const name = newCategoryName.trim()
    if (!name) return
    if (!extraCategories.includes(name)) {
      setExtraCategories((prev) => [...prev, name])
    }
    setNewCategoryName('')
    setCategoryModalOpen(false)
  }

  function openEdit(card) {
    setEditing(card)
    setDraft({
      front: card.front ?? card.question ?? '',
      back: card.back ?? card.answer ?? '',
      category: card.category || '',
    })
    setModalOpen(true)
  }

  async function onCreate(payload) {
    setIsSaving(true)
    setError('')
    try {
      const data = await createFlashcard({
        question: payload.front,
        answer: payload.back,
        category: payload.category || 'General',
      })
      const created = data?.flashcard ?? data?.card ?? data
      if (created) setCards((prev) => [created, ...prev])
      else await load()
      setModalOpen(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create flashcard.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function onUpdate(id, payload) {
    setIsSaving(true)
    setError('')
    try {
      const data = await updateFlashcard(id, {
        question: payload.front,
        answer: payload.back,
        category: payload.category,
      })
      const updated = data?.flashcard ?? data?.card ?? data
      if (updated) {
        setCards((prev) => prev.map((c) => (c.id === id || c._id === id ? updated : c)))
      } else {
        await load()
      }
      setModalOpen(false)
      setEditing(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update flashcard.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function onDelete(id) {
    const ok = window.confirm('Delete this flashcard?')
    if (!ok) return

    setError('')
    try {
      await deleteFlashcard(id)
      setCards((prev) => prev.filter((c) => (c.id ?? c._id) !== id))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete flashcard.'))
    }
  }

  if (isLoading) return <LoadingScreen label="Loading flashcards…" />

  return (
    <div className="space-y-6">
      <Card>
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">Flashcards</h1>
              <p className="mt-1 text-sm text-slate-600">Create, edit, and organize your study material.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setCategoryModalOpen(true)}>
                Add Category
              </Button>
              <Button onClick={openCreate}>Add card</Button>
            </div>
          </div>
          
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cards..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="min-w-[160px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {filteredCards.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredCards.map((c) => {
            const id = c.id ?? c._id
            const isShared = c.is_global === true || c.owner_role === 'admin'
            // Admins can edit/delete everything. Students can only edit/delete their own cards.
            const canEdit = isAdmin || (c.user_id === user?.id && !isShared)
            const canDelete = isAdmin || (c.user_id === user?.id)
            return (
              <Card key={id}>
                <CardBody className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Question
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {isShared ? (
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                            Shared (Admin)
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                            Author: {c.owner_username || 'Student'}
                          </span>
                        )}
                        {c.category ? (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                            {c.category}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 line-clamp-3 text-sm font-semibold text-slate-900">
                        {c.front ?? c.question}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {canEdit && (
                        <Button variant="ghost" onClick={() => openEdit(c)}>
                          Edit
                        </Button>
                      )}
                      {canDelete ? (
                        <Button
                          variant="ghost"
                          className="text-rose-700 hover:bg-rose-50"
                          onClick={() => onDelete(id)}
                        >
                          Delete
                        </Button>
                      ) : (
                        <div className="text-xs font-semibold text-slate-500 mr-2">Read-only</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Answer
                    </div>
                    <div className="mt-2 line-clamp-4 text-sm text-slate-700">
                      {c.back ?? c.answer}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={categoryModalOpen}
        title="Add new category"
        description="This category will be available for your flashcards."
        onClose={() => setCategoryModalOpen(false)}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </div>
        }
      >
        <div className="space-y-1.5">
          <div className="text-sm font-medium text-slate-700">Category Name</div>
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g., Biology, Chemistry, Maths"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            autoFocus
          />
        </div>
      </Modal>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit flashcard' : 'New flashcard'}
        description="Keep it short and focused. One idea per card."
        onClose={() => {
          if (isSaving) return
          setModalOpen(false)
          setEditing(null)
        }}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false)
                setEditing(null)
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              loading={isSaving}
              onClick={() => {
                const front = draft.front.trim()
                const back = draft.back.trim()
                const category = (draft.category || '').trim()
                if (!front || !back) return
                if (editing) onUpdate(editing.id ?? editing._id, { front, back, category })
                else onCreate({ front, back, category })
              }}
            >
              {editing ? 'Save changes' : 'Create card'}
            </Button>
          </div>
        }
      >
        <div className="mb-4">
          <div className="text-sm font-medium text-slate-700">Category</div>
          <select
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">No Category</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-slate-500">Select an existing category or add a new one.</div>
            <button 
              type="button" 
              onClick={() => setCategoryModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              + Create new
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextAreaField
            label="Question"
            value={draft.front}
            onChange={(e) => setDraft((d) => ({ ...d, front: e.target.value }))}
            placeholder="e.g., What is the time complexity of binary search?"
          />
          <TextAreaField
            label="Answer"
            value={draft.back}
            onChange={(e) => setDraft((d) => ({ ...d, back: e.target.value }))}
            placeholder="e.g., O(log n)"
          />
        </div>
        <div className="mt-4 text-xs text-slate-500">
          Tip: questions should be specific; answers should be short enough to recall quickly.
        </div>
      </Modal>
    </div>
  )
}

