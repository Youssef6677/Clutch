import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import SubjectCard from './SubjectCard'
import AvatarProfile from './AvatarProfile'

const Dashboard = () => {
  const [subjectStats, setSubjectStats] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Récupérer toutes les matières de l'utilisateur
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)

      if (subjectsError) throw subjectsError

      // Récupérer toutes les ressources de l'utilisateur
      const { data: resources, error: resourcesError } = await supabase
        .from('resources')
        .select('subject_id, category, is_completed')
        .eq('user_id', user.id)

      if (resourcesError) throw resourcesError

      // Calculer les stats pour chaque matière
      const stats = subjects.map(subject => {
        const subjectResources = resources.filter(r => r.subject_id === subject.id)
        
        const calculateProgress = (category) => {
          const catResources = subjectResources.filter(r => r.category === category)
          if (catResources.length === 0) return 0
          const completed = catResources.filter(r => r.is_completed).length
          return Math.round((completed / catResources.length) * 100)
        }

        return {
          id: subject.id,
          name: subject.name,
          cours: calculateProgress('Cours'),
          td: calculateProgress('TD'),
          annales: calculateProgress('Annales')
        }
      })

      setSubjectStats(stats)
    } catch (error) {
      console.error('Erreur lors du calcul des stats du dashboard:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()

    // Écouteur pour rafraîchir les données quand une ressource est mise à jour
    window.addEventListener('resourcesUpdated', fetchDashboardStats)
    
    return () => {
      window.removeEventListener('resourcesUpdated', fetchDashboardStats)
    }
  }, [])

  return (
    <div className="space-y-12">
      <AvatarProfile />
      
      <header className="mb-10 border-l-8 border-yellow-400 pl-6 py-2">
        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
          ⚔️ Journal de Campagne
        </h2>
        <p className="mt-2 text-sm font-bold text-gray-500 uppercase tracking-[0.3em]">
          Suivez votre progression et accomplissez vos quêtes.
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bevel-3d-deep h-64 animate-pulse"></div>
          ))}
        </div>
      ) : subjectStats.length === 0 ? (
        <div className="bevel-3d-deep bg-white/50 backdrop-blur-sm p-16 text-center">
          <p className="text-2xl font-black text-gray-400 uppercase tracking-[0.2em] italic mb-6" style={{ fontFamily: 'monospace' }}>
            Aucune quête trouvée dans votre grimoire.
          </p>
          <button className="bevel-3d-yellow px-8 py-3 font-black uppercase text-sm tracking-widest hover:translate-y-0.5 transition-all">
            Explorer la Bibliothèque 📚
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {subjectStats.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
