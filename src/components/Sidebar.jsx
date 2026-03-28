import React from 'react'
import { supabase } from '../supabaseClient.js'
import PlayerStats from './PlayerStats'

const Sidebar = ({ currentView, setView }) => {
  const links = [
    { id: 'dashboard', name: 'Dashboard', icon: '🏰' },
    { id: 'subjects', name: 'Matières', icon: '📚' },
    { id: 'pomodoro', name: 'Concentration', icon: '⏳' },
    { id: 'tasks', name: 'Tâches', icon: '⚔️' },
    { id: 'flashcards', name: 'Sortilèges', icon: '🃏' },
    { id: 'timetable', name: 'Grille', icon: '🗺️' },
    { id: 'settings', name: 'Rouages', icon: '⚙️' },
  ]

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error("Erreur déconnexion :", error.message)
  }

  return (
    <div className="w-64 h-screen fixed left-0 top-0 border-r-4 border-gray-800 flex flex-col z-50">
      <div className="p-6">
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-6 text-center" style={{ fontFamily: 'monospace' }}>
          CLUTCH
        </h1>
        
        <PlayerStats />
      </div>
      
      <nav className="flex-1 px-4 space-y-4 overflow-y-auto">
        <div className="bevel-3d-deep p-2 space-y-2">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => setView(link.id)}
              className={`w-full flex items-center px-4 py-3 font-black uppercase tracking-tight transition-all duration-200 border-2 ${
                currentView === link.id 
                  ? 'bg-gray-800 text-white border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-y-0.5' 
                  : 'text-gray-700 hover:bg-gray-100 border-transparent hover:border-gray-800 hover:-translate-y-0.5'
              }`}
            >
              <span className="mr-3 text-xl">{link.icon}</span>
              <span className="font-bold text-[10px] tracking-[0.2em]">{link.name}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-6 space-y-4">
        <button 
          onClick={handleSignOut}
          className="w-full bevel-3d bg-rose-400 text-gray-900 p-3 hover:translate-y-0.5 hover:shadow-none transition-all text-[10px] font-black uppercase tracking-widest"
        >
          Abandonner
        </button>
        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center">SYSTÈME v1.0.0-BETA</p>
      </div>
    </div>
  )
}

export default Sidebar
