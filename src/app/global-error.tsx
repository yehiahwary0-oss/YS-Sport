'use client'

/**
 * Catches errors thrown in the ROOT layout ([locale]/layout.tsx) itself,
 * where no next-intl context or <html> wrapper is available — so this page
 * is self-contained: its own <html>/<body> and static bilingual text
 * (next-intl can't be used here by design).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error(error)

  return (
    <html lang="en" dir="ltr">
      <body className="flex min-h-screen items-center justify-center bg-navy-900 px-6 font-sans">
        <div className="w-full max-w-md text-center" role="alert">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-green text-navy-900">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              <path d="M12 2L4 6V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V6L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-zinc-50">YS Sports</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Something went wrong. Please try again.
            <br />
            حدث خطأ ما. يرجى المحاولة مرة أخرى.
          </p>
          <button
            onClick={reset}
            className="btn-primary mt-8 w-full"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
