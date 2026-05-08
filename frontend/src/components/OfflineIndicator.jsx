import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

/* ══════════════════════════════════════════════
   OFFLINE INDICATOR
   - Shows bar when no internet connection
   - Auto-syncs on reconnect
   - Smooth slide animation
══════════════════════════════════════════════ */

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnect, setShowReconnect] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnect(true);
      setTimeout(() => setShowReconnect(false), 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0,
            zIndex: 10000,
            background: 'linear-gradient(135deg, #3d0d0d, #4a1a1a)',
            borderBottom: '2px solid rgba(255,75,75,0.3)',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontFamily: "'Nunito', sans-serif",
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#ff9090',
            backdropFilter: 'blur(12px)',
          }}
        >
          <WifiOff size={18} style={{ animation: 'pulse 1.5s ease infinite' }} />
          Sin conexión a internet — Los cambios se sincronizarán al reconectar
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #ff4b4b, transparent)',
            width: '100%',
            animation: 'shimmerSlide 2s linear infinite',
          }} />
        </motion.div>
      )}
      {showReconnect && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0,
            zIndex: 10000,
            background: 'linear-gradient(135deg, #0d3d0d, #1a4a1a)',
            borderBottom: '2px solid rgba(88,204,2,0.3)',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontFamily: "'Nunito', sans-serif",
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#a0f060',
          }}
        >
          <Wifi size={18} />
          ¡Conexión restaurada! Sincronizando datos… ✅
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
