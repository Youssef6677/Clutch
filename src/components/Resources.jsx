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
    <div className={`flex items-center gap-4 bg-white border-4 border-gray-800 p-3 rounded-lg shadow-[4px_4px_0px_rgba(31,41,55,1)] transition-all ${resource.is_completed ? 'opacity-60 grayscale' : ''} ${selectedResource?.id === resource.id ? 'ring-4 ring-yellow-400' : ''}`}>
      <button 
        onClick={() => toggleComplete(resource.id, resource.is_completed)}
        className={`w-6 h-6 border-4 border-gray-800 rounded flex items-center justify-center font-black transition-colors ${resource.is_completed ? 'bg-emerald-400' : 'bg-white hover:bg-gray-100'}`}
      >
        {resource.is_completed && '✓'}
      </button>
      
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => setSelectedResource(resource)}
      >
        <h4 className={`text-sm font-black uppercase tracking-tight truncate ${resource.is_completed ? 'line-through' : ''}`} style={{ fontFamily: 'monospace' }}>
          {resource.title}
        </h4>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => setSelectedResource(resource)}
          className="px-3 py-1 bg-blue-400 border-2 border-gray-800 text-[10px] font-black uppercase rounded shadow-[2px_2px_0px_rgba(31,41,55,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          Lire
        </button>
        <button 
          onClick={() => deleteResource(resource.id)}
          className="text-rose-500 hover:scale-110 transition-transform font-black text-xl"
        >
          ×
        </button>
      </div>
    </div>
  )

  const categories = ['Cours', 'TD', 'Annales']

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-8 border-gray-800 pl-6 py-2">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>
            💎 Ressources : {subject.name}
          </h2>
          <p className="mt-1 text-sm font-bold text-gray-600 uppercase tracking-widest">
            Organisez vos documents d'étude.
          </p>
        </div>
        <button 
          onClick={onBack}
          className="self-start bg-gray-100 border-4 border-gray-800 px-4 py-2 font-black uppercase tracking-widest shadow-[4px_4px_0px_rgba(31,41,55,1)] hover:translate-y-1 hover:shadow-none transition-all"
        >
          ⬅️ Retour
        </button>
      </header>

      {/* Formulaire d'ajout */}
      <section className="bg-white border-4 border-gray-800 rounded-lg p-6 shadow-[4px_4px_0px_rgba(31,41,55,1)]">
        <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
          Nouvelle Ressource
        </h3>
        <form onSubmit={addResource} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre (ex: Chapitre 1)"
              className="w-full border-4 border-gray-800 p-2 rounded focus:outline-none font-bold text-sm"
              required
            />
          </div>
          <div className="md:col-span-1">
            <input 
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Lien (URL)"
              className="w-full border-4 border-gray-800 p-2 rounded focus:outline-none font-bold text-sm"
              required
            />
          </div>
          <div>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-4 border-gray-800 p-2 rounded focus:outline-none font-bold text-sm bg-white"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <button 
            type="submit"
            disabled={!userId}
            className="bg-emerald-400 text-gray-900 font-black py-2 rounded border-b-4 border-emerald-600 hover:border-b-0 hover:translate-y-1 transition-all uppercase text-xs tracking-widest"
          >
            Ajouter
          </button>
        </form>
      </section>

      {/* Layout principal */}
      <div className={`grid grid-cols-1 ${selectedResource ? 'lg:grid-cols-12' : 'lg:grid-cols-3'} gap-8`}>
        {/* Colonne Liste des ressources */}
        <div className={`${selectedResource ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-8`}>
          {categories.map(cat => (
            <div key={cat} className="space-y-4">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter border-b-4 border-gray-800 pb-2 inline-block" style={{ fontFamily: 'monospace' }}>
                📁 {cat}
              </h3>
              <div className="space-y-3">
                {loading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                ) : resources.filter(r => r.category === cat).length === 0 ? (
                  <p className="text-gray-400 text-xs font-bold italic">Aucune ressource ici.</p>
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
            <div className="bg-white border-4 border-gray-800 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[60vh]">
              <div className="bg-gray-800 p-2 flex justify-between items-center">
                <span className="text-white text-xs font-black uppercase tracking-widest ml-2" style={{ fontFamily: 'monospace' }}>
                  📜 Pupitre de Lecture
                </span>
                <button 
                  onClick={() => setSelectedResource(null)}
                  className="w-8 h-8 bg-rose-500 text-white border-2 border-gray-950 flex items-center justify-center font-black hover:bg-rose-600 active:translate-y-0.5 transition-all"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/papyros.png')]">
                <h3 className="text-4xl font-black text-gray-900 uppercase mb-4 tracking-tighter leading-tight" style={{ fontFamily: 'monospace' }}>
                  {selectedResource.title}
                </h3>
                <div className="w-24 h-2 bg-gray-800 mb-6"></div>
                <p className="text-gray-600 font-bold uppercase tracking-widest text-sm mb-8">
                  Ce document est scellé par la magie de Google.<br/>
                  Déverrouillez-le pour poursuivre votre quête.
                </p>
                <a 
                  href={selectedResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-400 text-gray-900 font-black px-8 py-4 border-4 border-gray-800 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] hover:translate-y-1 hover:shadow-none active:scale-95 transition-all uppercase tracking-widest flex items-center gap-3"
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
