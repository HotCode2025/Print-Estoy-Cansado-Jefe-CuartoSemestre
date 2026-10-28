# Avatar-Map: arena por turnos

Objetivo: convertir `Juego/Avatar-Map` en un juego por turnos que ocurra en el canvas.
Rama: `feature/avatar-map-arena` · Entrega por etapas, una verificada por vez.
Runner: `node --test` (E2+) y arnés CDP de Chrome headless (E1+).

## Specs

- **S1** El canvas es el juego y aparece después de seleccionar personaje.
- **S2** Fase de acercamiento: el jugador mueve su personaje con flechas o botones; al entrar en rango de encuentro arranca el duelo con `ROUND 1`.
- **S3** El duelo es por turnos: jugador y rival eligen en el mismo turno, sin ver la elección del otro, y se resuelve ordenado por velocidad.
- **S4** Vida 100 por luchador, energía 0-5 (+1 por turno), kit de 4 ataques con costo 0 / 1 / 2 / 4 y cooldown de 3 turnos en la definitiva.
- **S5** Rueda elemental `Agua → Fuego → Aire → Tierra → Agua`: ventaja ×1.5, desventaja ×0.75.
- **S6** HUD estilo fighting game: barras de vida rojas, nombres, `ROUND 1` y contador de victorias.
- **S7** Ritmo: reloj de 12 s por turno; al agotarse se ejecuta el ataque básico.
- **S8** Requisitos del profesor intactos: canvas 800x600 con mapa de fondo, ambos personajes ubicados sobre él, movimiento con flechas, personaje como objeto con `x`, `y`, `ancho`, `alto` y `velocidad`, y loop de repintado.
- **S9** `Juego/Avatar` (clases 1-8) queda congelado: no se toca.
- **S10** El juego corre por HTTP con servidor estático propio, sin dependencias.

## Tasks

| ID | Qué | Specs | Ruta | Estado |
| --- | --- | --- | --- | --- |
| E0 | Partir `avatar.js` en módulos, servidor estático, arnés sobre HTTP | S10 | inline | ✅ `personajes.js`, `estado.js`, `mapa.js`, `seleccion.js`, `combate.js`, `avatar.js`, `servidor.mjs` |
| E1 | Arena a pantalla completa, HUD en canvas, fase de acercamiento | S1, S2, S6, S8 | inline | ✅ `hud.js`, fases en `mapa.js`, commit `a2dc466` |
| E2 | Motor de turnos puro (`motor.js`), testeable en Node | S3, S4 | inline | ✅ `motor.js` + `pruebas/motor.test.js` (17 tests), commit `3e82a22` |
| E3 | Kit de ataques por nación, rueda elemental, estados, IA | S4, S5 | inline | ✅ `kits.js` + rueda + estados + `elegirIA`, 57 tests, commit `bda116a` |
| E4 | Escena de duelo: dibujo del motor, animaciones, feedback | S6, S7 | inline | ✅ `duelo.js` + HUD de vida/energía/estados + mejor de 3 + reloj, commit `0edc319` |
| E5 | Cierre: resultado, racha, ranking, reinicio limpio | S6 | inline | ✅ `ranking.js` + cartel final + racha y clasificación, 69 tests, commit `0bb87a2` |

## Log

**L1 (27-oct-2026, pedido original)**
> "Mapa = juego. Planeo llevarlo a otro nivel, un juego que ocurra en el canvas. Hablo de un estilo como esta imagen: [captura de Mortal Kombat]. Que sea un verdadero juego, en el que el canvas aparece luego de seleccionar personaje, y al moverse a la seccion del combate, esto sea mucho mas frenetico, con mas accion y que no sea solo tocar un boton como en la version terminada de piedra papel tijera de Avatar. Aparte de que quiero que sea un juego por turnos tipo Mutants Genetic Gladiators."

**L2 (27-oct-2026, decisión de fase de acercamiento)**
> "Perfecto. El movimiento con flechas queda como fase de acercamiento antes del duelo. Arrancamos por E0"

**L3 (27-oct-2026, corrección de alcance de E0)**
`avatar.js` se parte en módulos clásicos (no ES modules) porque el combate actual usa estado global compartido: convertirlo a módulos con imports obliga a resolver decenas de referencias cruzadas y agrega riesgo sin beneficio en esta etapa. La modularidad real llega en E2, cuando `motor.js` nace sin dependencias del juego y se puede importar desde Node.

**L4 (27-oct-2026, E0 cerrado)**
Corte mecánico verificado: 26 de 26 checks del arnés CDP en verde sobre `http://127.0.0.1:5173`, captura visual idéntica al estado anterior, `node --check` en los 7 archivos. `servidor.mjs`: 200 en HTML/JS/CSS, traversal simple y codificado bloqueado con 404.

Hueco encontrado y cerrado: el arnés no ejercitaba el alta de personaje, que es justo lo que vive en `personajes.js`. Se agregaron dos checks (carta creada, registro, contador `Agregados 1/5`, campo limpio) y quedaron en verde.

**L5 (27-oct-2026, E1 cerrado)**
Arena con tres fases en `mapa.js` (`acercamiento` → `anuncio` → `duelo`), HUD en canvas nuevo (`hud.js`: barras rojas segmentadas con destello, nombres, ronda, cartel `ROUND 1`), atmósfera (oscurecido + viñeta cacheada) y panel de ataques oculto durante el acercamiento. Commit `a2dc466`.

Verificación: 40 de 40 checks del arnés CDP en verde. Evidencia relevante: 203 cuadros/s en headless (el HUD no cuesta rendimiento), 24 cuadros sintéticos de duración fija avanzan exactamente 120 px, y al detener el loop no queda ninguna animación huérfana.

Dos correcciones de oráculo en el arnés, porque el check viejo mentía:
- `T9` comparaba distancia contra reloj de pared: medía la latencia del primer `keyDown` por CDP (30-40 ms perdidos) y fallaba con ratio 1,54. Se reemplazó por cuadros ejecutados por ventana (un loop duplicado los duplica), 24 cuadros de duración fija (120 px exactos) y el conteo de huérfanos tras `detenerAnimacionMapa`.
- La captura del cartel se tomaba a los 16 ms del cambio de fase, con el texto al 10% de opacidad: no servía para juzgar nada. Ahora se captura a mitad de la animación y hay un check que lo exige.

Se quitó la instrucción duplicada bajo el título de la sección: decía "Acercate al rival" en la descripción y otra vez en `#aviso-arena`, y seguía diciéndolo durante el duelo. Ahora la descripción explica los controles y el aviso informa el estado.

**L6 (27-oct-2026, E2 cerrado: motor de turnos)**
`public/js/motor.js` (nuevo) implementa S3 y S4 sin DOM, sin azar y sin IO: vida 100, energía 0-5 (+1 por turno, tope 5), kit de 4 ataques con costo 0/1/2/4, recarga 3 en la definitiva, y resolución ordenada por velocidad donde el rápido que mata cancela el golpe del lento. Se carga como script clásico (global `Motor`) y además con `require()` en Node: el mismo archivo sirve en los dos lados sin bundler.

Decisiones que vale registrar:
- **La recarga se guarda como turno absoluto** (`recargas.suprema = 5`), no como contador que se resta. El contador tenía el off-by-one clásico de "cooldown 3" (volvía en el turno + 2).
- **La velocidad tiene consecuencia real**: si no cancelara el golpe del lento, ordenar por velocidad no cambiaría nada y la spec sería decorativa.
- **Desempate determinista**: con la misma velocidad empieza el jugador. Sin azar, para poder testear.
- El motor se carga en la página pero el duelo todavía no lo usa: el combate sigue siendo piedra-papel-tijera hasta E3-E4.

Verificación: 17 de 17 tests de `node --test` en verde, y 42 de 42 checks del arnés CDP (dos nuevos: `Motor` cargado en la página y un turno completo resuelto en el navegador).

**Mutation testing (5 mutantes, 0 sobrevivientes):** se rompió el motor a propósito para confirmar que las pruebas muerden. Los 5 murieron: sin cancelación por velocidad, desempate invertido, recarga con off-by-one, energía +2 por turno y ataque que no gasta energía. El ejercicio encontró un test flojo real: el de energía solo miraba el tope, y con +2 por turno también llegaba a 5. Ahora afirma la progresión turno a turno (1, 2, 3, 4, 5) y hay un test aparte del descuento por costo.

**Próximo paso:** E3 (kit de ataques por nación, rueda elemental `Agua → Fuego → Aire → Tierra → Agua` con ×1.5 / ×0.75, estados e IA del rival).

**L7 (28-oct-2026, E3 cerrado: rueda, estados, kits e IA)**

`public/js/kits.js` (nuevo) trae el contenido de las cuatro naciones: 4 ataques con costo 0/1/2/4, una velocidad propia y una personalidad distinta (fuego quema, agua cura, aire aturde, tierra roba energía). `motor.js` suma la rueda elemental, los estados y `elegirIA`.

Decisiones que vale registrar:
- **La rueda se aplica por nación del luchador, no por ataque.** Cada golpe hereda la afinidad del que lo lanza: ventaja ×1.5, desventaja ×0.75, redondeo al entero más cercano.
- **Los estados entran al turno siguiente**, no en el mismo intercambio. Si no, el aturdimiento del rápido le comería el turno al lento y sería doble castigo.
- **Reaplicar un estado lo refresca, no lo apila.** Sin esta regla, un ataque barato que queme cada turno hacía crecer el residual sin techo (el test lo detectó con 8 de daño en vez de 4). El estado describe una condición, no una cantidad de fuego encima.
- **La IA es determinista y no lee `duelo.elecciones.jugador`**, como pide S3. Hay un test explícito que le da dos elecciones distintas al jugador y verifica que la IA responde igual.

**Bug real encontrado y corregido:** la IA buscaba la definitiva dentro de `ataquesDe(...).filter(disponible)`. Como la definitiva no se puede pagar hasta tener 4 de energía, desaparecía de esa lista y la rama "ahorrar energía" era **inalcanzable**: la IA siempre pegaba lo más fuerte que podía, retrasando la definitiva. Ahora la busca en el kit completo y solo consulta `puedeUsar` para saber si está en recarga. Queda cubierto por el test "la IA ahorra energía mientras no puede pagar la definitiva", que también verifica que sin el arreglo la IA elegía la onda ígnea.

Verificación: 57 de 57 tests (`node --test`) y 46 de 46 checks del arnés CDP (cuatro nuevos: `Kits` cargado, rueda en el navegador, quemadura al turno siguiente e IA eligiendo la definitiva).

**Mutation testing (17 mutantes, 0 sobrevivientes):** 5 del núcleo de E2 y 12 de E3 (sin ventaja, sin desventaja, redondeo truncado, rueda invertida, quemadura sin residual, aturdido que no cancela, estados apilados, cura sin tope, robo sin tope, IA sin remate, umbral de cura al 50% y el bug de la definitiva). El script primero verifica que el temporal corra en verde: la primera corrida daba 17/17 "muertos" porque los tests no cargaban, no porque detectaran nada.

**Próximo paso:** E4 (escena del duelo: dibujo del motor en el canvas, animaciones y feedback de golpes, rueda y estados visibles). Ahí `combate.js` deja de ser piedra-papel-tijera.

**L8 (28-oct-2026, E4 cerrado: la arena juega el duelo)**

`public/js/duelo.js` (nuevo) es el puente entre el motor y la pantalla. No dibuja: expone estado para `mapa.js` y `hud.js` y ejecuta las decisiones del motor. Con esto el combate deja de ser piedra, papel o tijera.

Decisiones que vale registrar:
- **Partida al mejor de tres rondas.** Cada ronda es un duelo a vida 100 del motor; el ganador suma un win y gana quien llega primero a 2, o quien tiene más wins al agotar las 3. Un empate no suma win. La vida es de la ronda, las wins son de la partida.
- **Turno resuelto de inmediato, presentación por cola.** El motor decide el turno completo en el clic, pero golpes, curaciones, estados y cancelados se muestran como eventos con duración propia (430 / 380 / 360 ms). Mientras corre la cola los botones están bloqueados: así el jugador no puede adelantar el siguiente turno antes de ver qué pasó.
- **Los cuatro botones salen del kit de la nación** (el HTML ya no tiene tres botones fijos) y muestran costo, daño real con la rueda aplicada y flecha ↑/↓ de ventaja. Sin energía solo queda habilitado el costo 0.
- **El cartel `K.O.` lo muestra `mapa.js`**, no la cola de animación. Con el K.O. dentro de la cola salían dos seguidos: el de la cola y el del anuncio de ronda.
- **El marcador DOM conserva los ids `#vidas-jugador` / `#vidas-enemigo`** (los usa el arnés y los lectores de pantalla), pero la etiqueta visible dice "rondas" y muestra rondas ganadas, no vidas.
- **`RONDAS_PARA_GANAR` y `RONDAS_MAXIMAS` viven solo en `duelo.js`.** Estaban duplicadas en `mapa.js` y el redeclarado `const` en scope global rompía la carga.

**Bugs reales encontrados y corregidos:**
- `textAlign` de canvas solo acepta `left`/`right`/`center`/`start`/`end`. Se le pasaba `"derecha"`/`"izquierda"`, lo ignoraba, y el nombre del rival se salía del canvas. Se pasa `"right"`/`"left"`.
- **Loop zombi:** si `terminarPartida()` detenía el loop dentro del cuadro, el `requestAnimationFrame` se reprogramaba igual y quedaba una animación huérfana. Ahora el cuadro solo se reprograma si `animacionMapaId` sigue activo.
- **El aviso del reloj se pisaba:** "Se acabó el tiempo: ataque básico." se escribía y el resumen del turno lo sobrescribía. Ahora el aviso antepone el prefijo al resumen (`elegirAtaqueArena(ataqueId, prefijo)`).

Verificación: **57/57 tests** (`node --test`), **60/60 checks** del arnés CDP (nuevos: cuatro botones del kit con costo y daño, bloqueo durante la animación, barra de vida siguiendo la vida real, K.O. + ROUND 2 + marcador de wins, reinicio limpio, reloj que dispara el básico, y el cuadro que detiene el loop) y consola sin errores.

**Mutation testing (5 mutantes, 0 sobrevivientes):** loop reprogramado tras detenerlo (T23), barra de vida que ignora la vida (T16), ronda cerrada que no suma win (T21), reloj vencido que no ejecuta el básico (T24) y botones que no se bloquean durante la animación (T20). Cada uno murió por el check que le corresponde.

Commits: `0edc319` (el duelo y el HUD) y el commit de documentación de esta etapa.

**Próximo paso:** E5 (cierre: resultado, racha, ranking y reinicio limpio sobre la arena).

**L9 (28-oct-2026, E5 cerrado: cierre de partida, racha y ranking)**

`public/js/ranking.js` (nuevo) separa las reglas del ranking del almacenamiento: `inicial`, `sanear` y `registrar` son puras, sin DOM y sin IO, y se cargan igual como script clásico y con `require()` en Node. `combate.js` se queda solo con `localStorage` (clave `avatarRanking`), el cierre y las cartas del final.

Decisiones que vale registrar:
- **La racha cuenta partidas ganadas seguidas.** Una derrota o un empate la cortan; `mejorRacha` se conserva como récord. Se interpretó así sin consultar, porque es la lectura habitual del término; queda anotado por si el profesor espera otra cosa.
- **`registrar` devuelve un ranking nuevo y no muta el que recibe.** El test correspondiente evita el clásico bug de "actualicé el objeto y comparé contra sí mismo".
- **`sanear` completa un ranking viejo.** El ranking guardado antes de E5 no tiene racha ni mejorRacha; se rellena con 0 en lugar de romper la pantalla. También normaliza texto, negativos y decimales.
- **La arena anuncia `VICTORIA` / `DERROTA` / `EMPATE` durante 1500 ms antes de la etapa 3.** Sin ese cartel el duelo cortaba en seco justo después del golpe final. El K.O. ya se vio, así que no se repite.
- **El juego permite espejo** (el rival puede salir con el mismo personaje). No es bug: las dos cartas muestran el mismo arte y el check de cierre acepta los dos casos.
- **El reinicio no toca el ranking.** "Jugar de nuevo" limpia arena, wins y registro, conserva la racha y la clasificación.

**Bugs reales encontrados y corregidos:**
- **El diálogo de reglas seguía describiendo piedra, papel o tijera.** Era documentación falsa dentro del juego: listaba puñetazo/barrida/patada y sus relaciones. Ahora explica turnos, energía, rueda elemental, reloj y rondas, y hay un check que exige que no vuelva a aparecer el texto viejo.
- **Anillo de foco del navegador en el cambio de etapa.** El `h2` con `tabindex="-1"` recibe foco por código y Chrome le dibujaba el anillo, que ensuciaba el cierre. Se apaga el `outline` solo para `h2[tabindex="-1"]`; el foco sigue existiendo para lectores de pantalla.

**Falsa alarma registrada:** en la primera captura del cierre las dos cartas mostraban a Zuko y parecía un bug de duplicado. Era espejo. En vez de "arreglar" lo que funcionaba se agregó el check `T28`, que compara las cartas contra los personajes reales de la arena y acepta el espejo.

Verificación: **69/69 tests** (`node --test`) y **68/68 checks** del arnés CDP (nuevos: `T25` cartel final en la arena, `T26` cierre con marcador de rondas y racha persistida, `T27` diálogo de reglas actualizado, `T28` una carta por luchador, y `T22` ampliado para exigir que el reinicio conserve la racha). Consola sin errores y capturas revisadas de `etapa3-cierre.png`, `etapa3-final.png` y `dialogo-reglas.png`.

**Mutation testing (6 mutantes, 0 sobrevivientes):** M1 victoria que no suma racha, M2 derrota que no corta la racha y M3 mejor racha que no se actualiza (los tres por `pruebas/ranking.test.js`); M4 `sanear` que no completa campos viejos; M5 cierre sin cartel final y M6 marcador del cierre en 0-0 (los dos últimos por CDP).

Commits: `0bb87a2` (ranking, cierre y reglas) y el commit de documentación de esta etapa.

**Próximo paso:** no queda nada del plan de cinco etapas. Los endpoints y el host en LAN para jugar con otros siguen opcionales y quedan a decisión del usuario.
