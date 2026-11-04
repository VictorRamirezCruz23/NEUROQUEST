import Phaser from 'phaser';

/**
 * Entidad principal del jugador en NEUROQUEST.
 * Maneja físicas de plataformas laterales, máquina de estados y animaciones.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene Escena contenedora
   * @param {number} x Coordenada X inicial
   * @param {number} y Coordenada Y inicial
   */
  constructor(scene, x, y) {
    super(scene, x, y, 'player', 1);

    // Añadir a la escena y al sistema de físicas Arcade
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Escalar sprite de alta resolución manteniendo nitidez pixel art
    this.setScale(0.28);

    // Configuración del cuerpo físico
    this.setCollideWorldBounds(true);
    // Ajustar caja de colisión proporcional al cuerpo (evitar colisiones en espacios vacíos del frame)
    this.body.setSize(80, 240);
    this.body.setOffset(60, 80);

    // Parámetros de física
    this.speed = 220;
    this.jumpForce = -420;
    this.isLocked = false;
    this.isAttacking = false;

    // Configuración de controles de teclado
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyJ = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Iniciar en animación idle
    this.play('player_idle');

    // Escuchar fin de animación de golpe
    this.on('animationcomplete-player_punch', () => {
      this.isAttacking = false;
    });
  }

  /**
   * Bucle de actualización por fotograma.
   * @param {number} time
   * @param {number} delta
   */
  update(time, delta) {
    if (this.isLocked) {
      this.setVelocityX(0);
      return;
    }

    // Acción de golpe (Tecla J)
    if (Phaser.Input.Keyboard.JustDown(this.keyJ) && !this.isAttacking) {
      this.performPunch();
    }

    if (this.isAttacking) {
      // Ralentizar movimiento horizontal durante el golpe
      this.setVelocityX(this.body.velocity.x * 0.9);
      return;
    }

    const onFloor = this.body.blocked.down || this.body.touching.down;
    const moveLeft = this.cursors.left.isDown || this.keyA.isDown;
    const moveRight = this.cursors.right.isDown || this.keyD.isDown;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                        Phaser.Input.Keyboard.JustDown(this.keyW) ||
                        Phaser.Input.Keyboard.JustDown(this.keySpace);

    // Movimiento horizontal
    if (moveLeft) {
      this.setVelocityX(-this.speed);
      this.setFlipX(true);
    } else if (moveRight) {
      this.setVelocityX(this.speed);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    // Salto
    if (jumpPressed && onFloor) {
      this.setVelocityY(this.jumpForce);
    }

    // Gestión de estados de animación
    if (!onFloor) {
      // En el aire
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
      // En el suelo
      if (Math.abs(this.body.velocity.x) > 10) {
        if (this.anims.currentAnim?.key !== 'player_walk') {
          this.play('player_walk', true);
        }
      } else {
        if (this.anims.currentAnim?.key !== 'player_idle') {
          this.play('player_idle', true);
        }
      }
    }
  }

  performPunch() {
    this.isAttacking = true;
    this.play('player_punch', true);
  }

  freeze() {
    this.isLocked = true;
    this.setVelocity(0, 0);
    this.play('player_idle', true);
  }

  unfreeze() {
    this.isLocked = false;
  }
}
