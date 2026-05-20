export default function DashboardLoading() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-50">
      <div className="hidden border-b border-zinc-200 bg-white px-6 py-3.5 md:flex">
        <div className="h-5 w-36 animate-pulse rounded bg-zinc-200" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-5">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="h-3 w-20 animate-pulse rounded bg-zinc-200" />
                <div className="mt-3 h-8 w-24 animate-pulse rounded bg-zinc-200" />
                <div className="mt-3 h-3 w-32 animate-pulse rounded bg-zinc-100" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 md:px-5">
              <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
              <div className="h-9 w-28 animate-pulse rounded-xl bg-zinc-200" />
            </div>

            <div className="divide-y divide-zinc-100">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 px-4 py-4 md:px-5"
                >
                  <div className="col-span-5 h-4 animate-pulse rounded bg-zinc-200" />
                  <div className="col-span-3 h-4 animate-pulse rounded bg-zinc-200" />
                  <div className="col-span-2 h-4 animate-pulse rounded bg-zinc-200" />
                  <div className="col-span-2 h-4 animate-pulse rounded bg-zinc-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
