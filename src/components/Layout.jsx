import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { motion } from 'framer-motion'
import { useThemeStore } from '../store/store'

const Layout = () => {
  const { darkMode } = useThemeStore()

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-black text-white' : 'bg-[#F9FAFB] text-gray-900'
    }`}>
      <Navbar />
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 ${
          darkMode ? 'bg-primary' : 'bg-blue-300'
        }`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-10 ${
          darkMode ? 'bg-purple-500' : 'bg-pink-200'
        }`} />
      </div>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className={`py-12 border-t text-center transition-colors ${
        darkMode ? 'border-white/10 text-gray-500 bg-black/40' : 'border-gray-200 text-gray-400 bg-white'
      }`}>
        <p className="text-sm">© 2026 Campus Connect. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6">
          <a href="#" className="hover:text-primary transition-colors">Twitter</a>
          <a href="#" className="hover:text-primary transition-colors">Instagram</a>
          <a href="#" className="hover:text-primary transition-colors">GitHub</a>
        </div>
      </footer>
    </div>
  )
}

export default Layout
