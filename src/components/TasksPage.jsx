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
        return 'bg-emerald-400 text-gray-900'
      case 'Moyenne':
        return 'bg-orange-400 text-gray-900'
      case 'Haute':
        return 'bg-rose-500 text-white'
      default:
        return 'bg-gray-400 text-gray-900'
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 transition-colors duration-300">
      {/* Message de récompense XP */}
      {xpMessage && (
        <div className="fixed top-24 right-10 z-50 bg-yellow-400 border-4 border-gray-800 px-6 py-3 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-bounce font-black uppercase tracking-widest text-gray-900">
          {xpMessage}
        </div>
      )}

      <header className="border-l-8 border-gray-800 dark:border-yellow-400 pl-6 py-2">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight drop-shadow-sm" style={{ fontFamily: 'monospace' }}>
          ⚔️ Journal de Quêtes
        </h2>
        <p className="mt-2 text-lg font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
          Accomplissez vos objectifs pour gagner de l'XP.
        </p>
      </header>

      {/* Formulaire Rétro */}
      <section className="bevel-3d-deep p-8 bg-white dark:bg-slate-800 transition-colors duration-300">
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter flex items-center gap-2" style={{ fontFamily: 'monospace' }}>
          <span className="text-2xl">📝</span> Nouvelle Quête
        </h3>
        <form onSubmit={addTask} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-widest">Titre de la quête *</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Réviser le chapitre sur les ondes..."
              className="w-full border-4 border-gray-800 dark:border-slate-600 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-widest">Importance</label>
            <select 
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              className="w-full border-4 border-gray-800 dark:border-slate-600 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-all cursor-pointer shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
            >
              <option value="Faible">Faible (+10 XP)</option>
              <option value="Moyenne">Moyenne (+20 XP)</option>
              <option value="Haute">Haute (+40 XP)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-widest">Lien optionnel (Ressource, PDF...)</label>
            <input 
              type="url" 
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full border-4 border-gray-800 dark:border-slate-600 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
            />
          </div>
          <button 
            type="submit"
            disabled={!userId}
            className="md:col-span-3 bg-emerald-400 dark:bg-emerald-500 text-gray-900 dark:text-white font-black py-5 rounded-xl border-b-8 border-emerald-600 dark:border-emerald-700 hover:border-b-0 hover:translate-y-2 active:scale-95 transition-all uppercase tracking-[0.2em] text-lg shadow-lg disabled:opacity-50"
          >
            ➕ Ajouter la Quête au Journal
          </button>
        </form>
      </section>

      {/* Liste des Quêtes */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
            Quêtes Actuelles
          </h3>
          <div className="h-1 flex-1 bg-gray-800 dark:bg-slate-700 rounded-full opacity-20"></div>
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-slate-800 border-4 border-gray-200 dark:border-slate-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-gray-50 dark:bg-slate-900/50 border-4 border-dashed border-gray-300 dark:border-slate-700 p-16 rounded-2xl text-center">
            <p className="text-gray-400 dark:text-gray-600 font-black uppercase tracking-[0.3em] italic text-xl">
              Le journal est vide. Repose-toi, héros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`bevel-3d-deep p-6 flex flex-col md:flex-row items-center gap-6 transition-all bg-white dark:bg-slate-800 ${task.is_completed ? 'opacity-40 grayscale pointer-events-none' : 'hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] dark:hover:shadow-[0_0_40px_rgba(251,191,36,0.1)]'}`}
              >
                {/* Bouton Accomplir */}
                {!task.is_completed ? (
                  <button 
                    onClick={() => completeTask(task.id, task.importance)}
                    className="group relative flex flex-col items-center justify-center shrink-0"
                  >
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 border-4 border-gray-800 dark:border-slate-600 rounded-xl flex items-center justify-center text-3xl group-hover:bg-emerald-400 group-hover:border-emerald-600 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                      ⚔️
                    </div>
                    <span className="text-[10px] font-black uppercase mt-2 text-gray-500 dark:text-gray-400 tracking-tighter group-hover:text-emerald-500">Accomplir</span>
                  </button>
                ) : (
                  <div className="w-16 h-16 bg-emerald-400 border-4 border-emerald-600 rounded-xl flex items-center justify-center text-3xl shadow-inner">
                    ✅
                  </div>
                )}
                
                <div className="flex-1 text-center md:text-left min-w-0">
                  <h4 className={`text-2xl font-black uppercase tracking-tight truncate dark:text-white ${task.is_completed ? 'line-through' : ''}`} style={{ fontFamily: 'monospace' }}>
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                    <span className={`px-4 py-1 border-2 border-gray-800 dark:border-slate-600 text-[10px] font-black uppercase rounded-lg shadow-[3px_3px_0px_rgba(0,0,0,1)] ${getImportanceBadge(task.importance)}`}>
                      {task.importance}
                    </span>
                    {task.link && (
                      <a 
                        href={task.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-1 border-2 border-gray-800 dark:border-slate-600 text-[10px] font-black uppercase rounded-lg bg-blue-400 text-gray-900 hover:bg-blue-500 transition-colors shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                      >
                        🔗 Ressource
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {task.is_completed && (
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] animate-pulse">
                      Terminé
                    </span>
                  )}
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="w-12 h-12 flex items-center justify-center bg-rose-100 dark:bg-rose-900/30 text-rose-500 border-2 border-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-[3px_3px_0px_rgba(244,63,94,0.2)]"
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