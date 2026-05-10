import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './AppDashboard.css';

// ── Course Modules (lazy-ish imports) ──
import EnglishModule from './EnglishModule';
import MusicModule from './MusicModule';
import MathModule from './MathModule';
import ChessModule from './ChessModule';
import SignLanguageModule from './SignLanguageModule';

// ── Course Registry ──
const COURSES = {
  english:      { id: 'english',      name: 'Inglés',       emoji: '🇺🇸', color: '#3b82f6',  desc: 'Domina el idioma más hablado del mundo con lecciones interactivas y ejercicios prácticos.' },
  chess:        { id: 'chess',        name: 'Ajedrez',      emoji: '♟️',  color: '#f59e0b',  desc: 'Desarrolla tu pensamiento estratégico con partidas, puzzles y teoría de aperturas.' },
  music:        { id: 'music',        name: 'Música',       emoji: '🎹',  color: '#ec4899',  desc: 'Aprende a leer partituras y tocar canciones con nuestro piano digital interactivo.' },
  signlanguage: { id: 'signlanguage', name: 'Señas',        emoji: '🤟',  color: '#10b981',  desc: 'Comunícate con tus manos usando nuestra IA de detección en tiempo real.' },
  math:         { id: 'math',         name: 'Matemáticas',  emoji: '📐',  color: '#8b5cf6',  desc: 'Fortalece tus bases matemáticas con ejercicios graduales y mini-juegos.' },
};

const LEVELS = {
  beginner:     { id: 'beginner',     name: 'Principiante', emoji: '🌱' },
  intermediate: { id: 'intermediate', name: 'Intermedio',   emoji: '🔥' },
  advanced:     { id: 'advanced',     name: 'Avanzado',     emoji: '👑' },
};

const MODULE_MAP = {
  english:      EnglishModule,
  chess:        ChessModule,
  music:        MusicModule,
  signlanguage: SignLanguageModule,
  math:         MathModule,
};

// ── Helpers ──
const getUserCourses = (email) => {
  try { return JSON.parse(localStorage.getItem(`vento_courses_${email}`) || '[]'); }
  catch { return []; }
};

const getActiveCourse = (email) => {
  return localStorage.getItem(`vento_active_course_${email}`) || null;
};

const setActiveCourse = (email, courseId) => {
  localStorage.setItem(`vento_active_course_${email}`, courseId);
};

const addCourseToUser = (email, courseId, level) => {
  const courses = getUserCourses(email);
  const filtered = courses.filter(c => c.courseId !== courseId);
  filtered.push({ courseId, level, addedAt: Date.now() });
  localStorage.setItem(`vento_courses_${email}`, JSON.stringify(filtered));
  localStorage.setItem(`vento_${courseId}_placement`, level);
  setActiveCourse(email, courseId);
};

// ═══════════════════════════════════════════════════════════════
// COURSE SWITCHER MODAL
// ═══════════════════════════════════════════════════════════════
const CourseSwitcher = ({ isOpen, onClose, userCourses, activeCourseId, onSwitch, onAddCourse }) => {
  const [addingNew, setAddingNew] = useState(false);
  const [newCourseId, setNewCourseId] = useState(null);
  const [newLevel, setNewLevel] = useState(null);

  const availableCourses = Object.values(COURSES).filter(
    c => !userCourses.some(uc => uc.courseId === c.id)
  );

  const handleConfirmAdd = () => {
    if (newCourseId && newLevel) {
      onAddCourse(newCourseId, newLevel);
      setAddingNew(false);
      setNewCourseId(null);
      setNewLevel(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="cd-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="cd-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="cd-modal-header">
            <h2 className="cd-modal-title">📚 Mis Cursos</h2>
            <button className="cd-modal-close" onClick={onClose}>✕</button>
          </div>

          {!addingNew ? (
            <>
              {/* Existing courses */}
              <div className="cd-modal-section">
                <p className="cd-modal-section-title">Cursos activos</p>
                {userCourses.map(uc => {
                  const course = COURSES[uc.courseId];
                  const level = LEVELS[uc.level];
                  if (!course) return null;
                  return (
                    <div
                      key={uc.courseId}
                      className={`cd-course-item ${uc.courseId === activeCourseId ? 'active' : ''}`}
                      onClick={() => { onSwitch(uc.courseId); onClose(); }}
                    >
                      <div
                        className="cd-course-item-icon"
                        style={{ background: `${course.color}15`, border: `2px solid ${course.color}30` }}
                      >
                        {course.emoji}
                      </div>
                      <div className="cd-course-item-info">
                        <div className="cd-course-item-name">{course.name}</div>
                        <div className="cd-course-item-level">{level?.emoji} {level?.name}</div>
                      </div>
                      {uc.courseId === activeCourseId && (
                        <span className="cd-course-item-check">✓</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add new course */}
              {availableCourses.length > 0 && (
                <div className="cd-modal-section">
                  <button className="cd-add-course-btn" onClick={() => setAddingNew(true)}>
                    + Añadir nuevo curso
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Step 1: Choose course */}
              <div className="cd-modal-section">
                <p className="cd-modal-section-title">Elige un curso</p>
                <div className="cd-new-courses-grid">
                  {availableCourses.map(c => (
                    <div
                      key={c.id}
                      className={`cd-new-course-card ${newCourseId === c.id ? 'selected' : ''}`}
                      onClick={() => setNewCourseId(c.id)}
                    >
                      <span className="cd-new-course-emoji">{c.emoji}</span>
                      <span className="cd-new-course-name">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Choose level */}
              {newCourseId && (
                <div className="cd-modal-section">
                  <p className="cd-modal-section-title">Elige tu nivel</p>
                  <div className="cd-level-options">
                    {Object.values(LEVELS).map(l => (
                      <div
                        key={l.id}
                        className={`cd-level-option ${newLevel === l.id ? 'selected' : ''}`}
                        onClick={() => setNewLevel(l.id)}
                      >
                        <span className="cd-level-option-emoji">{l.emoji}</span>
                        <div>
                          <div className="cd-level-option-name">{l.name}</div>
                          <div className="cd-level-option-desc">
                            {l.id === 'beginner' ? 'Empezar desde cero' :
                             l.id === 'intermediate' ? 'Ya conozco lo básico' : 'Tengo buen nivel'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="cd-modal-footer">
                <button
                  className="cd-confirm-btn"
                  disabled={!newCourseId || !newLevel}
                  onClick={handleConfirmAdd}
                >
                  Comenzar curso
                </button>
                <button
                  className="cd-logout-btn"
                  style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.04)', color: '#7c3aed' }}
                  onClick={() => { setAddingNew(false); setNewCourseId(null); setNewLevel(null); }}
                >
                  ← Volver
                </button>
              </div>
            </>
          )}

          {!addingNew && (
            <div className="cd-modal-footer">
              <button className="cd-logout-btn" onClick={() => { onClose(); }}>
                Cerrar
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════
const AppDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const email = user?.email || '';

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('vento-theme') || 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vento-theme', theme);
  }, [theme]);

  // Course state
  const [userCourses, setUserCourses] = useState(() => getUserCourses(email));
  const [activeCourseId, setActiveCourseId] = useState(() => getActiveCourse(email));
  const [showSwitcher, setShowSwitcher] = useState(false);

  // If no courses, redirect to onboarding
  useEffect(() => {
    if (userCourses.length === 0) {
      navigate('/welcome');
    }
  }, [userCourses, navigate]);

  // Active course data
  const activeCourse = COURSES[activeCourseId];
  const activeUserCourse = userCourses.find(c => c.courseId === activeCourseId);
  const activeLevel = LEVELS[activeUserCourse?.level] || LEVELS.beginner;

  // Progress data from auth context
  const progress = user?.progress?.[activeCourseId] || {};
  const xp = progress.xp || 0;
  const streak = progress.streak || 0;
  const courseLevel = progress.level || 1;

  // Get the module component
  const ModuleComponent = MODULE_MAP[activeCourseId];

  // Handlers
  const handleSwitchCourse = (courseId) => {
    setActiveCourse(email, courseId);
    setActiveCourseId(courseId);
  };

  const handleAddCourse = (courseId, level) => {
    addCourseToUser(email, courseId, level);
    setUserCourses(getUserCourses(email));
    setActiveCourseId(courseId);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const firstName = user?.name?.split(' ')[0] || 'Estudiante';

  if (!activeCourse) return null;

  return (
    <div className="cd-root" style={{ '--course-color': activeCourse.color }}>
      {/* Background */}
      <div className="cd-bg">
        <div className="cd-bg-orb cd-bg-orb1" />
        <div className="cd-bg-orb cd-bg-orb2" />
        <div className="cd-bg-orb cd-bg-orb3" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="cd-topbar">
        <div className="cd-topbar-left">
          <span className="cd-logo">VentoEdu</span>
          <button className="cd-course-pill" onClick={() => setShowSwitcher(true)}>
            <span className="cd-course-pill-emoji">{activeCourse.emoji}</span>
            <span>{activeCourse.name}</span>
            <span className="cd-course-pill-level">{activeLevel.emoji} {activeLevel.name}</span>
          </button>
        </div>
        <div className="cd-topbar-right">
          <button className="cd-topbar-btn" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="cd-topbar-btn" onClick={() => setShowSwitcher(true)}>
            📚
          </button>
          <div className="cd-user-avatar" onClick={handleLogout} title="Cerrar sesión">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="cd-main">
        {/* Hero header */}
        <div className="cd-hero">
          <div className="cd-hero-left">
            <div className="cd-hero-greeting">
              {activeCourse.emoji} {activeCourse.name} · {activeLevel.name}
            </div>
            <h1 className="cd-hero-title">
              ¡Hola, <span>{firstName}</span>!
            </h1>
            <p className="cd-hero-desc">{activeCourse.desc}</p>
            <div className="cd-hero-stats">
              <span className="cd-stat-chip cd-stat-xp">⚡ {xp} XP</span>
              <span className="cd-stat-chip cd-stat-streak">🔥 Racha {streak}</span>
              <span className="cd-stat-chip cd-stat-level">{activeLevel.emoji} Nivel {courseLevel}</span>
            </div>
          </div>
          <div className="cd-hero-right">
            <div className="cd-progress-ring-wrap">
              <svg viewBox="0 0 140 140">
                <circle className="cd-ring-bg" cx="70" cy="70" r="60" />
                <circle
                  className="cd-ring-fill"
                  cx="70" cy="70" r="60"
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 - (2 * Math.PI * 60 * Math.min(xp % 100, 100)) / 100}
                />
              </svg>
              <div className="cd-ring-inner">
                <span className="cd-ring-pct">{courseLevel}</span>
                <span className="cd-ring-label">NIVEL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Module */}
        <div className="cd-module-wrap">
          {ModuleComponent && <ModuleComponent level={activeUserCourse?.level} />}
        </div>
      </main>

      {/* Course Switcher Modal */}
      <CourseSwitcher
        isOpen={showSwitcher}
        onClose={() => setShowSwitcher(false)}
        userCourses={userCourses}
        activeCourseId={activeCourseId}
        onSwitch={handleSwitchCourse}
        onAddCourse={handleAddCourse}
      />
    </div>
  );
};

export default AppDashboard;
