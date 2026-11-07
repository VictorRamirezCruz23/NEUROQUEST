import Phaser from 'phaser';
import { sessionState, COMPETENCY_IDS } from '../../core/sessionState.js';

/**
 * BosMat.js — Jefe Final del Módulo 1 (Pensamiento Lógico y Matemático) en NEUROQUEST.
 *
 * Características:
 * 1. Basado en la entidad BosMat.jpg con barra superior de salud y título cibernético.
 * 2. Patrones de ataque complejos:
 *    - Ráfagas de proyectiles fractales dirigidos.
 *    - Barridos de láser y ondas de choque a nivel del suelo (evadibles saltando o agachándose).
 * 3. Mecánica de Escudo Cuántico:
 *    - El jugador debe debilitar el blindaje disparándole bolitas de energía azul.
 *    - Al quebrarse la barrera, se activa una ronda de resolución de preguntas matemáticas avanzadas.
 * 4. Al ser derrotado:
 *    - Secuencia dramática de explosiones múltiples, desbloqueo persistente del Trofeo del Núcleo de Lógica
 *      y despliegue del modal conmemorativo.
 */
export class BosMat extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    const texKey = scene.textures.exists('bosmat_texture') ? 'bosmat_texture' : 'matbot';
    super(scene, x, y, texKey, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.botType = 'bosmat';
    this.name = 'BosMat: Guardián del Núcleo';
    this.isAlive = true;
    this.isBoss = true;

    // Fases de combate (3 fases = 3 preguntas avanzadas y 3 oleadas de ataques)
    this.maxPhases = 3;
    this.currentPhase = 3;
    this.shieldHp = 4; // Golpes de proyectil azul necesarios para vulnerar escudo
    this.maxShieldHp = 4;
    this.isShieldActive = true;

    this.setScale(0.60);
    this.setCollideWorldBounds(true);
    this.body.setSize(130, 140);
    this.body.setOffset(55, 60);

    if (scene.anims.exists('bosmat_idle')) {
      this.play('bosmat_idle');
    }

    // Patrulla flotante del jefe
    this.spawnX = x;
    this.spawnY = y;
    this.floatTimer = 0;
    this.attackTimer = 0;
    this.attackInterval = 2800; // ms entre ataques
    this.isAttacking = false;

    // Escudo visual de fuerza
    this.shieldGfx = scene.add.graphics().setDepth(this.depth + 1);

    // Crear barra de vida del Boss en la parte superior central
    this.createBossHUD();
  }

  createBossHUD() {
    const { width } = this.scene.scale;
    const barW = 340;
    const barH = 14;
    const barX = (width - barW) / 2;
    const barY = 28;

    this.hudContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(1500);

    // Marco exterior cibernético
    const bgFrame = this.scene.add.graphics();
    bgFrame.fillStyle(0x0f172a, 0.95);
    bgFrame.fillRoundedRect(barX - 8, barY - 18, barW + 16, barH + 26, 6);
    bgFrame.lineStyle(2, 0xef4444, 1);
    bgFrame.strokeRoundedRect(barX - 8, barY - 18, barW + 16, barH + 26, 6);

    // Título del Jefe
    const title = this.scene.add.text(width / 2, barY - 8, '👑 BOSMAT // GUARDIÁN DEL NÚCLEO DE LÓGICA', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#f87171',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Fondo barra HP
    const hpBg = this.scene.add.graphics();
    hpBg.fillStyle(0x334155, 1);
    hpBg.fillRoundedRect(barX, barY + 2, barW, barH, 4);

    // Barra de Vida Dinámica
    this.hpBarFill = this.scene.add.graphics();
    this.updateHpBar();

    // Etiqueta de escudo
    this.shieldLabel = this.scene.add.text(width / 2, barY + barH + 14, '🛡️ ESCUDO CUÁNTICO ACTIVO (DISPÁRALE PARA SOBRECARGARLO)', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#38bdf8'
    }).setOrigin(0.5);

    this.hudContainer.add([bgFrame, title, hpBg, this.hpBarFill, this.shieldLabel]);
  }

  updateHpBar() {
    if (!this.hpBarFill || !this.scene) return;
    const { width } = this.scene.scale;
    const barW = 340;
    const barH = 14;
    const barX = (width - barW) / 2;
    const barY = 28;

    const fillRatio = Math.max(0, this.currentPhase / this.maxPhases);
    this.hpBarFill.clear();
    this.hpBarFill.fillStyle(fillRatio > 0.35 ? 0xef4444 : 0xdc2626, 1);
    this.hpBarFill.fillRoundedRect(barX, barY + 2, barW * fillRatio, barH, 4);
  }

  update(time, delta) {
    if (!this.active || !this.isAlive) {
      if (this.shieldGfx) this.shieldGfx.clear();
      return;
    }

    this.floatTimer += delta * 0.003;
    this.attackTimer += delta;

    // Movimiento oscilatorio imponente
    const targetY = this.spawnY + Math.sin(this.floatTimer) * 18;
    this.y = Phaser.Math.Linear(this.y, targetY, 0.05);

    // Mirar siempre hacia el jugador
    if (this.scene.player) {
      this.setFlipX(this.scene.player.x < this.x);
    }

    // Dibujar escudo de energía pulsante
    this.drawShieldFX();

    // Ejecutar patrón de ataque cíclico
    if (this.attackTimer > this.attackInterval && !this.isAttacking) {
      this.attackTimer = 0;
      this.executeAttackPattern();
    }
  }

  drawShieldFX() {
    if (!this.shieldGfx) return;
    this.shieldGfx.clear();

    if (this.isShieldActive) {
      const pulse = 1.0 + Math.sin(this.floatTimer * 4) * 0.06;
      this.shieldGfx.lineStyle(2.5, 0x00f0ff, 0.75);
      this.shieldGfx.strokeCircle(this.x, this.y, 64 * pulse);

      this.shieldGfx.fillStyle(0x00f0ff, 0.12);
      this.shieldGfx.fillCircle(this.x, this.y, 64 * pulse);
    }
  }

  /**
   * Patrón de ataque del Jefe: Dispara proyectiles fractales o lanza onda expansiva.
   */
  executeAttackPattern() {
    if (!this.isAlive || !this.scene.player) return;
    this.isAttacking = true;

    const patternType = Phaser.Math.Between(1, 2);

    if (patternType === 1) {
      // Disparo triple de proyectiles fractales dirigidos
      for (let i = -1; i <= 1; i++) {
        this.scene.time.delayedCall((i + 1) * 180, () => {
          if (!this.active || !this.isAlive) return;

          const proj = this.scene.physics.add.sprite(this.x, this.y - 15, 'boss_projectile');
          if (proj.body) proj.body.allowGravity = false;
          proj.isBossAttack = true;

          const targetAngle = Phaser.Math.Angle.Between(
            this.x, this.y,
            this.scene.player.x, this.scene.player.y
          ) + (i * 0.22);

          proj.setVelocity(
            Math.cos(targetAngle) * 260,
            Math.sin(targetAngle) * 260
          );

          if (this.scene.hazardsGroup) {
            this.scene.hazardsGroup.add(proj);
          }

          // Auto-destrucción en 3 segundos
          this.scene.time.delayedCall(3000, () => {
            if (proj.active) proj.destroy();
          });
        });
      }
    } else {
      // Onda expansiva terrestre
      const waveDir = this.scene.player.x > this.x ? 1 : -1;
      const wave = this.scene.physics.add.sprite(this.x, this.y + 40, 'corrupt_patch');
      if (wave.body) wave.body.allowGravity = false;
      wave.setVelocityX(waveDir * 230);
      wave.isBossAttack = true;

      if (this.scene.hazardsGroup) {
        this.scene.hazardsGroup.add(wave);
      }

      this.scene.time.delayedCall(2400, () => {
        if (wave.active) wave.destroy();
      });
    }

    this.scene.time.delayedCall(1200, () => {
      this.isAttacking = false;
    });
  }

  /**
   * Impacto de proyectil de energía azul del jugador sobre BosMat.
   * Debilita su escudo hasta quebrarlo y forzar el duelo curricular.
   * @param {import('./EnergyProjectile.js').EnergyProjectile} projectile
   */
  takeProjectileDamage(projectile) {
    if (!this.isAlive) return;

    this.shieldHp = Math.max(0, this.shieldHp - 1);
    this.scene.soundManager?.playHit();

    // Destello de impacto
    this.setTint(0xef4444);
    this.scene.time.delayedCall(120, () => {
      if (this.active && this.isAlive) this.clearTint();
    });

    if (this.shieldLabel) {
      this.shieldLabel.setText(`🛡️ BLINDAJE DE BOSMAT: ${this.shieldHp}/${this.maxShieldHp} IMPACTOS`);
    }

    if (this.shieldHp <= 0 && this.isShieldActive) {
      // Quebrar escudo e iniciar duelo educativo avanzado
      this.breachShield();
    }
  }

  /**
   * Quebrantamiento del escudo: Detiene ataques temporales y abre el reto de preguntas.
   */
  breachShield() {
    this.isShieldActive = false;
    this.shieldHp = this.maxShieldHp;

    if (this.shieldLabel) {
      this.shieldLabel.setText('💥 ¡ESCUDO SOBRECARGADO! RESOLVIENDO MATRIZ LÓGICA...');
      this.shieldLabel.setColor('#34d399');
    }

    this.scene.soundManager?.playExplosion();
    this.scene.cameras.main.shake(250, 0.015);

    // Iniciar combate de desafío contra BosMat
    if (typeof this.scene.startBossCombatDuel === 'function') {
      this.scene.startBossCombatDuel(this);
    }
  }

  /**
   * Llamado cuando el jugador responde acertadamente la pregunta del Jefe.
   */
  onBossChallengeSuccess() {
    this.currentPhase -= 1;
    this.updateHpBar();

    // Efecto de daño masivo en BosMat
    this.setTint(0xf43f5e);
    this.scene.cameras.main.shake(300, 0.02);

    if (this.currentPhase <= 0) {
      this.defeatBoss();
    } else {
      // Reactivar escudo para siguiente fase
      this.scene.time.delayedCall(800, () => {
        if (this.active && this.isAlive) {
          this.clearTint();
          this.isShieldActive = true;
          this.shieldHp = this.maxShieldHp;
          if (this.shieldLabel) {
            this.shieldLabel.setText(`🛡️ FASE ${this.maxPhases - this.currentPhase + 1} • ESCUDO RECALIBRADO`);
            this.shieldLabel.setColor('#38bdf8');
          }
        }
      });
    }
  }

  /**
   * Secuencia triunfal de derrota de BosMat.
   */
  defeatBoss() {
    this.isAlive = false;
    this.setVelocity(0, 0);

    // Desbloquear trofeo conmemorativo oficial en sessionState
    sessionState.unlockTrophy(COMPETENCY_IDS.LOGIC_MATH);

    // Ocultar HUD del boss
    if (this.hudContainer) {
      this.hudContainer.destroy();
      this.hudContainer = null;
    }
    if (this.shieldGfx) {
      this.shieldGfx.destroy();
      this.shieldGfx = null;
    }

    // Explosiones secuenciales
    this.scene.soundManager?.playExplosion();
    this.scene.cameras.main.shake(600, 0.025);

    // Mostrar modal conmemorativo de trofeo en la escena
    if (typeof this.scene.showTrophyVictoryModal === 'function') {
      this.scene.showTrophyVictoryModal(COMPETENCY_IDS.LOGIC_MATH);
    }

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.1,
      scaleY: 0.1,
      duration: 600,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  destroy(fromScene) {
    if (this.hudContainer) {
      this.hudContainer.destroy();
      this.hudContainer = null;
    }
    if (this.shieldGfx) {
      this.shieldGfx.destroy();
      this.shieldGfx = null;
    }
    super.destroy(fromScene);
  }
}
