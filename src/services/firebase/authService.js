import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebaseConfig.js';

/**
 * authService.js — Servicio modular de autenticación para NEUROQUEST.
 * Proporciona soporte para juego inmediato como cadete anónimo o cuentas
 * con correo y contraseña para persistencia entre múltiples dispositivos.
 */
class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.initialized = false;

    // Escuchar cambios de estado de autenticación en tiempo real
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.initialized = true;
      console.log(`[AuthService] Estado de usuario: ${user ? (user.isAnonymous ? 'Cadete Anónimo' : user.email) : 'Desconectado'} [UID: ${user ? user.uid : 'N/A'}]`);
      this.notifyListeners(user);
    });
  }

  /**
   * Suscribe un callback a cambios de sesión.
   * @param {Function} callback
   * @returns {Function} Función para cancelar la suscripción
   */
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    if (this.initialized) {
      callback(this.currentUser);
    }
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(user) {
    this.listeners.forEach(cb => {
      try {
        cb(user);
      } catch (err) {
        console.error('[AuthService] Error en listener de sesión:', err);
      }
    });
  }

  /**
   * Inicia sesión anónima automática para acceso instantáneo del estudiante.
   * @returns {Promise<Object>}
   */
  async loginAnonymously() {
    try {
      const cred = await signInAnonymously(auth);
      return { success: true, user: cred.user };
    } catch (err) {
      console.error('[AuthService] Error al iniciar sesión anónima:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Inicia sesión con correo y contraseña.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>}
   */
  async loginWithEmail(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: cred.user };
    } catch (err) {
      console.error('[AuthService] Error al iniciar sesión:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Registra una nueva cuenta de estudiante con nombre de cadete.
   * @param {string} email
   * @param {string} password
   * @param {string} displayName
   * @returns {Promise<Object>}
   */
  async registerWithEmail(email, password, displayName = 'Cadete Neuroquest') {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      return { success: true, user: cred.user };
    } catch (err) {
      console.error('[AuthService] Error al registrar usuario:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Cierra la sesión activa.
   * @returns {Promise<Object>}
   */
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (err) {
      console.error('[AuthService] Error al cerrar sesión:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Retorna el usuario autenticado actualmente.
   * @returns {Object|null}
   */
  getUser() {
    return this.currentUser;
  }

  /**
   * Retorna el UID del usuario o 'guest' si no está inicializado.
   * @returns {string}
   */
  getUid() {
    return this.currentUser ? this.currentUser.uid : 'guest_offline';
  }

  /**
   * Retorna el nombre visible del cadete.
   * @returns {string}
   */
  getDisplayName() {
    if (!this.currentUser) return 'Cadete Invitado';
    if (this.currentUser.isAnonymous) return `Cadete #${this.currentUser.uid.slice(0, 5).toUpperCase()}`;
    return this.currentUser.displayName || this.currentUser.email.split('@')[0];
  }
}

export const authService = new AuthService();
