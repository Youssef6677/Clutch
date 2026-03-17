import React from 'react'
import SubjectCard from './SubjectCard'

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
      <header className="mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tableau de Bord</h2>
        <p className="mt-2 text-lg text-gray-600">Suivez votre progression de révision par matière.</p>
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
