import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { sessionState } from '../../core/sessionState.js';
import { DeviceDetector } from '../../utils/deviceDetector.js';
import { VirtualControls } from '../../ui/components/VirtualControls.js';
import { ChallengeModal } from '../../ui/components/ChallengeModal.js';

/**
 * Escena del Mundo Interactivo y Plataformas 2D de NEUROQUEST.
 * Carga el fondo oficial y adapta mecánicas para las 4 rutas:
 * L  -> bg_logic_math (Núcleo de Lógica)
 * CM -> bg_computational (Circuitos Mentales)
 * AC -> bg_reading (Archivo del Conocimiento)
 * E  -> bg_strategic (Dimensión Estratégica)
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
    console.log(`[WorldScene] Inicializada para ${this.meta.name} [${this.meta.code}]`);
  }

  create() {
    const worldWidth = 2400;
    const worldHeight = 540;

    // 1. Configurar límites físicos del mundo
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 2. Fondo ambiental oficial de la competencia
    this.createAtmosphere(worldWidth, worldHeight);

    // 3. Crear suelo y plataformas colisionables alineadas con el fondo
    this.createWorldGeometry(worldWidth, worldHeight);

    // 4. Instanciar jugador con su spritesheet
    this.player = new Player(this, 140, 380);

    // 5. Configurar colisiones físicas
    this.physics.add.collider(this.player, this.platforms);

    // 6. Colocar terminales y puntos de interés interactivos
    this.createInteractiveTerminals();

    // 7. Configurar cámara dinámica con seguimiento suave
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.fadeIn(350, 10, 12, 22);

    // 8. Crear interfaz de usuario (HUD) superpuesta (objetos planos sin anidar)
    this.createHUD();

    // 9. Crear modal de desafíos educativos
    this.challengeModal = new ChallengeModal(this, this.player);

    // 10. Detección de dispositivo (Móvil vs. Computadora)
    this.isMobile = DeviceDetector.isMobile();
    if (this.isMobile) {
      DeviceDetector.requestLandscape();
      this.virtualControls = new VirtualControls(this, this.player);
    }

    // 11. Escuchar eventos de interacción y cambio de disciplina
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Tecla M para abrir selector de competencias
    this.input.keyboard.on('keydown-M', () => {
      this.goToCompetencySelector();
    });

    // Eventos disparados por controles táctiles o HUD
    this.events.on('touch-interact', () => {
      this.handleTerminalInteraction();
    });

    this.events.on('touch-switch-route', () => {
      this.goToCompetencySelector();
    });

    // Limpieza de eventos al cambiar de escena
    this.events.once('shutdown', () => {
      this.events.off('touch-interact');
      this.events.off('touch-switch-route');
      if (this.virtualControls) {
        this.virtualControls.destroy();
        this.virtualControls = null;
      }
    });
  }

  createAtmosphere(worldWidth, worldHeight) {
    // Renderizar fondo oficial pixel art si está cargado en caché
    if (this.textures.exists(this.meta.bgKey)) {
      const bg1 = this.add.image(0, 0, this.meta.bgKey).setOrigin(0, 0);
      bg1.setDisplaySize(1200, worldHeight);

      const bg2 = this.add.image(1200, 0, this.meta.bgKey).setOrigin(0, 0);
      bg2.setDisplaySize(1200, worldHeight);
    } else {
      const bgGfx = this.add.graphics();
      bgGfx.fillStyle(0x070912, 1);
      bgGfx.fillRect(0, 0, worldWidth, worldHeight);
    }

    // Partículas ambientales tintadas con el color de la competencia activa
    for (let i = 0; i < 90; i++) {
      const px = Phaser.Math.Between(0, worldWidth);
      const py = Phaser.Math.Between(0, worldHeight - 120);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.25, 0.75);

      const dot = this.add.rectangle(px, py, size, size, this.meta.primaryColor, alpha);
      this.tweens.add({
        targets: dot,
        y: py - Phaser.Math.Between(10, 25),
        alpha: alpha * 0.3,
        duration: Phaser.Math.Between(2200, 4800),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  createWorldGeometry(worldWidth, worldHeight) {
    this.platforms = this.physics.add.staticGroup();

    // Suelo sólido continuo alineado con el arte ilustrado (Y = 430 px)
    const groundY = 430;
    for (let x = 0; x < worldWidth; x += 32) {
      const tile = this.platforms.create(x + 16, groundY + 16, 'tile_ground');
      tile.setVisible(false);
      tile.refreshBody();
    }

    // Plataformas flotantes elevadas adicionales para exploración vertical
    const platformData = [
      { x: 380, y: 310, length: 4 },
      { x: 620, y: 230, length: 5 },
      { x: 1040, y: 300, length: 4 },
      { x: 1380, y: 320, length: 5 },
      { x: 1680, y: 220, length: 6 },
      { x: 2020, y: 310, length: 5 }
    ];

    platformData.forEach(p => {
      for (let i = 0; i < p.length; i++) {
        const px = p.x + (i * 32) + 16;
        const tile = this.platforms.create(px, p.y + 16, 'tile_platform');
        tile.refreshBody();
      }
    });
  }

  createInteractiveTerminals() {
    this.terminals = this.physics.add.staticGroup();

    // Terminal educativa 1: Entrada y Diagnóstico del Sector
    const t1 = this.terminals.create(890, 398, 'terminal_device');
    t1.refreshBody();

    // Terminal educativa 2: Plataforma de Misiones Avanzadas
    const t2 = this.terminals.create(1780, 188, 'terminal_device');
    t2.refreshBody();

    [t1, t2].forEach(terminal => {
      this.tweens.add({
        targets: terminal,
        alpha: 0.85,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // Texto flotante de interacción (en espacio de mundo sobre la terminal)
    this.interactionPrompt = this.add.text(0, 0, '[E] Acceder a Terminal', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: this.meta.primaryColorHex,
      backgroundColor: 'rgba(10, 12, 22, 0.92)',
      padding: { x: 8, y: 4 },
      stroke: this.meta.primaryColorHex,
      strokeThickness: 1
    }).setOrigin(0.5).setDepth(500).setVisible(false);

    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  createHUD() {
    const baseDepth = 1500;
    const { width, height } = this.scale;

    // 1. Barra superior izquierda de identidad
    const topBar = this.add.graphics().setScrollFactor(0).setDepth(baseDepth);
    topBar.fillStyle(0x0f172a, 0.92);
    topBar.fillRoundedRect(16, 14, 440, 48, 6);
    topBar.lineStyle(2, this.meta.primaryColor, 0.85);
    topBar.strokeRoundedRect(16, 14, 440, 48, 6);

    const badge = this.add.graphics().setScrollFactor(0).setDepth(baseDepth + 1);
    badge.fillStyle(this.meta.badgeBg, 1);
    badge.fillRoundedRect(24, 20, 36, 36, 6);
    badge.lineStyle(1, this.meta.primaryColor, 1);
    badge.strokeRoundedRect(24, 20, 36, 36, 6);

    this.add.text(42, 38, this.meta.code, {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 2);

    this.add.text(68, 20, `MUNDO ${this.meta.worldNumber}: ${this.meta.name.toUpperCase()}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: this.meta.primaryColorHex,
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(baseDepth + 2);

    this.add.text(68, 38, `${this.meta.discipline} • Nivel 1`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#94a3b8'
    }).setScrollFactor(0).setDepth(baseDepth + 2);

    // 2. Botón superior derecho "CAMBIAR RUTA [M]" (DIRECTO EN PANTALLA, NO ANIDADO)
    const btnX = width - 110;
    const btnY = 38;
    const btnW = 180;
    const btnH = 36;

    const changeBg = this.add.graphics().setScrollFactor(0).setDepth(baseDepth);
    const drawChangeBtn = (hover = false) => {
      changeBg.clear();
      changeBg.fillStyle(hover ? 0x2563eb : 0x1e293b, 0.95);
      changeBg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
      changeBg.lineStyle(hover ? 2 : 1, hover ? this.meta.primaryColor : 0x64748b, 1);
      changeBg.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
    };
    drawChangeBtn(false);

    this.add.text(btnX, btnY, 'CAMBIAR RUTA [M]', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 1);

    const changeHit = this.add.zone(btnX, btnY, btnW, btnH)
      .setScrollFactor(0)
      .setDepth(baseDepth + 3)
      .setInteractive({ useHandCursor: true });

    changeHit.on('pointerover', () => drawChangeBtn(true));
    changeHit.on('pointerout', () => drawChangeBtn(false));
    changeHit.on('pointerdown', () => this.goToCompetencySelector());

    // 3. Botón para alternar controles táctiles en pantalla
    const toggleTouchBtn = this.add.text(width - 240, 38, this.isMobile ? '📱 Táctil' : '🖥️ PC', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#38bdf8',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      padding: { x: 8, y: 6 }
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(baseDepth + 1)
    .setInteractive({ useHandCursor: true });

    toggleTouchBtn.on('pointerdown', () => {
      if (this.virtualControls) {
        this.virtualControls.destroy();
        this.virtualControls = null;
        toggleTouchBtn.setText('🖥️ PC');
      } else {
        this.virtualControls = new VirtualControls(this, this.player);
        toggleTouchBtn.setText('📱 Táctil');
      }
    });

    // 4. Panel de controles inferior
    this.add.text(
      width / 2,
      height - 18,
      'Controles: [A/D] Correr • [W/Espacio] Saltar • [J] Acción • [E] Terminal • [M] Cambiar Ruta',
      {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#cbd5e1',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        padding: { x: 10, y: 3 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth);
  }

  goToCompetencySelector() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    if (this.challengeModal && this.challengeModal.isOpen) {
      this.challengeModal.close();
    }

    console.log('[WorldScene] Cambiando a SelectCompetencyScene...');
    this.cameras.main.fadeOut(250, 10, 12, 22);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('SelectCompetencyScene');
    });
  }

  handleTerminalInteraction() {
    if (this.challengeModal && !this.challengeModal.isOpen) {
      this.challengeModal.open();
    }
  }

  update(time, delta) {
    // Si el modal está abierto, congelar jugador
    if (this.challengeModal && this.challengeModal.isOpen) {
      return;
    }

    if (this.player) {
      this.player.update(time, delta);
    }

    if (this.virtualControls) {
      this.virtualControls.update();
    }

    // Verificar proximidad a terminales interactivas
    let nearTerminal = false;
    let activeTerminal = null;

    this.terminals.getChildren().forEach(terminal => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, terminal.x, terminal.y);
      if (dist < 75) {
        nearTerminal = true;
        activeTerminal = terminal;
      }
    });

    if (nearTerminal && activeTerminal) {
      this.interactionPrompt.setPosition(activeTerminal.x, activeTerminal.y - 50);
      this.interactionPrompt.setVisible(true);

      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.handleTerminalInteraction();
      }
    } else {
      this.interactionPrompt.setVisible(false);
    }
  }
}
