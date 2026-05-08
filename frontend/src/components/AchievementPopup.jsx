import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ══════════════════════════════════════════════
   ACHIEVEMENT POPUP
   - Videogame-style "Achievement Unlocked!"
   - Sound effect + vibration on mobile
   - Auto-dismiss after 4 seconds
   - Golden glow animation
══════════════════════════════════════════════ */

const AchievementPopup = ({ achievement, onDismiss }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Play victory sound
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playNote = (freq, start, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };
      // Victory jingle
      playNote(523.25, 0, 0.15);    // C5
      playNote(659.25, 0.12, 0.15); // E5
      playNote(783.99, 0.24, 0.15); // G5
      playNote(1046.5, 0.36, 0.4);  // C6
    } catch { /* silent fallback */ }

    // Vibrate on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    // Auto dismiss
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(), 500);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          onClick={() => { setVisible(false); setTimeout(() => onDismiss?.(), 300); }}
          style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9998,
            cursor: 'pointer',
          }}
        >
          <div style={{
            background: 'linear-gradient(160deg, #1a1500, #2d2000, #1a1200)',
            border: '2px solid rgba(255,200,0,0.3)',
            borderRadius: '24px',
            padding: '20px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            boxShadow: '0 16px 60px rgba(255,200,0,0.15), 0 0 80px rgba(255,200,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            minWidth: '320px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Golden shimmer */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,200,0,0.05), transparent)',
              animation: 'shimmerSlide 2s ease infinite',
            }} />

            {/* Icon */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 0.6,
                delay: 0.3,
              }}
              style={{
                width: '56px', height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(255,200,0,0.2), rgba(255,150,0,0.1))',
                border: '2px solid rgba(255,200,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                flexShrink: 0,
                boxShadow: '0 0 30px rgba(255,200,0,0.2)',
              }}
            >
              {achievement.icon}
            </motion.div>

            {/* Text */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 900,
                fontFamily: "'Nunito', sans-serif",
                color: '#ffc800',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '2px',
              }}>
                🏆 ¡Logro desbloqueado!
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 900,
                fontFamily: "'Nunito', sans-serif",
                color: '#fff',
              }}>
                {achievement.title}
              </div>
              {achievement.desc && (
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  fontFamily: "'Nunito', sans-serif",
                  color: '#888',
                  marginTop: '2px',
                }}>
                  {achievement.desc}
                </div>
              )}
            </div>

            {/* Sparkle particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -30 - Math.random() * 40],
                  x: [0, (Math.random() - 0.5) * 60],
                  opacity: [1, 0],
                  scale: [0.5, 1.5],
                }}
                transition={{
                  duration: 1 + Math.random(),
                  delay: 0.3 + i * 0.1,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  top: '50%', left: '20%',
                  width: '4px', height: '4px',
                  borderRadius: '50%',
                  background: '#ffc800',
                  boxShadow: '0 0 6px #ffc800',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementPopup;
