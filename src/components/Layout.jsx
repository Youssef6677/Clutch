import React from 'react'
import Sidebar from './Sidebar'

const Layout = ({ currentView, setView, children }) => {
  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Éléments décoratifs flottants */}
      <div className="fixed top-20 left-[20%] text-yellow-500/10 pointer-events-none select-none text-6xl animate-pulse">⭐</div>
      <div className="fixed bottom-40 right-[10%] text-yellow-500/10 pointer-events-none select-none text-8xl rotate-12">💰</div>
      <div className="fixed top-1/2 left-[40%] text-yellow-500/10 pointer-events-none select-none text-4xl -rotate-12 animate-bounce">⭐</div>
      <div className="fixed bottom-20 left-[30%] text-yellow-500/10 pointer-events-none select-none text-7xl rotate-45">💰</div>

      {/* Barre latérale */}
      <Sidebar currentView={currentView} setView={setView} />

      {/* Contenu principal */}
      <main className="flex-1 ml-64 p-10 relative z-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
