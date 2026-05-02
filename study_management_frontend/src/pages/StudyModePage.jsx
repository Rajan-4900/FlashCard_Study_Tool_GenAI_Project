import { useCallback, useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage, listFlashcards, saveSessionProgress } from '../services/api'
import LoadingScreen from '../components/LoadingScreen'
import Card, { CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'

function StudyCard({ card, flipped }) {
  return (
    <div
      className="group block w-full rounded-3xl border border-slate-200 bg-white p-0 text-left shadow-sm outline-none transition hover:shadow-md focus-visible:ring-4 focus-visible:ring-indigo-100"
    >
      <div className="flip-perspective">
        <div className={['flip-card', flipped ? 'is-flipped' : ''].join(' ')}>
          <div className="flip-face front">
            <div className="rounded-3xl p-7 sm:p-9">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Question</div>
              <div className="mt-3 text-lg font-semibold leading-snug text-slate-900 sm:text-2xl">
                {card?.front ?? card?.question}
              </div>
            </div>
          </div>

          <div className="flip-face back">
            <div className="rounded-3xl p-7 sm:p-9">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Answer</div>
              <div className="mt-3 whitespace-pre-wrap text-lg font-semibold leading-snug text-slate-900 sm:text-2xl">
                {card?.back ?? card?.answer}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudyModePage() {
  const [deck, setDeck] = useState([])
  const [allCards, setAllCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [resultsById, setResultsById] = useState({}) // { [cardId]: 'got_it' | 'try_again' }
  const completedCount = Object.keys(resultsById).length // unique cards answered in this session
  const [totalCount, setTotalCount] = useState(0) // cards count at start of session
  const [saved, setSaved] = useState(false)
  const [sessionFinished, setSessionFinished] = useState(false)

  const gotItCount = Object.values(resultsById).filter((s) => s === 'got_it').length
  const tryAgainCount = Object.values(resultsById).filter((s) => s === 'try_again').length

  const current = useMemo(() => deck[idx] ?? null, [deck, idx])
  const progressPct = useMemo(() => {
    if (!totalCount) return 0
    return Math.round((completedCount / totalCount) * 100)
  }, [completedCount, totalCount])

  const summary = useMemo(() => {
    const entries = Object.values(resultsById)
    const correct = entries.filter((s) => s === 'got_it').length
    const wrong = entries.filter((s) => s === 'try_again').length
    const total = totalCount
    const pct = total ? Math.round((correct / total) * 100) : 0
    return { total, correct, wrong, pct }
  }, [resultsById, totalCount])

  const isComplete = sessionFinished

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await listFlashcards()
      const list = data?.flashcards ?? data?.cards ?? data ?? []
      const fetchedCards = Array.isArray(list) ? list : []
      setAllCards(fetchedCards)

      const filtered = categoryFilter ? fetchedCards.filter(c => c.category === categoryFilter) : fetchedCards
      setDeck(filtered)
      setIdx(0)
      setFlipped(false)
      setResultsById({})
      setTotalCount(filtered.length)
      setSaved(false)
      setSessionFinished(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load flashcards.'))
    } finally {
      setIsLoading(false)
    }
  }, [categoryFilter])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    // Persist the session summary once when completed.
    if (!isComplete || saved) return
    async function persist() {
      try {
        await saveSessionProgress({
          total_questions: summary.total,
          correct_answers: summary.correct,
          wrong_answers: summary.wrong,
          score_percentage: summary.pct,
        })
        setSaved(true)
      } catch {
        // Non-blocking: summary UI still shows even if save fails.
      }
    }
    persist()
  }, [isComplete, saved, summary.correct, summary.pct, summary.total, summary.wrong])

  function nextCard() {
    setFlipped(false)
    setIdx((i) => {
      if (deck.length === 0) {
        setSessionFinished(true)
        return 0
      }
      if (i >= deck.length - 1) {
        setSessionFinished(true)
        return i
      }
      return i + 1
    })
  }

  function retryWrongCards() {
    const wrongCardIds = Object.keys(resultsById).filter(id => resultsById[id] === 'try_again')
    const wrongCards = deck.filter(c => wrongCardIds.includes(String(c.id ?? c._id)))
    
    if (wrongCards.length === 0) return

    setDeck(wrongCards)
    setIdx(0)
    setFlipped(false)
    setResultsById({})
    setTotalCount(wrongCards.length)
    setSaved(false)
    setSessionFinished(false)
  }

  function recordResult(status) {
    const id = current?.id ?? current?._id
    if (!id) return

    setResultsById((prev) => ({ ...prev, [id]: status }))
  }

  if (isLoading) return <LoadingScreen label="Loading Study Mode…" />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Study session</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Study Mode</h1>
          <p className="mt-1 text-sm text-slate-600">Flip the card, then grade yourself honestly.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isComplete && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="">All categories</option>
              <option value="General">General</option>
              {[...new Set(allCards.map(c => c.category).filter(Boolean))]
                .filter(c => c !== 'General')
                .sort()
                .map(c => <option key={c} value={c}>{c}</option>)
              }
            </select>
          )}
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
            <span className="font-semibold text-slate-900">{gotItCount}</span>{' '}
            <span className="text-slate-600">Got it</span>
          </div>
          <button
            onClick={retryWrongCards}
            disabled={tryAgainCount === 0}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span className="font-semibold text-slate-900 group-hover:text-indigo-600">{tryAgainCount}</span>{' '}
            <span className="text-slate-600 group-hover:text-slate-900">Try again</span>
          </button>
          <Button variant="secondary" onClick={load}>
            Reload
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {deck.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <div className="text-base font-semibold text-slate-900">No cards to study</div>
            <p className="mt-2 text-sm text-slate-600">Add some flashcards first, then come back here.</p>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-600">
                  Progress <span className="font-semibold text-slate-900">{completedCount}</span> /{' '}
                  <span className="font-semibold text-slate-900">{totalCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-semibold text-slate-500">{progressPct}%</div>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${progressPct}%` }} />
              </div>
            </CardBody>
          </Card>

          {isComplete ? (
            <Card>
              <CardBody className="space-y-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Session complete
                  </div>
                  <div className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                    Result summary
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Here’s how you did in this attempt.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">{summary.total}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Correct</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">{summary.correct}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Wrong</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">{summary.wrong}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Score</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">{summary.pct}%</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button variant="secondary" onClick={load}>
                    Study again
                  </Button>
                  <Button
                    onClick={() => {
                      setResultsById({})
                      setIdx(0)
                      setFlipped(false)
                      setSaved(false)
                      setSessionFinished(false)
                    }}
                  >
                    Restart Again
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <>
              <div className="mx-auto w-full max-w-3xl">
                <StudyCard card={current} flipped={flipped} />
              </div>

              <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
                {!flipped ? (
                  <>
                    <Button
                      onClick={() => {
                        recordResult('try_again')
                        setFlipped(true)
                      }}
                      className="bg-rose-500 hover:bg-rose-400 focus-visible:ring-rose-100"
                    >
                      I Don't No
                    </Button>
                    <Button
                      onClick={() => {
                        recordResult('got_it')
                        nextCard()
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-100"
                    >
                      {idx >= deck.length - 1 ? 'Finish' : 'I know this'}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => nextCard()}
                    className="col-span-1 sm:col-span-2 bg-indigo-600 hover:bg-indigo-500 focus-visible:ring-indigo-100"
                  >
                    {idx >= deck.length - 1 ? 'Finish' : 'Next Question'}
                  </Button>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

