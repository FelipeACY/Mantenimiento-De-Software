/**
Función para calcular la media de una lista de números.
@param {number[]} numeros - Lista de números.
@returns {number} La media de la lista de números.
*/
function obtenerMedia(numeros) {
    let total = numeros.reduce((acumulador, numero) => acumulador + numero, 0);
    let media = total / numeros.length;
    return media;
}
/**
Función para calcular la mediana de una lista de números.
@param {number[]} numeros - Lista de números.
@returns {number} La mediana de la lista de números.
*/
function obtenerMediana(numeros) {
    let numerosOrdenados = numeros.slice().sort((a, b) => a - b);
    let n = numerosOrdenados.length;
    let mediana;
    if (n % 2 === 0) {
        mediana = (numerosOrdenados[n / 2 - 1] + numerosOrdenados[n / 2]) / 2;
    } else {
        mediana = numerosOrdenados[(n - 1) / 2];
    }
    return mediana;
}
/**
Función para calcular la desviación estándar de una lista de números.
@param {number[]} numeros - Lista de números.
@returns {number} La desviación estándar de la lista de números.
*/
function obtenerDesviacionEstandar(numeros) {
    let media = obtenerMedia(numeros);
    let desviaciones = numeros.map(numero => Math.pow(numero - media, 2));
    let varianza = desviaciones.reduce((acumulador, desviacion) => acumulador + desviacion, 0) / numeros.length;
    let desviacionEstandar = Math.sqrt(varianza);
    return desviacionEstandar;
}
/**
Función para calcular la media, mediana y desviación estándar de una lista de números.
@param {number[]} numeros - Lista de números.
@returns {Object} Objeto que contiene las estadísticas de la lista de números.
Las estadísticas son media, mediana y desviación estándar.
*/
function obtenerEstadisticas(numeros) {
    let media = obtenerMedia(numeros);
    let mediana = obtenerMediana(numeros);
    let desviacionEstandar = obtenerDesviacionEstandar(numeros);
    let estadisticas = {
        media: media,
        mediana: mediana,
        desviacionEstandar: desviacionEstandar
    };
    return estadisticas;
}

/**
Función principal que llama a obtenerEstadisticas para imprimir las estadísticas de la lista de números.
*/
function principal() {
    let numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let estadisticas = obtenerEstadisticas(numeros);
    console.log(Media: ${ estadisticas.media });
    console.log(Mediana: ${ estadisticas.mediana });
    console.log(Desviación estándar: ${ estadisticas.desviacionEstandar });
}
principal();
