import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'

const TasksPage = () => {
  const XP_PER_LEVEL = 100
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [importance, setImportance] = useState('Moyenne')
  const [link, setLink] = useState('')
  const [userId, setUserId] = useState(null)
  const [xpMessage, setXpMessage] = useState(null)

  // Récupération des tâches au chargement
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('is_completed', { ascending: true })
            .order('created_at', { ascending: false })

          if (error) throw error
          setTasks(data || [])
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des quêtes:', error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const showXpMessage = (msg) => {
    setXpMessage(msg)
    setTimeout(() => setXpMessage(null), 3000)
  }

  const awardXP = async (importanceLevel) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Déterminer le montant d'XP selon l'importance
      let xpAmount = 20 // Moyenne par défaut
      if (importanceLevel === 'Faible') xpAmount = 10
      if (importanceLevel === 'Haute') xpAmount = 40

      // Récupérer le profil actuel
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', user.id)
        .single()

      if (fetchError) throw fetchError

      let newXp = profile.xp + xpAmount
      let newLevel = profile.level

      // Logique de Level Up
      while (newXp >= XP_PER_LEVEL) {
        newLevel += 1
        newXp -= XP_PER_LEVEL
      }

      // Mise à jour du profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ xp: newXp, level: newLevel })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Feedback visuel et notification globale
      showXpMessage(`Quête accomplie ! +${xpAmount} XP ✨`)
      window.dispatchEvent(new CustomEvent('profileUpdated'))
      
    } catch (error) {
      console.error('Erreur lors de l\'attribution d\'XP:', error.message)
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!title.trim() || !userId) return

    try {
      const newTaskObj = {
        title,
        importance,
        link: link.trim() || null,
        is_completed: false,
        user_id: userId
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTaskObj])
        .select()

      if (error) throw error

      if (data) {
        setTasks([data[0], ...tasks])
        setTitle('')
        setImportance('Moyenne')
        setLink('')
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la quête:', error.message)
    }
  }

  const completeTask = async (taskId, importanceLevel) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: true })
        .eq('id', taskId)

      if (error) throw error

      // Récompense XP
      await awardXP(importanceLevel)

      // Mise à jour locale
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, is_completed: true } : task
      ))
    } catch (error) {
      console.error('Erreur lors de la validation de la quête:', error.message)
    }
  }

  const deleteTask = async (taskId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette quête ?')) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Erreur lors de la suppression de la quête:', error.message)
    }
  }

  const getImportanceBadge = (level) => {
    switch (level) {
      case 'Faible':
        return 'bg-emerald-400'
      case 'Moyenne':
        return 'bg-orange-400'
      case 'Haute':
        return 'bg-rose-500 text-white'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Message de récompense XP */}
      {xpMessage && (
        <div className="fixed top-20 right-10 z-50 bg-yellow-400 border-4 border-gray-800 px-6 py-3 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-bounce font-black uppercase tracking-widest">
          {xpMessage}
        </div>
      )}

      <header className="border-l-8 border-gray-800 pl-6 py-2">
        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>
          ⚔️ Journal de Quêtes
        </h2>
        <p className="mt-2 text-lg font-bold text-gray-600 uppercase tracking-widest">
          Accomplissez vos objectifs pour gagner de l'XP.
        </p>
      </header>

      {/* Formulaire Rétro */}
      <section className="bg-white border-4 border-gray-800 rounded-lg p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
          Nouvelle Quête
        </h3>
        <form onSubmit={addTask} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <label className="block text-xs font-black text-gray-700 uppercase mb-2">Titre de la quête *</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Réviser le chapitre sur les ondes..."
              className="w-full border-4 border-gray-800 p-3 rounded focus:outline-none focus:ring-0 font-bold text-lg"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase mb-2">Importance</label>
            <select 
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              className="w-full border-4 border-gray-800 p-3 rounded focus:outline-none font-bold bg-white"
            >
              <option value="Faible">Faible (+10 XP)</option>
              <option value="Moyenne">Moyenne (+20 XP)</option>
              <option value="Haute">Haute (+40 XP)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-gray-700 uppercase mb-2">Lien optionnel (Ressource, PDF...)</label>
            <input 
              type="url" 
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full border-4 border-gray-800 p-3 rounded focus:outline-none font-bold"
            />
          </div>
          <button 
            type="submit"
            disabled={!userId}
            className="md:col-span-3 bg-emerald-400 text-gray-900 font-black py-4 rounded border-b-8 border-emerald-600 hover:border-b-0 hover:translate-y-2 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm"
          >
            ➕ Ajouter la Quête au Journal
          </button>
        </form>
      </section>

      {/* Liste des Quêtes */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
            Quêtes Actuelles
          </h3>
          <div className="h-1 flex-1 bg-gray-800"></div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 border-4 border-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-gray-50 border-4 border-dashed border-gray-300 p-10 rounded-lg text-center">
            <p className="text-gray-400 font-black uppercase tracking-widest italic">
              Le journal est vide. Repose-toi, héros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`bg-white border-4 border-gray-800 rounded-lg p-5 flex flex-col md:flex-row items-center gap-6 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${task.is_completed ? 'opacity-50 grayscale' : 'hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'}`}
              >
                {/* Bouton Accomplir */}
                {!task.is_completed ? (
                  <button 
                    onClick={() => completeTask(task.id, task.importance)}
                    className="group relative flex flex-col items-center justify-center"
                  >
                    <div className="w-14 h-14 bg-white border-4 border-gray-800 rounded flex items-center justify-center text-2xl group-hover:bg-emerald-400 transition-colors">
                      ⚔️
                    </div>
                    <span className="text-[8px] font-black uppercase mt-1">Accomplir</span>
                  </button>
                ) : (
                  <div className="w-14 h-14 bg-emerald-400 border-4 border-gray-800 rounded flex items-center justify-center text-2xl">
                    ✅
                  </div>
                )}
                
                <div className="flex-1 text-center md:text-left min-w-0">
                  <h4 className={`text-xl font-black uppercase tracking-tight truncate ${task.is_completed ? 'line-through' : ''}`} style={{ fontFamily: 'monospace' }}>
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                    <span className={`px-3 py-1 border-2 border-gray-800 text-[10px] font-black uppercase rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] ${getImportanceBadge(task.importance)}`}>
                      {task.importance}
                    </span>
                    {task.link && (
                      <a 
                        href={task.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1 border-2 border-gray-800 text-[10px] font-black uppercase rounded bg-blue-400 hover:bg-blue-500 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-1"
                      >
                        🔗 Lien
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {task.is_completed && (
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      Terminé
                    </span>
                  )}
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="w-10 h-10 flex items-center justify-center bg-rose-100 text-rose-500 border-2 border-rose-500 rounded hover:bg-rose-500 hover:text-white transition-all shadow-[2px_2px_0px_rgba(244,63,94,0.3)]"
                    title="Supprimer la quête"
                  >
                    🗑️
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

export default TasksPage