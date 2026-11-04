import { sessionState } from '../../core/sessionState.js';
import { ChallengeRepository } from '../repositories/ChallengeRepository.js';

/**
 * DiagnosticManager.js — Administrador de evaluaciones diagnósticas iniciales.
 * Evalúa los conocimientos previos del estudiante al iniciar una competencia
 * y establece la línea base de partida sin frustración ni castigos de puntuación.
 */
export class DiagnosticManager {
  /**
   * Comprueba si la competencia activa requiere evaluación diagnóstica inicial.
   * @param {string} competencyId
   * @returns {boolean}
   */
  static needsDiagnostic(competencyId) {
    const progress = sessionState.getProgress(competencyId);
    return !progress || !progress.diagnosticCompleted;
  }

  /**
   * Obtiene el estado del diagnóstico para la competencia.
   * @param {string} competencyId
   * @returns {{ completed: boolean, step: number, total: number }}
   */
  static getDiagnosticStatus(competencyId) {
    const progress = sessionState.getProgress(competencyId);
    const completed = progress ? !!progress.diagnosticCompleted : false;
    return {
      completed,
      step: completed ? 1 : 0,
      total: 1
    };
  }

  /**
   * Obtiene el desafío diagnóstico para la competencia.
   * @param {string} competencyId
   * @returns {Object|null}
   */
  static getDiagnosticChallenge(competencyId) {
    const challenges = ChallengeRepository.getChallengesByCompetency(competencyId);
    const diagnostic = challenges.find(c => c.isDiagnostic);
    return diagnostic || challenges[0] || null;
  }

  /**
   * Procesa el resultado de la evaluación diagnóstica y calibra la línea base.
   * @param {string} competencyId
   * @param {boolean} isCorrect
   * @param {number} attempts
   * @param {number} hintsUsed
   * @returns {Object} Diagnóstico con línea base asignada
   */
  static completeDiagnostic(competencyId, isCorrect, attempts, hintsUsed) {
    const progress = sessionState.getProgress(competencyId);
    let baselineLevel = 1;

    // Si resolvió en primer intento y sin pistas, ubicar en Nivel 2 inicial; de lo contrario en Nivel 1
    if (isCorrect && attempts === 1 && hintsUsed === 0) {
      baselineLevel = 2;
    } else {
      baselineLevel = 1;
    }

    if (progress) {
      progress.diagnosticCompleted = true;
      progress.currentLevel = baselineLevel;
      progress.diagnosticScore = {
        baselineLevel,
        isCorrect,
        completedAt: new Date().toISOString()
      };
    }

    return {
      competencyId,
      baselineLevel,
      title: 'EVALUACIÓN DIAGNÓSTICA COMPLETADA',
      summary: baselineLevel === 2
        ? '¡Excelente base previa demostrada! El sistema inicia tu recorrido directamente en el Nivel 2.'
        : 'Línea base establecida en Nivel 1. Comenzaremos con fundamentos guiados para afianzar tus competencias.'
    };
  }
}
