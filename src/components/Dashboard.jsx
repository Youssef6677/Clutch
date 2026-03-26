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
    <div>
      <AvatarProfile />
      
      <header className="mb-10 border-l-8 border-gray-800 pl-6 py-2">
        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>Quêtes de Révision</h2>
        <p className="mt-2 text-lg font-bold text-gray-600 uppercase tracking-widest">Suivez votre progression par matière.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white border-4 border-gray-800 rounded-lg p-6 shadow-[4px_4px_0px_rgba(31,41,55,1)] animate-pulse">
              <div className="h-8 bg-gray-200 w-1/2 mb-6"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-100 w-full"></div>
                <div className="h-10 bg-gray-100 w-full"></div>
                <div className="h-10 bg-gray-100 w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : subjectStats.length === 0 ? (
        <div className="bg-white border-4 border-gray-800 p-8 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <p className="text-2xl font-black text-gray-400 uppercase tracking-widest italic" style={{ fontFamily: 'monospace' }}>
            Aucune matière trouvée. Allez à la Bibliothèque pour en ajouter !
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
          {subjectStats.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
