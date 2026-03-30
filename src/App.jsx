import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import TasksPage from './components/TasksPage'
import FlashcardsPage from './components/FlashcardsPage'
import SchedulePage from './components/SchedulePage'
import Subjects from './components/Subjects'
import PomodoroPage from './components/PomodoroPage'
import SettingsPage from './components/SettingsPage'
import GlobalTimerWidget from './components/GlobalTimerWidget'
import SpotifyWidget from './components/SpotifyWidget'
import Auth from './components/Auth'
import { PomodoroProvider } from './context/PomodoroContext'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState('dashboard')

  useEffect(() => {
    // Appliquer le thème sombre immédiatement au démarrage
    const isDark = localStorage.getItem('darkMode') === 'true'
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Récupérer la session actuelle au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session?.user) {
        handleStreak(session.user.id)
      }
    })

    // Écouter les changements d'état d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
      if (session?.user) {
        handleStreak(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleStreak = async (userId) => {
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('last_active_date, current_streak, longest_streak')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError

      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      const lastActiveDate = profile.last_active_date ? new Date(profile.last_active_date) : null

      if (lastActiveDate && lastActiveDate.toISOString().split('T')[0] === todayStr) {
        // Déjà actif aujourd'hui, on ne fait rien
        return
      }

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      let newStreak = profile.current_streak || 0
      let newLongestStreak = profile.longest_streak || 0

      if (lastActiveDate && lastActiveDate.toISOString().split('T')[0] === yesterdayStr) {
        // La série continue
        newStreak++
      } else {
        // La série est rompue ou c'est le premier jour
        newStreak = 1
      }

      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          last_active_date: todayStr,
          current_streak: newStreak,
          longest_streak: newLongestStreak,
        })
        .eq('id', userId)

      if (updateError) throw updateError
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la flamme:', error.message)
    }
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'tasks':
        return <TasksPage />
      case 'pomodoro':
        return <PomodoroPage />
      case 'subjects':
        return <Subjects />
      case 'flashcards':
        return <FlashcardsPage />
      case 'timetable':
        return <SchedulePage />
      case 'settings':
        return <SettingsPage />
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
    <PomodoroProvider>
      <Layout currentView={currentView} setView={setCurrentView}>
        <GlobalTimerWidget />
        <SpotifyWidget />
        {renderView()}
      </Layout>
    </PomodoroProvider>
  )
}

export default App
