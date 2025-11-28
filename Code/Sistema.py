
# Sistema.py - Versión compatible con FastAPI
# Limpieza total de valores numpy → float para evitar errores

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import statsmodels.api as sm
from statsmodels.formula.api import ols
from datetime import datetime

# Normalizar nombres de columnas
def normalize_columns(df):
    df.columns = df.columns.str.strip()
    rename_map = {}

    for c in df.columns:
        lc = c.lower()

        if "venta" in lc:
            rename_map[c] = "Ventas"
        if "unidad" in lc:
            rename_map[c] = "Unidades"
        if "defect" in lc:
            rename_map[c] = "Defectos"
        if "mes" in lc or "fecha" in lc:
            rename_map[c] = "Mes"

    df = df.rename(columns=rename_map)
    return df


# Medidas de tendencia totalmente seguras
def medidas_tendencia_central(series):
    s = series.dropna()

    media = float(s.mean())
    mediana = float(s.median())
    moda = float(s.mode().iloc[0]) if not s.mode().empty else None

    return {
        "media": media,
        "mediana": mediana,
        "moda": moda
    }


# Medidas de dispersión SEGURAS (solo floats)
def medidas_dispersión(series):
    s = series.dropna()

    rango = float(s.max() - s.min())
    varianza = float(s.var(ddof=1))
    desv = float(s.std(ddof=1))
    iqr = float(stats.iqr(s))
    cv = float(desv / s.mean()) if s.mean() != 0 else None

    return {
        "rango": rango,
        "varianza": varianza,
        "desviacion": desv,
        "iqr": iqr,
        "coef_var": cv
    }

   
# Binomial (seguro)  
def binomial_prob(n, p):
    xs = np.arange(0, n + 1)
    pmf = stats.binom.pmf(xs, n, p)

    return xs.tolist(), [float(v) for v in pmf]

  
# Poisson (seguro)  
def poisson_prob(lmbda):
    max_k = max(20, int(lmbda * 3))
    xs = np.arange(0, max_k)
    pmf = stats.poisson.pmf(xs, lmbda)

    return xs.tolist(), [float(v) for v in pmf]


# Normal: intervalo [a, b]
def normal_prob_interval(mu, sigma, a, b):
    prob = stats.norm.cdf(b, mu, sigma) - stats.norm.cdf(a, mu, sigma)
    return float(prob)


# Intervalo de confianza
def intervalo_confianza_media(series, alpha=0.05):
    s = series.dropna()
    n = len(s)

    mu = float(s.mean())
    se = float(s.std(ddof=1) / np.sqrt(n))
    tcrit = float(stats.t.ppf(1 - alpha/2, df=n - 1))

    ci_low = mu - tcrit * se
    ci_high = mu + tcrit * se

    return {
        "media": mu,
        "n": n,
        "se": se,
        "ci_low": float(ci_low),
        "ci_high": float(ci_high)
    }


# Prueba t de 1 muestra
def prueba_t_uno_muestra(series, mu0=0, alpha=0.05):
    s = series.dropna()
    tstat, pvalue = stats.ttest_1samp(s, popmean=mu0)

    return {
        "tstat": float(tstat),
        "pvalue": float(pvalue),
        "rechazar_H0": bool(pvalue < alpha)
    }


# ANOVA compatible
def realizar_anova(df, var, group_var):
    formula = f"{var} ~ C({group_var})"
    model = ols(formula, data=df).fit()
    table = sm.stats.anova_lm(model, typ=2)

    table2 = table.reset_index()
    return table2.to_dict(orient="records")


# Correlación y regresión
def correlacion(df, x, y):
    s = df[[x, y]].dropna()
    r, p = stats.pearsonr(s[x], s[y])
    return {
        "r": float(r),
        "pvalue": float(p)
    }


def regresion_lineal(df, x, y):
    df2 = df[[x, y]].dropna()
    X = sm.add_constant(df2[x])
    model = sm.OLS(df2[y], X).fit()

    return {
        "coeficientes": {str(k): float(v) for k, v in model.params.items()},
        "r2": float(model.rsquared)
    }
    
    