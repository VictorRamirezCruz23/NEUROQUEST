# ASSET_MANIFEST.md — Manifiesto e Inventario de Recursos Visuales

Este documento registra el inventario oficial de recursos visuales, tilesets, spritesheets y elementos de interfaz de NEUROQUEST, su origen, dimensiones y estado de aprobación.

---

## 1. Inventario de Texturas y Sprites

| ID Recurso | Tipo | Ruta / Origen | Dimensiones | Animaciones / Frames | Estado de Aprobación |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `hero_idle` | Sprite | Procedural (`PreloadScene.js`) | 32x32 px | Frame único / Tween oscilante | ✅ Aprobado como Placeholder Base |
| `btn_primary` | UI | Procedural (`PreloadScene.js`) | 200x48 px | Interactivo (Hover / Active) | ✅ Aprobado como Botón Base |
| `retro_starfield` | Fondo | Procedural (`WelcomeScene.js`) | 960x540 px | Generación procedural estática | ✅ Aprobado para Pantalla Inicial |
| `player_spritesheet` | Spritesheet | `public/assets/sprites/player.png` | 32x32 px (Frames) | `idle`, `walk`, `jump`, `fall` | ⏳ Planificado para Incremento 2 |
| `tileset_neurocore` | Tileset | `public/assets/tilesets/neurocore_base.png`| 32x32 px (Grid) | Muros, plataformas, rampas | ⏳ Planificado para Incremento 2 |
| `terminal_logic` | Sprite / Objeto | `public/assets/sprites/terminal_logic.png` | 32x48 px | `idle`, `active_pulse` | ⏳ Planificado para Incremento 4 |
| `icon_competencies` | Atlas UI | `public/assets/ui/competency_badges.png` | 64x64 px | 4 iconos de rutas | ⏳ Planificado para Incremento 3 |

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
