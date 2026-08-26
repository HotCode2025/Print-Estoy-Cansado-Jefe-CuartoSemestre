// Variables globales
let ataqueJugador
let ataqueEnemigo
let vidasJugador = 3
let vidasEnemigo = 3
let personajeJugador = ""
let personajeEnemigo = ""
let rondas = 0

// Mapa de personajes → imágenes
let imagenesPersonajes = {
    Zuko: "./assets/zuko.webp",
    Aang: "./assets/aang.webp",
    Katara: "./assets/katara.webp",
    Toph: "./assets/toph.webp"
}

// Mapa de personajes → imágenes de nombre
let imagenesNombres = {
    Zuko: "./assets/name-zuko.webp",
    Aang: "./assets/name-aang.webp",
    Katara: "./assets/name-katara.webp",
    Toph: "./assets/name-toph.webp"
}

// Género de cada personaje para concordancia gramatical
let generoPersonajes = {
    Zuko: "o",
    Aang: "o",
    Katara: "a",
    Toph: "a"
}

// Selección de personajes
let inputZuko = document.getElementById("Zuko")
let inputAang = document.getElementById("Aang")
let inputKatara = document.getElementById("Katara")
let inputToph = document.getElementById("Toph")

// Iniciar juego
function iniciarJuego() {
    let botonPersonajeJugador = document.getElementById("boton-personaje")
    botonPersonajeJugador.addEventListener("click", seleccionarPersonajeJugador)

    let botonReiniciar = document.getElementById("boton-reiniciar")
    botonReiniciar.addEventListener("click", reiniciarPartida)

    let botonReiniciarModal = document.getElementById("boton-reiniciar-modal")
    botonReiniciarModal.addEventListener("click", reiniciarPartida)

    configurarDialogoReglas()
    configurarInclinacionCartas()

    iniciarCombate()
}

// Selección del personaje del jugador
function seleccionarPersonajeJugador() {
    let imgPersonajeJugador = document.getElementById("personaje-jugador")
    let avisoSeleccion = document.getElementById("aviso-seleccion")

    if (inputZuko.checked) {
        personajeJugador = "Zuko"
    }
    else if (inputAang.checked) {
        personajeJugador = "Aang"
    }
    else if (inputKatara.checked) {
        personajeJugador = "Katara"
    }
    else if (inputToph.checked) {
        personajeJugador = "Toph"
    }
    else {
        avisoSeleccion.innerHTML = "Primero selecciona un personaje para comenzar el combate"
        return
    }

    imgPersonajeJugador.src = imagenesNombres[personajeJugador]
    imgPersonajeJugador.alt = personajeJugador
    avisoSeleccion.innerHTML = ""

    // Deshabilitar selección de personaje para que no se cambie en medio del juego
    inputZuko.disabled = true
    inputAang.disabled = true
    inputKatara.disabled = true
    inputToph.disabled = true
    document.getElementById("boton-personaje").disabled = true

    habilitarAtaques()
    seleccionarPersonajeEnemigo()
}

// Habilitar los botones de ataque una vez elegido el personaje
function habilitarAtaques() {
    document.getElementById("boton-punetazo").disabled = false
    document.getElementById("boton-patada").disabled = false
    document.getElementById("boton-barrida").disabled = false
}

// Deshabilitar los botones de ataque
function deshabilitarAtaques() {
    document.getElementById("boton-punetazo").disabled = true
    document.getElementById("boton-patada").disabled = true
    document.getElementById("boton-barrida").disabled = true
}

// Selección aleatoria del enemigo
function seleccionarPersonajeEnemigo() {
    let personajeAleatorio = aleatorio(1, 4)
    let imgPersonajeEnemigo = document.getElementById("personaje-enemigo")

    switch (personajeAleatorio) {
        case 1:
            personajeEnemigo = "Zuko"
            break
        case 2:
            personajeEnemigo = "Aang"
            break
        case 3:
            personajeEnemigo = "Katara"
            break
        case 4:
            personajeEnemigo = "Toph"
            break
    }

    imgPersonajeEnemigo.src = imagenesNombres[personajeEnemigo]
    imgPersonajeEnemigo.alt = personajeEnemigo
}

// Abrir y cerrar el cuadro de reglas
function abrirReglas() {
    document.getElementById("dialogo-reglas").showModal()
}

function cerrarReglas() {
    document.getElementById("dialogo-reglas").close()
}

function configurarDialogoReglas() {
    let botonReglas = document.getElementById("boton-reglas")
    let botonCerrarReglas = document.getElementById("boton-cerrar-reglas")

    botonReglas.addEventListener("click", abrirReglas)
    botonCerrarReglas.addEventListener("click", cerrarReglas)
}

// Reiniciar la partida volviendo a cargar la página
function reiniciarPartida() {
    window.location.reload()
}

// Iniciar combate
function iniciarCombate() {
    let botonPunetazo = document.getElementById("boton-punetazo")
    botonPunetazo.addEventListener("click", ataquePunetazo)

    let botonPatada = document.getElementById("boton-patada")
    botonPatada.addEventListener("click", ataquePatada)

    let botonBarrida = document.getElementById("boton-barrida")
    botonBarrida.addEventListener("click", ataqueBarrida)
}

// Ataques del jugador
function ataquePunetazo() {
    ataqueJugador = "Puñetazo"
    ataqueAleatorioEnemigo()
}

function ataquePatada() {
    ataqueJugador = "Patada"
    ataqueAleatorioEnemigo()
}

function ataqueBarrida() {
    ataqueJugador = "Barrida"
    ataqueAleatorioEnemigo()
}

// Ataque aleatorio enemigo
function ataqueAleatorioEnemigo() {
    let ataqueAleatorio = aleatorio(1, 3)

    switch (ataqueAleatorio) {
        case 1:
            ataqueEnemigo = "Puñetazo"
            break
        case 2:
            ataqueEnemigo = "Patada"
            break
        case 3:
            ataqueEnemigo = "Barrida"
            break
    }

    combate()
}

// Lógica del combate
function combate() {
    rondas++

    if (ataqueJugador === ataqueEnemigo) {
        crearMensaje("EMPATE")
    }
    else if (
        (ataqueJugador === "Puñetazo" && ataqueEnemigo === "Barrida") ||
        (ataqueJugador === "Patada" && ataqueEnemigo === "Puñetazo") ||
        (ataqueJugador === "Barrida" && ataqueEnemigo === "Patada")
    ) {
        vidasEnemigo--
        actualizarVidas()
        crearMensaje("GANASTE")
    }
    else {
        vidasJugador--
        actualizarVidas()
        crearMensaje("PERDISTE")
    }

    // Verificar si alguien se quedó sin vidas
    if (vidasJugador <= 0 || vidasEnemigo <= 0) {
        terminarPartida()
    }
}

// Actualizar las vidas en el marcador
function actualizarVidas() {
    document.getElementById("vidas-jugador").innerHTML = vidasJugador
    document.getElementById("vidas-enemigo").innerHTML = vidasEnemigo
}

// Terminar la partida y mostrar el modal
function terminarPartida() {
    deshabilitarAtaques()
    document.getElementById("reiniciar").style.display = "block"

    let resultado
    if (vidasJugador <= 0 && vidasEnemigo <= 0) {
        resultado = "EMPATE"
    }
    else if (vidasJugador <= 0) {
        resultado = "PERDISTE"
    }
    else {
        resultado = "GANASTE"
    }

    mostrarModalResultado(resultado)
}

// Mostrar el modal con las dos cartas enfrentadas, ganador y perdedor
function mostrarModalResultado(resultado) {
    let dialogo = document.getElementById("dialogo-resultado")
    let titulo = document.getElementById("resultado-titulo")
    let mensaje = document.getElementById("resultado-mensaje")
    let contenedor = document.getElementById("carta-resultado-contenedor")

    // Limpiar estado previo
    mensaje.classList.remove("ganaste", "perdiste", "empate")

    // Determinar ganador y perdedor
    let ganador, perdedor

    if (resultado === "EMPATE") {
        titulo.innerHTML = "Empate"
        mensaje.innerHTML = "Ambos luchadores caen..."
        mensaje.classList.add("empate")
        ganador = null
        perdedor = null
    }
    else if (resultado === "GANASTE") {
        ganador = personajeJugador
        perdedor = personajeEnemigo
        titulo.innerHTML = "Victoria"
        mensaje.innerHTML = "¡" + perdedor + " ha sido derrotad" + generoPersonajes[perdedor] + "!"
        mensaje.classList.add("ganaste")
    }
    else {
        ganador = personajeEnemigo
        perdedor = personajeJugador
        titulo.innerHTML = "Derrota"
        mensaje.innerHTML = perdedor + " ha caído en batalla"
        mensaje.classList.add("perdiste")
    }

    // Clases de estado para cada carta (comparar por posición, no por nombre,
    // porque ambos pueden tener el mismo personaje)
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

    // Construir las dos cartas con el centro
    contenedor.innerHTML =
        '<div class="duelo-cartas">' +
            '<div class="duelo-carta ' + claseJugador + '">' + crearCartaModal(personajeJugador) + '</div>' +
            '<div class="duelo-centro">' +
                '<span class="duelo-vs">VS</span>' +
            '</div>' +
            '<div class="duelo-carta ' + claseEnemigo + '">' + crearCartaModal(personajeEnemigo) + '</div>' +
        '</div>'

    // Abrir dialog y animar después de que el browser pinte
    dialogo.showModal()

    requestAnimationFrame(function () {
        let inners = contenedor.querySelectorAll(".carta-resultado-inner")
        inners.forEach(function (el) {
            el.classList.add("animar")
        })
    })
}

// Crear el HTML de una carta para el modal
function crearCartaModal(personaje) {
    return '<div class="carta-resultado-inner">' +
        '<div class="carta-modal-frente"></div>' +
        '<div class="carta-modal-reverso" style="background-image:url(' + imagenesPersonajes[personaje] + ')">' +
            '<img class="carta-modal-nombre-img" src="' + imagenesNombres[personaje] + '" alt="' + personaje + '">' +
        '</div>' +
    '</div>'
}

// Crear mensaje en el registro de combate
function crearMensaje(resultado) {
    let seccionMensaje = document.getElementById("mensajes")
    let parrafo = document.createElement("p")

    parrafo.innerHTML =
        "Ronda " + rondas + ": " +
        ataqueJugador + " vs " + ataqueEnemigo +
        " — <strong>" + resultado + "</strong>"

    if (resultado === "GANASTE") {
        parrafo.classList.add("mensaje-victoria")
    }
    else if (resultado === "PERDISTE") {
        parrafo.classList.add("mensaje-derrota")
    }

    seccionMensaje.appendChild(parrafo)
    seccionMensaje.scrollTop = seccionMensaje.scrollHeight
}

// Inclinación suave de las cartas siguiendo el puntero (máximo 10 grados).
// Se omite si el sistema pide movimiento reducido o el puntero es táctil
function configurarInclinacionCartas() {
    let movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let punteroTactil = window.matchMedia("(pointer: coarse)").matches

    if (movimientoReducido || punteroTactil) {
        return
    }

    let cartas = document.querySelectorAll(".carta")

    cartas.forEach(function (carta) {
        carta.addEventListener("pointermove", inclinarCarta)
        carta.addEventListener("pointerleave", enderezarCarta)
    })
}

// Calcular la inclinación según la posición del puntero dentro de la carta
function inclinarCarta(evento) {
    let carta = evento.currentTarget
    let rectangulo = carta.getBoundingClientRect()
    let posicionX = (evento.clientX - rectangulo.left) / rectangulo.width - 0.5
    let posicionY = (evento.clientY - rectangulo.top) / rectangulo.height - 0.5

    carta.style.setProperty("--inclinacion-x", (posicionY * -20) + "deg")
    carta.style.setProperty("--inclinacion-y", (posicionX * 20) + "deg")
}

// Volver la carta a su posición de reposo al salir el puntero
function enderezarCarta(evento) {
    let carta = evento.currentTarget
    carta.style.setProperty("--inclinacion-x", "0deg")
    carta.style.setProperty("--inclinacion-y", "0deg")
}

// Número aleatorio
function aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// Cargar juego
window.addEventListener("load", iniciarJuego)
