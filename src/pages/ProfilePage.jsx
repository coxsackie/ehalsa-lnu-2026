import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { auth, db } from '../firebase'
import { INTEREST_TAGS } from '../data/program'
import TagChip from '../components/TagChip'

export default function ProfilePage({ user, profile, onSave }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState(profile?.name || '')
  const [title, setTitle] = useState(profile?.title || '')
  const [org, setOrg] = useState(profile?.org || '')
  const [linkedin, setLinkedin] = useState(profile?.linkedin || '')
  const [interests, setInterests] = useState(profile?.interests || [])
  const [challengeText, setChallengeText] = useState((profile?.challenges || []).join('\n'))
  const [helpText, setHelpText] = useState((profile?.canHelpWith || []).join('\n'))

  const splitLines = (text) => text.split('\n').map(s => s.trim()).filter(Boolean)

  const toggleInterest = (tag) => {
    setInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        title: title.trim(),
        org: org.trim(),
        linkedin: linkedin.trim(),
        interests,
        challenges: splitLines(challengeText),
        canHelpWith: splitLines(helpText),
      })
      await onSave()
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => signOut(auth)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-800 px-4 pt-12 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-xl font-bold">Min profil</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="text-purple-200 text-sm hover:text-white"
          >
            {editing ? 'Avbryt' : 'Redigera'}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center">
            <span className="text-purple-900 font-bold text-2xl">{profile?.name?.charAt(0) || '?'}</span>
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{profile?.name}</p>
            {profile?.title && <p className="text-purple-200 text-sm">{profile.title}</p>}
            {profile?.org && <p className="text-purple-300 text-sm">{profile.org}</p>}
            <p className="text-purple-400 text-xs mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-green-500 text-white text-sm text-center py-2.5 font-medium">
          ✓ Profil sparad!
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        {editing ? (
          /* Edit mode */
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <h2 className="font-semibold text-gray-800 text-sm">Grunduppgifter</h2>
              {[
                { label: 'Namn', value: name, set: setName, placeholder: 'Förnamn Efternamn' },
                { label: 'Titel', value: title, set: setTitle, placeholder: 'Titel / Roll' },
                { label: 'Organisation', value: org, set: setOrg, placeholder: 'Organisation' },
                { label: 'LinkedIn', value: linkedin, set: setLinkedin, placeholder: 'https://linkedin.com/in/...' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs text-gray-500 mb-0.5 block">{f.label}</label>
                  <input
                    type="text"
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">Intresseområden</h2>
              <div className="flex flex-wrap gap-2">
                {INTEREST_TAGS.map(tag => (
                  <TagChip key={tag} tag={tag} size="sm"
                    selected={interests.includes(tag)}
                    onClick={() => toggleInterest(tag)}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-800 text-sm">Matchningsprofil</h2>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Mina utmaningar (en per rad)</label>
                <textarea rows={3} value={challengeText} onChange={e => setChallengeText(e.target.value)}
                  placeholder="Vad arbetar du med att lösa?"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Jag kan hjälpa med (en per rad)</label>
                <textarea rows={3} value={helpText} onChange={e => setHelpText(e.target.value)}
                  placeholder="Vad kan du erbjuda andra?"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-3.5 bg-purple-700 text-white rounded-xl font-semibold disabled:opacity-50">
              {saving ? 'Sparar...' : 'Spara ändringar'}
            </button>
          </>
        ) : (
          /* View mode */
          <>
            {/* Interests */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">
                Intresseområden {!profile?.interests?.length && <span className="text-gray-400 font-normal">(inga valda)</span>}
              </h2>
              {profile?.interests?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map(tag => (
                    <span key={tag} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <button onClick={() => setEditing(true)} className="text-purple-600 text-sm hover:underline">
                  + Lägg till intressen
                </button>
              )}
            </div>

            {/* Challenges */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-semibold text-gray-800 text-sm mb-2">Mina utmaningar</h2>
              {profile?.challenges?.length > 0 ? (
                <ul className="space-y-1.5">
                  {profile.challenges.map((c, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">→</span> {c}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-400 text-sm">Inget angivet</p>}
            </div>

            {/* Can help */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-semibold text-gray-800 text-sm mb-2">Kan hjälpa med</h2>
              {profile?.canHelpWith?.length > 0 ? (
                <ul className="space-y-1.5">
                  {profile.canHelpWith.map((c, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span> {c}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-400 text-sm">Inget angivet</p>}
            </div>

            {/* LinkedIn */}
            {profile?.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">in</span>
                </div>
                <span className="text-blue-600 text-sm">LinkedIn-profil</span>
              </a>
            )}

            {/* Sign out */}
            <button onClick={handleSignOut}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium mt-2">
              Logga ut
            </button>
          </>
        )}
      </div>
    </div>
  )
}
