import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sounds, speakText } from '../hooks/useSounds';
import lessonsJson from '../../data/lessons.json';
import LessonTheory from '../components/LessonTheory/LessonTheory';
import { MatchingGame, WordOrderGame, MemoryMatch, WordScramble, SpeedQuiz } from '../components/MiniGames/MiniGames';
import ExercisePicker from '../components/ExercisePicker/ExercisePicker';
import '../components/LessonTheory/LessonTheory.css';
import '../components/MiniGames/MiniGames.css';
import './EnglishModule.css';
import './ModuleShared.css';

const API_BASE = 'http://localhost:5000';
const UNIT_COLORS = ['#58cc02', '#1cb0f6', '#ce82ff', '#ff9600', '#ff4b4b'];

const EnglishModule = () => {
  const navigate = useNavigate();
  const { user, updateProgress } = useAuth();

   const [lessons] = useState(lessonsJson);
   const [currentLesson, setCurrentLesson] = useState(null);
   const [lessonMode, setLessonMode] = useState('theory'); // 'theory' | 'exercises'
   const [exerciseIndex, setExerciseIndex] = useState(null);
   const [xp, setXp] = useState(user?.progress?.english?.xp || 0);
   const [streak, setStreak] = useState(user?.progress?.english?.streak || 0);
   const [hearts, setHearts] = useState(5);
   const [completedLessons, setCompletedLessons] = useState(user?.progress?.english?.completedLessons || []);
   // Track completed exercises per lesson (Map: lessonId -> Set<exerciseIndex>)
   const [lessonExerciseProgress, setLessonExerciseProgress] = useState(() => {
     const saved = user?.progress?.english?.lessonExerciseProgress;
     if (saved) {
       const map = new Map();
       Object.entries(saved).forEach(([k, v]) => map.set(k, new Set(v)));
       return map;
     }
     return new Map();
   });
   const [showXpPopup, setShowXpPopup] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechResult, setSpeechResult] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [lessonXp, setLessonXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [exerciseAnim, setExerciseAnim] = useState('');
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('levels'); // 'levels' | 'pronunciation'
  const [pronPhrase, setPronPhrase] = useState(null);
  const [pronRecording, setPronRecording] = useState(false);
  const [pronResult, setPronResult] = useState(null);
  const [pronScore, setPronScore] = useState(null);
  // Placement flow
  const [placement, setPlacement] = useState(() => {
    return user?.progress?.english?.placement || localStorage.getItem('vento_english_placement') || null;
  });
  const [exerciseMode, setExerciseMode] = useState('picker');

  const handlePlacement = (level) => {
    sounds.buttonPress();
    setPlacement(level);
    localStorage.setItem('vento_english_placement', level);
    if (updateProgress) {
      updateProgress('english', { placement: level });
    }
  };

  const filteredUnits = React.useMemo(() => {
    if (!lessons.units) return [];
    if (placement === 'beginner') return lessons.units.slice(0, 2);
    if (placement === 'intermediate') return lessons.units.slice(2, 4);
    if (placement === 'advanced') return lessons.units.slice(4, 5);
    return lessons.units;
  }, [lessons, placement]);

  const recognitionRef = useRef(null);
  const levelBadge = Math.floor(xp / 100) + 1;
  const currentExercise = currentLesson?.exercises?.[exerciseIndex] || null;

  // Ejercicio alternativo cuando el usuario no tiene micrófono
  const [swappedExercise, setSwappedExercise] = useState(null);

  // El ejercicio que realmente se muestra (original o swapped)
  const activeExercise = swappedExercise || currentExercise;

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  /* ── Confetti ─────────────────────────────────────────────────────────── */
  const spawnConfetti = useCallback(() => {
    const colors = ['#58cc02', '#1cb0f6', '#ce82ff', '#ff9600', '#ffc800', '#ff4b4b'];
    const pieces = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      size: 5 + Math.random() * 8,
      rotation: Math.random() * 360,
    }));
    setConfettiPieces(pieces);
    setTimeout(() => setConfettiPieces([]), 2800);
  }, []);

  /* ── Normalize ─────────────────────────────────────────────────────────── */
  const normalize = (str) => {
    if (!str) return '';
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[''´`]/g, '').replace(/[.,!?;:¿¡"()]/g, '').replace(/\s+/g, ' ').trim();
  };

  /* Levenshtein distance for fuzzy string matching */
  const levenshtein = (a, b) => {
    if (!a || !b) return Math.max((a||'').length, (b||'').length);
    const m = a.length, n = b.length;
    const dp = Array.from({length: m + 1}, (_, i) => Array.from({length: n + 1}, (_, j) => i === 0 ? j : j === 0 ? i : 0));
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[m][n];
  };

   /* ── Save progress ─────────────────────────────────────────────────────── */
   const saveProgress = useCallback((newXp, newCompleted, newStreak, newLessonProgressMap) => {
     const lessonProgressObj = {};
     newLessonProgressMap.forEach((completedSet, lessonId) => {
       lessonProgressObj[lessonId] = Array.from(completedSet);
     });
     const data = {
       xp: newXp,
       level: Math.floor(newXp / 100) + 1,
       streak: newStreak,
       completedLessons: newCompleted,
       lessonExerciseProgress: lessonProgressObj
     };
     updateProgress('english', data);
   }, [updateProgress]);

   /* ── Load progress from user on mount ─────────────────────────────────── */
   useEffect(() => {
     if (user?.progress?.english) {
       const p = user.progress.english;
       if (p.xp !== undefined) setXp(p.xp);
       if (p.streak !== undefined) setStreak(p.streak);
       if (p.completedLessons) setCompletedLessons(p.completedLessons);
       if (p.lessonExerciseProgress) {
         const map = new Map();
         Object.entries(p.lessonExerciseProgress).forEach(([k, v]) => {
           map.set(k, new Set(v));
         });
         setLessonExerciseProgress(map);
       }
     }
   }, []);

   /* ── Start lesson — show theory first ─────────────────────────────────── */
   const startLesson = (lesson) => {
     sounds.click();
     setCurrentLesson(lesson);
     setLessonMode('theory');
     setExerciseIndex(null);
     setExerciseMode('picker');
     setLessonXp(0);
     setCorrectCount(0);
     setLessonComplete(false);
     setHearts(5);
     setCombo(0);
     setMaxCombo(0);
     resetExerciseState();
   };

   const startExercises = () => {
     sounds.lessonStart();
     setLessonMode('exercises');
     setExerciseMode('picker'); // Show picker to choose exercises
     // Reset exercise state when entering picker
     resetExerciseState();
   };

  const resetExerciseState = () => {
    setSelectedOption(null);
    setInputValue('');
    setFeedback(null);
    setSpeechResult(null);
    setAnswered(false);
    setSwappedExercise(null);
    setExerciseAnim('enter');
    setTimeout(() => setExerciseAnim(''), 500);
  };

  /* ── Skip speak → convert to translate (sin micrófono) ─────────────── */
  const skipSpeakExercise = () => {
    if (!currentExercise || currentExercise.type !== 'speak') return;
    sounds.click();
    // Construir opciones: la respuesta correcta + 3 distractores del mismo ejercicio
    const correct = currentExercise.text;
    const distractors = [
      currentExercise.textEs ? `${currentExercise.textEs} (ES)` : 'Good morning',
      'How are you?',
      'See you later',
      'Thank you very much',
      'Nice to meet you',
    ].filter(d => d !== correct).slice(0, 3);
    const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
    setSwappedExercise({
      ...currentExercise,
      type: 'translate',
      question: `¿Cómo se dice en inglés: "${currentExercise.textEs || currentExercise.text}"?`,
      options,
      answer: correct,
      xp: Math.max(1, (currentExercise.xp || 5) - 2), // menos XP por la versión fácil
    });
  };

  /* ── Check answer ──────────────────────────────────────────────────────── */
  const checkAnswer = useCallback((answer) => {
    if (!activeExercise || answered) return;
    const userAnswer = normalize(answer);
    const correctAnswer = normalize(activeExercise.answer);
    const altAnswer = normalize(activeExercise.text);
    const isCorrect = userAnswer === correctAnswer || userAnswer === altAnswer
      || (correctAnswer.includes(userAnswer) && userAnswer.length > 2)
      || (userAnswer.includes(correctAnswer) && correctAnswer.length > 2);

    setAnswered(true);

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));

      sounds.correct();
      if (newCombo >= 3) setTimeout(() => sounds.combo(newCombo), 200);

      const baseXp = activeExercise.xp || 5;
      const comboBonus = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 0;
      const earned = baseXp + comboBonus;

      setLessonXp(prev => prev + earned);
      setCorrectCount(prev => prev + 1);
      setFeedback({
        correct: true,
        message: `¡Correcto! +${earned} XP${comboBonus > 0 ? ` (🔥 combo x${newCombo}!)` : ''}${
          swappedExercise ? ' (versión escrita)' : ''
        }`
      });
      setXpGained(earned);
      setShowXpPopup(true);
      spawnConfetti();
      setTimeout(() => { setShowXpPopup(false); sounds.xp(); }, 600);
    } else {
      sounds.wrong();
      setCombo(0);
      setTimeout(() => sounds.heartLost(), 300);
      setHearts(prev => Math.max(0, prev - 1));
      setFeedback({ correct: false, message: `Respuesta correcta: "${activeExercise.answer}"` });
    }
  }, [activeExercise, answered, combo, spawnConfetti, swappedExercise]);

   /* ── Select exercise from picker ──────────────────────────────────────── */
   const selectExercise = (index) => {
     sounds.click();
     setExerciseIndex(index);
     setExerciseMode('exercise'); // Switch to exercise view
     resetExerciseState();
   };

   /* ── Next exercise ─────────────────────────────────────────────────────── */
   const nextExercise = () => {
     if (!currentLesson) return;
     sounds.next();

     const lessonId = currentLesson.id;
     const existingSet = lessonExerciseProgress.get(lessonId);
     const completedSet = existingSet ? new Set(existingSet) : new Set();
     completedSet.add(exerciseIndex);

     const newLessonProgressMap = new Map(lessonExerciseProgress);
     newLessonProgressMap.set(lessonId, completedSet);

     const totalExercises = currentLesson.exercises.length;

     if (completedSet.size >= totalExercises) {
       // Lesson fully completed
       const newXp = xp + lessonXp;
       const newCompleted = [...new Set([...completedLessons, currentLesson.id])];
       const newStreak = streak + 1;
       setXp(newXp);
       setCompletedLessons(newCompleted);
       setStreak(newStreak);
       setLessonExerciseProgress(newLessonProgressMap);
       setLessonComplete(true);
       saveProgress(newXp, newCompleted, newStreak, newLessonProgressMap);
       setTimeout(() => sounds.lessonComplete(), 400);
     } else {
       // Return to picker to choose next exercise
       setLessonExerciseProgress(newLessonProgressMap);
       setExerciseMode('picker');
       setAnswered(false);
       setFeedback(null);
       // Save progress to persist completed exercises
       saveProgress(xp, completedLessons, streak, newLessonProgressMap);
     }
   };

  /* ── TTS ────────────────────────────────────────────────────────────────── */
  const speak = useCallback((text, lang = 'en-US') => {
    sounds.listen();
    speakText(text, lang, 0.85);
  }, []);

  /* ── Speech Recognition ─────────────────────────────────────────────────── */
  const startRecording = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      // No hay soporte: ofrecer cambio automático
      skipSpeakExercise();
      return;
    }

    sounds.recordStart();
    const rec = new SR();
    rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 3;

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setSpeechResult(transcript);
      setIsRecording(false);

      const expected = normalize(activeExercise?.text);
      const got = normalize(transcript);
      let matched = false;

      for (let i = 0; i < e.results[0].length; i++) {
        if (normalize(e.results[0][i].transcript) === expected) { matched = true; break; }
      }
      if (!matched) {
        const ew = expected.split(/\s+/), gw = got.split(/\s+/);
        matched = ew.filter(w => gw.includes(w)).length / ew.length >= 0.5;
      }
      if (!matched && (got.includes(expected) || expected.includes(got)) && got.length >= 3) matched = true;

      if (matched) {
        const newCombo = combo + 1;
        setCombo(newCombo);
        setMaxCombo(prev => Math.max(prev, newCombo));
        sounds.correct();
        if (newCombo >= 3) setTimeout(() => sounds.combo(newCombo), 200);

        const baseXp = activeExercise.xp || 5;
        const comboBonus = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 0;
        const earned = baseXp + comboBonus;

        setLessonXp(prev => prev + earned);
        setCorrectCount(prev => prev + 1);
        setAnswered(true);
        setFeedback({
          correct: true,
          message: `¡Correcto! +${earned} XP${comboBonus > 0 ? ` (🔥 combo x${newCombo}!)` : ''}`
        });
        setXpGained(earned);
        setShowXpPopup(true);
        spawnConfetti();
        setTimeout(() => { setShowXpPopup(false); sounds.xp(); }, 600);
        setSpeechResult(`"${transcript}" ✓`);
      } else {
        sounds.wrong();
        setCombo(0);
        setTimeout(() => sounds.heartLost(), 300);
        setAnswered(true);
        setHearts(prev => Math.max(0, prev - 1));
        setFeedback({ correct: false, message: `Dijiste: "${transcript}". Se esperaba: "${activeExercise.text}"` });
        setSpeechResult(`"${transcript}" ✗`);
      }
    };

    rec.onerror = (err) => {
      setIsRecording(false);
      sounds.recordStop();
      // Si el error es por falta de permiso o hardware, sugerimos cambio
      if (err.error === 'not-allowed' || err.error === 'audio-capture' || err.error === 'no-speech') {
        setSpeechResult('⚠️ No se detectó micrófono. Usa el botón de abajo para cambiar el ejercicio.');
      } else {
        setSpeechResult('No se pudo capturar el audio.');
      }
    };
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start();
    setIsRecording(true);
    setSpeechResult(null);
  }, [activeExercise, combo, spawnConfetti, skipSpeakExercise]);

  /* ── Option click ──────────────────────────────────────────────────────── */
  const handleOptionClick = (opt) => {
    if (answered) return;
    sounds.click();
    setSelectedOption(opt);
    setTimeout(() => checkAnswer(opt), 150);
  };

  /* ── Calculate stars ───────────────────────────────────────────────────── */
  const getStars = () => {
    if (!currentLesson) return 0;
    const total = currentLesson.exercises.length;
    const pct = correctCount / total;
    if (pct >= 0.9) return 3;
    if (pct >= 0.7) return 2;
    if (pct >= 0.4) return 1;
    return 0;
  };

  /* ── Mini-game result handler ─────────────────────────────────────────── */
  const handleMiniGameResult = useCallback((isCorrect, errors = 0) => {
    setAnswered(true);
    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      const earned = (currentExercise.xp || 5) + (errors === 0 ? 2 : 0);
      setLessonXp(prev => prev + earned);
      setCorrectCount(prev => prev + 1);
      setFeedback({ correct: true, message: `¡Perfecto! +${earned} XP` });
      setXpGained(earned); setShowXpPopup(true);
      spawnConfetti();
      setTimeout(() => { setShowXpPopup(false); sounds.xp(); }, 600);
    } else {
      setCombo(0);
      setHearts(prev => Math.max(0, prev - 1));
      setFeedback({ correct: false, message: 'Sigue practicando' });
    }
  }, [combo, currentExercise, spawnConfetti]);

  /* ── Render Exercise ───────────────────────────────────────────────────── */
  const renderExercise = () => {
    if (!activeExercise) return null;
    const { type } = activeExercise;

    return (
      <div className={`exercise-card ${exerciseAnim}`} key={`${currentLesson.id}-${exerciseIndex}`}>
        {/* Combo indicator */}
        {combo >= 2 && (
          <div className="combo-badge">
            <span className="combo-fire">🔥</span>
            <span className="combo-count">x{combo}</span>
            <span className="combo-label">COMBO</span>
          </div>
        )}

        <span className={`exercise-type-label ${type}`}>
          {type === 'translate' && (swappedExercise ? '✍️ Ejercicio escrito' : '✍️ Traducción')}
          {type === 'listen' && '🔊 Escucha'}
          {type === 'speak' && '🎤 Pronunciación'}
          {type === 'fillblank' && '📝 Completar'}
        </span>

        {type === 'translate' && (
          <>
            <p className="exercise-question">{activeExercise.question}</p>
            <p className="exercise-instruction">Selecciona la respuesta correcta</p>
            <div className="options-grid">
              {activeExercise.options.map((opt, i) => (
                <button key={i}
                  className={`option-btn ${answered ? (opt === activeExercise.answer ? 'correct' : selectedOption === opt ? 'wrong' : 'dim') : selectedOption === opt ? 'selected' : ''}`}
                  onClick={() => handleOptionClick(opt)}
                  onMouseEnter={() => !answered && sounds.hover()}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >{opt}</button>
              ))}
            </div>
          </>
        )}

        {type === 'listen' && (
          <>
            <p className="exercise-instruction">{activeExercise.instruction}</p>
            <button className="btn-listen" onClick={() => speak(activeExercise.text)}>
              <span className="btn-listen-icon">🔊</span>
              <span className="btn-listen-ripple" />
              <span className="btn-listen-ripple r2" />
            </button>
            <input type="text"
              className={`exercise-input ${answered ? (feedback?.correct ? 'correct' : 'wrong') : ''}`}
              placeholder="Escribe lo que escuchas..." value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !answered) { sounds.click(); checkAnswer(inputValue); } }}
              disabled={answered} autoFocus
            />
            {!answered && (
              <button className="btn btn-blue btn-full" onClick={() => { sounds.click(); checkAnswer(inputValue); }} disabled={!inputValue.trim()}>
                VERIFICAR
              </button>
            )}
          </>
        )}

        {type === 'speak' && (
          <>
            <p className="exercise-instruction">{activeExercise.instruction || 'Repite la siguiente frase en voz alta'}</p>
            <div className="speech-text-card">
              <p className="speech-text-en">{activeExercise.text}</p>
              {activeExercise.textEs && <p className="speech-text-es">{activeExercise.textEs}</p>}
            </div>
            <div className="speak-controls">
              <button className="btn-listen-sm" onClick={() => speak(activeExercise.text)} onMouseEnter={() => sounds.hover()}>🔊</button>
              <button className={`btn-mic ${isRecording ? 'recording' : ''}`}
                onClick={() => { if (isRecording) { recognitionRef.current?.stop(); sounds.recordStop(); } else startRecording(); }}
                disabled={answered}
                onMouseEnter={() => !answered && sounds.hover()}
              >
                <span>{isRecording ? '⏹️' : '🎤'}</span>
                {isRecording && <span className="mic-wave" />}
                {isRecording && <span className="mic-wave w2" />}
              </button>
            </div>
            {speechResult && (
              <p className={`speech-result-text ${feedback?.correct ? 'match' : 'no-match'}`}>{speechResult}</p>
            )}
            {/* ── Botón "Sin micrófono" al estilo Duolingo ── */}
            {!answered && (
              <button
                className="btn-no-mic"
                onClick={skipSpeakExercise}
                onMouseEnter={() => sounds.hover()}
                title="Cambiar a ejercicio escrito"
              >
                <span className="no-mic-icon">🎤❌</span>
                No tengo micrófono · Cambiar ejercicio
              </button>
            )}
          </>
        )}

        {type === 'fillblank' && (
          <>
            <p className="exercise-question">{activeExercise.sentence.replace('___', ' ______ ')}</p>
            <p className="exercise-instruction">Elige la palabra correcta</p>
            <div className="options-grid">
              {activeExercise.options.map((opt, i) => (
                <button key={i}
                  className={`option-btn ${answered ? (opt === activeExercise.answer ? 'correct' : selectedOption === opt ? 'wrong' : 'dim') : selectedOption === opt ? 'selected' : ''}`}
                  onClick={() => handleOptionClick(opt)}
                  onMouseEnter={() => !answered && sounds.hover()}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >{opt}</button>
              ))}
            </div>
          </>
        )}

        {type === 'matching' && !answered && (
          <MatchingGame exercise={currentExercise} onResult={handleMiniGameResult} />
        )}
        {type === 'wordorder' && !answered && (
          <WordOrderGame exercise={currentExercise} onResult={handleMiniGameResult} />
        )}
        {type === 'memory' && !answered && (
          <MemoryMatch exercise={currentExercise} onResult={handleMiniGameResult} />
        )}
        {type === 'scramble' && !answered && (
          <WordScramble exercise={currentExercise} onResult={handleMiniGameResult} />
        )}
        {type === 'speed' && !answered && (
          <SpeedQuiz exercise={currentExercise} onResult={handleMiniGameResult} />
        )}

        {feedback && (['matching','wordorder','memory','scramble','speed'].includes(type) ? answered : true) && (
          <div className={`feedback-banner ${feedback.correct ? 'correct' : 'wrong'}`}>
            <span className="feedback-icon">{feedback.correct ? '🎉' : '😔'}</span>
            <div className="feedback-content">
              <p className="feedback-title">{feedback.correct ? '¡Excelente!' : 'Incorrecto'}</p>
              <p className="feedback-text">{feedback.message}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ── Lesson Complete Screen ─────────────────────────────────────────────── */
  if (lessonComplete) {
    const stars = getStars();
    return (
      <div className="lesson-complete-page">
        <div className="confetti-layer" aria-hidden="true">
          {Array.from({ length: 50 }, (_, i) => (
            <span key={i} className="confetti-piece" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              backgroundColor: ['#58cc02','#1cb0f6','#ce82ff','#ff9600','#ffc800','#ff4b4b'][i % 6],
              width: `${5 + Math.random() * 8}px`,
              height: `${5 + Math.random() * 8}px`,
            }} />
          ))}
        </div>

        <div className="lesson-complete-card">
          {/* Stars */}
          <div className="stars-row">
            {[1, 2, 3].map(s => (
              <span key={s} className={`star-item ${s <= stars ? 'earned' : 'empty'}`}
                style={{ animationDelay: `${0.3 + s * 0.2}s` }}>
                {s <= stars ? '⭐' : '☆'}
              </span>
            ))}
          </div>

          <h2 className="complete-title">¡Lección Completada!</h2>
          <p className="complete-lesson-name">{currentLesson.titleEs || currentLesson.title}</p>

          <div className="complete-stats-row">
            <div className="complete-stat">
              <div className="complete-stat-value cs-orange">+{lessonXp}</div>
              <div className="complete-stat-label">XP Ganado</div>
            </div>
            <div className="complete-stat">
              <div className="complete-stat-value cs-green">{correctCount}/{currentLesson.exercises.length}</div>
              <div className="complete-stat-label">Correctas</div>
            </div>
            <div className="complete-stat">
              <div className="complete-stat-value cs-red">🔥 {streak}</div>
              <div className="complete-stat-label">Racha</div>
            </div>
            {maxCombo >= 2 && (
              <div className="complete-stat">
                <div className="complete-stat-value cs-purple">x{maxCombo}</div>
                <div className="complete-stat-label">Max Combo</div>
              </div>
            )}
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

  /* ── Pronunciation Practice Phrases ─────────────────────────────────────── */
  const PRON_PHRASES = [
    { id: 1, en: 'Hello, how are you?', es: 'Hola, ¿cómo estás?', difficulty: 'Easy', xp: 5 },
    { id: 2, en: 'My name is...', es: 'Mi nombre es...', difficulty: 'Easy', xp: 5 },
    { id: 3, en: 'Nice to meet you', es: 'Mucho gusto', difficulty: 'Easy', xp: 5 },
    { id: 4, en: 'Good morning', es: 'Buenos días', difficulty: 'Easy', xp: 5 },
    { id: 5, en: 'Thank you very much', es: 'Muchas gracias', difficulty: 'Easy', xp: 5 },
    { id: 6, en: 'Where is the bathroom?', es: '¿Dónde está el baño?', difficulty: 'Medium', xp: 8 },
    { id: 7, en: 'I would like a coffee please', es: 'Me gustaría un café por favor', difficulty: 'Medium', xp: 8 },
    { id: 8, en: 'How much does this cost?', es: '¿Cuánto cuesta esto?', difficulty: 'Medium', xp: 8 },
    { id: 9, en: 'Can you help me?', es: '¿Puedes ayudarme?', difficulty: 'Medium', xp: 8 },
    { id: 10, en: 'I am learning English', es: 'Estoy aprendiendo inglés', difficulty: 'Medium', xp: 8 },
    { id: 11, en: 'The weather is beautiful today', es: 'El clima está hermoso hoy', difficulty: 'Hard', xp: 12 },
    { id: 12, en: 'I have been studying for two hours', es: 'He estado estudiando por dos horas', difficulty: 'Hard', xp: 12 },
    { id: 13, en: 'She is going to the supermarket', es: 'Ella va al supermercado', difficulty: 'Hard', xp: 12 },
    { id: 14, en: 'What time does the movie start?', es: '¿A qué hora empieza la película?', difficulty: 'Hard', xp: 12 },
    { id: 15, en: 'I really enjoy reading books', es: 'Realmente disfruto leer libros', difficulty: 'Hard', xp: 12 },
  ];

  const startPronPhrase = (phrase) => {
    sounds.click();
    setPronPhrase(phrase);
    setPronResult(null);
    setPronScore(null);
    setPronRecording(false);
  };

  const startPronRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setPronResult('⚠️ Tu navegador no soporta reconocimiento de voz.'); return; }
    sounds.recordStart();
    const rec = new SR();
    rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 5;
    rec.onresult = (e) => {
      // Check all alternatives for best match
      const expected = normalize(pronPhrase.en);
      let bestScore = 0;
      let bestTranscript = e.results[0][0].transcript;
      for (let i = 0; i < e.results[0].length; i++) {
        const alt = e.results[0][i].transcript;
        const got = normalize(alt);
        let score = 0;
        if (got === expected) { score = 100; }
        else {
          const ew = expected.split(/\s+/), gw = got.split(/\s+/);
          const wordMatch = ew.filter(w => gw.some(g => g === w || levenshtein(g, w) <= 1)).length;
          score = Math.round((wordMatch / ew.length) * 100);
          // Bonus for substring containment
          if (got.includes(expected) || expected.includes(got)) score = Math.max(score, 85);
        }
        if (score > bestScore) { bestScore = score; bestTranscript = alt; }
      }
      const transcript = bestTranscript;
      let matchScore = bestScore;
      setPronResult(transcript);
      setPronScore(matchScore);
      setPronRecording(false);
      if (matchScore >= 70) {
        sounds.correct();
        const earned = pronPhrase.xp;
        const newXp = xp + earned;
        setXp(newXp);
        setXpGained(earned);
        setShowXpPopup(true);
        spawnConfetti();
        setTimeout(() => { setShowXpPopup(false); sounds.xp(); }, 600);
        saveProgress(newXp, completedLessons, streak, lessonExerciseProgress);
      } else {
        sounds.wrong();
      }
    };
    rec.onerror = () => { setPronRecording(false); sounds.recordStop(); setPronResult('No se detectó audio. Inténtalo de nuevo.'); };
    rec.onend = () => setPronRecording(false);
    rec.start();
    setPronRecording(true);
    setPronResult(null);
    setPronScore(null);
  };

  /* ═══ MAIN RENDER ═══════════════════════════════════════════════════════════ */
  return (
    <div className={`eng-page ${mounted ? 'mounted' : ''}`}>
      {/* Confetti */}
      {confettiPieces.length > 0 && (
        <div className="confetti-layer" aria-hidden="true">
          {confettiPieces.map(p => (
            <span key={p.id} className="confetti-piece" style={{
              left: `${p.x}%`, animationDelay: `${p.delay}s`,
              backgroundColor: p.color, width: `${p.size}px`, height: `${p.size}px`,
              transform: `rotate(${p.rotation}deg)`,
            }} />
          ))}
        </div>
      )}

      {/* XP popup */}
      {showXpPopup && (
        <div className="xp-popup">
          <div className="xp-popup-value">+{xpGained}</div>
          <div className="xp-popup-label">XP</div>
        </div>
      )}

       {/* Top bar — only show if in a lesson */}
       {currentLesson && (
         <div className="eng-topbar">
           <div className="eng-topbar-inner">
             <button className="eng-back-btn" onClick={() => {
               sounds.navigate();
               if (currentLesson && lessonMode === 'exercises') {
                 if (exerciseMode === 'exercise') {
                   // Go back to exercise picker
                   setExerciseMode('picker');
                   resetExerciseState();
                 } else {
                   // Go back to theory
                   setLessonMode('theory');
                   setExerciseMode('picker');
                 }
               } else if (currentLesson) {
                 setCurrentLesson(null);
               } else {
                 navigate('/dashboard');
               }
             }}>
               ← {currentLesson && lessonMode === 'exercises'
                 ? (exerciseMode === 'exercise' ? 'Ejercicios' : 'Tutorial')
                 : currentLesson ? 'Lecciones' : 'Inicio'}
             </button>
             {currentLesson && lessonMode === 'exercises' && exerciseMode === 'exercise' && (
               <span className="eng-topbar-title">{currentLesson.titleEs || currentLesson.title} — Ejercicio {exerciseIndex + 1}</span>
             )}
             {currentLesson && lessonMode === 'exercises' && exerciseMode === 'picker' && (
               <span className="eng-topbar-title">Elige un ejercicio</span>
             )}
             <div className="eng-topbar-stats">
               <span className="eng-stat xp">⚡ {xp}</span>
               <span className="eng-stat streak">🔥 {streak}</span>
               <div className="eng-hearts">
                 {Array.from({ length: 5 }, (_, i) => (
                   <span key={i} className={i < hearts ? 'heart-full' : 'heart-empty'}>{i < hearts ? '❤️' : '🖤'}</span>
                 ))}
               </div>
             </div>
           </div>
         </div>
       )}

      <div className="eng-content" style={{ paddingBottom: currentLesson && answered ? '100px' : '2rem' }}>
        {/* THEORY SCREEN */}
        {currentLesson && lessonMode === 'theory' ? (
          <LessonTheory
            lesson={currentLesson}
            onStart={startExercises}
            onBack={() => { sounds.navigate(); setCurrentLesson(null); }}
          />
         ) : currentLesson && lessonMode === 'exercises' ? (
           <div className="exercise-view">
             {exerciseMode === 'picker' ? (
               <ExercisePicker
                 exercises={currentLesson.exercises}
                 completedIds={Array.from(lessonExerciseProgress.get(currentLesson.id) || new Set())}
                 currentExerciseIndex={exerciseIndex}
                 onSelect={selectExercise}
                 currentLessonTitle={currentLesson.titleEs || currentLesson.title}
               />
             ) : (
               <>
                 <div className="exercise-progress-bar">
                   <button className="exercise-close-btn" onClick={() => { sounds.navigate(); setCurrentLesson(null); }}>✕</button>
                   <div className="exercise-progress-track">
                     <div className="progress-bar-fancy">
                       <div className="progress-fill-fancy" style={{ width: `${((exerciseIndex + (answered ? 1 : 0)) / currentLesson.exercises.length) * 100}%` }}>
                         <div className="progress-shimmer" />
                       </div>
                     </div>
                   </div>
                   <span className="exercise-counter">{exerciseIndex + 1}/{currentLesson.exercises.length}</span>
                 </div>
                 {renderExercise()}
               </>
             )}
           </div>
         ) : !placement ? (
          <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>
              ¿Cuál es tu nivel de <span style={{ color: 'var(--blue)' }}>Inglés?</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
              Personalizaremos tu curso para darte la mejor experiencia.
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <button className="course-card-neon" style={{ '--cc': 'var(--blue)', '--ccrgb': '30,144,255', textAlign: 'left', padding: '2rem' }}
                onClick={() => handlePlacement('beginner')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div className="ccn-icon-wrap" style={{ width: '80px', height: '80px' }}>
                    <div className="ccn-icon-ring"></div>
                    <span className="ccn-emoji">🐣</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text)' }}>Principiante <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>(A1-A2)</span></h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: 0 }}>Empieza desde cero con lo básico y construye una base sólida.</p>
                  </div>
                </div>
              </button>
              
              <button className="course-card-neon" style={{ '--cc': '#ce82ff', '--ccrgb': '206,130,255', textAlign: 'left', padding: '2rem' }}
                onClick={() => handlePlacement('intermediate')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div className="ccn-icon-wrap" style={{ width: '80px', height: '80px' }}>
                    <div className="ccn-icon-ring"></div>
                    <span className="ccn-emoji">🚀</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text)' }}>Intermedio <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>(B1-B2)</span></h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: 0 }}>Ya sé algo de inglés, quiero mejorar mi fluidez y vocabulario.</p>
                  </div>
                </div>
              </button>
              
              <button className="course-card-neon" style={{ '--cc': '#ff4757', '--ccrgb': '255,71,87', textAlign: 'left', padding: '2rem' }}
                onClick={() => handlePlacement('advanced')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div className="ccn-icon-wrap" style={{ width: '80px', height: '80px' }}>
                    <div className="ccn-icon-ring"></div>
                    <span className="ccn-emoji">👑</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text)' }}>Avanzado <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>(C1-C2)</span></h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: 0 }}>Quiero perfeccionar mi gramática y retar mis habilidades.</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
         ) : (
          <div style={{ maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
            {/* Back to Home Header */}
            <header style={{ marginBottom: '2rem', padding: '1.5rem 1.5rem 0' }}>
              <button className="sl-back-btn" onClick={() => { sounds.navigate(); navigate('/dashboard'); }} style={{ fontFamily: 'var(--font)', fontSize: '13px', fontWeight: 600, padding: '8px 16px', borderRadius: '100px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.25s' }}>
                ← Volver al Inicio
              </button>
            </header>

            {/* Premium Course Dashboard Hero for English */}
            <div className="pro-dashboard-hero" style={{ margin: '0 1.5rem 3rem' }}>
              <div className="pdh-top-row" style={{ padding: '3rem', borderRadius: '32px', background: 'var(--bg-card-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="pdh-greeting-col" style={{ gap: '0.5rem', flex: 1 }}>
                  <div className="pdh-time-badge" style={{ display: 'inline-flex', marginBottom: '1rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', alignItems: 'center', gap: '0.5rem' }}>
                    🇬🇧 Módulo de Idiomas
                  </div>
                  <h1 className="pdh-title" style={{ fontSize: '3rem', marginBottom: '0', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em' }}>Inglés <span>Premium</span></h1>
                  <p className="pdh-subtitle" style={{ fontSize: '1.2rem', maxWidth: '600px', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                    Domina el idioma con lecciones interactivas, práctica de pronunciación con IA y juegos. <strong>¡Sube de nivel!</strong>
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="pdh-motivational-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(30, 144, 255, 0.1)', border: '1px solid rgba(30, 144, 255, 0.3)', padding: '0.6rem 1.2rem', borderRadius: '100px', fontWeight: 700, fontSize: '0.95rem', color: '#1e90ff' }}>
                      ⚡ {xp} XP en Inglés
                    </div>
                    <div className="pdh-motivational-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255, 71, 87, 0.1)', border: '1px solid rgba(255, 71, 87, 0.3)', padding: '0.6rem 1.2rem', borderRadius: '100px', fontWeight: 700, fontSize: '0.95rem', color: '#ff4757' }}>
                      🔥 Racha de {streak}
                    </div>
                    <button className="pdh-change-level-btn" onClick={() => { sounds.buttonPress(); setPlacement(null); localStorage.removeItem('vento_english_placement'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.6rem 1.2rem', borderRadius: '100px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', cursor: 'pointer', transition: 'all 0.2s' }}>
                      🔄 Cambiar Nivel
                    </button>
                  </div>
                </div>
                <div className="pdh-level-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div className="pdh-level-ring-container" style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg className="pdh-ring-svg" width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                      <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                      <circle cx="70" cy="70" r="62" fill="none" stroke="var(--blue)" strokeWidth="10" strokeDasharray="389.5" strokeDashoffset={389.5 - (389.5 * (completedLessons.length / (filteredUnits.reduce((acc, u) => acc + u.lessons.length, 0)) || 0))} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                    </svg>
                    <div className="pdh-level-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                      <span className="pdh-lvl-num" style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{Math.floor((completedLessons.length / (filteredUnits.reduce((acc, u) => acc + u.lessons.length, 0)) || 0) * 100)}%</span>
                      <span className="pdh-lvl-label" style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>PROGRESO</span>
                    </div>
                  </div>
                  <div className="pdh-xp-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.5px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    Nivel {levelBadge}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="eng-tabs" style={{ margin: '0 1.5rem 2rem' }}>
              <button className={`eng-tab ${activeTab === 'levels' ? 'active' : ''}`}
                onClick={() => { sounds.click(); setActiveTab('levels'); setPronPhrase(null); }}>
                📚 Misiones
              </button>
              <button className={`eng-tab ${activeTab === 'pronunciation' ? 'active' : ''}`}
                onClick={() => { sounds.click(); setActiveTab('pronunciation'); }}>
                🎤 Pronunciación (IA)
              </button>
            </div>

            {activeTab === 'levels' ? (
              <div className="lesson-map">
                {filteredUnits.map((unit, ui) => {
                  const color = UNIT_COLORS[ui % UNIT_COLORS.length];
                  const unitCompleted = unit.lessons.filter(l => completedLessons.includes(l.id)).length;
                  const unitPct = Math.round((unitCompleted / unit.lessons.length) * 100);
                  return (
                    <div key={unit.id} className="unit-block" style={{ animationDelay: `${ui * 0.12}s`, '--unit-color': color }}>
                      <div className="unit-header-card" style={{ '--unit-color': color }}>
                        <div className="unit-icon-wrap" style={{ background: `${color}22`, borderColor: `${color}35` }}>
                          {unit.icon}
                        </div>
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
            ) : (
              <div className="pron-section">
                {!pronPhrase ? (
                  <>
                    <div className="pron-hero">
                      <div className="pron-hero-glow" />
                      <div className="pron-hero-icon">🎤</div>
                      <h2 className="pron-hero-title">Pronunciation Practice</h2>
                      <p className="pron-hero-sub">Speak out loud and improve your English accent with instant AI feedback</p>
                      <div className="pron-hero-stats">
                        <span className="pron-hero-stat">🗣️ 15 Phrases</span>
                        <span className="pron-hero-stat">⚡ Earn XP</span>
                        <span className="pron-hero-stat">🎯 3 Levels</span>
                      </div>
                    </div>
                    {['Easy', 'Medium', 'Hard'].map(diff => (
                      <div key={diff} className="pron-difficulty-group">
                        <div className={`pron-diff-header diff-${diff.toLowerCase()}`}>
                          <span className="pron-diff-dot" />
                          <span className="pron-diff-label">{diff}</span>
                          <span className="pron-diff-xp">+{diff === 'Easy' ? 5 : diff === 'Medium' ? 8 : 12} XP each</span>
                        </div>
                        <div className="pron-phrases-list">
                          {PRON_PHRASES.filter(p => p.difficulty === diff).map((phrase, pi) => (
                            <button key={phrase.id} className="pron-phrase-card"
                              style={{ animationDelay: `${pi * 0.05}s` }}
                              onClick={() => startPronPhrase(phrase)}
                              onMouseEnter={() => sounds.hover()}>
                              <span className="pron-phrase-num">{phrase.id}</span>
                              <div className="pron-phrase-text">
                                <span className="pron-phrase-en">{phrase.en}</span>
                                <span className="pron-phrase-es">{phrase.es}</span>
                              </div>
                              <span className="pron-phrase-arrow">→</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="pron-practice-card">
                    <button className="pron-back-btn" onClick={() => { sounds.click(); setPronPhrase(null); }}>← Back to phrases</button>
                    <div className={`pron-diff-badge diff-${pronPhrase.difficulty.toLowerCase()}`}>
                      {pronPhrase.difficulty}
                    </div>
                    <div className="pron-target-card">
                      <p className="pron-target-label">🔊 Say this phrase in English:</p>
                      <p className="pron-target-en">"{pronPhrase.en}"</p>
                      <p className="pron-target-es">{pronPhrase.es}</p>
                      <button className="pron-listen-btn" onClick={() => speak(pronPhrase.en)}>
                        <span>🔊</span> Listen First
                      </button>
                    </div>
                    <div className="pron-mic-area">
                      {pronRecording && (
                        <div className="pron-wave-bars">
                          {Array.from({length:7}).map((_,i) => <span key={i} className="pron-wave-bar" style={{animationDelay:`${i*0.1}s`}} />)}
                        </div>
                      )}
                      <button className={`pron-mic-btn ${pronRecording ? 'recording' : ''}`}
                        onClick={startPronRecording}>
                        <span className="pron-mic-icon">{pronRecording ? '⏹️' : '🎤'}</span>
                        {pronRecording && <span className="pron-mic-pulse" />}
                        {pronRecording && <span className="pron-mic-pulse p2" />}
                      </button>
                      <p className="pron-mic-hint">
                        {pronRecording ? '🔴 Listening... speak now!' : 'Tap to start speaking'}
                      </p>
                    </div>
                    {pronResult && (
                      <div className={`pron-result-card ${pronScore >= 70 ? 'success' : 'fail'}`}>
                        <div className="pron-result-score-ring">
                          <svg viewBox="0 0 80 80" className="pron-score-svg">
                            <circle cx="40" cy="40" r="34" className="pron-score-bg" />
                            <circle cx="40" cy="40" r="34" className="pron-score-fill"
                              style={{ strokeDasharray: `${2 * Math.PI * 34}`, strokeDashoffset: `${2 * Math.PI * 34 * (1 - pronScore / 100)}` }} />
                          </svg>
                          <span className="pron-score-num">{pronScore}%</span>
                        </div>
                        <div className="pron-result-info">
                          <p className="pron-result-label">{pronScore >= 90 ? '🎉 Excellent!' : pronScore >= 70 ? '👍 Good job!' : '💪 Keep practicing!'}</p>
                          <p className="pron-result-heard">You said: "{pronResult}"</p>
                          {pronScore >= 70 && <p className="pron-result-xp">+{pronPhrase.xp} XP earned!</p>}
                        </div>
                      </div>
                    )}
                    <button className="btn btn-blue btn-full" style={{ marginTop: '1rem' }}
                      onClick={() => { setPronResult(null); setPronScore(null); }}>
                      🔄 TRY AGAIN
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {currentLesson && answered && exerciseMode === 'exercise' && (
        <div className="exercise-bottom-bar">
          <div className="exercise-bottom-inner">
            <button className={`btn ${feedback?.correct ? 'btn-green' : 'btn-red'} btn-full btn-lg`} onClick={nextExercise}>
              {exerciseIndex + 1 >= currentLesson.exercises.length ? '🏆 COMPLETAR LECCIÓN' : 'SIGUIENTE →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnglishModule;
