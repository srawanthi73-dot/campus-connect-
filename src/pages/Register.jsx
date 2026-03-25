import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheck, ArrowRight, ArrowLeft, Loader2, 
  CheckCircle2, AlertTriangle, User, GraduationCap, 
  PhoneCall, Mail, MessageSquare, Layers
} from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuthStore, useThemeStore } from '../store/store'
import toast from 'react-hot-toast'

import { QRCodeCanvas } from 'qrcode.react'

const Register = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [registrationId, setRegistrationId] = useState(null)
  
  const { user } = useAuthStore()
  const { darkMode } = useThemeStore()

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    email: '',
    phone: '',
    branch: '',
    semester: '',
    expectations: '',
    social_handle: ''
  })

  useEffect(() => {
    if (!user) {
      toast.error('Please login to register for events')
      navigate('/login')
      return
    }
    fetchEvent()
  }, [id, user])

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('title, id')
        .eq('id', id)
        .single()
      
      if (error) throw error
      setEvent(data)
    } catch (err) {
      setEvent({ id, title: 'Campus Event 2026' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('registrations')
        .insert([{
          event_id: id,
          user_id: user.id,
          form_data: formData
        }])
        .select()
        .single()

      if (error) throw error
      
      setRegistrationId(data.id)
      setIsSuccess(true)
      toast.success('Registration successful!')
    } catch (err) {
      toast.error(err.message || 'Failed to register')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  )

  if (isSuccess) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 max-w-2xl mx-auto px-6">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${
          darkMode ? 'bg-primary/10 border-primary text-primary shadow-neon' : 'bg-green-500 border-green-600 text-white'
        }`}
      >
        <CheckCircle2 size={48} />
      </motion.div>
      <div className="space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tight italic">Registration Successful!</h1>
        <p className={`text-lg font-outfit ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          You've successfully secured your spot for <span className="text-primary font-bold">"{event?.title}"</span>. 
        </p>
      </div>

      {/* QR Code Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`p-8 rounded-[40px] border flex flex-col items-center gap-6 ${
          darkMode ? 'bg-white/5 border-white/10 glass-dark' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className={`p-4 rounded-3xl bg-white ${darkMode ? 'shadow-neon' : 'shadow-xl'}`}>
          <QRCodeCanvas 
            value={`REG:${registrationId}`} 
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Your Universal Entry Pass</p>
          <p className={`text-[10px] font-mono opacity-40 ${darkMode ? 'text-white' : 'text-black'}`}>{registrationId}</p>
        </div>
        <p className="text-sm font-medium text-gray-400 max-w-xs">
          Take a screenshot of this QR code. You'll need it for check-in at the venue.
        </p>
      </motion.div>

      <div className="flex gap-4 pt-6">
        <button 
          onClick={() => navigate('/')}
          className={`px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 ${
            darkMode ? 'bg-zinc-900 border border-white/10 text-white' : 'bg-gray-100 text-black'
          }`}
        >
          Browse More
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className={`px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 ${
            darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-black text-white'
          }`}
        >
          View Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start py-8">
      {/* Left: Info & Stepper */}
      <div className="lg:col-span-4 space-y-10 group">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-primary">
            <span className="w-10 h-0.5 bg-primary/30" />
            Registration
          </div>
          <h2 className="text-3xl md:text-5xl font-black leading-[1.1] uppercase tracking-tighter">
            Join The <br/> <span className="text-primary italic neon-glow">Elite</span> League
          </h2>
          <p className="text-gray-400 font-outfit leading-relaxed">
            Fill out the details below to confirm your presence at <span className="text-white font-bold">"{event?.title}"</span>. 
            All fields marked are required for verification.
          </p>
        </div>

        <div className="space-y-8 py-10 border-y border-white/5">
           {[
             { step: 1, title: 'Personal Identity', icon: User, desc: 'Your campus credentials' },
             { step: 2, title: 'Academic Info', icon: GraduationCap, desc: 'Department and branch' },
             { step: 3, title: 'Contribution', icon: MessageSquare, desc: 'What you bring to the event' },
           ].map((s) => (
             <div key={s.step} className="flex gap-6 group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl border transition-all ${
                  darkMode ? 'bg-zinc-900 border-white/10 text-white group-hover:border-primary group-hover:text-primary group-hover:shadow-neon' : 'bg-gray-100 border-gray-200 text-black'
                }`}>
                   <s.icon size={20} />
                </div>
                <div>
                   <h4 className="font-bold text-lg uppercase tracking-tight">{s.title}</h4>
                   <p className="text-xs text-gray-500 font-medium tracking-wide">{s.desc}</p>
                </div>
             </div>
           ))}
        </div>

        <div className={`p-6 rounded-3xl border border-dashed transition-all ${
           darkMode ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500/80 hover:bg-yellow-500/10' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
           <div className="flex items-start gap-4">
              <AlertTriangle className="flex-shrink-0 mt-1" size={18} />
              <p className="text-xs font-bold leading-relaxed uppercase tracking-widest">
                Double check your roll number. Duplicate registrations will be revoked automatically. 
              </p>
           </div>
        </div>
      </div>

      {/* Right: Actual Form */}
      <div className="lg:col-span-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-10 rounded-[40px] border shadow-3xl relative overflow-hidden backdrop-blur-3xl ${
            darkMode ? 'bg-white/5 border-white/10 glass-dark' : 'bg-white border-gray-100 shadow-2xl shadow-gray-200/50'
          }`}
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Field: Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 pl-2">Full Name</label>
              <div className="relative flex items-center group">
                <User size={18} className={`absolute left-4 transition-colors group-focus-within:text-primary ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input 
                  type="text" name="name" required placeholder="John Doe"
                  onChange={handleInputChange}
                  className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all placeholder:font-light font-medium focus:ring-2 ${
                    darkMode ? 'bg-black/40 border border-white/10 focus:border-primary/50 text-white' : 'bg-gray-50 border-gray-200 focus:bg-white text-black'
                  }`}
                />
              </div>
            </div>

            {/* Field: Roll Number */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 pl-2">Roll Number</label>
              <div className="relative flex items-center group">
                <ShieldCheck size={18} className={`absolute left-4 transition-colors group-focus-within:text-primary ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input 
                  type="text" name="roll_number" required placeholder="22CS342"
                  onChange={handleInputChange}
                  className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all placeholder:font-light font-medium focus:ring-2 ${
                    darkMode ? 'bg-black/40 border border-white/10 focus:border-primary/50 text-white' : 'bg-gray-50 border-gray-200 focus:bg-white text-black'
                  }`}
                />
              </div>
            </div>

            {/* Field: Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 pl-2">Email Identity</label>
              <div className="relative flex items-center group">
                <Mail size={18} className={`absolute left-4 transition-colors group-focus-within:text-primary ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input 
                  type="email" name="email" required placeholder="john@university.com"
                  onChange={handleInputChange}
                  className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all placeholder:font-light font-medium focus:ring-2 ${
                    darkMode ? 'bg-black/40 border border-white/10 focus:border-primary/50 text-white' : 'bg-gray-50 border-gray-200 focus:bg-white text-black'
                  }`}
                />
              </div>
            </div>

            {/* Field: Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 pl-2">Quick Contact</label>
              <div className="relative flex items-center group">
                <PhoneCall size={18} className={`absolute left-4 transition-colors group-focus-within:text-primary ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input 
                  type="tel" name="phone" required placeholder="+91 00000 00000"
                  onChange={handleInputChange}
                  className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all placeholder:font-light font-medium focus:ring-2 ${
                    darkMode ? 'bg-black/40 border border-white/10 focus:border-primary/50 text-white' : 'bg-gray-50 border-gray-200 focus:bg-white text-black'
                  }`}
                />
              </div>
            </div>

            {/* Field: Branch */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 pl-2">Academic Branch</label>
              <div className="relative flex items-center group">
                <Layers size={18} className={`absolute left-4 transition-colors group-focus-within:text-primary ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <select 
                  name="branch" required
                  onChange={handleInputChange}
                  className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all font-medium focus:ring-2 appearance-none cursor-pointer ${
                    darkMode ? 'bg-black/40 border border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'
                  }`}
                >
                  <option value="">Select Branch</option>
                  <option value="CSE">Computer Science</option>
                  <option value="ECE">Electronics</option>
                  <option value="MECH">Mechanical</option>
                  <option value="CIVIL">Civil Engineering</option>
                  <option value="EEE">Electrical</option>
                </select>
              </div>
            </div>

            {/* Field: Semester */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 pl-2">Current Semester</label>
              <div className="grid grid-cols-4 gap-2">
                {[1,2,3,4,5,6,7,8].map(sem => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, semester: sem }))}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all transition-colors ${
                      formData.semester === sem
                        ? (darkMode ? 'bg-primary text-black border-primary shadow-neon shadow-sm' : 'bg-black text-white border-black')
                        : (darkMode ? 'bg-black/40 border-white/10 text-gray-500 hover:border-white/30' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100')
                    }`}
                  >
                    S{sem}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Expectations */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 pl-2">Wait, tell us more about your interest</label>
              <textarea 
                name="expectations"
                rows="4"
                placeholder="What are you hoping to learn or achieve from this event?"
                onChange={handleInputChange}
                className={`w-full p-6 rounded-3xl outline-none transition-all placeholder:font-light font-medium focus:ring-2 resize-none ${
                    darkMode ? 'bg-black/40 border border-white/10 focus:border-primary/50 text-white' : 'bg-gray-50 border-gray-200 focus:bg-white text-black'
                  }`}
              ></textarea>
            </div>

            <div className="md:col-span-2 pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-6 rounded-3xl font-black text-lg uppercase tracking-widest relative overflow-hidden group transition-all hover:scale-[1.01] active:scale-[0.99] ${
                  darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-black text-white hover:shadow-2xl shadow-blue-500/20'
                } disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Processing Entry...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span>Finalize My Entry</span>
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
                
                {/* Glow behind text on hover */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            </div>
          </form>

          {/* Background Decor in Form */}
          {darkMode && (
            <>
              <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Register
