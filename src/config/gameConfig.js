import Phaser from 'phaser';
import { BootScene } from '../game/scenes/BootScene.js';
import { PreloadScene } from '../game/scenes/PreloadScene.js';
import { WelcomeScene } from '../game/scenes/WelcomeScene.js';
import { SelectCompetencyScene } from '../game/scenes/SelectCompetencyScene.js';
import { WorldScene } from '../game/scenes/WorldScene.js';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const DEFAULT_GRAVITY_Y = 600;

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#0a0c16',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: DEFAULT_GRAVITY_Y },
      debug: false
    }
  },
  scene: [BootScene, PreloadScene, WelcomeScene, SelectCompetencyScene, WorldScene]
};
