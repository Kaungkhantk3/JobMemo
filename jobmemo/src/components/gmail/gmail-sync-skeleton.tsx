export function GmailSyncSkeleton({
  showStatusSkeleton = true,
}: {
  showStatusSkeleton?: boolean;
}) {
  return (
    <div className="space-y-4">
      {showStatusSkeleton ? (
        <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
          <div className="border-b border-zinc-200/80 bg-linear-to-r from-zinc-50 to-white px-5 py-5 md:px-6">
            <div className="h-5 w-28 animate-pulse rounded-full bg-zinc-200" />
            <div className="mt-4 h-8 w-80 max-w-full animate-pulse rounded bg-zinc-200" />
            <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-zinc-100" />
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-[1.2fr_0.8fr] md:p-6">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4"
                  >
                    <div className="h-3 w-24 animate-pulse rounded bg-zinc-200" />
                    <div className="mt-2 h-4 w-16 animate-pulse rounded bg-zinc-100" />
                  </div>
                ))}
              </div>

              <div className="h-4 w-72 animate-pulse rounded bg-zinc-100" />
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
              <div className="h-3 w-24 animate-pulse rounded bg-zinc-200" />
              <div className="mt-3 h-5 w-36 animate-pulse rounded bg-zinc-200" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-zinc-100" />
              <div className="mt-4 h-10 w-full animate-pulse rounded-lg bg-zinc-100" />
            </div>
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
        <div className="border-b border-zinc-200/80 bg-linear-to-r from-zinc-50 to-white px-5 py-5 md:px-6">
          <div className="h-5 w-28 animate-pulse rounded-full bg-zinc-200" />
          <div className="mt-4 h-8 w-80 max-w-full animate-pulse rounded bg-zinc-200" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-zinc-100" />
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-zinc-200/80 bg-white px-4 py-4 shadow-sm"
              >
                <div className="h-3 w-20 animate-pulse rounded bg-zinc-200" />
                <div className="mt-3 h-8 w-14 animate-pulse rounded bg-zinc-200" />
                <div className="mt-3 h-3 w-24 animate-pulse rounded bg-zinc-100" />
              </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-zinc-100">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="px-5 py-4 md:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="h-3 w-36 animate-pulse rounded bg-zinc-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
                </div>
                <div className="h-3 w-20 animate-pulse rounded bg-zinc-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default GmailSyncSkeleton;
