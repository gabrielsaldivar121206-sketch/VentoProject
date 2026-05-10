// courseData.js — Lesson content per course per level
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

// Each course has lessons per level
export const LESSONS = {
  english: {
    beginner: [
      { id:'en-b1', icon:'👋', title:'Saludos Básicos', desc:'Hello, Hi, Good morning...', xp:15, content:'<h3>Saludos en Inglés</h3><p>Los saludos más comunes son:</p><ul><li><b>Hello</b> — Hola</li><li><b>Hi</b> — Hola (informal)</li><li><b>Good morning</b> — Buenos días</li><li><b>Good afternoon</b> — Buenas tardes</li><li><b>Good evening</b> — Buenas noches</li></ul><div class="tip-box">💡 "Hi" es más casual que "Hello". Usa "Hello" en situaciones formales.</div>' },
      { id:'en-b2', icon:'🔤', title:'El Alfabeto', desc:'A, B, C... y su pronunciación', xp:15, content:'<h3>El Alfabeto Inglés</h3><p>El inglés tiene 26 letras. La clave es aprender su pronunciación:</p><ul><li><b>A</b> (ei), <b>B</b> (bi), <b>C</b> (si), <b>D</b> (di)</li><li><b>E</b> (i), <b>F</b> (ef), <b>G</b> (yi), <b>H</b> (eich)</li><li><b>I</b> (ai), <b>J</b> (yei), <b>K</b> (kei), <b>L</b> (el)</li></ul><div class="tip-box">💡 Practica deletreando tu nombre en inglés.</div>' },
      { id:'en-b3', icon:'🔢', title:'Números 1-20', desc:'Aprende a contar en inglés', xp:20, content:'<h3>Números del 1 al 20</h3><ul><li>1 — One, 2 — Two, 3 — Three, 4 — Four, 5 — Five</li><li>6 — Six, 7 — Seven, 8 — Eight, 9 — Nine, 10 — Ten</li><li>11 — Eleven, 12 — Twelve, 13 — Thirteen</li></ul>' },
      { id:'en-b4', icon:'🎨', title:'Colores', desc:'Red, Blue, Green...', xp:15, content:'<h3>Los Colores</h3><ul><li>🔴 Red — Rojo</li><li>🔵 Blue — Azul</li><li>🟢 Green — Verde</li><li>🟡 Yellow — Amarillo</li><li>⚫ Black — Negro</li><li>⚪ White — Blanco</li></ul>' },
      { id:'en-b5', icon:'👨‍👩‍👧', title:'La Familia', desc:'Mother, Father, Sister...', xp:20, content:'<h3>Miembros de la Familia</h3><ul><li><b>Mother/Mom</b> — Madre/Mamá</li><li><b>Father/Dad</b> — Padre/Papá</li><li><b>Sister</b> — Hermana</li><li><b>Brother</b> — Hermano</li><li><b>Grandmother</b> — Abuela</li></ul>' },
      { id:'en-b6', icon:'🍎', title:'Comida Básica', desc:'Apple, Water, Bread...', xp:20, content:'<h3>Vocabulario de Comida</h3><ul><li>🍎 Apple — Manzana</li><li>💧 Water — Agua</li><li>🍞 Bread — Pan</li><li>🥛 Milk — Leche</li><li>🍚 Rice — Arroz</li></ul>' },
    ],
    intermediate: [
      { id:'en-i1', icon:'💬', title:'Conversaciones', desc:'Diálogos cotidianos fluidos', xp:25, content:'<h3>Conversaciones del Día a Día</h3><p>Aprende patrones de conversación:</p><ul><li>"How are you doing?" — "I\'m doing great, thanks!"</li><li>"What do you do for a living?" — "I\'m a student."</li><li>"Where are you from?" — "I\'m from Mexico."</li></ul>' },
      { id:'en-i2', icon:'📖', title:'Tiempos Verbales', desc:'Present, Past y Future', xp:30, content:'<h3>Los 3 Tiempos Principales</h3><ul><li><b>Present Simple:</b> I eat, She plays</li><li><b>Past Simple:</b> I ate, She played</li><li><b>Future Simple:</b> I will eat, She will play</li></ul><div class="tip-box">💡 Para past simple, los verbos regulares terminan en -ed.</div>' },
      { id:'en-i3', icon:'✍️', title:'Escritura', desc:'Emails y mensajes formales', xp:30, content:'<h3>Escribiendo en Inglés</h3><p>Estructura de un email formal:</p><ul><li>Dear Mr./Mrs. [Name],</li><li>I am writing to...</li><li>Thank you for your time.</li><li>Best regards, [Your name]</li></ul>' },
      { id:'en-i4', icon:'🗣️', title:'Phrasal Verbs', desc:'Get up, Turn off, Look for...', xp:30, content:'<h3>Phrasal Verbs Esenciales</h3><ul><li><b>Get up</b> — Levantarse</li><li><b>Turn off</b> — Apagar</li><li><b>Look for</b> — Buscar</li><li><b>Give up</b> — Rendirse</li><li><b>Find out</b> — Descubrir</li></ul>' },
      { id:'en-i5', icon:'🎧', title:'Listening Skills', desc:'Comprensión auditiva', xp:25, content:'<h3>Mejora tu Comprensión</h3><p>Técnicas para entender inglés hablado:</p><ul><li>Escucha podcasts en inglés a velocidad lenta</li><li>Ve series con subtítulos en inglés</li><li>Repite frases que escuches</li></ul>' },
    ],
    advanced: [
      { id:'en-a1', icon:'📰', title:'Reading Avanzado', desc:'Artículos y textos complejos', xp:40, content:'<h3>Lectura Avanzada</h3><p>Estrategias para textos complejos:</p><ul><li>Skimming — lectura rápida general</li><li>Scanning — buscar información específica</li><li>Inferencia — deducir significados del contexto</li></ul>' },
      { id:'en-a2', icon:'🎤', title:'Debate y Opinión', desc:'Argumenta en inglés con fluidez', xp:40, content:'<h3>Expresar Opiniones</h3><ul><li>"In my opinion..." — En mi opinión...</li><li>"I strongly believe that..." — Creo firmemente que...</li><li>"On the other hand..." — Por otro lado...</li><li>"Nevertheless..." — Sin embargo...</li></ul>' },
      { id:'en-a3', icon:'📝', title:'Ensayos', desc:'Estructura argumentativa', xp:45, content:'<h3>Escribir Ensayos</h3><p>Estructura: Introduction → Body Paragraphs → Conclusion</p><div class="tip-box">💡 Usa conectores: Furthermore, Moreover, In addition, However, Therefore.</div>' },
      { id:'en-a4', icon:'🌐', title:'Modismos', desc:'Idioms y expresiones nativas', xp:40, content:'<h3>Expresiones Idiomáticas</h3><ul><li>"Break a leg" — Buena suerte</li><li>"Hit the nail on the head" — Dar en el clavo</li><li>"Piece of cake" — Pan comido</li><li>"Under the weather" — Sentirse mal</li></ul>' },
    ],
  },
  chess: {
    beginner: [
      { id:'ch-b1', icon:'♟', title:'Las Piezas', desc:'Conoce cada pieza y su valor', xp:15, content:'<h3>Las Piezas del Ajedrez</h3><ul><li>♔ <b>Rey</b> — La pieza más importante</li><li>♛ <b>Dama</b> — La más poderosa (9 pts)</li><li>♜ <b>Torre</b> — Se mueve en línea recta (5 pts)</li><li>♝ <b>Alfil</b> — Diagonal (3 pts)</li><li>♞ <b>Caballo</b> — En L (3 pts)</li><li>♟ <b>Peón</b> — Avanza de frente (1 pt)</li></ul>' },
      { id:'ch-b2', icon:'📐', title:'Movimientos', desc:'Cómo se mueve cada pieza', xp:20, content:'<h3>Movimientos Básicos</h3><ul><li>El <b>peón</b> avanza 1 casilla (2 en su primer movimiento)</li><li>La <b>torre</b> se mueve horizontal y verticalmente</li><li>El <b>alfil</b> se mueve en diagonal</li><li>El <b>caballo</b> se mueve en forma de L</li></ul>' },
      { id:'ch-b3', icon:'🏁', title:'Jaque Mate', desc:'Cómo ganar una partida', xp:20, content:'<h3>Jaque y Jaque Mate</h3><p><b>Jaque:</b> El rey está amenazado.</p><p><b>Jaque Mate:</b> El rey no puede escapar.</p><div class="tip-box">💡 ¡El objetivo del juego es dar jaque mate al rey rival!</div>' },
      { id:'ch-b4', icon:'🔄', title:'Reglas Especiales', desc:'Enroque, captura al paso', xp:20, content:'<h3>Movimientos Especiales</h3><ul><li><b>Enroque:</b> Rey + Torre se mueven juntos</li><li><b>Captura al paso:</b> Peón captura peón que avanzó 2</li><li><b>Promoción:</b> Peón llega al final y se convierte</li></ul>' },
    ],
    intermediate: [
      { id:'ch-i1', icon:'⚔️', title:'Tácticas', desc:'Clavada, horquilla, descubierta', xp:30, content:'<h3>Tácticas Fundamentales</h3><ul><li><b>Clavada:</b> Una pieza no se puede mover sin exponer otra</li><li><b>Horquilla:</b> Una pieza ataca dos a la vez</li><li><b>Descubierta:</b> Al mover una pieza, otra amenaza</li></ul>' },
      { id:'ch-i2', icon:'🏰', title:'Aperturas', desc:'Italiana, Española, Siciliana', xp:30, content:'<h3>Aperturas Populares</h3><ul><li><b>Italiana:</b> 1.e4 e5 2.Nf3 Nc6 3.Bc4</li><li><b>Española:</b> 1.e4 e5 2.Nf3 Nc6 3.Bb5</li><li><b>Siciliana:</b> 1.e4 c5</li></ul><div class="tip-box">💡 Controla el centro del tablero desde el inicio.</div>' },
      { id:'ch-i3', icon:'🧩', title:'Medio Juego', desc:'Estrategia y planificación', xp:35, content:'<h3>Estrategia del Medio Juego</h3><ul><li>Controlar el centro</li><li>Activar todas las piezas</li><li>Crear debilidades en la posición rival</li><li>Coordinar piezas para ataques</li></ul>' },
    ],
    advanced: [
      { id:'ch-a1', icon:'👑', title:'Finales', desc:'Rey y peones, torres', xp:40, content:'<h3>Finales de Partida</h3><ul><li><b>Oposición:</b> Técnica de reyes enfrentados</li><li><b>Regla del cuadrado:</b> ¿Puede el rey alcanzar al peón?</li><li><b>Final de torre:</b> El más común</li></ul>' },
      { id:'ch-a2', icon:'🧠', title:'Cálculo Profundo', desc:'Variantes y sacrificios', xp:45, content:'<h3>Cálculo Avanzado</h3><p>Aprende a calcular 5+ jugadas adelante:</p><ul><li>Identifica jugadas candidatas</li><li>Calcula las respuestas del rival</li><li>Evalúa la posición final</li></ul>' },
      { id:'ch-a3', icon:'📊', title:'Análisis', desc:'Evalúa posiciones como un GM', xp:45, content:'<h3>Evaluación Posicional</h3><ul><li>Estructura de peones</li><li>Actividad de piezas</li><li>Seguridad del rey</li><li>Control de casillas clave</li></ul>' },
    ],
  },
  music: {
    beginner: [
      { id:'mu-b1', icon:'🎵', title:'Las Notas', desc:'Do, Re, Mi, Fa, Sol, La, Si', xp:15, content:'<h3>Las 7 Notas Musicales</h3><ul><li>🎵 Do (C) — Re (D) — Mi (E) — Fa (F)</li><li>🎵 Sol (G) — La (A) — Si (B)</li></ul><div class="tip-box">💡 En inglés se usan letras: C, D, E, F, G, A, B</div>' },
      { id:'mu-b2', icon:'📋', title:'El Pentagrama', desc:'5 líneas donde viven las notas', xp:15, content:'<h3>El Pentagrama</h3><p>Son 5 líneas horizontales donde se escriben las notas. Cada línea y espacio representa una nota diferente.</p><ul><li>Líneas (de abajo a arriba): Mi, Sol, Si, Re, Fa</li><li>Espacios: Fa, La, Do, Mi</li></ul>' },
      { id:'mu-b3', icon:'⏱️', title:'Ritmo Básico', desc:'Negras, blancas y redondas', xp:20, content:'<h3>Figuras Rítmicas</h3><ul><li><b>Redonda:</b> 4 tiempos ○</li><li><b>Blanca:</b> 2 tiempos 𝅗𝅥</li><li><b>Negra:</b> 1 tiempo ♩</li><li><b>Corchea:</b> ½ tiempo ♪</li></ul>' },
      { id:'mu-b4', icon:'🎹', title:'Teclado Básico', desc:'Ubica las notas en el piano', xp:20, content:'<h3>El Teclado</h3><p>Las teclas blancas son las notas naturales (Do a Si). Las negras son sostenidos (#) y bemoles (♭).</p><div class="tip-box">💡 Do está siempre antes del grupo de 2 teclas negras.</div>' },
    ],
    intermediate: [
      { id:'mu-i1', icon:'🎼', title:'Escalas Mayores', desc:'Do Mayor, Sol Mayor...', xp:30, content:'<h3>Escalas Mayores</h3><p>Patrón de intervalos: T-T-S-T-T-T-S (T=tono, S=semitono)</p><ul><li><b>Do Mayor:</b> Do Re Mi Fa Sol La Si Do</li><li><b>Sol Mayor:</b> Sol La Si Do Re Mi Fa# Sol</li></ul>' },
      { id:'mu-i2', icon:'🎶', title:'Acordes', desc:'Mayor, menor, séptima', xp:30, content:'<h3>Acordes Básicos</h3><ul><li><b>Mayor:</b> Suena alegre (Do-Mi-Sol)</li><li><b>Menor:</b> Suena triste (La-Do-Mi)</li><li><b>Séptima:</b> Suena jazzy (Sol-Si-Re-Fa)</li></ul>' },
      { id:'mu-i3', icon:'🎸', title:'Lectura Musical', desc:'Lee partituras con fluidez', xp:35, content:'<h3>Lectura de Partituras</h3><p>Combina el pentagrama con las figuras rítmicas para tocar melodías completas.</p><div class="tip-box">💡 Practica leyendo nota por nota, luego por compases completos.</div>' },
    ],
    advanced: [
      { id:'mu-a1', icon:'🎭', title:'Armonía', desc:'Progresiones y modulaciones', xp:40, content:'<h3>Armonía Avanzada</h3><ul><li><b>I-IV-V-I:</b> La progresión más clásica</li><li><b>ii-V-I:</b> La progresión del jazz</li><li><b>Modulación:</b> Cambiar de tonalidad</li></ul>' },
      { id:'mu-a2', icon:'🎻', title:'Composición', desc:'Crea tus propias melodías', xp:45, content:'<h3>Composición Musical</h3><ul><li>Define la tonalidad y el tempo</li><li>Crea un motivo melódico</li><li>Desarrolla con variaciones</li><li>Estructura: Intro-Verso-Coro</li></ul>' },
      { id:'mu-a3', icon:'🎧', title:'Producción', desc:'Introducción al audio digital', xp:45, content:'<h3>Producción Musical Digital</h3><p>Herramientas básicas: DAW, MIDI, samples, mezcla y masterización.</p>' },
    ],
  },
  signlanguage: {
    beginner: [
      { id:'sl-b1', icon:'✋', title:'Las Vocales', desc:'A, E, I, O, U en señas', xp:15, type:'detector', letters:['A','E','I','O','U'] },
      { id:'sl-b2', icon:'🤙', title:'Saludos', desc:'Hola, Adiós, Gracias', xp:15, content:'<h3>Saludos en Lengua de Señas</h3><ul><li><b>Hola:</b> Mano abierta, palma hacia adelante, mueve lateralmente</li><li><b>Adiós:</b> Mano abierta, abre y cierra los dedos</li><li><b>Gracias:</b> Mano plana toca la barbilla y se extiende hacia adelante</li></ul>' },
      { id:'sl-b3', icon:'🔤', title:'Abecedario A-M', desc:'Primeras 13 letras', xp:20, type:'detector', letters:['A','B','C','D','E','F','G','H','I','K','L','M'] },
      { id:'sl-b4', icon:'🔡', title:'Abecedario N-Y', desc:'Últimas letras', xp:20, type:'detector', letters:['N','O','P','Q','R','S','T','U','V','W','X','Y'] },
    ],
    intermediate: [
      { id:'sl-i1', icon:'🔢', title:'Números', desc:'1-10 en lengua de señas', xp:25, content:'<h3>Números del 1 al 10</h3><ul><li><b>1:</b> Índice arriba</li><li><b>2:</b> Índice y medio arriba (V)</li><li><b>3:</b> Pulgar, índice y medio</li><li><b>4:</b> Cuatro dedos sin pulgar</li><li><b>5:</b> Mano abierta completa</li></ul>' },
      { id:'sl-i2', icon:'💬', title:'Frases Comunes', desc:'¿Cómo estás?, Me llamo...', xp:30, content:'<h3>Frases Básicas</h3><ul><li><b>¿Cómo estás?</b> — Señala, luego gesto de pregunta</li><li><b>Me llamo...</b> — Señala pecho, luego deletrea</li><li><b>Por favor</b> — Mano plana circular sobre el pecho</li></ul>' },
      { id:'sl-i3', icon:'🤖', title:'Detector Libre', desc:'Practica con la IA en vivo', xp:20, type:'free-detector' },
    ],
    advanced: [
      { id:'sl-a1', icon:'📖', title:'Oraciones', desc:'Estructura gramatical en señas', xp:35, content:'<h3>Gramática de Señas</h3><p>La estructura es diferente al español hablado:</p><ul><li>Orden: Tema → Comentario</li><li>"Yo comer manzana" en vez de "Yo como una manzana"</li></ul>' },
      { id:'sl-a2', icon:'🎭', title:'Expresión Facial', desc:'La entonación de las señas', xp:35, content:'<h3>Expresiones Faciales</h3><p>En lengua de señas, la cara expresa lo que la voz hace en el habla:</p><ul><li>Cejas arriba = pregunta de sí/no</li><li>Cejas fruncidas = pregunta con "qué/quién/dónde"</li><li>Boca en "pa" = intensidad</li></ul>' },
      { id:'sl-a3', icon:'⚡', title:'Velocidad', desc:'Señas rápidas y fluidas', xp:40, type:'detector', letters:['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y'] },
    ],
  },
  math: {
    beginner: [
      { id:'ma-b1', icon:'➕', title:'Suma y Resta', desc:'Operaciones fundamentales', xp:15, content:'<h3>Suma y Resta</h3><ul><li><b>Suma:</b> 3 + 5 = 8 (combinar cantidades)</li><li><b>Resta:</b> 9 - 4 = 5 (quitar cantidades)</li></ul><div class="tip-box">💡 La suma es conmutativa: 3+5 = 5+3</div>' },
      { id:'ma-b2', icon:'✖️', title:'Multiplicación', desc:'Tablas del 1 al 10', xp:20, content:'<h3>Multiplicación</h3><p>Multiplicar es sumar un número varias veces:</p><ul><li>3 × 4 = 3+3+3+3 = 12</li><li>5 × 6 = 30</li></ul><div class="tip-box">💡 Memoriza las tablas, ¡son la base de todo!</div>' },
      { id:'ma-b3', icon:'➗', title:'División', desc:'Repartir en partes iguales', xp:20, content:'<h3>División</h3><ul><li>12 ÷ 3 = 4 (repartir 12 en 3 grupos)</li><li>20 ÷ 5 = 4</li></ul><p>Es la operación inversa de la multiplicación.</p>' },
      { id:'ma-b4', icon:'📊', title:'Fracciones', desc:'Mitades, tercios, cuartos', xp:20, content:'<h3>Fracciones Básicas</h3><ul><li><b>½</b> — La mitad</li><li><b>⅓</b> — Un tercio</li><li><b>¼</b> — Un cuarto</li></ul><p>El número de arriba (numerador) dice cuántas partes tienes. El de abajo (denominador) en cuántas se dividió.</p>' },
    ],
    intermediate: [
      { id:'ma-i1', icon:'📐', title:'Geometría', desc:'Áreas, perímetros, ángulos', xp:30, content:'<h3>Geometría Básica</h3><ul><li><b>Cuadrado:</b> Área = lado × lado</li><li><b>Rectángulo:</b> Área = base × altura</li><li><b>Triángulo:</b> Área = (base × altura) / 2</li><li><b>Círculo:</b> Área = π × r²</li></ul>' },
      { id:'ma-i2', icon:'📈', title:'Álgebra Básica', desc:'Ecuaciones con x', xp:30, content:'<h3>Álgebra</h3><p>Resolver ecuaciones simples:</p><ul><li>x + 5 = 12 → x = 7</li><li>3x = 15 → x = 5</li><li>2x + 3 = 11 → x = 4</li></ul><div class="tip-box">💡 Lo que haces de un lado, hazlo del otro.</div>' },
      { id:'ma-i3', icon:'📉', title:'Porcentajes', desc:'Descuentos, aumentos, proporciones', xp:25, content:'<h3>Porcentajes</h3><ul><li>20% de 150 = 150 × 0.20 = 30</li><li>Descuento del 30% en $200 = $200 - $60 = $140</li></ul>' },
    ],
    advanced: [
      { id:'ma-a1', icon:'🔺', title:'Trigonometría', desc:'Seno, coseno, tangente', xp:40, content:'<h3>Trigonometría</h3><ul><li><b>Seno:</b> opuesto / hipotenusa</li><li><b>Coseno:</b> adyacente / hipotenusa</li><li><b>Tangente:</b> opuesto / adyacente</li></ul><div class="tip-box">💡 SOH-CAH-TOA es la regla mnemotécnica.</div>' },
      { id:'ma-a2', icon:'∫', title:'Pre-Cálculo', desc:'Límites y funciones', xp:45, content:'<h3>Introducción al Cálculo</h3><ul><li><b>Límites:</b> A qué valor se acerca una función</li><li><b>Derivada:</b> Velocidad de cambio</li><li><b>Integral:</b> Área bajo la curva</li></ul>' },
      { id:'ma-a3', icon:'📊', title:'Estadística', desc:'Media, mediana, desviación', xp:40, content:'<h3>Estadística Básica</h3><ul><li><b>Media:</b> Promedio de todos los valores</li><li><b>Mediana:</b> Valor del medio al ordenar</li><li><b>Moda:</b> Valor más frecuente</li></ul>' },
    ],
  },
};
