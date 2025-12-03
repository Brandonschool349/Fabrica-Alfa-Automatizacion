<h1 align="center"> Automatización y Trazabilidad de Procesos Productivos en Fábrica Alfa</h1>
<h3 align="center"><i>Plataforma Web de Análisis Estadístico, Control de Producción e Inteligencia Operativa</i></h3>

<hr/>

<h2> 1. Descripción General del Proyecto</h2>
<p>
Este repositorio contiene el desarrollo de una <b>plataforma web integral</b> creada para automatizar, analizar y mejorar los procesos operativos de <b>Fábrica Alfa</b>, una empresa manufacturera dedicada a la producción de envases plásticos sostenibles ubicada en Apodaca, Nuevo León.
</p>

<p>La plataforma incluye análisis estadístico avanzado, visualizaciones dinámicas, módulos interactivos y una arquitectura lista para crecer hacia control de producción y reportes ejecutivos.</p>

<hr/>

<h2> 2. Planteamiento del Problema</h2>

<h3> Problemas detectados</h3>
<ul>
  <li>Registros manuales en Excel → errores y retrasos.</li>
  <li>Falta de integración entre Ventas, Inventario y Producción.</li>
  <li>Datos inconsistentes por rotación de personal.</li>
  <li>Ausencia de análisis estadístico para decisiones.</li>
</ul>

<h3> Consecuencias</h3>
<ul>
  <li>Baja eficiencia operativa.</li>
  <li>Costos elevados.</li>
  <li>Producción variable.</li>
  <li>Entrega tardía de pedidos.</li>
</ul>

<hr/>

<h2> 3. Objetivo del Proyecto</h2>
<p>
Construir un <b>sistema web</b> que permita automatizar cálculos, visualizar métricas en tiempo real, cargar bases de datos, generar análisis estadísticos completos y establecer las bases para la trazabilidad total de la producción.
</p>

<hr/>

<h2> 4. Análisis AS-IS (Situación Actual)</h2>
<ul>
  <li>Procesos manuales en hojas de cálculo.</li>
  <li>Falta de comunicación entre áreas.</li>
  <li>Flujo de información inconsistente.</li>
  <li>No existe un sistema centralizado.</li>
</ul>

<hr/>

<h2> 5. Modelo TO-BE (Solución Propuesta)</h2>
<p>Se propone una plataforma totalmente digital que incorpore:</p>
<ul>
  <li>Dashboard estadístico automatizado.</li>
  <li>Carga y validación de datos.</li>
  <li>Gráficas interactivas.</li>
  <li>Control de producción (modulo futuro).</li>
  <li>Reportes y alertas automáticas.</li>
  <li>Trazabilidad e integración total.</li>
</ul>

<h3> Módulos actuales (esenciales)</h3>
<ul>
  <li>Login</li>
  <li>Carga de archivos</li>
  <li>Dashboard estadístico</li>
  <li>Medidas de tendencia central</li>
  <li>Medidas de dispersión</li>
  <li>Probabilidades y tests</li>
  <li>Distribución Binomial</li>
  <li>Distribución Poisson</li>
  <li>ANOVA</li>
  <li>Barra de búsqueda</li>
  <li>Modo día/noche</li>
</ul>

<h3> Módulos en desarrollo </h3>
<ul>
  <li>Registro de operario (Listo, pero no conectado a una base de datos)</li>
  <li>Control de producción (Listo, pero no conectado a una base de datos)</li>
  <li>Módulo de reportes</li>
  <li>Alertas automáticas</li>
</ul>

<hr/>

<h2> 6. Características de la Página Web</h2>

<h3> Login</h3>
<p>Acceso seguro a la plataforma.</p>

<h3> Carga de archivos</h3>
<p>Permite subir Excel o CSV para análisis directo.</p>

<h3> Dashboard estadístico</h3>
<ul>
  <li>Media, mediana, moda</li>
  <li>Varianza y desviación estándar</li>
  <li>Rango y coeficientes</li>
  <li>Interpretación automática</li>
</ul>

<h3> Búsqueda inteligente</h3>
<p>Filtrado por cliente, pedido o responsable.</p>

<h3> Modo día/noche</h3>
<p>Cambia el tema visual para mejor experiencia.</p>

<h3> Distribuciones</h3>
<ul>
  <li><b>Binomial</b>: representación y cálculo</li>
  <li><b>Poisson</b>: eventos por intervalo</li>
</ul>

<h3> ANOVA</h3>
<p>Comparación de medias entre grupos con interpretación.</p>

<hr/>

<h2> 7. Arquitectura del Sistema</h2>

<h3>Frontend</h3>
<ul>
  <li>HTML5</li>
  <li>CSS3</li>
  <li>JavaScript</li>
</ul>

<h3>Backend</h3>
<ul>
  <li>Python (procesos y API)</li>
  <li>R (cálculos estadísticos avanzados)</li>
</ul>

<h3>Librerías estadísticas</h3>
<ul>
  <li>ggplot2</li>
  <li>dplyr</li>
  <li>stats</li>
</ul>

<hr/>

<h2> 8. Análisis Estadísticos Realizados</h2>
<ul>
  <li>Medidas de tendencia central</li>
  <li>Medidas de dispersión</li>
  <li>Probabilidad y análisis</li>
  <li>Distribución Binomial y Poisson</li>
  <li>ANOVA</li>
  <li>Correlaciones</li>
</ul>

<hr/>

<h2> 9. Módulos del Sistema</h2>

<table>
  <tr>
    <th>Módulo</th>
    <th>Estado</th>
  </tr>
  <tr><td>Login</td><td>✔</td></tr>
  <tr><td>Carga de archivos</td><td>✔</td></tr>
  <tr><td>Dashboard estadístico</td><td>✔</td></tr>
  <tr><td>Distribuciones</td><td>✔</td></tr>
  <tr><td>ANOVA</td><td>✔</td></tr>
  <tr><td>Modo noche</td><td>✔</td></tr>
  <tr><td>Registro de operario</td><td>⏳</td></tr>
  <tr><td>Control de producción</td><td>⏳</td></tr>
  <tr><td>Reportes</td><td>⏳</td></tr>
  <tr><td>Alertas</td><td>⏳</td></tr>
</table>

<hr/>

<h2> 10. Pruebas del Cliente</h2>
<ul>
  <li>Login</li>
  <li>Carga de archivos</li>
  <li>Estadísticas</li>
  <li>Distribuciones</li>
  <li>ANOVA</li>
  <li>Modo oscuro</li>
  <li>Pendientes: Control, alertas, reportes</li>
</ul>

<hr/>

<h2> 11. Glosario</h2>
<ul>
  <li><b>AS-IS:</b> Estado actual del proceso</li>
  <li><b>TO-BE:</b> Estado propuesto futuro</li>
  <li><b>ANOVA:</b> Análisis de varianza</li>
  <li><b>p-valor:</b> evidencia estadística</li>
  <li><b>Inventario mínimo:</b> umbral crítico</li>
</ul>

<hr/>

<h2> 12. Bibliografía (APA)</h2>
<ul>
  <li>Illowsky & Dean. <i>Introducción a la estadística</i>. OpenStax.</li>
  <li>Demoss. <i>Estadística descriptiva</i>.</li>
  <li>Kaggle datasets.</li>
</ul>

<hr/>

<h2> 13. Equipo TECHNOIDS</h2>
<ul>
  <li><b>Brandon Alejandro Pedraza Valdez</b> — Líder y programador</li>
  <li><b>Juan Pablo Arce Jáuregui</b> — Desarrollador</li>
  <li><b>Emilio Zúñiga</b> — Análisis</li>
  <li><b>Ricardo Daniel</b> — UI/UX</li>
  <li><b>David González</b> — Backend</li>
</ul>

<hr/>

<h2>🏁 14. Instalación y ejecución</h2>

<h3>Clonar repositorio</h3>
<pre>
git clone https://github.com/tu-repo/fabrica-alfa.git
</pre>

<h3>Abrir aplicación</h3>
<p>Abrir <b>index.html</b> en cualquier navegador. en la carpeta \Code ejecutar "uvicorn api:app --reload" en la terminal e ingresar con CTRL + clic izq en el http: que aparezca</p>

<h3>Ejecutar análisis en R (opcional)</h3>
<pre>
install.packages("ggplot2")
install.packages("dplyr")
source("scripts/analisis.R")
</pre>

<hr/>

