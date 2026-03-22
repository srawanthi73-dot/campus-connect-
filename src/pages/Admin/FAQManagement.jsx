import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, HelpCircle, ShieldCheck, 
  Send, Trash2, Edit, CheckCircle2, Loader2, 
  Search, Filter, X, ArrowRight, MessageCircleCode
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useThemeStore } from '../../store/store'
import toast from 'react-hot-toast'

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFaq, setSelectedFaq] = useState(null)
  const [answer, setAnswer] = useState('')
  const { darkMode } = useThemeStore()

  useEffect(() => {
    fetchFaqs()
    
    // Real-time subscription
    const channel = supabase
      .channel('faq-admin')
      .on('postgres_changes', { event: '*', table: 'faq' }, () => fetchFaqs())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFaqs(data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      // Mock data
      setFaqs([
        { id: '1', question: 'Will there be free food?', answer: '', created_at: new Date().toISOString() },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = async (id) => {
    if (!answer.trim()) return

    try {
      const { error } = await supabase
        .from('faq')
        .update({ answer, answered_by: 'admin' })
        .eq('id', id)

      if (error) throw error
      toast.success('Response deployed successfully')
      setAnswer('')
      setSelectedFaq(null)
      fetchFaqs()
    } catch (err) {
      toast.error(err.message || 'Failed to deploy response')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Erase this inquiry?')) return
    try {
      await supabase.from('faq').delete().eq(id)
      fetchFaqs()
    } catch (err) {}
  }

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingCount = faqs.filter(f => !f.answer).length

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-primary">
            <MessageSquare size={14} />
            Communication Protocol
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter italic">
            Inquiry <span className="text-primary italic neon-glow">Terminal</span>
          </h1>
          <p className="text-sm font-bold opacity-40 uppercase tracking-widest pl-1">Knowledge Base Modulation</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className={`px-6 py-4 rounded-3xl border flex items-center gap-4 ${
             darkMode ? 'bg-zinc-900 border-white/5 text-gray-400' : 'bg-white border-gray-100 shadow-sm text-gray-600'
          }`}>
             <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase italic italic">{pendingCount}</div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Unresolved Queries</p>
                <p className="text-xs font-bold font-outfit uppercase">In Queue</p>
             </div>
          </div>
          
          <div className="relative group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              darkMode ? 'text-gray-600 group-focus-within:text-primary' : 'text-gray-400 group-focus-within:text-black'
            }`} size={18} />
            <input 
              type="text" 
              placeholder="Filter inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`h-14 pl-12 pr-4 rounded-2xl outline-none transition-all placeholder:font-light font-medium focus:ring-4 ${
                darkMode ? 'bg-zinc-900 border border-white/10 text-white focus:ring-primary/10' : 'bg-white border-gray-200'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Grid of Inquiries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          [1,2,3].map(i => (
             <div key={i} className={`h-64 rounded-[40px] animate-pulse ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'}`} />
          ))
        ) : (
          filteredFaqs.map((faq) => (
            <motion.div
              layout
              key={faq.id}
              className={`p-1 group rounded-[40px] overflow-hidden transition-all hover:scale-[1.02] border border-white/5 ${
                darkMode ? 'bg-white/5' : 'bg-white shadow-xl shadow-gray-200/50'
              }`}
            >
              <div className={`p-8 h-full rounded-[40px] border relative transition-all overflow-hidden flex flex-col ${
                darkMode ? 'bg-zinc-900 border-white/5 group-hover:border-primary group-hover:shadow-neon' : 'bg-white border-gray-100'
              }`}>
                {/* Visual Identity in Card */}
                {!faq.answer && (
                   <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl pointer-events-none rounded-full" />
                )}
                
                <div className="space-y-6 relative z-10 flex-1">
                   <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl ${faq.answer ? (darkMode ? 'bg-zinc-800 text-gray-500':'bg-gray-50') : 'bg-primary/10 text-primary animate-pulse'}`}>
                         <HelpCircle size={18} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{new Date(faq.created_at).toLocaleDateString()}</p>
                   </div>

                   <div className="space-y-2">
                       <p className="text-[10px] uppercase font-black tracking-widest text-primary opacity-60 italic">Inquiry Subject</p>
                       <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none line-clamp-2">{faq.question}</h3>
                   </div>

                   {faq.answer && (
                    <div className="space-y-2">
                       <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">System Response</p>
                       <p className={`text-sm leading-relaxed line-clamp-3 font-outfit italic ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>"{faq.answer}"</p>
                    </div>
                   )}
                </div>

                <div className="flex gap-3 mt-8 relative z-10">
                   {!faq.answer ? (
                    <button 
                      onClick={() => { setSelectedFaq(faq); setAnswer('') }}
                      className={`flex-1 h-12 rounded-2xl border transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest ${
                        darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-black text-white'
                      }`}
                    >
                      Deploy Answer <ArrowRight size={16} />
                    </button>
                   ) : (
                    <button 
                      onClick={() => { setSelectedFaq(faq); setAnswer(faq.answer) }}
                      className={`flex-1 h-12 rounded-2xl border transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest ${
                        darkMode ? 'bg-zinc-800 border-white/5 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Edit size={16} /> Edit
                    </button>
                   )}
                   <button 
                     onClick={() => handleDelete(faq.id)}
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

      {/* Answer Modal */}
      <AnimatePresence>
        {selectedFaq && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelectedFaq(null)} className="absolute inset-0 bg-black/80 backdrop-blur-3xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-xl rounded-[40px] border relative z-10 p-10 overflow-hidden ${darkMode ? 'bg-zinc-950 border-white/10' : 'bg-white border-gray-100 shadow-2xl'}`}>
                <div className="space-y-8 relative z-10">
                   <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Response <span className="text-primary italic italic">Deployment</span></h2>
                        <p className="text-[10px] uppercase font-black opacity-30 tracking-[0.3em] font-black italic">Modulating Knowledge Node</p>
                      </div>
                      <button onClick={() => setSelectedFaq(null)} className="text-gray-500 hover:text-white transition-colors">
                        <X size={24} />
                      </button>
                   </div>
                   
                   <div className="space-y-6">
                      <div className={`p-8 rounded-[32px] border bg-white/[0.02] border-white/5 text-gray-400 italic font-outfit text-lg`}>
                        "{selectedFaq.question}"
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 pl-2">System Broadcast Input</label>
                         <textarea 
                           placeholder="Type the official response here..."
                           rows="5"
                           value={answer}
                           onChange={(e) => setAnswer(e.target.value)}
                           className={`w-full p-6 rounded-3xl outline-none transition-all font-medium font-outfit focus:ring-4 resize-none leading-relaxed ${
                             darkMode ? 'bg-black/40 border border-white/10 focus:border-primary/50 text-white' : 'bg-gray-50 border-gray-200'
                           }`}
                         />
                      </div>
                      
                      <button 
                        onClick={() => handleAnswer(selectedFaq.id)}
                        className={`w-full h-16 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all active:scale-95 ${darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-black text-white hover:shadow-2xl'}`}
                      >
                         Secure Broadcast <Send size={18} />
                      </button>
                   </div>
                </div>

                {/* Backdrop Glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FAQManagement
