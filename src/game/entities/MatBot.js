import Phaser from 'phaser';

/**
 * MatBot.js — Entidad del enemigo robótico "MatBot" en NEUROQUEST.
 * Maneja inteligencia artificial de patrullaje, detección del jugador, animación de ataque
 * y transición al combate interactivo por preguntas curriculares.
 */
export class MatBot extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene - Escena contenedora
   * @param {number} x - Coordenada X inicial
   * @param {number} y - Coordenada Y inicial
   * @param {Object} [options] - Parámetros de configuración
   */
  constructor(scene, x, y, options = {}) {
    const mTex = scene.textures.exists('matbot_texture') ? 'matbot_texture' : 'matbot';
    super(scene, x, y, mTex, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Escala equilibrada y proporcionada al personaje
    this.setScale(0.5);
    this.setCollideWorldBounds(true);

    // Caja de colisión física arcade adaptada al sprite de 200x200
    this.body.setSize(90, 150);
    this.body.setOffset(55, 45);

    // Parámetros de comportamiento y patrulla
    this.spawnX = x;
    this.patrolRange = options.patrolRange || 110;
    this.patrolSpeed = 60;
    this.chaseSpeed = 95;
    this.detectionRadius = 170;
    this.attackRadius = 75;

    this.direction = 1; // 1 = derecha, -1 = izquierda
    this.isAlive = true;
    this.state = 'PATROL'; // PATROL, CHASE, ATTACKING, COMBAT, HURT, DYING, DEAD
    this.combatCooldownTimer = 0;
    this.assignedChallenge = options.challenge || null;

    this.play('matbot_walk');

    // Escuchar término de animación de ataque para iniciar el duelo
    this.on('animationcomplete-matbot_attack', () => {
      if (this.isAlive && this.state === 'ATTACKING') {
        this.state = 'COMBAT';
        if (typeof this.scene.startCombatDuel === 'function') {
          this.scene.startCombatDuel(this);
        }
      }
    });

    // Escuchar término de animación de muerte
    this.on('animationcomplete-matbot_die', () => {
      this.state = 'DEAD';
      this.destroyMatBot();
    });
  }

  /**
   * Bucle de actualización por fotograma del MatBot.
   * @param {number} time
   * @param {number} delta
   * @param {import('./Player.js').Player} player
   */
  updateAI(time, delta, player) {
    if (!this.isAlive || this.state === 'DEAD' || this.state === 'COMBAT' || this.state === 'DYING') {
      return;
    }

    if (this.combatCooldownTimer > 0) {
      this.combatCooldownTimer -= delta;
    }

    if (!player || !player.body) {
      this.patrol();
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const verticalDist = Math.abs(this.y - player.y);

    // Si está en enfriamiento de combate, patrullar sin atacar
    if (this.combatCooldownTimer > 0) {
      this.patrol();
      return;
    }

    // 1. Rango de Ataque (cercano y en la misma altura relativa)
    if (dist <= this.attackRadius && verticalDist < 60 && this.state !== 'ATTACKING') {
      this.executeAttack(player);
      return;
    }

    // 2. Rango de Persecución
    if (dist <= this.detectionRadius && verticalDist < 90 && this.state !== 'ATTACKING') {
      this.chasePlayer(player);
      return;
    }

    // 3. Patrullaje estándar
    if (this.state !== 'ATTACKING') {
      this.patrol();
    }
  }

  patrol() {
    this.state = 'PATROL';
    const leftBound = this.spawnX - this.patrolRange;
    const rightBound = this.spawnX + this.patrolRange;

    if (this.x >= rightBound) {
      this.direction = -1;
    } else if (this.x <= leftBound) {
      this.direction = 1;
    }

    this.setVelocityX(this.direction * this.patrolSpeed);
    this.setFlipX(this.direction < 0);

    if (this.anims.currentAnim?.key !== 'matbot_walk') {
      this.play('matbot_walk', true);
    }
  }

  chasePlayer(player) {
    this.state = 'CHASE';
    this.direction = player.x < this.x ? -1 : 1;
    this.setVelocityX(this.direction * this.chaseSpeed);
    this.setFlipX(this.direction < 0);

    if (this.anims.currentAnim?.key !== 'matbot_walk') {
      this.play('matbot_walk', true);
    }
  }

  executeAttack(player) {
    this.state = 'ATTACKING';
    this.setVelocityX(0);

    // Orientar hacia el jugador antes de atacar
    this.direction = player.x < this.x ? -1 : 1;
    this.setFlipX(this.direction < 0);

    // Disparar animación oficial de ataque
    this.play('matbot_attack', true);

    // Crear destello de alerta roja sobre el MatBot
    const alertGfx = this.scene.add.text(this.x, this.y - 50, '⚠️ ¡ATAQUE!', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ef4444',
      fontStyle: 'bold',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(1000);

    this.scene.tweens.add({
      targets: alertGfx,
      y: alertGfx.y - 20,
      alpha: 0,
      duration: 900,
      onComplete: () => alertGfx.destroy()
    });
  }

  /**
   * Ejecuta la animación y efectos de derrota al responder bien el jugador.
   * @param {Function} [onComplete]
   */
  playDefeat(onComplete) {
    this.isAlive = false;
    this.state = 'DYING';
    this.setVelocity(0, 0);

    // Efecto de chispas y partículas de circuito
    const emitter = this.scene.add.particles(this.x, this.y, 'tile_platform', {
      speed: { min: 40, max: 140 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.15, end: 0 },
      tint: [0xef4444, 0xf59e0b, 0x38bdf8],
      lifespan: 600,
      quantity: 12
    });

    this.scene.time.delayedCall(500, () => emitter.destroy());

    // Reproducir secuencia de daño y desintegración
    this.play('matbot_hurt', true);
    this.scene.time.delayedCall(250, () => {
      this.play('matbot_die', true);
    });

    // Tween de desvanecimiento
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 700,
      ease: 'Power2',
      onComplete: () => {
        if (typeof onComplete === 'function') onComplete();
        this.destroyMatBot();
      }
    });
  }

  /**
   * Aplica un enfriamiento tras un ataque fallido del jugador para permitir distanciamiento.
   * @param {number} durationMs
   */
  setCooldown(durationMs = 3500) {
    this.combatCooldownTimer = durationMs;
    this.state = 'PATROL';
    this.direction = -this.direction; // Retroceder un poco
    this.setVelocityX(this.direction * this.patrolSpeed);
    this.setFlipX(this.direction < 0);
    this.play('matbot_walk', true);
  }

  /**
   * Asigna un desafío pedagógico al MatBot para su duelo de combate.
   * @param {Object|null} challenge
   */
  setChallenge(challenge) {
    this.assignedChallenge = challenge || null;
  }

  /**
   * Obtiene el desafío pedagógico asignado al MatBot.
   * @returns {Object|null}
   */
  getChallenge() {
    return this.assignedChallenge;
  }

  destroyMatBot() {
    this.isAlive = false;
    this.state = 'DEAD';
    if (this.body) {
      this.body.enable = false;
    }
    this.destroy();
  }
}
