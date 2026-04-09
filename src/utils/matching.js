/**
 * Matchmaking algorithm for eHälsodagen 2026
 *
 * Scoring:
 *  +2 per shared interest tag
 *  +5 if other person's "canHelpWith" covers one of your "challenges"
 *  +3 if your "canHelpWith" covers one of their "challenges"
 */

export function computeMatches(currentUser, allUsers) {
  if (!currentUser || !allUsers?.length) return []

  const myInterests = new Set(currentUser.interests || [])
  const myChallenges = new Set(currentUser.challenges || [])
  const myHelp = new Set(currentUser.canHelpWith || [])

  return allUsers
    .filter(u => u.uid !== currentUser.uid)
    .map(other => {
      const otherInterests = new Set(other.interests || [])
      const otherChallenges = new Set(other.challenges || [])
      const otherHelp = new Set(other.canHelpWith || [])

      let score = 0
      const reasons = []

      // Shared interests
      const sharedInterests = [...myInterests].filter(t => otherInterests.has(t))
      if (sharedInterests.length > 0) {
        score += sharedInterests.length * 2
        reasons.push(`Delar intresse för: ${sharedInterests.slice(0, 3).join(', ')}`)
      }

      // They can help with my challenges
      const theyHelpMe = [...myChallenges].filter(c => otherHelp.has(c))
      if (theyHelpMe.length > 0) {
        score += theyHelpMe.length * 5
        reasons.push(`Kan hjälpa dig med: ${theyHelpMe.slice(0, 2).join(', ')}`)
      }

      // I can help with their challenges
      const iHelpThem = [...otherChallenges].filter(c => myHelp.has(c))
      if (iHelpThem.length > 0) {
        score += iHelpThem.length * 3
        reasons.push(`Du kan hjälpa dem med: ${iHelpThem.slice(0, 2).join(', ')}`)
      }

      return { user: other, score, reasons }
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
}

export function getMatchLabel(score) {
  if (score >= 12) return { label: 'Utmärkt match', color: 'text-purple-700 bg-purple-100' }
  if (score >= 7) return { label: 'Bra match', color: 'text-blue-700 bg-blue-100' }
  return { label: 'Möjlig match', color: 'text-green-700 bg-green-100' }
}
