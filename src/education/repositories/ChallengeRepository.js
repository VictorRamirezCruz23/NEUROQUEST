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
}
