export const getLesson2 = (lessonId) => {
  return [
    {
      id: `${lessonId}-sub0`, icon: "📖", title: "📘 Introducción: El Pulso", desc: "El latido musical", xp: 10, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"¿Qué es el Pulso?", body:"Toda la música tiene un 'latido' constante de fondo, igual que tu corazón. A esto le llamamos 'pulso' o 'tempo'. Es lo que te hace mover el pie cuando escuchas tu canción favorita.",
          tip:"La velocidad del pulso se mide en BPM (Beats Por Minuto). Un reloj hace 'tic-tac' a exactamente 60 BPM (1 latido por segundo)." },
        { type:'quiz', question:"Si una canción está a 120 BPM, ¿es más rápida o más lenta que el segundero de un reloj?", options:["Más rápida (el doble de rápido)","Más lenta","Igual de rápida"], correctIndex:0 },
        { type:'rhythm_tap', body:'Prueba a seguir este pulso de 60 BPM. El metrónomo contará 4 tiempos (1, 2, 3, 4) y luego empezarás a tocar en cada latido.', bpm:60, beats:8, figure:'negra' }
      ]
    },
    {
      id: `${lessonId}-sub1`, icon: "⭕", title: "📘 La Redonda", desc: "Dura 4 tiempos", xp: 15, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"La Figura Redonda", body:"Para escribir CUÁNTO DURA una nota sobre el pulso constante, usamos figuras. La 'Redonda' (𝅝) es la figura más larga. Dura 4 pulsos enteros. Tocas la nota en el pulso 1 y la mantienes hasta terminar el pulso 4.", visual:"image", imageUrl:"/images/rhythm.png",
          playButtons:[{note:'C4',label:'🔊 Escuchar duración de Redonda'}] },
        { type:'quiz', question:"Si el metrónomo hace 4 clicks por compás, ¿cuántas notas tocas si es una redonda?", options:["Solo toco 1 vez en el primer click y espero 3 más","Toco 4 veces, una en cada click","Toco 2 veces"], correctIndex:0 },
        { type:'teach', title:"¡A practicar!", body:"En el siguiente ejercicio, debes tocar SOLO en el pulso 1 de cada ciclo de 4. ¡No toques en el 2, 3 ni 4!" },
        { type:'rhythm_tap', body:'Toca solo en el pulso 1. (Figura: REDONDA).', bpm:80, beats:16, figure:'redonda' }
      ]
    },
    {
      id: `${lessonId}-sub2`, icon: "◖", title: "📘 La Blanca", desc: "Dura 2 tiempos", xp: 15, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"La Figura Blanca", body:"La 'Blanca' (𝅗𝅥) dura la mitad que una redonda: EXACTAMENTE 2 tiempos. Tocas en el pulso 1 (dura el 1 y el 2), y vuelves a tocar en el pulso 3 (dura el 3 y el 4).", visual:"image", imageUrl:"/images/rhythm.png",
          tip:"Por cada Redonda, caben exactamente DOS Blancas." },
        { type:'quiz', question:"En un grupo de 4 pulsos (1, 2, 3, 4), ¿en cuáles debes tocar si son Blancas?", options:["En el 1 y en el 3","En el 1 y en el 2","Solo en el 1","En todos"], correctIndex:0 },
        { type:'rhythm_tap', body:'Toca en el pulso 1 y 3. (Figura: BLANCA).', bpm:80, beats:16, figure:'blanca' }
      ]
    },
    {
      id: `${lessonId}-sub3`, icon: "●", title: "📘 La Negra", desc: "Dura 1 tiempo", xp: 15, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"La Figura Negra", body:"La 'Negra' (♩) dura exactamente 1 tiempo. Es decir, tocas una nota POR CADA PULSO del metrónomo. Es el latido principal de casi toda la música popular.", visual:"image", imageUrl:"/images/rhythm.png",
          tip:"Cuatro Negras equivalen a Dos Blancas o a Una Redonda." },
        { type:'rhythm_tap', body:'Toca en CADA pulso del metrónomo. (Figura: NEGRA).', bpm:80, beats:16, figure:'negra' },
        { type:'quiz', question:"Si una canción tiene 4 tiempos por compás, ¿cuántas Negras caben en un compás?", options:["4","2","1","8"], correctIndex:0 }
      ]
    },
    {
      id: `${lessonId}-sub4`, icon: "🥁", title: "🥁 Acelerando: Negras", desc: "Tempo a 100 BPM", xp: 15, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"Subiendo la velocidad", body:"Ya dominas las figuras a 80 BPM (un tempo relajado). Ahora subiremos la velocidad a 100 BPM. Sentirás cómo la canción adquiere más energía." },
        { type:'rhythm_tap', body:'A 100 BPM. Toca negras (en cada click).', bpm:100, beats:16, figure:'negra' }
      ]
    },
    {
      id: `${lessonId}-sub5`, icon: "🥁", title: "🥁 Acelerando: Blancas", desc: "Tempo a 120 BPM", xp: 15, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"Tempo de marcha", body:"A 120 BPM estamos en el tempo clásico de la música disco y las marchas. Vamos a probar tu precisión tocando BLANCAS (cada 2 clicks) a esta velocidad." },
        { type:'rhythm_tap', body:'A 120 BPM. Toca en el pulso 1 y 3.', bpm:120, beats:16, figure:'blanca' }
      ]
    },
    {
      id: `${lessonId}-sub6`, icon: "🧠", title: "📚 Matemáticas Musicales", desc: "Suma de tiempos", xp: 15, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"Combinando Figuras", body:"En la música real, no tocamos siempre la misma figura. Mezclamos redondas, blancas y negras para crear melodías interesantes. Pero las matemáticas siempre deben cuadrar." },
        { type:'quiz', question:"Si tengo un compás que dura 4 tiempos, ¿qué combinación de figuras NO cabe en él?", options:["5 Negras","1 Redonda","2 Blancas","4 Negras"], correctIndex:0, explanation:"5 negras sumarían 5 tiempos, excediendo los 4 tiempos del compás." },
        { type:'quiz', question:"¿Qué suma exactamente 4 tiempos?", options:["1 Blanca + 2 Negras","1 Blanca + 1 Negra","3 Negras","1 Redonda + 1 Blanca"], correctIndex:0 }
      ]
    },
    {
      id: `${lessonId}-sub7`, icon: "🎹", title: "🎹 Ritmo en el Piano", desc: "Combina ambas", xp: 20, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"Notas + Ritmo", body:"La música es la suma perfecta de NOTAS (frecuencia) y RITMO (tiempo). Ahora vas a tocar una secuencia en el piano. Intenta que cada nota dure 1 tiempo (como una negra)." },
        { type:'play_sequence', title:'Toca a tempo de Negras', body:'Toca DO - RE - MI - FA a un ritmo constante.', sequence:['C4','D4','E4','F4'] },
        { type:'play_sequence', title:'Toca a tempo de Blancas', body:'Toca las mismas notas, pero déjalas sonar un poco más.', sequence:['C4','D4','E4','F4'] }
      ]
    },
    {
      id: `${lessonId}-sub8`, icon: "🏆", title: "🏆 Examen Final", desc: "Precisión total", xp: 30, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"Prueba Definitiva", body:"Este es el examen final de Figuras Rítmicas I. Debes demostrar precisión tocando NEGRAS a 110 BPM. Concéntrate, espera los 4 tiempos de cuenta regresiva, y ¡no falles!" },
        { type:'rhythm_tap', body:'Negras a 110 BPM. ¡Precisión absoluta!', bpm:110, beats:16, figure:'negra' }
      ]
    },
    {
      id: `${lessonId}-sub9`, icon: "🎨", title: "🎨 Creador Rítmico", desc: "Exploración", xp: 30, exerciseType: 'interactive',
      steps: [
        { type:'sandbox', title:'Exploración Libre', body:'Felicidades por dominar el pulso. Prueba tocar melodías e inventa tus propios ritmos. Mezcla notas largas (blancas/redondas) con notas cortas (negras).' }
      ]
    }
  ];
};
