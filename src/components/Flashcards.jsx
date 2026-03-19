import React, { useState } from 'react'
import FlashcardItem from './FlashcardItem'

const mockFlashcards = [
  { id: 'maths', name: 'Mathématiques', icon: '📐', decks: [
    { id: 'maths-1', name: 'Algèbre', cards: [
      { id: 'c1', question: 'Quelle est la dérivée de x² ?', answer: 'La dérivée est 2x.' },
      { id: 'c2', question: 'Quelle est la solution de x² = 4 ?', answer: 'x = 2 ou x = -2.' }
    ]},
    { id: 'maths-2', name: 'Analyse', cards: [] }
  ]},
  { id: 'physique', name: 'Physique', icon: '⚛️', decks: [] },
  { id: 'info', name: 'Informatique', icon: '💻', decks: [
    { id: 'info-1', name: 'Bases de données', cards: [
      { id: 'c3', question: 'Que signifie SQL ?', answer: 'Structured Query Language.' },
      { id: 'c4', question: 'Qu\'est-ce qu\'une clé primaire ?', answer: 'Un identifiant unique pour chaque enregistrement d\'une table.' }
    ]}
  ]},
  { id: 'eco', name: 'Économie', icon: '📈', decks: [] },
  { id: 'anglais', name: 'Anglais', icon: '🇬🇧', decks: [] },
  { id: 'histoire', name: 'Histoire', icon: '📜', decks: [] },
  { id: 'philo', name: 'Philosophie', icon: '🏛️', decks: [] },
  { id: 'svt', name: 'SVT', icon: '🌿', decks: [] },
  { id: 'chimie', name: 'Chimie', icon: '🧪', decks: [] },
  { id: 'droit', name: 'Droit', icon: '⚖️', decks: [] }
]

const Flashcards = () => {
  const [currentMatiere, setCurrentMatiere] = useState(null)
  const [currentDeck, setCurrentDeck] = useState(null)

  const handleBack = () => {
    if (currentDeck) setCurrentDeck(null)
    else if (currentMatiere) setCurrentMatiere(null)
  }

  const renderBreadcrumbs = () => (
    <div className="flex items-center gap-2 mb-8">
      <button 
        onClick={() => { setCurrentMatiere(null); setCurrentDeck(null); }}
        className={`text-[10px] font-black uppercase tracking-widest ${!currentMatiere ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
      >
        Matières
      </button>
      {currentMatiere && (
        <>
          <span className="text-gray-400">/</span>
          <button 
            onClick={() => setCurrentDeck(null)}
            className={`text-[10px] font-black uppercase tracking-widest ${!currentDeck ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
          >
            {currentMatiere.name}
          </button>
        </>
      )}
      {currentDeck && (
        <>
          <span className="text-gray-400">/</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{currentDeck.name}</span>
        </>
      )}
    </div>
  )

  // Rendu de la liste des matières
  if (!currentMatiere) {
    return (
      <div className="space-y-10">
        <header className="border-l-8 border-gray-800 pl-6 py-2 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>Bibliothèque</h2>
            <p className="mt-2 text-lg font-bold text-gray-600 uppercase tracking-widest">Choisissez une matière pour réviser.</p>
          </div>
          <button 
            onClick={() => console.log("Créer une matière")}
            className="bg-gray-800 text-white p-4 border-b-4 border-gray-950 hover:border-b-0 hover:translate-y-1 active:scale-95 transition-all text-xs font-black uppercase rounded-lg"
          >
            + Nouvelle Matière
          </button>
        </header>

        {renderBreadcrumbs()}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {mockFlashcards.map((matiere) => (
            <button
              key={matiere.id}
              onClick={() => setCurrentMatiere(matiere)}
              className="bg-white border-4 border-gray-800 rounded-xl p-6 shadow-[4px_4px_0px_rgba(31,41,55,1)] hover:shadow-[6px_6px_0px_rgba(31,41,55,1)] transition-all hover:-translate-y-1 flex flex-col items-center gap-4 group"
            >
              <span className="text-5xl transition-transform group-hover:scale-110">{matiere.icon}</span>
              <span className="text-sm font-black text-gray-900 uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>
                {matiere.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Rendu de la liste des sous-decks d'une matière
  if (!currentDeck) {
    return (
      <div className="space-y-10">
        <header className="border-l-8 border-gray-800 pl-6 py-2 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>{currentMatiere.name}</h2>
            <p className="mt-2 text-lg font-bold text-gray-600 uppercase tracking-widest">Séléctionnez un deck de cartes.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleBack}
              className="bg-white text-gray-800 p-4 border-4 border-gray-800 border-b-8 hover:border-b-4 hover:translate-y-1 active:scale-95 transition-all text-xs font-black uppercase rounded-lg"
            >
              ← Retour
            </button>
            <button 
              onClick={() => console.log("Créer un sous-deck")}
              className="bg-gray-800 text-white p-4 border-b-4 border-gray-950 hover:border-b-0 hover:translate-y-1 active:scale-95 transition-all text-xs font-black uppercase rounded-lg"
            >
              + Nouveau Deck
            </button>
          </div>
        </header>

        {renderBreadcrumbs()}

        {currentMatiere.decks.length === 0 ? (
          <div className="bg-white border-4 border-gray-800 rounded-xl p-20 text-center shadow-[4px_4px_0px_rgba(31,41,55,1)]">
            <p className="text-xl font-black text-gray-400 uppercase italic">Aucun deck disponible pour cette matière.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentMatiere.decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => setCurrentDeck(deck)}
                className="bg-white border-4 border-gray-800 rounded-xl p-8 shadow-[4px_4px_0px_rgba(31,41,55,1)] hover:shadow-[6px_6px_0px_rgba(31,41,55,1)] transition-all hover:-translate-y-1 flex flex-col items-start gap-4 text-left"
              >
                <div className="w-full flex justify-between items-center">
                  <span className="text-3xl">🗂️</span>
                  <span className="bg-blue-400 border-2 border-gray-800 px-2 py-0.5 text-[10px] font-black uppercase rounded shadow-[2px_2px_0px_rgba(31,41,55,1)]">
                    {deck.cards.length} Cartes
                  </span>
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mt-2" style={{ fontFamily: 'monospace' }}>
                  {deck.name}
                </h3>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Rendu de la vue des cartes (Flashcards)
  return (
    <div className="space-y-10">
      <header className="border-l-8 border-gray-800 pl-6 py-2 flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>{currentDeck.name}</h2>
          <p className="mt-2 text-lg font-bold text-gray-600 uppercase tracking-widest">Maîtrisez ces concepts, Héros !</p>
        </div>
        <button 
          onClick={handleBack}
          className="bg-white text-gray-800 p-4 border-4 border-gray-800 border-b-8 hover:border-b-4 hover:translate-y-1 active:scale-95 transition-all text-xs font-black uppercase rounded-lg"
        >
          ← Retour
        </button>
      </header>

      {renderBreadcrumbs()}

      {currentDeck.cards.length === 0 ? (
        <div className="bg-white border-4 border-gray-800 rounded-xl p-20 text-center shadow-[4px_4px_0px_rgba(31,41,55,1)]">
          <p className="text-xl font-black text-gray-400 uppercase italic">Ce deck est vide. Ajoutez des cartes pour commencer !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 max-w-4xl mx-auto py-8">
          {currentDeck.cards.map((card) => (
            <FlashcardItem key={card.id} question={card.question} answer={card.answer} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Flashcards
