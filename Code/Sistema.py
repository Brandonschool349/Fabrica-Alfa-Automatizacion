# sistema.py - Prototipo de sistema estadístico y demo para Fábrica Alfa con la finalidad de ser mostrado a empresarios.
# Incluira:
# - Interfaz de usuario (CLI)
# - Carga de datos (Excel/CSV)
# - Estadísticas descriptivas y medidas de tendencia central y dispersión
# - Distribuciones: Binomial, Poisson, Normal
# - Intervalos de confianza
# - Pruebas de hipótesis (tests)
# - ANOVA
# - Correlación y regresión lineal
# - Visualizaciones básicas (matplotlib / seaborn)
# - Exportación de resultados a CSV y PNG
#
# Versión: 0.1
# Fecha: 2024-06-15
# Autores: Equipo Fábrica Alfa (prototipo académico) Brandon Pedraza, Emilio Zuñiga, Juan Pablo, David Alejandro, Daniel

import os
import sys
import zipfile
from datetime import datetime
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import statsmodels.api as sm
from statsmodels.formula.api import ols
 
plt.style.use('default')

# Configuración / Usuario

DATA_DEFAULT = "Data/Base_FabricaAlfa.xlsx"  # Cambia si tu archivo tiene otro nombre
OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)
 
USERS = {
    "admin": "fabrica2025",
    "supervisor": "control123"
}
 

# Utilidades de I/O y helpers

def safe_print(s=''):
    print(s)
 
def load_data(path=DATA_DEFAULT):
    """Intenta cargar excel o csv; devuelve DataFrame."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Archivo no encontrado: {path}")
    ext = os.path.splitext(path)[1].lower()
    if ext in ['.xlsx', '.xls']:
        df = pd.read_excel(path, engine='openpyxl')
    elif ext == '.csv':
        df = pd.read_csv(path)
    else:
        raise ValueError("Formato no soportado. Use .xlsx o .csv")
    return df
 
def normalize_columns(df):
    """Trata de estandarizar nombres de columnas comunes que usamos."""
    rename_map = {}
    cols = [c.strip() for c in df.columns]
    for c in cols:
        lc = c.lower()
        if 'venta' in lc and 'unid' not in lc:
            rename_map[c] = 'Ventas'
        if 'unidad' in lc or 'unidades' in lc:
            rename_map[c] = 'Unidades'
        if 'defect' in lc:
            rename_map[c] = 'Defectos'
        if 'mes' in lc or 'fecha' in lc:
            rename_map[c] = 'Mes'
        if 'turno' in lc:
            rename_map[c] = 'Turno'
    if rename_map:
        df = df.rename(columns=rename_map)
    return df
 
def save_fig(fig, name):
    path = os.path.join(OUTPUT_DIR, name)
    fig.savefig(path, bbox_inches='tight', dpi=150)
    return path
 
def export_df(df, name):
    path = os.path.join(OUTPUT_DIR, name)
    df.to_csv(path, index=False)
    return path
 
# Estadística descriptiva
def medidas_tendencia_central(series):
    s = series.dropna()
    media = s.mean()
    mediana = s.median()
    try:
        moda = s.mode().iloc[0]
    except Exception:
        moda = np.nan
    return {'media': media, 'mediana': mediana, 'moda': moda}
 
def medidas_dispersión(series):
    s = series.dropna()
    rango = s.max() - s.min()
    varianza = s.var(ddof=1)  # muestra
    desv = s.std(ddof=1)
    iqr = stats.iqr(s)
    cv = desv / s.mean() if s.mean() != 0 else np.nan
    return {'rango': rango, 'varianza': varianza, 'desviacion': desv, 'iqr': iqr, 'coef_var': cv}
 
# Distribuciones
def binomial_prob(n, p, k=None):
    """Si k es None devuelve PMF para todos, si k especificado devuelve PMF(k) y CDF(k)."""
    if k is None:
        xs = np.arange(0, n+1)
        pmf = stats.binom.pmf(xs, n, p)
        return xs, pmf
    else:
        pmf_k = stats.binom.pmf(k, n, p)
        cdf_k = stats.binom.cdf(k, n, p)
        return pmf_k, cdf_k
 
def poisson_prob(lmbda, k=None):
    if k is None:
        xs = np.arange(0, max(20, int(lmbda*3)))
        pmf = stats.poisson.pmf(xs, lmbda)
        return xs, pmf
    else:
        pmf_k = stats.poisson.pmf(k, lmbda)
        cdf_k = stats.poisson.cdf(k, lmbda)
        return pmf_k, cdf_k
 
def normal_prob_interval(mu, sigma, a, b):
    """P(X in [a,b]) para N(mu,sigma)"""
    return stats.norm.cdf(b, mu, sigma) - stats.norm.cdf(a, mu, sigma)
 
# Inferencia: IC y pruebas
def intervalo_confianza_media(sample, alpha=0.05):
    s = sample.dropna()
    n = len(s)
    mu = s.mean()
    se = s.std(ddof=1) / np.sqrt(n)
    tcrit = stats.t.ppf(1 - alpha/2, df=n-1)
    ci = (mu - tcrit*se, mu + tcrit*se)
    return {'media': mu, 'n': n, 'se': se, 'ci': ci}
 
def prueba_t_uno_muestra(sample, mu0=0, alpha=0.05):
    s = sample.dropna()
    tstat, pval = stats.ttest_1samp(s, popmean=mu0)
    return {'tstat': tstat, 'pvalue': pval, 'rechazar': pval < alpha}
 
# ANOVA
def realizar_anova(df, var, group_var):
    formula = f'{var} ~ C({group_var})'
    model = ols(formula, data=df).fit()
    anova_table = sm.stats.anova_lm(model, typ=2)
    return model, anova_table
 
# Regresión y correlación
def regresion_lineal(df, x_col, y_col):
    df2 = df[[x_col, y_col]].dropna()
    X = sm.add_constant(df2[x_col])
    model = sm.OLS(df2[y_col], X).fit()
    return model
 
def correlacion(df, x_col, y_col):
    s = df[[x_col, y_col]].dropna()
    r, p = stats.pearsonr(s[x_col], s[y_col])
    return {'r': r, 'pvalue': p}
 
# Visualizaciones
def plot_histograma(series, title, fname):
    fig, ax = plt.subplots(figsize=(7,4))
    sns.histplot(series.dropna(), kde=True, ax=ax)
    ax.set_title(title)
    path = save_fig(fig, fname)
    plt.close(fig)
    return path
 
def plot_pastel(freq_series, title, fname):
    fig, ax = plt.subplots(figsize=(6,6))
    freq_series.value_counts().plot.pie(autopct='%1.1f%%', ax=ax)
    ax.set_ylabel('')
    ax.set_title(title)
    path = save_fig(fig, fname)
    plt.close(fig)
    return path
 
def plot_scatter_with_regression(df, x_col, y_col, fname):
    fig, ax = plt.subplots(figsize=(7,5))
    sns.regplot(x=x_col, y=y_col, data=df, ax=ax)
    ax.set_title(f'{y_col} vs {x_col}')
    path = save_fig(fig, fname)
    plt.close(fig)
    return path

# Simulación de captura automática (sensor) - placeholder

def captura_automatica_simulada(df, unidades_producidas_col='Unidades'):
    """Simula añadir un registro (nueva fila) al DataFrame como si viniera de sensores."""
    now = datetime.now()
    sample_row = df.iloc[-1].copy() if not df.empty else {}
    # Cambia fecha/mes
    sample_row['Mes'] = now.strftime('%Y-%m')
    # Simula pequeña variación
    if unidades_producidas_col in sample_row:
        sample_row[unidades_producidas_col] = int(sample_row[unidades_producidas_col] * (1 + np.random.uniform(-0.03, 0.05)))
    return sample_row

# Función principal: menú
def main_menu():
    df = None
    authenticated = False
    username = None
    safe_print("\n=== Sistema prototipo: Fábrica Alfa (Analítica) ===\n")
    while True:
        safe_print("\nMenú principal:")
        safe_print("1) Iniciar sesión")
        safe_print("2) Cargar datos (Excel/CSV)")
        safe_print("3) Estadísticas descriptivas (ventas / unidades)")
        safe_print("4) Medidas de dispersión")
        safe_print("5) Distribuciones: Binomial / Poisson / Normal")
        safe_print("6) Intervalos de confianza y pruebas de hipótesis")
        safe_print("7) ANOVA")
        safe_print("8) Correlación y regresión")
        safe_print("9) Visualizaciones (guardar PNG)")
        safe_print("10) Simular captura automática (sensor) y añadir registro")
        safe_print("11) Exportar resumen y empaquetar reporte")
        safe_print("12) Salir")
        option = input("Seleccione opción: ").strip()
 
        if option == '1':
            username = input("Usuario: ").strip()
            pwd = input("Contraseña: ").strip()
            if username in USERS and USERS[username] == pwd:
                authenticated = True
                safe_print(f"Autenticado como {username}")
            else:
                safe_print("Credenciales inválidas.")
 
        elif option == '2':
            path = input(f"Ruta del archivo [{DATA_DEFAULT}]: ").strip() or DATA_DEFAULT
            try:
                df = load_data(path)
                df = normalize_columns(df)
                safe_print(f"Datos cargados. Filas: {len(df)} Columnas: {len(df.columns)}")
                safe_print("Columnas detectadas: " + ", ".join(df.columns))
            except Exception as e:
                safe_print(f"Error al cargar: {e}")
 
        elif option == '3':
            if df is None:
                safe_print("Carga primero los datos (opción 2).")
                continue
            # Detectar columna de ventas/unidades
            venta_col = next((c for c in df.columns if 'Venta' in c or 'Ventas' in c or 'venta' in c), None)
            unidades_col = next((c for c in df.columns if 'Unidades' in c or 'unidad' in c.lower()), None)
            if venta_col is None or unidades_col is None:
                safe_print("No se encontraron columnas 'Ventas' o 'Unidades'. Revisa nombres en tu archivo.")
                safe_print("Columnas: " + ", ".join(df.columns))
                continue
            safe_print("-- Ventas --")
            t_ventas = medidas_tendencia_central(df[venta_col])
            safe_print(t_ventas)
            safe_print("-- Unidades --")
            t_unidades = medidas_tendencia_central(df[unidades_col])
            safe_print(t_unidades)
            # Guardar resumen
            pd.DataFrame({'Ventas': t_ventas, 'Unidades': t_unidades}).to_csv(os.path.join(OUTPUT_DIR, 'resumen_tendencia.csv'))
 
        elif option == '4':
            if df is None:
                safe_print("Carga datos primero.")
                continue
            unidades_col = next((c for c in df.columns if 'Unidades' in c or 'unidad' in c.lower()), None)
            if unidades_col is None:
                safe_print("No se encontró columna de Unidades.")
                continue
            disp = medidas_dispersión(df[unidades_col])
            safe_print("Medidas de dispersión para Unidades:")
            safe_print(disp)
            # Guardar
            pd.Series(disp).to_csv(os.path.join(OUTPUT_DIR, 'dispersión_unidades.csv'))
 
        elif option == '5':
            if df is None:
                safe_print("Carga datos primero.")
                continue
            safe_print("a) Binomial")
            safe_print("b) Poisson")
            safe_print("c) Normal")
            sub = input("Elija (a/b/c): ").strip().lower()
            if sub == 'a':
                n = int(input("Número de ensayos n (ej. tamaño de muestra por lote): "))
                p = float(input("Probabilidad de éxito p (ej. tasa de defecto por unidad): "))
                k = input("Número exacto k (enter) o dejar vacío para ver toda la pmf: ").strip()
                if k == '':
                    xs, pmf = binomial_prob(n, p)
                    dfpmf = pd.DataFrame({'k': xs, 'pmf': pmf})
                    export_df(dfpmf, 'binomial_pmf.csv')
                    safe_print(f"PMF guardada en output/binomial_pmf.csv")
                else:
                    k = int(k)
                    pmf_k, cdf_k = binomial_prob(n, p, k)
                    safe_print(f"P(X={k})={pmf_k:.6f} ; P(X<={k})={cdf_k:.6f}")
            elif sub == 'b':
                l = float(input("λ (tasa media de eventos por periodo): "))
                k = input("k exacto (enter para PMF completo): ").strip()
                if k == '':
                    xs, pmf = poisson_prob(l)
                    export_df(pd.DataFrame({'k': xs, 'pmf': pmf}), 'poisson_pmf.csv')
                    safe_print("PMF Poisson guardada en output/poisson_pmf.csv")
                else:
                    k = int(k)
                    pmf_k, cdf_k = poisson_prob(l, k)
                    safe_print(f"P(X={k})={pmf_k:.6f} ; P(X<={k})={cdf_k:.6f}")
            elif sub == 'c':
                venta_col = next((c for c in df.columns if 'Venta' in c or 'Ventas' in c or 'venta' in c), None)
                if venta_col is None:
                    safe_print("No se encontró columna de Ventas.")
                    continue
                s = df[venta_col].dropna()
                mu, sigma = s.mean(), s.std(ddof=1)
                a = float(input("Límite inferior a: "))
                b = float(input("Límite superior b: "))
                prob = normal_prob_interval(mu, sigma, a, b)
                safe_print(f"P({a} ≤ X ≤ {b}) = {prob:.6f} (N({mu:.1f},{sigma:.1f}))")
            else:
                safe_print("Opción inválida.")
 
        elif option == '6':
            if df is None:
                safe_print("Carga datos primero.")
                continue
            venta_col = next((c for c in df.columns if 'Venta' in c or 'Ventas' in c or 'venta' in c), None)
            if venta_col is None:
                safe_print("No se encontró columna de Ventas.")
                continue
            # IC para media
            ic = intervalo_confianza_media(df[venta_col])
            safe_print("Intervalo de confianza (95%) para la media de ventas:")
            safe_print(ic)
            # Prueba de hipótesis (media = valor histórico)
            mu0 = float(input("Probar H0: media = (introduce valor de referencia): "))
            test = prueba_t_uno_muestra(df[venta_col], mu0=mu0)
            safe_print("Prueba t (1 muestra):")
            safe_print(test)
 
        elif option == '7':
            if df is None:
                safe_print("Carga datos primero.")
                continue
            safe_print("ANOVA: compara medias entre grupos")
            safe_print("Columnas disponibles: " + ", ".join(df.columns))
            var = input("Variable numérica (ej. Ventas): ").strip()
            group = input("Variable categórica (ej. Cliente o Turno): ").strip()
            if var not in df.columns or group not in df.columns:
                safe_print("Columnas inválidas.")
                continue
            model, table = realizar_anova(df, var, group)
            safe_print("Tabla ANOVA:")
            safe_print(table)
            export_df(table.reset_index(), 'ANOVA_table.csv')
 
        elif option == '8':
            if df is None:
                safe_print("Carga datos primero.")
                continue
            safe_print("Regresión y correlación")
            safe_print("Columnas: " + ", ".join(df.columns))
            x = input("Variable predictora (x) (ej. Unidades): ").strip()
            y = input("Variable respuesta (y) (ej. Ventas): ").strip()
            if x not in df.columns or y not in df.columns:
                safe_print("Columnas inválidas.")
                continue
            corr = correlacion(df, x, y)
            safe_print(f"Correlación r={corr['r']:.4f} (p={corr['pvalue']:.4f})")
            model = regresion_lineal(df, x, y)
            safe_print(model.summary())
            # Guardar coeficientes
            coef_df = pd.DataFrame({'coef': model.params})
            export_df(coef_df.reset_index(), 'regression_coef.csv')
            # Gráfico
            plot_scatter_with_regression(df, x, y, 'scatter_regression.png')
            safe_print("Gráfico guardado en output/scatter_regression.png")
 
        elif option == '9':
            if df is None:
                safe_print("Carga datos primero.")
                continue
            # Histograma ventas
            venta_col = next((c for c in df.columns if 'Venta' in c or 'Ventas' in c), None)
            unidades_col = next((c for c in df.columns if 'Unidades' in c or 'unidad' in c.lower()), None)
            if venta_col:
                p1 = plot_histograma(df[venta_col], 'Histograma de Ventas', 'hist_ventas.png')
                safe_print("Histograma ventas:", p1)
            if unidades_col:
                p2 = plot_histograma(df[unidades_col], 'Histograma de Unidades', 'hist_unidades.png')
                safe_print("Histograma unidades:", p2)
            # Pastel: empresas en las que han trabajado (si existe)
            if 'Empresas en las que ha trabajado' in df.columns:
                p3 = plot_pastel(df['Empresas en las que ha trabajado'], 'Empresas previas', 'pastel_empresas.png')
                safe_print("Gráfico pastel guardado en:", p3)
 
        elif option == '10':
            if df is None:
                safe_print("Carga datos primero.")
                continue
            safe_print("Simulando captura automática desde sensor...")
            nueva = captura_automatica_simulada(df)
            # Convertir a DF y anexar
            df = df.append(nueva, ignore_index=True)
            export_df(df, 'base_actualizada.csv')
            safe_print("Nuevo registro agregado y base actualizada guardada en output/base_actualizada.csv")
 
        elif option == '11':
            # Generar resumen y empaquetar en zip
            safe_print("Generando resumen de salida y empaquetando...")
            files = []
            for f in os.listdir(OUTPUT_DIR):
                files.append(os.path.join(OUTPUT_DIR, f))
            zipname = os.path.join(OUTPUT_DIR, f"reporte_fabrica_alfa_{datetime.now().strftime('%Y%m%d_%H%M')}.zip")
            with zipfile.ZipFile(zipname, 'w') as zf:
                for f in files:
                    zf.write(f, arcname=os.path.basename(f))
            safe_print("Reporte empaquetado en:", zipname)
 
        elif option == '12':
            safe_print("Saliendo.")
            break
 
        else:
            safe_print("Opción inválida. Intenta de nuevo.")
 
if __name__ == "__main__":
    main_menu()
 
 