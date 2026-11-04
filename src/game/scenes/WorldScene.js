import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { sessionState, COMPETENCY_METADATA } from '../../core/sessionState.js';

/**
 * Escena del Mundo Interactivo y Plataformas 2D de NEUROQUEST.
 * Se adapta dinámicamente al mundo seleccionado:
 * L  -> Mundo 01: Núcleo de Lógica (Pensamiento Lógico y Matemático)
 * CM -> Mundo 02: Circuitos Mentales (Pensamiento Computacional)
 * AC -> Mundo 03: Archivo del Conocimiento (Comprensión Lectora)
 * E  -> Mundo 04: Dimensión Estratégica (Resolución Multidisciplinaria)
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
    console.log(`[WorldScene] Inicializada para ${this.meta.name} [${this.meta.code}]`);
  }

  create() {
    const worldWidth = 2400;
    const worldHeight = 540;

    // 1. Configurar límites físicos del mundo
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 2. Fondo ambiental de ciencia ficción adaptado al color temático de la ruta
    this.createAtmosphere(worldWidth, worldHeight);

    // 3. Crear plataformas estáticas y suelo
    this.createWorldGeometry(worldWidth, worldHeight);

    // 4. Instanciar jugador con su spritesheet
    this.player = new Player(this, 120, worldHeight - 120);

    // 5. Configurar colisiones físicas
    this.physics.add.collider(this.player, this.platforms);

    // 6. Colocar terminales y puntos de interés interactivos
    this.createInteractiveTerminals(worldHeight);

    // 7. Configurar cámara dinámica con seguimiento suave
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.fadeIn(400, 10, 12, 22);

    // 8. Crear interfaz de usuario (HUD) superpuesta
    this.createHUD();

    // 9. Atajo de teclado para cambiar de ruta [M]
    this.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
  }

  createAtmosphere(worldWidth, worldHeight) {
    // Fondo de gradiente oscuro
    const bgGfx = this.add.graphics();
    bgGfx.fillStyle(0x070912, 1);
    bgGfx.fillRect(0, 0, worldWidth, worldHeight);

    // Columnas de energía temáticas del mundo activo
    for (let x = 80; x < worldWidth; x += 320) {
      bgGfx.fillStyle(0x131929, 0.45);
      bgGfx.fillRect(x, 0, 48, worldHeight);
      bgGfx.fillStyle(this.meta.primaryColor, 0.22);
      bgGfx.fillRect(x + 20, 0, 8, worldHeight);
    }

    // Partículas ambientales tintadas con el color de la competencia
    for (let i = 0; i < 110; i++) {
      const px = Phaser.Math.Between(0, worldWidth);
      const py = Phaser.Math.Between(0, worldHeight);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.7);

      const dot = this.add.rectangle(px, py, size, size, this.meta.primaryColor, alpha);
      this.tweens.add({
        targets: dot,
        y: py - Phaser.Math.Between(10, 30),
        alpha: alpha * 0.25,
        duration: Phaser.Math.Between(2000, 4500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  createWorldGeometry(worldWidth, worldHeight) {
    this.platforms = this.physics.add.staticGroup();

    // Suelo sólido continuo de baldosas
    const groundY = worldHeight - 32;
    for (let x = 0; x < worldWidth; x += 32) {
      const tile = this.platforms.create(x + 16, groundY + 16, 'tile_ground');
      tile.refreshBody();
    }

    // Plataformas flotantes en distintos niveles para evaluar salto y físicas
    const platformData = [
      { x: 340, y: 390, length: 5 },
      { x: 560, y: 310, length: 4 },
      { x: 750, y: 230, length: 6 },
      { x: 1020, y: 320, length: 4 },
      { x: 1250, y: 400, length: 7 },
      { x: 1520, y: 310, length: 5 },
      { x: 1740, y: 220, length: 6 },
      { x: 2020, y: 320, length: 5 }
    ];

    platformData.forEach(p => {
      for (let i = 0; i < p.length; i++) {
        const px = p.x + (i * 32) + 16;
        const tile = this.platforms.create(px, p.y + 16, 'tile_platform');
        tile.refreshBody();
      }
    });
  }

  createInteractiveTerminals(worldHeight) {
    this.terminals = this.physics.add.staticGroup();

    // Terminal educativa 1: Consola de Diagnóstico e Información
    const t1 = this.terminals.create(900, worldHeight - 32 - 32, 'terminal_device');
    t1.refreshBody();

    // Terminal educativa 2: Plataforma de Desafíos
    const t2 = this.terminals.create(1840, 220 - 32, 'terminal_device');
    t2.refreshBody();

    // Efecto de pulso de luz holográfico
    [t1, t2].forEach(terminal => {
      this.tweens.add({
        targets: terminal,
        alpha: 0.82,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // Texto flotante de interacción
    this.interactionPrompt = this.add.text(0, 0, '[E] Acceder a Terminal', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: this.meta.primaryColorHex,
      backgroundColor: 'rgba(10, 12, 22, 0.9)',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setVisible(false);

    // Mensaje de diálogo contextual
    this.dialogBox = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#f8fafc',
      backgroundColor: 'rgba(15, 23, 42, 0.96)',
      padding: { x: 14, y: 10 },
      stroke: this.meta.primaryColorHex,
      strokeThickness: 1,
      align: 'center'
    }).setOrigin(0.5).setVisible(false);

    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  createHUD() {
    const hudContainer = this.add.container(0, 0);
    hudContainer.setScrollFactor(0);

    // Barra superior izquierda: Identidad de la competencia activa
    const topBar = this.add.graphics();
    topBar.fillStyle(0x0f172a, 0.92);
    topBar.fillRoundedRect(16, 14, 460, 48, 6);
    topBar.lineStyle(2, this.meta.primaryColor, 0.85);
    topBar.strokeRoundedRect(16, 14, 460, 48, 6);

    // Badge con el código (L, CM, AC, E)
    const badge = this.add.graphics();
    badge.fillStyle(this.meta.badgeBg, 1);
    badge.fillRoundedRect(24, 20, 36, 36, 6);
    badge.lineStyle(1, this.meta.primaryColor, 1);
    badge.strokeRoundedRect(24, 20, 36, 36, 6);

    const badgeLabel = this.add.text(42, 38, this.meta.code, {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Textos de ruta activa
    const worldNameText = this.add.text(68, 20, `MUNDO ${this.meta.worldNumber}: ${this.meta.name.toUpperCase()}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: this.meta.primaryColorHex,
      fontStyle: 'bold'
    });

    const disciplineText = this.add.text(68, 38, `${this.meta.discipline} • Nivel 1`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#94a3b8'
    });

    // Botón superior derecho: "CAMBIAR RUTA [M]"
    const changeBtnContainer = this.add.container(this.scale.width - 120, 38);
    const changeBtnBg = this.add.graphics();
    changeBtnBg.fillStyle(0x1e293b, 0.9);
    changeBtnBg.fillRoundedRect(-90, -18, 180, 36, 6);
    changeBtnBg.lineStyle(1, 0x64748b, 0.8);
    changeBtnBg.strokeRoundedRect(-90, -18, 180, 36, 6);

    const changeBtnText = this.add.text(0, 0, 'CAMBIAR RUTA [M]', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#e2e8f0',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    changeBtnContainer.add([changeBtnBg, changeBtnText]);
    changeBtnContainer.setSize(180, 36);
    changeBtnContainer.setInteractive(
      new Phaser.Geom.Rectangle(-90, -18, 180, 36),
      Phaser.Geom.Rectangle.Contains
    );

    changeBtnContainer.on('pointerover', () => {
      changeBtnBg.lineStyle(2, this.meta.primaryColor, 1);
      changeBtnBg.strokeRoundedRect(-90, -18, 180, 36, 6);
      changeBtnContainer.setScale(1.04);
    });

    changeBtnContainer.on('pointerout', () => {
      changeBtnBg.lineStyle(1, 0x64748b, 0.8);
      changeBtnBg.strokeRoundedRect(-90, -18, 180, 36, 6);
      changeBtnContainer.setScale(1.0);
    });

    changeBtnContainer.on('pointerdown', () => {
      this.goToCompetencySelector();
    });

    // Panel de controles inferior
    const bottomControls = this.add.text(
      this.scale.width / 2,
      this.scale.height - 18,
      'Controles: [A/D] Correr • [W/Espacio] Saltar • [J] Acción • [E] Terminal • [M] Cambiar Ruta',
      {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#cbd5e1',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        padding: { x: 10, y: 3 }
      }
    ).setOrigin(0.5).setScrollFactor(0);

    hudContainer.add([
      topBar,
      badge,
      badgeLabel,
      worldNameText,
      disciplineText,
      changeBtnContainer,
      bottomControls
    ]);
  }

  goToCompetencySelector() {
    this.cameras.main.fadeOut(350, 10, 12, 22);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('SelectCompetencyScene');
    });
  }

  update(time, delta) {
    if (this.player) {
      this.player.update(time, delta);
    }

    // Tecla M para abrir selector de competencias en cualquier momento
    if (Phaser.Input.Keyboard.JustDown(this.keyM)) {
      this.goToCompetencySelector();
      return;
    }

    // Verificar proximidad a terminales interactivas
    let nearTerminal = false;
    let activeTerminal = null;

    this.terminals.getChildren().forEach(terminal => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, terminal.x, terminal.y);
      if (dist < 70) {
        nearTerminal = true;
        activeTerminal = terminal;
      }
    });

    if (nearTerminal && activeTerminal) {
      this.interactionPrompt.setPosition(activeTerminal.x, activeTerminal.y - 50);
      this.interactionPrompt.setVisible(true);

      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.dialogBox.setPosition(activeTerminal.x, activeTerminal.y - 95);
        this.dialogBox.setText(
          `Terminal: [${this.meta.code}] ${this.meta.name}\n${this.meta.tagline}\nPresiona [M] para alternar ruta o [E] para cerrar.`
        );
        this.dialogBox.setVisible(true);

        this.time.delayedCall(4500, () => {
          this.dialogBox.setVisible(false);
        });
      }
    } else {
      this.interactionPrompt.setVisible(false);
    }
  }
}
