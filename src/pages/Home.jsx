import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Calendar, Filter, Plus, ChevronRight, Bookmark } from 'lucide-react'
import EventCard from '../components/EventCard'
import { supabase } from '../services/supabase'
import { useThemeStore } from '../store/store'

const Home = () => {
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { darkMode } = useThemeStore()

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
      setEvents([]) // No fallback to mock data
    } finally {
      setIsLoading(false)
    }
  }

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center rounded-[40px] overflow-hidden group">
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1523050335102-c32509782f05?auto=format&fit=crop&q=80')` }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-700 ${
          darkMode ? 'from-black via-black/40 to-transparent' : 'from-black/60 via-black/20 to-transparent'
        }`} />
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border mb-6 inline-block backdrop-blur-md ${
              darkMode ? 'bg-primary/10 text-primary border-primary/20 shadow-neon' : 'bg-white/10 text-white border-white/20'
            }`}>
              Spring Semester 2026
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1]">
              Elevate Your <span className="text-primary italic neon-glow">Campus</span> Life
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed font-outfit">
              The centralized hub for events, registrations, and announcements. Never miss a single beat of your university experience.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => document.getElementById('discovery-section').scrollIntoView({ behavior: 'smooth' })}
                className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${
                  darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-white text-black'
                }`}
              >
                Explore Events <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating Decorative Elements */}
        {darkMode && (
          <div className="absolute bottom-10 left-10 flex gap-4 opacity-50">
            {[1,2,3].map(i => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: [0.3, 0.6, 0.3] }}
                 transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
                 className="w-2 h-2 rounded-full bg-primary shadow-neon" 
               />
            ))}
          </div>
        )}
      </section>

      {/* Featured Header & Filter */}
      <section id="discovery-section" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className={`text-4xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Events <span className="text-primary opacity-50">/</span> Discovery
            </h2>
            <p className={`text-sm tracking-wide uppercase font-bold ${darkMode ? 'text-primary' : 'text-gray-500'}`}>
              Curated for your department
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                darkMode ? 'text-gray-600 group-focus-within:text-primary' : 'text-gray-400 group-focus-within:text-black'
              }`} size={18} />
              <input 
                type="text" 
                placeholder="Find an event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all placeholder:font-light font-medium focus:ring-2 ${
                  darkMode 
                  ? 'bg-zinc-900 border border-white/10 focus:border-primary/50 focus:ring-primary/20 text-white' 
                  : 'bg-white border border-gray-200 focus:border-black/50 focus:ring-gray-100 shadow-sm'
                }`}
              />
            </div>
            <button className={`p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 border ${
              darkMode ? 'bg-zinc-900 border-white/10 text-white hover:bg-white/5' : 'bg-white border-gray-200 text-black shadow-sm'
            }`}>
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Search Progress Blur */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
                <div key={i} className={`h-96 rounded-[40px] animate-pulse ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'}`} />
              ))}
            </div>
          ) : (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center opacity-50 uppercase tracking-[0.2em] font-bold">
                  No events matches your search
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Campus Stats / CTA Banner */}
      <section className={`p-12 md:p-20 rounded-[40px] border shadow-2xl relative overflow-hidden text-center transition-all ${
        darkMode ? 'bg-white/5 border-white/10 glass-dark' : 'bg-black text-white'
      }`}>
        <div className="relative z-10 space-y-8">
          <h3 className="text-3xl md:text-5xl font-black max-w-2xl mx-auto leading-tight">
            Ready to organize your own <span className="text-primary italic">stellar</span> event?
          </h3>
          <p className="text-gray-400 max-w-xl mx-auto">
            Get admin approval, upload your poster, and reach 5000+ students instantly with real-time notifications.
          </p>
          <div className="flex flex-wrap justify-center gap-12 pt-4">
            <div className="text-center group">
              <div className="text-4xl font-black mb-2 text-primary neon-glow group-hover:scale-110 transition-transform">1.2k</div>
              <div className="text-xs uppercase tracking-widest opacity-50 font-bold">Monthly Registrations</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-black mb-2 text-primary neon-glow group-hover:scale-110 transition-transform">45+</div>
              <div className="text-xs uppercase tracking-widest opacity-50 font-bold">Active Clubs</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-black mb-2 text-primary neon-glow group-hover:scale-110 transition-transform">100%</div>
              <div className="text-xs uppercase tracking-widest opacity-50 font-bold">Engagement Rate</div>
            </div>
          </div>
        </div>
        
        {/* Glow behind stats */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-primary/2 blur-[120px] pointer-events-none" />
      </section>
    </div>
  )
}

export default Home
