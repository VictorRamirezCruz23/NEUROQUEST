import Phaser from 'phaser';

/**
 * EnergyProjectile.js — Proyectil de energía azul disparado por el Cadete en NEUROQUEST.
 * Se desplaza a alta velocidad e interactúa con enemigos voladores, terrestres y jefes.
 */
export class EnergyProjectile extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} direction - 1 para derecha, -1 para izquierda
   */
  constructor(scene, x, y, direction = 1) {
    super(scene, x, y, 'projectile_energy');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.direction = direction;
    this.speed = 520;
    this.damage = 1;

    if (this.body) {
      this.body.allowGravity = false;
    }
    this.body.setSize(14, 14);
    this.body.setOffset(1, 1);

    this.setVelocityX(this.direction * this.speed);

    // Pequeño pulso de escala inicial
    this.setScale(1.2);
    scene.tweens.add({
      targets: this,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 120
    });

    // Destrucción tras 1.8 segundos para no fugar memoria
    this.lifespanTimer = scene.time.delayedCall(1800, () => {
      this.explode(false);
    });
  }

  update() {
    if (!this.active) return;

    // Si sale de los límites de la cámara / mundo
    if (this.x < 0 || this.x > this.scene.physics.world.bounds.width) {
      this.explode(false);
    }
  }

  /**
   * Genera micro-partículas de impacto y destruye el proyectil.
   * @param {boolean} hitTarget
   */
  explode(hitTarget = true) {
    if (!this.active) return;

    if (this.lifespanTimer) {
      this.lifespanTimer.remove();
      this.lifespanTimer = null;
    }

    if (this.scene) {
      // Destello de chispas en el punto de contacto
      const sparks = this.scene.add.graphics();
      const sparkColor = hitTarget ? 0x00f0ff : 0x38bdf8;
      sparks.fillStyle(sparkColor, 0.9);

      for (let i = 0; i < 5; i++) {
        const ox = (Math.random() * 16) - 8;
        const oy = (Math.random() * 16) - 8;
        sparks.fillCircle(this.x + ox, this.y + oy, Math.random() * 2 + 1.5);
      }

      this.scene.tweens.add({
        targets: sparks,
        alpha: 0,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 180,
        onComplete: () => {
          sparks.destroy();
        }
      });
    }

    this.destroy();
  }
}
