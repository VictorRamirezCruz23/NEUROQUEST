import Phaser from 'phaser';

/**
 * VirtualControls.js — Controles táctiles virtuales en pantalla para teléfonos y tabletas.
 * Arquitectura plana (flat screen-space) sin anidamiento para garantizar que los botones táctiles
 * respondan en cualquier parte de la pantalla sin importar el desplazamiento de la cámara.
 */
export class VirtualControls {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('../../game/entities/Player.js').Player} player
   */
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.elements = [];
    this.leftDown = false;
    this.rightDown = false;

    this.createControls();
  }

  track(obj) {
    obj.setScrollFactor(0);
    this.elements.push(obj);
    return obj;
  }

  createControls() {
    const { width, height } = this.scene.scale;
    const baseDepth = 1800;

    // --- GRUPO IZQUIERDO: D-PAD HORIZONTAL ---
    const padY = height - 55;
    this.createTouchButton(56, padY, 58, 50, '◀', baseDepth, () => {
      this.leftDown = true;
    }, () => {
      this.leftDown = false;
    });

    this.createTouchButton(126, padY, 58, 50, '▶', baseDepth, () => {
      this.rightDown = true;
    }, () => {
      this.rightDown = false;
    });

    // --- GRUPO DERECHO: ACCIONES ---
    // Botón Saltar
    this.createTouchButton(width - 64, height - 120, 68, 50, '▲ SALTO', baseDepth, () => {
      if (this.player && this.player.body) {
        const onFloor = this.player.body.blocked.down || this.player.body.touching.down;
        if (onFloor) {
          this.player.setVelocityY(this.player.jumpForce);
        }
      }
    });

    // Botón Golpe / Acción
    this.createTouchButton(width - 142, height - 55, 64, 50, '⚡ GOLPE', baseDepth, () => {
      if (this.player && !this.player.isAttacking) {
        this.player.performPunch();
      }
    });

    // Botón Interactuar con Terminal
    this.createTouchButton(width - 64, height - 55, 68, 50, '[E] ENTRAR', baseDepth, () => {
      this.scene.events.emit('touch-interact');
    });

    // Botón Cambiar Ruta
    this.createTouchButton(width - 70, 38, 90, 36, '🧭 RUTAS', baseDepth, () => {
      this.scene.events.emit('touch-switch-route');
    });
  }

  createTouchButton(x, y, w, h, label, depth, onPress, onRelease = null) {
    const halfW = w / 2;
    const halfH = h / 2;

    const bg = this.track(this.scene.add.graphics().setDepth(depth));
    const drawBg = (active = false) => {
      bg.clear();
      bg.fillStyle(active ? 0x0284c7 : 0x0f172a, active ? 0.95 : 0.75);
      bg.fillRoundedRect(x - halfW, y - halfH, w, h, 8);
      bg.lineStyle(2, 0x38bdf8, active ? 1 : 0.85);
      bg.strokeRoundedRect(x - halfW, y - halfH, w, h, 8);
    };
    drawBg(false);

    const text = this.track(
      this.scene.add.text(x, y, label, {
        fontFamily: 'monospace',
        fontSize: label.length > 5 ? '10px' : '15px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(depth + 1)
    );

    const hitZone = this.track(
      this.scene.add.zone(x, y, w, h)
        .setDepth(depth + 2)
        .setInteractive({ useHandCursor: true })
    );

    hitZone.on('pointerdown', () => {
      drawBg(true);
      if (onPress) onPress();
    });

    const release = () => {
      drawBg(false);
      if (onRelease) onRelease();
    };

    hitZone.on('pointerup', release);
    hitZone.on('pointerout', release);
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

  destroy() {
    this.elements.forEach(el => {
      if (el && el.destroy) el.destroy();
    });
    this.elements = [];
  }
}
