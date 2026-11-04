/**
 * ChallengeRepository.js — Repositorio curricular de NEUROQUEST.
 * Contiene desafíos estructurados por niveles de dificultad (1, 2 y 3) y diagnósticos iniciales.
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
      context: 'El generador de pulsos cuánticos emite una frecuencia rítmica que ha quedado incompleta en la consola.',
      statement: 'Observa la serie de pulsos en el monitor:\n\n3,  7,  15,  31,  63,  [ ? ]\n\n¿Cuál es el valor que equilibra el siguiente pulso?',
      options: [
        '95 (Aumento lineal constante de +32)',
        '127 (Regla: Multiplicar por 2 y sumar 1)',
        '126 (Regla: Duplicar el número anterior)',
        '115 (Aumento de +48)'
      ],
      correctIndex: 1,
      explanation: 'La regla que rige la serie es: Siguiente = (Anterior × 2) + 1. (3×2)+1=7; (7×2)+1=15; (15×2)+1=31; (31×2)+1=63; por tanto: (63×2) + 1 = 127.',
      conceptNeeded: 'Progresiones algebraicas y recursividad multiplicativa.',
      strategy: 'Observa que las diferencias entre números contiguos se duplican en cada paso: +4, +8, +16, +32, por tanto el siguiente incremento es +64. 63 + 64 = 127.',
      hints: [
        'Pista 1: Compara la diferencia entre términos: 7-3=4, 15-7=8, 31-15=16, 63-31=32.',
        'Pista 2: La diferencia se duplica: 4, 8, 16, 32... ¿Cuánto debes sumar a 63?'
      ]
    },
    {
      id: 'LM_CHALLENGE_02',
      competencyId: 'logic_math',
      skillId: 'fractions_ratios',
      skillName: 'Fracciones y Razones de Energía',
      educationalObjective: 'Calcular partes relativas proporcionales de una magnitud total.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'El reactor requiere una mezcla exacta: 3/5 de plasma azul y el resto de plasma cian.',
      statement: 'Si la capacidad total del reactor es de 450 gigavatios (GW):\n\n¿Cuántos GW de energía cian se necesitan para lograr el balance?',
      options: [
        '270 GW (Corresponde a los 3/5 de plasma azul)',
        '180 GW (Corresponde a los 2/5 restantes de plasma cian)',
        '150 GW (Equivalente a un tercio de la capacidad)',
        '90 GW (Equivalente a un quinto de la capacidad)'
      ],
      correctIndex: 1,
      explanation: 'El plasma cian ocupa la fracción complementaria: 1 - 3/5 = 2/5. Calculando: (450 ÷ 5) × 2 = 90 × 2 = 180 GW.',
      conceptNeeded: 'Fracción de una cantidad y fracciones complementarias.',
      strategy: 'Divide el total entre 5 para hallar un quinto (90 GW) y multiplica por 2.',
      hints: [
        'Pista 1: Si 3 partes de 5 son de un tipo, ¿cuántas partes de 5 sobran para el otro?',
        'Pista 2: 450 ÷ 5 = 90 GW por parte. Multiplica por 2 partes.'
      ]
    },
    {
      id: 'LM_CHALLENGE_03',
      competencyId: 'logic_math',
      skillId: 'combined_operations',
      skillName: 'Operaciones Combinadas y Jerarquía',
      educationalObjective: 'Aplicar la jerarquía de operadores matemáticos (PEMDAS).',
      difficulty: 2,
      isDiagnostic: false,
      context: 'La compuerta del subsector requiere recalibrar el código numérico de seguridad evaluando la fórmula de derivación.',
      statement: 'Calcula el valor del código de derivación:\n\nCódigo = 48 - 6 × (3² - 5) + 16 ÷ 4',
      options: [
        '172 (Si se opera de izquierda a derecha sin jerarquía)',
        '28 (Jerarquía estricta: potencias, productos, sumas y restas)',
        '36 (Omisión del producto prioritario)',
        '40 (Error de signo en la sustracción)'
      ],
      correctIndex: 1,
      explanation: '1) Paréntesis y potencias: 3² = 9; (9 - 5) = 4. 2) Productos y divisiones: 6 × 4 = 24; 16 ÷ 4 = 4. 3) Sumas y restas: 48 - 24 + 4 = 24 + 4 = 28.',
      conceptNeeded: 'Jerarquía de operaciones matemáticas (PEMDAS).',
      strategy: 'Primero resuelve el interior del paréntesis (3² - 5). Luego efectúa multiplicaciones y divisiones antes de sumar o restar.',
      hints: [
        'Pista 1: Orden de prioridad: 1º Paréntesis, 2º Multiplicación/División, 3º Suma/Resta.',
        'Pista 2: 3² = 9. Así que (9 - 5) = 4. La expresión queda: 48 - 6 × 4 + 16 ÷ 4.'
      ]
    },
    {
      id: 'LM_CHALLENGE_04',
      competencyId: 'logic_math',
      skillId: 'deductive_reasoning',
      skillName: 'Razonamiento Deductivo y Ecuaciones',
      educationalObjective: 'Modelar algebraicamente relaciones cuantitativas interdependientes.',
      difficulty: 2,
      isDiagnostic: false,
      context: 'Tres condensadores (Alfa, Beta y Gamma) suman 120 kW. Alfa tiene el doble de carga que Beta, y Gamma tiene 20 kW más que Beta.',
      statement: '¿Cuál es la carga exacta del condensador Alfa?',
      options: [
        '50 kW (Beta = 25 kW, Alfa = 50 kW, Gamma = 45 kW; suma = 120 kW)',
        '60 kW (No cumple la suma conjunta de 120 kW)',
        '40 kW (Valores incompatibles con la diferencia de Gamma)',
        '25 kW (Corresponde al condensador Beta)'
      ],
      correctIndex: 0,
      explanation: 'Si Beta = x, Alfa = 2x, Gamma = x + 20. Suma: 2x + x + x + 20 = 120 -> 4x = 100 -> x = 25 kW. Por tanto Alfa = 2 × 25 = 50 kW.',
      conceptNeeded: 'Ecuaciones de primer grado con relaciones multiplicativas y aditivas.',
      strategy: 'Expresa Alfa y Gamma en términos de Beta (x) y resuelve la ecuación de suma total.',
      hints: [
        'Pista 1: Llama "x" a la carga de Beta. Alfa es 2x y Gamma es x + 20.',
        'Pista 2: Suma: 2x + x + (x + 20) = 120. Despeja x y halla Alfa = 2x.'
      ]
    },
    {
      id: 'LM_CHALLENGE_05',
      competencyId: 'logic_math',
      skillId: 'percentages_proportions',
      skillName: 'Porcentajes y Eficiencia Relativa',
      educationalObjective: 'Calcular variaciones porcentuales encadenadas y rendimiento relativo.',
      difficulty: 3,
      isDiagnostic: false,
      context: 'Un generador de antimateria rinde inicialmente 800 MW. Sufre una pérdida del 25% por fricción cuántica y luego una optimización que eleva su potencia restante en un 20%.',
      statement: '¿Cuál es la potencia final neta entregada por el generador?',
      options: [
        '720 MW (800 - 200 = 600 MW; 600 + 20% = 720 MW)',
        '760 MW (Restar 25% y sumar 20% sobre el valor original)',
        '800 MW (Los porcentajes de pérdida y ganancia no se anulan)',
        '680 MW (Error en el cómputo de la bonificación del 20%)'
      ],
      correctIndex: 0,
      explanation: '1) Pérdida del 25%: 800 × 0.25 = 200 MW -> Potencia restante = 600 MW. 2) Aumento del 20% sobre el remanente: 600 × 0.20 = 120 MW -> Potencia final = 600 + 120 = 720 MW.',
      conceptNeeded: 'Variaciones porcentuales sucesivas sobre bases diferentes.',
      strategy: 'No restes directamente los porcentajes (25% - 20% != 5%). Calcula el valor intermedio en megavatios antes de aplicar el segundo porcentaje.',
      hints: [
        'Pista 1: El 25% de 800 es 200. ¿Cuántos MW quedan?',
        'Pista 2: Sobre los 600 MW restantes, calcula el 20% (600 × 0.2 = 120 MW) y súmalo.'
      ]
    },
    {
      id: 'LM_TRANS_01',
      competencyId: 'logic_math',
      skillId: 'fractions_ratios',
      skillName: 'Transferencia: Razones de Mezcla en Soporte Vital',
      educationalObjective: 'Transferir el concepto de partes proporcionales a un entorno de atmósfera respirable.',
      difficulty: 2,
      isDiagnostic: false,
      isTransfer: true,
      transferType: 'near',
      domainContext: 'Aeroespacial y Soporte Vital',
      context: 'Un módulo de escape biológico requiere recargar su tanque de 600 litros de atmósfera respirable. La razón estricta entre Nitrógeno y Oxígeno debe ser de 4 a 1 (4 partes de N2 por cada 1 parte de O2).',
      statement: '¿Cuántos litros de Oxígeno puro deben inyectarse para completar el tanque con la proporción exacta de supervivencia?',
      options: [
        '120 litros (1 parte de 5 partes totales: 600 ÷ 5 = 120 L)',
        '150 litros (Error de dividir entre 4 en vez del total de partes)',
        '240 litros (Error de asignar 40% del total)',
        '100 litros (Asignación arbitraria de un sexto)'
      ],
      correctIndex: 0,
      explanation: 'Una razón de 4 a 1 significa que hay 4 + 1 = 5 partes en total. El oxígeno ocupa 1 de esas 5 partes (1/5). Calculando: 600 ÷ 5 = 120 litros de O2 (y 480 litros de N2).',
      conceptNeeded: 'Proporcionalidad directa y razones compuestas en mezclas volumétricas.',
      strategy: 'Suma las partes de la razón (4 + 1 = 5) para hallar el divisor común del volumen total.',
      hints: [
        'Pista 1: Si hay 4 partes de nitrógeno por cada 1 de oxígeno, la mezcla total tiene 4 + 1 = 5 partes.',
        'Pista 2: Divide 600 entre 5 para obtener el volumen de una sola parte.'
      ]
    },
    {
      id: 'LM_RET_01',
      competencyId: 'logic_math',
      skillId: 'patterns_sequences',
      skillName: 'Retención Temporal: Recurrencia en Pulsos Críticos',
      educationalObjective: 'Comprobar la retención del principio de recursividad tras un intervalo temporal.',
      difficulty: 2,
      isDiagnostic: false,
      isRetention: true,
      context: 'Tras varios ciclos de actividad en la instalación, el condensador principal vuelve a mostrar un patrón oscilante para verificar la retención cognitiva.',
      statement: 'Observa la nueva secuencia en el monitor:\n\n5,  11,  23,  47,  95,  [ ? ]\n\n¿Cuál es el valor que equilibra el siguiente pulso?',
      options: [
        '191 ((95 × 2) + 1 = 191; diferencias duplicadas: +6, +12, +24, +48, +96)',
        '143 (Aumento lineal simple)',
        '190 (Duplicar sin sumar la unidad constante)',
        '181 (Error de cálculo en la duplicación)'
      ],
      correctIndex: 0,
      explanation: 'La regla recursiva retenida es: Siguiente = (Anterior × 2) + 1. (95 × 2) + 1 = 190 + 1 = 191. Las diferencias entre términos se duplican sucesivamente: +6, +12, +24, +48, +96.',
      conceptNeeded: 'Recursividad multiplicativa y conservación de patrones a largo plazo.',
      strategy: 'Verifica si la relación (×2 + 1) o la duplicación de incrementos se mantiene respecto a tu aprendizaje anterior.',
      hints: [
        'Pista 1: Compara 11 - 5 = 6; 23 - 11 = 12; 47 - 23 = 24...',
        'Pista 2: La diferencia previa fue 48. La siguiente diferencia es 96. Suma 95 + 96.'
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
      educationalObjective: 'Diseñar la secuencia lógica inequívoca de pasos para restaurar un bus de datos sin provocar bloqueo.',
      difficulty: 1,
      isDiagnostic: true,
      context: 'El subnodo de procesamiento de silicio está en ciclo de bloqueo. Se deben ejecutar 4 instrucciones en orden estricto.',
      statement: '¿Cuál es el orden secuencial correcto para reiniciar el nodo de forma segura?\n\n1. Reanudar tráfico de red\n2. Aislar el canal corrupto\n3. Inyectar pulso de calibración\n4. Purgar memoria caché',
      options: [
        '1 ➔ 2 ➔ 3 ➔ 4 (Reanudar antes de aislar causa saturación)',
        '2 ➔ 4 ➔ 3 ➔ 1 (Aislar ➔ Purgar ➔ Calibrar ➔ Reanudar)',
        '4 ➔ 1 ➔ 2 ➔ 3 (Purgar sin aislar propaga el fallo)',
        '3 ➔ 2 ➔ 1 ➔ 4 (Calibrar antes de aislar genera cortocircuito)'
      ],
      correctIndex: 1,
      explanation: 'El principio algorítmico de seguridad exige: 1º Aislar el canal corrupto, 2º Purgar los datos dañados, 3º Calibrar el canal limpio y 4º Reanudar el tráfico.',
      conceptNeeded: 'Secuenciación algorítmica y prevención de efectos secundarios.',
      strategy: 'Identifica la precondición inicial (aislar) y la poscondición de cierre (reanudar).',
      hints: [
        'Pista 1: Siempre debes aislar primero para evitar propagar el error.',
        'Pista 2: Reanudar el tráfico debe ser siempre el último paso cuando todo esté calibrado.'
      ]
    },
    {
      id: 'CT_CHALLENGE_02',
      competencyId: 'computational_thinking',
      skillId: 'conditionals_logic',
      skillName: 'Estructuras de Control Condicionales',
      educationalObjective: 'Evaluar proposiciones compuestas con operadores AND y OR.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'El cortafuegos evalúa la regla:\n\nSI (temperatura < 75 AND presion <= 100) OR (modoManual == true)\nENTONCES AbrirCompuerta()',
      statement: 'Sensores: temperatura = 82, presion = 90, modoManual = false.\n\n¿Qué acción ejecutará el cortafuegos?',
      options: [
        'Abrirá la compuerta porque la presión es menor a 100.',
        'No abrirá la compuerta porque ambas condiciones principales son falsas.',
        'Abrirá la compuerta porque la temperatura es superior al límite.',
        'Entrará en estado indefinido.'
      ],
      correctIndex: 1,
      explanation: '(82 < 75 AND 90 <= 100) = (FALSO AND VERDADERO) = FALSO. FALSO OR modoManual(FALSO) = FALSO. La compuerta no se abre.',
      conceptNeeded: 'Tablas de verdad y precedencia de operadores booleanos.',
      strategy: 'Evalúa el AND primero. Como 82 no es menor a 75, la cláusula AND es falsa.',
      hints: [
        'Pista 1: En un AND, si una de las condiciones falla, todo el bloque es falso.',
        'Pista 2: Como modoManual es false, el OR no puede rescatar la condición.'
      ]
    },
    {
      id: 'CT_CHALLENGE_03',
      competencyId: 'computational_thinking',
      skillId: 'loops_debugging',
      skillName: 'Depuración de Bucles y Condición de Parada',
      educationalObjective: 'Identificar fallos de terminación (bucles infinitos) en estructuras iterativas.',
      difficulty: 2,
      isDiagnostic: false,
      context: 'El siguiente fragmento de código procesa paquetes de datos:\n\ncontador = 10\nMIENTRAS (contador != 0):\n    contador = contador - 2\n    SI (contador == 4):\n        contador = contador + 2',
      statement: '¿Cuántas iteraciones ejecutará el bucle antes de terminar?',
      options: [
        'Se ejecutará indefinidamente (bucle infinito oscilando entre 6 y 4)',
        'Exactamente 5 iteraciones hasta llegar a cero',
        '3 iteraciones',
        'Terminará inmediatamente por error de tipo'
      ],
      correctIndex: 0,
      explanation: 'Traza mental: contador empieza en 10 -> pasa a 8 -> pasa a 6 -> pasa a 4, pero el condicional lo regresa a 6 (4+2). A partir de ahí oscila eternamente entre 6 y 4 sin alcanzar nunca el valor 0.',
      conceptNeeded: 'Trazabilidad de variables, invariantes de bucle y condición de terminación.',
      strategy: 'Efectúa una prueba de escritorio anotando el valor de "contador" en cada paso.',
      hints: [
        'Pista 1: ¿Qué ocurre cuando contador llega a 4? El condicional le suma 2.',
        'Pista 2: De 6 baja a 4, pero de 4 vuelve a subir a 6. ¿Llegará alguna vez a 0?'
      ]
    },
    {
      id: 'CT_TRANS_01',
      competencyId: 'computational_thinking',
      skillId: 'conditionals_logic',
      skillName: 'Transferencia: Cuarentena y Esterilización UV',
      educationalObjective: 'Aplicar lógica booleana compuesta a un protocolo de bioseguridad en laboratorios.',
      difficulty: 2,
      isDiagnostic: false,
      isTransfer: true,
      transferType: 'near',
      domainContext: 'Bioseguridad y Automatización de Válvulas',
      context: 'El autoclave de bioseguridad evalúa la regla:\n\nSI (presenciaPatogeno == true OR radiacionExtrema == true) AND (selladoHermetico == true)\nENTONCES IniciarEsterilizacionUV()',
      statement: 'Lectura de sensores: presenciaPatogeno = false, radiacionExtrema = true, selladoHermetico = true.\n\n¿Se activará la esterilización UV en el autoclave?',
      options: [
        'Sí, porque radiacionExtrema hace verdadero el bloque (OR) y el sellado hermético es verdadero.',
        'No, porque presenciaPatogeno es falso y desactiva todo el sistema.',
        'No, porque el operador AND requiere que presenciaPatogeno también sea verdadero.',
        'El sistema se bloquea por contradicción en los sensores.'
      ],
      correctIndex: 0,
      explanation: 'Evaluación lógica: (FALSO OR VERDADERO) = VERDADERO. Luego: VERDADERO AND selladoHermetico(VERDADERO) = VERDADERO. La condición se satisface y la esterilización UV se ejecuta con éxito.',
      conceptNeeded: 'Disyunción lógica (OR), conjunción lógica (AND) y precedencia de paréntesis.',
      strategy: 'Evalúa el contenido entre paréntesis primero. En un OR, con un solo término verdadero, todo el paréntesis resulta verdadero.',
      hints: [
        'Pista 1: En (Falso OR Verdadero), el resultado siempre es Verdadero.',
        'Pista 2: Como el paréntesis es Verdadero y el sellado es Verdadero, el AND final se cumple.'
      ]
    },
    {
      id: 'CT_RET_01',
      competencyId: 'computational_thinking',
      skillId: 'algorithms_sequencing',
      skillName: 'Retención Temporal: Restauración Algorítmica Concurrente',
      educationalObjective: 'Verificar la conservación del principio de secuenciación y precondiciones operativas.',
      difficulty: 2,
      isDiagnostic: false,
      isRetention: true,
      context: 'El subsistema de memoria persistente necesita programar una copia de seguridad tras varias horas de operación sin intervención.',
      statement: '¿Cuál es la secuencia algorítmica canónica para capturar la instantánea sin corrupción de datos?\n\n1. Validar firma hash de integridad\n2. Detener temporalmente los hilos de escritura\n3. Guardar imagen física en disco\n4. Reanudar hilos de escritura',
      options: [
        '2 ➔ 3 ➔ 1 ➔ 4 (Detener escrituras ➔ Guardar imagen ➔ Validar firma ➔ Reanudar)',
        '1 ➔ 2 ➔ 3 ➔ 4 (Validar antes de guardar)',
        '3 ➔ 2 ➔ 4 ➔ 1 (Guardar sin pausar escrituras corrompe datos concurrentes)',
        '4 ➔ 1 ➔ 2 ➔ 3 (Reanudar antes de capturar el estado)'
      ],
      correctIndex: 0,
      explanation: 'Para evitar condiciones de carrera (race conditions), la secuencia algorítmica exige: 1º Pausar escrituras, 2º Volcar la instantánea, 3º Verificar el hash de integridad y 4º Reanudar la ejecución concurrente.',
      conceptNeeded: 'Secuenciación algorítmica estricta e invariantes de sincronización.',
      strategy: 'Recuerda el orden aprendido: aislar/pausar siempre antes de manipular, y reanudar siempre al final.',
      hints: [
        'Pista 1: No puedes validar un archivo antes de haberlo escrito en disco.',
        'Pista 2: Reanudar las operaciones siempre debe ser la última instrucción de cierre.'
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
      educationalObjective: 'Distinguir la tesis central del texto frente a premisas accesorias.',
      difficulty: 1,
      isDiagnostic: true,
      context: 'Bitácora biocibernética:\n\n"Muchos creen que la memoria humana en NEUROCORE falló por un colapso eléctrico. Sin embargo, los registros demuestran que los condensadores mantuvieron su carga intacta. La verdadera fractura ocurrió cuando los índices de catalogación semántica se sobrescribieron, dejando millones de datos huérfanos sin ruta de consulta. La energía sobraba; lo que perdimos fue la estructura de acceso."',
      statement: 'De acuerdo con el texto, ¿cuál fue la causa real del fallo de la memoria?',
      options: [
        'Un cortocircuito masivo que drenó la carga eléctrica.',
        'La pérdida de la organización semántica que permitía localizar la información.',
        'La falta de suficiente energía en los reactores primarios.',
        'La eliminación física y definitiva de todos los datos científicos almacenados.'
      ],
      correctIndex: 1,
      explanation: 'El texto enfatiza que la energía estaba intacta ("los condensadores mantuvieron su carga") y que el fallo ocurrió porque "lo que perdimos fue la estructura de acceso" (los índices semánticos).',
      conceptNeeded: 'Comprensión textual inferencial y distinción entre tesis y premisas refutadas.',
      strategy: 'Observa el conector "Sin embargo" y la frase de cierre que define la pérdida real.',
      hints: [
        'Pista 1: La autora descarta expresamente la falta de energía.',
        'Pista 2: La última frase resume la tesis: "lo que perdimos fue la estructura de acceso".'
      ]
    },
    {
      id: 'RC_CHALLENGE_02',
      competencyId: 'reading_comprehension',
      skillId: 'argument_analysis',
      skillName: 'Análisis de Evidencia y Argumentación',
      educationalObjective: 'Identificar conclusiones válidas fundamentadas en la evidencia del texto.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'Reporte técnico:\n\n"Si el aislamiento criogénico se activa sin una purga previa del refrigerante, las válvulas de titanio se contraen bruscamente y se fracturan en menos de 4 minutos. Ayer se hallaron las tres válvulas de titanio intactas tras finalizar la criogenia."',
      statement: '¿Qué conclusión necesaria se deduce con certeza lógica del informe?',
      options: [
        'El refrigerante utilizado era de baja calidad.',
        'La purga previa del refrigerante sí fue realizada antes del aislamiento.',
        'El aislamiento criogénico duró menos de 3 minutos.',
        'Las válvulas fueron sustituidas tras fracturarse.'
      ],
      correctIndex: 1,
      explanation: 'Aplicación del principio Modus Tollens: Si (NO purga) ➔ (Fractura). Dado que (NO fractura), necesariamente se deduce que sí se realizó la purga.',
      conceptNeeded: 'Deducción lógica a partir de premisas condicionales en textos técnicos.',
      strategy: 'Si la falta de purga fractura siempre las válvulas, y las válvulas están sanas, la purga se llevó a cabo.',
      hints: [
        'Pista 1: El texto dice que omitir la purga fractura las válvulas obligatoriamente.',
        'Pista 2: Como las válvulas no se fracturaron, la purga sí se ejecutó.'
      ]
    },
    {
      id: 'RC_CHALLENGE_03',
      competencyId: 'reading_comprehension',
      skillId: 'critical_perspective',
      skillName: 'Detección de Sesgos y Puntos de Vista',
      educationalObjective: 'Discernir la intencionalidad persuasiva del emisor frente a hechos objetivos.',
      difficulty: 2,
      isDiagnostic: false,
      context: 'Comunicado oficial:\n\n"Nuestra corporación garantiza que el nuevo algoritmo de compresión neuronal es impecable y absolutamente infalible. Quienes señalan anomalías son científicos conservadores temerosos de la innovación. Aunque no hemos publicado los resultados de las pruebas de laboratorio, los usuarios deben confiar plenamente en nuestra palabra."',
      statement: '¿Qué falacia o sesgo argumentativo debilita críticamente la validez del comunicado?',
      options: [
        'Ataque personal (ad hominem) y apelación a la autoridad sin aportar evidencia empírica.',
        'Uso excesivo de datos estadísticos complejos y difíciles de contrastar.',
        'Una conclusión sustentada rigurosamente en pruebas de laboratorio auditadas.',
        'Generalización apresurada basada en experimentos con muestras masivas.'
      ],
      correctIndex: 0,
      explanation: 'El emisor descalifica a los críticos llamándolos "temerosos" (ad hominem) y exige fe ciega admitiendo que no ha publicado pruebas objetivas (petición de principio / falta de evidencia empírica).',
      conceptNeeded: 'Identificación de falacias argumentativas y evaluación crítica de fuentes.',
      strategy: 'Examina qué pruebas aporta el autor para respaldar su afirmación de infalibilidad.',
      hints: [
        'Pista 1: ¿Qué responde el autor a las críticas? En vez de mostrar datos, ataca a quienes dudan.',
        'Pista 2: La frase "aunque no hemos publicado los resultados... deben confiar" delata falta de evidencia.'
      ]
    },
    {
      id: 'RC_TRANS_01',
      competencyId: 'reading_comprehension',
      skillId: 'main_idea_inference',
      skillName: 'Transferencia: Interpretación de Cláusulas y Manifiestos',
      educationalObjective: 'Aplicar lectura inferencial y jerarquía normativa a un contrato de transporte intergaláctico.',
      difficulty: 2,
      isDiagnostic: false,
      isTransfer: true,
      transferType: 'near',
      domainContext: 'Derecho Espacial y Manifiestos de Carga',
      context: 'Fragmento de una póliza de navegación espacial:\n\n"La base no indemnizará la pérdida de cargamento perecedero si la demora en el atraque se debe a mantenimiento programado notificado con 48 horas de antelación. No obstante, si el retraso deriva de fallas mecánicas imprevistas en los brazos de acople, la base reembolsará el 100% del valor declarado, con total independencia de cualquier notificación previa."',
      statement: 'El buque Titán sufrió la descomposición de sus víveres tras 60 horas de espera debido a la rotura imprevista del pistón de acople 4. La base alega que había emitido una circular de alerta 3 días antes.\n\nSegún el texto, ¿procede la indemnización?',
      options: [
        'Sí, porque el fallo mecánico en los brazos de acople tiene prioridad y obliga al reembolso del 100%.',
        'No, porque la base notificó con más de 48 horas (3 días) de antelación.',
        'Solo procede el 50% por responsabilidad compartida.',
        'El texto no prevé contingencias mecánicas imprevistas.'
      ],
      correctIndex: 0,
      explanation: 'El conector adversativo "No obstante" introduce la excepción prioritaria: cuando el retraso deriva de fallas mecánicas en los brazos de acople, el reembolso procede al 100% "con total independencia de cualquier notificación previa".',
      conceptNeeded: 'Inferencia contextual y comprensión de excepciones normativas condicionales.',
      strategy: 'Localiza qué condición anula expresamente la notificación previa en el texto.',
      hints: [
        'Pista 1: Lee atentamente la frase que empieza con "No obstante".',
        'Pista 2: El fallo mecánico exige el 100% "con total independencia de cualquier notificación previa".'
      ]
    },
    {
      id: 'RC_RET_01',
      competencyId: 'reading_comprehension',
      skillId: 'argument_analysis',
      skillName: 'Retención Temporal: Validez Argumentativa en Auditorías',
      educationalObjective: 'Comprobar la retención del análisis crítico frente a falacias deductivas.',
      difficulty: 2,
      isDiagnostic: false,
      isRetention: true,
      context: 'Acta de auditoría de seguridad post-incidente en la instalación:\n\n"Siempre que la cámara presurizada sufre una intrusión física, los sensores cuánticos activan el bloqueo hermético y emiten una sirena de 90 dB. La telemetría grabó con total nitidez el bloqueo hermético y la sirena de 90 dB a las 03:14 AM."',
      statement: '¿Demuestran estos registros con certeza lógica e indiscutible que ocurrió una intrusión física?',
      options: [
        'No; deducir la intrusión cometería la falacia de afirmación del consecuente (otra anomalía o prueba manual pudo activar la alarma).',
        'Sí; la presencia del bloqueo y la sirena prueba de forma irrefutable la intrusión.',
        'Sí, porque los sensores cuánticos no admiten márgenes de error.',
        'No, porque no se especifica la temperatura de la cámara.'
      ],
      correctIndex: 0,
      explanation: 'La regla afirma: "Si hay intrusión ➔ Bloqueo y Alarma". Observar el consecuente (Bloqueo y Alarma) no prueba necesariamente el antecedente (intrusión), pues una prueba técnica o cortocircuito pudo disparar los sensores (falacia de afirmación del consecuente).',
      conceptNeeded: 'Conservación del razonamiento lógico deductivo y detección de falacias.',
      strategy: 'Pregúntate: ¿existe alguna otra causa posible por la que la alarma pudo haber sonado?',
      hints: [
        'Pista 1: El texto no dice que la alarma suene ÚNICAMENTE por una intrusión.',
        'Pista 2: Afirmar el resultado para probar la causa es una falacia argumentativa común.'
      ]
    }
  ],

  // 4. RUTA 04: Dimensión Estratégica (Mundo 04: Dimensión Estratégica)
  strategic_multidisciplinary: [
    {
      id: 'SM_DIAG_01',
      competencyId: 'strategic_multidisciplinary',
      skillId: 'resource_decision',
      skillName: 'Toma de Decisiones bajo Restricciones',
      educationalObjective: 'Priorizar cursos de acción optimizando reservas críticas de soporte vital.',
      difficulty: 1,
      isDiagnostic: true,
      context: 'El sector sufre una despresurización. Cuentas con 300 unidades de energía de reserva y un tiempo estimado de 15 minutos antes de la falla de mamparos.',
      statement: 'Dispones de tres alternativas:\n\n• Plan Alfa: Sellado térmico inmediato (Gasto: 280 energía, Tiempo: 4 min, Éxito: 95%).\n• Plan Beta: Bombeo auxiliar y parche manual (Gasto: 120 energía, Tiempo: 14 min, Éxito: 60%).\n• Plan Gamma: Desviar energía al radar (Gasto: 200 energía, Tiempo: 1 min, Éxito: 10%).\n\n¿Cuál es la decisión estratégica más viable para garantizar la supervivencia?',
      options: [
        'Plan Beta, porque gasta menos energía y mantiene reserva.',
        'Plan Alfa, porque maximiza la certeza de supervivencia en el margen temporal seguro.',
        'Plan Gamma, porque es el más rápido de ejecutar.',
        'Esperar 10 minutos para recopilar más datos.'
      ],
      correctIndex: 1,
      explanation: 'El Plan Alfa garantiza un 95% de éxito en 4 minutos, muy por debajo de los 15 minutos límite. Aunque consume casi toda la energía (280/300), asegura la vida. El Plan Beta roza el límite (14/15 min) con 40% de riesgo inaceptable de muerte.',
      conceptNeeded: 'Gestión de riesgos, coste de oportunidad y márgenes de seguridad.',
      strategy: 'Compara la probabilidad de fallo con el tiempo disponible.',
      hints: [
        'Pista 1: El tiempo límite son 15 minutos. El Plan Beta tarda 14 y tiene 40% de probabilidad de fallar.',
        'Pista 2: Es prioritario asegurar el sellado con 95% de éxito antes que ahorrar energía con alto riesgo de muerte.'
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
      context: 'Telemetría: 1) Los ventiladores giran al 100% con ruido anómalo, 2) La temperatura del núcleo subió 18°C, y 3) La rejilla externa de disipación está obstruida por residuos espaciales.',
      statement: '¿Cuál es la causa raíz motriz que desencadenó las demás anomalías?',
      options: [
        'El fallo electromecánico en los motores de los ventiladores.',
        'La obstrucción física de la rejilla de disipación externa.',
        'El incremento espontáneo de temperatura interna del reactor.',
        'Un error de lectura en los sensores térmicos.'
      ],
      correctIndex: 1,
      explanation: 'La obstrucción externa impidió la evacuación de calor al espacio. Como consecuencia directa, la temperatura subió, lo que obligó a los ventiladores a forzar su rotación al 100%. La causa raíz es la obstrucción.',
      conceptNeeded: 'Diagrama de causalidad e identificación de causas raíz vs. síntomas.',
      strategy: 'Pregúntate qué elemento, al ser corregido, soluciona todos los demás problemas.',
      hints: [
        'Pista 1: Si limpias la rejilla externa, el calor podrá salir y los ventiladores se calmarán.',
        'Pista 2: Los ventiladores se forzaron PARA intentar mitigar el calor retenido por la rejilla tapada.'
      ]
    },
    {
      id: 'SM_CHALLENGE_03',
      competencyId: 'strategic_multidisciplinary',
      skillId: 'multidimensional_balance',
      skillName: 'Balance Multidimensional de Recursos',
      educationalObjective: 'Resolver compensaciones cruzadas entre soporte vital, potencia y escudos.',
      difficulty: 2,
      isDiagnostic: false,
      context: 'Una tormenta electromagnética impactará en 2 minutos. La estación cuenta con 100 unidades de energía:\n\n• Escudos: Requieren mínimo 50 unidades para resistir el impacto.\n• Soporte Vital: Requiere mínimo 35 unidades para mantener el oxígeno de la tripulación.\n• Computadora Central: Requiere mínimo 25 unidades para no perder los datos de la misión.',
      statement: 'Dado que la suma requerida (110) excede el total disponible (100):\n\n¿Cuál es la distribución que garantiza la supervivencia biológica y la integridad estructural de la estación?',
      options: [
        'Escudos: 50, Soporte Vital: 35, Computadora: 15 (Apagado preventivo de subsistemas no críticos de datos)',
        'Escudos: 40, Soporte Vital: 35, Computadora: 25 (Arriesgar el colapso del casco por impacto)',
        'Escudos: 50, Soporte Vital: 25, Computadora: 25 (Reducir el oxígeno por debajo del umbral seguro)',
        'Distribuir 33.3 unidades a cada sistema por igual'
      ],
      correctIndex: 0,
      explanation: 'La supervivencia biológica (35) y la integridad física estructural frente a la tormenta (50) son innegociables (suman 85 unidades). Las 15 unidades restantes van a la computadora en modo ahorro. Reducir escudos o soporte vital causaría la muerte inmediata.',
      conceptNeeded: 'Optimización lineal bajo prioridades lexicográficas y jerarquía de restricciones.',
      strategy: 'Satisface primero las restricciones de supervivencia absoluta (vida y blindaje) antes de asignar a objetivos secundarios.',
      hints: [
        'Pista 1: Si asignas menos de 50 a los escudos, la estación se destruye. Si asignas menos de 35 a soporte vital, la tripulación se asfixia.',
        'Pista 2: 50 + 35 = 85. De las 100 unidades quedan 15 para la computadora.'
      ]
    },
    {
      id: 'SM_TRANS_01',
      competencyId: 'strategic_multidisciplinary',
      skillId: 'root_cause_analysis',
      skillName: 'Transferencia: Diagnóstico Sistémico en Logística de Evacuación',
      educationalObjective: 'Transferir la identificación de causas raíz a una crisis logística de transporte.',
      difficulty: 2,
      isDiagnostic: false,
      isTransfer: true,
      transferType: 'near',
      domainContext: 'Gestión de Emergencias y Logística Masiva',
      context: 'En un simulacro de evacuación urgente: 1) Las cápsulas de escape despegan al 30% de su capacidad por límite de tiempo, 2) Se generan aglomeraciones masivas en los pasillos de acceso, 3) El software de turnos emite billetes con códigos duplicados que son rechazados en los torniquetes de abordaje.',
      statement: '¿Qué intervención resuelve sistémicamente el problema desde su causa motriz?',
      options: [
        'Corregir el algoritmo generador de códigos para evitar duplicados en el software de turnos.',
        'Ensanchar físicamente los pasillos para contener más personas en espera.',
        'Obligar a los pilotos de las cápsulas a retrasar el despegue indefinidamente.',
        'Incrementar la velocidad máxima de las cápsulas de escape.'
      ],
      correctIndex: 0,
      explanation: 'El software con códigos duplicados es la causa raíz motriz: causa el rechazo en torniquetes, lo que genera las aglomeraciones y deriva en cápsulas vacías por vencimiento de tiempo. Corregir el software suprime todos los síntomas derivados.',
      conceptNeeded: 'Causalidad circular y mitigación de cuellos de botella desde la raíz.',
      strategy: 'Pregúntate qué elemento generó que los torniquetes bloquearan el paso.',
      hints: [
        'Pista 1: Los pasillos se congestionaron PORQUE los torniquetes rechazaban los billetes duplicados.',
        'Pista 2: Arreglar el software elimina tanto el atasco como el despegue de cápsulas vacías.'
      ]
    },
    {
      id: 'SM_RET_01',
      competencyId: 'strategic_multidisciplinary',
      skillId: 'resource_decision',
      skillName: 'Retención Temporal: Asignación Crítica bajo Incertidumbre',
      educationalObjective: 'Comprobar la retención del principio de prioridad lexicográfica en soporte vital.',
      difficulty: 2,
      isDiagnostic: false,
      isRetention: true,
      context: 'Tras varios ciclos de navegación estable, se presenta una despresurización con 200 kW de energía disponibles.',
      statement: 'Supervivencia de tripulación requiere 120 kW innegociables. El blindaje requiere 60 kW para resistir micro-meteoritos. El transmisor pide 50 kW para emitir una señal de auxilio a la flota.\n\n¿Cuál es la asignación estratégica que preserva la vida y la integridad estructural?',
      options: [
        'Tripulación: 120 kW, Blindaje: 60 kW, Transmisor: 20 kW en modo baja potencia (Total = 200 kW)',
        'Tripulación: 100 kW, Blindaje: 50 kW, Transmisor: 50 kW (Reparto equitativo arriesgando asfixia)',
        'Tripulación: 120 kW, Blindaje: 30 kW, Transmisor: 50 kW (Blindaje insuficiente ante impactos)',
        'Apagar soporte vital para priorizar la transmisión de socorro'
      ],
      correctIndex: 0,
      explanation: 'Los requerimientos absolutos de soporte biológico (120) y protección estructural (60) suman 180 kW. Las 20 unidades restantes se asignan al transmisor en modo ahorro. La vida y la estructura física son restricciones duras prioritarias.',
      conceptNeeded: 'Conservación del balance multicriterio bajo restricciones duras.',
      strategy: 'Asegura primero la vida (120) y la nave (60). El resto va a la comunicación secundaria.',
      hints: [
        'Pista 1: 120 + 60 = 180 kW indispensables. 200 - 180 = 20 kW.',
        'Pista 2: La llamada de socorro es inútil si la tripulación o la estación no sobreviven.'
      ]
    }
  ]
};

export class ChallengeRepository {
  static getChallengesByCompetency(competencyId) {
    return CHALLENGES_BANK[competencyId] || [];
  }

  static getChallengeById(challengeId) {
    for (const compId in CHALLENGES_BANK) {
      const match = CHALLENGES_BANK[compId].find(c => c.id === challengeId);
      if (match) return match;
    }
    return null;
  }

  /**
   * Obtiene un desafío de transferencia para la competencia activa.
   * @param {string} competencyId
   * @param {string} [skillId]
   * @returns {Object|null}
   */
  static getTransferChallenge(competencyId, skillId = null) {
    const list = this.getChallengesByCompetency(competencyId);
    if (skillId) {
      const match = list.find(c => c.isTransfer && c.skillId === skillId);
      if (match) return match;
    }
    return list.find(c => c.isTransfer) || null;
  }

  /**
   * Obtiene un desafío de retención temporal para la competencia activa.
   * @param {string} competencyId
   * @param {string} [skillId]
   * @returns {Object|null}
   */
  static getRetentionChallenge(competencyId, skillId = null) {
    const list = this.getChallengesByCompetency(competencyId);
    if (skillId) {
      const match = list.find(c => c.isRetention && c.skillId === skillId);
      if (match) return match;
    }
    return list.find(c => c.isRetention) || null;
  }
}
