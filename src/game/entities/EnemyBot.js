import { MatBot } from './MatBot.js';

export const BOT_METADATA = {
  matbot: {
    name: 'MatBot Centinela',
    title: 'Autómata Numérico',
    texKey: 'matbot_texture',
    color: '#38bdf8',
    scale: 0.45
  },
  brainbot: {
    name: 'BrainBot Analítico',
    title: 'Unidad de Procesamiento Lógico',
    texKey: 'brainbot_texture',
    color: '#34d399',
    scale: 0.45
  },
  caatbot: {
    name: 'CaatBot Ágil',
    title: 'Centinela de Algoritmos',
    texKey: 'caatbot_texture',
    color: '#fbbf24',
    scale: 0.45
  },
  neurobot: {
    name: 'NeuroBot Cuántico',
    title: 'Guardián Sináptico',
    texKey: 'neurobot_texture',
    color: '#a855f7',
    scale: 0.45
  },
  questbot: {
    name: 'QuestBot Explorador',
    title: 'Monitor de Rutas Cognitivas',
    texKey: 'questbot_texture',
    color: '#60a5fa',
    scale: 0.45
  },
  warbot: {
    name: 'WarBot Defensivo',
    title: 'Blindaje Pesado Modular',
    texKey: 'warbot_texture',
    color: '#f87171',
    scale: 0.45
  }
};

/**
 * EnemyBot.js — Entidad unificada y modular para los bots terrestres curriculares de NEUROQUEST.
 * Hereda de MatBot para mantener compatibilidad total de arquitectura e interfaz.
 */
export class EnemyBot extends MatBot {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} options
   * @param {'matbot'|'brainbot'|'caatbot'|'neurobot'|'questbot'|'warbot'} [options.botType='matbot']
   */
  constructor(scene, x, y, options = {}) {
    super(scene, x, y, options);

    this.botType = options.botType || 'matbot';
    const meta = BOT_METADATA[this.botType] || BOT_METADATA.matbot;
    this.botName = meta.name;
    this.botTitle = meta.title;

    // Si tiene textura específica cargada en escena, aplicarla limpiamente al frame 0
    if (this.botType !== 'matbot' && scene.textures.exists(meta.texKey)) {
      this.setTexture(meta.texKey, 0);
      this.stop();
      this.setScale(meta.scale);
      this.body.setSize(95, 90);
      this.body.setOffset(72, 110);
      const walkAnim = `${this.botType}_walk`;
      if (scene.anims.exists(walkAnim)) {
        this.play(walkAnim);
      }
    }

    this.shieldHp = 2; // Resistencia a proyectiles antes de desestabilizarse completamente
  }

  /**
   * Reacción ante impacto de proyectil de energía azul del jugador.
   * Se desestabiliza/aturde y retrocede, pero requiere resolver la pregunta para derrotarse.
   * @param {import('./EnergyProjectile.js').EnergyProjectile} projectile
   */
  takeProjectileDamage(projectile) {
    if (!this.isAlive || this.state === 'DEAD' || this.state === 'COMBAT') return;

    this.shieldHp = Math.max(0, this.shieldHp - 1);
    this.scene.soundManager?.playHit();

    // Destello de desestabilización
    this.setTint(0xfde047);
    this.scene.time.delayedCall(150, () => {
      if (this.active && this.isAlive) this.clearTint();
    });

    // Pequeño empuje de retroceso
    const pushDir = projectile?.direction || (this.flipX ? 1 : -1);
    this.setVelocityX(pushDir * 140);

    // Estado aturdido momentáneo (Stagger)
    this.state = 'STAGGER';
    this.scene.time.delayedCall(450, () => {
      if (this.active && this.isAlive && this.state === 'STAGGER') {
        this.state = 'CHASE';
      }
    });

    // Desplegar texto de escudo debilitado
    const txt = this.scene.add.text(this.x, this.y - 30, '⚠️ ESCUDO VULNERABLE', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#fbbf24',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: txt,
      y: this.y - 50,
      alpha: 0,
      duration: 500,
      onComplete: () => txt.destroy()
    });
  }
}
