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
    this.hp = options.hp !== undefined ? options.hp : 2;
    this.maxHp = this.hp;
    this.lastDamageTime = 0; // Cooldown de 2s para no infligir daño continuo al jugador
    this.state = 'PATROL'; // PATROL, SEARCH, CHASE, ATTACKING, COMBAT, HURT, DYING, DEAD
    this.combatCooldownTimer = 0;
    
    // Control de diálogos para no saturar pantalla
    this.dialogCooldown = 0;
    this.assignedChallenge = options.challenge || null;

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
   * Impacto de proyectil del jugador sobre MatBot.
   * Se desestabiliza y retrocede, pero NO se destruye con balas:
   * Requiere responder la pregunta en el duelo curricular para ser derrotado.
   * @param {import('./EnergyProjectile.js').EnergyProjectile} projectile
   */
  takeProjectileDamage(projectile) {
    if (!this.isAlive || this.state === 'DEAD' || this.state === 'COMBAT' || this.state === 'DYING') return;

    this.scene.soundManager?.playHit();

    // Destello de desestabilización
    this.setTint(0xfde047);
    this.scene.time.delayedCall(140, () => {
      if (this.active && this.isAlive) this.clearTint();
    });

    // Retroceso por impacto
    const pushDir = projectile?.direction || (this.x > (this.scene.player?.x || 0) ? 1 : -1);
    this.setVelocityX(pushDir * 160);

    // Diálogo cómico recordando la regla pedagógica
    this.mostrarDialogo("¡Debes responder mi pregunta!", '#fbbf24');
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

    // Salvaguarda física contra caída al vacío / fuera del mapa
    if (this.y > 580 && this.isAlive) {
      this.x = this.spawnX;
      this.y = this.spawnY;
      this.setVelocity(0, 0);
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

    // No alejarse más allá del margen seguro de patrulla para no caer al abismo
    const maxChaseDist = this.patrolRange + 95;
    if (Math.abs(this.x - this.spawnX) > maxChaseDist) {
      this.direction = this.x > this.spawnX ? -1 : 1;
      this.setVelocityX(this.direction * this.patrolSpeed);
      this.state = 'PATROL';
      return;
    }

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

    // Disparar animación oficial de ataque según tipo de enemigo o fallback seguro
    if (this.scene.anims.exists('matbot_attack') && (this.texture.key === 'matbot' || this.texture.key === 'matbot_texture')) {
      this.play('matbot_attack', true);
    } else if (this.scene.anims.exists(`${this.botType}_attack`)) {
      this.play(`${this.botType}_attack`, true);
      this.once(`animationcomplete-${this.botType}_attack`, () => {
        if (this.isAlive && this.state === 'ATTACKING') {
          this.state = 'COMBAT';
          if (typeof this.scene.startCombatDuel === 'function') {
            this.scene.startCombatDuel(this);
          }
        }
      });
    } else {
      this.scene.time.delayedCall(380, () => {
        if (this.isAlive && this.state === 'ATTACKING') {
          this.state = 'COMBAT';
          if (typeof this.scene.startCombatDuel === 'function') {
            this.scene.startCombatDuel(this);
          }
        }
      });
    }

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
   * Ejecuta la secuencia y efectos de derrota al contestar correctamente en el duelo.
   * Desactiva físicas inmediatamente, produce explosión y despawnea por completo sin dejar restos en el suelo.
   */
  playDefeat(onComplete) {
    if (!this.isAlive && this.state === 'DEAD') return;
    this.isAlive = false;
    this.state = 'DEAD';

    const deathX = this.x;
    const deathY = this.y;
    const currentScene = this.scene;

    // Desactivar físicas y ocultar inmediatamente para que no vuelva a colisionar ni preguntar
    if (this.body) {
      this.body.enable = false;
    }
    this.setVelocity(0, 0);
    this.setVisible(false);

    // Efecto de sonido de explosión
    if (currentScene?.soundManager) {
      currentScene.soundManager.playExplosion();
    }

    // Chispas de sobrecarga de circuito en el punto de muerte
    if (currentScene && currentScene.add) {
      const sparks = currentScene.add.graphics();
      sparks.fillStyle(0xf59e0b, 0.95);
      for (let i = 0; i < 12; i++) {
        sparks.fillCircle(deathX + (Math.random() * 36 - 18), deathY + (Math.random() * 36 - 18), Math.random() * 3 + 1);
      }
      currentScene.tweens.add({
        targets: sparks,
        alpha: 0,
        scaleX: 1.8,
        scaleY: 1.8,
        duration: 350,
        onComplete: () => sparks.destroy()
      });
    }

    if (typeof onComplete === 'function') {
      onComplete();
    }

    this.destroyMatBot();
  }

  setCooldown(durationMs = 3500) {
    this.combatCooldownTimer = durationMs;
    this.state = 'PATROL';
    this.direction = -this.direction;
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

    if (this.onAnimationCompleteAttack) {
      this.off('animationcomplete-matbot_attack', this.onAnimationCompleteAttack);
    }
    if (this.onAnimationCompleteDie) {
      this.off('animationcomplete-matbot_die', this.onAnimationCompleteDie);
    }

    if (this.body) {
      this.body.enable = false;
    }

    if (this.scene?.matbotGroup) {
      this.scene.matbotGroup.remove(this, false, false);
    }
    if (this.scene?.matbots) {
      const idx = this.scene.matbots.indexOf(this);
      if (idx !== -1) {
        this.scene.matbots.splice(idx, 1);
      }
    }

    this.destroy();
  }
}