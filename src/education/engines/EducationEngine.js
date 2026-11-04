import { ChallengeRepository } from '../repositories/ChallengeRepository.js';
import { sessionState } from '../../core/sessionState.js';
import { adaptiveEngine } from '../adaptive/AdaptiveEngine.js';
import { DiagnosticManager } from '../assessments/DiagnosticManager.js';

/**
 * EducationEngine.js — Núcleo educativo desacoplado de Phaser 3.
 * Orquesta la evaluación diagnóstica inicial, el algoritmo de dificultad adaptativa determinista
 * y el suministro pedagógico de desafíos por nivel.
 */
export class EducationEngine {
  constructor() {
    this.currentHintsRequested = 0;
    this.currentAttempts = 0;
    this.challengeHistory = [];
  }

  /**
   * Obtiene el siguiente desafío para la competencia activa según su nivel adaptativo.
   * Si la competencia no tiene diagnóstico inicial, entrega prioritariamente el desafío diagnóstico.
   * @param {string} [competencyId]
   * @returns {Object|null}
   */
  getNextChallenge(competencyId = null) {
    const compId = competencyId || sessionState.getActiveCompetency();
    const progress = sessionState.getProgress(compId);

    // 1. Comprobar si requiere evaluación diagnóstica inicial
    if (DiagnosticManager.needsDiagnostic(compId)) {
      const diagChallenge = DiagnosticManager.getDiagnosticChallenge(compId);
      if (diagChallenge) {
        this.currentHintsRequested = 0;
        this.currentAttempts = 0;
        return diagChallenge;
      }
    }

    // 2. Obtener banco de desafíos de la competencia
    const allChallenges = ChallengeRepository.getChallengesByCompetency(compId);
    if (allChallenges.length === 0) return null;

    const currentLevel = progress ? progress.currentLevel : 1;

    // 3. Filtrar desafíos acordes al nivel adaptativo actual
    const levelChallenges = allChallenges.filter(c => c.difficulty === currentLevel && !c.isDiagnostic);

    let chosenChallenge = null;
    if (levelChallenges.length > 0) {
      // Rotar entre los desafíos del nivel
      const unused = levelChallenges.filter(c => !this.challengeHistory.includes(c.id));
      chosenChallenge = unused.length > 0 ? unused[0] : levelChallenges[0];
    } else {
      // Si no hay de ese nivel exacto, tomar el reto más cercano no diagnóstico
      const nonDiag = allChallenges.filter(c => !c.isDiagnostic);
      chosenChallenge = nonDiag.length > 0 ? nonDiag[0] : allChallenges[0];
    }

    this.currentHintsRequested = 0;
    this.currentAttempts = 0;
    return chosenChallenge;
  }

  /**
   * Solicita una pista para el desafío actual sin castigos punitivos.
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
   * Evalúa la respuesta del estudiante, procesa el diagnóstico o el ajuste adaptativo
   * y genera retroalimentación formativa profunda.
   * @param {Object} challenge
   * @param {number} selectedOptionIndex
   * @returns {Object}
   */
  evaluateAnswer(challenge, selectedOptionIndex) {
    this.currentAttempts++;
    const isCorrect = selectedOptionIndex === challenge.correctIndex;
    const compId = challenge.competencyId;
    const progress = sessionState.getProgress(compId);
    const currentLevel = progress ? progress.currentLevel : 1;

    // Registrar en el historial de retos resueltos si es correcto
    if (isCorrect && !this.challengeHistory.includes(challenge.id)) {
      this.challengeHistory.push(challenge.id);
    }

    let diagnosticResult = null;
    // Si era un desafío diagnóstico, completar el diagnóstico inicial
    if (challenge.isDiagnostic && DiagnosticManager.needsDiagnostic(compId)) {
      diagnosticResult = DiagnosticManager.completeDiagnostic(
        compId,
        isCorrect,
        this.currentAttempts,
        this.currentHintsRequested
      );
    }

    // Evaluar desempeño mediante el algoritmo de dificultad adaptativa
    const adaptiveResult = adaptiveEngine.evaluatePerformance({
      competencyId: compId,
      currentLevel,
      isCorrect,
      attempts: this.currentAttempts,
      hintsUsed: this.currentHintsRequested
    });

    // Actualizar nivel adaptativo en el progreso de la sesión
    if (progress && !challenge.isDiagnostic) {
      progress.currentLevel = adaptiveResult.nextLevel;
      progress.totalAttempts++;
      if (isCorrect) {
        progress.accuracy = Math.min(1, (progress.accuracy * (progress.totalAttempts - 1) + 1) / progress.totalAttempts);
      } else {
        progress.accuracy = Math.max(0, (progress.accuracy * (progress.totalAttempts - 1)) / progress.totalAttempts);
      }
    }

    return {
      isCorrect,
      isDiagnostic: challenge.isDiagnostic,
      diagnosticResult,
      adaptiveResult,
      currentLevel: progress ? progress.currentLevel : currentLevel,
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

  getCurrentLevel(competencyId = null) {
    const compId = competencyId || sessionState.getActiveCompetency();
    const progress = sessionState.getProgress(compId);
    return progress ? progress.currentLevel : 1;
  }
}

export const educationEngine = new EducationEngine();
