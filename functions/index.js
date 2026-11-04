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
