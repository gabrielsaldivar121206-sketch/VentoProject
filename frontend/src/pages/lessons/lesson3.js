export const getLesson3 = (lessonId) => {
  return [
    {
      id: `${lessonId}-sub0`, icon: "📖", title: "📘 Introducción: Clave de Sol", desc: "El símbolo principal", xp: 10, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"¿Qué es la Clave de Sol?", body:"La Clave de Sol (𝄞) es ese hermoso símbolo rizado que ves al principio de casi todas las partituras. Sirve como punto de referencia: nos indica exactamente qué notas representa cada línea del pentagrama.", visual:"image", imageUrl:"/images/clef.png" },
        { type:'quiz', question:"¿Para qué sirve una Clave en música?", options:["Para darle un punto de referencia a las líneas del pentagrama","Para decorar la partitura","Para indicar el volumen","Para terminar la canción"], correctIndex:0 }
      ]
    },
    {
      id: `${lessonId}-sub1`, icon: "🎯", title: "🎯 La Línea de Sol", desc: "El punto de inicio", xp: 15, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"El centro del espiral", body:"Si observas bien el dibujo de la Clave de Sol, el espiral central envuelve la SEGUNDA LÍNEA (contando desde abajo hacia arriba). Esa línea se llama SOL.", visual:"image", imageUrl:"/images/clef.png",
          tip:"La nota SOL que se ubica ahí corresponde a la tecla SOL (G4) que está cerca del centro de tu piano." },
        { type:'quiz', question:"¿Qué línea envuelve el centro de la Clave de Sol?", options:["La segunda línea (desde abajo)","La primera línea","La última línea"], correctIndex:0 },
        { type:'play_note', title:'Encuentra SOL', body:'Ya sabes dónde está SOL en el teclado (a la derecha del grupo de 3 teclas negras). Tócalo.', targetNote:'G4' }
      ]
    },
    {
      id: `${lessonId}-sub2`, icon: "🪜", title: "🪜 Subiendo la escalera", desc: "Las líneas", xp: 15, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"El orden de las líneas", body:"Sabiendo que la 2da línea es SOL, podemos subir. La siguiente nota (LA) va en el espacio, la siguiente (SI) va en la 3ra línea, luego DO en el espacio, RE en la 4ta línea, MI en el espacio y FA en la 5ta línea." },
        { type:'quiz', question:"Si la 2da línea es SOL, ¿qué nota está justo encima, en la 3ra línea?", options:["SI","LA","DO","RE"], correctIndex:0, explanation:"Correcto: Línea 2 = SOL. Espacio arriba = LA. Línea 3 = SI." }
      ]
    },
    {
      id: `${lessonId}-sub3`, icon: "🧠", title: "🧠 Truco de Memoria", desc: "Mi Sol Brilla...", xp: 15, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"Memoriza las 5 líneas", body:"Hay un truco clásico para memorizar las notas que van sobre las 5 líneas (de abajo hacia arriba): MI, SOL, SI, RE, FA. Puedes usar la frase: 'Mi Sol Brilla Regalando Felicidad'." },
        { type:'quiz', question:"¿Cuál de estas frases ayuda a recordar las 5 LÍNEAS de la clave de sol?", options:["Mi Sol Brilla Regalando Felicidad (MI, SOL, SI, RE, FA)","Falto A Do Mi Sol (FA, LA, DO, MI)"], correctIndex:0 },
        { type:'play_sequence', title:'Toca las líneas', body:'Toca MI, SOL, SI en orden (las primeras 3 líneas).', sequence:['E4','G4','B4'] }
      ]
    },
    {
      id: `${lessonId}-sub4`, icon: "🟩", title: "🟩 Los Espacios", desc: "F A C E", xp: 15, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"Memoriza los 4 espacios", body:"Las notas que van en los espacios entre las líneas (de abajo hacia arriba) son: FA, LA, DO, MI. En inglés forman la palabra 'FACE' (cara)." },
        { type:'quiz', question:"¿Qué notas van en los ESPACIOS de la clave de sol?", options:["FA, LA, DO, MI","MI, SOL, SI, RE, FA"], correctIndex:0 },
        { type:'play_sequence', title:'Toca los espacios', body:'Toca FA, LA, DO (C5).', sequence:['F4','A4','C5'] }
      ]
    },
    {
      id: `${lessonId}-sub5`, icon: "👂", title: "👂 Identifica la nota", desc: "Entrenamiento visual/auditivo", xp: 15, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"Combina Oído y Teoría", body:"Cuando lees una nota en el pentagrama, debes saber a qué tecla corresponde y cómo suena." },
        { type:'listen', body:'¿Qué nota aguda es esta? (Pista: es una nota de un espacio alto)', listenNote: 'C5', options:['C4','G4','C5','E5'] }
      ]
    },
    {
      id: `${lessonId}-sub6`, icon: "🎹", title: "🎹 Lectura Rápida", desc: "El DO central", xp: 15, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"El DO Central", body:"El DO central (C4) es tan importante que tiene su propia 'línea adicional' justo debajo de las 5 líneas principales. Es la nota base para ubicar tu mano derecha." },
        { type:'play_note', title:'Toca DO Central', body:'Encuentra el DO.', targetNote:'C4' }
      ]
    },
    {
      id: `${lessonId}-sub7`, icon: "🎮", title: "🎮 Cascada en Sol", desc: "Prueba visual", xp: 20, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"¡Reflejos!", body:"Es hora de conectar visualmente las notas con tus dedos de forma rápida." },
        { type:'cascade', notes:['G4','A4','B4','C5','B4','G4'], speed:2000 }
      ]
    },
    {
      id: `${lessonId}-sub8`, icon: "🏆", title: "🏆 Examen Final", desc: "Clave de Sol", xp: 30, exerciseType: 'interactive',
      steps: [
        { type:'quiz', question:"¿En qué línea o espacio va la nota SOL aguda?", options:["Segunda línea (de abajo hacia arriba)","Tercer espacio","Quinta línea"], correctIndex:0 },
        { type:'quiz', question:"¿Qué notas están en los espacios?", options:["FA, LA, DO, MI","MI, SOL, SI, RE, FA"], correctIndex:0 },
        { type:'play_sequence', title:'Secuencia de Lectura', body:'Toca las notas correspondientes a "FA LA DO" (espacios).', sequence:['F4','A4','C5'] }
      ]
    },
    {
      id: `${lessonId}-sub9`, icon: "🎨", title: "🎨 Práctica Libre", desc: "Toca con lectura", xp: 30, exerciseType: 'interactive',
      steps: [
        { type:'sandbox', title:'Exploración Libre', body:'Prueba tocar las notas que hemos aprendido en esta lección: G4, A4, B4 y C5.', suggestedNotes:['G4','A4','B4','C5'] }
      ]
    }
  ];
};
