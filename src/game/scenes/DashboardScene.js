import Phaser from 'phaser';
import { LearningAnalytics } from '../../analytics/LearningAnalytics.js';
import { COMPETENCY_IDS, COMPETENCY_METADATA, sessionState } from '../../core/sessionState.js';
import { authService } from '../../services/firebase/authService.js';

/**
 * DashboardScene.js — Escena de telemetría analítica y panel de aprendizaje real de NEUROQUEST.
 * Despliega los 6 indicadores formativos sin inflación de puntos ni XP artificial,
 * respetando un presupuesto vertical exacto sin solapamiento ni desbordamiento visual.
 */
export class DashboardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DashboardScene' });
  }

  init(data) {
    this.previousSceneKey = (data && data.fromScene) ? data.fromScene : 'WorldScene';
    this.selectedTab = (data && data.competencyId) ? data.competencyId : 'global';
    this.dynamicElements = [];
  }

  create() {
    const { width, height } = this.scale;

    // 1. Fondo cibernético oscuro
    this.createBackground(width, height);

    // 2. Cabecera principal (Y: 10 a 55 px)
    this.createHeader(width);

    // 3. Barra de pestañas selectoras (Y: 65 a 95 px)
    this.createTabsBar(width);

    // 4. Renderizar contenido de la pestaña activa (Y: 108 a 525 px)
    this.renderActiveTabContent();

    // 5. Atajos de teclado
    this.setupKeyboardShortcuts();

    // Fade in suave
    this.cameras.main.fadeIn(250, 10, 12, 22);
  }

  createBackground(width, height) {
    const bgGfx = this.add.graphics();
    bgGfx.fillStyle(0x0a0c16, 1);
    bgGfx.fillRect(0, 0, width, height);

    // Rejilla sutil de telemetría
    bgGfx.lineStyle(1, 0x1e293b, 0.4);
    for (let x = 0; x < width; x += 40) {
      bgGfx.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 40) {
      bgGfx.lineBetween(0, y, width, y);
    }
  }

  createHeader(width) {
    const cadetName = authService.getDisplayName();

    this.add.text(26, 18, 'PANEL DE TELEMETRÍA Y APRENDIZAJE ADAPTATIVO', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#38bdf8',
      fontStyle: 'bold'
    });

    this.add.text(26, 38, `Cadete: ${cadetName} • Indicadores formativos reales (sin puntos inflados)`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#94a3b8'
    });

    // Botón Salir / Volver [ESC]
    const btnX = width - 85;
    const btnY = 28;
    const btnW = 120;
    const btnH = 30;

    const returnBg = this.add.graphics();
    const drawBtn = (hover = false) => {
      returnBg.clear();
      returnBg.fillStyle(hover ? 0x2563eb : 0x1e293b, 0.95);
      returnBg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
      returnBg.lineStyle(1, hover ? 0x60a5fa : 0x475569, 1);
      returnBg.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
    };
    drawBtn(false);

    this.add.text(btnX, btnY, 'VOLVER [ESC]', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const hit = this.add.zone(btnX, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerover', () => drawBtn(true));
    hit.on('pointerout', () => drawBtn(false));
    hit.on('pointerdown', () => this.returnToPreviousScene());
  }

  createTabsBar(width) {
    const tabs = [
      { id: 'global', label: '📊 SÍNTESIS GLOBAL', color: '#38bdf8' },
      { id: COMPETENCY_IDS.LOGIC_MATH, label: '[L] LÓGICA', color: '#38bdf8' },
      { id: COMPETENCY_IDS.COMPUTATIONAL_THINKING, label: '[CM] CIRCUITOS', color: '#10b981' },
      { id: COMPETENCY_IDS.READING_COMPREHENSION, label: '[AC] ARCHIVO', color: '#a855f7' },
      { id: COMPETENCY_IDS.STRATEGIC_MULTIDISCIPLINARY, label: '[E] ESTRATEGIA', color: '#f97316' }
    ];

    const tabW = 176;
    const tabH = 26;
    const startX = 26;
    const tabY = 75;

    this.tabButtons = [];

    tabs.forEach((tab, idx) => {
      const x = startX + (idx * (tabW + 8));
      const isSelected = this.selectedTab === tab.id;

      const bg = this.add.graphics();
      const drawTab = (active) => {
        bg.clear();
        bg.fillStyle(active ? 0x1e293b : 0x0f172a, 0.9);
        bg.fillRoundedRect(x, tabY, tabW, tabH, 4);
        bg.lineStyle(active ? 2 : 1, active ? 0x38bdf8 : 0x334155, 1);
        bg.strokeRoundedRect(x, tabY, tabW, tabH, 4);
      };
      drawTab(isSelected);

      const label = this.add.text(x + tabW / 2, tabY + tabH / 2, tab.label, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: isSelected ? '#ffffff' : '#94a3b8',
        fontStyle: isSelected ? 'bold' : 'normal'
      }).setOrigin(0.5);

      const hit = this.add.zone(x + tabW / 2, tabY + tabH / 2, tabW, tabH)
        .setInteractive({ useHandCursor: true });

      hit.on('pointerdown', () => {
        if (this.selectedTab !== tab.id) {
          this.selectedTab = tab.id;
          this.refreshTabs();
          this.renderActiveTabContent();
        }
      });

      this.tabButtons.push({ id: tab.id, bg, label, tab, drawTab });
    });
  }

  refreshTabs() {
    this.tabButtons.forEach(t => {
      const active = this.selectedTab === t.id;
      t.drawTab(active);
      t.label.setColor(active ? '#ffffff' : '#94a3b8');
      t.label.setFontStyle(active ? 'bold' : 'normal');
    });
  }

  clearDynamicElements() {
    this.dynamicElements.forEach(el => {
      if (el && el.destroy) el.destroy();
    });
    this.dynamicElements = [];
  }

  track(gameObj) {
    this.dynamicElements.push(gameObj);
    return gameObj;
  }

  renderActiveTabContent() {
    this.clearDynamicElements();

    if (this.selectedTab === 'global') {
      this.renderGlobalView();
    } else {
      this.renderCompetencyView(this.selectedTab);
    }
  }

  renderGlobalView() {
    const summary = LearningAnalytics.getGlobalSummary();
    const totals = summary.totals;

    // Cuadrícula 2 columnas x 3 filas
    const cards = [
      {
        title: '1. PARTICIPACIÓN Y PERSISTENCIA',
        value: `${totals.completed} MISIONES`,
        detail: `Completadas en ${totals.attempts} intentos acumulados`,
        sub: 'Registro de dedicación real sin penalizaciones por error.',
        color: 0x38bdf8,
        colorHex: '#38bdf8'
      },
      {
        title: '2. RENDIMIENTO OBJETIVO GLOBAL',
        value: `${totals.globalAccuracy}% PRECISIÓN`,
        detail: 'Porcentaje real de soluciones acertadas',
        sub: 'Evaluado en desafíos de jerarquía matemática, lógica y lectura.',
        color: 0x10b981,
        colorHex: '#10b981'
      },
      {
        title: '3. AUTONOMÍA COGNITIVA',
        value: `${totals.globalAutonomy}% INDEPENDIENTE`,
        detail: 'Resolución al primer intento sin solicitar pistas',
        sub: 'Refleja internalización del conocimiento frente a la dependencia de ayuda.',
        color: 0xa855f7,
        colorHex: '#a855f7'
      },
      {
        title: '4. DOMINIO CURRICULAR',
        value: '4 DISCIPLINAS',
        detail: 'Progreso y dificultad adaptativa independiente',
        sub: 'Sin rutas forzadas: libertad de navegación entre saberes.',
        color: 0x38bdf8,
        colorHex: '#38bdf8'
      },
      {
        title: '5. TRANSFERENCIA COGNITIVA',
        value: `${totals.globalTransfer}% EXTRAPOLACIÓN`,
        detail: 'Éxito en problemas de dominios novedosos no enseñados',
        sub: 'Comprueba aplicación en situaciones isomórficas distintas.',
        color: 0xf97316,
        colorHex: '#f97316'
      },
      {
        title: '6. RETENCIÓN TEMPORAL',
        value: `${totals.globalRetention}% CONSERVACIÓN`,
        detail: 'Persistencia conceptual tras intervalos de enfriamiento',
        sub: 'Comprobación de memoria a largo plazo vs. memorización efímera.',
        color: 0x06b6d4,
        colorHex: '#06b6d4'
      }
    ];

    this.renderMetricsGrid(cards);

    // Caja inferior de síntesis pedagógica
    this.renderFooterSummary(
      'SÍNTESIS GLOBAL DE NEUROCORE:',
      totals.completed > 0
        ? `Se registran ${totals.completed} desafíos formativos consolidados con ${totals.globalAccuracy}% de precisión objetiva y ${totals.globalAutonomy}% de autonomía. Continúa explorando terminales para calibrar la retención a largo plazo.`
        : 'Aún no se registran suficientes datos formativos. Explora las terminales de los mundos para generar tu matriz de aprendizaje adaptativo.'
    );
  }

  renderCompetencyView(competencyId) {
    const report = LearningAnalytics.getCompetencyReport(competencyId);
    const ind = report.indicators;
    const meta = report.meta;

    const cards = [
      {
        title: '1. PARTICIPACIÓN FORMATIVA',
        value: `${ind.participation.completed} / ${ind.participation.attempts}`,
        detail: ind.participation.summary,
        sub: 'Misiones resueltas en el sector activo.',
        color: meta.primaryColor,
        colorHex: meta.primaryColorHex
      },
      {
        title: '2. RENDIMIENTO OBJETIVO',
        value: `${ind.performance.rate}%`,
        detail: ind.performance.summary,
        sub: 'Exactitud matemática y conceptual en el sector.',
        color: 0x10b981,
        colorHex: '#10b981'
      },
      {
        title: '3. AUTONOMÍA COGNITIVA',
        value: `${ind.autonomy.rate}%`,
        detail: ind.autonomy.summary,
        sub: 'Desafíos completados sin uso de pistas o andamiajes.',
        color: 0xa855f7,
        colorHex: '#a855f7'
      },
      {
        title: '4. DOMINIO Y NIVEL ADAPTATIVO',
        value: report.levelLabel.toUpperCase(),
        detail: `Racha actual: ${ind.mastery.consecutiveCorrect} aciertos consecutivos`,
        sub: report.diagnosticCompleted ? 'Línea base calibrada en diagnóstico.' : 'Diagnóstico inicial pendiente.',
        color: meta.primaryColor,
        colorHex: meta.primaryColorHex
      },
      {
        title: '5. TRANSFERENCIA COGNITIVA',
        value: ind.transfer.evaluated > 0 ? `${ind.transfer.rate}%` : 'PENDIENTE',
        detail: ind.transfer.summary,
        sub: 'Evaluada en la Terminal 2 con problemas de contexto cruzado.',
        color: 0xf97316,
        colorHex: '#f97316'
      },
      {
        title: '6. RETENCIÓN TEMPORAL',
        value: ind.retention.evaluated > 0 ? `${ind.retention.rate}%` : 'PROGRAMADA',
        detail: ind.retention.summary,
        sub: 'Intervalos de enfriamiento para verificar retención a largo plazo.',
        color: 0x06b6d4,
        colorHex: '#06b6d4'
      }
    ];

    this.renderMetricsGrid(cards);

    // Caja inferior de recomendaciones personalizadas
    const recText = report.recommendations.join(' • ');
    this.renderFooterSummary(`DIAGNÓSTICO Y ORIENTACIÓN — ${meta.name.toUpperCase()}:`, recText);
  }

  renderMetricsGrid(cards) {
    const colW = 445;
    const rowH = 100;
    const startX = 26;
    const startY = 112;
    const gapX = 18;
    const gapY = 12;

    cards.forEach((card, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = startX + (col * (colW + gapX));
      const y = startY + (row * (rowH + gapY));

      // Caja de tarjeta
      const cardBg = this.track(this.add.graphics());
      cardBg.fillStyle(0x0f172a, 0.95);
      cardBg.fillRoundedRect(x, y, colW, rowH, 6);
      cardBg.lineStyle(1, card.color, 0.7);
      cardBg.strokeRoundedRect(x, y, colW, rowH, 6);

      // Título de indicador
      this.track(
        this.add.text(x + 14, y + 10, card.title, {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: card.colorHex,
          fontStyle: 'bold'
        })
      );

      // Valor destacado
      this.track(
        this.add.text(x + 14, y + 28, card.value, {
          fontFamily: 'monospace',
          fontSize: '19px',
          color: '#ffffff',
          fontStyle: 'bold'
        })
      );

      // Detalle principal
      this.track(
        this.add.text(x + 14, y + 54, card.detail, {
          fontFamily: 'Segoe UI',
          fontSize: '11px',
          color: '#cbd5e1'
        })
      );

      // Subtexto pedagógico
      this.track(
        this.add.text(x + 14, y + 74, card.sub, {
          fontFamily: 'Segoe UI',
          fontSize: '10px',
          color: '#64748b',
          fontStyle: 'italic'
        })
      );
    });
  }

  renderFooterSummary(title, text) {
    const boxX = 26;
    const boxY = 452;
    const boxW = 908;
    const boxH = 68;

    const box = this.track(this.add.graphics());
    box.fillStyle(0x0f172a, 0.95);
    box.fillRoundedRect(boxX, boxY, boxW, boxH, 6);
    box.lineStyle(1, 0x38bdf8, 0.8);
    box.strokeRoundedRect(boxX, boxY, boxW, boxH, 6);

    this.track(
      this.add.text(boxX + 16, boxY + 10, title, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#38bdf8',
        fontStyle: 'bold'
      })
    );

    this.track(
      this.add.text(boxX + 16, boxY + 28, text, {
        fontFamily: 'Segoe UI',
        fontSize: '11px',
        color: '#f8fafc',
        lineSpacing: 3,
        wordWrap: { width: boxW - 32 }
      })
    );
  }

  setupKeyboardShortcuts() {
    this.input.keyboard.on('keydown-ESC', () => this.returnToPreviousScene());
    this.input.keyboard.on('keydown-B', () => this.returnToPreviousScene());

    // Teclas 1 al 5 para alternar pestañas
    this.input.keyboard.on('keydown-ONE', () => this.switchTabByIndex(0));
    this.input.keyboard.on('keydown-TWO', () => this.switchTabByIndex(1));
    this.input.keyboard.on('keydown-THREE', () => this.switchTabByIndex(2));
    this.input.keyboard.on('keydown-FOUR', () => this.switchTabByIndex(3));
    this.input.keyboard.on('keydown-FIVE', () => this.switchTabByIndex(4));
  }

  switchTabByIndex(idx) {
    if (this.tabButtons && this.tabButtons[idx]) {
      this.selectedTab = this.tabButtons[idx].id;
      this.refreshTabs();
      this.renderActiveTabContent();
    }
  }

  returnToPreviousScene() {
    this.cameras.main.fadeOut(200, 10, 12, 22);
    this.time.delayedCall(220, () => {
      this.scene.start(this.previousSceneKey);
    });
  }
}
