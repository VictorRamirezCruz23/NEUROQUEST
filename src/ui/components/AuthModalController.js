import { authService } from '../../services/firebase/authService.js';
import { firestoreService } from '../../services/firebase/firestoreService.js';

/**
 * AuthModalController.js — Controlador del diálogo de autenticación y perfil de cadete.
 * Conecta el formulario HTML estilizado con el servicio modular de Firebase Auth.
 */
class AuthModalController {
  constructor() {
    this.modal = null;
    this.mode = 'login'; // 'login' | 'register'
    this.initialized = false;
  }

  init() {
    if (this.initialized || typeof document === 'undefined') return;
    this.modal = document.getElementById('auth-modal');
    if (!this.modal) return;

    this.titleEl = document.getElementById('auth-title');
    this.subtitleEl = document.getElementById('auth-subtitle');
    this.statusEl = document.getElementById('auth-user-status');
    this.uidEl = document.getElementById('auth-user-uid');
    this.form = document.getElementById('auth-form');
    this.nameField = document.getElementById('field-displayname');
    this.nameInput = document.getElementById('auth-input-name');
    this.emailInput = document.getElementById('auth-input-email');
    this.passwordInput = document.getElementById('auth-input-password');
    this.errorEl = document.getElementById('auth-error-msg');
    this.successEl = document.getElementById('auth-success-msg');
    this.submitBtn = document.getElementById('auth-btn-submit');
    this.switchBtn = document.getElementById('auth-btn-switch');
    this.anonBtn = document.getElementById('auth-btn-anon');
    this.logoutBtn = document.getElementById('auth-btn-logout');
    this.closeBtn = document.getElementById('auth-modal-close');

    this.setupListeners();
    this.initialized = true;

    // Escuchar cambios de autenticación para sincronizar el panel
    authService.onAuthStateChange((user) => {
      this.updateStatusView(user);
    });
  }

  setupListeners() {
    this.closeBtn?.addEventListener('click', () => this.close());
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    this.switchBtn?.addEventListener('click', () => {
      this.toggleMode();
    });

    this.anonBtn?.addEventListener('click', async () => {
      this.clearMessages();
      this.submitBtn.disabled = true;
      const res = await authService.loginAnonymously();
      this.submitBtn.disabled = false;
      if (res.success) {
        this.showSuccess('Iniciando sesión como Cadete Invitado...');
        setTimeout(() => this.close(), 1200);
      } else {
        this.showError(res.error);
      }
    });

    this.logoutBtn?.addEventListener('click', async () => {
      this.clearMessages();
      await authService.logout();
      this.showSuccess('Sesión cerrada. Jugando en modo offline.');
    });

    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.clearMessages();

      const email = this.emailInput.value.trim();
      const password = this.passwordInput.value.trim();

      if (!email || !password) {
        this.showError('Por favor completa todos los campos.');
        return;
      }

      this.submitBtn.disabled = true;

      if (this.mode === 'login') {
        const res = await authService.loginWithEmail(email, password);
        this.submitBtn.disabled = false;
        if (res.success) {
          this.showSuccess('¡Bienvenido de vuelta, Cadete!');
          setTimeout(() => this.close(), 1200);
        } else {
          this.showError(this.translateAuthError(res.error));
        }
      } else {
        const displayName = this.nameInput.value.trim() || 'Cadete Neuroquest';
        const res = await authService.registerWithEmail(email, password, displayName);
        this.submitBtn.disabled = false;
        if (res.success) {
          this.showSuccess('¡Cuenta de cadete creada con éxito!');
          setTimeout(() => this.close(), 1200);
        } else {
          this.showError(this.translateAuthError(res.error));
        }
      }
    });
  }

  updateStatusView(user) {
    if (!this.statusEl) return;
    if (user) {
      if (user.isAnonymous) {
        this.statusEl.textContent = '🟢 Conectado como Cadete Invitado';
        this.statusEl.style.color = '#38bdf8';
        this.uidEl.textContent = user.uid;
        if (this.logoutBtn) this.logoutBtn.style.display = 'none';
        if (this.anonBtn) this.anonBtn.style.display = 'none';
      } else {
        this.statusEl.textContent = `🟢 Conectado: ${user.displayName || user.email}`;
        this.statusEl.style.color = '#34d399';
        this.uidEl.textContent = user.uid;
        if (this.logoutBtn) this.logoutBtn.style.display = 'block';
        if (this.anonBtn) this.anonBtn.style.display = 'none';
      }
    } else {
      this.statusEl.textContent = '⚪ Sin sesión activa (Modo Local)';
      this.statusEl.style.color = '#94a3b8';
      this.uidEl.textContent = 'offline_guest';
      if (this.logoutBtn) this.logoutBtn.style.display = 'none';
      if (this.anonBtn) this.anonBtn.style.display = 'block';
    }
  }

  toggleMode() {
    this.clearMessages();
    if (this.mode === 'login') {
      this.mode = 'register';
      this.titleEl.textContent = 'NUEVO REGISTRO DE CADETE';
      this.subtitleEl.textContent = 'Crea una cuenta para guardar tu progreso';
      this.nameField.style.display = 'block';
      this.submitBtn.textContent = 'CREAR CUENTA';
      this.switchBtn.textContent = '¿Ya tienes cuenta? Inicia Sesión';
    } else {
      this.mode = 'login';
      this.titleEl.textContent = 'IDENTIFICACIÓN DE CADETE';
      this.subtitleEl.textContent = 'Sincronización en la nube con Firebase';
      this.nameField.style.display = 'none';
      this.submitBtn.textContent = 'INICIAR SESIÓN';
      this.switchBtn.textContent = '¿No tienes cuenta? Regístrate';
    }
  }

  showError(msg) {
    if (this.errorEl) {
      this.errorEl.textContent = msg;
      this.errorEl.style.display = 'block';
    }
  }

  showSuccess(msg) {
    if (this.successEl) {
      this.successEl.textContent = msg;
      this.successEl.style.display = 'block';
    }
  }

  clearMessages() {
    if (this.errorEl) this.errorEl.style.display = 'none';
    if (this.successEl) this.successEl.style.display = 'none';
  }

  translateAuthError(err) {
    if (!err) return 'Error desconocido.';
    if (err.includes('user-not-found') || err.includes('wrong-password') || err.includes('invalid-credential')) {
      return 'Correo o contraseña incorrectos.';
    }
    if (err.includes('email-already-in-use')) {
      return 'Este correo ya tiene una cuenta registrada.';
    }
    if (err.includes('weak-password')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (err.includes('invalid-email')) {
      return 'El formato de correo no es válido.';
    }
    return `Aviso de Firebase: ${err}`;
  }

  open() {
    this.init();
    if (this.modal) {
      this.clearMessages();
      this.updateStatusView(authService.getUser());
      this.modal.style.display = 'flex';
    }
  }

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

export const authModalController = new AuthModalController();
