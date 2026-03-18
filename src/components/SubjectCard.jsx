import React from 'react'

const ProgressBar = ({ label, percentage, color }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-black text-gray-700 uppercase">{label}</span>
        <span className="text-xs font-black text-gray-900">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 border-2 border-gray-800 h-4 rounded-sm overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

const SubjectCard = ({ subject }) => {
  const { name, cours, td, annales } = subject

  return (
    <div className="bg-white border-4 border-gray-800 rounded-lg p-6 shadow-[4px_4px_0px_rgba(31,41,55,1)] hover:shadow-[6px_6px_0px_rgba(31,41,55,1)] transition-all hover:-translate-y-1">
      <h3 className="text-xl font-black text-gray-900 mb-6 border-b-4 border-gray-100 pb-2 uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>
        {name}
      </h3>
      <div className="space-y-4">
        <ProgressBar label="Cours" percentage={cours} color="bg-blue-400" />
        <ProgressBar label="TD" percentage={td} color="bg-emerald-400" />
        <ProgressBar label="Annales" percentage={annales} color="bg-rose-400" />
      </div>
      <div className="mt-6 flex justify-end">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quête en cours...</span>
      </div>
    </div>
  )
}

export default SubjectCard
