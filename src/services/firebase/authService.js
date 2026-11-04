import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebaseConfig.js';

/**
 * authService.js — Servicio modular de autenticación para NEUROQUEST.
 * Soporta registro y acceso con cuenta escolar, Google Auth y persistencia
 * en almacenamiento local para recordar sesiones activas.
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

      if (user && !user.isAnonymous) {
        this.saveLocalSession(user);
      }

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
   * Inicia sesión con Google Popup.
   * @returns {Promise<Object>}
   */
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      this.saveLocalSession(cred.user);
      return { success: true, user: cred.user };
    } catch (err) {
      console.error('[AuthService] Error al iniciar sesión con Google:', err);
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
      this.saveLocalSession(cred.user);
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
      this.saveLocalSession(cred.user);
      return { success: true, user: cred.user };
    } catch (err) {
      console.error('[AuthService] Error al registrar usuario:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Inicia sesión anónima de contingencia.
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
   * Cierra la sesión activa y borra el indicador local.
   * @returns {Promise<Object>}
   */
  async logout() {
    try {
      this.clearLocalSession();
      await signOut(auth);
      return { success: true };
    } catch (err) {
      console.error('[AuthService] Error al cerrar sesión:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Guarda de forma local que el usuario ya inició sesión permanentemente.
   * @param {Object} user
   */
  saveLocalSession(user) {
    if (!user || user.isAnonymous) return;
    try {
      localStorage.setItem('neuroquest_logged_in', 'true');
      localStorage.setItem('neuroquest_user_uid', user.uid);
      localStorage.setItem('neuroquest_user_email', user.email || '');
      localStorage.setItem('neuroquest_user_name', user.displayName || user.email?.split('@')[0] || 'Cadete');
    } catch (e) {
      console.warn('[AuthService] No se pudo guardar sesión local:', e);
    }
  }

  /**
   * Limpia el almacenamiento local de sesión.
   */
  clearLocalSession() {
    try {
      localStorage.removeItem('neuroquest_logged_in');
      localStorage.removeItem('neuroquest_user_uid');
      localStorage.removeItem('neuroquest_user_email');
      localStorage.removeItem('neuroquest_user_name');
    } catch (e) {
      console.warn('[AuthService] Error al limpiar sesión local:', e);
    }
  }

  /**
   * Comprueba si existe registro local de que el usuario ya inició sesión previamente.
   * @returns {boolean}
   */
  isUserLoggedInLocally() {
    try {
      return localStorage.getItem('neuroquest_logged_in') === 'true';
    } catch (e) {
      return false;
    }
  }

  /**
   * Comprueba si el usuario actual es una cuenta permanente (no anónima).
   * @returns {boolean}
   */
  isPermanentUser() {
    return !!(this.currentUser && !this.currentUser.isAnonymous);
  }

  /**
   * Retorna el usuario autenticado actualmente.
   * @returns {Object|null}
   */
  getUser() {
    return this.currentUser;
  }

  /**
   * Retorna el UID del usuario o el guardado localmente.
   * @returns {string}
   */
  getUid() {
    if (this.currentUser) return this.currentUser.uid;
    try {
      return localStorage.getItem('neuroquest_user_uid') || 'guest_offline';
    } catch (e) {
      return 'guest_offline';
    }
  }

  /**
   * Retorna el nombre visible del cadete.
   * @returns {string}
   */
  getDisplayName() {
    if (this.currentUser && !this.currentUser.isAnonymous) {
      return this.currentUser.displayName || this.currentUser.email.split('@')[0];
    }
    try {
      const savedName = localStorage.getItem('neuroquest_user_name');
      if (savedName) return savedName;
    } catch (e) {}

    if (this.currentUser && this.currentUser.isAnonymous) {
      return `Cadete #${this.currentUser.uid.slice(0, 5).toUpperCase()}`;
    }
    return 'Cadete no registrado';
  }
}

export const authService = new AuthService();
