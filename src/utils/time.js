// Time utilities for conference schedule

export function parseTime(timeStr) {
  // "09:30" → Date object with today's date
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

export function getCurrentSession(sessions) {
  const now = new Date()
  return sessions.find(s => {
    const start = parseTime(s.startTime)
    const end = parseTime(s.endTime)
    return now >= start && now <= end
  })
}

export function getNextSession(sessions) {
  const now = new Date()
  return sessions.find(s => {
    const start = parseTime(s.startTime)
    return start > now
  })
}

export function isConferenceDay() {
  const today = new Date()
  return (
    today.getFullYear() === 2026 &&
    today.getMonth() === 3 && // April = 3 (0-indexed)
    today.getDate() === 16
  )
}

export function minutesUntil(timeStr) {
  const target = parseTime(timeStr)
  const now = new Date()
  return Math.round((target - now) / 60000)
}
