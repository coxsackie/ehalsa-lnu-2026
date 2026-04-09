export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-purple-800 flex flex-col items-center justify-center gap-4">
      <div className="text-white text-center">
        <div className="text-4xl font-bold mb-2">eHälsa</div>
        <div className="text-purple-200 text-sm">LNU · 16 april 2026</div>
      </div>
      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  )
}
