import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SESSIONS, CONFERENCE_LOCATION } from '../data/program'
import { getCurrentSession, getNextSession, isConferenceDay, minutesUntil } from '../utils/time'

export default function HomePage({ profile }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000) // refresh every 30s
    return () => clearInterval(timer)
  }, [])

  const isToday = isConferenceDay()
  const currentSession = isToday ? getCurrentSession(SESSIONS) : null
  const nextSession = isToday ? getNextSession(SESSIONS) : null

  const typeColors = {
    social: 'bg-yellow-100 text-yellow-800',
    keynote: 'bg-blue-100 text-blue-800',
    session: 'bg-purple-100 text-purple-800',
    workshop: 'bg-green-100 text-green-800',
    break: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-800 px-4 pt-12 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-purple-200 text-sm">Hej, {profile?.name?.split(' ')[0]}!</p>
            <h1 className="text-white text-2xl font-bold mt-0.5">eHälsodagen 2026</h1>
            <p className="text-purple-300 text-xs mt-1">16 april · Rum Lapis, Byggnad Vita · Kalmar</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-purple-900 text-sm">
              {profile?.name?.charAt(0) || '?'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Live / Coming up */}
        {isToday ? (
          <>
            {currentSession && (
              <Link to={`/program/${currentSession.id}`}
                className="block bg-white rounded-2xl p-4 shadow-sm border-l-4 border-purple-600">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Pågår nu</span>
                  <span className="ml-auto text-xs text-gray-400">{currentSession.startTime}–{currentSession.endTime}</span>
                </div>
                <p className="font-semibold text-gray-800">{currentSession.title}</p>
                {currentSession.speakers?.length > 0 && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {currentSession.speakers.map(s => s.name).join(' · ')}
                  </p>
                )}
              </Link>
            )}
            {nextSession && (
              <Link to={`/program/${nextSession.id}`}
                className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nästa</span>
                  <span className="text-xs text-purple-600 font-medium">
                    om {minutesUntil(nextSession.startTime)} min
                  </span>
                </div>
                <p className="font-semibold text-gray-800">{nextSession.title}</p>
                <p className="text-sm text-gray-400 mt-0.5">{nextSession.startTime} · {nextSession.room}</p>
              </Link>
            )}
          </>
        ) : (
          /* Pre-conference info */
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
            <p className="text-purple-800 font-semibold">📅 Konferensen är den 16 april</p>
            <p className="text-purple-600 text-sm mt-1">
              Under konferensdagen visas aktuell session och nästa aktivitet här i realtid.
            </p>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/match" className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-4 text-white shadow-sm">
            <div className="text-2xl mb-1">✨</div>
            <p className="font-semibold text-sm">Mina matcher</p>
            <p className="text-purple-200 text-xs">Hitta rätt kontakter</p>
          </Link>
          <Link to="/participants" className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl mb-1">👥</div>
            <p className="font-semibold text-sm text-gray-800">Deltagare</p>
            <p className="text-gray-400 text-xs">Sök och bläddra</p>
          </Link>
          <Link to="/program" className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl mb-1">📅</div>
            <p className="font-semibold text-sm text-gray-800">Program</p>
            <p className="text-gray-400 text-xs">Hela dagens schema</p>
          </Link>
          <Link to="/profile" className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl mb-1">👤</div>
            <p className="font-semibold text-sm text-gray-800">Min profil</p>
            <p className="text-gray-400 text-xs">Redigera intressen</p>
          </Link>
        </div>

        {/* Today's program summary */}
        <div>
          <h2 className="text-gray-800 font-semibold mb-3">Dagens program</h2>
          <div className="space-y-2">
            {SESSIONS.map(session => (
              <Link
                key={session.id}
                to={`/program/${session.id}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white border border-gray-100 ${
                  currentSession?.id === session.id ? 'ring-2 ring-purple-400' : ''
                }`}
              >
                <span className="text-gray-400 text-xs w-10 flex-shrink-0 font-mono">{session.startTime}</span>
                <span className="flex-1 text-sm text-gray-700 font-medium truncate">{session.title}</span>
                {session.language === 'en' && (
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">EN</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
