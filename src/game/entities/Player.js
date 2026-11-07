import Phaser from 'phaser';
import { sessionState } from '../../core/sessionState.js';
import { EnergyProjectile } from './EnergyProjectile.js';

/**
 * Player.js — Entidad principal del jugador en NEUROQUEST.
 * Incluye físicas mejoradas, Coyote Time, Jump Buffer, disparo de proyectiles de energía,
 * personalización de paleta y control híbrido.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    const texKey = scene.textures.exists('player_texture') ? 'player_texture' : 'player';
    super(scene, x, y, texKey, 1);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.28);
    this.setCollideWorldBounds(true);
    this.body.setSize(80, 240);
    this.body.setOffset(60, 80);

    // Parámetros de física de movimiento optimizados
    this.speed = 220;
    this.runSpeed = 330;
    this.jumpForce = -420;
    this.isLocked = false;
    this.isAttacking = false;
    this.isCrouching = false;
    this.lastShootTime = 0;
    this.shootCooldown = 260; // ms entre disparos

    // Variables para Coyote Time y Jump Buffer
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.coyoteDuration = 120; // milisegundos de gracia al caer de una plataforma
    this.jumpBufferDuration = 100; // milisegundos de memoria de salto

    this.virtualInput = {
      left: false, right: false, running: false, jump: false, punch: false, crouch: false
    };

    // Aplicar paleta de color personalizada
    this.applyPalette();

    // Controles de teclado
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyShift = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyJ = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keyK = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.keyF = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.keyX = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    this.play('player_idle');

    this.on('animationcomplete-player_punch', () => this.finishAttack());
    this.on('animationcomplete-player_attack', () => this.finishAttack());
  }

  applyPalette() {
    const pal = sessionState.getPlayerPalette();
    if (pal && pal.tint) {
      this.setTint(pal.tint);
    } else {
      this.clearTint();
    }
  }

  updatePalette() {
    this.applyPalette();
  }

  update(time, delta) {
    if (this.isLocked) {
      this.setVelocityX(0);
      return;
    }

    const onFloor = this.body.blocked.down || this.body.touching.down;

    // Actualizar Coyote Time
    if (onFloor) {
      this.coyoteTimer = this.coyoteDuration;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer -= delta;
    }

    // Actualizar Jump Buffer
    const jumpRequestedRaw = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                            Phaser.Input.Keyboard.JustDown(this.keyW) ||
                            Phaser.Input.Keyboard.JustDown(this.keySpace) ||
                            this.virtualInput.jump;

    if (jumpRequestedRaw) {
      if (this.isCrouching) {
        this.isCrouching = false;
        this.body.setSize(80, 240);
        this.body.setOffset(60, 80);
      }
      this.jumpBufferTimer = this.jumpBufferDuration;
      this.virtualInput.jump = false;
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= delta;
    }

    // Acción de Agacharse (Permite caminar agachado fluidamente con S o Flecha Abajo)
    const crouchRequested = (this.cursors.down.isDown || this.keyS.isDown || this.virtualInput.crouch) && (onFloor || this.isCrouching);

    if (crouchRequested) {
      if (!this.isCrouching) {
        this.isCrouching = true;
        // Reducir la caja de colisión exactamente a la mitad de altura (120 px)
        // Offset Y = 200 para que la base permanezca perfectamente apoyada sobre el suelo
        this.body.setSize(80, 120);
        this.body.setOffset(60, 200);
      }

      // Desplazamiento horizontal fluido mientras se camina agachado (Crouch Walk)
      const moveLeft = (this.cursors.left.isDown || this.keyA.isDown || this.virtualInput.left);
      const moveRight = (this.cursors.right.isDown || this.keyD.isDown || this.virtualInput.right);
      const crouchSpeed = Math.round(this.speed * 0.65);

      if (moveLeft && !moveRight) {
        this.setVelocityX(-crouchSpeed);
        this.setFlipX(true);
      } else if (moveRight && !moveLeft) {
        this.setVelocityX(crouchSpeed);
        this.setFlipX(false);
      } else {
        this.setVelocityX(0);
      }

      // Conmutar fluidamente entre caminar agachado (player_crouch_walk) y agachado estático (player_crouch)
      const isCrouchMoving = Math.abs(this.body.velocity.x) > 5;
      const targetCrouchAnim = isCrouchMoving ? 'player_crouch_walk' : 'player_crouch';
      if (this.anims.currentAnim?.key !== targetCrouchAnim) {
        this.play(this.scene.anims.exists(targetCrouchAnim) ? targetCrouchAnim : 'player_crouch', true);
      }
      return;
    } else {
      if (this.isCrouching) {
        this.isCrouching = false;
        // Restaurar caja de colisión normal completa de pie (240 px de alto)
        this.body.setSize(80, 240);
        this.body.setOffset(60, 80);

        // Transición inmediata al incorporarse
        const isMoving = Math.abs(this.body.velocity.x) > 10;
        if (isMoving) {
          const isRunning = (this.keyShift.isDown || this.virtualInput.running);
          this.play(isRunning ? 'player_run' : 'player_walk', true);
        } else {
          this.play('player_idle', true);
        }
      }
    }

    // Ataque
    const punchTriggered = Phaser.Input.Keyboard.JustDown(this.keyJ) ||
                           Phaser.Input.Keyboard.JustDown(this.keyK) ||
                           Phaser.Input.Keyboard.JustDown(this.keyF) ||
                           Phaser.Input.Keyboard.JustDown(this.keyX) ||
                           this.virtualInput.punch;

    if (punchTriggered && !this.isAttacking) {
      this.virtualInput.punch = false;
      this.performAttack();
    }

    if (this.isAttacking) {
      const curKey = this.anims.currentAnim?.key;
      if (!this.anims.isPlaying || (curKey !== 'player_attack' && curKey !== 'player_punch')) {
        this.finishAttack();
      } else {
        this.setVelocityX(this.body.velocity.x * 0.85);
        return;
      }
    }

    // Movimiento horizontal con inercia suave
    const moveLeft = (this.cursors.left.isDown || this.keyA.isDown || this.virtualInput.left);
    const moveRight = (this.cursors.right.isDown || this.keyD.isDown || this.virtualInput.right);
    const isRunning = (this.keyShift.isDown || this.virtualInput.running);
    const targetSpeed = isRunning ? this.runSpeed : this.speed;

    if (moveLeft && !moveRight) {
      this.setFlipX(true);
      // Interpolación suave hacia la velocidad deseada (aceleración fluida)
      this.setVelocityX(Phaser.Math.Linear(this.body.velocity.x, -targetSpeed, 0.2));
    } else if (moveRight && !moveLeft) {
      this.setFlipX(false);
      this.setVelocityX(Phaser.Math.Linear(this.body.velocity.x, targetSpeed, 0.2));
    } else {
      // Desaceleración suave (fricción al frenar)
      this.setVelocityX(Phaser.Math.Linear(this.body.velocity.x, 0, 0.25));
    }

    // Ejecución de salto usando Coyote Time y Jump Buffer
    if (this.jumpBufferTimer > 0 && (onFloor || this.coyoteTimer > 0)) {
      this.setVelocityY(this.jumpForce);
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      
      // Pequeño squash visual al saltar
      this.scene.tweens.add({
        targets: this,
        scaleX: 0.24,
        scaleY: 0.32,
        duration: 80,
        yoyo: true
      });
    }

    // Animaciones de aire y suelo
    if (!onFloor) {
      if (this.body.velocity.y < -50) {
        if (this.anims.currentAnim?.key !== 'player_jump') this.play('player_jump', true);
      } else if (this.body.velocity.y >= -50 && this.body.velocity.y <= 50) {
        if (this.anims.currentAnim?.key !== 'player_jump_peak') this.play('player_jump_peak', true);
      } else {
        if (this.anims.currentAnim?.key !== 'player_fall') this.play('player_fall', true);
      }
    } else {
      if (Math.abs(this.body.velocity.x) > 15) {
        const targetAnim = isRunning ? 'player_run' : 'player_walk';
        if (this.anims.currentAnim?.key !== targetAnim) this.play(targetAnim, true);
      } else {
        if (this.anims.currentAnim?.key !== 'player_idle') this.play('player_idle', true);
      }
    }
  }

  performAttack() {
    this.shoot();
  }

  /**
   * Dispara una bolita de energía azul en la dirección que mira el jugador.
   */
  shoot() {
    if (this.isLocked) return;

    const now = Date.now();
    if (now - this.lastShootTime < this.shootCooldown) return;
    this.lastShootTime = now;

    this.isAttacking = true;

    if (this.scene.soundManager && typeof this.scene.soundManager.playLaser === 'function') {
      this.scene.soundManager.playLaser();
    }

    const key = this.scene.anims.exists('player_attack') ? 'player_attack' : 'player_punch';
    if (this.scene.anims.exists(key)) {
      this.play(key, true);
    }

    // Instanciar proyectil de energía azul
    const dir = this.flipX ? -1 : 1;
    const spawnX = this.x + (dir * 28);
    const spawnY = this.y - 8;
    const proj = new EnergyProjectile(this.scene, spawnX, spawnY, dir);

    if (this.scene.playerProjectiles) {
      this.scene.playerProjectiles.add(proj);
    }

    if (this.attackSafetyTimer) this.attackSafetyTimer.remove();
    this.attackSafetyTimer = this.scene.time.delayedCall(320, () => {
      if (this.isAttacking) this.finishAttack();
    });
  }

  finishAttack() {
    this.isAttacking = false;
    if (this.attackSafetyTimer) {
      this.attackSafetyTimer.remove();
      this.attackSafetyTimer = null;
    }
    if (this.isLocked) return;

    const onFloor = this.body && (this.body.blocked.down || this.body.touching.down);
    const moving = this.body && Math.abs(this.body.velocity.x) > 10;

    if (!onFloor) {
      if (this.scene.anims.exists('player_jump')) this.play('player_jump', true);
    } else if (moving) {
      const isRunning = (this.keyShift.isDown || this.virtualInput.running);
      const targetAnim = isRunning ? 'player_run' : 'player_walk';
      if (this.scene.anims.exists(targetAnim)) this.play(targetAnim, true);
    } else {
      if (this.scene.anims.exists('player_idle')) this.play('player_idle', true);
    }
  }

  updateCombat(time, delta) {
    if (this.isAttacking) return;
    if (this.anims.currentAnim?.key !== 'player_idle') {
      this.play('player_idle', true);
    }
  }

  freeze() {
    this.isLocked = true;
    this.virtualInput.left = false;
    this.virtualInput.right = false;
    this.virtualInput.jump = false;
    this.virtualInput.punch = false;
    this.virtualInput.crouch = false;
    if (this.isCrouching) {
      this.isCrouching = false;
      this.body.setSize(80, 240);
      this.body.setOffset(60, 80);
    }
    this.setVelocity(0, 0);
    this.play('player_idle', true);
  }

  unfreeze() {
    this.isLocked = false;
  }
}