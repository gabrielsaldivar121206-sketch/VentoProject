import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sounds, speakText } from '../hooks/useSounds';
import LessonTheory from '../components/LessonTheory/LessonTheory';
import { MatchingGame, WordOrderGame, MemoryMatch, WordScramble, SpeedQuiz } from '../components/MiniGames/MiniGames';
import { PianoKeyGame, RhythmTapGame, NoteSequenceGame } from '../components/MusicMiniGames/MusicMiniGames';
import { VisualCountGame, BalanceScaleGame, MentalMathGame } from '../components/MathMiniGames/MathMiniGames';
import { PieceIdentifierGame, MaterialValueGame, MiniBoardGame } from '../components/ChessMiniGames/ChessMiniGames';
import PianoPlayExercise from '../components/MusicMiniGames/PianoPlayExercise';
import ChessGameExercise from '../components/ChessGame/ChessGameExercise';
import '../components/LessonTheory/LessonTheory.css';
import '../components/MiniGames/MiniGames.css';
import './EnglishModule.css';
import './CourseCardV3.css';
import './AppDashboard.css';

/* ─── Generic Course Module ─────────────────────────────────────────────────
   Receives:
     courseId    – key used for progress storage (e.g. 'math')
     courseName  – display name
     courseColor – primary hex color
     courseEmoji – header emoji
     lessonsData – imported JSON { units: [...] }
     speakLang   – BCP-47 tag for TTS (default 'es-MX')
───────────────────────────────────────────────────────────────────────────── */
const GenericCourseModule = ({ courseId, courseName, courseColor, courseEmoji, lessonsData, speakLang = 'es-MX', PracticeComponent = null }) => {
  const navigate = useNavigate();
  const { user, updateProgress } = useAuth();

  const [lessons]          = useState(lessonsData);
  const [currentLesson,    setCurrentLesson]    = useState(null);
  const [lessonMode,       setLessonMode]       = useState('theory');
  const [exerciseIndex,    setExerciseIndex]    = useState(0);
  const [xp,               setXp]               = useState(user?.progress?.[courseId]?.xp || 0);
  const [streak,           setStreak]           = useState(user?.progress?.[courseId]?.streak || 0);
  const [hearts,           setHearts]           = useState(5);
  const [completedLessons, setCompletedLessons] = useState(user?.progress?.[courseId]?.completedLessons || []);
  const [showXpPopup,      setShowXpPopup]      = useState(false);
  const [xpGained,         setXpGained]         = useState(0);
  const [selectedOption,   setSelectedOption]   = useState(null);
  const [inputValue,       setInputValue]       = useState('');
  const [feedback,         setFeedback]         = useState(null);
  const [answered,         setAnswered]         = useState(false);
  const [lessonXp,         setLessonXp]         = useState(0);
  const [correctCount,     setCorrectCount]     = useState(0);
  const [lessonComplete,   setLessonComplete]   = useState(false);
  const [confettiPieces,   setConfettiPieces]   = useState([]);
  const [exerciseAnim,     setExerciseAnim]     = useState('');
  const [combo,            setCombo]            = useState(0);
  const [maxCombo,         setMaxCombo]         = useState(0);
  const [mounted,          setMounted]          = useState(false);
  const [swappedExercise,  setSwappedExercise]  = useState(null);
  const [practiceMode,     setPracticeMode]     = useState(false);

  // Placement flow
  const [placement, setPlacement] = useState(() => {
    return user?.progress?.[courseId]?.placement || localStorage.getItem(`vento_${courseId}_placement`) || null;
  });

  const handlePlacement = (level) => {
    sounds.buttonPress();
    setPlacement(level);
    localStorage.setItem(`vento_${courseId}_placement`, level);
    if (updateProgress) {
      updateProgress(courseId, { placement: level });
    }
  };

  const filteredUnits = React.useMemo(() => {
    if (!lessons.units) return [];
    if (placement === 'beginner') return lessons.units.slice(0, Math.ceil(lessons.units.length / 3)) || lessons.units;
    if (placement === 'intermediate') return lessons.units.slice(Math.ceil(lessons.units.length / 3), Math.ceil(lessons.units.length * 2 / 3)) || lessons.units;
    if (placement === 'advanced') return lessons.units.slice(Math.ceil(lessons.units.length * 2 / 3)) || lessons.units;
    return lessons.units;
  }, [lessons, placement]);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const levelBadge      = Math.floor(xp / 100) + 1;
  const currentExercise = currentLesson?.exercises?.[exerciseIndex] || null;
  const activeExercise  = swappedExercise || currentExercise;

  /* ── Confetti ── */
  const spawnConfetti = useCallback(() => {
    const colors = ['#58cc02','#1cb0f6','#ce82ff','#ff9600','#ffc800','#ff4b4b'];
    const pieces = Array.from({ length: 35 }, (_, i) => ({
      id: i, x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5, size: 5 + Math.random() * 8,
      rotation: Math.random() * 360,
    }));
    setConfettiPieces(pieces);
    setTimeout(() => setConfettiPieces([]), 2800);
  }, []);

  /* ── Normalize ── */
  const normalize = (str) => {
    if (!str) return '';
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[''´`]/g,'').replace(/[.,!?;:¿¡"()]/g,'').replace(/\s+/g,' ').trim();
  };

  /* ── Save progress ── */
  const saveProgress = useCallback((newXp, newCompleted) => {
    updateProgress(courseId, { xp: newXp, level: Math.floor(newXp/100)+1, streak, completedLessons: newCompleted });
  }, [courseId, streak, updateProgress]);

  /* ── Reset exercise state ── */
  const resetExerciseState = () => {
    setSelectedOption(null); setInputValue(''); setFeedback(null);
    setAnswered(false); setSwappedExercise(null);
    setExerciseAnim('enter'); setTimeout(() => setExerciseAnim(''), 500);
  };

  /* ── Start lesson ── */
  const startLesson = (lesson) => {
    sounds.click(); setCurrentLesson(lesson); setLessonMode('theory');
    setExerciseIndex(0); setLessonXp(0); setCorrectCount(0);
    setLessonComplete(false); setHearts(5); setCombo(0); setMaxCombo(0);
    resetExerciseState();
  };

  const startExercises = () => { sounds.lessonStart(); setLessonMode('exercises'); resetExerciseState(); };

  /* ── TTS ── */
  const speak = useCallback((text) => { sounds.listen(); speakText(text, speakLang, 0.85); }, [speakLang]);

  /* ── Check answer ── */
  const checkAnswer = useCallback((answer) => {
    if (!activeExercise || answered) return;
    const ua = normalize(answer), ca = normalize(activeExercise.answer);
    const altA = normalize(activeExercise.text || '');
    const isCorrect = ua === ca || ua === altA
      || (ca.includes(ua) && ua.length > 2)
      || (ua.includes(ca) && ca.length > 2);

    setAnswered(true);
    if (isCorrect) {
      const nc = combo + 1; setCombo(nc); setMaxCombo(p => Math.max(p, nc));
      sounds.correct();
      if (nc >= 3) setTimeout(() => sounds.combo(nc), 200);
      const base = activeExercise.xp || 5, bonus = nc >= 5 ? 3 : nc >= 3 ? 2 : 0, earned = base + bonus;
      setLessonXp(p => p + earned); setCorrectCount(p => p + 1);
      setFeedback({ correct: true, message: `¡Correcto! +${earned} XP${bonus > 0 ? ` (🔥 combo x${nc}!)` : ''}` });
      setXpGained(earned); setShowXpPopup(true); spawnConfetti();
      setTimeout(() => { setShowXpPopup(false); sounds.xp(); }, 600);
    } else {
      sounds.wrong(); setCombo(0);
      setTimeout(() => sounds.heartLost(), 300);
      setHearts(p => Math.max(0, p - 1));
      setFeedback({ correct: false, message: `Respuesta correcta: "${activeExercise.answer}"` });
    }
  }, [activeExercise, answered, combo, spawnConfetti]);

  /* ── Next exercise ── */
  const nextExercise = () => {
    if (!currentLesson) return; sounds.next();
    if (exerciseIndex + 1 >= currentLesson.exercises.length) {
      const newXp = xp + lessonXp;
      const newCompleted = [...new Set([...completedLessons, currentLesson.id])];
      setXp(newXp); setCompletedLessons(newCompleted); setStreak(p => p + 1);
      setLessonComplete(true); saveProgress(newXp, newCompleted);
      setTimeout(() => sounds.lessonComplete(), 400);
    } else {
      setExerciseIndex(p => p + 1); resetExerciseState();
    }
  };

  /* ── Mini-game result ── */
  const handleMiniGameResult = useCallback((isCorrect, errors = 0) => {
    setAnswered(true);
    if (isCorrect) {
      const nc = combo + 1; setCombo(nc); setMaxCombo(p => Math.max(p, nc));
      const earned = (currentExercise.xp || 5) + (errors === 0 ? 2 : 0);
      setLessonXp(p => p + earned); setCorrectCount(p => p + 1);
      setFeedback({ correct: true, message: `¡Perfecto! +${earned} XP` });
      setXpGained(earned); setShowXpPopup(true); spawnConfetti();
      setTimeout(() => { setShowXpPopup(false); sounds.xp(); }, 600);
    } else {
      setCombo(0); setHearts(p => Math.max(0, p - 1));
      setFeedback({ correct: false, message: 'Sigue practicando 💪' });
    }
  }, [combo, currentExercise, spawnConfetti]);

  /* ── Option click ── */
  const handleOptionClick = (opt) => {
    if (answered) return; sounds.click(); setSelectedOption(opt);
    setTimeout(() => checkAnswer(opt), 150);
  };

  /* ── Stars ── */
  const getStars = () => {
    if (!currentLesson) return 0;
    const pct = correctCount / currentLesson.exercises.length;
    return pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
  };

  /* ── Render exercise ── */
  const renderExercise = () => {
    if (!activeExercise) return null;
    const { type } = activeExercise;
    return (
      <div className={`exercise-card ${exerciseAnim}`} key={`${currentLesson.id}-${exerciseIndex}`}>
        <div className="ex-inner">
        {combo >= 2 && (
          <div className="combo-badge">
            <span className="combo-fire">🔥</span>
            <span className="combo-count">x{combo}</span>
            <span className="combo-label">COMBO</span>
          </div>
        )}

        <span className={`exercise-type-label ${type}`}>
          {type === 'translate'      && '✍️ Respuesta'}
          {type === 'listen'         && '🔊 Escucha'}
          {type === 'fillblank'      && '📝 Completar'}
          {type === 'matching'       && '🔗 Unir'}
          {type === 'wordorder'      && '🔤 Ordenar'}
          {type === 'memory'         && '🧠 Memoria'}
          {type === 'scramble'       && '🔀 Descifrar'}
          {type === 'speed'          && '⚡ Velocidad'}
          {type === 'piano'          && '🎹 Piano'}
          {type === 'rhythm'         && '🥁 Ritmo'}
          {type === 'note_seq'       && '🎼 Secuencia'}
          {type === 'visual'         && '🔢 Contar'}
          {type === 'balance'        && '⚖️ Balanza'}
          {type === 'mental_math'    && '⚡ Cálculo'}
          {type === 'piano_play'     && '🎹 Piano'}
          {type === 'chess_game'     && '♟️ Partida'}
          {type === 'material_value' && '⚖️ Material'}
          {type === 'board_move'     && '🏁 Tablero'}
        </span>

        {type === 'translate' && (
          <>
            <p className="exercise-question">{activeExercise.question}</p>
            <p className="exercise-instruction">Selecciona la respuesta correcta</p>
            <div className="options-grid-v2">
              {activeExercise.options.map((opt, i) => (
                <button key={i}
                  className={`option-btn-v2 ${answered ? (opt === activeExercise.answer ? 'correct' : selectedOption === opt ? 'wrong' : 'dim') : selectedOption === opt ? 'selected' : ''}`}
                  onClick={() => handleOptionClick(opt)}
                  onMouseEnter={() => !answered && sounds.hover()}
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <span className="opt-letter">{['A','B','C','D'][i]}</span>
                  <span className="opt-text">{opt}</span>
                  <span className="opt-check">{answered && opt === activeExercise.answer ? '✓' : answered && selectedOption === opt ? '✕' : ''}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {type === 'listen' && (
          <>
            <p className="exercise-instruction">{activeExercise.instruction}</p>
            <button className="btn-listen" onClick={() => speak(activeExercise.text)}>
              <span className="btn-listen-icon">🔊</span>
              <span className="btn-listen-ripple" /><span className="btn-listen-ripple r2" />
            </button>
            <input type="text" className={`exercise-input ${answered ? (feedback?.correct ? 'correct' : 'wrong') : ''}`}
              placeholder="Escribe lo que escuchas..." value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !answered) { sounds.click(); checkAnswer(inputValue); } }}
              disabled={answered} autoFocus />
            {!answered && (
              <button className="btn btn-blue btn-full" onClick={() => { sounds.click(); checkAnswer(inputValue); }} disabled={!inputValue.trim()}>
                VERIFICAR
              </button>
            )}
          </>
        )}

        {type === 'fillblank' && (
          <>
            <p className="exercise-question fillblank-q">
              {activeExercise.sentence.split('___').map((part, i, arr) => (
                <span key={i}>{part}{i < arr.length - 1 && <span className="blank-slot">{selectedOption && answered ? selectedOption : '      '}</span>}</span>
              ))}
            </p>
            <p className="exercise-instruction">Elige la palabra correcta</p>
            <div className="options-grid-v2">
              {activeExercise.options.map((opt, i) => (
                <button key={i}
                  className={`option-btn-v2 ${answered ? (opt === activeExercise.answer ? 'correct' : selectedOption === opt ? 'wrong' : 'dim') : selectedOption === opt ? 'selected' : ''}`}
                  onClick={() => handleOptionClick(opt)}
                  onMouseEnter={() => !answered && sounds.hover()}
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <span className="opt-letter">{['A','B','C','D'][i]}</span>
                  <span className="opt-text">{opt}</span>
                  <span className="opt-check">{answered && opt === activeExercise.answer ? '✓' : answered && selectedOption === opt ? '✕' : ''}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {type === 'matching'       && !answered && <MatchingGame        exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'wordorder'      && !answered && <WordOrderGame       exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'memory'         && !answered && <MemoryMatch         exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'scramble'       && !answered && <WordScramble        exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'speed'          && !answered && <SpeedQuiz           exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'piano'          && !answered && <PianoKeyGame        exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'rhythm'         && !answered && <RhythmTapGame       exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'note_seq'       && !answered && <NoteSequenceGame    exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'visual'         && !answered && <VisualCountGame     exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'balance'        && !answered && <BalanceScaleGame    exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'mental_math'    && !answered && <MentalMathGame      exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'piece_id'       && !answered && <PieceIdentifierGame exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'material_value' && !answered && <MaterialValueGame   exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'board_move'     && !answered && <MiniBoardGame       exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'piano_play'     && !answered && <PianoPlayExercise   exercise={currentExercise} onResult={handleMiniGameResult} />}
        {type === 'chess_game'     && !answered && <ChessGameExercise   exercise={currentExercise} onResult={handleMiniGameResult} />}

        {feedback && (['matching','wordorder','memory','scramble','speed','piano','rhythm','note_seq','visual','balance','mental_math','piece_id','material_value','board_move','piano_play','chess_game'].includes(type) ? answered : true) && (
          <div className={`feedback-banner-v2 ${feedback.correct ? 'fb-correct' : 'fb-wrong'}`}>
            <div className="fb-icon-wrap">
              <span className="fb-icon">{feedback.correct ? '🎉' : '💔'}</span>
            </div>
            <div className="fb-body">
              <p className="fb-title">{feedback.correct ? '¡Excelente!' : '¡Casi!'}</p>
              <p className="fb-msg">{feedback.message}</p>
            </div>
          </div>
        )}
        </div>{/* /ex-inner */}
      </div>
    );
  };

  /* ── Lesson Complete ── */
  if (lessonComplete) {
    const stars = getStars();
    return (
      <div className="lesson-complete-page">
        <div className="confetti-layer" aria-hidden="true">
          {Array.from({ length: 50 }, (_, i) => (
            <span key={i} className="confetti-piece" style={{
              left: `${Math.random()*100}%`, animationDelay: `${Math.random()*2}s`,
              backgroundColor: ['#58cc02','#1cb0f6','#ce82ff','#ff9600','#ffc800','#ff4b4b'][i%6],
              width: `${5+Math.random()*8}px`, height: `${5+Math.random()*8}px`,
            }} />
          ))}
        </div>
        <div className="lesson-complete-card">
          <div className="stars-row">
            {[1,2,3].map(s => (
              <span key={s} className={`star-item ${s<=stars?'earned':'empty'}`} style={{ animationDelay:`${0.3+s*0.2}s` }}>
                {s<=stars?'⭐':'☆'}
              </span>
            ))}
          </div>
          <h2 className="complete-title">¡Lección Completada!</h2>
          <p className="complete-lesson-name">{currentLesson.titleEs || currentLesson.title}</p>
          <div className="complete-stats-row">
            <div className="complete-stat"><div className="complete-stat-value cs-orange">+{lessonXp}</div><div className="complete-stat-label">XP Ganado</div></div>
            <div className="complete-stat"><div className="complete-stat-value cs-green">{correctCount}/{currentLesson.exercises.length}</div><div className="complete-stat-label">Correctas</div></div>
            <div className="complete-stat"><div className="complete-stat-value cs-red">🔥 {streak}</div><div className="complete-stat-label">Racha</div></div>
            {maxCombo >= 2 && <div className="complete-stat"><div className="complete-stat-value cs-purple">x{maxCombo}</div><div className="complete-stat-label">Max Combo</div></div>}
          </div>
          <div className="complete-buttons">
            <button className="btn btn-green btn-full btn-lg"
              onClick={() => { sounds.navigate(); setCurrentLesson(null); setLessonComplete(false); }}>
              CONTINUAR →
            </button>
            <button className="btn btn-outline btn-full"
              onClick={() => { sounds.navigate(); navigate('/dashboard'); }}>
              IR AL INICIO
            </button>
          </div>
        </div>
      </div>
    );
  }

  const UNIT_COLORS = [courseColor, '#1cb0f6', '#ce82ff', '#ff9600', '#ff4b4b'];

  /* ── Main render ── */
  return (
    <div className={`eng-page ${mounted ? 'mounted' : ''}`} style={{ '--course-color': courseColor }}>
      {confettiPieces.length > 0 && (
        <div className="confetti-layer" aria-hidden="true">
          {confettiPieces.map(p => (
            <span key={p.id} className="confetti-piece" style={{
              left:`${p.x}%`, animationDelay:`${p.delay}s`,
              backgroundColor:p.color, width:`${p.size}px`, height:`${p.size}px`,
              transform:`rotate(${p.rotation}deg)`,
            }} />
          ))}
        </div>
      )}

      {showXpPopup && (
        <div className="xp-popup">
          <div className="xp-popup-value">+{xpGained}</div>
          <div className="xp-popup-label">XP</div>
        </div>
      )}

      {/* Top bar — only show if in a lesson */}
      {currentLesson && (
        <div className="eng-topbar" style={{ borderBottomColor: `${courseColor}22` }}>
          <div className="eng-topbar-inner">
            <button className="eng-back-btn" onClick={() => {
              sounds.navigate();
              if (currentLesson && lessonMode === 'exercises') { setLessonMode('theory'); resetExerciseState(); }
              else if (currentLesson) setCurrentLesson(null);
              else navigate('/dashboard');
            }}>
              ← {currentLesson && lessonMode === 'exercises' ? 'Tutorial' : currentLesson ? 'Lecciones' : 'Inicio'}
            </button>
            {currentLesson && lessonMode === 'exercises' && <span className="eng-topbar-title">{currentLesson.titleEs}</span>}
            <div className="eng-topbar-stats">
              <span className="eng-stat xp">⚡ {xp}</span>
              <span className="eng-stat streak">🔥 {streak}</span>
              <div className="eng-hearts">
                {Array.from({ length:5 }, (_,i) => (
                  <span key={i} className={i<hearts?'heart-full':'heart-empty'}>{i<hearts?'❤️':'🖤'}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="eng-content" style={{ paddingBottom: currentLesson && answered ? '100px' : '2rem' }}>
        {currentLesson && lessonMode === 'theory' ? (
          <LessonTheory lesson={currentLesson} onStart={startExercises} speakLang={speakLang} onBack={() => { sounds.navigate(); setCurrentLesson(null); }} />
        ) : currentLesson && lessonMode === 'exercises' ? (
          <div className="exercise-view">
            <div className="exercise-progress-bar">
              <button className="exercise-close-btn" onClick={() => { sounds.navigate(); setCurrentLesson(null); }}>✕</button>
              <div className="exercise-progress-track">
                <div className="progress-bar-fancy">
                  <div className="progress-fill-fancy"
                    style={{ width:`${((exerciseIndex+(answered?1:0))/currentLesson.exercises.length)*100}%`, background:courseColor }}>
                    <div className="progress-shimmer" />
                  </div>
                </div>
              </div>
              <span className="exercise-counter">{exerciseIndex+1}/{currentLesson.exercises.length}</span>
            </div>
            {renderExercise()}
          </div>
        ) : practiceMode && PracticeComponent ? (
          <div className="practice-mode-view">
            <PracticeComponent onClose={() => setPracticeMode(false)} />
          </div>
        ) : (
          <div style={{ maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
            {/* Back to Home Header */}
            <header style={{ marginBottom: '2rem', padding: '1.5rem 1.5rem 0' }}>
              <button className="sl-back-btn" onClick={() => { sounds.navigate(); navigate('/dashboard'); }} style={{ fontFamily: 'var(--font)', fontSize: '13px', fontWeight: 600, padding: '8px 16px', borderRadius: '100px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.25s' }}>
                ← Volver al Inicio
              </button>
            </header>

            {/* Premium Course Dashboard Hero for Generic Modules */}
            <div className="pro-dashboard-hero" style={{ margin: '0 1.5rem 3rem' }}>
              <div className="pdh-top-row" style={{ padding: '3rem', borderRadius: '32px', background: 'var(--bg-card-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: `color-mix(in srgb, ${courseColor} 20%, transparent)` }}>
                <div className="pdh-greeting-col" style={{ gap: '0.5rem', flex: 1 }}>
                  <div className="pdh-time-badge" style={{ display: 'inline-flex', marginBottom: '1rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', alignItems: 'center', gap: '0.5rem' }}>
                    {courseEmoji} Módulo de Aprendizaje
                  </div>
                  <h1 className="pdh-title" style={{ fontSize: '3rem', marginBottom: '0', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em' }}>{courseName.split(':')[0]} <span style={{ color: courseColor }}>{courseName.split(':')[1] || ''}</span></h1>
                  <p className="pdh-subtitle" style={{ fontSize: '1.2rem', maxWidth: '600px', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                    Completa lecciones, acumula experiencia y domina nuevas habilidades. <strong>¡Sube de nivel!</strong>
                  </p>
                  
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <div className="pdh-motivational-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: `color-mix(in srgb, ${courseColor} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${courseColor} 30%, transparent)`, padding: '0.6rem 1.2rem', borderRadius: '100px', fontWeight: 700, fontSize: '0.95rem', color: courseColor }}>
                      ⚡ {xp} XP Total
                    </div>
                    <div className="pdh-motivational-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255, 71, 87, 0.1)', border: '1px solid rgba(255, 71, 87, 0.3)', padding: '0.6rem 1.2rem', borderRadius: '100px', fontWeight: 700, fontSize: '0.95rem', color: '#ff4757' }}>
                      🔥 Racha de {streak}
                    </div>
                  </div>
                </div>

                <div className="pdh-level-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div className="pdh-level-ring-container" style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg className="pdh-ring-svg" width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                      <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                      <circle cx="70" cy="70" r="62" fill="none" stroke={courseColor} strokeWidth="10" strokeDasharray="389.5" strokeDashoffset={389.5 - (389.5 * (completedLessons.length / (lessons.units.reduce((acc, u) => acc + u.lessons.length, 0)) || 0))} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                    </svg>
                    <div className="pdh-level-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                      <span className="pdh-lvl-num" style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{Math.floor((completedLessons.length / (lessons.units.reduce((acc, u) => acc + u.lessons.length, 0)) || 0) * 100)}%</span>
                      <span className="pdh-lvl-label" style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>PROGRESO</span>
                    </div>
                  </div>
                  <div className="pdh-xp-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.5px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    Nivel {level}
                  </div>
                </div>
              </div>
            </div>

            {/* Practice Mode button */}
            {PracticeComponent && (
              <div style={{ margin: '0 1.5rem 2rem' }}>
                <button className="practice-mode-btn" style={{ '--pc': courseColor, width: '100%' }}
                  onClick={() => { sounds.buttonPress(); setPracticeMode(true); }}>
                  <span className="pmb-icon">{courseId==='chess'?'♟️':'🎹'}</span>
                  <span className="pmb-label" style={{ flex: 1, textAlign: 'left' }}>{courseId==='chess'?'Jugar Partida Libre de Ajedrez':'Abrir Piano Digital Libre'}</span>
                  <span className="pmb-arrow">→</span>
                </button>
              </div>
            )}

            <div className="lesson-map" style={{ padding: '0 1.5rem' }}>
              {lessons.units.map((unit, ui) => {
                const color = UNIT_COLORS[ui % UNIT_COLORS.length];
              const unitCompleted = unit.lessons.filter(l => completedLessons.includes(l.id)).length;
              const unitPct = Math.round((unitCompleted / unit.lessons.length) * 100);
              return (
                <div key={unit.id} className="unit-block" style={{ animationDelay:`${ui*0.12}s`, '--unit-color': color }}>
                  <div className="unit-header-card" style={{ '--unit-color': color }}>
                    <div className="unit-icon-wrap" style={{ background:`${color}22`, borderColor:`${color}35` }}>{unit.icon}</div>
                    <div className="unit-info">
                      <h3 className="unit-title">{unit.titleEs || unit.title}</h3>
                      <p className="unit-subtitle">{unit.description}</p>
                    </div>
                    <div className="unit-right">
                      <span className="unit-lesson-count">{unitCompleted}/{unit.lessons.length}</span>
                      <div className="unit-progress-mini">
                        <div className="unit-progress-fill" style={{ width: `${unitPct}%`, background: color }} />
                      </div>
                    </div>
                  </div>
                  <div className="lessons-grid">
                    {unit.lessons.map((lesson, li) => {
                      const isCompleted = completedLessons.includes(lesson.id);
                      return (
                        <div key={lesson.id} className={`lesson-card-v2 ${isCompleted ? 'done' : ''}`}
                          style={{ '--lc': color, animationDelay: `${(ui * 0.12) + (li * 0.06)}s` }}
                          onClick={() => startLesson(lesson)}
                          onMouseEnter={() => sounds.hover()}>
                          <div className="lc-top-stripe" />
                          <div className="lc-icon">{isCompleted ? '⭐' : unit.icon}</div>
                          <span className="lc-title">{lesson.titleEs || lesson.title}</span>
                          <span className="lc-xp">+{lesson.xpReward} XP</span>
                          {isCompleted && <span className="lc-check">✓</span>}
                          {!isCompleted && <span className="lc-play">▶</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}
      </div>

      {currentLesson && answered && (
        <div className="exercise-bottom-bar">
          <div className="exercise-bottom-inner">
            <button className={`btn ${feedback?.correct?'btn-green':'btn-red'} btn-full btn-lg`} onClick={nextExercise}
              style={feedback?.correct ? { background:`linear-gradient(135deg,${courseColor},${courseColor}cc)` } : {}}>
              {exerciseIndex+1 >= currentLesson.exercises.length ? '🏆 COMPLETAR LECCIÓN' : 'SIGUIENTE →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericCourseModule;
