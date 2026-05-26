export default function GmailLoading() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-linear-to-br from-zinc-50 to-white">
      <header className="shrink-0 border-b border-zinc-200/80 bg-white/70 px-3 py-4 backdrop-blur md:px-6 md:py-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
          Gmail Sync
        </p>
        <h1 className="mt-2 text-[20px] font-semibold tracking-tight text-zinc-950 md:text-[24px]">
          Job emails and follow-up status
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-5">
        <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
          <div className="border-b border-zinc-200/80 px-5 py-5 md:px-6">
            <div className="h-5 w-28 animate-pulse rounded-full bg-zinc-200" />
            <div className="mt-4 h-8 w-80 animate-pulse rounded bg-zinc-200" />
            <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-zinc-100" />
            <div className="mt-4 flex gap-2">
              <div className="h-7 w-24 animate-pulse rounded-full bg-zinc-100" />
              <div className="h-7 w-28 animate-pulse rounded-full bg-zinc-100" />
              <div className="h-7 w-28 animate-pulse rounded-full bg-zinc-100" />
            </div>
          </div>

          <div className="divide-y divide-zinc-100">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="px-5 py-4 md:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-36 animate-pulse rounded bg-zinc-200" />
                    <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
                    <div className="mt-3 h-3 w-full animate-pulse rounded bg-zinc-100" />
                    <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-zinc-100" />
                  </div>
                  <div className="h-3 w-20 animate-pulse rounded bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
