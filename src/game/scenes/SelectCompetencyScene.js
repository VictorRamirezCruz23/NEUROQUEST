import Phaser from 'phaser';
import { COMPETENCY_IDS, COMPETENCY_METADATA, sessionState } from '../../core/sessionState.js';

/**
 * Escena del Selector de Competencias de NEUROQUEST.
 * Permite al jugador elegir libremente entre las 4 rutas curriculares:
 * L  -> Pensamiento Lógico y Matemático (Mundo 01: Núcleo de Lógica)
 * CM -> Pensamiento Computacional y Programación (Mundo 02: Circuitos Mentales)
 * AC -> Comprensión Lectora (Mundo 03: Archivo del Conocimiento)
 * E  -> Resolución de Problemas Multidisciplinarios (Mundo 04: Dimensión Estratégica)
 */
export class SelectCompetencyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SelectCompetencyScene' });
  }

  create() {
    const { width, height } = this.scale;
    this.selectedCompetencyId = sessionState.getActiveCompetency();

    // Fondo cibernético
    this.createBackground(width, height);

    // Cabecera
    this.createHeader(width);

    // Contenedores y tarjetas de las 4 competencias
    this.createCompetencyCards(width, height);

    // Barra de confirmación inferior
    this.createBottomBar(width, height);

    // Soporte para selección con teclado [1, 2, 3, 4] y [Enter]
    this.setupKeyboardShortcuts();

    // Fade in
    this.cameras.main.fadeIn(400, 10, 12, 22);
  }

  createBackground(width, height) {
    const bgGfx = this.add.graphics();
    bgGfx.fillStyle(0x080a14, 1);
    bgGfx.fillRect(0, 0, width, height);

    // Rejilla de fondo
    bgGfx.lineStyle(1, 0x1e293b, 0.4);
    for (let x = 0; x < width; x += 40) {
      bgGfx.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 40) {
      bgGfx.lineBetween(0, y, width, y);
    }

    // Partículas estelares
    for (let i = 0; i < 40; i++) {
      const rx = Phaser.Math.Between(0, width);
      const ry = Phaser.Math.Between(0, height);
      this.add.rectangle(rx, ry, 2, 2, 0x38bdf8, 0.3);
    }
  }

  createHeader(width) {
    this.add.text(width / 2, 38, 'SELECTOR DE RUTA COGNITIVA', {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, 68, 'Elige libremente qué competencia aprender • Progreso e historial 100% independientes', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#94a3b8'
    }).setOrigin(0.5);
  }

  createCompetencyCards(width, height) {
    const list = [
      COMPETENCY_METADATA[COMPETENCY_IDS.LOGIC_MATH],
      COMPETENCY_METADATA[COMPETENCY_IDS.COMPUTATIONAL_THINKING],
      COMPETENCY_METADATA[COMPETENCY_IDS.READING_COMPREHENSION],
      COMPETENCY_METADATA[COMPETENCY_IDS.STRATEGIC_MULTIDISCIPLINARY]
    ];

    const cardWidth = 205;
    const cardHeight = 330;
    const startX = 125;
    const gap = 236;
    const cardY = height * 0.50;

    this.cards = [];

    list.forEach((meta, idx) => {
      const x = startX + (idx * gap);
      const container = this.add.container(x, cardY);
      container.setSize(cardWidth, cardHeight);

      // Fondo de la tarjeta
      const bg = this.add.graphics();
      const isSelected = meta.id === this.selectedCompetencyId;
      this.drawCardBackground(bg, cardWidth, cardHeight, meta, isSelected, false);

      // Insignia grande del código (L, CM, AC, E)
      const badgeContainer = this.add.container(0, -cardHeight / 2 + 45);
      const badgeBg = this.add.graphics();
      badgeBg.fillStyle(meta.badgeBg, 1);
      badgeBg.fillRoundedRect(-32, -22, 64, 44, 8);
      badgeBg.lineStyle(2, meta.primaryColor, 1);
      badgeBg.strokeRoundedRect(-32, -22, 64, 44, 8);

      const badgeText = this.add.text(0, 0, meta.code, {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      badgeContainer.add([badgeBg, badgeText]);

      // Número y nombre de mundo
      const worldNum = this.add.text(0, -cardHeight / 2 + 82, `MUNDO ${meta.worldNumber}`, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: meta.primaryColorHex,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const title = this.add.text(0, -cardHeight / 2 + 104, meta.name, {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#f8fafc',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: cardWidth - 20 }
      }).setOrigin(0.5);

      // Disciplina
      const discipline = this.add.text(0, -cardHeight / 2 + 138, meta.discipline, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#cbd5e1',
        align: 'center',
        fontStyle: 'italic',
        wordWrap: { width: cardWidth - 24 }
      }).setOrigin(0.5);

      // Línea divisoria
      const divider = this.add.graphics();
      divider.lineStyle(1, meta.primaryColor, 0.3);
      divider.lineBetween(-cardWidth / 2 + 16, -cardHeight / 2 + 162, cardWidth / 2 - 16, -cardHeight / 2 + 162);

      // Lista de habilidades clave
      const skillsTitle = this.add.text(-cardWidth / 2 + 16, -cardHeight / 2 + 172, 'HABILIDADES CLAVE:', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: meta.primaryColorHex,
        fontStyle: 'bold'
      });

      const skillItems = meta.skills.slice(0, 3).map((skill, sIdx) => {
        return this.add.text(-cardWidth / 2 + 16, -cardHeight / 2 + 192 + (sIdx * 20), `• ${skill}`, {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#94a3b8',
          wordWrap: { width: cardWidth - 32 }
        });
      });

      // Indicador de tecla de acceso rápido
      const shortcutText = this.add.text(0, cardHeight / 2 - 24, `[ Tecla ${idx + 1} ]`, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: meta.primaryColorHex,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      container.add([
        bg,
        badgeContainer,
        worldNum,
        title,
        discipline,
        divider,
        skillsTitle,
        ...skillItems,
        shortcutText
      ]);

      // Interactividad con ratón
      container.setInteractive(
        new Phaser.Geom.Rectangle(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight),
        Phaser.Geom.Rectangle.Contains
      );

      container.on('pointerover', () => {
        this.drawCardBackground(bg, cardWidth, cardHeight, meta, meta.id === this.selectedCompetencyId, true);
        this.tweens.add({
          targets: container,
          y: cardY - 6,
          scale: 1.03,
          duration: 180,
          ease: 'Power2'
        });
      });

      container.on('pointerout', () => {
        this.drawCardBackground(bg, cardWidth, cardHeight, meta, meta.id === this.selectedCompetencyId, false);
        this.tweens.add({
          targets: container,
          y: cardY,
          scale: 1.0,
          duration: 180,
          ease: 'Power2'
        });
      });

      container.on('pointerdown', () => {
        this.selectCompetency(meta.id);
      });

      this.cards.push({ container, bg, meta, cardWidth, cardHeight });
    });
  }

  drawCardBackground(gfx, w, h, meta, isSelected, isHover) {
    gfx.clear();

    const halfW = w / 2;
    const halfH = h / 2;

    // Fondo
    const bgColor = isSelected ? 0x161e33 : (isHover ? 0x131a2b : 0x0f1422);
    gfx.fillStyle(bgColor, 0.95);
    gfx.fillRoundedRect(-halfW, -halfH, w, h, 10);

    // Borde
    if (isSelected) {
      gfx.lineStyle(3, meta.primaryColor, 1);
      gfx.strokeRoundedRect(-halfW, -halfH, w, h, 10);
      // Brillo interno superior
      gfx.fillStyle(meta.primaryColor, 0.15);
      gfx.fillRoundedRect(-halfW + 3, -halfH + 3, w - 6, 60, 8);
    } else if (isHover) {
      gfx.lineStyle(2, meta.primaryColor, 0.7);
      gfx.strokeRoundedRect(-halfW, -halfH, w, h, 10);
    } else {
      gfx.lineStyle(1, 0x334155, 0.8);
      gfx.strokeRoundedRect(-halfW, -halfH, w, h, 10);
    }
  }

  selectCompetency(competencyId) {
    this.selectedCompetencyId = competencyId;
    sessionState.setActiveCompetency(competencyId);

    // Redibujar tarjetas para reflejar la selección activa
    this.cards.forEach(c => {
      const isSelected = c.meta.id === this.selectedCompetencyId;
      this.drawCardBackground(c.bg, c.cardWidth, c.cardHeight, c.meta, isSelected, false);
    });

    const meta = sessionState.getActiveCompetencyMeta();
    this.selectedRouteLabel.setText(`Ruta Activa: [${meta.code}] ${meta.name} — ${meta.discipline}`);
    this.selectedRouteLabel.setColor(meta.primaryColorHex);
  }

  createBottomBar(width, height) {
    const meta = sessionState.getActiveCompetencyMeta();

    // Texto de confirmación de ruta activa
    this.selectedRouteLabel = this.add.text(
      width / 2,
      height - 72,
      `Ruta Activa: [${meta.code}] ${meta.name} — ${meta.discipline}`,
      {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: meta.primaryColorHex,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Botón principal de entrada al mundo
    const btnContainer = this.add.container(width / 2, height - 34);
    const btnBg = this.add.image(0, 0, 'btn_primary').setInteractive({ useHandCursor: true });
    btnBg.setScale(1.2, 0.85);

    const btnText = this.add.text(0, 0, 'INGRESAR AL MUNDO  ➔', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    btnContainer.add([btnBg, btnText]);

    btnBg.on('pointerover', () => {
      btnBg.setTint(0x60a5fa);
      btnContainer.setScale(1.05);
    });

    btnBg.on('pointerout', () => {
      btnBg.clearTint();
      btnContainer.setScale(1.0);
    });

    btnBg.on('pointerdown', () => {
      btnContainer.setScale(0.96);
      this.enterSelectedWorld();
    });
  }

  setupKeyboardShortcuts() {
    this.input.keyboard.on('keydown-ONE', () => this.selectCompetency(COMPETENCY_IDS.LOGIC_MATH));
    this.input.keyboard.on('keydown-TWO', () => this.selectCompetency(COMPETENCY_IDS.COMPUTATIONAL_THINKING));
    this.input.keyboard.on('keydown-THREE', () => this.selectCompetency(COMPETENCY_IDS.READING_COMPREHENSION));
    this.input.keyboard.on('keydown-FOUR', () => this.selectCompetency(COMPETENCY_IDS.STRATEGIC_MULTIDISCIPLINARY));
    this.input.keyboard.on('keydown-ENTER', () => this.enterSelectedWorld());
  }

  enterSelectedWorld() {
    console.log(`[SelectCompetencyScene] Entrando al mundo de: ${this.selectedCompetencyId}`);
    this.cameras.main.fadeOut(350, 10, 12, 22);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldScene', { competencyId: this.selectedCompetencyId });
    });
  }
}
