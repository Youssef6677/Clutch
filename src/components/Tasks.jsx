import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'

const Tasks = ({ onXpGain }) => {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [importance, setImportance] = useState('Moyenne')
  const [link, setLink] = useState('')
  const [userId, setUserId] = useState(null)

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

  const addXP = async (amount) => {
    try {
      if (!userId) return

      // 1. Récupérer les stats actuelles
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('level, xp')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError

      let newXp = profile.xp + amount
      let newLevel = profile.level

      // 2. Logique de Level Up (100 XP par niveau)
      if (newXp >= 100) {
        newLevel += 1
        newXp -= 100
      }

      // 3. Update dans Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ xp: newXp, level: newLevel })
        .eq('id', userId)

      if (updateError) throw updateError

      // 4. Déclencher la mise à jour visuelle du HUD
      if (onXpGain) onXpGain()

    } catch (error) {
      console.error('Erreur gain XP:', error.message)
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!title.trim() || !userId) return

    try {
      const newTaskObj = {
        title,
        importance,
        link,
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

  const toggleComplete = async (taskId, currentStatus) => {
    try {
      const newStatus = !currentStatus
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: newStatus })
        .eq('id', taskId)

      if (error) throw error

      // Si la tâche passe à terminée, on gagne de l'XP
      if (newStatus) {
        await addXP(10)
      }

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, is_completed: newStatus } : task
      ))
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quête:', error.message)
    }
  }

  const deleteTask = async (taskId) => {
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

  const importanceColors = {
    'Haute': 'bg-rose-400',
    'Moyenne': 'bg-yellow-400',
    'Faible': 'bg-emerald-400'
  }

  return (
    <div className="space-y-10">
      <header className="border-l-8 border-gray-800 pl-6 py-2">
        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>
          Journal de Quêtes
        </h2>
        <p className="mt-2 text-lg font-bold text-gray-600 uppercase tracking-widest">
          Gérez vos tâches et objectifs.
        </p>
      </header>

      {/* Formulaire d'ajout */}
      <section className="bg-white border-4 border-gray-800 rounded-lg p-6 shadow-[4px_4px_0px_rgba(31,41,55,1)]">
        <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
          Nouvelle Quête
        </h3>
        <form onSubmit={addTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-gray-700 uppercase mb-1">Titre de la tâche *</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Réviser la thermo..."
              className="w-full border-4 border-gray-800 p-3 rounded-md focus:outline-none focus:ring-0 font-bold"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase mb-1">Importance</label>
            <select 
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              className="w-full border-4 border-gray-800 p-3 rounded-md focus:outline-none focus:ring-0 font-bold bg-white"
            >
              <option value="Faible">Faible</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Haute">Haute</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase mb-1">Lien (optionnel)</label>
            <input 
              type="url" 
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full border-4 border-gray-800 p-3 rounded-md focus:outline-none focus:ring-0 font-bold"
            />
          </div>
          <div className="md:col-span-2 mt-2">
            <button 
              type="submit"
              disabled={!userId}
              className="w-full bg-gray-800 text-white font-black py-4 rounded-lg border-b-4 border-gray-950 hover:border-b-0 hover:translate-y-1 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter au Journal
            </button>
          </div>
        </form>
      </section>

      {/* Liste des tâches */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
            Quêtes Actives
          </h3>
          {isLoading && (
            <span className="text-xs font-black uppercase text-gray-400 animate-pulse">Chargement...</span>
          )}
        </div>
        
        {!isLoading && tasks.length === 0 ? (
          <p className="text-gray-500 font-bold italic">Aucune quête en cours. Reposez-vous, héros !</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`bg-white border-4 border-gray-800 rounded-lg p-4 flex flex-col md:flex-row items-center gap-4 transition-all shadow-[4px_4px_0px_rgba(31,41,55,1)] ${task.is_completed ? 'opacity-60 grayscale' : ''}`}
              >
                <button 
                  onClick={() => toggleComplete(task.id, task.is_completed)}
                  className={`w-8 h-8 border-4 border-gray-800 rounded flex items-center justify-center font-black transition-colors ${task.is_completed ? 'bg-emerald-400' : 'bg-white hover:bg-gray-100'}`}
                >
                  {task.is_completed && '✓'}
                </button>
                
                <div className="flex-1 text-center md:text-left">
                  <h4 className={`text-lg font-black uppercase tracking-tight ${task.is_completed ? 'line-through' : ''}`} style={{ fontFamily: 'monospace' }}>
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1">
                    <span className={`px-2 py-0.5 border-2 border-gray-800 text-[10px] font-black uppercase rounded ${importanceColors[task.importance]}`}>
                      {task.importance}
                    </span>
                    {task.link && (
                      <a 
                        href={task.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 border-2 border-gray-800 text-[10px] font-black uppercase rounded bg-blue-400 hover:bg-blue-500 transition-colors"
                      >
                        🔗 Ouvrir le lien
                      </a>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-400 hover:text-rose-500 font-black text-xs uppercase tracking-tighter transition-colors"
                >
                  [ Supprimer ]
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Tasks
