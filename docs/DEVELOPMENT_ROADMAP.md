# DEVELOPMENT_ROADMAP.md — Hoja de Ruta de Desarrollo

## Estado General

| Incremento | Descripción | Estado |
| :--- | :--- | :--- |
| **0** | Auditoría y planificación del repositorio | ✅ Completado |
| **1** | Fundación Vite y Phaser 3 con estructura modular | ✅ Completado |
| **2** | Personaje, físicas y mundo interactivo pixel art | ⏳ Pendiente de autorización |
| **3** | Pantalla y flujo de Selección de Competencias | ⏳ Pendiente de autorización |
| **4** | Motor educativo modular (`EducationEngine`) y Ruta 01 | ⏳ Pendiente de autorización |
| **5** | Diagnóstico inicial y algoritmo de dificultad adaptativa | ⏳ Pendiente de autorización |
| **6** | Evaluaciones de transferencia y retención temporal | ⏳ Pendiente de autorización |
| **7** | Integración con Firebase (Auth y Cloud Firestore) | ⏳ Pendiente de autorización |
| **8** | Integración de backend Gemini API (Cloud Functions) | ⏳ Pendiente de autorización |
| **9** | Dashboard analítico de aprendizaje individual | ⏳ Pendiente de autorización |
| **10** | QA integral, seguridad y optimización para entrega | ⏳ Pendiente de autorización |

---

## Detalle del Incremento 1 (Actual)

- **Objetivos:**
  - Inicialización del control de versiones (`.git`) y exclusiones (`.gitignore`).
  - Configuración de empaquetado de producción con Vite (`vite.config.js`).
  - Instalación y enlace limpio de Phaser 3 en Vanilla JS.
  - Creación de la jerarquía de carpetas completa.
  - Implementación de escenas iniciales de arranque (`BootScene`, `PreloadScene`, `WelcomeScene`).
  - Verificación del pipeline de compilación (`npm run build`).
  - Documentación de base técnica.

- **Criterios de Aceptación del Incremento 1:**
  1. Servidor de desarrollo inicia sin advertencias (`npm run dev`).
  2. Compilación de producción exitosa sin errores (`npm run build`).
  3. Lienzo de Phaser 3 activo a 960x540 en formato 16:9 con pixel art habilitado.
  4. Botón interactivo en pantalla de bienvenida funcional.
  5. Cero frameworks intrusivos (100% Vanilla JS ES Modules).
