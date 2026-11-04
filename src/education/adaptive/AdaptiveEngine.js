/**
 * AdaptiveEngine.js — Motor de dificultad adaptativa determinista y explicable de NEUROQUEST.
 * Calibra el nivel de desafío (1 a 5) en función de precisión, intentos, autonomía y consistencia,
 * sin utilizar puntos inflados ni algoritmos de caja negra opacos.
 */

export const ADAPTIVE_ACTIONS = {
  INCREASE: 'INCREASE',
  MAINTAIN: 'MAINTAIN',
  DECREASE: 'DECREASE',
  REINFORCE: 'REINFORCE'
};

export const DIFFICULTY_LABELS = {
  1: 'Nivel 1: Fundamentos',
  2: 'Nivel 2: Intermedio',
  3: 'Nivel 3: Avanzado',
  4: 'Nivel 4: Dominio',
  5: 'Nivel 5: Maestría'
};

export class AdaptiveEngine {
  constructor() {
    // Registro de historial reciente por competencia: { [competencyId]: Array<AttemptRecord> }
    this.historyByCompetency = {};
  }

  /**
   * Registra un intento y calcula la siguiente acción determinista de dificultad.
   * @param {Object} params
   * @param {string} params.competencyId
   * @param {number} params.currentLevel Nivel actual (1 a 5)
   * @param {boolean} params.isCorrect Si acertó en este intento
   * @param {number} params.attempts Cantidad de intentos requeridos
   * @param {number} params.hintsUsed Cantidad de pistas utilizadas
   * @param {number} params.timeSeconds Tiempo invertido
   * @returns {Object} Resultado adaptativo explicable
   */
  evaluatePerformance({ competencyId, currentLevel, isCorrect, attempts, hintsUsed, timeSeconds = 0 }) {
    if (!this.historyByCompetency[competencyId]) {
      this.historyByCompetency[competencyId] = [];
    }

    const record = {
      isCorrect,
      attempts,
      hintsUsed,
      timeSeconds,
      level: currentLevel,
      timestamp: Date.now()
    };

    const history = this.historyByCompetency[competencyId];
    history.push(record);

    // Mantener sólo los últimos 5 intentos para análisis de tendencia reciente
    if (history.length > 5) {
      history.shift();
    }

    let action = ADAPTIVE_ACTIONS.MAINTAIN;
    let nextLevel = currentLevel;
    let reason = '';
    let explanation = '';

    // Analizar últimos 2 intentos
    const recent = history.slice(-2);
    const lastTwoCorrect = recent.length === 2 && recent.every(r => r.isCorrect && r.attempts === 1 && r.hintsUsed === 0);
    const lastTwoFailed = recent.length === 2 && recent.every(r => !r.isCorrect || r.attempts >= 3);

    // REGLA 1: Aumentar Dificultad (Dc + 1)
    if (isCorrect && lastTwoCorrect && currentLevel < 5) {
      action = ADAPTIVE_ACTIONS.INCREASE;
      nextLevel = currentLevel + 1;
      reason = 'Alta precisión y autonomía comprobada';
      explanation = `¡Excelente dominio! Resolviste dos desafíos consecutivos en el primer intento y sin requerir pistas. La dificultad se calibra al ${DIFFICULTY_LABELS[nextLevel]}.`;
    }
    // REGLA 3: Reducir Dificultad (Dc - 1)
    else if (!isCorrect && lastTwoFailed && currentLevel > 1) {
      action = ADAPTIVE_ACTIONS.DECREASE;
      nextLevel = currentLevel - 1;
      reason = 'Dificultad de asimilación detectada en el nivel actual';
      explanation = `El sistema detectó dificultades consecutivas. Para consolidar tus bases conceptuales, el nivel se ajusta a ${DIFFICULTY_LABELS[nextLevel]}.`;
    }
    // REGLA 4: Recomendar Refuerzo
    else if (!isCorrect && lastTwoFailed && currentLevel === 1) {
      action = ADAPTIVE_ACTIONS.REINFORCE;
      nextLevel = 1;
      reason = 'Refuerzo conceptual guiado requerido en nivel inicial';
      explanation = 'Se sugiere revisar las pistas detalladas y el principio fundamental antes de intentar un nuevo reto.';
    }
    // REGLA 2: Mantener Dificultad (Dc)
    else {
      action = ADAPTIVE_ACTIONS.MAINTAIN;
      nextLevel = currentLevel;
      if (isCorrect) {
        reason = 'Comprensión demostrada en consolidación';
        explanation = hintsUsed > 0
          ? `Desafío superado con apoyo de ${hintsUsed} pista(s). Continúas en ${DIFFICULTY_LABELS[currentLevel]} para consolidar tu autonomía.`
          : `Acierto registrado. Se requiere un acierto consecutivo más sin pistas para subir de nivel.`;
      } else {
        reason = 'Oportunidad de experimentación formativa';
        explanation = `Intento registrado. Puedes solicitar pistas o volver a intentar para comprender el concepto sin penalización.`;
      }
    }

    return {
      action,
      previousLevel: currentLevel,
      nextLevel,
      reason,
      explanation,
      autonomyIndex: attempts === 1 && hintsUsed === 0 ? 1.0 : (hintsUsed === 0 ? 0.7 : 0.4)
    };
  }

  getRecentHistory(competencyId) {
    return this.historyByCompetency[competencyId] || [];
  }
}

export const adaptiveEngine = new AdaptiveEngine();
