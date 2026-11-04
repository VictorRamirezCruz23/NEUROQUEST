# CHANGELOG.md — Registro de Cambios

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y se adhiere al plan de incrementos de NEUROQUEST.

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
