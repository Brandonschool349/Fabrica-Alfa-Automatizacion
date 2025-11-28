 
# API Oficial de Fábrica Alfa (Backend del Sistema)

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import pandas as pd
import io

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

 
# CORS
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

 
# VARIABLE GLOBAL
 
df_global = None


 
# CORRECCIÓN PRINCIPAL
def reparar_tipos(df):
    """
    Intenta convertir columnas que parecen numéricas a tipos numéricos,
    sin usar errors='ignore' (evita FutureWarning).
    """
    for col in df.columns:
        try:
            # intentamos convertir; si falla, dejamos la columna como está
            df[col] = pd.to_numeric(df[col])
        except Exception:
            # no hacemos nada si no es convertible
            pass
    return df

 
# CARGA DE ARCHIVO
 
@app.post("/cargar")
async def cargar(archivo: UploadFile = File(...)):
    global df_global

    raw = await archivo.read()

    try:
        if archivo.filename.lower().endswith(".csv"):
            df_global = pd.read_csv(io.BytesIO(raw))
        elif archivo.filename.lower().endswith((".xlsx", ".xls")):
            df_global = pd.read_excel(io.BytesIO(raw))
        else:
            return {"error": "Formato no soportado"}
    except Exception as e:
        return {"error": f"Error leyendo archivo: {str(e)}"}

    # Normalizar columnas
    df_global.columns = df_global.columns.str.strip()
    df_global = normalize_columns(df_global)

    df_global = df_global.rename(columns={
    "Responsable de producción": "Responsible",
    "Responsable producción": "Responsible",
    "Responsable": "Responsible"
})

    # Eliminar columnas duplicadas
    df_global = df_global.loc[:, ~df_global.columns.duplicated()]

    # Rellenar NaN SOLO en texto
    for col in df_global.select_dtypes(include="object").columns:
        df_global[col] = df_global[col].fillna("")

    # Reparar columnas numéricas convertidas a texto
    df_global = reparar_tipos(df_global)

    # Quitar comas en números → "125,400" → "125400"
    for col in df_global.columns:
        if df_global[col].dtype == object:
            df_global[col] = df_global[col].astype(str).str.replace(",", "", regex=False)

    # Convertir automáticamente a número cuando se pueda
    for col in df_global.columns:
        try:
            df_global[col] = pd.to_numeric(df_global[col])
        except:
            pass

    # Convertir Mes en categórica si existe
    if "Mes" in df_global.columns:
        df_global["Mes"] = df_global["Mes"].astype("category")

     
    # DETECTAR TIPOS PARA ANOVA / REGRESIÓN / CORRELACIÓN
     
    types = {}
    for col in df_global.columns:
        if pd.api.types.is_numeric_dtype(df_global[col]):
            types[col] = "number"
        else:
            types[col] = "string"

     
    # CREAR SAMPLE SEGURO PARA JSON
     
    safe_df = df_global.astype(object).where(pd.notnull(df_global), None)
    sample = safe_df.head(8).to_dict(orient="records")

    return {
        "mensaje": "Archivo cargado correctamente",
        "columnas": list(df_global.columns),
        "registros": len(df_global),
        "muestra": sample,
        "columnTypes": types
    }

 
# TENDENCIA
 
@app.get("/tendencia/{col}")
def tendencia(col: str):
    if df_global is None:
        return {"error": "No hay datos cargados"}
    return medidas_tendencia_central(df_global[col])


 
# DISPERSIÓN
 
@app.get("/dispersion/{col}")
def dispersion(col: str):
    if df_global is None:
        return {"error": "No hay datos cargados"}
    return medidas_dispersión(df_global[col])


 
# ANOVA
 
@app.post("/anova")
async def anova_api(payload: dict):
    import pandas as pd
    import numpy as np

    rows = payload.get("data")
    var = payload.get("var")
    group = payload.get("group_var")

    if rows is None:
        return {"error": "No hay datos enviados"}

     
    #  DETECCIÓN AUTOMÁTICA DEL FORMATO RECIBIDO
     

    try:
        # Caso 1: lista de diccionarios (lo ideal)
        if isinstance(rows[0], dict):
            df = pd.DataFrame(rows)

        # Caso 2: lista de listas (tu frontend usa ESTO)
        else:
            header = rows[0]                 # primera fila = encabezados
            data = rows[1:]                  # resto = datos
            df = pd.DataFrame(data, columns=header)

        print("COLUMNAS REALES:", df.columns.tolist())

        # Normalizar encabezados
        df.columns = (
            df.columns.astype(str)
                       .str.strip()
                       .str.normalize('NFKC')
        )

        # Convertir grupo (categoría) correctamente
        df[group] = df[group].astype("category")

    except Exception as e:
        return {"error": f"Formato de datos inválido: {str(e)}"}

     
    # Ejecutar ANOVA
     
    try:
        salida = realizar_anova(df, var, group)

         
        # FIX CRÍTICO → Convertir NaN / inf a None (JSON safe)
         
        def fix_json(obj):
            if isinstance(obj, float) and (np.isnan(obj) or np.isinf(obj)):
                return None
            if isinstance(obj, dict):
                return {k: fix_json(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [fix_json(x) for x in obj]
            return obj

        return fix_json(salida)

    except Exception as e:
        return {"error": str(e)}


    
 
# (Los demás endpoints quedan igual)

@app.get("/columnas_numericas")
def columnas_numericas():
    if df_global is None:
        return {"error": "No hay datos cargados"}
    num_cols = df_global.select_dtypes(include="number").columns.tolist()
    return {"numericas": num_cols}


@app.get("/correlacion")
def correlacion_api(x: str, y: str):
    if df_global is None:
        return {"error": "No hay datos cargados"}
    return correlacion(df_global, x, y)


@app.get("/regresion")
def regresion_api(x: str, y: str):
    if df_global is None:
        return {"error": "No hay datos cargados"}
    return regresion_lineal(df_global, x, y)


@app.get("/dataarray/{col}")
def dataarray(col: str):
    if df_global is None:
        return {"error": "No hay datos cargados"}
    return df_global[col].dropna().tolist()

 
# BINOMIAL
 
@app.get("/binomial")
def binomial_api(n:int, p:float):
    import math

    k_vals = list(range(n+1))
    pmf_vals = [
        math.comb(n, k) * (p**k) * ((1-p)**(n-k))
        for k in k_vals
    ]

    media = n * p
    varianza = n * p * (1-p)

    return {
        "k": k_vals,
        "pmf": pmf_vals,
        "media": media,
        "varianza": varianza
    }

 
# SERVIR WEB
 
WEB_PATH = r"C:\Estadistica y probabilidad para ciencia de datos\Fabrica Alfa\Web"
app.mount('/web', StaticFiles(directory=WEB_PATH), name='web')


@app.get("/", response_class=HTMLResponse)
def home():
    return FileResponse(WEB_PATH + r"\index.html")


@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    if username == "admin" and password == "123":
        return {"success": True}
    return {"success": False, "mensaje": "Usuario o contraseña incorrectos"}
