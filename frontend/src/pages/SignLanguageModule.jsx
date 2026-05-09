// src/pages/SignLanguageModule.jsx
// Módulo de Lenguaje de Señas — conserva el diseño original VentoSign
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDetector } from '../hooks/useDetector.js';
import { LETRA_ES } from '../detectorLogica.js';
import './SignLanguageModule.css';
import './AppDashboard.css';

// ── Constantes ───────────────────────────────────────────────
const MAX_HISTORY   = 30;
const STABLE_FRAMES = 5;
const CONFIRM_FRAMES = 40;

const GUIDE = {
  "A": { hint: "Haz un puño. El pulgar descansa al costado del índice.", fingers: ["✊ pulgar al lado"] },
  "B": { hint: "Abre los 4 dedos juntos hacia arriba. El pulgar cruzado sobre la palma.", fingers: ["todos arriba", "pulgar cruzado"] },
  "C": { hint: "Curva todos los dedos como si agarraras un vaso. Forma de 'C'.", fingers: ["todos curvados", "espacio frontal"] },
  "D": { hint: "Sube solo el índice. El pulgar toca el medio y el anular formando un círculo.", fingers: ["índice arriba", "círculo con pulgar"] },
  "E": { hint: "Dobla todos los dedos muy hacia adentro, puntas sobre la palma.", fingers: ["todos muy doblados"] },
  "F": { hint: "Toca el pulgar con el índice formando un círculo. Los otros 3 dedos arriba.", fingers: ["pulgar+índice = círculo", "medio/anular/meñique arriba"] },
  "G": { hint: "El índice y el pulgar apuntan hacia un lado, como una pistola horizontal.", fingers: ["índice horizontal", "pulgar paralelo"] },
  "H": { hint: "El índice y el medio apuntan juntos hacia un lado.", fingers: ["2 dedos horizontales"] },
  "I": { hint: "Solo sube el meñique. El resto permanece cerrado.", fingers: ["solo meñique arriba"] },
  "K": { hint: "Índice y medio arriba. El pulgar toca el lado del medio.", fingers: ["índice y medio arriba", "pulgar al medio"] },
  "L": { hint: "El índice apunta hacia arriba y el pulgar apunta hacia afuera. Forma de 'L'.", fingers: ["índice arriba", "pulgar lateral"] },
  "M": { hint: "Dobla índice, medio y anular sobre el pulgar.", fingers: ["3 dedos sobre pulgar"] },
  "N": { hint: "Dobla índice y medio sobre el pulgar.", fingers: ["2 dedos sobre pulgar"] },
  "O": { hint: "Junta el pulgar con el índice y curva todos los dedos formando un círculo.", fingers: ["todos curvados", "pulgar toca índice"] },
  "P": { hint: "Como la K pero inclina la mano hacia abajo.", fingers: ["como K", "pero hacia abajo"] },
  "Q": { hint: "Índice y pulgar apuntando hacia abajo, como una G inclinada.", fingers: ["índice hacia abajo", "pulgar paralelo"] },
  "R": { hint: "Sube el índice y el medio y crúzalos uno sobre el otro.", fingers: ["índice y medio cruzados"] },
  "S": { hint: "Haz un puño y cruza el pulgar por encima de los dedos cerrados.", fingers: ["puño", "pulgar encima"] },
  "T": { hint: "El pulgar asoma entre el índice y el medio, todos los dedos cerrados.", fingers: ["puño", "pulgar entre índice y medio"] },
  "U": { hint: "Sube el índice y el medio juntos, pegados.", fingers: ["índice y medio juntos arriba"] },
  "V": { hint: "Sube el índice y el medio separados formando una 'V'.", fingers: ["índice y medio separados"] },
  "W": { hint: "Sube el índice, el medio y el anular.", fingers: ["3 dedos arriba"] },
  "X": { hint: "El índice forma un gancho (dobla solo la punta).", fingers: ["índice en gancho"] },
  "Y": { hint: "El pulgar y el meñique extendidos hacia afuera. Shaka 🤙", fingers: ["pulgar + meñique afuera"] },
};

const LESSON_LETTERS = {
  vocales: ["A", "E", "I", "O", "U"],
  abc:     ["A","B","C","D","E","F","G","H","I","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y"],
};

// ── Pantalla de inicio (Course Dashboard) ───────────
const SignHome = ({ onSelect, onBack }) => {
  const { user } = useAuth();
  
  // Extraer datos de progreso de Sign Language
  const prog = user?.progress?.signlanguage || {};
  const completedVocales = prog.completedVocales || [];
  const completedAbc = prog.completedAbc || [];
  const uniqueCompleted = new Set([...completedVocales, ...completedAbc]).size;
  const totalLetters = 29; // 5 vocales + 24 ABC
  const progressPct = Math.round((uniqueCompleted / totalLetters) * 100) || 0;
  const xp = prog.xp || 0;
  const streak = prog.streak || 0;

  const MODES = [
    {
      id: "detect", icon: "🤖",
      title: "Detector Libre",
      desc: "Muestra cualquier seña frente a la cámara y el sistema la identifica en tiempo real con IA.",
      color: "var(--cyan)", badge: "IA · EN VIVO",
      actionText: "Iniciar Cámara",
      iconColor: "#00f2ff"
    },
    {
      id: "vocales", icon: "🅰️",
      title: "Aprende las Vocales",
      desc: "Domina las 5 vocales básicas con retroalimentación inmediata y gana XP.",
      color: "var(--purple)", badge: "BÁSICO · 5 LETRAS",
      actionText: "Iniciar Lección",
      iconColor: "#ce82ff"
    },
    {
      id: "abc", icon: "📚",
      title: "El Abecedario",
      desc: "Recorre todo el alfabeto del lenguaje de señas a tu propio ritmo.",
      color: "var(--green)", badge: "COMPLETO · 24 LETRAS",
      actionText: "Comenzar Ruta",
      iconColor: "#2ed573"
    },
  ];

  return (
    <div className="sl-home">
      <div className="sl-bg-orbs">
        <div className="sl-orb sl-orb1" /><div className="sl-orb sl-orb2" /><div className="sl-orb sl-orb3" />
        <div className="pro-grid-overlay" style={{ opacity: 0.3 }} />
      </div>
      
      <div className="sl-home-inner" style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
        
        {/* Topbar back button */}
        <header style={{ marginBottom: '2rem' }}>
          <button className="sl-back-btn" onClick={onBack}>← Volver al Inicio</button>
        </header>

        {/* Hero HUD para el Curso */}
        <div className="pro-dashboard-hero" style={{ marginBottom: '4rem' }}>
          <div className="pdh-top-row" style={{ padding: '3rem', borderRadius: '32px', background: 'var(--bg-card-glass)' }}>
            
            <div className="pdh-greeting-col" style={{ gap: '0.5rem' }}>
              <div className="pdh-time-badge" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
                🤟 Módulo Interactivo
              </div>
              <h1 className="pdh-title" style={{ fontSize: '3rem', marginBottom: '0' }}>Lenguaje de <span>Señas</span></h1>
              <p className="pdh-subtitle" style={{ fontSize: '1.2rem', maxWidth: '600px', marginTop: '0.5rem' }}>
                Aprende a comunicarte con tus manos usando nuestra <strong>IA de detección en tiempo real</strong>. Supera los niveles y conviértete en un experto.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <div className="pdh-motivational-badge" style={{ background: 'rgba(0, 242, 255, 0.1)', borderColor: 'rgba(0, 242, 255, 0.3)', color: '#00f2ff' }}>
                  ⚡ {xp} XP en este curso
                </div>
                <div className="pdh-motivational-badge" style={{ background: 'rgba(255, 71, 87, 0.1)', borderColor: 'rgba(255, 71, 87, 0.3)', color: '#ff4757' }}>
                  🔥 Racha de {streak}
                </div>
              </div>
            </div>

            {/* Progress Ring del Curso */}
            <div className="pdh-level-col">
              <div className="pdh-level-ring-container" style={{ width: '160px', height: '160px' }}>
                <svg className="pdh-ring-svg" width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle cx="80" cy="80" r="70" fill="none" stroke="var(--cyan)" strokeWidth="12" 
                    strokeDasharray="439.8" 
                    strokeDashoffset={439.8 - (439.8 * progressPct) / 100} 
                    strokeLinecap="round" transform="rotate(-90 80 80)" 
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="pdh-level-inner">
                  <span className="pdh-lvl-num" style={{ fontSize: '2.5rem' }}>{progressPct}%</span>
                  <span className="pdh-lvl-label">COMPLETADO</span>
                </div>
              </div>
              <div className="pdh-xp-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
                {uniqueCompleted} / {totalLetters} Letras
              </div>
            </div>

          </div>
        </div>

        {/* Modules Grid */}
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '2rem', color: '#fff', letterSpacing: '-0.02em' }}>
          Misiones Disponibles
        </h2>

        <div className="courses-grid-neon">
          {MODES.map(mode => (
            <div
              key={mode.id}
              className="course-card-neon"
              style={{ '--cc': mode.color, '--ccrgb': mode.iconColor === '#00f2ff' ? '0, 242, 255' : mode.iconColor === '#ce82ff' ? '206, 130, 255' : '46, 213, 115' }}
              onClick={() => onSelect(mode.id)}
            >
              <div className="ccn-glow-bg"></div>
              
              <div className="ccn-top">
                <div className="ccn-icon-wrap">
                  <div className="ccn-icon-ring"></div>
                  <span className="ccn-emoji">{mode.icon}</span>
                </div>
                <span className="ccn-difficulty" style={{ background: `color-mix(in srgb, ${mode.iconColor} 15%, transparent)`, color: mode.iconColor, borderColor: `color-mix(in srgb, ${mode.iconColor} 30%, transparent)` }}>
                  {mode.badge}
                </span>
              </div>

              <div className="ccn-content">
                <h3 className="ccn-name">{mode.title}</h3>
                <p className="ccn-desc">{mode.desc}</p>
              </div>

              <div className="ccn-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: mode.iconColor }}>{mode.actionText}</span>
                <button className="ccn-play-btn" style={{ background: mode.iconColor, width: '40px', height: '40px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

// ── Detector libre ───────────────────────────────────────────
const SignDetector = ({ onBack }) => {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const bufferRef = useRef({ val: null, count: 0 });

  const [letra,       setLetra]       = useState("—");
  const [confidence,  setConfidence]  = useState(0);
  const [history,     setHistory]     = useState([]);
  const [handVisible, setHandVisible] = useState(false);

  const handleResult = useCallback(({ letter, confidence: conf, hasHand }) => {
    setHandVisible(hasHand);
    const buf = bufferRef.current;
    if (letter === buf.val) {
      buf.count++;
      if (buf.count === STABLE_FRAMES) {
        setLetra(letter);
        setConfidence(conf);
        if (letter !== "—") {
          setHistory(prev => {
            const next = [...prev, letter];
            return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
          });
        }
      }
    } else {
      buf.val   = letter;
      buf.count = 1;
    }
  }, []);

  const { status, msg } = useDetector({ videoRef, canvasRef, onResult: handleResult });
  const isLoaded   = status === "ready";
  const isError    = status === "error";
  const traduccion = LETRA_ES[letra] || "";

  return (
    <div className="sl-detector">
      <div className="sl-bg-orbs">
        <div className="sl-orb sl-orb1" /><div className="sl-orb sl-orb2" /><div className="sl-orb sl-orb3" />
      </div>
      <div className="sl-layout">
        <header className="sl-header">
          <div className="sl-header-left">
            <button className="sl-back-btn" onClick={onBack}>← Inicio</button>
            <span className="sl-header-emoji">🤖</span>
            <h1 className="sl-header-title">Detector<span className="sl-brand-accent"> Libre</span></h1>
          </div>
          <div className={`sl-status-pill ${isLoaded ? "online" : isError ? "error" : "loading"}`}>
            <span className="sl-status-dot" />
            <span>{isLoaded ? "🧠 KNN Activo" : isError ? "Error" : msg}</span>
          </div>
        </header>

        <main className="sl-main-grid">
          <div className="sl-camera-section">
            <div className={`sl-vision-box ${handVisible ? "hand-on" : ""}`}>
              {!isLoaded && !isError && (
                <div className="sl-overlay"><div className="sl-spinner" /><p>{msg}</p></div>
              )}
              {isError && (
                <div className="sl-overlay"><span className="sl-err-icon">⚠️</span><p>{msg}</p></div>
              )}
              <video ref={videoRef} autoPlay playsInline muted className="sl-webcam" />
              <canvas ref={canvasRef} className="sl-canvas" />
              <div className="sl-corners">
                <div className="slc tl" /><div className="slc tr" />
                <div className="slc bl" /><div className="slc br" />
              </div>
              <div className="sl-live"><span className="sl-live-dot" />LIVE</div>
            </div>
          </div>

          <div className="sl-side-panel">
            <div className="sl-card sl-card-result">
              <p className="sl-card-label">Seña Detectada</p>
              <div className={`sl-big-letter ${handVisible ? "lit" : ""}`}>{letra}</div>
              {handVisible && confidence > 0 && (
                <>
                  <div className="sl-conf-track"><div className="sl-conf-fill" style={{ width: `${confidence}%` }} /></div>
                  <span className="sl-conf-pct">{confidence}% confianza</span>
                </>
              )}
              {traduccion && <p className="sl-traduccion">{traduccion}</p>}
              <p className="sl-card-hint">{handVisible ? "Mano detectada ✓" : "Coloca tu mano frente a la cámara"}</p>
            </div>

            <div className="sl-card">
              <p className="sl-card-label">Leyenda de colores</p>
              <div className="sl-legend">
                {[
                  { color: "#ff6b6b", name: "Pulgar" },
                  { color: "#00f2ff", name: "Índice" },
                  { color: "#a855f7", name: "Medio" },
                  { color: "#22c55e", name: "Anular" },
                  { color: "#f59e0b", name: "Meñique" },
                ].map(({ color, name }) => (
                  <div key={name} className="sl-legend-row">
                    <span className="sl-legend-dot" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sl-card sl-card-history">
              <div className="sl-history-header">
                <p className="sl-card-label">Historial</p>
                <button className="sl-clear-btn" onClick={() => setHistory([])}>Limpiar</button>
              </div>
              <div className="sl-history-text">
                {history.length === 0
                  ? <span className="sl-history-empty">Las letras aparecerán aquí…</span>
                  : history.join("")}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// ── XP por letra según modo
const XP_PER_LETTER = { vocales: 15, abc: 20 };

// ── Modo Aprendizaje ─────────────────────────────────────────
const SignLearn = ({ type, onBack }) => {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const { user, updateProgress } = useAuth();

  const letters = LESSON_LETTERS[type];
  // Siempre guardamos bajo 'signlanguage' — la clave que lee el dashboard
  const MODULE_KEY = 'signlanguage';
  const completedField = type === 'vocales' ? 'completedVocales' : 'completedAbc';
  const xpPerLetter = XP_PER_LETTER[type] || 15;

  const [index,       setIndex]       = useState(0);
  const [matched,     setMatched]     = useState(false);
  const [done,        setDone]        = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [detected,    setDetected]    = useState("—");
  const [hasHand,     setHasHand]     = useState(false);
  const [totalXp,     setTotalXp]     = useState(() => user?.progress?.[MODULE_KEY]?.xp || 0);
  const [sessionXp,   setSessionXp]   = useState(0);
  const [streak,      setStreak]      = useState(() => user?.progress?.[MODULE_KEY]?.streak || 0);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [xpGained,    setXpGained]    = useState(0);
  const [completedArr,setCompletedArr]= useState(() => user?.progress?.[MODULE_KEY]?.[completedField] || []);
  const matchCountRef = useRef(0);

  const currentLetter    = letters[index];
  const guide            = GUIDE[currentLetter] || { hint: "", fingers: [] };
  const currentLetterRef = useRef(currentLetter);
  const matchedRef       = useRef(false);

  useEffect(() => { currentLetterRef.current = currentLetter; }, [currentLetter]);
  useEffect(() => { matchedRef.current = matched; }, [matched]);

  const handleResult = useCallback(({ letter, hasHand: hand }) => {
    setDetected(letter);
    setHasHand(hand);
    if (matchedRef.current) return;
    if (letter === currentLetterRef.current && hand) {
      matchCountRef.current++;
      const pct = Math.min((matchCountRef.current / CONFIRM_FRAMES) * 100, 100);
      setProgress(pct);
      if (matchCountRef.current >= CONFIRM_FRAMES) {
        setMatched(true);
        matchedRef.current = true;
        setProgress(100);
        // Award XP for this letter
        const earned = xpPerLetter;
        setXpGained(earned);
        setShowXpPopup(true);
        setTimeout(() => setShowXpPopup(false), 1500);
        setSessionXp(prev => prev + earned);
        setTotalXp(prev => prev + earned);
        setCompletedArr(prev => [...new Set([...prev, currentLetterRef.current])]);
      }
    } else {
      matchCountRef.current = Math.max(0, matchCountRef.current - 2);
      setProgress(Math.max(0, (matchCountRef.current / CONFIRM_FRAMES) * 100));
    }
  }, [xpPerLetter]);

  const { status, msg } = useDetector({ videoRef, canvasRef, onResult: handleResult });

  const next = () => {
    if (index + 1 >= letters.length) {
      // Guardar bajo 'signlanguage' — clave que el dashboard ya lee
      const newStreak = streak + 1;
      const newXp = totalXp; // ya está actualizado con la última letra
      setStreak(newStreak);
      setDone(true);
      updateProgress(MODULE_KEY, {
        xp: newXp,
        level: Math.floor(newXp / 100) + 1,
        streak: newStreak,
        [completedField]: completedArr,
        lastCompleted: new Date().toISOString(),
      });
    } else {
      setIndex(i => i + 1);
      setMatched(false); matchedRef.current = false;
      setProgress(0); matchCountRef.current = 0;
    }
  };

  const skipLetter = () => {
    if (index + 1 >= letters.length) { setDone(true); }
    else {
      setIndex(i => i + 1);
      setMatched(false); matchedRef.current = false;
      setProgress(0); matchCountRef.current = 0;
    }
  };

  const restart = () => {
    setIndex(0); setMatched(false); matchedRef.current = false;
    setDone(false); setProgress(0); matchCountRef.current = 0;
    setSessionXp(0);
  };

  const title = type === "vocales" ? "Aprende las Vocales" : "Aprende el Abecedario";

  if (done) {
    return (
      <div className="sl-done-screen">
        <div className="sl-bg-orbs"><div className="sl-orb sl-orb1" /><div className="sl-orb sl-orb2" /></div>
        <div className="sl-done-inner">
          <div className="sl-done-emoji">🎉</div>
          <h1 className="sl-done-title">¡Completado!</h1>
          <p className="sl-done-sub">
            Terminaste {type === "vocales" ? "las 5 vocales" : "las 24 letras del abecedario"}. ¡Excelente trabajo!
          </p>
          {/* Stats de sesión */}
          <div className="sl-done-stats">
            <div className="sl-done-stat">
              <span className="sl-done-stat-val sl-stat-xp">+{sessionXp}</span>
              <span className="sl-done-stat-lbl">XP Ganado</span>
            </div>
            <div className="sl-done-stat">
              <span className="sl-done-stat-val sl-stat-streak">🔥 {streak}</span>
              <span className="sl-done-stat-lbl">Racha</span>
            </div>
            <div className="sl-done-stat">
              <span className="sl-done-stat-val sl-stat-total">⚡ {totalXp}</span>
              <span className="sl-done-stat-lbl">XP Total</span>
            </div>
          </div>
          <div className="sl-done-chips">
            {letters.map(l => <span key={l} className="sl-done-chip">{l}</span>)}
          </div>
          <div className="sl-done-actions">
            <button className="sl-done-btn primary" onClick={restart}>🔄 Repetir lección</button>
            <button className="sl-done-btn secondary" onClick={onBack}>🏠 Inicio</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sl-learn">
      <div className="sl-bg-orbs"><div className="sl-orb sl-orb1" /><div className="sl-orb sl-orb2" /></div>

      {/* XP Popup */}
      {showXpPopup && (
        <div className="sl-xp-popup">
          <div className="sl-xp-popup-val">+{xpGained}</div>
          <div className="sl-xp-popup-lbl">XP</div>
        </div>
      )}

      <header className="sl-learn-header">
        <button className="sl-back-btn" onClick={onBack}>← Inicio</button>
        <h1 className="sl-learn-title">{title}</h1>
        {/* XP / Streak en header */}
        <div className="sl-learn-topstats">
          <span className="sl-topstat">⚡ {totalXp} XP</span>
          <span className="sl-topstat">🔥 {streak}</span>
        </div>
      </header>
      {/* Pill progress */}
      <div className="sl-progress-pills-wrap">
        <div className="sl-progress-pills">
          {letters.map((l, i) => (
            <div key={l} className={`sl-pp ${i < index ? "done" : i === index ? "current" : ""}`}>
              {i < index ? "✓" : l}
            </div>
          ))}
        </div>
      </div>

      <main className="sl-learn-body">
        <div className="sl-learn-cam-col">
          <div className={`sl-vision-box ${hasHand ? "hand-on" : ""} ${matched ? "matched" : ""}`}>
            {status === "loading" && (
              <div className="sl-overlay"><div className="sl-spinner" /><p>{msg}</p></div>
            )}
            <video ref={videoRef} autoPlay playsInline muted className="sl-webcam" />
            <canvas ref={canvasRef} className="sl-canvas" />
            <div className="sl-corners">
              <div className="slc tl" /><div className="slc tr" />
              <div className="slc bl" /><div className="slc br" />
            </div>
            <div className={`sl-detect-bubble ${detected === currentLetter ? "correct" : ""}`}>{detected}</div>
            {matched && (
              <div className="sl-success-overlay">
                <div className="sl-success-check">✓</div><p>¡Perfecto!</p>
              </div>
            )}
          </div>

          <div className="sl-fill-bar">
            <div className="sl-fill-inner" style={{
              width: `${progress}%`,
              background: matched ? "#22c55e" : "linear-gradient(90deg, #a855f7, #00f2ff)",
            }} />
          </div>
          <p className="sl-fill-hint">
            {matched
              ? "¡Muy bien! Haz clic en Siguiente →"
              : hasHand
                ? detected === currentLetter
                  ? `Mantén la posición… ${Math.round(progress)}%`
                  : "Ajusta tu mano para que coincida con la letra"
                : "Coloca tu mano frente a la cámara"}
          </p>
        </div>

        <div className="sl-guide-col">
          <div className="sl-card sl-guide-letter-card">
            <p className="sl-card-label">Letra a aprender</p>
            <div className="sl-guide-big-letter">{currentLetter}</div>
            <div className="sl-guide-counter">{index + 1} de {letters.length}</div>
          </div>

          <div className="sl-card">
            <p className="sl-card-label">¿Cómo hacerla?</p>
            <p className="sl-guide-hint">{guide.hint}</p>
            <div className="sl-guide-fingers">
              {guide.fingers.map((f, i) => (
                <span key={i} className="sl-finger-chip">{f}</span>
              ))}
            </div>
          </div>

          <div className="sl-guide-actions">
            <button className={`sl-next-btn ${matched ? "ready" : ""}`} onClick={next} disabled={!matched}>
              {index + 1 === letters.length ? "🎉 Finalizar" : "Siguiente →"}
            </button>
            {!matched && (
              <button className="sl-skip-btn" onClick={skipLetter}>Saltar esta letra</button>
            )}
          </div>

          <div className="sl-mini-map">
            {letters.map((l, i) => (
              <div key={l} className={`sl-mm ${i < index ? "mm-done" : i === index ? "mm-current" : "mm-pending"}`}>
                {i < index ? "✓" : l}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

// ── Componente principal ─────────────────────────────────────
const SignLanguageModule = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("home");
  const [mode,   setMode]   = useState(null);

  const handleSelect = (id) => {
    if (id === "detect") { setScreen("detect"); }
    else { setMode(id); setScreen("learn"); }
  };

  const goHome = () => setScreen("home");
  const goBack = () => navigate("/dashboard");

  if (screen === "detect") return <SignDetector onBack={goHome} />;
  if (screen === "learn")  return <SignLearn type={mode} onBack={goHome} />;
  return <SignHome onSelect={handleSelect} onBack={goBack} />;
};

export default SignLanguageModule;
