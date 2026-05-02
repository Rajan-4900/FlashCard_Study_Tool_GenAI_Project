import { useEffect } from 'react'

export default function Modal({ open, title, description, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-end justify-center p-4 sm:items-center">
        <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-base font-semibold tracking-tight text-slate-900">{title}</div>
                {description ? <div className="mt-1 text-sm text-slate-600">{description}</div> : null}
              </div>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"
                aria-label="Close"
                onClick={onClose}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 pb-6">{children}</div>

          {footer ? <div className="border-t border-slate-100 px-6 py-4">{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}

