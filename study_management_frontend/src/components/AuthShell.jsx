export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="hidden lg:block">
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm backdrop-blur">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-2 py-1.5 pr-4 text-xs font-semibold text-white">
              <div className="h-8 w-8 overflow-hidden rounded-xl bg-white border border-slate-700">
                <img src="/logo.png" alt="Logo" className="h-full w-full object-cover" />
              </div>
              Study Manager
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
              Study smarter with flashcards.
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create a focused deck, practice with quick feedback, and build consistent study habits.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">One card at a time</div>
                <div className="mt-1 text-sm text-slate-600">Flip to reveal the answer, then grade yourself.</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">Fast editing</div>
                <div className="mt-1 text-sm text-slate-600">Add, edit, and refine your cards as you learn.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-6">
            <div className="text-2xl font-semibold tracking-tight text-slate-900">{title}</div>
            {subtitle ? <div className="mt-1 text-sm text-slate-600">{subtitle}</div> : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {children}
          </div>

          {footer ? <div className="mt-5 text-sm text-slate-600">{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}

