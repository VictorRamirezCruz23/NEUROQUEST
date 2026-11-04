# AGENTS.md — Reglas Operativas y Guía del Agente para NEUROQUEST

## 1. Misión del Proyecto
Desarrollar **NEUROQUEST**, una plataforma de aventura educativa adaptativa 2D en pixel art dirigida a estudiantes de secundaria. 

**Principio Rector:**
> El jugador debe tener libertad total para elegir qué competencia aprender. El sistema adaptará los desafíos, evaluaciones y retroalimentación sin imponer rutas obligatorias, garantizando y demostrando adquisición, aplicación y retención real del conocimiento frente a la simple memorización o acumulación de puntos.

---

## 2. Pila Tecnológica Estricta (No negociable)
- **Vite:** Empaquetador y entorno de desarrollo rápido.
- **JavaScript ES6 Vanilla:** Sin frameworks frontend (Prohibido React, Vue, Angular, Svelte).
- **Phaser 3:** Motor de renderizado y físicas 2D (Arcade Physics).
- **Firebase:** Authentication, Cloud Firestore, Cloud Functions y Firebase Hosting.
- **Google Gemini API:** Integrada **únicamente** desde backend (Cloud Functions). Nunca exponer claves en el frontend.
- **Estándar de Módulos:** ES Modules (`import`/`export`).

---

## 3. Protocolo de Modificación e Incrementos
1. **Un solo incremento por autorización:** No avanzar a fases subsiguientes sin aprobación explícita del usuario.
2. **Sin comandos destructivos:** No borrar archivos ni directorios sin consentimiento previo.
3. **Calidad y verificación:** Cada cambio debe compilar limpiamente (`npm run build`) y preservar la integridad de comentarios y documentación.
4. **Desacoplamiento arquitectónico:** El motor del juego (`Phaser 3`) no debe acoplarse con las reglas curriculares o el algoritmo de dificultad (`EducationEngine`). La interacción debe regirse por interfaces y eventos limpios.

---

## 4. Matriz de Incrementos
- **Incremento 0:** Auditoría y planificación. *(Completado)*
- **Incremento 1:** Fundación Vite y Phaser 3. *(Completado)*
- **Incremento 2:** Personaje y mundo interactivo. *(Completado)*
- **Incremento 3:** Selector de competencias. *(Completado)*
- **Incremento 4:** Motor educativo modular y primera ruta (Núcleo de Lógica). *(Completado)*
- **Incremento 5:** Diagnóstico y dificultad adaptativa. *(Completado)*
- **Incremento 6:** Evaluaciones de transferencia y retención. *(Completado)*
- **Incremento 7:** Integración Firebase (Auth y Firestore). *(Completado)*
- **Incremento 8:** Integración Gemini (Cloud Functions backend). *(Completado)*
- **Incremento 9:** Dashboard de aprendizaje y métricas no infladas. *(Siguiente / Pendiente de autorización)*
- **Incremento 10:** QA, auditoría de seguridad y entrega final.
