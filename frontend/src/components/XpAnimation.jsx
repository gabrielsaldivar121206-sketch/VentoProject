import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ══════════════════════════════════════════════
   XP ANIMATION — Floating "+15 XP" counter
   - Animates upward and fades out
   - Scales on appearance
   - Supports multiple simultaneous animations
══════════════════════════════════════════════ */

let xpAnimId = 0;

export const useXpAnimation = () => {
  const [particles, setParticles] = useState([]);

  const showXpGain = useCallback((amount, x = '50%', y = '50%') => {
    const id = ++xpAnimId;
    setParticles(prev => [...prev.slice(-5), { id, amount, x, y }]);

    // Vibrate on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Auto-remove after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1500);
  }, []);

  const XpParticles = () => (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none', zIndex: 9997,
    }}>
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -60, scale: 1.2 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{
              duration: 1.2,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              left: p.x, top: p.y,
              transform: 'translateX(-50%)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '1.4rem',
              fontWeight: 900,
              color: '#ffc800',
              textShadow: '0 2px 12px rgba(255,200,0,0.5), 0 0 20px rgba(255,200,0,0.3)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>+{p.amount}</span>
            <span style={{ fontSize: '0.9rem' }}>⚡</span>
            <span style={{ fontSize: '0.85rem', color: '#ffdd44' }}>XP</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return { showXpGain, XpParticles };
};

export default useXpAnimation;
