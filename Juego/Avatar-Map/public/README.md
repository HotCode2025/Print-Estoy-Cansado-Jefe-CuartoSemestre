# La Leyenda de Aang: El Avatar

Proyecto desarrollado con **HTML, CSS y JavaScript** como parte de la materia de Programación.

## Descripción

Este juego está inspirado en *La Leyenda de Aang: El Avatar*. Primero se elige un personaje, luego se recorre una arena para elegir con quién combatir y finalmente se juega un duelo por turnos.

La arena dibujada en un canvas muestra a los demás personajes disponibles. El jugador se mueve con las flechas o con los controles de pantalla; al colisionar con un personaje, ese pasa a ser su rival. El combate es al mejor de tres rondas.

---

## Personajes Disponibles

* 🔥 Zuko
* 🌪️ Aang
* 💧 Katara
* 🌱 Toph

---

## Reglas del Juego

El combate es un duelo **por turnos**, al mejor de tres rondas.

### Jugar online en la misma red

1. En la carpeta `Juego/Avatar-Map`, instalá las dependencias una sola vez con `npm install`.
2. Iniciá el servidor con `npm start` y dejá la terminal abierta. Sirve el juego y coordina las salas en el puerto `5173`.
3. En la computadora que ejecuta el servidor, buscá la dirección IPv4 de Wi-Fi con `ipconfig`. En ambos dispositivos abrí `http://IP-DE-LA-COMPUTADORA:5173/`; por ejemplo, `http://192.168.1.25:5173/`.
4. En un dispositivo, elegí **Crear sala**. En el otro, escribí el código de seis caracteres y elegí **Unirme**.
5. Cada jugador elige un personaje y confirma. El duelo empieza cuando ambos están listos; cada uno elige sus ataques desde su propio dispositivo.

Permití Node.js en la red privada si Windows Firewall lo solicita. Los dos dispositivos deben poder conectarse a la computadora que ejecuta el servidor. El modo contra la computadora sigue disponible cuando no se crea ni se une a una sala. Este servidor está pensado para una red local confiable: no abras ni reenvíes su puerto hacia Internet.

### Cómo se juega

1. Elegís un personaje y entrás a la arena, donde aparecen los demás personajes disponibles.
2. Movés tu luchador con las flechas o los botones de dirección y elegís a quién desafiar al tocarlo.
3. Al hacer contacto empieza el duelo: elegís uno de tus cuatro ataques y el rival elige el suyo sin ver tu elección.
4. Los golpes se resuelven por velocidad, gastan energía y la definitiva queda en recarga.
5. Gana la ronda quien deja al otro en 0 de vida. Si la ronda llega a 24 turnos, la cierra quien tenga más vida (con la misma vida es empate). La partida la gana quien suma primero dos rondas (o más rondas cuando se agotan las tres).

### Ataques

Cada nación tiene su propio kit de cuatro ataques, con costo 0 / 1 / 2 / 4 de energía. Los botones muestran el costo, el daño real y una flecha cuando la rueda elemental juega a favor (↑) o en contra (↓).

### Rueda elemental

```text
Agua → Fuego → Aire → Tierra → Agua
```

Ventaja ×1.5, desventaja ×0.75.

### Reloj del turno

Tenés 12 segundos por turno. Si se agota, se ejecuta el ataque básico (el de costo 0).

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

* Selección de personaje y elección del rival mediante colisión en el mapa.
* Arena en canvas con los personajes disponibles, movimiento con flechas y botones, detección de colisión y selección del rival al tocarlo.
* Duelo por turnos con vida de 100, energía, kits por nación y rueda elemental.
* Partida al mejor de tres rondas, con reloj de turno y animación de cada golpe.
* Cierre de partida con cartel final en la arena, cartas por luchador, ranking persistente con racha y reinicio limpio.

### Próximas mejoras

* Sonido.
* Más naciones y ataques.
* Endpoints y host en LAN para jugar con otros (opcional, a decidir).

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

---

## Mapa del encuentro (clases 9, 10 y 11)

- La sección `ver-mapa` muestra un canvas de 800x600 (responsive) donde aparecen tu personaje y su rival.
- El fondo rota al azar entre tres imágenes y cubre el canvas sin deformarse (*cover*).
- Cada personaje guarda en la clase `Personaje` su posición (`x`, `y`), el cuadro donde se dibuja (`ancho`, `alto`), su velocidad (`velocidadX`, `velocidadY`) y su propia imagen del mapa (`mapaFoto`).
- **Clase 10:** los botones Arriba / Abajo / Izquierda / Derecha mueven mientras se mantienen apretados: `mousedown` fija la dirección y `mouseup` o `mouseleave` la sueltan.
- **Clase 11:** las flechas del teclado mueven al personaje con `keydown` y `keyup` sobre `window`.
- Ambas entradas comparten el mismo estado de velocidad, así que no hay lógica de movimiento duplicada.
- Al soltar una tecla en diagonal el otro eje sigue avanzando (no se frena el movimiento entero).
- El dibujo corre en un solo loop de `requestAnimationFrame` escalado por el tiempo real entre cuadros: la velocidad es la misma en pantallas de 60, 120 o 144 Hz.
- La imagen se encaja en su cuadro manteniendo la proporción, y el personaje no puede salirse del canvas.
- Al reiniciar la partida se cortan el loop y los listeners, así no se duplican los movimientos.
- Si la imagen no carga, se dibuja un marcador con `fillRect` en su lugar.

### La arena es el juego

El canvas tiene tres fases. El movimiento con flechas no desaparece: es la fase de acercamiento.

1. **Acercamiento.** Elegís personaje y entrás a la arena. Movés tu luchador con las flechas o los botones hasta llegar al rival.
2. **Anuncio.** Al hacer contacto se frena el movimiento y entra el cartel `ROUND 1` (1,1 s). Los controles de dirección se ocultan.
3. **Duelo.** Terminado el cartel se habilitan los ataques y arranca la primera ronda. En el duelo las flechas ya no mueven al personaje: se juega por turnos.

Durante el acercamiento y el duelo, el HUD se dibuja sobre el canvas con `fillText`:

- el nombre de cada luchador sobre su barra;
- la barra de vida roja de 0 a 100, con el número de vida adentro, que baja suavemente y destella al recibir un golpe;
- los pips de energía (0 a 5) debajo de la barra, que se llenan desde el borde exterior hacia el centro;
- los estados activos como etiquetas (`QUEMADURA 2` es "quedan dos turnos");
- el número de ronda entre las dos barras, el reloj del turno justo debajo y el contador de rondas ganadas (`RONDAS 1 - 0`);
- el cartel `ROUND 1` / `K.O.` / `TIEMPO`, que entra creciendo y se desvanece.

El marcador del HTML sigue existiendo, pero oculto a la vista: repite los nombres y las rondas ganadas, y los lectores de pantalla lo siguen leyendo.

### Motor de turnos

`public/js/motor.js` es el combate nuevo, separado del dibujo. No conoce el DOM, no usa azar y no guarda nada: recibe un estado y devuelve el resultado. Por eso se puede probar sin abrir el navegador.

Reglas que implementa:

- Vida 100 por luchador.
- Energía de 0 a 5: arranca en 0 y sube 1 al empezar cada turno. La primera ronda solo permite el ataque de costo 0.
- Cuatro ataques con costo 0 / 1 / 2 / 4. La definitiva recarga 3 turnos y vuelve a estar disponible recién en el turno + 4.
- Los dos eligen a la vez, sin ver la elección del otro.
- Se resuelve ordenado por velocidad: el más rápido golpea primero y, si deja al otro sin vida, el golpe del lento no llega. Con la misma velocidad empieza el jugador.

```js
const duelo = Motor.crearDuelo({ jugador: { id: "Zuko", velocidad: 20 }, enemigo: { id: "Toph", velocidad: 5 } })
Motor.elegir(duelo, "jugador", "golpe")
Motor.elegir(duelo, "enemigo", "impacto")
Motor.resolver(duelo)   // { golpes, cancelados, terminado, ganador }
```

### Rueda elemental y estados

La rueda se aplica **por nación del luchador**, no por ataque: cada golpe hereda la afinidad del que lo lanza.

```text
Agua → Fuego → Aire → Tierra → Agua
```

- Ventaja: el daño se multiplica por **1.5**.
- Desventaja: el daño se multiplica por **0.75**.
- Fuera de la rueda (o sin elemento): el daño no cambia.

El resultado se redondea al entero más cercano: 7 con ventaja hace 11 (10.5), con desventaja hace 5 (5.25). `Motor.danoDe()` expone el cálculo para que la interfaz pueda mostrar el daño real antes de elegir.

Estados, que entran en juego **al turno siguiente** y no en el mismo intercambio:

- **Quemadura**: daño residual al empezar cada turno, durante 2 turnos.
- **Aturdido**: el luchador pierde su ataque una vez y el estado se consume.

Reaplicar un estado lo **refresca**, no lo apila: dos quemaduras a la vez no son "ardes el doble".

### Kits por nación

`public/js/kits.js` es contenido, no reglas. Cada nación tiene sus cuatro ataques, su velocidad y su forma de jugar:

| Nación | Velocidad | Personalidad |
| --- | --- | --- |
| Fuego | 11 | Pega fuerte y deja quemadura con la definitiva |
| Agua | 10 | Aguanta: se cura en lugar de golpear |
| Aire | 14 | El más rápido, y aturde con la definitiva |
| Tierra | 8 | El más lento y el que más pega; roba energía |

```js
const luchador = Kits.luchadorDesdePersonaje(personaje)   // lee `emblema`
```

### IA del rival

`Motor.elegirIA()` es determinista: las mismas condiciones dan siempre la misma elección. **No lee la elección del jugador** — elige sin verla, como el jugador elige sin ver la suya.

Prioridades, en orden:

1. Rematar si algún ataque alcanza (elige el más barato que remata).
2. Descuido determinista: cada cuarto turno elige el ataque más barato.
3. Curarse si está por debajo del 30% de vida.
4. Usar la definitiva en cuanto puede pagarla.
5. Si no puede pagarla, pegar con lo más fuerte que pueda pagar. No ahorra energía.

Es un rival competente pero no perfecto: se distrae cada cuatro turnos y no administra la energía pensando en la definitiva. Por eso se puede ganar. Con las cuatro naciones, un jugador que usa sus ataques fuertes gana alrededor de 6 de cada 10 peleas.

El motor y los kits son los que resuelven cada turno del duelo: la IA del rival es la que elige su ataque en cada turno de la arena.

### Duelo en la arena

`public/js/duelo.js` une el motor con la pantalla. No dibuja nada: expone el estado que `mapa.js` y `hud.js` leen en cada cuadro y ejecuta las decisiones del motor.

- **Mejor de tres rondas.** Cada ronda es un duelo a vida 100 con el motor. El ganador de la ronda suma un win y gana la partida quien llega primero a dos (o quien tiene más wins cuando se agotan las tres). Un empate no suma win.
- **Botones del kit.** Los cuatro ataques se generan desde el kit de la nación elegida, con el costo, el daño real (ya con la rueda aplicada) y una flecha ↑/↓ cuando hay ventaja o desventaja elemental. Sin energía solo queda habilitado el ataque de costo 0.
- **Animación por cola de eventos.** El turno se resuelve de inmediato en el motor, pero los golpes, las curaciones, los estados y los golpes cancelados se muestran en orden, cada uno con su duración. Mientras corre la cola los botones están bloqueados.
- **Reloj de turno.** Tenés 12 segundos por turno. Si se agota, el motor ejecuta el ataque básico y el aviso lo dice antes del resumen del turno.
- **Cierre de ronda.** Cuando la vida llega a 0, `mapa.js` muestra el cartel `K.O.` y después el `ROUND` siguiente con vida 100 y energía 0. Si la ronda se cierra por el tope de 24 turnos, el cartel dice `TIEMPO` y el registro agrega "por límite de turnos". La ronda cerrada queda en el registro de combate.
- **Resultado de la partida.** Sale de las rondas ganadas, no de la vida que quedó en la última. Antes de pasar a la etapa 4, la arena anuncia `VICTORIA`, `DERROTA` o `EMPATE` en el canvas.

### Cierre de la partida

Al terminar la última ronda, el K.O. y el cartel del resultado se ven en la arena y después entra la etapa 4.

- **Resultado.** El título (`Victoria`, `Derrota` o `Empate`) y el mensaje salen de las rondas ganadas. Las dos cartas del cierre se voltean y el perdedor queda en gris.
- **Resumen.** `Rondas 2 - 1: 3 jugadas, 2 ganadas, 1 perdida y 0 empatadas. Racha: 1 (mejor: 1).`
- **Clasificación persistente.** Partidas, victorias, derrotas, empates, racha actual y mejor racha se guardan en `localStorage` bajo `avatarRanking` y sobreviven al reinicio. La racha cuenta partidas ganadas seguidas; una derrota o un empate la cortan, pero la mejor racha queda como récord.
- **Ranking viejo.** Un ranking guardado antes de que existiera la racha se completa con 0 en lugar de romper la pantalla (`Ranking.sanear`).
- **Reglas.** El botón "Reglas" y "Ver reglas" abren el mismo diálogo, que describe el duelo por turnos, la energía, la rueda elemental y el reloj: ya no habla de piedra, papel o tijera.
- **Reinicio.** "Jugar de nuevo" vuelve a la selección con la arena limpia, el registro vacío y la racha intacta.

Los números del balance (ventaja ×1.5, energía máxima 5, 12 segundos, 2 de 3 rondas) están en `duelo.js`, `motor.js` y `kits.js`, no repartidos por el HTML.

### Pulido de la arena (E6)

- **Cartas con esquinas.** Las cartas usan `--radio-carta: 7px`.
- **Cartas también en la arena.** Los retratos aumentan un 25% en el mapa y la batalla. Se dibujan con el mismo radio de 7px, un marco fino y un brillo interior alineado a 2px. La foto del personaje no se deforma.
- **Fondos de la arena.** Al comenzar una partida se elige al azar uno de los fondos `*_bg.webp`; se mantiene el mismo en la exploración y durante el duelo.
- **Personajes agregados.** Sus tarjetas muestran explícitamente la imagen `random_*` de su nación.
- **Efectos especiales en cada movimiento.** El efecto se deriva del progreso del evento, sin azar, así el mismo turno se ve siempre igual: el golpe abre un núcleo, una onda y ocho chispas (más grande cuando hay ventaja elemental); la cura levanta destellos verdes; la quemadura deja brasas; el aturdimiento cierra un aro amarillo. Los golpes además sacuden el lienzo. Se pintan con mezcla aditiva para que se lean por encima del tinte rojo del luchador golpeado, y todo respeta `prefers-reduced-motion`.
- **Scroll durante la pelea.** La página se puede desplazar durante el duelo para acceder al mapa y a los controles de ataque sin que el canvas quede recortado.

---

## Cómo ejecutarlo

El juego se sirve por HTTP con un servidor estático propio, sin dependencias:

```bash
cd Juego/Avatar-Map
node servidor.mjs
```

Después abrí <http://localhost:5173>. Para cambiar el puerto: `$env:PORT=8080; node servidor.mjs`.

> Abrir `public/avatar.html` con doble click todavía funciona, pero el proyecto apunta a correr siempre por HTTP: es el paso previo al host con otros jugadores y evita las restricciones de `file://`.

### Pruebas del motor

El motor de turnos no depende del navegador, así que se prueba directo con Node (18 o superior):

```bash
cd Juego/Avatar-Map
node --test
```

Las pruebas viven en `pruebas/` y cubren las reglas del combate, el contenido de las naciones, la IA y el ranking:

- `pruebas/motor.test.js`: vida, energía, costos, recarga, orden por velocidad, rueda elemental, estados, robo de energía, tope de turnos y fin de la partida.
- `pruebas/kits.test.js`: los cuatro kits respetan el contrato y no se juegan igual.
- `pruebas/ia.test.js`: prioridades de la IA, descuido cada cuarto turno, determinismo y que no lea la elección del jugador.
- `pruebas/ranking.test.js`: racha, mejor racha, datos viejos o corruptos y que registrar no mute el ranking recibido.

Son 77 tests y no tocan el DOM.

---

## Estructura del código

`public/js/` está dividido por responsabilidad. Los archivos se cargan en este orden desde `avatar.html`:

| Archivo | Qué contiene |
| --- | --- |
| `personajes.js` | Clase `Personaje`, registro `PERSONAJES`, imágenes y alta desde el formulario |
| `estado.js` | Personajes elegidos y contador de rondas de la partida |
| `hud.js` | HUD de la arena dibujado en canvas: vida, energía, estados, ronda, reloj, rondas ganadas y cartel |
| `motor.js` | Motor de turnos puro: vida, energía, ataques, orden por velocidad, rueda elemental, estados e IA (sin DOM) |
| `kits.js` | Contenido de las cuatro naciones: ataques, velocidad y personalidad de cada una |
| `duelo.js` | Puente motor-pantalla: rondas y wins, turnos, cola de animación, reloj y botones del kit |
| `mapa.js` | Canvas del encuentro: encuadre, loop `requestAnimationFrame`, movimiento, fases, efectos de pelea y dibujo de la arena |
| `seleccion.js` | Etapas, cartas de selección, marcador y reinicio |
| `ranking.js` | Ranking puro: partidas, victorias, racha y mejor racha (sin DOM, con `require()` para las pruebas) |
| `combate.js` | Cierre de la partida, ranking en `localStorage` y cartas del final |
| `avatar.js` | Punto de entrada: enlaza los botones y arranca el juego |

Cada archivo usa lo que declararon los anteriores, por eso el orden importa.
