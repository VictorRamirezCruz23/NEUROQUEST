import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('1. Proyectiles policromáticos: PROJECTILE_COLORS contiene variedad de colores neón no específicos', () => {
  const projFile = fs.readFileSync(path.resolve('src/game/entities/EnergyProjectile.js'), 'utf-8');
  assert.ok(projFile.includes('PROJECTILE_COLORS = ['), 'EnergyProjectile debe definir PROJECTILE_COLORS');
  assert.ok(projFile.includes('0x00f0ff'), 'Debe incluir Cian neón');
  assert.ok(projFile.includes('0xff007f'), 'Debe incluir Magenta neón');
  assert.ok(projFile.includes('0x10b981'), 'Debe incluir Verde esmeralda');
  assert.ok(projFile.includes('0xfbbf24'), 'Debe incluir Ámbar dorado');
  assert.ok(projFile.includes('0xa855f7'), 'Debe incluir Púrpura cuántico');
  assert.ok(projFile.includes('this.setTint(this.bulletColor)'), 'Debe aplicar el tinte del color elegido al proyectil');
});

test('2. Entidad Player: implementa método shootAt(targetX, targetY) para apuntado con clic o touch', () => {
  const playerFile = fs.readFileSync(path.resolve('src/game/entities/Player.js'), 'utf-8');
  assert.ok(playerFile.includes('shootAt(targetX, targetY)'), 'Player debe tener el método shootAt(targetX, targetY)');
  assert.ok(playerFile.includes('shoot()'), 'Player debe conservar shoot() para disparo frontal');
  assert.ok(playerFile.includes('setFlipX(true)'), 'Player debe orientarse según el objetivo');
});

test('3. Escena WorldScene: integra disparo directo por clic o toque táctil con el dedo en pantalla', () => {
  const worldFile = fs.readFileSync(path.resolve('src/game/scenes/WorldScene.js'), 'utf-8');
  assert.ok(
    worldFile.includes('pointerdown') && worldFile.includes('shootAt'),
    'WorldScene debe capturar pointerdown y llamar a shootAt'
  );
  assert.ok(
    worldFile.includes('getWorldPoint'),
    'WorldScene debe usar getWorldPoint para traducir coordenadas de cámara exactas'
  );
  assert.ok(
    worldFile.includes('currentlyOver.length > 0'),
    'Debe evitar disparar si el clic/tap fue sobre botones de la interfaz o controles virtuales'
  );
});

test('4. Cooldown de daño de 2 segundos y prevención de daño duplicado', () => {
  const worldFile = fs.readFileSync(path.resolve('src/game/scenes/WorldScene.js'), 'utf-8');

  // Solo debe haber una definición de damagePlayer
  const damagePlayerDefs = worldFile.match(/^\s*damagePlayer\s*\(/gm) || [];
  assert.equal(
    damagePlayerDefs.length,
    1,
    'Debe existir una única definición de damagePlayer para no anular la invulnerabilidad'
  );

  assert.ok(
    worldFile.includes('2000') && worldFile.includes('lastDamageTime'),
    'damagePlayer debe aplicar cooldown de 2000ms (2s) por atacante'
  );
  assert.ok(
    worldFile.includes('this.isInvulnerable = false'),
    'damagePlayer debe restaurar vulnerabilidad tras el tiempo de i-frames'
  );
});

test('5. Bots terrestres no mueren por balas (requieren responder pregunta) y despawnean limpiamente al ser derrotados en duelo', () => {
  const matbotFile = fs.readFileSync(path.resolve('src/game/entities/MatBot.js'), 'utf-8');
  const enemybotFile = fs.readFileSync(path.resolve('src/game/entities/EnemyBot.js'), 'utf-8');
  const parasiteFile = fs.readFileSync(path.resolve('src/game/entities/ParasiteBot.js'), 'utf-8');
  const flyingFile = fs.readFileSync(path.resolve('src/game/entities/FlyingBot.js'), 'utf-8');
  const modalFile = fs.readFileSync(path.resolve('src/ui/components/BattleArenaModal.js'), 'utf-8');

  // MatBot: balas solo desestabilizan/retroceden, no es destruido por balas
  assert.ok(matbotFile.includes('takeProjectileDamage'), 'MatBot debe tener takeProjectileDamage');
  assert.ok(matbotFile.includes('this.body.enable = false'), 'MatBot debe deshabilitar física inmediatamente al morir');
  assert.ok(matbotFile.includes('this.setVisible(false)'), 'MatBot debe ocultar sprite inmediatamente al ser derrotado');

  // EnemyBot: balas solo desestabilizan/stagger, requiere responder pregunta
  assert.ok(enemybotFile.includes('takeProjectileDamage'), 'EnemyBot debe tener takeProjectileDamage');
  assert.ok(enemybotFile.includes('STAGGER'), 'EnemyBot debe entrar en STAGGER y no morir por balas');

  // ParasiteBot: balas entran en STUNNED, no muere por balas
  assert.ok(parasiteFile.includes('takeProjectileDamage'), 'ParasiteBot debe tener takeProjectileDamage');
  assert.ok(parasiteFile.includes('STUNNED'), 'ParasiteBot debe entrar en STUNNED al recibir balas sin morir');
  assert.ok(parasiteFile.includes('this.setVisible(false)'), 'ParasiteBot debe ocultar sprite al destruirse');

  // FlyingBot: enemigos aéreos sí mueren por disparos
  assert.ok(flyingFile.includes('this.hp <= 0'), 'FlyingBot debe morir cuando su HP llega a 0 por disparos');
  assert.ok(flyingFile.includes('this.body.enable = false'), 'FlyingBot debe deshabilitar física al explotar');

  // BattleArenaModal: preserva botRef antes de cerrar modal para ejecutar playDefeat
  assert.ok(modalFile.includes('const botRef = this.currentBot'), 'BattleArenaModal debe capturar botRef antes de close()');
});

test('6. Animación de disparo libre del frame de la cabeza (frame 22)', () => {
  const preloadFile = fs.readFileSync(path.resolve('src/game/scenes/PreloadScene.js'), 'utf-8');
  assert.ok(preloadFile.includes('frame: 18'), 'attackFrames debe incluir frame 18');
  assert.ok(preloadFile.includes('frame: 21'), 'attackFrames debe incluir frame 21');
  assert.ok(!preloadFile.includes('frame: 22'), 'attackFrames NO debe incluir el frame 22 (icono recortado de la cabeza)');
});

test('7. ParasiteBot previene TypeError al leer tweens tras despawn', () => {
  const parasiteFile = fs.readFileSync(path.resolve('src/game/entities/ParasiteBot.js'), 'utf-8');
  assert.ok(
    parasiteFile.includes('patch.scene.tweens'),
    'ParasiteBot debe validar patch.scene.tweens para evitar TypeError cuando el bot es destruido'
  );
});

test('8. Bloqueo de avance en meta hasta neutralizar a todos los enemigos del sector', () => {
  const worldFile = fs.readFileSync(path.resolve('src/game/scenes/WorldScene.js'), 'utf-8');
  assert.ok(worldFile.includes('getRemainingEnemiesCount()'), 'WorldScene debe calcular los enemigos restantes');
  assert.ok(worldFile.includes('updateVictoryGoalStatus()'), 'WorldScene debe actualizar estado visual de la meta');
  assert.ok(worldFile.includes('checkAllEnemiesDefeated()'), 'WorldScene debe verificar desbloqueo al neutralizar enemigos');
  assert.ok(
    worldFile.includes('remaining > 0') && worldFile.includes('SECTOR BLOQUEADO'),
    'handleVictoryGoal debe bloquear la victoria si quedan enemigos activos en el sector'
  );
  assert.ok(
    worldFile.includes("bot.state === 'DEAD'") || worldFile.includes("bot.state === 'DYING'"),
    'WorldScene debe ignorar colisiones de daño con bots en estado DEAD o DYING'
  );
});

test('9. Cero daño por contacto físico con MatBot / bots terrestres (inicia duelo sin restar vida previa)', () => {
  const worldFile = fs.readFileSync(path.resolve('src/game/scenes/WorldScene.js'), 'utf-8');

  // El bloque de overlap entre player y matbotGroup NO debe ejecutar damagePlayer
  const matbotOverlapBlock = worldFile.slice(
    worldFile.indexOf('this.physics.add.overlap(this.player, this.matbotGroup'),
    worldFile.indexOf('startCombatDuel(bot)') + 30
  );
  assert.ok(
    !matbotOverlapBlock.includes('this.damagePlayer'),
    'El contacto físico con matbotGroup no debe llamar a damagePlayer'
  );
  assert.ok(
    matbotOverlapBlock.includes('startCombatDuel'),
    'El contacto físico debe iniciar el combate táctico de preguntas directamente'
  );
});

test('10. BattleArenaModal dimensiona al bot de forma proporcionada y previene solapamiento con la caja de HP', () => {
  const arenaFile = fs.readFileSync(path.resolve('src/ui/components/BattleArenaModal.js'), 'utf-8');
  const worldFile = fs.readFileSync(path.resolve('src/game/scenes/WorldScene.js'), 'utf-8');

  // Escala del bot reducida y proporcionada
  assert.ok(arenaFile.includes('botScale = 0.46'), 'La escala del bot en arena debe ser balanceada (0.46) para no sobreponerse');
  assert.ok(arenaFile.includes('botInfoX = botCenterX - 75 - botInfoW'), 'Debe existir margen de separación entre la telemetría y el sprite del bot');

  // Ocultamiento del HUD del mundo durante el duelo para no solapar interfaces
  assert.ok(worldFile.includes('setHUDVisible(visible)'), 'WorldScene debe implementar setHUDVisible');
  assert.ok(arenaFile.includes('setHUDVisible(false)'), 'BattleArenaModal debe ocultar el HUD de fondo al iniciar combate');
  assert.ok(arenaFile.includes('setHUDVisible(true)'), 'BattleArenaModal debe restaurar el HUD al cerrar');
});

test('11. Controles virtuales en responsivo: Botón de interacción [E] oculto salvo al estar cerca de una consola', () => {
  const vControlsFile = fs.readFileSync(path.resolve('src/ui/components/VirtualControls.js'), 'utf-8');

  // Inicialmente oculto
  assert.ok(
    vControlsFile.includes('this.interactBtn.setVisible(false)'),
    'interactBtn debe inicializarse oculto por defecto'
  );

  // Aparece al aproximarse a una terminal
  assert.ok(
    vControlsFile.includes('this.interactBtn.setVisible(this.visible !== false)'),
    'interactBtn debe hacerse visible cuando isNear es true'
  );

  // Se oculta al alejarse
  assert.ok(
    vControlsFile.includes('this.interactBtn.setVisible(false)') && vControlsFile.includes('setNearTerminal'),
    'interactBtn debe ocultarse cuando isNear es false'
  );
});
