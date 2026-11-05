import Phaser from 'phaser';
import { educationEngine } from '../../education/engines/EducationEngine.js';
import { authService } from '../../services/firebase/authService.js';

/**
 * BattleArenaModal.js — Sistema de combate retro por turnos estilo RPG / Pokémon para NEUROQUEST.
 *
 * Características:
 * 1. Transición visual clásica con doble flash B&W y micro-zoom dramático.
 * 2. Escenario de batalla frente a frente:
 *    - MatBot con barra de HP, etiqueta y animación viva calibrada sin desbordes.
 *    - Cadete con blindaje de energía reflejado en iconos de cabezas del jugador.
 * 3. Caja de comandos retro inferior: Desafío curricular interactivo con 4 opciones.
 * 4. Manejo robusto de ciclo de vida:
 *    - Validación estricta previa a cualquier actualización de texto (`if (text && text.active)`).
 *    - Cancelación completa de tweens y temporizadores antes de destruir elementos para evitar
 *      corrupción del canvas (`Frame.updateUVs` / `drawImage`).
 * 5. Efectos de sonido espaciales integrados:
 *    - Láser de combate, acierto cristalino y glitch de cálculo erróneo.
 */
export class BattleArenaModal {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('../../game/entities/Player.js').Player} player
   */
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.isOpen = false;
    this.isResolving = false;
    this.currentChallenge = null;
    this.currentBot = null;
    this.onCombatResult = null;

    this.elements = [];
    this.activeTweens = [];
    this.pendingTimers = [];
    this.optionButtons = [];

    this.promptText = null;
    this.arenaBotSprite = null;
    this.arenaPlayerSprite = null;
    this.botHpBar = null;

    this.setupKeyboardListeners();
  }

  setupKeyboardListeners() {
    this.keyHandler = (event) => {
      if (!this.isOpen || this.isResolving) return;

      const code = event.code;
      if (code === 'Digit1' || code === 'KeyA') this.handleOptionSelect(0);
      else if (code === 'Digit2' || code === 'KeyB') this.handleOptionSelect(1);
      else if (code === 'Digit3' || code === 'KeyC') this.handleOptionSelect(2);
      else if (code === 'Digit4' || code === 'KeyD') this.handleOptionSelect(3);
    };

    this.scene.input.keyboard.on('keydown', this.keyHandler);
  }

  /**
   * Inicia el combate táctico con la transición visual estilo Pokémon.
   * @param {Object} options
   * @param {import('../../game/entities/MatBot.js').MatBot} options.matbot
   * @param {Function} options.onCombatResult - Callback (isCorrect, challenge, matbot)
   */
  startBattle(options = {}) {
    if (this.isOpen) return;

    this.currentBot = options.matbot;
    this.onCombatResult = options.onCombatResult;
    this.isOpen = true;
    this.isResolving = false;

    // Pausar o inmovilizar jugador
    if (this.player && typeof this.player.freeze === 'function') {
      this.player.freeze();
    }

    // Ocultar controles virtuales durante el combate
    if (this.scene.virtualControls) {
      this.scene.virtualControls.setVisible(false);
    }

    // Sonido de ataque láser / alerta espacial
    if (this.scene.soundManager) {
      this.scene.soundManager.playLaser();
    }

    // Seleccionar desafío curricular aleatorio
    this.currentChallenge = educationEngine.getRandomChallenge();
    if (!this.currentChallenge) {
      console.warn('[BattleArenaModal] Sin desafío disponible en el banco.');
      this.close();
      return;
    }

    // Transición estilo Pokémon: Doble flash de contraste y micro-zoom
    const cam = this.scene.cameras.main;
    cam.flash(180, 255, 255, 255);

    const flashTimer = this.scene.time.delayedCall(190, () => {
      if (!this.isOpen) return;
      cam.flash(180, 10, 15, 30);

      const zoomTween = this.scene.tweens.add({
        targets: cam,
        zoom: 1.10,
        duration: 300,
        yoyo: true,
        ease: 'Quad.easeInOut',
        onComplete: () => {
          if (!this.isOpen) return;
          cam.setZoom(1);
          this.renderArena();
        }
      });
      this.activeTweens.push(zoomTween);
    });
    this.pendingTimers.push(flashTimer);
  }

  track(obj) {
    if (obj && obj.setScrollFactor) {
      obj.setScrollFactor(0);
    }
    this.elements.push(obj);
    return obj;
  }

  renderArena() {
    this.cleanupVisuals();

    const { width, height } = this.scene.scale;
    const baseDepth = 4000;

    // 1. Telón de fondo cibernético translúcido (preserva el fondo del escenario visible sin pantalla negra)
    const backdrop = this.scene.add.rectangle(0, 0, width, height, 0x060919, 0.45)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(baseDepth)
      .setInteractive(); // Bloquea clics accidentales al mundo de juego
    this.track(backdrop);

    // Rejilla de soporte táctico
    const grid = this.scene.add.graphics().setScrollFactor(0).setDepth(baseDepth + 1);
    grid.lineStyle(1, 0x1e293b, 0.35);
    for (let x = 0; x < width; x += 32) {
      grid.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 32) {
      grid.lineBetween(0, y, width, y);
    }
    this.track(grid);

    // =========================================================================
    // 2. ESCENARIO DEL ENEMIGO (SUPERIOR DERECHA)
    // =========================================================================
    const botCenterX = width - 145;
    const botCenterY = 120;

    // Base de duelo para MatBot
    const botPlatform = this.scene.add.ellipse(botCenterX, botCenterY + 45, 170, 36, 0x1e1b4b, 0.85)
      .setStrokeStyle(2, 0x6366f1, 0.95)
      .setScrollFactor(0)
      .setDepth(baseDepth + 2);
    this.track(botPlatform);

    // Sprite de combate de MatBot (textura y animaciones independientes)
    const botTextureKey = this.scene.textures.exists('matbot_texture') ? 'matbot_texture' : 'matbot';
    const botSprite = this.scene.add.sprite(botCenterX, botCenterY, botTextureKey, 0)
      .setScale(0.85)
      .setScrollFactor(0)
      .setDepth(baseDepth + 3);
    if (this.scene.anims.exists('matbot_idle')) {
      botSprite.play('matbot_idle');
    } else if (this.scene.anims.exists('matbot_walk')) {
      botSprite.play('matbot_walk');
    }
    this.track(botSprite);
    this.arenaBotSprite = botSprite;

    // Caja de telemetría de MatBot
    const botInfoX = width - 365;
    const botInfoY = 38;
    const botInfoBox = this.scene.add.graphics().setScrollFactor(0).setDepth(baseDepth + 2);
    botInfoBox.fillStyle(0x0f172a, 0.95);
    botInfoBox.fillRoundedRect(botInfoX, botInfoY, 210, 58, 6);
    botInfoBox.lineStyle(2, 0xef4444, 0.9);
    botInfoBox.strokeRoundedRect(botInfoX, botInfoY, 210, 58, 6);
    this.track(botInfoBox);

    const botName = this.scene.add.text(botInfoX + 10, botInfoY + 8, '👾 MATBOT • GUARDIÁN LÓGICO', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#f87171',
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(baseDepth + 3);
    this.track(botName);

    const botHpBarBg = this.scene.add.rectangle(botInfoX + 10, botInfoY + 28, 190, 10, 0x334155).setOrigin(0).setScrollFactor(0).setDepth(baseDepth + 3);
    this.track(botHpBarBg);

    this.botHpBar = this.scene.add.rectangle(botInfoX + 10, botInfoY + 28, 190, 10, 0xef4444).setOrigin(0).setScrollFactor(0).setDepth(baseDepth + 4);
    this.track(this.botHpBar);

    const botLevel = this.scene.add.text(botInfoX + 10, botInfoY + 42, 'HP: 100%  •  POTENCIA COGNITIVA: 1.0', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#94a3b8'
    }).setScrollFactor(0).setDepth(baseDepth + 3);
    this.track(botLevel);

    // =========================================================================
    // 3. ESCENARIO DEL JUGADOR (INFERIOR IZQUIERDA)
    // =========================================================================
    const playerCenterX = 130;
    const playerCenterY = 185;

    // Base de duelo para el Cadete
    const playerPlatform = this.scene.add.ellipse(playerCenterX, playerCenterY + 45, 170, 36, 0x064e3b, 0.85)
      .setStrokeStyle(2, 0x10b981, 0.95)
      .setScrollFactor(0)
      .setDepth(baseDepth + 2);
    this.track(playerPlatform);

    // Sprite del jugador (textura independiente player_texture)
    const playerTextureKey = this.scene.textures.exists('player_texture') ? 'player_texture' : 'player';
    const playerSprite = this.scene.add.sprite(playerCenterX, playerCenterY, playerTextureKey, 1)
      .setScale(0.42)
      .setScrollFactor(0)
      .setDepth(baseDepth + 3);
    if (this.scene.anims.exists('player_idle')) {
      playerSprite.play('player_idle');
    }
    this.track(playerSprite);
    this.arenaPlayerSprite = playerSprite;

    // Caja de telemetría del Cadete
    const playerInfoX = 230;
    const playerInfoY = 155;
    const playerInfoBox = this.scene.add.graphics().setScrollFactor(0).setDepth(baseDepth + 2);
    playerInfoBox.fillStyle(0x0f172a, 0.95);
    playerInfoBox.fillRoundedRect(playerInfoX, playerInfoY, 230, 68, 6);
    playerInfoBox.lineStyle(2, 0x38bdf8, 0.9);
    playerInfoBox.strokeRoundedRect(playerInfoX, playerInfoY, 230, 68, 6);
    this.track(playerInfoBox);

    const playerName = this.scene.add.text(playerInfoX + 10, playerInfoY + 8, `⚡ CADETE: ${authService.getDisplayName().toUpperCase()}`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(baseDepth + 3);
    this.track(playerName);

    const livesLabel = this.scene.add.text(playerInfoX + 10, playerInfoY + 26, 'BLINDAJE DE ENERGÍA:', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#94a3b8'
    }).setScrollFactor(0).setDepth(baseDepth + 3);
    this.track(livesLabel);

    // Cabezas del jugador que reflejan las vidas actuales
    const maxLives = 5;
    const currentLives = (this.scene && typeof this.scene.lives === 'number') ? this.scene.lives : 5;
    for (let i = 0; i < maxLives; i++) {
      const headX = playerInfoX + 18 + (i * 26);
      const headY = playerInfoY + 50;
      const head = this.scene.add.image(headX, headY, 'player_head')
        .setDisplaySize(20, 20)
        .setScrollFactor(0)
        .setDepth(baseDepth + 4);

      if (i >= currentLives) {
        head.setTint(0x334155);
        head.setAlpha(0.35);
      }
      this.track(head);
    }

    // =========================================================================
    // 4. CAJA DE COMANDO RETRO INFERIOR (DISEÑO RESPONSIVO SIN SUPERPOSICIONES)
    // =========================================================================
    const boxMargin = 16;
    const cmdBoxW = width - (boxMargin * 2);
    // Altura proporcional adaptada a la resolución disponible
    const cmdBoxH = Math.min(225, Math.max(195, Math.floor(height * 0.42)));
    const cmdBoxY = height - cmdBoxH - 12;

    const cmdBox = this.scene.add.graphics().setScrollFactor(0).setDepth(baseDepth + 2);
    cmdBox.fillStyle(0x0a0f1d, 0.96);
    cmdBox.fillRoundedRect(boxMargin, cmdBoxY, cmdBoxW, cmdBoxH, 8);
    cmdBox.lineStyle(2, 0x38bdf8, 1);
    cmdBox.strokeRoundedRect(boxMargin, cmdBoxY, cmdBoxW, cmdBoxH, 8);
    this.track(cmdBox);

    const promptHeader = this.scene.add.text(
      boxMargin + 14,
      cmdBoxY + 8,
      `⚔️ ENFRENTAMIENTO TÁCTICO • ${this.currentChallenge.competency || 'LÓGICA'}`,
      {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#fbbf24',
        fontStyle: 'bold'
      }
    ).setScrollFactor(0).setDepth(baseDepth + 3);
    this.track(promptHeader);

    // Enunciado del desafío protegido (soporta statement, prompt o question curricular)
    const statementText = this.currentChallenge.statement || this.currentChallenge.prompt || this.currentChallenge.question || 'Analiza y responde al desafío cuántico:';
    const contextText = this.currentChallenge.context ? `[CONTEXTO]: ${this.currentChallenge.context}\n\n` : '';
    const fullPrompt = `${contextText}${statementText}`;

    // Dimensionar altura de botones de opciones y su posición anclada a la parte inferior de la caja
    const optH = 34;
    const optGap = 6;
    const optAreaH = (optH * 2) + optGap;
    const optY = (cmdBoxY + cmdBoxH) - optAreaH - 10;

    // Altura máxima disponible para el enunciado para garantizar cero solapamientos
    const maxPromptHeight = optY - (cmdBoxY + 26) - 6;

    // Formatear texto del enunciado con tamaño adaptativo
    const isNarrow = width < 760;
    const promptFontSize = isNarrow ? '11px' : '12px';

    this.promptText = this.scene.add.text(
      boxMargin + 14,
      cmdBoxY + 26,
      fullPrompt,
      {
        fontFamily: 'Segoe UI, -apple-system, sans-serif',
        fontSize: promptFontSize,
        color: '#ffffff',
        fontStyle: 'bold',
        lineSpacing: 2,
        wordWrap: { width: cmdBoxW - 28 }
      }
    ).setScrollFactor(0).setDepth(baseDepth + 10);
    this.track(this.promptText);

    // Si el texto del enunciado es largo, reducir dinámicamente la fuente para que nunca colisione
    if (this.promptText.height > maxPromptHeight) {
      this.promptText.setFontSize(10.5);
      this.promptText.setLineSpacing(1);
    }

    // 4 Opciones de respuesta ancladas limpiamente abajo
    const optW = (cmdBoxW - 38) / 2;
    const options = this.currentChallenge.options || [];
    this.optionButtons = [];

    options.slice(0, 4).forEach((opt, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const ox = boxMargin + 14 + col * (optW + 10);
      const oy = optY + row * (optH + optGap);

      const btnGfx = this.scene.add.graphics().setScrollFactor(0).setDepth(baseDepth + 5);
      const drawBtn = (hover = false) => {
        if (!btnGfx || !btnGfx.active) return;
        btnGfx.clear();
        btnGfx.fillStyle(hover ? 0x1e3a8a : 0x0f172a, 0.95);
        btnGfx.fillRoundedRect(ox, oy, optW, optH, 5);
        btnGfx.lineStyle(hover ? 2 : 1, hover ? 0x38bdf8 : 0x334155, 1);
        btnGfx.strokeRoundedRect(ox, oy, optW, optH, 5);
      };
      drawBtn(false);
      this.track(btnGfx);

      const prefix = ['[1]', '[2]', '[3]', '[4]'][idx];
      const optLabel = this.scene.add.text(
        ox + 10,
        oy + optH / 2,
        `${prefix} ${opt}`,
        {
          fontFamily: 'monospace',
          fontSize: isNarrow ? '9.5px' : '10.5px',
          color: '#e2e8f0',
          wordWrap: { width: optW - 20 }
        }
      ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(baseDepth + 8);
      this.track(optLabel);

      // Zona de clic garantizada con rectángulo interactivo de alta prioridad
      const hitZone = this.scene.add.rectangle(ox, oy, optW, optH, 0x000000, 0.001)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(baseDepth + 20)
        .setInteractive({ useHandCursor: true });
      this.track(hitZone);

      hitZone.on('pointerover', () => drawBtn(true));
      hitZone.on('pointerout', () => drawBtn(false));
      hitZone.on('pointerdown', () => this.handleOptionSelect(idx));

      this.optionButtons.push({ btnGfx, optLabel, hitZone, drawBtn });
    });
  }

  handleOptionSelect(index) {
    if (this.isResolving || !this.currentChallenge || !this.isOpen) return;
    this.isResolving = true;

    const isCorrect = (index === this.currentChallenge.correctIndex);
    const resultColor = isCorrect ? '#34d399' : '#ef4444';
    const resultMsg = isCorrect
      ? '⚡ ¡IMPACTO CRÍTICO! Respuesta acertada. MatBot neutralizado.'
      : '⚠️ ¡CÁLCULO ERRÓNEO! MatBot dispara láser. Blindaje dañado (-1 vida).';

    // Desactivar botones de inmediato
    this.optionButtons.forEach(b => {
      if (b && b.hitZone && b.hitZone.disableInteractive) {
        b.hitZone.disableInteractive();
      }
    });

    // Actualización protegida del texto con ajuste dinámico
    if (this.promptText && this.promptText.active && typeof this.promptText.setText === 'function') {
      try {
        const expl = this.currentChallenge.explanation ? `\n💡 ${this.currentChallenge.explanation}` : '';
        this.promptText.setText(`${resultMsg}${expl}`);
        this.promptText.setColor(resultColor);
        if (this.promptText.height > 98) {
          this.promptText.setFontSize(10.5);
          this.promptText.setLineSpacing(1);
        }
      } catch (err) {
        console.warn('[BattleArenaModal] Safe catch al actualizar promptText:', err);
      }
    }

    if (isCorrect) {
      // Audio de acierto
      if (this.scene.soundManager) {
        this.scene.soundManager.playCorrect();
      }

      // Animación de golpe del Cadete (Player)
      if (this.arenaPlayerSprite && this.arenaPlayerSprite.active) {
        const atkKey = this.scene.anims.exists('player_attack') ? 'player_attack' : 'player_punch';
        if (this.scene.anims.exists(atkKey)) {
          this.arenaPlayerSprite.play(atkKey, true);
          this.arenaPlayerSprite.once(`animationcomplete-${atkKey}`, () => {
            if (this.arenaPlayerSprite && this.arenaPlayerSprite.active && this.scene.anims.exists('player_idle')) {
              this.arenaPlayerSprite.play('player_idle', true);
            }
          });
        }
      }

      // Desencadenar animación activa en la entidad del jugador en el mundo
      if (this.player && typeof this.player.performAttack === 'function') {
        this.player.performAttack();
      }

      // Animación en MatBot (Derrota)
      if (this.botHpBar && this.botHpBar.active) {
        const hpTween = this.scene.tweens.add({
          targets: this.botHpBar,
          width: 0,
          duration: 350,
          ease: 'Power2'
        });
        this.activeTweens.push(hpTween);
      }

      if (this.arenaBotSprite && this.arenaBotSprite.active) {
        const botTween = this.scene.tweens.add({
          targets: this.arenaBotSprite,
          alpha: 0,
          scaleX: 0.8,
          scaleY: 0.8,
          tint: 0xff0000,
          duration: 600,
          yoyo: true,
          repeat: 1
        });
        this.activeTweens.push(botTween);
      }

      this.scene.cameras.main.flash(200, 56, 189, 248);
    } else {
      // Audio de error y láser de contraataque
      if (this.scene.soundManager) {
        this.scene.soundManager.playError();
        this.scene.time.delayedCall(150, () => {
          this.scene.soundManager?.playHit();
        });
      }

      // Animación de ataque del MatBot
      if (this.arenaBotSprite && this.arenaBotSprite.active) {
        if (this.scene.anims.exists('matbot_attack')) {
          this.arenaBotSprite.play('matbot_attack', true);
          this.arenaBotSprite.once('animationcomplete-matbot_attack', () => {
            if (this.arenaBotSprite && this.arenaBotSprite.active && this.scene.anims.exists('matbot_walk')) {
              this.arenaBotSprite.play('matbot_walk', true);
            }
          });
        }
      }

      // Animación de impacto en Cadete
      if (this.arenaPlayerSprite && this.arenaPlayerSprite.active) {
        const playerTween = this.scene.tweens.add({
          targets: this.arenaPlayerSprite,
          tint: 0xff0000,
          alpha: 0.3,
          duration: 90,
          yoyo: true,
          repeat: 4,
          onComplete: () => {
            if (this.arenaPlayerSprite && this.arenaPlayerSprite.active) {
              this.arenaPlayerSprite.clearTint();
              this.arenaPlayerSprite.setAlpha(1.0);
              if (this.scene.anims.exists('player_idle')) {
                this.arenaPlayerSprite.play('player_idle', true);
              }
            }
          }
        });
        this.activeTweens.push(playerTween);
      }

      this.scene.cameras.main.flash(250, 239, 68, 68);
    }

    // Temporizador seguro de resolución
    const endTimer = this.scene.time.delayedCall(1650, () => {
      const challengeRef = this.currentChallenge;
      const botRef = this.currentBot;
      const callback = this.onCombatResult;

      this.close();

      if (typeof callback === 'function') {
        callback(isCorrect, challengeRef, botRef);
      }
    });
    this.pendingTimers.push(endTimer);
  }

  cleanupVisuals() {
    // 1. Detener todos los tweens activos asociados al modal
    if (this.activeTweens && this.activeTweens.length > 0) {
      this.activeTweens.forEach(t => {
        if (t && typeof t.stop === 'function') {
          t.stop();
        }
      });
      this.activeTweens = [];
    }

    // 2. Limpiar temporizadores pendientes
    if (this.pendingTimers && this.pendingTimers.length > 0) {
      this.pendingTimers.forEach(tm => {
        if (tm && typeof tm.remove === 'function') {
          tm.remove();
        }
      });
      this.pendingTimers = [];
    }

    // 3. Matar tweens en cualquier elemento antes de destruir
    this.elements.forEach(el => {
      if (el) {
        try {
          if (this.scene && this.scene.tweens) {
            this.scene.tweens.killTweensOf(el);
          }
          if (typeof el.destroy === 'function') {
            el.destroy();
          }
        } catch (err) {
          console.warn('[BattleArenaModal] Safe destroy catch:', err);
        }
      }
    });

    this.elements = [];
    this.optionButtons = [];
    this.promptText = null;
    this.arenaBotSprite = null;
    this.arenaPlayerSprite = null;
    this.botHpBar = null;
  }

  close() {
    this.isOpen = false;
    this.isResolving = false;
    this.cleanupVisuals();

    // Restaurar movimiento de jugador
    if (this.player && !this.scene.isGameOver && !this.scene.isVictory) {
      if (typeof this.player.unfreeze === 'function') {
        this.player.unfreeze();
      }
    }

    // Restaurar visibilidad de controles virtuales móviles
    if (this.scene.virtualControls) {
      this.scene.virtualControls.setVisible(true);
    }
  }

  destroy() {
    if (this.keyHandler && this.scene && this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.off('keydown', this.keyHandler);
    }
    this.close();
  }
}
