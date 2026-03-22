import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ClipboardList, Search, Filter, Download, 
  Trash2, Eye, User, Calendar, GraduationCap, 
  CheckCircle2, Loader2, X, ChevronRight, FileDown
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useThemeStore } from '../../store/store'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

const ViewRegistrations = () => {
  const [registrations, setRegistrations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReg, setSelectedReg] = useState(null)
  const { darkMode } = useThemeStore()

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*, events(*), users(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRegistrations(data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      // Mock data
      setRegistrations([
        { 
          id: '1', 
          events: { title: 'CyberTech 2026' }, 
          users: { name: 'John Doe', email: '22cs01@campus.connect' },
          form_data: { branch: 'CSE', semester: '4', phone: '9876543210' },
          created_at: new Date().toISOString() 
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const exportToExcel = () => {
    const dataToExport = registrations.map(reg => ({
      Event: reg.events?.title,
      StudentName: reg.users?.name,
      RollNumber: reg.users?.email?.split('@')[0],
      Phone: reg.form_data?.phone,
      Branch: reg.form_data?.branch,
      Semester: reg.form_data?.semester,
      RegistrationDate: new Date(reg.created_at).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Registrations")
    XLSX.writeFile(wb, "CampusConnect_Registrations.xlsx")
    toast.success('Successfully exported to Excel')
  }

  const filteredRegistrations = registrations.filter(reg => 
    reg.events?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.users?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.users?.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-primary">
            <ClipboardList size={14} />
            Data Extraction
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter italic">
            Flow <span className="text-primary italic neon-glow">Metrics</span>
          </h1>
          <p className="text-sm font-bold opacity-40 uppercase tracking-widest pl-1">Event Participation Registry</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              darkMode ? 'text-gray-600 group-focus-within:text-primary' : 'text-gray-400 group-focus-within:text-black'
            }`} size={18} />
            <input 
              type="text" 
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`h-14 pl-12 pr-4 rounded-2xl outline-none transition-all placeholder:font-light font-medium focus:ring-4 ${
                darkMode ? 'bg-zinc-900 border border-white/10 text-white focus:ring-primary/10' : 'bg-white border-gray-200'
              }`}
            />
          </div>

          <button 
            onClick={exportToExcel}
            className={`h-14 px-8 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center gap-3 transition-all hover:scale-105 active:scale-95 border ${
              darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-black text-black'
            }`}
          >
             <FileDown size={20} /> Export Dataset
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          [1,2,3].map(i => (
             <div key={i} className={`h-64 rounded-[40px] animate-pulse ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'}`} />
          ))
        ) : (
          filteredRegistrations.map((reg) => (
            <motion.div
              layout
              key={reg.id}
              className={`p-1 group rounded-[40px] overflow-hidden transition-all hover:scale-[1.02] border border-white/5 ${
                darkMode ? 'bg-white/5' : 'bg-white shadow-xl shadow-gray-200/50'
              }`}
            >
              <div className={`p-8 h-full rounded-[40px] border relative transition-all overflow-hidden ${
                darkMode ? 'bg-zinc-900 border-white/5 group-hover:border-primary group-hover:shadow-neon' : 'bg-white border-gray-100'
              }`}>
                {/* Visual Backdrop in Card */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-[60px] pointer-events-none rounded-full bg-primary" />
                
                <div className="space-y-6 relative z-10">
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black tracking-widest text-primary opacity-60">Deployment Asset</p>
                      <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none line-clamp-1">{reg.events?.title}</h3>
                   </div>

                   <div className="flex gap-4 items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                        darkMode ? 'bg-black border-white/5 text-primary' : 'bg-gray-50 border-gray-200 text-black shadow-sm'
                      }`}>
                         <User size={18} />
                      </div>
                      <div className="space-y-1">
                         <p className="text-sm font-bold tracking-tight italic uppercase">{reg.users?.name}</p>
                         <p className="text-[10px] uppercase font-black opacity-40 italic">{reg.users?.email}</p>
                      </div>
                   </div>

                   <div className="flex flex-wrap gap-2">
                       <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
                         darkMode ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'
                       }`}>
                          {reg.form_data?.branch}
                       </div>
                       <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
                         darkMode ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'
                       }`}>
                          S{reg.form_data?.semester}
                       </div>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{new Date(reg.created_at).toLocaleDateString()}</p>
                      <button 
                        onClick={() => setSelectedReg(reg)}
                        className={`p-3 rounded-2xl transition-all border group-hover:bg-primary group-hover:text-black group-hover:border-primary group-hover:shadow-neon ${
                          darkMode ? 'bg-zinc-800 border-white/5 text-white/40' : 'bg-gray-50 border-gray-100 text-black/40'
                        }`}
                      >
                         <Eye size={18} />
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Registration Detail Modal */}
      <AnimatePresence>
        {selectedReg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelectedReg(null)} className="absolute inset-0 bg-black/80 backdrop-blur-3xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-2xl rounded-[48px] border relative z-10 p-1 custom-scrollbar overflow-hidden ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
                <div className={`p-10 md:p-14 rounded-[48px] overflow-hidden relative ${darkMode ? 'bg-zinc-950' : 'bg-white'}`}>
                   <div className="flex justify-between items-center mb-10 relative z-10">
                      <div className="space-y-1">
                        <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter italic">Subject <span className="text-primary italic">Intelligence</span></h2>
                        <p className="text-[10px] uppercase font-black opacity-30 tracking-[0.3em] font-black italic">Participant Verification Record</p>
                      </div>
                      <button onClick={() => setSelectedReg(null)} className={`p-4 rounded-full border transition-all hover:scale-110 active:scale-90 ${darkMode ? 'bg-zinc-900 border-white/5 text-white' : 'bg-gray-100 text-black'}`}>
                        <X size={24} />
                      </button>
                   </div>

                   <div className="space-y-10 relative z-10">
                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Branch Alignment</label>
                            <p className="text-2xl font-black italic uppercase italic">{selectedReg.form_data?.branch}</p>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Operational Contact</label>
                            <p className="text-2xl font-black italic uppercase italic tracking-tighter italic">{selectedReg.form_data?.phone}</p>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Subject Objectives / Expectations</label>
                         <div className={`p-8 rounded-[32px] border leading-relaxed font-outfit italic text-lg ${darkMode ? 'bg-white/[0.02] border-white/5 text-gray-400' : 'bg-gray-50 border-gray-100'}`}>
                            "{selectedReg.form_data?.expectations || 'No specific objectives provided by the node.'}"
                         </div>
                      </div>

                      <div className="flex items-center gap-4 pt-4 border-t border-white/5 justify-center">
                         <div className="flex flex-col items-center">
                            <div className="text-xl font-black italic uppercase italic tracking-tighter">SUCCESS</div>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Status</div>
                         </div>
                         <div className="w-px h-10 bg-white/10" />
                         <div className="flex flex-col items-center">
                            <div className="text-xl font-black italic uppercase italic tracking-tighter">S{selectedReg.form_data?.semester}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Cycle</div>
                         </div>
                      </div>
                   </div>
                   
                   {/* Abstract Backdrop Elements */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ViewRegistrations
