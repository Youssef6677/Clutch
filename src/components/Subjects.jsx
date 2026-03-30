import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import Resources from './Resources'

const Subjects = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [userId, setUserId] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)

  useEffect(() => {
    const fetchUserAndSubjects = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })

          if (error) throw error
          setSubjects(data || [])
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des matières:', error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndSubjects()
  }, [])

  const addSubject = async (e) => {
    e.preventDefault()
    if (!newSubjectName.trim() || !userId) return

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([{ name: newSubjectName, user_id: userId }])
        .select()

      if (error) throw error
      if (data) {
        setSubjects([...subjects, data[0]])
        setNewSubjectName('')
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la matière:', error.message)
    }
  }

  const deleteSubject = async (id, name) => {
    if (!window.confirm(`Es-tu sûr de vouloir supprimer la matière "${name}" ? Cela supprimera aussi tous les decks et flashcards à l'intérieur !`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)

      if (error) throw error
      setSubjects(subjects.filter(s => s.id !== id))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error.message)
    }
  }

  if (selectedSubject) {
    return (
      <Resources 
        subject={selectedSubject} 
        onBack={() => setSelectedSubject(null)} 
      />
    )
  }

  return (
    <div className="space-y-10 transition-colors duration-300">
      <header className="border-l-8 border-gray-800 dark:border-yellow-400 pl-6 py-2">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>
          La Bibliothèque
        </h2>
        <p className="mt-2 text-lg font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
          Gérez vos grimoires de connaissances.
        </p>
      </header>

      {/* Formulaire d'ajout */}
      <section className="bevel-3d-deep p-6 bg-white dark:bg-slate-800 transition-colors duration-300">
        <form onSubmit={addSubject} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="Nom de la nouvelle matière (ex: Mathématiques)"
            className="flex-1 border-4 border-gray-800 dark:border-slate-600 p-3 rounded-md focus:outline-none focus:ring-0 font-bold bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
            required
          />
          <button 
            type="submit"
            disabled={!userId}
            className="bg-gray-800 dark:bg-yellow-400 text-white dark:text-gray-900 font-black px-8 py-3 rounded-lg border-b-4 border-gray-950 dark:border-yellow-600 hover:border-b-0 hover:translate-y-1 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
          >
            Ajouter une Matière
          </button>
        </form>
      </section>

      {/* Grille des matières */}
      <section>
        {loading ? (
          <div className="text-center py-10">
            <span className="text-xl font-black uppercase text-gray-400 animate-pulse">Ouverture des grimoires...</span>
          </div>
        ) : subjects.length === 0 ? (
          <p className="text-gray-500 font-bold italic text-center py-10">Votre bibliothèque est vide. Commencez par ajouter une matière !</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((subject) => (
              <div 
                key={subject.id}
                className="group relative bevel-3d-deep bg-white dark:bg-slate-800 p-8 hover:-translate-y-2 transition-all cursor-pointer overflow-hidden hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] dark:hover:shadow-[0_0_25px_rgba(52,211,153,0.2)]"
                onClick={() => setSelectedSubject(subject)}
              >
                {/* Book Decoration */}
                <div className="absolute top-0 left-0 w-4 h-full bg-emerald-400 border-r-4 border-gray-800 dark:border-slate-700"></div>
                
                <div className="pl-6">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 break-words" style={{ fontFamily: 'monospace' }}>
                    {subject.name}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 border-2 border-gray-800 dark:border-slate-600 text-[10px] font-black uppercase rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                      Matière
                    </span>
                  </div>
                </div>

                {/* Delete Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSubject(subject.id, subject.name);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-rose-100 dark:bg-rose-900/30 border-4 border-gray-800 dark:border-slate-600 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                  title="Supprimer la matière"
                >
                  <span className="font-black text-xl">×</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Subjects
