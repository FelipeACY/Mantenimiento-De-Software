# Actividad de Mantenimiento de Software: Refactorización de Código

> **Unidad #4 — Mantenimiento de Software**  
> **Programa Académico:** Ingeniería de Software — IX Semestre  
> **Sede:** Centro Tutorial (CT) de San Juan Nepomuceno  
> **Docente:** Profesor Jhonny Gutiérrez  
> **Fecha:** Octubre 2026  
> **Repositorio Oficial en GitHub:** [https://github.com/FelipeACY/Mantenimiento-De-Software](https://github.com/FelipeACY/Mantenimiento-De-Software)  

---

## 👥 Equipo de Trabajo (Estudiantes)
- **[Felipe Alfonso Carmona](https://github.com/FelipeACY)** (`@FelipeACY`)
- **[Ivan David Duran Stave](https://github.com/ivandds2005)** (`@ivandds2005`)
- **[Juan David Cassiani](https://github.com/cassiani030)** (`@cassiani030`)

---

## 📁 Estructura del Proyecto

El repositorio ha sido organizado siguiendo las mejores prácticas de arquitectura de software, separando la documentación, el código base original, el código refactorizado, los recursos frontend y la suite de pruebas unitarias:

```text
Actividad de Mantenimiento/
│
├── docs/                               # 📄 Documentación formal para entrega académica
│   ├── INFORME_REFACTORIZACION.md      # Informe técnico exhaustivo (problemas, técnicas, métricas)
│   └── codigo_refactorizado.txt        # Copia en texto plano del código refactorizado (Punto 4)
│
├── original/                           # 📦 Código fuente original (Línea Base)
│   └── fuente.js                       # Archivo inicial recibido con olores de código y errores
│
├── src/                                # 💻 Código fuente refactorizado (Lógica de Negocio)
│   └── codigo_refactorizado.js         # Módulo optimizado con exportación dual (Node.js & Navegador)
│
├── tests/                              # 🧪 Suite de pruebas unitarias automatizadas
│   └── tests.js                        # 12 Pruebas automatizadas con Node.js Test Runner
│
├── assets/                             # 🎨 Recursos estáticos del Frontend
│   ├── css/
│   │   └── styles.css                  # Hoja de estilos moderna (Vanilla CSS, Glassmorphism, Dark Mode)
│   └── js/
│       └── app.js                      # Controlador de la interfaz interactiva y gráficos
│
├── index.html                          # 🌐 Aplicación Web interactiva Frontend
├── package.json                        # ⚙️ Manifiesto del proyecto y scripts de ejecución
└── README.md                           # 📖 Guía principal de navegación para el docente
```

---

## 🚀 Guía de Ejecución Rápida

### 1. Ejecutar las Pruebas Unitarias Automatizadas
El proyecto utiliza el test runner nativo de Node.js (sin requerir librerías externas):

```bash
# Opción directa con Node.js:
node --test tests/tests.js

# O mediante npm:
npm test
```
*Resultado esperado:* **12 pruebas pasadas (0 fallos)** en ~7 milisegundos.

### 2. Ejecutar el Módulo Refactorizado en Consola
```bash
node src/codigo_refactorizado.js
```
*Salida en consola:*
```text
Media: 5.5
Mediana: 5.5
Varianza: 8.25
Desviación estándar: 2.8722813232690143
```

### 3. Abrir la Aplicación Web (Frontend)
- **Método 1 (Directo):** Hacer doble clic en el archivo `index.html` para abrirlo en cualquier navegador web moderno.
- **Método 2 (Servidor Local):**
  ```bash
  python -m http.server 8080
  ```
  Luego ingresar en el navegador a: `http://localhost:8080/index.html`

---

## 📊 Resumen de la Refactorización

| Dimensión | Código Original (`original/fuente.js`) | Código Refactorizado (`src/codigo_refactorizado.js`) |
| :--- | :--- | :--- |
| **Ejecución** | ❌ Falla con `SyntaxError` (líneas 63-65) |  100% Funcional sin errores |
| **Validación** | ❌ Nula (genera `NaN` o caídas en runtime) |  Guard Clauses defensivas (`TypeError`, `RangeError`) |
| **Principio SRP** | ❌ Varianza oculta dentro de desviación estándar |  `obtenerVarianza()` extraída como función independiente |
| **Inmutabilidad** | ❌ 100% variables declaradas con `let` |  100% `const` y copia inmutable `[...numeros]` al ordenar |
| **Rendimiento** | ❌ Doble recorrido en memoria (`.map() + .reduce()`) |  1 sola pasada acumulada $O(N)$ en varianza |
| **Portabilidad** | ❌ Sin exportación modular (código rígido) |  Dual Export para Node.js (CommonJS) y Navegador Web |

Para una auditoría detallada paso a paso, consulte el [Informe Técnico Completo](docs/INFORME_REFACTORIZACION.md).
