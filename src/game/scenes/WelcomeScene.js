import Phaser from 'phaser';

export class WelcomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WelcomeScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Crear fondo de rejilla pixel retro / estrellas
    this.createRetroBackground(width, height);

    // Título Principal
    const title = this.add.text(width / 2, height * 0.32, 'NEUROQUEST', {
      fontFamily: 'monospace',
      fontSize: '54px',
      color: '#38bdf8',
      fontStyle: 'bold',
      shadow: {
        offsetX: 0,
        offsetY: 4,
        color: '#0284c7',
        blur: 12,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);

    // Animación suave de flotación para el título
    this.tweens.add({
      targets: title,
      y: height * 0.32 - 8,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtítulo
    this.add.text(width / 2, height * 0.43, 'Plataforma de Aventura Educativa Adaptativa', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#cbd5e1'
    }).setOrigin(0.5);

    // Sprite de previsualización del avatar
    const heroPreview = this.add.image(width / 2, height * 0.54, 'hero_idle');
    heroPreview.setScale(3); // Escala pixel art x3

    this.tweens.add({
      targets: heroPreview,
      scaleY: 2.8,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeInOut'
    });

    // Botón Iniciar Aventura
    const btnContainer = this.add.container(width / 2, height * 0.72);
    const btnBg = this.add.image(0, 0, 'btn_primary').setInteractive({ useHandCursor: true });
    const btnLabel = this.add.text(0, 0, 'INICIAR AVENTURA', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    btnContainer.add([btnBg, btnLabel]);

    // Efectos interactivos del botón
    btnBg.on('pointerover', () => {
      btnBg.setTint(0x60a5fa);
      btnContainer.setScale(1.05);
    });

    btnBg.on('pointerout', () => {
      btnBg.clearTint();
      btnContainer.setScale(1.0);
    });

    btnBg.on('pointerdown', () => {
      btnContainer.setScale(0.96);
      this.cameras.main.flash(300, 56, 189, 248);
      console.log('[WelcomeScene] Iniciar aventura presionado. Listo para Selector de Competencias.');
    });

    // Pie de página de estado del sistema
    this.add.text(width / 2, height - 25, 'v0.1.0 • Incremento 1: Motor Vite + Phaser 3 Configurado', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#64748b'
    }).setOrigin(0.5);
  }

  createRetroBackground(width, height) {
    const bgGfx = this.add.graphics();
    bgGfx.fillStyle(0x070913, 1);
    bgGfx.fillRect(0, 0, width, height);

    // Dibujar partículas o estrellas de fondo
    bgGfx.fillStyle(0x38bdf8, 0.4);
    for (let i = 0; i < 70; i++) {
      const rx = Phaser.Math.Between(0, width);
      const ry = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);
      bgGfx.fillRect(rx, ry, size, size);
    }
  }
}
