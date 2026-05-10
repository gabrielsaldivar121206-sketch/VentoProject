import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useDetector } from '../hooks/useDetector.js';
import { LETRA_ES } from '../detectorLogica.js';
import { COURSES, LEVELS, LESSONS } from './courseData';
import './CourseDashboard.css';

// ── Sign Language guide data ──
const GUIDE = {
  A:{hint:"Puño con pulgar al lado"},B:{hint:"4 dedos arriba, pulgar cruzado"},C:{hint:"Forma de C"},
  D:{hint:"Índice arriba, círculo con pulgar"},E:{hint:"Dedos doblados hacia adentro"},
  F:{hint:"Pulgar+índice=círculo, 3 dedos arriba"},G:{hint:"Índice y pulgar horizontal"},
  H:{hint:"Índice y medio horizontales"},I:{hint:"Solo meñique arriba"},
  K:{hint:"Índice y medio arriba, pulgar al medio"},L:{hint:"Índice arriba, pulgar lateral"},
  M:{hint:"3 dedos sobre pulgar"},N:{hint:"2 dedos sobre pulgar"},
  O:{hint:"Todos curvados, pulgar toca índice"},P:{hint:"Como K pero hacia abajo"},
  Q:{hint:"Índice y pulgar hacia abajo"},R:{hint:"Índice y medio cruzados"},
  S:{hint:"Puño, pulgar encima"},T:{hint:"Pulgar entre índice y medio"},
  U:{hint:"Índice y medio juntos arriba"},V:{hint:"Índice y medio separados"},
  W:{hint:"3 dedos arriba"},X:{hint:"Índice en gancho"},Y:{hint:"Pulgar+meñique afuera 🤙"},
};

const CONFIRM_FRAMES = 40;

// ── Helpers ──
const getUserCourses = (e) => { try { return JSON.parse(localStorage.getItem(`vento_courses_${e}`)||'[]'); } catch { return []; } };
const getActiveCourse = (e) => localStorage.getItem(`vento_active_course_${e}`)||null;
const setActive = (e,id) => localStorage.setItem(`vento_active_course_${e}`,id);
const addCourse = (e,id,lv) => {
  const c = getUserCourses(e).filter(x=>x.courseId!==id);
  c.push({courseId:id,level:lv,addedAt:Date.now()});
  localStorage.setItem(`vento_courses_${e}`,JSON.stringify(c));
  localStorage.setItem(`vento_${id}_placement`,lv);
  setActive(e,id);
};
const getCompleted = (e,cid) => { try { return JSON.parse(localStorage.getItem(`vento_completed_${e}_${cid}`)||'[]'); } catch { return []; } };
const markCompleted = (e,cid,lid) => {
  const c = getCompleted(e,cid);
  if (!c.includes(lid)) { c.push(lid); localStorage.setItem(`vento_completed_${e}_${cid}`,JSON.stringify(c)); }
  return c;
};

// ═══════════════════════════════════════════════════════
// SIGN LANGUAGE DETECTOR
// ═══════════════════════════════════════════════════════
const SignDetector = ({ letters, onBack, isFree }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const bufRef = useRef({ val:null, count:0 });
  const matchRef = useRef(0);
  const [letra, setLetra] = useState('—');
  const [conf, setConf] = useState(0);
  const [hand, setHand] = useState(false);
  const [idx, setIdx] = useState(0);
  const [matched, setMatched] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState([]);
  const matchedRef = useRef(false);
  const currentRef = useRef(letters?.[0]);

  useEffect(() => { if(letters) currentRef.current = letters[idx]; }, [idx, letters]);

  const handleResult = useCallback(({letter, confidence:c, hasHand}) => {
    setHand(hasHand);
    const b = bufRef.current;
    if (letter === b.val) { b.count++; if (b.count >= 5) { setLetra(letter); setConf(c); } }
    else { b.val = letter; b.count = 1; }

    if (isFree) {
      if (letter !== '—' && hasHand && b.count >= 5) {
        setHistory(p => { const n = [...p, letter]; return n.length > 30 ? n.slice(-30) : n; });
      }
      return;
    }
    if (matchedRef.current) return;
    if (letter === currentRef.current && hasHand) {
      matchRef.current++;
      setProgress(Math.min((matchRef.current/CONFIRM_FRAMES)*100, 100));
      if (matchRef.current >= CONFIRM_FRAMES) { setMatched(true); matchedRef.current = true; setProgress(100); }
    } else { matchRef.current = Math.max(0, matchRef.current-2); setProgress(Math.max(0,(matchRef.current/CONFIRM_FRAMES)*100)); }
  }, [isFree]);

  const { status, msg } = useDetector({ videoRef, canvasRef, onResult: handleResult });
  const target = letters?.[idx];
  const guide = GUIDE[target] || {};

  const next = () => {
    if (idx+1 >= letters.length) { onBack(); return; }
    setIdx(i=>i+1); setMatched(false); matchedRef.current=false; setProgress(0); matchRef.current=0;
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div className="cdb-cam-box">
        {status === 'loading' && <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',color:'white',zIndex:5,borderRadius:'18px'}}><p>{msg}</p></div>}
        <video ref={videoRef} autoPlay playsInline muted style={{width:'100%',height:'100%',objectFit:'cover'}} />
        <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%'}} />
        <div className="cdb-cam-live">LIVE</div>
      </div>

      {isFree ? (
        <div className="cdb-detect-result">
          <div className="cdb-detect-letter">{letra}</div>
          {conf > 0 && <div className="cdb-detect-conf">{conf}% confianza</div>}
          <p style={{fontSize:'0.85rem',color:'#888',fontWeight:600}}>{hand ? 'Mano detectada ✓' : 'Coloca tu mano frente a la cámara'}</p>
          {history.length > 0 && <p style={{fontSize:'1rem',fontWeight:700,wordBreak:'break-all',letterSpacing:'2px'}}>{history.join('')}</p>}
          <button onClick={() => setHistory([])} style={{padding:'0.4rem 1rem',borderRadius:'8px',border:'1px solid #ddd',background:'transparent',cursor:'pointer',fontSize:'0.8rem',fontWeight:700}}>Limpiar historial</button>
        </div>
      ) : (
        <div style={{textAlign:'center',marginTop:'1rem'}}>
          <p style={{fontSize:'0.8rem',color:'#888',fontWeight:700}}>{idx+1} de {letters.length}</p>
          <div className="cdb-detect-letter">{target}</div>
          <p style={{fontSize:'0.85rem',color:'#666',fontWeight:600}}>{guide.hint}</p>
          <div style={{width:'100%',maxWidth:'300px',height:'8px',borderRadius:'50px',background:'rgba(139,92,246,0.1)',margin:'1rem auto',overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:'50px',background:matched?'#10b981':'linear-gradient(90deg,#8b5cf6,#3b82f6)',width:`${progress}%`,transition:'width 0.2s'}} />
          </div>
          <p style={{fontSize:'0.82rem',fontWeight:700,color:matched?'#10b981':'#888'}}>
            {matched ? '¡Perfecto! ✓' : hand ? `Mantén... ${Math.round(progress)}%` : 'Muestra tu mano'}
          </p>
          {matched && <button className="cdb-confirm-btn" style={{maxWidth:'200px',margin:'1rem auto'}} onClick={next}>{idx+1>=letters.length?'🎉 Completar':'Siguiente →'}</button>}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// COURSE SWITCHER MODAL
// ═══════════════════════════════════════════════════════
const Switcher = ({open,onClose,uCourses,activeId,onSwitch,onAdd}) => {
  const [adding,setAdding] = useState(false);
  const [nId,setNId] = useState(null);
  const [nLv,setNLv] = useState(null);
  const avail = Object.values(COURSES).filter(c=>!uCourses.some(u=>u.courseId===c.id));
  if (!open) return null;
  return (
    <div className="cdb-modal-overlay" onClick={onClose}>
      <motion.div className="cdb-modal" initial={{opacity:0,scale:0.9,y:20}} animate={{opacity:1,scale:1,y:0}} transition={{type:'spring',stiffness:300,damping:25}} onClick={e=>e.stopPropagation()}>
        <div className="cdb-modal-head"><h2 className="cdb-modal-title">📚 Mis Cursos</h2><button className="cdb-modal-x" onClick={onClose}>✕</button></div>
        <div className="cdb-modal-body">
          {!adding ? (<>
            <p className="cdb-modal-label">Cursos activos</p>
            {uCourses.map(u=>{const c=COURSES[u.courseId],l=LEVELS[u.level]; if(!c)return null; return(
              <div key={u.courseId} className={`cdb-m-item ${u.courseId===activeId?'active':''}`} onClick={()=>{onSwitch(u.courseId);onClose();}}>
                <div className="cdb-m-icon" style={{background:`${c.color}15`,border:`2px solid ${c.color}30`}}>{c.emoji}</div>
                <div><div className="cdb-m-name">{c.name}</div><div className="cdb-m-lvl">{l?.emoji} {l?.name}</div></div>
                {u.courseId===activeId&&<span className="cdb-m-check">✓</span>}
              </div>
            );})}
            {avail.length>0&&<button className="cdb-add-btn" onClick={()=>setAdding(true)}>+ Añadir curso</button>}
            <button className="cdb-close-btn" onClick={onClose}>Cerrar</button>
          </>) : (<>
            <p className="cdb-modal-label">Elige un curso</p>
            <div className="cdb-new-grid">{avail.map(c=>(
              <div key={c.id} className={`cdb-new-card ${nId===c.id?'sel':''}`} onClick={()=>setNId(c.id)}>
                <span className="cdb-new-emoji">{c.emoji}</span><span className="cdb-new-name">{c.name}</span>
              </div>
            ))}</div>
            {nId&&<><p className="cdb-modal-label" style={{marginTop:'1rem'}}>Elige tu nivel</p>
            <div className="cdb-lvl-opts">{Object.values(LEVELS).map(l=>(
              <div key={l.id} className={`cdb-lvl-opt ${nLv===l.id?'sel':''}`} onClick={()=>setNLv(l.id)}>
                <span className="cdb-lvl-emoji">{l.emoji}</span><div><div className="cdb-lvl-name">{l.name}</div><div className="cdb-lvl-desc">{l.id==='beginner'?'Desde cero':l.id==='intermediate'?'Ya sé lo básico':'Buen nivel'}</div></div>
              </div>
            ))}</div></>}
            <button className="cdb-confirm-btn" disabled={!nId||!nLv} onClick={()=>{onAdd(nId,nLv);setAdding(false);setNId(null);setNLv(null);}}>Comenzar curso</button>
            <button className="cdb-close-btn" onClick={()=>{setAdding(false);setNId(null);setNLv(null);}}>← Volver</button>
          </>)}
        </div>
      </motion.div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════
const CourseDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const email = user?.email || '';

  const [theme, setTheme] = useState(() => localStorage.getItem('vento-theme')||'light');
  useEffect(() => { document.documentElement.setAttribute('data-theme',theme); localStorage.setItem('vento-theme',theme); }, [theme]);

  const [uCourses, setUCourses] = useState(()=>getUserCourses(email));
  const [activeId, setActiveId] = useState(()=>getActiveCourse(email));
  const [showModal, setShowModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [openLesson, setOpenLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(()=>getCompleted(email,activeId));
  const [detectorLesson, setDetectorLesson] = useState(null);

  useEffect(() => { if(uCourses.length===0) navigate('/welcome'); }, [uCourses,navigate]);
  useEffect(() => { setCompletedLessons(getCompleted(email,activeId)); setOpenLesson(null); setDetectorLesson(null); }, [activeId,email]);

  const course = COURSES[activeId];
  const uCourse = uCourses.find(c=>c.courseId===activeId);
  const level = LEVELS[uCourse?.level] || LEVELS.beginner;
  const lessons = LESSONS[activeId]?.[uCourse?.level] || [];
  const pct = lessons.length > 0 ? Math.round((completedLessons.filter(id=>lessons.some(l=>l.id===id)).length / lessons.length)*100) : 0;

  const handleSwitch = (id) => { setActive(email,id); setActiveId(id); };
  const handleAdd = (id,lv) => { addCourse(email,id,lv); setUCourses(getUserCourses(email)); setActiveId(id); };
  const handleComplete = (lid) => { const c = markCompleted(email,activeId,lid); setCompletedLessons(c); setOpenLesson(null); setDetectorLesson(null); };

  const firstName = user?.name?.split(' ')[0] || 'Estudiante';
  if (!course) return null;

  // ── Lesson Detail View ──
  if (openLesson) {
    // Generate dummy sub-lessons based on the active course
    const subLessons = [
      { id: 'theory', title: 'Teoría', desc: 'Aprende los conceptos básicos', icon: '📚' },
      { id: 'practice', title: 'Práctica', desc: 'Aplica lo aprendido', icon: activeId==='music'?'🎵':activeId==='math'?'🧮':activeId==='chess'?'♟️':'🧠' },
      { id: 'quiz', title: 'Quiz Final', desc: 'Demuestra tu conocimiento', icon: '🏆' },
    ];
    
    return (
      <div className="cdb-root" style={{'--cc':course.color}}>
        <div className="cdb-bg"><div className="cdb-orb cdb-orb1" style={{background:course.color}}/><div className="cdb-orb cdb-orb2"/><div className="cdb-orb cdb-orb3"/><div className="cdb-grid-pattern"/></div>
        <div className="cdb-main">
          <div className="cdb-lesson-view-container">
            <div className="cdb-lesson-view-header-rich">
              <h2 className="cdb-lesson-view-title">{openLesson.icon} {openLesson.title}</h2>
              <button className="cdb-lesson-back" onClick={()=>setOpenLesson(null)}>← Volver</button>
            </div>
            
            {/* The Winding Path inside the lesson view */}
            <div className="cdb-roadmap-path" style={{ marginTop: '2rem' }}>
              {subLessons.map((step, i) => {
                 const isMobile = window.innerWidth <= 650;
                 const offset = isMobile ? 0 : Math.sin(i * 1.5) * 100;
                 return (
                   <div className="cdb-node-wrapper" key={step.id} style={{ '--offset': `${offset}px` }}>
                     {i > 0 && <svg className="cdb-path-line" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M50,0 Q50,50 50,100" vectorEffect="non-scaling-stroke" /></svg>}
                     <motion.button className="cdb-lesson-node" whileHover={{scale:1.08}} whileTap={{scale:0.92}}>
                        <span className="cdb-node-icon">{step.icon}</span>
                        <div className="cdb-node-tooltip">
                          <strong>{step.title}</strong>
                          <span>{step.desc}</span>
                        </div>
                     </motion.button>
                   </div>
                 );
              })}
            </div>

            <div style={{marginTop:'2rem',textAlign:'center'}}>
              <button className="cdb-confirm-btn" style={{maxWidth:'300px'}} onClick={()=>handleComplete(openLesson.id)}>
                ✓ Completar lección (+{openLesson.xp} XP)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Sign Language Detector View ──
  if (detectorLesson) {
    return (
      <div className="cdb-root" style={{'--cc':course.color}}>
        <div className="cdb-bg"><div className="cdb-orb cdb-orb1" style={{background:course.color}}/><div className="cdb-orb cdb-orb2"/><div className="cdb-orb cdb-orb3"/><div className="cdb-grid-pattern"/></div>
        <div className="cdb-main">
          <div className="cdb-lesson-view">
            <div className="cdb-lesson-view-header">
              <h2 className="cdb-lesson-view-title">{detectorLesson.icon} {detectorLesson.title}</h2>
              <button className="cdb-lesson-back" onClick={()=>{setDetectorLesson(null); if(detectorLesson.type==='detector') handleComplete(detectorLesson.id);}}>← Volver</button>
            </div>
            <SignDetector
              letters={detectorLesson.letters}
              isFree={detectorLesson.type==='free-detector'}
              onBack={()=>{setDetectorLesson(null); handleComplete(detectorLesson.id);}}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ──
  return (
    <div className="cdb-root" style={{'--cc':course.color}}>
      <div className="cdb-bg"><div className="cdb-orb cdb-orb1" style={{background:course.color}}/><div className="cdb-orb cdb-orb2"/><div className="cdb-orb cdb-orb3"/><div className="cdb-grid-pattern"/></div>

      <nav className="cdb-header">
        <div className="cdb-header-left">
          <span className="cdb-brand">VentoEdu</span>
          <button className="cdb-course-chip" onClick={()=>setShowModal(true)}>
            <span>{course.emoji}</span><span>{course.name}</span>
            <span className="cdb-chip-lvl">{level.emoji} {level.name}</span>
          </button>
        </div>
        <div className="cdb-header-right">
          <button className="cdb-icon-btn" onClick={()=>setTheme(t=>t==='light'?'dark':'light')}>{theme==='light'?'🌙':'☀️'}</button>
          <button className="cdb-icon-btn" onClick={()=>setShowModal(true)}>📚</button>
          <div className="cdb-avatar-wrap" style={{position: 'relative'}}>
            <div className="cdb-avatar" onClick={()=>setShowProfileMenu(!showProfileMenu)}>
              {firstName.charAt(0).toUpperCase()}
            </div>
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div 
                  className="cdb-profile-dropdown"
                  initial={{opacity:0, y:10, scale:0.95}}
                  animate={{opacity:1, y:0, scale:1}}
                  exit={{opacity:0, y:10, scale:0.95}}
                >
                  <div className="cdb-pd-header">
                    <strong>{user?.name || 'Estudiante'}</strong>
                    <span>{user?.email || 'Invitado'}</span>
                  </div>
                  <div className="cdb-pd-actions">
                    <button className="cdb-pd-btn" onClick={()=>{alert('Configuración en desarrollo'); setShowProfileMenu(false);}}>⚙️ Configuración</button>
                    <button className="cdb-pd-btn cdb-pd-logout" onClick={()=>{logout();navigate('/');}}>🚪 Cerrar Sesión</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <main className="cdb-main">
        <div className="cdb-layout">
          {/* Sidebar */}
          <aside className="cdb-sidebar">
            <div className="cdb-sidebar-widget cdb-profile-widget">
              <div className="cdb-avatar-large">{firstName.charAt(0).toUpperCase()}</div>
              <h3 className="cdb-profile-name">{firstName}</h3>
              <p className="cdb-profile-role">Estudiante Estrella</p>
              <div className="cdb-profile-stats">
                <div className="cdb-p-stat"><span className="cdb-p-icon">⚡</span><div><strong>{completedLessons.length * 15}</strong><span>XP Total</span></div></div>
                <div className="cdb-p-stat"><span className="cdb-p-icon">🔥</span><div><strong>{completedLessons.length}</strong><span>Racha</span></div></div>
              </div>
            </div>

            <div className="cdb-sidebar-widget cdb-quests-widget">
              <h4 className="cdb-quests-title">🚀 Misiones de Hoy</h4>
              <div className="cdb-quest">
                <div className="cdb-quest-icon">🔥</div>
                <div className="cdb-quest-info">
                  <p>Completa 1 lección</p>
                  <div className="cdb-progress-bar"><div className="cdb-progress-fill" style={{width: completedLessons.length > 0 ? '100%' : '0%'}}></div></div>
                </div>
              </div>
              <div className="cdb-quest">
                <div className="cdb-quest-icon">⭐</div>
                <div className="cdb-quest-info">
                  <p>Gana 50 XP</p>
                  <div className="cdb-progress-bar"><div className="cdb-progress-fill" style={{width: Math.min((completedLessons.length * 15 / 50) * 100, 100) + '%'}}></div></div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content */}
          <div className="cdb-content">
        <div className="cdb-hero">
          <div className="cdb-hero-left">
            <div className="cdb-hero-badge">{course.emoji} {course.name} · {level.name}</div>
            <h1 className="cdb-hero-title">¡Hola, <span>{firstName}</span>!</h1>
            <p className="cdb-hero-desc">{course.desc}</p>
            <div className="cdb-hero-stats">
              <span className="cdb-chip cdb-chip-xp">⚡ {completedLessons.length * 15} XP</span>
              <span className="cdb-chip cdb-chip-streak">🔥 {completedLessons.length}</span>
              <span className="cdb-chip cdb-chip-level">{level.emoji} {level.name}</span>
            </div>
          </div>
          <div className="cdb-hero-right">
            <div className="cdb-ring-wrap">
              <svg viewBox="0 0 120 120"><circle className="cdb-ring-bg" cx="60" cy="60" r="50"/><circle className="cdb-ring-fill" cx="60" cy="60" r="50" strokeDasharray={2*Math.PI*50} strokeDashoffset={2*Math.PI*50-(2*Math.PI*50*pct)/100}/></svg>
              <div className="cdb-ring-inner"><span className="cdb-ring-num">{pct}%</span><span className="cdb-ring-lbl">PROGRESO</span></div>
            </div>
          </div>
        </div>

        <h2 className="cdb-section-title">📖 Lecciones — {level.name}</h2>
        <div className="cdb-roadmap">
          {lessons.map((l,i) => {
            const done = completedLessons.includes(l.id);
            return (
              <motion.div
                key={l.id}
                className={`cdb-lesson-card ${done?'completed':''}`}
                initial={{opacity:0,y:30,scale:0.9}}
                animate={{opacity:1,y:0,scale:1}}
                transition={{delay:0.08+i*0.07,type:'spring',stiffness:260,damping:20}}
                whileTap={{scale:0.95}}
                onClick={() => {
                  if (l.type==='detector'||l.type==='free-detector') setDetectorLesson(l);
                  else setOpenLesson(l);
                }}
              >
                <span className="cdb-lesson-status">{done ? '✅' : ''}</span>
                {/* 3D Circular Node inside the Card */}
                <div className={`cdb-card-3d-node ${done?'completed':''}`}>
                  <span className="cdb-node-icon">{l.icon}</span>
                </div>
                
                <div className="cdb-lesson-info">
                  <div className="cdb-lesson-name">{l.title}</div>
                  <div className="cdb-lesson-desc">{l.desc}</div>
                </div>
                <span className="cdb-lesson-xp">⭐ +{l.xp} XP</span>
              </motion.div>
            );
          })}
        </div>
          </div> {/* End Content */}
        </div> {/* End Layout */}
      </main>

      <Switcher open={showModal} onClose={()=>setShowModal(false)} uCourses={uCourses} activeId={activeId} onSwitch={handleSwitch} onAdd={handleAdd} />
    </div>
  );
};

export default CourseDashboard;
