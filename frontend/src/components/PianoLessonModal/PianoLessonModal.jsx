import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playPiano, playShort, playMetronomeClick, FREQS, LABELS } from './pianoAudio';
import './PianoLessonModal.css';

/* ── Note list ── */
const KEYS = ['a','w','s','e','d','f','t','g','y','h','u','j','k','o','l','p',';',"'"];
const ALL_NOTES = Object.entries(FREQS).filter(([k])=>k.match(/[3-5]/)).map(([note,freq],i)=>({
  note, freq, label:LABELS[note]||note, isBlack:note.includes('#'), key:KEYS[i]||''
}));
const playN = (id) => playPiano(id);

/* ── Wave Visual ── */
const WaveVisual = ({ speed = 1 }) => (
  <svg className="plm-wave" viewBox="0 0 200 60" preserveAspectRatio="none">
    <path className="plm-wave-path" style={{animationDuration:`${2/speed}s`}}
      d="M0,30 C10,10 20,10 30,30 C40,50 50,50 60,30 C70,10 80,10 90,30 C100,50 110,50 120,30 C130,10 140,10 150,30 C160,50 170,50 180,30 C190,10 200,10 200,30" fill="none" stroke="url(#wg)" strokeWidth="2"/>
    <defs><linearGradient id="wg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#ff6b9d"/><stop offset="100%" stopColor="#a855f7"/></linearGradient></defs>
  </svg>
);

/* ── Keyboard Diagram ── */
const KeyboardDiagram = ({ highlight = [], labels = true }) => {
  const whites = ALL_NOTES.filter(n => !n.isBlack);
  return (
    <div className="plm-kbd-diagram">
      {whites.map((n,i) => (
        <div key={n.note} className={`plm-kbd-w ${highlight.includes(n.note)?'plm-kbd-hl':''}`}>
          {labels && <span>{n.label}</span>}
        </div>
      ))}
      {ALL_NOTES.filter(n=>n.isBlack).map(n => {
        const wi = ALL_NOTES.filter(x=>!x.isBlack).findIndex(x => {
          const idx = ALL_NOTES.indexOf(x);
          const ni = ALL_NOTES.indexOf(n);
          return ni === idx + 1;
        });
        return <div key={n.note} className={`plm-kbd-b ${highlight.includes(n.note)?'plm-kbd-hl':''}`} style={{left:`${(wi+0.65)*(100/whites.length)}%`,width:`${60/whites.length}%`}}>
          {labels && <span>{n.label}</span>}
        </div>;
      })}
    </div>
  );
};

/* ── Play Button ── */
const PlayBtn = ({ note, label, small }) => (
  <button className={`plm-play-btn ${small?'small':''}`} onClick={() => playN(note)}>
    🔊 {label || `${LABELS[note]||note} (${Math.round(FREQS[note]||440)} Hz)`}
  </button>
);

/* ── Progress Dots ── */
const StepDots = ({ total, current }) => (
  <div className="plm-dots">
    {Array.from({length:total},(_,i) => (
      <div key={i} className={`plm-dot ${i<current?'done':''} ${i===current?'active':''}`}/>
    ))}
  </div>
);

/* ── Mini Piano ── */
const MiniPiano = ({ highlightNote, onNotePlayed, disabled, gameLayer }) => {
  const [active, setActive] = useState(new Set());
  const whites = ALL_NOTES.filter(n => !n.isBlack);
  const W = whites.length;

  const press = useCallback((n) => {
    if (disabled) return;
    playPiano(n.note);
    setActive(prev => new Set([...prev, n.note]));
    if (onNotePlayed) onNotePlayed(n);
  }, [onNotePlayed, disabled]);

  const release = useCallback((n) => {
    setActive(prev => { const s = new Set(prev); s.delete(n.note); return s; });
  }, []);

  useEffect(() => {
    if (disabled) return;
    const km = {}; ALL_NOTES.forEach(n => { if(n.key) km[n.key] = n; });
    const d = e => { if(e.repeat) return; const n=km[e.key]; if(n) press(n); };
    const u = e => { const n=km[e.key]; if(n) release(n); };
    window.addEventListener('keydown',d); window.addEventListener('keyup',u);
    return () => { window.removeEventListener('keydown',d); window.removeEventListener('keyup',u); };
  }, [press, release, disabled]);

  return (
    <div className="plm-piano-wrap">
      {gameLayer && (
        <div className="plm-cas-field" style={{ width: `calc(${W} * 48px)`, minWidth: '100%', position: 'relative' }}>
          {gameLayer}
        </div>
      )}
      <div className="plm-piano" style={{'--wk':W}}>
        {whites.map((n,i) => (
          <div key={n.note} className={`plm-wk ${active.has(n.note)?'on':''} ${highlightNote===n.note?'hl':''}`}
            style={{left:`${i*(100/W)}%`,width:`${100/W}%`}}
            onMouseDown={()=>press(n)} onMouseUp={()=>release(n)} onMouseLeave={()=>release(n)}
            onTouchStart={e=>{e.preventDefault();press(n)}} onTouchEnd={e=>{e.preventDefault();release(n)}}>
            <span className="plm-wk-lbl">{n.label}</span>
            <span className="plm-wk-key">{n.key}</span>
          </div>
        ))}
        {(()=>{const bk=[];let wi=-1;ALL_NOTES.forEach(n=>{if(!n.isBlack){wi++}else{const l=(wi/W)*100+(0.65/W)*100;bk.push(<div key={n.note} className={`plm-bk ${active.has(n.note)?'on':''} ${highlightNote===n.note?'hl':''}`} style={{left:`${l}%`,width:`${(0.6/W)*100}%`}} onMouseDown={e=>{e.stopPropagation();press(n)}} onMouseUp={e=>{e.stopPropagation();release(n)}} onMouseLeave={()=>release(n)} onTouchStart={e=>{e.preventDefault();press(n)}} onTouchEnd={e=>{e.preventDefault();release(n)}}><span className="plm-bk-lbl">{n.label}</span></div>)}});return bk})()}
      </div>
    </div>
  );
};

/* ── Step Renderers ── */
const TeachStep = ({ step, onDone }) => (
  <div className="plm-step-teach">
    <h3 className="plm-step-title">{step.title}</h3>
    {step.visual === 'wave' && <WaveVisual speed={step.waveSpeed||1}/>}
    {step.visual === 'keyboard' && <KeyboardDiagram highlight={step.highlightKeys||[]}/>}
    {step.visual === 'image' && step.imageUrl && (
      <div className="plm-teach-image-container">
        <img src={step.imageUrl} alt="Diagrama Educativo" className="plm-teach-img" />
      </div>
    )}
    <p className="plm-step-body">{step.body}</p>
    {step.playButtons?.map((pb,i) => <PlayBtn key={i} note={pb.note} label={pb.label}/>)}
    {step.tip && <div className="plm-tip">💡 {step.tip}</div>}
    <button className="plm-next-btn" onClick={onDone}>Continuar →</button>
  </div>
);

const QuizStep = ({ step, onDone }) => {
  const [sel, setSel] = useState(null);
  const [st, setSt] = useState('idle');
  const pick = i => {
    if(st!=='idle') return; setSel(i);
    if(i===step.correctIndex){ setSt('ok'); } else { setSt('err'); setTimeout(()=>{setSt('idle');setSel(null)},800); }
  };
  return (
    <div className="plm-step-quiz">
      <h3 className="plm-step-title">💡 Pregunta</h3>
      <p className="plm-quiz-q">{step.question}</p>
      <div className="plm-quiz-opts">
        {step.options.map((o,i) => (
          <button key={i} className={`plm-quiz-opt ${st==='ok'&&i===step.correctIndex?'correct':''} ${st==='err'&&i===sel?'wrong':''} ${st==='ok'&&i!==step.correctIndex?'dim':''}`}
            onClick={()=>pick(i)} disabled={st==='ok'}>
            <span className="plm-opt-l">{'ABCD'[i]}</span><span>{o}</span>
          </button>
        ))}
      </div>
      {st==='err' && <div className="plm-fb err">❌ Inténtalo de nuevo</div>}
      {st==='ok' && <><div className="plm-fb ok">✅ ¡Correcto!</div>{step.explanation && <p className="plm-explain">{step.explanation}</p>}<button className="plm-next-btn" onClick={onDone}>Continuar →</button></>}
    </div>
  );
};

const PlayNoteStep = ({ step, onDone }) => {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(0);
  const handle = useCallback(n => {
    if(done) return;
    if(n.note===step.targetNote){ setDone(true); } else { setErr(e=>e+1); }
  },[done,step.targetNote]);
  return (
    <div className="plm-step-play">
      <h3 className="plm-step-title">🎹 {step.title || 'Toca la nota indicada'}</h3>
      <p className="plm-step-body">{step.body}</p>
      <div className="plm-target-note">🎯 Toca: <strong>{LABELS[step.targetNote]||step.targetNote}</strong></div>
      {step.hint && <p className="plm-hint">{step.hint}</p>}
      {err>0 && !done && <p className="plm-err-count">❌ {err} error{err>1?'es':''}</p>}
      {done && <div className="plm-fb ok">🎵 ¡Perfecto!</div>}
      <MiniPiano highlightNote={done?null:step.targetNote} onNotePlayed={handle} disabled={done}/>
      {done && <button className="plm-next-btn" onClick={onDone}>Continuar →</button>}
    </div>
  );
};

const PlaySeqStep = ({ step, onDone }) => {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(0);
  const seq = step.sequence || ['C4','E4','G4'];
  const handle = useCallback(n => {
    if(done) return;
    if(n.note===seq[idx]){ const nx=idx+1; if(nx>=seq.length){setDone(true)}else{setIdx(nx)} } else { setErr(e=>e+1); }
  },[done,idx,seq]);
  return (
    <div className="plm-step-seq">
      <h3 className="plm-step-title">🎯 {step.title || 'Toca la secuencia'}</h3>
      <p className="plm-step-body">{step.body}</p>
      <div className="plm-seq-track">
        {seq.map((s,i) => <div key={i} className={`plm-seq-pill ${i<idx?'done':''} ${i===idx?'cur':''}`}>{i<idx?'✅':i===idx?'🎯':'○'} {LABELS[s]||s}</div>)}
      </div>
      {err>0 && !done && <p className="plm-err-count">❌ {err} error{err>1?'es':''}</p>}
      {done && <div className="plm-fb ok">🎶 ¡Secuencia completada!</div>}
      <MiniPiano highlightNote={done?null:seq[idx]} onNotePlayed={handle} disabled={done}/>
      {done && <button className="plm-next-btn" onClick={onDone}>Continuar →</button>}
    </div>
  );
};

const ListenStep = ({ step, onDone }) => {
  const [played, setPlayed] = useState(false);
  const [sel, setSel] = useState(null);
  const [ok, setOk] = useState(null);
  const play = () => { playN(step.listenNote); setPlayed(true); };
  const pick = o => { if(sel) return; setSel(o); const c=o===step.listenNote; setOk(c); playN(o,0.4); if(c) setTimeout(()=>{},800); };
  return (
    <div className="plm-step-listen">
      <h3 className="plm-step-title">👂 Entrenamiento Auditivo</h3>
      <p className="plm-step-body">{step.body || 'Escucha la nota y selecciona cuál es'}</p>
      <button className={`plm-listen-btn ${played?'played':''}`} onClick={play}>{played?'🔊 Escuchar de nuevo':'🔊 Escuchar nota'}</button>
      {played && <div className="plm-listen-grid">
        {step.options.map(o => <button key={o} className={`plm-listen-opt ${sel&&o===step.listenNote?'correct':''} ${sel&&o===sel&&o!==step.listenNote?'wrong':''} ${sel&&o!==sel&&o!==step.listenNote?'dim':''}`} onClick={()=>pick(o)} disabled={!!sel}>{LABELS[o]||o}</button>)}
      </div>}
      {ok===true && <><div className="plm-fb ok">🎵 ¡Oído perfecto!</div><button className="plm-next-btn" onClick={onDone}>Continuar →</button></>}
      {ok===false && <div className="plm-fb err">La nota era {LABELS[step.listenNote]}</div>}
    </div>
  );
};

const SandboxStep = ({ step, onDone }) => {
  const [count, setCount] = useState(0);
  const handle = () => setCount(c=>c+1);
  return (
    <div className="plm-step-sandbox">
      <h3 className="plm-step-title">🎹 {step.title || 'Explora libremente'}</h3>
      <p className="plm-step-body">{step.body}</p>
      {step.suggestedNotes && <p className="plm-hint">Notas sugeridas: {step.suggestedNotes.map(n=>LABELS[n]||n).join(', ')}</p>}
      <MiniPiano onNotePlayed={handle}/>
      <p className="plm-sandbox-count">🎵 {count} nota{count!==1?'s':''} tocada{count!==1?'s':''}</p>
      {count>=3 && <button className="plm-next-btn" onClick={onDone}>Continuar →</button>}
    </div>
  );
};

const CascadeStep = ({ step, onDone }) => {
  const [notes] = useState(step.notes||['C4','E4','G4']);
  const [falling, setFalling] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [phase, setPhase] = useState('ready');
  const [fb, setFb] = useState(null);
  const nRef = useRef([]);
  const fRef = useRef(null);
  const total = notes.length;
  const speed = step.speed || 2200;

  const getNoteLeft = (noteId) => {
    const W = ALL_NOTES.filter(x => !x.isBlack).length;
    let wi = -1;
    for (const x of ALL_NOTES) {
      if (!x.isBlack) wi++;
      if (x.note === noteId) {
        if (!x.isBlack) {
          return (wi / W) * 100 + (50 / W);
        } else {
          return (wi / W) * 100 + (0.95 / W) * 100;
        }
      }
    }
    return 50;
  };

  const start = () => {
    setPhase('play'); setScore(0); setCombo(0); setHits(0);
    const sched = notes.map((id,i) => ({id:i,noteId:id,label:LABELS[id]||id,spawn:Date.now()+i*(speed*0.55),y:-10,hit:false,miss:false}));
    nRef.current = sched; setFalling([...sched]); anim();
  };
  const anim = () => {
    const now = Date.now();
    const upd = nRef.current.map(n => {
      if(n.hit||n.miss) return n;
      const p = Math.max(0,((now-n.spawn)/speed)*100);
      if(p>100){ n.miss=true; setCombo(0); }
      return {...n,y:p};
    });
    nRef.current = upd; setFalling([...upd]);
    if(upd.every(n=>n.hit||n.miss)){ setPhase('done'); return; }
    fRef.current = requestAnimationFrame(anim);
  };
  useEffect(()=>()=>{if(fRef.current)cancelAnimationFrame(fRef.current)},[]);
  const handleNote = useCallback(pn => {
    if(phase!=='play') return;
    const cl = nRef.current.filter(n=>!n.hit&&!n.miss&&n.noteId===pn.note).sort((a,b)=>Math.abs(a.y-85)-Math.abs(b.y-85))[0];
    if(cl&&Math.abs(cl.y-85)<20){
      cl.hit=true; const acc=Math.abs(cl.y-85); const pts=acc<5?100:acc<10?75:50;
      setScore(s=>s+pts); setCombo(c=>c+1); setHits(h=>h+1);
      setFb({t:acc<5?'PERFECTO':acc<10?'GENIAL':'BIEN',p:pts,k:Date.now()});
      setTimeout(()=>setFb(null),500);
    }
  },[phase]);
  const grade = hits===0?'C':(hits/total)>=0.9?'S':(hits/total)>=0.7?'A':'B';

  return (
    <div className="plm-step-cascade">
      {phase==='ready' && <div className="plm-cas-ready">
        <span className="plm-cas-icon">🎮</span>
        <p><strong>{total}</strong> notas caerán. ¡Tócalas en la zona verde!</p>
        <button className="plm-cas-go" onClick={start}>▶ ¡Empezar!</button>
      </div>}
      {phase==='play' && <>
        <div className="plm-cas-hud"><span>⭐{score}</span>{combo>1&&<span>🔥x{combo}</span>}<span>{hits}/{total}</span></div>
        <MiniPiano 
          onNotePlayed={handleNote} 
          gameLayer={
            <>
              <div className="plm-cas-hitzone"/>
              {falling.filter(n=>!n.hit&&!n.miss&&n.y>=0).map(n=><div key={n.id} className="plm-cas-note" style={{top:`${n.y}%`,left:`${getNoteLeft(n.noteId)}%`, transform:'translateX(-50%)'}}>{n.label}</div>)}
              <AnimatePresence>{fb&&<motion.div key={fb.k} className="plm-cas-fb" initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} exit={{opacity:0,y:-20}}>✨{fb.t} +{fb.p}</motion.div>}</AnimatePresence>
            </>
          }
        />
      </>}
      {phase==='done' && <div className="plm-cas-results">
        <div className={`plm-cas-grade g-${grade}`}>{grade}</div>
        <div className="plm-cas-stats"><div><span>⭐</span><strong>{score}</strong></div><div><span>🎯</span><strong>{hits}/{total}</strong></div></div>
        <button className="plm-next-btn" onClick={()=>onDone()}>{hits>=total*0.5?'Continuar →':'🔄 Reintentar'}</button>
      </div>}
    </div>
  );
};

const RhythmTapStep = ({ step, onDone }) => {
  const [phase, setPhase] = useState('ready'); // ready, countIn, play, done
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [currentBeat, setCurrentBeat] = useState(0);
  
  const bpm = step.bpm || 60;
  const totalBeats = step.beats || 16;
  const figure = step.figure || 'negra'; // negra(1), blanca(2), redonda(4)
  const intervalMs = 60000 / bpm;
  
  const stateRef = useRef({ beatsElapsed: 0, lastTick: 0, timer: null, phase: 'ready' });

  const getTargetBeats = () => {
    const targets = [];
    let inc = 1;
    if (figure === 'blanca') inc = 2;
    if (figure === 'redonda') inc = 4;
    for (let i = 1; i <= totalBeats; i += inc) {
      targets.push(i);
    }
    return targets;
  };
  const targetBeats = getTargetBeats();

  const tick = useCallback(() => {
    const s = stateRef.current;
    s.beatsElapsed++;
    s.lastTick = Date.now();
    
    if (s.phase === 'countIn') {
      setCurrentBeat(s.beatsElapsed);
      playMetronomeClick(s.beatsElapsed === 1);
      if (s.beatsElapsed >= 4) {
        s.phase = 'play';
        setPhase('play');
        s.beatsElapsed = 0; // reset for actual play
      }
    } else if (s.phase === 'play') {
      setCurrentBeat(s.beatsElapsed);
      playMetronomeClick(s.beatsElapsed % 4 === 1);
      
      if (s.beatsElapsed > totalBeats) {
        clearInterval(s.timer);
        s.phase = 'done';
        setPhase('done');
      }
    }
  }, [totalBeats]);

  const startCountIn = () => {
    stateRef.current.phase = 'countIn';
    setPhase('countIn');
    setScore(0);
    stateRef.current.beatsElapsed = 0;
    tick();
    stateRef.current.timer = setInterval(tick, intervalMs);
  };

  const handleTap = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'play') return;
    const now = Date.now();
    
    // Check if current beat is a target beat
    const isTarget = targetBeats.includes(s.beatsElapsed);
    const diff = Math.abs(now - s.lastTick);
    const error = Math.min(diff, Math.abs(intervalMs - diff)); // allowed early or late window
    
    if (isTarget && error < 200) {
      setScore(sc => sc + 1);
      setFeedback('¡A TIEMPO!');
    } else {
      setFeedback('¡Fuera de ritmo!');
    }
    setTimeout(() => setFeedback(null), 400);
  }, [intervalMs, targetBeats]);

  // Spacebar support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && (phase === 'play' || phase === 'countIn')) {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTap, phase]);

  useEffect(() => {
    return () => clearInterval(stateRef.current.timer);
  }, []);

  return (
    <div className="plm-step-rhythm">
      <h3 className="plm-step-title">⏱️ Práctica Rítmica</h3>
      <p className="plm-step-body">{step.body || 'Presiona el botón (o Espacio) al ritmo exacto.'}</p>
      
      {phase === 'ready' && (
        <div className="plm-cas-ready">
          <p>Tempo: <strong>{bpm} BPM</strong></p>
          <p>Figura: <strong>{figure.toUpperCase()}</strong></p>
          <button className="plm-cas-go" onClick={startCountIn}>▶ Iniciar (Cuenta 4 tiempos)</button>
        </div>
      )}

      {phase === 'countIn' && (
        <div className="plm-rhythm-play">
          <h1 style={{ fontSize:'4rem', color:'#ff6b9d' }}>{currentBeat}</h1>
          <p>¡Prepárate!</p>
        </div>
      )}

      {phase === 'play' && (
        <div className="plm-rhythm-play">
          <div className="plm-rhythm-hud">
            Aciertos: {score} / {targetBeats.length}
            <span style={{marginLeft:'1rem', color:'#fff'}}>Pulso: {((currentBeat-1)%4)+1}</span>
          </div>
          <button className={`plm-rhythm-tap-btn ${feedback==='¡A TIEMPO!'?'hit':''}`} onPointerDown={handleTap}>
            👉 TOCA AQUÍ 👈<br/><span style={{fontSize:'0.8rem'}}>(O usa la tecla Espacio)</span>
          </button>
          {feedback && <div className={`plm-fb ${feedback==='¡A TIEMPO!'?'ok':'err'}`}>{feedback}</div>}
        </div>
      )}

      {phase === 'done' && (
        <div className="plm-cas-results">
          <div className="plm-cas-stats"><div><span>🎯 Precisión:</span><strong>{score}/{targetBeats.length}</strong></div></div>
          <button className="plm-next-btn" onClick={onDone}>{score >= targetBeats.length * 0.6 ? 'Continuar →' : '🔄 Reintentar'}</button>
        </div>
      )}
    </div>
  );
};

/* ── Step Router ── */
const RENDERERS = { teach:TeachStep, quiz:QuizStep, play_note:PlayNoteStep, play_sequence:PlaySeqStep, listen:ListenStep, sandbox:SandboxStep, cascade:CascadeStep, rhythm_tap:RhythmTapStep };

/* ═══════════════════════════════════════════════
   MAIN MODAL
   ═══════════════════════════════════════════════ */
const PianoLessonModal = ({ lesson, onComplete, onClose }) => {
  const steps = lesson.steps || [];
  const [stepIdx, setStepIdx] = useState(0);
  const [particles, setParticles] = useState([]);
  const [xpEarned, setXpEarned] = useState(0);

  // Fallback for lessons without steps array
  if (steps.length === 0) {
    const fallbackSteps = [];
    if (lesson.theory) fallbackSteps.push({ type:'teach', title:lesson.title, body:lesson.theory, visual: lesson.exerciseType==='learn'?null:undefined });
    if (lesson.question) fallbackSteps.push({ type:'quiz', question:lesson.question, options:lesson.options, correctIndex:lesson.correctIndex });
    if (lesson.targetNote) fallbackSteps.push({ type:'play_note', targetNote:lesson.targetNote, body:'Encuentra la nota en el teclado' });
    if (lesson.sequence) fallbackSteps.push({ type:'play_sequence', sequence:lesson.sequence, body:'Toca las notas en orden' });
    if (lesson.cascadeNotes) fallbackSteps.push({ type:'cascade', notes:lesson.cascadeNotes, speed:lesson.cascadeSpeed });
    if (lesson.listenNote) fallbackSteps.push({ type:'listen', listenNote:lesson.listenNote, options:lesson.listenOptions });
    if (fallbackSteps.length === 0) fallbackSteps.push({ type:'teach', title:lesson.title, body:lesson.theory||'Contenido de la lección' });
    steps.push(...fallbackSteps);
  }

  const totalSteps = steps.length;
  const currentStep = steps[stepIdx];

  const boom = () => {
    setParticles(Array.from({length:10},(_,i)=>({id:Date.now()+i,x:Math.random()*100,d:Math.random()*0.3,e:['🎵','✨','⭐','🎶','💫'][i%5]})));
    setTimeout(()=>setParticles([]),1500);
  };

  const advance = () => {
    const next = stepIdx + 1;
    if (next >= totalSteps) {
      boom();
      setXpEarned(lesson.xp || 15);
      setTimeout(() => { onComplete(lesson.id); onClose(); }, 1200);
    } else {
      setStepIdx(next);
    }
  };

  const Renderer = RENDERERS[currentStep?.type] || TeachStep;

  return (
    <motion.div className="plm-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
      <motion.div className="plm-modal" initial={{y:40,opacity:0,scale:0.96}} animate={{y:0,opacity:1,scale:1}} exit={{y:20,opacity:0}} onClick={e=>e.stopPropagation()}>
        {particles.map(p=><motion.div key={p.id} className="plm-particle" style={{left:`${p.x}%`}} initial={{y:'100%',opacity:1,scale:0}} animate={{y:'-80px',opacity:0,scale:1.5}} transition={{duration:1,delay:p.d}}>{p.e}</motion.div>)}

        <div className="plm-header">
          <div className="plm-header-left">
            <span className="plm-header-icon">{lesson.icon}</span>
            <div><h3 className="plm-title">{lesson.title}</h3><span className="plm-xp">⚡+{lesson.xp||15} XP</span></div>
          </div>
          <StepDots total={totalSteps} current={stepIdx}/>
          <button className="plm-close" onClick={onClose}>✕</button>
        </div>

        <div className="plm-step-counter">Paso {stepIdx+1} de {totalSteps}</div>

        <AnimatePresence mode="wait">
          <motion.div key={stepIdx} className="plm-content" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} transition={{duration:0.25}}>
            <Renderer step={currentStep} onDone={advance}/>
          </motion.div>
        </AnimatePresence>

        {xpEarned > 0 && <motion.div className="plm-xp-popup" initial={{scale:0}} animate={{scale:1}}>⚡ +{xpEarned} XP</motion.div>}
      </motion.div>
    </motion.div>
  );
};

export default PianoLessonModal;
