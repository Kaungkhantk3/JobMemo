export default function AuthLoading() {
  return (
    <div className="w-full max-w-110 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 h-22 w-42 animate-pulse rounded-2xl border border-white/10 bg-white/10" />
        <div className="h-3 w-32 animate-pulse rounded bg-white/20" />
        <div className="mt-4 h-9 w-72 animate-pulse rounded bg-white/15" />
        <div className="mt-3 h-4 w-80 animate-pulse rounded bg-white/10" />
        <div className="mt-8 h-14 w-full animate-pulse rounded-2xl bg-white" />
        <div className="mt-6 h-3 w-48 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}
