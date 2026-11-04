# CHANGELOG.md — Registro de Cambios

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y se adhiere al plan de incrementos de NEUROQUEST.

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
