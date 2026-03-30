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
    <div className="bevel-3d-deep p-8 mb-12 glow-yellow border-yellow-400 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex flex-col md:flex-row items-center gap-10 transition-colors duration-300">
      {/* Avatar Frame Élaboré */}
      <div className="relative group">
        <div className="w-40 h-40 bevel-3d-deep bg-gray-50 dark:bg-slate-700 p-2 flex items-center justify-center overflow-hidden">
          <img 
            src={avatarUrl} 
            alt={`Avatar Level ${profile.level}`} 
            style={{ imageRendering: 'pixelated', width: 'auto', height: '100%', display: 'block', margin: '0 auto' }}
            className="transition-transform group-hover:scale-110 duration-500"
          />
        </div>
        {/* Badge Niveau Jaune */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bevel-3d-yellow px-4 py-1 z-20">
          <span className="text-sm font-black text-gray-900 uppercase tracking-widest whitespace-nowrap" style={{ fontFamily: 'monospace' }}>
            NIVEAU {profile.level}
          </span>
        </div>
      </div>

      {/* Info & Stats */}
      <div className="flex-1 w-full space-y-6 text-center md:text-left">
        <div className="space-y-2">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
              HÉROS DE LA RÉVISION
            </h2>
            <span className="text-xl font-black text-yellow-500 uppercase tracking-widest animate-pulse drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              • {rank.title}
            </span>
          </div>
          
          <div className="flex justify-between items-end mb-1 px-1">
            <span className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-[0.2em]">EXPÉRIENCE ACTUELLE</span>
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest italic">
              PROCHAIN RANG DANS {XP_PER_LEVEL - (profile.xp % XP_PER_LEVEL)} XP
            </span>
          </div>

          {/* XP Bar Large & Brillante */}
          <div className="w-full h-10 bevel-3d bg-gray-100 dark:bg-slate-700 overflow-hidden relative shadow-[inset_0px_2px_10px_rgba(0,0,0,0.1)]">
            <div 
              className="h-full bg-yellow-400 border-r-4 border-gray-800 dark:border-slate-600 transition-all duration-700 ease-out relative shadow-[0_0_20px_rgba(250,204,21,0.5)]"
              style={{ width: `${((profile.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100}%` }}
            >
              {/* Effet de brillance animé */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
              
              {/* Particules XP (Simulées par des div blanches) */}
              <div className="absolute top-1 right-2 w-1 h-1 bg-white rounded-full animate-ping opacity-50"></div>
              <div className="absolute bottom-1 right-4 w-1 h-1 bg-white rounded-full animate-ping delay-300 opacity-50"></div>
            </div>
            
            {/* Texte XP au centre de la barre */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs font-black text-gray-900 dark:text-slate-900 mix-blend-overlay uppercase tracking-[0.5em]">
                {profile.xp % XP_PER_LEVEL} / {XP_PER_LEVEL}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvatarProfile
