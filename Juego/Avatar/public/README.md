# La Leyenda de Aang: El Avatar

Proyecto desarrollado con **HTML, CSS y JavaScript** como parte de la materia de Programación.

## Descripción

Este juego está inspirado en *La Leyenda de Aang: El Avatar*. El jugador debe seleccionar un personaje y enfrentarse a un enemigo controlado por la computadora.

Una vez seleccionados los personajes, ambos pueden realizar ataques. El resultado de cada combate se determina según las reglas establecidas.

---

## Personajes Disponibles

* 🔥 Zuko
* 🌪️ Aang
* 💧 Katara
* 🌱 Toph

---

## Reglas del Juego

El sistema de combate funciona de manera similar a **Piedra, Papel o Tijera**.

### Ataques disponibles

* 👊 Puñetazo
* 🦵 Patada
* 🧹 Barrida

### Relación entre ataques

| Ataque      | Gana contra |
| ----------- | ----------- |
| 👊 Puñetazo | 🧹 Barrida  |
| 🦵 Patada   | 👊 Puñetazo |
| 🧹 Barrida  | 🦵 Patada   |

### Resultados

* Si ambos jugadores eligen el mismo ataque → **EMPATE**
* Si el ataque del jugador vence al del enemigo → **GANASTE**
* Si el ataque del enemigo vence al del jugador → **PERDISTE**

---

## Tecnologías Utilizadas

* HTML5
* CSS3
* JavaScript

---

# Proceso de Desarrollo

## Objetivos

* Crear la estructura inicial del proyecto.
* Diseñar la interfaz HTML.
* Agregar botones para la interacción del usuario.

### Implementación

* Creación de la pantalla principal.
* Creación de los personajes seleccionables.
* Implementación del botón para seleccionar personaje.

### Tarea

Agregar una estructura de control en la función:

```javascript
seleccionarPersonajeJugador()
```

para identificar el personaje elegido y mostrarlo mediante:

```javascript
alert()
```

---

## Objetivos

* Comprender el uso de `checked`.
* Manipular elementos HTML con JavaScript.
* Introducir `innerHTML`.

### Implementación

* Detección del personaje seleccionado.
* Actualización dinámica de la interfaz.
* Selección aleatoria del personaje enemigo.

### Tarea

Implementar la función:

```javascript
aleatorio()
```

para que la computadora seleccione automáticamente un personaje y muestre su nombre.

---

## Objetivos

* Crear los botones de ataque.
* Asociar eventos a cada botón.
* Implementar la selección del enemigo.

### Implementación

* Botón 👊 Puñetazo
* Botón 🦵 Patada
* Botón 🧹 Barrida
* Generación de ataques enemigos aleatorios.

---

## Objetivos

* Crear mensajes dinámicos.
* Utilizar `createElement()`.
* Utilizar `appendChild()`.
* Reutilizar y refactorizar lógica del juego Piedra, Papel o Tijera.

### Implementación

* Creación de mensajes dinámicos de combate.
* Visualización de resultados.
* Refactorización de la lógica del combate.

### Tarea

Agregar una sección visible con:

* Explicación de las reglas.
* Relación entre ataques.
* Información sobre las vidas del jugador y del enemigo.
* Instrucciones para seleccionar un personaje.

La sección debe ser accesible sin interferir con la jugabilidad.

---

## Estado Actual del Proyecto

### Implementado

* Selección de personaje.
* Selección aleatoria de enemigo.
* Sistema de ataques.
* Sistema de combate.
* Mensajes dinámicos de resultados.
* Generación aleatoria mediante funciones.

### Próximas mejoras

* Sistema de vidas.
* Reinicio de partida.
* Mejoras visuales con CSS.
* Animaciones.
* Contador de victorias.

---

## Nombre del Grupo

**Print("Estoy Cansado Jefe")**

### Integrantes

- Albornoz Gian Franco
- Arreceygor Fabio
- Bruna Roy
- Cisterna Abril
- Fernández Franco
- Fernández Valentín
- Platero Martín
- Ponzina Lautaro
- Nicolás Veloz
- Sat Emir