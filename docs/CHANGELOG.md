# CHANGELOG.md — Registro de Cambios

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y se adhiere al plan de incrementos de NEUROQUEST.

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
