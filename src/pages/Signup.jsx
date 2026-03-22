import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, AtSign, Loader2, Sparkles, AlertCircle, User, ShieldCheck, ArrowRight } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { signUpWithRollNumber } from '../services/auth'
import { useAuthStore, useThemeStore } from '../store/store'
import toast from 'react-hot-toast'

const Signup = () => {
  const [name, setName] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()
  const { darkMode } = useThemeStore()

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      await signUpWithRollNumber(name, rollNumber, password)
      
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message || 'Signup failed')
      toast.error('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center relative p-4 transition-colors duration-500 ${
      darkMode ? 'text-white' : 'text-gray-900'
    }`}>
      {/* Background Decor */}
      <div className={`absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none -z-10`}>
        <div className={`absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[150px] ${
          darkMode ? 'bg-primary' : 'bg-blue-300'
        }`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[150px] ${
          darkMode ? 'bg-purple-600' : 'bg-pink-300'
        }`} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className={`w-full max-w-lg p-8 rounded-[40px] relative backdrop-blur-3xl overflow-hidden border ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200 shadow-2xl shadow-blue-500/10'
        }`}
      >
        {/* Glow Effect */}
        {darkMode && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 hover:bg-primary/30 rounded-full blur-[50px] -mr-16 -mt-16 transition-all" />
        )}

        <div className="relative z-10 text-center mb-8">
          <div className={`inline-flex items-center justify-center p-4 rounded-2xl mb-4 transition-all ${
            darkMode ? 'bg-primary/10 text-primary border border-primary/20 shadow-neon' : 'bg-black text-white'
          }`}>
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase italic tracking-tighter">Initialize Account</h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500 text-sm'}>
            Deploy your profile to the campus network
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex items-center gap-2 mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 pl-2">Full Identity</label>
            <div className="relative flex items-center group">
              <span className={`absolute left-4 transition-colors group-focus-within:text-primary ${
                darkMode ? 'text-gray-400' : 'text-gray-400'
              }`}>
                <User size={18} />
              </span>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="JOHN DOE" 
                required
                className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold uppercase ${
                  darkMode 
                  ? 'bg-black/40 border border-white/10 focus:border-primary/50 text-white placeholder:text-gray-600' 
                  : 'bg-gray-50 border border-gray-200 focus:border-black/50 text-black placeholder:text-gray-400'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 pl-2">Security Node (Roll No)</label>
            <div className="relative flex items-center group">
              <span className={`absolute left-4 transition-colors group-focus-within:text-primary ${
                darkMode ? 'text-gray-400' : 'text-gray-400'
              }`}>
                <ShieldCheck size={18} />
              </span>
              <input 
                type="text" 
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="21XXXXXX" 
                required
                className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold uppercase ${
                  darkMode 
                  ? 'bg-black/40 border border-white/10 focus:border-primary/50 text-white placeholder:text-gray-600' 
                  : 'bg-gray-50 border border-gray-200 focus:border-black/50 text-black placeholder:text-gray-400'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5 ">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 pl-2">Access Key</label>
            <div className="relative flex items-center group">
              <span className={`absolute left-4 transition-colors group-focus-within:text-primary ${
                darkMode ? 'text-gray-400' : 'text-gray-400'
              }`}>
                <Sparkles size={18} />
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all font-medium ${
                  darkMode 
                  ? 'bg-black/40 border border-white/10 focus:border-primary/50 text-white placeholder:text-gray-600' 
                  : 'bg-gray-50 border border-gray-200 focus:border-black/50 text-black placeholder:text-gray-400'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 pl-2">Confirm Key</label>
            <div className="relative flex items-center group">
              <span className={`absolute left-4 transition-colors group-focus-within:text-primary ${
                darkMode ? 'text-gray-400' : 'text-gray-400'
              }`}>
                <ShieldCheck size={18} />
              </span>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all font-medium ${
                  darkMode 
                  ? 'bg-black/40 border border-white/10 focus:border-primary/50 text-white placeholder:text-gray-600' 
                  : 'bg-gray-50 border border-gray-200 focus:border-black/50 text-black placeholder:text-gray-400'
                }`}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full h-16 mt-6 md:col-span-2 rounded-3xl font-black uppercase tracking-widest text-sm relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] ${
              darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-black text-white hover:shadow-2xl shadow-blue-500/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Synchronizing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span>Deploy Account</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
            
            {/* Hover Shine Animation */}
            <div className="absolute top-0 -left-1/4 w-1/4 h-full bg-white/20 skew-x-12 transition-all duration-500 group-hover:left-[125%]" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className={`text-sm opacity-60 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Already in the registry? <Link to="/login" className="text-primary font-bold hover:underline">Access Portal</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Signup
