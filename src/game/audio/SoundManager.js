/**
 * SoundManager.js — Gestor y sintetizador procedural de audio espacial para NEUROQUEST.
 *
 * Genera buffers nativos de audio espacial de 16-bit PCM mediante Web Audio API
 * y los registra directamente en la caché de audio de Phaser (`scene.cache.audio.add`).
 *
 * Provee:
 * 1. 'sfx_laser': Disparo láser / energía cibernética de alta frecuencia.
 * 2. 'sfx_ambient_drone': Zumbido ambiental continuo de baja frecuencia (nave / estación espacial).
 * 3. 'sfx_correct': Timbre armónico cristalino de acierto cognitivo.
 * 4. 'sfx_error': Glitch / alarma disonante de cálculo erróneo.
 * 5. 'sfx_heal': Onda de restauración nanobótica (+1 vida).
 * 6. 'sfx_hit': Impacto metálico de daño.
 */
export class SoundManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.ambientSound = null;
    this.isMuted = false;
    this.initialized = false;

    this.initAudioBuffers();
  }

  /**
   * Inicializa y sintetiza los buffers de sonido espacial en la caché de Phaser.
   */
  initAudioBuffers() {
    if (this.initialized) return;

    // Obtener contexto de audio de Phaser o crear AudioContext estándar
    let ctx = this.scene.sound?.context;
    if (!ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }

    if (!ctx) {
      console.warn('[SoundManager] Web Audio Context no disponible.');
      return;
    }

    try {
      const sampleRate = ctx.sampleRate || 44100;

      // 1. SFX Láser / Energía Espacial (0.35s de barrido de frecuencia)
      if (!this.scene.cache.audio.exists('sfx_laser')) {
        const laserBuffer = this.createLaserBuffer(ctx, sampleRate);
        this.scene.cache.audio.add('sfx_laser', laserBuffer);
      }

      // 2. SFX Acierto / Chime Cristalino (0.45s)
      if (!this.scene.cache.audio.exists('sfx_correct')) {
        const correctBuffer = this.createCorrectBuffer(ctx, sampleRate);
        this.scene.cache.audio.add('sfx_correct', correctBuffer);
      }

      // 3. SFX Error / Alarma Glitch (0.4s)
      if (!this.scene.cache.audio.exists('sfx_error')) {
        const errorBuffer = this.createErrorBuffer(ctx, sampleRate);
        this.scene.cache.audio.add('sfx_error', errorBuffer);
      }

      // 4. SFX Recuperación Nanobótica / Curación (0.6s)
      if (!this.scene.cache.audio.exists('sfx_heal')) {
        const healBuffer = this.createHealBuffer(ctx, sampleRate);
        this.scene.cache.audio.add('sfx_heal', healBuffer);
      }

      // 5. SFX Impacto / Daño Metálico (0.3s)
      if (!this.scene.cache.audio.exists('sfx_hit')) {
        const hitBuffer = this.createHitBuffer(ctx, sampleRate);
        this.scene.cache.audio.add('sfx_hit', hitBuffer);
      }

      // 6. SFX Ambiente Espacial continuo (Bucle de 4.0 segundos a 55Hz)
      if (!this.scene.cache.audio.exists('sfx_ambient_drone')) {
        const droneBuffer = this.createAmbientDroneBuffer(ctx, sampleRate);
        this.scene.cache.audio.add('sfx_ambient_drone', droneBuffer);
      }

      this.initialized = true;
      console.log('[SoundManager] Sintetizador de audio espacial inicializado exitosamente.');
    } catch (err) {
      console.warn('[SoundManager] Error al generar buffers de audio:', err);
    }
  }

  createLaserBuffer(ctx, sampleRate) {
    const duration = 0.32;
    const totalSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const progress = i / totalSamples;
      // Frecuencia exponencialmente decreciente: 920Hz -> 90Hz
      const freq = 920 * Math.exp(-t * 9.5) + 90;
      // Modulación con sobretono de energía
      const env = Math.pow(1 - progress, 1.8);
      const wave = Math.sin(2 * Math.PI * freq * t) * 0.7 +
                   Math.sin(4 * Math.PI * freq * t) * 0.25 +
                   (Math.random() * 2 - 1) * 0.08 * (1 - progress);
      data[i] = Math.max(-1, Math.min(1, wave * env * 0.85));
    }
    return buffer;
  }

  createCorrectBuffer(ctx, sampleRate) {
    const duration = 0.55;
    const totalSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    // Tríada mayor ascendente: C5 (523Hz), E5 (659Hz), G5 (784Hz)
    const notes = [
      { f: 523.25, start: 0.0,  dur: 0.35 },
      { f: 659.25, start: 0.08, dur: 0.40 },
      { f: 783.99, start: 0.16, dur: 0.45 }
    ];

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;

      notes.forEach(n => {
        if (t >= n.start && t < n.start + n.dur) {
          const noteT = t - n.start;
          const noteProg = noteT / n.dur;
          const env = Math.sin(Math.min(1, noteProg * 4) * Math.PI / 2) * Math.pow(1 - noteProg, 2.0);
          const wave = Math.sin(2 * Math.PI * n.f * noteT) +
                       Math.sin(4 * Math.PI * n.f * noteT) * 0.35;
          sample += wave * env * 0.28;
        }
      });

      data[i] = Math.max(-1, Math.min(1, sample));
    }
    return buffer;
  }

  createErrorBuffer(ctx, sampleRate) {
    const duration = 0.38;
    const totalSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const progress = i / totalSamples;
      const env = Math.pow(1 - progress, 1.4);
      // Frecuencia disonante baja con modulación en onda cuadrada
      const freq = 135 - (progress * 45);
      const phase = 2 * Math.PI * freq * t;
      const square = Math.sin(phase) > 0 ? 0.6 : -0.6;
      const sub = Math.sin(phase * 0.5) * 0.3;
      const noise = (Math.random() * 2 - 1) * 0.15;

      data[i] = Math.max(-1, Math.min(1, (square + sub + noise) * env * 0.65));
    }
    return buffer;
  }

  createHealBuffer(ctx, sampleRate) {
    const duration = 0.65;
    const totalSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const progress = i / totalSamples;
      // Barrido de frecuencia ascendente 280Hz -> 880Hz
      const freq = 280 + (progress * 600);
      const env = Math.sin(progress * Math.PI) * Math.pow(1 - progress, 0.4);
      const wave = Math.sin(2 * Math.PI * freq * t) * 0.6 +
                   Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.3 +
                   Math.sin(2 * Math.PI * (freq * 2.0) * t) * 0.15;

      data[i] = Math.max(-1, Math.min(1, wave * env * 0.7));
    }
    return buffer;
  }

  createHitBuffer(ctx, sampleRate) {
    const duration = 0.28;
    const totalSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const progress = i / totalSamples;
      const env = Math.pow(1 - progress, 2.5);
      const subThud = Math.sin(2 * Math.PI * (90 * Math.exp(-t * 12)) * t) * 0.8;
      const noise = (Math.random() * 2 - 1) * 0.35 * Math.exp(-t * 18);

      data[i] = Math.max(-1, Math.min(1, (subThud + noise) * env * 0.85));
    }
    return buffer;
  }

  createAmbientDroneBuffer(ctx, sampleRate) {
    // Bucle continuo de 4.0 segundos a baja frecuencia (drone de estación)
    const duration = 4.0;
    const totalSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      // Frecuencias base a 55Hz (A1) y armónicos sutiles a 110Hz y 165Hz
      const f1 = 55.0;
      const f2 = 110.0;
      const f3 = 165.0;

      // Modulación suave periódica para respiración espacial
      const lfo = 1.0 + 0.15 * Math.sin(2 * Math.PI * 0.25 * t);
      const wave1 = Math.sin(2 * Math.PI * f1 * t);
      const wave2 = Math.sin(2 * Math.PI * f2 * t) * 0.35;
      const wave3 = Math.sin(2 * Math.PI * f3 * t + 0.5) * 0.18;
      const airNoise = (Math.random() * 2 - 1) * 0.04;

      data[i] = Math.max(-1, Math.min(1, (wave1 + wave2 + wave3 + airNoise) * lfo * 0.45));
    }
    return buffer;
  }

  /**
   * Reproduce el sonido de láser / disparo de combate.
   */
  playLaser() {
    this.safePlay('sfx_laser', { volume: 0.6 });
  }

  /**
   * Reproduce el sonido de acierto curricular.
   */
  playCorrect() {
    this.safePlay('sfx_correct', { volume: 0.75 });
  }

  /**
   * Reproduce el sonido de error o cálculo fallido.
   */
  playError() {
    this.safePlay('sfx_error', { volume: 0.7 });
  }

  /**
   * Reproduce el sonido de restauración de vida / nanobots.
   */
  playHeal() {
    this.safePlay('sfx_heal', { volume: 0.75 });
  }

  /**
   * Reproduce el sonido de impacto recibido.
   */
  playHit() {
    this.safePlay('sfx_hit', { volume: 0.8 });
  }

  /**
   * Inicia el bucle ambiental espacial continuo.
   */
  startAmbientDrone() {
    if (this.ambientSound && this.ambientSound.isPlaying) return;

    try {
      this.resumeAudioContext();
      if (this.scene.cache.audio.exists('sfx_ambient_drone')) {
        this.ambientSound = this.scene.sound.add('sfx_ambient_drone', {
          loop: true,
          volume: 0.22
        });
        this.ambientSound.play();
      }
    } catch (err) {
      console.warn('[SoundManager] No se pudo iniciar drone ambiental:', err);
    }
  }

  /**
   * Detiene el bucle ambiental espacial.
   */
  stopAmbientDrone() {
    if (this.ambientSound) {
      try {
        this.ambientSound.stop();
        this.ambientSound.destroy();
      } catch (err) {}
      this.ambientSound = null;
    }
  }

  resumeAudioContext() {
    if (this.scene.sound?.context?.state === 'suspended') {
      this.scene.sound.context.resume().catch(() => {});
    }
  }

  safePlay(key, config = {}) {
    if (this.isMuted) return;
    try {
      this.resumeAudioContext();
      if (this.scene.cache.audio.exists(key)) {
        this.scene.sound.play(key, config);
      }
    } catch (err) {
      console.warn(`[SoundManager] Error reproduciendo ${key}:`, err);
    }
  }

  destroy() {
    this.stopAmbientDrone();
  }
}
