import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SESSIONS } from '../data/program'
import { getCurrentSession, isConferenceDay } from '../utils/time'

const typeStyle = {
  social:   { bg: 'bg-yellow-50 border-yellow-200',  dot: 'bg-yellow-400', label: 'Mingel' },
  keynote:  { bg: 'bg-blue-50 border-blue-200',      dot: 'bg-blue-500',   label: 'Keynote' },
  session:  { bg: 'bg-purple-50 border-purple-200',  dot: 'bg-purple-600', label: 'Session' },
  workshop: { bg: 'bg-green-50 border-green-200',    dot: 'bg-green-500',  label: 'Workshop' },
  break:    { bg: 'bg-gray-50 border-gray-200',      dot: 'bg-gray-300',   label: 'Paus' },
}

export default function ProgramPage() {
  const isToday = isConferenceDay()
  const current = isToday ? getCurrentSession(SESSIONS) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-800 px-4 pt-12 pb-5">
        <h1 className="text-white text-xl font-bold">Program</h1>
        <p className="text-purple-300 text-sm mt-0.5">16 april 2026 · Rum Lapis, Byggnad Vita</p>
      </div>

      <div className="px-4 py-4">
        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[30px] top-0 bottom-0 w-px bg-gray-200" />

          <div className="space-y-3">
            {SESSIONS.map((session) => {
              const style = typeStyle[session.type] || typeStyle.session
              const isNow = current?.id === session.id

              return (
                <Link
                  key={session.id}
                  to={`/program/${session.id}`}
                  className={`flex gap-3 items-start ${session.type === 'break' ? 'opacity-70' : ''}`}
                >
                  {/* Time + dot */}
                  <div className="flex-shrink-0 w-[60px] flex flex-col items-center pt-1">
                    <span className="text-xs text-gray-400 font-mono">{session.startTime}</span>
                    <div className={`w-3 h-3 rounded-full mt-1 ${style.dot} ${isNow ? 'ring-2 ring-offset-2 ring-purple-400' : ''}`} />
                  </div>

                  {/* Card */}
                  <div className={`flex-1 rounded-xl border p-3 ${style.bg} ${isNow ? 'ring-2 ring-purple-400 shadow-md' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold text-sm text-gray-800 leading-tight ${session.type === 'break' ? 'text-gray-500 font-normal' : ''}`}>
                        {session.title}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {session.language === 'en' && (
                          <span className="text-[10px] bg-white text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded">EN</span>
                        )}
                        {isNow && (
                          <span className="flex items-center gap-1 text-[10px] text-red-600 font-semibold">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            NU
                          </span>
                        )}
                      </div>
                    </div>

                    {session.speakers?.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {session.speakers.map(s => s.name).join(' · ')}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">{session.startTime}–{session.endTime}</span>
                      {session.room && <span className="text-[10px] text-gray-400">· {session.room}</span>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
