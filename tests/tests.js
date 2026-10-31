/**
 * Suite de Pruebas Unitarias para el Módulo Estadístico Refactorizado
 * Ejecución: npm test  O  node --test tests/tests.js
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  validarNumeros,
  obtenerMedia,
  obtenerMediana,
  obtenerVarianza,
  obtenerDesviacionEstandar,
  obtenerEstadisticas
} = require('../src/codigo_refactorizado.js');

describe('Pruebas Unitarias - Módulo Estadístico Refactorizado', () => {

  describe('1. Verificación del Comportamiento Externo Original (Equivalencia)', () => {
    const datosOriginales = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    test('debe calcular la media exacta del caso original (5.5)', () => {
      const media = obtenerMedia(datosOriginales);
      assert.strictEqual(media, 5.5);
    });

    test('debe calcular la mediana exacta del caso original con longitud par (5.5)', () => {
      const mediana = obtenerMediana(datosOriginales);
      assert.strictEqual(mediana, 5.5);
    });

    test('debe calcular la varianza exacta del caso original (8.25)', () => {
      const varianza = obtenerVarianza(datosOriginales);
      assert.strictEqual(varianza, 8.25);
    });

    test('debe calcular la desviación estándar exacta del caso original (~2.87228)', () => {
      const desviacion = obtenerDesviacionEstandar(datosOriginales);
      assert.strictEqual(Math.round(desviacion * 1e5) / 1e5, 2.87228);
    });

    test('debe retornar el objeto completo de estadísticas con los mismos resultados', () => {
      const stats = obtenerEstadisticas(datosOriginales);
      assert.deepStrictEqual(stats, {
        media: 5.5,
        mediana: 5.5,
        varianza: 8.25,
        desviacionEstandar: Math.sqrt(8.25)
      });
    });
  });

  describe('2. Pruebas con Diferentes Estructuras y Tamaños de Datos', () => {
    test('debe calcular correctamente la mediana en un arreglo de longitud impar', () => {
      const datosImpares = [9, 1, 5]; // ordenado: [1, 5, 9] -> mediana: 5
      assert.strictEqual(obtenerMediana(datosImpares), 5);
      assert.strictEqual(obtenerMedia(datosImpares), 5);
    });

    test('debe funcionar correctamente con un único elemento', () => {
      const unicoElemento = [42];
      assert.strictEqual(obtenerMedia(unicoElemento), 42);
      assert.strictEqual(obtenerMediana(unicoElemento), 42);
      assert.strictEqual(obtenerVarianza(unicoElemento), 0);
      assert.strictEqual(obtenerDesviacionEstandar(unicoElemento), 0);
    });

    test('debe procesar números negativos y decimales con precisión', () => {
      const datosMixtos = [-10, 0, 10, 20];
      // Media: 20 / 4 = 5
      // Mediana: (0 + 10) / 2 = 5
      // Varianza: [(-15)^2 + (-5)^2 + 5^2 + 15^2] / 4 = (225 + 25 + 25 + 225) / 4 = 500 / 4 = 125
      const stats = obtenerEstadisticas(datosMixtos);
      assert.strictEqual(stats.media, 5);
      assert.strictEqual(stats.mediana, 5);
      assert.strictEqual(stats.varianza, 125);
      assert.strictEqual(stats.desviacionEstandar, Math.sqrt(125));
    });

    test('NO debe mutar el arreglo original durante el ordenamiento (inmutabilidad)', () => {
      const original = [10, 2, 8, 4];
      const copiaOriginal = [...original];
      obtenerMediana(original);
      assert.deepStrictEqual(original, copiaOriginal, 'El arreglo original no debió ser alterado.');
    });
  });

  describe('3. Pruebas de Validación y Programación Defensiva (Casos Límite y Errores)', () => {
    test('debe lanzar RangeError si el arreglo está vacío', () => {
      assert.throws(
        () => obtenerMedia([]),
        { name: 'RangeError', message: 'El arreglo no puede estar vacío.' }
      );
    });

    test('debe lanzar TypeError si el argumento no es un arreglo', () => {
      assert.throws(() => obtenerMedia(null), { name: 'TypeError' });
      assert.throws(() => obtenerMedia(undefined), { name: 'TypeError' });
      assert.throws(() => obtenerMedia('1,2,3'), { name: 'TypeError' });
      assert.throws(() => obtenerMedia(12345), { name: 'TypeError' });
      assert.throws(() => obtenerMedia({ a: 1 }), { name: 'TypeError' });
    });

    test('debe lanzar TypeError si contiene valores no numéricos, NaN o infinitos', () => {
      assert.throws(() => obtenerMedia([1, 2, 'tres', 4]), { name: 'TypeError' });
      assert.throws(() => obtenerMedia([1, NaN, 3]), { name: 'TypeError' });
      assert.throws(() => obtenerMedia([1, Infinity, 3]), { name: 'TypeError' });
    });
  });
});
