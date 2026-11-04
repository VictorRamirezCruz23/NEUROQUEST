import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebaseConfig.js';

/**
 * tutorService.js — Servicio cliente del Tutor Pedagógico Inteligente (E.V.A.).
 * Invoca de forma segura las Cloud Functions de Firebase sin exponer claves en el navegador,
 * con control de latencia, caché de consultas y modo de contingencia offline.
 */
class TutorService {
  constructor() {
    this.cache = new Map();
    this.isRequestPending = false;
  }

  /**
   * Solicita a E.V.A. (Gemini) una explicación pedagógica profunda de un error.
   * @param {Object} params
   * @param {string} params.challengeId
   * @param {string} params.competencyName
   * @param {string} params.skillName
   * @param {string} params.context
   * @param {string} params.statement
   * @param {string} params.selectedOption
   * @param {string} params.conceptNeeded
   * @param {string} [params.localExplanation] Explicación local de respaldo
   * @returns {Promise<Object>}
   */
  async requestErrorExplanation(params) {
    const cacheKey = `error_${params.challengeId}_${params.selectedOption}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.isRequestPending) {
      return {
        success: true,
        isFallback: true,
        tutorName: 'E.V.A. (Modo Local)',
        explanation: params.localExplanation || 'Revisa con detenimiento las premisas del desafío.'
      };
    }

    this.isRequestPending = true;

    try {
      const explainErrorFn = httpsCallable(functions, 'explainError');
      const response = await explainErrorFn({
        challengeId: params.challengeId,
        competencyName: params.competencyName,
        skillName: params.skillName,
        context: params.context,
        statement: params.statement,
        selectedOption: params.selectedOption,
        conceptNeeded: params.conceptNeeded
      });

      const data = response.data;
      this.cache.set(cacheKey, data);
      return data;
    } catch (err) {
      console.warn('[TutorService] Cloud Function no disponible o sin conexión. Usando respaldo pedagógico local:', err.message);
      const fallbackResult = {
        success: true,
        isFallback: true,
        tutorName: 'E.V.A. • Terminal de Contingencia',
        explanation: params.localExplanation
          ? `Análisis de E.V.A.: ${params.localExplanation}`
          : `La opción elegida presenta inconsistencias con el subsistema. Concentra tu atención en: ${params.conceptNeeded || 'el concepto clave'}.`
      };
      this.cache.set(cacheKey, fallbackResult);
      return fallbackResult;
    } finally {
      this.isRequestPending = false;
    }
  }

  /**
   * Solicita a E.V.A. una pista socrática progresiva.
   * @param {Object} params
   * @param {string} params.challengeId
   * @param {string} params.statement
   * @param {string} params.skillName
   * @param {number} params.attempts
   * @param {number} params.hintsUsedCount
   * @param {string} params.conceptNeeded
   * @param {string} [params.localHint] Pista local de respaldo
   * @returns {Promise<string>}
   */
  async requestProgressiveHint(params) {
    const cacheKey = `hint_${params.challengeId}_${params.hintsUsedCount}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const generateHintFn = httpsCallable(functions, 'generateHint');
      const response = await generateHintFn({
        statement: params.statement,
        skillName: params.skillName,
        attempts: params.attempts,
        hintsUsedCount: params.hintsUsedCount,
        conceptNeeded: params.conceptNeeded
      });

      const hintText = response.data?.hint || params.localHint || 'Observa los patrones con atención.';
      this.cache.set(cacheKey, hintText);
      return hintText;
    } catch (err) {
      console.warn('[TutorService] Usando pista local de respaldo:', err.message);
      return params.localHint || 'Examina la relación entre los datos suministrados en el enunciado.';
    }
  }
}

export const tutorService = new TutorService();
