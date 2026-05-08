import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

/* ══════════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM
   - Colores por tipo: success, error, info, warning
   - Auto-dismiss con progress bar
   - Stacking con animación
   - Swipe para descartar (pointer events)
══════════════════════════════════════════════ */

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

let toastId = 0;

const TOAST_CONFIG = {
  success: { icon: CheckCircle2, bg: 'linear-gradient(135deg, #0d3d0d, #1a4a1a)', border: '#58cc02', color: '#a0f060', iconColor: '#58cc02' },
  error:   { icon: AlertCircle,  bg: 'linear-gradient(135deg, #3d0d0d, #4a1a1a)', border: '#ff4b4b', color: '#ff9090', iconColor: '#ff4b4b' },
  info:    { icon: Info,         bg: 'linear-gradient(135deg, #0d1d3d, #1a2a4a)', border: '#1cb0f6', color: '#90d0ff', iconColor: '#1cb0f6' },
  warning: { icon: AlertTriangle,bg: 'linear-gradient(135deg, #3d2d0d, #4a3a1a)', border: '#ff9600', color: '#ffc060', iconColor: '#ff9600' },
};

const Toast = ({ id, type = 'info', message, duration = 4000, onDismiss }) => {
  const config = TOAST_CONFIG[type] || TOAST_CONFIG.info;
  const Icon = config.icon;
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (duration <= 0) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(id);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9, x: 0 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 80) onDismiss(id); }}
      style={{
        background: config.bg,
        border: `1px solid ${config.border}40`,
        borderRadius: '16px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: config.color,
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 700,
        fontSize: '0.88rem',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${config.border}15`,
        cursor: 'grab',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        minWidth: '300px',
        maxWidth: '420px',
      }}
    >
      <Icon size={20} style={{ color: config.iconColor, flexShrink: 0 }} />
      <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
      <button
        onClick={() => onDismiss(id)}
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: 'none',
          borderRadius: '8px',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.5)',
          flexShrink: 0,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.color = '#fff'; }}
        onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.color = 'rgba(255,255,255,0.5)'; }}
      >
        <X size={14} />
      </button>
      {/* Progress bar */}
      {duration > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0,
          height: '3px',
          width: `${progress}%`,
          background: config.iconColor,
          borderRadius: '0 0 16px 16px',
          transition: 'width 0.05s linear',
          opacity: 0.6,
        }} />
      )}
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((type, message, duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev.slice(-4), { id, type, message, duration }]); // max 5 toasts
    return id;
  }, []);

  const success = useCallback((msg, dur) => toast('success', msg, dur), [toast]);
  const error   = useCallback((msg, dur) => toast('error', msg, dur), [toast]);
  const info    = useCallback((msg, dur) => toast('info', msg, dur), [toast]);
  const warning = useCallback((msg, dur) => toast('warning', msg, dur), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning, dismiss }}>
      {children}
      {/* Toast container */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}>
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: 'auto' }}>
              <Toast {...t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
