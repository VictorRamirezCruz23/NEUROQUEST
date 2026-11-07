import { authService } from '../services/firebase/authService.js';
import { firestoreService } from '../services/firebase/firestoreService.js';

/**
 * sessionState.js — Gestor de estado de sesión desacoplado de NEUROQUEST.
 * Administra la competencia activa y el progreso independiente de cada una,
 * sincronizando automáticamente con Firebase Authentication y Cloud Firestore.
 */

export const COMPETENCY_IDS = {
  LOGIC_MATH: 'logic_math',
  COMPUTATIONAL_THINKING: 'computational_thinking',
  READING_COMPREHENSION: 'reading_comprehension',
  STRATEGIC_MULTIDISCIPLINARY: 'strategic_multidisciplinary'
};

export const PLAYER_PALETTES = [
  { id: 'classic_blue', name: 'Azul Cobalto (Original)', tint: 0xffffff, accentHex: '#38bdf8', secondaryHex: '#2563eb' },
  { id: 'cyber_cyan', name: 'Cian Neón', tint: 0x38bdf8, accentHex: '#00f0ff', secondaryHex: '#0284c7' },
  { id: 'matrix_emerald', name: 'Esmeralda Cuántico', tint: 0x34d399, accentHex: '#10b981', secondaryHex: '#059669' },
  { id: 'plasma_ruby', name: 'Plasma Rubí', tint: 0xf43f5e, accentHex: '#fb7185', secondaryHex: '#be123c' },
  { id: 'synth_violet', name: 'Sintetizador Violeta', tint: 0xa855f7, accentHex: '#c084fc', secondaryHex: '#7e22ce' },
  { id: 'solar_amber', name: 'Ámbar Solar', tint: 0xf59e0b, accentHex: '#fbbf24', secondaryHex: '#d97706' }
];

export const MENU_BG_THEMES = [
  { id: 'cyber_dark', name: 'Cyber Dark', bgColor: 0x070913, gridColor: 0x1e293b, starColor: 0x38bdf8 },
  { id: 'synth_magenta', name: 'Synthwave', bgColor: 0x18051e, gridColor: 0x701a75, starColor: 0xf43f5e },
  { id: 'deep_space', name: 'Espacio Profundo', bgColor: 0x03071e, gridColor: 0x1e3a8a, starColor: 0x60a5fa },
  { id: 'matrix_green', name: 'Matrix Terminal', bgColor: 0x02150d, gridColor: 0x064e3b, starColor: 0x10b981 }
];

export const COMPETENCY_METADATA = {
  [COMPETENCY_IDS.LOGIC_MATH]: {
    id: COMPETENCY_IDS.LOGIC_MATH,
    code: 'L',
    worldNumber: '01',
    name: 'Núcleo de Lógica',
    discipline: 'Pensamiento Lógico y Matemático',
    tagline: 'Equilibrio numérico, patrones y razonamiento abstracto',
    skills: [
      'Operaciones combinadas',
      'Secuencias y patrones',
      'Fracciones y razones',
      'Porcentajes y proporciones',
      'Razonamiento deductivo'
    ],
    primaryColor: 0x38bdf8,
    primaryColorHex: '#38bdf8',
    accentColor: 0x2563eb,
    accentColorHex: '#2563eb',
    badgeBg: 0x0369a1,
    bgKey: 'bg_logic_math'
  },
  [COMPETENCY_IDS.COMPUTATIONAL_THINKING]: {
    id: COMPETENCY_IDS.COMPUTATIONAL_THINKING,
    code: 'CM',
    worldNumber: '02',
    name: 'Circuitos Mentales',
    discipline: 'Pensamiento Computacional y Programación',
    tagline: 'Algoritmos, estructuras de control y depuración de código',
    skills: [
      'Algoritmos y secuenciación',
      'Condicionales lógicos',
      'Descomposición de problemas',
      'Detección de errores (Debug)',
      'Lógica de bucles'
    ],
    primaryColor: 0x10b981,
    primaryColorHex: '#10b981',
    accentColor: 0x059669,
    accentColorHex: '#059669',
    badgeBg: 0x065f46,
    bgKey: 'bg_computational'
  },
  [COMPETENCY_IDS.READING_COMPREHENSION]: {
    id: COMPETENCY_IDS.READING_COMPREHENSION,
    code: 'AC',
    worldNumber: '03',
    name: 'Archivo del Conocimiento',
    discipline: 'Comprensión Lectora',
    tagline: 'Interpretación de textos, inferencias y análisis crítico',
    skills: [
      'Ideas principales e implícitas',
      'Inferencias contextuales',
      'Validez de argumentos',
      'Seguimiento de instrucciones',
      'Análisis de testimonios'
    ],
    primaryColor: 0xa855f7,
    primaryColorHex: '#a855f7',
    accentColor: 0x7e22ce,
    accentColorHex: '#7e22ce',
    badgeBg: 0x581c87,
    bgKey: 'bg_reading'
  },
  [COMPETENCY_IDS.STRATEGIC_MULTIDISCIPLINARY]: {
    id: COMPETENCY_IDS.STRATEGIC_MULTIDISCIPLINARY,
    code: 'E',
    worldNumber: '04',
    name: 'Dimensión Estratégica',
    discipline: 'Resolución Multidisciplinaria de Problemas',
    tagline: 'Toma de decisiones, balance de recursos y visión sistémica',
    skills: [
      'Análisis holístico de crisis',
      'Pensamiento crítico y sesgos',
      'Decisión bajo restricciones',
      'Interpretación de telemetría',
      'Estrategias de contingencia'
    ],
    primaryColor: 0xf97316,
    primaryColorHex: '#f97316',
    accentColor: 0xd97706,
    accentColorHex: '#d97706',
    badgeBg: 0x9a3412,
    bgKey: 'bg_strategic'
  }
};

class SessionStateManager {
  constructor() {
    this.activeCompetency = COMPETENCY_IDS.LOGIC_MATH;
    this.playerPaletteId = this.loadLocal('nq_player_palette') || 'classic_blue';
    this.menuBgThemeId = this.loadLocal('nq_menu_theme') || 'cyber_dark';
    this.trophies = this.loadLocalJson('nq_trophies') || {
      [COMPETENCY_IDS.LOGIC_MATH]: false,
      [COMPETENCY_IDS.COMPUTATIONAL_THINKING]: false,
      [COMPETENCY_IDS.READING_COMPREHENSION]: false,
      [COMPETENCY_IDS.STRATEGIC_MULTIDISCIPLINARY]: false
    };
    this.competenciesState = {
      [COMPETENCY_IDS.LOGIC_MATH]: {
        unlocked: true,
        currentLevel: 1,
        diagnosticCompleted: false,
        totalAttempts: 0,
        accuracy: 0
      },
      [COMPETENCY_IDS.COMPUTATIONAL_THINKING]: {
        unlocked: true,
        currentLevel: 1,
        diagnosticCompleted: false,
        totalAttempts: 0,
        accuracy: 0
      },
      [COMPETENCY_IDS.READING_COMPREHENSION]: {
        unlocked: true,
        currentLevel: 1,
        diagnosticCompleted: false,
        totalAttempts: 0,
        accuracy: 0
      },
      [COMPETENCY_IDS.STRATEGIC_MULTIDISCIPLINARY]: {
        unlocked: true,
        currentLevel: 1,
        diagnosticCompleted: false,
        totalAttempts: 0,
        accuracy: 0
      }
    };
  }

  loadLocal(key) {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  }

  saveLocal(key, val) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, val);
    } catch (e) {
      console.warn('[SessionState] LocalStorage save error:', e);
    }
  }

  loadLocalJson(key) {
    try {
      const data = this.loadLocal(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  saveLocalJson(key, val) {
    try {
      this.saveLocal(key, JSON.stringify(val));
    } catch (e) {
      console.warn('[SessionState] LocalStorage saveJson error:', e);
    }
  }

  // --- Paleta del Personaje (Player Customization) ---
  getPlayerPaletteId() {
    return this.playerPaletteId;
  }

  getPlayerPalette() {
    return PLAYER_PALETTES.find(p => p.id === this.playerPaletteId) || PLAYER_PALETTES[0];
  }

  setPlayerPalette(paletteId) {
    const pal = PLAYER_PALETTES.find(p => p.id === paletteId);
    if (pal) {
      this.playerPaletteId = paletteId;
      this.saveLocal('nq_player_palette', paletteId);
      console.log(`[SessionState] Paleta del jugador cambiada a: ${pal.name}`);
      return pal;
    }
    return null;
  }

  cyclePlayerPalette() {
    const currentIndex = PLAYER_PALETTES.findIndex(p => p.id === this.playerPaletteId);
    const nextIndex = (currentIndex + 1) % PLAYER_PALETTES.length;
    return this.setPlayerPalette(PLAYER_PALETTES[nextIndex].id);
  }

  // --- Temas de Fondo de Interfaz ---
  getMenuBgThemeId() {
    return this.menuBgThemeId;
  }

  getMenuBgTheme() {
    return MENU_BG_THEMES.find(t => t.id === this.menuBgThemeId) || MENU_BG_THEMES[0];
  }

  setMenuBgTheme(themeId) {
    const theme = MENU_BG_THEMES.find(t => t.id === themeId);
    if (theme) {
      this.menuBgThemeId = themeId;
      this.saveLocal('nq_menu_theme', themeId);
      console.log(`[SessionState] Tema de menú cambiado a: ${theme.name}`);
      return theme;
    }
    return null;
  }

  cycleMenuBgTheme() {
    const currentIndex = MENU_BG_THEMES.findIndex(t => t.id === this.menuBgThemeId);
    const nextIndex = (currentIndex + 1) % MENU_BG_THEMES.length;
    return this.setMenuBgTheme(MENU_BG_THEMES[nextIndex].id);
  }

  // --- Sistema de Trofeos de Victoria ---
  getTrophies() {
    return { ...this.trophies };
  }

  hasTrophy(competencyId) {
    return !!this.trophies[competencyId];
  }

  unlockTrophy(competencyId) {
    this.trophies[competencyId] = true;
    this.saveLocalJson('nq_trophies', this.trophies);
    console.log(`[SessionState] 🏆 ¡Trofeo desbloqueado para ${competencyId}!`);
    return true;
  }

  getActiveCompetency() {
    return this.activeCompetency;
  }

  getActiveCompetencyId() {
    return this.activeCompetency;
  }

  getActiveCompetencyMeta() {
    return COMPETENCY_METADATA[this.activeCompetency] || COMPETENCY_METADATA[COMPETENCY_IDS.LOGIC_MATH];
  }

  setActiveCompetency(competencyId) {
    if (COMPETENCY_METADATA[competencyId]) {
      this.activeCompetency = competencyId;
      console.log(`[SessionState] Competencia activa cambiada a: ${competencyId} (${COMPETENCY_METADATA[competencyId].code})`);
      return true;
    }
    return false;
  }

  getProgress(competencyId) {
    return this.competenciesState[competencyId];
  }

  /**
   * Guarda el progreso de la competencia en Firestore y caché local.
   * @param {string} competencyId
   */
  async saveProgress(competencyId) {
    const progress = this.competenciesState[competencyId];
    if (progress) {
      await firestoreService.saveCompetencyProgress(competencyId, progress);
    }
  }

  /**
   * Carga y sincroniza el estado de todas las competencias para el usuario activo.
   * @param {Object} user
   */
  async syncWithFirestore(user) {
    if (!user) return;
    await firestoreService.syncUserProfile(user);

    for (const compId of Object.values(COMPETENCY_IDS)) {
      const remote = await firestoreService.loadCompetencyProgress(compId);
      if (remote) {
        this.competenciesState[compId] = {
          ...this.competenciesState[compId],
          ...remote
        };
      }
    }
    console.log('[SessionState] Progreso de competencias sincronizado con Firebase.');
  }

  /**
   * Inicializa la escucha de sesión y sincronización con Firestore.
   */
  async initSession() {
    authService.onAuthStateChange(async (user) => {
      if (user && !user.isAnonymous) {
        await this.syncWithFirestore(user);
      }
    });
  }
}

// Singleton global de estado de sesión
export const sessionState = new SessionStateManager();
sessionState.initSession();
