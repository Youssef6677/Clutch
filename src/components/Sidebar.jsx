import React from 'react'
import { supabase } from '../supabaseClient.js'
import PlayerStats from './PlayerStats'

const Sidebar = ({ currentView, setView }) => {
  const links = [
    { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
    { id: 'subjects', name: 'Matières', icon: '📚' },
    { id: 'pomodoro', name: 'Concentration', icon: '⏳' },
    { id: 'tasks', name: 'Tâches', icon: '📋' },
    { id: 'flashcards', name: 'Flashcards', icon: '🗂️' },
    { id: 'timetable', name: 'Agenda', icon: '📅' },
    { id: 'settings', name: 'Paramètres', icon: '⚙️' },
  ]

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error("Erreur déconnexion :", error.message)
  }

  return (
    <div className="w-64 h-screen bg-white shadow-lg fixed left-0 top-0 border-r-8 border-gray-800 flex flex-col">
      <div className="p-8 border-b-8 border-gray-800">
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4" style={{ fontFamily: 'monospace' }}>
          CLUTCH
        </h1>
        
        <PlayerStats />
      </div>
      
      <nav className="mt-8 space-y-2 px-4 flex-1">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => setView(link.id)}
            className={`w-full flex items-center px-4 py-4 font-black uppercase tracking-tight transition-all duration-200 border-4 border-transparent rounded-lg ${
              currentView === link.id 
                ? 'bg-gray-800 text-white border-gray-950 shadow-[4px_4px_0px_rgba(31,41,55,1)] translate-x-1' 
                : 'text-gray-700 hover:bg-gray-100 hover:border-gray-800 hover:translate-x-1'
            }`}
          >
            <span className="mr-3 text-2xl">{link.icon}</span>
            <span className="font-bold text-sm tracking-widest">{link.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t-8 border-gray-800 bg-gray-50 space-y-4">
        <button 
          onClick={handleSignOut}
          className="w-full bg-rose-400 text-gray-900 p-3 border-4 border-gray-800 border-b-8 border-b-rose-600 hover:border-b-4 hover:translate-y-1 active:scale-95 transition-all text-[10px] font-black uppercase rounded-lg shadow-[4px_4px_0px_rgba(31,41,55,1)]"
        >
          Se Déconnecter
        </button>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">v1.0.0-BETA</p>
      </div>
    </div>
  )
}

export default Sidebar
