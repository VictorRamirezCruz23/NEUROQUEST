import Phaser from 'phaser';
import { COMPETENCY_METADATA } from '../../core/sessionState.js';

/**
 * TrophyModal.js — Modal conmemorativo de trofeo al completar un mundo y derrotar al Jefe Final.
 */
export class TrophyModal {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.elements = [];
    this.isOpen = false;
  }

  show(competencyId, onComplete) {
    if (this.isOpen) return;
    this.isOpen = true;

    const { width, height } = this.scene.scale;
    const meta = COMPETENCY_METADATA[competencyId] || {};
    const trophyKey = `trophy_${competencyId.split('_')[0]}`;
    const finalTrophyKey = this.scene.textures.exists(trophyKey) ? trophyKey : 'trophy_logic';

    // Fondo oscurecido
    const backdrop = this.scene.add.rectangle(0, 0, width, height, 0x030712, 0.88)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(3000)
      .setInteractive();
    this.elements.push(backdrop);

    // Contenedor modal
    const modalW = 540;
    const modalH = 340;
    const modalX = (width - modalW) / 2;
    const modalY = (height - modalH) / 2;

    const modalBg = this.scene.add.graphics().setScrollFactor(0).setDepth(3001);
    modalBg.fillStyle(0x0f172a, 0.98);
    modalBg.fillRoundedRect(modalX, modalY, modalW, modalH, 12);
    modalBg.lineStyle(3, 0xfbbf24, 1);
    modalBg.strokeRoundedRect(modalX, modalY, modalW, modalH, 12);
    this.elements.push(modalBg);

    // Partículas doradas de celebración
    for (let i = 0; i < 40; i++) {
      const rx = modalX + Math.random() * modalW;
      const ry = modalY + Math.random() * modalH;
      const dot = this.scene.add.rectangle(rx, ry, 3, 3, 0xfbbf24, 0.8)
        .setScrollFactor(0)
        .setDepth(3002);
      this.elements.push(dot);

      this.scene.tweens.add({
        targets: dot,
        y: ry - 40,
        alpha: 0,
        duration: 800 + Math.random() * 600,
        repeat: -1
      });
    }

    // Título de la Copa
    const header = this.scene.add.text(width / 2, modalY + 36, '🏆 ¡MUNDO COMPLETADO! TROFEO DE VICTORIA', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);
    this.elements.push(header);

    // Sprite del Trofeo
    const trophySprite = this.scene.add.image(width / 2, modalY + 115, finalTrophyKey)
      .setScrollFactor(0)
      .setDepth(3003)
      .setScale(1.8);
    this.elements.push(trophySprite);

    this.scene.tweens.add({
      targets: trophySprite,
      scaleX: 2.1,
      scaleY: 2.1,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtítulo con el nombre del mundo
    const worldTitle = this.scene.add.text(width / 2, modalY + 195, `MUNDO ${meta.worldNumber || '01'}: ${meta.name?.toUpperCase()}`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);
    this.elements.push(worldTitle);

    // Mensaje de reconocimiento
    const desc = this.scene.add.text(
      width / 2,
      modalY + 230,
      '¡Has neutralizado al Boss y dominado los desafíos cognitivos!\nEste trofeo conmemorativo ha sido grabado en tu perfil galáctico permanente.',
      {
        fontFamily: 'monospace',
        fontSize: '10.5px',
        color: '#cbd5e1',
        align: 'center',
        lineSpacing: 3
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(3003);
    this.elements.push(desc);

    // Botón Aceptar / Continuar
    const btnW = 220;
    const btnH = 38;
    const btnX = width / 2;
    const btnY = modalY + 292;

    const btnBg = this.scene.add.graphics().setScrollFactor(0).setDepth(3003);
    const drawBtn = (hover = false) => {
      btnBg.clear();
      btnBg.fillStyle(hover ? 0x2563eb : 0x1d4ed8, 1);
      btnBg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
      btnBg.lineStyle(2, hover ? 0x60a5fa : 0x38bdf8, 1);
      btnBg.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
    };
    drawBtn(false);
    this.elements.push(btnBg);

    const btnTxt = this.scene.add.text(btnX, btnY, 'RECLAMAR Y CONTINUAR ➔', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3004);
    this.elements.push(btnTxt);

    const hit = this.scene.add.zone(btnX, btnY, btnW, btnH)
      .setScrollFactor(0)
      .setDepth(3005)
      .setInteractive({ useHandCursor: true });
    this.elements.push(hit);

    hit.on('pointerover', () => drawBtn(true));
    hit.on('pointerout', () => drawBtn(false));
    hit.on('pointerdown', () => {
      this.close();
      if (typeof onComplete === 'function') onComplete();
    });
  }

  close() {
    this.elements.forEach(el => {
      if (el && typeof el.destroy === 'function') el.destroy();
    });
    this.elements = [];
    this.isOpen = false;
  }
}
