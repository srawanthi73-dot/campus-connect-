import { motion } from 'framer-motion'
import { X, Download, Share2, Info } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

const TicketModal = ({ registration, onClose, darkMode }) => {
  if (!registration) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`w-full max-w-sm rounded-[40px] border overflow-hidden relative ${
          darkMode ? 'bg-zinc-900 border-white/10 shadow-neon' : 'bg-white border-gray-100 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header/Event Info */}
        <div className={`p-8 text-center space-y-2 border-b ${darkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
           <h3 className="text-xl font-black uppercase tracking-tight italic leading-tight">
             {registration.events?.title}
           </h3>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
             Official Entry Pass
           </p>
        </div>

        {/* QR Body */}
        <div className="p-10 flex flex-col items-center gap-8">
           <div className={`p-4 rounded-3xl bg-white ${darkMode ? 'shadow-neon' : 'shadow-xl'}`}>
             <QRCodeCanvas 
               value={`REG:${registration.id}`} 
               size={220}
               level="H"
               includeMargin={true}
             />
           </div>

           <div className="w-full space-y-6">
              <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-6">
                 <div>
                    <p className="text-[10px] uppercase font-black opacity-40 mb-1">Pass ID</p>
                    <p className="text-xs font-mono font-bold truncate">{registration.id}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] uppercase font-black opacity-40 mb-1">Date</p>
                    <p className="text-xs font-bold">{new Date(registration.events?.date).toLocaleDateString()}</p>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button 
                   className={`flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border transition-all ${
                     darkMode ? 'bg-primary text-black hover:shadow-neon' : 'bg-black text-white'
                   }`}
                   onClick={() => window.print()}
                 >
                    <Download size={14} /> Print
                 </button>
                 <button 
                   className={`p-4 rounded-2xl border transition-all ${
                     darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-gray-100 border-gray-200 text-black hover:bg-gray-200'
                   }`}
                   onClick={() => {
                     navigator.share?.({
                        title: `My Ticket for ${registration.events?.title}`,
                        text: `Check out my entry pass for ${registration.events?.title}!`,
                        url: window.location.href
                     }).catch(() => toast.error('Sharing not supported'))
                   }}
                 >
                    <Share2 size={18} />
                 </button>
              </div>
           </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all"
        >
          <X size={20} />
        </button>

        {/* Info footer */}
        <div className="p-4 bg-primary/10 flex items-center gap-2 justify-center">
           <Info size={14} className="text-primary" />
           <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Present this at the venue gate</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TicketModal
