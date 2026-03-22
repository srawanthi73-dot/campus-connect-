import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Loader2, KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { updatePassword } from '../services/auth'
import toast from 'react-hot-toast'
import { useThemeStore } from '../store/store'

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { darkMode } = useThemeStore()

  const handleReset = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match')
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }

    setIsLoading(true)
    try {
      await updatePassword(newPassword)
      toast.success('Password updated! Redirecting to portal...')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      darkMode ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl relative overflow-hidden overflow-visible ${
          darkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-100'
        }`}
      >
        <div className="text-center mb-8 relative">
          <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-4 shadow-neon">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-bold">Secure Your Account</h1>
          <p className="text-gray-400 mt-2">Create a new password to continue access</p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest pl-1 font-outfit opacity-70">
              New Password
            </label>
            <div className="relative group flex items-center">
              <span className="absolute left-4 text-gray-500 group-focus-within:text-primary">
                <Lock size={18} />
              </span>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest pl-1 font-outfit opacity-70">
              Confirm Password
            </label>
            <div className="relative group flex items-center">
              <span className="absolute left-4 text-gray-500 group-focus-within:text-primary">
                <Lock size={18} />
              </span>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            className={`w-full h-14 rounded-2xl font-bold transition-all relative group overflow-hidden ${
              darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-black text-white hover:shadow-lg'
            } disabled:opacity-50`}
          >
            {isLoading ? <Loader2 className="mx-auto animate-spin" size={24} /> : 'Save & Continue'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default ResetPassword
