import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Calendar, Bookmark, Settings, LogOut, 
  ChevronRight, KeyRound, Mail, GraduationCap, 
  Trash2, ShieldCheck, ExternalLink, Loader2
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore, useThemeStore } from '../store/store'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, role, logout } = useAuthStore()
  const { darkMode } = useThemeStore()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('registrations')
  const [registrations, setRegistrations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchRegistrations()
  }, [user])

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*, events(*)')
        .eq('user_id', user.id)
      
      if (error) throw error
      setRegistrations(data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      // Mock data
      setRegistrations([
        { id: '1', events: { title: 'CyberTech 2026', date: '2026-05-15', poster_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80' }, created_at: new Date().toISOString() },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const tabs = [
    { id: 'registrations', name: 'My Events', icon: Calendar },
    { id: 'bookmarks', name: 'Bookmarks', icon: Bookmark },
    { id: 'settings', name: 'Security', icon: Settings },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Profile Header */}
      <section className={`p-10 md:p-16 rounded-[48px] border relative overflow-hidden transition-all ${
        darkMode ? 'bg-white/5 border-white/10 glass-dark shadow-3xl' : 'bg-black text-white'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
           <div className="relative group">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[32px] flex items-center justify-center border-4 transition-transform group-hover:rotate-6 ${
                darkMode ? 'bg-zinc-800 border-primary text-primary shadow-neon shadow-lg' : 'bg-white border-white text-black'
              }`}>
                 <User size={64} strokeWidth={1} />
              </div>
              <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${
                darkMode ? 'bg-black border-primary shadow-neon shadow-sm' : 'bg-white border-black text-black shadow-lg'
              }`}>
                 <ShieldCheck size={20} className={darkMode ? 'text-primary' : 'text-black'} />
              </div>
           </div>

           <div className="text-center md:text-left space-y-4">
              <div className="space-y-1">
                 <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">
                    {user?.email?.split('@')[0].toUpperCase()}
                 </h1>
                 <p className={`text-sm uppercase tracking-[0.3em] font-black italic ${darkMode ? 'text-primary' : 'text-primary'}`}>
                    {role === 'admin' ? 'Campus Overseer' : 'University Scholar'}
                 </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                 <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold ${
                   darkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white/10 border-white/20 text-white'
                 }`}>
                    <GraduationCap size={14} className="text-primary" />
                    Computer Science Engineer
                 </div>
                 <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold ${
                   darkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white/10 border-white/20 text-white'
                 }`}>
                    <Mail size={14} className="text-primary" />
                    {user?.email}
                 </div>
              </div>
           </div>

           <button 
             onClick={handleLogout}
             className={`p-4 md:ml-auto rounded-3xl transition-all border group hover:scale-105 active:scale-95 ${
               darkMode ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-white/10 border-white/20 text-white hover:bg-red-500 hover:text-white hover:border-red-500'
             }`}
           >
              <LogOut size={24} className="group-hover:rotate-12 transition-transform" />
           </button>
        </div>

        {/* Glow behind header */}
        <div className="absolute top-1/2 left-[-10%] w-[40%] h-[40%] bg-primary/2 blur-[120px] pointer-events-none" />
      </section>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
         {/* Navigation */}
         <div className="lg:col-span-3 space-y-4">
           {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`w-full p-6 rounded-[32px] flex items-center justify-between border transition-all relative overflow-hidden group ${
                 activeTab === tab.id 
                   ? (darkMode ? 'bg-primary border-primary text-black font-black' : 'bg-black border-black text-white font-black')
                   : (darkMode ? 'bg-zinc-900/40 border-white/5 text-gray-400 hover:border-white/20' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200 shadow-sm')
               }`}
             >
                <div className="flex items-center gap-4 relative z-10">
                   <tab.icon size={20} className={activeTab === tab.id ? '' : 'text-primary'} />
                   <span className="uppercase text-xs tracking-widest">{tab.name}</span>
                </div>
                {activeTab === tab.id && <ChevronRight size={18} />}
             </button>
           ))}
         </div>

         {/* Dash Main */}
         <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
               {activeTab === 'registrations' && (
                 <motion.div
                   key="registrations"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-6"
                 >
                    <div className="space-y-1">
                       <h3 className="text-2xl font-black uppercase tracking-tighter">Event Trajectory</h3>
                       <p className={`text-xs uppercase tracking-widest font-bold ${darkMode ? 'text-primary' : 'text-gray-500'}`}>Track your campus activities</p>
                    </div>

                    {isLoading ? (
                       <div className="flex items-center justify-center py-20">
                          <Loader2 className="animate-spin text-primary" size={32} />
                       </div>
                    ) : (
                       registrations.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {registrations.map((reg) => (
                               <div 
                                 key={reg.id}
                                 className={`p-6 rounded-[32px] border overflow-hidden transition-all hover:scale-[1.02] group ${
                                   darkMode ? 'bg-zinc-900/40 border-white/10 glass-dark hover:border-primary/50' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'
                                 }`}
                               >
                                  <div className="flex gap-4 items-center">
                                     <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
                                        <img src={reg.events?.poster_url} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="space-y-1 flex-1">
                                        <h4 className="font-bold text-lg leading-tight line-clamp-1">{reg.events?.title}</h4>
                                        <p className="text-xs text-gray-500 font-medium">Joined {new Date(reg.created_at).toLocaleDateString()}</p>
                                     </div>
                                     <Link to={`/event/${reg.events?.id}`} className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black transition-all">
                                        <ExternalLink size={18} />
                                     </Link>
                                  </div>
                               </div>
                            ))}
                         </div>
                       ) : (
                         <div className={`p-20 text-center rounded-[40px] border border-dashed ${
                           darkMode ? 'bg-white/5 border-white/10 text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-400'
                         }`}>
                            <Calendar size={48} className="mx-auto mb-4 opacity-10" />
                            <p className="text-xs font-black uppercase tracking-widest">No active launches found</p>
                         </div>
                       )
                    )}
                 </motion.div>
               )}

               {activeTab === 'bookmarks' && (
                 <motion.div
                   key="bookmarks"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="space-y-8"
                 >
                    <div className="space-y-1">
                       <h3 className="text-2xl font-black uppercase tracking-tighter">Watchlist</h3>
                       <p className={`text-xs uppercase tracking-widest font-bold ${darkMode ? 'text-primary' : 'text-gray-500'}`}>Saved for later review</p>
                    </div>
                    <div className={`p-20 text-center rounded-[40px] border border-dashed ${
                           darkMode ? 'bg-white/5 border-white/10 text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-400'
                         }`}>
                        <Bookmark size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="text-xs font-black uppercase tracking-widest">Watchlist is empty</p>
                    </div>
                 </motion.div>
               )}

               {activeTab === 'settings' && (
                 <motion.div
                   key="settings"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="space-y-8"
                 >
                    <div className="space-y-1">
                       <h3 className="text-2xl font-black uppercase tracking-tighter">Security Matrix</h3>
                       <p className={`text-xs uppercase tracking-widest font-bold ${darkMode ? 'text-primary' : 'text-gray-500'}`}>Maintain your account integrity</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className={`p-8 rounded-[40px] border relative overflow-hidden transition-all ${
                         darkMode ? 'bg-zinc-900/40 border-white/5 hover:border-primary/30' : 'bg-white border-gray-100 shadow-xl'
                       }`}>
                          <div className="flex items-center gap-4 mb-6">
                             <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <KeyRound size={20} />
                             </div>
                             <div>
                                <h4 className="font-bold text-lg uppercase tracking-tight italic">Key Access</h4>
                                <p className="text-[10px] uppercase font-black opacity-40">Privacy protocol</p>
                             </div>
                          </div>
                          <p className="text-sm text-gray-400 mb-8 leading-relaxed">Modify your gateway credentials. Minimum 8 characters required.</p>
                          <Link to="/reset-password" onClick={(e) => { e.preventDefault(); toast.error('Check your authorized email for the reset link') }} className={`w-full py-4 rounded-2xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 border transition-all ${
                             darkMode ? 'bg-primary/20 border-primary/20 text-primary hover:bg-primary hover:text-black' : 'bg-black text-white hover:bg-gray-800'
                          }`}>
                             Initialize Update <ChevronRight size={14} />
                          </Link>
                       </div>

                       <div className={`p-8 rounded-[40px] border relative overflow-hidden transition-all ${
                         darkMode ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/30' : 'bg-red-50 border-red-100'
                       }`}>
                          <div className="flex items-center gap-4 mb-6">
                             <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                                <Trash2 size={20} />
                             </div>
                             <div>
                                <h4 className="font-bold text-lg uppercase tracking-tight italic text-red-500">Decommission</h4>
                                <p className="text-[10px] uppercase font-black opacity-40">System removal</p>
                             </div>
                          </div>
                          <p className="text-sm text-gray-400 mb-8 leading-relaxed">Permanently disable your campus portal and revoke all active registrations.</p>
                          <button className={`w-full py-4 rounded-2xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 border transition-all ${
                             darkMode ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-white text-red-500 hover:bg-red-500 hover:text-white border-red-200'
                          }`}>
                             Safe Terminate <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  )
}

export default Profile
