# NEUROQUEST
Importante leer para contextualizar el proyecto
Revisar documentacion 
> **Plataforma de Aventura Educativa Adaptativa 2D en Pixel Art**

NEUROQUEST es un videojuego educativo diseñado para estudiantes de secundaria, enfocado en el desarrollo autónomo y comprobable de competencias fundamentales mediante cuatro rutas de aprendizaje independientes.

---

## Características Principales

- **Elección Libre de Rutas:** El estudiante decide qué competencia explorar; ninguna ruta es impuesta ni bloquea el acceso a otras.
- **Progreso Independiente:** Cada competencia mantiene su propio historial de dominio, diagnósticos y evaluaciones.
- **Motor Educativo Desacoplado (`EducationEngine`):** Lógica pedagógica separada del motor de renderizado Phaser 3.
- **Dificultad Adaptativa Determinista:** Ajuste basado en precisión, consistencia y uso de pistas, no en puntos acumulados.
- **Evaluación Integral:** Diagnóstico, formativa, transferencia y retención a intervalos espaciados.
- **Arquitectura Segura:** Integración de Google Gemini API a través de Cloud Functions con control estricto de secretos y cuotas.

---
aaa

## Competencias y Mundos

1. **Ruta 01 — Pensamiento lógico y matemático** *(Mundo 01: Núcleo de Lógica)*
2. **Ruta 02 — Pensamiento computacional y programación** *(Mundo 02: Circuitos Mentales)*
3. **Ruta 03 — Comprensión lectora** *(Mundo 03: Archivo del Conocimiento)*
4. **Ruta 04 — Resolución de problemas multidisciplinarios** *(Mundo 04: Dimensión Estratégica)*

---

## Pila Tecnológica

- **Empaquetador:** [Vite](https://vitejs.dev/)
- **Lenguaje:** JavaScript ES6 Vanilla (ES Modules)
- **Motor 2D:** [Phaser 3](https://phaser.io/)
- **Backend & Base de Datos:** Firebase (Auth, Cloud Firestore, Cloud Functions)
- **Tutoría Inteligente:** Google Gemini API (Server-side)

---

## Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor local de desarrollo
npm run dev

# 3. Compilar para producción
npm run build

# 4. Previsualizar compilación de producción
npm run preview
```

---

## Documentación Técnica

Para consultar detalles específicos de la arquitectura y diseño educativo:
- [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [EDUCATIONAL_MODEL.md](docs/EDUCATIONAL_MODEL.md)
- [COMPETENCIES.md](docs/COMPETENCIES.md)
- [ADAPTIVE_DIFFICULTY.md](docs/ADAPTIVE_DIFFICULTY.md)
- [GAME_DESIGN_DOCUMENT.md](docs/GAME_DESIGN_DOCUMENT.md)
- [DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md)
- [SECURITY.md](docs/SECURITY.md)
- [DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md)
- [CHANGELOG.md](docs/CHANGELOG.md)
