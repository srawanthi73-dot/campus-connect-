import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Scan, ArrowLeft, Loader2, CheckCircle2, 
  XCircle, User, Calendar, ShieldCheck, 
  Info, Sparkles, RefreshCw
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { useThemeStore } from '../../store/store'
import toast from 'react-hot-toast'

const Scanner = () => {
  const navigate = useNavigate()
  const { darkMode } = useThemeStore()
  const [scanResult, setScanResult] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [participant, setParticipant] = useState(null)
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 10,
    })

    scanner.render(onScanSuccess, onScanError)

    function onScanSuccess(result) {
      if (isVerifying) return // Prevent multiple scans at once
      
      // Expected format: REG:uuid
      if (result.startsWith('REG:')) {
        const id = result.split(':')[1]
        verifyRegistration(id)
        scanner.clear()
      } else {
        toast.error('Invalid QR Code Format')
      }
    }

    function onScanError(err) {
      // Ignore routine scanning errors
    }

    return () => {
      scanner.clear().catch(e => console.error('Failed to clear scanner:', e))
    }
  }, [])

  const verifyRegistration = async (id) => {
    setIsVerifying(true)
    setError(null)
    setScanResult(id)

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          users (name, roll_number),
          events (title, date, venue)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('No registration found with this ID')

      setParticipant(data)
    } catch (err) {
      setError(err.message || 'Verification Failed')
      toast.error(err.message || 'Failed to verify')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleReset = () => {
    setScanResult(null)
    setParticipant(null)
    setError(null)
    window.location.reload() // Fastest way to restart the scanner
  }

  const handleCheckIn = async () => {
    try {
      // Since we might not have a dedicated column, we'll just show success for now
      // or update the JSONB form_data
      const updatedFormData = { ...participant.form_data, checked_in: true, checked_in_at: new Date().toISOString() }
      
      const { error } = await supabase
        .from('registrations')
        .update({ form_data: updatedFormData })
        .eq('id', participant.id)

      if (error) throw error
      
      toast.success('Successfully Checked-In!')
      handleReset()
    } catch (err) {
      toast.error('Check-in failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-primary">
            <Scan size={14} />
            Terminal Entry
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
            Gate <span className="text-primary italic neon-glow">Scanner</span>
          </h1>
          <p className="text-sm font-bold opacity-40 uppercase tracking-widest pl-1">Identify & Verify Participants</p>
        </div>

        <button 
          onClick={() => navigate('/admin')}
          className={`h-14 px-8 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center gap-3 transition-all hover:scale-105 active:scale-95 border ${
            darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-black text-black'
          }`}
        >
           <ArrowLeft size={20} /> Terminate Scan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Scanner View */}
        <div className="lg:col-span-6 space-y-8">
           <div className={`p-1 rounded-[40px] overflow-hidden border transition-all ${
             darkMode ? 'bg-white/5 border-white/10 shadow-neon' : 'bg-white border-gray-100 shadow-2xl'
           }`}>
              <div id="reader" className="w-full h-full overflow-hidden rounded-[38px] aspect-square" />
           </div>
           
           <div className={`p-8 rounded-[32px] border flex items-center gap-6 ${
             darkMode ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-blue-50 border-blue-100 text-blue-700'
           }`}>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center animate-pulse">
                 <ShieldCheck size={24} />
              </div>
              <div>
                 <h4 className="font-black uppercase tracking-tight italic">Secure Protocol</h4>
                 <p className="text-[10px] uppercase font-black opacity-60">End-to-end verification active</p>
              </div>
           </div>
        </div>

        {/* Status / Result View */}
        <div className="lg:col-span-6">
           <AnimatePresence mode="wait">
              {isVerifying ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className={`p-16 text-center rounded-[48px] border flex flex-col items-center gap-8 ${
                    darkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                   <Loader2 className="animate-spin text-primary" size={64} />
                   <div className="space-y-2">
                      <h3 className="text-2xl font-black uppercase tracking-tighter italic">Extracting Intelligence</h3>
                      <p className="text-xs uppercase font-black tracking-widest opacity-40">Decrypting registration payload...</p>
                   </div>
                </motion.div>
              ) : participant ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-10 rounded-[48px] border overflow-hidden relative ${
                    darkMode ? 'bg-zinc-900 border-primary/30 shadow-neon' : 'bg-white border-green-200 shadow-3xl shadow-green-100'
                  }`}
                >
                   {/* Visual indicators */}
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full" />
                   
                   <div className="relative z-10 space-y-10">
                      <div className="flex items-start justify-between">
                         <div className="space-y-1">
                            <h2 className="text-3xl font-black italic uppercase italic tracking-tighter leading-none">
                               {participant.users?.name}
                            </h2>
                            <p className="text-[10px] uppercase font-black opacity-40 tracking-widest">{participant.users?.roll_number}</p>
                         </div>
                         <div className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center">
                            <CheckCircle2 size={24} />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 border-y border-white/5 py-8">
                         <div className="space-y-4">
                            <div className="flex items-center gap-3 opacity-40">
                               <Calendar size={14} />
                               <span className="text-[10px] uppercase font-black tracking-widest">Target Event</span>
                            </div>
                            <p className="font-bold text-sm uppercase italic line-clamp-1">{participant.events?.title}</p>
                         </div>
                         <div className="space-y-4">
                            <div className="flex items-center gap-3 opacity-40">
                               <Sparkles size={14} />
                               <span className="text-[10px] uppercase font-black tracking-widest">Node ID</span>
                            </div>
                            <p className="font-bold text-[10px] font-mono opacity-60 truncate">{participant.id}</p>
                         </div>
                      </div>

                      {participant.form_data?.checked_in ? (
                        <div className={`p-6 rounded-3xl border flex items-center justify-center gap-4 ${
                          darkMode ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-red-50 border-red-200 text-red-600'
                        }`}>
                           <XCircle size={28} />
                           <div>
                              <h3 className="font-black uppercase tracking-widest text-lg">Already Scanned</h3>
                              <p className="text-[10px] uppercase font-bold opacity-60">Entry timestamp: {new Date(participant.form_data.checked_in_at).toLocaleTimeString()}</p>
                           </div>
                        </div>
                      ) : null}

                      <div className="flex gap-4">
                         {!participant.form_data?.checked_in && (
                           <button 
                             onClick={handleCheckIn}
                             className={`flex-1 py-6 rounded-3xl font-black uppercase text-sm tracking-widest transition-all hover:scale-105 active:scale-95 ${
                               darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-black text-white shadow-xl shadow-blue-500/20'
                             }`}
                           >
                              Confirm Entry
                           </button>
                         )}
                         <button 
                           onClick={handleReset}
                           className={`p-6 rounded-3xl border transition-all hover:bg-red-500 hover:text-white ${
                             darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-100 border-gray-200 text-black'
                           } ${participant.form_data?.checked_in ? 'flex-1' : ''}`}
                         >
                            <RefreshCw size={24} className={participant.form_data?.checked_in ? "mx-auto" : ""} />
                         </button>
                      </div>
                   </div>
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-16 text-center rounded-[48px] border flex flex-col items-center gap-8 ${
                    darkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'
                  }`}
                >
                   <XCircle className="text-red-500" size={64} />
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic text-red-500">System Lock</h3>
                        <p className="text-xs uppercase font-black tracking-widest opacity-40">Operational Failure Detected</p>
                      </div>
                      <p className="text-sm font-medium italic opacity-60 leading-relaxed max-w-xs">{error}</p>
                   </div>
                   <button 
                     onClick={handleReset}
                     className="px-10 py-4 rounded-2xl bg-red-500 text-white font-bold uppercase text-xs tracking-widest"
                   >
                     Reset Terminal
                   </button>
                </motion.div>
              ) : (
                <div className={`p-20 text-center rounded-[48px] border border-dashed transition-all group ${
                  darkMode ? 'bg-white/5 border-white/10 text-gray-600 hover:border-primary/30' : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}>
                   <Scan size={64} className="mx-auto mb-8 opacity-10 group-hover:scale-110 transition-transform" />
                   <div className="space-y-4">
                      <h3 className="text-xl font-black italic uppercase italic tracking-tighter">Awaiting Signal</h3>
                      <p className="text-xs uppercase font-black tracking-widest opacity-40 max-w-[200px] mx-auto leading-relaxed">Place the passport in range of the scanner to begin the handshake.</p>
                   </div>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Scanner
