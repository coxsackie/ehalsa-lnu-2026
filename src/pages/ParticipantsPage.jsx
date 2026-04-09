import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { INTEREST_TAGS } from '../data/program'
import TagChip from '../components/TagChip'

export default function ParticipantsPage({ currentUser }) {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [showTagFilter, setShowTagFilter] = useState(false)

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, 'users'))
      setParticipants(snap.docs.map(d => ({ uid: d.id, ...d.data() })))
      setLoading(false)
    }
    load()
  }, [])

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const filtered = participants.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.name?.toLowerCase().includes(q) ||
      p.org?.toLowerCase().includes(q) ||
      p.title?.toLowerCase().includes(q)

    const matchTags = selectedTags.length === 0 ||
      selectedTags.some(tag => p.interests?.includes(tag))

    return matchSearch && matchTags
  })

  const isMe = (p) => p.uid === currentUser?.uid

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-800 px-4 pt-12 pb-4">
        <h1 className="text-white text-xl font-bold">Deltagare</h1>
        <p className="text-purple-300 text-sm mt-0.5">{participants.length} registrerade</p>

        {/* Search */}
        <div className="relative mt-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Sök namn, organisation..."
            className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Tag filter toggle */}
        <button
          onClick={() => setShowTagFilter(!showTagFilter)}
          className="flex items-center gap-1.5 mt-2 text-purple-200 text-sm"
        >
          <svg className={`w-4 h-4 transition-transform ${showTagFilter ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          Filtrera på intresse
          {selectedTags.length > 0 && (
            <span className="bg-yellow-400 text-purple-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {selectedTags.length}
            </span>
          )}
        </button>
      </div>

      {/* Tag filter panel */}
      {showTagFilter && (
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {INTEREST_TAGS.map(tag => (
              <TagChip key={tag} tag={tag} size="sm"
                selected={selectedTags.includes(tag)}
                onClick={() => toggleTag(tag)}
              />
            ))}
          </div>
          {selectedTags.length > 0 && (
            <button onClick={() => setSelectedTags([])} className="mt-2 text-xs text-purple-600 hover:underline">
              Rensa filter
            </button>
          )}
        </div>
      )}

      {/* List */}
      <div className="px-4 py-3 space-y-2">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Laddar deltagare...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {search || selectedTags.length ? 'Inga träffar för din sökning' : 'Inga deltagare ännu'}
          </div>
        ) : (
          filtered.map(p => (
            <Link
              key={p.uid}
              to={`/participants/${p.uid}`}
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-700 font-bold">
                  {p.name?.charAt(0) || '?'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                  {isMe(p) && <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full flex-shrink-0">Du</span>}
                </div>
                {(p.title || p.org) && (
                  <p className="text-xs text-gray-500 truncate">
                    {[p.title, p.org].filter(Boolean).join(' · ')}
                  </p>
                )}
                {p.interests?.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {p.interests.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                    {p.interests.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{p.interests.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
