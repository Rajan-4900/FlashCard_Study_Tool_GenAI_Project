import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage, listFlashcards } from '../services/api'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [cards, setCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [viewMode, setViewMode] = useState('none') // 'none' | 'total' | 'review' | 'mastered'



  const stats = useMemo(() => {
    const filteredCards = categoryFilter ? cards.filter(c => c.category === categoryFilter) : cards
    const total = filteredCards.length
    const toReviewCount = Math.min(total, 10)
    return {
      total,
      toReview: toReviewCount,
      mastered: Math.max(0, total - toReviewCount),
      totalCards: filteredCards,
      reviewCards: filteredCards.slice(0, toReviewCount),
      masteredCards: filteredCards.slice(toReviewCount)
    }
  }, [cards, categoryFilter])

  useEffect(() => {
    let alive = true
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const data = await listFlashcards()
        const list = data?.cards ?? data ?? []
        if (alive) {
          setCards(Array.isArray(list) ? list : [])
        }
      } catch (err) {
        if (alive) setError(getApiErrorMessage(err, 'Failed to load your dashboard.'))
      } finally {
        if (alive) setIsLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [user])

  useEffect(() => {
    if (isLoading || !user?.id) return

    const tourKey = `onboarding_completed_${user.id}`
    if (localStorage.getItem(tourKey)) return

    const startTour = () => {
      // Check if the dashboard stats container exists, indicating the page is rendered
      if (!document.getElementById('tour-stats')) {
        // If not found yet, try again in a moment
        return setTimeout(startTour, 200)
      }

      const driverObj = driver({
        showProgress: true,
        showButtons: ['next'],
        allowClose: false, // Force them to use Next or Skip
        onPopoverRender: (popover, { driver }) => {
          try {
            if (popover.closeButton) popover.closeButton.style.display = 'none'

            if (popover.footerButtons && popover.nextButton) {
              if (!popover.footerButtons.querySelector('.custom-skip-btn')) {
                const skipBtn = document.createElement('button')
                skipBtn.innerText = 'Skip'
                skipBtn.className = 'custom-skip-btn'
                skipBtn.style.backgroundColor = 'transparent'
                skipBtn.style.color = '#64748b'
                skipBtn.style.border = '1px solid #cbd5e1'
                skipBtn.style.padding = '5px 12px'
                skipBtn.style.borderRadius = '8px'
                skipBtn.style.fontSize = '13px'
                skipBtn.style.fontWeight = '600'
                skipBtn.style.cursor = 'pointer'
                skipBtn.style.marginRight = '8px'
                skipBtn.style.transition = 'background-color 0.2s'
                
                skipBtn.onmouseover = () => { skipBtn.style.backgroundColor = '#f1f5f9' }
                skipBtn.onmouseout = () => { skipBtn.style.backgroundColor = 'transparent' }
                
                skipBtn.onclick = (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  localStorage.setItem(tourKey, 'true')
                  driver.destroy()
                }
                popover.footerButtons.insertBefore(skipBtn, popover.nextButton)
              }
            }
          } catch (e) {
            console.error('Driver popover error:', e)
          }
        },
        steps: [
          {
            popover: {
              title: 'Welcome to Study Manager!',
              description: 'Keep it simple: add cards, practice daily, refine what you miss. Let us show you around.',
            },
          },
          {
            element: '#tour-nav-dashboard',
            popover: {
              title: 'Dashboard Overview',
              description: 'Your central hub. See your overall stats and track your mastery here.',
              side: 'right',
              align: 'center',
            },
          },
          {
            element: '#tour-nav-flashcards',
            popover: {
              title: 'Manage Your Deck',
              description: 'Create, edit, and organize your flashcards here. Keep cards short and focused!',
              side: 'right',
              align: 'center',
            },
          },
          {
            element: '#tour-nav-study',
            popover: {
              title: 'Study & Grade',
              description: 'Test yourself! This is where you practice daily to improve your retention.',
              side: 'right',
              align: 'center',
            },
          },
          {
            element: '#tour-stats',
            popover: {
              title: 'Track Your Progress',
              description: 'Keep an eye on how many cards you need to review and how many you have mastered.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '#tour-create-card',
            popover: {
              title: 'Start Building',
              description: 'Add 10-20 cards to begin. Click here to jump straight into creating your first prompt and answer.',
              side: 'top',
              align: 'start',
            },
          },
          {
            element: '#tour-study-now',
            popover: {
              title: 'Ready to Practice?',
              description: "Click here whenever you're ready to start a 10-minute daily session.",
              side: 'top',
              align: 'start',
            },
          },
        ],
        onDestroyStarted: () => {
          localStorage.setItem(tourKey, 'true')
        }
      })
      driverObj.drive()
    }

    const timerId = setTimeout(startTour, 500)
    return () => clearTimeout(timerId)
  }, [isLoading, user?.id])

  if (isLoading) return <LoadingScreen label="Loading dashboard…" />

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dashboard</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Welcome{user?.username ? `, ${user.username}` : ''}.
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Keep it simple: add cards, practice daily, refine what you miss.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50/50 p-2 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Filter:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="min-w-[160px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">All categories</option>
                {[...new Set(cards.map(c => c.category).filter(Boolean))]
                  .sort()
                  .map(c => <option key={c} value={c}>{c}</option>)
                }
              </select>
            </div>
            {isAdmin ? (
              <Link to="/admin">
                <Button variant="ghost">Admin</Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section id="tour-stats" className={`grid grid-cols-1 gap-4 ${isAdmin ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        <Link 
          to="/flashcards"
          className="block transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Card className="h-full">
            <CardBody className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total cards
              </div>
              <div className="text-3xl font-semibold tracking-tight text-slate-900">{stats.total}</div>
              <div className="text-sm text-slate-600">Your current deck size.</div>
            </CardBody>
          </Card>
        </Link>

        <div 
          onClick={() => setViewMode(viewMode === 'review' ? 'none' : 'review')}
          className={`cursor-pointer block transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${viewMode === 'review' ? 'ring-2 ring-indigo-600 ring-offset-2' : ''}`}
        >
          <Card className="h-full">
            <CardBody className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                To review
              </div>
              <div className="text-3xl font-semibold tracking-tight text-slate-900">{stats.toReview}</div>
              <div className="text-sm text-slate-600">A small daily target.</div>
            </CardBody>
          </Card>
        </div>

        {!isAdmin && (
          <div 
            onClick={() => setViewMode(viewMode === 'mastered' ? 'none' : 'mastered')}
            className={`cursor-pointer block transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${viewMode === 'mastered' ? 'ring-2 ring-indigo-600 ring-offset-2' : ''}`}
          >
            <Card className="h-full">
              <CardBody className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mastered
                </div>
                <div className="text-3xl font-semibold tracking-tight text-slate-900">{stats.mastered}</div>
                <div className="text-sm text-slate-600">Cards you feel confident about.</div>
              </CardBody>
            </Card>
          </div>
        )}
      </section>

      {viewMode !== 'none' && (
        <Card className="animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader 
            title={`${viewMode === 'total' ? 'Total' : viewMode === 'review' ? 'To Review' : 'Mastered'} Cards`}
            description={`Showing ${viewMode === 'total' ? stats.total : viewMode === 'review' ? stats.toReview : stats.mastered} items.`}
          >
            <Button variant="ghost" size="sm" onClick={() => setViewMode('none')}>Close</Button>
          </CardHeader>
          <CardBody>
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {(viewMode === 'total' ? stats.totalCards : viewMode === 'review' ? stats.reviewCards : stats.masteredCards).map((card, i) => (
                <div key={card.id || i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">{card.category || 'General'}</div>
                  <div className="text-sm font-semibold text-slate-900 line-clamp-1">{card.question || card.front}</div>
                  <div className="text-xs text-slate-500 mt-1 line-clamp-1 italic">{card.answer || card.back}</div>
                </div>
              ))}
              {(viewMode === 'total' ? stats.totalCards : viewMode === 'review' ? stats.reviewCards : stats.masteredCards).length === 0 && (
                <div className="py-8 text-center text-sm text-slate-500 italic">No cards in this category.</div>
              )}
            </div>
            <div className="mt-4 flex justify-center">
              <Link to="/flashcards" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                View all in FlashCards →
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-1">

        <Card>
          <CardHeader title="Quick actions" description="Jump straight into work." />
          <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link id="tour-create-card" to="/flashcards" className="block">
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50">
                <div className="text-sm font-semibold text-slate-900">Create a card</div>
                <div className="mt-1 text-sm text-slate-600">Add a new prompt + answer.</div>
              </div>
            </Link>
            <Link id="tour-study-now" to="/study" className="block">
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50">
                <div className="text-sm font-semibold text-slate-900">Study now</div>
                <div className="mt-1 text-sm text-slate-600">Flip, then grade yourself.</div>
              </div>
            </Link>
          </CardBody>
        </Card>
      </section>


    </div>
  )
}

