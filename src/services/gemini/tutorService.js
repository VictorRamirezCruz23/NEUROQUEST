import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebaseConfig.js';
import { educationEngine } from '../../education/engines/EducationEngine.js';
import { ChallengeRepository } from '../../education/repositories/ChallengeRepository.js';

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

  /**
   * Solicita a E.V.A. (Gemini Backend) la generación dinámica de un desafío de combate táctico contra un MatBot.
   * Si hay latencia alta o falta de conexión, recurre como respaldo al nivel correspondiente en educationEngine / ChallengeRepository.
   * @param {Object} playerParams
   * @param {string} playerParams.competencyId
   * @param {string} [playerParams.competencyName]
   * @param {number} [playerParams.currentLevel]
   * @param {number} [playerParams.accuracy]
   * @param {number} [playerParams.avgResponseTime]
   * @param {Array<string>} [playerParams.recentSkills]
   * @param {Array<string>} [playerParams.previousStatements]
   * @returns {Promise<Object>} Desafío listo para el ChallengeModal
   */
  async requestDynamicCombatChallenge(playerParams) {
    const compId = playerParams?.competencyId || 'logic_math';
    const targetLevel = playerParams?.currentLevel || 1;

    const getFallback = () => {
      return educationEngine.getRandomChallenge(compId, targetLevel)
        || ChallengeRepository.getRandomChallenge(compId, targetLevel)
        || educationEngine.getRandomChallenge();
    };

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      console.warn('[TutorService] Entorno offline: usando desafío de respaldo para combate.');
      return getFallback();
    }

    if (!functions) {
      console.warn('[TutorService] Firebase Functions no disponible: usando desafío de respaldo.');
      return getFallback();
    }

    try {
      const generateCombatFn = httpsCallable(functions, 'generateCombatChallenge');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_COMBAT_GENERATION')), 3000)
      );

      const callPromise = generateCombatFn({
        competencyId: compId,
        competencyName: playerParams?.competencyName || compId,
        currentLevel: targetLevel,
        accuracy: playerParams?.accuracy || 0,
        avgResponseTime: playerParams?.avgResponseTime || 12,
        recentSkills: playerParams?.recentSkills || [],
        previousStatements: playerParams?.previousStatements || []
      });

      const response = await Promise.race([callPromise, timeoutPromise]);
      const data = response?.data;

      if (data && data.success && data.challenge) {
        const validated = this.validateCombatChallenge(data.challenge, compId, targetLevel);
        if (validated) {
          return validated;
        }
      }

      console.warn('[TutorService] Respuesta de combate inválida de IA, activando respaldo.');
      return getFallback();
    } catch (err) {
      console.warn('[TutorService] Fallo al generar combate con IA, usando respaldo:', err.message);
      return getFallback();
    }
  }

  /**
   * Pre-carga un lote de desafíos dinámicos de combate para los enemigos del nivel.
   * Si la llamada a Gemini falla o está offline, obtiene desafíos únicos del banco local.
   * @param {Object} playerParams
   * @param {number} count Cantidad de enemigos a aprovisionar
   * @returns {Promise<Array<Object>>}
   */
  async preloadEnemyChallenges(playerParams, count = 3) {
    const compId = playerParams?.competencyId || 'logic_math';
    const targetLevel = playerParams?.currentLevel || 1;
    const safeCount = Math.max(1, Math.min(10, parseInt(count, 10) || 1));

    const getLocalBatch = () => {
      const excludeIds = new Set([
        ...(playerParams?.previousStatements || []),
        ...(playerParams?.usedChallengeIds || []),
        ...(educationEngine.challengeHistory || [])
      ]);
      return ChallengeRepository.getUniqueBatch(compId, targetLevel, safeCount, excludeIds);
    };

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      console.warn('[TutorService] Entorno offline: precargando lote desde banco local.');
      return getLocalBatch();
    }

    if (!functions) {
      console.warn('[TutorService] Firebase Functions no disponible: precargando desde banco local.');
      return getLocalBatch();
    }

    try {
      const generateCombatFn = httpsCallable(functions, 'generateCombatChallenge');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_COMBAT_PRELOAD')), 4000)
      );

      const callPromise = generateCombatFn({
        competencyId: compId,
        competencyName: playerParams?.competencyName || compId,
        currentLevel: targetLevel,
        accuracy: playerParams?.accuracy || 0,
        avgResponseTime: playerParams?.avgResponseTime || 12,
        recentSkills: playerParams?.recentSkills || [],
        previousStatements: playerParams?.previousStatements || [],
        usedChallengeIds: playerParams?.usedChallengeIds || educationEngine.challengeHistory || [],
        count: safeCount
      });

      const response = await Promise.race([callPromise, timeoutPromise]);
      const data = response?.data;

      if (data && data.success && Array.isArray(data.challenges) && data.challenges.length > 0) {
        const validatedList = data.challenges
          .map(c => this.validateCombatChallenge(c, compId, targetLevel))
          .filter(Boolean);

        if (validatedList.length > 0) {
          const uniqueBatch = [];
          const seen = new Set([
            ...(playerParams?.previousStatements || []),
            ...(playerParams?.usedChallengeIds || []),
            ...(educationEngine.challengeHistory || [])
          ]);

          for (const item of validatedList) {
            if (!seen.has(item.id) && !seen.has(item.statement)) {
              seen.add(item.id);
              seen.add(item.statement);
              uniqueBatch.push(item);
            }
          }

          if (uniqueBatch.length < safeCount) {
            const needed = safeCount - uniqueBatch.length;
            const extras = ChallengeRepository.getUniqueBatch(compId, targetLevel, needed, seen);
            uniqueBatch.push(...extras);
          }

          return uniqueBatch;
        }
      }

      console.warn('[TutorService] Respuesta de lote de IA vacía o inválida, usando banco local.');
      return getLocalBatch();
    } catch (err) {
      console.warn('[TutorService] Error en pre-carga de lote con IA, usando banco local:', err.message);
      return getLocalBatch();
    }
  }

  /**
   * Valida en cliente el contrato del desafío de combate.
   * @param {Object} c
   * @param {string} expectedCompetencyId
   * @param {number} expectedLevel
   * @returns {Object|null}
   */
  validateCombatChallenge(c, expectedCompetencyId, expectedLevel = 1) {
    if (!c || typeof c !== 'object') return null;
    if (!c.statement || typeof c.statement !== 'string' || c.statement.trim().length < 5) return null;
    if (!Array.isArray(c.options) || c.options.length !== 4) return null;
    if (!c.options.every(opt => typeof opt === 'string' && opt.trim().length > 0)) return null;
    if (!Number.isInteger(c.correctIndex) || c.correctIndex < 0 || c.correctIndex > 3) return null;

    const diff = Number.isInteger(c.difficulty)
      ? Math.max(1, Math.min(5, c.difficulty))
      : Math.max(1, Math.min(5, expectedLevel));

    const hints = Array.isArray(c.hints) && c.hints.length >= 2
      ? [String(c.hints[0]).trim(), String(c.hints[1]).trim()]
      : ['Pista 1: Analiza los patrones del subsistema.', 'Pista 2: Desarrolla el cálculo paso a paso.'];

    return {
      id: c.id || `combat_ai_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      competencyId: expectedCompetencyId,
      skillId: c.skillId || 'tactical_reasoning',
      skillName: c.skillName || 'Razonamiento Táctico de Combate',
      educationalObjective: c.educationalObjective || 'Resolver la situación de combate mediante análisis conceptual.',
      difficulty: diff,
      context: c.context || 'Un MatBot hostil ha interceptado tu posición en NEUROCORE.',
      statement: c.statement.trim(),
      options: c.options.map(o => o.trim()),
      correctIndex: c.correctIndex,
      explanation: c.explanation || 'Opción confirmada por los sistemas de defensa de E.V.A.',
      conceptNeeded: c.conceptNeeded || 'Deducción lógica aplicada.',
      strategy: c.strategy || 'Evalúa las variables del subsistema antes de elegir.',
      hints,
      isDiagnostic: false,
      isTransfer: false,
      isRetention: false,
      isAIDynamic: true
    };
  }
}

export const tutorService = new TutorService();
