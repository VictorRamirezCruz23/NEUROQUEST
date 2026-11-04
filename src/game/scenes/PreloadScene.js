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

    // Generar texturas de respaldo procedurales para pixel art
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

    // Generar textura para jugador (placeholder de 32x32)
    if (!this.textures.exists('hero_idle')) {
      const heroGfx = this.make.graphics({ x: 0, y: 0, add: false });
      // Capa / Cuerpo
      heroGfx.fillStyle(0x38bdf8, 1);
      heroGfx.fillRect(8, 10, 16, 18);
      // Cabeza
      heroGfx.fillStyle(0xf8fafc, 1);
      heroGfx.fillRect(10, 4, 12, 10);
      // Ojos estilo visor cibernético
      heroGfx.fillStyle(0x0284c7, 1);
      heroGfx.fillRect(12, 8, 8, 3);
      // Pies
      heroGfx.fillStyle(0x0f172a, 1);
      heroGfx.fillRect(8, 28, 6, 4);
      heroGfx.fillRect(18, 28, 6, 4);
      heroGfx.generateTexture('hero_idle', 32, 32);
      heroGfx.destroy();
    }
  }

  create() {
    console.log('[PreloadScene] Recursos y texturas listos.');
    this.scene.start('WelcomeScene');
  }
}
