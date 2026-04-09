import { useState } from 'react'
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { auth } from '../firebase'

const ACTION_CODE_SETTINGS = {
  url: window.location.origin + '/login',
  handleCodeInApp: true,
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle email link sign-in on return
  useState(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const savedEmail = window.localStorage.getItem('emailForSignIn')
      if (savedEmail) {
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(() => window.localStorage.removeItem('emailForSignIn'))
          .catch(e => setError(e.message))
      }
    }
  })

  const handleSend = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await sendSignInLinkToEmail(auth, email, ACTION_CODE_SETTINGS)
      window.localStorage.setItem('emailForSignIn', email)
      setSent(true)
    } catch (e) {
      setError('Kunde inte skicka e-post. Kontrollera adressen och försök igen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-purple-800 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-2xl bg-yellow-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl font-bold text-purple-900">eH</span>
          </div>
          <h1 className="text-3xl font-bold text-white">eHälsodagen</h1>
          <p className="text-purple-200 mt-1">Linnéuniversitetet · 16 april 2026</p>
        </div>

        {!sent ? (
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-gray-800 font-semibold text-lg mb-1">Logga in</h2>
              <p className="text-gray-500 text-sm mb-5">
                Ange din e-postadress så skickar vi en inloggningslänk — inget lösenord behövs.
              </p>
              <form onSubmit={handleSend} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="din@epost.se"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-purple-700 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-purple-800 transition-colors"
                >
                  {loading ? 'Skickar...' : 'Skicka inloggningslänk'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-800 text-lg">Kolla din e-post!</h2>
              <p className="text-gray-500 text-sm mt-1">
                Vi har skickat en inloggningslänk till <strong>{email}</strong>.
                Klicka på länken i mailet för att logga in.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 text-purple-600 text-sm hover:underline"
              >
                Prova en annan adress
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center pb-8 text-purple-300 text-xs">
        Konferensapp för eHälsodagen LNU 2026
      </div>
    </div>
  )
}
