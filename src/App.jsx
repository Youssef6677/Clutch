import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Tasks from './components/Tasks'
import Flashcards from './components/Flashcards'
import SchedulePage from './components/SchedulePage'
import Auth from './components/Auth'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState('dashboard')
  const [xpUpdateTrigger, setXpUpdateTrigger] = useState(0)

  useEffect(() => {
    // Récupérer la session actuelle au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Écouter les changements d'état d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const triggerXpUpdate = () => {
    setXpUpdateTrigger(prev => prev + 1)
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'tasks':
        return <Tasks onXpGain={triggerXpUpdate} />
      case 'flashcards':
        return <Flashcards />
      case 'timetable':
        return <SchedulePage />
      default:
        return (
          <div className="p-20 text-center">
            <h2 className="text-2xl font-black text-gray-400 uppercase italic">
              Cette zone ( {currentView} ) n'a pas encore été débloquée !
            </h2>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-black text-gray-800 uppercase animate-pulse">
          Chargement de la session...
        </div>
      </div>
    )
  }

  // Si pas de session, on affiche uniquement le composant Auth
  if (!session) {
    return <Auth />
  }

  return (
    <Layout currentView={currentView} setView={setCurrentView} xpUpdateTrigger={xpUpdateTrigger}>
      {renderView()}
    </Layout>
  )
}

export default App
