import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Calendar, Bookmark, HelpCircle, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import { useAuthStore, useThemeStore } from '../store/store'
import ThemeToggle from './ThemeToggle'
import { useState } from 'react'

const Navbar = () => {
  const { user, role, logout } = useAuthStore()
  const { darkMode } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { name: 'Events', path: '/', icon: Calendar },
    { name: 'FAQ', path: '/faq', icon: HelpCircle },
    ...(user ? [{ name: 'Bookmarks', path: '/bookmarks', icon: Bookmark }] : []),
    ...(role === 'admin' ? [{ name: 'Dashboard', path: '/admin', icon: LayoutDashboard }] : []),
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      darkMode ? 'bg-black/60 backdrop-blur-md border-b border-white/10' : 'bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:rotate-12 ${
              darkMode ? 'bg-primary text-black neon-border shadow-neon' : 'bg-black text-white'
            }`}>
              <Home size={18} />
            </div>
            <span className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Campus<span className={darkMode ? 'text-primary neon-glow' : 'text-primary'}>Connect</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <link.icon size={16} />
                {link.name}
              </Link>
            ))}
            
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-2 ${
                      darkMode ? 'bg-dark-surface border-dark-border' : 'bg-gray-100 border-gray-200'
                    }`}
                  >
                    <User size={18} />
                  </motion.div>
                </Link>
                <button 
                  onClick={handleLogout}
                  className={`p-2 rounded-full transition-colors hover:bg-red-500/10 hover:text-red-500 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`px-5 py-2 rounded-full font-semibold transition-all ${
                  darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-black text-white'
                }`}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={darkMode ? 'text-white' : 'text-black'}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`md:hidden border-b ${
              darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    darkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <link.icon size={20} />
                  {link.name}
                </Link>
              ))}
              <hr className={darkMode ? 'border-white/5' : 'border-gray-100'} />
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      darkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User size={20} />
                    Profile
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="flex w-full items-center gap-3 p-3 text-red-500 rounded-xl transition-colors hover:bg-red-500/10"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-center p-3 rounded-xl font-bold transition-all ${
                    darkMode ? 'bg-primary text-black' : 'bg-black text-white'
                  }`}
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
