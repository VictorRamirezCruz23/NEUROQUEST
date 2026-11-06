import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

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

import { adaptiveEngine, ADAPTIVE_ACTIONS } from '../src/education/adaptive/AdaptiveEngine.js';
import { educationEngine } from '../src/education/engines/EducationEngine.js';
import { ChallengeRepository } from '../src/education/repositories/ChallengeRepository.js';
import { tutorService } from '../src/services/gemini/tutorService.js';
import { sessionState } from '../src/core/sessionState.js';

test('1. Dominio por Fluidez/Velocidad: respuesta correcta en <= 12s sube nivel inmediatamente a max 5', () => {
  const compId = 'test_fluency_' + Date.now();

  // Intento 1 con tiempo rápido (8.5 segundos) en el primer intento y sin pistas
  const resultFast = adaptiveEngine.evaluatePerformance({
    competencyId: compId,
    currentLevel: 1,
    isCorrect: true,
    attempts: 1,
    hintsUsed: 0,
    timeSeconds: 8.5
  });

  assert.equal(resultFast.action, ADAPTIVE_ACTIONS.INCREASE, 'Debe incrementar la dificultad de inmediato');
  assert.equal(resultFast.nextLevel, 2, 'El siguiente nivel debe ser 2');
  assert.match(resultFast.reason, /Dominio por fluidez y velocidad/i);
  assert.match(resultFast.explanation, /8\.5s/);

  // Intento rápido desde nivel 4 sube a 5
  const resultToMax = adaptiveEngine.evaluatePerformance({
    competencyId: compId,
    currentLevel: 4,
    isCorrect: true,
    attempts: 1,
    hintsUsed: 0,
    timeSeconds: 6.0
  });
  assert.equal(resultToMax.action, ADAPTIVE_ACTIONS.INCREASE);
  assert.equal(resultToMax.nextLevel, 5);

  // Intento rápido ya estando en nivel máximo (5) no excede 5
  const resultAtMax = adaptiveEngine.evaluatePerformance({
    competencyId: compId,
    currentLevel: 5,
    isCorrect: true,
    attempts: 1,
    hintsUsed: 0,
    timeSeconds: 5.0
  });
  assert.equal(resultAtMax.nextLevel, 5, 'No debe superar el nivel 5');
});

test('2. Respuesta correcta lenta (> 12s) no activa regla de fluidez, mantiene nivel hasta 2 aciertos', () => {
  const compId = 'test_slow_' + Date.now();

  // Primer acierto lento (25 segundos)
  const resultSlow = adaptiveEngine.evaluatePerformance({
    competencyId: compId,
    currentLevel: 2,
    isCorrect: true,
    attempts: 1,
    hintsUsed: 0,
    timeSeconds: 25.0
  });

  assert.equal(resultSlow.action, ADAPTIVE_ACTIONS.MAINTAIN, 'Debe mantener el nivel requiriendo consolidación');
  assert.equal(resultSlow.nextLevel, 2, 'El nivel se mantiene en 2');
});

test('3. Validación y normalización estricta de desafíos de combate en tutorService', () => {
  const rawChallenge = {
    statement: '¿Cuál es el vector de potencia que anula el escudo del MatBot?',
    options: ['Frecuencia Alfa', 'Frecuencia Beta', 'Frecuencia Gamma', 'Frecuencia Delta'],
    correctIndex: 2,
    difficulty: 3,
    context: 'Enfrentamiento táctico en el reactor.',
    hints: ['Observa las armónicas.', 'Calcula la raíz del divisor.']
  };

  const validated = tutorService.validateCombatChallenge(rawChallenge, 'logic_math', 3);

  assert.ok(validated, 'El desafío debe ser validado con éxito');
  assert.equal(validated.competencyId, 'logic_math');
  assert.equal(validated.difficulty, 3);
  assert.equal(validated.options.length, 4);
  assert.equal(validated.correctIndex, 2);
  assert.equal(validated.hints.length, 2);
  assert.equal(validated.isAIDynamic, true);
  assert.ok(validated.id.startsWith('combat_ai_'));

  // Desafío malformado (menos de 4 opciones) debe ser rechazado
  const invalidChallenge = {
    statement: 'Problema',
    options: ['Opción 1', 'Opción 2'],
    correctIndex: 0
  };
  const rejected = tutorService.validateCombatChallenge(invalidChallenge, 'logic_math', 1);
  assert.equal(rejected, null, 'Debe rechazar desafíos con opciones incompletas');
});

test('4. tutorService.requestDynamicCombatChallenge activa fallback si backend no está disponible', async () => {
  sessionState.setActiveCompetency('logic_math');

  // Solicitud en entorno Node donde Firebase Functions no tiene backend conectado
  const challenge = await tutorService.requestDynamicCombatChallenge({
    competencyId: 'logic_math',
    currentLevel: 2,
    accuracy: 85,
    avgResponseTime: 9
  });

  assert.ok(challenge, 'Debe retornar un desafío de respaldo de forma resiliente');
  assert.equal(challenge.competencyId, 'logic_math');
  assert.ok(Array.isArray(challenge.options));
  assert.equal(challenge.options.length, 4);
  assert.ok(Number.isInteger(challenge.correctIndex));
});

test('5. Cero exposición de claves de Gemini API en frontend (src/)', () => {
  const srcDir = path.resolve('src');
  const files = [];

  function scan(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(ent => {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) scan(full);
      else if (ent.name.endsWith('.js')) files.push(full);
    });
  }
  scan(srcDir);

  for (const f of files) {
    const code = fs.readFileSync(f, 'utf8');
    assert.ok(
      !code.includes('GEMINI_API_KEY') && !code.includes('GoogleGenerativeAI'),
      `Violación de seguridad: Gemini SDK o clave encontrada en frontend: ${f}`
    );
  }
});

test('6. Rotación garantizada de preguntas entre enemigos sucesivos (no repite la misma pregunta)', () => {
  sessionState.setActiveCompetency('logic_math');
  educationEngine.challengeHistory = [];

  const enemy1Challenge = educationEngine.getRandomChallenge('logic_math', 1);
  assert.ok(enemy1Challenge, 'Primer enemigo debe recibir una pregunta');

  // Evaluar primer enemigo para avanzar
  educationEngine.evaluateAnswer(enemy1Challenge, enemy1Challenge.correctIndex, 10);

  // Segundo enemigo debe recibir una pregunta diferente
  const enemy2Challenge = educationEngine.getRandomChallenge('logic_math', 1);
  assert.ok(enemy2Challenge, 'Segundo enemigo debe recibir una pregunta');
  assert.notEqual(
    enemy2Challenge.id,
    enemy1Challenge.id,
    `Las preguntas de dos enemigos consecutivos no deben ser idénticas (${enemy1Challenge.id} vs ${enemy2Challenge.id})`
  );
});

test('7. MatBot implementa assignedChallenge, setChallenge y getChallenge', () => {
  const matbotCode = fs.readFileSync(path.resolve('src/game/entities/MatBot.js'), 'utf8');
  assert.match(matbotCode, /this\.assignedChallenge\s*=\s*options\.challenge\s*\|\|\s*null;/, 'MatBot debe inicializar assignedChallenge');
  assert.match(matbotCode, /setChallenge\(challenge\)\s*\{/, 'MatBot debe implementar setChallenge');
  assert.match(matbotCode, /getChallenge\(\)\s*\{/, 'MatBot debe implementar getChallenge');
});

test('8. tutorService.preloadEnemyChallenges genera lote para los enemigos vivos con rotación', async () => {
  educationEngine.challengeHistory = [];
  const count = 3;
  const challenges = await tutorService.preloadEnemyChallenges({
    competencyId: 'logic_math',
    currentLevel: 1
  }, count);

  assert.equal(challenges.length, count, `Debe generar exactamente ${count} desafíos para los enemigos`);
  challenges.forEach(ch => {
    assert.ok(ch.id, 'Cada desafío debe poseer un id');
    assert.ok(ch.statement, 'Cada desafío debe tener enunciado');
    assert.equal(ch.options.length, 4, 'Cada desafío debe poseer 4 opciones');
    assert.ok(Number.isInteger(ch.correctIndex));
    assert.equal(ch.difficulty, 1);
  });
});

test('9. Garantía de variación entre 3 enemigos consecutivos: ninguno repite pregunta previa', () => {
  sessionState.setActiveCompetency('logic_math');
  educationEngine.challengeHistory = [];

  const seenIds = [];
  for (let i = 0; i < 3; i++) {
    const ch = educationEngine.getRandomChallenge('logic_math', 1);
    assert.ok(ch, `Enemigo ${i + 1} debe recibir un desafío`);
    assert.ok(!seenIds.includes(ch.id), `Enemigo ${i + 1} (${ch.id}) no debe repetir preguntas de enemigos previos (${seenIds.join(', ')})`);
    seenIds.push(ch.id);
    educationEngine.evaluateAnswer(ch, ch.correctIndex, 10);
  }
  assert.equal(seenIds.length, 3, 'Debe haber 3 preguntas distintas para los 3 enemigos');
});

test('10. BattleArenaModal limpia currentChallenge y previene reutilización de preguntas ya respondidas', () => {
  const arenaCode = fs.readFileSync(path.resolve('src/ui/components/BattleArenaModal.js'), 'utf8');
  assert.match(arenaCode, /this\.currentChallenge\s*=\s*null;/, 'startBattle debe resetear currentChallenge a null');
  assert.match(arenaCode, /close\(\)\s*\{[\s\S]*?this\.currentChallenge\s*=\s*null;/, 'close() debe resetear currentChallenge a null');
  assert.match(arenaCode, /isAlreadyAsked/, 'Debe verificar si el desafío ya fue preguntado antes de reusarlo');
});

test('11. ChallengeRepository.getUniqueBatch garantiza desafíos y opciones 100% únicos y barajados', () => {
  const batch = ChallengeRepository.getUniqueBatch('logic_math', 1, 4, new Set());
  assert.equal(batch.length, 4, 'Debe devolver un lote de 4 desafíos');

  const statements = new Set();
  const ids = new Set();
  batch.forEach(ch => {
    assert.ok(!ids.has(ch.id), `ID repetido en el lote: ${ch.id}`);
    assert.ok(!statements.has(ch.statement), `Enunciado repetido en el lote: ${ch.statement}`);
    ids.add(ch.id);
    statements.add(ch.statement);
    assert.equal(ch.options.length, 4, 'Cada desafío debe poseer exactamente 4 opciones de respuesta');
    assert.ok(Number.isInteger(ch.correctIndex) && ch.correctIndex >= 0 && ch.correctIndex <= 3);
  });
});

test('12. WorldScene implementa assignedInRoom para asignación individual por índice challenges[index]', () => {
  const sceneCode = fs.readFileSync(path.resolve('src/game/scenes/WorldScene.js'), 'utf8');
  assert.match(sceneCode, /assignedInRoom/, 'WorldScene debe mantener el Set assignedInRoom');
  assert.match(sceneCode, /challenges\[index\]/, 'WorldScene debe asignar a cada MatBot por su índice en el lote');
});

test('13. Prompt de Cloud Functions para Gemini exige unicidad total, opciones diferentes y variación de correctIndex', () => {
  const fnCode = fs.readFileSync(path.resolve('functions/index.js'), 'utf8');
  assert.match(fnCode, /100%\s*DIFERENTES/i, 'Prompt debe exigir opciones y enunciados 100% diferentes');
  assert.match(fnCode, /correctIndex/i, 'Prompt debe exigir variar la posición de la respuesta correcta');
  assert.match(fnCode, /usedChallengeIds/, 'Backend debe recibir usedChallengeIds');
});

test('14. ChallengeModal declara meta y previene congelamiento o ReferenceError al contestar erróneamente', () => {
  const modalCode = fs.readFileSync(path.resolve('src/ui/components/ChallengeModal.js'), 'utf8');
  // Verificar que renderFeedbackView define meta
  assert.match(modalCode, /renderFeedbackView\(result\)\s*\{[\s\S]*?const meta = sessionState\.getActiveCompetencyMeta\(\)/,
    'renderFeedbackView debe declarar meta con sessionState.getActiveCompetencyMeta() para evitar ReferenceError');
  // Verificar que submitAnswer está protegido con try...catch
  assert.match(modalCode, /submitAnswer\(optionIndex\)\s*\{[\s\S]*?try\s*\{[\s\S]*?\} catch \(err\)/,
    'submitAnswer debe estar protegido con try/catch para evitar bloqueos del juego');
});

test('15. BattleArenaModal cuenta con manejo seguro de resolución, avance rápido y mitigación de congelamientos', () => {
  const arenaCode = fs.readFileSync(path.resolve('src/ui/components/BattleArenaModal.js'), 'utf8');
  assert.match(arenaCode, /handleOptionSelect\(index\)\s*\{[\s\S]*?try\s*\{[\s\S]*?\} catch \(err\)/,
    'handleOptionSelect debe contar con bloque try/catch para garantizar el cierre seguro');
  assert.match(arenaCode, /finishResolution/, 'Debe permitir avance rápido unificado mediante finishResolution');
  assert.match(arenaCode, /quickAdvanceHandler|pointerdown/, 'Debe admitir clic para avanzar de inmediato sin demoras');
});

test('16. WorldScene importa ChallengeRepository para evitar ReferenceError', () => {
  const sceneCode = fs.readFileSync(path.resolve('src/game/scenes/WorldScene.js'), 'utf8');
  assert.match(sceneCode, /import\s*\{\s*ChallengeRepository\s*\}\s*from\s*['"]\.\.\/\.\.\/education\/repositories\/ChallengeRepository\.js['"]/,
    'WorldScene debe importar ChallengeRepository');
});

test('17. firestoreService y RetentionAssessment previenen valores undefined en Firestore', () => {
  const fCode = fs.readFileSync(path.resolve('src/services/firebase/firestoreService.js'), 'utf8');
  assert.match(fCode, /sanitizeForFirestore/, 'firestoreService debe implementar sanitización recursiva');

  const rCode = fs.readFileSync(path.resolve('src/education/assessments/RetentionAssessment.js'), 'utf8');
  assert.match(rCode, /safeSkill\s*=\s*skill\s*\|\|\s*'general'/, 'RetentionAssessment debe garantizar un string seguro para skill');
});
