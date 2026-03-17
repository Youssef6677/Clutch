import React from 'react'

const Sidebar = () => {
  const links = [
    { name: 'Dashboard', icon: '🏠' },
    { name: 'Tâches', icon: '📋' },
    { name: 'Flashcards', icon: '🗂️' },
    { name: 'Paramètres', icon: '⚙️' },
  ]

  return (
    <div className="w-64 h-screen bg-white shadow-lg fixed left-0 top-0 border-r border-gray-100">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">Révision App</h1>
      </div>
      <nav className="mt-6">
        {links.map((link) => (
          <a
            key={link.name}
            href="#"
            className="flex items-center px-6 py-4 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200 border-l-4 border-transparent hover:border-blue-600"
          >
            <span className="mr-3 text-xl">{link.icon}</span>
            <span className="font-medium">{link.name}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
