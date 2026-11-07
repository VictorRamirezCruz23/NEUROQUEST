import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { MatBot } from '../entities/MatBot.js';
import { EnemyBot } from '../entities/EnemyBot.js';
import { FlyingBot } from '../entities/FlyingBot.js';
import { ParasiteBot } from '../entities/ParasiteBot.js';
import { BosMat } from '../entities/BosMat.js';
import { LevelGenerator, NEON_THEMES } from '../procedural/LevelGenerator.js';
import { sessionState, COMPETENCY_IDS } from '../../core/sessionState.js';
import { DeviceDetector } from '../../utils/deviceDetector.js';
import { VirtualControls } from '../../ui/components/VirtualControls.js';
import { ChallengeModal } from '../../ui/components/ChallengeModal.js';
import { BattleArenaModal } from '../../ui/components/BattleArenaModal.js';
import { TheoryConsoleModal } from '../../ui/components/TheoryConsoleModal.js';
import { TrophyModal } from '../../ui/components/TrophyModal.js';
import { SoundManager } from '../audio/SoundManager.js';
import { educationEngine } from '../../education/engines/EducationEngine.js';
import { DiagnosticManager } from '../../education/assessments/DiagnosticManager.js';
import { DIFFICULTY_LABELS, adaptiveEngine } from '../../education/adaptive/AdaptiveEngine.js';
import { authModalController } from '../../ui/components/AuthModalController.js';
import { authService } from '../../services/firebase/authService.js';
import { tutorService } from '../../services/gemini/tutorService.js';
import { ChallengeRepository } from '../../education/repositories/ChallengeRepository.js';

/**
 * WorldScene.js — Escena del Mundo Interactivo y Plataformas 2D de NEUROQUEST.
 * Incorpora:
 * 1. Generación procedural por tramos con variaciones estéticas neón estilo Geometry Dash.
 * 2. Enemigo MatBot con animaciones limpias y combate retro estilo Pokémon.
 * 3. HUD gráfico personalizado con cabezas de jugador (5 vidas) y spawn condicional (vidas <= 3).
 * 4. Consolas interactivas de teoría y pistas conceptuales.
 * 5. Progresión fluida por tramos y mundos superando desafíos y obstáculos sin bloqueos de 80%.
 * 6. Acción física de agacharse (crouch) y controles táctiles avanzados.
 */
export class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data) {
    if (data && data.competencyId) {
      sessionState.setActiveCompetency(data.competencyId);
    }
    this.meta = sessionState.getActiveCompetencyMeta();
    this.isTransitioning = false;
    this.isGameOver = false;
    this.isVictory = false;

    // Sistema de Vidas (5 vidas iniciales)
    this.maxLives = 5;
    this.lives = (data && typeof data.lives === 'number') ? data.lives : 5;
    this.enemiesDefeated = (data && typeof data.enemiesDefeated === 'number') ? data.enemiesDefeated : 0;
    this.sectorNumber = (data && typeof data.sectorNumber === 'number') ? data.sectorNumber : 1;

    // Métricas de combate y precisión del sector
    this.combatTotalQuestions = (data && typeof data.combatTotalQuestions === 'number') ? data.combatTotalQuestions : 0;
    this.combatCorrectAnswers = (data && typeof data.combatCorrectAnswers === 'number') ? data.combatCorrectAnswers : 0;
    this.themeIndex = (data && typeof data.themeIndex === 'number') ? data.themeIndex : 0;
    this.lastArchetypeId = null;
    this.chunksCount = 1;

    this.matbots = [];
    this.activeModals = [];

    console.log(`[WorldScene] Inicializada para ${this.meta.name} [Sector ${this.sectorNumber} • Vidas: ${this.lives}]`);
  }

  create() {
    const worldWidth = 2600;
    const worldHeight = 540;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    // Resetear efectos residuales de cámara
    this.cameras.main.resetFX();
    this.cameras.main.fadeIn(350, 10, 12, 22);

    // 1. Límites físicos del mundo
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 1b. Gestor de audio espacial procedural y bucle de gameplay
    this.soundManager = new SoundManager(this);
    this.soundManager.startAmbientDrone();
    this.soundManager.playGameMusic();

    // 2. Fondo ambiental con parallax infinito
    this.createAtmosphere(worldWidth, worldHeight);

    // 3. Generación procedural estructurada estilo Mario 3 (plataformas, vacíos, pinchos y bots)
    this.buildProceduralLevel(worldWidth, worldHeight);

    // 4. Instanciar al jugador (Cadete)
    this.player = new Player(this, 120, 360);
    this.lastSafeX = 120;

    // 5. Configurar colisiones del jugador con el entorno
    this.physics.add.collider(this.player, this.platforms);
    if (this.movingPlatforms) {
      this.physics.add.collider(this.player, this.movingPlatforms);
    }

    // 6. Configurar colisiones de enemigos terrestres y parásitos con las plataformas
    if (this.matbotGroup) {
      this.physics.add.collider(this.matbotGroup, this.platforms);
      if (this.movingPlatforms) {
        this.physics.add.collider(this.matbotGroup, this.movingPlatforms);
      }
    }

    // Colisión de enemigos voladores con plataformas (evita penetración de suelo o caída al vacío)
    if (this.flyingGroup) {
      this.physics.add.collider(this.flyingGroup, this.platforms);
    }

    // Colisión del jefe con el suelo
    if (this.boss) {
      this.physics.add.collider(this.boss, this.platforms);
    }

    // 6b. Colisiones de Proyectiles de Energía Azul del Jugador
    if (this.playerProjectiles) {
      this.physics.add.collider(this.playerProjectiles, this.platforms, (proj) => {
        if (proj && proj.explode) proj.explode(false);
      });

      if (this.flyingGroup) {
        this.physics.add.overlap(this.playerProjectiles, this.flyingGroup, (proj, fbot) => {
          if (proj && proj.explode) proj.explode(true);
          if (fbot && fbot.takeProjectileDamage) fbot.takeProjectileDamage(proj);
        });
      }

      if (this.matbotGroup) {
        this.physics.add.overlap(this.playerProjectiles, this.matbotGroup, (proj, gbot) => {
          if (proj && proj.explode) proj.explode(true);
          if (gbot && gbot.takeProjectileDamage) gbot.takeProjectileDamage(proj);
        });
      }

      if (this.boss) {
        this.physics.add.overlap(this.playerProjectiles, this.boss, (proj, boss) => {
          if (proj && proj.explode) proj.explode(true);
          if (boss && boss.takeProjectileDamage) boss.takeProjectileDamage(proj);
        });
      }
    }

    // 6c. Contacto y combate táctico con enemigos terrestres (MatBot, BrainBot, ParasiteBot, etc.)
    if (this.matbotGroup) {
      this.physics.add.overlap(this.player, this.matbotGroup, (player, bot) => {
        if (this.isInvulnerable || this.isGameOver || this.isVictory || !bot.isAlive || bot.state === 'DEAD' || bot.state === 'DYING' || bot.state === 'DISSOLVING') return;
        if (this.battleArena && this.battleArena.isOpen) return;

        // El contacto físico no quita vida: el desafío pedagógico se resuelve en el duelo
        if (bot.setVelocityX) bot.setVelocityX(0);

        // Activar combate táctico de preguntas
        this.startCombatDuel(bot);
      });
    }

    // 6d. Daño por colisión con enemigos voladores (FlyingBot: OwlBot / AjoloteBot)
    if (this.flyingGroup) {
      this.physics.add.overlap(this.player, this.flyingGroup, (player, fbot) => {
        if (this.isInvulnerable || this.isGameOver || this.isVictory || !fbot.isAlive) return;
        this.damagePlayer(1, fbot);
        const pushDir = player.x < fbot.x ? -1 : 1;
        player.setVelocity(pushDir * 240, -220);
        if (fbot && fbot.setVelocityX) {
          fbot.setVelocityX(pushDir * -160);
        }
      });
    }

    // 6e. Daño por contacto con pinchos y trampas de plasma (Hazards)
    if (this.hazardsGroup) {
      this.physics.add.overlap(this.player, this.hazardsGroup, (player, hazard) => {
        if (this.isInvulnerable || this.isGameOver || this.isVictory) return;
        this.damagePlayer(1, hazard);
        player.setVelocityY(-280);
      });
    }

    // 7. Colisión / Recogida de Ítems de Recuperación de Vida
    if (this.healthItemGroup) {
      this.physics.add.overlap(this.player, this.healthItemGroup, (player, item) => {
        this.handleHealthItemPickup(item);
      });
    }

    // 8. Colisión con la Meta de Victoria
    if (this.victoryGoal) {
      this.physics.add.overlap(this.player, this.victoryGoal, () => {
        this.handleVictoryGoal();
      });
    }

    // 9. Configurar cámara con seguimiento suave
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // 10. HUD de estado y viñeta de alerta roja crítica
    this.createHUD();
    this.createCriticalHealthVignette();
    this.trophyModal = new TrophyModal(this);

    // 11. Modal interactivo de preguntas y desafíos
    this.challengeModal = new ChallengeModal(this, this.player);

    // 12. Modal de combate táctico retro estilo Pokémon
    this.battleArena = new BattleArenaModal(this, this.player);

    // 13. Terminal de transmisión teórica y pistas conceptuales
    this.theoryModal = new TheoryConsoleModal(this, this.player);

    // 14. Detección de dispositivo (Móvil vs. PC) y controles táctiles
    this.isMobile = DeviceDetector.isMobile();
    if (this.isMobile) {
      DeviceDetector.requestLandscape();
      this.virtualControls = new VirtualControls(this, this.player);
    }

    // 15. Listeners de teclado y eventos
    this.setupEventListeners();

    // 16. Pre-cargar desafíos dinámicos asignados a cada MatBot
    this.preloadAndAssignEnemyChallenges();
  }

  setupEventListeners() {
    this.input.keyboard.on('keydown-M', () => {
      this.goToCompetencySelector();
    });

    this.input.keyboard.on('keydown-B', () => {
      this.openDashboard();
    });

    // Disparo con puntero hacia la posición del clic (PC) o tap con el dedo (Móvil)
    this.onWorldPointerDown = (pointer, currentlyOver) => {
      // Si el clic/tap ocurrió sobre un elemento UI o botón interactivo, no disparar
      if (currentlyOver && currentlyOver.length > 0) return;
      if (this.battleArena?.isOpen || this.challengeModal?.isOpen || this.trophyModal?.isOpen || this.theoryModal?.isOpen) return;
      if (this.isGameOver || this.isVictory) return;
      if (!this.player || !this.player.active || this.player.isLocked) return;

      // Obtener coordenada de mundo exacta considerando el scroll y zoom de la cámara principal
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.player.shootAt(worldPoint.x, worldPoint.y);
    };
    this.input.on('pointerdown', this.onWorldPointerDown);

    this.events.on('touch-interact', () => {
      this.handleTerminalInteraction();
    });

    this.events.on('touch-switch-route', () => {
      this.goToCompetencySelector();
    });

    this.events.on('touch-open-dashboard', () => {
      this.openDashboard();
    });

    this.events.once('shutdown', () => {
      if (this.onWorldPointerDown) {
        this.input.off('pointerdown', this.onWorldPointerDown);
        this.onWorldPointerDown = null;
      }
      this.events.off('touch-interact');
      this.events.off('touch-switch-route');
      this.events.off('touch-open-dashboard');
      if (this.authUnsubscribe) {
        this.authUnsubscribe();
        this.authUnsubscribe = null;
      }
      if (this.virtualControls) {
        this.virtualControls.destroy();
        this.virtualControls = null;
      }
      if (this.battleArena) {
        this.battleArena.destroy();
        this.battleArena = null;
      }
      if (this.theoryModal) {
        this.theoryModal.destroy();
        this.theoryModal = null;
      }
      if (this.soundManager) {
        this.soundManager.destroy();
        this.soundManager = null;
      }
    });
  }

  createAtmosphere(worldWidth, worldHeight) {
    const { width, height } = this.scale;

    // 1. Telón de fondo espacial permanente a profundidad absoluta -200 (garantiza cero fondos negros)
    this.add.rectangle(0, 0, width, height, 0x050713, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-200);

    // 2. Capa de fondo temática en TileSprite infinito con escala proporcional (elimina zoom excesivo)
    if (this.textures.exists(this.meta.bgKey)) {
      const srcImg = this.textures.get(this.meta.bgKey).getSourceImage();
      const naturalHeight = srcImg.height || 1536;
      const scaleRatio = height / naturalHeight;
      this.bgScaleRatio = scaleRatio;

      this.bgTile = this.add.tileSprite(0, 0, width, height, this.meta.bgKey)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(-100);
      this.bgTile.setTileScale(scaleRatio, scaleRatio);
    }

    // 3. Partículas y estrellas cósmicas flotantes con profundidad espacial
    this.ambientParticles = [];
    for (let i = 0; i < 75; i++) {
      const px = Phaser.Math.Between(0, width);
      const py = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.25, 0.75);

      const star = this.add.rectangle(px, py, size, size, this.meta.primaryColor || 0x38bdf8, alpha)
        .setScrollFactor(Phaser.Math.FloatBetween(0.04, 0.18))
        .setDepth(-80);

      this.tweens.add({
        targets: star,
        alpha: alpha * 0.25,
        duration: Phaser.Math.Between(2200, 4800),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.ambientParticles.push(star);
    }
  }

  /**
   * Genera el mapa procedimental garantizando diversidad estructural, ruta viable y entidades.
   */
  buildProceduralLevel(worldWidth, worldHeight) {
    const isBoss = (this.sectorNumber >= 3 && this.meta.id === COMPETENCY_IDS.LOGIC_MATH);
    const levelData = LevelGenerator.generateChunk({
      startX: 0,
      length: worldWidth,
      groundY: 430,
      playerLives: this.lives,
      themeIndex: this.themeIndex,
      lastArchetypeId: this.lastArchetypeId,
      isBossSector: isBoss
    });

    this.lastArchetypeId = levelData.lastArchetypeId;
    this.activeTheme = levelData.theme || NEON_THEMES[0];

    // 1. Plataformas físicas estáticas
    this.platforms = this.physics.add.staticGroup();
    levelData.platforms.forEach(p => {
      const tile = this.platforms.create(p.x, p.y, p.texture);
      if (p.isGround || p.visible === false) {
        tile.setVisible(false);
      } else if (levelData.theme?.primary) {
        tile.setTint(levelData.theme.primary);
      }
      tile.refreshBody();
    });

    // 1b. Plataformas Móviles Cinéticas
    this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
    if (levelData.movingPlatforms) {
      levelData.movingPlatforms.forEach(mp => {
        const plat = this.physics.add.image(mp.x, mp.y, 'tile_platform');
        plat.setImmovable(true);
        if (plat.body) plat.body.allowGravity = false;
        if (mp.theme?.primary) plat.setTint(mp.theme.primary);
        plat.setScale(2.8, 0.9);
        plat.refreshBody();
        this.movingPlatforms.add(plat);

        const tweenConfig = {
          targets: plat,
          duration: mp.duration || 2400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          onUpdate: () => {
            if (plat.body) plat.body.updateFromGameObject();
          }
        };

        if (mp.axis === 'vertical') {
          tweenConfig.y = mp.y - (mp.distance || 80);
        } else {
          tweenConfig.x = mp.x + (mp.distance || 130);
        }

        this.tweens.add(tweenConfig);
      });
    }

    // 2. Obstáculos y Pinchos de Daño (Hazards)
    this.hazardsGroup = this.physics.add.staticGroup();
    if (levelData.hazards) {
      levelData.hazards.forEach(h => {
        const spk = this.hazardsGroup.create(h.x, h.y, 'spike_hazard');
        spk.refreshBody();
      });
    }

    // 3. Proyectiles del jugador (con gravedad desactivada a nivel de grupo)
    this.playerProjectiles = this.physics.add.group({ runChildUpdate: true, allowGravity: false });

    // 4. Terminales interactivas
    this.terminals = this.physics.add.staticGroup();
    levelData.terminals.forEach(t => {
      const term = this.terminals.create(t.x, t.y, 'terminal_device');
      term.setData('type', t.type);
      term.refreshBody();

      this.tweens.add({
        targets: term,
        alpha: 0.85,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // Prompt flotante para terminales
    this.interactionPrompt = this.add.text(0, 0, '[E] Acceder a Terminal', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: this.meta.primaryColorHex,
      backgroundColor: 'rgba(10, 12, 22, 0.92)',
      padding: { x: 8, y: 4 },
      stroke: this.meta.primaryColorHex,
      strokeThickness: 1
    }).setOrigin(0.5).setDepth(500).setVisible(false);

    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // 5. Enemigos robóticos terrestres (MatBot, BrainBot, CaatBot, etc.)
    this.matbotGroup = this.physics.add.group();
    this.matbots = [];

    levelData.matbots.forEach(m => {
      const bot = new EnemyBot(this, m.x, m.y, { patrolRange: m.patrolRange, botType: m.botType || 'matbot' });
      this.matbotGroup.add(bot);
      this.matbots.push(bot);
    });

    // 6. ParasiteBots (Synapse Crawlers)
    this.parasiteGroup = this.physics.add.group();
    if (levelData.parasiteBots) {
      levelData.parasiteBots.forEach(pb => {
        const pbot = new ParasiteBot(this, pb.x, pb.y, { patrolRange: pb.patrolRange });
        this.matbotGroup.add(pbot);
        this.parasiteGroup.add(pbot);
        this.matbots.push(pbot);
      });
    }

    // 7. Enemigos Voladores (OwlBot y AjoloteBot)
    this.flyingGroup = this.physics.add.group({ runChildUpdate: true });
    this.flyingBots = [];
    if (levelData.flyingBots) {
      levelData.flyingBots.forEach(fb => {
        const fbot = new FlyingBot(this, fb.x, fb.y, { type: fb.type, patrolRange: fb.patrolRange });
        this.flyingGroup.add(fbot);
        this.flyingBots.push(fbot);
      });
    }

    // 8. Jefe BosMat si es el sector del boss
    this.boss = null;
    if (levelData.bossData) {
      this.boss = new BosMat(this, levelData.bossData.x, levelData.bossData.y);
    }

    // 9. Ítems coleccionables de Recuperación de Vida
    this.healthItemGroup = this.physics.add.staticGroup();
    levelData.healthItems.forEach(h => {
      const item = this.healthItemGroup.create(h.x, h.y, 'item_health');
      item.refreshBody();

      this.tweens.add({
        targets: item,
        y: h.y - 6,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // 10. Meta Final de Victoria
    this.victoryGoal = this.physics.add.staticSprite(levelData.victoryGoal.x, levelData.victoryGoal.y, 'victory_flag');
    this.victoryGoal.refreshBody();
    this.updateVictoryGoalStatus();

    this.tweens.add({
      targets: this.victoryGoal,
      alpha: 0.88,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Extiende el mapa de forma procedural e infinita cuando el jugador no alcanza el 80% de precisión.
   */
  extendChunk() {
    this.chunksCount++;
    this.themeIndex++;
    const nextTheme = NEON_THEMES[this.themeIndex % NEON_THEMES.length];
    this.activeTheme = nextTheme;

    const chunkLength = 2200;
    const chunkStartX = this.worldWidth;
    const newWorldWidth = this.worldWidth + chunkLength;
    this.worldWidth = newWorldWidth;

    // Actualizar límites físicos y de seguimiento de cámara
    this.physics.world.setBounds(0, 0, newWorldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, newWorldWidth, this.worldHeight);

    // Generar nuevo tramo procedural con la nueva paleta neón
    const chunkData = LevelGenerator.generateChunk({
      startX: chunkStartX,
      length: chunkLength,
      groundY: 430,
      playerLives: this.lives,
      themeIndex: this.themeIndex,
      lastArchetypeId: this.lastArchetypeId
    });
    this.lastArchetypeId = chunkData.lastArchetypeId;

    // 1. Agregar plataformas del nuevo tramo (suelo añadido invisible)
    chunkData.platforms.forEach(p => {
      const tile = this.platforms.create(p.x, p.y, p.texture);
      if (p.isGround || p.visible === false) {
        tile.setVisible(false);
      } else if (chunkData.theme?.primary) {
        tile.setTint(chunkData.theme.primary);
      }
      tile.refreshBody();
    });

    // 2. Agregar nuevas consolas / terminales
    chunkData.consoles.forEach(t => {
      const term = this.terminals.create(t.x, t.y, 'terminal_device');
      term.setData('type', t.type);
      term.refreshBody();
      this.tweens.add({
        targets: term,
        alpha: 0.85,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // 3. Spawn de nuevos MatBots
    chunkData.matbots.forEach(m => {
      const bot = new MatBot(this, m.x, m.y, { patrolRange: m.patrolRange });
      this.matbotGroup.add(bot);
      this.matbots.push(bot);
    });

    // Asignar desafíos pre-cargados a los nuevos enemigos generados
    this.preloadAndAssignEnemyChallenges();

    // 4. Spawn condicional de ítems de vida
    chunkData.healthItems.forEach(h => {
      const item = this.healthItemGroup.create(h.x, h.y, 'item_health');
      item.refreshBody();
      this.tweens.add({
        targets: item,
        y: h.y - 6,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // 5. Mover meta al nuevo final y actualizar estado de bloqueo
    if (this.victoryGoal) {
      this.victoryGoal.setPosition(chunkData.victoryGoal.x, chunkData.victoryGoal.y);
      this.victoryGoal.refreshBody();
      this.victoryGoalUnlockedAnnounced = false;
      this.updateVictoryGoalStatus();
    }

    // Destello cromático según el nuevo tema neón (estilo Geometry Dash)
    const tintColor = nextTheme.primary;
    const r = (tintColor >> 16) & 0xff;
    const g = (tintColor >> 8) & 0xff;
    const b = tintColor & 0xff;
    this.cameras.main.flash(350, r, g, b);

    this.showFloatingNotice(
      this.player.x,
      this.player.y - 85,
      `🌌 CAMBIO DE FASE: ${nextTheme.name.toUpperCase()}`,
      nextTheme.primaryHex
    );
  }

  createHUD() {
    const baseDepth = 1500;
    const { width, height } = this.scale;
    this.hudObjects = [];

    const trackHud = (obj) => {
      this.hudObjects.push(obj);
      return obj;
    };

    // 1. Panel Identidad (Izquierda) - Compacto y protegido contra solapamientos
    const topBarW = Math.min(265, Math.floor(width * 0.28));
    const topBarH = 46;
    const topBarX = 14;
    const topBarY = 12;

    const topBar = trackHud(this.add.graphics().setScrollFactor(0).setDepth(baseDepth));
    topBar.fillStyle(0x0f172a, 0.92);
    topBar.fillRoundedRect(topBarX, topBarY, topBarW, topBarH, 6);
    topBar.lineStyle(2, this.meta.primaryColor, 0.85);
    topBar.strokeRoundedRect(topBarX, topBarY, topBarW, topBarH, 6);

    const badge = trackHud(this.add.graphics().setScrollFactor(0).setDepth(baseDepth + 1));
    badge.fillStyle(this.meta.badgeBg, 1);
    badge.fillRoundedRect(topBarX + 8, topBarY + 7, 32, 32, 5);
    badge.lineStyle(1, this.meta.primaryColor, 1);
    badge.strokeRoundedRect(topBarX + 8, topBarY + 7, 32, 32, 5);

    trackHud(this.add.text(topBarX + 24, topBarY + 23, this.meta.code, {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 2));

    trackHud(this.add.text(topBarX + 46, topBarY + 6, `MUNDO ${this.meta.worldNumber}: ${this.meta.name.toUpperCase()} (S${this.sectorNumber})`, {
      fontFamily: 'monospace',
      fontSize: '9.5px',
      color: this.meta.primaryColorHex,
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(baseDepth + 2));

    this.levelText = trackHud(this.add.text(topBarX + 46, topBarY + 22, `${this.meta.discipline} • Calibrando...`, {
      fontFamily: 'monospace',
      fontSize: '8.5px',
      color: '#94a3b8'
    }).setScrollFactor(0).setDepth(baseDepth + 2));

    this.updateHUDLevel();

    // 2. Medidor Central de Vidas - Compacto, centrado y con espacio generoso a ambos lados
    const livesBoxW = 160;
    const livesBoxH = 46;
    const livesBoxX = Math.floor(width / 2 - livesBoxW / 2);
    const livesBoxY = 12;

    const livesBox = trackHud(this.add.graphics().setScrollFactor(0).setDepth(baseDepth));
    livesBox.fillStyle(0x0f172a, 0.92);
    livesBox.fillRoundedRect(livesBoxX, livesBoxY, livesBoxW, livesBoxH, 6);
    livesBox.lineStyle(2, 0x38bdf8, 0.85);
    livesBox.strokeRoundedRect(livesBoxX, livesBoxY, livesBoxW, livesBoxH, 6);

    this.livesLabel = trackHud(this.add.text(width / 2, livesBoxY + 8, 'BLINDAJE DE ENERGÍA', {
      fontFamily: 'monospace',
      fontSize: '8.5px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 2));

    this.lifeHeadIcons = [];
    const headSpacing = 22;
    const startHeadX = (width / 2) - ((this.maxLives - 1) * headSpacing) / 2;
    for (let i = 0; i < this.maxLives; i++) {
      const hx = startHeadX + (i * headSpacing);
      const icon = trackHud(this.add.image(hx, livesBoxY + 28, 'player_head')
        .setDisplaySize(18, 18)
        .setScrollFactor(0)
        .setDepth(baseDepth + 2));
      this.lifeHeadIcons.push(icon);
    }

    // Indicador de Precisión en Combate
    this.accuracyDisplay = trackHud(this.add.text(width / 2, livesBoxY + livesBoxH + 8, '🎯 PRECISIÓN: 100% [0/0]', {
      fontFamily: 'monospace',
      fontSize: '9.5px',
      color: '#38bdf8',
      fontStyle: 'bold',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      padding: { x: 7, y: 2 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 2));

    this.updateLivesHUD();

    // 3. Barra de Acciones Superior Derecha
    const rightMargin = 14;

    // Botón Pantalla Completa
    const fsBtn = trackHud(this.add.text(width - rightMargin, livesBoxY + livesBoxH + 8, '⛶ PANTALLA COMPLETA', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#38bdf8',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      padding: { x: 6, y: 3 }
    })
    .setOrigin(1, 0)
    .setScrollFactor(0)
    .setDepth(baseDepth + 2)
    .setInteractive({ useHandCursor: true }));

    fsBtn.on('pointerover', () => fsBtn.setColor('#ffffff'));
    fsBtn.on('pointerout', () => fsBtn.setColor('#38bdf8'));
    fsBtn.on('pointerdown', () => {
      this.soundManager?.playClick();
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    // Botón RUTAS [M]
    const btnW = 90;
    const btnH = 32;
    const btnX = width - rightMargin - (btnW / 2);
    const btnY = topBarY + (topBarH / 2);

    const changeBg = trackHud(this.add.graphics().setScrollFactor(0).setDepth(baseDepth));
    const drawChangeBtn = (hover = false) => {
      changeBg.clear();
      changeBg.fillStyle(hover ? 0x2563eb : 0x1e293b, 0.95);
      changeBg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
      changeBg.lineStyle(hover ? 2 : 1, hover ? this.meta.primaryColor : 0x64748b, 1);
      changeBg.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
    };
    drawChangeBtn(false);

    trackHud(this.add.text(btnX, btnY, 'RUTAS [M]', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 1));

    const changeHit = trackHud(this.add.zone(btnX, btnY, btnW, btnH)
      .setScrollFactor(0)
      .setDepth(baseDepth + 3)
      .setInteractive({ useHandCursor: true }));

    changeHit.on('pointerover', () => drawChangeBtn(true));
    changeHit.on('pointerout', () => drawChangeBtn(false));
    changeHit.on('pointerdown', () => this.goToCompetencySelector());

    // Botón Métricas [B]
    const metricsBtnX = btnX - (btnW / 2) - 8 - 45;
    const metricsBtn = trackHud(this.add.text(metricsBtnX, btnY, '📊 Métricas [B]', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#38bdf8',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      padding: { x: 7, y: 5 }
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(baseDepth + 1)
    .setInteractive({ useHandCursor: true }));

    metricsBtn.on('pointerdown', () => this.openDashboard());

    // Botón Perfil
    const profileBtnX = metricsBtnX - 45 - 8 - 50;
    const profileBtn = trackHud(this.add.text(profileBtnX, btnY, `👤 ${authService.getDisplayName()}`, {
      fontFamily: 'monospace',
      fontSize: '9.5px',
      color: '#38bdf8',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      padding: { x: 7, y: 5 }
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(baseDepth + 1)
    .setInteractive({ useHandCursor: true }));

    profileBtn.on('pointerdown', () => authModalController.open());

    this.authUnsubscribe = authService.onAuthStateChange(() => {
      if (profileBtn && profileBtn.setText) {
        profileBtn.setText(`👤 ${authService.getDisplayName()}`);
      }
    });

    // 4. Barra informativa inferior
    trackHud(this.add.text(
      width / 2,
      height - 16,
      'Controles: [A/D] Correr • [W/Espacio] Saltar • [Click / Tap] Disparo • [E] Terminal • [B] Métricas • Meta al final ➔',
      {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#cbd5e1',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        padding: { x: 8, y: 2 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth));
  }

  /**
   * Muestra u oculta los elementos del HUD principal para evitar superposiciones con modales.
   * @param {boolean} visible
   */
  setHUDVisible(visible) {
    if (this.hudObjects) {
      this.hudObjects.forEach(obj => {
        if (obj && typeof obj.setVisible === 'function') {
          obj.setVisible(visible);
        }
      });
    }
  }

  updateLivesHUD() {
    if (this.lifeHeadIcons && this.lifeHeadIcons.length > 0) {
      this.lifeHeadIcons.forEach((icon, idx) => {
        if (idx < this.lives) {
          icon.setVisible(true);
          icon.setAlpha(1.0);
          icon.clearTint();
        } else {
          icon.setVisible(true);
          icon.setAlpha(0.25);
          icon.setTint(0x475569);
        }
      });
    }

    if (this.livesLabel) {
      this.livesLabel.setText(`BLINDAJE DE ENERGÍA (${this.lives}/${this.maxLives})`);
    }

    this.updateAccuracyHUD();
  }

  updateAccuracyHUD() {
    if (!this.accuracyDisplay) return;
    const total = this.combatTotalQuestions;
    const correct = this.combatCorrectAnswers;

    if (total === 0) {
      this.accuracyDisplay.setText('🎯 PRECISIÓN EN COMBATE: 100% [0/0]');
      this.accuracyDisplay.setColor('#38bdf8');
    } else {
      const acc = Math.round((correct / total) * 100);
      this.accuracyDisplay.setText(`🎯 PRECISIÓN EN COMBATE: ${acc}% [${correct}/${total}] • SECTOR ACTIVO`);
      this.accuracyDisplay.setColor('#38bdf8');
    }
  }

  createCriticalHealthVignette() {
    const { width, height } = this.scale;
    if (this.criticalVignette) {
      this.criticalVignette.destroy();
    }
    this.criticalVignette = this.add.graphics().setScrollFactor(0).setDepth(9999).setVisible(false);

    // Marco viñeta de alerta roja perimetral (alerta constante si vidas <= 2)
    const borderThick = 24;
    this.criticalVignette.fillStyle(0xdc2626, 0.45);
    this.criticalVignette.fillRect(0, 0, width, borderThick);
    this.criticalVignette.fillRect(0, height - borderThick, width, borderThick);
    this.criticalVignette.fillRect(0, 0, borderThick, height);
    this.criticalVignette.fillRect(width - borderThick, 0, borderThick, height);

    // Borde de neón escarlata brillante
    this.criticalVignette.lineStyle(4, 0xef4444, 0.95);
    this.criticalVignette.strokeRect(2, 2, width - 4, height - 4);

    // Segundo borde interno de advertencia
    this.criticalVignette.lineStyle(1.5, 0xfca5a5, 0.7);
    this.criticalVignette.strokeRect(borderThick, borderThick, width - (borderThick * 2), height - (borderThick * 2));

    this.tweens.add({
      targets: this.criticalVignette,
      alpha: 0.25,
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  updateCriticalHealthFX() {
    if (!this.criticalVignette) return;
    if (this.lives <= 2 && !this.isGameOver) {
      this.criticalVignette.setVisible(true);
    } else {
      this.criticalVignette.setVisible(false);
    }
  }

  takeDamage(amount = 1, source = null) {
    this.damagePlayer(amount, source);
  }

  damagePlayer(amount = 1, source = null) {
    if (this.isInvulnerable || this.isGameOver || this.isVictory) return;

    // Cooldown específico por bot atacante: solo puede infligir daño 1 vez cada 2 segundos
    const now = Date.now();
    if (source && source.lastDamageTime && (now - source.lastDamageTime < 2000)) {
      return;
    }
    if (source) {
      source.lastDamageTime = now;
    }

    this.isInvulnerable = true;

    // Reducir estrictamente de 1 en 1 vida
    this.lives = Math.max(0, this.lives - amount);
    this.updateLivesHUD();
    this.updateCriticalHealthFX();

    if (this.soundManager) {
      this.soundManager.playHit();
    }

    // Vibración de cámara y flash de daño
    this.cameras.main.shake(320, 0.022);
    this.cameras.main.flash(260, 239, 68, 68);

    // Separación física / Knockback para despegar al jugador del atacante
    if (this.player && this.player.body && source) {
      const knockDir = (this.player.x < source.x) ? -1 : 1;
      this.player.setVelocityX(knockDir * 240);
      this.player.setVelocityY(-240);
    }

    // Sistema de invulnerabilidad temporal (i-frames: 2000 ms) con parpadeo del sprite
    if (this.player && this.player.active) {
      this.player.setTint(0xef4444);
      if (this.iframeTween) {
        this.iframeTween.stop();
      }
      this.iframeTween = this.tweens.add({
        targets: this.player,
        alpha: 0.25,
        duration: 125,
        yoyo: true,
        repeat: 7, // 8 ciclos de 250ms = 2000ms de i-frames
        onComplete: () => {
          if (this.player && this.player.active) {
            this.player.setAlpha(1);
            this.player.clearTint();
            this.player.updatePalette?.();
          }
        }
      });
    }

    // Cooldown estricto de 2.0 segundos para permitir nuevo daño
    this.time.delayedCall(2000, () => {
      this.isInvulnerable = false;
      if (this.player && this.player.active) {
        this.player.setAlpha(1);
        this.player.clearTint();
        this.player.updatePalette?.();
      }
    });

    if (this.lives <= 0) {
      this.time.delayedCall(450, () => {
        this.triggerGameOver();
      });
    }
  }

  healPlayer(amount = 1) {
    if (this.lives < this.maxLives) {
      this.lives = Math.min(this.maxLives, this.lives + amount);
      this.updateLivesHUD();
      this.updateCriticalHealthFX();
      this.cameras.main.flash(250, 16, 185, 129);
      if (this.soundManager) this.soundManager.playHeal();
    }
  }

  handleFallIntoAbyss() {
    if (this.isRespawning || this.isGameOver) return;
    this.isRespawning = true;

    this.takeDamage(1);

    const safeX = Math.max(120, this.lastSafeX || 120);
    const safeY = 360;
    if (this.player) {
      this.player.setPosition(safeX, safeY);
      this.player.setVelocity(0, 0);
    }

    this.time.delayedCall(400, () => {
      this.isRespawning = false;
    });
  }

  startBossCombatDuel(boss) {
    if (this.battleArena && !this.battleArena.isOpen) {
      this.battleArena.startBattle({
        matbot: boss,
        onCombatResult: (isCorrect) => {
          if (isCorrect) {
            boss.onBossChallengeSuccess();
          } else {
            this.takeDamage(1);
          }
        }
      });
    }
  }

  showTrophyVictoryModal(competencyId) {
    if (!this.trophyModal) {
      this.trophyModal = new TrophyModal(this);
    }
    this.soundManager?.playCorrect();
    this.trophyModal.show(competencyId, () => {
      this.goToCompetencySelector();
    });
  }

  updateHUDLevel() {
    if (!this.levelText) return;
    try {
      const compId = sessionState.getActiveCompetency();
      const needsDiag = DiagnosticManager && typeof DiagnosticManager.needsDiagnostic === 'function' && DiagnosticManager.needsDiagnostic(compId);

      if (needsDiag) {
        this.levelText.setText(`${this.meta.discipline} • DIAGNÓSTICO`);
        this.levelText.setColor('#fbbf24');
      } else {
        const lvl = educationEngine.getCurrentLevel(compId);
        const label = DIFFICULTY_LABELS[lvl] || `Nivel ${lvl}`;
        this.levelText.setText(`${this.meta.discipline} • ${label}`);
        this.levelText.setColor('#38bdf8');
      }
    } catch (err) {
      console.warn('[WorldScene] Error al actualizar HUD:', err);
    }
  }

  /**
   * Inicia el combate interactivo estilo Pokémon frente a frente con el MatBot.
   * @param {MatBot} matbot
   */
  startCombatDuel(matbot) {
    if (this.isGameOver || this.isVictory || !matbot || !matbot.isAlive) return;

    if (this.battleArena && !this.battleArena.isOpen) {
      this.battleArena.startBattle({
        matbot,
        onCombatResult: (isCorrect, challenge, bot, meta) => {
          this.combatTotalQuestions++;

          if (isCorrect) {
            this.combatCorrectAnswers++;
            this.enemiesDefeated++;
            if (bot && typeof bot.playDefeat === 'function') {
              bot.playDefeat(() => {
                this.showFloatingNotice(this.player.x, this.player.y - 60, '⚔️ ¡MATBOT DESTRUIDO!', '#34d399');
                this.checkAllEnemiesDefeated();
              });
            } else {
              this.checkAllEnemiesDefeated();
            }

            // Si el jugador respondió rápido y subió de nivel, recalibrar los MatBots restantes en segundo plano
            if (meta?.isLevelUp && meta?.newLevel) {
              this.recalibrateRemainingEnemies(meta.newLevel);
            } else {
              this.refreshRemainingEnemyChallenges();
            }
          } else {
            if (bot && typeof bot.setCooldown === 'function') {
              bot.setCooldown(3500);
            }
            this.refreshRemainingEnemyChallenges();
          }

          this.updateAccuracyHUD();
        }
      });
    }
  }

  /**
   * Maneja la interacción con el ítem de recuperación de vida.
   * @param {Phaser.Physics.Arcade.Sprite} item
   */
  handleHealthItemPickup(item) {
    if (this.isGameOver || this.isVictory || !item || !item.active) return;

    // Desactivar temporalmente el cuerpo para evitar múltiples colisiones
    item.body.enable = false;

    if (this.challengeModal && !this.challengeModal.isOpen) {
      if (this.player) this.player.freeze();

      this.challengeModal.open({
        mode: 'recovery',
        healthItem: item,
        onRecoveryResult: (isCorrect, challenge, hItem) => {
          if (isCorrect) {
            this.healPlayer(1);
            if (this.soundManager) {
              this.soundManager.playHeal();
            }
            this.showFloatingNotice(this.player.x, this.player.y - 60, '💖 +1 VIDA RESTAURADA', '#10b981');
            if (hItem) {
              this.tweens.add({
                targets: hItem,
                scaleX: 1.5,
                scaleY: 1.5,
                alpha: 0,
                duration: 400,
                onComplete: () => hItem.destroy()
              });
            }
          } else {
            this.showFloatingNotice(this.player.x, this.player.y - 60, '⚠️ SINTONIZACIÓN FALLIDA', '#f59e0b');
            if (hItem) {
              hItem.setTint(0x64748b);
              this.tweens.add({
                targets: hItem,
                alpha: 0.2,
                duration: 800,
                onComplete: () => hItem.destroy()
              });
            }
          }
        }
      });
    }
  }



  showFloatingNotice(x, y, text, color = '#38bdf8') {
    const notice = this.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color,
      fontStyle: 'bold',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setDepth(2100);

    this.tweens.add({
      targets: notice,
      y: y - 35,
      alpha: 0,
      duration: 1400,
      ease: 'Power2',
      onComplete: () => notice.destroy()
    });
  }

  /**
   * Dispara el fin del juego al agotarse las 5 vidas.
   */
  triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    if (this.player) this.player.freeze();
    if (this.challengeModal && this.challengeModal.isOpen) {
      this.challengeModal.close();
    }

    const { width, height } = this.scale;
    const baseDepth = 3000;

    const overlay = this.add.rectangle(0, 0, width, height, 0x05070f, 0.92)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(baseDepth)
      .setInteractive();

    const boxW = 540;
    const boxH = 280;
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2;

    const boxGfx = this.add.graphics().setScrollFactor(0).setDepth(baseDepth + 1);
    boxGfx.fillStyle(0x0f172a, 0.98);
    boxGfx.fillRoundedRect(boxX, boxY, boxW, boxH, 10);
    boxGfx.lineStyle(2, 0xef4444, 1);
    boxGfx.strokeRoundedRect(boxX, boxY, boxW, boxH, 10);

    this.add.text(width / 2, boxY + 45, '💀 SISTEMA COGNITIVO DESACTIVADO', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 2);

    this.add.text(
      width / 2,
      boxY + 95,
      `Has perdido las 5 vidas del sector en ${this.meta.name}.\nRevisa las pistas educativas y recalibra tu blindaje para volver a intentarlo.`,
      {
        fontFamily: 'Segoe UI',
        fontSize: '13px',
        color: '#cbd5e1',
        align: 'center',
        wordWrap: { width: boxW - 50 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 2);

    this.add.text(width / 2, boxY + 155, `MatBots neutralizados: ${this.enemiesDefeated}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#38bdf8'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 2);

    // Botón Reintentar Sector (Restaura 5 vidas)
    const retryBtn = this.add.text(width / 2, boxY + 220, 'REINICIAR SECTOR (5 VIDAS) ➔', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
      backgroundColor: '#dc2626',
      padding: { x: 16, y: 10 }
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(baseDepth + 3)
    .setInteractive({ useHandCursor: true });

    retryBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(250, 10, 12, 22);
      this.time.delayedCall(270, () => {
        this.scene.restart({
          competencyId: sessionState.getActiveCompetency(),
          lives: 5,
          enemiesDefeated: 0,
          sectorNumber: this.sectorNumber
        });
      });
    });
  }

  /**
   * Retorna la cantidad total de enemigos activos y vivos que quedan en el sector.
   * @returns {number}
   */
  getRemainingEnemiesCount() {
    let count = 0;
    if (this.matbots) {
      count += this.matbots.filter(b => b && b.active && b.isAlive && b.state !== 'DEAD' && b.state !== 'DYING' && b.state !== 'DISSOLVING').length;
    }
    if (this.flyingBots) {
      count += this.flyingBots.filter(fb => fb && fb.active && fb.isAlive).length;
    }
    if (this.boss && this.boss.active && this.boss.isAlive) {
      count += 1;
    }
    return count;
  }

  /**
   * Actualiza el aspecto visual de la meta según si quedan o no enemigos en el sector.
   */
  updateVictoryGoalStatus() {
    if (!this.victoryGoal) return;
    const remaining = this.getRemainingEnemiesCount();
    if (remaining > 0) {
      // Bloqueada: tono carmesí / alerta
      this.victoryGoal.setTint(0xf87171);
    } else {
      // Desbloqueada: sin tinte
      this.victoryGoal.clearTint();
    }
  }

  /**
   * Verifica si todos los enemigos han sido neutralizados y desbloquea la meta con aviso.
   */
  checkAllEnemiesDefeated() {
    this.updateVictoryGoalStatus();
    const remaining = this.getRemainingEnemiesCount();
    if (remaining === 0 && !this.victoryGoalUnlockedAnnounced) {
      this.victoryGoalUnlockedAnnounced = true;
      if (this.victoryGoal) {
        this.victoryGoal.clearTint();
        this.showFloatingNotice(
          this.victoryGoal.x,
          this.victoryGoal.y - 45,
          '🔓 ¡SECTOR DESPEJADO!\nMeta desbloqueada',
          '#10b981'
        );
      }
    }
  }

  /**
   * Maneja la llegada a la Meta de Victoria del sector.
   * Requiere neutralizar a todos los enemigos del sector para desbloquear el avance.
   */
  handleVictoryGoal() {
    if (this.isVictory || this.isGameOver) return;

    // Verificar si aún quedan enemigos vivos en el sector
    const remaining = this.getRemainingEnemiesCount();
    if (remaining > 0) {
      const now = Date.now();
      if (!this.lastGoalNoticeTime || (now - this.lastGoalNoticeTime > 1800)) {
        this.lastGoalNoticeTime = now;
        this.soundManager?.playHit();
        this.showFloatingNotice(
          this.player ? this.player.x : this.victoryGoal.x,
          this.player ? this.player.y - 50 : this.victoryGoal.y - 45,
          `⛔ ¡SECTOR BLOQUEADO!\nDebes neutralizar a todos los enemigos (${remaining} restante${remaining > 1 ? 's' : ''})`,
          '#ef4444'
        );
      }
      // Empujar suavemente hacia atrás al jugador para impedir el paso
      if (this.player && this.player.body) {
        this.player.setVelocityX(-220);
      }
      return;
    }

    const total = this.combatTotalQuestions;
    const correct = this.combatCorrectAnswers;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;

    this.isVictory = true;
    if (this.soundManager) {
      this.soundManager.playCorrect();
    }

    if (this.player) this.player.freeze();
    if (this.challengeModal && this.challengeModal.isOpen) {
      this.challengeModal.close();
    }
    if (this.battleArena && this.battleArena.isOpen) {
      this.battleArena.close();
    }

    // Destello triunfal
    this.cameras.main.flash(600, 56, 189, 248);

    const { width, height } = this.scale;
    const baseDepth = 3000;

    const overlay = this.add.rectangle(0, 0, width, height, 0x05070f, 0.92)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(baseDepth)
      .setInteractive();

    const boxW = 560;
    const boxH = 340;
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2;

    const boxGfx = this.add.graphics().setScrollFactor(0).setDepth(baseDepth + 1);
    boxGfx.fillStyle(0x0f172a, 0.98);
    boxGfx.fillRoundedRect(boxX, boxY, boxW, boxH, 10);
    boxGfx.lineStyle(2, 0x10b981, 1);
    boxGfx.strokeRoundedRect(boxX, boxY, boxW, boxH, 10);

    this.add.text(width / 2, boxY + 36, '🏆 ¡SECTOR COGNITIVO SUPERADO CON ÉXITO!', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#10b981',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 2);

    this.add.text(
      width / 2,
      boxY + 76,
      `¡Has completado con maestría el Sector ${this.sectorNumber} en ${this.meta.name.toUpperCase()}!\nSuperaste los desafíos del sector con dominio táctico y cognitivo.`,
      {
        fontFamily: 'Segoe UI',
        fontSize: '12px',
        color: '#cbd5e1',
        align: 'center',
        wordWrap: { width: boxW - 50 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 2);

    this.add.text(
      width / 2,
      boxY + 130,
      `🎯 PRECISIÓN LOGRADA: ${accuracy}% [${correct}/${total}]  •  Vidas: ${this.lives}/${this.maxLives}`,
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#34d399',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 2);

    this.add.text(
      width / 2,
      boxY + 160,
      `MatBots neutralizados: ${this.enemiesDefeated}  •  Tramos atravesados: ${this.chunksCount}`,
      {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#38bdf8'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 2);

    // Botón: Siguiente Sector Procedural
    const nextBtn = this.add.text(width / 2 - 120, boxY + 240, 'SIGUIENTE SECTOR ➔', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#059669',
      padding: { x: 12, y: 10 }
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(baseDepth + 3)
    .setInteractive({ useHandCursor: true });

    nextBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(250, 10, 12, 22);
      this.time.delayedCall(270, () => {
        this.scene.restart({
          competencyId: sessionState.getActiveCompetency(),
          lives: this.lives,
          enemiesDefeated: this.enemiesDefeated,
          sectorNumber: this.sectorNumber + 1
        });
      });
    });

    // Botón: Cambiar Ruta
    const changeRouteBtn = this.add.text(width / 2 + 120, boxY + 240, 'CAMBIAR RUTA [M]', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#2563eb',
      padding: { x: 12, y: 10 }
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(baseDepth + 3)
    .setInteractive({ useHandCursor: true });

    changeRouteBtn.on('pointerdown', () => {
      this.goToCompetencySelector();
    });
  }

  handleTerminalInteraction(terminalType = 'standard') {
    if (terminalType === 'theory_hints' || terminalType === 'advanced_theory') {
      if (this.theoryModal && !this.theoryModal.isOpen) {
        this.theoryModal.open();
      }
      return;
    }

    if (this.challengeModal && !this.challengeModal.isOpen) {
      if (terminalType === 'transfer_retention') {
        this.challengeModal.open({ forceTransfer: true });
      } else {
        this.challengeModal.open();
      }
    }
  }

  goToCompetencySelector() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    if (this.challengeModal && this.challengeModal.isOpen) {
      this.challengeModal.close();
    }
    if (this.theoryModal && this.theoryModal.isOpen) {
      this.theoryModal.close();
    }
    if (this.battleArena && this.battleArena.isOpen) {
      this.battleArena.close();
    }

    this.cameras.main.fadeOut(200, 10, 12, 22);
    this.time.delayedCall(220, () => {
      this.scene.start('SelectCompetencyScene');
    });
  }

  openDashboard() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    if (this.challengeModal && this.challengeModal.isOpen) {
      this.challengeModal.close();
    }
    if (this.theoryModal && this.theoryModal.isOpen) {
      this.theoryModal.close();
    }
    if (this.battleArena && this.battleArena.isOpen) {
      this.battleArena.close();
    }

    this.cameras.main.fadeOut(200, 10, 12, 22);
    this.time.delayedCall(220, () => {
      this.scene.start('DashboardScene', {
        fromScene: 'WorldScene',
        competencyId: sessionState.getActiveCompetency()
      });
    });
  }

  update(time, delta) {
    if (this.isGameOver || this.isVictory) return;

    // Actualizar scroll de fondo infinito en parallax continuo con escala calibrada
    if (this.bgTile) {
      const scaleRatio = this.bgScaleRatio || 1;
      this.bgTile.tilePositionX = (this.cameras.main.scrollX * 0.35) / scaleRatio;
    }

    if (this.battleArena && this.battleArena.isOpen) {
      // En combate táctico, el jugador mantiene sus animaciones (ataque / reposo) sin congelarse
      if (this.player) {
        this.player.updateCombat(time, delta);
      }
      return;
    }

    if (
      (this.challengeModal && this.challengeModal.isOpen) ||
      (this.theoryModal && this.theoryModal.isOpen)
    ) {
      return;
    }

    if (this.player) {
      this.player.update(time, delta);

      // Verificación de checkpoints y caída a abismos letales (vacíos estilo Mario 3)
      if (this.player.body) {
        if (this.player.body.touching.down && this.player.y < 440) {
          this.lastSafeX = this.player.x;
        }
        if (this.player.y > this.worldHeight + 25) {
          this.handleFallIntoAbyss();
        }
      }
    }

    // Vibración sutil de estado crítico cuando quedan 2 vidas o menos
    if (this.lives <= 2 && !this.isGameOver) {
      this.heartbeatTimer = (this.heartbeatTimer || 0) + delta;
      if (this.heartbeatTimer > 2500) {
        this.heartbeatTimer = 0;
        this.cameras.main.shake(160, 0.005);
      }
    }

    // Actualizar Inteligencia Artificial de los MatBots y Synapse Crawlers
    if (this.matbots && this.matbots.length > 0) {
      this.matbots.forEach(bot => {
        if (bot && bot.active) {
          bot.updateAI(time, delta, this.player);
        }
      });
    }

    // Actualizar Enemigos Voladores (OwlBot y AjoloteBot)
    if (this.flyingBots && this.flyingBots.length > 0) {
      this.flyingBots.forEach(fbot => {
        if (fbot && fbot.active) {
          fbot.update(time, delta);
        }
      });
    }

    // Actualizar Jefe de Módulo (BosMat)
    if (this.boss && this.boss.active) {
      this.boss.update(time, delta);
    }

    if (this.virtualControls) {
      this.virtualControls.update();
    }

    // Verificar proximidad a terminales
    let nearTerminal = false;
    let activeTerminal = null;

    if (this.terminals) {
      this.terminals.getChildren().forEach(terminal => {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, terminal.x, terminal.y);
        if (dist < 75) {
          nearTerminal = true;
          activeTerminal = terminal;
        }
      });
    }

    if (this.virtualControls) {
      this.virtualControls.setNearTerminal(nearTerminal, activeTerminal?.getData('type'));
    }

    if (nearTerminal && activeTerminal) {
      const type = activeTerminal.getData('type');
      const isTheory = (type === 'theory_hints' || type === 'advanced_theory');
      const isAdvanced = (type === 'transfer_retention');

      if (isTheory) {
        this.interactionPrompt.setText('[E] Consola Teórica: Pistas y Fórmulas');
        this.interactionPrompt.setColor('#38bdf8');
      } else if (isAdvanced) {
        this.interactionPrompt.setText('[E] Terminal de Transferencia y Retención');
        this.interactionPrompt.setColor('#c084fc');
      } else {
        this.interactionPrompt.setText('[E] Terminal de Diagnóstico y Práctica');
        this.interactionPrompt.setColor(this.meta.primaryColorHex);
      }

      this.interactionPrompt.setPosition(activeTerminal.x, activeTerminal.y - 50);
      this.interactionPrompt.setVisible(true);

      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.handleTerminalInteraction(type);
      }
    } else {
      this.interactionPrompt.setVisible(false);
    }
  }

  /**
   * Pre-carga un lote de desafíos con Gemini / repositorio local
   * y los asigna individualmente a cada MatBot vivo en el mundo.
   */
  async preloadAndAssignEnemyChallenges() {
    if (!this.matbots || this.matbots.length === 0) return;
    const aliveBots = this.matbots.filter(b => b && b.isAlive && b.active);
    if (aliveBots.length === 0) return;

    const compId = sessionState.getActiveCompetency();
    const meta = sessionState.getActiveCompetencyMeta();
    const currentLevel = educationEngine.getCurrentLevel(compId);
    const metrics = educationEngine.getLearningMetrics(compId);
    const recentHistory = adaptiveEngine.getRecentHistory(compId);
    const times = recentHistory.filter(h => h.timeSeconds && h.timeSeconds > 0);
    const avgResponseTime = times.length > 0
      ? Math.round(times.reduce((acc, h) => acc + h.timeSeconds, 0) / times.length)
      : 12;

    const playerParams = {
      competencyId: compId,
      competencyName: meta?.name || compId,
      currentLevel,
      accuracy: metrics?.performance?.accuracy || 0,
      avgResponseTime,
      recentSkills: meta?.skills || [],
      previousStatements: educationEngine.challengeHistory || [],
      usedChallengeIds: educationEngine.challengeHistory || []
    };

    try {
      const challenges = await tutorService.preloadEnemyChallenges(playerParams, aliveBots.length);
      const assignedInRoom = new Set([
        ...(educationEngine.challengeHistory || [])
      ]);

      aliveBots.forEach((bot, index) => {
        if (!bot || typeof bot.setChallenge !== 'function') return;

        // MatBot[0], MatBot[1], etc., reciben cada uno un índice diferente del lote generado (challenges[index])
        let candidate = (Array.isArray(challenges) && challenges[index] && !assignedInRoom.has(challenges[index].id) && !assignedInRoom.has(challenges[index].statement))
          ? challenges[index]
          : null;

        // Si no está disponible en ese índice, buscar otro desafío no asignado en el lote
        if (!candidate && Array.isArray(challenges)) {
          candidate = challenges.find(c => c && !assignedInRoom.has(c.id) && !assignedInRoom.has(c.statement));
        }

        // Si se agotó el lote, extraer del respaldo local barajado excluyendo los ya asignados
        if (!candidate) {
          candidate = ChallengeRepository.getRandomChallenge(compId, currentLevel, assignedInRoom);
        }

        if (candidate) {
          assignedInRoom.add(candidate.id);
          assignedInRoom.add(candidate.statement);
          bot.setChallenge(candidate);
        }
      });
    } catch (err) {
      console.warn('[WorldScene] Error precargando desafíos para enemigos:', err);
    }
  }

  /**
   * Recalibra en segundo plano los desafíos de los MatBots vivos restantes
   * cuando el jugador sube de nivel por rapidez/precisión.
   * @param {number} newLevel
   */
  async recalibrateRemainingEnemies(newLevel) {
    if (!this.matbots || this.matbots.length === 0) return;
    const aliveBots = this.matbots.filter(b => b && b.isAlive && b.active);
    if (aliveBots.length === 0) return;

    const compId = sessionState.getActiveCompetency();
    const meta = sessionState.getActiveCompetencyMeta();
    const metrics = educationEngine.getLearningMetrics(compId);
    const recentHistory = adaptiveEngine.getRecentHistory(compId);
    const times = recentHistory.filter(h => h.timeSeconds && h.timeSeconds > 0);
    const avgResponseTime = times.length > 0
      ? Math.round(times.reduce((acc, h) => acc + h.timeSeconds, 0) / times.length)
      : 10;

    const playerParams = {
      competencyId: compId,
      competencyName: meta?.name || compId,
      currentLevel: newLevel,
      accuracy: metrics?.performance?.accuracy || 0,
      avgResponseTime,
      recentSkills: meta?.skills || [],
      previousStatements: educationEngine.challengeHistory || [],
      usedChallengeIds: educationEngine.challengeHistory || []
    };

    try {
      const challenges = await tutorService.preloadEnemyChallenges(playerParams, aliveBots.length);
      const assignedInRoom = new Set([
        ...(educationEngine.challengeHistory || [])
      ]);

      aliveBots.forEach((bot, index) => {
        if (!bot || typeof bot.setChallenge !== 'function') return;

        let candidate = (Array.isArray(challenges) && challenges[index] && !assignedInRoom.has(challenges[index].id) && !assignedInRoom.has(challenges[index].statement))
          ? challenges[index]
          : null;

        if (!candidate && Array.isArray(challenges)) {
          candidate = challenges.find(c => c && !assignedInRoom.has(c.id) && !assignedInRoom.has(c.statement));
        }

        if (!candidate) {
          candidate = ChallengeRepository.getRandomChallenge(compId, newLevel, assignedInRoom);
        }

        if (candidate) {
          assignedInRoom.add(candidate.id);
          assignedInRoom.add(candidate.statement);
          bot.setChallenge(candidate);
        }
      });
    } catch (err) {
      console.warn('[WorldScene] Error al recalibrar desafíos de MatBots restantes:', err);
    }
  }

  /**
   * Refresca los desafíos de los MatBots vivos para garantizar que ninguno
   * conserve una pregunta que ya fue respondida en el historial o duplicada en la sala.
   */
  refreshRemainingEnemyChallenges() {
    if (!this.matbots || this.matbots.length === 0) return;
    const aliveBots = this.matbots.filter(b => b && b.isAlive && b.active);
    if (aliveBots.length === 0) return;

    const compId = sessionState.getActiveCompetency();
    const currentLevel = educationEngine.getCurrentLevel(compId);
    const assignedInRoom = new Set([
      ...(educationEngine.challengeHistory || [])
    ]);

    aliveBots.forEach((bot, index) => {
      if (!bot || typeof bot.getChallenge !== 'function') return;
      const ch = bot.getChallenge();
      if (ch && ch.difficulty === currentLevel && !assignedInRoom.has(ch.id) && !assignedInRoom.has(ch.statement)) {
        assignedInRoom.add(ch.id);
        assignedInRoom.add(ch.statement);
        return;
      }

      const fresh = ChallengeRepository.getRandomChallenge(compId, currentLevel, assignedInRoom);
      if (fresh) {
        assignedInRoom.add(fresh.id);
        assignedInRoom.add(fresh.statement);
        bot.setChallenge(fresh);
      }
    });
  }
}
