import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import { getUserRank } from '../utils/ranks.js'

const PlayerStats = () => {
  const XP_PER_LEVEL = 100
  const [stats, setStats] = useState({ level: 1, xp: 0 })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('level, xp')
          .eq('id', user.id)
          .single()

        if (error) throw error
        if (data) setStats(data)
      }
    } catch (error) {
      console.error('Erreur stats:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Écouter l'événement global de mise à jour du profil
    window.addEventListener('profileUpdated', fetchStats)
    
    return () => {
      window.removeEventListener('profileUpdated', fetchStats)
    }
  }, [])

  const rank = getUserRank(stats.level)
  const xpPercentage = Math.min((stats.xp / XP_PER_LEVEL) * 100, 100)
  const avatarUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${rank.pokemonId}.png`

  if (loading) return (
    <div className="p-4 border-4 border-gray-800 bg-white rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-full"></div>
    </div>
  )

  return (
    <div className="bevel-3d-deep p-4 relative overflow-hidden group mb-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar Container avec bordure 3D */}
          <div className="w-14 h-14 bevel-3d overflow-hidden p-1 flex items-center justify-center">
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="w-full h-full pixelated"
            />
          </div>
          
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">⚔️</span>
              <div className="bg-yellow-400 border-2 border-gray-800 px-2 py-0.5 shadow-[2px_2px_0px_rgba(31,41,55,1)]">
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
                  LVL {stats.level}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mt-1">
              {rank.title}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end mb-1">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
            Expérience
          </span>
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
            {stats.xp} / 100
          </span>
        </div>

        {/* XP Bar Container 3D */}
        <div className="h-6 w-full bevel-3d bg-gray-100 overflow-hidden relative">
          {/* XP Progress */}
          <div 
            className="h-full bg-yellow-400 border-r-4 border-gray-800 transition-all duration-500 ease-out"
            style={{ width: `${xpPercentage}%` }}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>

      {/* Grimoire Icon Footer */}
      <div className="absolute bottom-1 right-1 opacity-20 text-xl pointer-events-none">📜</div>
    </div>
  )
}

export default PlayerStats
