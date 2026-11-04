import { sessionState } from '../../core/sessionState.js';

/**
 * TransferAssessment.js — Gestor pedagógico de Evaluaciones de Transferencia.
 * Evalúa si el estudiante es capaz de extrapolar y aplicar un concepto o habilidad
 * previamente aprendida a un contexto o problema completamente nuevo y no visto.
 * Diferencia entre transferencia cercana (near transfer) y lejana (far transfer).
 */
export class TransferAssessment {
  /**
   * Determina si el estudiante es elegible para un desafío de transferencia en la competencia activa.
   * Se activa tras demostrar consistencia formativa (al menos 2 aciertos consecutivos en el nivel actual)
   * y no haber realizado una transferencia recientemente.
   * @param {string} competencyId
   * @param {Object} progress
   * @returns {boolean}
   */
  static isEligibleForTransfer(competencyId, progress) {
    if (!progress || !progress.diagnosticCompleted) return false;
    
    const consecutiveCorrect = progress.consecutiveCorrect || 0;
    const transferPending = progress.transferPending || false;
    
    // Elegible si tiene al menos 2 aciertos consecutivos o ya tiene la transferencia encolada
    return transferPending || consecutiveCorrect >= 2;
  }

  /**
   * Registra y evalúa el resultado de un desafío de transferencia.
   * @param {string} competencyId
   * @param {Object} challenge
   * @param {boolean} isCorrect
   * @param {number} attempts
   * @param {number} hintsUsed
   * @returns {Object} Informe pedagógico de transferencia
   */
  static evaluateTransfer(competencyId, challenge, isCorrect, attempts, hintsUsed) {
    const progress = sessionState.getProgress(competencyId);
    const transferType = challenge.transferType || 'near'; // 'near' | 'far'
    const isAutonomous = hintsUsed === 0 && attempts === 1;

    if (!progress.transferMetrics) {
      progress.transferMetrics = {
        totalEvaluated: 0,
        successfulTransfers: 0,
        autonomousTransfers: 0,
        nearTransferSuccess: 0,
        farTransferSuccess: 0,
        history: []
      };
    }

    const metrics = progress.transferMetrics;
    metrics.totalEvaluated++;

    if (isCorrect) {
      metrics.successfulTransfers++;
      if (isAutonomous) metrics.autonomousTransfers++;
      if (transferType === 'near') metrics.nearTransferSuccess++;
      if (transferType === 'far') metrics.farTransferSuccess++;
    }

    // Registrar en historial de transferencia
    metrics.history.push({
      challengeId: challenge.id,
      skill: challenge.skill,
      transferType,
      isCorrect,
      isAutonomous,
      timestamp: new Date().toISOString()
    });

    // Resetear bandera de transferencia pendiente
    progress.transferPending = false;
    if (isCorrect) {
      progress.consecutiveCorrect = 0; // Reiniciar racha tras consolidar transferencia
    }

    const transferSuccessRate = Math.round((metrics.successfulTransfers / metrics.totalEvaluated) * 100);

    return {
      isTransfer: true,
      transferType,
      isCorrect,
      isAutonomous,
      transferredSkill: challenge.skill,
      domainContext: challenge.domainContext || 'Contexto Multidisciplinario',
      transferSuccessRate,
      feedbackMessage: isCorrect
        ? (isAutonomous
            ? '¡Transferencia cognitiva óptima! Demostraste aplicación independiente de la habilidad en un escenario novedoso.'
            : '¡Transferencia lograda! Pudiste aplicar el concepto en este nuevo contexto con apoyo estratégico.')
        : 'Dificultad en la extrapolación conceptual. Reforzaremos la estructura del principio antes de intentar nuevos contextos.'
    };
  }
}
