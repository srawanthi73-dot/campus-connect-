import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, AtSign, Loader2, Sparkles, AlertCircle, User } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithRollNumber } from '../services/auth'
import { useAuthStore, useThemeStore } from '../store/store'
import toast from 'react-hot-toast'

const Login = () => {
  const [loginMode, setLoginMode] = useState('student') // 'student' or 'admin'
  const [email, setEmail] = useState('')
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
      // Map 'admin@123' to a highly secure internal email that Supabase will never reject
      let loginEmail = email
      if (loginMode === 'admin' && email === 'admin@123') {
        loginEmail = 'masteradmin@campus.edu'
      }

      const { user, profile } = await signInWithRollNumber(loginEmail, password)
      
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
      setError(err.message || 'Invalid credentials or password')
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
        className={`w-full max-w-md p-8 rounded-[40px] relative backdrop-blur-3xl overflow-hidden border ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-100 shadow-2xl'
        }`}
      >
        <div className="relative z-10 text-center mb-8">
          <div className={`inline-flex items-center justify-center p-4 rounded-3xl mb-4 transition-all ${
            darkMode ? 'bg-primary/10 text-primary border border-primary/20 shadow-neon' : 'bg-primary text-primary-foreground'
          }`}>
            <LogIn size={32} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2 italic">CAMPUS PORTAL</h1>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Select access node to initialize session
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={`flex p-1 rounded-2xl mb-8 ${darkMode ? 'bg-black/40' : 'bg-gray-100'}`}>
          <button 
            onClick={() => { setLoginMode('student'); setError(null); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              loginMode === 'student' 
                ? (darkMode ? 'bg-primary text-black shadow-neon' : 'bg-white text-primary shadow-sm')
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Student
          </button>
          <button 
            onClick={() => { setLoginMode('admin'); setError(null); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              loginMode === 'admin' 
                ? (darkMode ? 'bg-primary text-black shadow-neon' : 'bg-white text-primary shadow-sm')
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Admin Forge
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex items-center gap-2 mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1">
              {loginMode === 'student' ? 'Mail Identity' : 'Admin Username'}
            </label>
            <div className="relative flex items-center group">
              <span className={`absolute left-4 transition-colors group-focus-within:text-primary ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {loginMode === 'student' ? <AtSign size={18} /> : <User size={18} />}
              </span>
              <input 
                type={loginMode === 'student' ? 'email' : 'text'} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={loginMode === 'student' ? 'charan@gmail.com' : 'Enter Admin ID'} 
                required
                className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold tracking-tight ${
                  darkMode 
                  ? 'bg-black/50 border border-white/10 focus:border-primary/50 text-white placeholder:text-gray-700' 
                  : 'bg-white border border-gray-200 focus:border-primary/50 text-black placeholder:text-gray-300 shadow-sm'
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1">
              Access Key
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
                className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold tracking-tight ${
                  darkMode 
                  ? 'bg-black/50 border border-white/10 focus:border-primary/50 text-white placeholder:text-gray-700' 
                  : 'bg-white border border-gray-200 focus:border-primary/50 text-black placeholder:text-gray-300 shadow-sm'
                }`}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full h-14 mt-4 rounded-2xl font-black uppercase tracking-widest transition-all relative overflow-hidden group active:scale-95 ${
              darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Initializing...</span>
              </div>
            ) : (
              <span>Deploy Session</span>
            )}
            
            <div className="absolute top-0 -left-1/2 w-1/2 h-full bg-white/20 skew-x-12 transition-all duration-700 group-hover:left-[150%]" />
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center space-y-4">
          <p className={`text-xs font-bold tracking-tight ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            New student member? <Link to="/signup" className="text-primary hover:underline italic">Initialize Profile</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
