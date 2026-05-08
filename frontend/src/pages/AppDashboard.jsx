import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { sounds } from '../hooks/useSounds';
import QuickActionsFab from '../components/QuickActionsFab';
import { useXpAnimation } from '../components/XpAnimation';
import { Sun, Moon, LogOut, Settings, LayoutGrid, Play, Heart, Flame, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import './AppDashboard.css';

/* ── MOCK DATA ── */
const COURSES = [
  { id: 'english', name: 'Inglés Premium', desc: 'Domina el idioma con gramática interactiva.', route: '/english', color: 'var(--blue)', difficulty: 'Principiante', emoji: '🇬🇧', progress: 45 },
  { id: 'music', name: 'Teoría Musical', desc: 'Aprende a leer partituras y tocar el piano.', route: '/music', color: 'var(--purple)', difficulty: 'Intermedio', emoji: '🎹', progress: 12 },
  { id: 'signlanguage', name: 'Lenguaje de Señas', desc: 'Comunícate con tus manos de manera fluida.', route: '/signlanguage', color: 'var(--cyan)', difficulty: 'Básico', emoji: '🤟', progress: 80 },
  { id: 'math', name: 'Matemáticas', desc: 'Lógica, álgebra y resolución de problemas.', route: '/math', color: 'var(--orange)', difficulty: 'Avanzado', emoji: '📐', progress: 5 },
  { id: 'chess', name: 'Ajedrez', desc: 'Aperturas, tácticas y estrategia maestra.', route: '/chess', color: 'var(--green)', difficulty: 'Intermedio', emoji: '♟️', progress: 60 }
];

const CourseCardNeon = ({ course, navigate }) => {
  const [hover, setHover] = useState(false);
  const getRGB = (varName) => {
    switch(varName) {
      case 'var(--blue)': return '9, 132, 227';
      case 'var(--purple)': return '108, 92, 231';
      case 'var(--cyan)': return '0, 206, 201';
      case 'var(--orange)': return '253, 203, 110';
      case 'var(--green)': return '0, 184, 148';
      default: return '108, 92, 231';
    }
  };

  return (
    <motion.div 
      className={`course-card-neon ${hover ? 'hov' : ''}`}
      onMouseEnter={() => { setHover(true); sounds.hover(); }}
      onMouseLeave={() => setHover(false)}
      onClick={() => { sounds.navigate(); navigate(course.route); }}
      style={{ '--cc': course.color, '--ccrgb': getRGB(course.color) }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
    >
      <div className="ccn-glow-bg"></div>
      
      <div className="ccn-top">
        <div className="ccn-icon-wrap">
          <div className="ccn-icon-ring"></div>
          <span className="ccn-emoji">{course.emoji}</span>
        </div>
        <span className="ccn-difficulty">{course.difficulty}</span>
      </div>

      <div className="ccn-content">
        <h3 className="ccn-name">{course.name}</h3>
        <p className="ccn-desc">{course.desc}</p>
      </div>

      <div className="ccn-footer">
        <div className="ccn-progress-container">
          <div className="ccn-progress-info">
            <span>Progreso</span>
            <span>{course.progress}%</span>
          </div>
          <div className="ccn-progress-bar">
            <div className="ccn-progress-fill" style={{ width: `${course.progress}%` }}></div>
          </div>
        </div>
        <button className="ccn-play-btn"><Play size={16} fill="currentColor" /></button>
      </div>
    </motion.div>
  );
};

const AppDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { XpParticles } = useXpAnimation();
  const [avatar] = useState(() => localStorage.getItem('vento_avatar') || null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => { 
    setTimeout(() => setMounted(true), 100); 
    
    // Calculate Time-based Greeting
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Buenos días');
    } else if (hour < 19) {
      setGreeting('Buenas tardes');
    } else {
      setGreeting('Buenas noches');
    }
  }, []);

  const totalXp = 1250;
  const bestStreak = 12;
  const lives = 5;
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'E';

  return (
    <div className={`pro-home-layout ${mounted ? 'mounted' : ''}`}>
      <XpParticles />
      <QuickActionsFab />

      {/* Ambient Mesh Grid */}
      <div className="pro-ambient-bg">
        <div className="pro-orb pro-orb-1"></div>
        <div className="pro-orb pro-orb-2"></div>
        <div className="pro-grid-overlay"></div>
      </div>

      {/* TOP NAVBAR */}
      <nav className="pro-home-topbar">
        <div className="pht-inner">
          <div className="pht-brand" onClick={() => sounds.click()}>
            <div className="pht-brand-icon">
              <LayoutGrid size={20} strokeWidth={2.5} />
            </div>
            <span className="pht-brand-text">Vento<span>Edu</span></span>
          </div>

          <div className="pht-actions">
            <div className="pht-stats">
              <div className="pht-stat-circle stat-lives" title="Vidas">
                <Heart size={16} fill="currentColor" /> <span>{lives}</span>
              </div>
              <div className="pht-stat-circle stat-streak" title="Racha">
                <Flame size={16} fill="currentColor" /> <span>{bestStreak}</span>
              </div>
              <div className="pht-stat-circle stat-xp" title="Experiencia">
                <Zap size={16} fill="currentColor" /> <span>{totalXp}</span>
              </div>
            </div>
            
            <button className="pht-btn" onClick={() => { sounds.click(); toggleTheme(); }} title="Cambiar Tema">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="pht-btn" onClick={() => { sounds.click(); }} title="Ajustes">
              <Settings size={18} />
            </button>
            
            <div className="pht-user" onClick={() => { sounds.navigate(); logout(); navigate('/'); }} title="Cerrar Sesión">
               {avatar ? <img src={avatar} alt="Avatar" className="pht-avatar" /> : <div className="pht-avatar">{initial}</div>}
               <span className="pht-logout-icon"><LogOut size={16} /></span>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="pro-home-content">
        
        {/* DASHBOARD HERO HUD */}
        <motion.div className="pro-dashboard-hero"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          {/* Top Row: Greeting & Level Ring */}
          <div className="pdh-top-row">
            <div className="pdh-greeting-col">
              <div className="pdh-time-badge">
                {new Date().getHours() < 12 ? '☀️' : new Date().getHours() < 19 ? '🌤️' : '🌙'} {greeting}
              </div>
              <h1 className="pdh-title">¡Hola, <span>{user?.name?.split(' ')[0] || 'estudiante'}</span>!</h1>
              <p className="pdh-subtitle">Tienes <strong>{COURSES.length} cursos</strong> disponibles hoy 🎓</p>
              <div className="pdh-motivational-badge">
                <span className="emoji">🦸‍♂️</span> ¡El conocimiento es tu superpoder!
              </div>
            </div>

            <div className="pdh-level-col">
              <div className="pdh-level-ring-container">
                <svg className="pdh-ring-svg" width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="var(--blue)" strokeWidth="8" strokeDasharray="339.29" strokeDashoffset="220" strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
                <div className="pdh-level-inner">
                  <span className="pdh-crown">👑</span>
                  <span className="pdh-lvl-num">2</span>
                  <span className="pdh-lvl-label">NIVEL</span>
                </div>
              </div>
              <div className="pdh-xp-badge">70/200 XP</div>
            </div>
          </div>

          {/* 4 Stats Cards Grid */}
          <div className="pdh-stats-grid">
            <div className="pdh-stat-card">
              <div className="pdh-sc-icon" style={{ color: '#ff9f43' }}>⚡</div>
              <div className="pdh-sc-val">{totalXp}</div>
              <div className="pdh-sc-lbl">XP TOTAL</div>
            </div>
            <div className="pdh-stat-card">
              <div className="pdh-sc-icon" style={{ color: '#ff4757' }}>🔥</div>
              <div className="pdh-sc-val">{bestStreak}</div>
              <div className="pdh-sc-lbl">MEJOR RACHA</div>
            </div>
            <div className="pdh-stat-card">
              <div className="pdh-sc-icon" style={{ color: '#2ed573' }}>📚</div>
              <div className="pdh-sc-val">2</div>
              <div className="pdh-sc-lbl">LECCIONES</div>
            </div>
            <div className="pdh-stat-card">
              <div className="pdh-sc-icon" style={{ color: '#a29bfe' }}>🎓</div>
              <div className="pdh-sc-val">{COURSES.length}</div>
              <div className="pdh-sc-lbl">CURSOS</div>
            </div>
          </div>

          {/* Daily Quest Bar */}
          <div className="pdh-daily-quest">
            <div className="pdh-dq-icon">🎯</div>
            <div className="pdh-dq-info">
              <h4>Reto Diario</h4>
              <p>Completa 3 lecciones hoy para ganar +100 XP bonus</p>
            </div>
            <div className="pdh-dq-progress">
              <span>2</span>/3
            </div>
            <div className="pdh-dq-bg-bar">
              <div className="pdh-dq-fill-bar" style={{ width: '66%' }}></div>
            </div>
          </div>

        </motion.div>

        {/* COURSES GRID */}
        <div className="courses-grid-neon" style={{ paddingBottom: '4rem' }}>
          {COURSES.map(course => (
             <CourseCardNeon key={course.id} course={course} navigate={navigate} />
          ))}
        </div>

      </main>
    </div>
  );
};

export default AppDashboard;
