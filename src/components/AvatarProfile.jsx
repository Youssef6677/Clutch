import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient.js'
import { getUserRank } from '../utils/ranks.js'

const AvatarProfile = () => {
  const XP_PER_LEVEL = 100
  const [profile, setProfile] = useState({ level: 1, xp: 0 })
  const [loading, setLoading] = useState(true)

  const fetchProfileData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('level, xp')
          .eq('id', user.id)
          .single()

        if (error) throw error
        if (data) setProfile(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfileData()

    // Écouter l'événement global de mise à jour du profil
    window.addEventListener('profileUpdated', fetchProfileData)
    
    return () => {
      window.removeEventListener('profileUpdated', fetchProfileData)
    }
  }, [fetchProfileData])

  const rank = getUserRank(profile.level)
  const avatarUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${rank.pokemonId}.png`

  if (loading) {
    return (
      <div className="bg-white border-4 border-gray-800 rounded-xl p-6 mb-8 shadow-[8px_8px_0px_rgba(31,41,55,1)] animate-pulse">
        <div className="h-32 w-32 bg-gray-200 rounded-lg mb-4 mx-auto md:mx-0"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    )
  }

  return (
    <div className="bg-white border-4 border-gray-800 rounded-xl p-6 mb-8 shadow-[8px_8px_0px_rgba(31,41,55,1)] flex flex-col md:flex-row items-center gap-8">
      {/* Avatar Container */}
      <div className="relative">
        <div className="w-32 h-32 bg-[#fefefe] border-4 border-gray-800 rounded-lg overflow-hidden flex items-center justify-center p-2 shadow-[inset_0px_0px_10px_rgba(0,0,0,0.05)]">
          <img 
            src={avatarUrl} 
            alt={`Avatar Level ${profile.level}`} 
            style={{ imageRendering: 'pixelated', width: 'auto', height: '100%', display: 'block', margin: '0 auto' }}
          />
        </div>
        <div className="absolute -bottom-3 -right-3 bg-yellow-400 border-4 border-gray-800 px-3 py-1 font-black text-gray-900 rounded-md shadow-[4px_4px_0px_rgba(31,41,55,1)]">
          LVL {profile.level}
        </div>
      </div>

      {/* Info & Stats */}
      <div className="flex-1 w-full space-y-4 text-center md:text-left">
        <div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-wider" style={{ fontFamily: 'monospace' }}>
              Héros de la Révision
            </h2>
            <span className="text-xl font-black text-yellow-500 uppercase tracking-tighter drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" style={{ fontFamily: 'monospace' }}>
              • {rank.title}
            </span>
          </div>
          <div className="flex justify-between items-end mb-1 px-1">
            <span className="text-sm font-bold text-gray-700 uppercase">XP : {profile.xp % XP_PER_LEVEL} / {XP_PER_LEVEL}</span>
            <span className="text-xs font-bold text-gray-500 uppercase italic">Prochain niveau : {XP_PER_LEVEL - (profile.xp % XP_PER_LEVEL)} XP</span>
          </div>
          {/* XP Bar */}
          <div className="w-full bg-gray-200 border-4 border-gray-800 h-8 rounded-md overflow-hidden relative">
            <div 
              className="h-full bg-yellow-400 transition-all duration-500 ease-out flex items-center justify-end px-2"
              style={{ width: `${((profile.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100}%` }}
            >
              {(profile.xp % XP_PER_LEVEL) > 15 && <div className="w-1 h-full bg-white/30 mr-1 animate-pulse" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvatarProfile
