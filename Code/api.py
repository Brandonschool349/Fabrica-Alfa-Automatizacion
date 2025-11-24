# =========================================================
# API Oficial de Fábrica Alfa (Backend del Sistema)
# Versión ligera para presentación
# =========================================================

from fastapi import FastAPI, UploadFile, File
import pandas as pd
from Sistema import (
    medidas_tendencia_central,
    medidas_dispersión,
    binomial_prob,
    poisson_prob,
    normal_prob_interval,
)

app = FastAPI(title="API Fábrica Alfa")

from fastapi.middleware.cors import CORSMiddleware

# justo después de crear app = FastAPI(...)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:8000", "http://localhost:8000",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
df_global = None  # Aquí se guardará la base cargada temporalmente


# ---------------------------------------------------------
# Cargar base desde un archivo Excel/CSV
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

    return {
        "mensaje": "Archivo cargado correctamente",
        "columnas": list(df_global.columns),
        "filas": len(df_global)
    }


# ---------------------------------------------------------
# Tendencia Central
# ---------------------------------------------------------
@app.get("/tendencia/{col}")
def tendencia(col: str):
    if df_global is None:
        return {"error": "No hay datos cargados"}

    return medidas_tendencia_central(df_global[col])


# ---------------------------------------------------------
# Dispersión
# ---------------------------------------------------------
@app.get("/dispersion/{col}")
def dispersion(col: str):
    if df_global is None:
        return {"error": "No hay datos cargados"}

    return medidas_dispersión(df_global[col])


# ---------------------------------------------------------
# Distribución Binomial
# ---------------------------------------------------------
@app.get("/binomial")
def binomial(n: int, p: float):
    xs, pmf = binomial_prob(n, p)
    return {"k": xs.tolist(), "pmf": [float(v) for v in pmf]}


# ---------------------------------------------------------
# Distribución Poisson
# ---------------------------------------------------------
@app.get("/poisson")
def poisson(lmbda: float):
    xs, pmf = poisson_prob(lmbda)
    return {"k": xs.tolist(), "pmf": [float(v) for v in pmf]}


# ---------------------------------------------------------
# Distribución Normal
# ---------------------------------------------------------
@app.get("/normal")
def normal(mu: float, sigma: float, a: float, b: float):
    prob = normal_prob_interval(mu, sigma, a, b)
    return {"probabilidad": float(prob)}

from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
def home():
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()