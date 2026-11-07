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

    // Cargar pistas musicales oficiales
    this.load.audio('music_menu', '/assets/audio/Menu.mp3');
    this.load.audio('music_game', '/assets/audio/game.mp3');

    // Cargar spritesheets oficiales transparentes y calibrados para pixel art (estándar 240x240 px)
    this.load.spritesheet('ajolotebot_texture', '/assets/sprites/ajolotebot_sheet.png', {
      frameWidth: 240,
      frameHeight: 240
    });
    this.load.spritesheet('owlbot_texture', '/assets/sprites/owlbot_sheet.png', {
      frameWidth: 240,
      frameHeight: 240
    });
    this.load.spritesheet('parasitebot_texture', '/assets/sprites/parasitebot_sheet.png', {
      frameWidth: 240,
      frameHeight: 240
    });
    this.load.spritesheet('bosmat_texture', '/assets/sprites/bosmat_sheet.png', {
      frameWidth: 240,
      frameHeight: 240
    });
    this.load.spritesheet('caatbot_texture', '/assets/sprites/caatbot_sheet.png', {
      frameWidth: 240,
      frameHeight: 240
    });
    this.load.spritesheet('warbot_texture', '/assets/sprites/warbot_sheet.png', {
      frameWidth: 240,
      frameHeight: 240
    });
    this.load.spritesheet('brainbot_texture', '/assets/sprites/brainbot_sheet.png', {
      frameWidth: 240,
      frameHeight: 240
    });
    this.load.spritesheet('neurobot_texture', '/assets/sprites/neurobot_sheet.png', {
      frameWidth: 240,
      frameHeight: 240
    });
    this.load.spritesheet('questbot_texture', '/assets/sprites/questbot_sheet.png', {
      frameWidth: 240,
      frameHeight: 240
    });

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

    // 7. Proyectil de Energía Azul del Jugador (16x16)
    if (!this.textures.exists('projectile_energy')) {
      const pGfx = this.make.graphics({ x: 0, y: 0, add: false });
      pGfx.fillStyle(0x38bdf8, 0.4);
      pGfx.fillCircle(8, 8, 8);
      pGfx.fillStyle(0x00f0ff, 0.85);
      pGfx.fillCircle(8, 8, 5);
      pGfx.fillStyle(0xffffff, 1);
      pGfx.fillCircle(8, 8, 2.5);
      pGfx.generateTexture('projectile_energy', 16, 16);
      pGfx.destroy();
    }

    // 8. Obstáculo de Daño: Pinchos de Plasma Cibernéticos (32x24)
    if (!this.textures.exists('spike_hazard')) {
      const spkGfx = this.make.graphics({ x: 0, y: 0, add: false });
      spkGfx.fillStyle(0x0f172a, 1);
      spkGfx.fillRect(0, 20, 32, 4);
      // Tres pinchos afilados
      spkGfx.fillStyle(0xef4444, 0.95);
      spkGfx.fillTriangle(0, 20, 5, 2, 10, 20);
      spkGfx.fillTriangle(11, 20, 16, 2, 21, 20);
      spkGfx.fillTriangle(22, 20, 27, 2, 32, 20);
      // Núcleo de energía brillante
      spkGfx.fillStyle(0xfca5a5, 1);
      spkGfx.fillTriangle(3, 19, 5, 5, 7, 19);
      spkGfx.fillTriangle(14, 19, 16, 5, 18, 19);
      spkGfx.fillTriangle(25, 19, 27, 5, 29, 19);
      spkGfx.generateTexture('spike_hazard', 32, 24);
      spkGfx.destroy();
    }

    // 9. Parche de Corrupción de Plataforma (ParasiteBot) (40x12)
    if (!this.textures.exists('corrupt_patch')) {
      const cGfx = this.make.graphics({ x: 0, y: 0, add: false });
      cGfx.fillStyle(0x701a75, 0.8);
      cGfx.fillRect(0, 4, 40, 8);
      cGfx.fillStyle(0xf43f5e, 0.9);
      cGfx.fillRect(4, 2, 8, 8);
      cGfx.fillRect(16, 0, 10, 10);
      cGfx.fillRect(30, 2, 6, 8);
      cGfx.fillStyle(0x38bdf8, 0.85);
      cGfx.fillRect(2, 6, 4, 4);
      cGfx.fillRect(20, 4, 4, 4);
      cGfx.fillRect(34, 5, 3, 3);
      cGfx.generateTexture('corrupt_patch', 40, 12);
      cGfx.destroy();
    }

    // 10. Proyectil Fractal del Jefe BosMat (20x20)
    if (!this.textures.exists('boss_projectile')) {
      const bpGfx = this.make.graphics({ x: 0, y: 0, add: false });
      bpGfx.fillStyle(0xa855f7, 0.5);
      bpGfx.fillCircle(10, 10, 9);
      bpGfx.fillStyle(0xf43f5e, 0.9);
      bpGfx.fillCircle(10, 10, 6);
      bpGfx.fillStyle(0xfde047, 1);
      bpGfx.fillRect(8, 8, 4, 4);
      bpGfx.generateTexture('boss_projectile', 20, 20);
      bpGfx.destroy();
    }

    // 11. Trofeos de Victoria Conmemorativos (48x48)
    const trophyThemes = [
      { key: 'trophy_logic', color: 0x38bdf8, base: 0x0284c7 },
      { key: 'trophy_computational', color: 0x10b981, base: 0x059669 },
      { key: 'trophy_reading', color: 0xa855f7, base: 0x7e22ce },
      { key: 'trophy_strategic', color: 0xf59e0b, base: 0xd97706 }
    ];

    trophyThemes.forEach(t => {
      if (!this.textures.exists(t.key)) {
        const tg = this.make.graphics({ x: 0, y: 0, add: false });
        // Pedestal
        tg.fillStyle(0x0f172a, 1);
        tg.fillRect(10, 38, 28, 8);
        tg.fillStyle(t.base, 1);
        tg.fillRect(14, 34, 20, 4);
        // Tallo
        tg.fillStyle(0xfbbf24, 1);
        tg.fillRect(22, 26, 4, 8);
        // Copa
        tg.fillStyle(0xfbbf24, 1);
        tg.fillCircle(24, 18, 11);
        tg.fillStyle(t.color, 1);
        tg.fillCircle(24, 17, 8);
        // Asas
        tg.lineStyle(2, 0xfbbf24, 1);
        tg.strokeCircle(14, 18, 4);
        tg.strokeCircle(34, 18, 4);
        // Estrella en relieve
        tg.fillStyle(0xffffff, 1);
        tg.fillRect(23, 14, 2, 6);
        tg.fillRect(21, 16, 6, 2);
        tg.generateTexture(t.key, 48, 48);
        tg.destroy();
      }
    });
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
    // Los frames 18 a 21 corresponden a la animación de ataque corporal; el frame 22 es el icono recortado de la cabeza
    const attackFrames = [
      { key: pTex, frame: 18 },
      { key: pTex, frame: 19 },
      { key: pTex, frame: 20 },
      { key: pTex, frame: 21 }
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

    // 6. OwlBot Vuelo (Frames 0 a 7 de la fila 0)
    if (this.textures.exists('owlbot_texture') && !this.anims.exists('owlbot_fly')) {
      this.anims.create({
        key: 'owlbot_fly',
        frames: this.anims.generateFrameNumbers('owlbot_texture', { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1
      });
    }

    // 7. AjoloteBot Vuelo (Frames 0 a 7 de la fila 0)
    if (this.textures.exists('ajolotebot_texture') && !this.anims.exists('ajolotebot_fly')) {
      this.anims.create({
        key: 'ajolotebot_fly',
        frames: this.anims.generateFrameNumbers('ajolotebot_texture', { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1
      });
    }

    // Animaciones para bots terrestres modulares de 8 frames
    const groundBots = ['brainbot', 'caatbot', 'warbot', 'neurobot', 'questbot'];
    groundBots.forEach(bot => {
      const tex = `${bot}_texture`;
      const walkKey = `${bot}_walk`;
      if (this.textures.exists(tex) && !this.anims.exists(walkKey)) {
        this.anims.create({
          key: walkKey,
          frames: this.anims.generateFrameNumbers(tex, { start: 0, end: 7 }),
          frameRate: 8,
          repeat: -1
        });
      }
    });

    // 8. ParasiteBot Crawl (Frames 0 a 7 de la fila 0)
    if (this.textures.exists('parasitebot_texture')) {
      if (!this.anims.exists('parasitebot_crawl')) {
        this.anims.create({
          key: 'parasitebot_crawl',
          frames: this.anims.generateFrameNumbers('parasitebot_texture', { start: 0, end: 7 }),
          frameRate: 9,
          repeat: -1
        });
      }
      if (!this.anims.exists('parasitebot_idle')) {
        this.anims.create({
          key: 'parasitebot_idle',
          frames: [{ key: 'parasitebot_texture', frame: 0 }],
          frameRate: 1
        });
      }
      if (!this.anims.exists('parasitebot_attack')) {
        this.anims.create({
          key: 'parasitebot_attack',
          frames: this.anims.generateFrameNumbers('parasitebot_texture', { start: 0, end: 7 }),
          frameRate: 10,
          repeat: 0
        });
      }
      if (!this.anims.exists('parasitebot_die')) {
        this.anims.create({
          key: 'parasitebot_die',
          frames: this.anims.generateFrameNumbers('parasitebot_texture', { start: 0, end: 7 }),
          frameRate: 9,
          repeat: 0
        });
      }
    }

    // 9. BosMat Jefe (Idle y Ataque)
    if (this.textures.exists('bosmat_texture')) {
      if (!this.anims.exists('bosmat_idle')) {
        this.anims.create({
          key: 'bosmat_idle',
          frames: this.anims.generateFrameNumbers('bosmat_texture', { start: 0, end: 7 }),
          frameRate: 6,
          repeat: -1
        });
      }
      if (!this.anims.exists('bosmat_attack')) {
        this.anims.create({
          key: 'bosmat_attack',
          frames: this.anims.generateFrameNumbers('bosmat_texture', { start: 0, end: 7 }),
          frameRate: 10,
          repeat: 0
        });
      }
    }
  }
}
