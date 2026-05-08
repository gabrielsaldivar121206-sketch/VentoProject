import React from 'react';
import '../MiniGames/MiniGames.css';
import './ExercisePicker.css';

const EXERCISE_META = {
  translate:  { icon: '✍️', label: 'Traducir',   color: '#58cc02' },
  listen:     { icon: '🔊', label: 'Escuchar',   color: '#ce82ff' },
  speak:      { icon: '🎤', label: 'Hablar',     color: '#1cb0f6' },
  fillblank:  { icon: '📝', label: 'Completar',  color: '#ff9600' },
  matching:   { icon: '🔗', label: 'Unir',       color: '#ff6b9d' },
  wordorder:  { icon: '📚', label: 'Ordenar',    color: '#9b59b6' },
  memory:     { icon: '🧠', label: 'Memoria',    color: '#1abc9c' },
  scramble:   { icon: '🔀', label: 'Descifrar',  color: '#e74c3c' },
  speed:      { icon: '⚡', label: 'Velocidad',  color: '#f39c12' },
};

const ExercisePicker = ({ exercises, completedIds, currentExerciseIndex, onSelect, currentLessonTitle }) => {
  const getExerciseStatus = (idx) => {
    if (completedIds.includes(idx)) return 'completed';
    if (idx === currentExerciseIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="exercise-picker">
      <div className="ep-hero">
        <h2 className="ep-hero-title">Elige el orden</h2>
        <p className="ep-hero-sub">Completa los {exercises.length} ejercicios en el orden que prefieras</p>
      </div>

      <div className="ep-progress-row">
        <div className="ep-progress-track">
          <div
            className="ep-progress-fill"
            style={{ width: `${(completedIds.length / exercises.length) * 100}%` }}
          />
        </div>
        <span className="ep-progress-label">
          {completedIds.length}/{exercises.length} completados
        </span>
      </div>

      <div className="ep-grid">
        {exercises.map((exercise, idx) => {
          const status = getExerciseStatus(idx);
          const meta = EXERCISE_META[exercise.type] || { icon: '🎯', label: exercise.type, color: '#58cc02' };
          const isDone = status === 'completed';
          const isCurrent = status === 'current';

          return (
            <button
              key={idx}
              className={`ep-card ${status}`}
              style={{ '--ex-color': meta.color, animationDelay: `${idx * 0.06}s` }}
              onClick={() => onSelect(idx)}
            >
              <div className="ep-card-inner">
                <div className="ep-card-glow" style={{ background: `radial-gradient(circle, ${meta.color}20, transparent)` }} />
                <div className="ep-top-row">
                  <span className="ep-number">#{idx + 1}</span>
                  {isDone && <span className="ep-check">✓</span>}
                  {isCurrent && <span className="ep-current-dot" />}
                </div>
                <div className="ep-icon-wrap" style={{ background: `${meta.color}18`, borderColor: `${meta.color}35` }}>
                  <span className="ep-icon">{meta.icon}</span>
                </div>
                <span className="ep-type">{meta.label}</span>
                <span className="ep-xp">+{exercise.xp || 5} XP</span>
                {!isDone && <span className="ep-play-hint">Jugar →</span>}
              </div>
              {isDone && <div className="ep-done-overlay" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExercisePicker;
