import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Edit, Trash2, Calendar, MapPin, 
  Upload, X, Image as ImageIcon, Loader2, Search, ArrowRight 
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useThemeStore } from '../../store/store'
import toast from 'react-hot-toast'

const ManageEvents = () => {
  const [events, setEvents] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { darkMode } = useThemeStore()

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    date: '',
    venue: '',
    organized_by: '',
    poster_url: '',
  })
  const [posterFile, setPosterFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      // Mock data
      setEvents([
        { id: '1', title: 'CyberTech 2026', date: '2026-05-15', poster_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (event) => {
    setFormData(event)
    setPreviewUrl(event.poster_url)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return
    
    try {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw error
      toast.success('Event deleted successfully')
      fetchEvents()
    } catch (err) {
      toast.error(err.message || 'Failed to delete event')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPosterFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let finalPosterUrl = formData.poster_url

      // Upload Poster if changed
      if (posterFile) {
        const fileExt = posterFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('posters')
          .upload(filePath, posterFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('posters')
          .getPublicUrl(filePath)
        
        finalPosterUrl = publicUrl
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        venue: formData.venue,
        organized_by: formData.organized_by,
        poster_url: finalPosterUrl,
      }

      if (formData.id) {
        // Update
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', formData.id)
        if (error) throw error
        toast.success('Event updated!')
      } else {
        // Create
        const { error } = await supabase
          .from('events')
          .insert([eventData])
        if (error) throw error
        toast.success('Event created!')
      }

      setIsModalOpen(false)
      setFormData({
        id: null, title: '', description: '', date: '', venue: '', organized_by: '', poster_url: ''
      })
      setPosterFile(null)
      setPreviewUrl('')
      fetchEvents()
    } catch (err) {
      toast.error(err.message || 'Action failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            Event <span className="text-primary italic neon-glow">Forge</span>
          </h1>
          <p className="text-sm font-bold opacity-40 uppercase tracking-widest pl-1">Creation & Governance Portal</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              darkMode ? 'text-gray-600 group-focus-within:text-primary' : 'text-gray-400 group-focus-within:text-black'
            }`} size={18} />
            <input 
              type="text" 
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`h-14 pl-12 pr-4 rounded-2xl outline-none transition-all placeholder:font-light font-medium focus:ring-4 ${
                darkMode ? 'bg-zinc-900 border border-white/10 text-white focus:ring-primary/10' : 'bg-white border-gray-200 shadow-sm'
              }`}
            />
          </div>
          <button 
            onClick={() => {
              setFormData({ id: null, title: '', description: '', date: '', venue: '', organized_by: '', poster_url: '' })
              setPreviewUrl('')
              setIsModalOpen(true)
            }}
            className={`h-14 px-8 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${
              darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-black text-white hover:shadow-lg shadow-blue-500/20'
            }`}
          >
            <Plus size={20} /> Create New Asset
          </button>
        </div>
      </div>

      {/* Events List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          [1,2,3].map(i => (
             <div key={i} className={`h-80 rounded-[40px] animate-pulse ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'}`} />
          ))
        ) : (
          filteredEvents.map((event) => (
            <motion.div
              layout
              key={event.id}
              className={`p-1 group rounded-[40px] overflow-hidden transition-all hover:scale-[1.02] border border-white/5 ${
                darkMode ? 'bg-white/5' : 'bg-white shadow-xl shadow-gray-200/50'
              }`}
            >
              <div className={`p-8 h-full rounded-[40px] border relative transition-all overflow-hidden ${
                darkMode ? 'bg-zinc-900 border-white/5 group-hover:border-primary group-hover:shadow-neon' : 'bg-white border-gray-100'
              }`}>
                {/* Visual Backdrop in Card */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-[60px] pointer-events-none rounded-full bg-primary" />
                
                <div className="flex gap-6 items-start mb-8 relative z-10">
                   <div className="w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 border border-white/5">
                      <img src={event.poster_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none line-clamp-2">{event.title}</h3>
                      <p className="text-[10px] uppercase font-black tracking-widest text-primary opacity-60">ID: CC-{event.id.slice(0, 8).toUpperCase()}</p>
                   </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5 relative z-10">
                   <div className="flex items-center gap-3 text-xs opacity-50 font-bold tracking-wider">
                      <Calendar size={14} className="text-primary" />
                      {new Date(event.date).toLocaleDateString()}
                   </div>
                   <div className="flex items-center gap-3 text-xs opacity-50 font-bold tracking-wider">
                      <MapPin size={14} className="text-primary" />
                      {event.venue || 'TBA'}
                   </div>
                </div>

                <div className="flex gap-3 mt-8 relative z-10">
                   <button 
                     onClick={() => handleEdit(event)}
                     className={`flex-1 h-12 rounded-2xl border transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest ${
                       darkMode ? 'bg-zinc-800 border-white/5 text-white hover:bg-white/5' : 'bg-gray-50 border-gray-100 text-black hover:bg-gray-100'
                     }`}
                   >
                     <Edit size={16} /> Edit
                   </button>
                   <button 
                     onClick={() => handleDelete(event.id)}
                     className={`w-12 h-12 rounded-2xl border transition-all flex items-center justify-center text-red-500 ${
                       darkMode ? 'bg-zinc-800 border-white/5 hover:bg-red-500/10' : 'bg-red-50 border-red-100 hover:bg-red-100'
                     }`}
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modern Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[48px] border relative z-10 p-1 custom-scrollbar ${
                darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'
              }`}
            >
              <div className={`p-10 md:p-14 h-full rounded-[48px] overflow-hidden relative ${
                darkMode ? 'bg-zinc-950' : 'bg-white'
              }`}>
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none rounded-full group-hover:opacity-60 transition-opacity" />
                
                <div className="flex justify-between items-center mb-12 relative z-10">
                  <div className="space-y-1">
                    <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter italic">
                       {formData.id ? 'Edit' : 'Forge'} <span className="text-primary">Asset</span>
                    </h2>
                    <p className="text-xs font-bold font-black opacity-30 uppercase tracking-[0.3em] italic">System Authorization Required</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className={`p-4 rounded-full border transition-all hover:scale-110 active:scale-90 ${
                      darkMode ? 'bg-zinc-900 border-white/5 text-white hover:bg-red-500/20 hover:text-red-500' : 'bg-gray-100 text-black border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                   {/* Left Col: Upload */}
                   <div className="space-y-6">
                      <label className="text-xs font-black uppercase tracking-[0.3em] opacity-40 pl-2">Poster Visuals</label>
                      <div 
                        className={`aspect-[4/5] rounded-[40px] border-2 border-dashed relative overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-[1.01] ${
                          darkMode ? 'bg-black/50 border-white/10 hover:border-primary/50' : 'bg-gray-50 border-gray-200 hover:border-black/20'
                        }`}
                        onClick={() => document.getElementById('poster-upload').click()}
                      >
                         {previewUrl ? (
                           <img src={previewUrl} className="w-full h-full object-cover" />
                         ) : (
                           <div className="text-center space-y-4">
                              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto ${
                                darkMode ? 'bg-zinc-900 text-primary border border-primary/20 shadow-neon' : 'bg-white shadow-lg text-black border border-gray-100'
                              }`}>
                                <Upload size={24} />
                              </div>
                              <p className="text-sm font-bold uppercase tracking-widest opacity-60">Upload Propaganda Poster</p>
                              <p className="text-[10px] text-gray-500 font-bold uppercase">PNG, JPG up to 10MB</p>
                           </div>
                         )}
                         <input 
                           id="poster-upload" type="file" hidden accept="image/*"
                           onChange={handleFileChange}
                         />
                      </div>
                   </div>

                   {/* Right Col: Details */}
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 pl-2">Asset Identity</label>
                        <input 
                          type="text" required placeholder="Event Name"
                          value={formData.title}
                          onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                          className={`w-full h-14 px-6 rounded-2xl outline-none transition-all font-black uppercase tracking-tight focus:ring-4 ${
                            darkMode ? 'bg-black/40 border border-white/10 focus:border-primary/50 focus:ring-primary/10 text-white' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 pl-2">Deployment Date</label>
                          <input 
                            type="date" required
                            value={formData.date}
                            onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                            className={`w-full h-14 px-6 rounded-2xl outline-none transition-all font-bold focus:ring-4 ${
                              darkMode ? 'bg-black/40 border border-white/10 focus:border-primary/50 focus:ring-primary/10 text-white' : 'bg-gray-50 border-gray-200'
                            }`}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 pl-2">Operational Hub</label>
                          <input 
                            type="text" required placeholder="Venue"
                            value={formData.venue}
                            onChange={(e) => setFormData(p => ({ ...p, venue: e.target.value }))}
                            className={`w-full h-14 px-6 rounded-2xl outline-none transition-all font-bold focus:ring-4 ${
                              darkMode ? 'bg-black/40 border border-white/10 focus:border-primary/50 focus:ring-primary/10 text-white' : 'bg-gray-50 border-gray-200'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 pl-2">Issuing Body</label>
                        <input 
                          type="text" required placeholder="Organization Name"
                          value={formData.organized_by}
                          onChange={(e) => setFormData(p => ({ ...p, organized_by: e.target.value }))}
                          className={`w-full h-14 px-6 rounded-2xl outline-none transition-all font-bold focus:ring-4 ${
                            darkMode ? 'bg-black/40 border border-white/10 focus:border-primary/50 focus:ring-primary/10 text-white' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 pl-2">Intelligence Brief</label>
                        <textarea 
                          required placeholder="Detailed briefing on the event assets and objectives..."
                          rows="6"
                          value={formData.description}
                          onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                          className={`w-full p-6 rounded-3xl outline-none transition-all font-medium font-outfit focus:ring-4 resize-none leading-relaxed ${
                            darkMode ? 'bg-black/40 border border-white/10 focus:border-primary/50 focus:ring-primary/10 text-white' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                      </div>

                      <button 
                         type="submit"
                         disabled={isSubmitting}
                         className={`w-full h-16 rounded-3xl font-black uppercase tracking-widest text-lg transition-all group overflow-hidden relative ${
                             darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-black text-white hover:shadow-2xl'
                         } disabled:opacity-50`}
                      >
                         {isSubmitting ? (
                           <div className="flex items-center justify-center gap-3">
                              <Loader2 className="animate-spin" size={24} />
                              <span>Syncing Terminal...</span>
                           </div>
                         ) : (
                            <div className="flex items-center justify-center gap-3">
                               <span>Execute Initialization</span>
                               <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                         )}

                         {/* Glow Animation */}
                         <div className="absolute top-0 -left-1/4 w-1/4 h-full bg-white/20 skew-x-12 transition-all duration-500 group-hover:left-[125%]" />
                      </button>
                   </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ManageEvents
