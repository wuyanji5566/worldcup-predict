export function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
      <span className="w-2 h-2 rounded-full bg-live live-pulse" />
      <span className="text-xs font-bold text-red-400">LIVE</span>
    </span>
  )
}
