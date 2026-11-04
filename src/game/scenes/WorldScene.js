import Phaser from 'phaser';
import { Player } from '../entities/Player.js';

/**
 * Escena del Mundo Interactivo y Plataformas 2D de NEUROQUEST.
 * Representa la instalación NEUROCORE con exploración, físicas y terminales interactivas.
 */
export class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
  }

  create() {
    const worldWidth = 2400;
    const worldHeight = 540;

    // 1. Configurar límites físicos del mundo
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 2. Fondo ambiental de ciencia ficción
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
    this.cameras.main.fadeIn(500, 10, 12, 22);

    // 8. Crear interfaz de usuario (HUD) superpuesta
    this.createHUD();
  }

  createAtmosphere(worldWidth, worldHeight) {
    // Fondo de gradiente oscuro
    const bgGfx = this.add.graphics();
    bgGfx.fillStyle(0x0a0c16, 1);
    bgGfx.fillRect(0, 0, worldWidth, worldHeight);

    // Columnas de energía de fondo (capa estética con scroll parallax)
    for (let x = 80; x < worldWidth; x += 320) {
      bgGfx.fillStyle(0x1e293b, 0.4);
      bgGfx.fillRect(x, 0, 48, worldHeight);
      bgGfx.fillStyle(0x38bdf8, 0.15);
      bgGfx.fillRect(x + 20, 0, 8, worldHeight);
    }

    // Partículas ambientales de polvo estelar / datos flotantes
    for (let i = 0; i < 120; i++) {
      const px = Phaser.Math.Between(0, worldWidth);
      const py = Phaser.Math.Between(0, worldHeight);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.7);

      const dot = this.add.rectangle(px, py, size, size, 0x38bdf8, alpha);
      // Animación suave de flotación
      this.tweens.add({
        targets: dot,
        y: py - Phaser.Math.Between(10, 30),
        alpha: alpha * 0.3,
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
      // Zona 1: Pruebas de salto inicial
      { x: 340, y: 390, length: 5 },
      { x: 560, y: 310, length: 4 },
      { x: 750, y: 230, length: 6 },
      { x: 1020, y: 320, length: 4 },

      // Zona 2: Plataformas intermedias de acceso a la terminal
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

    // Terminal educativa 1: Entrada NEUROCORE
    const t1 = this.terminals.create(900, worldHeight - 32 - 32, 'terminal_device');
    t1.refreshBody();

    // Terminal educativa 2: Plataforma elevada
    const t2 = this.terminals.create(1840, 220 - 32, 'terminal_device');
    t2.refreshBody();

    // Efecto de pulso de luz holográfico sobre las terminales
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

    // Texto flotante de interacción
    this.interactionPrompt = this.add.text(0, 0, '[E] Acceder a Consola', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#38bdf8',
      backgroundColor: 'rgba(10, 12, 22, 0.85)',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setVisible(false);

    // Mensaje de notificación al interactuar
    this.dialogBox = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#f8fafc',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      padding: { x: 12, y: 8 },
      stroke: '#38bdf8',
      strokeThickness: 1
    }).setOrigin(0.5).setVisible(false);

    // Tecla de interacción E
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  createHUD() {
    // Contenedor fijo de interfaz (scrollFactor = 0 para no desplazarse con la cámara)
    const hudContainer = this.add.container(0, 0);
    hudContainer.setScrollFactor(0);

    // Barra superior de estado
    const topBar = this.add.graphics();
    topBar.fillStyle(0x0f172a, 0.9);
    topBar.fillRect(16, 16, 420, 44);
    topBar.lineStyle(1, 0x38bdf8, 0.8);
    topBar.strokeRect(16, 16, 420, 44);

    // Retrato del avatar del jugador
    const avatar = this.add.image(42, 38, 'player', 22);
    avatar.setScale(0.24);

    // Información de sector y estado
    const sectorText = this.add.text(74, 22, 'NEUROCORE — SECTOR ALFA', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#38bdf8',
      fontStyle: 'bold'
    });

    const statusText = this.add.text(74, 40, 'Mundo 2D Activo • Físicas Arcade Calibradas', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#94a3b8'
    });

    // Panel de controles inferior
    const bottomControls = this.add.text(
      this.scale.width / 2,
      this.scale.height - 20,
      'Controles: [A/D] Correr • [W/Espacio] Saltar • [J] Acción • [E] Interactuar',
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#cbd5e1',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        padding: { x: 10, y: 4 }
      }
    ).setOrigin(0.5).setScrollFactor(0);

    hudContainer.add([topBar, avatar, sectorText, statusText, bottomControls]);
  }

  update(time, delta) {
    if (this.player) {
      this.player.update(time, delta);
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
        this.dialogBox.setPosition(activeTerminal.x, activeTerminal.y - 85);
        this.dialogBox.setText('Terminal NEUROCORE:\nListo para Incremento 3 (Selector de Competencias).');
        this.dialogBox.setVisible(true);

        this.time.delayedCall(3000, () => {
          this.dialogBox.setVisible(false);
        });
      }
    } else {
      this.interactionPrompt.setVisible(false);
    }
  }
}
