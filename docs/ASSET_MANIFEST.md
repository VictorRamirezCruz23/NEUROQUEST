# ASSET_MANIFEST.md — Manifiesto e Inventario de Recursos Visuales

Este documento registra el inventario oficial de recursos visuales, tilesets, spritesheets y elementos de interfaz de NEUROQUEST, su origen, dimensiones y estado de aprobación.

---

## 1. Inventario de Texturas y Sprites

| ID Recurso | Tipo | Ruta / Origen | Dimensiones | Animaciones / Frames | Estado de Aprobación |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `player_concept` | Hoja Conceptual Original | `src/game/entities/player.jpg` | 2528x1696 px | Concepto con turnarounds, walk, jump, combat | ✅ Aprobado y Suministrado por Usuario |
| `player` | Spritesheet Transparente | `public/assets/sprites/player_sheet.png` | 1200x1320 px (Frames: 200x330) | `player_idle`, `player_walk`, `player_jump`, `player_jump_peak`, `player_fall`, `player_land`, `player_punch`, `player_crouch` | ✅ Aprobado y Procesado (Fondo transparente, libre de artefactos de texto) |
| `player_head` | Icono HUD de Vida | `public/assets/sprites/player_head.png` & `src/game/entities/player_head.png` | 32x32 px | Icono recortado de la cabeza del cadete para el medidor de vidas | ✅ Aprobado y Procesado |
| `btn_primary` | UI | Procedural (`PreloadScene.js`) | 200x48 px | Interactivo (Hover / Active) | ✅ Aprobado como Botón Base |
| `tile_ground` | Baldosa Terreno | Procedural (`PreloadScene.js`) | 32x32 px | Suelo firme con luz cian superior | ✅ Aprobado para Plataformas |
| `tile_platform` | Baldosa Flotante | Procedural (`PreloadScene.js`) | 32x32 px | Plataformas elevadas metálicas con tintes neón adaptativos | ✅ Aprobado para Plataformas |
| `terminal_device` | Objeto Interactivo | Procedural (`PreloadScene.js`) | 48x64 px | Consola con holograma pulsante (teoría, pistas y diagnóstico) | ✅ Aprobado para Puntos de Interacción |
| `matbot_concept` | Hoja Conceptual Enemigo | `src/game/entities/MatBot.jpg` | 2528x1696 px | Concepto MatBot con ciclos de patrulla, ataque y caída | ✅ Suministrado por Usuario |
| `matbot` | Spritesheet Transparente Enemigo | `public/assets/sprites/matbot_sheet.png` & `src/game/entities/Matbot.png` | 1200x800 px (Frames: 200x200 calibrados a ras de suelo Y=185) | `matbot_idle`, `matbot_walk`, `matbot_attack`, `matbot_hurt`, `matbot_die` | ✅ Calibrado y Libre de Deformación |
| `item_health` | Ítem Coleccionable | Procedural (`PreloadScene.js`) | 32x32 px | Cápsula Nanobótica con corazón/cruz y núcleo esmeralda (+1 vida) | ✅ Aprobado |
| `victory_flag` | Meta de Nivel | Procedural (`PreloadScene.js`) | 48x80 px | Mástil con estandarte holográfico y baliza orbe triunfal | ✅ Aprobado |
| `bg_logic_math` | Fondo Escenario | `public/assets/backgrounds/bg_logic_math.jpg` | 2752x1536 px | Núcleo de Lógica (Cian / Salas de cálculo) | ✅ Aprobado y Suministrado por Usuario |
| `bg_computational` | Fondo Escenario | `public/assets/backgrounds/bg_computational.jpg` | 2752x1536 px | Circuitos Mentales (Esmeralda / Silicio) | ✅ Aprobado y Suministrado por Usuario |
| `bg_reading` | Fondo Escenario | `public/assets/backgrounds/bg_reading.jpg` | 2752x1536 px | Archivo del Conocimiento (Púrpura / Biblioteca) | ✅ Aprobado y Suministrado por Usuario |
| `bg_strategic` | Fondo Escenario | `public/assets/backgrounds/bg_strategic.jpg` | 2752x1536 px | Dimensión Estratégica (Naranja / Telemetría) | ✅ Aprobado y Suministrado por Usuario |
| `icon_competencies` | Atlas UI | `public/assets/ui/competency_badges.png` | 64x64 px | 4 iconos de rutas | ⏳ Planificado |

---

## 2. Convenciones de Nomenclatura y Almacenamiento
* Todos los archivos binarios de recursos finales deben residir en:
  * `public/assets/sprites/` para personajes y PNJs.
  * `public/assets/tilesets/` para baldosas de escenarios Tiled / Tilemap.
  * `public/assets/ui/` para marcos de diálogo, iconos, barras y medidores.
  * `public/assets/backgrounds/` para capas de parallax y panoramas.
  * `public/assets/audio/` para efectos de sonido (SFX) y música ambiental (BGM).
* Formato estándar para gráficos: PNG de 24/32 bits con canal alfa transparente.
* Sin compresión destructiva JPEG en recursos pixel art.

---

## 3. Protocolo de Reemplazo de Recursos
Ningún recurso aprobado puede ser eliminado o sustituido sin autorización explícita previa y verificación de compatibilidad de coordenadas y dimensiones con Phaser 3.
