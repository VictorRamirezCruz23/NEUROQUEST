import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import { authService } from './authService.js';

/**
 * firestoreService.js — Servicio modular de persistencia y telemetría en Cloud Firestore.
 * Sincroniza el perfil del estudiante, su progreso adaptativo independiente por competencia
 * y el historial de intentos, con fallback automático en localStorage ante caídas de red.
 */
class FirestoreService {
  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncOfflineQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  /**
   * Sincroniza o crea el documento raíz del usuario en Firestore.
   * @param {Object} user
   * @returns {Promise<boolean>}
   */
  async syncUserProfile(user) {
    if (!user) return false;
    const uid = user.uid;

    const profileData = {
      uid,
      displayName: user.displayName || (user.isAnonymous ? `Cadete #${uid.slice(0, 5).toUpperCase()}` : user.email),
      email: user.email || null,
      isAnonymous: !!user.isAnonymous,
      lastLoginAt: new Date().toISOString(),
      updatedAt: serverTimestamp()
    };

    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, profileData, { merge: true });
      console.log(`[FirestoreService] Perfil sincronizado para UID: ${uid}`);
      return true;
    } catch (err) {
      console.warn('[FirestoreService] No se pudo sincronizar perfil remoto, guardando localmente:', err.message);
      localStorage.setItem(`neuroquest_profile_${uid}`, JSON.stringify(profileData));
      return false;
    }
  }

  /**
   * Guarda o actualiza el progreso curricular de una competencia específica.
   * @param {string} competencyId
   * @param {Object} progress
   * @returns {Promise<boolean>}
   */
  async saveCompetencyProgress(competencyId, progress) {
    const uid = authService.getUid();
    const payload = {
      competencyId,
      currentLevel: progress.currentLevel || 1,
      diagnosticCompleted: !!progress.diagnosticCompleted,
      diagnosticScore: progress.diagnosticScore || null,
      consecutiveCorrect: progress.consecutiveCorrect || 0,
      metrics: progress.metrics || null,
      transferMetrics: progress.transferMetrics || null,
      retentionSchedule: progress.retentionSchedule || [],
      updatedAt: new Date().toISOString()
    };

    // Respaldo local inmediato
    localStorage.setItem(`neuroquest_progress_${uid}_${competencyId}`, JSON.stringify(payload));

    if (!this.isOnline || uid.startsWith('guest_offline')) {
      this.enqueueOfflineSave(uid, competencyId, payload);
      return true;
    }

    try {
      const progressRef = doc(db, 'users', uid, 'progress', competencyId);
      await setDoc(progressRef, { ...payload, serverTimestamp: serverTimestamp() }, { merge: true });
      return true;
    } catch (err) {
      console.warn(`[FirestoreService] Error al guardar progreso remoto de ${competencyId}:`, err.message);
      this.enqueueOfflineSave(uid, competencyId, payload);
      return false;
    }
  }

  /**
   * Carga el progreso de una competencia desde Firestore (o desde caché local).
   * @param {string} competencyId
   * @returns {Promise<Object|null>}
   */
  async loadCompetencyProgress(competencyId) {
    const uid = authService.getUid();
    const localData = localStorage.getItem(`neuroquest_progress_${uid}_${competencyId}`);
    const parsedLocal = localData ? JSON.parse(localData) : null;

    if (!this.isOnline || uid.startsWith('guest_offline')) {
      return parsedLocal;
    }

    try {
      const progressRef = doc(db, 'users', uid, 'progress', competencyId);
      const snap = await getDoc(progressRef);
      if (snap.exists()) {
        const remoteData = snap.data();
        localStorage.setItem(`neuroquest_progress_${uid}_${competencyId}`, JSON.stringify(remoteData));
        return remoteData;
      }
      return parsedLocal;
    } catch (err) {
      console.warn(`[FirestoreService] Error al cargar progreso de ${competencyId}, usando caché local:`, err.message);
      return parsedLocal;
    }
  }

  /**
   * Registra un evento de telemetría de intento pedagógico.
   * @param {Object} attemptData
   * @returns {Promise<boolean>}
   */
  async logChallengeAttempt(attemptData) {
    const uid = authService.getUid();
    const logPayload = {
      uid,
      ...attemptData,
      timestamp: new Date().toISOString()
    };

    // Guardar en log local acumulativo (máximo 50 entradas)
    try {
      const localLog = JSON.parse(localStorage.getItem(`neuroquest_attempts_${uid}`) || '[]');
      localLog.unshift(logPayload);
      if (localLog.length > 50) localLog.pop();
      localStorage.setItem(`neuroquest_attempts_${uid}`, JSON.stringify(localLog));
    } catch (e) {
      // Ignorar quota exceeded
    }

    if (!this.isOnline || uid.startsWith('guest_offline')) {
      return true;
    }

    try {
      const attemptsCol = collection(db, 'users', uid, 'attempts');
      await addDoc(attemptsCol, { ...logPayload, serverTimestamp: serverTimestamp() });
      return true;
    } catch (err) {
      console.warn('[FirestoreService] Error registrando intento remoto:', err.message);
      return false;
    }
  }

  enqueueOfflineSave(uid, competencyId, payload) {
    try {
      const queue = JSON.parse(localStorage.getItem('neuroquest_offline_queue') || '[]');
      queue.push({ uid, competencyId, payload, timestamp: Date.now() });
      localStorage.setItem('neuroquest_offline_queue', JSON.stringify(queue));
    } catch (e) {
      console.error('[FirestoreService] Error en cola offline:', e);
    }
  }

  async syncOfflineQueue() {
    try {
      const queue = JSON.parse(localStorage.getItem('neuroquest_offline_queue') || '[]');
      if (queue.length === 0) return;

      console.log(`[FirestoreService] Sincronizando ${queue.length} elementos pendientes de la cola offline...`);
      const pending = [];

      for (const item of queue) {
        try {
          const ref = doc(db, 'users', item.uid, 'progress', item.competencyId);
          await setDoc(ref, { ...item.payload, serverTimestamp: serverTimestamp() }, { merge: true });
        } catch (e) {
          pending.push(item);
        }
      }

      localStorage.setItem('neuroquest_offline_queue', JSON.stringify(pending));
      if (pending.length === 0) {
        console.log('[FirestoreService] Sincronización offline completada con éxito.');
      }
    } catch (err) {
      console.error('[FirestoreService] Error procesando cola offline:', err);
    }
  }
}

export const firestoreService = new FirestoreService();
