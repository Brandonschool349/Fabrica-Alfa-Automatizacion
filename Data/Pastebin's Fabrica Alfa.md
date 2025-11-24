Pastebin's Fabrica Alfa



Correlación base de datos

library(ggplot2)
 
ventas <- c(1.254, 1.308, 1.552, 1.185, 1.22, 1.4075, 1.383, 1.476,
            1.5325, 1.609, 1.582, 1.497, 1.65, 1.705, 1.85, 1.208,
            1.253, 1.439, 1.462, 1.528, 1.589, 1.664, 1.702, 1.785)
 
produccion <- c(122, 130, 156, 115, 118, 135, 134, 142,
                148, 155, 152, 144, 162, 168, 182, 117,
                121, 138, 141, 147, 153, 160, 165, 173)
 
df <- data.frame(ventas, produccion)
 
ggplot(df, aes(x = ventas, y = produccion)) +
  geom_point(color = "steelblue", size = 3) +
  geom_smooth(method = "lm", se = FALSE, color = "red", size = 1.5) +
  ggtitle("Correlación entre Ventas y Unidades Producidas") +
  xlab("Ventas (miles de MXN)") +
  ylab("Unidades producidas (miles)") +
  theme_minimal()
 
----------------------------------------

Tabla de los 12 empleados / Estadística

employer_vector <- c( "ID", "Nombre del empleado", "Años en la empresa", "Empresas en las que ha trabajado",
"Turno", "E001", "Ana Martínez", "0.7", "1", "Mañana",
  "E002", "Luis Hernández", "1.3", "2", "Tarde",
  "E003", "Sofía López", "3.2", "2", "Noche",
  "E004", "Carlos Ramírez", "2.0", "2", "Mañana",
  "E005", "Julia Torres", "0.4", "1", "Tarde",
  "E006", "Miguel Sánchez", "4.5", "1", "Noche",
  "E007", "Valeria Gómez", "1.1", "2", "Mañana",
  "E008", "Diego Cruz", "2.7", "3", "Tarde",
  "E009", "Fernanda Morales", "5.1", "5", "Noche",
  "E010", "Ricardo Pérez", "0.9", "1", "Mañana",
  "E011", "Andrea Castillo", "3.8", "3", "Tarde",
  "E012", "Javier Domínguez", "1.9", "2", "Noche")
employer_vector
 
employer_array <- array(employer_vector, dim = c(5,13))
employer_array

--------------------------

Frecuencias

frecuencias <- c(4, 2, 1, 2, 1, 1)
 
etiquetas_clases <- c("0-1", "(1-2)", "(2-3)", "(3-4)", "(4-5)", "(5-6)")
 
colores <- c("darkblue", "green", "purple", "red", "gold", "black")
 
grafico <- barplot(frecuencias,
                   names.arg = etiquetas_clases,
                   col = colores,
                   main = "Distribución de años en la empresa",
                   xlab = "Años en la empresa (Intervalos)",
                   ylab = "Frecuencia",
                   ylim = c(0, 4.5))
 
 
text(x = grafico, 
     y = frecuencias,
     labels = frecuencias,
     pos = 3, 
     offset = 0.5, 
     cex = 1) 

----------------------------------

Probabilidad Básica

library(ggplot2)
install.packages("patchwork")
library(patchwork)
 
vals <- data.frame(
  categoria = c(
    "1) < 3 empresas",
    "2) 2 empresas",
    "3) >1 año",
    "4) >1 año y >2 empresas"
  ),
  cumple = c(7, 4, 8, 5)
)
 
pastel_data <- function(categoria, cumple){
  data.frame(
    grupo = c("Cumple", "No cumple"),
    valor = c(cumple, 12 - cumple),
    categoria = categoria
  )
}
 
d1 <- pastel_data(vals$categoria[1], vals$cumple[1])
d2 <- pastel_data(vals$categoria[2], vals$cumple[2])
d3 <- pastel_data(vals$categoria[3], vals$cumple[3])
d4 <- pastel_data(vals$categoria[4], vals$cumple[4])
 
grafico_pastel <- function(df, colores){
  ggplot(df, aes(x = "", y = valor, fill = grupo)) +
    geom_bar(stat = "identity", width = 1) +
    coord_polar("y") +
    scale_fill_manual(values = colores) +
    theme_void() +
    geom_text(aes(label = paste0(round(valor/12*100), "%")),
              position = position_stack(vjust = 0.5),
              color = "white",
              size = 5) +
    ggtitle(unique(df$categoria))
}
 
col1 <- c("Cumple"="#2EC4B6", "No cumple"="grey60")
col2 <- c("Cumple"="#1F78B4", "No cumple"="grey60")
col3 <- c("Cumple"="#00BFA5", "No cumple"="grey60")
col4 <- c("Cumple"="#7986CB", "No cumple"="grey60")
 
g1 <- grafico_pastel(d1, col1)
g2 <- grafico_pastel(d2, col2)
g3 <- grafico_pastel(d3, col3)
g4 <- grafico_pastel(d4, col4)
 
library(patchwork)
(g1 | g2) / (g3 | g4)
 
----------------------------------------

Probabilidad de riesgos

riesgos <- c("Fallo en\nSensores/BD",
             "Resistencia\nal Cambio",
             "Capacitación\nInsuficiente",
             "Sobrecostos\nTecnológicos")
 
probabilidad <- c("Media", "Alta", "Media", "Baja")
valores <- ifelse(probabilidad == "Alta", 1.00,
                  ifelse(probabilidad == "Media", 0.50, 0.25))
colores <- ifelse(probabilidad == "Alta", "red3",
                  ifelse(probabilidad == "Media", "gold", "green3"))
 
bp <- barplot(valores,
              names.arg = riesgos,
              col = colores,
              main = "Probabilidad de Riesgos del Proyecto (%)",
              xlab = "Riesgos",
              ylab = "Probabilidad",
              ylim = c(0,1.2),
              las = 1)
text(x = bp,
     y = valores + 0.05,
     labels = paste0(valores*100, "%"),
     cex = 1)
 