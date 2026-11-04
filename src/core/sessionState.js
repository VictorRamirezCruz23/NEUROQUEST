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
