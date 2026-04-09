import { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { INTEREST_TAGS } from '../data/program'
import TagChip from '../components/TagChip'

const STEPS = ['info', 'interests', 'challenges']

export default function OnboardingPage({ user, onComplete }) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(user.displayName || '')
  const [title, setTitle] = useState('')
  const [org, setOrg] = useState('')
  const [linkedin, setLinkedin] = useState('')

  const [interests, setInterests] = useState([])
  const [challengeText, setChallengeText] = useState('')
  const [helpText, setHelpText] = useState('')

  const toggleInterest = (tag) => {
    setInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const splitLines = (text) => text.split('\n').map(s => s.trim()).filter(Boolean)

  const handleFinish = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        email: user.email,
        title: title.trim(),
        org: org.trim(),
        linkedin: linkedin.trim(),
        interests,
        challenges: splitLines(challengeText),
        canHelpWith: splitLines(helpText),
        savedContacts: [],
        bookmarkedSessions: [],
        createdAt: serverTimestamp(),
      })
      onComplete()
    } catch (e) {
      console.error(e)
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress */}
      <div className="bg-purple-700 px-4 pt-12 pb-6">
        <div className="flex gap-2 mb-4">
          {STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-yellow-400' : 'bg-purple-500'}`} />
          ))}
        </div>
        <h1 className="text-white text-xl font-bold">
          {step === 0 && 'Berätta om dig'}
          {step === 1 && 'Dina intresseområden'}
          {step === 2 && 'Utmaningar & kompetens'}
        </h1>
        <p className="text-purple-200 text-sm mt-1">
          {step === 0 && 'Steg 1 av 3'}
          {step === 1 && 'Steg 2 av 3 — välj gärna flera!'}
          {step === 2 && 'Steg 3 av 3 — detta möjliggör matchning'}
        </p>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Namn *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Förnamn Efternamn"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titel / Roll</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="t.ex. Forskare, Projektledare, eHälsosamordnare"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
              <input
                type="text"
                value={org}
                onChange={e => setOrg(e.target.value)}
                placeholder="t.ex. Linnéuniversitetet, Region Kalmar"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn (valfritt)</label>
              <input
                type="url"
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/dittnamn"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              Välj de ämnen som är relevanta för ditt arbete och dina intressen inom e-hälsa.
            </p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_TAGS.map(tag => (
                <TagChip
                  key={tag}
                  tag={tag}
                  selected={interests.includes(tag)}
                  onClick={() => toggleInterest(tag)}
                />
              ))}
            </div>
            {interests.length > 0 && (
              <p className="mt-4 text-purple-700 text-sm font-medium">
                ✓ {interests.length} valda
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Mina utmaningar
              </label>
              <p className="text-gray-500 text-xs mb-2">
                Vad arbetar du med att lösa just nu? (en per rad)
              </p>
              <textarea
                value={challengeText}
                onChange={e => setChallengeText(e.target.value)}
                rows={4}
                placeholder={`t.ex.\nImplementera digitala vårdsystem\nFörbättra patientengagemang\nAnalysera hälsodata i stor skala`}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Jag kan hjälpa med
              </label>
              <p className="text-gray-500 text-xs mb-2">
                Vad har du erfarenhet av som kan hjälpa andra? (en per rad)
              </p>
              <textarea
                value={helpText}
                onChange={e => setHelpText(e.target.value)}
                rows={4}
                placeholder={`t.ex.\nKlinisk informatik och beslutstöd\nForskningsmetodik\neHälsoapp-utvärdering`}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-4 py-4 bg-white border-t border-gray-100">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-none px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium"
            >
              Tillbaka
            </button>
          )}
          <button
            onClick={() => {
              if (step < STEPS.length - 1) setStep(s => s + 1)
              else handleFinish()
            }}
            disabled={step === 0 && !name.trim() || saving}
            className="flex-1 py-3 bg-purple-700 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-purple-800 transition-colors"
          >
            {saving ? 'Sparar...' : step < STEPS.length - 1 ? 'Fortsätt' : 'Klar — gå till appen!'}
          </button>
        </div>
      </div>
    </div>
  )
}
