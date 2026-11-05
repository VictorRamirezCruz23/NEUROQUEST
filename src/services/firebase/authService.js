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
 * en almacenamiento local para recordar sesiones activas y contingencia
 * de acceso como Cadete Invitado sin bloqueos.
 */
class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.initialized = false;

    // Cargar sesión de invitado previa si existe
    if (this.isGuestMode()) {
      this.currentUser = this.getSavedGuestUser();
    }

    // Escuchar cambios de estado de autenticación en tiempo real
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = user;
        this.initialized = true;

        if (!user.isAnonymous) {
          this.saveLocalSession(user);
        } else {
          this.saveGuestSession(user);
        }

        console.log(`[AuthService] Estado de usuario: ${user.isAnonymous ? 'Cadete Anónimo' : user.email} [UID: ${user.uid}]`);
        this.notifyListeners(user);
      } else {
        // Si no hay sesión en Firebase pero se conservó sesión de invitado local
        if (this.isGuestMode()) {
          const guestUser = this.getSavedGuestUser();
          this.currentUser = guestUser;
          this.initialized = true;
          console.log(`[AuthService] Restaurando sesión de Cadete Invitado local [UID: ${guestUser.uid}]`);
          this.notifyListeners(guestUser);
        } else {
          this.currentUser = null;
          this.initialized = true;
          this.notifyListeners(null);
        }
      }
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
   * Inicia sesión anónima o modo de invitado garantizado.
   * Si el proveedor anónimo de Firebase no está habilitado o falla,
   * crea una sesión local resiliente para permitir el acceso inmediato al juego.
   * @returns {Promise<Object>}
   */
  async loginAnonymously() {
    try {
      const cred = await signInAnonymously(auth);
      this.saveGuestSession(cred.user);
      return { success: true, user: cred.user };
    } catch (err) {
      console.warn(`[AuthService] Acceso anónimo en Firebase no disponible (${err.code || err.message}). Activando sesión local de Cadete Invitado:`, err);
      const guestId = 'guest_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
      const guestUser = {
        uid: guestId,
        displayName: 'Cadete Invitado',
        email: null,
        isAnonymous: true,
        isLocalGuest: true
      };
      this.currentUser = guestUser;
      this.saveGuestSession(guestUser);
      this.notifyListeners(guestUser);
      return { success: true, user: guestUser, isFallback: true };
    }
  }

  /**
   * Cierra la sesión activa y borra el indicador local.
   * @returns {Promise<Object>}
   */
  async logout() {
    try {
      this.clearLocalSession();
      this.currentUser = null;
      if (auth.currentUser) {
        await signOut(auth);
      } else {
        this.notifyListeners(null);
      }
      return { success: true };
    } catch (err) {
      console.error('[AuthService] Error al cerrar sesión:', err);
      this.notifyListeners(null);
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
      localStorage.removeItem('neuroquest_is_guest');
      localStorage.setItem('neuroquest_user_uid', user.uid);
      localStorage.setItem('neuroquest_user_email', user.email || '');
      localStorage.setItem('neuroquest_user_name', user.displayName || user.email?.split('@')[0] || 'Cadete');
    } catch (e) {
      console.warn('[AuthService] No se pudo guardar sesión local:', e);
    }
  }

  /**
   * Guarda de forma local la sesión de cadete invitado.
   * @param {Object} user
   */
  saveGuestSession(user) {
    if (!user) return;
    try {
      localStorage.setItem('neuroquest_logged_in', 'true');
      localStorage.setItem('neuroquest_is_guest', 'true');
      localStorage.setItem('neuroquest_user_uid', user.uid);
      localStorage.setItem('neuroquest_user_name', user.displayName || 'Cadete Invitado');
    } catch (e) {
      console.warn('[AuthService] No se pudo guardar sesión local de invitado:', e);
    }
  }

  /**
   * Verifica si la sesión actual corresponde a un modo invitado local.
   * @returns {boolean}
   */
  isGuestMode() {
    try {
      return localStorage.getItem('neuroquest_is_guest') === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Retorna el objeto representativo de un usuario invitado guardado.
   * @returns {Object}
   */
  getSavedGuestUser() {
    try {
      const uid = localStorage.getItem('neuroquest_user_uid') || ('guest_' + Math.random().toString(36).substring(2, 8));
      const displayName = localStorage.getItem('neuroquest_user_name') || 'Cadete Invitado';
      return {
        uid,
        displayName,
        email: null,
        isAnonymous: true,
        isLocalGuest: true
      };
    } catch {
      return {
        uid: 'guest_fallback',
        displayName: 'Cadete Invitado',
        email: null,
        isAnonymous: true,
        isLocalGuest: true
      };
    }
  }

  /**
   * Limpia el almacenamiento local de sesión.
   */
  clearLocalSession() {
    try {
      localStorage.removeItem('neuroquest_logged_in');
      localStorage.removeItem('neuroquest_is_guest');
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
    if (this.currentUser) {
      if (!this.currentUser.isAnonymous) {
        return this.currentUser.displayName || this.currentUser.email.split('@')[0];
      }
      return this.currentUser.displayName || `Cadete #${this.currentUser.uid.slice(0, 5).toUpperCase()}`;
    }
    try {
      const savedName = localStorage.getItem('neuroquest_user_name');
      if (savedName) return savedName;
    } catch (e) {}

    return 'Cadete no registrado';
  }
}

export const authService = new AuthService();
