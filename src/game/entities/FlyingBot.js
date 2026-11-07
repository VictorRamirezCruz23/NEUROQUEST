import Phaser from 'phaser';

/**
 * FlyingBot.js — Entidad base de enemigos voladores en NEUROQUEST (OwlBot y AjoloteBot).
 *
 * Características requeridas:
 * 1. Patrullan volando con oscilación sinusoidal flotante.
 * 2. Persiguen al jugador al detectarlo en su radio de visión.
 * 3. SON LOS ÚNICOS ENEMIGOS QUE PUEDEN SER DESTRUIDOS DIRECTAMENTE MEDIANTE DISPAROS.
 * 4. Al morir, despliegan explosión robótica, sonido de impacto y feedback de puntuación sin abrir cuestionario.
 */
export class FlyingBot extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} options
   * @param {'owlbot'|'ajolotebot'} [options.type='owlbot']
   * @param {number} [options.patrolRange=140]
   * @param {number} [options.hp=1]
   */
  constructor(scene, x, y, options = {}) {
    const type = options.type || 'owlbot';
    const texKey = type === 'ajolotebot' ? 'ajolotebot_texture' : 'owlbot_texture';
    const finalKey = scene.textures.exists(texKey) ? texKey : 'matbot';

    super(scene, x, y, finalKey, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.botType = type;
    this.name = type === 'ajolotebot' ? 'AjoloteBot Aerodinámico' : 'OwlBot Vigilante';
    this.isFlying = true;
    this.isAlive = true;
    this.hp = options.hp !== undefined ? options.hp : (type === 'ajolotebot' ? 2 : 1);
    this.maxHp = this.hp;

    this.spawnX = x;
    this.spawnY = y;
    this.patrolRange = options.patrolRange || 140;
    this.flySpeed = type === 'ajolotebot' ? 110 : 85;
    this.chaseSpeed = type === 'ajolotebot' ? 150 : 130;
    this.detectionRadius = 260;
    this.direction = 1;
    this.lastDamageTime = 0; // Cooldown de 2s para no infligir daño continuo
    this.state = 'PATROL'; // 'PATROL', 'CHASE', 'HURT', 'DEAD'

    // Físicas aéreas (sin gravedad)
    if (this.body) {
      this.body.allowGravity = false;
      this.body.setSize(85, 85);
      this.body.setOffset(77, 77);
    }
    this.setScale(0.40);
    this.setCollideWorldBounds(true);

    const animKey = type === 'ajolotebot' ? 'ajolotebot_fly' : 'owlbot_fly';
    if (scene.anims.exists(animKey)) {
      this.play(animKey);
    }

    // Animación de pulso/flotación visual
    this.floatTimer = 0;

    // Etiqueta flotante con nombre
    this.nameText = scene.add.text(x, y - 36, this.botType === 'ajolotebot' ? '🛸 AJOLOTE-BOT' : '🦉 OWL-BOT', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: this.botType === 'ajolotebot' ? '#fb7185' : '#38bdf8',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (!this.active || !this.isAlive) {
      if (this.nameText && this.nameText.active) this.nameText.setVisible(false);
      return;
    }

    this.floatTimer += delta * 0.004;

    // Mantener altitud segura: evitar penetrar el suelo o caer del mapa
    const floorLimit = (this.scene.groundY || 430) - 70;
    if (this.y > floorLimit) {
      this.y = floorLimit;
      if (this.body && this.body.velocity.y > 0) {
        this.body.velocity.y = 0;
      }
    }

    // Actualizar posición de la etiqueta flotante
    if (this.nameText && this.nameText.active) {
      this.nameText.setPosition(this.x, this.y - 36);
    }

    const player = this.scene.player;
    if (!player || !player.active) {
      this.patrolMotion();
      return;
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    if (distToPlayer <= this.detectionRadius) {
      this.state = 'CHASE';
      this.chasePlayer(player);
    } else {
      this.state = 'PATROL';
      this.patrolMotion();
    }
  }

  patrolMotion() {
    // Oscilación vertical suave respetando el límite superior del suelo
    const floorLimit = (this.scene.groundY || 430) - 75;
    const targetY = Math.min(this.spawnY + Math.sin(this.floatTimer) * 22, floorLimit);
    this.y = Phaser.Math.Linear(this.y, targetY, 0.08);

    // Movimiento horizontal en rango de patrulla
    this.setVelocityX(this.direction * this.flySpeed);
    this.setFlipX(this.direction < 0);

    if (this.x > this.spawnX + this.patrolRange) {
      this.direction = -1;
    } else if (this.x < this.spawnX - this.patrolRange) {
      this.direction = 1;
    }
  }

  chasePlayer(player) {
    const floorLimit = (this.scene.groundY || 430) - 75;
    const targetY = Phaser.Math.Clamp(player.y - 45, 120, floorLimit);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, targetY);
    this.setVelocity(
      Math.cos(angle) * this.chaseSpeed,
      Math.sin(angle) * this.chaseSpeed
    );

    this.setFlipX(player.x < this.x);
  }

  /**
   * Recibe impacto de un proyectil de energía azul del jugador.
   * Si HP llega a cero, se destruye directamente con explosión.
   * @param {import('./EnergyProjectile.js').EnergyProjectile} projectile
   */
  takeProjectileDamage(projectile) {
    if (!this.isAlive) return;

    this.hp -= (projectile?.damage || 1);

    // Destello de daño
    this.setTint(0xff0055);
    this.scene.time.delayedCall(120, () => {
      if (this.active && this.isAlive) this.clearTint();
    });

    if (this.hp <= 0) {
      this.destroyWithExplosion();
    } else {
      // Retroceso sutil por impacto
      const pushDir = projectile?.direction || (this.flipX ? 1 : -1);
      this.setVelocityX(pushDir * 180);
      this.scene.soundManager?.playHit();
    }
  }

  /**
   * Explosión robótica definitiva y eliminación del enemigo aéreo con despawn completo.
   */
  destroyWithExplosion() {
    if (!this.isAlive) return;
    this.isAlive = false;

    // Desactivar físicas inmediatamente para que no colisione ni haga daño mientras desaparece
    if (this.body) {
      this.body.enable = false;
    }
    this.setVelocity(0, 0);

    // Remover de listas y grupos de escena de inmediato
    if (this.scene?.flyingGroup) {
      this.scene.flyingGroup.remove(this, false, false);
    }
    if (this.scene?.flyingBots) {
      const idx = this.scene.flyingBots.indexOf(this);
      if (idx !== -1) {
        this.scene.flyingBots.splice(idx, 1);
      }
    }

    // Sonido de explosión espacial
    if (this.scene?.soundManager) {
      this.scene.soundManager.playExplosion();
    }

    // Registrar eliminación en la escena
    if (this.scene) {
      this.scene.enemiesDefeated = (this.scene.enemiesDefeated || 0) + 1;
      this.scene.checkAllEnemiesDefeated?.();
    }

    // Vibración de cámara
    this.scene?.cameras?.main?.shake(180, 0.012);

    // Destruir texto de nombre
    if (this.nameText) {
      this.nameText.destroy();
      this.nameText = null;
    }

    // Texto flotante de puntuación
    const scoreText = this.scene.add.text(this.x, this.y - 10, '+150 PTS ⚡', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#34d399',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: scoreText,
      y: this.y - 45,
      alpha: 0,
      duration: 650,
      onComplete: () => scoreText.destroy()
    });

    // Anillo expansivo de onda de choque
    const shockwave = this.scene.add.graphics();
    shockwave.lineStyle(3, this.botType === 'ajolotebot' ? 0xf43f5e : 0x00f0ff, 1);
    shockwave.strokeCircle(this.x, this.y, 16);

    this.scene.tweens.add({
      targets: shockwave,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 350,
      onComplete: () => shockwave.destroy()
    });

    // Desvanecimiento del sprite y despawn definitivo
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.1,
      scaleY: 0.1,
      duration: 200,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  destroy(fromScene) {
    if (this.nameText) {
      this.nameText.destroy();
      this.nameText = null;
    }
    super.destroy(fromScene);
  }
}
