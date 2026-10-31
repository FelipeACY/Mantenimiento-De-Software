# INFORME TÉCNICO: REFACTORIZACIÓN DE CÓDIGO Y PRUEBAS UNITARIAS

**Asignatura:** Mantenimiento de Software  
**Actividad:** Actividad de la Unidad #4 — Refactorización de código fuente en JavaScript  
**Docente:** Profesor Jhonny Gutiérrez  
**Programa Académico:** Ingeniería de Software — IX Semestre  
**Sede / Centro:** Centro Tutorial (CT) de San Juan Nepomuceno  
**Fecha:** Octubre 2026  
**Entorno de Ejecución:** Node.js v24.18.0 / Navegador Web Moderno (Vanilla HTML5/CSS3/ES6+)  

### Equipo de Trabajo (Estudiantes):
- **[Felipe Alfonso Carmona](https://github.com/FelipeACY)** (`@FelipeACY`)
- **[Ivan David Duran Stave](https://github.com/ivandds2005)** (`@ivandds2005`)
- **[Juan David Cassiani](https://github.com/cassiani030)** (`@cassiani030`)

---

## 1. Introducción y Objetivos

La refactorización es una técnica fundamental del mantenimiento de software que consiste en reorganizar y reestructurar el código fuente sin alterar su comportamiento funcional externo perceptible. Su propósito principal es incrementar la mantenibilidad, legibilidad, robustez y testabilidad, disminuyendo la deuda técnica y la complejidad ciclomática.

En esta actividad se tomó como base el archivo original `original/fuente.js`, el cual presentaba serias deficiencias sintácticas, violaciones a principios de diseño limpio (*Clean Code*) y falta de modularidad. Se aplicaron técnicas de refactorización, se desarrolló una suite de 12 pruebas unitarias automatizadas y se integró el módulo resultante en una interfaz web moderna y responsiva.

---

## 2. Descripción de los Problemas Identificados en el Código Original

Tras la auditoría estática y dinámica del código original, se identificaron los siguientes problemas de calidad y complejidad:

### 2.1 Error Sintáctico Crítico (Fallo de Ejecución Inmediato)
En la función `principal()`, las líneas 63 a 65 contenían:
```javascript
console.log(Media: ${estadisticas.media});
console.log(Mediana: ${estadisticas.mediana});
console.log(Desviación estándar: ${estadisticas.desviacionEstandar});
```
Las expresiones intentaban usar interpolación de cadenas (*template literals*) omitiendo los caracteres de comillas invertidas (\` \`). Como consecuencia, cualquier entorno de ejecución (Node.js o el motor JavaScript del navegador) abortaba inmediatamente con el error:  
`SyntaxError: missing ) after argument list`.

### 2.2 Falta Total de Programación Defensiva y Validación de Entradas
Ninguna de las funciones (`obtenerMedia`, `obtenerMediana`, `obtenerDesviacionEstandar`, `obtenerEstadisticas`) validaba los datos recibidos:
- Si se pasaba un arreglo vacío `[]`, la división entre `numeros.length` producía `0 / 0 = NaN`.
- Si se pasaban valores `null`, `undefined` o tipos primitivos no arreglos, se disparaban excepciones no controladas en tiempo de ejecución (`TypeError: numeros.reduce is not a function`).
- Si el arreglo contenía valores no numéricos (strings, `NaN`, objetos), el cálculo se corrompía silenciosamente produciendo resultados erróneos.

### 2.3 Violación del Principio de Responsabilidad Única (SRP)
En la función `obtenerDesviacionEstandar`, el cálculo de la **varianza** se encontraba encapsulado como un paso intermedio anónimo:
```javascript
let varianza = desviaciones.reduce((acumulador, desviacion) => acumulador + desviacion, 0) / numeros.length;
```
La varianza es una métrica estadística fundamental por sí misma. Mantenerla oculta impedía su reutilización y obligaba a recalcularla si otro módulo la requería.

### 2.4 Ineficiencia en Consumo de Memoria ($O(N)$ Adicional)
En `obtenerDesviacionEstandar`, se utilizaba:
```javascript
let desviaciones = numeros.map(numero => Math.pow(numero - media, 2));
let varianza = desviaciones.reduce(...) / numeros.length;
```
El uso de `.map()` seguido de `.reduce()` creaba innecesariamente un arreglo intermedio en memoria de tamaño $N$, incrementando la presión sobre el recolector de basura (*Garbage Collector*).

### 2.5 Infracción de las Prácticas de Inmutabilidad
Todas las variables del script estaban declaradas con `let` (`let total`, `let media`, `let numerosOrdenados`, `let n`, `let desviaciones`, `let varianza`, etc.), a pesar de que ninguna era reasignada. Esto vulnera el principio de menor privilegio e incrementa el riesgo de efectos colaterales accidentales.

### 2.6 Acoplamiento Rígido y Efectos Secundarios Globales
- El script ejecutaba directamente `principal();` al ser cargado, provocando efectos colaterales al intentar importarlo en un entorno de pruebas unitarias.
- Los datos de prueba `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]` se encontraban cableados (*hardcoded*) dentro de la función.
- Ninguna función era exportada mediante `module.exports` ni expuesta a un espacio de nombres de navegador, impidiendo su reutilización modular.

---

## 3. Técnicas de Refactorización Aplicadas

Para subsanar las deficiencias identificadas, se aplicaron las siguientes técnicas formales de refactorización:

| Técnica de Refactorización | Descripción y Aplicación | Beneficio Obtenido |
| :--- | :--- | :--- |
| **Corrección de Sintaxis** | Adición de backticks en template literals (`console.log(\`Media: ${estadisticas.media}\`)`). | Operatividad inmediata del programa. |
| **Extract Function (Extraer Función)** | Se crearon las funciones independientes `validarNumeros(numeros)` y `obtenerVarianza(numeros)`. | Cumplimiento estricto de SRP, alta cohesión y reutilización de la varianza. |
| **Guard Clauses (Cláusulas de Guarda)** | Implementación de validaciones tempranas en `validarNumeros` que lanzan `TypeError` y `RangeError` descriptivos. | Falla rápida (*Fail-Fast*), eliminando resultados indefinidos (`NaN`). |
| **Immutability Pattern (Inmutabilidad)** | Sustitución de `let` por `const` en el 100% de las variables no reasignadas. Clonación mediante `[...numeros]` antes del ordenamiento en la mediana. | Protección del estado de los datos originales frente a mutaciones accidentales. |
| **Inline Temp (Eliminar Variables Temporales)** | Eliminación de asignaciones redundantes en `obtenerMedia` y uso de operador ternario en `obtenerMediana`. | Reducción de líneas innecesarias y mayor fluidez de lectura. |
| **Optimización de Recorrido** | Reducción directa de la suma de diferencias al cuadrado sin crear el arreglo intermedio `.map()`. | Reducción de la huella de memoria de $O(2N)$ a $O(N)$. |
| **ES6 Object Property Shorthand** | Simplificación del objeto de retorno: `{ media, mediana, varianza, desviacionEstandar }`. | Sintaxis limpia, moderna y concisa. |
| **Universal Module Definition (Dual Export)** | Exportación condicional para Node.js (`module.exports`) y Navegador (`window.Estadisticas`), aislando la ejecución CLI. | Integración directa con suites de pruebas y aplicaciones web frontend sin efectos colaterales. |

---

## 4. Comparación de Calidad y Complejidad: Antes vs. Después

### 4.1 Matriz Comparativa de Métricas de Software

| Métrica / Dimensión | Código Original (`original/fuente.js`) | Código Refactorizado (`src/codigo_refactorizado.js`) | Variación / Impacto |
| :--- | :--- | :--- | :--- |
| **Estado de Ejecución** | Fallaba inmediatamente (`SyntaxError`) | Ejecución exitosa al 100% | Corrección total |
| **Manejo de Errores** | Inexistente (Genera `NaN` o excepciones) | Cláusulas de guarda (`TypeError`, `RangeError`) | Alta confiabilidad |
| **Complejidad Ciclomática (McCabe)** | $M = 3$ en `obtenerMediana` | $M \le 2$ en todas las funciones individuales | Reducción y desacoplamiento |
| **Declaraciones Mutables (`let`)** | 11 variables mutables | 0 variables mutables (100% `const`) | Inmutabilidad garantizada |
| **Modularidad / Reutilización** | 0% (Funciones privadas sin exportar) | 100% (Objeto exportado para CJS y Browser) | Testabilidad y portabilidad |
| **Pasadas sobre el Arreglo en Varianza** | 2 pasadas (`.map()` + `.reduce()`) | 1 pasada directa (`.reduce()`) | Optimización de memoria |
| **Métricas Calculadas** | 3 (Media, Mediana, Desv. Estándar) | 4 (Media, Mediana, Varianza, Desv. Estándar) | Mayor completitud funcional |

---

## 5. Descripción de las Pruebas de Unidad y Resultados

Se estructuró una suite integral de **12 pruebas unitarias automatizadas** (`tests/tests.js`), ejecutadas tanto en consola mediante el ejecutor nativo de Node.js (`npm test` o `node --test tests/tests.js`) como en el navegador web:

### 5.1 Relación de Casos de Prueba Ejecutados

#### Suite 1: Verificación de Equivalencia del Comportamiento Externo Original
1. **Caso 1.1:** Cálculo exacto de media con datos originales `[1, 2, ..., 10]`.  
   *Resultado esperado:* `5.5`. *Obtenido:* `5.5` *(PASÓ)*.
2. **Caso 1.2:** Cálculo exacto de mediana en datos de longitud par `[1, 2, ..., 10]`.  
   *Resultado esperado:* `5.5`. *Obtenido:* `5.5` *(PASÓ)*.
3. **Caso 1.3:** Cálculo exacto de varianza poblacional `[1, 2, ..., 10]`.  
   *Resultado esperado:* `8.25`. *Obtenido:* `8.25` *(PASÓ)*.
4. **Caso 1.4:** Cálculo exacto de desviación estándar poblacional `[1, 2, ..., 10]`.  
   *Resultado esperado:* `2.87228`. *Obtenido:* `2.87228` *(PASÓ)*.
5. **Caso 1.5:** Integridad y consistencia del objeto retornado por `obtenerEstadisticas()`.  
   *Resultado esperado:* Objeto con propiedades exactas `{ media, mediana, varianza, desviacionEstandar }` *(PASÓ)*.

#### Suite 2: Casos Frontera y Estructuras de Datos Diversas
6. **Caso 2.1:** Mediana en conjuntos con cantidad impar de elementos `[9, 1, 5]`.  
   *Resultado esperado:* `5` (posición central del arreglo ordenado `[1, 5, 9]`) *(PASÓ)*.
7. **Caso 2.2:** Conjunto con elemento único `[42]`.  
   *Resultado esperado:* Media `42`, Mediana `42`, Varianza `0`, Desviación `0` *(PASÓ)*.
8. **Caso 2.3:** Tratamiento de números negativos y valores continuos `[-10, 0, 10, 20]`.  
   *Resultado esperado:* Media `5`, Mediana `5`, Varianza `125`, Desviación `11.1803` *(PASÓ)*.
9. **Caso 2.4:** Verificación de inmutabilidad del arreglo original tras ejecutar el ordenamiento.  
   *Resultado esperado:* Arreglo idéntico sin alteración de orden original *(PASÓ)*.

#### Suite 3: Validación y Programación Defensiva (Guard Clauses)
10. **Caso 3.1:** Arreglo vacío `[]`.  
    *Resultado esperado:* Lanza `RangeError` con mensaje `"El arreglo no puede estar vacío."` *(PASÓ)*.
11. **Caso 3.2:** Argumentos de tipo inválido (`null`, `undefined`, `"cadena"`, número primitivo, objeto).  
    *Resultado esperado:* Lanza `TypeError` `"El argumento debe ser un arreglo de números."` *(PASÓ)*.
12. **Caso 3.3:** Arreglo con elementos no numéricos, `NaN` o valores infinitos (`[1, 2, "tres"]`, `[1, NaN, 3]`).  
    *Resultado esperado:* Lanza `TypeError` `"Todos los elementos del arreglo deben ser números válidos y finitos."` *(PASÓ)*.

### 5.2 Resumen de Resultados de Ejecución
```text
▶ Pruebas Unitarias - Módulo Estadístico Refactorizado
  ✔ 1. Verificación del Comportamiento Externo Original (Equivalencia) (5 pruebas)
  ✔ 2. Pruebas con Diferentes Estructuras y Tamaños de Datos (4 pruebas)
  ✔ 3. Pruebas de Validación y Programación Defensiva (3 pruebas)
✔ Total: 12 pasadas, 0 fallidas, 0 omitidas (Duración: ~7 ms)
```

---

## 6. Integración del Script en Página Web (Frontend)

En cumplimiento de las instrucciones de la actividad, se desarrolló una aplicación web con una estética cuidada, responsiva y funcional:

- **Estructura Semántica (`index.html`):** Diseñada bajo estándares HTML5, con encabezados jerárquicos, contenedores accesibles e inclusión directa del archivo `src/codigo_refactorizado.js`.
- **Estilos Visuales (`assets/css/styles.css`):** Implementados con Vanilla CSS, adoptando modo oscuro, efecto glassmorphism, paleta cromática HSL calibrada, fuentes tipográficas modernas (*Outfit* y *JetBrains Mono*) y adaptabilidad completa para dispositivos móviles y de escritorio.
- **Lógica de Interfaz (`assets/js/app.js`):**
  - Entrada de datos flexible (soporta comas, espacios, saltos de línea y punto y coma).
  - Botones de ejemplos predefinidos: *Original (1 al 10)*, *Calificaciones*, *Temperaturas* y *Generador Aleatorio*.
  - Tarjetas interactivas con cálculo instantáneo de Media, Mediana, Varianza y Desviación Estándar.
  - Gráfico visual interactivo con barras proporcionales y línea de media poblacional ($\mu$).
  - Desglose matemático explicativo paso a paso.
  - Panel interactivo de Pruebas Unitarias en vivo que permite auditar los 12 casos en el propio navegador.
  - Pestaña de Comparativa de Código y visor del presente Informe Técnico.

---

## 7. Conclusiones

1. **Preservación del Comportamiento:** La refactorización garantizó la invariabilidad del comportamiento externo para entradas válidas, arrojando exactamente los mismos resultados numéricos esperados.
2. **Elevación de la Mantenibilidad:** La aplicación de los principios de responsabilidad única, eliminación de código muerto y programación defensiva facilita que cualquier desarrollador futuro comprenda, mantenga y expanda el módulo sin introducir regresiones.
3. **Calidad Comprobada:** El ciclo de pruebas unitarias automatizadas valida el 100% de los escenarios normales y de excepción, sentando una base sólida para la integración continua en proyectos de software reales.
