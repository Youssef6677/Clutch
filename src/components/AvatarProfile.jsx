import React, { useState } from 'react'

const AvatarProfile = () => {
  const [level, setLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const maxXP = 100

  const handleStudySession = () => {
    const xpGain = 25
    let newXP = xp + xpGain

    if (newXP >= maxXP) {
      setLevel(level + 1)
      setXp(newXP - maxXP) // On garde l'XP en surplus
    } else {
      setXp(newXP)
    }
  }

  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=Level${level}`

  return (
    <div className="bg-white border-4 border-gray-800 rounded-xl p-6 mb-8 shadow-[8px_8px_0px_rgba(31,41,55,1)] flex flex-col md:flex-row items-center gap-8">
      {/* Avatar Container */}
      <div className="relative">
        <div className="w-32 h-32 bg-gray-100 border-4 border-gray-800 rounded-lg overflow-hidden flex items-center justify-center p-2">
          <img 
            src={avatarUrl} 
            alt={`Avatar Level ${level}`} 
            className="w-full h-full pixelated"
          />
        </div>
        <div className="absolute -bottom-3 -right-3 bg-yellow-400 border-4 border-gray-800 px-3 py-1 font-black text-gray-900 rounded-md shadow-[4px_4px_0px_rgba(31,41,55,1)]">
          LVL {level}
        </div>
      </div>

      {/* Info & Stats */}
      <div className="flex-1 w-full space-y-4 text-center md:text-left">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-wider mb-1" style={{ fontFamily: 'monospace' }}>
            Héros de la Révision
          </h2>
          <div className="flex justify-between items-end mb-1 px-1">
            <span className="text-sm font-bold text-gray-700 uppercase">XP : {xp} / {maxXP}</span>
            <span className="text-xs font-bold text-gray-500 uppercase italic">Prochain niveau : {maxXP - xp} XP</span>
          </div>
          {/* XP Bar */}
          <div className="w-full bg-gray-200 border-4 border-gray-800 h-8 rounded-md overflow-hidden relative">
            <div 
              className="h-full bg-yellow-400 transition-all duration-500 ease-out flex items-center justify-end px-2"
              style={{ width: `${(xp / maxXP) * 100}%` }}
            >
              {xp > 15 && <div className="w-1 h-full bg-white/30 mr-1 animate-pulse" />}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleStudySession}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gray-800 border-b-4 border-gray-950 rounded-lg hover:border-b-0 hover:translate-y-1 active:scale-95 w-full md:w-auto"
        >
          <span className="relative flex items-center gap-2">
            ✨ SIMULER 1H DE RÉVISION (+25 XP)
          </span>
        </button>
      </div>
    </div>
  )
}

export default AvatarProfile
