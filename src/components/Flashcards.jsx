import React, { useState } from 'react'
import FlashcardItem from './FlashcardItem'

const initialMockFlashcards = [
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
  const [matieres, setMatieres] = useState(initialMockFlashcards)
  const [currentMatiereId, setCurrentMatiereId] = useState(null)
  const [currentDeckId, setCurrentDeckId] = useState(null)
  
  // États pour la modale de création
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newDeckName, setNewDeckName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const currentMatiere = matieres.find(m => m.id === currentMatiereId)
  const currentDeck = currentMatiere?.decks.find(d => d.id === currentDeckId)

  const handleBack = () => {
    if (currentDeckId) setCurrentDeckId(null)
    else if (currentMatiereId) setCurrentMatiereId(null)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type === "text/plain") {
      setSelectedFile(file)
    } else {
      alert("Veuillez sélectionner un fichier .txt valide.")
      e.target.value = null
    }
  }

  const createDeck = () => {
    if (!newDeckName.trim()) {
      alert("Veuillez donner un nom au sous-deck.")
      return
    }
    if (!selectedFile) {
      alert("Veuillez sélectionner un fichier .txt contenant vos flashcards.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      const lines = content.split('\n').filter(line => line.trim() !== '')
      const newCards = []

      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(';')
        if (parts.length < 2) {
          alert(`Erreur à la ligne ${i + 1} : Format "Question;Réponse" non respecté.`)
          return
        }
        newCards.push({
          id: `card-${Date.now()}-${i}`,
          question: parts[0].trim(),
          answer: parts[1].trim()
        })
      }

      const newDeck = {
        id: `deck-${Date.now()}`,
        name: newDeckName,
        cards: newCards
      }

      const updatedMatieres = matieres.map(m => {
        if (m.id === currentMatiereId) {
          return { ...m, decks: [...m.decks, newDeck] }
        }
        return m
      })

      setMatieres(updatedMatieres)
      setIsModalOpen(false)
      setNewDeckName('')
      setSelectedFile(null)
      alert(`Succès ! Le deck "${newDeckName}" a été créé avec ${newCards.length} cartes.`)
    }
    reader.readAsText(selectedFile)
  }

  const renderBreadcrumbs = () => (
    <div className="flex items-center gap-2 mb-8">
      <button 
        onClick={() => { setCurrentMatiereId(null); setCurrentDeckId(null); }}
        className={`text-[10px] font-black uppercase tracking-widest ${!currentMatiereId ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
      >
        Matières
      </button>
      {currentMatiere && (
        <>
          <span className="text-gray-400">/</span>
          <button 
            onClick={() => setCurrentDeckId(null)}
            className={`text-[10px] font-black uppercase tracking-widest ${!currentDeckId ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
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

  // Vue des Matières
  if (!currentMatiereId) {
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
          {matieres.map((matiere) => (
            <button
              key={matiere.id}
              onClick={() => setCurrentMatiereId(matiere.id)}
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

  // Vue des Sous-Decks d'une Matière
  if (!currentDeckId) {
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
              onClick={() => setIsModalOpen(true)}
              className="bg-gray-800 text-white p-4 border-b-4 border-gray-950 hover:border-b-0 hover:translate-y-1 active:scale-95 transition-all text-xs font-black uppercase rounded-lg"
            >
              + Importer un Deck (.txt)
            </button>
          </div>
        </header>

        {renderBreadcrumbs()}

        {/* Modale d'importation */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border-8 border-gray-800 p-8 rounded-xl shadow-[12px_12px_0px_rgba(31,41,55,1)] max-w-md w-full space-y-6">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>Nouveau Sous-Deck</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-2">Nom du Deck</label>
                  <input 
                    type="text" 
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder="Ex: Anatomie, Civilisation..."
                    className="w-full border-4 border-gray-800 p-3 rounded-md font-bold focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-2">Fichier Flashcards (.txt)</label>
                  <input 
                    type="file" 
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="w-full border-4 border-dashed border-gray-400 p-4 rounded-md font-bold cursor-pointer hover:border-gray-800 transition-colors"
                  />
                  <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase italic text-center">Format : Question;Réponse</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white text-gray-800 p-4 border-4 border-gray-800 border-b-8 hover:border-b-4 hover:translate-y-1 active:scale-95 transition-all text-xs font-black uppercase rounded-lg"
                >
                  Annuler
                </button>
                <button 
                  onClick={createDeck}
                  className="flex-1 bg-emerald-400 text-gray-900 p-4 border-4 border-gray-800 border-b-8 border-b-emerald-600 hover:border-b-4 hover:translate-y-1 active:scale-95 transition-all text-xs font-black uppercase rounded-lg"
                >
                  Créer Deck
                </button>
              </div>
            </div>
          </div>
        )}

        {currentMatiere.decks.length === 0 ? (
          <div className="bg-white border-4 border-gray-800 rounded-xl p-20 text-center shadow-[4px_4px_0px_rgba(31,41,55,1)]">
            <p className="text-xl font-black text-gray-400 uppercase italic">Aucun deck disponible pour cette matière.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentMatiere.decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => setCurrentDeckId(deck.id)}
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

  // Vue des Cartes (Flashcards)
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
