/**
 * ChallengeRepository.js — Repositorio de desafíos educativos de NEUROQUEST.
 * Contiene el banco curricular de las 4 competencias seleccionables.
 */

export const CHALLENGES_BANK = {
  // 1. RUTA 01: Pensamiento Lógico y Matemático (Mundo 01: Núcleo de Lógica)
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
        'Pista 1: Analiza la diferencia entre cada número: de 3 a 7 hay 4; de 7 a 15 hay 8; de 15 a 31 hay 16.',
        'Pista 2: Las diferencias se duplican en cada salto: +4, +8, +16, +32... ¿Cuánto debes sumar a 63?'
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
      context: 'El reactor de plasma requiere una mezcla exacta: 3/5 de plasma azul y el resto de plasma cian.',
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
      strategy: 'Divide el total entre 5 (450 ÷ 5 = 90 GW por quinto) y multiplica por 2.',
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
      educationalObjective: 'Aplicar rigurosamente la jerarquía de operaciones matemáticas (PEMDAS).',
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
      explanation: 'Siguiendo la jerarquía: 1) Paréntesis y potencias: 3² = 9; (9 - 5) = 4. 2) Multiplicaciones y divisiones: 6 × 4 = 24; 16 ÷ 4 = 4. 3) Sumas y restas: 48 - 24 + 4 = 24 + 4 = 28.',
      conceptNeeded: 'Jerarquía de operaciones matemáticas (PEMDAS).',
      strategy: 'Resuelve primero lo que está dentro del paréntesis, respetando la potencia (3² = 9). Luego realiza productos y divisiones antes de sumar o restar.',
      hints: [
        'Pista 1: Recuerda el orden de prioridad: 1º Paréntesis (resuelve 3² - 5), 2º Multiplicaciones y Divisiones, 3º Sumas y Restas.',
        'Pista 2: Dentro del paréntesis 3² = 9, así que (9 - 5) = 4. La expresión queda: 48 - 6 × 4 + 16 ÷ 4.'
      ]
    }
  ],

  // 2. RUTA 02: Pensamiento Computacional y Programación (Mundo 02: Circuitos Mentales)
  computational_thinking: [
    {
      id: 'CT_DIAG_01',
      competencyId: 'computational_thinking',
      skillId: 'algorithms_sequencing',
      skillName: 'Pensamiento Algorítmico y Secuenciación',
      educationalObjective: 'Diseñar la secuencia óptima e inequívoca de pasos para restaurar un bus de datos sin provocar bloqueo.',
      difficulty: 1,
      isDiagnostic: true,
      context: 'El subnodo de procesamiento de silicio está en ciclo de bloqueo. Para restaurar el flujo de datos se deben ejecutar cuatro instrucciones en el orden lógico correcto.',
      statement: '¿Cuál es el orden secuencial correcto para reiniciar el nodo de forma segura?\n\n1. Reanudar tráfico de red\n2. Aislar el canal corrupto\n3. Inyectar pulso de calibración\n4. Purgar memoria caché',
      options: [
        '1 ➔ 2 ➔ 3 ➔ 4 (Reanudar antes de aislar causa saturación)',
        '2 ➔ 4 ➔ 3 ➔ 1 (Aislar ➔ Purgar ➔ Calibrar ➔ Reanudar)',
        '4 ➔ 1 ➔ 2 ➔ 3 (Purgar sin aislar propaga el fallo)',
        '3 ➔ 2 ➔ 1 ➔ 4 (Calibrar antes de aislar genera cortocircuito)'
      ],
      correctIndex: 1,
      explanation: 'El principio de mantenimiento algorítmico exige: 1º Aislar el canal para no propagar el error, 2º Limpiar los residuos corruptos (purgar), 3º Probar y calibrar el canal limpio, y 4º Volver a abrir el tráfico.',
      conceptNeeded: 'Secuenciación algorítmica y prevención de efectos secundarios.',
      strategy: 'Identifica la precondición inicial indispensable (no puedes limpiar ni probar un sistema si primero no lo aislas del flujo activo).',
      hints: [
        'Pista 1: Piensa en qué debe ocurrir primero para evitar que el fallo se extienda al resto de los circuitos.',
        'Pista 2: Siempre debes aislar primero (Paso 2) y reanudar el tráfico al final (Paso 1).'
      ]
    },
    {
      id: 'CT_CHALLENGE_02',
      competencyId: 'computational_thinking',
      skillId: 'conditionals_logic',
      skillName: 'Estructuras de Control Condicionales',
      educationalObjective: 'Evaluar proposiciones condicionales compuestas con operadores AND y OR.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'El cortafuegos del procesador central evalúa la siguiente regla de apertura de compuertas de seguridad:\n\nSI (temperatura < 75 AND presion <= 100) OR (modoManual == true)\nENTONCES AbrirCompuerta()',
      statement: 'Los sensores marcan: temperatura = 82, presion = 90, modoManual = false.\n\n¿Qué acción ejecutará el cortafuegos y por qué?',
      options: [
        'Abrirá la compuerta porque la presión es menor a 100.',
        'No abrirá la compuerta porque ambas condiciones principales son falsas.',
        'Abrirá la compuerta porque la temperatura supera el límite de seguridad.',
        'Entrará en estado indefinido al no cumplirse la igualdad.'
      ],
      correctIndex: 1,
      explanation: 'Para la primera parte: (82 < 75 AND 90 <= 100) -> (FALSO AND VERDADERO) = FALSO. Para la segunda parte: modoManual es FALSO. Por tanto: FALSO OR FALSO = FALSO. La compuerta permanece cerrada.',
      conceptNeeded: 'Tablas de verdad y precedencia de operadores lógicos booleanos.',
      strategy: 'Evalúa primero el bloque entre paréntesis con el operador AND. Luego aplica el operador OR con la variable modoManual.',
      hints: [
        'Pista 1: En un operador AND, ambas condiciones deben ser verdaderas para que el resultado sea verdadero. ¿Es 82 < 75?',
        'Pista 2: Como la temperatura es 82, la condición (temperatura < 75) es falsa. Y como modoManual es false, el OR final es falso.'
      ]
    }
  ],

  // 3. RUTA 03: Comprensión Lectora (Mundo 03: Archivo del Conocimiento)
  reading_comprehension: [
    {
      id: 'RC_DIAG_01',
      competencyId: 'reading_comprehension',
      skillId: 'main_idea_inference',
      skillName: 'Identificación de Idea Principal e Inferencias',
      educationalObjective: 'Distinguir la tesis central del texto de los detalles secundarios o ejemplos anecdóticos.',
      difficulty: 1,
      isDiagnostic: true,
      context: 'Descifras una entrada en el códice biocibernético de la Dra. Vane:\n\n"Muchos creen que la memoria humana en NEUROCORE falló por un colapso eléctrico. Sin embargo, los registros demuestran que los condensadores mantuvieron su carga intacta. La verdadera fractura ocurrió cuando los índices de catalogación semántica se sobrescribieron, dejando millones de datos huérfanos sin ruta de consulta. La energía sobraba; lo que perdimos fue la estructura de acceso."',
      statement: 'De acuerdo con el testimonio de la Dra. Vane, ¿cuál es la causa principal del fallo de la memoria?',
      options: [
        'Un cortocircuito masivo que drenó la carga de los condensadores.',
        'La pérdida de la organización semántica que permitía localizar la información.',
        'La falta de suficiente energía eléctrica en los reactores primarios.',
        'La eliminación física y definitiva de todos los datos científicos almacenados.'
      ],
      correctIndex: 1,
      explanation: 'El texto enfatiza explícitamente que los condensadores no fallaron ("la energía sobraba") y contrasta la creencia popular con la causa real: la pérdida de los índices de catalogación ("lo que perdimos fue la estructura de acceso").',
      conceptNeeded: 'Comprensión textual inferencial y distinción entre tesis y premisas refutadas.',
      strategy: 'Busca el conector adversativo "Sin embargo" y la frase conclusiva "lo que perdimos fue...".',
      hints: [
        'Pista 1: Presta atención a las palabras que siguen al conector "Sin embargo": ¿qué desmiente la autora?',
        'Pista 2: La autora aclara que la energía estaba intacta y que los datos aún existían, pero sin ruta para consultarlos.'
      ]
    },
    {
      id: 'RC_CHALLENGE_02',
      competencyId: 'reading_comprehension',
      skillId: 'argument_analysis',
      skillName: 'Análisis de Evidencia y Argumentación',
      educationalObjective: 'Identificar conclusiones válidas fundamentadas en la evidencia provista en el texto.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'En un fragmento de bitácora técnica se lee:\n\n"Si el protocolo de aislamiento criogénico se activa sin una purga previa del refrigerante, las válvulas de titanio se contraen bruscamente y se fracturan en menos de 4 minutos. Ayer se hallaron las tres válvulas de titanio intactas tras finalizar la criogenia."',
      statement: '¿Qué conclusión necesaria e irrefutable se deduce con certeza lógica del informe?',
      options: [
        'El refrigerante utilizado era de baja calidad.',
        'La purga previa del refrigerante sí fue realizada antes del aislamiento.',
        'El aislamiento criogénico duró menos de 3 minutos.',
        'Las válvulas fueron sustituidas después de fracturarse.'
      ],
      correctIndex: 1,
      explanation: 'Es una aplicación del principio lógico Modus Tollens: Si (NO purga) ➔ (Fractura). Dado que (NO fractura), necesariamente se deduce la negación del antecedente: sí se realizó la purga.',
      conceptNeeded: 'Deducción lógica a partir de premisas condicionales en textos técnicos.',
      strategy: 'Plantea la regla: sin purga hay fractura garantizada. Si las válvulas están perfectamente sanas, la condición de peligro no ocurrió.',
      hints: [
        'Pista 1: El texto dice que SI NO se purga, las válvulas se fracturan obligatoriamente.',
        'Pista 2: Si las válvulas se encontraron intactas, ¿se omitió la purga o sí se realizó?'
      ]
    }
  ],

  // 4. RUTA 04: Dimensión Estratégica (Mundo 04: Dimensión Estratégica)
  strategic_multidisciplinary: [
    {
      id: 'SM_DIAG_01',
      competencyId: 'strategic_multidisciplinary',
      skillId: 'resource_decision',
      skillName: 'Toma de Decisiones bajo Restricciones de Recursos',
      educationalObjective: 'Priorizar cursos de acción optimizando reservas críticas de soporte vital frente a variables en conflicto.',
      difficulty: 1,
      isDiagnostic: true,
      context: 'El sector orbital sufre una despresurización lenta. Cuentas con 300 unidades de energía de reserva y un tiempo estimado de 15 minutos antes de la falla de mamparos.',
      statement: 'Dispones de tres alternativas estratégicas:\n\n• Plan Alfa: Sellado térmico inmediato (Gasto: 280 energía, Tiempo: 4 min, Éxito: 95%, bloquea compuertas).\n• Plan Beta: Bombeo auxiliar y parche manual (Gasto: 120 energía, Tiempo: 14 min, Éxito: 60%).\n• Plan Gamma: Ignorar la fuga y desviar energía al radar (Gasto: 200 energía, Tiempo: 1 min).\n\n¿Cuál es la decisión estratégica más viable para garantizar la supervivencia?',
      options: [
        'Plan Beta, porque gasta menos energía y mantiene las compuertas abiertas.',
        'Plan Alfa, porque maximiza la certeza de supervivencia dentro del margen temporal seguro.',
        'Plan Gamma, porque es el plan más rápido de ejecutar.',
        'Esperar 10 minutos para recopilar más datos antes de decidir.'
      ],
      correctIndex: 1,
      explanation: 'Bajo condiciones de supervivencia crítica, el Plan Alfa garantiza un 95% de éxito en 4 minutos, muy por debajo de los 15 minutos límite. Aunque consume casi toda la energía (280/300), asegura la integridad vital. El Plan Beta roza el límite temporal (14/15 min) con un riesgo inaceptable del 40% de fallo.',
      conceptNeeded: 'Gestión de riesgos, coste de oportunidad y análisis de márgenes de seguridad.',
      strategy: 'Compara la probabilidad de fallo con el tiempo disponible. Una opción con 40% de riesgo de muerte no es aceptable teniendo una alternativa de 95% dentro del presupuesto.',
      hints: [
        'Pista 1: Fíjate en el tiempo límite: 15 minutos. El Plan Beta tarda 14 minutos y tiene 40% de probabilidad de fallar.',
        'Pista 2: ¿Qué es más importante en una despresurización: ahorrar energía arriesgando la vida o asegurar el sellado en 4 minutos con 95% de éxito?'
      ]
    },
    {
      id: 'SM_CHALLENGE_02',
      competencyId: 'strategic_multidisciplinary',
      skillId: 'root_cause_analysis',
      skillName: 'Análisis de Causa Raíz y Pensamiento Crítico',
      educationalObjective: 'Diferenciar síntomas superficiales de la causa motriz de una falla multifactorial.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'El monitor de telemetría reporta tres anomalías simultáneas: 1) Los ventiladores giran a máxima velocidad con ruido anormal, 2) La temperatura del núcleo subió 18°C, y 3) La rejilla externa de disipación está obstruida por residuos espaciales.',
      statement: '¿Cuál es la causa raíz motriz que desencadenó las demás anomalías?',
      options: [
        'El fallo electromecánico en los motores de los ventiladores.',
        'La obstrucción física de la rejilla de disipación externa.',
        'El incremento espontáneo de temperatura interna del reactor.',
        'Un error de lectura en los sensores térmicos de la consola.'
      ],
      correctIndex: 1,
      explanation: 'La obstrucción externa impidió la evacuación de calor al espacio. Como consecuencia directa, la temperatura del núcleo subió, lo que a su vez obligó a los ventiladores a forzar su rotación al 100% como mecanismo de compensación. La causa raíz es la obstrucción.',
      conceptNeeded: 'Diagrama de causalidad e identificación de causas raíz vs. síntomas.',
      strategy: 'Aplica el método de los "5 Porqués": ¿Por qué subió la temperatura y se forzaron los ventiladores? Porque el calor no puede salir por la rejilla bloqueada.',
      hints: [
        'Pista 1: Si limpias la rejilla externa, ¿qué ocurrirá con el calor y la velocidad de los ventiladores?',
        'Pista 2: Los ventiladores se forzaron PARA intentar enfriar el calor acumulado porque la rejilla de escape estaba tapada.'
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
