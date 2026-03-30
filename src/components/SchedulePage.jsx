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
  const [isRecurring, setIsRecurring] = useState(false)
  const [visibleEvents, setVisibleEvents] = useState([])

  const colors = [
    '#fbbf24', // yellow-400
    '#60a5fa', // blue-400
    '#34d399', // emerald-400
    '#fb7185', // rose-400
    '#c084fc', // purple-400
    '#fb923c'  // orange-400
  ]

  const getColorForTitle = (title) => {
    if (!title) return colors[0]
    let hash = 0
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

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
        backgroundColor: getColorForTitle(event.title),
        borderColor: '#1f2937',
        extendedProps: {
          description: event.description,
          is_completed: event.is_completed || false
        }
      }))

      setEvents(formattedEvents)
    } catch (error) {
      console.error('Erreur lors de la récupération du planning:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleEventCompletion = async (eventId, currentStatus) => {
    try {
      const newStatus = !currentStatus
      const { error } = await supabase
        .from('timetable')
        .update({ is_completed: newStatus })
        .eq('id', eventId)

      if (error) throw error

      // Si l'événement est complété, on peut ajouter de l'XP
      if (newStatus) {
        window.dispatchEvent(new CustomEvent('profileUpdated'))
      }

      // Mise à jour locale immédiate
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, extendedProps: { ...event.extendedProps, is_completed: newStatus } }
          : event
      ))
      
      // Mise à jour des événements visibles pour le compteur
      setVisibleEvents(visibleEvents.map(event => 
        event.id === eventId 
          ? { ...event, extendedProps: { ...event.extendedProps, is_completed: newStatus } }
          : event
      ))
    } catch (error) {
      console.error('Erreur lors du toggle completion:', error.message)
    }
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    if (!userId) return

    try {
      let eventsToInsert = []
      
      if (isRecurring) {
        // Mode récurrent : 16 occurrences (S0 à S15)
        for (let i = 0; i < 16; i++) {
          const baseDate = new Date(formData.event_date)
          const recurringDate = new Date(baseDate)
          recurringDate.setDate(baseDate.getDate() + (i * 7))
          
          // Format YYYY-MM-DD
          const formattedDate = recurringDate.toISOString().split('T')[0]
          
          eventsToInsert.push({
            ...formData,
            event_date: formattedDate,
            user_id: userId
          })
        }
      } else {
        // Mode unique
        eventsToInsert.push({
          ...formData,
          user_id: userId
        })
      }

      const { error } = await supabase
        .from('timetable')
        .insert(eventsToInsert)

      if (error) throw error

      setShowModal(false)
      setIsRecurring(false)
      setFormData({ title: '', description: '', event_date: '', start_time: '', end_time: '', color: '#fbbf24' })
      fetchEvents(userId)
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error.message)
    }
  }

  const renderEventContent = (eventInfo) => {
    const isCompleted = eventInfo.event.extendedProps.is_completed
    return (
      <div className={`p-1 overflow-hidden h-full flex flex-col relative ${isCompleted ? 'opacity-40 grayscale' : ''}`}>
        <div className="flex justify-between items-start gap-1">
          <div className="font-black text-[10px] uppercase truncate flex-1">{eventInfo.event.title}</div>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              toggleEventCompletion(eventInfo.event.id, isCompleted)
            }}
            className={`w-4 h-4 border-2 border-gray-800 rounded flex items-center justify-center transition-colors shrink-0 ${isCompleted ? 'bg-emerald-400' : 'bg-white hover:bg-gray-100'}`}
          >
            {isCompleted && <span className="text-[8px] font-black">✓</span>}
          </button>
        </div>
        {eventInfo.event.extendedProps.description && (
          <div className="text-[8px] font-bold opacity-80 leading-tight line-clamp-2">
            {eventInfo.event.extendedProps.description}
          </div>
        )}
      </div>
    )
  }

  const totalEvents = visibleEvents.length
  const completedEvents = visibleEvents.filter(e => e.extendedProps.is_completed).length

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
        <div className="flex items-center gap-6">
          <div className="bevel-3d bg-white px-4 py-2 flex flex-col items-center">
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Quêtes Temporelles</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-gray-900">
                {completedEvents} / {totalEvents}
              </span>
              {totalEvents > 0 && completedEvents === totalEvents && (
                <span className="text-xl animate-bounce">👑</span>
              )}
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-yellow-400 text-gray-900 font-black w-12 h-12 rounded-lg border-4 border-gray-800 shadow-[4px_4px_0px_rgba(31,41,55,1)] hover:translate-y-1 hover:shadow-none transition-all text-2xl"
          >
            +
          </button>
        </div>
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
            datesSet={(dateInfo) => {
              const visible = events.filter(event => {
                const eventDate = new Date(event.start)
                return eventDate >= dateInfo.start && eventDate < dateInfo.end
              })
              setVisibleEvents(visible)
            }}
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

              {/* Checkbox Rétro pour la récurrence */}
              <div className="bevel-3d p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsRecurring(!isRecurring)}>
                <div className={`w-6 h-6 border-4 border-gray-800 flex items-center justify-center font-black transition-colors ${isRecurring ? 'bg-emerald-400' : 'bg-white'}`}>
                  {isRecurring && '✓'}
                </div>
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                  🔁 Répéter chaque semaine (sur 15 semaines)
                </span>
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
