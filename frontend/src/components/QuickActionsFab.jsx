import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* ══════════════════════════════════════════════
   QUICK ACTIONS FAB
   - Floating "+" button for quick actions
   - Expands to show action options
   - Smooth Framer Motion animations
══════════════════════════════════════════════ */

const ACTIONS = [
  { emoji: '🗣️', label: 'Inglés',     route: '/english',      color: '#58cc02' },
  { emoji: '🎵', label: 'Música',     route: '/music',        color: '#ff6b9d' },
  { emoji: '🔢', label: 'Matemáticas',route: '/math',         color: '#00b894' },
  { emoji: '♟️', label: 'Ajedrez',    route: '/chess',        color: '#fdcb6e' },
  { emoji: '✋', label: 'Señas',      route: '/signlanguage', color: '#00f2ff' },
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
                backdropFilter: 'blur(4px)',
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
                  gap: '10px',
                  padding: '10px 18px 10px 14px',
                  background: 'linear-gradient(135deg, rgba(20,20,50,0.95), rgba(15,15,35,0.95))',
                  border: `1px solid ${action.color}40`,
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  color: action.color,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 15px ${action.color}15`,
                  backdropFilter: 'blur(12px)',
                  whiteSpace: 'nowrap',
                }}
                whileHover={{ scale: 1.06, x: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <span style={{ fontSize: '1.3rem' }}>{action.emoji}</span>
                {action.label}
              </motion.button>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        style={{
          width: '60px', height: '60px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          color: '#fff',
          background: 'linear-gradient(135deg, #58cc02, #45a300)',
          boxShadow: '0 6px 0 #3d8f00, 0 8px 30px rgba(88,204,2,0.3)',
          fontWeight: 900,
          fontFamily: "'Nunito', sans-serif",
          position: 'relative',
          zIndex: 1,
        }}
      >
        {open ? '✕' : '⚡'}
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
              right: '72px',
              bottom: '16px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(15,15,35,0.9)',
              border: '1px solid rgba(88,204,2,0.2)',
              backdropFilter: 'blur(12px)',
              color: '#58cc02',
              fontSize: '0.75rem',
              fontWeight: 800,
              fontFamily: "'Nunito', sans-serif",
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
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
