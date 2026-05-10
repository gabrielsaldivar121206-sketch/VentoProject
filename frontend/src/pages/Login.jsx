import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, AlertCircle, CheckCircle2,
  ArrowRight, ShieldCheck, Eye, EyeOff, Loader2,
  ScanFace, UserPlus, Globe, LogIn, Sun, Moon
} from 'lucide-react';
import { useVentoVoice } from '../hooks/useVentoVoice';
import * as faceapi from 'face-api.js';
import FaceScanner from '../components/FaceScanner';
import { apiFetch, saveSession, GOOGLE_CLIENT_ID } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../hooks/useSounds';
import './Login.css';

/* ─── Umbral de reconocimiento facial ─── */
const FACE_MATCH_THRESHOLD = 0.45;

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  /* ── Modos: 'login' | 'register-email' | 'face-login' | 'face-register' | 'face-scan-reg' ── */
  const [mode, setMode] = useState('login');

  /* ── Tab activo dentro de la card: 'credentials' | 'faceid' ── */
  const [activeTab, setActiveTab] = useState('credentials');

  /* ── Theme ── */
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('vento-theme');
    if (saved) return saved;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vento-theme', theme);
    sessionStorage.removeItem('vento_welcomed_this_session'); // Ensure it resets before a new login
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const redirectToApp = (user) => {
    // Activar el cierre lento
    setIsIrisClosing(true);
    
    // Esperar a que la pantalla esté completamente negra (2 segundos)
    setTimeout(() => {
      
      // Mostrar el contenido de CARGANDO directamente sobre el mismo fondo negro
      setShowLoadingOverBlack(true);
      
      // Simular progreso de carga para que dure un rato en negro ("que duro mas")
      let p = 0;
      const interval = setInterval(() => {
        p += (p < 60 ? 1.5 : p < 85 ? 1 : 0.8);
        if (p >= 100) {
          clearInterval(interval);
          setSimulatedProgress(100);
          
          // Finaliza la carga, esperar 0.5s y desvanecer el "Cargando"
          setTimeout(() => {
            setShowLoadingOverBlack(false);
            
            // Esperar que se desvanezca por completo (600ms) para que quede la pantalla 100% negra otra vez
            setTimeout(() => {
              const irisColor = theme === 'dark' ? '#1a1a2e' : '#fef9ef';
              document.body.style.backgroundColor = irisColor;
              
              // AHORA actualizar el estado global, lo que desmontará la página
              authLogin({
                id: user.id || user.userId || null,
                name: user.name || user.email,
                email: user.email || '',
                role: user.role || 'student',
                method: user.method || 'email',
                progress: user.progress || {},
              });
              
              navigate('/welcome?fast=true');
              setTimeout(() => { document.body.style.backgroundColor = ''; }, 2000);
            }, 600); // fade out duration
          }, 500); // hold 100% for half a second
        } else {
          setSimulatedProgress(Math.min(p, 100));
        }
      }, 40);

    }, 2000); // 2 segundos exactos para que el borde tape toda la pantalla
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  
  /* Cinematic Transition States */
  const [isIrisClosing, setIsIrisClosing] = useState(false);
  const [showLoadingOverBlack, setShowLoadingOverBlack] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  
  /* UX Validation States */
  const [emailValid, setEmailValid] = useState(false);
  const [passStrength, setPassStrength] = useState(0);

  useEffect(() => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(regex.test(email));
  }, [email]);

  useEffect(() => {
    let s = 0;
    if (password.length > 5) s += 1;
    if (/[A-Z]/.test(password)) s += 1;
    if (/[0-9!@#$%^&*]/.test(password)) s += 1;
    setPassStrength(password.length === 0 ? 0 : s);
  }, [password]);

  /* Datos para registro facial */
  const [faceRegName, setFaceRegName] = useState('');
  const [faceRegEmail, setFaceRegEmail] = useState('');

  /* Google Identity Services listo */
  const [googleReady, setGoogleReady] = useState(false);

  const { speak } = useVentoVoice();
  const googleBtnRef = useRef(null);

  /* ══════════════════════════════════════════════
     CARGAR MODELOS FACE-API + WARMUP (LAZY LOAD)
  ══════════════════════════════════════════════ */
  useEffect(() => {
    if (activeTab !== 'faceid') return; // Carga perezosa
    if (modelsLoaded) return;
    
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        if (cancelled) return;
        try {
          const c = document.createElement('canvas');
          c.width = c.height = 64;
          await faceapi.detectSingleFace(c,
            new faceapi.SsdMobilenetv1Options({ minConfidence: 0.9 }));
        } catch { /* warmup silencioso */ }
        if (!cancelled) setModelsLoaded(true);
      } catch (err) { console.error('Error modelos:', err); }
    })();
    return () => { cancelled = true; };
  }, [activeTab, modelsLoaded]);

  /* ══════════════════════════════════════════════
     GOOGLE IDENTITY SERVICES
  ══════════════════════════════════════════════ */
  const handleGoogleCallback = useCallback(async (response) => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/google-login', {
        method: 'POST',
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error con Google');
      saveSession(data.token, data.user);
      redirectToApp(data.user);
    } catch (err) {
      setMessage({ text: err.message || 'Error con Google', type: 'error' });
    }
    setLoading(false);
  }, [navigate, speak]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const initGoogle = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
      setGoogleReady(true);
    };
    if (window.google) { initGoogle(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, [handleGoogleCallback]);

  /* Renderizar el botón oficial de Google */
  useEffect(() => {
    if (!googleReady || !googleBtnRef.current) return;
    if (mode !== 'login' || activeTab !== 'credentials') return;
    try {
      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: googleBtnRef.current.offsetWidth || 360,
        locale: 'es',
      });
    } catch (e) {
      console.warn('Google renderButton error:', e);
    }
  }, [googleReady, mode, activeTab]);

  /* ── Limpiar mensaje automáticamente ── */
  useEffect(() => {
    if (!message.text) return;
    const t = setTimeout(() => setMessage({ text: '', type: '' }), 3000); // 3 segundos
    return () => clearTimeout(t);
  }, [message]);

  /* ── Reset al cambiar modo ── */
  useEffect(() => {
    setPassword('');
    setShowPassword(false);
    setMessage({ text: '', type: '' });
  }, [mode]);

  /* ══════════════════════════════════════════════
     REGISTRO CON CORREO
  ══════════════════════════════════════════════ */
  const handleRegister = async (e) => {
    e.preventDefault();
    try { sounds.unlock(); } catch (e) {}
    setLoading(true);
    try {
      const res = await apiFetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar');
      setMessage({ text: '¡Cuenta creada! Ahora inicia sesión', type: 'success' });
      setTimeout(() => setMode('login'), 2000);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
    setLoading(false);
  };

  /* ══════════════════════════════════════════════
     LOGIN CON CORREO
  ══════════════════════════════════════════════ */
  const handleLogin = async (e) => {
    e.preventDefault();
    try { sounds.unlock(); } catch (e) {}
    setLoading(true);
    try {
      const res = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error de autenticación');
      saveSession(data.token, data.user);
      redirectToApp(data.user);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
    setLoading(false);
  };

  /* ══════════════════════════════════════════════
     FACE ID LOGIN
  ══════════════════════════════════════════════ */
  const handleFaceLogin = async (descriptor) => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/face-profiles');
      const data = await res.json();
      if (!res.ok || !data.profiles?.length) {
        setMessage({ text: 'Sin perfiles faciales. Registra tu rostro.', type: 'error' });
        setMode('login');
        setLoading(false);
        return;
      }
      let bestMatch = null;
      let bestDist = Infinity;
      for (const profile of data.profiles) {
        const saved = new Float32Array(profile.descriptor);
        const dist = faceapi.euclideanDistance(descriptor, saved);
        if (dist < bestDist) { bestDist = dist; bestMatch = profile; }
      }
      if (bestDist < FACE_MATCH_THRESHOLD && bestMatch) {
        let fullUser = { name: bestMatch.name, email: bestMatch.email, method: 'face', role: 'student', progress: {} };
        try {
          const uRes = await apiFetch(`/api/user-by-email?email=${encodeURIComponent(bestMatch.email)}&autoCreateName=${encodeURIComponent(bestMatch.name)}`);
          const uData = await uRes.json();
          if (uRes.ok) fullUser = { ...fullUser, ...uData, method: 'face' };
        } catch { /* si falla, usar datos básicos */ }
        saveSession('face-id-session', fullUser);
        redirectToApp(fullUser);
      } else {
        setMessage({ text: 'Rostro no reconocido. ¿Ya registraste tu cara?', type: 'error' });
        setMode('login');
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Error de conexión con el servidor', type: 'error' });
      setMode('login');
    }
    setLoading(false);
  };

  /* ══════════════════════════════════════════════
     FACE ID REGISTRO
  ══════════════════════════════════════════════ */
  const handleFaceRegister = async (descriptor) => {
    setMode('login');
    setLoading(true);
    try {
      const res = await apiFetch('/api/face-profile', {
        method: 'POST',
        body: JSON.stringify({
          name: faceRegName.trim(),
          email: faceRegEmail.trim().toLowerCase(),
          descriptor: Array.from(descriptor),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      setMessage({ text: '¡Rostro registrado! Ya puedes usar Face ID 🎉', type: 'success' });
      setFaceRegName('');
      setFaceRegEmail('');
    } catch (err) {
      setMessage({ text: err.message || 'Error al guardar el perfil facial', type: 'error' });
    }
    setLoading(false);
  };

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  const showFaceLoginScanner = mode === 'face-login';
  const showFaceRegisterScanner = mode === 'face-scan-reg';

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="login-page">

      {/* ══════ PANEL IZQUIERDO ══════ */}
      <div className="login-left">
        <div className="left-bg-light" />
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        <span className="fl-sign s1">📚</span><span className="fl-sign s2">🎵</span>
        <span className="fl-sign s3">🧮</span><span className="fl-sign s4">♟️</span>
        <span className="fl-sign s5">🤟</span>

        <div className="left-content-wrapper">
          <div className="left-brand">
            <span className="left-mascot">🎓</span>
            <h1 className="left-title">VentoEdu</h1>
            <p className="left-tagline">
              La plataforma interactiva para dominar<br />
              Inglés, Música, Matemáticas y más.
            </p>
          </div>

          <div className="feature-grid">
            {[
              { icon: '🎮', title: 'Aprende jugando', desc: 'Lecciones 100% gamificadas' },
              { icon: '🌍', title: 'Múltiples cursos', desc: 'Inglés, Señas, y mucho más' },
              { icon: '🏆', title: 'Gana logros', desc: 'Puntos y recompensas épicas' },
              { icon: '🔐', title: 'Face ID con IA', desc: 'Acceso biométrico seguro' },
            ].map((f, i) => (
              <div key={i} className="feature-grid-card">
                <div className="feature-icon-wrapper">{f.icon}</div>
                <div className="feature-text-content">
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="stats-panel">
            <div className="stat-item"><span className="stat-value">50K+</span><span className="stat-label">Alumnos</span></div>
            <div className="stat-divider" />
            <div className="stat-item"><span className="stat-value">5+</span><span className="stat-label">Cursos</span></div>
            <div className="stat-divider" />
            <div className="stat-item"><span className="stat-value">4.9⭐</span><span className="stat-label">Reseñas</span></div>
          </div>

          <div className="left-badge"><span />&nbsp;Plataforma Educativa Segura</div>
        </div>
      </div>

      {/* ══════ PANEL DERECHO ══════ */}
      <div className="login-right">

        {/* Theme toggle */}
        <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}>
          {theme === 'light' ? <><Moon size={16} /> <span>Oscuro</span></> : <><Sun size={16} /> <span>Claro</span></>}
        </button>

        {/* Face scanners (overlay) */}
        <AnimatePresence>
          {showFaceLoginScanner && (
            <FaceScanner key="face-login" mode="login" modelsLoaded={modelsLoaded}
              onResult={handleFaceLogin} onCancel={() => setMode('login')} speak={speak} />
          )}
          {showFaceRegisterScanner && (
            <FaceScanner key="face-register" mode="register" modelsLoaded={modelsLoaded}
              onResult={handleFaceRegister} onCancel={() => setMode('face-register')} speak={speak} />
          )}
        </AnimatePresence>

        <div className="login-card">
          <span className="login-mascot">🎓</span>
          <h1 className="login-title">Vento<span>Edu</span></h1>
          <p className="login-subtitle">Aprende jugando · Tu plataforma educativa</p>

          {/* Alert */}
          <AnimatePresence>
            {message.text && (
              <motion.div
                className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}
                initial={{ opacity: 0, y: -20, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{message.text}</span>
                </div>
                <button className="alert-close" onClick={() => setMessage({ text: '', type: '' })} aria-label="Cerrar alerta">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* ── MODO: LOGIN ── */}
            {mode === 'login' && (
              <motion.div key="login" variants={slideVariants}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.2 }}
              >
                {/* Method tabs */}
                <div className="method-tabs">
                  <button
                    className={`method-tab ${activeTab === 'credentials' ? 'method-tab--active' : ''}`}
                    onClick={() => setActiveTab('credentials')}
                  >
                    <LogIn size={14} /> Correo
                  </button>
                  <button
                    className={`method-tab ${activeTab === 'faceid' ? 'method-tab--active' : ''}`}
                    onClick={() => setActiveTab('faceid')}
                  >
                    <ScanFace size={14} /> Face ID
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'credentials' && (
                    <motion.div key="cred-tab"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <form className="login-form" onSubmit={handleLogin}>
                        <div>
                          <label className="form-label">Correo electrónico</label>
                          <div className={`input-wrap ${email.length > 0 && emailValid ? 'valid-input' : ''}`}>
                            <Mail size={16} className="input-icon" />
                            <input className="field" type="email" placeholder="tu@correo.com"
                              value={email} onChange={e => setEmail(e.target.value)} required />
                            {emailValid && <CheckCircle2 size={16} className="valid-check" />}
                          </div>
                        </div>
                        <div>
                          <label className="form-label">C<span>o</span>ntraseña</label>
                          <div className="input-wrap">
                            <Lock size={16} className="input-icon" />
                            <input className="field has-eye" type={showPassword ? 'text' : 'search'} placeholder="Tu clave secreta" name="secret_code"
                              style={!showPassword ? { WebkitTextSecurity: 'disc' } : {}}
                              value={password} onChange={e => setPassword(e.target.value)} required 
                              autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck="false" />
                            <button type="button" className="input-eye" onClick={() => setShowPassword(s => !s)} aria-label="Mostrar/ocultar contraseña">
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="form-options">
                          <label className="checkbox-wrap">
                            <input type="checkbox" />
                            <span>Recordarme</span>
                          </label>
                          <button type="button" className="forgot-link" onClick={e => e.preventDefault()}>¿Olvidaste tu contraseña?</button>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          {loading ? <Loader2 size={18} className="spin" /> : <ArrowRight size={18} />}
                          {loading ? 'Verificando…' : 'Iniciar sesión'}
                        </button>
                      </form>

                      <div className="divider">
                        <div className="divider-line" /> <span>o continúa con</span> <div className="divider-line" />
                      </div>

                      <div className="social-row">
                        {GOOGLE_CLIENT_ID ? (
                          <div className="google-btn-wrapper">
                            <div ref={googleBtnRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
                            {!googleReady && (
                              <button className="btn btn-outline" disabled>
                                <Loader2 size={16} className="spin" /> Cargando Google…
                              </button>
                            )}
                          </div>
                        ) : (
                          <button className="btn btn-outline" disabled title="Configura GOOGLE_CLIENT_ID en .env">
                            <Globe size={16} /> Google (sin configurar)
                          </button>
                        )}
                      </div>

                      <button className="toggle-link" onClick={() => setMode('register-email')}>
                        ¿Eres nuevo? ¡Crea una cuenta!
                      </button>
                    </motion.div>
                  )}

                  {activeTab === 'faceid' && (
                    <motion.div key="face-tab"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="faceid-section">
                        {!modelsLoaded ? (
                          <div className="faceid-loading">
                            <div className="faceid-scanner-pulse">
                              <ScanFace size={32} className="pulse-icon" />
                            </div>
                            <span className="faceid-loading-text">
                              <Loader2 size={14} className="spin" /> Inicializando motor de IA...
                            </span>
                            <p className="faceid-loading-sub">Preparando reconocimiento facial seguro</p>
                          </div>
                        ) : (
                          <>
                            <span className="faceid-label"><ScanFace size={14} /> Reconocimiento Facial Listo</span>
                            <div className="faceid-buttons">
                              <button className="btn btn-purple pulse-ready" disabled={loading}
                                onClick={() => setMode('face-login')}>
                                <ScanFace size={16} /> Entrar
                              </button>
                              <button className="btn btn-outline" disabled={loading}
                                onClick={() => setMode('face-register')}>
                                <UserPlus size={16} /> Registrar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── MODO: REGISTRO CON EMAIL ── */}
            {mode === 'register-email' && (
              <motion.div key="register" variants={slideVariants}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.2 }}
              >
                <form className="login-form" onSubmit={handleRegister}>
                  <div>
                    <label className="form-label">Tu nombre</label>
                    <div className="input-wrap">
                      <User size={16} className="input-icon" />
                      <input className="field" type="text" placeholder="¿Cómo te llamas?"
                        value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Correo electrónico</label>
                    <div className={`input-wrap ${email.length > 0 && emailValid ? 'valid-input' : ''}`}>
                      <Mail size={16} className="input-icon" />
                      <input className="field" type="email" placeholder="tu@correo.com"
                        value={email} onChange={e => setEmail(e.target.value)} required />
                      {emailValid && <CheckCircle2 size={16} className="valid-check" />}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">C<span>o</span>ntraseña</label>
                    <div className="input-wrap">
                      <Lock size={16} className="input-icon" />
                      <input className="field has-eye" type={showPassword ? 'text' : 'search'} placeholder="Mínimo 6 caracteres" name="secret_code_new"
                        style={!showPassword ? { WebkitTextSecurity: 'disc' } : {}}
                        value={password} onChange={e => setPassword(e.target.value)} required minLength={6} 
                        autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck="false" />
                      <button type="button" className="input-eye" onClick={() => setShowPassword(s => !s)} aria-label="Mostrar/ocultar contraseña">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="password-strength">
                        <div className={`strength-bar level-${passStrength}`}></div>
                        <span className="strength-text">
                          {passStrength === 0 ? 'Muy débil' : passStrength === 1 ? 'Débil' : passStrength === 2 ? 'Media' : 'Fuerte'}
                        </span>
                      </div>
                    )}
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Loader2 size={18} className="spin" /> : <UserPlus size={18} />}
                    {loading ? 'Creando cuenta…' : 'Crear cuenta'}
                  </button>
                </form>
                <button className="toggle-link" onClick={() => setMode('login')}>
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </motion.div>
            )}

            {/* ── MODO: REGISTRO FACIAL paso 1 ── */}
            {mode === 'face-register' && (
              <motion.div key="face-reg" variants={slideVariants}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.2 }}
              >
                <div className="face-reg-step">
                  <span style={{ fontSize: '2.2rem', textAlign: 'center' }}>📸</span>
                  <h3>Registrar tu rostro</h3>
                  <p>Ingresa tus datos y luego escanearemos tu cara para que puedas entrar sin contraseña.</p>
                  <div>
                    <label className="form-label">Tu nombre</label>
                    <div className="input-wrap">
                      <User size={16} className="input-icon" />
                      <input className="field" type="text" placeholder="¿Cómo te llamas?"
                        value={faceRegName} onChange={e => setFaceRegName(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Tu correo electrónico</label>
                    <div className="input-wrap">
                      <Mail size={16} className="input-icon" />
                      <input className="field" type="email" placeholder="tu@correo.com"
                        value={faceRegEmail} onChange={e => setFaceRegEmail(e.target.value)} />
                    </div>
                  </div>
                  <button className="btn btn-purple"
                    disabled={!faceRegName.trim() || !faceRegEmail.trim() || !modelsLoaded}
                    onClick={() => setMode('face-scan-reg')}>
                    <ScanFace size={18} /> Escanear mi rostro
                  </button>
                  <button className="btn btn-outline" onClick={() => { setMode('login'); setActiveTab('faceid'); }}>
                    Cancelar
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          <div className="login-footer">
            <ShieldCheck size={12} /> Node.js + Firebase · VentoEdu
          </div>
        </div>{/* /login-card */}
      </div>{/* /login-right */}

      {/* ── THE INTERNAL IRIS CLOSE (LOONEY TUNES STYLE) ── */}
      {isIrisClosing && (
        <motion.div
          initial={{ borderWidth: '0vmax' }}
          animate={{ borderWidth: '150vmax' }}
          transition={{ duration: 2.0, ease: "easeInOut" }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            x: '-50%',
            y: '-50%',
            width: '300vmax',
            height: '300vmax',
            borderRadius: '50%',
            borderColor: theme === 'dark' ? '#1a1a2e' : '#fef9ef',
            borderStyle: 'solid',
            boxSizing: 'border-box',
            zIndex: 999999,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* ── THE BLACK SCREEN LOADING (OVER THE IRIS) ── */}
      <AnimatePresence>
        {showLoadingOverBlack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000000,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: 'white',
              background: theme === 'dark' ? '#1a1a2e' : '#fef9ef'
            }}
          >
            {/* Rocket emoji */}
            <motion.div
              animate={{ scale: [1, 1.12, 1], y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '3.5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 15px rgba(139,92,246,0.25))' }}
            >
              🚀
            </motion.div>

            {/* Text */}
            <h2 style={{
              fontFamily: "'Quicksand', 'Segoe UI', sans-serif",
              fontWeight: 800,
              fontSize: '1.15rem',
              letterSpacing: '3px',
              marginBottom: '2rem',
              color: theme === 'dark' ? '#a78bfa' : '#7c3aed'
            }}>
              CARGANDO
              <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>.</motion.span>
              <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}>.</motion.span>
              <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}>.</motion.span>
            </h2>

            {/* Progress bar */}
            <div style={{
              width: '220px', height: '5px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(139,92,246,0.1)',
              borderRadius: '10px', position: 'relative', overflow: 'visible'
            }}>
              <motion.div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #7c3aed, #a78bfa, #60a5fa)',
                  borderRadius: '10px',
                  width: `${Math.floor(simulatedProgress)}%`,
                  transition: 'width 0.15s ease-out'
                }}
              />
              <div style={{
                position: 'absolute', top: '-4px',
                left: `${Math.floor(simulatedProgress)}%`,
                width: '12px', height: '12px', borderRadius: '50%',
                background: '#a78bfa',
                boxShadow: '0 0 12px 4px rgba(139,92,246,0.35)',
                transform: 'translateX(-50%)',
                transition: 'left 0.15s ease-out'
              }} />
            </div>
            <span style={{
              marginTop: '0.7rem',
              fontFamily: "'Quicksand', 'Segoe UI', sans-serif",
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '1px',
              color: theme === 'dark' ? '#a78bfa' : '#7c3aed'
            }}>
              {Math.floor(simulatedProgress)}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Login;