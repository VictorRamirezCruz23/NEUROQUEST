import Phaser from 'phaser';
import { educationEngine } from '../../education/engines/EducationEngine.js';
import { authService } from '../../services/firebase/authService.js';
import { sessionState } from '../../core/sessionState.js';
import { adaptiveEngine } from '../../education/adaptive/AdaptiveEngine.js';
import { tutorService } from '../../services/gemini/tutorService.js';

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
      if (!this.isOpen) return;

      // Se retira la selección de preguntas por teclado (Digit1-4, KeyA-D).
      // Solo se conserva Enter/Espacio para avanzar tras completar exitosamente la resolución.
      if (this.isResolving && this.isSuccess) {
        if (event.code === 'Enter' || event.code === 'Space') {
          if (typeof this.finishResolution === 'function') {
            this.finishResolution();
          }
        }
      }
    };

    this.scene.input.keyboard.on('keydown', this.keyHandler);
  }

  /**
   * Inicia el combate táctico con la transición visual estilo Pokémon y carga adaptativa de IA.
   * @param {Object} options
   * @param {import('../../game/entities/MatBot.js').MatBot} options.matbot
   * @param {Function} options.onCombatResult - Callback (isCorrect, challenge, matbot)
   */
  async startBattle(options = {}) {
    if (this.isOpen) return;

    this.currentBot = options.matbot;
    this.onCombatResult = options.onCombatResult;
    this.isOpen = true;
    this.isResolving = false;
    this.currentChallenge = null;

    // Pausar o inmovilizar jugador
    if (this.player && typeof this.player.freeze === 'function') {
      this.player.freeze();
    }

    // Ocultar controles virtuales y HUD del juego durante el combate
    if (this.scene.virtualControls) {
      this.scene.virtualControls.setVisible(false);
    }
    if (this.scene && typeof this.scene.setHUDVisible === 'function') {
      this.scene.setHUDVisible(false);
    }

    // Sonido de ataque láser / alerta espacial
    if (this.scene.soundManager) {
      this.scene.soundManager.playLaser();
    }

    // Parámetros dinámicos del cadete para calibrar la pregunta del combate
    const compId = sessionState.getActiveCompetency();
    const currentLevel = educationEngine.getCurrentLevel(compId);

    // 1. Verificar primero si el enemigo ya tiene un desafío asignado del nivel actual y no ha sido preguntado
    const preAssigned = (this.currentBot && typeof this.currentBot.getChallenge === 'function')
      ? this.currentBot.getChallenge()
      : null;

    const isAlreadyAsked = preAssigned && (
      educationEngine.challengeHistory.includes(preAssigned.id) ||
      educationEngine.challengeHistory.includes(preAssigned.statement)
    );

    let challengePromise = null;

    if (preAssigned && preAssigned.difficulty === currentLevel && !isAlreadyAsked) {
      // Usar de inmediato sin esperar a la red
      this.currentChallenge = preAssigned;
      if (typeof this.currentBot.setChallenge === 'function') {
        this.currentBot.setChallenge(null);
      }
    } else {
      // Si no tiene desafío o la dificultad cambió, solicitar en segundo plano con respaldo local
      const meta = sessionState.getActiveCompetencyMeta();
      const metrics = educationEngine.getLearningMetrics(compId);
      const recentHistory = adaptiveEngine.getRecentHistory(compId);
      const times = recentHistory.filter(h => h.timeSeconds && h.timeSeconds > 0);
      const avgResponseTime = times.length > 0
        ? Math.round(times.reduce((acc, h) => acc + h.timeSeconds, 0) / times.length)
        : 12;

      const playerParams = {
        competencyId: compId,
        competencyName: meta?.name || compId,
        currentLevel,
        accuracy: metrics?.performance?.accuracy || 0,
        avgResponseTime,
        recentSkills: meta?.skills || [],
        previousStatements: educationEngine.challengeHistory || []
      };

      challengePromise = tutorService.requestDynamicCombatChallenge(playerParams).catch(err => {
        console.warn('[BattleArenaModal] Fallo solicitando combate a IA, usando respaldo:', err);
        return educationEngine.getRandomChallenge(compId, currentLevel);
      });
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
        onComplete: async () => {
          if (!this.isOpen) return;
          cam.setZoom(1);

          if (!this.currentChallenge && challengePromise) {
            try {
              this.currentChallenge = await challengePromise;
            } catch (e) {
              this.currentChallenge = null;
            }
          }

          if (!this.currentChallenge || educationEngine.challengeHistory.includes(this.currentChallenge.id)) {
            this.currentChallenge = educationEngine.getRandomChallenge(compId, currentLevel);
          }

          // Registrar inmediatamente en el historial para evitar cualquier duplicación
          if (this.currentChallenge && !educationEngine.challengeHistory.includes(this.currentChallenge.id)) {
            educationEngine.challengeHistory.push(this.currentChallenge.id);
          }

          if (!this.isOpen) return;
          try {
            this.renderArena();
          } catch (renderErr) {
            console.error('[BattleArenaModal] Error rendering arena:', renderErr);
          }
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
    this.challengeStartTime = Date.now();

    const { width, height } = this.scene.scale;
    const baseDepth = 4000;

    // 1. Telón de fondo cibernético translúcido de alta concentración (bloquea distracciones del mundo)
    const backdrop = this.scene.add.rectangle(0, 0, width, height, 0x060919, 0.90)
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
    // 2. ESCENARIO DEL ENEMIGO (SUPERIOR DERECHA) - RESPONSIVO Y SEPARADO
    // =========================================================================
    const botCenterX = width - Math.max(90, Math.floor(width * 0.12));
    const botCenterY = 115;

    // Base de duelo para MatBot
    const botPlatform = this.scene.add.ellipse(botCenterX, botCenterY + 40, 125, 26, 0x1e1b4b, 0.85)
      .setStrokeStyle(2, 0x6366f1, 0.95)
      .setScrollFactor(0)
      .setDepth(baseDepth + 2);
    this.track(botPlatform);

    // Sprite de combate dinámico del enemigo (tamaño proporcionado y balanceado)
    const activeBotKey = this.currentBot?.texture?.key || (this.scene.textures.exists('matbot_texture') ? 'matbot_texture' : 'matbot');
    const isBotSheet = activeBotKey.includes('sheet') || activeBotKey === 'matbot' || activeBotKey === 'matbot_texture';
    const isFlying = activeBotKey === 'owlbot_texture' || activeBotKey === 'ajolotebot_texture';
    let botScale = 0.46;
    const botSprite = this.scene.add.sprite(
      botCenterX,
      isFlying ? botCenterY : (botCenterY + 40),
      activeBotKey,
      0
    )
      .setOrigin(0.5, isFlying ? 0.5 : 0.89)
      .setScrollFactor(0)
      .setDepth(baseDepth + 3);

    if (activeBotKey === 'parasitebot_texture') {
      botScale = 0.46;
      if (this.scene.anims.exists('parasitebot_crawl')) botSprite.play('parasitebot_crawl');
    } else if (activeBotKey === 'owlbot_texture') {
      botScale = 0.48;
      if (this.scene.anims.exists('owlbot_fly')) botSprite.play('owlbot_fly');
    } else if (activeBotKey === 'ajolotebot_texture') {
      botScale = 0.48;
      if (this.scene.anims.exists('ajolotebot_fly')) botSprite.play('ajolotebot_fly');
    } else if (activeBotKey === 'bosmat_texture') {
      botScale = 0.58;
      if (this.scene.anims.exists('bosmat_idle')) botSprite.play('bosmat_idle');
    } else if (activeBotKey === 'caatbot_texture' || activeBotKey === 'warbot_texture' || activeBotKey === 'brainbot_texture' || activeBotKey === 'neurobot_texture' || activeBotKey === 'questbot_texture') {
      botScale = 0.46;
      const animKey = `${this.currentBot?.botType || ''}_walk`;
      if (this.scene.anims.exists(animKey)) {
        botSprite.play(animKey);
      }
    } else if (isBotSheet) {
      botScale = 0.70;
      if (this.scene.anims.exists('matbot_idle')) {
        botSprite.play('matbot_idle');
      } else if (this.scene.anims.exists('matbot_walk')) {
        botSprite.play('matbot_walk');
      }
    }
    botSprite.setScale(botScale);
    this.track(botSprite);
    this.arenaBotSprite = botSprite;

    // Caja de telemetría del enemigo (con separación garantizada de 30px del sprite)
    const botInfoW = Math.min(205, Math.floor(width * 0.28));
    const botInfoH = 54;
    const botInfoX = botCenterX - 75 - botInfoW;
    const botInfoY = 28;

    const botInfoBox = this.scene.add.graphics().setScrollFactor(0).setDepth(baseDepth + 2);
    botInfoBox.fillStyle(0x0f172a, 0.95);
    botInfoBox.fillRoundedRect(botInfoX, botInfoY, botInfoW, botInfoH, 6);
    botInfoBox.lineStyle(2, 0xef4444, 0.9);
    botInfoBox.strokeRoundedRect(botInfoX, botInfoY, botInfoW, botInfoH, 6);
    this.track(botInfoBox);

    const displayName = (this.currentBot?.botName || this.currentBot?.name || 'MATBOT').toUpperCase();
    const botTitle = (this.currentBot?.botTitle || 'GUARDIÁN COGNITIVO').toUpperCase();

    const botName = this.scene.add.text(botInfoX + 8, botInfoY + 6, `👾 ${displayName}`, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#f87171',
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(baseDepth + 3);
    this.track(botName);

    const barW = botInfoW - 16;
    const botHpBarBg = this.scene.add.rectangle(botInfoX + 8, botInfoY + 24, barW, 8, 0x334155).setOrigin(0).setScrollFactor(0).setDepth(baseDepth + 3);
    this.track(botHpBarBg);

    this.botHpBar = this.scene.add.rectangle(botInfoX + 8, botInfoY + 24, barW, 8, 0xef4444).setOrigin(0).setScrollFactor(0).setDepth(baseDepth + 4);
    this.track(this.botHpBar);

    const botLevel = this.scene.add.text(botInfoX + 8, botInfoY + 38, 'HP: 100%  •  POTENCIA COGNITIVA: 1.0', {
      fontFamily: 'monospace',
      fontSize: '7.5px',
      color: '#94a3b8'
    }).setScrollFactor(0).setDepth(baseDepth + 3);
    this.track(botLevel);

    // =========================================================================
    // 3. ESCENARIO DEL JUGADOR (INFERIOR IZQUIERDA) - RESPONSIVO Y SEPARADO
    // =========================================================================
    const playerCenterX = Math.max(85, Math.floor(width * 0.12));
    const playerCenterY = 175;

    // Base de duelo para el Cadete
    const playerPlatform = this.scene.add.ellipse(playerCenterX, playerCenterY + 40, 125, 26, 0x064e3b, 0.85)
      .setStrokeStyle(2, 0x10b981, 0.95)
      .setScrollFactor(0)
      .setDepth(baseDepth + 2);
    this.track(playerPlatform);

    // Sprite del jugador (textura independiente player_texture)
    const playerTextureKey = this.scene.textures.exists('player_texture') ? 'player_texture' : 'player';
    const playerSprite = this.scene.add.sprite(playerCenterX, playerCenterY, playerTextureKey, 1)
      .setScale(0.40)
      .setScrollFactor(0)
      .setDepth(baseDepth + 3);
    if (this.scene.anims.exists('player_idle')) {
      playerSprite.play('player_idle');
    }
    this.track(playerSprite);
    this.arenaPlayerSprite = playerSprite;

    // Caja de telemetría del Cadete
    const playerInfoW = Math.min(220, Math.floor(width * 0.28));
    const playerInfoH = 62;
    const playerInfoX = playerCenterX + 65;
    const playerInfoY = 145;

    const playerInfoBox = this.scene.add.graphics().setScrollFactor(0).setDepth(baseDepth + 2);
    playerInfoBox.fillStyle(0x0f172a, 0.95);
    playerInfoBox.fillRoundedRect(playerInfoX, playerInfoY, playerInfoW, playerInfoH, 6);
    playerInfoBox.lineStyle(2, 0x38bdf8, 0.9);
    playerInfoBox.strokeRoundedRect(playerInfoX, playerInfoY, playerInfoW, playerInfoH, 6);
    this.track(playerInfoBox);

    const playerName = this.scene.add.text(playerInfoX + 8, playerInfoY + 6, `⚡ CADETE: ${authService.getDisplayName().toUpperCase()}`, {
      fontFamily: 'monospace',
      fontSize: '9.5px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(baseDepth + 3);
    this.track(playerName);

    const livesLabel = this.scene.add.text(playerInfoX + 8, playerInfoY + 22, 'BLINDAJE DE ENERGÍA:', {
      fontFamily: 'monospace',
      fontSize: '8.5px',
      color: '#94a3b8'
    }).setScrollFactor(0).setDepth(baseDepth + 3);
    this.track(livesLabel);

    // Cabezas del jugador que reflejan las vidas actuales
    this.playerHeads = [];
    const maxLives = 5;
    const currentLives = (this.scene && typeof this.scene.lives === 'number') ? this.scene.lives : 5;
    for (let i = 0; i < maxLives; i++) {
      const headX = playerInfoX + 16 + (i * 24);
      const headY = playerInfoY + 44;
      const head = this.scene.add.image(headX, headY, 'player_head')
        .setDisplaySize(18, 18)
        .setScrollFactor(0)
        .setDepth(baseDepth + 4);

      if (i >= currentLives) {
        head.setTint(0x334155);
        head.setAlpha(0.35);
      }
      this.track(head);
      this.playerHeads.push(head);
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

      const prefix = ['A)', 'B)', 'C)', 'D)'][idx];
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

      this.optionButtons.push({ btnGfx, optLabel, hitZone, drawBtn, ox, oy, optW, optH, rawText: opt });
    });
  }

  handleOptionSelect(index) {
    if (this.isResolving || !this.currentChallenge || !this.isOpen) return;

    try {
      const timeSeconds = this.challengeStartTime
        ? (Date.now() - this.challengeStartTime) / 1000
        : 0;

      const compId = this.currentChallenge.competencyId || sessionState.getActiveCompetency();
      const prevLevel = educationEngine.getCurrentLevel(compId);
      const evalResult = educationEngine.evaluateAnswer(this.currentChallenge, index, timeSeconds);
      const isCorrect = evalResult.isCorrect;
      const newLevel = evalResult.currentLevel;
      const isLevelUp = isCorrect && (newLevel > prevLevel);
      const correctIdx = typeof this.currentChallenge.correctIndex === 'number'
        ? this.currentChallenge.correctIndex
        : 0;

      // =======================================================================
      // CASO 1: RESPUESTA INCORRECTA (Reintento fluido sin bloqueo ni bug)
      // =======================================================================
      if (!isCorrect) {
        // Reducir estrictamente 1 vida del jugador por intento fallido
        if (typeof this.scene.lives === 'number') {
          this.scene.lives = Math.max(0, this.scene.lives - 1);
          if (typeof this.scene.updateLivesHUD === 'function') {
            this.scene.updateLivesHUD();
          }
          if (typeof this.scene.updateCriticalHealthFX === 'function') {
            this.scene.updateCriticalHealthFX();
          }
        }

        // Actualizar cabezas de vida en el modal de combate
        if (this.playerHeads) {
          const currentLives = typeof this.scene.lives === 'number' ? this.scene.lives : 5;
          this.playerHeads.forEach((head, i) => {
            if (head && head.active) {
              if (i >= currentLives) {
                head.setTint(0x334155);
                head.setAlpha(0.35);
              }
            }
          });
        }

        // Efectos de sonido y vibración de cámara
        if (this.scene.soundManager) {
          this.scene.soundManager.playError();
          this.scene.time.delayedCall(90, () => {
            this.scene.soundManager?.playHit();
          });
        }
        this.scene.cameras.main.shake(250, 0.015);

        // Destello de daño en sprite del jugador
        if (this.arenaPlayerSprite && this.arenaPlayerSprite.active) {
          this.arenaPlayerSprite.setTint(0xef4444);
          this.scene.time.delayedCall(160, () => {
            if (this.arenaPlayerSprite && this.arenaPlayerSprite.active) {
              this.arenaPlayerSprite.clearTint();
            }
          });
        }

        // Desactivar y marcar en rojo ÚNICAMENTE la opción incorrecta seleccionada
        const chosenBtn = this.optionButtons[index];
        if (chosenBtn) {
          if (chosenBtn.hitZone && chosenBtn.hitZone.disableInteractive) {
            chosenBtn.hitZone.disableInteractive();
          }
          if (chosenBtn.btnGfx && chosenBtn.btnGfx.active) {
            chosenBtn.btnGfx.clear();
            chosenBtn.btnGfx.fillStyle(0x7f1d1d, 0.95);
            chosenBtn.btnGfx.fillRoundedRect(chosenBtn.ox, chosenBtn.oy, chosenBtn.optW, chosenBtn.optH, 5);
            chosenBtn.btnGfx.lineStyle(2, 0xef4444, 1);
            chosenBtn.btnGfx.strokeRoundedRect(chosenBtn.ox, chosenBtn.oy, chosenBtn.optW, chosenBtn.optH, 5);
          }
          if (chosenBtn.optLabel && chosenBtn.optLabel.active) {
            chosenBtn.optLabel.setColor('#fca5a5');
            chosenBtn.optLabel.setText(`[❌] ${chosenBtn.rawText || ''}`);
          }
        }

        // Si el jugador se quedó sin vidas, terminar combate para pantalla de Game Over
        if (typeof this.scene.lives === 'number' && this.scene.lives <= 0) {
          this.isResolving = true;
          const botRef = this.currentBot;
          const challengeRef = this.currentChallenge;
          this.close();
          if (typeof this.onCombatResult === 'function') {
            this.onCombatResult(false, challengeRef, botRef, {});
          }
          return;
        }

        // Si aún tiene vidas, permitir reintentar con otra opción inmediatamente
        if (this.promptText && this.promptText.active) {
          this.promptText.setText('⚠️ ¡CÁLCULO ERRÓNEO! Blindaje dañado (-1 vida).\nIntenta responder de nuevo seleccionando otra opción:');
          this.promptText.setColor('#f87171');
        }

        this.isResolving = false;
        return;
      }

      // =======================================================================
      // CASO 2: RESPUESTA CORRECTA (Victoria del duelo)
      // =======================================================================
      this.isResolving = true;
      this.isSuccess = true;

      let resultMsg = '⚡ ¡IMPACTO CRÍTICO! Respuesta acertada. Enemigo neutralizado.';
      if (evalResult.adaptiveResult && evalResult.adaptiveResult.action === 'INCREASE') {
        resultMsg += `\n🚀 ¡Dificultad elevada a Nivel ${evalResult.currentLevel}! (${evalResult.adaptiveResult.reason})`;
      }

      // Marcar opción acertada en verde y desactivar botones
      this.optionButtons.forEach((b, idx) => {
        if (!b) return;
        if (b.hitZone && b.hitZone.disableInteractive) {
          b.hitZone.disableInteractive();
        }
        if (b.btnGfx && b.btnGfx.active) {
          b.btnGfx.clear();
          if (idx === index) {
            b.btnGfx.fillStyle(0x065f46, 0.95);
            b.btnGfx.fillRoundedRect(b.ox, b.oy, b.optW, b.optH, 5);
            b.btnGfx.lineStyle(2, 0x10b981, 1);
            b.btnGfx.strokeRoundedRect(b.ox, b.oy, b.optW, b.optH, 5);
          } else {
            b.btnGfx.fillStyle(0x0a0f1d, 0.4);
            b.btnGfx.fillRoundedRect(b.ox, b.oy, b.optW, b.optH, 5);
          }
        }
        if (idx === index && b.optLabel && b.optLabel.active) {
          b.optLabel.setColor('#34d399');
          b.optLabel.setText(`[✓] ${b.rawText || ''}`);
        }
      });

      if (this.promptText && this.promptText.active) {
        const expl = this.currentChallenge.explanation ? `\n💡 ${this.currentChallenge.explanation}` : '';
        this.promptText.setText(`${resultMsg}${expl}`);
        this.promptText.setColor('#34d399');
      }

      // Audio de acierto
      if (this.scene.soundManager) {
        this.scene.soundManager.playCorrect();
      }

      // Animación de ataque del Cadete
      if (this.arenaPlayerSprite && this.arenaPlayerSprite.active) {
        const atkKey = this.scene.anims.exists('player_attack') ? 'player_attack' : 'player_punch';
        if (this.scene.anims.exists(atkKey)) {
          this.arenaPlayerSprite.play(atkKey, true);
        }
      }

      // Vaciar barra de vida del bot
      if (this.botHpBar && this.botHpBar.active) {
        this.scene.tweens.add({
          targets: this.botHpBar,
          width: 0,
          duration: 300,
          ease: 'Power2'
        });
      }

      // Desvanecimiento del bot
      if (this.arenaBotSprite && this.arenaBotSprite.active) {
        this.arenaBotSprite.setTint(0xef4444);
        this.scene.tweens.add({
          targets: this.arenaBotSprite,
          alpha: 0.1,
          scaleX: 0.7,
          scaleY: 0.7,
          duration: 400
        });
      }

      // Finalizar tras breve retraso satisfactorio
      const endTimer = this.scene.time.delayedCall(850, () => {
        const botRef = this.currentBot;
        const challengeRef = this.currentChallenge;
        this.close();
        if (this.scene && typeof this.scene.updateHUDLevel === 'function') {
          this.scene.updateHUDLevel();
        }
        if (typeof this.onCombatResult === 'function') {
          this.onCombatResult(true, challengeRef, botRef, { isLevelUp, newLevel, prevLevel });
        }
      });
      this.pendingTimers.push(endTimer);

    } catch (err) {
      console.error('[BattleArenaModal] Error inesperado en resolución de combate:', err);
      const botRef = this.currentBot;
      const challengeRef = this.currentChallenge;
      this.close();
      if (typeof this.onCombatResult === 'function') {
        this.onCombatResult(false, challengeRef, botRef, {});
      }
    }
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
    this.finishResolution = null;
    this.currentChallenge = null;
    this.currentBot = null;
    this.cleanupVisuals();

    // Restaurar movimiento de jugador
    if (this.player && !this.scene.isGameOver && !this.scene.isVictory) {
      if (typeof this.player.unfreeze === 'function') {
        this.player.unfreeze();
      }
    }

    // Restaurar visibilidad de controles virtuales móviles y HUD
    if (this.scene.virtualControls) {
      this.scene.virtualControls.setVisible(true);
    }
    if (this.scene && typeof this.scene.setHUDVisible === 'function') {
      this.scene.setHUDVisible(true);
    }
  }

  destroy() {
    if (this.keyHandler && this.scene && this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.off('keydown', this.keyHandler);
    }
    this.close();
  }
}
