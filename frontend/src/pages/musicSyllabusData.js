import { getLesson0 } from './lessons/lesson0';
import { getLesson1 } from './lessons/lesson1';
import { getLesson2 } from './lessons/lesson2';
import { getLesson3 } from './lessons/lesson3';

const LABELS = {
  C3:'DO₃',D3:'RE₃',E3:'MI₃',F3:'FA₃',G3:'SOL₃',A3:'LA₃',B3:'SI₃',
  C4:'DO','C#4':'DO#',D4:'RE','D#4':'RE#',E4:'MI',F4:'FA','F#4':'FA#',
  G4:'SOL','G#4':'SOL#',A4:'LA','A#4':'LA#',B4:'SI',
  C5:'DO₅','C#5':'DO#₅',D5:'RE₅','D#5':'RE#₅',E5:'MI₅',F5:'FA₅',G5:'SOL₅'
};

export const MUSIC_LESSONS_META = {
  beginner: [
    { t:"Naturaleza del Sonido", i:"🔊", concepts:["frecuencia","amplitud","timbre","onda sonora","vibración"], notes:["C4","E4","G4"] },
    { t:"El Teclado y el Pentagrama", i:"🎹", concepts:["teclas blancas","teclas negras","octava","pentagrama","DO RE MI"], notes:["C4","D4","E4","F4","G4","A4","B4"] },
    { t:"Figuras Rítmicas I", i:"⏱️", concepts:["redonda","blanca","negra","pulso","tempo"], notes:["C4","E4","G4"] },
    { t:"Clave de Sol", i:"🎼", concepts:["clave de sol","líneas","espacios","lectura","registro agudo"], notes:["E4","F4","G4","A4","B4"] },
    { t:"Compases Simples", i:"⏲️", concepts:["4/4","2/4","barra","tiempo fuerte","tiempo débil"], notes:["C4","D4","E4","F4"] },
    { t:"Alteraciones I", i:"🔣", concepts:["sostenido","bemol","becuadro","semitono","enarmónico"], notes:["C4","C#4","D4","D#4","F4","F#4"] },
    { t:"Dinámicas Básicas", i:"🔉", concepts:["piano p","forte f","crescendo","decrescendo","matiz"], notes:["C4","E4","G4","C5"] },
    { t:"Técnica de Dedos", i:"🖐️", concepts:["numeración 1-5","postura","digitación","paso de pulgar","independencia"], notes:["C4","D4","E4","F4","G4"] },
    { t:"Intervalos de 2da y 3ra", i:"↔️", concepts:["segunda mayor","segunda menor","tercera mayor","tercera menor","melodía"], notes:["C4","D4","E4","F4"] },
    { t:"Primera Melodía", i:"🎵", concepts:["fraseo","legato","expresión","melodía completa","mano derecha"], notes:["C4","D4","E4","F4","G4"] },
  ],
  intermediate: [
    { t:"Escalas Mayores", i:"📏", concepts:["tono","semitono","T-T-S-T-T-T-S","Do Mayor","Sol Mayor"], notes:["C4","D4","E4","F4","G4","A4","B4","C5"] },
    { t:"Escalas Menores", i:"🔽", concepts:["menor natural","menor armónica","menor melódica","relativa","La menor"], notes:["A4","B4","C5","D5","E5"] },
    { t:"Intervalos Compuestos", i:"↕️", concepts:["cuarta justa","quinta justa","octava","sexta","séptima"], notes:["C4","F4","G4","C5"] },
    { t:"Formación de Tríadas", i:"🔺", concepts:["acorde mayor","acorde menor","disminuido","fundamental","3ra y 5ta"], notes:["C4","E4","G4"] },
    { t:"Clave de Fa", i:"🎼", concepts:["registro grave","mano izquierda","independencia","lectura Fa","bajo"], notes:["C4","D4","E4","F4","G4"] },
    { t:"Inversiones de Acordes", i:"🔄", concepts:["fundamental","1ra inversión","2da inversión","bajo","voces"], notes:["C4","E4","G4"] },
    { t:"Círculo de Quintas", i:"⭕", concepts:["tonalidad","sostenidos","bemoles","relativas","modulación"], notes:["C4","G4","D4","A4","E4"] },
    { t:"Ritmo Avanzado", i:"🥁", concepts:["corchea","semicorchea","puntillo","ligadura","contratiempo"], notes:["C4","E4","G4","C5"] },
    { t:"Arpegios Básicos", i:"🎹", concepts:["arpegio","acorde roto","fluidez","legato","pedal"], notes:["C4","E4","G4","C5"] },
    { t:"Acompañamiento", i:"🤲", concepts:["Alberti","bajo-acorde","ostinato","ritmo armónico","izquierda"], notes:["C4","G4","E4","G4"] },
  ],
  advanced: [
    { t:"Acordes de Séptima", i:"🎷", concepts:["Maj7","m7","dom7","m7b5","resolución"], notes:["C4","E4","G4","B4"] },
    { t:"Armonía Funcional", i:"🎭", concepts:["tónica","subdominante","dominante","II-V-I","resolución"], notes:["D4","F4","A4","G4","B4"] },
    { t:"Modos Griegos", i:"🏛️", concepts:["jónico","dórico","frigio","lidio","mixolidio"], notes:["C4","D4","E4","F4","G4"] },
    { t:"Extensiones", i:"✨", concepts:["novena","oncena","trecena","voicing","color"], notes:["C4","E4","G4","B4","D5"] },
    { t:"Modulación", i:"🌉", concepts:["acorde pivote","directa","cromática","vecina","transición"], notes:["C4","E4","G4","B4","D5"] },
    { t:"Improvisación I", i:"🎤", concepts:["pentatónica mayor","pentatónica menor","blue note","call-response","motivo"], notes:["C4","D4","E4","G4","A4"] },
    { t:"Síncopas", i:"⚡", concepts:["síncopa","contratiempo","off-beat","groove","swing"], notes:["C4","E4","G4","C5"] },
    { t:"Análisis Musical", i:"🔍", concepts:["forma","armonía","melodía","estructura","motivo"], notes:["C4","E4","G4"] },
    { t:"Composición", i:"💡", concepts:["verso","coro","puente","outro","intro"], notes:["C4","D4","E4","F4","G4"] },
    { t:"Producción Básica", i:"💻", concepts:["MIDI","DAW","cuantización","mezcla","grabación"], notes:["C4","E4","G4","C5"] },
  ]
};

// ── Detailed step-based content for each concept ──
const CONCEPT_CONTENT = {
  // === LESSON 1: NATURALEZA DEL SONIDO ===
  frecuencia: {
    teach: { title:"¿Qué es la Frecuencia?", body:"La frecuencia es la velocidad a la que vibra un objeto. Se mide en Hercios (Hz). Cuanto más rápido vibra, más AGUDO suena. La nota LA del piano vibra 440 veces por segundo (440 Hz). El DO central vibra 261 veces por segundo.", visual:"image", imageUrl:"/images/wave.png",
      playButtons:[{note:"C4",label:"🔊 DO — 261 Hz (grave)"},{note:"A4",label:"🔊 LA — 440 Hz (agudo)"}],
      tip:"La nota LA a 440 Hz es el estándar mundial para afinar todos los instrumentos." },
    quiz: { question:"¿Qué determina si un sonido es agudo o grave?", options:["La frecuencia de vibración (Hz)","El volumen con que se toca","El tamaño del instrumento","La duración de la nota"], correctIndex:0, explanation:"Una frecuencia alta = sonido agudo. Frecuencia baja = sonido grave." },
  },
  amplitud: {
    teach: { title:"La Amplitud: El Volumen", body:"La amplitud es el TAMAÑO de la onda sonora. Imagina olas del mar: una ola grande tiene más amplitud que una pequeña. En la música, mayor amplitud significa mayor VOLUMEN. Cuando tocas una tecla del piano con fuerza, produces una onda más grande.", visual:"wave", waveSpeed:0.5,
      tip:"En una partitura, la letra 'p' significa piano (suave) y 'f' significa forte (fuerte). ¡No confundas 'piano' instrumento con 'piano' volumen!" },
    quiz: { question:"¿Qué controla la amplitud de una onda sonora?", options:["El volumen (qué tan fuerte suena)","Si la nota es aguda o grave","El tipo de instrumento","La velocidad de la canción"], correctIndex:0 },
  },
  timbre: {
    teach: { title:"El Timbre: La Identidad del Sonido", body:"El timbre es como la 'huella digital' de cada instrumento. Es lo que hace que un piano suene diferente a una guitarra, INCLUSO tocando exactamente la misma nota a la misma frecuencia y volumen. El timbre depende de los armónicos: vibraciones extras que acompañan a la nota principal.",
      playButtons:[{note:"C4",label:"🔊 Escuchar DO en el piano"}],
      tip:"Cuando afinas un piano y una guitarra a la misma nota, ¡ambos vibran a la misma frecuencia pero suenan completamente diferente gracias al timbre!" },
    quiz: { question:"¿Qué es el timbre de un sonido?", options:["La cualidad que distingue un instrumento de otro","La velocidad de vibración","El volumen del sonido","La duración de la nota"], correctIndex:0 },
  },
  "onda sonora": {
    teach: { title:"¿Cómo viaja el Sonido?", body:"El sonido viaja por el aire en forma de ONDAS. Las moléculas de aire se empujan unas a otras como fichas de dominó invisibles. Por eso el sonido no viaja en el vacío del espacio (¡en el espacio nadie puede oírte gritar!). La velocidad del sonido en el aire es de aproximadamente 343 metros por segundo.", visual:"wave",
      tip:"La luz viaja un millón de veces más rápido que el sonido. Por eso ves el relámpago antes de escuchar el trueno." },
    quiz: { question:"¿Cómo viaja el sonido hasta nuestros oídos?", options:["En forma de ondas a través del aire","En línea recta como la luz","A través del vacío","Solo en línea horizontal"], correctIndex:0 },
  },
  vibración: {
    teach: { title:"Todo Sonido nace de una Vibración", body:"Absolutamente TODO sonido que escuchas comenzó como una vibración física. En un piano, un martillo golpea una cuerda de metal y la hace vibrar. En tu voz, el aire pasa por tus cuerdas vocales y las hace vibrar. En una guitarra, tus dedos hacen vibrar las cuerdas. ¡Sin vibración, no hay sonido!",
      playButtons:[{note:"C4",label:"🔊 Escuchar vibración: DO"},{note:"G4",label:"🔊 Escuchar vibración: SOL"}],
      tip:"Toca una tecla del piano de abajo y observa cómo puedes 'sentir' la vibración en tus dedos." },
    quiz: { question:"¿Cuál es el origen de todo sonido?", options:["Una vibración física","La electricidad","El eco","El silencio previo"], correctIndex:0 },
  },

  // === LESSON 2: EL TECLADO Y EL PENTAGRAMA ===
  "teclas blancas": {
    teach: { title:"Las 7 Notas Naturales", body:"El piano tiene teclas BLANCAS y NEGRAS. Las blancas son las 7 notas naturales: DO, RE, MI, FA, SOL, LA, SI. Este patrón se repite una y otra vez a lo largo de todo el teclado. Cada repetición se llama una OCTAVA.", visual:"keyboard", highlightKeys:["C4","D4","E4","F4","G4","A4","B4"],
      tip:"En inglés, las notas se nombran con letras: C=DO, D=RE, E=MI, F=FA, G=SOL, A=LA, B=SI." },
    quiz: { question:"¿Cuántas notas naturales (teclas blancas) existen?", options:["7: DO, RE, MI, FA, SOL, LA, SI","5: DO, RE, MI, FA, SOL","12: todas las teclas","8: con el DO repetido"], correctIndex:0 },
  },
  "teclas negras": {
    teach: { title:"Las Teclas Negras: Tu Mapa", body:"Las teclas negras están organizadas en grupos de 2 y de 3, alternándose por todo el teclado. Son tu GPS musical: el grupo de 2 negras te dice EXACTAMENTE dónde está el DO (la tecla blanca justo a la izquierda del grupo de 2). El grupo de 3 negras te ubica FA (a la izquierda de las 3 negras).", visual:"keyboard", highlightKeys:["C#4","D#4","F#4","G#4","A#4"],
      tip:"Truco infalible: Busca un grupo de 2 teclas negras → la tecla blanca inmediatamente a la izquierda es SIEMPRE un DO." },
    quiz: { question:"¿Cómo encuentras rápidamente la nota DO en el piano?", options:["Es la tecla blanca a la izquierda del grupo de 2 negras","Es la primera tecla del piano","Está al centro del teclado","Es cualquier tecla blanca"], correctIndex:0 },
  },
  octava: {
    teach: { title:"La Octava: El Patrón que se Repite", body:"Una octava es la distancia entre una nota y la SIGUIENTE nota con el mismo nombre. Por ejemplo, de un DO al siguiente DO más agudo. El patrón de 7 notas (DO-RE-MI-FA-SOL-LA-SI) se repite en cada octava. Un piano estándar tiene 7 octavas completas (88 teclas).",
      playButtons:[{note:"C4",label:"🔊 DO grave (octava 4)"},{note:"C5",label:"🔊 DO agudo (octava 5)"}],
      tip:"Cuando subes una octava, la frecuencia se DUPLICA exactamente. DO4=261 Hz, DO5=523 Hz (¡el doble!)." },
    quiz: { question:"¿Qué pasa con la frecuencia cuando subes una octava?", options:["Se duplica exactamente","Se triplica","Aumenta en 100 Hz","No cambia"], correctIndex:0 },
  },
  pentagrama: {
    teach: { title:"El Pentagrama: 5 Líneas Mágicas", body:"El pentagrama es el sistema de 5 LÍNEAS horizontales donde escribimos la música. Las notas se colocan SOBRE las líneas o EN los espacios entre ellas. Cuanto más arriba está la nota en el pentagrama, más AGUDA suena. El pentagrama es como un mapa que le dice al músico qué notas tocar y cuándo.", visual:"image", imageUrl:"/images/clef.png",
      tip:"Las 5 líneas del pentagrama (de abajo a arriba en clave de sol): MI, SOL, SI, RE, FA. Truco: 'Mi Sol Brilla Regalando Felicidad'." },
    quiz: { question:"¿Cuántas líneas tiene un pentagrama?", options:["5 líneas y 4 espacios","4 líneas y 5 espacios","6 líneas","5 líneas y 5 espacios"], correctIndex:0 },
  },
  "DO RE MI": {
    teach: { title:"¡Toca tus Primeras Notas!", body:"¡Es hora de tocar! Ubica el DO en el teclado de abajo (recuerda: a la izquierda de las 2 negras). Desde ahí, sube tecla por tecla: DO → RE → MI → FA → SOL. Cada tecla blanca consecutiva sube un paso. ¡Felicidades, estás tocando tu primera escala!", visual:"image", imageUrl:"/images/posture.png",
      playButtons:[{note:"C4",label:"DO"},{note:"D4",label:"RE"},{note:"E4",label:"MI"},{note:"F4",label:"FA"},{note:"G4",label:"SOL"}],
      tip:"Usa un dedo diferente para cada nota: pulgar=DO, índice=RE, medio=MI, anular=FA, meñique=SOL." },
    quiz: { question:"¿Qué nota viene después de MI?", options:["FA","SOL","RE","SI"], correctIndex:0 },
  },

  // === LESSON 3: FIGURAS RÍTMICAS I ===
  redonda: {
    teach: { title:"La Redonda: 4 Tiempos", body:"La redonda (𝅝) es la figura más larga. Dura 4 tiempos completos. Toca una tecla y cuenta lentamente: 1... 2... 3... 4... antes de soltar. En un compás de 4/4, una sola redonda llena TODO el compás. Se dibuja como un óvalo vacío sin plica (palito).", visual:"image", imageUrl:"/images/rhythm.png",
      playButtons:[{note:"C4",label:"🔊 Escuchar redonda (4 tiempos)"}],
      tip:"Imagina la redonda como una pizza completa: ocupa todo el espacio del compás." },
    quiz: { question:"¿Cuántos tiempos dura una redonda?", options:["4 tiempos","2 tiempos","1 tiempo","8 tiempos"], correctIndex:0 },
  },
  blanca: {
    teach: { title:"La Blanca: 2 Tiempos", body:"La blanca (𝅗𝅥) dura la MITAD de una redonda: 2 tiempos. Toca y cuenta: 1... 2... Se dibuja como un óvalo vacío CON una plica (palito). En un compás de 4/4 puedes poner exactamente 2 blancas (2+2=4).",
      tip:"Si la redonda es una pizza completa, la blanca es MEDIA pizza." },
    quiz: { question:"¿Cuántas blancas caben en un compás de 4/4?", options:["2 blancas (2+2=4 tiempos)","4 blancas","1 blanca","3 blancas"], correctIndex:0 },
  },
  negra: {
    teach: { title:"La Negra: 1 Tiempo", body:"La negra (♩) es la UNIDAD básica del ritmo. Dura exactamente 1 tiempo. Es como el tic-tac de un reloj o el latido de tu corazón. Se dibuja como un óvalo RELLENO con plica. En un compás de 4/4 caben exactamente 4 negras.",
      tip:"Cuando caminas a paso normal, cada paso es aproximadamente una negra. ¡Tu cuerpo ya sabe el ritmo!" },
    quiz: { question:"¿Cuántas negras caben en un compás de 4/4?", options:["4 negras","2 negras","8 negras","1 negra"], correctIndex:0 },
  },
  pulso: {
    teach: { title:"El Pulso: El Corazón de la Música", body:"El pulso es el latido CONSTANTE de la música. Es ese ritmo interno que te hace mover el pie, la cabeza o aplaudir cuando escuchas tu canción favorita. El pulso nunca para mientras suena la música. Todas las notas se organizan alrededor del pulso.",
      tip:"Prueba esto: pon tu canción favorita y aplaude al ritmo. Ese ritmo constante que sigues es el PULSO." },
    quiz: { question:"¿Qué es el pulso musical?", options:["El latido constante e interno de la música","El volumen de la canción","La velocidad de las manos","Un tipo de nota musical"], correctIndex:0 },
  },
  tempo: {
    teach: { title:"El Tempo: ¿Rápido o Lento?", body:"El tempo es la VELOCIDAD del pulso. Se mide en BPM (Beats Per Minute = Pulsos Por Minuto). 60 BPM = un pulso por segundo (como un reloj). 120 BPM = dos pulsos por segundo (música pop típica). 180 BPM = música muy rápida (heavy metal, drum & bass).",
      tip:"Allegro = rápido (~120-156 BPM). Adagio = lento (~66-76 BPM). Andante = caminando (~76-108 BPM)." },
    quiz: { question:"¿Qué significa que una canción tiene un tempo de 120 BPM?", options:["Hay 120 pulsos en cada minuto","La canción dura 120 segundos","Se usan 120 notas","El volumen es 120"], correctIndex:0 },
  },
};

// Generate fallback content for concepts not in the dictionary
function getFallback(concept, lesson) {
  return {
    teach: { title:`Aprendiendo: ${concept}`, body:`En la lección "${lesson}", el concepto de ${concept} es fundamental. Entender este principio te permitirá avanzar con confianza en tu viaje musical. Tómate un momento para interiorizar esta información.` },
    quiz: { question:`¿Por qué es importante el concepto de "${concept}" en "${lesson}"?`, options:[`Es fundamental para la práctica musical`,`No tiene importancia real`,`Solo aplica en música clásica`,`Es opcional para principiantes`], correctIndex:0 },
  };
}

// ── Fallback Builder (For lessons not yet customized) ──
function buildFallbackSubLessonSteps(meta, subIdx, levelId) {
  const steps = [];
  const concept = meta.concepts[subIdx % meta.concepts.length] || meta.concepts[0];
  
  if (subIdx <= 1) {
    steps.push({ type:'teach', title:`Concepto: ${concept}`, body:`En esta lección "${meta.t}" aprenderemos sobre ${concept}. Es fundamental para tu avance musical.` });
    steps.push({ type:'quiz', question:`¿Sobre qué estamos aprendiendo?`, options:[concept,"Silencio","Ruido","Nada"], correctIndex:0 });
  } else if (subIdx === 2 || subIdx === 3) {
    steps.push({ type:'teach', title:`Practicando: ${concept}`, body:`Vamos a ponerlo en práctica. Intenta tocar las notas.` });
    steps.push({ type:'play_note', title:`🎹 Práctica`, body:`Encuentra esta nota en el teclado`, targetNote: meta.notes[0] || 'C4' });
  } else if (subIdx === 4) {
    steps.push({ type:'teach', title:'👂 Oído Musical', body:'Un buen músico escucha atentamente.' });
    steps.push({ type:'listen', body:'¿Qué nota suena?', listenNote: meta.notes[0] || 'C4', options:[...new Set([...meta.notes, 'C4', 'E4'])].slice(0,4) });
  } else if (subIdx === 5 || subIdx === 6) {
    steps.push({ type:'teach', title:`Teoría Avanzada`, body:`Continuando con el tema de ${meta.t}...` });
    steps.push({ type:'quiz', question:`¿Es importante practicar?`, options:["Sí, todos los días","No","Solo en clases"], correctIndex:0 });
  } else if (subIdx === 7) {
    steps.push({ type:'play_sequence', title:'Conecta Notas', body:'Toca esta secuencia', sequence:meta.notes.slice(0,3) });
  } else if (subIdx === 8) {
    steps.push({ type:'cascade', notes:[...meta.notes,...meta.notes].slice(0,8), speed:2000 });
  } else {
    steps.push({ type:'quiz', question:`¿Completaste el módulo?`, options:["Sí","No"], correctIndex:0 });
    steps.push({ type:'sandbox', title:'Exploración', body:'¡Felicidades!' });
  }
  return steps;
}

// ── Sub-lesson titles and icons per position ──
const SUB_TITLES = [
  { prefix:"📘 Introducción:", icon:"📖", desc:"Concepto inicial" },
  { prefix:"📘 Fundamentos:", icon:"🧱", desc:"Base teórica" },
  { prefix:"📚 Teoría +", icon:"📚", desc:"Teoría y práctica" },
  { prefix:"📚 Profundiza:", icon:"🔬", desc:"Concepto avanzado" },
  { prefix:"👂 Oído Musical:", icon:"👂", desc:"Entrenamiento auditivo" },
  { prefix:"📘 Concepto:", icon:"📖", desc:"Más teoría" },
  { prefix:"🎹 Practica:", icon:"🎹", desc:"Ejercicio de piano" },
  { prefix:"🎯 Secuencia:", icon:"🎯", desc:"Conectar notas" },
  { prefix:"🎮 Cascada:", icon:"🎮", desc:"Desafío de reflejos" },
  { prefix:"🏆 Evaluación:", icon:"🏆", desc:"Prueba final" },
];

export function generateMusicSubLessons(lessonId, levelId, lessonIdx) {
  const meta = MUSIC_LESSONS_META[levelId]?.[lessonIdx];
  if (!meta) return [];

  // Use Custom Lesson Builders if available
  if (levelId === 'beginner') {
    if (lessonIdx === 0) return getLesson0(lessonId);
    if (lessonIdx === 1) return getLesson1(lessonId);
    if (lessonIdx === 2) return getLesson2(lessonId);
    if (lessonIdx === 3) return getLesson3(lessonId);
  }

  // Fallback for non-customized lessons
  return SUB_TITLES.map((st, sIdx) => {
    const concept = meta.concepts[sIdx % meta.concepts.length] || '';
    const steps = buildFallbackSubLessonSteps(meta, sIdx, levelId);

    return {
      id: `${lessonId}-sub${sIdx}`,
      icon: st.icon,
      title: `${st.prefix} ${meta.t}`,
      desc: st.desc,
      xp: sIdx === 9 ? 30 : sIdx >= 6 ? 20 : 10,
      exerciseType: 'interactive',
      concept,
      steps,
      theory: steps[0]?.body || '',
      question: steps.find(s=>s.type==='quiz')?.question || '',
      options: steps.find(s=>s.type==='quiz')?.options || ['A','B','C','D'],
      correctIndex: steps.find(s=>s.type==='quiz')?.correctIndex || 0,
    };
  });
}
