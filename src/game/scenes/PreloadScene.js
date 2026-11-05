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

    // Cargar spritesheet oficial del jugador con clave independiente 'player_texture'
    this.load.spritesheet('player_texture', '/assets/sprites/player_sheet.png', {
      frameWidth: 200,
      frameHeight: 330
    });
    this.load.spritesheet('player', '/assets/sprites/player_sheet.png', {
      frameWidth: 200,
      frameHeight: 330
    });

    // Cargar icono oficial de la cabeza del jugador para el HUD de vidas
    this.load.image('player_head', '/assets/sprites/player_head.png');

    // Cargar spritesheet oficial de MatBot con clave independiente 'matbot_texture' (240x240 px calibrado)
    this.load.spritesheet('matbot_texture', '/assets/sprites/matbot_sheet.png', {
      frameWidth: 240,
      frameHeight: 240
    });
    this.load.spritesheet('matbot', '/assets/sprites/matbot_sheet.png', {
      frameWidth: 240,
      frameHeight: 240
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
    // 1. Textura para botón pixel art interactivo
    if (!this.textures.exists('btn_primary')) {
      const btnGfx = this.make.graphics({ x: 0, y: 0, add: false });
      btnGfx.fillStyle(0x2563eb, 1);
      btnGfx.fillRoundedRect(0, 0, 200, 48, 8);
      btnGfx.lineStyle(2, 0x60a5fa, 1);
      btnGfx.strokeRoundedRect(0, 0, 200, 48, 8);
      btnGfx.generateTexture('btn_primary', 200, 48);
      btnGfx.destroy();
    }

    // 2. Textura de baldosa de plataforma pixel art (32x32)
    if (!this.textures.exists('tile_platform')) {
      const tileGfx = this.make.graphics({ x: 0, y: 0, add: false });
      tileGfx.fillStyle(0x1e293b, 1);
      tileGfx.fillRect(0, 0, 32, 32);
      tileGfx.fillStyle(0x38bdf8, 1);
      tileGfx.fillRect(0, 0, 32, 3);
      tileGfx.fillStyle(0x0f172a, 1);
      tileGfx.fillRect(0, 29, 32, 3);
      tileGfx.fillRect(0, 3, 3, 26);
      tileGfx.fillRect(29, 3, 3, 26);
      tileGfx.fillStyle(0x334155, 1);
      tileGfx.fillRect(4, 4, 24, 24);
      tileGfx.fillStyle(0x0284c7, 0.6);
      tileGfx.fillRect(10, 10, 12, 12);
      tileGfx.generateTexture('tile_platform', 32, 32);
      tileGfx.destroy();
    }

    // 3. Textura para suelo principal de la estación
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

    // 4. Textura de Terminal Educativa Interactiva (48x64)
    if (!this.textures.exists('terminal_device')) {
      const tGfx = this.make.graphics({ x: 0, y: 0, add: false });
      tGfx.fillStyle(0x0f172a, 1);
      tGfx.fillRect(12, 28, 24, 36);
      tGfx.fillStyle(0x334155, 1);
      tGfx.fillRect(16, 32, 16, 28);
      tGfx.fillRoundedRect(4, 4, 40, 28, 4);
      tGfx.lineStyle(2, 0x38bdf8, 1);
      tGfx.strokeRoundedRect(4, 4, 40, 28, 4);
      tGfx.fillStyle(0x0284c7, 0.9);
      tGfx.fillRect(8, 8, 32, 20);
      tGfx.fillStyle(0x38bdf8, 1);
      tGfx.fillRect(12, 12, 16, 2);
      tGfx.fillRect(12, 16, 22, 2);
      tGfx.fillRect(12, 20, 10, 2);
      tGfx.generateTexture('terminal_device', 48, 64);
      tGfx.destroy();
    }

    // 5. Ítem de Recuperación de Vida: Cápsula Nanobótica de Reparación (32x32)
    if (!this.textures.exists('item_health')) {
      const hGfx = this.make.graphics({ x: 0, y: 0, add: false });
      // Halo externo
      hGfx.fillStyle(0x0f172a, 0.88);
      hGfx.fillCircle(16, 16, 15);
      hGfx.lineStyle(2, 0xef4444, 1);
      hGfx.strokeCircle(16, 16, 15);
      // Cruz de reparación en rubí brillante
      hGfx.fillStyle(0xef4444, 1);
      hGfx.fillRect(13, 7, 6, 18);
      hGfx.fillRect(7, 13, 18, 6);
      // Núcleo de energía nanobótica esmeralda
      hGfx.fillStyle(0x10b981, 1);
      hGfx.fillRect(14, 14, 4, 4);
      hGfx.generateTexture('item_health', 32, 32);
      hGfx.destroy();
    }

    // 6. Meta / Bandera de Victoria del Sector (48x80)
    if (!this.textures.exists('victory_flag')) {
      const vGfx = this.make.graphics({ x: 0, y: 0, add: false });
      // Base metálica
      vGfx.fillStyle(0x0f172a, 1);
      vGfx.fillRect(8, 70, 32, 10);
      vGfx.fillStyle(0x38bdf8, 1);
      vGfx.fillRect(12, 68, 24, 3);
      // Mástil de energía
      vGfx.fillStyle(0x475569, 1);
      vGfx.fillRect(14, 8, 6, 62);
      vGfx.fillStyle(0x38bdf8, 1);
      vGfx.fillRect(16, 8, 2, 62);
      // Estandarte holográfico
      vGfx.fillStyle(0x0284c7, 0.95);
      vGfx.fillRect(20, 10, 26, 34);
      vGfx.lineStyle(2, 0x38bdf8, 1);
      vGfx.strokeRect(20, 10, 26, 34);
      // Estrella / Emblema interior
      vGfx.fillStyle(0xfbbf24, 1);
      vGfx.fillRect(30, 20, 6, 14);
      vGfx.fillRect(26, 24, 14, 6);
      // Faro radiante superior
      vGfx.fillStyle(0x38bdf8, 1);
      vGfx.fillCircle(17, 7, 7);
      vGfx.fillStyle(0xffffff, 1);
      vGfx.fillCircle(17, 7, 3);
      vGfx.generateTexture('victory_flag', 48, 80);
      vGfx.destroy();
    }
  }

  create() {
    this.createPlayerAnimations();
    this.createEnemyAnimations();
    console.log('[PreloadScene] Recursos y animaciones listos.');
    this.scene.start('WelcomeScene');
  }

  createPlayerAnimations() {
    const pTex = this.textures.exists('player_texture') ? 'player_texture' : 'player';

    // 1. Idle (perfil en espera)
    if (!this.anims.exists('player_idle')) {
      this.anims.create({
        key: 'player_idle',
        frames: [{ key: pTex, frame: 1 }],
        frameRate: 1
      });
    }

    // 2. Caminar (ciclo completo de 8 frames a velocidad estándar)
    if (!this.anims.exists('player_walk')) {
      this.anims.create({
        key: 'player_walk',
        frames: this.anims.generateFrameNumbers(pTex, { start: 2, end: 9 }),
        frameRate: 11,
        repeat: -1
      });
    }

    // 2b. Correr / Sprint (ciclo completo acelerado a 18 FPS)
    if (!this.anims.exists('player_run')) {
      this.anims.create({
        key: 'player_run',
        frames: this.anims.generateFrameNumbers(pTex, { start: 2, end: 9 }),
        frameRate: 18,
        repeat: -1
      });
    }

    // 3. Salto hacia arriba (impulso / despegue)
    if (!this.anims.exists('player_jump')) {
      this.anims.create({
        key: 'player_jump',
        frames: [{ key: pTex, frame: 11 }],
        frameRate: 1
      });
    }

    // 4. Salto ápice (manos arriba)
    if (!this.anims.exists('player_jump_peak')) {
      this.anims.create({
        key: 'player_jump_peak',
        frames: [{ key: pTex, frame: 13 }],
        frameRate: 1
      });
    }

    // 5. Caída en gravedad
    if (!this.anims.exists('player_fall')) {
      this.anims.create({
        key: 'player_fall',
        frames: [{ key: pTex, frame: 14 }],
        frameRate: 1
      });
    }

    // 6. Aterrizaje / amortiguación
    if (!this.anims.exists('player_land')) {
      this.anims.create({
        key: 'player_land',
        frames: [{ key: pTex, frame: 15 }],
        frameRate: 1
      });
    }

    // 6b. Agachado estático para esquivar obstáculos (Crouch Idle)
    if (!this.anims.exists('player_crouch')) {
      this.anims.create({
        key: 'player_crouch',
        frames: [{ key: pTex, frame: 15 }],
        frameRate: 1
      });
    }

    // 6c. Caminar agachado (Crouch Walk / Duck Walk)
    const crouchWalkFrames = [
      { key: pTex, frame: 15 },
      { key: pTex, frame: 10 },
      { key: pTex, frame: 15 },
      { key: pTex, frame: 14 }
    ];

    if (!this.anims.exists('player_crouch_walk')) {
      this.anims.create({
        key: 'player_crouch_walk',
        frames: crouchWalkFrames,
        frameRate: 8,
        repeat: -1
      });
    }

    if (!this.anims.exists('crouch_walk')) {
      this.anims.create({
        key: 'crouch_walk',
        frames: crouchWalkFrames,
        frameRate: 8,
        repeat: -1
      });
    }

    if (!this.anims.exists('duck_walk')) {
      this.anims.create({
        key: 'duck_walk',
        frames: crouchWalkFrames,
        frameRate: 8,
        repeat: -1
      });
    }

    // 7. Golpe / Ataque de acción (player_punch y player_attack)
    const attackFrames = [
      { key: pTex, frame: 18 },
      { key: pTex, frame: 19 },
      { key: pTex, frame: 20 },
      { key: pTex, frame: 21 },
      { key: pTex, frame: 22 }
    ];

    if (!this.anims.exists('player_punch')) {
      this.anims.create({
        key: 'player_punch',
        frames: attackFrames,
        frameRate: 15,
        repeat: 0
      });
    }

    if (!this.anims.exists('player_attack')) {
      this.anims.create({
        key: 'player_attack',
        frames: attackFrames,
        frameRate: 15,
        repeat: 0
      });
    }
  }

  createEnemyAnimations() {
    const mTex = this.textures.exists('matbot_texture') ? 'matbot_texture' : 'matbot';

    // 1. MatBot Idle (Frames 0, 1, 0, 4 - Postura lateral/perspectiva de guardia)
    if (!this.anims.exists('matbot_idle')) {
      this.anims.create({
        key: 'matbot_idle',
        frames: [
          { key: mTex, frame: 0 },
          { key: mTex, frame: 1 },
          { key: mTex, frame: 0 },
          { key: mTex, frame: 4 }
        ],
        frameRate: 4,
        repeat: -1
      });
    }

    // 2. MatBot Walk / Patrullaje fluido de 8 pasos (Frames 8 a 15 de la fila 1 - Ciclo oficial Enhanced Walk)
    if (!this.anims.exists('matbot_walk')) {
      this.anims.create({
        key: 'matbot_walk',
        frames: this.anims.generateFrameNumbers(mTex, { start: 8, end: 15 }),
        frameRate: 10,
        repeat: -1
      });
    }

    // 3. MatBot Attack (Frames 16 a 22 de la fila 2 - Despliegue, carga y disparo fractal)
    if (!this.anims.exists('matbot_attack')) {
      this.anims.create({
        key: 'matbot_attack',
        frames: this.anims.generateFrameNumbers(mTex, { start: 16, end: 22 }),
        frameRate: 10,
        repeat: 0
      });
    }

    // 4. MatBot Hurt / Impacto (Frame 24 de la fila 3)
    if (!this.anims.exists('matbot_hurt')) {
      this.anims.create({
        key: 'matbot_hurt',
        frames: [{ key: mTex, frame: 24 }],
        frameRate: 8,
        repeat: 0
      });
    }

    // 5. MatBot Die / Desintegración destructiva completa (Frames 24 a 30 de la fila 3)
    if (!this.anims.exists('matbot_die')) {
      this.anims.create({
        key: 'matbot_die',
        frames: this.anims.generateFrameNumbers(mTex, { start: 24, end: 30 }),
        frameRate: 9,
        repeat: 0
      });
    }
  }
}
