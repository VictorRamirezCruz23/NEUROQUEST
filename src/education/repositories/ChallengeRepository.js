/**
 * ChallengeRepository.js — Repositorio de desafíos educativos de NEUROQUEST.
 * Almacena el banco curricular estructurado según el modelo pedagógico activo.
 */

export const CHALLENGES_BANK = {
  logic_math: [
    {
      id: 'LM_DIAG_01',
      competencyId: 'logic_math',
      skillId: 'patterns_sequences',
      skillName: 'Secuencias y Patrones Numéricos',
      educationalObjective: 'Identificar la regla de recurrencia en series alternadas para predecir el siguiente valor.',
      difficulty: 1,
      isDiagnostic: true,
      context: 'El generador de pulsos del Núcleo de Lógica emite una frecuencia rítmica que ha quedado incompleta en el monitor.',
      statement: 'Observa la secuencia de resonancia cuántica en la consola:\n\n3,  7,  15,  31,  63,  [ ? ]\n\n¿Cuál es el valor que equilibra el siguiente pulso?',
      options: [
        '95 (Aumento lineal de +32)',
        '127 (Regla: Multiplicar por 2 y sumar 1)',
        '126 (Regla: Duplicar el número anterior)',
        '115 (Aumento constante de +48)'
      ],
      correctIndex: 1,
      explanation: 'La regla que rige la serie es: Siguiente = (Anterior × 2) + 1. Comprobación: (3×2)+1=7; (7×2)+1=15; (15×2)+1=31; (31×2)+1=63; por lo tanto: (63×2) + 1 = 126 + 1 = 127.',
      conceptNeeded: 'Progresiones algebraicas y recursividad multiplicativa.',
      strategy: 'Calcula la diferencia entre términos contiguos (+4, +8, +16, +32). Observa que la diferencia se duplica en cada paso (+64). 63 + 64 = 127.',
      hints: [
        'Pista 1 (Observación): Analiza la diferencia entre cada número: de 3 a 7 hay 4; de 7 a 15 hay 8; de 15 a 31 hay 16.',
        'Pista 2 (Estrategia): Las diferencias se van duplicando en cada salto: +4, +8, +16, +32... ¿Cuánto debes sumar a 63?'
      ]
    },
    {
      id: 'LM_CHALLENGE_02',
      competencyId: 'logic_math',
      skillId: 'fractions_ratios',
      skillName: 'Fracciones y Razones de Energía',
      educationalObjective: 'Calcular proporciones relativas para equilibrar reactores desacoplados.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'El reactor de plasma requiere una mezcla exacta: 3/5 de energía de plasma azul y el resto de energía de plasma cian.',
      statement: 'Si la capacidad total del reactor es de 450 gigavatios (GW):\n\n¿Cuántos GW de energía cian se necesitan para lograr el balance óptimo?',
      options: [
        '270 GW (Corresponde a los 3/5 de plasma azul)',
        '180 GW (Corresponde a los 2/5 restantes de plasma cian)',
        '150 GW (Equivalente a un tercio de la capacidad)',
        '90 GW (Equivalente a un quinto de la capacidad)'
      ],
      correctIndex: 1,
      explanation: 'Si el plasma azul ocupa 3/5, el plasma cian debe ocupar la fracción restante: 1 - 3/5 = 2/5. Calculando los 2/5 de 450 GW: (450 ÷ 5) × 2 = 90 × 2 = 180 GW.',
      conceptNeeded: 'Fracción de una cantidad y fracciones complementarias.',
      strategy: 'Primero divide el total entre el denominador (450 ÷ 5 = 90 GW por cada quinto) y luego multiplica por las partes correspondientes.',
      hints: [
        'Pista 1: Si 3 partes de cada 5 son azules, ¿cuántas partes de cada 5 son cian para completar el total?',
        'Pista 2: Cada quinto (1/5) equivale a 450 ÷ 5 = 90 GW. Necesitas 2 quintos (2/5).'
      ]
    },
    {
      id: 'LM_CHALLENGE_03',
      competencyId: 'logic_math',
      skillId: 'combined_operations',
      skillName: 'Operaciones Combinadas y Jerarquía',
      educationalObjective: 'Aplicar rigurosamente la jerarquía de operaciones con paréntesis, potencias y multiplicaciones.',
      difficulty: 2,
      isDiagnostic: false,
      context: 'La compuerta del subsector requiere recalibrar el código numérico de seguridad evaluando la fórmula de derivación.',
      statement: 'Calcula el valor exacto del código de derivación:\n\nCódigo = 48 - 6 × (3² - 5) + 16 ÷ 4',
      options: [
        '172 (Si se opera de izquierda a derecha sin jerarquía)',
        '28 (Aplicando correctamente potencias, paréntesis y productos)',
        '36 (Omisión del producto prioritario)',
        '40 (Error de signo en la sustracción final)'
      ],
      correctIndex: 1,
      explanation: 'Siguiendo la jerarquía: 1) Paréntesis y potencias: 3² = 9; (9 - 5) = 4. 2) Multiplicaciones y divisiones: 6 × 4 = 24; 16 ÷ 4 = 4. 3) Sumas y restas de izquierda a derecha: 48 - 24 + 4 = 24 + 4 = 28.',
      conceptNeeded: 'Jerarquía de operaciones matemáticas (PEMDAS).',
      strategy: 'Resuelve primero lo que está dentro del paréntesis, respetando la potencia (3² = 9). Luego realiza multiplicaciones y divisiones antes de sumar o restar.',
      hints: [
        'Pista 1: Recuerda el orden de prioridad: 1º Paréntesis (resuelve 3² - 5), 2º Multiplicaciones y Divisiones, 3º Sumas y Restas.',
        'Pista 2: Dentro del paréntesis 3² = 9, así que (9 - 5) = 4. Ahora la expresión es: 48 - 6 × 4 + 16 ÷ 4.'
      ]
    },
    {
      id: 'LM_CHALLENGE_04',
      competencyId: 'logic_math',
      skillId: 'deductive_reasoning',
      skillName: 'Razonamiento Deductivo y Lógica',
      educationalObjective: 'Deducir valores desconocidos a partir de premisas cuantitativas interdependientes.',
      difficulty: 2,
      isDiagnostic: false,
      context: 'Tres condensadores (Alfa, Beta y Gamma) suman una carga conjunta de 120 kilovatios. Alfa tiene el doble de carga que Beta, y Gamma tiene 20 kW más que Beta.',
      statement: '¿Cuál es la carga exacta del condensador Alfa?',
      options: [
        '50 kW (Valor del condensador Gamma)',
        '25 kW (Valor del condensador Beta)',
        '50 kW (Cálculo sin considerar la diferencia de Gamma)',
        '50 kW para Beta y 100 kW para Alfa',
        '50 kW'
      ],
      // We will present standard 4 options:
      options: [
        '50 kW (Alfa tiene 50 kW, Beta 25 kW y Gamma 45 kW)',
        '60 kW (Alfa tiene el doble de Beta que vale 25 kW, pero no cumple la suma)',
        '50 kW (Alfa = 2 × 25 kW = 50 kW)',
        '40 kW (Alfa = 40 kW, Beta = 20 kW, Gamma = 60 kW)'
      ],
      correctIndex: 0,
      explanation: 'Planteando la ecuación: Beta = x; Alfa = 2x; Gamma = x + 20. Suma: 2x + x + (x + 20) = 120 -> 4x + 20 = 120 -> 4x = 100 -> x = 25 kW (Beta). Por tanto Alfa = 2 × 25 = 50 kW (y Gamma = 25 + 20 = 45 kW. Verificación: 50 + 25 + 45 = 120 kW).',
      conceptNeeded: 'Modelación algebraica de enunciados y ecuaciones de primer grado.',
      strategy: 'Define una incógnita x para el elemento de referencia (Beta). Expresa Alfa y Gamma en función de x y suma las tres partes igualándolas a 120.',
      hints: [
        'Pista 1: Toma a Beta como referencia con valor "x". Entonces Alfa es "2x" y Gamma es "x + 20".',
        'Pista 2: La suma de los tres es: 2x + x + (x + 20) = 120. Despeja el valor de x para hallar Beta, luego multiplícalo por 2 para Alfa.'
      ]
    }
  ]
};

export class ChallengeRepository {
  /**
   * Obtiene los desafíos correspondientes a una competencia.
   * @param {string} competencyId
   * @returns {Array}
   */
  static getChallengesByCompetency(competencyId) {
    return CHALLENGES_BANK[competencyId] || [];
  }

  /**
   * Obtiene un desafío específico por su ID.
   * @param {string} challengeId
   * @returns {Object|null}
   */
  static getChallengeById(challengeId) {
    for (const compId in CHALLENGES_BANK) {
      const match = CHALLENGES_BANK[compId].find(c => c.id === challengeId);
      if (match) return match;
    }
    return null;
  }
}
