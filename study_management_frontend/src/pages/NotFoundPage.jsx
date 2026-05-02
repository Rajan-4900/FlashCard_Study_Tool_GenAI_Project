import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="text-sm font-medium text-slate-500">404</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/dashboard"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          Go to dashboard
        </Link>
        <Link
          to="/flashcards"
          className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-200"
        >
          Flashcards
        </Link>
      </div>
    </div>
  )
}

