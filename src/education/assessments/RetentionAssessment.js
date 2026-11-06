import { sessionState } from '../../core/sessionState.js';

/**
 * RetentionAssessment.js — Gestor pedagógico de Evaluaciones de Retención Temporal.
 * Comprueba si el conocimiento y las habilidades permanecen consolidadas en la memoria
 * del estudiante tras transcurrir un intervalo de tiempo o actividad posterior,
 * evaluándolo independientemente de los resultados de la primera sesión.
 */
export class RetentionAssessment {
  // Intervalo mínimo de enfriamiento para programar una prueba de retención (en milisegundos)
  // Por defecto 60 segundos de actividad o cambio de competencia para pruebas en tiempo real
  static DEFAULT_COOLING_INTERVAL_MS = 60 * 1000;

  /**
   * Comprueba si la competencia activa tiene conceptos maduros listos para prueba de retención.
   * @param {string} competencyId
   * @param {Object} progress
   * @returns {boolean}
   */
  static isRetentionDue(competencyId, progress) {
    if (!progress || !progress.diagnosticCompleted) return false;

    // Verificar si hay habilidades registradas con tiempo de enfriamiento cumplido
    if (!progress.retentionSchedule || progress.retentionSchedule.length === 0) {
      return false;
    }

    const now = Date.now();
    return progress.retentionSchedule.some(item => !item.evaluated && (now - item.learnedAt >= item.coolingPeriodMs));
  }

  /**
   * Programa una evaluación de retención para un concepto recién superado.
   * @param {string} competencyId
   * @param {string} skill
   * @param {string} challengeId
   * @param {number} [coolingPeriodMs]
   */
  static scheduleRetention(competencyId, skill, challengeId, coolingPeriodMs = this.DEFAULT_COOLING_INTERVAL_MS) {
    const progress = sessionState.getProgress(competencyId);
    if (!progress) return;

    if (!progress.retentionSchedule) {
      progress.retentionSchedule = [];
    }

    const safeSkill = skill || 'general';
    // Evitar programar duplicados de la misma habilidad en la misma tanda
    const existing = progress.retentionSchedule.find(item => item.skill === safeSkill && !item.evaluated);
    if (!existing) {
      progress.retentionSchedule.push({
        skill: safeSkill,
        originalChallengeId: challengeId || 'unknown',
        learnedAt: Date.now(),
        coolingPeriodMs,
        evaluated: false
      });
      console.log(`[RetentionAssessment] Evaluación de retención programada para: ${safeSkill} en ${coolingPeriodMs / 1000}s`);
    }
  }

  /**
   * Obtiene la siguiente habilidad pendiente de evaluación de retención.
   * @param {string} competencyId
   * @returns {Object|null}
   */
  static getPendingRetentionItem(competencyId) {
    const progress = sessionState.getProgress(competencyId);
    if (!progress || !progress.retentionSchedule) return null;

    const now = Date.now();
    return progress.retentionSchedule.find(item => !item.evaluated && (now - item.learnedAt >= item.coolingPeriodMs)) || null;
  }

  /**
   * Evalúa y registra el desempeño en un desafío de retención temporal.
   * @param {string} competencyId
   * @param {Object} challenge
   * @param {boolean} isCorrect
   * @param {number} attempts
   * @param {number} hintsUsed
   * @returns {Object} Informe pedagógico de retención
   */
  static evaluateRetention(competencyId, challenge, isCorrect, attempts, hintsUsed) {
    const progress = sessionState.getProgress(competencyId);
    const isAutonomous = hintsUsed === 0 && attempts === 1;

    if (!progress.retentionMetrics) {
      progress.retentionMetrics = {
        totalEvaluated: 0,
        retainedCount: 0,
        autonomousRetained: 0,
        decayDetectedCount: 0,
        history: []
      };
    }

    const metrics = progress.retentionMetrics;
    metrics.totalEvaluated++;

    if (isCorrect) {
      metrics.retainedCount++;
      if (isAutonomous) metrics.autonomousRetained++;
    } else {
      metrics.decayDetectedCount++;
    }

    // Marcar el ítem programado como evaluado
    const challengeSkill = challenge.skill || challenge.skillId || challenge.skillName || 'general';
    if (progress.retentionSchedule) {
      const scheduleItem = progress.retentionSchedule.find(item => item.skill === challengeSkill && !item.evaluated);
      if (scheduleItem) {
        scheduleItem.evaluated = true;
        scheduleItem.retained = isCorrect;
        scheduleItem.evaluatedAt = Date.now();
      }
    }

    metrics.history.push({
      challengeId: challenge.id,
      skill: challengeSkill,
      isCorrect,
      isAutonomous,
      timestamp: new Date().toISOString()
    });

    const retentionIndex = Math.round((metrics.retainedCount / metrics.totalEvaluated) * 100);

    return {
      isRetention: true,
      isCorrect,
      isAutonomous,
      evaluatedSkill: challenge.skill,
      retentionIndex,
      decayDetected: !isCorrect,
      feedbackMessage: isCorrect
        ? (isAutonomous
            ? '¡Retención consolidada a largo plazo! El conocimiento se mantiene íntegro de forma totalmente autónoma.'
            : '¡Concepto retenido! La memoria de trabajo conserva el principio esencial con soporte menor.')
        : 'Se detectó desvanecimiento del concepto con el tiempo. El sistema adaptativo programará un refuerzo constructivo.'
    };
  }
}
