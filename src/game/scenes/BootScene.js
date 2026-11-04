import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Configuración mínima previa a la carga
  }

  create() {
    console.log('[BootScene] Sistema inicializado correctamente.');
    this.scene.start('PreloadScene');
  }
}
