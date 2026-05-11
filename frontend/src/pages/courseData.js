// courseData.js — Programmatic generation of 10 lessons per level, and 10 sub-lessons per lesson
export const COURSES = {
  english:      { id:'english',      name:'Inglés',      emoji:'🇺🇸', color:'#3b82f6', desc:'Domina el idioma más hablado del mundo.' },
  chess:        { id:'chess',        name:'Ajedrez',     emoji:'♟️',  color:'#f59e0b', desc:'Desarrolla tu pensamiento estratégico.' },
  music:        { id:'music',        name:'Música',      emoji:'🎹',  color:'#ec4899', desc:'Aprende a leer y tocar música.' },
  signlanguage: { id:'signlanguage', name:'Señas',       emoji:'🤟',  color:'#10b981', desc:'Comunícate con tus manos usando IA.' },
  math:         { id:'math',         name:'Matemáticas', emoji:'📐',  color:'#8b5cf6', desc:'Fortalece tus bases matemáticas.' },
};

export const LEVELS = {
  beginner:     { id:'beginner',     name:'Principiante', emoji:'🌱' },
  intermediate: { id:'intermediate', name:'Intermedio',   emoji:'🔥' },
  advanced:     { id:'advanced',     name:'Avanzado',     emoji:'👑' },
};

const TOPICS = {
  english: {
    beginner: [
      { t: "Saludos Básicos", i: "👋" }, { t: "El Alfabeto", i: "🔤" }, { t: "Números 1-20", i: "🔢" }, { t: "Los Colores", i: "🎨" }, { t: "La Familia", i: "👨‍👩‍👧" },
      { t: "Comida Básica", i: "🍎" }, { t: "Mascotas", i: "🐶" }, { t: "Ropa", i: "👕" }, { t: "Días de la Semana", i: "📅" }, { t: "El Cuerpo Humano", i: "👃" }
    ],
    intermediate: [
      { t: "Conversaciones", i: "💬" }, { t: "Tiempos Verbales", i: "📖" }, { t: "Emails", i: "📧" }, { t: "Phrasal Verbs", i: "🗣️" }, { t: "Listening", i: "🎧" },
      { t: "Viajes", i: "✈️" }, { t: "En el Trabajo", i: "💼" }, { t: "Salud", i: "🏥" }, { t: "El Clima", i: "⛅" }, { t: "Direcciones", i: "🗺️" }
    ],
    advanced: [
      { t: "Reading Avanzado", i: "📰" }, { t: "Debate", i: "🎤" }, { t: "Ensayos", i: "📝" }, { t: "Modismos", i: "🌐" }, { t: "Negocios", i: "📊" },
      { t: "Política", i: "🌍" }, { t: "Cultura", i: "🎭" }, { t: "Ciencia", i: "🔬" }, { t: "Medio Ambiente", i: "🌱" }, { t: "Literatura", i: "📚" }
    ]
  },
  chess: {
    beginner: [
      { t: "Las Piezas", i: "♟️" }, { t: "Movimientos", i: "📐" }, { t: "Jaque Mate", i: "🏁" }, { t: "Enroque", i: "🏰" }, { t: "Capturas", i: "⚔️" },
      { t: "Valor de las Piezas", i: "⚖️" }, { t: "Apertura Básica", i: "🚪" }, { t: "Peón al Paso", i: "👻" }, { t: "Promoción", i: "👑" }, { t: "Reglas de Tablas", i: "🤝" }
    ],
    intermediate: [
      { t: "Clavadas", i: "📌" }, { t: "Horquillas", i: "🍴" }, { t: "Ataque Doble", i: "⚔️" }, { t: "Descubiertas", i: "🔍" }, { t: "Apertura Italiana", i: "🍕" },
      { t: "Apertura Española", i: "🇪🇸" }, { t: "Defensa Siciliana", i: "🛡️" }, { t: "Estructura de Peones", i: "🧱" }, { t: "Desviación", i: "🪤" }, { t: "Atracción", i: "🧲" }
    ],
    advanced: [
      { t: "Finales de Torre", i: "🗼" }, { t: "Oposición", i: "🥊" }, { t: "Cálculo Profundo", i: "🧠" }, { t: "Posición de Lucena", i: "🌉" }, { t: "Posición Philidor", i: "🛑" },
      { t: "Sacrificios", i: "💥" }, { t: "Profilaxis", i: "🛡️" }, { t: "Casillas Débiles", i: "🕳️" }, { t: "Iniciativa", i: "🚀" }, { t: "Alfil Malo vs Bueno", i: "⚖️" }
    ]
  },
  music: {
    beginner: [
      { t: "Las Notas", i: "🎵" }, { t: "El Pentagrama", i: "📋" }, { t: "Clave de Sol", i: "🎼" }, { t: "Clave de Fa", i: "🎼" }, { t: "Figuras Rítmicas", i: "⏱️" },
      { t: "Teclado Básico", i: "🎹" }, { t: "Alteraciones (# y b)", i: "🔣" }, { t: "Silencios", i: "🤫" }, { t: "Ligaduras", i: "🔗" }, { t: "Compás de 4/4", i: "⏲️" }
    ],
    intermediate: [
      { t: "Escalas Mayores", i: "📏" }, { t: "Escalas Menores", i: "🔽" }, { t: "Tríadas", i: "🔼" }, { t: "Inversiones", i: "🏗️" }, { t: "Arpegios", i: "🎹" },
      { t: "Armaduras", i: "🛡️" }, { t: "Lectura Dinámica", i: "👁️" }, { t: "Sincopas", i: "⚡" }, { t: "Tresillos", i: "🕒" }, { t: "Intervalos", i: "↔️" }
    ],
    advanced: [
      { t: "Armonía Funcional", i: "🎭" }, { t: "Modulación", i: "🌉" }, { t: "Acordes de Séptima", i: "🎷" }, { t: "Contrapunto", i: "✍️" }, { t: "Modos Griegos", i: "🏛️" },
      { t: "Composición", i: "💡" }, { t: "Producción Musical", i: "💻" }, { t: "Mezcla y Paneo", i: "🎚️" }, { t: "Orquestación", i: "🎻" }, { t: "Jazz y Sustituciones", i: "🎷" }
    ]
  },
  signlanguage: {
    beginner: [
      { t: "Las Vocales", i: "✋" }, { t: "Saludos Básicos", i: "👋" }, { t: "Letras A-M", i: "🔤" }, { t: "Letras N-Z", i: "🔡" }, { t: "Números 1-10", i: "1️⃣" },
      { t: "Por Favor y Gracias", i: "🙏" }, { t: "Familia", i: "👨‍👩‍👧" }, { t: "Colores", i: "🎨" }, { t: "Días de la Semana", i: "📅" }, { t: "Sentimientos", i: "😊" }
    ],
    intermediate: [
      { t: "Números 11-100", i: "💯" }, { t: "Frases Comunes", i: "💬" }, { t: "Preguntas (Qué, Cómo)", i: "❓" }, { t: "Tiempo y Reloj", i: "⏰" }, { t: "Clima", i: "⛅" },
      { t: "Comida y Bebida", i: "🍎" }, { t: "Lugares Comunes", i: "🏥" }, { t: "Animales", i: "🐶" }, { t: "Profesiones", i: "👮" }, { t: "Deportes", i: "⚽" }
    ],
    advanced: [
      { t: "Estructura de Oraciones", i: "🏗️" }, { t: "Expresión Facial", i: "🎭" }, { t: "Tiempos Verbales", i: "⏳" }, { t: "Direccionalidad", i: "➡️" }, { t: "Clasificadores", i: "🧩" },
      { t: "Modismos en Señas", i: "🌐" }, { t: "Narración de Cuentos", i: "📖" }, { t: "Debate", i: "🗣️" }, { t: "Terminología Médica", i: "🩺" }, { t: "Velocidad y Fluidez", i: "⚡" }
    ]
  },
  math: {
    beginner: [
      { t: "Sumas Simples", i: "➕" }, { t: "Restas Simples", i: "➖" }, { t: "Tablas de Multiplicar", i: "✖️" }, { t: "Divisiones Básicas", i: "➗" }, { t: "Fracciones", i: "🍕" },
      { t: "Decimales", i: "📏" }, { t: "Números Negativos", i: "📉" }, { t: "Orden de Operaciones", i: "🔢" }, { t: "Proporciones", i: "⚖️" }, { t: "Porcentajes Básicos", i: "💯" }
    ],
    intermediate: [
      { t: "Geometría Plana", i: "📐" }, { t: "Área y Perímetro", i: "🔲" }, { t: "Álgebra Lineal", i: "✖️" }, { t: "Despejar X", i: "❓" }, { t: "Ecuaciones de 1er Grado", i: "⚖️" },
      { t: "Teorema de Pitágoras", i: "🔺" }, { t: "Probabilidad Simple", i: "🎲" }, { t: "Estadística (Media)", i: "📊" }, { t: "Raíces Cuadradas", i: "🌳" }, { t: "Potencias", i: "🚀" }
    ],
    advanced: [
      { t: "Trigonometría", i: "🔺" }, { t: "Seno y Coseno", i: "🌊" }, { t: "Pre-Cálculo", i: "∫" }, { t: "Límites", i: "🛑" }, { t: "Derivadas", i: "🏎️" },
      { t: "Integrales", i: "📏" }, { t: "Funciones Cuadráticas", i: "📈" }, { t: "Logaritmos", i: "🪵" }, { t: "Matrices", i: "🧮" }, { t: "Estadística Avanzada", i: "📉" }
    ]
  }
};

const SUB_TEMPLATES = [
  { p: "Introducción a", i: "📖", ds: "Conceptos iniciales" },
  { p: "Fundamentos de", i: "🧱", ds: "Bases sólidas" },
  { p: "Teoría de", i: "📚", ds: "Reglas principales" },
  { p: "Vocabulario de", i: "📝", ds: "Términos clave" },
  { p: "Ejemplos de", i: "💡", ds: "Casos prácticos" },
  { p: "Análisis de", i: "🔍", ds: "Observación profunda" },
  { p: "Práctica:", i: "🎯", ds: "Ejercicios guiados" },
  { p: "Errores en", i: "⚠️", ds: "Lo que no debes hacer" },
  { p: "Desafío de", i: "⏱️", ds: "Prueba de velocidad" },
  { p: "Maestría en", i: "🏆", ds: "Evaluación final" },
];

export const LESSONS = {};

// Programmatically generate exactly 10 subLessons per lesson
for (const [courseId, levelsData] of Object.entries(TOPICS)) {
  LESSONS[courseId] = {};
  for (const [levelId, topicsArray] of Object.entries(levelsData)) {
    LESSONS[courseId][levelId] = topicsArray.map((topic, index) => {
      const lessonId = `${courseId}-${levelId}-${index}`;
      return {
        id: lessonId,
        icon: topic.i,
        title: topic.t,
        desc: `Domina el área de ${topic.t.toLowerCase()}`,
        xp: 150, // overall XP value, but now subLessons will carry weight
        content: `<h3>${topic.t}</h3><p>Este es el módulo central donde aprenderás todos los secretos sobre ${topic.t.toLowerCase()}.</p>`,
        subLessons: SUB_TEMPLATES.map((st, sIndex) => ({
          id: `${lessonId}-sub${sIndex}`,
          icon: st.i,
          title: `${st.p} ${topic.t}`,
          desc: st.ds,
          xp: 15 // 15 XP per mini lesson
        }))
      };
    });
  }
}
