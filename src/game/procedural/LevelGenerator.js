/**
 * LevelGenerator.js — Generador procedural por tramos infinitos y temáticas neón para NEUROQUEST.
 *
 * Características:
 * 1. Generación procedural por tramos con variación estética neón (estilo Geometry Dash).
 * 2. Arquetipos estructurales con garantía estricta de no-repetición consecutiva.
 * 3. Viabilidad de salto físico garantizada (parámetros de física de Player).
 * 4. Ítems de vida condicionales: SOLO aparecen cuando el jugador tiene 3 vidas o menos.
 * 5. Consolas interactivas de teoría y pistas conceptuales para preparar al jugador.
 * 6. Progresión fluida por tramos y mundos superando retos, obstáculos y metas sin restricciones arbitrarias de porcentaje.
 */

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

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
  /**
   * Genera un tramo completo o inicial del mapa con estructura estilo Super Mario Bros 3:
   * plataformas elevadas, puentes suspendidos, abismos letales (vacíos), pinchos y enemigos diversificados.
   *
   * @param {Object} config
   * @param {number} config.startX - Coordenada X inicial del tramo (0 para nivel nuevo)
   * @param {number} config.length - Longitud del tramo (p. ej. 2600 px)
   * @param {number} config.groundY - Altura del suelo base (430 px)
   * @param {number} config.playerLives - Vidas actuales del jugador (para spawn condicional de salud)
   * @param {number} config.themeIndex - Índice de temática de color neón
   * @param {string} [config.lastArchetypeId] - Arquetipo previo para evitar repetición
   * @param {boolean} [config.isBossSector] - Si incluye al Jefe BosMat al final
   * @returns {Object}
   */
  static generateChunk(config) {
    const {
      startX = 0,
      length = 2600,
      groundY = 430,
      playerLives = 5,
      themeIndex = 0,
      lastArchetypeId = null,
      isBossSector = false
    } = config;

    const endX = startX + length;
    const theme = NEON_THEMES[themeIndex % NEON_THEMES.length];

    const platforms = [];
    const matbots = [];
    const flyingBots = [];
    const parasiteBots = [];
    const hazards = []; // Pinchos y trampas de plasma
    const movingPlatforms = []; // Plataformas móviles oscilantes
    const healthItems = [];
    const consoles = []; // Consolas interactivas de teoría y pistas

    // 1. Suelo estructurado estilo Mario 3: Secciones de suelo firme con abismos/vacíos letales (gaps)
    // Se intercalan tramos de tierra firme (380-500px) y abismos transitables mediante saltos o puentes (90-130px)
    let groundCursor = startX;
    let safeStartWidth = 480; // Plataforma segura al inicio para spawn

    // Tramo seguro inicial
    for (let x = groundCursor; x < groundCursor + safeStartWidth; x += 32) {
      platforms.push({
        x: x + 16,
        y: groundY + 16,
        texture: 'tile_ground',
        visible: false,
        isGround: true,
        theme
      });
    }
    groundCursor += safeStartWidth;

    // Generar tramos intercalados hasta el final
    while (groundCursor < endX - 350) {
      // Abismo letal (vacío) de 100-130 px (evadible con salto o puente)
      const gapWidth = randInt(96, 128);
      
      // Puente o baldosas elevadas sobre el abismo para facilitar el cruce acrobático
      const bridgeLen = 3;
      const bridgeX = groundCursor + Math.round((gapWidth - (bridgeLen * 32)) / 2);
      for (let b = 0; b < bridgeLen; b++) {
        platforms.push({
          x: bridgeX + (b * 32) + 16,
          y: groundY - 36,
          texture: 'tile_platform',
          visible: true,
          isBridge: true,
          theme
        });
      }

      groundCursor += gapWidth;

      // Tramo de tierra firme siguiente (320-450 px)
      const solidWidth = randInt(320, 480);
      const nextLimit = Math.min(groundCursor + solidWidth, endX - 350);

      for (let x = groundCursor; x < nextLimit; x += 32) {
        platforms.push({
          x: x + 16,
          y: groundY + 16,
          texture: 'tile_ground',
          visible: false,
          isGround: true,
          theme
        });
      }

      // Colocar pincho de daño estático en medio del tramo firme
      if (solidWidth > 350) {
        hazards.push({
          x: groundCursor + Math.round(solidWidth * 0.5),
          y: groundY - 12,
          type: 'spike'
        });
      }

      groundCursor = nextLimit;
    }

    // Suelo final seguro para la meta o el Boss
    for (let x = groundCursor; x < endX; x += 32) {
      platforms.push({
        x: x + 16,
        y: groundY + 16,
        texture: 'tile_ground',
        visible: false,
        isGround: true,
        theme
      });
    }

    // 2. Consola de Teoría y Pistas al inicio del tramo
    consoles.push({
      x: startX + 260,
      y: groundY - 32,
      theme,
      type: 'theory_hints'
    });

    // 3. Generación procedural de plataformas elevadas con no-repetición estricta
    let currentX = startX + 380;
    const maxX = endX - 380;
    let currentLastArchetype = lastArchetypeId;

    let matbotCount = 0;
    let healthItemCount = 0;
    let flyingCount = 0;
    let parasiteCount = 0;
    let midConsolePlaced = false;

    // Ítems de vida condicionales (SOLO si vidas <= 3)
    const canSpawnHealth = (playerLives <= 3);

    while (currentX < maxX) {
      const available = ARCHETYPES.filter(a => a.id !== currentLastArchetype);
      const chosen = available[Math.floor(Math.random() * available.length)];
      currentLastArchetype = chosen.id;

      const sectorPlatforms = chosen.build(currentX);

      sectorPlatforms.forEach(p => {
        // Baldosas de plataforma con color temático neón
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

        // Spawn de Enemigos Terrestres (MatBot, BrainBot, CaatBot, etc.)
        if (p.hasMatBot && matbotCount < 4) {
          const centerX = p.x + (p.length * 16);
          const groundTypes = ['matbot', 'brainbot', 'caatbot', 'neurobot', 'warbot'];
          const pickedType = groundTypes[matbotCount % groundTypes.length];
          
          matbots.push({
            x: centerX,
            y: p.y - 30,
            botType: pickedType,
            patrolRange: Math.min(p.patrolRange || 70, (p.length * 16) - 10)
          });
          matbotCount++;
        }

        // Spawn de Neuro-Parasite (Synapse Crawler) en plataformas altas
        if (parasiteCount < 2 && p.y <= 240 && !p.hasMatBot) {
          parasiteBots.push({
            x: p.x + (p.length * 16),
            y: p.y - 25,
            patrolRange: 80
          });
          parasiteCount++;
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

        // Consola intermedia de teoría
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

      // Spawn de Enemigos Voladores (OwlBot y AjoloteBot) sobre los espacios abiertos
      if (flyingCount < 3 && currentX > startX + 500) {
        flyingBots.push({
          x: currentX + 180,
          y: groundY - 140,
          type: (flyingCount % 2 === 0) ? 'owlbot' : 'ajolotebot',
          patrolRange: 120
        });
        flyingCount++;
      }

      // Plataformas móviles cinéticas que conectan tramos elevados
      if (movingPlatforms.length < 3 && currentX > startX + 420) {
        movingPlatforms.push({
          x: currentX + 60,
          y: groundY - (movingPlatforms.length % 2 === 0 ? 80 : 120),
          distance: 130,
          duration: 2500,
          axis: (movingPlatforms.length % 2 === 0) ? 'horizontal' : 'vertical',
          theme
        });
      }

      currentX += chosen.width;
    }

    // Garantizar al menos un bot terrestre y un bot volador
    if (matbots.length === 0) {
      matbots.push({
        x: startX + Math.round(length * 0.45),
        y: groundY - 30,
        botType: 'matbot',
        patrolRange: 80
      });
    }

    if (flyingBots.length === 0) {
      flyingBots.push({
        x: startX + Math.round(length * 0.55),
        y: groundY - 150,
        type: 'owlbot',
        patrolRange: 130
      });
    }

    if (canSpawnHealth && healthItems.length === 0) {
      healthItems.push({
        x: startX + Math.round(length * 0.4),
        y: groundY - 26
      });
    }

    // 4. Meta o Jefe Final del Sector
    const victoryGoal = {
      x: endX - 140,
      y: groundY - 40
    };

    const bossData = isBossSector ? {
      x: endX - 280,
      y: groundY - 60,
      type: 'bosmat'
    } : null;

    return {
      startX,
      endX,
      length,
      theme,
      platforms,
      matbots,
      flyingBots,
      parasiteBots,
      hazards,
      movingPlatforms,
      bossData,
      healthItems,
      consoles,
      terminals: consoles,
      victoryGoal,
      lastArchetypeId: currentLastArchetype
    };
  }
}
