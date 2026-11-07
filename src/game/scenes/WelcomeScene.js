import Phaser from 'phaser';
import { authModalController } from '../../ui/components/AuthModalController.js';
import { authService } from '../../services/firebase/authService.js';
import { sessionState, PLAYER_PALETTES, MENU_BG_THEMES, COMPETENCY_IDS } from '../../core/sessionState.js';
import { SoundManager } from '../audio/SoundManager.js';

/**
 * WelcomeScene.js — Menú principal renovado, interactivo y futurista para NEUROQUEST.
 *
 * Características requeridas:
 * 1. Estética cibernética gamer de alto impacto atractiva para jóvenes de 10 a 15 años.
 * 2. Música de Menú: Reproduce en bucle Menu.mp3 de forma exclusiva en el menú.
 * 3. Personalización del Personaje: Previsualización en vivo del avatar oficial con conmutador
 *    de paletas de color en tiempo real (guardado en sessionState).
 * 4. Configuración Interactiva de Fondo: Alterna entre temas visuales (Cyber Dark, Synthwave, etc.).
 * 5. Vitrina de Trofeos Conmemorativos de los 4 Mundos.
 * 6. Soporte completo de Pantalla Completa (Fullscreen) y Responsive.
 * 7. Audio de clics interactivos en cada botón.
 */
export class WelcomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WelcomeScene' });
  }

  create() {
    const { width, height } = this.scale;

    // 1. Iniciar gestor de audio y reproducir música de menú
    this.soundManager = new SoundManager(this);
    this.soundManager.playMenuMusic();

    // 2. Fondo interactivo configurable
    this.bgContainer = this.add.container(0, 0);
    this.renderCustomBackground(width, height);

    // 3. Barra Superior: Perfil + Pantalla Completa + Selector de Tema
    this.createTopControls(width);

    // 4. Logotipo Central Futurista
    this.createLogoHeader(width, height);

    // 5. Módulo Central: Previsualizador del Personaje y Personalizador de Paletas
    this.createCharacterCustomizer(width, height);

    // 6. Vitrina de Trofeos de los 4 Mundos
    this.createTrophyCabinet(width, height);

    // 7. Botón Principal "INICIAR AVENTURA"
    this.createStartButton(width, height);

    // 8. Pie de página de estado del sistema
    this.add.text(width / 2, height - 16, 'NEUROQUEST v1.0 • Motor Adaptativo • Estación NEUROCORE', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#64748b'
    }).setOrigin(0.5);

    // Fade-in inicial
    this.cameras.main.fadeIn(400, 10, 12, 22);
  }

  renderCustomBackground(width, height) {
    this.bgContainer.removeAll(true);
    const theme = sessionState.getMenuBgTheme();

    const bgGfx = this.add.graphics();
    bgGfx.fillStyle(theme.bgColor, 1);
    bgGfx.fillRect(0, 0, width, height);

    // Cuadrícula cibernética con perspectiva
    bgGfx.lineStyle(1, theme.gridColor, 0.45);
    for (let x = 0; x < width; x += 48) {
      bgGfx.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 48) {
      bgGfx.lineBetween(0, y, width, y);
    }
    this.bgContainer.add(bgGfx);

    // Estrellas / partículas de energía cósmica
    for (let i = 0; i < 60; i++) {
      const rx = Phaser.Math.Between(0, width);
      const ry = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);
      const star = this.add.rectangle(rx, ry, size, size, theme.starColor, Phaser.Math.FloatBetween(0.2, 0.8));
      this.bgContainer.add(star);

      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(1500, 3500),
        yoyo: true,
        repeat: -1
      });
    }
  }

  createTopControls(width) {
    // Botón de Perfil
    const profileBtn = this.add.text(width - 24, 20, `👤 ${authService.getDisplayName()}`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#38bdf8',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      padding: { x: 10, y: 6 }
    })
    .setOrigin(1, 0)
    .setInteractive({ useHandCursor: true });

    profileBtn.on('pointerdown', () => {
      this.soundManager.playClick();
      authModalController.open({
        mandatory: false,
        onAuthSuccess: () => {
          if (profileBtn && profileBtn.setText) {
            profileBtn.setText(`👤 ${authService.getDisplayName()}`);
          }
        }
      });
    });

    // Botón Pantalla Completa (Fullscreen)
    const fsBtn = this.add.text(width - 200, 20, '⛶ PANTALLA COMPLETA', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#38bdf8',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      padding: { x: 10, y: 6 }
    })
    .setOrigin(1, 0)
    .setInteractive({ useHandCursor: true });

    fsBtn.on('pointerdown', () => {
      this.soundManager.playClick();
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    // Botón Conmutador de Tema de Entorno
    const themeBtn = this.add.text(24, 20, `🎨 TEMA: ${sessionState.getMenuBgTheme().name.toUpperCase()}`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#fbbf24',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      padding: { x: 10, y: 6 }
    })
    .setOrigin(0, 0)
    .setInteractive({ useHandCursor: true });

    themeBtn.on('pointerdown', () => {
      this.soundManager.playClick();
      const nextTheme = sessionState.cycleMenuBgTheme();
      themeBtn.setText(`🎨 TEMA: ${nextTheme.name.toUpperCase()}`);
      const { width, height } = this.scale;
      this.renderCustomBackground(width, height);
    });
  }

  createLogoHeader(width, height) {
    const title = this.add.text(width / 2, height * 0.18, 'NEUROQUEST', {
      fontFamily: 'monospace',
      fontSize: '56px',
      color: '#38bdf8',
      fontStyle: 'bold',
      shadow: {
        offsetX: 0,
        offsetY: 6,
        color: '#0284c7',
        blur: 16,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);

    // Flotación animada suave
    this.tweens.add({
      targets: title,
      y: height * 0.18 - 6,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(width / 2, height * 0.26, '✦ ESTACIÓN CIBERNÉTICA DE AVENTURA COGNITIVA ✦', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#94a3b8',
      letterSpacing: 2
    }).setOrigin(0.5);
  }

  createCharacterCustomizer(width, height) {
    const customizerX = width / 2;
    const customizerY = height * 0.51;

    // Pedestal holográfico del avatar
    const padGfx = this.add.graphics();
    padGfx.fillStyle(0x0f172a, 0.9);
    padGfx.fillRoundedRect(customizerX - 160, customizerY - 95, 320, 175, 10);
    padGfx.lineStyle(2, 0x38bdf8, 0.85);
    padGfx.strokeRoundedRect(customizerX - 160, customizerY - 95, 320, 175, 10);

    // Base elíptica de energía
    const energyBase = this.add.ellipse(customizerX, customizerY + 36, 120, 24, 0x0284c7, 0.7)
      .setStrokeStyle(2, 0x38bdf8, 1);

    this.tweens.add({
      targets: energyBase,
      scaleX: 1.15,
      alpha: 0.9,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Avatar del jugador
    this.heroPreview = this.add.image(customizerX, customizerY - 8, 'player', 0);
    this.heroPreview.setScale(0.38);
    this.updateHeroPreviewTint();

    this.tweens.add({
      targets: this.heroPreview,
      y: customizerY - 14,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Etiqueta de la paleta actual
    const currentPal = sessionState.getPlayerPalette();
    this.paletteLabel = this.add.text(customizerX, customizerY + 62, `TRAJE: ${currentPal.name.toUpperCase()}`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: currentPal.accentHex || '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Botones de cambio de paleta (◀ y ▶)
    const prevBtn = this.add.text(customizerX - 130, customizerY + 62, '◀', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const nextBtn = this.add.text(customizerX + 130, customizerY + 62, '▶', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const cyclePalette = (forward = true) => {
      this.soundManager.playClick();
      const currentIdx = PLAYER_PALETTES.findIndex(p => p.id === sessionState.getPlayerPaletteId());
      const nextIdx = forward
        ? (currentIdx + 1) % PLAYER_PALETTES.length
        : (currentIdx - 1 + PLAYER_PALETTES.length) % PLAYER_PALETTES.length;

      const newPal = sessionState.setPlayerPalette(PLAYER_PALETTES[nextIdx].id);
      this.updateHeroPreviewTint();
      this.paletteLabel.setText(`TRAJE: ${newPal.name.toUpperCase()}`);
      this.paletteLabel.setColor(newPal.accentHex || '#38bdf8');
    };

    prevBtn.on('pointerdown', () => cyclePalette(false));
    nextBtn.on('pointerdown', () => cyclePalette(true));
  }

  updateHeroPreviewTint() {
    if (!this.heroPreview) return;
    const pal = sessionState.getPlayerPalette();
    if (pal && pal.tint) {
      this.heroPreview.setTint(pal.tint);
    } else {
      this.heroPreview.clearTint();
    }
  }

  createTrophyCabinet(width, height) {
    const cabinetX = width - 110;
    const cabinetY = height * 0.50;

    const cabBox = this.add.graphics();
    cabBox.fillStyle(0x0f172a, 0.85);
    cabBox.fillRoundedRect(cabinetX - 70, cabinetY - 95, 140, 190, 8);
    cabBox.lineStyle(1.5, 0xfbbf24, 0.8);
    cabBox.strokeRoundedRect(cabinetX - 70, cabinetY - 95, 140, 190, 8);

    this.add.text(cabinetX, cabinetY - 80, '🏆 TROFEOS', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const worldIds = [
      COMPETENCY_IDS.LOGIC_MATH,
      COMPETENCY_IDS.COMPUTATIONAL_THINKING,
      COMPETENCY_IDS.READING_COMPREHENSION,
      COMPETENCY_IDS.STRATEGIC_MULTIDISCIPLINARY
    ];

    const trophyKeys = ['trophy_logic', 'trophy_computational', 'trophy_reading', 'trophy_strategic'];
    const worldNames = ['M01: Lógica', 'M02: Código', 'M03: Lectura', 'M04: Estrategia'];

    worldIds.forEach((id, idx) => {
      const ty = cabinetY - 48 + (idx * 36);
      const isUnlocked = sessionState.hasTrophy(id);

      const icon = this.add.image(cabinetX - 40, ty, trophyKeys[idx])
        .setDisplaySize(20, 20);

      if (!isUnlocked) {
        icon.setTint(0x334155);
        icon.setAlpha(0.35);
      }

      this.add.text(cabinetX - 22, ty, worldNames[idx], {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: isUnlocked ? '#fbbf24' : '#64748b'
      }).setOrigin(0, 0.5);
    });
  }

  createStartButton(width, height) {
    const btnContainer = this.add.container(width / 2, height * 0.82);
    const btnBg = this.add.image(0, 0, 'btn_primary').setInteractive({ useHandCursor: true });
    btnBg.setScale(1.15, 1.1);

    const btnLabel = this.add.text(0, 0, '🚀 INICIAR AVENTURA', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    btnContainer.add([btnBg, btnLabel]);

    btnBg.on('pointerover', () => {
      btnBg.setTint(0x38bdf8);
      btnContainer.setScale(1.05);
    });

    btnBg.on('pointerout', () => {
      btnBg.clearTint();
      btnContainer.setScale(1.0);
    });

    btnBg.on('pointerdown', () => {
      this.soundManager.playClick();
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
}
