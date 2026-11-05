import Phaser from 'phaser';

/**
 * Entidad principal del jugador en NEUROQUEST.
 * Maneja físicas de plataformas laterales, máquina de estados, controles híbridos
 * (teclado + controles táctiles virtuales para móviles), animaciones completas y acción de agacharse (crouch).
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene Escena contenedora
   * @param {number} x Coordenada X inicial
   * @param {number} y Coordenada Y inicial
   */
  constructor(scene, x, y) {
    const texKey = scene.textures.exists('player_texture') ? 'player_texture' : 'player';
    super(scene, x, y, texKey, 1);

    // Añadir a la escena y al sistema de físicas Arcade
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Escalar sprite de alta resolución manteniendo nitidez pixel art
    this.setScale(0.28);

    // Configuración del cuerpo físico
    this.setCollideWorldBounds(true);
    // Ajustar caja de colisión normal (80x240 px con offset 60, 80)
    this.body.setSize(80, 240);
    this.body.setOffset(60, 80);

    // Parámetros de física de movimiento
    this.speed = 220;        // Velocidad de caminata estándar
    this.runSpeed = 330;     // Velocidad de carrera / sprint
    this.jumpForce = -420;   // Impulso vertical de salto
    this.isLocked = false;
    this.isAttacking = false;
    this.isCrouching = false;

    // Estado de entradas virtuales para controles táctiles móviles
    this.virtualInput = {
      left: false,
      right: false,
      running: false,
      jump: false,
      punch: false,
      crouch: false
    };

    // Configuración de controles de teclado
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
    this.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Iniciar en animación idle
    this.play('player_idle');

    // Escuchar fin de animaciones de ataque/golpe
    this.on('animationcomplete-player_punch', () => this.finishAttack());
    this.on('animationcomplete-player_attack', () => this.finishAttack());
  }

  /**
   * Bucle de actualización por fotograma.
   * Integra armónicamente eventos físicos tanto de teclado como de pantalla táctil.
   * @param {number} time
   * @param {number} delta
   */
  update(time, delta) {
    if (this.isLocked) {
      this.setVelocityX(0);
      return;
    }

    const onFloor = this.body.blocked.down || this.body.touching.down;

    // Acción de Agacharse y Caminar Agachado (Tecla S o Flecha Abajo o botón táctil)
    const crouchRequested = (this.cursors.down.isDown || this.keyS.isDown || this.virtualInput.crouch) && onFloor;

    if (crouchRequested) {
      if (!this.isCrouching) {
        this.isCrouching = true;
        // Reducir la caja de colisión exactamente a la mitad (120 px de alto)
        // Offset Y = 200 para que la base de los pies permanezca apoyada sobre el suelo
        this.body.setSize(80, 120);
        this.body.setOffset(60, 200);
      }

      // Permitir desplazamiento horizontal fluido mientras se camina agachado (65% de velocidad)
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

      if (this.anims.currentAnim?.key !== 'player_crouch') {
        this.play('player_crouch', true);
      }
      return; // Mantenerse agachado mientras se presione la tecla
    } else {
      if (this.isCrouching) {
        this.isCrouching = false;
        // Restaurar caja de colisión normal completa
        this.body.setSize(80, 240);
        this.body.setOffset(60, 80);
      }
    }

    // Acción de golpe (Teclas J, K, F, X o botón táctil virtual)
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
      // Si la animación terminó o cambió inesperadamente, liberar de inmediato el estado
      const curKey = this.anims.currentAnim?.key;
      if (!this.anims.isPlaying || (curKey !== 'player_attack' && curKey !== 'player_punch')) {
        this.finishAttack();
      } else {
        this.setVelocityX(this.body.velocity.x * 0.85);
        return;
      }
    }

    // Fusión de entradas de teclado y entradas virtuales táctiles
    const moveLeft = (this.cursors.left.isDown || this.keyA.isDown || this.virtualInput.left);
    const moveRight = (this.cursors.right.isDown || this.keyD.isDown || this.virtualInput.right);
    const isRunning = (this.keyShift.isDown || this.virtualInput.running);
    const currentSpeed = isRunning ? this.runSpeed : this.speed;

    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                        Phaser.Input.Keyboard.JustDown(this.keyW) ||
                        Phaser.Input.Keyboard.JustDown(this.keySpace) ||
                        this.virtualInput.jump;

    // Consumir el pulso de salto virtual una vez evaluado
    if (this.virtualInput.jump) {
      this.virtualInput.jump = false;
    }

    // Movimiento horizontal con dirección y velocidad adaptada
    if (moveLeft && !moveRight) {
      this.setVelocityX(-currentSpeed);
      this.setFlipX(true);
    } else if (moveRight && !moveLeft) {
      this.setVelocityX(currentSpeed);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    // Ejecución de salto
    if (jumpPressed && onFloor) {
      this.setVelocityY(this.jumpForce);
    }

    // Gestión integral de estados de animación
    if (!onFloor) {
      // En el aire (salto / ápice / gravedad descendente)
      if (this.body.velocity.y < -50) {
        if (this.anims.currentAnim?.key !== 'player_jump') {
          this.play('player_jump', true);
        }
      } else if (this.body.velocity.y >= -50 && this.body.velocity.y <= 50) {
        if (this.anims.currentAnim?.key !== 'player_jump_peak') {
          this.play('player_jump_peak', true);
        }
      } else {
        if (this.anims.currentAnim?.key !== 'player_fall') {
          this.play('player_fall', true);
        }
      }
    } else {
      // En el suelo: alternancia dinámica entre correr, caminar o reposo
      if (Math.abs(this.body.velocity.x) > 10) {
        const targetAnim = isRunning ? 'player_run' : 'player_walk';
        if (this.anims.currentAnim?.key !== targetAnim) {
          this.play(targetAnim, true);
        }
      } else {
        if (this.anims.currentAnim?.key !== 'player_idle') {
          this.play('player_idle', true);
        }
      }
    }
  }

  performPunch() {
    this.performAttack();
  }

  performAttack() {
    if (this.isAttacking) return;
    this.isAttacking = true;

    // Sonido de ataque si está disponible
    if (this.scene.soundManager && typeof this.scene.soundManager.playLaser === 'function') {
      this.scene.soundManager.playLaser();
    }

    const key = this.scene.anims.exists('player_attack') ? 'player_attack' : 'player_punch';
    this.play(key, true);

    // Temporizador de seguridad: previene cualquier bloqueo accidental si se interrumpe la animación
    if (this.attackSafetyTimer) {
      this.attackSafetyTimer.remove();
    }
    this.attackSafetyTimer = this.scene.time.delayedCall(450, () => {
      if (this.isAttacking) {
        this.finishAttack();
      }
    });
  }

  finishAttack() {
    this.isAttacking = false;
    if (this.attackSafetyTimer) {
      this.attackSafetyTimer.remove();
      this.attackSafetyTimer = null;
    }
    if (this.isLocked) return;

    // Transición fluida inmediata a movimiento, salto o reposo
    const onFloor = this.body && (this.body.blocked.down || this.body.touching.down);
    const moving = this.body && Math.abs(this.body.velocity.x) > 10;

    if (!onFloor) {
      if (this.scene.anims.exists('player_jump')) {
        this.play('player_jump', true);
      }
    } else if (moving) {
      const isRunning = (this.keyShift.isDown || this.virtualInput.running);
      const targetAnim = isRunning ? 'player_run' : 'player_walk';
      if (this.scene.anims.exists(targetAnim)) {
        this.play(targetAnim, true);
      }
    } else {
      if (this.scene.anims.exists('player_idle')) {
        this.play('player_idle', true);
      }
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
