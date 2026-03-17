import React from 'react'

const ProgressBar = ({ label, percentage, color }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

const SubjectCard = ({ subject }) => {
  const { name, cours, td, annales } = subject

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2 border-gray-50">{name}</h3>
      <div className="space-y-4">
        <ProgressBar label="Cours" percentage={cours} color="bg-blue-500" />
        <ProgressBar label="TD" percentage={td} color="bg-green-500" />
        <ProgressBar label="Annales" percentage={annales} color="bg-purple-500" />
      </div>
    </div>
  )
}

export default SubjectCard
