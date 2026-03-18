import React from 'react'
import SubjectCard from './SubjectCard'
import AvatarProfile from './AvatarProfile'

const Dashboard = () => {
  const subjects = [
    {
      id: 1,
      name: 'Mathématiques',
      cours: 75,
      td: 45,
      annales: 20
    },
    {
      id: 2,
      name: 'Physique-Chimie',
      cours: 60,
      td: 30,
      annales: 10
    },
    {
      id: 3,
      name: 'Informatique',
      cours: 90,
      td: 80,
      annales: 50
    },
    {
      id: 4,
      name: 'Économie',
      cours: 40,
      td: 20,
      annales: 5
    }
  ]

  return (
    <div>
      <AvatarProfile />
      
      <header className="mb-10 border-l-8 border-gray-800 pl-6 py-2">
        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>Quêtes de Révision</h2>
        <p className="mt-2 text-lg font-bold text-gray-600 uppercase tracking-widest">Suivez votre progression par matière.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </div>
  )
}

export default Dashboard
