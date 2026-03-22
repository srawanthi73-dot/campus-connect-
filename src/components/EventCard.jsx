import { motion } from 'framer-motion'
import { Calendar, MapPin, ArrowRight, Bookmark, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useThemeStore } from '../store/store'

const EventCard = ({ event }) => {
  const { darkMode } = useThemeStore()

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={`group relative rounded-3xl overflow-hidden border transition-all duration-300 ${
        darkMode ? 'bg-zinc-900/40 border-white/10 glass-dark' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'
      }`}
    >
      {/* Poster Image */}
      <div className="relative h-60 overflow-hidden">
        <img 
          src={event.poster_url || 'https://via.placeholder.com/600x400?text=Campus+Event'} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Date Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl font-bold text-xs backdrop-blur-md border ${
          darkMode ? 'bg-black/60 text-primary border-primary/30 shadow-neon' : 'bg-white/90 text-black border-gray-200'
        }`}>
          {new Date(event.date).toLocaleDateString()}
        </div>

        {/* Action Buttons (Show on hover) */}
        <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
          <button className={`p-2 rounded-xl backdrop-blur-md transition-all hover:scale-110 ${
            darkMode ? 'bg-white/10 text-white hover:bg-primary hover:text-black border border-white/20' : 'bg-white/90 text-gray-700 border border-gray-200'
          }`}>
            <Bookmark size={16} />
          </button>
          <button className={`p-2 rounded-xl backdrop-blur-md transition-all hover:scale-110 ${
            darkMode ? 'bg-white/10 text-white hover:bg-primary hover:text-black border border-white/20' : 'bg-white/90 text-gray-700 border border-gray-200'
          }`}>
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-primary opacity-80">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Upcoming Event
        </div>
        
        <h3 className={`text-xl font-bold mb-3 line-clamp-1 transition-colors group-hover:text-primary ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {event.title}
        </h3>
        
        <p className={`text-sm mb-6 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {event.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
          <div className={`flex items-center gap-1.5 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Calendar size={14} />
            <span>5:30 PM Onwards</span>
          </div>
          <Link 
            to={`/event/${event.id}`}
            className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-all ${
              darkMode ? 'text-primary hover:neon-glow' : 'text-black hover:translate-x-1'
            }`}
          >
            <span>Details</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Hover Background Glow */}
      {darkMode && (
         <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity -z-10" />
      )}
    </motion.div>
  )
}

export default EventCard
