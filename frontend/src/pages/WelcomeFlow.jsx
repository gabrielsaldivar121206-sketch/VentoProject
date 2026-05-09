import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './WelcomeFlow.css';

const COURSES = [
  { id: 'english', name: 'Inglés', iconUrl: 'https://flagcdn.com/w160/us.png', students: '55,5 M' },
  { id: 'chess', name: 'Ajedrez', emoji: '♟️', students: '8,44 M' },
  { id: 'music', name: 'Música', emoji: '🎹', students: '7,35 M' },
  { id: 'signlanguage', name: 'Señas', emoji: '🤟', students: '7,19 M' },
  { id: 'math', name: 'Matemáticas', emoji: '📐', students: '6,1 M' }
];

const LEVELS = [
  { id: 'beginner', name: 'Principiante', emoji: '🌱', desc: 'No sé nada o muy poco' },
  { id: 'intermediate', name: 'Intermedio', emoji: '🔥', desc: 'Conozco lo básico' },
  { id: 'advanced', name: 'Avanzado', emoji: '👑', desc: 'Tengo buen nivel' }
];

const WelcomeFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState('loading');
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Apply theme on mount to handle direct navigation/refreshes
  useEffect(() => {
    const savedTheme = localStorage.getItem('vento-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Step 1 → 2
  useEffect(() => {
    const t = setTimeout(() => setStep('welcome'), 2200);
    return () => clearTimeout(t);
  }, []);

  // Step 2 → 3 (welcome lasts longer)
  useEffect(() => {
    if (step === 'welcome') {
      const t = setTimeout(() => setStep('courses'), 4500);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setStep('level');
  };

  const handleLevelSelect = (level) => {
    // Here you could save the selected course and level to the user's progress
    setTimeout(() => navigate('/dashboard'), 400);
  };

  // Split welcome text into words for staggered animation
  const firstName = user?.name?.split(' ')[0] || 'Estudiante';

  return (
    <div className="wf-container">
      {/* Floating decorative particles */}
      <div className="wf-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`wf-particle wf-p${i + 1}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ═══ LOADING ═══ */}
        {step === 'loading' && (
          <motion.div
            key="loading"
            className="wf-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, exit: { duration: 0.4 } }}
          >
            <motion.div
              className="wf-loading-icon"
              animate={{
                y: [0, -12, 0],
                rotate: [0, 8, -8, 0],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              🚀
            </motion.div>
            <h2 className="wf-loading-text">
              Cargando
              <span className="dot one">.</span>
              <span className="dot two">.</span>
              <span className="dot three">.</span>
            </h2>
            <div className="wf-loading-bar-container">
              <motion.div
                className="wf-loading-bar"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* ═══ WELCOME ═══ */}
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            className="wf-welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.15, filter: 'blur(12px)' }}
            transition={{ duration: 0.6, exit: { duration: 0.5 } }}
          >
            {/* Main title — each word animates in */}
            <div className="wf-welcome-words">
              {['¡Bienvenido', 'a', 'VentoEdu!'].map((word, wi) => (
                <motion.span
                  key={wi}
                  className={`wf-word ${word === 'VentoEdu!' ? 'wf-word-brand' : ''}`}
                  initial={{ opacity: 0, y: 60, scale: 0.3, rotateX: 90 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                  transition={{
                    delay: wi * 0.25,
                    type: 'spring',
                    stiffness: 180,
                    damping: 14,
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </div>

            {/* Subtitle */}
            <motion.p
              className="wf-welcome-sub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              {firstName}, tu aventura de aprendizaje comienza ahora ✨
            </motion.p>
          </motion.div>
        )}

        {/* ═══ COURSES ═══ */}
        {step === 'courses' && (
          <motion.div
            key="courses"
            className="wf-courses"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              className="wf-main-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              Quiero aprender:
            </motion.h2>
            <div className="wf-grid">
              {COURSES.map((c, i) => (
                <motion.div
                  key={c.id}
                  className="wf-card"
                  onClick={() => handleCourseSelect(c)}
                  initial={{ opacity: 0, y: 40, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.15 + i * 0.1,
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                  }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {c.iconUrl ? (
                    <img src={c.iconUrl} alt={c.name} className="wf-course-img" />
                  ) : (
                    <span className="wf-emoji">{c.emoji}</span>
                  )}
                  <span className="wf-name">{c.name}</span>
                  <span className="wf-students">{c.students} de estudiantes</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ LEVEL ═══ */}
        {step === 'level' && (
          <motion.div
            key="level"
            className="wf-level"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <motion.h2
              className="wf-main-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              ¿Cuál es tu nivel en {selectedCourse?.name}?
            </motion.h2>
            <div className="wf-level-grid">
              {LEVELS.map((l, i) => (
                <motion.div
                  key={l.id}
                  className="wf-level-card"
                  onClick={() => handleLevelSelect(l)}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.15 + i * 0.1,
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                  }}
                  whileHover={{ scale: 1.03, y: -2, borderColor: 'var(--purple, #8e44ad)' }}
                  whileTap={{ scale: 0.98, translateY: 2, borderBottomWidth: '2px' }}
                >
                  <div className="wf-level-emoji">{l.emoji}</div>
                  <div className="wf-level-info">
                    <span className="wf-level-name">{l.name}</span>
                    <span className="wf-level-desc">{l.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.button
              className="wf-back-btn"
              onClick={() => setStep('courses')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              ← Volver a cursos
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default WelcomeFlow;
