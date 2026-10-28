# Avatar-Map: pulido de la arena (E6)

Objetivo: hacer visiblemente mejor la arena sin romper nada de lo ya verificado (E0-E5).
Rama: `feature/avatar-map-arena` · Runner: `node --test` + arnés CDP de Chrome headless.

## Specs

- **S1** Las cartas no son rectas: esquinas redondeadas visibles en la selección, en el cierre y en la arena de combate. En la arena además se leen con volumen (canto, sombra y luz de cara).
  Pedido textual (28-oct): "las cards no sean rectas, necesito que tengan bordes en las esquinas".
  Pedido textual (28-oct, arena): "sigo sin ver bordes redondeados en cada card de jugador en combate. Se puede dar un efecto 3d y bordes redondeados a cada card?".
- **S2** Cada movimiento de pelea tiene efecto especial en el canvas: impacto, partículas, destello y sacudida.
  Pedido textual: "que hagan efectos especiales con cada movimiento de pelea".
- **S3** Durante la pelea la página no scrollea, ni horizontal ni vertical; al salir de la arena se restaura.
  Pedido textual: "hacer inamovible el scroll horizontal y vertical de la pagina al momento de la pelea".
- **S4** La energía nunca queda negativa. Si el robo de energía deja a un luchador sin saldo para el ataque que ya había declarado, ese ataque se cancela (`sin-energia`) y el turno continúa. Ningún estado del juego puede quedar sin salida.
- **S5** La dificultad es ganable: la IA deja de ser un optimizador perfecto. Medido con simulador sobre las 16 combinaciones de nación, un jugador que usa sus ataques fuertes gana entre 50% y 70%, y la IA sigue siendo competente (remata y cura).
- **S6** Lo verificado en E0-E5 sigue verde: `node --test` (69+), arnés CDP completo, sin errores de consola.

## Tasks

| ID | Qué | Specs | Ruta | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- |
| P1 | Bug: energía negativa traba el turno | S4 | inline | hecho | 4 tests RED→GREEN; 77/77 |
| P2 | Balance de la IA medido con simulador | S5 | inline | hecho | 63% con "usa lo más fuerte"; ver L3 |
| P3 | Esquinas redondeadas en las cartas | S1 | inline | hecho | `--radio-carta: 20px`; T29c; `e6-carta-esquinas.png` |
| P4 | Efectos de impacto por golpe en el canvas | S2 | inline | hecho | onda+núcleo+8 chispas, cura, brasas, aro, sacudida; T30; ver L4 |
| P5 | Scroll bloqueado durante la pelea | S3 | inline | hecho | T29, T29d, T15d |
| P6 | Verificación completa y documentación | S6 | inline | hecho | 82/82 CDP sin errores de consola + 77/77 `node --test`; ver L3 |
| P7 | Cartas con volumen en la arena (canvas) | S1 | inline | hecho | `RADIO_CARTA_ARENA = 20`, canto + sombra + luz + bisel; T34; ver L5 |

## Log

**L1 (28-oct-2026, pedido)**

> "Esta funcionando la verdad espectacular. Avancemos a mejorarlo ahora. Por ejemplo se me ocurre que las cards no sean rectas, necesito que tengan bordes en las esquinas. Tambien que hagan efectos especiales con cada movimiento de pelea. Tambien hacer inamovible el scroll horizontal y vertical de la pagina al momento de la pelea. Tambien corregir la dificultad porque jugué 5 peleas y es imposible ganar."

**L2 (28-oct-2026, diagnóstico de la dificultad, antes de tocar código)**

Se simuló el motor real (`motor.js` + `kits.js`) sobre las 16 combinaciones de nación con cuatro políticas de jugador. Línea base:

| Política del jugador | Victorias | Turnos promedio |
| --- | --- | --- |
| Solo el ataque gratis | 6% | 26.0 |
| Lo más fuerte que pueda pagar | 38% | 25.8 |
| Juega como la IA (ahorra para la definitiva) | 56% | 25.9 |

Conclusiones:
- El motor es simétrico: no hay trampa a favor del rival. El problema es que **solo gana quien descubre la economía de energía del rival**, que es invisible.
- La partida promedio dura **26 turnos**: un turno perdido cuesta mucho y la derrota se siente interminable.

**Bug real encontrado por el simulador (la causa de "imposible ganar"):** con Tierra contra Tierra, el jugador golpea primero (desempate), usa Terremoto y le roba 2 de energía al rival. El rival ya había declarado Terremoto (costo 4): en `resolver` paga 4 con las 2 que le quedan y su energía termina en **-1**. A partir de ahí `puedeUsar` rechaza **todos** sus ataques, `elegirIA` devuelve `sin-ataques` y `duelo.js` revierte con "El rival no puede responder." El turno nunca se resuelve: **la ronda no termina y no se puede ganar ni perder**. Reproducido en `bug-energia.mjs` (temporal, fuera del repo).

**L3 (28-oct-2026, barrido final de E6)**

Medición contra la IA **real** (`Motor.elegirIA`, no una copia), 16 combinaciones de nación por política:

| Política del jugador | Victorias | Turnos promedio |
| --- | --- | --- |
| Solo el ataque gratis | 13% | 8.3 |
| Lo más fuerte que pueda pagar | **63%** | 7.1 |
| Juega "como se debe" (remata, cura bajo, definitiva) | 63% | 10.2 |

- S5 cumplido: 63% cae dentro de la banda 50-70% y la IA sigue rematando y curando.
- El turno promedio bajó de ~26 a ~7-10: la derrota ya no se siente interminable.
- Partida más larga: **24 turnos** (agua contra agua). Ninguna ronda quedó sin final.
- Cierre por tope verificado en el navegador: T33 fuerza `turno = MAXIMO_TURNOS_RONDA` y confirma que el motor cierra la ronda y la arena anuncia **"TIEMPO"**, no "K.O.".
- Aviso del robo de energía verificado en la arena: T32 (`SIN ENERGÍA` en la cola y el texto del registro).
- Arnés CDP: **82/82 PASS**, sin errores de consola. `node --test`: **77/77**.
- Checks nuevos de E6: T29 (scroll bloqueado + `scrollbar-gutter: stable`), T15d (las flechas no mueven la página aunque la página desborde), T29c (radio 20px en cartas, 10px en paneles), T29d (scroll liberado al cerrar la partida), T30 (píxeles de cada efecto + sacudida), T32, T33.

**L4 (28-oct-2026, revisión visual de los efectos)**

Las capturas de P6 mostraron que el primer efecto de golpe **se perdía**: justo en el impacto el luchador golpeado está teñido de rojo, y un trazo normal se mezclaba con el tinte hasta casi desaparecer. Se corrigió pintando los efectos con mezcla aditiva (`globalCompositeOperation = "lighter"`) y agregando un núcleo de destello que se apaga rápido. Con eso el aro, las chispas y el núcleo se leen por encima del tinte. Evidencia: `e6-arena-impacto.png` antes y después; T30 sigue en verde (neutral 1756 px, ventaja 2160 px).

**L5 (28-oct-2026, las cartas de la arena)**

> "asi se ve el combate ahora, la verdad cumple muy bien. pero sigo sin ver bordes redondeados en cada card de jugador en combate. Se puede dar un efecto 3d y bordes redondeados a cada card?"

El redondeo de P3 había ido a las cartas HTML (selección y cierre), no a los retratos del combate: esos se pintan en el canvas con `drawImage` + `strokeRect`, así que seguían rectos. Se rehízo `dibujarPersonajeMapa` como carta: contorno redondeado con `arcTo` (`RADIO_CARTA_ARENA = 20`, el mismo número que `--radio-carta`), canto corrido 4/5 px para dar espesor, sombra proyectada, foto recortada por ese contorno con su marco de tinta adentro, luz de cara (brillo arriba, sombra al pie) y bisel de dos trazos. La foto no se deforma: todo es recorte, sombra y luz por encima.

Evidencia: T34 mide la misma distancia al borde en la esquina y en el medio del lado (alfa 8 contra 255, así que la esquina está recortada), y confirma canto (255) y sombra (61) fuera de la silueta. Arnés: **84/84 PASS**.


