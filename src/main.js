import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(gameConfig);
  window.__NEUROQUEST_GAME__ = game;
  console.log('[NEUROQUEST] Juego inicializado con éxito.');

  // Desbloqueo limpio de WebAudio en el primer gesto del usuario
  // para cumplir con las directivas de autoplay del navegador sin advertencias
  const unlockAudioContext = () => {
    try {
      if (game.sound && game.sound.context && game.sound.context.state === 'suspended') {
        game.sound.context.resume().catch(() => {});
      }
    } catch {
      // Ignorar si el navegador no requiere o no soporta WebAudio
    }
  };

  ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(eventName => {
    window.addEventListener(eventName, unlockAudioContext, { once: true, passive: true });
  });
});
