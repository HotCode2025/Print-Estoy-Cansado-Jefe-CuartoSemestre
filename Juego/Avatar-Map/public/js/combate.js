// Resultado de la partida y ranking
// El combate por turnos vive en motor.js (reglas) y duelo.js (arena). Acá queda
// el cierre de la partida, el ranking persistente y las cartas del final.
// E0: corte mecánico de avatar.js. E4: sale la lógica de piedra, papel o tijera.

// Enganchar la arena del duelo. Los botones de ataque los crea duelo.js desde el
// kit de la nación elegida, así que acá solo se configura el contenedor.
function iniciarCombate() {
    configurarBotonesArena()
}

// Terminar la partida y mostrar la etapa de clasificación.
// El ganador sale de las rondas ganadas, no de la vida que quedó en la última.
// Se guarda el ranking antes de dibujar para que la racha que se muestra sea la
// que ya incluye esta partida.
function terminarPartida() {
    deshabilitarAtaques()
    document.getElementById("reiniciar").hidden = true
    const resultado = resultadoPartidaArena()
    const ranking = actualizarRanking(resultado)

    mostrarResultadoFinal(resultado)
    renderizarRanking(ranking)
    mostrarEtapa(4)
}

// Leer el ranking persistente o devolver valores iniciales
function leerRanking() {
    try {
        const guardado = window.localStorage.getItem(claveRanking)
        if (!guardado) {
            return Ranking.inicial()
        }
        return Ranking.sanear(JSON.parse(guardado))
    }
    catch (error) {
        return Ranking.inicial()
    }
}

// Actualizar el ranking con el resultado y devolverlo ya saneado.
function actualizarRanking(resultado) {
    const ranking = Ranking.registrar(leerRanking(), resultado)

    try {
        window.localStorage.setItem(claveRanking, JSON.stringify(ranking))
    }
    catch (error) {
        // Sin almacenamiento disponible: se muestra igual la clasificación de la sesión
    }

    return ranking
}

// Dibujar la clasificación y el resumen de la partida desde #mensajes y rondas
function renderizarRanking(ranking) {
    const datos = ranking || leerRanking()

    document.getElementById("ranking-partidas").innerHTML = datos.partidas
    document.getElementById("ranking-victorias").innerHTML = datos.victorias
    document.getElementById("ranking-derrotas").innerHTML = datos.derrotas
    document.getElementById("ranking-empates").innerHTML = datos.empates
    document.getElementById("ranking-racha").innerHTML = datos.racha
    document.getElementById("ranking-mejor-racha").innerHTML = datos.mejorRacha

    const victoriasRonda = document.querySelectorAll("#mensajes .mensaje-victoria").length
    const derrotasRonda = document.querySelectorAll("#mensajes .mensaje-derrota").length
    let empatesRonda = rondas - victoriasRonda - derrotasRonda
    if (empatesRonda < 0) {
        empatesRonda = 0
    }

    const marcador = marcadorPartidaArena()
    document.getElementById("resumen-partida").innerHTML =
        "Rondas " + marcador.jugador + " - " + marcador.enemigo + ": " +
        rondas + " jugadas, " + victoriasRonda + " ganadas, " +
        derrotasRonda + " perdidas y " + empatesRonda + " empatadas. " +
        "Racha: " + datos.racha + " (mejor: " + datos.mejorRacha + ")."
}

// Mostrar el resultado final dentro de la etapa 4 reutilizando crearCartaModal
function mostrarResultadoFinal(resultado) {
    const titulo = document.getElementById("titulo-etapa-4")
    const mensaje = document.getElementById("resultado-final-mensaje")
    const contenedor = document.getElementById("cartas-final-contenedor")

    mensaje.classList.remove("ganaste", "perdiste", "empate")

    const idLocal = esPartidaOnline() ? idPersonajeLocal() : personajeJugador
    const idRival = esPartidaOnline() ? idPersonajeRival() : personajeEnemigo
    if (resultado === "EMPATE") {
        titulo.innerHTML = "Empate"
        mensaje.innerHTML = "Ambos luchadores caen..."
        mensaje.classList.add("empate")
    }
    else if (resultado === "GANASTE") {
        const perdedor = buscarPersonaje(idRival)
        titulo.innerHTML = "Victoria"
        mensaje.innerHTML = "¡" + perdedor.nombre + " ha sido derrotad" + generoPersonajes[idRival] + "!"
        mensaje.classList.add("ganaste")
    }
    else {
        const caido = buscarPersonaje(idLocal)
        titulo.innerHTML = "Derrota"
        mensaje.innerHTML = caido.nombre + " ha caído en batalla"
        mensaje.classList.add("perdiste")
    }

    // No son const porque se usan para concatenar clases según el resultado
    let claseJugador = ""
    let claseEnemigo = ""
    if (resultado !== "EMPATE") {
        if (resultado === "GANASTE") {
            claseJugador = "ganador"
            claseEnemigo = "perdedor-card"
        }
        else {
            claseJugador = "perdedor-card"
            claseEnemigo = "ganador"
        }
    }

    contenedor.innerHTML =
        '<div class="duelo-cartas">' +
            '<div class="duelo-carta ' + claseJugador + '">' + crearCartaModal(idLocal) + '</div>' +
            '<div class="duelo-centro">' +
                '<span class="duelo-vs">VS</span>' +
            '</div>' +
            '<div class="duelo-carta ' + claseEnemigo + '">' + crearCartaModal(idRival) + '</div>' +
        '</div>'

    requestAnimationFrame(function () {
        const inners = contenedor.querySelectorAll(".carta-resultado-inner")
        inners.forEach(function (el) {
            el.classList.add("animar")
        })
    })
}

// Mostrar el modal con las dos cartas enfrentadas, ganador y perdedor
// Compatibilidad: el resultado vive en la etapa 4; el diálogo queda sin uso.
function mostrarModalResultado(resultado) {
    mostrarResultadoFinal(resultado)
    mostrarEtapa(4)
}

// Color de nación para el nombre en texto de personajes agregados (misma paleta del CSS).
function colorNacionAgregada(emblema) {
    if (emblema === "agua") {
        return "#34648C"
    }
    if (emblema === "tierra") {
        return "#55672E"
    }
    if (emblema === "aire") {
        return "#8A8577"
    }
    return "#A93B26"
}

// Crear el HTML de una carta para el modal desde el objeto Personaje
function crearCartaModal(personaje) {
    const datos = typeof personaje === "string" ? buscarPersonaje(personaje) : personaje
    const id = datos ? datos.id : personaje
    if (datos && (datos.esAgregado || !datos.nombreImg)) {
        const nombreAgregado = datos.nombre || id
        const colorNacion = colorNacionAgregada(datos.emblema)
        return '<div class="carta-resultado-inner">' +
            '<div class="carta-modal-frente"></div>' +
            '<div class="carta-modal-reverso" style="background-image:url(' + imagenesPersonajes[id] + ')">' +
                '<span class="carta-modal-nombre-texto" style="color:' + colorNacion + '">' + nombreAgregado + "</span>" +
            "</div>" +
        "</div>"
    }
    return '<div class="carta-resultado-inner">' +
        '<div class="carta-modal-frente"></div>' +
        '<div class="carta-modal-reverso" style="background-image:url(' + imagenesPersonajes[id] + ')">' +
            '<img class="carta-modal-nombre-img" src="' + imagenesNombres[id] + '" alt="' + id + '">' +
        "</div>" +
    "</div>"
}

// Inclinación suave de las cartas siguiendo el puntero (máximo 10 grados).
// Se omite si el sistema pide movimiento reducido o el puntero es táctil
function configurarInclinacionCartas() {
    const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const punteroTactil = window.matchMedia("(pointer: coarse)").matches

    if (movimientoReducido || punteroTactil) {
        return
    }

    const cartas = document.querySelectorAll(".carta")

    cartas.forEach(function (carta) {
        if (carta.dataset.inclinacion === "1") {
            return
        }
        carta.dataset.inclinacion = "1"
        carta.addEventListener("pointermove", inclinarCarta)
        carta.addEventListener("pointerleave", enderezarCarta)
    })
}

// Calcular la inclinación según la posición del puntero dentro de la carta
function inclinarCarta(evento) {
    const carta = evento.currentTarget
    const rectangulo = carta.getBoundingClientRect()
    const posicionX = (evento.clientX - rectangulo.left) / rectangulo.width - 0.5
    const posicionY = (evento.clientY - rectangulo.top) / rectangulo.height - 0.5

    carta.style.setProperty("--inclinacion-x", (posicionY * -20) + "deg")
    carta.style.setProperty("--inclinacion-y", (posicionX * 20) + "deg")
}

// Volver la carta a su posición de reposo al salir el puntero
function enderezarCarta(evento) {
    const carta = evento.currentTarget
    carta.style.setProperty("--inclinacion-x", "0deg")
    carta.style.setProperty("--inclinacion-y", "0deg")
}

// Número aleatorio
function aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
