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
