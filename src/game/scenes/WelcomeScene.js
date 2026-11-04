import Phaser from 'phaser';
import { authModalController } from '../../ui/components/AuthModalController.js';
import { authService } from '../../services/firebase/authService.js';

export class WelcomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WelcomeScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Crear fondo de rejilla pixel retro / estrellas
    this.createRetroBackground(width, height);

    // Botón de Perfil / Identificación de Cadete (Firebase Auth)
    const profileBtn = this.add.text(width - 24, 20, `👤 ${authService.getDisplayName()}`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#38bdf8',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      padding: { x: 10, y: 6 }
    })
    .setOrigin(1, 0)
    .setInteractive({ useHandCursor: true });

    profileBtn.on('pointerover', () => profileBtn.setColor('#ffffff'));
    profileBtn.on('pointerout', () => profileBtn.setColor('#38bdf8'));
    profileBtn.on('pointerdown', () => authModalController.open());

    authService.onAuthStateChange(() => {
      if (profileBtn && profileBtn.setText) {
        profileBtn.setText(`👤 ${authService.getDisplayName()}`);
      }
    });

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

    // Sprite de previsualización del avatar oficial (del spritesheet player_sheet)
    const heroPreview = this.add.image(width / 2, height * 0.53, 'player', 0);
    heroPreview.setScale(0.38);

    this.tweens.add({
      targets: heroPreview,
      scaleY: 0.36,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeInOut'
    });

    // Botón Iniciar Aventura
    const btnContainer = this.add.container(width / 2, height * 0.74);
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
      if (!authService.isUserLoggedInLocally() && !authService.isPermanentUser()) {
        authModalController.open({
          mandatory: true,
          onAuthSuccess: () => this.startAdventure()
        });
      } else {
        this.startAdventure();
      }
    });

    // Pie de página de estado del sistema
    this.add.text(width / 2, height - 25, 'v0.7.0 • Firebase Cloud Sync & Autenticación Activa', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#64748b'
    }).setOrigin(0.5);

    // Solicitar siempre creación de cuenta o inicio de sesión si no hay sesión previa
    this.time.delayedCall(450, () => {
      if (!authService.isUserLoggedInLocally() && !authService.isPermanentUser()) {
        authModalController.open({
          mandatory: true,
          onAuthSuccess: () => {
            profileBtn.setText(`👤 ${authService.getDisplayName()}`);
          }
        });
      }
    });
  }

  startAdventure() {
    if (this.isStarting) return;
    this.isStarting = true;
    console.log('[WelcomeScene] Iniciar aventura presionado. Transicionando a SelectCompetencyScene.');
    this.cameras.main.fadeOut(300, 10, 12, 22);
    this.time.delayedCall(320, () => {
      this.scene.start('SelectCompetencyScene');
    });
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
