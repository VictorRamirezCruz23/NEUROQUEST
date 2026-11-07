import Phaser from 'phaser';

/**
 * Paleta de colores neón vibrantes para los disparos del jugador.
 * Evita colores específicos fijos y genera una atmósfera retro cyberpunk variada.
 */
export const PROJECTILE_COLORS = [
  0x00f0ff, // Cian neón
  0xff007f, // Magenta neón
  0x10b981, // Verde esmeralda
  0xfbbf24, // Ámbar dorado
  0xa855f7, // Púrpura cuántico
  0xf97316, // Naranja solar
  0x38bdf8, // Azul cielo eléctrico
  0xec4899, // Rosa fluorescente
  0x22c55e, // Lima cibernético
  0xf43f5e  // Rojo carmesí
];

/**
 * EnergyProjectile.js — Proyectil de energía multidireccional y policromático en NEUROQUEST.
 * Puede dispararse horizontalmente o dirigido hacia cualquier punto donde el usuario haga clic o tap táctil.
 */
export class EnergyProjectile extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number|Object} optionsOrDirection - Dirección (-1/1) u objeto de opciones con targetX/Y, angle, color
   */
  constructor(scene, x, y, optionsOrDirection = 1) {
    super(scene, x, y, 'projectile_energy');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.speed = 520;
    this.damage = 1;

    // Configurar físicas
    if (this.body) {
      this.body.allowGravity = false;
      this.body.gravity.set(0, 0);
    }
    this.body.setSize(14, 14);
    this.body.setOffset(1, 1);

    // Selección aleatoria o asignada de color neón
    const isOptionsObj = typeof optionsOrDirection === 'object' && optionsOrDirection !== null;
    const options = isOptionsObj ? optionsOrDirection : {};

    if (options.color !== undefined) {
      this.bulletColor = options.color;
    } else {
      this.bulletColor = Phaser.Utils.Array.GetRandom(PROJECTILE_COLORS);
    }
    this.setTint(this.bulletColor);

    // Determinar vector de velocidad y rotación lineal sin caída
    if (options.targetX !== undefined && options.targetY !== undefined) {
      const angle = Phaser.Math.Angle.Between(x, y, options.targetX, options.targetY);
      this.direction = Math.cos(angle) >= 0 ? 1 : -1;
      this.targetVx = Math.cos(angle) * this.speed;
      this.targetVy = Math.sin(angle) * this.speed;
      this.setVelocity(this.targetVx, this.targetVy);
      this.setRotation(angle);
    } else if (options.angle !== undefined) {
      this.direction = Math.cos(options.angle) >= 0 ? 1 : -1;
      this.targetVx = Math.cos(options.angle) * this.speed;
      this.targetVy = Math.sin(options.angle) * this.speed;
      this.setVelocity(this.targetVx, this.targetVy);
      this.setRotation(options.angle);
    } else {
      const dir = typeof optionsOrDirection === 'number' ? optionsOrDirection : (options.direction || 1);
      this.direction = dir;
      this.targetVx = this.direction * this.speed;
      this.targetVy = 0;
      this.setVelocity(this.targetVx, this.targetVy);
      this.setRotation(this.direction === -1 ? Math.PI : 0);
    }

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

    if (this.body) {
      this.body.allowGravity = false;
      // Mantener trayectoria rectilínea ininterrumpida sin caída por gravedad
      if (this.targetVx !== undefined && this.targetVy !== undefined) {
        this.setVelocity(this.targetVx, this.targetVy);
      }
    }

    // Si sale de los límites de la cámara / mundo
    if (
      this.x < 0 ||
      this.x > this.scene.physics.world.bounds.width ||
      this.y < 0 ||
      this.y > this.scene.physics.world.bounds.height
    ) {
      this.explode(false);
    }
  }

  /**
   * Genera micro-partículas de impacto en el color del proyectil y lo destruye.
   * @param {boolean} hitTarget
   */
  explode(hitTarget = true) {
    if (!this.active) return;

    if (this.lifespanTimer) {
      this.lifespanTimer.remove();
      this.lifespanTimer = null;
    }

    if (this.scene) {
      // Destello de chispas en el punto de contacto con el color exacto de la bala
      const sparks = this.scene.add.graphics();
      const sparkColor = this.bulletColor || (hitTarget ? 0x00f0ff : 0x38bdf8);
      sparks.fillStyle(sparkColor, 0.95);

      for (let i = 0; i < 6; i++) {
        const ox = (Math.random() * 18) - 9;
        const oy = (Math.random() * 18) - 9;
        sparks.fillCircle(this.x + ox, this.y + oy, Math.random() * 2.5 + 1.5);
      }

      this.scene.tweens.add({
        targets: sparks,
        alpha: 0,
        scaleX: 1.6,
        scaleY: 1.6,
        duration: 200,
        onComplete: () => {
          sparks.destroy();
        }
      });
    }

    this.destroy();
  }
}
