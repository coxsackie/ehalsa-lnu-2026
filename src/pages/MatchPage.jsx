import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { computeMatches, getMatchLabel } from '../utils/matching'

export default function MatchPage({ currentUser }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const hasProfile = currentUser?.interests?.length > 0 ||
    currentUser?.challenges?.length > 0 ||
    currentUser?.canHelpWith?.length > 0

  useEffect(() => {
    if (!currentUser || !hasProfile) { setLoading(false); return }
    const load = async () => {
      const snap = await getDocs(collection(db, 'users'))
      const all = snap.docs.map(d => ({ uid: d.id, ...d.data() }))
      setMatches(computeMatches(currentUser, all))
      setLoading(false)
    }
    load()
  }, [currentUser])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-800 px-4 pt-12 pb-6">
        <h1 className="text-white text-xl font-bold">Matchning</h1>
        <p className="text-purple-300 text-sm mt-0.5">
          Deltagare med liknande intressen och komplementär kompetens
        </p>
      </div>

      {/* How it works */}
      <div className="bg-purple-50 border-b border-purple-100 px-4 py-3">
        <p className="text-purple-800 text-xs leading-relaxed">
          <strong>Hur fungerar matchningen?</strong> Vi jämför dina intressetaggar, dina utmaningar och vad du kan hjälpa med — och hittar deltagare som kompletterar dig bäst.
        </p>
      </div>

      <div className="px-4 py-4">
        {!hasProfile ? (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-4xl mb-3">👤</div>
            <h2 className="text-gray-800 font-semibold mb-2">Komplettera din profil</h2>
            <p className="text-gray-500 text-sm mb-4">
              Lägg till dina intresseområden, utmaningar och vad du kan hjälpa med för att få personliga matcher.
            </p>
            <Link to="/profile"
              className="inline-block bg-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm">
              Uppdatera profil
            </Link>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Beräknar matcher...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-4xl mb-3">🔍</div>
            <h2 className="text-gray-800 font-semibold mb-2">Inga matcher än</h2>
            <p className="text-gray-500 text-sm">
              Matcher visas när fler deltagare registrerar sig. Kolla igen under konferensen!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">{matches.length} möjliga kontakter hittade</p>
            {matches.map(({ user: p, score, reasons }) => {
              const match = getMatchLabel(score)
              return (
                <Link
                  key={p.uid}
                  to={`/participants/${p.uid}`}
                  className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-700 font-bold">{p.name?.charAt(0)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${match.color}`}>
                          {match.label}
                        </span>
                      </div>
                      {(p.title || p.org) && (
                        <p className="text-xs text-gray-500 truncate">
                          {[p.title, p.org].filter(Boolean).join(' · ')}
                        </p>
                      )}

                      {/* Match reasons */}
                      <div className="mt-2 space-y-0.5">
                        {reasons.map((r, i) => (
                          <p key={i} className="text-xs text-gray-600 flex items-start gap-1">
                            <span className="text-purple-400 flex-shrink-0">✦</span> {r}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
