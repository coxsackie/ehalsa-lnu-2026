import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { computeMatches, getMatchLabel } from '../utils/matching'

export default function ParticipantDetailPage({ currentUser }) {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [matchInfo, setMatchInfo] = useState(null)

  const isMe = uid === currentUser?.uid

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', uid))
      if (snap.exists()) {
        const data = { uid, ...snap.data() }
        setPerson(data)
        // Compute match
        if (currentUser && uid !== currentUser.uid) {
          const matches = computeMatches(currentUser, [data])
          if (matches.length > 0) setMatchInfo(matches[0])
        }
      }
      // Check if saved
      if (currentUser) {
        setSaved((currentUser.savedContacts || []).includes(uid))
      }
      setLoading(false)
    }
    load()
  }, [uid, currentUser])

  const toggleSave = async () => {
    if (!auth.currentUser || isMe) return
    const ref = doc(db, 'users', auth.currentUser.uid)
    if (saved) {
      await updateDoc(ref, { savedContacts: arrayRemove(uid) })
    } else {
      await updateDoc(ref, { savedContacts: arrayUnion(uid) })
    }
    setSaved(!saved)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!person) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Deltagare hittades inte</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-800 px-4 pt-12 pb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-purple-300 text-sm mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tillbaka
        </button>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
            <span className="text-purple-900 font-bold text-2xl">{person.name?.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-white text-xl font-bold">{person.name}</h1>
              {isMe && <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">Du</span>}
            </div>
            {person.title && <p className="text-purple-200 text-sm mt-0.5">{person.title}</p>}
            {person.org && <p className="text-purple-300 text-sm">{person.org}</p>}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 -mt-4">
        {/* Match card */}
        {matchInfo && !isMe && (
          <div className={`rounded-2xl p-4 shadow-sm border ${
            getMatchLabel(matchInfo.score).color.includes('purple') ? 'bg-purple-50 border-purple-200' :
            getMatchLabel(matchInfo.score).color.includes('blue') ? 'bg-blue-50 border-blue-200' :
            'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-gray-800">✨ Matchningsanalys</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getMatchLabel(matchInfo.score).color}`}>
                {getMatchLabel(matchInfo.score).label}
              </span>
            </div>
            <ul className="space-y-1">
              {matchInfo.reasons.map((r, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                  <span className="mt-0.5 text-purple-500">•</span> {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact actions */}
        {!isMe && (
          <div className="flex gap-3">
            <button onClick={toggleSave}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-colors ${
                saved
                  ? 'bg-purple-700 text-white border-purple-700'
                  : 'bg-white text-purple-700 border-purple-200 hover:border-purple-400'
              }`}
            >
              {saved ? '✓ Sparad kontakt' : 'Spara kontakt'}
            </button>
            {person.email && (
              <a href={`mailto:${person.email}`}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-white border border-gray-200 text-gray-700 text-center hover:border-gray-300">
                Skicka mejl
              </a>
            )}
          </div>
        )}

        {/* Interests */}
        {person.interests?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-gray-800 font-semibold mb-3 text-sm">Intresseområden</h2>
            <div className="flex flex-wrap gap-2">
              {person.interests.map(tag => (
                <span key={tag} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Challenges */}
        {person.challenges?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-gray-800 font-semibold mb-3 text-sm">Arbetar med / Utmaningar</h2>
            <ul className="space-y-2">
              {person.challenges.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-orange-400 mt-0.5">→</span> {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Can help with */}
        {person.canHelpWith?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-gray-800 font-semibold mb-3 text-sm">Kan hjälpa med</h2>
            <ul className="space-y-2">
              {person.canHelpWith.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span> {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* LinkedIn */}
        {person.linkedin && (
          <a href={person.linkedin} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">in</span>
            </div>
            <span className="text-blue-600 text-sm font-medium">LinkedIn-profil</span>
            <svg className="w-4 h-4 text-gray-300 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
