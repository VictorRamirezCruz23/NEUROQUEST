import Phaser from 'phaser';
import { educationEngine } from '../../education/engines/EducationEngine.js';
import { sessionState } from '../../core/sessionState.js';
import { DIFFICULTY_LABELS, adaptiveEngine } from '../../education/adaptive/AdaptiveEngine.js';
import { tutorService } from '../../services/gemini/tutorService.js';

/**
 * ChallengeModal.js — Interfaz interactiva de terminal educativa y evaluación adaptativa.
 * Diseño en capas planas (flat screen-space) con espaciado vertical riguroso para evitar
 * cualquier solapamiento o encimamiento visual entre elementos.
 */
export class ChallengeModal {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('../../game/entities/Player.js').Player} player
   */
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.isOpen = false;
    this.currentChallenge = null;
    this.elements = [];

    this.setupKeyboardListeners();
  }

  setupKeyboardListeners() {
    this.scene.input.keyboard.on('keydown', (event) => {
      if (!this.isOpen) return;

      const code = event.code;
      // Retirada selección por teclado: Solo interacción por Clic / Táctil
      if (this.currentView === 'challenge') {
        if (code === 'KeyH') this.triggerHint();
      } else if (this.currentView === 'feedback') {
        if (code === 'Enter' || code === 'Space') {
          if (this.currentOptions?.mode === 'combat' || this.currentOptions?.mode === 'recovery') {
            if (this.lastResult && this.lastResult.isCorrect) {
              this.close();
            } else {
              this.renderChallengeView();
            }
          } else if (this.lastResult && this.lastResult.isCorrect) {
            this.open();
          } else {
            this.renderChallengeView();
          }
        }
      }

      if (code === 'Escape') {
        this.close();
      }
    });
  }

  async open(options = {}) {
    this.currentOptions = options;
    this.isOpen = true;
    if (this.player) this.player.freeze();
    if (this.scene && this.scene.virtualControls) {
      this.scene.virtualControls.setVisible(false);
    }

    if (options.challenge) {
      this.currentChallenge = options.challenge;
    } else if (options.mode === 'combat') {
      // Mostrar breve estado de carga táctica
      this.renderLoadingCombatView();

      const compId = sessionState.getActiveCompetency();
      const meta = sessionState.getActiveCompetencyMeta();
      const currentLevel = educationEngine.getCurrentLevel(compId);
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

      try {
        this.currentChallenge = await tutorService.requestDynamicCombatChallenge(playerParams);
      } catch (err) {
        console.warn('[ChallengeModal] Error solicitando combate táctico a E.V.A., usando respaldo:', err);
        this.currentChallenge = educationEngine.getRandomChallenge(compId, currentLevel);
      }
    } else if (options.mode === 'recovery') {
      this.currentChallenge = educationEngine.getRandomChallenge();
    } else {
      this.currentChallenge = educationEngine.getNextChallenge(null, options);
    }

    // Si el usuario cerró el modal durante la carga asíncrona
    if (!this.isOpen) return;

    if (!this.currentChallenge) {
      console.warn('[ChallengeModal] No hay desafíos en el banco para la competencia activa.');
      this.close();
      return;
    }

    this.currentView = 'challenge';
    this.renderChallengeView();
  }

  renderLoadingCombatView() {
    this.clearElements();
    this.currentView = 'loading';

    const { width, height } = this.scene.scale;
    const baseDepth = 2000;
    const modalW = 820;
    const modalH = 480;
    const modalX = (width - modalW) / 2;
    const modalY = (height - modalH) / 2;

    // Telón de fondo
    this.track(
      this.scene.add.rectangle(0, 0, width, height, 0x05070f, 0.85)
        .setOrigin(0)
        .setDepth(baseDepth)
        .setInteractive()
    );

    // Caja modal con borde de combate
    const modalBg = this.track(this.scene.add.graphics().setDepth(baseDepth + 1));
    modalBg.fillStyle(0x0f172a, 0.98);
    modalBg.fillRoundedRect(modalX, modalY, modalW, modalH, 10);
    modalBg.lineStyle(2, 0xef4444, 0.85);
    modalBg.strokeRoundedRect(modalX, modalY, modalW, modalH, 10);

    // Cabecera táctica
    this.track(
      this.scene.add.text(
        modalX + modalW / 2,
        modalY + 140,
        '⚔️ ALERTA DE COMBATE TÁCTICO • NEUROCORE',
        {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#f87171',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5).setDepth(baseDepth + 2)
    );

    this.track(
      this.scene.add.text(
        modalX + modalW / 2,
        modalY + 190,
        'E.V.A. calibrando desafío táctico según tu perfil...',
        {
          fontFamily: 'Segoe UI, -apple-system, sans-serif',
          fontSize: '15px',
          color: '#cbd5e1'
        }
      ).setOrigin(0.5).setDepth(baseDepth + 2)
    );

    // Barra de pulso defensiva
    const pulseBar = this.track(
      this.scene.add.rectangle(modalX + modalW / 2, modalY + 250, 260, 6, 0xef4444)
        .setOrigin(0.5)
        .setDepth(baseDepth + 2)
    );

    if (this.scene && this.scene.tweens) {
      if (this.loadingTween) {
        try {
          this.loadingTween.stop();
          this.loadingTween.remove();
        } catch (e) {}
      }
      this.loadingTween = this.scene.tweens.add({
        targets: pulseBar,
        scaleX: 0.15,
        alpha: 0.35,
        duration: 650,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    this.track(
      this.scene.add.text(
        modalX + modalW / 2,
        modalY + modalH - 40,
        '[ Preparando subsistemas tácticos de defensa... ]',
        {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#64748b'
        }
      ).setOrigin(0.5).setDepth(baseDepth + 2)
    );
  }

  clearElements() {
    if (this.loadingTween) {
      try {
        this.loadingTween.stop();
        this.loadingTween.remove();
      } catch (e) {}
      this.loadingTween = null;
    }

    if (this.scene && this.scene.tweens) {
      this.elements.forEach(el => {
        if (el) {
          try {
            this.scene.tweens.killTweensOf(el);
          } catch (e) {}
        }
      });
    }

    this.elements.forEach(el => {
      if (el && el.destroy) {
        try {
          el.destroy();
        } catch (e) {}
      }
    });
    this.elements = [];
  }

  track(gameObj) {
    gameObj.setScrollFactor(0);
    this.elements.push(gameObj);
    return gameObj;
  }

  renderChallengeView() {
    this.clearElements();
    this.currentView = 'challenge';
    this.challengeStartTime = Date.now();

    const { width, height } = this.scene.scale;
    const meta = sessionState.getActiveCompetencyMeta();
    const currentLevel = educationEngine.getCurrentLevel();
    const baseDepth = 2000;

    // Telón de fondo
    this.track(
      this.scene.add.rectangle(0, 0, width, height, 0x05070f, 0.82)
        .setOrigin(0)
        .setDepth(baseDepth)
        .setInteractive()
    );

    // Dimensiones y posición del modal central
    const modalW = 820;
    const modalH = 480;
    const modalX = (width - modalW) / 2;
    const modalY = (height - modalH) / 2;

    // Fondo del modal
    const modalBg = this.track(this.scene.add.graphics().setDepth(baseDepth + 1));
    modalBg.fillStyle(0x0f172a, 0.98);
    modalBg.fillRoundedRect(modalX, modalY, modalW, modalH, 10);
    modalBg.lineStyle(2, meta.primaryColor, 1);
    modalBg.strokeRoundedRect(modalX, modalY, modalW, modalH, 10);

    // 1. Cabecera (Y: 0 a 42 px)
    const isCombat = this.currentOptions?.mode === 'combat';
    const isRecovery = this.currentOptions?.mode === 'recovery';

    let headerBgFill = meta.badgeBg;
    let headerTitle = `[ ${meta.code} ] TERMINAL EDUCATIVA • ${meta.name.toUpperCase()} (MUNDO ${meta.worldNumber})`;

    if (isCombat) {
      headerBgFill = 0x991b1b;
      headerTitle = `⚔️ DUELO DE COMBATE • ENFRENTAMIENTO CONTRA MATBOT`;
    } else if (isRecovery) {
      headerBgFill = 0x065f46;
      headerTitle = `💖 SINTONIZACIÓN NANOBÓTICA • NÚCLEO DE VIDA`;
    }

    const headerBg = this.track(this.scene.add.graphics().setDepth(baseDepth + 2));
    headerBg.fillStyle(headerBgFill, 0.95);
    headerBg.fillRoundedRect(modalX, modalY, modalW, 42, { tl: 10, tr: 10, bl: 0, br: 0 });

    this.track(
      this.scene.add.text(
        modalX + 18,
        modalY + 13,
        headerTitle,
        {
          fontFamily: 'monospace',
          fontSize: '13px',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      ).setDepth(baseDepth + 3)
    );

    // Botón Cerrar (X)
    const closeBtn = this.track(
      this.scene.add.text(modalX + modalW - 25, modalY + 12, '✕', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#cbd5e1'
      })
      .setOrigin(0.5)
      .setDepth(baseDepth + 3)
      .setInteractive({ useHandCursor: true })
    );
    closeBtn.on('pointerdown', () => this.close());

    // 2. Banner de Diagnóstico / Nivel Adaptativo / Transferencia / Retención / Combate
    const isDiag = !!this.currentChallenge.isDiagnostic;
    const isTransfer = !!this.currentChallenge.isTransfer;
    const isRetention = !!this.currentChallenge.isRetention;
    const levelLabel = DIFFICULTY_LABELS[currentLevel] || `Nivel ${currentLevel}`;

    let bannerBgColor = 0x1e293b;
    let bannerTextColor = meta.primaryColorHex;
    let bannerText = `★ HABILIDAD: ${this.currentChallenge.skillName} • ${levelLabel.toUpperCase()}`;

    if (isCombat) {
      bannerBgColor = 0x7f1d1d;
      bannerTextColor = '#fca5a5';
      bannerText = '⚠️ ¡ALERTA DE COMBATE! Responde correctamente para derrotar a MatBot. Si fallas, perderás 1 vida.';
    } else if (isRecovery) {
      bannerBgColor = 0x064e3b;
      bannerTextColor = '#6ee7b7';
      bannerText = '💖 ¡NÚCLEO DE RECUPERACIÓN! Responde correctamente para restaurar 1 vida a tu blindaje (Máximo 5).';
    } else if (isDiag) {
      bannerBgColor = 0x78350f;
      bannerTextColor = '#fbbf24';
      bannerText = '★ EVALUACIÓN DIAGNÓSTICA INICIAL • Calibración de línea base sin penalización';
    } else if (isTransfer) {
      bannerBgColor = 0x4c1d95;
      bannerTextColor = '#c084fc';
      bannerText = `★ DESAFÍO DE TRANSFERENCIA COGNITIVA • Contexto: ${this.currentChallenge.domainContext || 'Novedoso'}`;
    } else if (isRetention) {
      bannerBgColor = 0x064e3b;
      bannerTextColor = '#34d399';
      bannerText = '★ EVALUACIÓN DE RETENCIÓN TEMPORAL • Persistencia conceptual tras intervalo';
    }

    const bannerBg = this.track(this.scene.add.graphics().setDepth(baseDepth + 2));
    bannerBg.fillStyle(bannerBgColor, 0.88);
    bannerBg.fillRoundedRect(modalX + 18, modalY + 48, modalW - 36, 22, 4);

    this.track(
      this.scene.add.text(
        modalX + 26,
        modalY + 52,
        bannerText,
        {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: bannerTextColor,
          fontStyle: 'bold'
        }
      ).setDepth(baseDepth + 3)
    );

    // 3. Contexto Narrativo (Y: modalY + 76 px)
    this.track(
      this.scene.add.text(
        modalX + 22,
        modalY + 76,
        `Contexto: ${this.currentChallenge.context}`,
        {
          fontFamily: 'Segoe UI',
          fontSize: '11px',
          color: '#94a3b8',
          fontStyle: 'italic',
          wordWrap: { width: modalW - 44 }
        }
      ).setDepth(baseDepth + 3)
    );

    // 4. Enunciado del Desafío (Y: modalY + 104 px)
    this.track(
      this.scene.add.text(
        modalX + 22,
        modalY + 104,
        this.currentChallenge.statement,
        {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#f8fafc',
          lineSpacing: 3,
          wordWrap: { width: modalW - 44 }
        }
      ).setDepth(baseDepth + 3)
    );

    // 5. Opciones de Respuesta (Y: modalY + 190 px, sin anidamiento ni solapamiento)
    const startOptY = modalY + 190;
    const optW = modalW - 44;
    const optH = 38;
    const optGap = 46;

    this.currentChallenge.options.forEach((optText, idx) => {
      const optY = startOptY + (idx * optGap);
      const letter = String.fromCharCode(65 + idx);

      const btnBg = this.track(this.scene.add.graphics().setDepth(baseDepth + 4));
      const drawOpt = (hover = false) => {
        btnBg.clear();
        btnBg.fillStyle(hover ? 0x1d4ed8 : 0x1e293b, 0.95);
        btnBg.fillRoundedRect(modalX + 22, optY, optW, optH, 6);
        btnBg.lineStyle(hover ? 2 : 1, hover ? meta.primaryColor : 0x475569, 1);
        btnBg.strokeRoundedRect(modalX + 22, optY, optW, optH, 6);
      };
      drawOpt(false);

      this.track(
        this.scene.add.text(
          modalX + 36,
          optY + optH / 2,
          `[${letter} / ${idx + 1}]  ${optText}`,
          {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#f8fafc'
          }
        )
        .setOrigin(0, 0.5)
        .setDepth(baseDepth + 5)
      );

      const hitZone = this.track(
        this.scene.add.zone(modalX + 22 + optW / 2, optY + optH / 2, optW, optH)
          .setDepth(baseDepth + 6)
          .setInteractive({ useHandCursor: true })
      );

      hitZone.on('pointerover', () => drawOpt(true));
      hitZone.on('pointerout', () => drawOpt(false));
      hitZone.on('pointerdown', () => this.submitAnswer(idx));
    });

    // 6. Barra Inferior de Pistas y Atajos (Y: modalY + modalH - 25 px)
    const footerY = modalY + modalH - 24;

    const hintBg = this.track(this.scene.add.graphics().setDepth(baseDepth + 4));
    hintBg.fillStyle(0x1e293b, 0.95);
    hintBg.fillRoundedRect(modalX + 22, footerY - 15, 170, 30, 6);
    hintBg.lineStyle(1, 0xf59e0b, 0.85);
    hintBg.strokeRoundedRect(modalX + 22, footerY - 15, 170, 30, 6);

    this.track(
      this.scene.add.text(modalX + 107, footerY, '💡 Pista [H]', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#fbbf24',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(baseDepth + 5)
    );

    const hintHit = this.track(
      this.scene.add.zone(modalX + 107, footerY, 170, 30)
        .setDepth(baseDepth + 6)
        .setInteractive({ useHandCursor: true })
    );
    hintHit.on('pointerdown', () => this.triggerHint());

    this.track(
      this.scene.add.text(
        modalX + modalW - 200,
        footerY,
        'Responde: [A, B, C, D] o [1, 2, 3, 4]',
        {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#64748b'
        }
      )
      .setOrigin(0.5)
      .setDepth(baseDepth + 5)
    );
  }

  triggerHint() {
    const hint = educationEngine.requestHint(this.currentChallenge);
    if (hint) {
      const { width, height } = this.scene.scale;
      const modalW = 820;
      const modalH = 480;
      const modalX = (width - modalW) / 2;
      const modalY = (height - modalH) / 2;

      const toast = this.track(
        this.scene.add.text(modalX + 22, modalY + modalH - 72, hint, {
          fontFamily: 'Segoe UI',
          fontSize: '11px',
          color: '#fef08a',
          backgroundColor: 'rgba(30, 27, 75, 0.98)',
          padding: { x: 12, y: 7 },
          wordWrap: { width: modalW - 44 }
        }).setDepth(2010)
      );

      this.scene.time.delayedCall(7000, () => {
        if (toast && toast.destroy) toast.destroy();
      });
    }
  }

  submitAnswer(optionIndex) {
    if (!this.isOpen || this.currentView !== 'challenge') return;
    try {
      const timeSeconds = this.challengeStartTime
        ? (Date.now() - this.challengeStartTime) / 1000
        : 0;
      const result = educationEngine.evaluateAnswer(this.currentChallenge, optionIndex, timeSeconds);
      this.lastResult = result;

      if (this.currentOptions?.mode === 'combat') {
        if (typeof this.currentOptions.onCombatResult === 'function') {
          this.currentOptions.onCombatResult(result.isCorrect, this.currentChallenge, this.currentOptions.matbot);
        }
      } else if (this.currentOptions?.mode === 'recovery') {
        if (typeof this.currentOptions.onRecoveryResult === 'function') {
          this.currentOptions.onRecoveryResult(result.isCorrect, this.currentChallenge, this.currentOptions.healthItem);
        }
      }

      if (this.scene && typeof this.scene.updateHUDLevel === 'function') {
        this.scene.updateHUDLevel();
      }
      this.renderFeedbackView(result);
    } catch (err) {
      console.error('[ChallengeModal] Error al procesar respuesta:', err);
      this.close();
    }
  }

  renderFeedbackView(result) {
    this.clearElements();
    this.currentView = 'feedback';

    const { width, height } = this.scene.scale;
    const baseDepth = 2000;
    const compId = this.currentChallenge?.competencyId || sessionState.getActiveCompetency();
    const meta = sessionState.getActiveCompetencyMeta() || {
      name: compId || 'Pensamiento Lógico',
      code: 'LOGIC',
      primaryColor: 0x38bdf8
    };

    // Telón
    this.track(
      this.scene.add.rectangle(0, 0, width, height, 0x05070f, 0.85)
        .setOrigin(0)
        .setDepth(baseDepth)
        .setInteractive()
    );

    const modalW = 820;
    const modalH = 480;
    const modalX = (width - modalW) / 2;
    const modalY = (height - modalH) / 2;

    const modalBg = this.track(this.scene.add.graphics().setDepth(baseDepth + 1));
    modalBg.fillStyle(0x0f172a, 0.98);
    modalBg.fillRoundedRect(modalX, modalY, modalW, modalH, 10);
    const borderColor = result.isCorrect ? 0x10b981 : 0xf59e0b;
    modalBg.lineStyle(2, borderColor, 1);
    modalBg.strokeRoundedRect(modalX, modalY, modalW, modalH, 10);

    // 1. Cabecera adaptada
    const isCombat = this.currentOptions?.mode === 'combat';
    const isRecovery = this.currentOptions?.mode === 'recovery';

    let fbHeaderBg = result.isCorrect ? 0x065f46 : 0x78350f;
    let fbTitle = result.title;

    if (isCombat) {
      fbHeaderBg = result.isCorrect ? 0x065f46 : 0x991b1b;
      fbTitle = result.isCorrect
        ? '⚔️ ¡VICTORIA EN COMBATE! MATBOT NEUTRALIZADO'
        : '💥 ¡ATAQUE ENEMIGO RECIBIDO! HAS PERDIDO 1 VIDA';
    } else if (isRecovery) {
      fbHeaderBg = result.isCorrect ? 0x065f46 : 0x78350f;
      fbTitle = result.isCorrect
        ? '💖 ¡REPARACIÓN EXITOSA! +1 VIDA RECUPERADA'
        : '⚠️ DESCARGA DE ENERGÍA: NO SE RESTAURÓ LA VIDA';
    }

    const headerBg = this.track(this.scene.add.graphics().setDepth(baseDepth + 2));
    headerBg.fillStyle(fbHeaderBg, 0.95);
    headerBg.fillRoundedRect(modalX, modalY, modalW, 42, { tl: 10, tr: 10, bl: 0, br: 0 });

    this.track(
      this.scene.add.text(modalX + 18, modalY + 13, fbTitle, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setDepth(baseDepth + 3)
    );

    let contentY = modalY + 54;

    // 2. Estado de diagnóstico, transferencia, retención o intento regular
    if (result.isDiagnostic && result.diagnosticResult) {
      const diagBg = this.track(this.scene.add.graphics().setDepth(baseDepth + 2));
      diagBg.fillStyle(0x1e293b, 0.9);
      diagBg.fillRoundedRect(modalX + 22, contentY, modalW - 44, 46, 6);
      diagBg.lineStyle(1, 0x38bdf8, 0.8);
      diagBg.strokeRoundedRect(modalX + 22, contentY, modalW - 44, 46, 6);

      this.track(
        this.scene.add.text(
          modalX + 32,
          contentY + 8,
          `★ ${result.diagnosticResult.title}: Línea base asignada en ${DIFFICULTY_LABELS[result.diagnosticResult.baselineLevel]}`,
          {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#38bdf8',
            fontStyle: 'bold'
          }
        ).setDepth(baseDepth + 3)
      );

      this.track(
        this.scene.add.text(
          modalX + 32,
          contentY + 26,
          result.diagnosticResult.summary,
          {
            fontFamily: 'Segoe UI',
            fontSize: '11px',
            color: '#cbd5e1'
          }
        ).setDepth(baseDepth + 3)
      );

      contentY += 56;
    } else if (result.isTransfer && result.transferResult) {
      const transBg = this.track(this.scene.add.graphics().setDepth(baseDepth + 2));
      transBg.fillStyle(0x2e1065, 0.92);
      transBg.fillRoundedRect(modalX + 22, contentY, modalW - 44, 46, 6);
      transBg.lineStyle(1, 0xa855f7, 0.8);
      transBg.strokeRoundedRect(modalX + 22, contentY, modalW - 44, 46, 6);

      this.track(
        this.scene.add.text(
          modalX + 32,
          contentY + 8,
          `★ EVALUACIÓN DE TRANSFERENCIA: ${result.transferResult.transferredSkill} (${result.transferResult.transferSuccessRate}% Éxito)`,
          {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#c084fc',
            fontStyle: 'bold'
          }
        ).setDepth(baseDepth + 3)
      );

      this.track(
        this.scene.add.text(
          modalX + 32,
          contentY + 26,
          result.transferResult.feedbackMessage,
          {
            fontFamily: 'Segoe UI',
            fontSize: '11px',
            color: '#e9d5ff'
          }
        ).setDepth(baseDepth + 3)
      );

      contentY += 56;
    } else if (result.isRetention && result.retentionResult) {
      const retBg = this.track(this.scene.add.graphics().setDepth(baseDepth + 2));
      retBg.fillStyle(0x064e3b, 0.92);
      retBg.fillRoundedRect(modalX + 22, contentY, modalW - 44, 46, 6);
      retBg.lineStyle(1, 0x10b981, 0.8);
      retBg.strokeRoundedRect(modalX + 22, contentY, modalW - 44, 46, 6);

      this.track(
        this.scene.add.text(
          modalX + 32,
          contentY + 8,
          `★ EVALUACIÓN DE RETENCIÓN TEMPORAL: ${result.retentionResult.evaluatedSkill} (Índice de Retención: ${result.retentionResult.retentionIndex}%)`,
          {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#34d399',
            fontStyle: 'bold'
          }
        ).setDepth(baseDepth + 3)
      );

      this.track(
        this.scene.add.text(
          modalX + 32,
          contentY + 26,
          result.retentionResult.feedbackMessage,
          {
            fontFamily: 'Segoe UI',
            fontSize: '11px',
            color: '#a7f3d0'
          }
        ).setDepth(baseDepth + 3)
      );

      contentY += 56;
    } else {
      // Estado de intento regular
      this.track(
        this.scene.add.text(
          modalX + 22,
          contentY,
          result.isCorrect
            ? `✓ RESPUESTA CORRECTA (Intento ${result.attempts} • ${result.hintsUsed} pista(s) usadas)`
            : `✕ RESPUESTA SELECCIONADA: "${result.selectedOption}" no cumple la condición requerida.`,
          {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: result.isCorrect ? '#34d399' : '#f87171',
            fontStyle: 'bold'
          }
        ).setDepth(baseDepth + 3)
      );
      contentY += 26;

      // Tarjeta de ajuste de dificultad adaptativa
      if (result.adaptiveResult) {
        const adaptBg = this.track(this.scene.add.graphics().setDepth(baseDepth + 2));
        adaptBg.fillStyle(0x131d33, 0.92);
        adaptBg.fillRoundedRect(modalX + 22, contentY, modalW - 44, 44, 6);
        adaptBg.lineStyle(1, 0x38bdf8, 0.6);
        adaptBg.strokeRoundedRect(modalX + 22, contentY, modalW - 44, 44, 6);

        this.track(
          this.scene.add.text(
            modalX + 32,
            contentY + 6,
            `DIFICULTAD ADAPTATIVA: ${result.adaptiveResult.reason}`,
            {
              fontFamily: 'monospace',
              fontSize: '10px',
              color: '#38bdf8',
              fontStyle: 'bold'
            }
          ).setDepth(baseDepth + 3)
        );

        this.track(
          this.scene.add.text(
            modalX + 32,
            contentY + 22,
            result.adaptiveResult.explanation,
            {
              fontFamily: 'Segoe UI',
              fontSize: '11px',
              color: '#94a3b8',
              wordWrap: { width: modalW - 64 }
            }
          ).setDepth(baseDepth + 3)
        );

        contentY += 54;
      }
    }

    // 3. Explicación conceptual profunda de E.V.A. (Tutor IA con Gemini)
    const explanationText = this.track(
      this.scene.add.text(
        modalX + 22,
        contentY,
        `Explicación Paso a Paso:\n${result.explanation}`,
        {
          fontFamily: 'Segoe UI',
          fontSize: '11px',
          color: '#f8fafc',
          lineSpacing: 2,
          wordWrap: { width: modalW - 44 }
        }
      ).setDepth(baseDepth + 3)
    );

    // Si el estudiante cometió un fallo, consultar a E.V.A. (Gemini Backend) para enriquecer la explicación
    if (!result.isCorrect && this.currentChallenge) {
      try {
        tutorService.requestErrorExplanation({
          challengeId: this.currentChallenge.id,
          competencyName: meta?.name || compId || 'Pensamiento Lógico',
          skillName: this.currentChallenge.skillName,
          context: this.currentChallenge.context,
          statement: this.currentChallenge.statement,
          selectedOption: result.selectedOption,
          conceptNeeded: result.conceptNeeded,
          localExplanation: result.explanation
        }).then(evaRes => {
          if (evaRes && evaRes.explanation && explanationText && explanationText.active) {
            explanationText.setText(`✨ ${evaRes.tutorName}:\n${evaRes.explanation}`);
            explanationText.setColor('#e0f2fe');
          }
        }).catch(err => {
          console.warn('[ChallengeModal] Error consultando tutor IA:', err);
        });
      } catch (err) {
        console.warn('[ChallengeModal] Error invocando tutor IA:', err);
      }
    }

    contentY += 75;

    // 4. Concepto Requerido
    this.track(
      this.scene.add.text(
        modalX + 22,
        contentY,
        `Concepto Requerido: ${result.conceptNeeded}`,
        {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#38bdf8',
          fontStyle: 'bold',
          wordWrap: { width: modalW - 44 }
        }
      ).setDepth(baseDepth + 3)
    );
    contentY += 28;

    // 5. Estrategia Recomendada
    this.track(
      this.scene.add.text(
        modalX + 22,
        contentY,
        `Estrategia Recomendada:\n${result.strategy}`,
        {
          fontFamily: 'Segoe UI',
          fontSize: '11px',
          color: '#cbd5e1',
          wordWrap: { width: modalW - 44 }
        }
      ).setDepth(baseDepth + 3)
    );

    // 6. Botones de Acción (inferior)
    const btnY = modalY + modalH - 30;
    const btnW = 270;
    const btnH = 34;

    const isSpecial = (this.currentOptions?.mode === 'combat' || this.currentOptions?.mode === 'recovery');
    const btnText = isSpecial
      ? 'CONTINUAR AVENTURA [Enter] ➔'
      : (result.isCorrect ? 'SIGUIENTE DESAFÍO [Enter] ➔' : 'VOLVER A INTENTAR [Enter]');

    const actionBtnBg = this.track(this.scene.add.graphics().setDepth(baseDepth + 4));
    actionBtnBg.fillStyle(result.isCorrect ? 0x059669 : 0x2563eb, 1);
    actionBtnBg.fillRoundedRect(modalX + modalW / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);

    this.track(
      this.scene.add.text(
        modalX + modalW / 2,
        btnY,
        btnText,
        {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      )
      .setOrigin(0.5)
      .setDepth(baseDepth + 5)
    );

    const actionHit = this.track(
      this.scene.add.zone(modalX + modalW / 2, btnY, btnW, btnH)
        .setDepth(baseDepth + 6)
        .setInteractive({ useHandCursor: true })
    );

    actionHit.on('pointerdown', () => {
      if (isSpecial) {
        this.close();
      } else if (result.isCorrect) {
        this.open();
      } else {
        this.renderChallengeView();
      }
    });

    const exitBtn = this.track(
      this.scene.add.text(modalX + modalW - 90, btnY, '[ Salir / Esc ]', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#94a3b8'
      })
      .setOrigin(0.5)
      .setDepth(baseDepth + 5)
      .setInteractive({ useHandCursor: true })
    );
    exitBtn.on('pointerdown', () => this.close());
  }

  close() {
    this.isOpen = false;
    this.currentView = null;
    this.clearElements();
    if (this.player) this.player.unfreeze();
    if (this.scene && this.scene.virtualControls) {
      this.scene.virtualControls.setVisible(true);
    }
    if (this.scene && typeof this.scene.updateHUDLevel === 'function') {
      this.scene.updateHUDLevel();
    }
  }
}
