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

print("Prueba")

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
 
 