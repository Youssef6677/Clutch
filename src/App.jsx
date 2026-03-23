import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Tasks from './components/Tasks'
import Flashcards from './components/Flashcards'
import Auth from './components/Auth'

function App() {
  const [session, setSession] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard')

  useEffect(() => {
    // Récupérer la session actuelle au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Écouter les changements d'état d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'tasks':
        return <Tasks />
      case 'flashcards':
        return <Flashcards />
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

  // Si pas de session, on affiche uniquement le composant Auth
  if (!session) {
    return <Auth />
  }

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </Layout>
  )
}

export default App
