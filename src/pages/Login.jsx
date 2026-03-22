import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, AtSign, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithRollNumber } from '../services/auth'
import { useAuthStore, useThemeStore } from '../store/store'
import toast from 'react-hot-toast'

const Login = () => {
  const [rollNumber, setRollNumber] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()
  const { setUser, setRole } = useAuthStore()
  const { darkMode } = useThemeStore()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { user, profile } = await signInWithRollNumber(rollNumber, password)
      
      setUser(user)
      setRole(profile.role)

      if (profile.needs_reset) {
        toast.success('Welcome! Please reset your password to continue.')
        navigate('/reset-password')
      } else {
        toast.success(`Welcome back, ${profile.name}!`)
        navigate('/')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Invalid roll number or password')
      toast.error('Check your credentials and try again')
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
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[150px] ${
          darkMode ? 'bg-primary' : 'bg-blue-300'
        }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[150px] ${
          darkMode ? 'bg-purple-600' : 'bg-pink-300'
        }`} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className={`w-full max-w-md p-8 rounded-3xl relative backdrop-blur-3xl overflow-hidden border ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200 shadow-2xl shadow-blue-500/10'
        }`}
      >
        {/* Glow Effect Top Left */}
        {darkMode && (
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 hover:bg-primary/30 rounded-full blur-[50px] -ml-16 -mt-16 transition-all" />
        )}

        <div className="relative z-10 text-center mb-8">
          <div className={`inline-flex items-center justify-center p-4 rounded-2xl mb-4 transition-all ${
            darkMode ? 'bg-primary/10 text-primary border border-primary/20 shadow-neon' : 'bg-black text-white'
          }`}>
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500 text-sm'}>
            Login to access your campus portal
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

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider pl-1 font-outfit opacity-70">
              Roll Number
            </label>
            <div className="relative flex items-center group">
              <span className={`absolute left-4 transition-colors group-focus-within:text-primary ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <AtSign size={18} />
              </span>
              <input 
                type="text" 
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="21XXXXXX" 
                required
                className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all placeholder:font-light font-medium focus:ring-2 ${
                  darkMode 
                  ? 'bg-black/50 border border-white/10 focus:border-primary/50 focus:ring-primary/20 text-white placeholder:text-gray-600' 
                  : 'bg-gray-50 border border-gray-200 focus:border-black/50 focus:ring-black/5 focus:bg-white text-black placeholder:text-gray-400'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider pl-1 font-outfit opacity-70">
              Password
            </label>
            <div className="relative flex items-center group">
              <span className={`absolute left-4 transition-colors group-focus-within:text-primary ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <Sparkles size={18} />
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all placeholder:font-light font-medium focus:ring-2 ${
                  darkMode 
                  ? 'bg-black/50 border border-white/10 focus:border-primary/50 focus:ring-primary/20 text-white placeholder:text-gray-600' 
                  : 'bg-gray-50 border border-gray-200 focus:border-black/50 focus:ring-black/5 focus:bg-white text-black placeholder:text-gray-400'
                }`}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full h-14 mt-4 rounded-2xl font-bold transition-all relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] ${
              darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-black text-white hover:shadow-lg'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Processing...</span>
              </div>
            ) : (
              <span>Continue Portal</span>
            )}
            
            {/* Hover Shine Animation */}
            <div className="absolute top-0 -left-1/4 w-1/4 h-full bg-white/20 skew-x-12 transition-all duration-500 group-hover:left-[125%]" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center space-y-4">
          <p className={`text-sm opacity-60 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            New to the portal? <Link to="/signup" className="text-primary font-bold hover:underline">Create Account</Link>
          </p>
          <p className={`text-sm opacity-60 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Trouble logging in? Contact campus admin.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
