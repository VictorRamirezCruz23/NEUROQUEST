import Phaser from 'phaser';

/**
 * VirtualControls.js — Controles táctiles virtuales rediseñados para dispositivos móviles y tabletas.
 *
 * Características:
 * - Soporte multi-touch con asignación de punteros simultáneos (mover con pulgar izquierdo + saltar/atacar con derecho).
 * - Modo Sprint / Carrera acelerada con animación dinámica 'player_run'.
 * - Botón de interacción inteligente [E] que pulsa y resalta al aproximarse a terminales educativas.
 * - Barra superior de atajos móviles para Métricas [B], Selector de Rutas [M] y alternador de visibilidad HUD.
 * - Respuesta háptica sutil mediante API Vibration y feedback visual cibernético retro.
 */
export class VirtualControls {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('../../game/entities/Player.js').Player} player
   */
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.elements = [];
    this.buttons = [];
    this.isNearTerminal = false;
    this.terminalType = null;
    this.isSprintActive = false;
    this.opacityMode = 1.0; // 1.0 -> 0.45 -> 0 (oculto)
    this.visible = true;

    // Habilitar soporte para hasta 4 toques táctiles simultáneos
    if (this.scene.input && this.scene.input.addPointer) {
      this.scene.input.addPointer(3);
    }

    this.createControls();
  }

  track(obj) {
    if (obj.setScrollFactor) {
      obj.setScrollFactor(0);
    }
    this.elements.push(obj);
    return obj;
  }

  createControls() {
    const { width, height } = this.scene.scale;
    const baseDepth = 1850;

    // =========================================================================
    // 1. CLÚSTER IZQUIERDO: MOVIMIENTO Y TURBO SPRINT
    // =========================================================================
    const padY = height - 52;
    const btnSize = 54;

    // Botón Izquierda ◀
    this.createControlButton({
      x: 52,
      y: padY,
      width: btnSize,
      height: btnSize,
      label: '◀',
      fontSize: '22px',
      color: '#38bdf8',
      depth: baseDepth,
      onPress: () => {
        if (this.player) this.player.virtualInput.left = true;
      },
      onRelease: () => {
        if (this.player) this.player.virtualInput.left = false;
      }
    });

    // Botón Derecha ▶
    this.createControlButton({
      x: 122,
      y: padY,
      width: btnSize,
      height: btnSize,
      label: '▶',
      fontSize: '22px',
      color: '#38bdf8',
      depth: baseDepth,
      onPress: () => {
        if (this.player) this.player.virtualInput.right = true;
      },
      onRelease: () => {
        if (this.player) this.player.virtualInput.right = false;
      }
    });

    // Botón Turbo / Sprint 🏃
    this.sprintBtn = this.createControlButton({
      x: 87,
      y: padY - 58,
      width: 104,
      height: 38,
      label: '🏃 CORRER',
      fontSize: '11px',
      color: '#94a3b8',
      depth: baseDepth,
      onPress: () => {
        this.toggleSprint();
      }
    });

    // =========================================================================
    // 2. CLÚSTER DERECHO: ACCIONES (SALTO, GOLPE, TERMINAL)
    // =========================================================================
    // Botón Salto ▲ (Elevado y de mayor tamaño para accesibilidad de pulgar)
    this.createControlButton({
      x: width - 62,
      y: height - 128,
      width: 68,
      height: 54,
      label: '▲ SALTO',
      fontSize: '12px',
      color: '#38bdf8',
      depth: baseDepth,
      onPress: () => {
        if (this.player) {
          this.player.virtualInput.jump = true;
        }
      }
    });

    // Botón Agacharse ▼ (Crouch físico y reducción de hitbox)
    this.createControlButton({
      x: width - 144,
      y: height - 128,
      width: 68,
      height: 54,
      label: '▼ AGACHAR',
      fontSize: '10px',
      color: '#c084fc',
      depth: baseDepth,
      onPress: () => {
        if (this.player) {
          this.player.virtualInput.crouch = true;
        }
      },
      onRelease: () => {
        if (this.player) {
          this.player.virtualInput.crouch = false;
        }
      }
    });

    // Botón Golpe / Acción ⚡
    this.createControlButton({
      x: width - 144,
      y: padY,
      width: 64,
      height: 52,
      label: '⚡ GOLPE',
      fontSize: '11px',
      color: '#f59e0b',
      depth: baseDepth,
      onPress: () => {
        if (this.player) {
          this.player.virtualInput.punch = true;
        }
      }
    });

    // Botón Interactuar / Terminal [E]
    this.interactBtn = this.createControlButton({
      x: width - 62,
      y: padY,
      width: 72,
      height: 52,
      label: '[E] ACCIÓN',
      fontSize: '10px',
      color: '#94a3b8',
      depth: baseDepth,
      onPress: () => {
        this.scene.events.emit('touch-interact');
      }
    });
    // Oculto por defecto: únicamente aparece cuando el jugador se acerca a una consola
    this.interactBtn.setVisible(false);

    // =========================================================================
    // 3. BARRA SUPERIOR DE ACCESOS RÁPIDOS MÓVILES
    // =========================================================================
    // Atajo directo a Selector de Rutas [M]
    this.createControlButton({
      x: width - 68,
      y: 36,
      width: 82,
      height: 30,
      label: '🧭 RUTAS',
      fontSize: '10px',
      color: '#38bdf8',
      depth: baseDepth,
      onPress: () => {
        this.scene.events.emit('touch-switch-route');
      }
    });

    // Atajo directo al Dashboard de Aprendizaje [B]
    this.createControlButton({
      x: width - 158,
      y: 36,
      width: 86,
      height: 30,
      label: '📊 MÉTRICAS',
      fontSize: '10px',
      color: '#38bdf8',
      depth: baseDepth,
      onPress: () => {
        this.scene.events.emit('touch-open-dashboard');
      }
    });

    // Alternador de visibilidad de controles HUD (para despejar la vista)
    this.createControlButton({
      x: 44,
      y: 36,
      width: 60,
      height: 30,
      label: '👁️ HUD',
      fontSize: '10px',
      color: '#94a3b8',
      depth: baseDepth,
      onPress: () => {
        this.cycleOpacity();
      }
    });
  }

  /**
   * Crea un botón táctil individual con estilización cyberpunk y feedback táctil.
   */
  createControlButton(config) {
    const { x, y, width, height, label, fontSize, color, depth, onPress, onRelease } = config;
    const halfW = width / 2;
    const halfH = height / 2;

    const bgGfx = this.track(this.scene.add.graphics().setDepth(depth));
    const labelText = this.track(
      this.scene.add.text(x, y, label, {
        fontFamily: 'monospace',
        fontSize: fontSize || '12px',
        color: color || '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(depth + 1)
    );

    const hitZone = this.track(
      this.scene.add.zone(x, y, width + 10, height + 10)
        .setDepth(depth + 2)
        .setInteractive({ useHandCursor: true })
    );

    const draw = (pressed = false, highlightColor = null) => {
      bgGfx.clear();
      const strokeColor = highlightColor || (pressed ? 0x60a5fa : 0x38bdf8);
      const fillColor = pressed ? 0x0369a1 : 0x0b1120;
      const alpha = pressed ? 0.95 : 0.78;

      bgGfx.fillStyle(fillColor, alpha);
      bgGfx.fillRoundedRect(x - halfW, y - halfH, width, height, 10);
      bgGfx.lineStyle(2, strokeColor, pressed ? 1.0 : 0.85);
      bgGfx.strokeRoundedRect(x - halfW, y - halfH, width, height, 10);
    };

    draw(false);

    let isPointerDown = false;

    hitZone.on('pointerdown', (pointer) => {
      isPointerDown = true;
      draw(true);
      labelText.setScale(0.92);

      // Respuesta háptica sutil
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(12);
        } catch {}
      }

      if (onPress) onPress(pointer);
    });

    const release = () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      draw(false);
      labelText.setScale(1.0);
      if (onRelease) onRelease();
    };

    hitZone.on('pointerup', release);
    hitZone.on('pointerout', release);

    const btnRef = {
      bgGfx,
      labelText,
      hitZone,
      config,
      draw,
      setLabel: (txt, clr) => {
        labelText.setText(txt);
        if (clr) labelText.setColor(clr);
      },
      setHighlight: (highlight, customBorder) => {
        draw(false, highlight ? (customBorder || 0x10b981) : null);
      },
      setVisible: (visible) => {
        bgGfx.setVisible(visible);
        labelText.setVisible(visible);
        hitZone.setVisible(visible);
        if (hitZone.input) {
          hitZone.input.enabled = visible;
        }
      }
    };

    this.buttons.push(btnRef);
    return btnRef;
  }

  /**
   * Alterna el modo Turbo Sprint (Correr).
   */
  toggleSprint() {
    this.isSprintActive = !this.isSprintActive;
    if (this.player) {
      this.player.virtualInput.running = this.isSprintActive;
    }

    if (this.sprintBtn) {
      if (this.isSprintActive) {
        this.sprintBtn.setLabel('🏃 RUN [ON]', '#38bdf8');
        this.sprintBtn.setHighlight(true, 0x38bdf8);
      } else {
        this.sprintBtn.setLabel('🏃 CORRER', '#94a3b8');
        this.sprintBtn.setHighlight(false);
      }
    }
  }

  /**
   * Actualiza el estado visual del botón de interactuar cuando el jugador
   * se sitúa frente a una terminal educativa interactiva.
   */
  setNearTerminal(isNear, terminalType = 'standard') {
    if (this.isNearTerminal === isNear && this.terminalType === terminalType) {
      return;
    }

    this.isNearTerminal = isNear;
    this.terminalType = terminalType;

    if (!this.interactBtn) return;

    if (isNear) {
      const isAdvanced = terminalType === 'transfer_retention';
      const label = isAdvanced ? '⚡ ENTRAR [E]' : '💡 ENTRAR [E]';
      const color = isAdvanced ? '#c084fc' : '#34d399';
      const border = isAdvanced ? 0xc084fc : 0x10b981;

      this.interactBtn.setLabel(label, color);
      this.interactBtn.setHighlight(true, border);
      this.interactBtn.setVisible(this.visible !== false);
    } else {
      this.interactBtn.setVisible(false);
      this.interactBtn.setHighlight(false);
    }
  }

  /**
   * Alterna los modos de opacidad del HUD táctil (1.0 -> 0.4 -> 0.0 -> 1.0).
   */
  cycleOpacity() {
    if (this.opacityMode === 1.0) {
      this.opacityMode = 0.45;
    } else if (this.opacityMode === 0.45) {
      this.opacityMode = 0.05;
    } else {
      this.opacityMode = 1.0;
    }

    this.elements.forEach(el => {
      if (el && el.setAlpha) {
        el.setAlpha(this.opacityMode);
      }
    });
  }

  /**
   * Muestra u oculta los controles virtuales (por ejemplo, cuando se abre un modal de desafío).
   */
  setVisible(visible) {
    this.visible = visible;
    this.elements.forEach(el => {
      if (el && el.setVisible) {
        el.setVisible(visible);
      }
      if (el && el.input) {
        el.input.enabled = visible;
      }
    });

    // Mantener interactBtn oculto si los controles son visibles pero el jugador no está junto a una consola
    if (visible && this.interactBtn && !this.isNearTerminal) {
      this.interactBtn.setVisible(false);
    }
  }

  update() {
    // Si la sesión del jugador requiere actualización por fotograma
  }

  destroy() {
    this.elements.forEach(el => {
      if (el && el.destroy) el.destroy();
    });
    this.elements = [];
    this.buttons = [];
  }
}
