import Phaser from 'phaser';

/**
 * VirtualControls.js — Controles táctiles virtuales en pantalla para teléfonos y tabletas.
 * Permite movimiento horizontal, salto, golpe/acción e interacción táctil sin teclado.
 */
export class VirtualControls {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('../../game/entities/Player.js').Player} player
   */
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);

    this.leftDown = false;
    this.rightDown = false;

    this.createControls();
  }

  createControls() {
    const { width, height } = this.scene.scale;

    // --- GRUPO IZQUIERDO: D-PAD HORIZONTAL ---
    const padY = height - 60;
    const btnLeft = this.createTouchButton(56, padY, 56, 48, '◀', () => {
      this.leftDown = true;
    }, () => {
      this.leftDown = false;
    });

    const btnRight = this.createTouchButton(124, padY, 56, 48, '▶', () => {
      this.rightDown = true;
    }, () => {
      this.rightDown = false;
    });

    // --- GRUPO DERECHO: ACCIONES ---
    // Botón Saltar (arriba a la derecha)
    const btnJump = this.createTouchButton(width - 64, height - 120, 64, 52, '▲ SALTO', () => {
      const onFloor = this.player.body.blocked.down || this.player.body.touching.down;
      if (onFloor) {
        this.player.setVelocityY(this.player.jumpForce);
      }
    });

    // Botón Acción / Golpe
    const btnPunch = this.createTouchButton(width - 138, height - 60, 60, 48, '⚡ ACCIÓN', () => {
      if (!this.player.isAttacking) {
        this.player.performPunch();
      }
    });

    // Botón Interactuar / Terminal
    const btnInteract = this.createTouchButton(width - 64, height - 60, 64, 48, '[E] ENTRAR', () => {
      // Disparar evento de interacción en la escena
      this.scene.events.emit('touch-interact');
    });

    this.container.add([btnLeft, btnRight, btnJump, btnPunch, btnInteract]);
  }

  createTouchButton(x, y, w, h, label, onPress, onRelease = null) {
    const btn = this.scene.add.container(x, y);
    btn.setSize(w, h);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0f172a, 0.75);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    bg.lineStyle(2, 0x38bdf8, 0.85);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);

    const text = this.scene.add.text(0, 0, label, {
      fontFamily: 'monospace',
      fontSize: label.length > 5 ? '10px' : '15px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    btn.add([bg, text]);

    btn.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
      Phaser.Geom.Rectangle.Contains
    );

    btn.on('pointerdown', () => {
      bg.clear();
      bg.fillStyle(0x0284c7, 0.9);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      bg.lineStyle(2, 0x38bdf8, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      btn.setScale(0.94);
      if (onPress) onPress();
    });

    const handleRelease = () => {
      bg.clear();
      bg.fillStyle(0x0f172a, 0.75);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      bg.lineStyle(2, 0x38bdf8, 0.85);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      btn.setScale(1.0);
      if (onRelease) onRelease();
    };

    btn.on('pointerup', handleRelease);
    btn.on('pointerout', handleRelease);

    return btn;
  }

  update() {
    if (!this.player || this.player.isLocked || this.player.isAttacking) return;

    if (this.leftDown) {
      this.player.setVelocityX(-this.player.speed);
      this.player.setFlipX(true);
    } else if (this.rightDown) {
      this.player.setVelocityX(this.player.speed);
      this.player.setFlipX(false);
    }
  }

  setVisible(visible) {
    this.container.setVisible(visible);
  }

  destroy() {
    this.container.destroy();
  }
}
