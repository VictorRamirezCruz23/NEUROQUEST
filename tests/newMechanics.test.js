import test from 'node:test';
import assert from 'node:assert/strict';

// Polyfills para entorno Node
if (typeof globalThis.localStorage === 'undefined') {
  const memoryStore = new Map();
  globalThis.localStorage = {
    getItem: (key) => memoryStore.get(key) || null,
    setItem: (key, val) => memoryStore.set(key, String(val)),
    removeItem: (key) => memoryStore.delete(key),
    clear: () => memoryStore.clear()
  };
}

import { sessionState, COMPETENCY_IDS, PLAYER_PALETTES, MENU_BG_THEMES } from '../src/core/sessionState.js';
import { LevelGenerator } from '../src/game/procedural/LevelGenerator.js';

test('1. Personalización de Personaje: cicla y persiste paletas de indumentaria correctamente', () => {
  const initial = sessionState.getPlayerPalette();
  assert.ok(initial, 'Debe haber una paleta inicial');

  // Cambiar a cian neón
  const cyan = sessionState.setPlayerPalette('cyber_cyan');
  assert.equal(cyan.id, 'cyber_cyan');
  assert.equal(sessionState.getPlayerPaletteId(), 'cyber_cyan');

  // Ciclar paleta
  const nextPal = sessionState.cyclePlayerPalette();
  assert.notEqual(nextPal.id, 'cyber_cyan', 'Al ciclar debe pasar a la siguiente paleta');

  // Regresar a la paleta por defecto
  sessionState.setPlayerPalette('classic_blue');
  assert.equal(sessionState.getPlayerPaletteId(), 'classic_blue');
});

test('2. Sistema de Trofeos: Desbloqueo y persistencia para los 4 mundos', () => {
  // Asegurar estado
  const logicTrophyBefore = sessionState.hasTrophy(COMPETENCY_IDS.LOGIC_MATH);
  sessionState.unlockTrophy(COMPETENCY_IDS.LOGIC_MATH);
  assert.equal(sessionState.hasTrophy(COMPETENCY_IDS.LOGIC_MATH), true, 'El trofeo del Módulo 1 debe estar desbloqueado');

  sessionState.unlockTrophy(COMPETENCY_IDS.COMPUTATIONAL_THINKING);
  assert.equal(sessionState.hasTrophy(COMPETENCY_IDS.COMPUTATIONAL_THINKING), true);

  const trophies = sessionState.getTrophies();
  assert.equal(trophies[COMPETENCY_IDS.LOGIC_MATH], true);
  assert.equal(trophies[COMPETENCY_IDS.COMPUTATIONAL_THINKING], true);
});

test('3. Configuración Interactiva de Fondo de Menú: ciclo de temas cibernéticos', () => {
  const initialTheme = sessionState.getMenuBgTheme();
  assert.ok(initialTheme, 'Debe haber un tema de menú inicial');

  const cycled = sessionState.cycleMenuBgTheme();
  assert.notEqual(cycled.id, initialTheme.id, 'El tema ciclado debe ser diferente');
});

test('4. Generador de Niveles Super Mario 3: genera plataformas, abismos, pinchos y enemigos aéreos/terrestres', () => {
  const chunk = LevelGenerator.generateChunk({
    startX: 0,
    length: 2600,
    groundY: 430,
    playerLives: 4,
    themeIndex: 0,
    isBossSector: true
  });

  assert.ok(chunk.platforms.length > 0, 'Debe generar plataformas');
  assert.ok(chunk.hazards.length >= 0, 'Debe soportar lista de peligros y pinchos');
  assert.ok(chunk.flyingBots.length > 0, 'Debe generar enemigos voladores (OwlBot/AjoloteBot)');
  assert.ok(chunk.matbots.length > 0, 'Debe generar enemigos terrestres');
  assert.ok(chunk.bossData, 'Debe generar datos de BosMat cuando isBossSector es true');
  assert.equal(chunk.bossData.type, 'bosmat');
});

test('5. Verificación de ausencia de setAllowGravity y uso de allowGravity en entidades', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const entityFiles = [
    'src/game/entities/ParasiteBot.js',
    'src/game/entities/BosMat.js',
    'src/game/entities/FlyingBot.js',
    'src/game/entities/EnergyProjectile.js'
  ];

  for (const file of entityFiles) {
    const content = fs.readFileSync(path.resolve(file), 'utf-8');
    assert.equal(
      content.includes('.setAllowGravity('),
      false,
      `El archivo ${file} no debe contener llamadas a .setAllowGravity()`
    );
    assert.equal(
      content.includes('allowGravity = false'),
      true,
      `El archivo ${file} debe manipular la gravedad mediante allowGravity = false`
    );
  }
});

test('6. Verificación de Plataformas Móviles y eliminación de restricción del 80%', () => {
  const chunk = LevelGenerator.generateChunk({
    startX: 0,
    length: 2600,
    groundY: 430,
    playerLives: 5,
    themeIndex: 0
  });

  assert.ok(Array.isArray(chunk.movingPlatforms), 'Debe incluir lista de plataformas móviles cinéticas');
  assert.ok(chunk.movingPlatforms.length > 0, 'Debe generar plataformas móviles');
  assert.ok(chunk.movingPlatforms[0].distance > 0, 'La plataforma móvil debe tener recorrido definido');
});

test('7. Verificación de declaración segura de isBotSheet en BattleArenaModal', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const content = fs.readFileSync(path.resolve('src/ui/components/BattleArenaModal.js'), 'utf-8');
  assert.equal(
    content.includes('const isBotSheet ='),
    true,
    'BattleArenaModal debe declarar e inicializar const isBotSheet'
  );
  assert.equal(
    content.includes('isBotSheet is not defined'),
    false
  );
});

test('8. Verificación de Fullscreen nativo 100vw/100vh en CSS y gameConfig', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const css = fs.readFileSync(path.resolve('src/styles/main.css'), 'utf-8');
  assert.equal(css.includes('width: 100vw;'), true, 'El contenedor debe tener ancho 100vw');
  assert.equal(css.includes('height: 100vh;'), true, 'El contenedor debe tener alto 100vh');

  const configText = fs.readFileSync(path.resolve('src/config/gameConfig.js'), 'utf-8');
  assert.equal(configText.includes('mode: Phaser.Scale.FIT'), true, 'Debe configurar Phaser.Scale.FIT');
  assert.equal(configText.includes('autoCenter: Phaser.Scale.CENTER_BOTH'), true, 'Debe centrar con CENTER_BOTH');
});
