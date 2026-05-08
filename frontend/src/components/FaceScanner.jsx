import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaceLandmarker } from '@mediapipe/tasks-vision';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { X, Loader2, CheckCircle2, AlertCircle, Camera, ScanFace } from 'lucide-react';
import * as faceapi from 'face-api.js';

/**
 * FaceScanner — versión optimizada para velocidad
 * Props:
 *   mode         → 'login' | 'register'
 *   modelsLoaded → bool
 *   onResult     → (descriptor: Float32Array) => void
 *   onCancel     → () => void
 *   speak        → (text: string) => void
 */
const FaceScanner = ({ mode = 'login', modelsLoaded, onResult, onCancel, speak }) => {
  const videoRef        = useRef(null);
  const canvasRef       = useRef(null);
  const reqRef          = useRef(null);
  const streamRef       = useRef(null);
  const lastFrameRef    = useRef(0);      // ← para throttle del render loop
  const isCapturingRef  = useRef(false);  // ← evita doble captura

  const { faceLandmarker, mediaPipeLoaded } = useMediaPipe();
  const faceLandmarkerRef = useRef(faceLandmarker);
  useEffect(() => { faceLandmarkerRef.current = faceLandmarker; }, [faceLandmarker]);

  const [camStatus,    setCamStatus]    = useState('INICIANDO');
  const [actionState,  setActionState]  = useState('idle');
  const [actionMsg,    setActionMsg]    = useState('');
  const [faceDetected, setFaceDetected] = useState(false);

  const isLogin = mode === 'login';
  const accent  = isLogin ? '#ce82ff' : '#58cc02';

  /* ─────────────────────────────────────────────────
     RENDER LOOP — throttled a ~20 FPS
     (suficiente para ver los landmarks sin ahogar la CPU)
  ───────────────────────────────────────────────── */
  const renderLoop = useCallback((timestamp) => {
    // Throttle: skip frames para mantener ~20 fps
    const TARGET_FPS = 20;
    const interval   = 1000 / TARGET_FPS;

    if (timestamp - lastFrameRef.current < interval) {
      reqRef.current = requestAnimationFrame(renderLoop);
      return;
    }
    lastFrameRef.current = timestamp;

    const video    = videoRef.current;
    const canvas   = canvasRef.current;
    const detector = faceLandmarkerRef.current;

    if (!detector || !video || video.readyState < 4 || !canvas || isCapturingRef.current) {
      reqRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (canvas.width !== video.videoWidth) {
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    let results;
    try {
      results = detector.detectForVideo(video, performance.now());
    } catch {
      reqRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.faceLandmarks?.length > 0) {
      drawMesh(ctx, results.faceLandmarks[0], canvas.width, canvas.height, isLogin);
      setFaceDetected(true);
      setCamStatus('LISTO');
    } else {
      setFaceDetected(false);
      setCamStatus('BUSCANDO');
    }

    reqRef.current = requestAnimationFrame(renderLoop);
  }, []); // sin dependencias para que la ref sea estable

  /* ─────────────────────────────────────────────────
     DIBUJO DE MALLA
  ───────────────────────────────────────────────── */
  const drawMesh = (ctx, landmarks, w, h, loginMode) => {
    const cx = landmarks.reduce((a, p) => a + p.x, 0) / landmarks.length;
    const pt = (p) => ({
      x: ((p.x - cx) * 1.03 + cx) * w,
      y: p.y * h - 4,
    });

    // Tessellation
    ctx.lineWidth   = 0.8;
    ctx.strokeStyle = loginMode ? 'rgba(206,130,255,0.28)' : 'rgba(88,204,2,0.28)';
    ctx.beginPath();
    for (const conn of (FaceLandmarker.FACE_LANDMARKS_TESSELATION ?? [])) {
      const i1 = conn.start ?? conn[0];
      const i2 = conn.end   ?? conn[1];
      if (!landmarks[i1] || !landmarks[i2]) continue;
      const p1 = pt(landmarks[i1]);
      const p2 = pt(landmarks[i2]);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();

    // Óvalo
    ctx.lineWidth   = 2;
    ctx.strokeStyle = loginMode ? 'rgba(206,130,255,0.9)' : 'rgba(88,204,2,0.9)';
    ctx.beginPath();
    for (const o of (FaceLandmarker.FACE_LANDMARKS_FACE_OVAL ?? [])) {
      const i1 = o.start ?? o[0];
      const i2 = o.end   ?? o[1];
      if (!landmarks[i1] || !landmarks[i2]) continue;
      const p1 = pt(landmarks[i1]);
      const p2 = pt(landmarks[i2]);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();

    // Nodos
    const col = loginMode ? '#ce82ff' : '#58cc02';
    ctx.fillStyle   = col;
    ctx.shadowBlur  = 7;
    ctx.shadowColor = col;
    for (let i = 0; i < landmarks.length; i += 14) {
      const p = pt(landmarks[i]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  };

  /* ─────────────────────────────────────────────────
     CÁMARA
  ───────────────────────────────────────────────── */
  const stopCamera = useCallback(() => {
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const startCamera = useCallback(async () => {
    try {
      // Resolución reducida → menos datos que procesar
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCamStatus('BUSCANDO');
          reqRef.current = requestAnimationFrame(renderLoop);
        };
      }
    } catch {
      setCamStatus('ERROR');
    }
  }, [renderLoop]);

  useEffect(() => {
    if (mediaPipeLoaded) startCamera();
    return stopCamera;
  }, [mediaPipeLoaded, startCamera, stopCamera]);

  /* ─────────────────────────────────────────────────
     CAPTURA OPTIMIZADA
     1) Detener render loop (libera CPU)
     2) Dibujar frame en canvas pequeño 320×240
     3) Correr face-api sobre el canvas pequeño
     4) Reanudar render loop si hay error
  ───────────────────────────────────────────────── */
  const handleCapture = async () => {
    if (!modelsLoaded || !faceDetected || actionState !== 'idle') return;
    if (isCapturingRef.current) return;

    isCapturingRef.current = true;
    setActionState('scanning');
    setActionMsg(isLogin ? 'Verificando identidad…' : 'Capturando tu rostro…');

    // ✅ NO cancelamos el render loop → la malla sigue animada
    try {
      const video = videoRef.current;

      // Canvas pequeño para detección rápida (4x más rápido que 640×480)
      const detectCanvas = document.createElement('canvas');
      detectCanvas.width  = 320;
      detectCanvas.height = 240;
      detectCanvas.getContext('2d').drawImage(video, 0, 0, 320, 240);

      const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 });

      const detection = await faceapi
        .detectSingleFace(detectCanvas, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        speak?.('No pude capturar el rostro. Acércate un poco más.');
        setActionState('error');
        setActionMsg('No se detectó un rostro claro. Acércate más.');
        setTimeout(() => {
          setActionState('idle');
          setActionMsg('');
          isCapturingRef.current = false;
        }, 2500);
        return;
      }

      // ✅ Éxito: mostrar overlay verde, luego llamar onResult SIN delay largo
      setActionState('success');
      setActionMsg(isLogin ? '¡Identidad detectada!' : '¡Rostro capturado!');
      isCapturingRef.current = false;

      // Parar cámara DESPUÉS de confirmar éxito
      setTimeout(() => {
        stopCamera();
        onResult(detection.descriptor);
      }, 800);

    } catch (err) {
      console.error('FaceScanner error:', err);
      setActionState('error');
      setActionMsg('Error al procesar. Intenta de nuevo.');
      setTimeout(() => {
        setActionState('idle');
        setActionMsg('');
        isCapturingRef.current = false;
      }, 2500);
    }
  };

  /* ─────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────── */
  const statusColor = {
    INICIANDO: '#aaa',
    BUSCANDO:  '#ffaa00',
    LISTO:     accent,
    ERROR:     '#ff4b4b',
  }[camStatus] ?? '#aaa';

  const statusLabel = {
    INICIANDO: 'Iniciando cámara…',
    BUSCANDO:  'Buscando tu rostro…',
    LISTO:     'Rostro detectado ✓',
    ERROR:     'Cámara no disponible',
  }[camStatus];

  const captureReady = faceDetected && actionState === 'idle' && modelsLoaded;
  const title        = isLogin ? 'Acceder con Face ID' : 'Registrar mi rostro';
  const emoji        = isLogin ? '🔐' : '📸';
  const btnLabel     = isLogin ? 'Verificar identidad' : 'Guardar mi rostro';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={S.overlay}
    >
      <motion.div
        initial={{ scale: 0.88, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        style={S.card}
      >
        {/* Cerrar */}
        <button style={S.closeBtn} onClick={onCancel}>
          <X size={20} />
        </button>

        {/* Header */}
        <div style={S.header}>
          <div style={S.iconWrap}>
            {isLogin ? <ScanFace size={28} color="#ce82ff"/> : <Camera size={28} color="#58cc02"/>}
          </div>
          <div>
            <h2 style={S.title}>{title}</h2>
            <p style={S.subtitle}>
              {isLogin
                ? 'Mira a la cámara para entrar'
                : 'Ubica tu rostro en el círculo'}
            </p>
          </div>
        </div>

        {/* Visor */}
        <div style={{ ...S.viewfinderWrap, padding: faceDetected ? '4px' : '4px', background: faceDetected ? `linear-gradient(135deg, ${accent}, transparent)` : 'transparent' }}>
          <div style={{ ...S.viewfinder, borderColor: faceDetected ? accent : 'rgba(255,255,255,0.1)' }}>
            <video ref={videoRef} autoPlay muted playsInline style={S.video} />
            <canvas ref={canvasRef} style={S.canvas} />

            {/* Guía Visual (Overlay) */}
            <div style={{ ...S.guideOverlay, opacity: faceDetected ? 0 : 1 }}>
              <svg viewBox="0 0 100 100" style={{ width: '80%', height: '80%', opacity: 0.6 }}>
                <ellipse cx="50" cy="50" rx="35" ry="45" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 50 15 L 50 25 M 50 85 L 50 75 M 15 50 L 25 50 M 85 50 L 75 50" stroke="#fff" strokeWidth="2" />
              </svg>
            </div>

            {/* Línea de escaneo buscando */}
            {camStatus === 'BUSCANDO' && (
              <motion.div
                style={{ ...S.scanLine, background: accent, boxShadow: `0 0 15px ${accent}` }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* ✅ Overlay PROCESANDO: pulsación sobre la malla (malla sigue viva) */}
            {actionState === 'scanning' && (
              <motion.div
                style={S.scanningOverlay}
                animate={{ opacity: [0.55, 0.85, 0.55] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              >
                <Loader2 size={52} color="#fff" style={{ animation: 'spin360 0.7s linear infinite' }} />
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.8rem', marginTop: 8 }}>
                  {isLogin ? 'Analizando…' : 'Capturando…'}
                </span>
              </motion.div>
            )}

            {/* Overlay éxito */}
            {actionState === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={S.successOverlay}>
                <CheckCircle2 size={64} color="#fff" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Pill de estado */}
        <div style={S.statusRow}>
          <motion.div
            style={{ ...S.statusDot, background: statusColor, boxShadow: `0 0 10px ${statusColor}` }}
            animate={{ scale: camStatus === 'LISTO' ? [1, 1.4, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 1.1 }}
          />
          <span style={{ ...S.statusText, color: statusColor }}>{statusLabel}</span>
        </div>

        {/* Mensaje de acción */}
        <AnimatePresence>
          {actionMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                ...S.actionMsg,
                background: actionState === 'success' ? 'rgba(88, 204, 2, 0.15)'
                          : actionState === 'error'   ? 'rgba(255, 75, 75, 0.15)' : 'rgba(255,255,255,0.05)',
                color: actionState === 'success' ? '#72e309'
                     : actionState === 'error'   ? '#ff6b6b' : '#eee',
                border: `1px solid ${
                  actionState === 'success' ? 'rgba(88,204,2,0.3)'
                : actionState === 'error'   ? 'rgba(255,75,75,0.3)' : 'rgba(255,255,255,0.1)'
                }`,
              }}
            >
              {actionState === 'success'  && <CheckCircle2 size={15} />}
              {actionState === 'error'    && <AlertCircle  size={15} />}
              {actionState === 'scanning' && <Loader2 size={15} style={{ animation: 'spin360 0.8s linear infinite' }} />}
              {actionMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón captura */}
        <button
          style={{
            ...S.captureBtn,
            background: captureReady ? `linear-gradient(135deg, ${isLogin ? '#dfa8ff, #ce82ff' : '#72e309, #58cc02'})` : 'rgba(255,255,255,0.1)',
            color: captureReady ? '#fff' : 'rgba(255,255,255,0.4)',
            boxShadow: captureReady
              ? `0 4px 15px ${isLogin ? 'rgba(206,130,255,0.3)' : 'rgba(88,204,2,0.3)'}, inset 0 1px 0 rgba(255,255,255,0.2)`
              : 'none',
            cursor: captureReady ? 'pointer' : 'not-allowed',
            transform: actionState === 'scanning' ? 'translateY(2px)' : 'none',
          }}
          disabled={!captureReady}
          onClick={handleCapture}
        >
          {actionState === 'scanning'
            ? <><Loader2 size={20} style={{ animation: 'spin360 0.8s linear infinite' }} /> Procesando…</>
            : <><Camera size={20} /> {btnLabel}</>
          }
        </button>

        {/* Notas */}
        <p style={S.note}>
          {isLogin
            ? '¿Sin registro? Cierra y usa "Registrar rostro".'
            : '🔒 Tu perfil facial se cifra y guarda en la nube.'}
        </p>
      </motion.div>

      <style>{`
        @keyframes spin360 {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

/* ─── Estilos (Dark Glassmorphism) ─── */
const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(10, 10, 25, 0.85)',
    backdropFilter: 'blur(16px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Nunito', sans-serif",
  },
  card: {
    position: 'relative',
    width: '100%', maxWidth: '380px',
    background: 'linear-gradient(145deg, rgba(30,30,50,0.8) 0%, rgba(20,20,35,0.95) 100%)',
    borderRadius: '32px',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
    padding: '30px 24px',
    textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16,
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.05)', 
    borderRadius: '50%',
    width: 36, height: 36,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#fff', transition: 'background 0.2s',
  },
  header: {
    marginBottom: '20px', width: '100%',
    display: 'flex', alignItems: 'center', gap: '14px',
    textAlign: 'left',
  },
  iconWrap: {
    width: 52, height: 52, borderRadius: '16px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
  },
  title:    { margin: '0 0 2px 0', fontSize: '1.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' },
  subtitle: { margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 },
  
  viewfinderWrap: {
    borderRadius: '50%', marginBottom: '20px',
    transition: 'all 0.4s ease',
  },
  viewfinder: {
    position: 'relative',
    width: '260px', height: '260px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '4px solid',
    background: '#050505',
    transition: 'border-color 0.4s ease',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  video: {
    width: '100%', height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)',
  },
  canvas: {
    position: 'absolute', top: 0, left: 0,
    width: '100%', height: '100%',
    zIndex: 5, pointerEvents: 'none',
    objectFit: 'cover',
    transform: 'scaleX(-1)',
  },
  guideOverlay: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 6, pointerEvents: 'none',
    transition: 'opacity 0.4s ease',
  },
  scanLine: {
    position: 'absolute', left: 0, right: 0,
    height: '3px', zIndex: 8, opacity: 0.9,
  },
  scanningOverlay: {
    position: 'absolute', inset: 0, zIndex: 14,
    background: 'rgba(10,10,25,0.65)', backdropFilter: 'blur(4px)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    borderRadius: '50%',
  },
  successOverlay: {
    position: 'absolute', inset: 0, zIndex: 15,
    background: 'rgba(88,204,2,0.9)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '50%',
  },
  statusRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    marginBottom: '12px', background: 'rgba(0,0,0,0.2)',
    padding: '6px 14px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.05)',
  },
  statusDot:  { width: 8, height: 8, borderRadius: '50%', transition: 'background 0.3s' },
  statusText: { fontSize: '0.75rem', fontWeight: 800, transition: 'color 0.3s', textTransform: 'uppercase', letterSpacing: '0.5px' },
  actionMsg: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '10px 14px', borderRadius: '14px',
    fontSize: '0.85rem', fontWeight: 700,
    marginBottom: '16px', width: '100%',
  },
  captureBtn: {
    width: '100%', padding: '14px',
    border: 'none', borderRadius: '16px',
    fontSize: '1rem', fontWeight: 900,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    fontFamily: "'Nunito', sans-serif",
    transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
  },
  note: {
    marginTop: '16px', fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)', fontWeight: 600, lineHeight: 1.4,
  },
};

export default FaceScanner;