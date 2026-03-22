import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../store/store'

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useThemeStore()

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors ${
        darkMode ? 'bg-dark-surface text-primary border border-dark-border' : 'bg-gray-100 text-gray-800'
      }`}
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </motion.button>
  )
}

export default ThemeToggle
