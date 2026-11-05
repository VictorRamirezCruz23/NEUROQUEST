# CHANGELOG.md — Registro de Cambios

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y se adhiere al plan de incrementos de NEUROQUEST.

---

## [0.11.0] - 2026-11-05

### Corregido
- **Error Crítico de Renderizado de Texto en Combate (`BattleArenaModal.js`):**
  - Solucionado el fallo `Cannot read properties of null (reading 'drawImage') at Frame2.updateUVs`:
    - Incorporación de guardas estrictas de ciclo de vida (`if (this.promptText && this.promptText.active && typeof this.promptText.setText === 'function')`).
    - Cancelación completa de tweens (`tweens.killTweensOf`) y temporizadores pendientes antes de invocar `destroy()` para evitar la corrupción del canvas de Phaser.
    - Anulación segura de referencias a GameObjects destruidos (`this.promptText = null`, `this.arenaBotSprite = null`, `this.botHpBar = null`).
- **Fondo Negro al Terminar el Mapa:**
  - Sustitución de imágenes estáticas fijas por una capa continua en `TileSprite` con parallax infinito sincronizado (`bgTile.tilePositionX = scrollX * 0.35`) y base espacial en profundidad `-200`, garantizando que el fondo nunca se agote ni se oscurezca al cruzar tramos o extender el nivel.
- **Corrección Definitiva del Spritesheet de MatBot:**
  - Generación del spritesheet calibrado de 32 fotogramas (1600x800 px, 8 columnas x 4 filas de 200x200 px) en [`public/assets/sprites/matbot_sheet.png`](public/assets/sprites/matbot_sheet.png) y [`src/game/entities/Matbot.png`](src/game/entities/Matbot.png).
  - Eliminación de frames fantasma, texto o bordes parásitos:
    - Fila 0 (Frames 0-3): Ciclo Idle.
    - Fila 1 (Frames 8-15): Ciclo de patrullaje y caminata fluido de 8 pasos.
    - Fila 2 (Frames 16-21): Secuencia de ataque con puntería, carga y disparo láser.
    - Fila 3 (Frames 24-29): Secuencia de impacto y desintegración.

### Añadido
- **Mecánica de Movimiento Agachado (Crouch & Walk):**
  - En [`Player.js`](src/game/entities/Player.js), el jugador ahora puede desplazarse horizontalmente mientras está agachado (al 65% de velocidad estándar) manteniendo reducida su caja de colisión física a la mitad (120 px de alto) con offset compensado (`body.setOffset(60, 200)`).
- **Gestor de Audio y Efectos Especiales Espaciales (`SoundManager.js`):**
  - Implementación del sintetizador nativo de audio espacial [`SoundManager.js`](src/game/audio/SoundManager.js) integrado con `this.sound` y la Web Audio API:
    - `sfx_laser`: Disparo de energía espacial durante ataques de combate.
    - `sfx_ambient_drone`: Zumbido espacial continuo de baja frecuencia (55Hz) en bucle permanente.
    - `sfx_correct`: Timbre cristalino armónico de acierto en desafíos.
    - `sfx_error`: Glitch y zumbido disonante de respuesta incorrecta.
    - `sfx_heal`: Onda ascendente de regeneración nanobótica al recoger ítems de vida.
    - `sfx_hit`: Impacto sordo de daño recibido.
- **Sistema de Vidas y HUD Gráfico Personalizado (Cabezas del Jugador):**
  - Icono transparente de la cabeza del cadete [`public/assets/sprites/player_head.png`](public/assets/sprites/player_head.png).
  - 5 vidas iniciales con cabezas que se atenúan al perder blindaje.
  - Spawn condicional estricto: Los ítems de vida solo se generan si el jugador tiene 3 vidas o menos.
- **Mapas Infinitos Condicionados al 80% de Precisión:**
  - Condición estricta de victoria: El sector no finaliza si la precisión es menor al 80% o no se han librado al menos 2 combates.
  - En caso de precisión insuficiente, `extendChunk()` extiende el mundo de forma procedural infinita generando nuevos arquetipos, paletas neón estilo *Geometry Dash* y nuevos MatBots.

---

## [0.10.0] - 2026-11-05

### Añadido
- **Generación Procedural y Aleatoria de Niveles:**
  - Implementación del generador modular [`LevelGenerator.js`](src/game/procedural/LevelGenerator.js) con catálogo de arquetipos estructurales (`ASCENDING_STEPS`, `SUSPENDED_BRIDGE`, `DOUBLE_TIER_OVERPASS`, `DESCENDING_CANOPY`, `FLOATING_ARCHIPELAGO`, `PYRAMID_ASCENT`, `PILLAR_RUN`).
  - Restricción estricta de no repetición consecutiva de arquetipos por sector.
  - Viabilidad física garantizada: distancias horizontales (90-150 px) y verticales (-100 a +90 px) compatibles con el salto y velocidad del jugador.
  - Meta final clara con bandera de victoria (`victory_flag`) y pantalla de resultados con opción de avanzar al siguiente sector procedural o cambiar de ruta.
- **Enemigo MatBot y Combate Educativo Interactivo:**
  - Procesamiento del spritesheet transparente [`public/assets/sprites/matbot_sheet.png`](public/assets/sprites/matbot_sheet.png) y [`src/game/entities/Matbot.png`](src/game/entities/Matbot.png) desde el concepto oficial `MatBot.jpg`.
  - Animaciones de MatBot: `matbot_idle`, `matbot_walk`, `matbot_attack`, `matbot_hurt`, `matbot_die` registradas en [`PreloadScene.js`](src/game/scenes/PreloadScene.js).
  - Entidad enemiga [`MatBot.js`](src/game/entities/MatBot.js) con máquina de estados (Patrulla, Persecución, Ataque, Combate, Derrota).
  - Mecánica de combate por preguntas: al ejecutar el ataque, se activa un duelo en [`ChallengeModal.js`](src/ui/components/ChallengeModal.js) con preguntas del banco curricular.
  - Victoria: neutraliza y destruye a MatBot con partículas de desintegración al responder correctamente.
  - Derrota: descuenta 1 vida al jugador de un total de 5 vidas si falla.
- **Sistema de Vidas y Coleccionable de Recuperación:**
  - Sistema de 5 vidas iniciales con medidor visual de corazones en el HUD (`❤️ ❤️ ❤️ ❤️ ❤️`).
  - Ítem coleccionable de recuperación (`item_health` - Cápsula Nanobótica) distribuido aleatoriamente en el mapa.
  - Al recogerlo, activa una pregunta curricular: responder bien recupera 1 vida (hasta el tope de 5).
  - Modal de Game Over con opción de reintentar el sector restaurando las 5 vidas completas.

---

## [0.9.0] - 2026-11-04

### Añadido
- **Incremento 9 (Dashboard de Aprendizaje y Métricas Reales No Infladas):**
  - Implementación del motor analítico [`LearningAnalytics.js`](src/analytics/LearningAnalytics.js):
    - Medición determinista de 6 dimensiones fundamentales del aprendizaje real sin gamificación vacía ni puntos inflados:
      - **Participación Real:** Desafíos completados vs total de la competencia, diagnósticos y tiempo invertido.
      - **Rendimiento Genuino:** Precisión de primer intento (% de respuestas correctas a la primera) y tasa de éxito global.
      - **Autonomía:** Índice de resolución independiente sin depender de pistas de socorro ni reintentos asistidos.
      - **Nivel de Dominio:** Nivel cognitivo alcanzado en la escala Bloom-adaptativa (Nivel 1 al 4) y consistencia.
      - **Transferencia Cognitiva:** Tasa de éxito al aplicar conceptos en contextos novedosos y desafiantes.
      - **Retención Temporal:** Estabilidad conceptual a lo largo del tiempo evaluada en intervalos de enfriamiento.
    - Síntesis global multidimensional y generación de recomendaciones pedagógicas personalizadas por competencia.
  - Implementación de la escena interactiva [`DashboardScene.js`](src/game/scenes/DashboardScene.js):
    - Visualización Cyber-HUD en resolución nativa 960x540 en formato 16:9.
    - Presupuesto espacial estricto para evitar solapamientos visuales (`cuida que los estilos no se encimen`):
      - Cabecera con datos de identidad del cadete y selector de navegación.
      - Barra de pestañas para alternar entre *Síntesis Global* y cada una de las 4 rutas curriculares (`Lógica`, `Computacional`, `Lectora`, `Estratégica`).
      - Cuadrícula de 6 tarjetas de métricas en 2 columnas x 3 filas con barras de progreso visuales y porcentajes de adquisición.
      - Panel inferior con diagnóstico cualitativo y orientación pedagógica.
  - Integración en [`WorldScene.js`](src/game/scenes/WorldScene.js) y [`SelectCompetencyScene.js`](src/game/scenes/SelectCompetencyScene.js):
    - Botón de acceso directo `📊 Métricas [B]` en el HUD superior.
    - Atajo de teclado directo mediante la tecla `[B]`.
    - Navegación bidireccional que recuerda la escena de origen y restaura el contexto al presionar `[ESC / VOLVER]`.

---

## [0.8.0] - 2026-11-04

### Añadido
- **Incremento 8 (Integración Segura de Gemini API con Cloud Functions Backend):**
  - Implementación del backend serverless en `/functions` con Node.js y `@google/generative-ai`:
    - [`functions/index.js`](functions/index.js): Endpoints llamables protegidos con autenticación (`explainError` y `generateHint`).
    - Configuración de `firebase.json` con soporte para funciones y despliegue en Firebase Hosting.
    - Guardrails pedagógicos estrictos: E.V.A. nunca revela la respuesta correcta, explica con analogías de ciencia ficción y sugiere preguntas guía sin alterar las calificaciones oficiales.
  - Implementación del servicio cliente en frontend:
    - [`tutorService.js`](src/services/gemini/tutorService.js): Invocador seguro de Cloud Functions (`httpsCallable`), con limitación de tasa, memoria caché de respuestas y modo de contingencia offline automático.
    - Exportación de `functions` en [`firebaseConfig.js`](src/services/firebase/firebaseConfig.js).
  - Integración en [`ChallengeModal.js`](src/ui/components/ChallengeModal.js):
    - Enriquecimiento progresivo y asíncrono de retroalimentación pedagógica (`✨ E.V.A. • Asistente Pedagógica NEUROCORE`) ante errores conceptuales del estudiante.

---

## [0.7.0] - 2026-11-04

### Añadido
- **Incremento 7 (Integración Firebase: Auth y Cloud Firestore):**
  - Instalación y configuración centralizada del SDK modular de Firebase (`v11.x`):
    - [`firebaseConfig.js`](src/services/firebase/firebaseConfig.js): Inicialización modular de Firebase App, Authentication, Cloud Firestore y Analytics con variables de entorno Vite (`.env`) y claves oficiales del proyecto `neuroquest-game`.
    - Optimización de chunks en [`vite.config.js`](vite.config.js) para separar el bundle de Firebase.
  - Implementación de [`authService.js`](src/services/firebase/authService.js):
    - Soporte de acceso instantáneo sin fricción mediante autenticación anónima (`signInAnonymously`).
    - Soporte completo para registro e inicio de sesión con correo y contraseña (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `updateProfile`).
    - Observador reactivo de estado de sesión (`onAuthStateChanged`).
  - Implementación de [`firestoreService.js`](src/services/firebase/firestoreService.js):
    - Estructura de documentos en Cloud Firestore: `users/{uid}`, `users/{uid}/progress/{competencyId}` y `users/{uid}/attempts/{attemptId}`.
    - Mecanismo de contingencia offline con cola de reintentos automática (`syncOfflineQueue`) y respaldo en `localStorage`.
    - Registro de telemetría de intentos pedagógicos por desafío.
  - Integración en [`sessionState.js`](src/core/sessionState.js) y [`EducationEngine.js`](src/education/engines/EducationEngine.js):
    - Carga automática y sincronización bidireccional del progreso de las 4 competencias entre la nube y el juego local.
  - Interfaz de usuario para identificación y perfil:
    - Componente HTML y controlador modular [`AuthModalController.js`](src/ui/components/AuthModalController.js) con diseño cyber-retro libre de solapamientos.
    - Botones de acceso a perfil de cadete integrados en [`WelcomeScene.js`](src/game/scenes/WelcomeScene.js) y en el HUD superior de [`WorldScene.js`](src/game/scenes/WorldScene.js).

---

## [0.6.0] - 2026-11-04

### Añadido
- **Incremento 6 (Evaluaciones de Transferencia y Retención Temporal):**
  - Implementación de [`TransferAssessment.js`](src/education/assessments/TransferAssessment.js):
    - Detección de elegibilidad para transferencia tras racha de consistencia formativa autónoma.
    - Registro y cálculo de métricas de transferencia cercana y lejana (`transferSuccessRate`, transferencias autónomas).
  - Implementación de [`RetentionAssessment.js`](src/education/assessments/RetentionAssessment.js):
    - Sistema de programación de retención temporal tras enfriamiento (`coolingPeriodMs`), evaluando la persistencia de conceptos independientemente de la primera sesión.
    - Detección y registro de desvanecimiento conceptual (`decayDetectedCount`) para activar refuerzo formativo.
  - Expansión de [`ChallengeRepository.js`](src/education/repositories/ChallengeRepository.js):
    - Desafíos específicos de Transferencia Cognitiva en contextos novedosos (Soporte Vital, Cuarentena UV, Cláusulas Espaciales, Logística de Emergencias).
    - Desafíos específicos de Retención Temporal con problemas isomorfos para las 4 competencias.
    - Métodos especializados `getTransferChallenge()` y `getRetentionChallenge()`.
  - Integración en [`EducationEngine.js`](src/education/engines/EducationEngine.js) de los 6 Indicadores de Aprendizaje:
    - 1. Participación, 2. Rendimiento, 3. Autonomía, 4. Dominio, 5. Transferencia, 6. Retención.
  - Actualización de [`WorldScene.js`](src/game/scenes/WorldScene.js):
    - Terminal 2 configurada como "Plataforma de Transferencia y Retención" con prompt interactivo dinámico.
    - HUD superior sincronizado con los porcentajes de Transferencia y Retención en tiempo real.
  - Actualización de [`ChallengeModal.js`](src/ui/components/ChallengeModal.js):
    - Banners y tarjetas de retroalimentación diferenciados para Transferencia (púrpura/índigo) y Retención (verde esmeralda).

---

## [0.5.0] - 2026-11-04

### Añadido
- **Incremento 5 (Diagnóstico Inicial y Algoritmo de Dificultad Adaptativa):**
  - Implementación de [`AdaptiveEngine.js`](src/education/adaptive/AdaptiveEngine.js):
    - Algoritmo determinista, explicable y auditable de adaptación basado en la tupla $V = (P, I, H, T, D_c, R_{hist})$ (precisión, intentos, pistas utilizadas, tiempo/consistencia, nivel actual e historial).
    - Reglas de transición de dificultad explicables: `INCREASE` (subir nivel ante dominio autónomo consistente), `MAINTAIN` (consolidación), `DECREASE` (ajuste a la baja ante bloqueos reiterados) y `REINFORCE` (refuerzo guiado antes de alterar el nivel).
  - Implementación de [`DiagnosticManager.js`](src/education/assessments/DiagnosticManager.js):
    - Protocolo de calibración diagnóstica inicial de 3 fases por competencia para determinar el punto de partida real del estudiante (Principiante vs. Intermedio) sin penalizaciones arbitrarias.
  - Expansión de [`ChallengeRepository.js`](src/education/repositories/ChallengeRepository.js):
    - Banco multinivel estructurado con desafíos diagnósticos y desafíos clasificados por dificultad (Nivel 1: Principiante, Nivel 2: Intermedio, Nivel 3: Avanzado) para las 4 competencias del juego.
  - Rediseño ergonómico no superpuesto de [`ChallengeModal.js`](src/ui/components/ChallengeModal.js):
    - Sistema de coordenadas verticales con cotas fijas sin anidación de containers para garantizar que ningún texto, botón o banner se encime.
    - Soporte completo de teclado ([A, B, C, D], [1, 2, 3, 4], [H], [Enter], [Esc]) y toques móviles.
  - Sincronización en tiempo real del HUD en [`WorldScene.js`](src/game/scenes/WorldScene.js):
    - Indicador de calibración diagnóstica y nivel adaptativo dinámico (`DIAGNÓSTICO [X/3]` o `NIVEL X: [NIVEL]`).

---

## [0.4.0] - 2026-11-04

### Añadido
- **Incremento 4 (Motor Educativo Modular, Fondos de Escenario y Modo Móvil/PC):**
  - Integración de los 4 fondos de escenario pixel art originales suministrados por el usuario:
    - `bg_logic_math.jpg` (L - Núcleo de Lógica)
    - `bg_computational.jpg` (CM - Circuitos Mentales)
    - `bg_reading.jpg` (AC - Archivo del Conocimiento)
    - `bg_strategic.jpg` (E - Dimensión Estratégica)
  - Detección inteligente de dispositivo (`DeviceDetector.js`):
    - Identifica si el jugador está en computadora o teléfono/tablet.
    - Soporte forzado para orientación horizontal (Landscape) con advertencia visual animada en pantalla (`rotate-overlay` en `index.html` y CSS).
    - Controles virtuales táctiles en pantalla (`VirtualControls.js`): D-Pad izquierdo (◀ / ▶) y botones derechos de acción (▲ Salto, ⚡ Acción, [E] Terminal) cuando se juega desde un teléfono.
    - Botón de alternancia rápida "📱 Táctil / 🖥️ PC" en el HUD para pruebas directas en PC.
  - Implementación de [`EducationEngine.js`](src/education/engines/EducationEngine.js): Motor pedagógico modular desacoplado del motor Phaser.
  - Repositorio curricular [`ChallengeRepository.js`](src/education/repositories/ChallengeRepository.js) con banco de desafíos de la Ruta 01 (Núcleo de Lógica): secuencias recursivas, fracciones y razones, operaciones combinadas con jerarquía, y razonamiento deductivo.
  - Componente modal pedagógico [`ChallengeModal.js`](src/ui/components/ChallengeModal.js): Interfaz con contexto narrativo, opciones múltiples, solicitud de pistas contextuales progresivas y retroalimentación formativa conceptual profunda (explicación de error, concepto faltante y estrategia de resolución).
  - Vinculación interactiva de las terminales en `WorldScene.js` con apertura del modal educativo.

---

## [0.3.0] - 2026-11-04

### Añadido
- **Incremento 3 (Selector de Competencias y Rutas Curriculares):**
  - Implementación de [`sessionState.js`](src/core/sessionState.js): Gestor de estado desacoplado de Phaser con las especificaciones de las 4 rutas curriculares:
    - **L:** Pensamiento Lógico y Matemático *(Mundo 01: Núcleo de Lógica)*
    - **CM:** Pensamiento Computacional y Programación *(Mundo 02: Circuitos Mentales)*
    - **AC:** Comprensión Lectora *(Mundo 03: Archivo del Conocimiento)*
    - **E:** Resolución Multidisciplinaria de Problemas *(Mundo 04: Dimensión Estratégica)*
  - Creación de [`SelectCompetencyScene.js`](src/game/scenes/SelectCompetencyScene.js): Escena interactiva del selector con 4 tarjetas visuales pixel art, efectos de elevación hover, detalles de habilidades clave, soporte de clics y selección rápida por teclado ([1], [2], [3], [4], [Enter]).
  - Adaptación temática dinámica en [`WorldScene.js`](src/game/scenes/WorldScene.js): La instalación y partículas se sintonizan con la paleta de la competencia activa, el HUD muestra la insignia distintiva (`[L]`, `[CM]`, `[AC]`, `[E]`), y se integra el botón y atajo `[M]` para cambiar de competencia en cualquier momento durante la aventura.
  - Conexión de flujo en `WelcomeScene.js` hacia el Selector de Competencias.

---

## [0.2.0] - 2026-11-04

### Añadido
- **Incremento 2 (Personaje y Mundo Interactivo):**
  - Procesamiento y vectorización de sprites de `player.jpg` generando `public/assets/sprites/player_sheet.png` (cuadrícula uniforme 6x4 de 200x330 px con fondo transparente y filtrado morfológico de artefactos de texto).
  - Implementación de la entidad [`Player.js`](src/game/entities/Player.js) como Sprite de Arcade Physics con controles cruzados (WASD + Flechas + Espacio + J), gestión de estados (`IDLE`, `WALK`, `JUMP`, `FALL`, `PUNCH`) y flip horizontal.
  - Implementación de [`WorldScene.js`](src/game/scenes/WorldScene.js): escenario de plataformas laterales en NEUROCORE (2400x540 px) con suelo colisionable, plataformas elevadas, partículas ambientales y cámara dinámica con seguimiento suave (`startFollow`).
  - Terminales interactivas (`terminal_device`) con detección de proximidad y prompt contextual (`[E] Interactuar`).
  - Mini HUD superpuesto fijo en pantalla con avatar y controles.
  - Conexión de transición fluida de escenas entre `WelcomeScene` y `WorldScene`.
  - Actualización de `ASSET_MANIFEST.md` y `gameConfig.js`.

---

## [0.1.0] - 2026-11-04

### Añadido
- **Incremento 0 (Auditoría):**
  - Diagnóstico inicial del entorno y verificación de versiones de Node.js (v22.20.0) y NPM (10.9.3).
  - Identificación de requisitos y riesgos arquitectónicos.

- **Incremento 1 (Fundación Vite y Phaser 3):**
  - Inicialización del repositorio Git y configuración de `.gitignore`.
  - Configuración del proyecto base con Vite y Vanilla JavaScript ES6 (`package.json`, `vite.config.js`).
  - Creación de `.env.example` con variables públicas requeridas para Firebase Web.
  - Instalación de la dependencia principal Phaser 3 (`^3.88.2`).
  - Calibración de Arcade Physics para plataformas laterales (`DEFAULT_GRAVITY_Y: 600`) en `gameConfig.js`.
  - Creación de la jerarquía modular de directorios (`src/config`, `src/core`, `src/game`, `src/education`, `src/services`, `src/ui`, `public/assets`, `docs`).
  - Creación de la escena de arranque `BootScene.js`.
  - Creación de la escena de precarga `PreloadScene.js` con generación procedural de texturas pixel art de respaldo y barra de progreso.
  - Creación de la escena de bienvenida `WelcomeScene.js` con estética pixel retro, título animado y botón interactivo.
  - Documentación obligatoria de arte y manifiesto: `docs/ART_DIRECTION.md` y `docs/ASSET_MANIFEST.md`.
  - Verificación del pipeline de compilación de producción exitosa (`npm run build`).
