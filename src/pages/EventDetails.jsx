import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Calendar, MapPin, Clock, ArrowLeft, Bookmark, 
  Share2, ShieldCheck, Mail, CalendarPlus, Loader2 
} from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuthStore, useThemeStore } from '../store/store'
import toast from 'react-hot-toast'

const EventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuthStore()
  const { darkMode } = useThemeStore()

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setEvent(data)
    } catch (err) {
      console.error('Fetch error:', err)
      // Mock data for demo
      setEvent({
        id: '1',
        title: 'CyberTech 2026 Hackathon',
        description: 'Join the ultimate 48-hour coding marathon where innovation meets impact. Work in teams of 4 to solve real-world campus problems using cutting-edge technologies. \n\nWhat to expect:\n- Mentorship sessions\n- Free swags and stickers\n- Interaction with industry experts\n- Prizes worth 1 Lakh INR',
        date: '2026-05-15',
        poster_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80',
        venue: 'Auditorium Main Block',
        time: '09:00 AM',
        organized_by: 'Computer Science Department',
        contact_email: 'cs.events@university.edu'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard')
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  )

  if (!event) return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold">Event not found</h1>
      <Link to="/" className="text-primary mt-4 hover:underline">Return Home</Link>
    </div>
  )

  return (
    <div className="space-y-12">
      {/* Header with Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <button 
          onClick={() => navigate(-1)}
          className={`group flex items-center gap-2 px-6 py-3 rounded-2xl transition-all border ${
            darkMode ? 'bg-zinc-900 border-white/10 text-white hover:bg-white/5' : 'bg-white border-gray-200 text-black shadow-sm'
          }`}
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <div className="flex gap-3">
          <button className={`p-4 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${
            darkMode ? 'bg-zinc-900 border-white/10 text-white hover:bg-white/5' : 'bg-white border-gray-200 text-black shadow-sm'
          }`}>
            <Bookmark size={20} />
          </button>
          <button 
            onClick={handleShare}
            className={`p-4 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${
              darkMode ? 'bg-zinc-900 border-white/10 text-white hover:bg-white/5' : 'bg-white border-gray-200 text-black shadow-sm'
            }`}
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Poster Wrapper */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative group rounded-[40px] overflow-hidden border border-white/10 shadow-3xl"
        >
          <img 
            src={event.poster_url} 
            alt={event.title} 
            className="w-full aspect-[4/5] object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          {darkMode && (
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          )}
          
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end backdrop-blur-xl p-6 rounded-3xl border border-white/10 glass-dark">
             <div>
                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-1">Status</p>
                <div className="flex items-center gap-2 font-black text-2xl text-white">
                   <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-neon" />
                   OPEN NOW
                </div>
             </div>
             <button className="p-4 rounded-2xl bg-primary text-black hover:shadow-neon transition-all hover:scale-110">
                <CalendarPlus size={24} />
             </button>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-10"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black leading-tight uppercase tracking-tighter">
              {event.title}
            </h1>
            <div className={`p-4 rounded-2xl inline-flex items-center gap-3 border ${
               darkMode ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-black/5 border-black/10 text-black'
            }`}>
               <ShieldCheck size={20} />
               <span className="text-sm font-bold tracking-widest uppercase">Verified Campus Event</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className={`p-6 rounded-3xl border transition-all ${
               darkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center gap-3 text-primary mb-3">
                 <Calendar className="opacity-60" size={20} />
                 <span className="text-xs font-bold uppercase tracking-widest">Date</span>
              </div>
              <p className="font-bold text-lg">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div className={`p-6 rounded-3xl border transition-all ${
               darkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center gap-3 text-primary mb-3">
                 <Clock className="opacity-60" size={20} />
                 <span className="text-xs font-bold uppercase tracking-widest">Timing</span>
              </div>
              <p className="font-bold text-lg">{event.time || '05:30 PM'}</p>
            </div>

            <div className={`p-6 rounded-3xl border transition-all sm:col-span-2 ${
               darkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center gap-3 text-primary mb-3">
                 <MapPin className="opacity-60" size={20} />
                 <span className="text-xs font-bold uppercase tracking-widest">Venue</span>
              </div>
              <p className="font-bold text-lg">{event.venue || 'Main Auditorium, North Wing'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold uppercase tracking-widest opacity-50">About Event</h3>
            <p className={`text-lg leading-relaxed whitespace-pre-line font-outfit ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {event.description}
            </p>
          </div>

          <div className={`p-10 rounded-[40px] border relative overflow-hidden transition-all ${
             darkMode ? 'bg-primary border-primary hover:shadow-neon group' : 'bg-black border-black shadow-2xl group'
          }`}>
             <Link 
               to={`/register/${id}`}
               className="relative z-10 flex flex-col items-center gap-4 group"
             >
                <div className="space-y-1 text-center">
                   <p className={`text-xs font-black uppercase tracking-[0.3em] ${darkMode ? 'text-black/60' : 'text-white/60'}`}>Limited Slots Available</p>
                   <h4 className={`text-3xl font-black italic uppercase italic ${darkMode ? 'text-black' : 'text-white'}`}>Register For Success</h4>
                </div>
                <div className={`px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-transform group-hover:scale-110 ${
                   darkMode ? 'bg-black text-white' : 'bg-white text-black'
                }`}>
                   Claim My Spot
                </div>
             </Link>
             
             {/* Animations */}
             <div className="absolute top-0 right-[-10%] w-[40%] h-[200%] bg-white/10 skew-x-[-45deg] transition-all duration-700 group-hover:right-[110%] pointer-events-none" />
          </div>

          <div className="flex items-center gap-4 text-center justify-center py-6">
             <div className="flex flex-col items-center group cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-all group-hover:rotate-12 ${
                   darkMode ? 'bg-zinc-900 border border-white/5' : 'bg-gray-100 border border-gray-200'
                }`}>
                   <Mail size={18} className="text-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Contact</span>
             </div>
             <div className="w-12 h-px bg-white/10" />
             <div className="text-sm font-bold tracking-tight">
                Organized by <span className="text-primary">{event.organized_by || 'Student Activity Center'}</span>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default EventDetails
