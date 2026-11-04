import { ChallengeRepository } from '../repositories/ChallengeRepository.js';
import { sessionState } from '../../core/sessionState.js';

/**
 * EducationEngine.js — Núcleo educativo desacoplado de Phaser 3.
 * Administra el ciclo pedagógico, suministro de desafíos y evaluación formativa.
 */
export class EducationEngine {
  constructor() {
    this.currentChallengeIndex = 0;
    this.currentHintsRequested = 0;
    this.currentAttempts = 0;
  }

  /**
   * Obtiene el siguiente desafío para la competencia activa.
   * @param {string} [competencyId]
   * @returns {Object|null}
   */
  getNextChallenge(competencyId = null) {
    const compId = competencyId || sessionState.getActiveCompetency();
    const challenges = ChallengeRepository.getChallengesByCompetency(compId);

    if (challenges.length === 0) return null;

    if (this.currentChallengeIndex >= challenges.length) {
      this.currentChallengeIndex = 0; // Reiniciar ciclo o continuar en rotación
    }

    const challenge = challenges[this.currentChallengeIndex];
    this.currentHintsRequested = 0;
    this.currentAttempts = 0;
    return challenge;
  }

  /**
   * Solicita una pista para el desafío actual.
   * @param {Object} challenge
   * @returns {string|null}
   */
  requestHint(challenge) {
    if (!challenge || !challenge.hints || challenge.hints.length === 0) return null;

    if (this.currentHintsRequested < challenge.hints.length) {
      const hint = challenge.hints[this.currentHintsRequested];
      this.currentHintsRequested++;
      return hint;
    }

    return challenge.hints[challenge.hints.length - 1];
  }

  /**
   * Evalúa la respuesta enviada por el estudiante y proporciona retroalimentación formativa.
   * @param {Object} challenge
   * @param {number} selectedOptionIndex
   * @returns {Object} Resultado con retroalimentación detallada
   */
  evaluateAnswer(challenge, selectedOptionIndex) {
    this.currentAttempts++;
    const isCorrect = selectedOptionIndex === challenge.correctIndex;

    // Actualizar progreso en la sesión
    const progress = sessionState.getProgress(challenge.competencyId);
    if (progress) {
      progress.totalAttempts++;
      if (isCorrect) {
        progress.accuracy = Math.min(1, (progress.accuracy * (progress.totalAttempts - 1) + 1) / progress.totalAttempts);
      } else {
        progress.accuracy = Math.max(0, (progress.accuracy * (progress.totalAttempts - 1)) / progress.totalAttempts);
      }
    }

    if (isCorrect) {
      // Avanzar al siguiente reto para la próxima interacción
      this.currentChallengeIndex++;
    }

    return {
      isCorrect,
      attempts: this.currentAttempts,
      hintsUsed: this.currentHintsRequested,
      selectedOption: challenge.options[selectedOptionIndex],
      expectedOption: challenge.options[challenge.correctIndex],
      explanation: challenge.explanation,
      conceptNeeded: challenge.conceptNeeded,
      strategy: challenge.strategy,
      title: isCorrect ? '¡DESAFÍO COMPLETADO CON ÉXITO!' : 'OBSERVACIÓN PEDAGÓGICA Y RETROALIMENTACIÓN'
    };
  }

  resetProgress() {
    this.currentChallengeIndex = 0;
    this.currentHintsRequested = 0;
    this.currentAttempts = 0;
  }
}

// Instancia singleton del motor educativo
export const educationEngine = new EducationEngine();
