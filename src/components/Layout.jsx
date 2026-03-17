import React from 'react'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Barre latérale */}
      <Sidebar />

      {/* Contenu principal */}
      <main className="flex-1 ml-64 p-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
