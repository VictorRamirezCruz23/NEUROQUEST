/**
 * deviceDetector.js — Detección de dispositivos (Computadora vs. Teléfono/Móvil).
 * Proporciona detección táctil y solicitud de orientación horizontal.
 */

export class DeviceDetector {
  /**
   * Determina si el usuario está interactuando desde un dispositivo móvil o táctil.
   * @returns {boolean}
   */
  static isMobile() {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth <= 1024 || window.innerHeight <= 600;

    return hasTouch && (isMobileUA || isSmallScreen);
  }

  /**
   * Intenta bloquear o solicitar la orientación horizontal (landscape) si el navegador lo permite.
   */
  static requestLandscape() {
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {
          // El bloqueo de orientación puede requerir pantalla completa o permisos del usuario
        });
      }
    } catch {
      // Ignorar de forma segura si la API no está soportada
    }
  }
}
