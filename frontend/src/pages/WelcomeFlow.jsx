import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../hooks/useSounds';
import './WelcomeFlow.css';

const COURSES = [
  { id: 'english', name: 'Inglés', iconUrl: 'https://flagcdn.com/w160/us.png', students: '55,5 M', color: '#3b82f6' },
  { id: 'chess', name: 'Ajedrez', emoji: '♟️', students: '8,44 M', color: '#f59e0b' },
  { id: 'music', name: 'Música', emoji: '🎹', students: '7,35 M', color: '#ec4899' },
  { id: 'signlanguage', name: 'Señas', emoji: '🤟', students: '7,19 M', color: '#10b981' },
  { id: 'math', name: 'Matemáticas', emoji: '📐', students: '6,1 M', color: '#8b5cf6' }
];

const LEVELS = [
  { id: 'beginner', name: 'Principiante', emoji: '🌱', desc: 'Estoy empezando desde cero', gradient: 'linear-gradient(135deg, #34d399, #10b981)' },
  { id: 'intermediate', name: 'Intermedio', emoji: '🔥', desc: 'Ya conozco lo básico', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
  { id: 'advanced', name: 'Avanzado', emoji: '👑', desc: 'Tengo un buen nivel', gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' }
];

/* ── Floating letters for background decoration ── */
const FLOATING_CHARS = ['α', 'π', '∞', '♪', '✦', 'λ', '∑', '✧', '☆', '♫', '△', '◇'];

const WelcomeFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState('welcome');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const isNewUser = !(user?.onboardingComplete || localStorage.getItem(`vento_onboarded_${user?.email}`));

  // Read & apply the user's saved theme
  const savedTheme = localStorage.getItem('vento-theme') || 'light';
  const isDark = savedTheme === 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, [savedTheme]);



  // Returning users auto-redirect
  useEffect(() => {
    if (step === 'welcome' && !isNewUser) {
      // 5000ms for the animation to finish + 3500ms to read the welcome text
      const t = setTimeout(() => navigate('/dashboard'), 8500);
      return () => clearTimeout(t);
    }
  }, [step, isNewUser, navigate]);

  // Sound effect perfectly timed
  useEffect(() => {
    if (step === 'welcome') {
      const t = setTimeout(() => {
        try { sounds.welcomePop(); } catch (e) {}
      }, 1700); // Delayed an extra 0.4s as requested
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setStep('level');
  };

  const handleLevelSelect = (level) => {
    try {
      if (user?.email) {
        localStorage.setItem(`vento_onboarded_${user.email}`, 'true');
        
        // Save course + level
        const courseEntry = { courseId: selectedCourse.id, level: level.id, addedAt: Date.now() };
        const existing = JSON.parse(localStorage.getItem(`vento_courses_${user.email}`) || '[]');
        const filtered = existing.filter(c => c.courseId !== selectedCourse.id);
        filtered.push(courseEntry);
        localStorage.setItem(`vento_courses_${user.email}`, JSON.stringify(filtered));
        localStorage.setItem(`vento_active_course_${user.email}`, selectedCourse.id);
        // Also set the module-specific placement key so modules skip their own placement screens
        localStorage.setItem(`vento_${selectedCourse.id}_placement`, level.id);
      }
    } catch (e) {}
    setTimeout(() => navigate('/dashboard'), 500);
  };

  const firstName = user?.name?.split(' ')[0] || 'Estudiante';

  return (
    <div className="wf-container">
      {/* ── Animated background ── */}
        <div className="wf-bg-layer">
          <div className="wf-grid-pattern" />
          <div className="wf-orb wf-orb1" />
          <div className="wf-orb wf-orb2" />
          <div className="wf-orb wf-orb3" />
          <div className="wf-orb wf-orb4" />
          <div className="wf-orb wf-orb5" />
        </div>

      <div className="wf-floating-chars">
          {FLOATING_CHARS.map((ch, i) => (
            <span key={i} className={`wf-fchar wf-fc${i}`}>{ch}</span>
          ))}
        </div>

      <AnimatePresence mode="wait">

        {/* ═══════ WELCOME ═══════ */}
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            className="wf-welcome"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(16px)' }}
            transition={{ duration: 0.6, exit: { duration: 0.5 } }}
          >
            {/* ── THE INTERNAL IRIS OPEN (FLAWLESS CSS BORDER) ── */}
            <motion.div
              initial={{ borderWidth: '150vmax' }}
              animate={{ borderWidth: '0vmax' }}
              transition={{ delay: 0.4, duration: 4.0, ease: "easeInOut" }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                x: '-50%',
                y: '-50%',
                width: '300vmax',
                height: '300vmax',
                borderRadius: '50%',
                borderColor: isDark ? '#1a1a2e' : '#fef9ef',
                borderStyle: 'solid',
                boxSizing: 'border-box',
                zIndex: 99999,
                pointerEvents: 'none'
              }}
            />
            {/* Main title — each word animates in */}
            <div className="wf-welcome-words">
              {['¡Bienvenido', 'a', 'VentoEdu!'].map((word, wi) => (
                <motion.span
                  key={wi}
                  className={`wf-word ${word === 'VentoEdu!' ? 'wf-word-brand' : ''}`}
                  initial={{ opacity: 0, y: 60, scale: 0.3, rotateX: 90 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                  transition={{
                    delay: 1.7 + wi * 0.25,
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
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 + 1.4, duration: 0.8, ease: 'easeOut' }}
            >
              {isNewUser 
                ? `${firstName}, tu aventura de aprendizaje comienza ahora ✨`
                : `¿Estás listo para practicar hoy, ${firstName}? 🚀`}
            </motion.p>

            {isNewUser && (
              <motion.button
                className="wf-continue-btn"
                onClick={() => {
                  setStep('courses');
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 + 2.0, duration: 0.5, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.06, boxShadow: '0 12px 35px rgba(139, 92, 246, 0.4)' }}
                whileTap={{ scale: 0.96 }}
              >
                <span>Explorar cursos</span>
                <motion.span
                  className="wf-btn-arrow"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >→</motion.span>
              </motion.button>
            )}
          </motion.div>
        )}

        {/* ═══════ COURSES ═══════ */}
        {step === 'courses' && (
          <motion.div
            key="courses"
            className="wf-courses"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
          >
            <motion.h2
              className="wf-section-title"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              ¿Qué quieres aprender?
            </motion.h2>
            <motion.p
              className="wf-section-desc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Elige tu primer curso para comenzar
            </motion.p>

            <div className="wf-grid">
              {COURSES.map((c, i) => (
                <motion.div
                  key={c.id}
                  className="wf-card"
                  onClick={() => handleCourseSelect(c)}
                  initial={{ opacity: 0, y: 50, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.2 + i * 0.08,
                    type: 'spring',
                    stiffness: 280,
                    damping: 22,
                  }}
                  whileHover={{ y: -8, boxShadow: `0 12px 30px ${c.color}30` }}
                  whileTap={{ scale: 0.95 }}
                  style={{ '--card-accent': c.color }}
                >
                  <div className="wf-card-accent" />
                  {c.iconUrl ? (
                    <img src={c.iconUrl} alt={c.name} className="wf-course-img" />
                  ) : (
                    <span className="wf-emoji">{c.emoji}</span>
                  )}
                  <span className="wf-name">{c.name}</span>
                  <span className="wf-students">{c.students} estudiantes</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════ LEVEL ═══════ */}
        {step === 'level' && (
          <motion.div
            key="level"
            className="wf-level"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          >
            <motion.div className="wf-level-header"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="wf-level-course-badge">
                {selectedCourse?.emoji || '🌐'} {selectedCourse?.name}
              </span>
              <h2 className="wf-section-title">¿Cuál es tu nivel?</h2>
              <p className="wf-section-desc">Así podremos adaptar tu experiencia</p>
            </motion.div>

            <div className="wf-level-grid">
              {LEVELS.map((l, i) => (
                <motion.div
                  key={l.id}
                  className="wf-level-card"
                  onClick={() => handleLevelSelect(l)}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.15 + i * 0.12,
                    type: 'spring',
                    stiffness: 250,
                    damping: 22,
                  }}
                  whileHover={{ scale: 1.02, x: 8 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="wf-level-icon-wrap" style={{ background: l.gradient }}>
                    <motion.span className="wf-level-emoji"
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    >{l.emoji}</motion.span>
                  </div>
                  <div className="wf-level-info">
                    <span className="wf-level-name">{l.name}</span>
                    <span className="wf-level-desc">{l.desc}</span>
                  </div>
                  <span className="wf-level-arrow">›</span>
                </motion.div>
              ))}
            </div>

            <motion.button
              className="wf-back-btn"
              onClick={() => setStep('courses')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ x: -3 }}
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
