import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'

const Resources = ({ subject, onBack }) => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('Cours')
  const [userId, setUserId] = useState(null)
  const [selectedResource, setSelectedResource] = useState(null)

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          const { data, error } = await supabase
            .from('resources')
            .select('*')
            .eq('subject_id', subject.id)
            .order('created_at', { ascending: true })

          if (error) throw error
          setResources(data || [])
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des ressources:', error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [subject.id])

  const addResource = async (e) => {
    e.preventDefault()
    if (!title.trim() || !url.trim() || !userId) return

    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([{ 
          title, 
          url, 
          category, 
          subject_id: subject.id, 
          user_id: userId,
          is_completed: false
        }])
        .select()

      if (error) throw error
      if (data) {
        setResources([...resources, data[0]])
        setTitle('')
        setUrl('')
        setCategory('Cours')
        window.dispatchEvent(new CustomEvent('resourcesUpdated'))
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la ressource:', error.message)
    }
  }

  const toggleComplete = async (resourceId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ is_completed: !currentStatus })
        .eq('id', resourceId)

      if (error) throw error
      setResources(resources.map(r => 
        r.id === resourceId ? { ...r, is_completed: !currentStatus } : r
      ))
      window.dispatchEvent(new CustomEvent('resourcesUpdated'))
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error.message)
    }
  }

  const deleteResource = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette ressource ?')) return

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)

      if (error) throw error
      setResources(resources.filter(r => r.id !== id))
      window.dispatchEvent(new CustomEvent('resourcesUpdated'))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error.message)
    }
  }

  const ResourceItem = ({ resource }) => (
    <div className={`flex items-center gap-4 bg-white dark:bg-slate-800 border-4 border-gray-800 dark:border-slate-700 p-3 rounded-lg shadow-[4px_4px_0px_rgba(31,41,55,1)] dark:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all ${resource.is_completed ? 'opacity-50 grayscale' : 'hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_rgba(31,41,55,1)] dark:hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]'} ${selectedResource?.id === resource.id ? 'ring-4 ring-yellow-400 dark:ring-yellow-500' : ''}`}>
      <button 
        onClick={() => toggleComplete(resource.id, resource.is_completed)}
        className={`w-7 h-7 border-4 border-gray-800 dark:border-slate-600 rounded flex items-center justify-center font-black transition-colors ${resource.is_completed ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
      >
        {resource.is_completed && <span className="text-gray-900 dark:text-white">✓</span>}
      </button>
      
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => setSelectedResource(resource)}
      >
        <h4 className={`text-sm font-black uppercase tracking-tight truncate dark:text-white ${resource.is_completed ? 'line-through' : ''}`} style={{ fontFamily: 'monospace' }}>
          {resource.title}
        </h4>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => setSelectedResource(resource)}
          className="px-3 py-1 bg-blue-400 dark:bg-blue-500 text-gray-900 dark:text-white border-2 border-gray-800 dark:border-slate-700 text-[10px] font-black uppercase rounded shadow-[2px_2px_0px_rgba(31,41,55,1)] dark:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          Lire
        </button>
        <button 
          onClick={() => deleteResource(resource.id)}
          className="text-rose-500 dark:text-rose-400 hover:scale-110 transition-transform font-black text-xl px-1"
        >
          ×
        </button>
      </div>
    </div>
  )

  const categories = ['Cours', 'TD', 'Annales']

  return (
    <div className="space-y-8 animate-in fade-in duration-500 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-8 border-gray-800 dark:border-yellow-400 pl-6 py-2">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight drop-shadow-sm" style={{ fontFamily: 'monospace' }}>
            💎 Ressources : {subject.name}
          </h2>
          <p className="mt-1 text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
            Organisez vos documents d'étude.
          </p>
        </div>
        <button 
          onClick={onBack}
          className="self-start bg-white dark:bg-slate-800 border-4 border-gray-800 dark:border-slate-700 px-6 py-2 font-black uppercase tracking-widest shadow-[4px_4px_0px_rgba(31,41,55,1)] dark:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all dark:text-white"
        >
          ⬅️ Retour
        </button>
      </header>

      {/* Formulaire d'ajout */}
      <section className="bevel-3d-deep p-6 bg-white dark:bg-slate-800 transition-colors">
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter flex items-center gap-2" style={{ fontFamily: 'monospace' }}>
          ✨ Nouvelle Ressource
        </h3>
        <form onSubmit={addResource} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-widest">Titre</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Chapitre 1..."
              className="w-full border-4 border-gray-800 dark:border-slate-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)] transition-all"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-widest">Lien (URL)</label>
            <input 
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border-4 border-gray-800 dark:border-slate-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)] transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-widest">Catégorie</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-4 border-gray-800 dark:border-slate-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-all cursor-pointer shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              disabled={!userId}
              className="w-full bg-emerald-400 dark:bg-emerald-500 text-gray-900 dark:text-white font-black py-3 rounded-xl border-b-8 border-emerald-600 dark:border-emerald-700 hover:border-b-0 hover:translate-y-2 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs shadow-lg disabled:opacity-50"
            >
              ➕ Ajouter
            </button>
          </div>
        </form>
      </section>

      {/* Layout principal */}
      <div className={`grid grid-cols-1 ${selectedResource ? 'lg:grid-cols-12' : 'lg:grid-cols-3'} gap-10`}>
        {/* Colonne Liste des ressources */}
        <div className={`${selectedResource ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-10`}>
          {categories.map(cat => (
            <div key={cat} className="space-y-6">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter border-b-4 border-gray-800 dark:border-slate-700 pb-2 inline-block flex items-center gap-2" style={{ fontFamily: 'monospace' }}>
                <span className="text-lg opacity-60">📁</span> {cat}
              </h3>
              <div className="space-y-4">
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-16 bg-gray-100 dark:bg-slate-800 rounded-xl border-4 border-gray-200 dark:border-slate-700"></div>
                    <div className="h-16 bg-gray-100 dark:bg-slate-800 rounded-xl border-4 border-gray-200 dark:border-slate-700"></div>
                  </div>
                ) : resources.filter(r => r.category === cat).length === 0 ? (
                  <p className="text-gray-400 dark:text-slate-600 text-xs font-black uppercase tracking-widest italic border-4 border-dashed border-gray-200 dark:border-slate-800 p-6 rounded-xl text-center">Aucune ressource.</p>
                ) : (
                  resources
                    .filter(r => r.category === cat)
                    .map(resource => <ResourceItem key={resource.id} resource={resource} />)
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Colonne Pupitre de Lecture */}
        {selectedResource && (
          <div className="lg:col-span-8 sticky top-4">
            <div className="bg-white dark:bg-slate-800 border-8 border-gray-800 dark:border-slate-700 rounded-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[65vh] overflow-hidden transition-all">
              <div className="bg-gray-800 dark:bg-slate-900 p-3 flex justify-between items-center border-b-4 border-gray-800 dark:border-slate-700">
                <span className="text-white text-sm font-black uppercase tracking-[0.2em] ml-3" style={{ fontFamily: 'monospace' }}>
                  📜 Pupitre de Lecture
                </span>
                <button 
                  onClick={() => setSelectedResource(null)}
                  className="w-10 h-10 bg-rose-500 text-white border-4 border-gray-950 dark:border-slate-700 flex items-center justify-center font-black hover:bg-rose-600 active:translate-y-1 transition-all rounded-lg"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[url('https://www.transparenttextures.com/patterns/papyros.png')] dark:bg-slate-900/50 relative">
                {/* Texture Overlay for Dark Mode */}
                <div className="absolute inset-0 dark:bg-slate-950/20 pointer-events-none"></div>
                
                <h3 className="text-5xl font-black text-gray-900 dark:text-white uppercase mb-6 tracking-tighter leading-tight relative z-10" style={{ fontFamily: 'monospace' }}>
                  {selectedResource.title}
                </h3>
                <div className="w-32 h-3 bg-gray-800 dark:bg-yellow-500 mb-8 relative z-10"></div>
                <p className="text-gray-600 dark:text-gray-400 font-bold uppercase tracking-[0.2em] text-sm mb-10 leading-relaxed relative z-10">
                  Ce document est scellé par la magie des archives.<br/>
                  Utilisez votre grimoire pour débloquer son savoir.
                </p>
                <a 
                  href={selectedResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-400 dark:bg-yellow-500 text-gray-900 dark:text-white font-black px-12 py-5 border-4 border-gray-800 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none active:scale-95 transition-all uppercase tracking-[0.3em] text-lg flex items-center gap-4 relative z-10"
                >
                  Ouvrir le document 🔗
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Resources
