import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

import BottomNav from './components/BottomNav'
import LoadingScreen from './components/LoadingScreen'

import HomePage from './pages/HomePage'
import ProgramPage from './pages/ProgramPage'
import SessionDetailPage from './pages/SessionDetailPage'
import ParticipantsPage from './pages/ParticipantsPage'
import ParticipantDetailPage from './pages/ParticipantDetailPage'
import MatchPage from './pages/MatchPage'
import ProfilePage from './pages/ProfilePage'
import OnboardingPage from './pages/OnboardingPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        setProfile(snap.exists() ? { uid: firebaseUser.uid, ...snap.data() } : null)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const refreshProfile = async () => {
    if (!user) return
    const snap = await getDoc(doc(db, 'users', user.uid))
    setProfile(snap.exists() ? { uid: user.uid, ...snap.data() } : null)
  }

  if (loading) return <LoadingScreen />

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto bg-white relative">
        <Routes>
          {/* Auth */}
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : <LoginPage />
          } />

          {/* Onboarding — shown if logged in but no profile */}
          <Route path="/onboarding" element={
            !user ? <Navigate to="/login" replace /> :
            profile ? <Navigate to="/" replace /> :
            <OnboardingPage user={user} onComplete={refreshProfile} />
          } />

          {/* Main app routes — require auth + profile */}
          <Route path="/*" element={
            !user ? <Navigate to="/login" replace /> :
            !profile ? <Navigate to="/onboarding" replace /> :
            <AuthenticatedApp user={user} profile={profile} refreshProfile={refreshProfile} />
          } />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

function AuthenticatedApp({ user, profile, refreshProfile }) {
  return (
    <>
      <div className="pb-[80px]">
        <Routes>
          <Route path="/" element={<HomePage profile={profile} />} />
          <Route path="/program" element={<ProgramPage />} />
          <Route path="/program/:sessionId" element={<SessionDetailPage />} />
          <Route path="/participants" element={<ParticipantsPage currentUser={profile} />} />
          <Route path="/participants/:uid" element={<ParticipantDetailPage currentUser={profile} />} />
          <Route path="/match" element={<MatchPage currentUser={profile} />} />
          <Route path="/profile" element={<ProfilePage user={user} profile={profile} onSave={refreshProfile} />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  )
}
