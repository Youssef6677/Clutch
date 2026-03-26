import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'

const FlashcardsPage = () => {
  const XP_PER_LEVEL = 100
  const [decks, setDecks] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedDeck, setSelectedDeck] = useState(null)
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  // Study states
  const [isStudying, setIsStudying] = useState(false)
  const [sessionCards, setSessionCards] = useState([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [score, setScore] = useState(0)
  const [hasAwardedXp, setHasAwardedXp] = useState(false)
  const [isLevelUp, setIsLevelUp] = useState(false)
  const [earnedXpAmount, setEarnedXpAmount] = useState(0)

  // Form states - Decks
  const [newDeckName, setNewDeckName] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')

  // Form states - Flashcards
  const [newCardFront, setNewCardFront] = useState('')
  const [newCardBack, setNewCardBack] = useState('')

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !selectedDeck || !userId) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target.result
      const lines = text.split('\n')
      const newCards = []

      lines.forEach(line => {
        if (!line.trim()) return
        const parts = line.split(';')
        if (parts.length === 2) {
          newCards.push({
            user_id: userId,
            deck_id: selectedDeck.id,
            front: parts[0].trim(),
            back: parts[1].trim()
          })
        }
      })

      if (newCards.length === 0) {
        alert("Aucune carte valide trouvée. Utilisez le format: Question;Réponse")
        return
      }

      try {
        const { data, error } = await supabase
          .from('flashcards')
          .insert(newCards)
          .select()

        if (error) throw error
        
        if (data) {
          setFlashcards([...flashcards, ...data])
          alert(`${data.length} cartes importées avec succès !`)
        }
      } catch (error) {
        console.error('Erreur lors de l\'importation en masse:', error.message)
        alert("Erreur lors de l'importation. Vérifiez le format du fichier.")
      } finally {
        e.target.value = '' // Vider l'input
      }
    }
    reader.readAsText(file)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          
          // Récupérer Decks et Subjects
          const [decksRes, subjectsRes] = await Promise.all([
            supabase.from('decks').select('*, subjects(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('subjects').select('*').eq('user_id', user.id).order('name')
          ])

          if (decksRes.error) throw decksRes.error
          if (subjectsRes.error) throw subjectsRes.error

          setDecks(decksRes.data || [])
          setSubjects(subjectsRes.data || [])
        }
      } catch (error) {
        console.error('Erreur chargement:', error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // CRUD DECKS
  const createDeck = async (e) => {
    e.preventDefault()
    if (!newDeckName.trim() || !selectedSubjectId || !userId) return

    try {
      const { data, error } = await supabase
        .from('decks')
        .insert([{ 
          name: newDeckName, 
          subject_id: selectedSubjectId, 
          user_id: userId 
        }])
        .select('*, subjects(name)')

      if (error) throw error
      setDecks([data[0], ...decks])
      setNewDeckName('')
      setSelectedSubjectId('')
    } catch (error) {
      console.error('Erreur création deck:', error.message)
    }
  }

  const deleteDeck = async (id) => {
    if (!window.confirm('Supprimer ce deck et TOUTES ses cartes ?')) return
    try {
      const { error } = await supabase.from('decks').delete().eq('id', id)
      if (error) throw error
      setDecks(decks.filter(d => d.id !== id))
    } catch (error) {
      console.error('Erreur suppression deck:', error.message)
    }
  }

  // CRUD FLASHCARDS
  useEffect(() => {
    if (selectedDeck) {
      fetchFlashcards(selectedDeck.id)
    }
  }, [selectedDeck])

  const fetchFlashcards = async (deckId) => {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setFlashcards(data || [])
    } catch (error) {
      console.error('Erreur flashcards:', error.message)
    }
  }

  const createFlashcard = async (e) => {
    e.preventDefault()
    if (!newCardFront.trim() || !newCardBack.trim() || !selectedDeck) return

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert([{
          front: newCardFront,
          back: newCardBack,
          deck_id: selectedDeck.id,
          user_id: userId
        }])
        .select()

      if (error) throw error
      setFlashcards([...flashcards, data[0]])
      setNewCardFront('')
      setNewCardBack('')
    } catch (error) {
      console.error('Erreur création carte:', error.message)
    }
  }

  const deleteFlashcard = async (id) => {
    try {
      const { error } = await supabase.from('flashcards').delete().eq('id', id)
      if (error) throw error
      setFlashcards(flashcards.filter(c => c.id !== id))
    } catch (error) {
      console.error('Erreur suppression carte:', error.message)
    }
  }

  // Award XP at end of session
  useEffect(() => {
    const awardXP = async () => {
      // Condition de fin de session : index >= taille du tableau de session et session non vide
      const isSessionFinished = currentCardIndex >= sessionCards.length && sessionCards.length > 0;

      if (isStudying && isSessionFinished && !hasAwardedXp) {
        setHasAwardedXp(true)
        
        try {
          // 1. Récupération stricte de l'utilisateur
          const { data: { user }, error: authError } = await supabase.auth.getUser()
          if (authError || !user) {
            console.error("Erreur : Aucun utilisateur connecté pour l'attribution d'XP.", authError)
            return
          }

          // 2. Calcul de l'XP gagné
          const earnedXp = Math.min(flashcards.length, 20)
          setEarnedXpAmount(earnedXp)
          console.log("Tentative d'ajout d'XP pour :", user.id, "| XP gagné :", earnedXp)

          // 3. Récupérer le profil actuel
          const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('xp, level')
            .eq('id', user.id)
            .single()

          if (fetchError) {
            console.error("Erreur récupération profil:", fetchError)
            return
          }

          // 4. Calculer les nouvelles stats
          const newXp = profile.xp + earnedXp
          const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1
          
          if (newLevel > profile.level) {
            setIsLevelUp(true)
          }

          // 5. Mettre à jour Supabase
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ xp: newXp, level: newLevel })
            .eq('id', user.id)

          if (updateError) {
            console.error("Erreur update profil:", updateError)
          } else {
            console.log("Succès ! Nouvel XP total :", newXp, "| Niveau :", newLevel)
            // Dispatcher un événement global pour notifier les autres composants
            window.dispatchEvent(new CustomEvent('profileUpdated'))
          }

        } catch (error) {
          console.error('Erreur inattendue lors de l\'attribution de l\'XP:', error.message)
        }
      }
    }

    awardXP()
  }, [isStudying, currentCardIndex, sessionCards.length, hasAwardedXp, flashcards.length])

  if (selectedDeck) {
    // Vue 3 : L'Arène (Mode Révision)
    if (isStudying) {
      const isSessionOver = currentCardIndex >= sessionCards.length
      const currentCard = sessionCards[currentCardIndex]

      if (isSessionOver) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in zoom-in duration-500">
            <div className="bg-white border-8 border-gray-800 p-12 rounded-2xl shadow-[12px_12px_0px_0px_rgba(31,41,55,1)] text-center max-w-lg w-full">
              <h2 className="text-4xl font-black text-gray-900 uppercase mb-2" style={{ fontFamily: 'monospace' }}>
                Victoire ! 🎉
              </h2>
              
              <div className="py-4 space-y-2">
                <p className="text-2xl font-black text-yellow-500 uppercase tracking-widest animate-bounce">
                  ✨ +{earnedXpAmount} XP ✨
                </p>
                {isLevelUp && (
                  <p className="text-3xl font-black text-emerald-500 uppercase tracking-tighter animate-pulse">
                    🚀 LEVEL UP ! 🆙
                  </p>
                )}
              </div>

              <div className="w-full h-4 bg-gray-100 border-4 border-gray-800 rounded-full mb-8 overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 border-r-4 border-gray-800" 
                  style={{ width: `${(score / sessionCards.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-2xl font-black text-gray-800 uppercase tracking-tighter mb-8">
                Précision : {score} / {sessionCards.length}
              </p>
              <button 
                onClick={() => setIsStudying(false)}
                className="w-full bg-gray-800 text-white font-black py-4 rounded-xl border-b-8 border-gray-950 hover:border-b-4 hover:translate-y-1 active:scale-95 transition-all uppercase tracking-widest text-xl"
              >
                Terminer la Quête
              </button>
            </div>
          </div>
        )
      }

      return (
        <div className="flex flex-col items-center space-y-8 min-h-[70vh] py-10 animate-in fade-in duration-300">
          {/* Compteur */}
          <div className="bg-gray-800 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
            Carte {currentCardIndex + 1} / {sessionCards.length}
          </div>

          {/* La Grande Carte */}
          <div 
            className={`w-full max-w-2xl min-h-[400px] bg-[#fdf6e3] border-8 border-gray-800 rounded-2xl shadow-[12px_12px_0px_0px_rgba(31,41,55,1)] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden transition-all duration-300 ${isFlipped ? 'rotate-1' : '-rotate-1'}`}
          >
             {/* Texture Parchemin */}
             <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/papyros.png')]"></div>
             
             {!isFlipped ? (
               <div className="relative z-10 space-y-6">
                 <span className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] block mb-4">Question</span>
                 <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-tight" style={{ fontFamily: 'monospace' }}>
                   {currentCard.front}
                 </h3>
               </div>
             ) : (
               <div className="relative z-10 w-full flex flex-col h-full justify-between items-center space-y-8">
                 <div className="opacity-30">
                    <span className="text-[10px] font-black uppercase block mb-1">Question</span>
                    <p className="font-bold text-gray-600 line-clamp-1">{currentCard.front}</p>
                 </div>
                 <div className="flex-1 flex flex-col items-center justify-center">
                    <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em] block mb-4 animate-bounce">Réponse</span>
                    <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-tight italic" style={{ fontFamily: 'monospace' }}>
                      {currentCard.back}
                    </h3>
                 </div>
               </div>
             )}
          </div>

          {/* Boutons d'action */}
          <div className="w-full max-w-2xl flex gap-6">
            {!isFlipped ? (
              <button 
                onClick={() => setIsFlipped(true)}
                className="w-full bg-yellow-400 text-gray-900 font-black py-6 rounded-2xl border-4 border-gray-800 border-b-8 border-b-yellow-600 hover:border-b-4 hover:translate-y-1 active:scale-95 transition-all uppercase tracking-widest text-2xl shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
              >
                Retourner la carte 🔄
              </button>
            ) : (
              <>
                <button 
                  onClick={() => {
                    // Ajouter la carte ratée à la fin de la pile de session
                    setSessionCards(prevCards => [...prevCards, prevCards[currentCardIndex]])
                    setCurrentCardIndex(prev => prev + 1)
                    setIsFlipped(false)
                  }}
                  className="flex-1 bg-rose-400 text-gray-900 font-black py-6 rounded-2xl border-4 border-gray-800 border-b-8 border-b-rose-600 hover:border-b-4 hover:translate-y-1 active:scale-95 transition-all uppercase tracking-widest text-xl shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                >
                  Raté ❌
                </button>
                <button 
                  onClick={() => {
                    setScore(prev => prev + 1)
                    setCurrentCardIndex(prev => prev + 1)
                    setIsFlipped(false)
                  }}
                  className="flex-1 bg-emerald-400 text-gray-900 font-black py-6 rounded-2xl border-4 border-gray-800 border-b-8 border-b-emerald-600 hover:border-b-4 hover:translate-y-1 active:scale-95 transition-all uppercase tracking-widest text-xl shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                >
                  Validé ✅
                </button>
              </>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-8 animate-in slide-in-from-right duration-300">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-8 border-gray-800 pl-6 py-2">
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>
              🃏 Deck : {selectedDeck.name}
            </h2>
            <p className="mt-1 text-sm font-bold text-gray-600 uppercase tracking-widest">
              Gestion des cartes de ce grimoire.
            </p>
          </div>
          <button 
            onClick={() => setSelectedDeck(null)}
            className="self-start bg-gray-100 border-4 border-gray-800 px-4 py-2 font-black uppercase tracking-widest shadow-[4px_4px_0px_rgba(31,41,55,1)] hover:translate-y-1 hover:shadow-none transition-all"
          >
            ⬅️ Retour
          </button>
        </header>

        {/* Bouton de Lancement et Import */}
        <div className="py-4 space-y-4">
          <button 
            onClick={() => {
              // Mélange de Fisher-Yates pour une session aléatoire
              const shuffled = [...flashcards]
              for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
              }
              setSessionCards(shuffled)
              setIsStudying(true)
              setCurrentCardIndex(0)
              setIsFlipped(false)
              setScore(0)
              setHasAwardedXp(false)
              setIsLevelUp(false)
            }}
            disabled={flashcards.length === 0}
            className="w-full bg-gray-800 text-white font-black py-6 rounded-2xl border-b-8 border-gray-950 hover:border-b-4 hover:translate-y-1 active:scale-95 transition-all uppercase tracking-[0.2em] text-2xl shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⚔️ Lancer l'entraînement
          </button>

          <div className="flex justify-center">
            <input 
              type="file" 
              id="import-txt" 
              accept=".txt" 
              className="hidden" 
              onChange={handleFileUpload}
            />
            <label 
              htmlFor="import-txt"
              className="cursor-pointer bg-white border-4 border-gray-800 px-6 py-3 rounded-xl font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
            >
              📜 Importer un fichier .txt (Q;R)
            </label>
          </div>
          
          {flashcards.length === 0 && (
            <p className="text-center text-rose-500 font-bold mt-4 animate-pulse uppercase text-xs tracking-widest">
              Ajoutez des cartes pour débloquer l'entraînement !
            </p>
          )}
        </div>

        {/* Formulaire Flashcard */}
        <section className="bg-white border-4 border-gray-800 rounded-lg p-6 shadow-[4px_4px_0px_rgba(31,41,55,1)]">
          <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
            Nouvelle Carte
          </h3>
          <form onSubmit={createFlashcard} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Recto (Question)</label>
              <textarea 
                value={newCardFront}
                onChange={(e) => setNewCardFront(e.target.value)}
                className="w-full border-4 border-gray-800 p-2 rounded focus:outline-none font-bold text-sm h-24"
                placeholder="Entrez la question..."
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Verso (Réponse)</label>
              <textarea 
                value={newCardBack}
                onChange={(e) => setNewCardBack(e.target.value)}
                className="w-full border-4 border-gray-800 p-2 rounded focus:outline-none font-bold text-sm h-24"
                placeholder="Entrez la réponse..."
                required
              />
            </div>
            <div className="md:col-span-2">
              <button 
                type="submit"
                className="w-full bg-yellow-400 text-gray-900 font-black py-3 rounded border-b-4 border-gray-800 hover:border-b-0 hover:translate-y-1 transition-all uppercase text-xs tracking-widest shadow-[4px_4px_0px_rgba(31,41,55,1)]"
              >
                Ajouter la carte au grimoire
              </button>
            </div>
          </form>
        </section>

        {/* Liste des cartes */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.length === 0 ? (
            <p className="col-span-full text-center text-gray-400 font-bold italic py-10">Ce grimoire est encore vide...</p>
          ) : (
            flashcards.map(card => (
              <div key={card.id} className="bg-white border-4 border-gray-800 rounded-lg overflow-hidden shadow-[4px_4px_0px_rgba(31,41,55,1)] flex flex-col h-full">
                <div className="p-4 border-b-4 border-gray-800 flex-1 bg-gray-50">
                  <span className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Recto</span>
                  <p className="font-bold text-gray-900 whitespace-pre-wrap">{card.front}</p>
                </div>
                <div className="p-4 flex-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase mb-2 block text-emerald-600">Verso</span>
                  <p className="font-bold text-gray-700 whitespace-pre-wrap italic">{card.back}</p>
                </div>
                <button 
                  onClick={() => deleteFlashcard(card.id)}
                  className="bg-rose-50 border-t-4 border-gray-800 py-2 text-rose-500 font-black uppercase text-[10px] hover:bg-rose-500 hover:text-white transition-colors"
                >
                  Détruire la carte
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <header className="border-l-8 border-gray-800 pl-6 py-2">
        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>
          Grimoires (Flashcards)
        </h2>
        <p className="mt-2 text-lg font-bold text-gray-600 uppercase tracking-widest">
          Gérez vos decks et vos cartes de révision.
        </p>
      </header>

      {/* Formulaire Deck */}
      <section className="bg-white border-4 border-gray-800 rounded-lg p-6 shadow-[4px_4px_0px_rgba(31,41,55,1)]">
        <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
          Nouveau Grimoire
        </h3>
        <form onSubmit={createDeck} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-black text-gray-700 uppercase mb-1">Nom du Deck *</label>
            <input 
              type="text" 
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="Ex: Anatomie..."
              className="w-full border-4 border-gray-800 p-3 rounded-md focus:outline-none font-bold"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-black text-gray-700 uppercase mb-1">Matière liée *</label>
            <select 
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full border-4 border-gray-800 p-3 rounded-md focus:outline-none font-bold bg-white"
              required
            >
              <option value="">-- Choisir une matière --</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              className="w-full bg-gray-800 text-white font-black py-4 rounded-lg border-b-4 border-gray-950 hover:border-b-0 hover:translate-y-1 active:scale-95 transition-all uppercase tracking-widest"
            >
              Forger le Deck
            </button>
          </div>
        </form>
      </section>

      {/* Grille des Decks */}
      <section>
        {loading ? (
          <div className="text-center py-10">
            <span className="text-xl font-black uppercase text-gray-400 animate-pulse">Consultation des archives...</span>
          </div>
        ) : decks.length === 0 ? (
          <p className="text-gray-500 font-bold italic text-center py-10">Aucun grimoire forgé. Commencez votre collection !</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {decks.map((deck) => (
              <div 
                key={deck.id}
                className="group relative bg-white border-4 border-gray-800 rounded-xl p-8 shadow-[8px_8px_0px_rgba(31,41,55,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_rgba(31,41,55,1)] transition-all cursor-pointer overflow-hidden h-48 flex flex-col justify-between"
                onClick={() => setSelectedDeck(deck)}
              >
                {/* Book Spine */}
                <div className="absolute top-0 left-0 w-3 h-full bg-yellow-400 border-r-4 border-gray-800"></div>
                
                <div className="pl-4">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2 break-words" style={{ fontFamily: 'monospace' }}>
                    {deck.name}
                  </h3>
                  {deck.subjects?.name && (
                    <span className="px-2 py-0.5 border-2 border-gray-800 text-[10px] font-black uppercase rounded bg-gray-100">
                      📚 {deck.subjects.name}
                    </span>
                  )}
                </div>

                <div className="pl-4 flex justify-between items-center">
                   <span className="text-[10px] font-black text-gray-400 uppercase">
                     [ Gérer les cartes ]
                   </span>
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDeck(deck.id);
                    }}
                    className="w-8 h-8 bg-rose-100 border-2 border-gray-800 rounded flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default FlashcardsPage
