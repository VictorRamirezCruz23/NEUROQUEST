import Phaser from 'phaser';
import { educationEngine } from '../../education/engines/EducationEngine.js';
import { sessionState } from '../../core/sessionState.js';

/**
 * ChallengeModal.js — Interfaz interactiva para resolver desafíos educativos en el juego.
 * Gestiona la visualización del enunciado, opciones, solicitud de pistas y retroalimentación formativa.
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

    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(2000);
    this.container.setVisible(false);

    // Tecla Escape para cerrar
    this.escKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escKey.on('down', () => {
      if (this.isOpen) this.close();
    });
  }

  /**
   * Abre la terminal con un nuevo desafío de la competencia activa.
   */
  open() {
    this.currentChallenge = educationEngine.getNextChallenge();
    if (!this.currentChallenge) {
      console.warn('[ChallengeModal] No hay desafíos disponibles para la competencia activa.');
      return;
    }

    this.isOpen = true;
    if (this.player) this.player.freeze();

    this.renderChallengeView();
    this.container.setVisible(true);
    this.scene.cameras.main.setAlpha(0.9);
  }

  renderChallengeView() {
    this.container.removeAll(true);
    const { width, height } = this.scene.scale;
    const meta = sessionState.getActiveCompetencyMeta();

    // Fondo oscurecedor de pantalla completa
    const backdrop = this.scene.add.rectangle(0, 0, width, height, 0x05070f, 0.82)
      .setOrigin(0)
      .setInteractive();

    // Ventana modal central
    const modalW = Math.min(840, width - 40);
    const modalH = Math.min(480, height - 30);
    const modalX = (width - modalW) / 2;
    const modalY = (height - modalH) / 2;

    const modalBg = this.scene.add.graphics();
    modalBg.fillStyle(0x0f172a, 0.98);
    modalBg.fillRoundedRect(modalX, modalY, modalW, modalH, 12);
    modalBg.lineStyle(2, meta.primaryColor, 1);
    modalBg.strokeRoundedRect(modalX, modalY, modalW, modalH, 12);

    // Barra de título superior
    const headerBg = this.scene.add.graphics();
    headerBg.fillStyle(meta.badgeBg, 0.95);
    headerBg.fillRoundedRect(modalX, modalY, modalW, 46, { tl: 12, tr: 12, bl: 0, br: 0 });

    const headerTitle = this.scene.add.text(
      modalX + 20,
      modalY + 14,
      `[ ${meta.code} ]  TERMINAL PEDAGÓGICA • ${meta.name.toUpperCase()}`,
      {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );

    // Botón Cerrar (X)
    const closeBtn = this.scene.add.text(modalX + modalW - 28, modalY + 12, '✕', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#cbd5e1'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => this.close());

    // Subtítulo de habilidad pedagógica
    const skillText = this.scene.add.text(
      modalX + 24,
      modalY + 56,
      `Habilidad: ${this.currentChallenge.skillName}  |  Dificultad: Nivel ${this.currentChallenge.difficulty}`,
      {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: meta.primaryColorHex,
        fontStyle: 'bold'
      }
    );

    // Contexto narrativo del problema
    const contextBox = this.scene.add.text(
      modalX + 24,
      modalY + 76,
      `Contexto: ${this.currentChallenge.context}`,
      {
        fontFamily: 'Segoe UI',
        fontSize: '12px',
        color: '#94a3b8',
        fontStyle: 'italic',
        wordWrap: { width: modalW - 48 }
      }
    );

    // Enunciado principal del desafío
    const statementBox = this.scene.add.text(
      modalX + 24,
      modalY + 112,
      this.currentChallenge.statement,
      {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#f8fafc',
        wordWrap: { width: modalW - 48 }
      }
    );

    // Contenedor de Opciones interactivas
    const optionsContainer = this.scene.add.container(0, 0);
    const startOptY = modalY + 200;
    const optW = modalW - 48;
    const optH = 38;

    this.currentChallenge.options.forEach((optText, idx) => {
      const optY = startOptY + (idx * 46);
      const optBtn = this.scene.add.container(modalX + 24 + optW / 2, optY + optH / 2);
      optBtn.setSize(optW, optH);

      const optBg = this.scene.add.graphics();
      optBg.fillStyle(0x1e293b, 0.9);
      optBg.fillRoundedRect(-optW / 2, -optH / 2, optW, optH, 6);
      optBg.lineStyle(1, 0x334155, 1);
      optBg.strokeRoundedRect(-optW / 2, -optH / 2, optW, optH, 6);

      const label = this.scene.add.text(-optW / 2 + 16, 0, `${String.fromCharCode(65 + idx)})  ${optText}`, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#e2e8f0'
      }).setOrigin(0, 0.5);

      optBtn.add([optBg, label]);
      optBtn.setInteractive(new Phaser.Geom.Rectangle(-optW / 2, -optH / 2, optW, optH), Phaser.Geom.Rectangle.Contains);

      optBtn.on('pointerover', () => {
        optBg.clear();
        optBg.fillStyle(0x2563eb, 0.4);
        optBg.fillRoundedRect(-optW / 2, -optH / 2, optW, optH, 6);
        optBg.lineStyle(2, meta.primaryColor, 1);
        optBg.strokeRoundedRect(-optW / 2, -optH / 2, optW, optH, 6);
      });

      optBtn.on('pointerout', () => {
        optBg.clear();
        optBg.fillStyle(0x1e293b, 0.9);
        optBg.fillRoundedRect(-optW / 2, -optH / 2, optW, optH, 6);
        optBg.lineStyle(1, 0x334155, 1);
        optBg.strokeRoundedRect(-optW / 2, -optH / 2, optW, optH, 6);
      });

      optBtn.on('pointerdown', () => {
        this.submitAnswer(idx);
      });

      optionsContainer.add(optBtn);
    });

    // Botón de Pistas Contextuales
    const hintBtnContainer = this.scene.add.container(modalX + 110, modalY + modalH - 26);
    const hintBg = this.scene.add.graphics();
    hintBg.fillStyle(0x1e293b, 0.85);
    hintBg.fillRoundedRect(-90, -16, 180, 32, 6);
    hintBg.lineStyle(1, 0xf59e0b, 0.8);
    hintBg.strokeRoundedRect(-90, -16, 180, 32, 6);

    const hintLabel = this.scene.add.text(0, 0, '💡 Solicitar Pista', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    hintBtnContainer.add([hintBg, hintLabel]);
    hintBtnContainer.setSize(180, 32);
    hintBtnContainer.setInteractive(new Phaser.Geom.Rectangle(-90, -16, 180, 32), Phaser.Geom.Rectangle.Contains);

    hintBtnContainer.on('pointerdown', () => {
      const hint = educationEngine.requestHint(this.currentChallenge);
      if (hint) {
        this.showHintToast(modalX + 24, modalY + modalH - 75, modalW - 48, hint);
      }
    });

    this.container.add([
      backdrop,
      modalBg,
      headerBg,
      headerTitle,
      closeBtn,
      skillText,
      contextBox,
      statementBox,
      optionsContainer,
      hintBtnContainer
    ]);
  }

  showHintToast(x, y, w, hintText) {
    const toast = this.scene.add.text(x, y, hintText, {
      fontFamily: 'Segoe UI',
      fontSize: '11px',
      color: '#fef08a',
      backgroundColor: 'rgba(30, 27, 75, 0.95)',
      padding: { x: 12, y: 6 },
      wordWrap: { width: w }
    });
    this.container.add(toast);

    this.scene.time.delayedCall(6000, () => {
      toast.destroy();
    });
  }

  submitAnswer(optionIndex) {
    const result = educationEngine.evaluateAnswer(this.currentChallenge, optionIndex);
    this.renderFeedbackView(result);
  }

  renderFeedbackView(result) {
    this.container.removeAll(true);
    const { width, height } = this.scene.scale;
    const meta = sessionState.getActiveCompetencyMeta();

    const backdrop = this.scene.add.rectangle(0, 0, width, height, 0x05070f, 0.85)
      .setOrigin(0)
      .setInteractive();

    const modalW = Math.min(840, width - 40);
    const modalH = Math.min(480, height - 30);
    const modalX = (width - modalW) / 2;
    const modalY = (height - modalH) / 2;

    const modalBg = this.scene.add.graphics();
    modalBg.fillStyle(0x0f172a, 0.98);
    modalBg.fillRoundedRect(modalX, modalY, modalW, modalH, 12);
    const borderColor = result.isCorrect ? 0x10b981 : 0xf59e0b;
    modalBg.lineStyle(2, borderColor, 1);
    modalBg.strokeRoundedRect(modalX, modalY, modalW, modalH, 12);

    // Barra de cabecera de retroalimentación
    const headerBg = this.scene.add.graphics();
    headerBg.fillStyle(result.isCorrect ? 0x065f46 : 0x78350f, 0.95);
    headerBg.fillRoundedRect(modalX, modalY, modalW, 46, { tl: 12, tr: 12, bl: 0, br: 0 });

    const titleText = this.scene.add.text(
      modalX + 20,
      modalY + 14,
      result.title,
      {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );

    // Contenido formativo
    let contentY = modalY + 65;

    // Qué ocurrió
    const statusLabel = this.scene.add.text(
      modalX + 24,
      contentY,
      result.isCorrect
        ? '✓ Respuesta Correcta en ' + result.attempts + ' intento(s).'
        : '✕ Respuesta Seleccionada: ' + result.selectedOption,
      {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: result.isCorrect ? '#34d399' : '#f87171',
        fontStyle: 'bold'
      }
    );
    contentY += 32;

    // Explicación pedagógica profunda
    const explBox = this.scene.add.text(
      modalX + 24,
      contentY,
      `Explicación Conceptual:\n${result.explanation}`,
      {
        fontFamily: 'Segoe UI',
        fontSize: '13px',
        color: '#f8fafc',
        wordWrap: { width: modalW - 48 }
      }
    );
    contentY += 95;

    // Concepto que necesita comprender
    const conceptBox = this.scene.add.text(
      modalX + 24,
      contentY,
      `Principio Fundamental: ${result.conceptNeeded}`,
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#38bdf8',
        fontStyle: 'bold',
        wordWrap: { width: modalW - 48 }
      }
    );
    contentY += 40;

    // Estrategia recomendada
    const strategyBox = this.scene.add.text(
      modalX + 24,
      contentY,
      `Estrategia de Razonamiento:\n${result.strategy}`,
      {
        fontFamily: 'Segoe UI',
        fontSize: '12px',
        color: '#cbd5e1',
        wordWrap: { width: modalW - 48 }
      }
    );

    // Botones de acción inferior
    const btnContainer = this.scene.add.container(modalX + modalW / 2, modalY + modalH - 35);
    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(result.isCorrect ? 0x059669 : 0x2563eb, 1);
    btnBg.fillRoundedRect(-140, -18, 280, 36, 6);

    const btnLabel = this.scene.add.text(
      0,
      0,
      result.isCorrect ? 'SIGUIENTE DESAFÍO ➔' : 'VOLVER A INTENTAR',
      {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    btnContainer.add([btnBg, btnLabel]);
    btnContainer.setSize(280, 36);
    btnContainer.setInteractive(new Phaser.Geom.Rectangle(-140, -18, 280, 36), Phaser.Geom.Rectangle.Contains);

    btnContainer.on('pointerdown', () => {
      if (result.isCorrect) {
        this.open(); // Abre el siguiente desafío
      } else {
        this.renderChallengeView(); // Permite reintentar con las pistas aprendidas
      }
    });

    // Botón Salir a Exploración
    const exitBtn = this.scene.add.text(modalX + modalW - 120, modalY + modalH - 35, '[ Explorar ]', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#94a3b8'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    exitBtn.on('pointerdown', () => this.close());

    this.container.add([
      backdrop,
      modalBg,
      headerBg,
      titleText,
      statusLabel,
      explBox,
      conceptBox,
      strategyBox,
      btnContainer,
      exitBtn
    ]);
  }

  close() {
    this.isOpen = false;
    this.container.setVisible(false);
    this.scene.cameras.main.setAlpha(1.0);
    if (this.player) this.player.unfreeze();
  }
}
