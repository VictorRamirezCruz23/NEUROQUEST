/**
 * LevelGenerator.js — Generador procedural por tramos infinitos y temáticas neón para NEUROQUEST.
 *
 * Características:
 * 1. Generación procedural por tramos con variación estética neón (estilo Geometry Dash).
 * 2. Arquetipos estructurales con garantía estricta de no-repetición consecutiva.
 * 3. Viabilidad de salto físico garantizada (parámetros de física de Player).
 * 4. Ítems de vida condicionales: SOLO aparecen cuando el jugador tiene 3 vidas o menos.
 * 5. Consolas interactivas de teoría y pistas conceptuales para preparar al jugador.
 * 6. Extensión infinita del mapa hasta alcanzar un mínimo acumulado del 80% de precisión.
 */

export const NEON_THEMES = [
  {
    id: 'CYBER_CYAN',
    name: 'Sector Alfa • Cian Neón',
    primary: 0x00f0ff,
    primaryHex: '#00f0ff',
    border: 0x38bdf8,
    bgTint: 0x0a192f,
    accent: '#38bdf8',
    particleTint: 0x38bdf8
  },
  {
    id: 'NEON_MAGENTA',
    name: 'Sector Beta • Magenta Synth',
    primary: 0xf43f5e,
    primaryHex: '#f43f5e',
    border: 0xfb7185,
    bgTint: 0x2e0818,
    accent: '#fb7185',
    particleTint: 0xf43f5e
  },
  {
    id: 'ACID_EMERALD',
    name: 'Sector Gamma • Esmeralda Matrix',
    primary: 0x10b981,
    primaryHex: '#10b981',
    border: 0x34d399,
    bgTint: 0x06281e,
    accent: '#34d399',
    particleTint: 0x10b981
  },
  {
    id: 'SYNTH_PURPLE',
    name: 'Sector Delta • Púrpura Cuántico',
    primary: 0xa855f7,
    primaryHex: '#a855f7',
    border: 0xc084fc,
    bgTint: 0x1f0738,
    accent: '#c084fc',
    particleTint: 0xa855f7
  },
  {
    id: 'SOLAR_AMBER',
    name: 'Sector Épsilon • Ámbar Radiante',
    primary: 0xf59e0b,
    primaryHex: '#f59e0b',
    border: 0xfbbf24,
    bgTint: 0x2b1704,
    accent: '#fbbf24',
    particleTint: 0xf59e0b
  }
];

export const ARCHETYPES = [
  {
    id: 'ASCENDING_STEPS',
    name: 'Escalinata Ascendente',
    width: 380,
    build: (startX) => [
      { x: startX + 40, y: 350, length: 3, hasItem: false },
      { x: startX + 160, y: 280, length: 4, hasMatBot: true, patrolRange: 60 },
      { x: startX + 290, y: 210, length: 3, hasItem: true }
    ]
  },
  {
    id: 'SUSPENDED_BRIDGE',
    name: 'Puente Suspendido',
    width: 420,
    build: (startX) => [
      { x: startX + 60, y: 240, length: 7, hasMatBot: true, patrolRange: 90 },
      { x: startX + 290, y: 330, length: 3, hasItem: false }
    ]
  },
  {
    id: 'DOUBLE_TIER_OVERPASS',
    name: 'Paso Elevado Doble',
    width: 420,
    build: (startX) => [
      { x: startX + 40, y: 340, length: 4, hasItem: false },
      { x: startX + 160, y: 230, length: 5, hasItem: true },
      { x: startX + 310, y: 320, length: 3, hasMatBot: true, patrolRange: 50 }
    ]
  },
  {
    id: 'DESCENDING_CANOPY',
    name: 'Plataforma Descendente',
    width: 380,
    build: (startX) => [
      { x: startX + 40, y: 210, length: 3, hasItem: true },
      { x: startX + 160, y: 280, length: 4, hasMatBot: true, patrolRange: 60 },
      { x: startX + 280, y: 350, length: 4, hasItem: false }
    ]
  },
  {
    id: 'FLOATING_ARCHIPELAGO',
    name: 'Archipiélago Flotante',
    width: 420,
    build: (startX) => [
      { x: startX + 40, y: 320, length: 3, hasItem: false },
      { x: startX + 170, y: 240, length: 4, hasItem: true },
      { x: startX + 300, y: 310, length: 4, hasMatBot: true, patrolRange: 60 }
    ]
  },
  {
    id: 'PYRAMID_ASCENT',
    name: 'Ascenso Piramidal',
    width: 440,
    build: (startX) => [
      { x: startX + 40, y: 330, length: 3, hasItem: false },
      { x: startX + 160, y: 220, length: 6, hasMatBot: true, patrolRange: 80 },
      { x: startX + 340, y: 320, length: 3, hasItem: true }
    ]
  },
  {
    id: 'PILLAR_RUN',
    name: 'Pilares Rítmicos',
    width: 400,
    build: (startX) => [
      { x: startX + 50, y: 300, length: 3, hasItem: false },
      { x: startX + 180, y: 230, length: 4, hasItem: true },
      { x: startX + 300, y: 310, length: 3, hasMatBot: true, patrolRange: 50 }
    ]
  }
];

export class LevelGenerator {
  /**
   * Genera el nivel inicial completo adaptado a las vidas y temática.
   */
  static generateLevel(config = {}) {
    return this.generateChunk({
      startX: 0,
      length: config.worldWidth || 2600,
      groundY: config.groundY || 430,
      playerLives: config.playerLives !== undefined ? config.playerLives : 5,
      themeIndex: config.themeIndex || 0,
      lastArchetypeId: config.lastArchetypeId || null
    });
  }

  /**
   * Genera un tramo completo o inicial del mapa con temática neón, enemigos, consolas y meta.
   *
   * @param {Object} config
   * @param {number} config.startX - Coordenada X inicial del tramo (0 para nivel nuevo)
   * @param {number} config.length - Longitud del tramo (p. ej. 2600 px)
   * @param {number} config.groundY - Altura del suelo base (430 px)
   * @param {number} config.playerLives - Vidas actuales del jugador (para spawn condicional de salud)
   * @param {number} config.themeIndex - Índice de temática de color neón
   * @param {string} [config.lastArchetypeId] - Arquetipo previo para evitar repetición
   * @returns {Object}
   */
  static generateChunk(config) {
    const {
      startX = 0,
      length = 2600,
      groundY = 430,
      playerLives = 5,
      themeIndex = 0,
      lastArchetypeId = null
    } = config;

    const endX = startX + length;
    const theme = NEON_THEMES[themeIndex % NEON_THEMES.length];

    const platforms = [];
    const matbots = [];
    const healthItems = [];
    const consoles = []; // Consolas interactivas de teoría y pistas

    // 1. Suelo sólido base continuo (colisión física invisible sobre el suelo pintado del arte original)
    for (let x = startX; x < endX; x += 32) {
      platforms.push({
        x: x + 16,
        y: groundY + 16,
        texture: 'tile_ground',
        visible: false,
        isGround: true,
        theme
      });
    }

    // 2. Consola de Teoría y Pistas al inicio del tramo (orientación para el jugador)
    consoles.push({
      x: startX + 260,
      y: groundY - 32,
      theme,
      type: 'theory_hints'
    });

    // 3. Generación procedural de sectores con no-repetición estricta
    let currentX = startX + 380;
    const maxX = endX - 320;
    let currentLastArchetype = lastArchetypeId;

    let matbotCount = 0;
    let healthItemCount = 0;
    let midConsolePlaced = false;

    // Regla estricta: Ítems de vida SOLO se generan si el jugador tiene 3 vidas o menos
    const canSpawnHealth = (playerLives <= 3);

    while (currentX < maxX) {
      const available = ARCHETYPES.filter(a => a.id !== currentLastArchetype);
      const chosen = available[Math.floor(Math.random() * available.length)];
      currentLastArchetype = chosen.id;

      const sectorPlatforms = chosen.build(currentX);

      sectorPlatforms.forEach(p => {
        // Baldosas de plataforma con el color temático neón
        for (let i = 0; i < p.length; i++) {
          const px = p.x + (i * 32) + 16;
          platforms.push({
            x: px,
            y: p.y + 16,
            texture: 'tile_platform',
            visible: true,
            theme
          });
        }

        // Spawn de MatBots (enemigos)
        if (p.hasMatBot && matbotCount < 4) {
          const centerX = p.x + (p.length * 16);
          matbots.push({
            x: centerX,
            y: p.y - 30,
            patrolRange: Math.min(p.patrolRange || 70, (p.length * 16) - 10)
          });
          matbotCount++;
        }

        // Spawn condicional de ítems de vida (SOLO si vidas <= 3)
        if (canSpawnHealth && p.hasItem && !p.hasMatBot && healthItemCount < 2) {
          const itemX = p.x + (p.length * 16);
          healthItems.push({
            x: itemX,
            y: p.y - 28
          });
          healthItemCount++;
        }

        // Consola intermedia de teoría en la parte media del tramo
        if (!midConsolePlaced && currentX > (startX + length * 0.52) && p.y <= 240) {
          consoles.push({
            x: p.x + (p.length * 16),
            y: p.y - 32,
            theme,
            type: 'advanced_theory'
          });
          midConsolePlaced = true;
        }
      });

      currentX += chosen.width;
    }

    // Asegurar presencia mínima de MatBots para mantener el desafío
    if (matbots.length < 2) {
      matbots.push({
        x: startX + Math.round(length * 0.5),
        y: groundY - 30,
        patrolRange: 90
      });
    }

    // Si tiene 3 vidas o menos y no se generó ningún ítem por azar, garantizar 1
    if (canSpawnHealth && healthItems.length === 0) {
      healthItems.push({
        x: startX + Math.round(length * 0.4),
        y: groundY - 26
      });
    }

    // 4. Meta / Punto de Control del Tramo
    const victoryGoal = {
      x: endX - 140,
      y: groundY - 40
    };

    return {
      startX,
      endX,
      length,
      theme,
      platforms,
      matbots,
      healthItems,
      consoles,
      terminals: consoles,
      victoryGoal,
      lastArchetypeId: currentLastArchetype
    };
  }
}
