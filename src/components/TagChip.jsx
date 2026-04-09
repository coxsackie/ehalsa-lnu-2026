export default function TagChip({ tag, selected, onClick, size = 'md' }) {
  const base = 'rounded-full font-medium transition-all cursor-pointer select-none border'
  const sizes = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  }
  const styles = selected
    ? 'bg-purple-700 text-white border-purple-700'
    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-700'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${sizes[size]} ${styles}`}
    >
      {tag}
    </button>
  )
}
