// app.js — Frontend logic for Fábrica Alfa
// Assumes index.html and style.css are present, Chart.js loaded, and backend at API_BASE

/* ============================
   CONFIG
   ============================ */
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

/* ============================
   DOM helpers
   ============================ */
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

/* ============================
   Initialization
   ============================ */
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
  $("#btnBinom")?.addEventListener("click", async ()=>{
    const n = parseInt($("#binN").value);
    const p = parseFloat($("#binP").value);
    if(isNaN(n) || isNaN(p)) { toast("Introduce n y p válidos", "error"); return; }
    await fetchBinomial(n,p);
  });

 // ============================
// MODELOS — EVENT LISTENERS
// ============================

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

/* ============================
   Navigation & Roles
   ============================ */
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

/* ============================
   AUTH (simple, client-side)
   ============================ */
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
/* ============================
   API helpers & ping
   ============================ */
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

/* ============================
   UPLOAD (Gerente only)
   ============================ */
async function uploadFile(){
  if(!STATE.role || !STATE.role.toLowerCase().startsWith("ger")){
    toast("Solo Gerente puede subir archivos", "error");
    return;
  }
  const input = $("#fileInput");
  if(!input || !input.files || input.files.length === 0){ toast("Selecciona un archivo primero", "error"); return; }
  const file = input.files[0];
  const fd = new FormData();
  fd.append("archivo", file);
  $("#uploadMsg").innerText = "Cargando archivo...";
  try {
    const res = await fetch(`${API_BASE}/cargar`, { method: "POST", body: fd });
    const j = await res.json();
    if(j.mensaje && j.columnas){
      STATE.raw = j;
      $("#uploadMsg").innerText = `${j.mensaje} — columnas: ${j.columnas.join(", ")}`;
      toast("Archivo cargado", "success");
      populateColumnSelectors(j.columnas);
      // attempt to fetch ventas/unidades arrays if available
      await tryFetchArrays();
      // update KPIs
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

    // 🔥 Agregamos los nuevos selects:
    "#selectModelVar",   // Variables disponibles (modelos)
    "#selectModelX",     // Variable X (regresión/correlación)
    "#selectModelY",     // Variable Y (regresión/correlación)

    "#selectBinomCol",   // si tienes binomial por columna
    "#selectProdCol"     // si tienes control de producción
  ];

  targets.forEach(sel => {
    const el = document.querySelector(sel);
    if(!el) return;          // Si no existe, lo ignoramos sin error
    el.innerHTML = '<option value="">-- seleccionar --</option>';
    cols.forEach(c=>{
      const o = document.createElement("option");
      o.value = c;
      o.innerText = c;
      el.appendChild(o);
    });
  });
}

/* ============================
   Arrays fetch (for charts)
   ============================ */
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

/* ============================
   Tendencia central & dispersión (via API)
   ============================ */
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

/* ============================
   ANOVA usando selects
   ============================ */
async function postANOVA() {
    const data = window.dataset; // tus datos cargados desde Excel

    if (!data || data.length === 0) {
        toast("No hay datos cargados", "error");
        return;
    }

    const varName = document.getElementById("selectModelVar").value;
    const group = document.getElementById("selectModelX").value; // X como grupo

    if (!varName || !group) {
        toast("Selecciona ambas variables", "error");
        return;
    }

    try {
        const resultsDiv = document.getElementById("modelResults");
        resultsDiv.innerHTML = ""; // limpiar resultados anteriores

        // enviamos los datos junto con los nombres de columna
        const r = await fetch(`${API_BASE}/anova`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ var: varName, group_var: group, data: data })
        });

        const j = await r.json();

        if (j.error) {
            toast(j.error || "Error en ANOVA", "error");
            return;
        }

        // mostrar resultados (imagen o tabla/JSON)
        if (j.image) {
            const img = document.createElement("img");
            img.src = j.image;
            resultsDiv.appendChild(img);
        } else {
            resultsDiv.innerHTML = `<pre style="white-space:pre-wrap; color:var(--muted)">${JSON.stringify(j, null, 2)}</pre>`;
        }

        toast("ANOVA ejecutado", "success");

    } catch (e) {
        console.error(e);
        toast("Error al ejecutar ANOVA", "error");
    }
}
/* ============================
   Correlación usando selects
   ============================ */
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
/* ============================
   Regresión Lineal usando selects
============================ */
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

/* ============================
   Charts rendering
   ============================ */
function destroyChart(key){
  if(STATE.charts[key]){
    STATE.charts[key].destroy();
    STATE.charts[key] = null;
  }
}

function renderBinomial(labels, pmf){
  const ctx = document.getElementById("chartBinomial").getContext("2d");
  destroyChart("bin");
  STATE.charts.bin = new Chart(ctx, {
    type: "bar",
    data: { labels: labels, datasets: [{ label: "P(X=k)", data: pmf }]},
    options: { plugins:{ legend:{ display:false } }, responsive:true }
  });
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

/* ============================
   UTIL: CSV preview (if backend returns small sample)
   ============================ */
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

/* ============================
   FUNCIONES GLOBALES
============================ */
function showMsg(text, type="info") {
    const box = document.getElementById("msgBox");
    box.className = "alert alert-" + type;
    box.innerText = text;
    box.style.display = "block";
}

/* ============================
   START
   ============================ */
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
});