import React, { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Tasks from './components/Tasks'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'tasks':
        return <Tasks />
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

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </Layout>
  )
}

export default App
