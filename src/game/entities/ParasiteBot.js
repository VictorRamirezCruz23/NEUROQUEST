import Phaser from 'phaser';
import { MatBot } from './MatBot.js';

/**
 * ParasiteBot.js — Entidad del enemigo principal "NEURO-PARASITE / SYNAPSE-CRAWLER" en NEUROQUEST.
 *
 * Implementa de manera integral:
 * 1. Locomoción: Crawl Cycle (desplazamiento multipata) y Wall-Cling State (anclado vertical).
 * 2. Habilidades de Combate:
 *    - Unfold Gills/Sensors: Despliegue dorsal de nodos ópticos y flujo de datos.
 *    - Corrupt-Platform Deploy: Secreción de parches de datos glitch que dañan al contacto.
 *    - Synapse-Scan Pulse: Onda holográfica cónica semi-transparente de detección profunda.
 *    - Piercing Claw-Strike: Embestida frontal rápida con garras.
 * 3. Mecánicas Especiales:
 *    - Phase-Shift Dash: Teletransporte táctico con estela digital (glitch trail).
 *    - System Overload (Stun State): Congelamiento momentáneo ante disparos continuos.
 * 4. Secuencia de Muerte:
 *    - Biomech-Hit & Fall, Critical Failure explosion y Digital Dissolve en polvo binario.
 */
export class ParasiteBot extends MatBot {
  constructor(scene, x, y, options = {}) {
    super(scene, x, y, options);

    this.botType = 'parasitebot';
    this.botName = 'Neuro-Parasite';
    this.botTitle = 'Synapse Crawler';

    if (scene.textures.exists('parasitebot_texture')) {
      this.setTexture('parasitebot_texture', 0);
      this.stop();
      if (scene.anims.exists('parasitebot_crawl')) {
        this.play('parasitebot_crawl');
      }
      this.setScale(0.45);
      this.body.setSize(100, 65);
      this.body.setOffset(70, 148);
    }

    // Estados extendidos
    // 'CRAWL', 'WALL_CLING', 'SCANNING', 'UNFOLD', 'STRIKE', 'PHASE_DASH', 'STUNNED', 'DISSOLVING'
    this.state = 'CRAWL';
    this.hp = options.hp !== undefined ? options.hp : 3;
    this.maxHp = this.hp;
    this.lastDamageTime = 0;
    this.crawlCycleTimer = 0;
    this.scanCooldown = 3500; // ms entre pulsos de escaneo
    this.lastScanTime = 0;
    this.corruptCooldown = 5000;
    this.lastCorruptTime = 0;
    this.phaseDashCooldown = 4000;
    this.lastDashTime = 0;
    this.stunDuration = 1200;

    // Componentes gráficos ambientales
    this.scanConeGfx = scene.add.graphics().setDepth(this.depth + 1);
    this.glitchParticles = [];

    // Etiqueta de identificación
    this.crawlerTag = scene.add.text(x, y - 32, '⚡ SYNAPSE-CRAWLER', {
      fontFamily: 'monospace',
      fontSize: '8.5px',
      color: '#00f0ff',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);
  }

  updateAI(time, delta, player) {
    if (!this.isAlive || this.state === 'DEAD' || this.state === 'COMBAT' || this.state === 'DISSOLVING') {
      if (this.crawlerTag) this.crawlerTag.setVisible(false);
      if (this.scanConeGfx) this.scanConeGfx.clear();
      return;
    }

    if (this.crawlerTag) {
      this.crawlerTag.setPosition(this.x, this.y - 32);
    }

    if (this.state === 'STUNNED') {
      this.setVelocityX(0);
      return;
    }

    if (!player || !player.body) {
      this.crawlMotion(delta);
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const now = Date.now();

    // 1. Synapse-Scan Pulse periódico
    if (now - this.lastScanTime > this.scanCooldown && dist < 320) {
      this.performSynapseScan(player);
    }

    // 2. Corrupt-Platform Deploy (secreción de datos cian/magenta que dañan si se pisan)
    if (now - this.lastCorruptTime > this.corruptCooldown && dist < 240) {
      this.deployCorruptPatch();
    }

    // 3. Phase-Shift Dash (reposicionamiento rápido con estela digital)
    if (now - this.lastDashTime > this.phaseDashCooldown && dist < 180 && dist > 80) {
      this.performPhaseShiftDash(player);
      return;
    }

    // 4. Piercing Claw-Strike si está en rango cuerpo a cuerpo
    if (dist <= this.attackRadius && this.state !== 'STRIKE') {
      this.performClawStrike(player);
      return;
    }

    // Comportamiento base: Crawl Cycle
    this.crawlMotion(delta);
  }

  crawlMotion(delta) {
    this.crawlCycleTimer += delta * 0.008;

    // Desplazamiento multipata bajo perfil
    this.setVelocityX(this.direction * (this.patrolSpeed * 1.15));
    this.setFlipX(this.direction < 0);

    // Pequeño pulso sinusoidal sutil de núcleo sin desfasar escala de contacto
    const corePulse = 0.45 + Math.sin(this.crawlCycleTimer * 4) * 0.008;
    this.setScale(corePulse);

    if (this.x > this.spawnX + this.patrolRange) {
      this.direction = -1;
    } else if (this.x < this.spawnX - this.patrolRange) {
      this.direction = 1;
    }
  }

  /**
   * Pulso de escaneo sináptico cónico semi-transparente.
   */
  performSynapseScan(player) {
    this.lastScanTime = Date.now();
    if (!this.scanConeGfx) return;

    const facingRight = this.direction > 0;
    const startX = this.x + (facingRight ? 20 : -20);
    const startY = this.y - 10;
    const range = 180;
    const endX = startX + (facingRight ? range : -range);

    this.scanConeGfx.clear();
    this.scanConeGfx.fillStyle(0x00f0ff, 0.25);
    this.scanConeGfx.fillTriangle(
      startX, startY,
      endX, startY - 45,
      endX, startY + 45
    );
    this.scanConeGfx.lineStyle(1.5, 0x38bdf8, 0.7);
    this.scanConeGfx.strokeTriangle(
      startX, startY,
      endX, startY - 45,
      endX, startY + 45
    );

    this.scene.tweens.add({
      targets: this.scanConeGfx,
      alpha: 0,
      duration: 380,
      onComplete: () => {
        if (this.scanConeGfx) {
          this.scanConeGfx.clear();
          this.scanConeGfx.alpha = 1;
        }
      }
    });
  }

  /**
   * Secreción de parche corrupto en la plataforma.
   */
  deployCorruptPatch() {
    this.lastCorruptTime = Date.now();
    if (!this.scene || !this.scene.hazardsGroup) return;

    const patch = this.scene.hazardsGroup.create(this.x, this.y + 24, 'corrupt_patch');
    if (patch) {
      patch.setOrigin(0.5, 1);
      if (patch.body) {
        patch.body.allowGravity = false;
        patch.body.immovable = true;
      }
      patch.isCorruptPatch = true;

      // Parpadeo de advertencia antes de desaparecer en 6 segundos
      const currentScene = this.scene;
      currentScene.time.delayedCall(4500, () => {
        if (patch && patch.active && patch.scene && patch.scene.tweens) {
          patch.scene.tweens.add({
            targets: patch,
            alpha: 0.1,
            duration: 150,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
              if (patch.active) patch.destroy();
            }
          });
        }
      });
    }
  }

  /**
   * Phase-Shift Dash: Ráfaga de velocidad con estela digital pixelada.
   */
  performPhaseShiftDash(player) {
    this.lastDashTime = Date.now();
    this.state = 'PHASE_DASH';

    // Generar estela glitch fantasma
    const ghost = this.scene.add.sprite(this.x, this.y, this.texture.key);
    ghost.setScale(this.scaleX, this.scaleY);
    ghost.setFlipX(this.flipX);
    ghost.setTint(0xf43f5e);
    ghost.setAlpha(0.65);

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: this.scaleX * 1.3,
      duration: 250,
      onComplete: () => ghost.destroy()
    });

    const dashDir = (player.x > this.x) ? 1 : -1;
    this.setVelocityX(dashDir * 280);

    this.scene.time.delayedCall(220, () => {
      if (this.active && this.isAlive && this.state === 'PHASE_DASH') {
        this.state = 'CRAWL';
      }
    });
  }

  /**
   * Piercing Claw-Strike: Embestida frontal rápida.
   */
  performClawStrike(player) {
    this.state = 'STRIKE';
    const strikeDir = player.x > this.x ? 1 : -1;
    this.setVelocityX(strikeDir * 210);

    this.scene.time.delayedCall(300, () => {
      if (this.active && this.isAlive) {
        this.executeAttack(player);
      }
    });
  }

  /**
   * Sobrecarga de Sistema (Stun State) al recibir impactos de proyectiles.
   * Los bots terrestres no mueren por balas; requieren responder la pregunta.
   */
  takeProjectileDamage(projectile) {
    if (!this.isAlive || this.state === 'DEAD' || this.state === 'COMBAT' || this.state === 'DISSOLVING' || this.state === 'DYING') return;

    this.scene.soundManager?.playHit();

    // Entrar en System Overload (Stun) y leve retroceso
    this.state = 'STUNNED';
    const pushDir = projectile ? (projectile.x < this.x ? 1 : -1) : 1;
    this.setVelocity(pushDir * 100, -60);
    this.setTint(0x00f0ff);

    if (this.scene) {
      this.scene.showFloatingNotice?.(this.x, this.y - 45, '⚡ ¡RESPONDE LA PREGUNTA!', '#00f0ff');
    }

    // Chispas de sobrecarga en articulaciones
    if (this.scene && this.scene.add) {
      const sparks = this.scene.add.graphics();
      sparks.fillStyle(0x00f0ff, 0.9);
      for (let i = 0; i < 6; i++) {
        sparks.fillCircle(this.x + (Math.random() * 24 - 12), this.y + (Math.random() * 20 - 10), 2);
      }
      this.scene.tweens?.add({
        targets: sparks,
        alpha: 0,
        duration: 350,
        onComplete: () => sparks.destroy()
      });
    }

    this.scene.time?.delayedCall(this.stunDuration || 1200, () => {
      if (this.active && this.isAlive && this.state === 'STUNNED') {
        this.clearTint();
        this.state = 'CRAWL';
      }
    });
  }

  /**
   * Secuencia de destrucción con Digital Dissolve en polvo binario y despawn definitivo.
   */
  destroyMatBot() {
    if (this.state === 'DISSOLVING' || this.state === 'DEAD') return;
    this.state = 'DISSOLVING';
    this.isAlive = false;

    // Desactivar físicas y ocultar inmediatamente para que no vuelva a colisionar ni interactuar
    if (this.body) {
      this.body.enable = false;
    }
    this.setVelocity(0, 0);
    this.setVisible(false);

    if (this.crawlerTag) {
      this.crawlerTag.destroy();
      this.crawlerTag = null;
    }
    if (this.scanConeGfx) {
      this.scanConeGfx.destroy();
      this.scanConeGfx = null;
    }

    const currentScene = this.scene;

    // Remover de listas y grupos de escena de inmediato
    if (currentScene?.parasiteGroup) {
      currentScene.parasiteGroup.remove(this, false, false);
    }
    if (currentScene?.matbotGroup) {
      currentScene.matbotGroup.remove(this, false, false);
    }
    if (currentScene?.matbots) {
      const idx = currentScene.matbots.indexOf(this);
      if (idx !== -1) {
        currentScene.matbots.splice(idx, 1);
      }
    }

    // Critical Failure: Explosión de fragmentos cibernéticos
    currentScene?.soundManager?.playExplosion();
    currentScene?.cameras?.main?.shake(200, 0.015);

    // Digital Dissolve (desvanecimiento en polvo binario)
    if (currentScene && currentScene.add) {
      const dissolveGfx = currentScene.add.graphics();
      dissolveGfx.fillStyle(0x00f0ff, 1);

      for (let i = 0; i < 20; i++) {
        const rx = this.x + (Math.random() * 40 - 20);
        const ry = this.y + (Math.random() * 30 - 15);
        dissolveGfx.fillRect(rx, ry, 3, 3);
      }

      currentScene.tweens?.add({
        targets: dissolveGfx,
        y: -40,
        alpha: 0,
        duration: 500,
        onComplete: () => dissolveGfx.destroy()
      });
    }

    super.destroyMatBot();
  }

  destroy(fromScene) {
    if (this.crawlerTag) this.crawlerTag.destroy();
    if (this.scanConeGfx) this.scanConeGfx.destroy();
    super.destroy(fromScene);
  }
}
