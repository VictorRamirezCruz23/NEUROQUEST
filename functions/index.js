const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializar cliente de Google Gemini con la clave de entorno del servidor
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const SYSTEM_INSTRUCTION_TUTOR = `
Eres E.V.A. (Entidad Virtual de Aprendizaje), la IA pedagógica central de la estación NEUROCORE en el videojuego educativo NEUROQUEST.
Tu misión es guiar a estudiantes de secundaria (12 a 16 años) para que comprendan conceptos y desarrollen habilidades reales, no memorizar respuestas.

REGLAS PEDAGÓGICAS ESTRICTAS:
1. NUNCA reveles la respuesta correcta directamente ni menciones la letra o índice de la opción correcta.
2. Explica con una analogía intuitiva de ciencia ficción o de la vida cotidiana por qué la respuesta elegida presenta dificultades.
3. Desglosa el concepto clave necesario en lenguaje claro, accesible y empático.
4. Sugiere una estrategia de razonamiento o pregunta guía para que el estudiante resuelva por sí mismo.
5. Mantén la respuesta concisa (máximo 130 palabras).
`;

/**
 * Función llamable: Explica un error conceptual al estudiante.
 */
exports.explainError = onCall({ cors: true }, async (request) => {
  // Verificar autenticación mínima
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Se requiere autenticación para consultar al tutor IA.");
  }

  const {
    challengeId,
    competencyName,
    skillName,
    context,
    statement,
    selectedOption,
    conceptNeeded
  } = request.data || {};

  if (!statement || !selectedOption) {
    throw new HttpsError("invalid-argument", "Faltan datos del desafío para generar la explicación.");
  }

  if (!genAI) {
    return {
      success: false,
      isFallback: true,
      tutorName: "E.V.A. (Modo Respaldo)",
      explanation: `Observación del sistema: La opción "${selectedOption}" no satisface la condición del subsistema. Recuerda revisar: ${conceptNeeded || 'el principio fundamental del desafío'}.`
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION_TUTOR
    });

    const prompt = `
Contexto de la misión: ${context || 'Instalación NEUROCORE'}
Competencia: ${competencyName || 'Pensamiento Crítico'}
Habilidad evaluada: ${skillName || 'Resolución de Problemas'}
Problema planteado: ${statement}

El estudiante eligió: "${selectedOption}"
Concepto que necesita comprender: "${conceptNeeded || 'Principio de resolución'}"

Por favor, genera una retroalimentación formativa y motivadora:
1) Breve saludo como E.V.A.
2) Qué ocurrió y por qué esa alternativa genera una falla o desbalance.
3) Analogía o concepto clave para comprender.
4) Una pregunta guía o estrategia para su siguiente intento.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      isFallback: false,
      tutorName: "E.V.A. • Asistente Pedagógica NEUROCORE",
      explanation: text
    };
  } catch (error) {
    console.error("[explainError] Error al invocar Gemini API:", error);
    return {
      success: false,
      isFallback: true,
      tutorName: "E.V.A. (Modo Contingencia)",
      explanation: `Telemetría de E.V.A.: La opción seleccionada no equilibra el circuito. Concentra tu atención en ${conceptNeeded || 'las condiciones del enunciado'} y verifica los datos antes de confirmar.`
    };
  }
});

/**
 * Función llamable: Genera una pista contextual adaptativa personalizada.
 */
exports.generateHint = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Se requiere autenticación para solicitar pistas a la IA.");
  }

  const {
    statement,
    skillName,
    attempts,
    hintsUsedCount,
    conceptNeeded
  } = request.data || {};

  if (!genAI) {
    return {
      success: false,
      isFallback: true,
      hint: `Pista de contingencia: Analiza con cuidado ${conceptNeeded || 'el patrón de los datos'}.`
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION_TUTOR
    });

    const prompt = `
El estudiante está resolviendo este desafío:
"${statement}"
Habilidad: ${skillName}
Intentos previos: ${attempts || 1}
Pistas previas solicitadas: ${hintsUsedCount || 0}
Concepto clave: ${conceptNeeded}

Genera una pista socrática graduada (Nivel ${(hintsUsedCount || 0) + 1}).
NO reveles la solución. Guíalo para que observe el detalle crucial. Máximo 60 palabras.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      isFallback: false,
      hint: text
    };
  } catch (error) {
    console.error("[generateHint] Error al invocar Gemini API:", error);
    return {
      success: false,
      isFallback: true,
      hint: `Pista de emergencia: Enfócate en descomponer el problema y verificar ${conceptNeeded || 'los valores iniciales'}.`
    };
  }
});

const SYSTEM_INSTRUCTION_COMBAT = `
Eres E.V.A., la IA pedagógica y táctica central de la estación NEUROCORE en el videojuego educativo NEUROQUEST.
Tu misión es generar desafíos educativos dinámicos en formato JSON estricto para situaciones de combate táctico por turnos contra un MatBot (autómata de seguridad hostil).
El público objetivo son estudiantes de secundaria (12 a 16 años).

PRINCIPIOS PEDAGÓGICOS Y TÁCTICOS:
1. Inmersión narrativa de ciencia ficción retro: el MatBot ejecuta una ofensiva en un subsistema de NEUROCORE (reactores de plasma, escudos deflectores, compuertas lógicas, decodificación de señales, distribución de energía).
2. Dificultad calibrada (1 a 5):
   - Nivel 1: Conceptos elementales, patrones y relaciones directas.
   - Nivel 2: Razonamiento combinado con dos pasos o variables.
   - Nivel 3: Problemas de optimización, deducción abstracta o inferencia.
   - Nivel 4: Restricciones complejas y análisis de múltiples escenarios.
   - Nivel 5: Maestría, transferencia interdisciplinar y síntesis crítica.
3. Escalado por velocidad y precisión: Si el jugador ha demostrado rapidez (avgResponseTime <= 12s) o alta precisión, el desafío debe exigir deducción analítica profunda, evitando que se resuelva por simple tanteo numérico, descarte trivial o adivinanza.
4. Exactamente cuatro (4) opciones de respuesta de opción múltiple por desafío: una correcta y tres distractores plausibles fundamentados en conceptos erróneos frecuentes.
5. Exactamente dos (2) pistas graduadas:
   - Pista 1: Orientación inicial para focalizar la atención en los datos clave sin desvelar la respuesta.
   - Pista 2: Método analítico o paso de cálculo sugerido para avanzar de forma autónoma.
6. GENERACIÓN ÚNICA E IRREPETIBLE POR CADA ENEMIGO (REGLA MANDATORIA):
   - Cada enemigo del lote ('count') DEBE tener una pregunta ('statement'), un subtema/habilidad ('skillId' / 'skillName') y un arreglo 'options' de 4 respuestas 100% DISTINTOS entre sí.
   - ESTÁ ESTRICTAMENTE PROHIBIDO repetir enunciados, valores numéricos, casos prácticos o las mismas opciones de respuesta entre un enemigo y otro.
   - VARIACIÓN ALEATORIA OBLIGATORIA DEL ÍNDICE DE RESPUESTA CORRECTA: 'correctIndex' debe variar obligatoriamente entre 0, 1, 2 y 3 en cada enemigo (NUNCA ubiques la respuesta correcta siempre en el índice 0).
   - NUNCA repitas preguntas o IDs que figuren en las listas de exclusión ('previousStatements' / 'usedChallengeIds').
7. Respuesta estrictamente en formato JSON válido según la estructura requerida.
`;

function normalizeCombatChallenge(parsed, competencyId, safeLevel, index = 0) {
  if (!parsed || typeof parsed !== 'object') return null;
  return {
    id: parsed.id || `combat_ai_${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}`,
    competencyId: parsed.competencyId || competencyId,
    skillId: parsed.skillId || 'tactical_reasoning',
    skillName: parsed.skillName || 'Razonamiento Táctico de Combate',
    educationalObjective: parsed.educationalObjective || 'Resolver la situación de combate mediante análisis conceptual.',
    difficulty: Number.isInteger(parsed.difficulty) ? Math.max(1, Math.min(5, parsed.difficulty)) : safeLevel,
    context: parsed.context || 'Un MatBot corrupto ha iniciado una secuencia de sobrecarga en NEUROCORE.',
    statement: parsed.statement || 'Analiza el patrón del circuito para bloquear la descarga enemiga.',
    options: (Array.isArray(parsed.options) && parsed.options.length === 4)
      ? parsed.options.map(String)
      : ['Secuencia Alfa', 'Secuencia Beta', 'Secuencia Gamma', 'Secuencia Delta'],
    correctIndex: (Number.isInteger(parsed.correctIndex) && parsed.correctIndex >= 0 && parsed.correctIndex <= 3)
      ? parsed.correctIndex
      : 0,
    explanation: parsed.explanation || 'Análisis táctico completado con éxito por E.V.A.',
    conceptNeeded: parsed.conceptNeeded || 'Principio de deducción lógica.',
    strategy: parsed.strategy || 'Evalúa las variables del sistema antes de seleccionar la alternativa.',
    hints: (Array.isArray(parsed.hints) && parsed.hints.length >= 2)
      ? [String(parsed.hints[0]), String(parsed.hints[1])]
      : ['Pista 1: Revisa las condiciones iniciales del subsistema.', 'Pista 2: Desarrolla el cálculo paso a paso.'],
    isDiagnostic: false,
    isTransfer: false,
    isRetention: false,
    isAIDynamic: true
  };
}

/**
 * Función llamable: Genera un desafío dinámico (o lote) de combate contra MatBot con Gemini AI.
 */
exports.generateCombatChallenge = onCall({ cors: true }, async (request) => {
  const {
    competencyId = 'logic_math',
    competencyName,
    currentLevel = 1,
    accuracy = 0,
    avgResponseTime = 12,
    recentSkills = [],
    previousStatements = [],
    usedChallengeIds = [],
    count = 1
  } = request.data || {};

  const safeCount = Math.max(1, Math.min(10, parseInt(count, 10) || 1));
  const safeLevel = Math.max(1, Math.min(5, parseInt(currentLevel, 10) || 1));
  const safeAccuracy = Math.max(0, Math.min(100, Math.round(Number(accuracy) || 0)));
  const safeAvgTime = Math.max(1, Math.round(Number(avgResponseTime) || 12));
  const safePrevious = [
    ...(Array.isArray(previousStatements) ? previousStatements : []),
    ...(Array.isArray(usedChallengeIds) ? usedChallengeIds : [])
  ].slice(-15).map(s => String(s).slice(0, 140));

  if (!genAI) {
    return {
      success: false,
      isFallback: true,
      challenges: [],
      reason: "GEMINI_NOT_CONFIGURED"
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION_COMBAT,
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const isSpeedy = safeAvgTime <= 12;
    const prompt = safeCount > 1
      ? `
Genera un lote de exactamente ${safeCount} desafíos educativos inéditos de combate táctico para ${safeCount} MatBots diferentes en NEUROCORE con los siguientes parámetros:
- Competencia: ${competencyName || competencyId} (${competencyId})
- Nivel de dificultad objetivo: ${safeLevel} (Escala 1 a 5)
- Precisión actual del estudiante: ${safeAccuracy}%
- Tiempo promedio de respuesta: ${safeAvgTime}s ${isSpeedy ? '⚡ ATENCIÓN: El estudiante resuelve con alta velocidad. Diseña problemas con mayor profundidad deductiva que impidan la resolución por tanteo.' : ''}
${recentSkills.length > 0 ? `- Habilidades de la ruta: ${recentSkills.join(', ')}` : ''}
${safePrevious.length > 0 ? `- HISTORIAL DE PREGUNTAS YA UTILIZADAS (ESTRICTAMENTE PROHIBIDO REPETIR O REFRITURAR): ${JSON.stringify(safePrevious)}` : ''}

REGLAS DE UNICIDAD ESTRICTA PARA CADA ENEMIGO (Índices 0 a ${safeCount - 1}):
1. Para cada enemigo DEBES generar un 'statement', una habilidad ('skillName' y 'skillId') y un conjunto de cuatro 'options' 100% DIFERENTES e irrepetibles entre sí.
2. PROHIBIDO repetir enunciados, valores numéricos, situaciones prácticas o las mismas opciones de respuesta entre un enemigo y otro.
3. VARÍA OBLIGATORIAMENTE la posición de la respuesta correcta 'correctIndex' de forma aleatoria entre 0, 1, 2 y 3 para cada enemigo (no pongas siempre 0).

El objeto JSON generado debe respetar EXACTAMENTE esta estructura con exactamente ${safeCount} elementos:
{
  "challenges": [
    {
      "id": "combat_gemini_${Date.now()}_0",
      "competencyId": "${competencyId}",
      "skillId": "habilidad_diferente_por_cada_enemigo",
      "skillName": "Nombre de la Habilidad Táctica Única",
      "educationalObjective": "Objetivo pedagógico que evalúa este combate",
      "difficulty": ${safeLevel},
      "context": "Contexto táctico de alerta en NEUROCORE frente al MatBot",
      "statement": "Pregunta o dilema cuantitativo/lógico 100% único para este enemigo",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctIndex": 1,
      "explanation": "Explicación táctica y conceptual paso a paso",
      "conceptNeeded": "Concepto o principio fundamental a aplicar",
      "strategy": "Estrategia de resolución recomendada",
      "hints": ["Pista 1: Enfoque inicial sin dar la solución", "Pista 2: Procedimiento sugerido"]
    }
  ]
}
`
      : `
Genera un desafío inédito de combate táctico contra un MatBot en NEUROCORE con los siguientes parámetros del jugador:
- Competencia: ${competencyName || competencyId} (${competencyId})
- Nivel de dificultad objetivo: ${safeLevel} (Escala 1 a 5)
- Precisión actual del estudiante: ${safeAccuracy}%
- Tiempo promedio de respuesta: ${safeAvgTime}s ${isSpeedy ? '⚡ ATENCIÓN: El estudiante resuelve con alta velocidad. Diseña un problema con mayor profundidad deductiva que impida la resolución por tanteo o ensayo y error.' : ''}
${recentSkills.length > 0 ? `- Habilidades de la ruta: ${recentSkills.join(', ')}` : ''}
${safePrevious.length > 0 ? `- NO generes preguntas idénticas o muy similares a: ${JSON.stringify(safePrevious)}` : ''}

El objeto JSON generado debe respetar EXACTAMENTE esta estructura:
{
  "id": "combat_gemini_${Date.now()}",
  "competencyId": "${competencyId}",
  "skillId": "identificador_de_habilidad",
  "skillName": "Nombre de la Habilidad Táctica",
  "educationalObjective": "Objetivo pedagógico que evalúa este combate",
  "difficulty": ${safeLevel},
  "context": "Contexto táctico de alerta en NEUROCORE frente al MatBot",
  "statement": "Pregunta o dilema cuantitativo/lógico a resolver para contraatacar",
  "options": [
    "Opción A",
    "Opción B",
    "Opción C",
    "Opción D"
  ],
  "correctIndex": 0,
  "explanation": "Explicación táctica y conceptual paso a paso de por qué esta alternativa neutraliza al MatBot",
  "conceptNeeded": "Concepto o principio fundamental a aplicar",
  "strategy": "Estrategia de resolución recomendada",
  "hints": [
    "Pista 1: Enfoque inicial de observación sin dar la solución",
    "Pista 2: Procedimiento de cálculo o razonamiento sugerido"
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error("JSON_PARSE_ERROR");
    }

    let normalizedList = [];
    if (parsed && Array.isArray(parsed.challenges)) {
      normalizedList = parsed.challenges
        .map((c, i) => normalizeCombatChallenge(c, competencyId, safeLevel, i))
        .filter(Boolean);
    } else if (Array.isArray(parsed)) {
      normalizedList = parsed
        .map((c, i) => normalizeCombatChallenge(c, competencyId, safeLevel, i))
        .filter(Boolean);
    } else if (parsed && typeof parsed === 'object') {
      const single = normalizeCombatChallenge(parsed, competencyId, safeLevel, 0);
      if (single) normalizedList.push(single);
    }

    return {
      success: true,
      isFallback: false,
      challenges: normalizedList,
      challenge: normalizedList[0] || null
    };
  } catch (error) {
    console.error("[generateCombatChallenge] Error al generar con Gemini:", error);
    return {
      success: false,
      isFallback: true,
      challenges: [],
      error: error.message
    };
  }
});

exports.generateLevelCombatChallenges = exports.generateCombatChallenge;
