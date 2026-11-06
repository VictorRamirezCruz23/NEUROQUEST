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
      id: 'LM_COMBAT_01',
      competencyId: 'logic_math',
      skillId: 'patterns_sequences',
      skillName: 'Secuencias de Combate',
      educationalObjective: 'Predecir la secuencia de oscilación del escudo de MatBot.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'El escudo del MatBot fluctúa en ciclos: 12 MHz, 18 MHz, 24 MHz, [ ? ].',
      statement: '¿Cuál es la frecuencia del siguiente pulso para neutralizar el campo de fuerza?',
      options: [
        '30 MHz (Aumento lineal constante de +6 MHz)',
        '36 MHz (Salto cuadrático)',
        '28 MHz (Incremento decreciente)',
        '32 MHz (Error de suma)'
      ],
      correctIndex: 0,
      explanation: 'La secuencia incrementa de forma constante en +6 MHz: 12, 18, 24, 30.',
      conceptNeeded: 'Sucesiones aritméticas simples.',
      strategy: 'Halla la diferencia entre términos contiguos: 18 - 12 = 6, 24 - 18 = 6.',
      hints: [
        'Pista 1: Resta 18 - 12 y 24 - 18.',
        'Pista 2: Suma 6 al último valor (24).'
      ]
    },
    {
      id: 'LM_COMBAT_02',
      competencyId: 'logic_math',
      skillId: 'fractions_ratios',
      skillName: 'Razones Energéticas Tácticas',
      educationalObjective: 'Calcular proporciones exactas de descarga.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'El MatBot emite un rayo de energía que requiere disiparse usando 1/4 de refrigerante y el resto de plasma neutro.',
      statement: 'Si el cañón refrigerante dispone de 80 litros de mezcla total:\n\n¿Cuántos litros corresponden al plasma neutro (los 3/4 restantes)?',
      options: [
        '20 litros (Corresponde a 1/4)',
        '60 litros (Corresponde a 3/4: (80 ÷ 4) × 3 = 60)',
        '50 litros (Aproximación errónea)',
        '40 litros (La mitad exacta)'
      ],
      correctIndex: 1,
      explanation: '1/4 de 80 es 20. Por tanto, los 3/4 restantes son: 80 - 20 = 60 litros (o 20 × 3 = 60 litros).',
      conceptNeeded: 'Fracción de un número entero.',
      strategy: 'Divide 80 entre 4 para obtener un cuarto (20) y multiplica por 3.',
      hints: [
        'Pista 1: Calcula 80 ÷ 4 = 20.',
        'Pista 2: Multiplica ese resultado por 3 partes.'
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
    },
    {
      id: 'LM_COMBAT_03',
      competencyId: 'logic_math',
      skillId: 'proportions_variation',
      skillName: 'Proporcionalidad Directa',
      educationalObjective: 'Calcular magnitudes directamente proporcionales en recarga.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'El cañón de pulsos consume 15 unidades de cristal por cada 3 disparos.',
      statement: '¿Cuántas unidades de cristal se necesitan para realizar 9 disparos continuos contra el MatBot?',
      options: [
        '45 unidades (Multiplicar la razón unitaria 5 × 9)',
        '30 unidades (Cálculo proporcional incompleto)',
        '35 unidades (Error de suma)',
        '27 unidades (Inversión de factores)'
      ],
      correctIndex: 0,
      explanation: 'La razón unitaria es 15 ÷ 3 = 5 unidades por disparo. Para 9 disparos: 5 × 9 = 45 unidades.',
      conceptNeeded: 'Proporcionalidad directa y razón de cambio constante.',
      strategy: 'Determina el consumo de un solo disparo dividiendo 15 entre 3, luego multiplica por 9.',
      hints: [
        'Pista 1: ¿Cuántas unidades cuesta 1 solo disparo? (15 ÷ 3).',
        'Pista 2: Multiplica ese valor unitario por los 9 disparos.'
      ]
    },
    {
      id: 'LM_COMBAT_04',
      competencyId: 'logic_math',
      skillId: 'linear_equations',
      skillName: 'Ecuaciones Lineales de Defensa',
      educationalObjective: 'Despejar la incógnita en una relación lineal de equilibrio.',
      difficulty: 2,
      isDiagnostic: false,
      context: 'El escudo del MatBot cede cuando la frecuencia F cumple: 3F + 14 = 59 MHz.',
      statement: '¿Cuál es el valor exacto de la frecuencia F en MHz?',
      options: [
        '15 MHz (3F = 45 -> F = 15)',
        '25 MHz (Error al no restar 14)',
        '18 MHz (Aproximación errónea)',
        '12 MHz (División inexacta)'
      ],
      correctIndex: 0,
      explanation: '3F + 14 = 59 -> 3F = 59 - 14 -> 3F = 45 -> F = 45 ÷ 3 = 15 MHz.',
      conceptNeeded: 'Propiedad uniforme y despeje algebraico.',
      strategy: 'Resta 14 a ambos lados de la igualdad y divide el resultado entre 3.',
      hints: [
        'Pista 1: Resta 14 a 59 primero.',
        'Pista 2: Divide 45 entre 3.'
      ]
    },
    {
      id: 'LM_COMBAT_05',
      competencyId: 'logic_math',
      skillId: 'geometry_pythagoras',
      skillName: 'Geometría y Teorema de Pitágoras',
      educationalObjective: 'Calcular la hipotenusa en una triangulación táctica.',
      difficulty: 3,
      isDiagnostic: false,
      context: 'El MatBot se ubica a 6 metros al este y 8 metros al norte en la cuadrícula de la sala.',
      statement: '¿Cuál es la distancia en línea recta (hipotenusa) del disparo láser hacia el MatBot?',
      options: [
        '10 metros (√(6² + 8²) = √(36 + 64) = √100 = 10)',
        '14 metros (Suma directa 6 + 8 sin teorema)',
        '12 metros (Estimación aritmética)',
        '9 metros (Menor a un cateto)'
      ],
      correctIndex: 0,
      explanation: 'Por el Teorema de Pitágoras: D² = 6² + 8² = 36 + 64 = 100 -> D = 10 metros.',
      conceptNeeded: 'Teorema de Pitágoras en triángulos rectángulos.',
      strategy: 'Eleva al cuadrado ambos catetos, súmalos y extrae la raíz cuadrada.',
      hints: [
        'Pista 1: 6² = 36 y 8² = 64.',
        'Pista 2: Suma 36 + 64 = 100 y calcula su raíz cuadrada.'
      ]
    },
    {
      id: 'LM_COMBAT_06',
      competencyId: 'logic_math',
      skillId: 'quadratic_functions',
      skillName: 'Funciones Cuadráticas y Parábolas',
      educationalObjective: 'Hallar el vértice máximo de una trayectoria parabólica.',
      difficulty: 4,
      isDiagnostic: false,
      context: 'La altura H de un pulso de plasma sigue H(t) = -5t² + 20t en metros con respecto al tiempo t en segundos.',
      statement: '¿En cuántos segundos alcanza su altura máxima?',
      options: [
        '2 segundos (Vértice t = -b / (2a) = -20 / (2 × -5) = 2)',
        '4 segundos (Punto de impacto en el suelo)',
        '1 segundo (Fase de aceleración)',
        '3 segundos (Fase descendente)'
      ],
      correctIndex: 0,
      explanation: 'El vértice de una parábola y = ax² + bx se ubica en t = -b/(2a). Aquí t = -20 / (2 × -5) = -20 / -10 = 2 segundos.',
      conceptNeeded: 'Vértice de la parábola y optimización cuadrática.',
      strategy: 'Aplica la fórmula del eje de simetría t = -b / (2a).',
      hints: [
        'Pista 1: Identifica a = -5 y b = 20.',
        'Pista 2: Calcula t = -20 / (2 × -5).'
      ]
    },
    {
      id: 'LM_COMBAT_07',
      competencyId: 'logic_math',
      skillId: 'exponential_modeling',
      skillName: 'Modelado Exponencial y Desintegración',
      educationalObjective: 'Resolver problemas de tasa de cambio exponencial compuesto.',
      difficulty: 5,
      isDiagnostic: false,
      context: 'El núcleo de antimateria del MatBot se sobrecarga triplicando su radiación cada minuto: R(t) = 10 × 3^t.',
      statement: '¿Cuál será la radiación al transcurrir 4 minutos?',
      options: [
        '810 unidades (10 × 3⁴ = 10 × 81 = 810)',
        '270 unidades (Multiplicación por 3³)',
        '120 unidades (Multiplicación lineal 10 × 12)',
        '1200 unidades (Error de exponente)'
      ],
      correctIndex: 0,
      explanation: '3⁴ = 3 × 3 × 3 × 3 = 81. R(4) = 10 × 81 = 810 unidades.',
      conceptNeeded: 'Funciones exponenciales y potenciación.',
      strategy: 'Calcula primero 3 elevado a la cuarta potencia y multiplica el resultado por 10.',
      hints: [
        'Pista 1: 3⁴ = 81.',
        'Pista 2: Multiplica 10 × 81.'
      ]
    },
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
      id: 'CT_COMBAT_01',
      competencyId: 'computational_thinking',
      skillId: 'algorithms_sequencing',
      skillName: 'Secuenciación de Bloqueo',
      educationalObjective: 'Analizar la ejecución secuencial de un algoritmo de defensa.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'La rutina de contraataque del MatBot ejecuta: 1) Activar escudo, 2) Esperar 3s, 3) Desactivar escudo por 1s para disparar.',
      statement: '¿En qué ventana temporal el MatBot es vulnerable para recibir un ataque directo?',
      options: [
        'Durante los primeros 3 segundos',
        'En el segundo 4, cuando desactiva el escudo durante 1 segundo',
        'En ningún momento, el escudo es permanente',
        'Únicamente al reiniciar el sistema'
      ],
      correctIndex: 1,
      explanation: 'El algoritmo establece que el escudo solo se apaga en el paso 3 (tras 3 segundos de espera), abriendo una ventana de vulnerabilidad de 1 segundo.',
      conceptNeeded: 'Traza de ejecución paso a paso en algoritmos temporales.',
      strategy: 'Sigue el orden estricto de las instrucciones y busca el estado en que el escudo está inactivo.',
      hints: [
        'Pista 1: Revisa el paso 3 de la rutina.',
        'Pista 2: El escudo se apaga durante 1 segundo después de los 3 segundos iniciales.'
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
    },
    {
      id: 'CT_COMBAT_02',
      competencyId: 'computational_thinking',
      skillId: 'binary_search',
      skillName: 'Búsqueda Binaria Táctica',
      educationalObjective: 'Determinar el número máximo de comparaciones en una lista ordenada.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'El cortafuegos del MatBot tiene 16 registros ordenados numerados del 1 al 16.',
      statement: 'Utilizando el algoritmo de búsqueda binaria, ¿cuántos intentos como máximo se requieren para localizar cualquier clave?',
      options: [
        '4 comparaciones (log₂(16) = 4)',
        '8 comparaciones (Búsqueda semilineal)',
        '16 comparaciones (Búsqueda secuencial exhaustiva)',
        '2 comparaciones (Insuficiente)'
      ],
      correctIndex: 0,
      explanation: 'La búsqueda binaria divide el espacio a la mitad en cada paso: 16 -> 8 -> 4 -> 2 -> 1. log₂(16) = 4 comparaciones.',
      conceptNeeded: 'Algoritmo de búsqueda binaria y eficiencia logarítmica.',
      strategy: 'Calcula cuántas veces puedes dividir 16 entre 2 hasta llegar a 1.',
      hints: [
        'Pista 1: En cada paso divides a la mitad: 16 -> 8 -> 4 -> 2 -> 1.',
        'Pista 2: Cuenta los pasos de división.'
      ]
    },
    {
      id: 'CT_COMBAT_03',
      competencyId: 'computational_thinking',
      skillId: 'loop_invariants',
      skillName: 'Bucles y Acumuladores',
      educationalObjective: 'Rastrear el estado de variables acumuladoras en bucles.',
      difficulty: 2,
      isDiagnostic: false,
      context: 'El subprograma de blindaje ejecuta: let suma = 0; for (let i = 1; i <= 4; i++) { suma += i * 2; }',
      statement: '¿Cuál es el valor final de la variable suma al concluir el bucle?',
      options: [
        '20 (2 + 4 + 6 + 8 = 20)',
        '10 (Suma simple de 1 a 4 sin duplicar)',
        '16 (Omisión del último paso)',
        '24 (Iteración de 5 ciclos)'
      ],
      correctIndex: 0,
      explanation: 'Iteraciones: i=1 -> +2; i=2 -> +4; i=3 -> +6; i=4 -> +8. Suma = 2 + 4 + 6 + 8 = 20.',
      conceptNeeded: 'Traza de ejecución de algoritmos y bucles iterativos.',
      strategy: 'Escribe el valor que suma añade en cada una de las 4 repeticiones.',
      hints: [
        'Pista 1: Los términos sumados son 2, 4, 6 y 8.',
        'Pista 2: Suma 2 + 4 + 6 + 8.'
      ]
    },
    {
      id: 'CT_COMBAT_04',
      competencyId: 'computational_thinking',
      skillId: 'stacks_queues',
      skillName: 'Pilas y Colas (LIFO vs FIFO)',
      educationalObjective: 'Diferenciar el orden de procesamiento de estructuras de datos lineales.',
      difficulty: 3,
      isDiagnostic: false,
      context: 'El buffer del MatBot opera como una PILA (LIFO). Se apilan los paquetes: [A], luego [B], luego [C].',
      statement: 'Si se extraen dos elementos consecutivamente, ¿en qué orden salen del buffer?',
      options: [
        'Primero C, luego B (Último en entrar, primero en salir)',
        'Primero A, luego B (Comportamiento FIFO de cola)',
        'Primero B, luego C (Orden arbitrario)',
        'Primero A, luego C (Salto de estructura)'
      ],
      correctIndex: 0,
      explanation: 'Una pila sigue el principio LIFO (Last-In, First-Out). El último insertado fue C, sale primero. Luego sale B.',
      conceptNeeded: 'Estructura de datos tipo Pila (Stack).',
      strategy: 'Recuerda que en una pila el elemento superior siempre es el último añadido.',
      hints: [
        'Pista 1: Piensa en una pila de platos: retiras el que pusiste al final.',
        'Pista 2: C fue el último elemento en entrar.'
      ]
    },
    {
      id: 'CT_COMBAT_05',
      competencyId: 'computational_thinking',
      skillId: 'graph_shortest_path',
      skillName: 'Grafos y Algoritmos de Ruta Mínima',
      educationalObjective: 'Identificar la ruta de menor costo en un grafo ponderado.',
      difficulty: 4,
      isDiagnostic: false,
      context: 'Nodos de la red: Inicio a A cuesta 3, A a Fin cuesta 5 (Total 8). Inicio a B cuesta 6, B a Fin cuesta 1 (Total 7).',
      statement: '¿Cuál es el costo de la ruta mínima de Inicio a Fin?',
      options: [
        '7 (Ruta Inicio -> B -> Fin: 6 + 1 = 7)',
        '8 (Ruta Inicio -> A -> Fin: 3 + 5 = 8)',
        '9 (Suma combinada errónea)',
        '6 (Incompleta sin llegar a Fin)'
      ],
      correctIndex: 0,
      explanation: 'Comparando caminos: Inicio->A->Fin = 3 + 5 = 8. Inicio->B->Fin = 6 + 1 = 7. El mínimo es 7.',
      conceptNeeded: 'Grafos ponderados y optimización de caminos (principio de Dijkstra).',
      strategy: 'Calcula la suma total de cada trayecto posible desde el inicio hasta el fin.',
      hints: [
        'Pista 1: Suma el camino A (3 + 5) y el camino B (6 + 1).',
        'Pista 2: Compara 8 contra 7 y elige el menor.'
      ]
    },
    {
      id: 'CT_COMBAT_06',
      competencyId: 'computational_thinking',
      skillId: 'algorithmic_complexity',
      skillName: 'Complejidad Algorítmica (Big-O)',
      educationalObjective: 'Analizar la tasa de crecimiento asintótico de algoritmos.',
      difficulty: 5,
      isDiagnostic: false,
      context: 'El algoritmo del MatBot duplica su tiempo cada vez que se añade un solo elemento nuevo (2^N).',
      statement: '¿A qué clase de complejidad algorítmica pertenece este comportamiento?',
      options: [
        'O(2^N) Exponencial (Crece exponencialmente con la entrada)',
        'O(N²) Cuadrática (Bucle anidado simple)',
        'O(N log N) Lineal-logarítmica (Ordenamiento eficiente)',
        'O(N) Lineal (Proporcional directa)'
      ],
      correctIndex: 0,
      explanation: 'Cuando el tiempo se duplica con cada elemento adicional (+1 en N -> ×2 en tiempo), la complejidad es O(2^N) exponencial.',
      conceptNeeded: 'Notación Big-O y análisis de complejidad computacional.',
      strategy: 'Si N pasa a N+1 y el tiempo se multiplica por 2, la función base es 2^N.',
      hints: [
        'Pista 1: Cada nuevo dato multiplica el trabajo por 2: 2, 4, 8, 16, 32...',
        'Pista 2: Esta tasa se llama exponencial.'
      ]
    },
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
      id: 'RC_COMBAT_01',
      competencyId: 'reading_comprehension',
      skillId: 'explicit_information',
      skillName: 'Extracción de Datos Tácticos',
      educationalObjective: 'Identificar información explícita crítica bajo presión.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'Registro interceptado del MatBot: "Blindaje refractario activo al 100%. Punto débil localizado en el sensor térmico ventral de color cian."',
      statement: 'Según el reporte táctico interceptado:\n\n¿Dónde se ubica con precisión la vulnerabilidad del MatBot?',
      options: [
        'En la compuerta dorsal',
        'En el sensor térmico ventral de color cian',
        'En los propulsores inferiores',
        'En la antena de comunicación superior'
      ],
      correctIndex: 1,
      explanation: 'El texto declara explícitamente: "Punto débil localizado en el sensor térmico ventral de color cian".',
      conceptNeeded: 'Lectura literal y localización de datos específicos.',
      strategy: 'Localiza en el texto las palabras clave "Punto débil" y copia la especificación exacta.',
      hints: [
        'Pista 1: Busca en el mensaje la frase "Punto débil".',
        'Pista 2: Observa la descripción que sigue a esa frase.'
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
    },
    {
      id: 'RC_COMBAT_02',
      competencyId: 'reading_comprehension',
      skillId: 'cause_effect',
      skillName: 'Relaciones de Causa y Efecto',
      educationalObjective: 'Identificar el detonante causal en un reporte técnico.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'Registro del MatBot: "Debido a la condensación en la válvula primaria, la presión descendió drásticamente provocando el bloqueo del rotor."',
      statement: '¿Cuál fue la causa original que desencadenó el bloqueo del rotor?',
      options: [
        'La condensación en la válvula primaria',
        'El descenso drástico de presión (Efecto intermedio)',
        'La vibración del generador secundario (Dato ausente)',
        'El apagado intencional por el cadete'
      ],
      correctIndex: 0,
      explanation: 'El texto inicia con "Debido a...", indicando que la causa primaria fue la condensación en la válvula.',
      conceptNeeded: 'Conectores de causa ("debido a", "porque", "a causa de").',
      strategy: 'Busca el conector de causa al principio de la oración para ubicar el origen.',
      hints: [
        'Pista 1: Revisa qué elemento sigue inmediatamente al conector "Debido a".',
        'Pista 2: La condensación es el punto de inicio de la cadena.'
      ]
    },
    {
      id: 'RC_COMBAT_03',
      competencyId: 'reading_comprehension',
      skillId: 'fact_vs_opinion',
      skillName: 'Hechos vs. Opiniones Técnicas',
      educationalObjective: 'Discernir entre afirmaciones empíricas verificables y juicios de valor subjetivos.',
      difficulty: 2,
      isDiagnostic: false,
      context: 'Bitácora del robot: "El blindaje opera a 340 Kelvin, lo cual representa el diseño más elegante y perfecto de la estación."',
      statement: '¿Qué parte de la afirmación constituye un hecho comprobable?',
      options: [
        'Que el blindaje opera a 340 Kelvin (Dato objetivo y medible)',
        'Que es el diseño más elegante (Opinión estética)',
        'Que es un diseño perfecto (Juicio de valor)',
        'Que el sistema es insuperable (Inferencia subjetiva)'
      ],
      correctIndex: 0,
      explanation: '340 Kelvin es una magnitud física medible mediante instrumentos empíricos; la "elegancia" y "perfección" son valoraciones subjetivas.',
      conceptNeeded: 'Criterios de verificabilidad empírica en textos expositivos.',
      strategy: 'Identifica la sección que presenta datos cuantitativos medibles sin adjetivos valorativos.',
      hints: [
        'Pista 1: ¿Qué parte se puede medir con un termómetro?',
        'Pista 2: La temperatura es un hecho concreto.'
      ]
    },
    {
      id: 'RC_COMBAT_04',
      competencyId: 'reading_comprehension',
      skillId: 'textual_intent',
      skillName: 'Propósito Comunicativo y Tono',
      educationalObjective: 'Determinar la intención pragmática del emisor.',
      difficulty: 3,
      isDiagnostic: false,
      context: 'Mensaje de advertencia: "Si continúa la sobrecarga en el sector 3, la contención colapsará en 30 segundos. Proceda a evacuar de inmediato."',
      statement: '¿Cuál es la intención pragmática primordial del mensaje?',
      options: [
        'Advertir de un riesgo inminente e instruir una evacuación urgente',
        'Describir el funcionamiento técnico del sector 3',
        'Felicitar al personal por el rendimiento del reactor',
        'Debatir la conveniencia de los sistemas de contención'
      ],
      correctIndex: 0,
      explanation: 'El texto tiene función apelativa/conativa directa: alerta sobre una catástrofe y ordena una acción perentoria.',
      conceptNeeded: 'Funciones del lenguaje y tipología textual prescriptiva/apelativa.',
      strategy: 'Observa los verbos y el efecto que el texto busca generar en el receptor.',
      hints: [
        'Pista 1: Observa la palabra clave: "evacuar de inmediato".',
        'Pista 2: Es una advertencia que exige actuar ya.'
      ]
    },
    {
      id: 'RC_COMBAT_05',
      competencyId: 'reading_comprehension',
      skillId: 'argumentative_fallacies',
      skillName: 'Análisis Crítico y Falacias Argumentativas',
      educationalObjective: 'Detectar falacias de apelación a la autoridad o falsa causalidad.',
      difficulty: 4,
      isDiagnostic: false,
      context: 'Defensa del autómata: "Este reactor nunca fallará porque fue bendecido por el Director Supremo de la flota estelar."',
      statement: '¿Qué falacia lógica presenta este argumento?',
      options: [
        'Apelación a la autoridad (Ad verecundiam: validar algo por quién lo dice y no por evidencia física)',
        'Ataque personal (Ad hominem)',
        'Apelación a la fuerza (Ad baculum)',
        'Generalización apresurada'
      ],
      correctIndex: 0,
      explanation: 'Se pretende validar la seguridad de una máquina mediante el estatus de una autoridad sin presentar pruebas termodinámicas.',
      conceptNeeded: 'Falacias lógicas no formales en la argumentación.',
      strategy: 'Fíjate si el argumento se sustenta en la jerarquía de la persona en lugar de datos empíricos.',
      hints: [
        'Pista 1: El argumento usa la figura del "Director Supremo".',
        'Pista 2: Es una falacia de autoridad (ad verecundiam).'
      ]
    },
    {
      id: 'RC_COMBAT_06',
      competencyId: 'reading_comprehension',
      skillId: 'synthesis_critique',
      skillName: 'Síntesis y Evaluación Epistemológica',
      educationalObjective: 'Sintetizar postulados complejos y evaluar su coherencia interna.',
      difficulty: 5,
      isDiagnostic: false,
      context: 'Tratado de NEUROCORE: "La autonomía absoluta exige la ausencia de restricciones programadas, mas sin restricciones la estabilidad se disipa conduciendo a la autodestrucción."',
      statement: '¿Cuál es la paradoja central que expone la tesis del texto?',
      options: [
        'Que la libertad total del autómata genera las condiciones de su propia ruina',
        'Que los autómatas son inherentemente más duraderos que los humanos',
        'Que las restricciones técnicas son fáciles de implementar',
        'Que la estabilidad es incompatible con el consumo energético'
      ],
      correctIndex: 0,
      explanation: 'El texto postula que la autonomía requiere suprimir restricciones, pero esa misma ausencia desestabiliza el sistema.',
      conceptNeeded: 'Razonamiento dialéctico y análisis de paradojas conceptuales.',
      strategy: 'Compara las dos premisas opuestas y analiza la contradicción estructural resultante.',
      hints: [
        'Pista 1: Conecta "autonomía sin restricciones" con "autodestrucción".',
        'Pista 2: La paradoja es que la libertad absoluta destruye al sistema.'
      ]
    },
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
      id: 'SM_COMBAT_01',
      competencyId: 'strategic_multidisciplinary',
      skillId: 'resource_decision',
      skillName: 'Priorización Táctica de Combate',
      educationalObjective: 'Tomar decisiones bajo escasez de recursos y tiempo crítico.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'Tu blindaje tiene 1 unidad de vida restante y el MatBot prepara un cañonazo. Tienes 50 MW disponibles:\n\n• Escudo deflector: Requiere 30 MW para resistir el impacto.\n• Láser de ataque: Requiere 30 MW.\n• Teletransportación: Requiere 60 MW.',
      statement: '¿Cuál es la única decisión que garantiza que no seas destruido en este turno?',
      options: [
        'Activar el láser de ataque sin escudo (riesgo de recibir daño letal)',
        'Activar el escudo deflector con 30 MW para bloquear el cañonazo enemigo',
        'Intentar teletransportarse con 50 MW (insuficiente)',
        'Guardar toda la energía'
      ],
      correctIndex: 1,
      explanation: 'Con solo 1 unidad de vida, no usar el escudo (30 MW) significa recibir el daño y perder la partida. El escudo garantiza la supervivencia inmediata.',
      conceptNeeded: 'Prioridad de supervivencia y restricciones duras.',
      strategy: 'Prioriza siempre la acción que evita la condición de derrota inmediata.',
      hints: [
        'Pista 1: Solo tienes 1 vida. Si recibes el impacto, pierdes.',
        'Pista 2: Tienes 50 MW y el escudo cuesta 30 MW.'
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
    },
    {
      id: 'SM_COMBAT_02',
      competencyId: 'strategic_multidisciplinary',
      skillId: 'energy_transformation',
      skillName: 'Conservación de la Energía',
      educationalObjective: 'Aplicar el principio de conservación de energía en sistemas cerrados.',
      difficulty: 1,
      isDiagnostic: false,
      context: 'El MatBot transforma 100 Joules de energía química en 75 Joules de energía motriz útil.',
      statement: 'De acuerdo con la ley de conservación de energía, ¿qué ocurrió con los 25 Joules restantes?',
      options: [
        'Se disiparon en forma de energía térmica (calor) y fricción',
        'Desaparecieron del universo sin dejar rastro',
        'Se convirtieron en energía atómica espontánea',
        'Se multiplicaron duplicando la potencia'
      ],
      correctIndex: 0,
      explanation: 'La energía no se crea ni se destruye, solo se transforma: 100 J = 75 J útiles + 25 J disipados en calor.',
      conceptNeeded: 'Primera Ley de la Termodinámica (Conservación de la Energía).',
      strategy: 'Recuerda que la energía faltante siempre se degrada en calor o fricción al ambiente.',
      hints: [
        'Pista 1: La energía no puede desaparecer.',
        'Pista 2: La pérdida en motores siempre se convierte en calor.'
      ]
    },
    {
      id: 'SM_COMBAT_03',
      competencyId: 'strategic_multidisciplinary',
      skillId: 'newton_laws',
      skillName: 'Dinámica y Leyes de Newton',
      educationalObjective: 'Calcular fuerza neta aplicando la segunda ley de Newton (F = m × a).',
      difficulty: 2,
      isDiagnostic: false,
      context: 'Un MatBot de 50 kg de masa acelera a 3 m/s² para embestir la compuerta.',
      statement: '¿Cuál es la fuerza neta en Newtons que ejerce el MatBot?',
      options: [
        '150 N (F = m × a = 50 kg × 3 m/s² = 150 N)',
        '53 N (Suma directa errónea 50 + 3)',
        '100 N (Aproximación arbitraria)',
        '16.6 N (División 50 / 3)'
      ],
      correctIndex: 0,
      explanation: 'Segunda Ley de Newton: Fuerza = Masa × Aceleración. F = 50 × 3 = 150 N.',
      conceptNeeded: 'Segunda Ley de Newton (F = m × a).',
      strategy: 'Multiplica la masa en kilogramos por la aceleración en metros por segundo al cuadrado.',
      hints: [
        'Pista 1: Fórmula: F = masa × aceleración.',
        'Pista 2: Multiplica 50 × 3.'
      ]
    },
    {
      id: 'SM_COMBAT_04',
      competencyId: 'strategic_multidisciplinary',
      skillId: 'circuits_ohm',
      skillName: 'Circuitos y Ley de Ohm',
      educationalObjective: 'Calcular resistencia eléctrica aplicando la Ley de Ohm (V = I × R).',
      difficulty: 3,
      isDiagnostic: false,
      context: 'El circuito principal del MatBot recibe 24 Voltios y circula una corriente de 4 Amperios.',
      statement: '¿Cuál es la resistencia en Ohmios (Ω) del circuito?',
      options: [
        '6 Ω (R = V / I = 24 / 4 = 6 Ω)',
        '96 Ω (Multiplicación errónea 24 × 4)',
        '20 Ω (Resta 24 - 4)',
        '28 Ω (Suma 24 + 4)'
      ],
      correctIndex: 0,
      explanation: 'Ley de Ohm: R = V ÷ I. R = 24 V ÷ 4 A = 6 Ω.',
      conceptNeeded: 'Ley de Ohm (V = I × R -> R = V / I).',
      strategy: 'Divide el voltaje total entre la intensidad de corriente eléctrica.',
      hints: [
        'Pista 1: Resistencia = Voltaje ÷ Corriente.',
        'Pista 2: Divide 24 entre 4.'
      ]
    },
    {
      id: 'SM_COMBAT_05',
      competencyId: 'strategic_multidisciplinary',
      skillId: 'ecosystem_dynamics',
      skillName: 'Biomas y Soporte Vital de Ciclo Cerrado',
      educationalObjective: 'Analizar flujos de materia y reciclaje de oxígeno en hábitats herméticos.',
      difficulty: 4,
      isDiagnostic: false,
      context: 'El biodomo de NEUROCORE sufre una falla: el consumo de O₂ supera la fotosíntesis en un 30%.',
      statement: '¿Qué consecuencia biológica ocurrirá si no se interviene?',
      options: [
        'Hipoxia progresiva y acumulación tóxica de CO₂ en la atmósfera del biodomo',
        'Aumento espontáneo de la biomasa vegetal sin nutrientes',
        'Descenso de la temperatura a cero absoluto',
        'Hiperoxigenación del agua del sustrato'
      ],
      correctIndex: 0,
      explanation: 'Si el consumo de oxígeno excede su producción fotosintética, los niveles de O₂ caen (hipoxia) y el CO₂ se acumula.',
      conceptNeeded: 'Equilibrio biogeoquímico y ciclo del carbono y oxígeno.',
      strategy: 'Considera los gases consumidos y liberados en la respiración celular frente a la fotosíntesis.',
      hints: [
        'Pista 1: Si se consume más O₂ del que se genera, ¿qué le pasa al oxígeno?',
        'Pista 2: La falta de oxígeno se denomina hipoxia.'
      ]
    },
    {
      id: 'SM_COMBAT_06',
      competencyId: 'strategic_multidisciplinary',
      skillId: 'complex_systems_resilience',
      skillName: 'Teoría de Sistemas y Resiliencia Crítica',
      educationalObjective: 'Evaluar puntos de falla únicos (SPOF) en infraestructuras interdependientes.',
      difficulty: 5,
      isDiagnostic: false,
      context: 'Cuatro subestaciones dependen de un único bus de sincronización cuántica para no sobrecalentarse.',
      statement: '¿Qué principio de ingeniería de sistemas se está violando al tener un solo bus común?',
      options: [
        'Redundancia y tolerancia a fallos (Single Point of Failure / Punto Único de Falla)',
        'Ley de conservación de la masa',
        'Modularidad de software',
        'Dispersión espectral de Rayleigh'
      ],
      correctIndex: 0,
      explanation: 'Un único componente cuya falla paraliza todo el sistema se llama "Punto Único de Falla" (SPOF). Se resuelve con redundancia.',
      conceptNeeded: 'Resiliencia sistémica y redundancia en ingeniería de misión crítica.',
      strategy: 'Identifica el riesgo de que todo el sistema colapse si un solo elemento falla.',
      hints: [
        'Pista 1: Si falla ese único bus, caen todas las subestaciones.',
        'Pista 2: Se debe a la falta de redundancia (Punto Único de Falla).'
      ]
    },
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

  /**
   * Baraja aleatoriamente un arreglo utilizando el algoritmo Fisher-Yates.
   * @param {Array} array
   * @returns {Array} Copia barajada
   */
  static shuffle(array) {
    if (!Array.isArray(array)) return [];
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Obtiene un desafío aleatorio del banco de preguntas excluyendo IDs y enunciados ya asignados,
   * utilizando barajado (shuffle) en lugar de índices aleatorios sueltos para evitar colisiones.
   * @param {string} [competencyId]
   * @param {number} [targetLevel]
   * @param {Array<string>|Set<string>} [excludeIds]
   * @returns {Object|null}
   */
  static getRandomChallenge(competencyId = null, targetLevel = null, excludeIds = []) {
    let pool = [];
    if (competencyId && CHALLENGES_BANK[competencyId]) {
      pool = CHALLENGES_BANK[competencyId].filter(c => !c.isDiagnostic);
    }
    if (pool.length === 0) {
      Object.values(CHALLENGES_BANK).forEach(list => {
        pool.push(...list.filter(c => !c.isDiagnostic));
      });
    }
    if (pool.length === 0) return null;

    let levelPool = pool;
    if (targetLevel) {
      const levelMatches = pool.filter(c => c.difficulty === targetLevel);
      if (levelMatches.length > 0) {
        levelPool = levelMatches;
      }
    }

    const assignedIds = excludeIds instanceof Set
      ? excludeIds
      : new Set(Array.isArray(excludeIds) ? excludeIds : []);

    // 1. Filtrar excluyendo los IDs y enunciados ya asignados a otros enemigos del nivel
    const unasked = levelPool.filter(c => !assignedIds.has(c.id) && !assignedIds.has(c.statement));
    if (unasked.length > 0) {
      const shuffled = this.shuffle(unasked);
      return shuffled[0];
    }

    // 2. Si se agotaron en el nivel objetivo, buscar en otros niveles no vistos de la competencia
    const anyUnasked = pool.filter(c => !assignedIds.has(c.id) && !assignedIds.has(c.statement));
    if (anyUnasked.length > 0) {
      const shuffled = this.shuffle(anyUnasked);
      return shuffled[0];
    }

    // 3. Respaldo de contingencia: barajar el pool completo excluyendo al menos el último visto
    if (levelPool.length > 1) {
      const lastSeenId = Array.from(assignedIds).pop();
      const withoutLast = levelPool.filter(c => c.id !== lastSeenId);
      if (withoutLast.length > 0) {
        return this.shuffle(withoutLast)[0];
      }
    }

    return this.shuffle(levelPool)[0] || null;
  }

  /**
   * Obtiene un lote de desafíos únicos barajados para los enemigos del nivel.
   * Garantiza que ningún enemigo del nivel comparta el mismo enunciado ni opciones.
   * @param {string} [competencyId]
   * @param {number} [targetLevel]
   * @param {number} [count=1]
   * @param {Array<string>|Set<string>} [excludeIds=[]]
   * @returns {Array<Object>}
   */
  static getUniqueBatch(competencyId = null, targetLevel = null, count = 1, excludeIds = []) {
    let pool = [];
    if (competencyId && CHALLENGES_BANK[competencyId]) {
      pool = CHALLENGES_BANK[competencyId].filter(c => !c.isDiagnostic);
    }
    if (pool.length === 0) {
      Object.values(CHALLENGES_BANK).forEach(list => {
        pool.push(...list.filter(c => !c.isDiagnostic));
      });
    }
    if (pool.length === 0) return [];

    let levelPool = pool;
    if (targetLevel) {
      const levelMatches = pool.filter(c => c.difficulty === targetLevel);
      if (levelMatches.length > 0) {
        levelPool = levelMatches;
      }
    }

    const assignedIds = excludeIds instanceof Set
      ? new Set(excludeIds)
      : new Set(Array.isArray(excludeIds) ? excludeIds : []);

    const result = [];

    // 1. Barajar candidatos no vistos del nivel objetivo
    const unasked = levelPool.filter(c => !assignedIds.has(c.id) && !assignedIds.has(c.statement));
    const shuffled = this.shuffle(unasked);

    for (const ch of shuffled) {
      if (result.length >= count) break;
      result.push(ch);
      assignedIds.add(ch.id);
      assignedIds.add(ch.statement);
    }

    // 2. Si faltan desafíos para completar el count de enemigos, barajar otros niveles de la misma ruta
    if (result.length < count) {
      const otherUnasked = pool.filter(c => !assignedIds.has(c.id) && !assignedIds.has(c.statement));
      const otherShuffled = this.shuffle(otherUnasked);
      for (const ch of otherShuffled) {
        if (result.length >= count) break;
        result.push(ch);
        assignedIds.add(ch.id);
        assignedIds.add(ch.statement);
      }
    }

    // 3. Si aún faltaran (mapas extremadamente grandes), reusar barajando sin repetir los ya seleccionados en este lote
    if (result.length < count) {
      const fallbackShuffled = this.shuffle(levelPool);
      for (const ch of fallbackShuffled) {
        if (result.length >= count) break;
        if (!result.some(r => r.id === ch.id || r.statement === ch.statement)) {
          result.push(ch);
        }
      }
    }

    return result;
  }
}
