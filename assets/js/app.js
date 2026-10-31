/**
 * Controlador de Frontend y Lógica de Interfaz
 * Integra el módulo estadístico refactorizado (window.Estadisticas)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Verificación de que el script refactorizado está cargado
  if (!window.Estadisticas) {
    console.error('El módulo Estadisticas no se ha cargado correctamente.');
    return;
  }

  const {
    validarNumeros,
    obtenerMedia,
    obtenerMediana,
    obtenerVarianza,
    obtenerDesviacionEstandar,
    obtenerEstadisticas
  } = window.Estadisticas;

  // Elementos del DOM
  const dataInput = document.getElementById('data-input');
  const btnCalculate = document.getElementById('btn-calculate');
  const btnClear = document.getElementById('btn-clear');
  const validationMessage = document.getElementById('validation-message');

  // Elementos de Métricas
  const valMedia = document.getElementById('val-media');
  const valMediana = document.getElementById('val-mediana');
  const valVarianza = document.getElementById('val-varianza');
  const valDesviacion = document.getElementById('val-desviacion');
  const lblMedianaTipo = document.getElementById('lbl-mediana-tipo');

  // Elementos Auxiliares
  const valCount = document.getElementById('val-count');
  const valSum = document.getElementById('val-sum');
  const valMin = document.getElementById('val-min');
  const valMax = document.getElementById('val-max');
  const valRange = document.getElementById('val-range');

  // Contenedores dinámicos
  const chartContainer = document.getElementById('chart-container');
  const stepByStepContent = document.getElementById('step-by-step-content');

  // Pestañas
  const tabButtons = document.querySelectorAll('.tab-btn[data-target]');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Gestión de Pestañas
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(btn.dataset.target);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  /**
   * Parsea el texto del textarea a un arreglo numérico.
   * Admite comas, espacios, puntos y comas o saltos de línea.
   */
  function parsearEntrada(texto) {
    if (!texto || texto.trim() === '') {
      return [];
    }

    // Separar por comas, espacios, punto y coma o saltos de línea
    const tokens = texto
      .trim()
      .split(/[\s,;]+/)
      .filter(token => token !== '');

    const numeros = tokens.map(token => {
      const num = Number(token);
      return num;
    });

    return numeros;
  }

  /**
   * Formatea un número de forma inteligente:
   * - Si es un número colosal (>= 1e7) o infinitesimal (< 1e-4), usa notación científica compacta (ej: 3.223e+92).
   * - Si es un entero estándar, lo formatea con separador de miles.
   * - Si es decimal, redondea según maxDec sin ceros sobrantes.
   */
  function formatearNumero(num, maxDec = 2) {
    if (typeof num !== 'number' || !Number.isFinite(num)) return '-';
    if (num === 0) return '0';

    const abs = Math.abs(num);
    if (abs >= 1e7 || (abs < 1e-4 && abs > 0)) {
      return num.toExponential(3);
    }

    if (Number.isInteger(num)) {
      return num.toLocaleString('es-ES');
    }

    const str = num.toFixed(maxDec);
    return parseFloat(str).toLocaleString('es-ES', { maximumFractionDigits: maxDec });
  }

  /**
   * Actualiza el gráfico visual de barras y la línea de la media.
   */
  function actualizarGrafico(numeros, media) {
    chartContainer.innerHTML = '';

    if (!numeros || numeros.length === 0) {
      chartContainer.innerHTML = '<p style="color: var(--text-dim); margin: auto;">Sin datos para graficar</p>';
      return;
    }

    const minVal = Math.min(...numeros, 0);
    const maxVal = Math.max(...numeros, media);
    const rangoTotal = maxVal - minVal || 1;

    // Calcular posición porcentual de la línea de la media
    const mediaPercent = Math.max(5, Math.min(95, ((media - minVal) / rangoTotal) * 100));

    // Agregar línea de la media
    const meanLine = document.createElement('div');
    meanLine.className = 'mean-indicator-line';
    meanLine.style.bottom = `${mediaPercent}%`;
    meanLine.innerHTML = `<span class="mean-indicator-badge">μ = ${formatearNumero(media, 2)}</span>`;
    chartContainer.appendChild(meanLine);

    // Renderizar barras individuales
    numeros.forEach((num, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'chart-bar-wrapper';

      const alturaPorcentaje = Math.max(8, Math.min(100, ((num - minVal) / rangoTotal) * 100));

      const barVal = document.createElement('span');
      barVal.className = 'chart-bar-val';
      barVal.textContent = formatearNumero(num, 1);
      barVal.title = `Valor exacto: ${num}`;

      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.height = `${alturaPorcentaje}%`;
      const diff = num - media;
      bar.title = `Valor: ${num}\nDiferencia con Media (x - μ): ${formatearNumero(diff, 2)}\n(x - μ)²: ${formatearNumero(Math.pow(diff, 2), 2)}`;

      const barLabel = document.createElement('span');
      barLabel.className = 'chart-bar-label';
      barLabel.textContent = `x${index + 1}`;

      wrapper.appendChild(barVal);
      wrapper.appendChild(bar);
      wrapper.appendChild(barLabel);

      chartContainer.appendChild(wrapper);
    });
  }

  /**
   * Genera el desglose explicativo paso a paso del cálculo.
   */
  function actualizarDesglose(numeros, stats) {
    const n = numeros.length;
    const ordenados = [...numeros].sort((a, b) => a - b);
    const mitad = Math.floor(n / 2);
    const esPar = n % 2 === 0;
    const suma = numeros.reduce((a, b) => a + b, 0);

    let html = `
      <div class="calc-step">
        <div class="step-header">
          <span>1. Conjunto Ordenado</span>
        </div>
        <div class="step-details">
          Datos (${n} elementos): [${ordenados.map(x => formatearNumero(x, 2)).join(', ')}]
        </div>
      </div>

      <div class="calc-step">
        <div class="step-header">
          <span>2. Cálculo de la Media Aritmética (μ)</span>
        </div>
        <div class="step-details">
          μ = (Σ x) / N = (${formatearNumero(suma, 2)}) / ${n} = <strong>${formatearNumero(stats.media, 4)}</strong>
        </div>
      </div>

      <div class="calc-step">
        <div class="step-header">
          <span>3. Cálculo de la Mediana (M̃)</span>
        </div>
        <div class="step-details">
          ${esPar 
            ? `N es par (${n}). Promedio de posiciones [${mitad}] (${formatearNumero(ordenados[mitad - 1], 2)}) y [${mitad + 1}] (${formatearNumero(ordenados[mitad], 2)}): <strong>${formatearNumero(stats.mediana, 2)}</strong>`
            : `N es impar (${n}). Elemento en posición central [${mitad + 1}]: <strong>${formatearNumero(stats.mediana, 2)}</strong>`
          }
        </div>
      </div>

      <div class="calc-step">
        <div class="step-header">
          <span>4. Cálculo de la Varianza Poblacional (σ²)</span>
        </div>
        <div class="step-details">
          σ² = Σ(x - μ)² / N = Suma de diferencias cuadradas / ${n} = <strong>${formatearNumero(stats.varianza, 4)}</strong>
        </div>
      </div>

      <div class="calc-step">
        <div class="step-header">
          <span>5. Cálculo de la Desviación Estándar (σ)</span>
        </div>
        <div class="step-details">
          σ = √σ² = √(${formatearNumero(stats.varianza, 4)}) = <strong>${formatearNumero(stats.desviacionEstandar, 6)}</strong>
        </div>
      </div>
    `;

    stepByStepContent.innerHTML = html;
  }

  /**
   * Ejecuta el cálculo completo con validación y manejo de errores.
   */
  function ejecutarCalculo() {
    validationMessage.classList.add('hidden');
    validationMessage.textContent = '';

    try {
      const numeros = parsearEntrada(dataInput.value);

      // Usar la función de validación del módulo refactorizado
      validarNumeros(numeros);

      // Obtener estadísticas usando el módulo refactorizado
      const stats = obtenerEstadisticas(numeros);

      // Actualizar tarjetas principales con formateo inteligente y tooltips
      valMedia.textContent = formatearNumero(stats.media, 2);
      valMedia.title = `Valor exacto: ${stats.media}`;

      valMediana.textContent = formatearNumero(stats.mediana, 2);
      valMediana.title = `Valor exacto: ${stats.mediana}`;

      valVarianza.textContent = formatearNumero(stats.varianza, 2);
      valVarianza.title = `Valor exacto: ${stats.varianza}`;

      valDesviacion.textContent = formatearNumero(stats.desviacionEstandar, 4);
      valDesviacion.title = `Valor exacto: ${stats.desviacionEstandar}`;

      lblMedianaTipo.textContent = numeros.length % 2 === 0 ? 'Valor central (N par)' : 'Valor central (N impar)';

      // Métricas auxiliares
      const suma = numeros.reduce((a, b) => a + b, 0);
      const min = Math.min(...numeros);
      const max = Math.max(...numeros);

      valCount.textContent = numeros.length;
      valSum.textContent = formatearNumero(suma, 2);
      valSum.title = `Valor exacto: ${suma}`;

      valMin.textContent = formatearNumero(min, 2);
      valMin.title = `Valor exacto: ${min}`;

      valMax.textContent = formatearNumero(max, 2);
      valMax.title = `Valor exacto: ${max}`;

      valRange.textContent = formatearNumero(max - min, 2);
      valRange.title = `Valor exacto: ${max - min}`;

      // Actualizar componentes visuales
      actualizarGrafico(numeros, stats.media);
      actualizarDesglose(numeros, stats);

    } catch (error) {
      validationMessage.classList.remove('hidden');
      validationMessage.className = 'validation-message error';
      validationMessage.innerHTML = `⚠️ <strong>Error de Validación:</strong> ${error.message}`;

      // Resetear valores a guión
      valMedia.textContent = '-';
      valMediana.textContent = '-';
      valVarianza.textContent = '-';
      valDesviacion.textContent = '-';
      valCount.textContent = '-';
      valSum.textContent = '-';
      valMin.textContent = '-';
      valMax.textContent = '-';
      valRange.textContent = '-';
      chartContainer.innerHTML = '<p style="color: var(--text-dim); margin: auto;">Corrige los errores de entrada para ver el gráfico</p>';
      stepByStepContent.innerHTML = '<p style="color: var(--text-dim);">Esperando entrada válida...</p>';
    }
  }

  // Event Listeners
  btnCalculate.addEventListener('click', ejecutarCalculo);
  dataInput.addEventListener('input', ejecutarCalculo);

  btnClear.addEventListener('click', () => {
    dataInput.value = '';
    ejecutarCalculo();
  });

  // Manejador de Presets
  const presets = {
    original: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10',
    grades: '85, 92, 78, 90, 65, 88, 95, 72',
    temperatures: '18.5, 21.0, 19.8, 22.4, 20.1, 19.5, 23.2',
    random: () => Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 10).join(', ')
  };

  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      const val = typeof presets[presetKey] === 'function' ? presets[presetKey]() : presets[presetKey];
      dataInput.value = val;
      ejecutarCalculo();
    });
  });

  /* ==============================================================================
     EJECUTOR DE PRUEBAS UNITARIAS EN NAVEGADOR
     ============================================================================== */
  const btnRunTests = document.getElementById('btn-run-tests');
  const testsList = document.getElementById('tests-list');
  const testsPassedCount = document.getElementById('tests-passed-count');
  const testsFailedCount = document.getElementById('tests-failed-count');
  const testsTotalCount = document.getElementById('tests-total-count');
  const testsDuration = document.getElementById('tests-duration');

  function ejecutarSuiteDePruebas() {
    testsList.innerHTML = '';
    const inicio = performance.now();

    const casosDePrueba = [
      {
        suite: '1. Verificación del Comportamiento Externo Original (Equivalencia)',
        nombre: 'Cálculo exacto de media con datos originales [1..10] -> 5.5',
        fn: () => {
          const res = obtenerMedia([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          if (res !== 5.5) throw new Error(`Esperado 5.5, recibido ${res}`);
        }
      },
      {
        suite: '1. Verificación del Comportamiento Externo Original (Equivalencia)',
        nombre: 'Cálculo exacto de mediana con datos originales (longitud par) -> 5.5',
        fn: () => {
          const res = obtenerMediana([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          if (res !== 5.5) throw new Error(`Esperado 5.5, recibido ${res}`);
        }
      },
      {
        suite: '1. Verificación del Comportamiento Externo Original (Equivalencia)',
        nombre: 'Cálculo exacto de varianza poblacional con datos originales -> 8.25',
        fn: () => {
          const res = obtenerVarianza([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          if (res !== 8.25) throw new Error(`Esperado 8.25, recibido ${res}`);
        }
      },
      {
        suite: '1. Verificación del Comportamiento Externo Original (Equivalencia)',
        nombre: 'Cálculo exacto de desviación estándar con datos originales -> ~2.87228',
        fn: () => {
          const res = obtenerDesviacionEstandar([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          const redondeado = Math.round(res * 1e5) / 1e5;
          if (redondeado !== 2.87228) throw new Error(`Esperado ~2.87228, recibido ${res}`);
        }
      },
      {
        suite: '1. Verificación del Comportamiento Externo Original (Equivalencia)',
        nombre: 'Retorno de objeto consolidado obtenerEstadisticas con estructura correcta',
        fn: () => {
          const stats = obtenerEstadisticas([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          if (stats.media !== 5.5 || stats.mediana !== 5.5 || stats.varianza !== 8.25) {
            throw new Error('Estructura de estadísticas incorrecta');
          }
        }
      },
      {
        suite: '2. Pruebas con Diferentes Estructuras y Tamaños de Datos',
        nombre: 'Cálculo de mediana con conjunto de longitud impar [9, 1, 5] -> 5',
        fn: () => {
          const res = obtenerMediana([9, 1, 5]);
          if (res !== 5) throw new Error(`Esperado 5, recibido ${res}`);
        }
      },
      {
        suite: '2. Pruebas con Diferentes Estructuras y Tamaños de Datos',
        nombre: 'Procesamiento de conjunto con elemento único [42]',
        fn: () => {
          const stats = obtenerEstadisticas([42]);
          if (stats.media !== 42 || stats.mediana !== 42 || stats.varianza !== 0 || stats.desviacionEstandar !== 0) {
            throw new Error('Fallo en cálculo con elemento único');
          }
        }
      },
      {
        suite: '2. Pruebas con Diferentes Estructuras y Tamaños de Datos',
        nombre: 'Soporte para números negativos y decimales [-10, 0, 10, 20]',
        fn: () => {
          const stats = obtenerEstadisticas([-10, 0, 10, 20]);
          if (stats.media !== 5 || stats.mediana !== 5 || stats.varianza !== 125) {
            throw new Error('Fallo con números negativos');
          }
        }
      },
      {
        suite: '2. Pruebas con Diferentes Estructuras y Tamaños de Datos',
        nombre: 'Inmutabilidad: el arreglo original no es modificado al ordenar',
        fn: () => {
          const original = [10, 2, 8, 4];
          const copia = [...original];
          obtenerMediana(original);
          if (JSON.stringify(original) !== JSON.stringify(copia)) {
            throw new Error('El arreglo original sufrió mutación colateral');
          }
        }
      },
      {
        suite: '3. Pruebas de Validación y Programación Defensiva (Guard Clauses)',
        nombre: 'Lanza RangeError cuando el arreglo está vacío []',
        fn: () => {
          let errorLanzado = null;
          try {
            obtenerMedia([]);
          } catch (e) {
            errorLanzado = e;
          }
          if (!errorLanzado || errorLanzado.name !== 'RangeError') {
            throw new Error('No lanzó RangeError con arreglo vacío');
          }
        }
      },
      {
        suite: '3. Pruebas de Validación y Programación Defensiva (Guard Clauses)',
        nombre: 'Lanza TypeError si el argumento no es un arreglo (null, undefined, string)',
        fn: () => {
          let tipoCorrecto = true;
          try { obtenerMedia(null); tipoCorrecto = false; } catch (e) { if (e.name !== 'TypeError') tipoCorrecto = false; }
          try { obtenerMedia(undefined); tipoCorrecto = false; } catch (e) { if (e.name !== 'TypeError') tipoCorrecto = false; }
          try { obtenerMedia("1,2,3"); tipoCorrecto = false; } catch (e) { if (e.name !== 'TypeError') tipoCorrecto = false; }
          if (!tipoCorrecto) throw new Error('No validó correctamente tipos no arreglo');
        }
      },
      {
        suite: '3. Pruebas de Validación y Programación Defensiva (Guard Clauses)',
        nombre: 'Lanza TypeError si contiene valores no numéricos, NaN o infinitos',
        fn: () => {
          let tipoCorrecto = true;
          try { obtenerMedia([1, 2, 'tres']); tipoCorrecto = false; } catch (e) { if (e.name !== 'TypeError') tipoCorrecto = false; }
          try { obtenerMedia([1, NaN, 3]); tipoCorrecto = false; } catch (e) { if (e.name !== 'TypeError') tipoCorrecto = false; }
          try { obtenerMedia([1, Infinity, 3]); tipoCorrecto = false; } catch (e) { if (e.name !== 'TypeError') tipoCorrecto = false; }
          if (!tipoCorrecto) throw new Error('No detectó valores no numéricos o infinitos');
        }
      }
    ];

    let pasadas = 0;
    let fallidas = 0;
    let suiteActual = '';

    casosDePrueba.forEach(caso => {
      if (caso.suite !== suiteActual) {
        suiteActual = caso.suite;
        const suiteTitle = document.createElement('div');
        suiteTitle.className = 'test-suite-header';
        suiteTitle.textContent = suiteActual;
        testsList.appendChild(suiteTitle);
      }

      const testItem = document.createElement('div');
      testItem.className = 'test-item';

      const t0 = performance.now();
      let exito = true;
      let errorMsg = '';

      try {
        caso.fn();
        pasadas++;
      } catch (err) {
        exito = false;
        fallidas++;
        errorMsg = err.message;
      }
      const t1 = performance.now();
      const duracion = (t1 - t0).toFixed(2);

      testItem.innerHTML = `
        <div class="test-info">
          <div class="test-status-badge ${exito ? 'pass' : 'fail'}">
            ${exito ? '✓' : '✗'}
          </div>
          <div>
            <div class="test-name">${caso.nombre}</div>
            ${errorMsg ? `<div style="color: #f87171; font-size: 0.75rem; margin-top: 2px;">${errorMsg}</div>` : ''}
          </div>
        </div>
        <div class="test-time">${duracion} ms</div>
      `;

      testsList.appendChild(testItem);
    });

    const fin = performance.now();
    testsPassedCount.textContent = pasadas;
    testsFailedCount.textContent = fallidas;
    testsTotalCount.textContent = casosDePrueba.length;
    testsDuration.textContent = `${(fin - inicio).toFixed(1)} ms`;
  }

  if (btnRunTests) {
    btnRunTests.addEventListener('click', ejecutarSuiteDePruebas);
  }

  // Inicialización
  ejecutarCalculo();
  ejecutarSuiteDePruebas();
});
