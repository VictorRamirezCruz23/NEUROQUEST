import Phaser from 'phaser';
import { educationEngine } from '../../education/engines/EducationEngine.js';
import { sessionState } from '../../core/sessionState.js';

/**
 * ChallengeModal.js — Interfaz interactiva de terminal educativa.
 * Arquitectura plana (flat screen-space) sin contenedores anidados para garantizar
 * que el hit-testing táctil y de ratón funcione con 100% de precisión sin importar el scroll de la cámara.
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

    // Registrar atajos de teclado globales del modal
    this.setupKeyboardListeners();
  }

  setupKeyboardListeners() {
    this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyB = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.keyC = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.key1 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.key4 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    this.keyH = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.keyEnter = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keyEsc = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.scene.input.keyboard.on('keydown', (event) => {
      if (!this.isOpen) return;

      const code = event.code;
      if (this.currentView === 'challenge') {
        if (code === 'KeyA' || code === 'Digit1') this.submitAnswer(0);
        else if (code === 'KeyB' || code === 'Digit2') this.submitAnswer(1);
        else if (code === 'KeyC' || code === 'Digit3') this.submitAnswer(2);
        else if (code === 'KeyD' || code === 'Digit4') this.submitAnswer(3);
        else if (code === 'KeyH') this.triggerHint();
      } else if (this.currentView === 'feedback') {
        if (code === 'Enter' || code === 'Space') {
          if (this.lastResult && this.lastResult.isCorrect) {
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

  /**
   * Abre la terminal con un desafío de la competencia activa.
   */
  open() {
    this.currentChallenge = educationEngine.getNextChallenge();
    if (!this.currentChallenge) {
      console.warn('[ChallengeModal] No hay desafíos en el banco para la competencia activa.');
      return;
    }

    this.isOpen = true;
    this.currentView = 'challenge';
    if (this.player) this.player.freeze();

    this.renderChallengeView();
  }

  clearElements() {
    this.elements.forEach(el => {
      if (el && el.destroy) el.destroy();
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

    const { width, height } = this.scene.scale;
    const meta = sessionState.getActiveCompetencyMeta();
    const baseDepth = 2000;

    // 1. Telón oscuro de fondo
    const backdrop = this.track(
      this.scene.add.rectangle(0, 0, width, height, 0x05070f, 0.82)
        .setOrigin(0)
        .setDepth(baseDepth)
        .setInteractive()
    );

    // 2. Ventana modal
    const modalW = Math.min(840, width - 40);
    const modalH = Math.min(480, height - 30);
    const modalX = (width - modalW) / 2;
    const modalY = (height - modalH) / 2;

    const modalBg = this.track(
      this.scene.add.graphics().setDepth(baseDepth + 1)
    );
    modalBg.fillStyle(0x0f172a, 0.98);
    modalBg.fillRoundedRect(modalX, modalY, modalW, modalH, 12);
    modalBg.lineStyle(2, meta.primaryColor, 1);
    modalBg.strokeRoundedRect(modalX, modalY, modalW, modalH, 12);

    // 3. Barra de cabecera
    const headerBg = this.track(
      this.scene.add.graphics().setDepth(baseDepth + 2)
    );
    headerBg.fillStyle(meta.badgeBg, 0.95);
    headerBg.fillRoundedRect(modalX, modalY, modalW, 44, { tl: 12, tr: 12, bl: 0, br: 0 });

    this.track(
      this.scene.add.text(
        modalX + 20,
        modalY + 13,
        `[ ${meta.code} ] TERMINAL PEDAGÓGICA • ${meta.name.toUpperCase()} (MUNDO ${meta.worldNumber})`,
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
      this.scene.add.text(modalX + modalW - 28, modalY + 12, '✕', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#cbd5e1'
      })
      .setOrigin(0.5)
      .setDepth(baseDepth + 3)
      .setInteractive({ useHandCursor: true })
    );
    closeBtn.on('pointerdown', () => this.close());

    // 4. Habilidad pedagógica y objetivo
    this.track(
      this.scene.add.text(
        modalX + 24,
        modalY + 54,
        `Habilidad: ${this.currentChallenge.skillName}  |  Dificultad: Nivel ${this.currentChallenge.difficulty}`,
        {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: meta.primaryColorHex,
          fontStyle: 'bold'
        }
      ).setDepth(baseDepth + 3)
    );

    // 5. Contexto del problema
    this.track(
      this.scene.add.text(
        modalX + 24,
        modalY + 74,
        `Contexto: ${this.currentChallenge.context}`,
        {
          fontFamily: 'Segoe UI',
          fontSize: '12px',
          color: '#94a3b8',
          fontStyle: 'italic',
          wordWrap: { width: modalW - 48 }
        }
      ).setDepth(baseDepth + 3)
    );

    // 6. Enunciado del desafío
    this.track(
      this.scene.add.text(
        modalX + 24,
        modalY + 112,
        this.currentChallenge.statement,
        {
          fontFamily: 'monospace',
          fontSize: '13px',
          color: '#f8fafc',
          wordWrap: { width: modalW - 48 }
        }
      ).setDepth(baseDepth + 3)
    );

    // 7. Opciones de respuesta interactivas (sin contenedores anidados para garantizar hit-test impecable)
    const startOptY = modalY + 195;
    const optW = modalW - 48;
    const optH = 40;

    this.currentChallenge.options.forEach((optText, idx) => {
      const optY = startOptY + (idx * 48);
      const letter = String.fromCharCode(65 + idx);

      const btnBg = this.track(
        this.scene.add.graphics().setDepth(baseDepth + 4)
      );

      const drawOpt = (hover = false) => {
        btnBg.clear();
        btnBg.fillStyle(hover ? 0x1d4ed8 : 0x1e293b, 0.95);
        btnBg.fillRoundedRect(modalX + 24, optY, optW, optH, 6);
        btnBg.lineStyle(hover ? 2 : 1, hover ? meta.primaryColor : 0x475569, 1);
        btnBg.strokeRoundedRect(modalX + 24, optY, optW, optH, 6);
      };
      drawOpt(false);

      const btnHitZone = this.track(
        this.scene.add.zone(modalX + 24 + optW / 2, optY + optH / 2, optW, optH)
          .setDepth(baseDepth + 6)
          .setInteractive({ useHandCursor: true })
      );

      const label = this.track(
        this.scene.add.text(modalX + 40, optY + optH / 2, `[${letter} / ${idx + 1}]  ${optText}`, {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#f8fafc'
        })
        .setOrigin(0, 0.5)
        .setDepth(baseDepth + 5)
      );

      btnHitZone.on('pointerover', () => drawOpt(true));
      btnHitZone.on('pointerout', () => drawOpt(false));
      btnHitZone.on('pointerdown', () => this.submitAnswer(idx));
    });

    // 8. Botón Solicitar Pista
    const hintBtnY = modalY + modalH - 24;
    const hintBg = this.track(
      this.scene.add.graphics().setDepth(baseDepth + 4)
    );
    hintBg.fillStyle(0x1e293b, 0.95);
    hintBg.fillRoundedRect(modalX + 24, hintBtnY - 16, 200, 32, 6);
    hintBg.lineStyle(1, 0xf59e0b, 0.9);
    hintBg.strokeRoundedRect(modalX + 24, hintBtnY - 16, 200, 32, 6);

    const hintText = this.track(
      this.scene.add.text(modalX + 124, hintBtnY, '💡 Pista [H]', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#fbbf24',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(baseDepth + 5)
    );

    const hintHit = this.track(
      this.scene.add.zone(modalX + 124, hintBtnY, 200, 32)
        .setDepth(baseDepth + 6)
        .setInteractive({ useHandCursor: true })
    );

    hintHit.on('pointerdown', () => this.triggerHint());

    // Indicador de teclas de acceso rápido
    this.track(
      this.scene.add.text(modalX + modalW - 200, hintBtnY, 'Responde: [A,B,C,D / 1,2,3,4]', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#64748b'
      })
      .setOrigin(0.5)
      .setDepth(baseDepth + 5)
    );
  }

  triggerHint() {
    const hint = educationEngine.requestHint(this.currentChallenge);
    if (hint) {
      const { width, height } = this.scene.scale;
      const modalW = Math.min(840, width - 40);
      const modalH = Math.min(480, height - 30);
      const modalX = (width - modalW) / 2;
      const modalY = (height - modalH) / 2;

      const toast = this.track(
        this.scene.add.text(modalX + 24, modalY + modalH - 70, hint, {
          fontFamily: 'Segoe UI',
          fontSize: '12px',
          color: '#fef08a',
          backgroundColor: 'rgba(30, 27, 75, 0.98)',
          padding: { x: 12, y: 8 },
          wordWrap: { width: modalW - 48 }
        }).setDepth(2010)
      );

      this.scene.time.delayedCall(7000, () => {
        if (toast && toast.destroy) toast.destroy();
      });
    }
  }

  submitAnswer(optionIndex) {
    if (!this.isOpen || this.currentView !== 'challenge') return;
    const result = educationEngine.evaluateAnswer(this.currentChallenge, optionIndex);
    this.lastResult = result;
    this.renderFeedbackView(result);
  }

  renderFeedbackView(result) {
    this.clearElements();
    this.currentView = 'feedback';

    const { width, height } = this.scene.scale;
    const meta = sessionState.getActiveCompetencyMeta();
    const baseDepth = 2000;

    const backdrop = this.track(
      this.scene.add.rectangle(0, 0, width, height, 0x05070f, 0.85)
        .setOrigin(0)
        .setDepth(baseDepth)
        .setInteractive()
    );

    const modalW = Math.min(840, width - 40);
    const modalH = Math.min(480, height - 30);
    const modalX = (width - modalW) / 2;
    const modalY = (height - modalH) / 2;

    const modalBg = this.track(
      this.scene.add.graphics().setDepth(baseDepth + 1)
    );
    modalBg.fillStyle(0x0f172a, 0.98);
    modalBg.fillRoundedRect(modalX, modalY, modalW, modalH, 12);
    const borderColor = result.isCorrect ? 0x10b981 : 0xf59e0b;
    modalBg.lineStyle(2, borderColor, 1);
    modalBg.strokeRoundedRect(modalX, modalY, modalW, modalH, 12);

    // Cabecera de retroalimentación
    const headerBg = this.track(
      this.scene.add.graphics().setDepth(baseDepth + 2)
    );
    headerBg.fillStyle(result.isCorrect ? 0x065f46 : 0x78350f, 0.95);
    headerBg.fillRoundedRect(modalX, modalY, modalW, 44, { tl: 12, tr: 12, bl: 0, br: 0 });

    this.track(
      this.scene.add.text(modalX + 20, modalY + 13, result.title, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setDepth(baseDepth + 3)
    );

    let contentY = modalY + 62;

    // Estado del intento
    this.track(
      this.scene.add.text(
        modalX + 24,
        contentY,
        result.isCorrect
          ? `✓ RESPUESTA CORRECTA (Intento ${result.attempts} • ${result.hintsUsed} pista(s) usadas)`
          : `✕ OBSERVACIÓN: "${result.selectedOption}" no es la solución correcta.`,
        {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: result.isCorrect ? '#34d399' : '#f87171',
          fontStyle: 'bold'
        }
      ).setDepth(baseDepth + 3)
    );
    contentY += 30;

    // Explicación profunda
    this.track(
      this.scene.add.text(
        modalX + 24,
        contentY,
        `Explicación Paso a Paso:\n${result.explanation}`,
        {
          fontFamily: 'Segoe UI',
          fontSize: '13px',
          color: '#f8fafc',
          lineSpacing: 4,
          wordWrap: { width: modalW - 48 }
        }
      ).setDepth(baseDepth + 3)
    );
    contentY += 95;

    // Principio y concepto faltante
    this.track(
      this.scene.add.text(
        modalX + 24,
        contentY,
        `Concepto Requerido: ${result.conceptNeeded}`,
        {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#38bdf8',
          fontStyle: 'bold',
          wordWrap: { width: modalW - 48 }
        }
      ).setDepth(baseDepth + 3)
    );
    contentY += 38;

    // Estrategia de resolución
    this.track(
      this.scene.add.text(
        modalX + 24,
        contentY,
        `Estrategia Recomendada:\n${result.strategy}`,
        {
          fontFamily: 'Segoe UI',
          fontSize: '12px',
          color: '#cbd5e1',
          wordWrap: { width: modalW - 48 }
        }
      ).setDepth(baseDepth + 3)
    );

    // Botón de acción principal
    const btnY = modalY + modalH - 35;
    const btnW = 260;
    const btnH = 38;

    const actionBtnBg = this.track(
      this.scene.add.graphics().setDepth(baseDepth + 4)
    );
    actionBtnBg.fillStyle(result.isCorrect ? 0x059669 : 0x2563eb, 1);
    actionBtnBg.fillRoundedRect(modalX + modalW / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);

    const actionBtnLabel = this.track(
      this.scene.add.text(
        modalX + modalW / 2,
        btnY,
        result.isCorrect ? 'SIGUIENTE DESAFÍO [Enter] ➔' : 'VOLVER A INTENTAR [Enter]',
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
      if (result.isCorrect) {
        this.open();
      } else {
        this.renderChallengeView();
      }
    });

    // Botón Cerrar e ir a Explorar
    const exitBtn = this.track(
      this.scene.add.text(modalX + modalW - 100, btnY, '[ Salir / Esc ]', {
        fontFamily: 'monospace',
        fontSize: '12px',
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
  }
}
