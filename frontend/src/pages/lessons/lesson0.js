export const getLesson0 = (lessonId) => {
  return [
    {
      id: `${lessonId}-sub0`, icon: "📖", title: "📘 Introducción: Frecuencia", desc: "Velocidad de vibración", xp: 10, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"¿Qué es la Frecuencia?", body:"La frecuencia es la velocidad a la que vibra un objeto. Se mide en Hercios (Hz). Cuanto más rápido vibra, más AGUDO suena el tono. Una vibración lenta produce un sonido GRAVE.", visual:"image", imageUrl:"/images/wave.png",
          playButtons:[{note:"C3",label:"🔊 Escucha DO (Grave)"},{note:"C5",label:"🔊 Escucha DO (Agudo)"}] },
        { type:'quiz', question:"¿Qué hace que un sonido sea más agudo?", options:["Una frecuencia de vibración más rápida","Tocar el instrumento más fuerte","Un instrumento más grande","Tocar más lento"], correctIndex:0 }
      ]
    },
    {
      id: `${lessonId}-sub1`, icon: "👂", title: "👂 Entrenamiento: Frecuencias", desc: "Agudo vs Grave", xp: 10, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"Agudo o Grave", body:"Vamos a entrenar tu oído para distinguir frecuencias. Escucha atentamente y decide si el sonido es grave (baja frecuencia) o agudo (alta frecuencia).",
          tip:"Los sonidos graves vibran en tu pecho, los agudos resuenan en tu cabeza." },
        { type:'listen', body:'Ronda 1: ¿Qué nota suena?', listenNote: 'C5', options:['C3', 'C4', 'C5', 'C6'] },
        { type:'quiz', question:"Si paso de C3 a C5, ¿qué pasó con la frecuencia?", options:["Aumentó (se hizo más rápido)","Disminuyó (se hizo más lento)","Se mantuvo igual","Desapareció"], correctIndex:0 }
      ]
    },
    {
      id: `${lessonId}-sub2`, icon: "🌊", title: "📘 Concepto: Amplitud", desc: "El tamaño de la onda", xp: 10, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"La Amplitud: El Volumen", body:"La amplitud es el TAMAÑO de la onda sonora. Imagina olas del mar: una ola grande tiene más amplitud. En música, mayor amplitud = mayor VOLUMEN.", visual:"wave", waveSpeed:0.5,
          tip:"En partituras, 'p' significa piano (suave) y 'f' significa forte (fuerte)." },
        { type:'quiz', question:"¿Qué controla la amplitud de una onda?", options:["El volumen (fuerza del sonido)","La afinación de la nota","La duración","El tipo de instrumento"], correctIndex:0 }
      ]
    },
    {
      id: `${lessonId}-sub3`, icon: "🔊", title: "👂 Entrenamiento: Volumen", desc: "Reconocer dinámicas", xp: 10, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"Identificando el Volumen", body:"Escucharás la misma nota (DO), pero asegúrate de escuchar a qué intensidad se toca. ¿Es un sonido fuerte o suave?",
          playButtons:[{note:"C4",label:"🔊 Forte (Fuerte)"}] },
        { type:'quiz', question:"¿Por qué es importante controlar el volumen (amplitud) al tocar?", options:["Para darle expresión y emoción a la música","Para que la canción dure más","Para afinar el instrumento","No es importante"], correctIndex:0 }
      ]
    },
    {
      id: `${lessonId}-sub4`, icon: "🎻", title: "📘 Concepto: Timbre", desc: "El color del sonido", xp: 10, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"El Timbre Musical", body:"El timbre es la 'huella dactilar' del sonido. Es lo que te permite distinguir un piano de una guitarra, incluso si tocan exactamente la misma nota al mismo volumen.",
          tip:"El timbre depende de la forma física de la onda y sus armónicos." },
        { type:'quiz', question:"¿Qué permite distinguir dos instrumentos diferentes tocando la misma nota?", options:["El timbre","La amplitud","La frecuencia","El tempo"], correctIndex:0 }
      ]
    },
    {
      id: `${lessonId}-sub5`, icon: "🧠", title: "📚 Repaso: Los 3 Pilares", desc: "Frecuencia, Amplitud, Timbre", xp: 10, exerciseType: 'interactive',
      steps: [
        { type:'quiz', question:"Si quiero cambiar de una nota grave a una aguda, ¿qué debo alterar?", options:["La frecuencia","La amplitud","El timbre","El compás"], correctIndex:0 },
        { type:'quiz', question:"Si quiero tocar más fuerte, ¿qué aumenta?", options:["La amplitud","La frecuencia","El timbre","El ritmo"], correctIndex:0 }
      ]
    },
    {
      id: `${lessonId}-sub6`, icon: "🎵", title: "👂 Oído Musical I", desc: "Prueba tu oído", xp: 20, exerciseType: 'interactive',
      steps: [
        { type:'listen', body:'¿Puedes identificar esta nota?', listenNote: 'G4', options:['C4','E4','G4','B4'] }
      ]
    },
    {
      id: `${lessonId}-sub7`, icon: "🎶", title: "👂 Oído Musical II", desc: "Prueba avanzada", xp: 20, exerciseType: 'interactive',
      steps: [
        { type:'listen', body:'Un poco más difícil... ¿Cuál es?', listenNote: 'A4', options:['F4','G4','A4','B4'] }
      ]
    },
    {
      id: `${lessonId}-sub8`, icon: "🏆", title: "🏆 Evaluación Final", desc: "Demuestra lo aprendido", xp: 30, exerciseType: 'interactive',
      steps: [
        { type:'quiz', question:"Evaluación: ¿Cómo se relacionan frecuencia y amplitud?", options:["Son independientes: puedes tener alta frecuencia y baja amplitud","Son lo mismo","Si sube la frecuencia siempre sube la amplitud","Ninguna de las anteriores"], correctIndex:0, explanation:"Correcto. Puedes tocar una nota aguda (alta frecuencia) muy suavemente (baja amplitud)." },
        { type:'quiz', question:"Evaluación: ¿Cómo se llama la velocidad de vibración?", options:["Frecuencia","Amplitud","Timbre","Dinámica"], correctIndex:0 }
      ]
    },
    {
      id: `${lessonId}-sub9`, icon: "🎹", title: "🎹 Exploración Libre", desc: "Juega con el sonido", xp: 30, exerciseType: 'interactive',
      steps: [
        { type:'teach', title:"Experimenta", body:"¡Has completado el módulo de Naturaleza del Sonido! Ahora explora el teclado libremente. Nota cómo las teclas de la izquierda vibran más lento (graves) y las de la derecha más rápido (agudos)." },
        { type:'sandbox', title:'Exploración Libre', body:'Toca el piano y observa cómo cambia el sonido.' }
      ]
    }
  ];
};
