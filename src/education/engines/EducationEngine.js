import { ChallengeRepository } from '../repositories/ChallengeRepository.js';
import { sessionState } from '../../core/sessionState.js';
import { adaptiveEngine } from '../adaptive/AdaptiveEngine.js';
import { DiagnosticManager } from '../assessments/DiagnosticManager.js';
import { TransferAssessment } from '../assessments/TransferAssessment.js';
import { RetentionAssessment } from '../assessments/RetentionAssessment.js';
import { firestoreService } from '../../services/firebase/firestoreService.js';

/**
 * EducationEngine.js — Núcleo educativo desacoplado de Phaser 3.
 * Orquesta la evaluación diagnóstica, formativa adaptativa, de transferencia
 * y de retención temporal, calculando los 6 indicadores de aprendizaje real.
 */
export class EducationEngine {
  constructor() {
    this.currentHintsRequested = 0;
    this.currentAttempts = 0;
    this.challengeHistory = [];
  }

  /**
   * Obtiene el siguiente desafío para la competencia activa considerando:
   * 1. Diagnóstico inicial si no ha sido completado.
   * 2. Retención temporal si el intervalo de enfriamiento ha vencido.
   * 3. Transferencia si el estudiante demostró consistencia previa en el nivel.
   * 4. Desafíos formativos adaptados al nivel determinista actual.
   * @param {string} [competencyId]
   * @param {Object} [options]
   * @returns {Object|null}
   */
  getNextChallenge(competencyId = null, options = {}) {
    const compId = competencyId || sessionState.getActiveCompetency();
    const progress = sessionState.getProgress(compId);

    // 1. Diagnóstico inicial obligatorio si aún no se ha evaluado
    if (DiagnosticManager.needsDiagnostic(compId)) {
      const diagChallenge = DiagnosticManager.getDiagnosticChallenge(compId);
      if (diagChallenge) {
        this.resetTurnMetrics();
        return diagChallenge;
      }
    }

    // 2. Si se fuerza transferencia o retención (por ejemplo desde Terminal 2)
    if (options.forceTransfer) {
      const transChallenge = ChallengeRepository.getTransferChallenge(compId);
      if (transChallenge) {
        this.resetTurnMetrics();
        return transChallenge;
      }
    }

    if (options.forceRetention) {
      const retChallenge = ChallengeRepository.getRetentionChallenge(compId);
      if (retChallenge) {
        this.resetTurnMetrics();
        return retChallenge;
      }
    }

    // 3. Comprobar si corresponde una evaluación de retención temporal
    if (RetentionAssessment.isRetentionDue(compId, progress)) {
      const pendingItem = RetentionAssessment.getPendingRetentionItem(compId);
      const retChallenge = ChallengeRepository.getRetentionChallenge(compId, pendingItem ? pendingItem.skill : null);
      if (retChallenge) {
        this.resetTurnMetrics();
        return retChallenge;
      }
    }

    // 4. Comprobar si corresponde una evaluación de transferencia cognitiva
    if (TransferAssessment.isEligibleForTransfer(compId, progress)) {
      const transChallenge = ChallengeRepository.getTransferChallenge(compId);
      if (transChallenge) {
        this.resetTurnMetrics();
        return transChallenge;
      }
    }

    // 5. Desafío formativo adaptativo estándar
    const allChallenges = ChallengeRepository.getChallengesByCompetency(compId);
    if (allChallenges.length === 0) return null;

    const currentLevel = progress ? progress.currentLevel : 1;
    const levelChallenges = allChallenges.filter(c => c.difficulty === currentLevel && !c.isDiagnostic && !c.isTransfer && !c.isRetention);

    let chosenChallenge = null;
    if (levelChallenges.length > 0) {
      const unused = levelChallenges.filter(c => !this.challengeHistory.includes(c.id));
      chosenChallenge = unused.length > 0 ? unused[0] : levelChallenges[0];
    } else {
      const standardChallenges = allChallenges.filter(c => !c.isDiagnostic && !c.isTransfer && !c.isRetention);
      chosenChallenge = standardChallenges.length > 0 ? standardChallenges[0] : allChallenges[0];
    }

    this.resetTurnMetrics();
    return chosenChallenge;
  }

  /**
   * Obtiene un desafío aleatorio para eventos dinámicos (combate MatBot / ítems).
   * @param {string} [competencyId]
   * @param {number} [targetLevel]
   * @returns {Object|null}
   */
  getRandomChallenge(competencyId = null, targetLevel = null, excludeIds = null) {
    const compId = competencyId || sessionState.getActiveCompetency();
    const lvl = targetLevel || this.getCurrentLevel(compId);
    this.resetTurnMetrics();
    const excludes = excludeIds || this.challengeHistory;
    const challenge = ChallengeRepository.getRandomChallenge(compId, lvl, excludes);
    if (challenge && !this.challengeHistory.includes(challenge.id)) {
      this.challengeHistory.push(challenge.id);
    }
    return challenge;
  }

  /**
   * Obtiene un lote de desafíos únicos barajados para los enemigos del nivel,
   * garantizando preguntas y opciones de respuesta completamente diferentes entre sí.
   * @param {string} [competencyId]
   * @param {number} [targetLevel]
   * @param {number} [count=1]
   * @param {Array<string>|Set<string>} [excludeIds]
   * @returns {Array<Object>}
   */
  getUniqueCombatBatch(competencyId = null, targetLevel = null, count = 1, excludeIds = null) {
    const compId = competencyId || sessionState.getActiveCompetency();
    const lvl = targetLevel || this.getCurrentLevel(compId);
    const excludes = excludeIds || this.challengeHistory;
    return ChallengeRepository.getUniqueBatch(compId, lvl, count, excludes);
  }

  resetTurnMetrics() {
    this.currentHintsRequested = 0;
    this.currentAttempts = 0;
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
   * Evalúa la respuesta del estudiante en desafíos formativos, diagnósticos,
   * de transferencia o de retención, actualizando los 6 indicadores pedagógicos.
   * @param {Object} challenge
   * @param {number} selectedOptionIndex
   * @param {number} [timeSeconds]
   * @returns {Object}
   */
  evaluateAnswer(challenge, selectedOptionIndex, timeSeconds = 0) {
    this.currentAttempts++;
    const isCorrect = selectedOptionIndex === challenge.correctIndex;
    const compId = challenge.competencyId;
    const progress = sessionState.getProgress(compId);
    const currentLevel = progress ? progress.currentLevel : 1;
    const isAutonomous = this.currentAttempts === 1 && this.currentHintsRequested === 0;

    // Registrar en el historial de resueltos si fue correcto
    if (isCorrect && !this.challengeHistory.includes(challenge.id)) {
      this.challengeHistory.push(challenge.id);
    }

    // Inicializar estructura de métricas de los 6 indicadores si no existe
    this.ensureProgressMetrics(progress);

    // Actualizar racha consecutiva de aciertos en la competencia
    if (isCorrect) {
      progress.consecutiveCorrect = (progress.consecutiveCorrect || 0) + 1;
    } else {
      progress.consecutiveCorrect = 0;
    }

    // 1. Manejo de Diagnóstico
    let diagnosticResult = null;
    if (challenge.isDiagnostic && DiagnosticManager.needsDiagnostic(compId)) {
      diagnosticResult = DiagnosticManager.completeDiagnostic(
        compId,
        isCorrect,
        this.currentAttempts,
        this.currentHintsRequested
      );
    }

    // 2. Manejo de Transferencia
    let transferResult = null;
    if (challenge.isTransfer) {
      transferResult = TransferAssessment.evaluateTransfer(
        compId,
        challenge,
        isCorrect,
        this.currentAttempts,
        this.currentHintsRequested
      );
      // Si la transferencia fue exitosa, programar retención temporal posterior (cooling de 60s)
      if (isCorrect) {
        RetentionAssessment.scheduleRetention(compId, challenge.skillId, challenge.id, 60 * 1000);
      }
    }

    // 3. Manejo de Retención Temporal
    let retentionResult = null;
    if (challenge.isRetention) {
      retentionResult = RetentionAssessment.evaluateRetention(
        compId,
        challenge,
        isCorrect,
        this.currentAttempts,
        this.currentHintsRequested
      );
    }

    // 4. Adaptación de dificultad (solo para desafíos formativos y de combate)
    let adaptiveResult = null;
    if (!challenge.isDiagnostic && !challenge.isTransfer && !challenge.isRetention) {
      adaptiveResult = adaptiveEngine.evaluatePerformance({
        competencyId: compId,
        currentLevel,
        isCorrect,
        attempts: this.currentAttempts,
        hintsUsed: this.currentHintsRequested,
        timeSeconds
      });

      if (progress) {
        progress.currentLevel = adaptiveResult.nextLevel;
      }

      // Si resuelve de forma autónoma dos formativos seguidos, marcar para transferencia
      if (isCorrect && progress.consecutiveCorrect >= 2) {
        progress.transferPending = true;
      }
    }

    // 5. Actualizar los 6 indicadores de aprendizaje
    this.updateSixIndicators(progress, isCorrect, isAutonomous, challenge);

    // 6. Persistir progreso de la competencia y telemetría del intento en Firestore
    sessionState.saveProgress(compId);
    firestoreService.logChallengeAttempt({
      challengeId: challenge.id,
      competencyId: compId,
      skillId: challenge.skillId,
      isCorrect,
      selectedOptionIndex,
      attempts: this.currentAttempts,
      hintsUsed: this.currentHintsRequested,
      timeSeconds: typeof timeSeconds === 'number' ? Number(timeSeconds.toFixed(1)) : 0,
      isDiagnostic: !!challenge.isDiagnostic,
      isTransfer: !!challenge.isTransfer,
      isRetention: !!challenge.isRetention,
      currentLevel: progress ? progress.currentLevel : currentLevel
    });

    return {
      isCorrect,
      isDiagnostic: !!challenge.isDiagnostic,
      isTransfer: !!challenge.isTransfer,
      isRetention: !!challenge.isRetention,
      diagnosticResult,
      transferResult,
      retentionResult,
      adaptiveResult,
      currentLevel: progress ? progress.currentLevel : currentLevel,
      attempts: this.currentAttempts,
      hintsUsed: this.currentHintsRequested,
      timeSeconds: typeof timeSeconds === 'number' ? Number(timeSeconds.toFixed(1)) : 0,
      selectedOption: challenge.options[selectedOptionIndex],
      expectedOption: challenge.options[challenge.correctIndex],
      explanation: challenge.explanation,
      conceptNeeded: challenge.conceptNeeded,
      strategy: challenge.strategy,
      title: isCorrect
        ? (challenge.isTransfer
            ? '¡TRANSFERENCIA DE CONOCIMIENTO EXITOSA!'
            : (challenge.isRetention
                ? '¡EVALUACIÓN DE RETENCIÓN CONSOLIDADA!'
                : '¡DESAFÍO COMPLETADO CON ÉXITO!'))
        : (challenge.isTransfer
            ? 'RETROALIMENTACIÓN DE TRANSFERENCIA COGNITIVA'
            : (challenge.isRetention
                ? 'ALERTA DE DESVANECIMIENTO Y RETENCIÓN TEMPORAL'
                : 'OBSERVACIÓN PEDAGÓGICA Y RETROALIMENTACIÓN'))
    };
  }

  ensureProgressMetrics(progress) {
    if (!progress) return;
    if (!progress.metrics) {
      progress.metrics = {
        // Indicador 1: Participación
        participation: { totalAttempts: 0, completedChallenges: 0, sessions: 1 },
        // Indicador 2: Rendimiento
        performance: { totalAnswers: 0, correctAnswers: 0, accuracy: 0 },
        // Indicador 3: Autonomía
        autonomy: { autonomousSolves: 0, autonomyRate: 0 },
        // Indicador 4: Dominio
        mastery: { currentLevel: 1, levelStability: 100 },
        // Indicador 5: Transferencia
        transfer: { evaluated: 0, successful: 0, rate: 0 },
        // Indicador 6: Retención
        retention: { evaluated: 0, retained: 0, index: 0 }
      };
    }
  }

  updateSixIndicators(progress, isCorrect, isAutonomous, challenge) {
    if (!progress || !progress.metrics) return;
    const m = progress.metrics;

    // 1. Participación
    m.participation.totalAttempts++;
    if (isCorrect) m.participation.completedChallenges++;

    // 2. Rendimiento
    m.performance.totalAnswers++;
    if (isCorrect) m.performance.correctAnswers++;
    m.performance.accuracy = Math.round((m.performance.correctAnswers / m.performance.totalAnswers) * 100);

    // 3. Autonomía
    if (isCorrect && isAutonomous) m.autonomy.autonomousSolves++;
    m.autonomy.autonomyRate = Math.round((m.autonomy.autonomousSolves / m.performance.totalAnswers) * 100);

    // 4. Dominio
    m.mastery.currentLevel = progress.currentLevel || 1;

    // 5. Transferencia
    if (challenge.isTransfer) {
      m.transfer.evaluated++;
      if (isCorrect) m.transfer.successful++;
      m.transfer.rate = Math.round((m.transfer.successful / m.transfer.evaluated) * 100);
    }

    // 6. Retención
    if (challenge.isRetention) {
      m.retention.evaluated++;
      if (isCorrect) m.retention.retained++;
      m.retention.index = Math.round((m.retention.retained / m.retention.evaluated) * 100);
    }
  }

  getCurrentLevel(competencyId = null) {
    const compId = competencyId || sessionState.getActiveCompetency();
    const progress = sessionState.getProgress(compId);
    return progress ? progress.currentLevel : 1;
  }

  /**
   * Retorna los 6 indicadores de aprendizaje de la competencia solicitada.
   * @param {string} [competencyId]
   * @returns {Object}
   */
  getLearningMetrics(competencyId = null) {
    const compId = competencyId || sessionState.getActiveCompetency();
    const progress = sessionState.getProgress(compId);
    if (!progress) return null;
    this.ensureProgressMetrics(progress);
    return progress.metrics;
  }
}

export const educationEngine = new EducationEngine();
