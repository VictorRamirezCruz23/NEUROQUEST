import Phaser from 'phaser';

/**
 * MatBot.js — Entidad del enemigo robótico "MatBot" en NEUROQUEST.
 * Maneja inteligencia artificial de patrullaje, detección del jugador, animación de ataque
 * y un sistema de diálogos flotantes cómicos.
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

    // Reducción de tamaño y ajuste proporcional de la escala física
    this.setScale(0.45);
    this.setCollideWorldBounds(true);

    // Caja física arcade adaptada al nuevo tamaño reducido del sprite
    this.body.setSize(95, 90);
    this.body.setOffset(72, 110);

    // Parámetros de comportamiento y patrulla
    this.spawnX = x;
    this.patrolRange = options.patrolRange || 110;
    this.patrolSpeed = 60;
    this.chaseSpeed = 95;
    this.detectionRadius = 170;
    this.attackRadius = 75;

    this.direction = 1; // 1 = derecha, -1 = izquierda
    this.isAlive = true;
    this.state = 'PATROL'; // PATROL, SEARCH, CHASE, ATTACKING, COMBAT, HURT, DYING, DEAD
    this.combatCooldownTimer = 0;
    
    // Control de diálogos para no saturar pantalla
    this.dialogCooldown = 0;

    this.play('matbot_walk');

    // Escuchas de eventos de animación
    this.onAnimationCompleteAttack = () => {
      if (this.isAlive && this.state === 'ATTACKING') {
        this.state = 'COMBAT';
        if (typeof this.scene.startCombatDuel === 'function') {
          this.scene.startCombatDuel(this);
        }
      }
    };
    this.on('animationcomplete-matbot_attack', this.onAnimationCompleteAttack);

    this.onAnimationCompleteDie = () => {
      this.state = 'DEAD';
      this.destroyMatBot();
    };
    this.on('animationcomplete-matbot_die', this.onAnimationCompleteDie);
  }

  /**
   * Bucle de actualización por fotograma del MatBot.
   */
  updateAI(time, delta, player) {
    if (!this.isAlive || this.state === 'DEAD' || this.state === 'COMBAT' || this.state === 'DYING') {
      return;
    }

    if (this.combatCooldownTimer > 0) {
      this.combatCooldownTimer -= delta;
    }

    if (this.dialogCooldown > 0) {
      this.dialogCooldown -= delta;
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

    // 2. Rango de Persecución / Sorpresa
    if (dist <= this.detectionRadius && verticalDist < 90 && this.state !== 'ATTACKING') {
      // Si pasa de PATROL a CHASE de golpe y está muy cerca, mostrar reacción de sorpresa
      if (this.state === 'PATROL' && dist < 90 && this.dialogCooldown <= 0) {
        const sustos = ["¡¿Y tú de dónde saliste?!", "¡Alerta humana!", "¡Uy, qué susto!"];
        this.mostrarDialogo(Phaser.Math.RND.pick(sustos), '#f59e0b');
        this.dialogCooldown = 4000;
      }
      this.chasePlayer(player);
      return;
    }

    // Si estaba persiguiendo y perdió al jugador, entra en modo búsqueda un momento
    if (this.state === 'CHASE' && dist > this.detectionRadius + 30) {
      this.state = 'SEARCH';
      if (this.dialogCooldown <= 0) {
        const busqueda = ["¿Dónde se metió?", "¡Sal de ahí, humano!", "Error: objetivo perdido..."];
        this.mostrarDialogo(Phaser.Math.RND.pick(busqueda), '#38bdf8');
        this.dialogCooldown = 5000;
      }
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

    // Frase cómica al atacar
    const ataques = ["¡A calcular tu derrota!", "¡Calculadora en mano!", "¡Fallo en tu lógica!"];
    this.mostrarDialogo(Phaser.Math.RND.pick(ataques), '#ef4444');

    // Crear destello de alerta roja sobre el MatBot
    const alertGfx = this.scene.add.text(this.x, this.y - 70, '⚠️ ¡ATAQUE!', {
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
   * Método para mostrar burbujas de diálogo flotantes sobre el bot
   */
  mostrarDialogo(texto, colorHex = '#38bdf8') {
    if (!this.scene || !this.scene.add) return;

    const dialogBubble = this.scene.add.text(this.x, this.y - 50, texto, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      padding: { x: 8, y: 4 },
      align: 'center'
    }).setOrigin(0.5).setDepth(999);

    // Animación de aparición flotante y desvanecimiento
    this.scene.tweens.add({
      targets: dialogBubble,
      y: dialogBubble.y - 25,
      alpha: { from: 1, to: 0 },
      duration: 2200,
      ease: 'Power1',
      onUpdate: () => {
        // Seguir al bot suavemente mientras dura el tween si sigue vivo
        if (this && this.active) {
          dialogBubble.x = this.x;
        }
      },
      onComplete: () => dialogBubble.destroy()
    });
  }

  /**
   * Ejecuta la animación y efectos de derrota al responder bien el jugador.
   */
  playDefeat(onComplete) {
    this.isAlive = false;
    this.state = 'DYING';
    this.setVelocity(0, 0);

    // Frase cómica de derrota
    this.mostrarDialogo("¡Error... 404... cerebro... frito...", '#f59e0b');

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

    this.play('matbot_hurt', true);
    this.scene.time.delayedCall(250, () => {
      this.play('matbot_die', true);
    });

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

  setCooldown(durationMs = 3500) {
    this.combatCooldownTimer = durationMs;
    this.state = 'PATROL';
    this.direction = -this.direction;
    this.setVelocityX(this.direction * this.patrolSpeed);
    this.setFlipX(this.direction < 0);
    this.play('matbot_walk', true);
  }

  destroyMatBot() {
    this.isAlive = false;
    this.state = 'DEAD';

    if (this.onAnimationCompleteAttack) {
      this.off('animationcomplete-matbot_attack', this.onAnimationCompleteAttack);
    }
    if (this.onAnimationCompleteDie) {
      this.off('animationcomplete-matbot_die', this.onAnimationCompleteDie);
    }

    if (this.body) {
      this.body.enable = false;
    }
    this.destroy();
  }
}