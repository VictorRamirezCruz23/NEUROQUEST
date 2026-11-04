import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(gameConfig);
  window.__NEUROQUEST_GAME__ = game;
  console.log('[NEUROQUEST] Juego inicializado con éxito.');
});
