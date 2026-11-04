import { sessionState, COMPETENCY_IDS, COMPETENCY_METADATA } from '../core/sessionState.js';
import { educationEngine } from '../education/engines/EducationEngine.js';
import { DIFFICULTY_LABELS } from '../education/adaptive/AdaptiveEngine.js';

/**
 * LearningAnalytics.js — Motor de análisis pedagógico y métricas reales (no infladas).
 * Sintetiza los 6 indicadores formativos de NEUROQUEST garantizando que no se utilice
 * acumulación artificial de puntos ni experiencia vacía como indicador de aprendizaje.
 */
export class LearningAnalytics {
  /**
   * Obtiene el reporte detallado de una competencia específica.
   * @param {string} competencyId
   * @returns {Object}
   */
  static getCompetencyReport(competencyId) {
    const meta = COMPETENCY_METADATA[competencyId] || COMPETENCY_METADATA[COMPETENCY_IDS.LOGIC_MATH];
    const progress = sessionState.getProgress(competencyId) || {};
    const metrics = educationEngine.getLearningMetrics(competencyId) || {};

    const participation = metrics.participation || { totalAttempts: 0, completedChallenges: 0, sessions: 1 };
    const performance = metrics.performance || { totalAnswers: 0, correctAnswers: 0, accuracy: 0 };
    const autonomy = metrics.autonomy || { autonomousSolves: 0, autonomyRate: 0 };
    const masteryLevel = progress.currentLevel || 1;
    const transfer = metrics.transfer || { evaluated: 0, successful: 0, rate: 0 };
    const retention = metrics.retention || { evaluated: 0, retained: 0, index: 0 };

    // Determinar fortalezas y necesidades de refuerzo reales
    const recommendations = [];
    if (!progress.diagnosticCompleted) {
      recommendations.push('Pendiente: Completar calibración diagnóstica inicial en la Terminal 1.');
    } else {
      if (autonomy.autonomyRate < 50 && performance.totalAnswers > 2) {
        recommendations.push('Autonomía: Fomentar resolución sin pistas previas para consolidar independencia.');
      }
      if (transfer.evaluated === 0 && performance.correctAnswers >= 2) {
        recommendations.push('Transferencia: Visitar la Terminal 2 para aplicar conceptos en un nuevo contexto.');
      } else if (transfer.rate < 60 && transfer.evaluated > 0) {
        recommendations.push('Transferencia: Reforzar la extrapolación de principios antes de subir de nivel.');
      }
      if (retention.evaluated === 0 && progress.consecutiveCorrect >= 2) {
        recommendations.push('Retención: Se programará un chequeo temporal de persistencia de conocimientos.');
      } else if (retention.index < 70 && retention.evaluated > 0) {
        recommendations.push('Retención: Se detectó desvanecimiento temporal; repasar fundamentos del sector.');
      }
      if (recommendations.length === 0) {
        recommendations.push('Desempeño consistente: Se observa asimilación autónoma y transferencia efectiva.');
      }
    }

    return {
      competencyId,
      meta,
      diagnosticCompleted: !!progress.diagnosticCompleted,
      baselineLevel: progress.diagnosticScore ? progress.diagnosticScore.baselineLevel : null,
      currentLevel: masteryLevel,
      levelLabel: DIFFICULTY_LABELS[masteryLevel] || `Nivel ${masteryLevel}`,
      indicators: {
        participation: {
          label: 'Participación',
          attempts: participation.totalAttempts,
          completed: participation.completedChallenges,
          sessions: participation.sessions,
          summary: `${participation.completedChallenges} misiones completadas en ${participation.totalAttempts} intentos`
        },
        performance: {
          label: 'Rendimiento Real',
          rate: performance.accuracy,
          correct: performance.correctAnswers,
          total: performance.totalAnswers,
          summary: `${performance.accuracy}% de precisión objetiva (${performance.correctAnswers}/${performance.totalAnswers})`
        },
        autonomy: {
          label: 'Autonomía Cognitiva',
          rate: autonomy.autonomyRate,
          autonomousCount: autonomy.autonomousSolves,
          summary: `${autonomy.autonomyRate}% de resoluciones independientes sin pistas`
        },
        mastery: {
          label: 'Dominio Conceptual',
          level: masteryLevel,
          levelName: DIFFICULTY_LABELS[masteryLevel],
          consecutiveCorrect: progress.consecutiveCorrect || 0,
          summary: `Nivel adaptativo consolidado: ${DIFFICULTY_LABELS[masteryLevel]}`
        },
        transfer: {
          label: 'Transferencia Cognitiva',
          rate: transfer.rate,
          evaluated: transfer.evaluated,
          successful: transfer.successful,
          summary: transfer.evaluated > 0
            ? `${transfer.rate}% de éxito en dominios nuevos (${transfer.successful}/${transfer.evaluated})`
            : 'Sin evaluaciones de transferencia realizadas aún'
        },
        retention: {
          label: 'Retención Temporal',
          rate: retention.index,
          evaluated: retention.evaluated,
          retained: retention.retained,
          summary: retention.evaluated > 0
            ? `${retention.index}% de persistencia a largo plazo (${retention.retained}/${retention.evaluated})`
            : 'Sin pruebas de retención temporal completadas aún'
        }
      },
      recommendations
    };
  }

  /**
   * Obtiene la síntesis global de todas las competencias.
   * @returns {Object}
   */
  static getGlobalSummary() {
    const ids = Object.values(COMPETENCY_IDS);
    const reports = ids.map(id => this.getCompetencyReport(id));

    let totalAttempts = 0;
    let totalCompleted = 0;
    let totalAnswers = 0;
    let totalCorrect = 0;
    let totalAutonomous = 0;
    let totalTransferEvaluated = 0;
    let totalTransferSuccess = 0;
    let totalRetentionEvaluated = 0;
    let totalRetentionSuccess = 0;

    reports.forEach(r => {
      totalAttempts += r.indicators.participation.attempts;
      totalCompleted += r.indicators.participation.completed;
      totalAnswers += r.indicators.performance.total;
      totalCorrect += r.indicators.performance.correct;
      totalAutonomous += r.indicators.autonomy.autonomousCount;
      totalTransferEvaluated += r.indicators.transfer.evaluated;
      totalTransferSuccess += r.indicators.transfer.successful;
      totalRetentionEvaluated += r.indicators.retention.evaluated;
      totalRetentionSuccess += r.indicators.retention.retained;
    });

    const globalAccuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    const globalAutonomy = totalAnswers > 0 ? Math.round((totalAutonomous / totalAnswers) * 100) : 0;
    const globalTransfer = totalTransferEvaluated > 0 ? Math.round((totalTransferSuccess / totalTransferEvaluated) * 100) : 0;
    const globalRetention = totalRetentionEvaluated > 0 ? Math.round((totalRetentionSuccess / totalRetentionEvaluated) * 100) : 0;

    return {
      totalCompetencies: ids.length,
      reports,
      totals: {
        attempts: totalAttempts,
        completed: totalCompleted,
        globalAccuracy,
        globalAutonomy,
        globalTransfer,
        globalRetention
      }
    };
  }
}
