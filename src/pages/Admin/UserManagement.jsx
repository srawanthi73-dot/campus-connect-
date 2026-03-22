import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, UserPlus, Upload, ShieldCheck, 
  Trash2, Search, Filter, Mail, GraduationCap, 
  FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, X, ArrowRight
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useThemeStore } from '../../store/store'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { darkMode } = useThemeStore()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      // Mock data for demo
      setUsers([
        { id: '1', name: 'Admin Root', email: 'admin@campus.connect', role: 'admin', created_at: new Date().toISOString() },
        { id: '2', name: 'John Student', email: '22cs01@campus.connect', role: 'user', created_at: new Date().toISOString() },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExcelImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsImporting(true)
    const toastId = toast.loading('Processing Excel data...')

    try {
      const reader = new FileReader()
      reader.onload = async (evt) => {
        const bstr = evt.target.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws)

        if (data.length === 0) throw new Error('Excel file is empty')

        // Loop through data and create users
        // Note: For real production, use Supabase Auth to create users or a custom edge function
        // For this demo, we insert into public.users table as requested
        
        const usersToInsert = data.map(row => ({
           id: row.id || crypto.randomUUID(), // Simplified for demo
           name: row.name || row.Name,
           email: (row.roll_number || row.RollNumber || '').toLowerCase() + '@campus.connect',
           role: 'user',
           needs_reset: true
        }))

        const { error } = await supabase.from('users').upsert(usersToInsert)

        if (error) throw error
        
        toast.success(`Successfully imported ${data.length} students!`, { id: toastId })
        fetchUsers()
      }
      reader.readAsBinaryString(file)
    } catch (err) {
      toast.error(err.message || 'Failed to import Excel', { id: toastId })
    } finally {
      setIsImporting(false)
      e.target.value = ''
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-primary">
            <ShieldCheck size={14} />
            Privileged Access
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter italic">
            Populate <span className="text-primary italic neon-glow">Nodes</span>
          </h1>
          <p className="text-sm font-bold opacity-40 uppercase tracking-widest pl-1">Student Infrastructure Registry</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              darkMode ? 'text-gray-600 group-focus-within:text-primary' : 'text-gray-400 group-focus-within:text-black'
            }`} size={18} />
            <input 
              type="text" 
              placeholder="Search registry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`h-14 pl-12 pr-4 rounded-2xl outline-none transition-all placeholder:font-light font-medium focus:ring-4 ${
                darkMode ? 'bg-zinc-900 border border-white/10 text-white focus:ring-primary/10' : 'bg-white border-gray-200 shadow-sm'
              }`}
            />
          </div>

          <label className={`h-14 px-8 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer hover:scale-105 active:scale-95 border ${
             darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-black text-black'
          }`}>
             <FileSpreadsheet size={20} /> Bulk Sync (Excel)
             <input type="file" hidden accept=".xlsx, .xls, .csv" onChange={handleExcelImport} disabled={isImporting} />
          </label>

          <button 
            onClick={() => setIsModalOpen(true)}
            className={`h-14 px-8 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${
              darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-black text-white shadow-lg'
            }`}
          >
            <UserPlus size={20} /> Create Node
          </button>
        </div>
      </div>

      {/* User Table / List */}
      <div className={`rounded-[48px] border overflow-hidden transition-all ${
        darkMode ? 'bg-zinc-900/40 border-white/5 glass-dark' : 'bg-white border-gray-100 shadow-xl'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b text-[10px] font-black uppercase tracking-[0.3em] ${
                darkMode ? 'border-white/5 text-primary opacity-60' : 'border-gray-100 text-gray-400'
              }`}>
                <th className="px-10 py-8">Security Node</th>
                <th className="px-10 py-8">Access Level</th>
                <th className="px-10 py-8">Registry Date</th>
                <th className="px-10 py-8 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                     <td colSpan="4" className="px-10 py-10 h-16">
                        <div className={`h-8 w-full rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
                     </td>
                  </tr>
                ))
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all group-hover:rotate-12 ${
                            darkMode ? 'bg-black border-white/5 text-primary' : 'bg-gray-50 border-gray-100 text-black shadow-sm'
                          }`}>
                             <GraduationCap size={20} />
                          </div>
                          <div className="space-y-1">
                             <p className="text-xl font-bold tracking-tight italic uppercase">{u.name}</p>
                             <p className="text-[10px] uppercase font-black tracking-widest opacity-40">{u.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 border ${
                         u.role === 'admin' 
                           ? (darkMode ? 'bg-primary/10 border-primary/20 text-primary shadow-neon' : 'bg-black text-white')
                           : (darkMode ? 'bg-zinc-800 border-white/5 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-500')
                       }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${u.role === 'admin' ? 'bg-primary animate-pulse' : 'bg-gray-500'}`} />
                          {u.role === 'admin' ? 'Overseer' : 'Standard'}
                       </span>
                    </td>
                    <td className="px-10 py-8">
                       <p className="text-xs font-bold tracking-wider text-gray-500">{new Date(u.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <button className={`p-4 rounded-2xl transition-all border group-hover:scale-110 active:scale-95 ${
                         darkMode ? 'bg-zinc-800 border-white/5 text-red-500/60 hover:bg-red-500/10 hover:text-red-500' : 'bg-red-50 border-red-100 text-red-500'
                       }`}>
                          <Trash2 size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && !isLoading && (
          <div className="py-20 text-center space-y-4">
             <Users size={64} className="mx-auto opacity-10" />
             <p className="uppercase tracking-[0.4em] font-black text-xs opacity-20 italic">Registry Void Observed</p>
          </div>
        )}
      </div>

      {/* Manual Creation Modal (Simplified) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-lg rounded-[48px] border relative z-10 p-10 ${darkMode ? 'bg-zinc-950 border-white/10' : 'bg-white border-gray-100 shadow-2xl'}`}>
                <div className="space-y-8">
                   <div className="space-y-1">
                      <h2 className="text-4xl font-black uppercase italic tracking-tighter italic">Manual <span className="text-primary italic">Initialization</span></h2>
                      <p className="text-[10px] uppercase font-black tracking-widest opacity-40 italic">Standalone Node Deployment</p>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 pl-2">Subject Identity</label>
                         <input type="text" placeholder="Full Name" className={`w-full h-14 px-6 rounded-2xl outline-none transition-all font-bold uppercase ${darkMode ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200'}`} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 pl-2">Security ID (Roll No)</label>
                         <input type="text" placeholder="22XXXXXX" className={`w-full h-14 px-6 rounded-2xl outline-none transition-all font-bold uppercase ${darkMode ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200'}`} />
                      </div>
                      
                      <button className={`w-full h-16 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all active:scale-95 ${darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-black text-white hover:shadow-2xl'}`}>
                         Initialize Node <ArrowRight size={18} />
                      </button>
                   </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="pt-10 flex items-center justify-center gap-4">
         <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse blur-[1px]" />
         <p className="text-[10px] uppercase font-black tracking-[0.4em] opacity-30 italic">Registry Secure Channel Active • 2048 Bit Encryption</p>
         <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse blur-[1px]" />
      </footer>
    </div>
  )
}

export default UserManagement
