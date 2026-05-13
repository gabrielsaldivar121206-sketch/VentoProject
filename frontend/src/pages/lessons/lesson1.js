export const getLesson1 = (lessonId) => {
  return [
    {
      id: `${lessonId}-sub0`, icon: "📖", title: "📘 Introducción: Teclas Negras", desc: "La brújula del piano", xp: 10, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"El Mapa del Teclado", body:"Mirar un piano puede ser intimidante, ¡son demasiadas teclas blancas! Pero el secreto está en las teclas negras. Observa que están agrupadas de a DOS y de a TRES. Este patrón se repite por todo el teclado y nos sirve como brújula.", visual:"keyboard", highlightKeys:['C#4','D#4', 'F#4','G#4','A#4'],
          tip:"Ubica el grupo de DOS teclas negras. La tecla blanca que está inmediatamente a la izquierda es siempre DO." },
        { type:'quiz', question:"¿Para qué sirven las teclas negras al empezar a tocar?", options:["Como referencia visual para ubicarnos","Son adornos que no suenan","Para tocar más fuerte","Solo se usan en música triste"], correctIndex:0 }
      ]
    },
    {
      id: `${lessonId}-sub1`, icon: "🎹", title: "🎹 Ubicando el DO", desc: "Encuentra la nota", xp: 10, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"Encuentra DO", body:"Como dijimos, DO siempre está a la izquierda del grupo de DOS teclas negras. Vamos a comprobarlo en el teclado interactivo.", visual:"keyboard", highlightKeys:['C4'] },
        { type:'play_note', title:'Toca DO', body:'Encuentra la tecla DO en el mini-piano de abajo.', targetNote:'C4', hint:'Busca las 2 teclas negras, ve a la blanca de la izquierda.' }
      ]
    },
    {
      id: `${lessonId}-sub2`, icon: "🎹", title: "🎹 Sube a RE y MI", desc: "Subiendo la escalera", xp: 10, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"De DO a MI", body:"Si sabes dónde está DO, el resto es fácil: solo tienes que avanzar tecla por tecla hacia la derecha (subir): DO, luego RE (entre las dos negras), luego MI (a la derecha de las dos negras).", visual:"keyboard", highlightKeys:['C4','D4','E4'], playButtons:[{note:'C4',label:'DO'},{note:'D4',label:'RE'},{note:'E4',label:'MI'}] },
        { type:'play_sequence', title:'Toca DO - RE - MI', body:'Toca estas tres notas en orden.', sequence:['C4','D4','E4'] }
      ]
    },
    {
      id: `${lessonId}-sub3`, icon: "🎼", title: "📘 Concepto: El Pentagrama", desc: "El mapa musical", xp: 10, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"Las 5 Líneas", body:"El pentagrama es un conjunto de 5 líneas donde se escriben las notas. Cuanto más arriba se dibuja la nota, más aguda suena en el piano (hacia la derecha).", visual:"image", imageUrl:"/images/clef.png",
          tip:"La nota DO central se dibuja en una línea adicional especial debajo del pentagrama." },
        { type:'quiz', question:"Si ves una nota dibujada muy arriba en el pentagrama, ¿dónde la tocas en el piano?", options:["Hacia la derecha (más agudo)","Hacia la izquierda (más grave)","En el centro exacto","Con más fuerza"], correctIndex:0 }
      ]
    },
    {
      id: `${lessonId}-sub4`, icon: "🎹", title: "🎹 Práctica: FA y SOL", desc: "Completando los 5 dedos", xp: 10, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"El grupo de Tres Negras", body:"Después de MI vienen FA y SOL. FA siempre se encuentra a la izquierda del grupo de TRES teclas negras. ¡Esa es tu segunda brújula!", visual:"keyboard", highlightKeys:['F4','G4'] },
        { type:'play_note', title:'Toca FA', body:'Encuentra FA (a la izquierda de las tres negras).', targetNote:'F4' },
        { type:'play_note', title:'Toca SOL', body:'Ahora toca la nota que le sigue a FA.', targetNote:'G4' }
      ]
    },
    {
      id: `${lessonId}-sub5`, icon: "🎯", title: "🎯 Secuencia Completa", desc: "5 notas", xp: 20, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"Tus Primeras 5 Notas", body:"Ya sabes ubicar DO, RE, MI, FA y SOL. Ahora vamos a tocarlas en secuencia. Recuerda: usa un dedo para cada tecla para no tener que mover la mano." },
        { type:'play_sequence', title:'Secuencia de 5', body:'Toca DO RE MI FA SOL.', sequence:['C4','D4','E4','F4','G4'] }
      ]
    },
    {
      id: `${lessonId}-sub6`, icon: "👂", title: "👂 Entrenamiento Auditivo", desc: "Reconocer", xp: 10, exerciseType: 'interactive',
      steps: [
        { type:'listen', body:'Identifica qué nota es. (Pista: es de las primeras 3)', listenNote: 'E4', options:['C4','D4','E4'] },
        { type:'listen', body:'¿Y esta?', listenNote: 'G4', options:['E4','F4','G4'] }
      ]
    },
    {
      id: `${lessonId}-sub7`, icon: "🎮", title: "🎮 Desafío Cascada I", desc: "Reflejos", xp: 20, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"¡Mini-juego!", body:"Es hora de probar tus reflejos. Las notas DO, RE, MI caerán. Tócalas justo a tiempo." },
        { type:'cascade', notes:['C4','D4','E4','C4','E4','D4'], speed:2400 }
      ]
    },
    {
      id: `${lessonId}-sub8`, icon: "🏆", title: "🏆 Evaluación Final", desc: "Demuestra dominio", xp: 30, exerciseType: 'interactive',
      steps: [
        { type:'quiz', question:"¿Dónde se encuentra la nota FA?", options:["A la izquierda del grupo de 3 teclas negras","A la izquierda del grupo de 2 teclas negras","Es siempre la primera tecla del piano"], correctIndex:0 },
        { type:'play_sequence', title:'Secuencia Final', body:'Toca DO - MI - SOL', sequence:['C4','E4','G4'] }
      ]
    },
    {
      id: `${lessonId}-sub9`, icon: "🎹", title: "🎹 Exploración Libre", desc: "Juega", xp: 30, exerciseType: 'interactive',
      steps: [
        { type:'sandbox', title:'Libertad Total', body:'Ya conoces la ubicación básica. Toca libremente y memoriza el patrón visual.', suggestedNotes:['C4','E4','G4'] }
      ]
    }
  ];
};
