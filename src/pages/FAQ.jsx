import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, MessageSquare, ChevronDown, 
  Send, HelpCircle, ShieldCheck, Loader2, Sparkles, AlertCircle
} from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuthStore, useThemeStore } from '../store/store'
import toast from 'react-hot-toast'

const FAQ = () => {
  const [faqs, setFaqs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [newQuestion, setNewQuestion] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { user } = useAuthStore()
  const { darkMode } = useThemeStore()

  useEffect(() => {
    fetchFaqs()
    
    // Realtime subscription
    const subscription = supabase
      .channel('faq-updates')
      .on('postgres_changes', { event: '*', table: 'faq' }, () => {
        fetchFaqs()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
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
        { id: '1', question: 'How do I register for CyberTech?', answer: 'Go to the Events page, click on CyberTech, and hit the Register button. Fill in your details and you are good to go!', asked_by: 'system', answered_by: 'admin' },
        { id: '2', question: 'Where is the main auditorium located?', answer: 'The main auditorium is next to the North Wing, opposite the Cafeteria.', asked_by: 'system', answered_by: 'admin' },
        { id: '3', question: 'Can I cancel my registration?', answer: 'Yes, you can cancel it from your profile dashboard under My Registrations.', asked_by: 'system', answered_by: 'admin' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!user) return toast.error('Login to ask questions')
    if (!newQuestion.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('faq')
        .insert([{ question: newQuestion, user_id: user.id }])

      if (error) throw error
      setNewQuestion('')
      toast.success('Your question has been posted! Admin will answer soon.')
    } catch (err) {
      toast.error(err.message || 'Failed to post question')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.answer && f.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="max-w-4xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${
            darkMode ? 'bg-primary/10 border-primary/20 text-primary shadow-neon' : 'bg-black text-white'
          }`}
        >
          <HelpCircle size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Knowledge Base</span>
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight uppercase tracking-tighter">
          Instant <span className="text-primary italic neon-glow">Campus</span> Support
        </h1>
        <p className={`text-lg max-w-2xl mx-auto font-outfit ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Got questions? We've got answers. Explore our knowledge base or ask your own question to get help from the community.
        </p>

        {/* Search */}
        <div className="relative max-w-xl mx-auto group">
          <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${
            darkMode ? 'text-gray-600 group-focus-within:text-primary' : 'text-gray-400 group-focus-within:text-black'
          }`} size={20} />
          <input 
            type="text" 
            placeholder="Search questions or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full h-16 pl-14 pr-6 rounded-[28px] outline-none transition-all placeholder:font-light font-medium focus:ring-4 ${
              darkMode 
              ? 'bg-zinc-900 border border-white/10 focus:border-primary/50 focus:ring-primary/10 text-white' 
              : 'bg-white border border-gray-200 focus:border-black/50 focus:ring-black/5 shadow-xl'
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          [1,2,3].map(i => (
             <div key={i} className={`h-24 rounded-3xl animate-pulse ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'}`} />
          ))
        ) : (
          filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <motion.div
                key={faq.id}
                layout
                className={`rounded-[32px] border overflow-hidden transition-all duration-300 ${
                  activeId === faq.id 
                    ? (darkMode ? 'bg-zinc-900/80 border-primary/30' : 'bg-white border-black/10 ring-4 ring-black/5')
                    : (darkMode ? 'bg-zinc-900/40 border-white/5 hover:bg-white/5' : 'bg-white border-gray-100 hover:border-gray-200')
                }`}
              >
                <button
                  onClick={() => setActiveId(activeId === faq.id ? null : faq.id)}
                  className="w-full p-8 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-12 ${
                      darkMode ? 'bg-black border border-white/5 text-primary' : 'bg-gray-50 border border-gray-100 text-black'
                    }`}>
                      {faq.answer ? <ShieldCheck size={24} /> : <MessageSquare size={24} className="opacity-40" />}
                    </div>
                    <span className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: activeId === faq.id ? 180 : 0 }}
                    className={darkMode ? 'text-primary' : 'text-gray-400'}
                  >
                    <ChevronDown size={24} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {activeId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-8 pt-0"
                    >
                      <div className={`mt-4 p-8 rounded-3xl border ${
                        darkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-100'
                      }`}>
                        {faq.answer ? (
                          <div className="space-y-4">
                            <p className={`text-lg leading-relaxed font-outfit ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {faq.answer}
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-4">
                               <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                  <Sparkles size={14} className="text-primary" />
                               </div>
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Answered by Campus Admin</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-yellow-500 opacity-60">
                             <AlertCircle size={18} />
                             <span className="text-sm font-bold uppercase tracking-widest italic">Awaiting response from department...</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 opacity-30 uppercase tracking-[0.3em] font-black italic">
               Knowledge pool is empty for now
            </div>
          )
        )}
      </div>

      {/* Ask Question Section */}
      <section className={`p-12 md:p-16 rounded-[48px] border shadow-3xl relative overflow-hidden transition-all ${
        darkMode ? 'bg-primary border-primary hover:shadow-neon' : 'bg-black border-black text-white'
      }`}>
        <div className="relative z-10 space-y-10">
          <div className="text-center space-y-3">
            <h3 className={`text-3xl md:text-5xl font-black italic uppercase tracking-tighter ${darkMode ? 'text-black' : 'text-white'}`}>
              Can't find your answer?
            </h3>
            <p className={`text-lg font-outfit ${darkMode ? 'text-black/60' : 'text-white/60'}`}>
              Post your question directly to the department portal.
            </p>
          </div>

          <form onSubmit={handleAsk} className="relative group max-w-2xl mx-auto">
            <textarea 
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ex: When will the sports meet start?"
              rows="3"
              className={`w-full p-8 pr-20 rounded-[40px] outline-none transition-all placeholder:font-light font-medium resize-none ${
                darkMode ? 'bg-black text-white placeholder:text-gray-600' : 'bg-white text-black placeholder:text-gray-400'
              }`}
            />
            <button 
              type="submit"
              disabled={isSubmitting || !user}
              className={`absolute right-4 bottom-4 p-5 rounded-3xl transition-all hover:scale-110 active:scale-90 ${
                darkMode ? 'bg-primary text-black' : 'bg-black text-white'
              } disabled:opacity-50`}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
            </button>
          </form>

          {!user && (
             <p className="text-center text-xs font-black uppercase tracking-widest text-black/40">
                Please <Link to="/login" className="underline font-black">Login</Link> to interact with the community
             </p>
          )}
        </div>

        {/* Backdrop Shine */}
        <div className="absolute top-0 right-[-10%] w-[40%] h-[200%] bg-white/10 skew-x-[-45deg] transition-all duration-700 group-hover:right-[110%] pointer-events-none" />
      </section>
    </div>
  )
}

export default FAQ
