import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Calendar, MessageSquare, ClipboardList, 
  ArrowUpRight, TrendingUp, Sparkles, Plus,
  LayoutDashboard, UserPlus, HelpCircle, FileText
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useThemeStore } from '../store/store'
import { supabase } from '../services/supabase'

const AdminDashboard = () => {
  const { darkMode } = useThemeStore()

  const [counts, setCounts] = useState({
    users: 0,
    events: 0,
    faqs: 0,
    regs: 0
  })

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [
          { count: usersCount },
          { count: eventsCount },
          { data: faqsData },
          { count: regsCount }
        ] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase.from('faq').select('answer'),
          supabase.from('registrations').select('*', { count: 'exact', head: true })
        ])

        const pendingFaqsCount = faqsData?.filter(f => !f.answer).length || 0

        setCounts({
          users: usersCount || 0,
          events: eventsCount || 0,
          faqs: pendingFaqsCount || 0,
          regs: regsCount || 0
        })
      } catch (error) {
        console.error('Error fetching dashboard counts:', error)
      }
    }

    fetchCounts()

    const usersChannel = supabase.channel('users-admin').on('postgres_changes', { event: '*', table: 'users' }, () => fetchCounts()).subscribe()
    const eventsChannel = supabase.channel('events-admin').on('postgres_changes', { event: '*', table: 'events' }, () => fetchCounts()).subscribe()
    const faqChannel = supabase.channel('faq-admin-dash').on('postgres_changes', { event: '*', table: 'faq' }, () => fetchCounts()).subscribe()
    const regsChannel = supabase.channel('regs-admin').on('postgres_changes', { event: '*', table: 'registrations' }, () => fetchCounts()).subscribe()

    return () => {
      supabase.removeChannel(usersChannel)
      supabase.removeChannel(eventsChannel)
      supabase.removeChannel(faqChannel)
      supabase.removeChannel(regsChannel)
    }
  }, [])

  const stats = [
    { name: 'Active Users', value: counts.users.toLocaleString(), change: '+12%', icon: Users, color: 'text-blue-500' },
    { name: 'Live Events', value: counts.events.toLocaleString(), change: '+2', icon: Calendar, color: 'text-primary' },
    { name: 'Pending FAQs', value: counts.faqs.toLocaleString(), change: '-5', icon: MessageSquare, color: 'text-orange-500' },
    { name: 'Total Regs', value: counts.regs.toLocaleString(), change: '+15%', icon: ClipboardList, color: 'text-purple-500' },
  ]

  const quickActions = [
    { name: 'Post the event', icon: Plus, path: '/admin/events', color: 'bg-primary' },
    { name: 'Delete the event', icon: Sparkles, path: '/admin/events', color: 'bg-red-500' },
    { name: 'Number of users registered for the event', icon: ClipboardList, path: '/admin/registrations', color: 'bg-purple-500' },
    { name: 'Add the members', icon: UserPlus, path: '/admin/users', color: 'bg-blue-500' },
    { name: 'Remove the members', icon: Users, path: '/admin/users', color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-primary">
            <LayoutDashboard size={14} />
            Command Center
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
            Overseer <span className="text-primary italic neon-glow">OS</span>
          </h1>
          <p className={`text-sm tracking-wider uppercase font-bold opacity-50 ${darkMode ? 'text-white' : 'text-black'}`}>Campus Infrastructure Monitoring</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className={`px-6 py-3 rounded-2xl border text-sm font-bold flex items-center gap-3 ${
             darkMode ? 'bg-zinc-900 border-white/5 text-gray-400' : 'bg-white border-gray-200 text-gray-600 shadow-sm'
           }`}>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Status: Nominal
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-8 rounded-[40px] border relative overflow-hidden transition-all hover:scale-[1.02] ${
              darkMode ? 'bg-zinc-900/40 border-white/10 hover:border-primary/30 glass-dark' : 'bg-white border-gray-100 shadow-xl'
            }`}
          >
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-3xl font-black tracking-tighter italic">{stat.value}</p>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-40 mt-1">{stat.name}</p>
            </div>
            {/* Background Glow */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 blur-3xl rounded-full" />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Operation Shortcuts</h3>
              <Sparkles size={20} className="text-primary animate-pulse" />
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Link 
                  key={action.name}
                  to={action.path}
                  className={`p-1 group rounded-[32px] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    darkMode ? 'bg-white/5' : 'bg-gray-100'
                  }`}
                >
                   <div className={`p-5 h-full rounded-[32px] border transition-all flex flex-col items-center justify-center text-center gap-3 ${
                     darkMode ? 'bg-zinc-900 border-white/5 group-hover:border-primary group-hover:shadow-neon' : 'bg-white border-gray-200 hover:border-black shadow-sm'
                   }`}>
                      <div className={`p-4 rounded-3xl ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                         <action.icon size={24} />
                      </div>
                      <h4 className="font-bold text-base tracking-tight uppercase italic line-clamp-2">{action.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-50">System Link <ArrowUpRight size={10} className="inline ml-1" /></p>
                   </div>
                </Link>
              ))}
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <h3 className="text-2xl font-black uppercase tracking-tighter italic px-2">Audit Logs</h3>
           <div className={`p-6 rounded-[32px] border h-full max-h-[400px] overflow-y-auto custom-scrollbar ${
             darkMode ? 'bg-zinc-900/40 border-white/10 glass-dark' : 'bg-white border-gray-100 shadow-xl'
           }`}>
             <div className="space-y-8">
                {[
                  { time: '2m ago', user: 'Admin', act: 'Posted event: Robotix' },
                  { time: '15m ago', user: 'System', act: 'Imported 542 students' },
                  { time: '1h ago', user: 'Admin', act: 'Answered FAQ #214' },
                  { time: '2h ago', user: 'Mod', act: 'Updated profile: 22CS01' },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 group">
                     <div className="flex flex-col items-center gap-1 mt-1">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-neon" />
                        <div className="w-px h-10 bg-white/10" />
                     </div>
                     <div className="space-y-1">
                        <p className={`text-xs font-bold leading-tight ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{log.act}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">By {log.user} • {log.time}</p>
                     </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
