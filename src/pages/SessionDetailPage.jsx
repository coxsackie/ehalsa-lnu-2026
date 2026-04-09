import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { SESSIONS } from '../data/program'

export default function SessionDetailPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)

  const session = SESSIONS.find(s => s.id === sessionId)

  useEffect(() => {
    const load = async () => {
      if (!auth.currentUser) return
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid))
      if (snap.exists()) {
        setBookmarked((snap.data().bookmarkedSessions || []).includes(sessionId))
      }
      setLoading(false)
    }
    load()
  }, [sessionId])

  const toggleBookmark = async () => {
    if (!auth.currentUser) return
    const ref = doc(db, 'users', auth.currentUser.uid)
    if (bookmarked) {
      await updateDoc(ref, { bookmarkedSessions: arrayRemove(sessionId) })
    } else {
      await updateDoc(ref, { bookmarkedSessions: arrayUnion(sessionId) })
    }
    setBookmarked(!bookmarked)
  }

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Session hittades inte</p>
    </div>
  )

  const typeColors = {
    social: 'text-yellow-700 bg-yellow-50',
    keynote: 'text-blue-700 bg-blue-50',
    session: 'text-purple-700 bg-purple-50',
    workshop: 'text-green-700 bg-green-50',
    break: 'text-gray-600 bg-gray-50',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-800 px-4 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-purple-300 text-sm mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Program
        </button>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-white text-xl font-bold leading-snug flex-1">{session.title}</h1>
          {!loading && (
            <button onClick={toggleBookmark} className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
              <svg className={`w-6 h-6 ${bookmarked ? 'fill-yellow-400 stroke-yellow-400' : 'fill-none stroke-white'}`}
                viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[session.type]}`}>
            {session.type === 'session' ? 'Session' : session.type === 'keynote' ? 'Keynote' : session.type === 'workshop' ? 'Workshop' : session.type === 'social' ? 'Mingel' : 'Paus'}
          </span>
          <span className="text-purple-300 text-xs">{session.startTime}–{session.endTime}</span>
          {session.room && <span className="text-purple-300 text-xs">· {session.room}</span>}
          {session.language === 'en' && <span className="text-purple-300 text-xs">· På engelska</span>}
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Description */}
        {session.description && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-700 text-sm leading-relaxed">{session.description}</p>
          </div>
        )}

        {/* Dialogue stations */}
        {session.stations && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-gray-800 font-semibold mb-3">Öppna stationer</h2>
            <div className="space-y-2">
              {session.stations.map(st => (
                <div key={st.number} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {st.number}
                  </span>
                  <p className="text-sm text-gray-700">{st.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Speakers */}
        {session.speakers?.length > 0 && (
          <div>
            <h2 className="text-gray-800 font-semibold mb-3">
              {session.speakers.length === 1 ? 'Talare' : 'Talare'}
            </h2>
            <div className="space-y-3">
              {session.speakers.map((speaker, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-700 font-bold text-sm">
                        {speaker.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{speaker.name}</p>
                      <p className="text-gray-500 text-xs">{speaker.title}</p>
                      <p className="text-gray-400 text-xs">{speaker.org}</p>
                    </div>
                  </div>
                  {speaker.talk && (
                    <div className="mt-3 pl-13 border-l-2 border-purple-200 pl-3">
                      <p className="text-sm text-gray-700 italic">"{speaker.talk}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Presentations placeholder */}
        <div>
          <h2 className="text-gray-800 font-semibold mb-3">Presentationer</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-dashed border-gray-200 text-center">
            <p className="text-gray-400 text-sm">
              Presentationer läggs upp här under och efter konferensen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
