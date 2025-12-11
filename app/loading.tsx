// Loading UI - Shown while pages are loading

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-foreground/70">Loading...</p>
      </div>
    </div>
  )
}
