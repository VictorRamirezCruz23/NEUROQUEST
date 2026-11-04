# ART_DIRECTION.md — Guía y Dirección Artística de NEUROQUEST

## 1. Visión Estética General
NEUROQUEST adopta una estética **Pixel Art de Ciencia Ficción Retro-Futurista (16-bit / 32-bit)** inspirada en instalaciones orbitales de investigación. Toda la composición visual está calibrada para una resolución base de **960x540 píxeles** (escalada limpiamente mediante `pixelArt: true` en Phaser 3 sin artefactos de desenfoque).

---

## 2. Parámetros Técnicos y Proporciones

| Elemento | Resolución Base | Tamaño de Cuadrícula / Tile | Notas de Renderizado |
| :--- | :--- | :--- | :--- |
| **Tilesets de Escenario** | 16x16 px / 32x32 px | 32x32 px | Suelos sólidos, plataformas flotantes y conductos. |
| **Sprite del Protagonista** | 32x32 px | 32x32 px | Animaciones en 4 direcciones (idle, run, jump, interact). |
| **Terminales Educativas** | 32x48 px o 48x48 px | Bloque interactivo | Indicador de luz pulsante y teclado cibernético. |
| **Interfaz de Usuario (UI)** | Elementos modulares | 9-slice / bordes 4px | Cajas de diálogo, modales y botones táctiles pixel art. |

---

## 3. Paleta Cromática Institucional

La instalación NEUROCORE y sus cuatro mundos comparten una paleta maestra armonizada:

```text
Fondo Primario:        #0a0c16 (Azul Abisal Oscuro)
Superficies y Paneles: #1a1e2e (Gris Azulado Metálico)
Bordes y Contornos:    #334155 (Gris Acero)
Texto Primario:        #f8fafc (Blanco Nieve)
Texto Secundario:      #94a3b8 (Gris Claro)
```

### Paletas por Mundo Curricular:

1. **Mundo 01 — Núcleo de Lógica (Pensamiento Lógico y Matemático):**
   * *Acento Primario:* `#38bdf8` (Cian Neón / Energía Cuántica)
   * *Acento Secundario:* `#2563eb` (Azul Cobalto)
   * *Acento de Alerta/Acierto:* `#fbbf24` (Dorado Matemático)

2. **Mundo 02 — Circuitos Mentales (Pensamiento Computacional):**
   * *Acento Primario:* `#10b981` (Verde Esmeralda Fósforo)
   * *Acento Secundario:* `#059669` (Verde Circuito)
   * *Acento de Pulso:* `#34d399` (Bus de Datos)

3. **Mundo 03 — Archivo del Conocimiento (Comprensión Lectora):**
   * *Acento Primario:* `#a855f7` (Púrpura Místico / Holográfico)
   * *Acento Secundario:* `#d97706` (Ámbar Pergamino)
   * *Acento de Contraste:* `#c084fc` (Códice Estelar)

4. **Mundo 04 — Dimensión Estratégica (Resolución Multidisciplinaria):**
   * *Acento Primario:* `#f97316` (Naranja Industrial de Crisis)
   * *Acento Secundario:* `#dc2626` (Rojo Carmesí Alerta)
   * *Acento de Monitores:* `#fb923c` (Telemetría Activa)

---

## 4. Principios de Iluminación y Animación
- **Iluminación:** Claroscuro pixelado con puntos de luz estáticos y shaders/tintes sencillos sobre sprites (`setTint` y `setAlpha`).
- **Animaciones:** Frecuencia de muestreo estándar de 6 a 12 FPS para movimiento de personajes y 4 a 8 FPS para pulsaciones de terminales e indicadores cibernéticos.
- **Respaldo Procedural:** En ausencia temporal de archivos PNG definitivos, el motor genera texturas vectorizadas pixeladas nativas mediante `Phaser.GameObjects.Graphics` para no interrumpir el ciclo de desarrollo.
