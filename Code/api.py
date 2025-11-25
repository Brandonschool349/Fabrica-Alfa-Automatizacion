# =========================================================
# API Oficial de Fábrica Alfa (Backend del Sistema)
# Procesa todos los cálculos estadísticos para el Dashboard Web
# =========================================================

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import pandas as pd

# Importar funciones del motor matemático
from sistema import (
    normalize_columns,
    medidas_tendencia_central,
    medidas_dispersión,
    binomial_prob,
    poisson_prob,
    normal_prob_interval,
    intervalo_confianza_media,
    prueba_t_uno_muestra,
    realizar_anova,
    correlacion,
    regresion_lineal
)

app = FastAPI(title="API Fábrica Alfa")

# ---------------------------------------------------------
# CONFIGURACIÓN CORS
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # permite el dashboard web
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# VARIABLE GLOBAL
# ---------------------------------------------------------
df_global = None  # Se carga aquí la base de datos temporal

# ---------------------------------------------------------
# ENDPOINT: CARGAR ARCHIVO
# ---------------------------------------------------------
@app.post("/cargar")
async def cargar(archivo: UploadFile = File(...)):
    global df_global

    if archivo.filename.endswith(".csv"):
        df_global = pd.read_csv(archivo.file)
    elif archivo.filename.endswith(".xlsx") or archivo.filename.endswith(".xls"):
        df_global = pd.read_excel(archivo.file)
    else:
        return {"error": "Formato no soportado"}

    # Normalizar nombres
    df_global.columns = df_global.columns.str.strip()
    df_global = normalize_columns(df_global)

    return {
        "mensaje": "Archivo cargado correctamente",
        "columnas": list(df_global.columns),
        "filas": len(df_global)
    }

# ---------------------------------------------------------
# ENDPOINTS DE TENDENCIA Y DISPERSIÓN
# ---------------------------------------------------------
@app.get("/tendencia/{col}")
def tendencia(col: str):
    if df_global is None:
        return {"error": "No hay datos cargados"}
    return medidas_tendencia_central(df_global[col])

@app.get("/dispersion/{col}")
def dispersion(col: str):
    if df_global is None:
        return {"error": "No hay datos cargados"}
    return medidas_dispersión(df_global[col])

# ---------------------------------------------------------
# ENDPOINT BINOMIAL
# ---------------------------------------------------------
@app.get("/binomial")
def binomial(n: int, p: float):
    xs, pmf = binomial_prob(n, p)
    return {"k": xs, "pmf": pmf}

# ---------------------------------------------------------
# ENDPOINT POISSON
# ---------------------------------------------------------
@app.get("/poisson")
def poisson(lmbda: float):
    xs, pmf = poisson_prob(lmbda)
    return {"k": xs, "pmf": pmf}

# ---------------------------------------------------------
# ENDPOINT NORMAL
# ---------------------------------------------------------
@app.get("/normal")
def normal(mu: float, sigma: float, a: float, b: float):
    prob = normal_prob_interval(mu, sigma, a, b)
    return {"probabilidad": float(prob)}

# ---------------------------------------------------------
# ENDPOINT: INTERVALO DE CONFIANZA
# ---------------------------------------------------------
@app.get("/ic/{col}")
def ic_media(col: str):
    if df_global is None:
        return {"error": "No hay datos cargados"}
    return intervalo_confianza_media(df_global[col])

# ---------------------------------------------------------
# ENDPOINT: PRUEBA T
# ---------------------------------------------------------
@app.get("/t_test")
def t_test(col: str, mu0: float):
    if df_global is None:
        return {"error": "No hay datos cargados"}
    return prueba_t_uno_muestra(df_global[col], mu0)

# ---------------------------------------------------------
# ENDPOINT CORRELACIÓN
# ---------------------------------------------------------
@app.get("/correlacion")
def correlacion_api(x: str, y: str):
    if df_global is None:
        return {"error": "No hay datos cargados"}
    return correlacion(df_global, x, y)

# ---------------------------------------------------------
# ENDPOINT REGRESIÓN LINEAL
# ---------------------------------------------------------
@app.get("/regresion")
def regresion_api(x: str, y: str):
    if df_global is None:
        return {"error": "No hay datos cargados"}
    return regresion_lineal(df_global, x, y)

# ---------------------------------------------------------
# ENDPOINT PARA OBTENER COLUMNAS COMO LISTAS
# ---------------------------------------------------------
@app.get("/dataarray/{col}")
def dataarray(col: str):
    if df_global is None:
        return {"error": "No hay datos cargados"}
    return df_global[col].dropna().tolist()

# ---------------------------------------------------------
# SERVIR TU DASHBOARD HTML LOCAL
# ---------------------------------------------------------

# Ruta donde está tu index.html
WEB_PATH = r"C:\Estadistica y probabilidad para ciencia de datos\Fabrica Alfa\Web"

# Montar carpeta completa
app.mount('/web', StaticFiles(directory=WEB_PATH), name='web')

# Mostrar index.html al abrir el navegador
@app.get("/", response_class=HTMLResponse)
def home():
    return FileResponse(WEB_PATH + r"\index.html")

from fastapi import Form

# Endpoint login
@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    # Ejemplo simple: usuario y contraseña fijos
    if username == "admin" and password == "123":
        return {"success": True, "mensaje": "Login correcto"}
    return {"success": False, "mensaje": "Usuario o contraseña incorrectos"}