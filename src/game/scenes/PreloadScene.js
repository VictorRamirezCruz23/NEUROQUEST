import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.scale;

    // Fondo de carga
    const bgBar = this.add.graphics();
    bgBar.fillStyle(0x1a1e2e, 0.8);
    bgBar.fillRoundedRect(width / 2 - 160, height / 2 - 12, 320, 24, 6);

    const progressBar = this.add.graphics();

    const titleText = this.add.text(width / 2, height / 2 - 40, 'NEUROQUEST', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const loadingText = this.add.text(width / 2, height / 2 + 30, 'Cargando sistemas...', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x38bdf8, 1);
      progressBar.fillRoundedRect(width / 2 - 156, height / 2 - 8, 312 * value, 16, 4);
      loadingText.setText(`Cargando sistemas... ${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      bgBar.destroy();
      loadingText.destroy();
      titleText.destroy();
    });

    // Cargar spritesheet oficial del jugador procesado desde player.jpg
    this.load.spritesheet('player', '/assets/sprites/player_sheet.png', {
      frameWidth: 200,
      frameHeight: 330
    });

    // Cargar los 4 fondos de escenario pixel art oficiales
    this.load.image('bg_logic_math', '/assets/backgrounds/bg_logic_math.jpg');
    this.load.image('bg_computational', '/assets/backgrounds/bg_computational.jpg');
    this.load.image('bg_reading', '/assets/backgrounds/bg_reading.jpg');
    this.load.image('bg_strategic', '/assets/backgrounds/bg_strategic.jpg');

    // Generar texturas de respaldo procedurales para pixel art y mundo interactivo
    this.createProceduralAssets();
  }

  createProceduralAssets() {
    // Generar textura para botón pixel art interactivo
    if (!this.textures.exists('btn_primary')) {
      const btnGfx = this.make.graphics({ x: 0, y: 0, add: false });
      btnGfx.fillStyle(0x2563eb, 1);
      btnGfx.fillRoundedRect(0, 0, 200, 48, 8);
      btnGfx.lineStyle(2, 0x60a5fa, 1);
      btnGfx.strokeRoundedRect(0, 0, 200, 48, 8);
      btnGfx.generateTexture('btn_primary', 200, 48);
      btnGfx.destroy();
    }

    // Textura de baldosa de plataforma pixel art (32x32)
    if (!this.textures.exists('tile_platform')) {
      const tileGfx = this.make.graphics({ x: 0, y: 0, add: false });
      // Base metálica
      tileGfx.fillStyle(0x1e293b, 1);
      tileGfx.fillRect(0, 0, 32, 32);
      // Borde superior brillante de energía (Cian)
      tileGfx.fillStyle(0x38bdf8, 1);
      tileGfx.fillRect(0, 0, 32, 3);
      // Remaches y patrón de rejilla
      tileGfx.fillStyle(0x0f172a, 1);
      tileGfx.fillRect(0, 29, 32, 3);
      tileGfx.fillRect(0, 3, 3, 26);
      tileGfx.fillRect(29, 3, 3, 26);
      // Núcleo interno
      tileGfx.fillStyle(0x334155, 1);
      tileGfx.fillRect(4, 4, 24, 24);
      tileGfx.fillStyle(0x0284c7, 0.6);
      tileGfx.fillRect(10, 10, 12, 12);
      tileGfx.generateTexture('tile_platform', 32, 32);
      tileGfx.destroy();
    }

    // Textura para suelo principal de la estación
    if (!this.textures.exists('tile_ground')) {
      const gGfx = this.make.graphics({ x: 0, y: 0, add: false });
      gGfx.fillStyle(0x0f172a, 1);
      gGfx.fillRect(0, 0, 32, 32);
      gGfx.fillStyle(0x1e293b, 1);
      gGfx.fillRect(1, 1, 30, 30);
      gGfx.fillStyle(0x38bdf8, 0.4);
      gGfx.fillRect(0, 0, 32, 2);
      gGfx.generateTexture('tile_ground', 32, 32);
      gGfx.destroy();
    }

    // Textura de Terminal Educativa Interactiva (48x64)
    if (!this.textures.exists('terminal_device')) {
      const tGfx = this.make.graphics({ x: 0, y: 0, add: false });
      // Columna base
      tGfx.fillStyle(0x0f172a, 1);
      tGfx.fillRect(12, 28, 24, 36);
      tGfx.fillStyle(0x334155, 1);
      tGfx.fillRect(16, 32, 16, 28);
      // Monitor superior
      tGfx.fillStyle(0x1e293b, 1);
      tGfx.fillRoundedRect(4, 4, 40, 28, 4);
      tGfx.lineStyle(2, 0x38bdf8, 1);
      tGfx.strokeRoundedRect(4, 4, 40, 28, 4);
      // Pantalla activa holográfica
      tGfx.fillStyle(0x0284c7, 0.9);
      tGfx.fillRect(8, 8, 32, 20);
      // Líneas de código holográfico
      tGfx.fillStyle(0x38bdf8, 1);
      tGfx.fillRect(12, 12, 16, 2);
      tGfx.fillRect(12, 16, 22, 2);
      tGfx.fillRect(12, 20, 10, 2);
      tGfx.generateTexture('terminal_device', 48, 64);
      tGfx.destroy();
    }
  }

  create() {
    this.createPlayerAnimations();
    console.log('[PreloadScene] Recursos y animaciones listos.');
    this.scene.start('WelcomeScene');
  }

  createPlayerAnimations() {
    // 1. Idle (perfil en espera)
    if (!this.anims.exists('player_idle')) {
      this.anims.create({
        key: 'player_idle',
        frames: [{ key: 'player', frame: 1 }],
        frameRate: 1
      });
    }

    // 2. Caminar (ciclo completo de 8 frames)
    if (!this.anims.exists('player_walk')) {
      this.anims.create({
        key: 'player_walk',
        frames: this.anims.generateFrameNumbers('player', { start: 2, end: 9 }),
        frameRate: 11,
        repeat: -1
      });
    }

    // 3. Salto hacia arriba (impulso / despegue)
    if (!this.anims.exists('player_jump')) {
      this.anims.create({
        key: 'player_jump',
        frames: [{ key: 'player', frame: 11 }],
        frameRate: 1
      });
    }

    // 4. Salto ápice (manos arriba)
    if (!this.anims.exists('player_jump_peak')) {
      this.anims.create({
        key: 'player_jump_peak',
        frames: [{ key: 'player', frame: 13 }],
        frameRate: 1
      });
    }

    // 5. Caída en gravedad
    if (!this.anims.exists('player_fall')) {
      this.anims.create({
        key: 'player_fall',
        frames: [{ key: 'player', frame: 14 }],
        frameRate: 1
      });
    }

    // 6. Aterrizaje / amortiguación
    if (!this.anims.exists('player_land')) {
      this.anims.create({
        key: 'player_land',
        frames: [{ key: 'player', frame: 15 }],
        frameRate: 1
      });
    }

    // 7. Golpe / Interacción de acción (punch)
    if (!this.anims.exists('player_punch')) {
      this.anims.create({
        key: 'player_punch',
        frames: [
          { key: 'player', frame: 18 },
          { key: 'player', frame: 19 },
          { key: 'player', frame: 20 },
          { key: 'player', frame: 21 },
          { key: 'player', frame: 18 }
        ],
        frameRate: 14,
        repeat: 0
      });
    }
  }
}
