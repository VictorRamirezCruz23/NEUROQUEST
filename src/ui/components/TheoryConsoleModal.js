import { sessionState } from '../../core/sessionState.js';

/**
 * Guías teóricas y pistas conceptuales estructuradas por competencia para orientar
 * al jugador frente a los desafíos de los MatBots en los siguientes tramos.
 */
export const COMPETENCY_THEORY = {
  LOGIC: {
    title: 'NÚCLEO DE LÓGICA Y ÁLGEBRA BOOLEANA',
    sections: [
      {
        subtitle: '1. Tablas de Verdad Fundamentales',
        content: '• Conjunción (AND / ∧): Verdadera SOLO si ambas proposiciones son verdaderas.\n• Disyunción (OR / ∨): Falsa únicamente si ambas proposiciones son falsas.\n• Negación (NOT / ¬): Invierte el valor de verdad (V ➔ F, F ➔ V).'
      },
      {
        subtitle: '2. Condicional Material (P ➔ Q)',
        content: '• P ➔ Q es FALSA únicamente cuando el antecedente P es VERDADERO y el consecuente Q es FALSO.\n• Si P es falsa, la implicación es formalmente VERDADERA por vaciedad.'
      },
      {
        subtitle: '3. Heurística de Combate con MatBots',
        content: 'Evalúa primero los paréntesis internos antes de operar las conectivas externas.'
      }
    ]
  },
  MATH: {
    title: 'ACADEMIA DE ARITMÉTICA Y ÁLGEBRA',
    sections: [
      {
        subtitle: '1. Jerarquía de Operaciones (PEMDAS)',
        content: '1. Paréntesis y corchetes primero.\n2. Exponentes y raíces cuadradas.\n3. Multiplicaciones y Divisiones (de izquierda a derecha).\n4. Adiciones y Sustracciones (de izquierda a derecha).'
      },
      {
        subtitle: '2. Regla de los Signos',
        content: '(+) · (+) = (+)\n(-) · (-) = (+)\n(+) · (-) = (-)\n(-) · (+) = (-)'
      },
      {
        subtitle: '3. Fracciones Equivalentes',
        content: 'Para sumar fracciones con distinto denominador, calcula el mínimo común múltiplo (mcm) de los denominadores.'
      }
    ]
  },
  SCIENCE: {
    title: 'LABORATORIO DE CIENCIAS Y FÍSICA',
    sections: [
      {
        subtitle: '1. Leyes del Movimiento de Newton',
        content: '• 1ª Ley (Inercia): Todo cuerpo preserva su reposo o MRU a menos que actúe una fuerza externa neta.\n• 2ª Ley: Fuerza neta = Masa × Aceleración (F = m · a).\n• 3ª Ley: A toda acción corresponde una reacción igual y opuesta.'
      },
      {
        subtitle: '2. Conservación de la Energía',
        content: 'La energía mecánica total en un sistema cerrado se conserva: Energía Cinética (Ec) + Energía Potencial (Ep) = Constante.'
      }
    ]
  },
  DEFAULT: {
    title: 'TERMINAL DE ASISTENCIA COGNITIVA',
    sections: [
      {
        subtitle: 'Estrategia de Razonamiento',
        content: '• Lee con atención el enunciado del desafío antes de seleccionar tu respuesta con el ratón o toque táctil.\n• Elimina de inmediato las opciones contradictorias o numéricamente imposibles.\n• Supera cada obstáculo y reto táctico para avanzar fluidamente hacia la meta del sector.'
      }
    ]
  }
};

export class TheoryConsoleModal {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('../../game/entities/Player.js').Player} player
   */
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.isOpen = false;
    this.elements = [];

    this.setupKeyboardListeners();
  }

  setupKeyboardListeners() {
    this.keyHandler = (event) => {
      if (!this.isOpen) return;
      const code = event.code;
      if (code === 'KeyE' || code === 'Space' || code === 'Enter' || code === 'Escape') {
        this.close();
      }
    };
    this.scene.input.keyboard.on('keydown', this.keyHandler);
  }

  track(obj) {
    if (obj.setScrollFactor) obj.setScrollFactor(0);
    this.elements.push(obj);
    return obj;
  }

  /**
   * Abre la terminal con las pistas y teoría para el sector actual.
   * @param {Object} [options]
   */
  open(options = {}) {
    if (this.isOpen) return;
    this.isOpen = true;

    if (this.player) this.player.freeze();
    if (this.scene.virtualControls) this.scene.virtualControls.setVisible(false);

    const compId = sessionState.getActiveCompetency() || 'LOGIC';
    const theory = COMPETENCY_THEORY[compId] || COMPETENCY_THEORY.DEFAULT;

    this.renderModal(theory);
  }

  renderModal(theory) {
    this.cleanupVisuals();

    const { width, height } = this.scene.scale;
    const baseDepth = 4500;

    // Telón de fondo
    const backdrop = this.scene.add.rectangle(0, 0, width, height, 0x05070f, 0.9)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(baseDepth)
      .setInteractive();
    this.track(backdrop);

    // Contenedor principal de la consola
    const boxW = Math.min(680, width - 40);
    const boxH = Math.min(420, height - 50);
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2;

    const boxGfx = this.scene.add.graphics().setScrollFactor(0).setDepth(baseDepth + 1);
    boxGfx.fillStyle(0x0a101f, 0.98);
    boxGfx.fillRoundedRect(boxX, boxY, boxW, boxH, 8);
    boxGfx.lineStyle(2, 0x38bdf8, 1);
    boxGfx.strokeRoundedRect(boxX, boxY, boxW, boxH, 8);
    this.track(boxGfx);

    // Encabezado
    const title = this.scene.add.text(
      boxX + 20,
      boxY + 18,
      `📡 CONSOLA DE TRANSMISIÓN TEÓRICA • ${theory.title}`,
      {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#38bdf8',
        fontStyle: 'bold'
      }
    ).setScrollFactor(0).setDepth(baseDepth + 2);
    this.track(title);

    const subtitle = this.scene.add.text(
      boxX + 20,
      boxY + 38,
      'Pistas conceptuales y fórmulas clave para superar los siguientes encuentros tácticos.',
      {
        fontFamily: 'Segoe UI',
        fontSize: '11px',
        color: '#94a3b8'
      }
    ).setScrollFactor(0).setDepth(baseDepth + 2);
    this.track(subtitle);

    // Secciones de contenido
    let curY = boxY + 68;
    theory.sections.forEach(sec => {
      const secTitle = this.scene.add.text(
        boxX + 20,
        curY,
        sec.subtitle,
        {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#fbbf24',
          fontStyle: 'bold'
        }
      ).setScrollFactor(0).setDepth(baseDepth + 2);
      this.track(secTitle);
      curY += 18;

      const secBody = this.scene.add.text(
        boxX + 20,
        curY,
        sec.content,
        {
          fontFamily: 'Segoe UI, monospace',
          fontSize: '11px',
          color: '#e2e8f0',
          wordWrap: { width: boxW - 40 },
          lineSpacing: 3
        }
      ).setScrollFactor(0).setDepth(baseDepth + 2);
      this.track(secBody);
      curY += secBody.height + 12;
    });

    // Botón de Cierre / Entendido
    const btnW = 200;
    const btnH = 36;
    const btnX = width / 2;
    const btnY = boxY + boxH - 28;

    const closeBtnBg = this.scene.add.graphics().setScrollFactor(0).setDepth(baseDepth + 2);
    const drawCloseBtn = (hover = false) => {
      closeBtnBg.clear();
      closeBtnBg.fillStyle(hover ? 0x0284c7 : 0x0369a1, 1);
      closeBtnBg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
      closeBtnBg.lineStyle(1, 0x38bdf8, 1);
      closeBtnBg.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
    };
    drawCloseBtn(false);
    this.track(closeBtnBg);

    const closeBtnText = this.scene.add.text(
      btnX,
      btnY,
      'ENTENDIDO [E / ESPACIO] ➔',
      {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 3);
    this.track(closeBtnText);

    const hitZone = this.scene.add.zone(btnX, btnY, btnW, btnH)
      .setScrollFactor(0)
      .setDepth(baseDepth + 4)
      .setInteractive({ useHandCursor: true });
    this.track(hitZone);

    hitZone.on('pointerover', () => drawCloseBtn(true));
    hitZone.on('pointerout', () => drawCloseBtn(false));
    hitZone.on('pointerdown', () => this.close());
  }

  cleanupVisuals() {
    this.elements.forEach(el => {
      if (el && typeof el.destroy === 'function') el.destroy();
    });
    this.elements = [];
  }

  close() {
    this.isOpen = false;
    this.cleanupVisuals();

    if (this.player && !this.scene.isGameOver && !this.scene.isVictory) {
      this.player.unfreeze();
    }
    if (this.scene.virtualControls) {
      this.scene.virtualControls.setVisible(true);
    }
  }

  destroy() {
    if (this.keyHandler) {
      this.scene.input.keyboard.off('keydown', this.keyHandler);
    }
    this.close();
  }
}
