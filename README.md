#Automatización y Trazabilidad de Procesos Productivos en Fábrica Alfa
Plataforma Web de Análisis Estadístico, Control de Producción e Inteligencia Operativa
📌 Descripción general del proyecto

Este repositorio contiene el desarrollo completo de un sistema web integral diseñado para automatizar, analizar y optimizar los procesos operativos de Fábrica Alfa, una manufacturera de envases plásticos sostenibles ubicada en Apodaca, Nuevo León.

El sistema integra herramientas estadísticas, módulos de carga de datos, visualización interactiva, análisis avanzado y futuras funciones de control de producción y reportes en tiempo real.

Este proyecto fue desarrollado por el equipo TECHNOIDS, siguiendo un enfoque profesional basado en análisis de negocio, metodología PROXI, arquitectura TO-BE, diseño UI/UX y programación práctica.

🏭 1. Planteamiento del Problema

Fábrica Alfa enfrenta problemas críticos en:

Variabilidad en la producción mes a mes

Falta de sincronización entre ventas, producción e inventario

Registros manuales que generan errores y retrasos

Incapacidad para predecir demanda y planear producción

Dependencia de reportes manuales y supervisión directa

Falta de trazabilidad en procesos

Esto genera:

Sobreinventario o faltantes

Entregas tardías

Incremento en costos operativos

Baja eficiencia de planta

Inestabilidad por rotación de personal

🎯 2. Objetivo del Proyecto

Diseñar e implementar una plataforma web que permita:

Digitalizar los datos de producción, ventas, calidad e inventario

Realizar cálculos estadísticos claves para la toma de decisiones

Automatizar análisis y generar gráficos instantáneos

Construir módulos de control, alertas y reportes automáticos

Integrar flujos operativos y reducir errores humanos

Proveer trazabilidad y visibilidad completa del proceso productivo

🧩 3. Análisis AS-IS

En el estado actual, la operación se caracteriza por:

❌ Procesos manuales

Registro de ventas, inventario y producción en hojas de Excel

Supervisión humana para validar calidad

Falta de monitoreo en tiempo real

❌ Falta de integración

Ventas y Producción trabajan con información desactualizada

Inventarios se desbalancean constantemente

❌ Variabilidad alta

Influencia de rotación de personal y falta de estandarización.

🌟 4. Modelo TO-BE (Solución Propuesta)

La solución diseñada es un sistema digital integrado con:

✔ Panel estadístico avanzado

Medidas de tendencia central

Medidas de dispersión

Pruebas de probabilidad y tests

Modelos estadísticos

Distribución Binomial y Poisson

ANOVA y correlaciones

✔ Control de producción (pendiente de implementar)

Registro de operarios

Producción por turno

Revisión de calidad

Incidencias

✔ Alertas y reportes

Umbrales mínimos/máximos

Alertas de inventario

Reportes semanales/mensuales

✔ Trazabilidad inteligente (propuesta de innovación)

Integración futura con RFID/NFC.

🖥️ 5. Página Web — Descripción funcional

La plataforma web fue creada para centralizar operaciones y estadísticas en un sistema accesible, ordenado y profesional.

🔐 Login

Autenticación de usuarios del sistema.

📁 Subida de archivos

Carga de bases de datos (Excel/CSV) para análisis.

📊 Dashboard estadístico

Cálculos automáticos:

Media, mediana, moda

Rango, varianza, desviación estándar

Tests de probabilidad

Modelos estadísticos

Distribuciones estadísticas

🔍 Barra de búsqueda

Encuentra clientes o pedidos instantáneamente.

🌙 Modo día/noche

Mejora de experiencia de usuario.

📈 ANOVA y gráficas

Generación de:

ANOVA

Boxplots

Linecharts

Histogramas

🏭 Módulos futuros por integrar

Registro de operario

Control de producción

Módulo de reportes

Alertas y reportes

🏗️ 6. Arquitectura del Sistema
Frontend

HTML5

CSS3

JavaScript

Modo oscuro / claro

UI responsiva

Backend

Python / R (para cálculos estadísticos)

API REST básica (Python)

Herramientas estadísticas

R: Tendencia central, dispersión, ANOVA, Poisson, Binomial

ggplot2 para gráficas

dplyr para manejo de datos

Base de datos

Dataset de 24 meses generado a partir de Kaggle y datos hipotéticos profesionales.

📦 7. Módulos del Sistema
Módulo	Estado	Descripción
Login	✔ Completo	Acceso seguro al sistema
Subida de archivos	✔ Completo	Importación de datos
Estadísticas	✔ Completo	Cálculos y gráficos
Probabilidades y Tests	✔ Completo	Tests con p-valor
Binomial	✔ Completo	Gráficos + interpretación
Poisson	✔ Completo	Gráficos + análisis
Barra de búsqueda	✔ Completo	Filtro instantáneo
Modo noche	✔ Completo	UX mejorada
Registro de operario	⏳ Pendiente	Formulario + BD
Control de producción	⏳ Pendiente	Registro en planta
Reportes	⏳ Pendiente	PDF/Excel automático
Alertas	⏳ Pendiente	Inventario y producción
📈 8. Análisis Estadísticos Realizados

Incluye:

Medidas de tendencia central

Medidas de dispersión

Correlación ventas–producción

Probabilidades básicas

Tests estadísticos

Modelos de predicción

Distribuciones discretas

ANOVA

Todos calculados en R con datasets reales del caso.

📚 9. Glosario

AS-IS: Estado actual del proceso

TO-BE: Proceso futuro optimizado

Tendencia central: Media, mediana, moda

Dispersión: Varianza, desviación estándar, rango

ANOVA: Comparación de medias entre grupos

Poisson/Binomial: Modelos probabilísticos

ROI: Retorno de inversión

Inventario mínimo: Umbral de seguridad

📖 10. Bibliografía

Formato APA 7 (versión reducida):

Illowsky, B., & Dean, S. (2022). Introducción a la estadística. OpenStax.

Demoss, M. (2022). Estadística descriptiva.

Kaggle. (s.f.). Datasets para machine learning.

OpenStax. (s.f.). Niveles de medición.

RAE. (s.f.). Diccionario de la lengua española.

👥 11. Autores del proyecto
Equipo TECHNOIDS (2025)

Brandon Alejandro Pedraza Valdez — Líder / Gestión

Juan Pablo Arce Jáuregui — Programador

Emilio Zúñiga de la Garza — Análisis

Ricardo Daniel Ramírez Ortíz — Diseño

David Alejandro González Chávez — Desarrollo

🧪 12. Pruebas del Cliente

Incluye:

Login

Subida de archivos

Búsqueda

Estadísticas varias

Binomial & Poisson

Modo día-noche

ANOVA

Pruebas pendientes

(Tabla completa incluida en el PDF original y en /docs del repositorio)

🚀 13. Conclusión del Proyecto

El sistema desarrollado:

Aporta valor real al proceso productivo

Moderniza la toma de decisiones

Reduce errores humanos

Permite análisis estadístico instantáneo

Prepara la base para una digitalización completa (TO-BE)

Es escalable a control de producción en tiempo real

Marca un antes y un después en la eficiencia de Fábrica Alfa.

🏁 14. Instrucciones de ejecución
git clone https://github.com/tu-repo/fabrica-alfa.git
cd fabrica-alfa
# Abrir index.html en navegador


Para cálculos en R:

install.packages("ggplot2")
install.packages("dplyr")
source("scripts/analisis_estadistico.R")
