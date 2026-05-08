import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* ══════════════════════════════════════════════
   QUICK ACTIONS FAB
   - Floating "+" button for quick actions
   - Premium VentoEdu Aesthetic (No green)
   - Smooth Framer Motion animations
══════════════════════════════════════════════ */

const ACTIONS = [
  { emoji: '🗣️', label: 'Inglés',     route: '/english',      color: '#00f2ff' },
  { emoji: '🎵', label: 'Música',     route: '/music',        color: '#ff6b9d' },
  { emoji: '🔢', label: 'Matemáticas',route: '/math',         color: '#fdcb6e' },
  { emoji: '♟️', label: 'Ajedrez',    route: '/chess',        color: '#a29bfe' },
  { emoji: '✋', label: 'Señas',      route: '/signlanguage', color: '#ce82ff' },
];

const QuickActionsFab = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (route) => {
    setOpen(false);
    navigate(route);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px', right: '30px',
      zIndex: 900,
    }}>
      {/* Action items */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(6px)',
                zIndex: -1,
              }}
            />
            {ACTIONS.map((action, i) => (
              <motion.button
                key={action.route}
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{ opacity: 1, y: -(60 * (i + 1) + 8), scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.5 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                  delay: i * 0.05,
                }}
                onClick={() => handleAction(action.route)}
                style={{
                  position: 'absolute',
                  bottom: 0, right: 0,
                  width: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px 12px 16px',
                  background: 'rgba(15, 15, 30, 0.85)',
                  border: `1px solid ${action.color}40`,
                  borderRadius: '100px',
                  cursor: 'pointer',
                  fontFamily: "var(--font), sans-serif",
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: action.color,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.05)`,
                  backdropFilter: 'blur(16px)',
                  whiteSpace: 'nowrap',
                }}
                whileHover={{ scale: 1.05, x: -5, borderColor: action.color, boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 15px ${action.color}40` }}
                whileTap={{ scale: 0.95 }}
              >
                <span style={{ fontSize: '1.4rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>{action.emoji}</span>
                {action.label}
              </motion.button>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: open ? 135 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        style={{
          width: '64px', height: '64px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          color: '#fff',
          background: 'linear-gradient(135deg, #ce82ff, #6c5ce7)',
          boxShadow: '0 8px 30px rgba(108,92,231,0.5), inset 0 2px 5px rgba(255,255,255,0.3)',
          fontWeight: 900,
          fontFamily: "var(--font), sans-serif",
          position: 'relative',
          zIndex: 1,
        }}
      >
        {open ? '+' : '⚡'}
      </motion.button>

      {/* Label */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            style={{
              position: 'absolute',
              right: '80px',
              bottom: '18px',
              padding: '8px 16px',
              borderRadius: '100px',
              background: 'rgba(20, 15, 40, 0.85)',
              border: '1px solid rgba(206, 130, 255, 0.3)',
              backdropFilter: 'blur(16px)',
              color: '#ce82ff',
              fontSize: '0.85rem',
              fontWeight: 800,
              fontFamily: "var(--font), sans-serif",
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 0 15px rgba(206, 130, 255, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Practicar hoy
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickActionsFab;
