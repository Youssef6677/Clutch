import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { supabase } from '../supabaseClient.js'
import './SchedulePage.css'

const SchedulePage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [userId, setUserId] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    color: '#fbbf24' // Yellow-400 by default
  })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchEvents(user.id)
      }
    }
    init()
  }, [])

  const fetchEvents = async (uid) => {
    try {
      const { data, error } = await supabase
        .from('timetable')
        .select('*')
        .eq('user_id', uid)

      if (error) throw error

      // Transformation pour FullCalendar
      const formattedEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        start: `${event.event_date}T${event.start_time}`,
        end: `${event.event_date}T${event.end_time}`,
        backgroundColor: event.color || '#fbbf24',
        borderColor: '#1f2937',
        extendedProps: {
          description: event.description
        }
      }))

      setEvents(formattedEvents)
    } catch (error) {
      console.error('Erreur lors de la récupération du planning:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    if (!userId) return

    try {
      const { error } = await supabase
        .from('timetable')
        .insert([{
          ...formData,
          user_id: userId
        }])

      if (error) throw error

      setShowModal(false)
      setFormData({ title: '', description: '', event_date: '', start_time: '', end_time: '', color: '#fbbf24' })
      fetchEvents(userId)
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error.message)
    }
  }

  const renderEventContent = (eventInfo) => {
    return (
      <div className="p-1 overflow-hidden h-full">
        <div className="font-black text-[10px] uppercase truncate">{eventInfo.event.title}</div>
        {eventInfo.event.extendedProps.description && (
          <div className="text-[8px] font-bold opacity-80 leading-tight line-clamp-2">
            {eventInfo.event.extendedProps.description}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center border-l-8 border-gray-800 pl-6 py-2">
        <div>
          <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight" style={{ fontFamily: 'monospace' }}>
            Emploi du Temps
          </h2>
          <p className="mt-1 text-lg font-bold text-gray-600 uppercase tracking-widest">
            Planifiez vos sessions de quêtes.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-yellow-400 text-gray-900 font-black w-12 h-12 rounded-lg border-4 border-gray-800 shadow-[4px_4px_0px_rgba(31,41,55,1)] hover:translate-y-1 hover:shadow-none transition-all text-2xl"
        >
          +
        </button>
      </header>

      <div className="bg-white border-8 border-gray-800 rounded-xl p-4 shadow-[8px_8px_0px_rgba(31,41,55,1)] overflow-hidden">
        {loading ? (
          <div className="h-[600px] flex items-center justify-center font-black uppercase animate-pulse">
            Synchronisation du chronogramme...
          </div>
        ) : (
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            locale="fr"
            allDaySlot={false}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            events={events}
            eventContent={renderEventContent}
            height="700px"
            nowIndicator={true}
          />
        )}
      </div>

      {/* Modal Ajout */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-8 border-gray-800 rounded-2xl w-full max-w-md p-8 shadow-[12px_12px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-black text-gray-900 uppercase mb-6" style={{ fontFamily: 'monospace' }}>
              Nouvelle Activité
            </h3>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1">Titre</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border-4 border-gray-800 p-2 rounded font-bold focus:outline-none"
                  placeholder="Ex: Révision Math"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border-4 border-gray-800 p-2 rounded font-bold focus:outline-none h-20"
                  placeholder="Détails de la quête..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                    className="w-full border-4 border-gray-800 p-2 rounded font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Début</label>
                  <input 
                    type="time" 
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="w-full border-4 border-gray-800 p-2 rounded font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Fin</label>
                  <input 
                    type="time" 
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="w-full border-4 border-gray-800 p-2 rounded font-bold focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border-4 border-gray-800 p-3 font-black uppercase hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-yellow-400 border-4 border-gray-800 p-3 font-black uppercase shadow-[4px_4px_0px_rgba(31,41,55,1)] active:shadow-none active:translate-y-1 transition-all"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SchedulePage
