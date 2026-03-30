import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import { getUserRank } from '../utils/ranks.js'

const SettingsPage = () => {
  const XP_PER_LEVEL = 100
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // États des paramètres
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'fr'
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  // Appliquer le Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', isDarkMode)
  }, [isDarkMode])

  // Sauvegarder la langue
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-2xl font-black uppercase animate-pulse">Chargement des archives...</div>
      </div>
    )
  }

  const rank = getUserRank(profile.level)
  const avatarUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${rank.pokemonId}.png`
  const xpPercentage = Math.min(((profile.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100, 100)

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 transition-colors duration-300">
      <header className="border-l-8 border-gray-800 dark:border-slate-700 pl-6 py-2">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>
          ⚙️ Rouages & Archives
        </h2>
        <p className="mt-2 text-lg font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
          Consultez votre dossier de héros et ajustez les paramètres du système.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* COLONNE GAUCHE : PROFIL & STATISTIQUES */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter border-b-4 border-gray-800 dark:border-slate-700 pb-2" style={{ fontFamily: 'monospace' }}>
            Dossier d'Enquêteur
          </h3>
          
          {/* Carte de Profil */}
          <div className="bevel-3d-deep p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex flex-col items-center text-center gap-4 transition-colors duration-300">
            <div className="w-32 h-32 bevel-3d bg-gray-50 dark:bg-slate-700 p-2 flex items-center justify-center overflow-hidden relative group transition-colors duration-300">
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                style={{ imageRendering: 'pixelated', width: 'auto', height: '100%', display: 'block', margin: '0 auto' }}
                className="transition-transform group-hover:scale-110 duration-500"
              />
            </div>
            
            <div>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
                {rank.title}
              </h4>
              <div className="inline-block bevel-3d-yellow px-3 py-1 mt-2">
                <span className="text-sm font-black text-gray-900 uppercase tracking-widest">
                  NIVEAU {profile.level}
                </span>
              </div>
            </div>

            {/* XP Bar */}
            <div className="w-full mt-4">
              <div className="flex justify-between items-end mb-1 px-1">
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Expérience</span>
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{profile.xp % XP_PER_LEVEL} / {XP_PER_LEVEL}</span>
              </div>
              <div className="h-6 w-full bevel-3d bg-gray-100 dark:bg-slate-700 overflow-hidden relative transition-colors duration-300">
                <div 
                  className="h-full bg-yellow-400 border-r-4 border-gray-800 dark:border-slate-600 transition-all duration-700 ease-out"
                  style={{ width: `${xpPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Widget Flamme (Streak) */}
          <div className="bevel-3d-deep p-6 bg-gray-900 dark:bg-slate-950 text-white relative overflow-hidden group transition-colors duration-300">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute -right-10 -top-10 text-9xl opacity-20 group-hover:scale-110 transition-transform duration-700 pointer-events-none">🔥</div>
            
            <div className="relative z-10 flex items-center gap-6">
              <div className="text-6xl drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse">🔥</div>
              <div>
                <h4 className="text-sm font-black text-yellow-400 uppercase tracking-[0.3em] mb-1">Série de Connexion</h4>
                <div className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
                  {profile.current_streak || 0} Jours
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-2">
                  Record absolu : <span className="text-white">{profile.longest_streak || 0} Jours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : PARAMÈTRES */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter border-b-4 border-gray-800 dark:border-slate-700 pb-2" style={{ fontFamily: 'monospace' }}>
            Panneau de Contrôle
          </h3>

          <div className="space-y-6">
            {/* Toggle Dark Mode */}
            <div className="bevel-3d p-6 bg-white dark:bg-slate-800 flex items-center justify-between transition-colors duration-300">
              <div>
                <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Mode Sombre</h4>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Assombrir l'interface (Bêta)</p>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-16 h-8 border-4 border-gray-800 dark:border-slate-600 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-gray-800 dark:border-slate-600 rounded-full bg-white transition-transform duration-300 ${isDarkMode ? 'translate-x-8' : 'translate-x-1'}`}></div>
              </button>
            </div>

            {/* Toggle Langue */}
            <div className="bevel-3d p-6 bg-white dark:bg-slate-800 flex items-center justify-between transition-colors duration-300">
              <div>
                <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Langue du Système</h4>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Traductions en cours de forge</p>
              </div>
              <div className="flex border-4 border-gray-800 dark:border-slate-700 rounded overflow-hidden">
                <button 
                  onClick={() => setLanguage('fr')}
                  className={`px-4 py-2 font-black uppercase text-xs transition-colors ${language === 'fr' ? 'bg-blue-400 text-gray-900' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                >
                  FR
                </button>
                <div className="w-1 bg-gray-800 dark:bg-slate-700"></div>
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 font-black uppercase text-xs transition-colors ${language === 'en' ? 'bg-rose-400 text-gray-900' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Zone Danger */}
            <div className="bevel-3d p-6 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 mt-12 transition-colors duration-300">
              <h4 className="text-lg font-black text-rose-600 dark:text-rose-500 uppercase tracking-tight mb-2">Zone de Danger</h4>
              <p className="text-[10px] font-bold text-rose-400 dark:text-rose-400/70 uppercase tracking-widest mb-4">Actions irréversibles sur votre compte.</p>
              <button className="bevel-3d bg-rose-500 text-white px-6 py-3 font-black uppercase text-xs tracking-widest hover:translate-y-0.5 transition-all">
                Réinitialiser la Progression
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SettingsPage