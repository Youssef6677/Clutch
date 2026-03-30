import React from 'react'

const ProgressBar = ({ label, percentage, color }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[14px]">⚔️</span>
          <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[10px] font-black text-gray-900 dark:text-gray-100">{percentage}%</span>
      </div>
      <div className="w-full bevel-3d h-4 bg-gray-100 dark:bg-slate-700 overflow-hidden transition-colors duration-300">
        <div
          className={`h-full ${color} transition-all duration-700 relative`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
        </div>
      </div>
    </div>
  )
}

const SubjectCard = ({ subject }) => {
  const { name, cours, td, annales } = subject

  // Logique de couleur basée sur le nom (Analyse = bleu, Algèbre = orange, sinon alternance)
  const getHeaderStyle = () => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('analyse')) return 'bevel-3d-blue'
    if (lowerName.includes('algèbre')) return 'bevel-3d-orange'
    // Couleur par défaut (émeraude)
    return 'bevel-3d-yellow'
  }

  return (
    <div className="bevel-3d-deep bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-0 overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      {/* Header de Carte 3D avec Bande de Couleur */}
      <div className={`${getHeaderStyle()} p-4 flex items-center gap-3 border-t-0 border-x-0 dark:border-slate-700`}>
        <span className="text-2xl">⚔️</span>
        <h3 className="text-xl font-black text-gray-900 dark:text-gray-900 uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
          {name}
        </h3>
      </div>

      <div className="p-6 space-y-4">
        <ProgressBar label="Cours" percentage={cours} color="bg-blue-400" />
        <ProgressBar label="TD" percentage={td} color="bg-orange-400" />
        <ProgressBar label="Annales" percentage={annales} color="bg-rose-400" />
      </div>
      
      <div className="px-6 pb-4 flex justify-between items-center">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full border-2 border-gray-800 bg-yellow-400 flex items-center justify-center text-[10px]">⭐</div>
          <div className="w-6 h-6 rounded-full border-2 border-gray-800 bg-blue-400 flex items-center justify-center text-[10px]">💎</div>
        </div>
        <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
          Quête en cours...
        </span>
      </div>
    </div>
  )
}

export default SubjectCard
