🚀 Automatización y Trazabilidad de Procesos Productivos en Fábrica Alfa
Plataforma Web de Análisis Estadístico, Control de Producción e Inteligencia Operativa
🏭 1. Descripción General del Proyecto

Este repositorio contiene el desarrollo de una plataforma web integral creada para automatizar, analizar y mejorar los procesos operativos de Fábrica Alfa, una empresa manufacturera dedicada a la producción de envases plásticos sostenibles ubicada en Apodaca, Nuevo León.

La plataforma centraliza datos, ejecuta análisis estadísticos avanzados, genera visualizaciones interactivas y sentará las bases de módulos futuros como control de producción, alertas e indicadores de desempeño.

🔍 2. Planteamiento del Problema
❗ Problemáticas detectadas:

Registros manuales en Excel → errores y retrasos.

Falta de integración entre Ventas, Inventario y Producción.

Poca trazabilidad del proceso productivo.

Variabilidad alta debido a rotación de personal.

Ausencia de reportes estadísticos para decisiones.

🎯 Consecuencias:

Sobreinventario o escasez.

Tiempos de entrega inconsistentes.

Costos elevados.

Baja eficiencia operativa.

🎯 3. Objetivo del Proyecto

Desarrollar un sistema web que permita:

Automatizar análisis estadísticos.

Cargar y procesar bases de datos reales.

Visualizar métricas clave en tiempo real.

Crear futura trazabilidad completa de producción.

Reducir errores humanos.

Unificar Ventas, Producción e Indicadores.

🛠️ 4. Análisis AS-IS (Situación Actual)
❌ Procesos manuales

Excel como base de operación.

Depende de supervisión humana.

❌ Falta de integración

Áreas trabajan con información distinta.

No hay flujo informativo unificado.

❌ Variabilidad y errores

Operadores no estandarizados.

Datos inconsistentes.

🌟 5. Modelo TO-BE (Solución Propuesta)
✔ Digitalización completa
✔ Dashboard estadístico
✔ Cálculos automáticos y análisis avanzados
✔ Módulos integrados
✔ Alertas y reportes automatizados
✔ Base para trazabilidad en tiempo real
📌 Módulos planeados (completos y futuros)
Completos

Login

Carga de archivos

Estadísticas

Pruebas de probabilidad

Distribuciones (Binomial y Poisson)

Barra de búsqueda

Modo día/noche

ANOVA

Gráficas interactivas

Pendientes (TO-BE próximo)

Registro de operarios

Control de producción

Módulo de reportes PDF

Alertas automáticas

Cuadros de mando ejecutivos

🖥️ 6. Características de la Página Web
🔐 Login

Acceso seguro al panel principal.

📁 Carga de archivos

Soporta Excel y CSV para análisis posterior.

📊 Dashboard Estadístico

Incluye:

Medias

Mediana

Moda

Varianza

Desviación estándar

Rango

Cálculos automáticos

🧪 Probabilidades y Tests

Implementación de:

Tests con p-valor

Interpretación automática

🎲 Distribuciones

Binomial

Poisson
Con gráficos explicativos.

📈 Modelos Estadísticos

ANOVA
Modelos descriptivos
Gráficas en ggplot2

🔍 Barra de búsqueda

Filtrado rápido por cliente o pedido.

🌙 Modo día/noche

Mejor experiencia de usuario.

📦 Módulos futuros

Registro de operarios

Control de producción

Alertas

Reportes ejecutivos

🧩 7. Arquitectura del Sistema
Frontend

HTML5

CSS3

JavaScript

Diseño responsivo

UX con modo oscuro

Backend

Python (procesos y API básica)

R (cálculos estadísticos)

Librerías de análisis

ggplot2

dplyr

stats

tibble

Datos

Dataset desarrollado a partir de fuentes reales de ventas, producción e inventario.

🧪 8. Análisis Estadísticos Realizados

Incluye:

Tendencia central (media, mediana, moda)

Dispersión (varianza, desviación estándar, rango)

Probabilidades

Tests estadísticos

Distribución Poisson

Distribución Binomial

ANOVA

Comparaciones por grupos

Gráficas estilizadas con ggplot2

📦 9. Módulos del Sistema
Módulo	Estado	Descripción
Login	✔ Completo	Autenticación
Subida de archivos	✔ Completo	Importación de datos
Estadísticas	✔ Completo	Análisis automático
Probabilidades y Tests	✔ Completo	p-valores
Distribución Binomial	✔ Completo	Cálculo + gráfica
Distribución Poisson	✔ Completo	Cálculo + gráfica
ANOVA	✔ Completo	Comparaciones
Modo oscuro	✔ Completo	UX mejorada
Registro de operario	⏳ Pendiente	TO-BE
Control de producción	⏳ Pendiente	TO-BE
Alertas y reportes	⏳ Pendiente	TO-BE
Reportes ejecutivos	⏳ Pendiente	TO-BE
🗂️ 10. Pruebas del Cliente

Incluye pruebas de:

Login

Subida de archivos

Estadísticas

Búsqueda

ANOVA

Binomial

Poisson

Modo noche

Pendiente agregar: Registro de operario, Control de producción, Alertas, Reportes.

📚 11. Glosario

AS-IS: Estado actual del proceso
TO-BE: Estado mejorado propuesto
Desviación estándar: Medida de dispersión
ANOVA: Análisis de varianza entre grupos
Poisson / Binomial: Distribuciones para conteos
Inventario mínimo: Umbral de seguridad
p-valor: Evidencia contra la hipótesis nula

📖 12. Bibliografía (APA)

Illowsky, B., & Dean, S. (2022). Introducción a la estadística. OpenStax.

Demoss, M. (2022). Estadística descriptiva.

Kaggle. (s.f.). Datasets para machine learning.

OpenStax. (s.f.). Niveles de medición.

RAE. (s.f.). Diccionario de la lengua española.

👥 13. Equipo de Desarrollo — TECHNOIDS

Brandon Alejandro Pedraza Valdez — Líder, gestión, frontend

Juan Pablo Arce Jáuregui — Programador

Emilio Zúñiga de la Garza — Análisis

Ricardo Daniel Ramírez Ortíz — UI/UX

David Alejandro González Chávez — Backend

🏁 14. Cómo ejecutar
git clone https://github.com/tu-repo/fabrica-alfa.git
cd fabrica-alfa


Abrir el archivo index.html en el navegador.

Ejecutar los scripts en R (opcional):

install.packages("ggplot2")
install.packages("dplyr")
source("scripts/analisis.R")

install.packages("ggplot2")
install.packages("dplyr")
source("scripts/analisis_estadistico.R")
