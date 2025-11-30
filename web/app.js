// app.js — Frontend logic for Fábrica Alfa
// Assumes index.html and style.css are present, Chart.js loaded, and backend at API_BASE

/*  CONFIG */
const API_BASE = "http://127.0.0.1:8000"; // tu API local
const PREVIEW_IMAGE = "./mnt/data/db883e4d-50fb-45de-acfb-6025188e3e99.png"; // ruta local de la captura que subiste

// UI state
let STATE = {
  user: null,          // 'admin' | 'supervisor' | 'operario' or null
  role: null,
  raw: null,           // response from /cargar: { columnas: [...] }
  arrays: {},          // numeric arrays fetched via /dataarray/{col}
  charts: { bin: null, scatter: null, hist: null },
};
// === GRÁFICAS BINOMIALES (Estadísticas / Modelos) ===
let chartBinomialStats = null;     
let chartBinomialModels = null;

/*  DOM helpers */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function toast(msg, type = "info", ttl = 3500) {
  // small non-blocking toast in top-right
  let container = document.getElementById("toastContainer");
  if(!container){
    container = document.createElement("div");
    container.id = "toastContainer";
    container.style.position = "fixed";
    container.style.right = "18px";
    container.style.top = "18px";
    container.style.zIndex = 999999;
    document.body.appendChild(container);
  }
  const el = document.createElement("div");
  el.style.background = (type === "error") ? "linear-gradient(90deg,#ff6b6b,#ff8b8b)" : (type === "success") ? "linear-gradient(90deg,#4fd18b,#6ef0aa)" : "linear-gradient(90deg,#6a7bff,#00c2ff)";
  el.style.color = "#021018";
  el.style.padding = "10px 14px";
  el.style.borderRadius = "10px";
  el.style.marginTop = "10px";
  el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.4)";
  el.innerText = msg;
  container.appendChild(el);
  setTimeout(()=> {
    el.style.transition = "opacity .3s, transform .3s";
    el.style.opacity = 0;
    el.style.transform = "translateX(10px)";
    setTimeout(()=> el.remove(), 350);
  }, ttl);
}

/*  Initialization */
function initUI(){
  // attach preview image
  const img = document.querySelector(".preview-img");
  if(img) img.src = PREVIEW_IMAGE;

  // nav items
  $$(".nav-item").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      $$(".nav-item").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const view = btn.dataset.view;
      switchView(view);
    });
  });

  // sidebar buttons
  $("#uploadBtn")?.addEventListener("click", uploadFile);
  $("#clearBtn")?.addEventListener("click", resetData);
  $("#btnUpload")?.addEventListener("click", ()=> {
    // open file chooser in main content
    $("#fileInput").click();
  });
  $("#btnLogout")?.addEventListener("click", logout);

  // login modal
  $("#loginBtn")?.addEventListener("click", loginFromModal);
  $("#loginClose")?.addEventListener("click", ()=> $("#loginModal").classList.add("hidden"));

  // quick calc
  $("#btnQuickCalc")?.addEventListener("click", async ()=>{
    const col = $("#selectQuick")?.value;
    if(!col) { toast("Selecciona una columna rápida", "error"); return; }
    await calcTendColumn(col);
  });

  // estadisticas buttons
  $("#btnTend")?.addEventListener("click", async ()=> {
    const col = $("#selectTend").value;
    if(!col) { toast("Selecciona columna", "error"); return; }
    await calcTendColumn(col);
  });
  $("#btnDisp")?.addEventListener("click", async ()=> {
    const col = $("#selectDisp").value;
    if(!col) { toast("Selecciona columna", "error"); return; }
    await calcDispColumn(col);
  });

  // binomial
  document.getElementById("btnBinom")?.addEventListener("click", () => {
    const n = parseInt(document.getElementById("binN").value);
    const p = parseFloat(document.getElementById("binP").value);

    calcularBinomialUniversal(
        n, p,
        "chartBinomialStats",     // canvas de ESTADÍSTICAS
        "probOutputsStats"        // div donde poner texto
    );
});

// Listener para la sección DISTRIBUCIÓN BINOMIAL (Modelos Prob.)
document.getElementById("btnCalcBinomial")?.addEventListener("click", () => {
    const n = parseInt(document.getElementById("inputBinN").value);
    const p = parseFloat(document.getElementById("inputBinP").value);
    const k = parseInt(document.getElementById("inputBinK").value);

    // Llama a tu función universal
    calcularBinomialUniversal(
        n, p,
        "chartBinomialModels",   // canvas correcto
        "binomialModelsOutput"   // div donde quieres poner resultados (ponlo tú)
    );
});
 
// MODELOS — EVENT LISTENERS 

// ANOVA usando selects
$("#btnANOVA")?.addEventListener("click", postANOVA);

// Regresión Lineal usando selects
$("#btnRegresion")?.addEventListener("click", fetchRegressionUI);

// Correlación usando selects
$("#btnCorrelacion")?.addEventListener("click", fetchCorrelationUI);
  // file input change
  $("#fileInput")?.addEventListener("change", (e)=> {
    // optionally auto-upload or wait for uploadBtn click
    // we let the upload button handle it
  });

  // initial ping
  pingAPI();
  setInterval(pingAPI, 6000);

  // set role badge and default view
  setRoleBadge(null);
  switchView("dashboard");
}

/*  Navigation & Roles */
function switchView(view){
  // hide all panes
  $$(".view-pane").forEach(p => { p.classList.add("hidden"); p.classList.remove("active"); });
  const id = `view-${view}`;
  const pane = document.getElementById(id);
  if(pane) {
    pane.classList.remove("hidden");
    pane.classList.add("active");
  } else {
    // fallback to dashboard
    document.getElementById("view-dashboard").classList.remove("hidden");
  }
}

function setRoleBadge(role){
  const badge = $("#roleBadge");
  if(!badge) return;
  if(!role){ badge.innerText = "Sin sesión"; badge.classList.add("muted"); }
  else { badge.innerText = role; badge.classList.remove("muted"); }
  // adjust available nav items by role
  if(role === "admin" || role === "gerente" || role === "admin"){ // accept "admin" from earlier samples
    // show all
    showNavItem("modelos", true);
    showNavItem("estadisticas", true);
    showNavItem("produccion", true);
    showNavItem("operario", true);
    showUploadControls(true);
  } else if(role === "supervisor"){
    showNavItem("modelos", false);
    showNavItem("estadisticas", true);
    showNavItem("produccion", true);
    showNavItem("operario", true);
    showUploadControls(false);
  } else if(role === "operario"){
    // limited
    showNavItem("modelos", false);
    showNavItem("estadisticas", false);
    showNavItem("produccion", false);
    showNavItem("operario", true);
    showUploadControls(false);
  } else {
    // not logged
    showUploadControls(false);
  }
}

function showNavItem(name, show){
  const btn = $(`.nav-item[data-view="${name}"]`);
  if(btn) btn.style.display = show ? "flex" : "none";
}

function showUploadControls(show){
  // main upload area
  const u = $("#uploadBtn");
  if(u) u.style.display = show ? "inline-block" : "none";
  const fileInput = $("#fileInput");
  if(fileInput) fileInput.style.display = show ? "inline-block" : "none";
  const upMsg = $("#uploadMsg");
  if(upMsg && !show) upMsg.innerText = "Solo Gerente puede subir archivos";
}

/*  AUTH (simple, client-side) */
function loginFromModal(){
  const u = $("#loginUser").value.trim();
  const p = $("#loginPass").value.trim();

  // validar credenciales
  if((u === "admin" && p === "fabrica2025") || (u === "gerente" && p === "fabrica2025")){
    STATE.user = u;
    STATE.role = "Gerente";
  } else if(u === "supervisor" && p === "control123"){
    STATE.user = u;
    STATE.role = "Supervisor";
  } else if(u === "operario" && p === "op123"){
    STATE.user = u;
    STATE.role = "Operario";
  } else {
    $("#loginMsg").innerText = "Credenciales incorrectas";
    toast("Credenciales incorrectas", "error");
    return;
  }

  // ocultar modal de login
  const loginModal = $("#loginModal");
  if(loginModal){
    loginModal.style.display = "none";      // ocultar visualmente
    loginModal.classList.add("hidden");      // asegurar ocultamiento
  }

  // actualizar UI
  $("#userNameDisplay").innerText = STATE.user;
  setRoleBadge(STATE.role);
  toast(`Bienvenido ${STATE.user}`, "success");

  // mostrar u ocultar controles de subida según rol
  if(STATE.role.toLowerCase().startsWith("ger")){
    showUploadControls(true);
  } else {
    showUploadControls(false);
  }
}

/* logout */
function logout(){
  STATE.user = null; STATE.role = null;
  $("#userNameDisplay").innerText = "—";
  setRoleBadge(null);
  toast("Sesión cerrada", "info");
}
// NUEVO: mostrar login si no hay sesión
function checkLogin(){
  if(!STATE.user){
    $("#loginModal").classList.remove("hidden");
  }
}
/*  API helpers & ping */
async function pingAPI(){
  try {
    const r = await fetch(`${API_BASE}/openapi.json`);
    if(r.ok) {
      $("#apiStatus").innerText = "online";
      $("#apiStatus").style.color = "#9ff";
    } else {
      $("#apiStatus").innerText = "offline";
      $("#apiStatus").style.color = "#ff8b8b";
    }
  } catch(e){
    $("#apiStatus").innerText = "offline";
    $("#apiStatus").style.color = "#ff8b8b";
  }
}

/*  UPLOAD (Gerente only) */
async function uploadFile(){
  if(!STATE.role || !STATE.role.toLowerCase().startsWith("ger")){
    toast("Solo Gerente puede subir archivos", "error");
    return;
  }

  const input = $("#fileInput");
  if(!input || !input.files || input.files.length === 0){
    toast("Selecciona un archivo primero", "error");
    return;
  }

  const file = input.files[0];
  const fd = new FormData();
  fd.append("archivo", file);

  $("#uploadMsg").innerText = "Cargando archivo...";

  try {
    const res = await fetch(`${API_BASE}/cargar`, { method: "POST", body: fd });
    const j = await res.json();
    console.log("RESPUESTA /cargar:", j);

    if(j.mensaje && j.columnas){

      STATE.raw = j;

      // guardar dataset crudo del servidor
      // FIX: aceptar j.data o j.muestra 
      window.dataset = j.data || j.muestra || [];

      // si backend devolvió muestra, renderizar tabla preview
      if (j.muestra && j.muestra.length) {
        try { renderSampleTable(j.muestra); } catch(e) { console.warn("renderSampleTable fallo:", e); }
      }

      // convertir columna Mes (si existe) sobre window.dataset
      window.dataset = window.dataset.map(r => {
        // some rows may be null/undefined or not have "Mes"
        if (!r) return r;
        if (r["Mes"]) {
          const fecha = new Date(r["Mes"]);
          if (!isNaN(fecha)) {
            // convertir "2023-01-01" → 1
            r["Mes"] = fecha.getMonth() + 1;
          }
        }
        return r;
      });

      $("#uploadMsg").innerText = `${j.mensaje} — columnas: ${j.columnas.join(", ")}`;
      toast("Archivo cargado", "success");

      window.columnTypes = j.columnTypes;
      console.log("Tipos recibidos:", window.columnTypes);
      populateModelSelects(j.columnas, j.columnTypes);
      populateColumnSelectors(j.columnas);

      await tryFetchArrays();

      $("#kpiCols").innerText = j.columnas.join(", ");
      $("#kpiRecords").innerText = j.registros || 0;

    } else {
      console.warn("Respuesta inesperada /cargar", j);
      $("#uploadMsg").innerText = "Respuesta inesperada del servidor";
      toast("Respuesta inesperada al cargar", "error");
    }

  } catch (err){
    console.error(err);
    $("#uploadMsg").innerText = "Error al cargar archivo (ver consola)";
    toast("Error al cargar archivo", "error");
  }
}

function resetData(){
  STATE.raw = null;
  STATE.arrays = {};
  $("#selectTend").innerHTML = '';
  $("#selectDisp").innerHTML = '';
  $("#selectQuick").innerHTML = '';
  $("#kpiCols").innerText = "—";
  $("#kpiRecords").innerText = "0";
  $("#uploadMsg").innerText = "Datos limpiados";
  // destroy charts
  destroyChart("bin"); destroyChart("scatter"); destroyChart("hist");
  toast("Datos reseteados", "info");
}

/* populate selectors with backend columns */
function populateColumnSelectors(cols){
  const targets = [
    "#selectTend",
    "#selectDisp",
    "#selectQuick",

    // Modelos
    "#selectModelVar",
    "#selectModelGroup",
    "#selectModelX",
    "#selectModelY",

    // Otras herramientas
    "#selectBinomCol",
    "#selectProdCol",

    // Intervalo de confianza
    "#ic_col",

    // Prueba t de hipótesis
    "#ttest_col"
  ];


  // Llenar todos esos selects con todas las columnas
  targets.forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;  // Si no existe, lo ignoramos sin error
    el.innerHTML = '<option value="">-- seleccionar --</option>';
    cols.forEach(c => {
      const o = document.createElement("option");
      o.value = c;
      o.innerText = c;
      el.appendChild(o);
    });
  });
}


/*  Arrays fetch (for charts) */
async function tryFetchArrays(){
  if(!STATE.raw || !STATE.raw.columnas) return;
  const cols = STATE.raw.columnas;
  // find ventas and unidades
  const venta = cols.find(c => /venta/i.test(c));
  const unidad = cols.find(c => /unidades?|unidad/i.test(c));
  if(!venta || !unidad) return;
  try {
    const r1 = await fetch(`${API_BASE}/dataarray/${encodeURIComponent(venta)}`);
    const r2 = await fetch(`${API_BASE}/dataarray/${encodeURIComponent(unidad)}`);
    if(r1.ok && r2.ok){
      const ventas = await r1.json();
      const unidades = await r2.json();
      // ensure numeric arrays
      STATE.arrays.ventas = ventas.map(Number);
      STATE.arrays.unidades = unidades.map(Number);
      renderScatter(STATE.arrays.ventas, STATE.arrays.unidades);
      renderHist(STATE.arrays.unidades);
      $("#uploadMsg").innerText += " · arrays numéricos disponibles";
    }
  } catch(e){
    console.warn("No se pudo obtener arrays:", e);
  }
}

/*  Tendencia central & dispersión (via API) */
async function calcTendColumn(col){
  try {
    const r = await fetch(`${API_BASE}/tendencia/${encodeURIComponent(col)}`);
    const j = await r.json();
    if(j.error){ toast(j.error || "Error en tendencia", "error"); return; }
    $("#mediaVal").innerText = Number(j.media).toFixed(3);
    $("#medianaVal").innerText = Number(j.mediana).toFixed(3);
    $("#modaVal").innerText = (j.moda===null? "—": j.moda);
    $("#quickMedia").innerText = Number(j.media).toFixed(3);
    $("#quickMediana").innerText = Number(j.mediana).toFixed(3);
    $("#quickModa").innerText = (j.moda===null? "—": j.moda);
    toast("Tendencia calculada", "success");
  } catch(e){
    console.error(e);
    toast("Error al calcular tendencia", "error");
  }
}

async function calcDispColumn(col){
  try {
    const r = await fetch(`${API_BASE}/dispersion/${encodeURIComponent(col)}`);
    const j = await r.json();
    if(j.error){ toast(j.error || "Error en dispersión", "error"); return; }
    $("#sdVal").innerText = Number(j.desviacion).toFixed(3);
    $("#varVal").innerText = Number(j.varianza).toFixed(3);
    $("#iqrVal").innerText = Number(j.iqr).toFixed(3);
    toast("Dispersión calculada", "success");
  } catch(e){
    console.error(e);
    toast("Error al calcular dispersión", "error");
  }
}

/*  ANOVA usando selects */
async function postANOVA() {
    const data = window.dataset; // datos cargados desde Excel
    console.log("Datos para ANOVA:", data);

    if (!data || !data.length) {
        toast("No hay datos cargados", "error");
        return;
    }

    const variable = document.getElementById("selectModelVar").value;
    const group = document.getElementById("selectModelGroup").value;

    console.log("ANOVA con var:", variable, "grupo:", group);

    if (!variable || !group) {
        toast("Selecciona ambas variables", "error");
        return;
    }

    try {
        const r = await fetch(`${API_BASE}/anova`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data: [
                    Object.keys(data[0]), // encabezados
                    ...data.map(row => Object.values(row))
                ],
                var: variable,
                group_var: group
            })
        });

        const j = await r.json();

        const resultsDiv = document.getElementById("modelResults");
        resultsDiv.innerHTML = "";

        if (j.error) {
            toast(j.error, "error");
            return;
        }

       // Crear tabla ANOVA
let tabla = `
<table class="anova-table">
    <tr>
        <th>Fuente</th>
        <th>Suma de Cuadrados</th>
        <th>df</th>
        <th>F</th>
        <th>p-valor</th>
    </tr>
`;

j.forEach(row => {
    tabla += `
    <tr>
        <td>${row.index}</td>
        <td>${row.sum_sq !== null ? row.sum_sq.toFixed(2) : ""}</td>
        <td>${row.df}</td>
        <td>${row.F !== null ? row.F.toFixed(4) : ""}</td>
        <td>${row["PR(>F)"] !== null ? row["PR(>F)"].toFixed(4) : ""}</td>
    </tr>`;
});

tabla += `</table>`;

resultsDiv.innerHTML = tabla;
        toast("ANOVA ejecutado", "success");

    } catch (e) {
        console.error(e);
        toast("Error al ejecutar ANOVA", "error");
    }
}

/*  Correlación usando selects */
async function fetchCorrelationUI(){
    const x = document.getElementById("selectModelX").value;
    const y = document.getElementById("selectModelY").value;

    if(!x || !y){
        toast("Selecciona variables X e Y", "error");
        return;
    }

    try {
        const r = await fetch(`${API_BASE}/correlacion?x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}`);
        const j = await r.json();

        const resultsDiv = document.getElementById("modelResults");
        resultsDiv.innerHTML = `<div class="muted">r: ${j.r.toFixed(3)} — p: ${j.pvalue.toFixed(3)}</div>`;
        toast("Correlación calculada", "success");
    } catch(e){
        console.error(e);
        toast("Error en correlación", "error");
    }
}
/*  Regresión Lineal usando selects */
async function fetchRegressionUI(){
    const x = document.getElementById("selectModelX").value;
    const y = document.getElementById("selectModelY").value;
    
    if(!x || !y){
      toast("Selecciona variables X e Y", "error");
      return;
    }
    
    try {
        const r = await fetch(`${API_BASE}/regresion?x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}`);
        const j = await r.json();

        const resultsDiv = document.getElementById("modelResults");
        // limpiar resultados previos
        resultsDiv.innerHTML = "";

        // mostrar coeficientes y R2 de forma legible
        const coef = j.coeficientes;
        const r2 = j.r2;
        const html = `
          <div class="muted">
            <strong>Regresión Lineal:</strong><br>
            ${y} = ${coef.const.toFixed(2)} + (${coef[x].toFixed(4)})·${x}<br>
            R² = ${r2.toFixed(4)}
          </div>
        `;
        resultsDiv.innerHTML = html;

        toast("Regresión calculada", "success");
    } catch(e){
        console.error(e);
        toast("Error en regresión", "error");
    }
}

async function fetchCorrelation(x,y){
  try{
    const r = await fetch(`${API_BASE}/correlacion?x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}`);
    const j = await r.json();
    toast(`r=${j.r.toFixed(3)} (p=${j.pvalue.toFixed(3)})`, "success");
    document.getElementById("modelResults").innerHTML = `<div class="muted">r: ${j.r.toFixed(3)} — p: ${j.pvalue.toFixed(3)}</div>`;
  } catch(e){ console.error(e); toast("Error correlación", "error"); }
}

async function fetchRegression(x,y){
  try{
    const r = await fetch(`${API_BASE}/regresion?x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}`);
    const j = await r.json();
    // show in modelResults
    document.getElementById("modelResults").innerHTML = `<pre style="color:var(--muted)">${JSON.stringify(j, null, 2)}</pre>`;
    toast("Regresión calculada", "success");
  } catch(e){ console.error(e); toast("Error regresión", "error"); }
}

/*  Charts rendering */
function destroyChart(key){
  if(STATE.charts[key]){
    STATE.charts[key].destroy();
    STATE.charts[key] = null;
  }
}

function renderScatter(xs, ys){
  if(!xs || !ys || xs.length !== ys.length) return;
  const ctx = document.getElementById("scatterChart").getContext("2d");
  destroyChart("scatter");
  const data = xs.map((x,i)=>({ x: x, y: ys[i] }));
  STATE.charts.scatter = new Chart(ctx, {
    type: "scatter",
    data: { datasets: [{ label: "Ventas vs Unidades", data: data }]},
    options: { scales:{ x:{ title:{ display:true, text:"Ventas" } }, y:{ title:{ display:true, text:"Unidades" } } } }
  });
}

function renderHist(arr){
  if(!arr || !arr.length) return;
  const ctx = document.getElementById("histUnidades").getContext("2d");
  destroyChart("hist");
  // simple binning
  const bins = 8;
  const min = Math.min(...arr), max = Math.max(...arr);
  const step = (max - min) / bins || 1;
  const labels = [], data = [];
  for(let i=0;i<bins;i++){
    const a = min + i*step, b = a+step;
    labels.push(`${Math.round(a)}-${Math.round(b)}`);
    const count = arr.filter(v => v>=a && v<b).length;
    data.push(count);
  }
  STATE.charts.hist = new Chart(ctx, {
    type: "bar",
    data: { labels: labels, datasets: [{ label:"Frecuencia", data: data }]},
    options: { plugins:{ legend:{ display:false } }, responsive:true }
  });
}

/* UTIL: CSV preview (if backend returns small sample) */
function renderSampleTable(rows){
  // rows = array of objects
  if(!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const table = document.createElement("table");
  table.className = "table-preview";
  const thead = document.createElement("thead"); const trh = document.createElement("tr");
  keys.forEach(k=>{ const th = document.createElement("th"); th.innerText = k; trh.appendChild(th); });
  thead.appendChild(trh); table.appendChild(thead);
  const tbody = document.createElement("tbody");
  rows.slice(0,10).forEach(r=>{
    const tr = document.createElement("tr");
    keys.forEach(k=>{ const td = document.createElement("td"); td.innerText = r[k]; tr.appendChild(td); });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  const container = document.getElementById("summaryBlock");
  container.innerHTML = "";
  container.appendChild(table);
}

/*  FUNCIONES GLOBALES */
function showMsg(text, type="info") {
    const box = document.getElementById("msgBox");
    box.className = "alert alert-" + type;
    box.innerText = text;
    box.style.display = "block";
}

function populateModelSelects(cols, types) {
    const numeric = cols.filter(c => types[c] === "number");
    const categorical = cols.filter(c => types[c] === "string");

    // ANOVA: solo categorías
    const groupSelect = document.querySelector("#selectModelGroup"); 
    if (groupSelect) {
        groupSelect.innerHTML = '<option value="">-- seleccionar --</option>';
        categorical.forEach(c => {
            const o = document.createElement("option");
            o.value = c;
            o.innerText = c;
            groupSelect.appendChild(o);
        });
    }

    const groupSelect2 = document.querySelector("#selectModelVar"); 
    if (groupSelect2) {
        groupSelect2.innerHTML = '<option value="">-- seleccionar --</option>';
        categorical.forEach(c => {
            const o = document.createElement("option");
            o.value = c;
            o.innerText = c;
            groupSelect2.appendChild(o);
        });
    }

    // Variables numéricas (Regresión / Correlación)
    const numTargets = ["#selectModelVar", "#selectModelY"];
    numTargets.forEach(sel => {
        const el = document.querySelector(sel);
        if (!el) return;
        el.innerHTML = '<option value="">-- seleccionar --</option>';
        numeric.forEach(c => {
            const o = document.createElement("option");
            o.value = c;
            o.innerText = c;
            el.appendChild(o);
        });
    });

    // X de regresión/correlación (numéricas también)
    const xSel = document.querySelector("#selectModelX");
    if (xSel) {
        xSel.innerHTML = '<option value="">-- seleccionar --</option>';
        numeric.forEach(c => {
            const o = document.createElement("option");
            o.value = c;
            o.innerText = c;
            xSel.appendChild(o);
        });
    }
}
  
// BINOMIAL UNIVERSAL
async function calcularBinomialUniversal(n, p, canvasID, outputDivID) {
    try {
        const r = await fetch(`${API_BASE}/binomial?n=${n}&p=${p}`);
        if (!r.ok) { 
            toast("Error en API Binomial", "error"); 
            return; 
        }

        const j = await r.json();

        const canvas = document.getElementById(canvasID);
        const ctx = canvas.getContext("2d");

 
        // DESTRUIR GRÁFICA PREVIA  
        if (canvasID === "chartBinomialStats") {
            if (chartBinomialStats) chartBinomialStats.destroy();
        }
        if (canvasID === "chartBinomialModels") {
            if (chartBinomialModels) chartBinomialModels.destroy();
        }

  
        // CREAR NUEVA GRÁFICA
        const newChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: j.k,
                datasets: [{
                label: "P(X=k)",
                data: j.pmf,
                backgroundColor: j.k.map((value, idx) =>
                    idx === Number(document.getElementById("inputBinK").value)
                        ? "red" //  barra resaltada cuando es k
                        : "rgba(54, 162, 235, 0.5)" // barras normales
                )
            }]
            },
            options: {
                plugins: { legend: { display: false } }
            }
        });

        // Guardar referencia según sección
        if (canvasID === "chartBinomialStats") {
            chartBinomialStats = newChart;
        } else if (canvasID === "chartBinomialModels") {
            chartBinomialModels = newChart;
        }

  
        // TEXTO / RESULTADOS  
        document.getElementById(outputDivID).innerHTML = `
            <span class="muted">
                Media = ${j.media.toFixed(3)} —
                Varianza = ${j.varianza.toFixed(3)}
            </span>
        `;

        toast("Binomial calculada", "success");

    } catch (e) {
        console.error(e);
        toast("Error al calcular binomial", "error");
    }
}

 
// BINOMIAL (Modelos) 
async function calcularBinomialModelos(n, p, k) {
    try {
        const r = await fetch(`${API_BASE}/binomial?n=${n}&p=${p}`);
        const j = await r.json();

        if (j.error) {
            toast(j.error, "error");
            return;
        }

        // canvas específico del módulo Modelos
        const canvas = document.getElementById("chartBinomialModels");
        const ctx = canvas.getContext("2d");

        // destruir si ya existe
        if (STATE.charts.binModels) {
            STATE.charts.binModels.destroy();
        }

        // gráfica
        STATE.charts.binModels = new Chart(ctx, {
            type: "bar",
            data: {
                labels: j.k,
                datasets: [{
                    label: "P(X = k)",
                    data: j.pmf
                }]
            },
            options: { plugins: { legend: { display: false } } }
        });

        // cálculo puntual si el usuario metió k
        let resultado = "";
        if (!isNaN(k) && k >= 0 && k <= n) {
            resultado = `P(X=${k}) = ${j.pmf[k].toFixed(5)}`;
        }

        document.getElementById("modelResults").innerHTML = `
            <div class="muted">
                Media = ${j.media.toFixed(3)} —
                Varianza = ${j.varianza.toFixed(3)}<br>
                ${resultado}
            </div>
        `;

        toast("Binomial calculada", "success");

    } catch (e) {
        console.error(e);
        toast("Error al calcular binomial (Modelos)", "error");
    }
}

 
// DISTRIBUCIÓN POISSON (barra o línea con puntos y k resaltado) 
document.getElementById("btnCalcPoisson")?.addEventListener("click", ()=>{
  const lambda = parseFloat(document.getElementById("inputPoissonLambda").value);
  const k = parseInt(document.getElementById("inputPoissonK").value);
  const chartType = document.getElementById("poissonChartType").value; // 🔥 tipo de gráfico

  // Función factorial
  function factorial(n){
    if(n===0 || n===1) return 1;
    let f = 1;
    for(let i=2; i<=n; i++) f*=i;
    return f;
  }

  const poissonProb = (Math.pow(lambda,k) * Math.exp(-lambda)) / factorial(k);
  document.getElementById("poissonOutput").textContent = `P(X=${k}) = ${poissonProb.toFixed(4)}`;

  // Graficar distribución (k=0..kMax)
  const kMax = Math.max(k+5, 10);
  const labels = [], data = [];
  for(let i=0;i<=kMax;i++){
    labels.push(i);
    data.push(Math.pow(lambda,i)*Math.exp(-lambda)/factorial(i));
  }

  // Crear / actualizar gráfico
  const ctx = document.getElementById("chartPoisson").getContext("2d");
  if(window.poissonChart) window.poissonChart.destroy();

  window.poissonChart = new Chart(ctx, {
    type: chartType,
    data: {
      labels,
      datasets: [{
        label: "P(X=k)",
        data,
        //  Configuración según tipo
        backgroundColor: chartType === 'bar'
          ? labels.map(i => i === k ? 'red' : 'rgba(13,110,253,0.5)')
          : 'rgba(13,110,253,0.3)',
        borderColor: chartType === 'line' ? '#0d6efd' : undefined,
        fill: chartType === 'line' ? false : undefined,
        tension: chartType === 'line' ? 0.3 : undefined,
        pointBackgroundColor: chartType === 'line'
          ? labels.map(i => i === k ? 'red' : '#08d1f5ff')
          : undefined,
        pointRadius: chartType === 'line' ? 6 : undefined
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } }
    }
  });
});

/* Normal (grafica estilizada igual que Poisson) */
async function postNormal() {
    const mu = parseFloat(document.getElementById("normalMu").value);
    const sigma = parseFloat(document.getElementById("normalSigma").value);
    const a = parseFloat(document.getElementById("normalA").value);
    const b = parseFloat(document.getElementById("normalB").value);

    if (isNaN(mu) || isNaN(sigma) || isNaN(a) || isNaN(b)) {
        toast("Completa todos los campos", "error");
        return;
    }

    try {
        // opcional: si tienes endpoint /normal lo usas, si no comentarlo
        // const r = await fetch(`${API_BASE}/normal`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mu, sigma, a, b }) });
        // const j = await r.json();
        // if (j.error) { toast(j.error, "error"); return; }
        // document.getElementById("normalResults").innerHTML = `<p><strong>Probabilidad:</strong> ${j.prob.toFixed(6)}</p>`;

        // si no usas API, puedes calcular prob aquí o mostrar resultado mínimo:
        document.getElementById("normalResults").innerHTML = `<p><strong>Intervalo:</strong> [${a}, ${b}] — μ=${mu}, σ=${sigma}</p>`;

        const chartType = document.getElementById("normalChartType").value || "line";
        const canvas = document.getElementById("chartNormal");
        // asegúrate que existe
        if (!canvas) { toast("Canvas de normal no encontrado (id chartNormal)", "error"); return; }
        const ctx = canvas.getContext("2d");

        // destruir si existe
        canvas.style.width = "100%";
        canvas.style.height = "420px";
        canvas.width  = canvas.offsetWidth;
        canvas.height = 420;

        if (window.normalChart) window.normalChart.destroy();

        // puntos x,y
        const x = [], y = [];
        const minX = mu - 4 * sigma;
        const maxX = mu + 4 * sigma;
        for (let val = minX; val <= maxX; val += (maxX - minX) / 160) {
            x.push(Number(val.toFixed(4)));
            y.push((1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((val - mu) / sigma, 2)));
        }

        // sombra entre a y b -> valores fuera son null para que no rellene todo
        const shaded = x.map((val, i) => (val >= a && val <= b ? y[i] : null));

        const baseBlue = "#0d6efd";

        const datasets = [
            {
                label: "Distribución normal",
                data: y,
                backgroundColor: chartType === "bar" ? "rgba(13,110,253,0.5)" : "rgba(13,110,253,0.12)",
                borderColor: baseBlue,
                borderWidth: 2,
                tension: 0.35,
                pointRadius: chartType === "line" ? 3 : 0,
                fill: false
            }
        ];

        // si es linea, añadimos dataset sombreado como area bajo curva (usando spanGaps para ignorar nulls)
        if (chartType === "line") {
            datasets.push({
                label: "Área entre a y b",
                data: shaded,
                backgroundColor: "rgba(255,50,50,0.25)",
                borderColor: "rgba(255,60,60,0.6)",
                borderWidth: 0,
                pointRadius: 0,
                tension: 0.3,
                fill: true,
                spanGaps: true
            });
        } else {
            // si es bar, el sombreado no aplica igual; coloreamos barras según si están dentro
            datasets[0].backgroundColor = x.map(val => (val >= a && val <= b ? "rgba(255,50,50,0.6)" : "rgba(13,110,253,0.5)"));
        }

        // IMPORTANT: forzar que Chart no mantenga aspect ratio (evita "aplastado")
        window.normalChart = new Chart(ctx, {
            type: chartType === "bar" ? "bar" : "line",
            data: {
                labels: x,
                datasets: datasets
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,   // <-- clave para que respete el alto del canvas / CSS
                plugins: { legend: { display: true } },
                scales: {
                  x: {
                    title: { display: true, text: "x" },
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--muted') || "#c7d2e1" }
                  },
                  y: {
                    title: { display: true, text: "Densidad" },
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--muted') || "#c7d2e1" }
                  }
                }
            }
        });

        toast("Distribución normal calculada", "success");

    } catch (e) {
        console.error(e);
        toast("Error calculando la normal", "error");
    }
}
let chartIC = null;

// Intervalo de confianza con gráfica
async function calcIC() {
    const col = document.getElementById("ic_col").value;
    const alpha = parseFloat(document.getElementById("ic_level").value);
    const parametro = document.getElementById("ic_param").value;
    const tipo = document.getElementById("ic_chart_type").value;

    if (!STATE.raw) {
        alert("Primero carga un archivo.");
        return;
    }

    // Llamada API
    const resp = await fetch(`${API_BASE}/intervalo_confianza`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            columna: col,
            alpha: alpha,
            parametro: parametro   // <--- AQUÍ SE ENVÍA CORRECTAMENTE
        })
    });

    const data = await resp.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    // ------- GENERAR TABLA DINÁMICA --------
    let html = `
    <table class="anova-table">
    <tr><th>Medida</th><th>Valor</th></tr>
    <tr><td>n</td><td>${data.n}</td></tr>
    `;

    if (data.tipo === "media") {
        html += `
        <tr><td>Media</td><td>${data.media.toFixed(4)}</td></tr>
        <tr><td>Error estándar</td><td>${data.se.toFixed(4)}</td></tr>
        `;
    }

    if (data.tipo === "sd") {
        html += `
        <tr><td>Desviación estándar</td><td>${data.sd.toFixed(4)}</td></tr>
        `;
    }

    html += `
    <tr><th colspan="2">Intervalo de Confianza</th></tr>
    <tr><td>Límite inferior</td><td>${data.ci_low.toFixed(4)}</td></tr>
    <tr><td>Límite superior</td><td>${data.ci_high.toFixed(4)}</td></tr>
    </table>
    `;

    document.getElementById("ic_result").innerHTML = html;

    graficarIC(data, tipo);
}

// ====== GRAFICAR INTERVALO DE CONFIANZA ======
function graficarIC(data, tipo) {
    const ctx = document.getElementById("chartIC").getContext("2d");

    if (chartIC) chartIC.destroy();

    let labels, valores;

    if (data.tipo === "media") {
        labels = ["Límite Inferior", "Media", "Límite Superior"];
        valores = [data.ci_low, data.media, data.ci_high];
    }

    if (data.tipo === "sd") {
        labels = ["Límite Inferior", "Desv Std", "Límite Superior"];
        valores = [data.ci_low, data.sd, data.ci_high];
    }

    chartIC = new Chart(ctx, {
        type: tipo === "bar" ? "bar" : "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Intervalo de Confianza",
                data: valores,
                borderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } }
        }
    });
}

let chartTTest = null;

// ====== PRUEBA T PARA LA MEDIA ======
async function calcTTest() {

    const col = document.getElementById("ttest_col").value;
    const mu0 = parseFloat(document.getElementById("ttest_mu0").value);
    const alpha = parseFloat(document.getElementById("ttest_alpha").value);

    if (!col || isNaN(mu0)) {
        alert("Selecciona una columna y un valor de mu0.");
        return;
    }

    if (!STATE.raw) {
        alert("Carga primero un archivo.");
        return;
    }

    // === pedir datos al backend ===
    const resp = await fetch(`${API_BASE}/t_test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            columna: col,
            mu0: mu0,
            alpha: alpha
        })
    });

    const data = await resp.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    // === Mostrar resultados bonitos ===
    document.getElementById("ttest_result").innerHTML = `
        <table class="anova-table">
            <tr><th>Medida</th><th>Valor</th></tr>
            <tr><td>Media muestral</td><td>${data.media.toFixed(4)}</td></tr>
            <tr><td>Desviación estándar</td><td>${data.sd.toFixed(4)}</td></tr>
            <tr><td>n</td><td>${data.n}</td></tr>
            <tr><td>t estadístico</td><td>${data.t.toFixed(4)}</td></tr>
            <tr><td>p-valor</td><td>${data.pvalue.toFixed(6)}</td></tr>
            <tr><th>Decisión</th><th>${data.conclusion}</th></tr>
        </table>
    `;

    // === GRAFICAR: media vs mu0 ===
    const ctx = document.getElementById("chartTTest").getContext("2d");

    if (chartTTest) chartTTest.destroy();

    chartTTest = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Media muestral", "μ₀ (hipótesis)"],
            datasets: [{
                data: [data.media, mu0],
                backgroundColor: ["rgba(0,150,255,0.6)", "rgba(255,80,80,0.7)"]
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}

/*  
   START
     */
document.addEventListener("DOMContentLoaded", ()=>{
  initUI();
  // If preview image missing, hide preview container
  if(!document.querySelector(".preview-img") || !document.querySelector(".preview-img").src){
    const p = document.querySelector(".sidebar-preview");
    if(p) p.style.display = "none";
  }
  // Modo oscuro
    const toggleBtn = document.getElementById("themeToggle");
    const root = document.documentElement;

    // Leer tema guardado
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
        root.classList.add("light-mode");
        toggleBtn.textContent = "🌙 Modo oscuro";
    } else {
        toggleBtn.textContent = "☀️ Modo claro";
    }

    toggleBtn.addEventListener("click", () => {
        root.classList.toggle("light-mode");

        if (root.classList.contains("light-mode")) {
            toggleBtn.textContent = "🌙 Modo oscuro";
            localStorage.setItem("theme", "light");
        } else {
            toggleBtn.textContent = "☀️ Modo claro";
            localStorage.setItem("theme", "dark");
        }
    });
    
//  
// BÚSQUEDA SIDEBAR
//  
const searchInput = document.getElementById("sidebarSearch");

searchInput?.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();

  // Obtener todas las secciones de vistas
  const views = document.querySelectorAll(".view-pane");

  views.forEach(view => {
    const text = view.innerText.toLowerCase();
    if (query && text.includes(query)) {
      view.classList.remove("hidden");
      view.classList.add("active");
    } else {
      view.classList.remove("active");
      view.classList.add("hidden");
    }
  });
});
});
