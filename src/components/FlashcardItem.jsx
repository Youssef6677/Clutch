import React, { useState } from 'react'

const FlashcardItem = ({ question, answer }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div 
      className="group perspective-1000 w-full h-64 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Face Avant (Question) */}
        <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-white border-4 border-gray-800 rounded-xl shadow-[4px_4px_0px_rgba(31,41,55,1)]">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Question</span>
          <p className="text-xl font-black text-center text-gray-900 leading-tight uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>
            {question}
          </p>
          <div className="mt-8 text-[10px] font-bold text-blue-500 animate-pulse">
            [ CLIQUER POUR RÉVÉLER ]
          </div>
        </div>

        {/* Face Arrière (Réponse) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 bg-yellow-50 border-4 border-gray-800 rounded-xl shadow-[4px_4px_0px_rgba(31,41,55,1)]">
          <span className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em] mb-4">Réponse</span>
          <p className="text-lg font-bold text-center text-gray-800 leading-relaxed italic">
            {answer}
          </p>
          <div className="mt-8 text-[10px] font-bold text-gray-400">
            [ CLIQUER POUR RETOURNER ]
          </div>
        </div>

      </div>
    </div>
  )
}

export default FlashcardItem
