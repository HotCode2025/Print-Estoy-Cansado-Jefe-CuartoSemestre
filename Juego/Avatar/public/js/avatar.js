// Plantilla de personajes: cada luchador es un objeto Personaje.
// Permite registrar una cantidad ilimitada (100, 1000, ...) sin cambiar la lógica del juego.
// Como maximo se pueden agregar 5 personajes debido al poco sentido de tener 1000 luchadores en la selección. Los 4 originales no cuentan para el límite.
class Personaje {
    constructor({ id, nombre, imagen, nombreImg, genero, vidas = 3, ataques = ["Puñetazo", "Patada", "Barrida"], elemento = "", claseCss = "", emblema = "", esAgregado = false }) {
        this.id = id
        this.nombre = nombre || id
        this.imagen = imagen
        this.nombreImg = nombreImg || ""
        this.genero = genero === "a" ? "a" : "o"
        this.vidas = vidas
        this.ataques = Array.isArray(ataques) && ataques.length > 0 ? ataques : ["Puñetazo", "Patada", "Barrida"]
        this.elemento = elemento
        this.claseCss = claseCss
        this.emblema = emblema
        this.esAgregado = Boolean(esAgregado)
    }

    esValido() {
        return Boolean(this.id) && Boolean(this.nombre) && Boolean(this.imagen)
    }

    nombreParaMensaje() {
        return this.nombre
    }

    cartaHTML() {
        const nombreHtml = this.nombreImg
            ? '<img src="' + this.nombreImg + '" alt="' + this.nombre + '" class="carta-nombre-img">'
            : '<span class="carta-nombre-img carta-nombre-texto">' + this.nombre + "</span>"
        const estiloFondo = this.imagen && this.claseCss.split(" ").includes("carta-personalizada")
            ? ' style="background-image:url(' + this.imagen + ')"'
            : ""
        return '<label class="carta ' + this.claseCss + '"' + estiloFondo + ">" +
            '<input type="radio" name="personaje" id="' + this.id + '" value="' + this.id + '">' +
            emblemaSVG(this.emblema) +
            nombreHtml +
            '<span class="carta-elemento">' + this.elemento + "</span>" +
            '<span class="carta-seleccion">ELEGIDO</span>' +
            "</label>"
    }
}

// Registro de personajes disponibles en la selección.
// Para sumar luchadores basta con agregar `new Personaje(...)` o usar agregarPersonaje(datos).
const NUM_BASE = 4
const MAX_AGREGADOS = 5
const MAX_TOTAL = NUM_BASE + MAX_AGREGADOS
const PERSONAJES = [
    new Personaje({ id: "Zuko", nombre: "Zuko", imagen: "./assets/zuko.webp", nombreImg: "./assets/name-zuko.webp", genero: "o", elemento: "Nación del Fuego", claseCss: "carta-fuego", emblema: "fuego", esAgregado: false }),
    new Personaje({ id: "Aang", nombre: "Aang", imagen: "./assets/aang.webp", nombreImg: "./assets/name-aang.webp", genero: "o", elemento: "Nómadas del Aire", claseCss: "carta-aire", emblema: "aire", esAgregado: false }),
    new Personaje({ id: "Katara", nombre: "Katara", imagen: "./assets/katara.webp", nombreImg: "./assets/name-katara.webp", genero: "a", elemento: "Tribu Agua", claseCss: "carta-agua", emblema: "agua", esAgregado: false }),
    new Personaje({ id: "Toph", nombre: "Toph", imagen: "./assets/toph.webp", nombreImg: "./assets/name-toph.webp", genero: "a", elemento: "Reino Tierra", claseCss: "carta-tierra", emblema: "tierra", esAgregado: false })
]

// Cantidad de personajes agregados por el formulario (los 4 base no cuentan).
function contarAgregados() {
    const marcados = PERSONAJES.filter(function (p) { return p.esAgregado })
    if (marcados.length > 0 || PERSONAJES.length <= NUM_BASE) {
        return marcados.length
    }
    return PERSONAJES.length - NUM_BASE
}

function limiteAgregadosAlcanzado() {
    return contarAgregados() >= MAX_AGREGADOS
}

// Emblemas SVG por nación (los mismos de la selección original)
function emblemaSVG(tipo) {
    if (tipo === "fuego") {
        return '<svg class="emblema" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
            '<path d="M50 14 C56 26 70 33 70 52 C70 68 61 78 50 78 C39 78 30 68 30 52 C30 41 37 36 40 28 C43 36 47 38 49 34 C51 30 47 22 50 14 Z" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M50 46 C54 52 58 55 58 62 C58 69 54 73 50 73 C46 73 42 69 42 62 C42 56 46 53 50 46 Z" stroke="currentColor" stroke-width="5" fill="none" stroke-linejoin="round"/>' +
            "</svg>"
    }
    if (tipo === "aire") {
        return '<svg class="emblema" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
            "<defs>" +
            '<path id="espiral-aire" d="M68 30 C52 18 30 24 24 42 C19 58 30 72 45 72 C57 72 66 64 65 53 C64 44 57 39 50 42 C44 45 43 52 48 56" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
            "</defs>" +
            '<use href="#espiral-aire"/>' +
            '<use href="#espiral-aire" transform="rotate(120 50 50)"/>' +
            '<use href="#espiral-aire" transform="rotate(240 50 50)"/>' +
            "</svg>"
    }
    if (tipo === "agua") {
        return '<svg class="emblema" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
            '<circle cx="50" cy="50" r="36" stroke="currentColor" stroke-width="5" fill="none"/>' +
            '<path d="M22 48 Q30 40 38 48 T54 48 T70 48" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/>' +
            '<path d="M26 62 Q34 54 42 62 T58 62 T74 62" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/>' +
            "</svg>"
    }
    return '<svg class="emblema" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
        '<circle cx="50" cy="50" r="36" stroke="currentColor" stroke-width="5" fill="none"/>' +
        '<rect x="36" y="36" width="28" height="28" stroke="currentColor" stroke-width="5" fill="none" stroke-linejoin="round"/>' +
        "</svg>"
}

// Buscar un personaje del registro por id
function buscarPersonaje(id) {
    return PERSONAJES.find(function (p) { return p.id === id })
}

// Mapas de compatibilidad derivados del registro (misma forma que antes)
const imagenesPersonajes = {}
const imagenesNombres = {}
const generoPersonajes = {}
function sincronizarMapas() {
    PERSONAJES.forEach(function (p) {
        imagenesPersonajes[p.id] = p.imagen
        imagenesNombres[p.id] = p.nombreImg || p.imagen
        generoPersonajes[p.id] = p.genero
    })
}
sincronizarMapas()

// Datos base por elemento para personajes agregados desde el formulario.
// Solo se aplican a tarjetas agregadas: fondo random_*.webp y color de nación
// para el nombre en fuente Spell of Asia. Los 4 originales no cambian.
const datosNacionAgregada = {
    fuego: { elemento: "Nación del Fuego", claseCss: "carta-personalizada carta-nacion-fuego", emblema: "fuego", imagen: "./assets/random_fuego.webp" },
    aire: { elemento: "Nómadas del Aire", claseCss: "carta-personalizada carta-nacion-aire", emblema: "aire", imagen: "./assets/random_aire.webp" },
    agua: { elemento: "Tribu Agua", claseCss: "carta-personalizada carta-nacion-agua", emblema: "agua", imagen: "./assets/random_agua.webp" },
    tierra: { elemento: "Reino Tierra", claseCss: "carta-personalizada carta-nacion-tierra", emblema: "tierra", imagen: "./assets/random_tierra.webp" }
}

// Compatibilidad: alias con las claves capitalizadas que usaba el formulario.
const datosPorElemento = {
    Fuego: datosNacionAgregada.fuego,
    Aire: datosNacionAgregada.aire,
    Agua: datosNacionAgregada.agua,
    Tierra: datosNacionAgregada.tierra
}

// Normalizar el valor del select a una nación válida (insensible a mayúsculas).
function normalizarNacion(valor) {
    const clave = String(valor || "").trim().toLowerCase()
    if (datosNacionAgregada[clave]) {
        return clave
    }
    return "fuego"
}

// Agregar un personaje nuevo y volver a dibujar la selección.
// Las tarjetas agregadas usan nombre como texto (sin nombreImg) con color de nación.
function agregarPersonaje(datos) {
    if (limiteAgregadosAlcanzado()) {
        return null
    }
    const nacion = normalizarNacion(datos.elemento)
    const base = datosNacionAgregada[nacion]
    const id = (datos.id || datos.nombre || "").trim()
    if (!id) {
        return null
    }
    if (buscarPersonaje(id)) {
        return buscarPersonaje(id)
    }
    const personaje = new Personaje({
        id: id,
        nombre: (datos.nombre || id).trim(),
        imagen: datos.imagen || base.imagen,
        nombreImg: "",
        genero: datos.genero || "o",
        elemento: base.elemento,
        claseCss: base.claseCss,
        emblema: base.emblema,
        esAgregado: true
    })
    if (!personaje.esValido()) {
        return null
    }
    PERSONAJES.push(personaje)
    sincronizarMapas()
    renderSeleccion()
    return personaje
}

// Actualizar contador, aviso y estado del formulario según el límite.
function actualizarEstadoFormulario() {
    const agregados = contarAgregados()
    const contador = document.getElementById("contador-personajes")
    if (contador) {
        contador.textContent = "Agregados " + agregados + "/" + MAX_AGREGADOS
    }
    const alLimite = agregados >= MAX_AGREGADOS
    const campoNombre = document.getElementById("nuevo-nombre")
    const campoElemento = document.getElementById("nuevo-elemento")
    const botonAgregar = document.getElementById("boton-agregar-personaje")
    if (campoNombre) {
        campoNombre.disabled = alLimite
    }
    if (campoElemento) {
        campoElemento.disabled = alLimite
    }
    if (botonAgregar) {
        botonAgregar.disabled = alLimite
    }
    const aviso = document.getElementById("aviso-personaje")
    if (aviso && alLimite) {
        aviso.textContent = "Límite alcanzado: máximo " + MAX_AGREGADOS + " personajes agregados (" + MAX_TOTAL + " en total)."
    }
}

// Estado mutable de la partida, son let porque cambian durante el juego
let ataqueJugador
let ataqueEnemigo
let vidasJugador = 3
let vidasEnemigo = 3
let personajeJugador = ""
let personajeEnemigo = ""
let rondas = 0

// Clave de ranking persistente en localStorage
const claveRanking = "avatarRanking"

// Mostrar una etapa (1-3) ocultando las demás sin mover nodos ni reemplazar innerHTML.
// Los listeners se enlazan una sola vez en iniciarJuego/iniciarCombate.
function mostrarEtapa(n) {
    for (let i = 1; i <= 3; i++) {
        const etapa = document.getElementById("etapa-" + i)
        if (etapa) {
            etapa.hidden = (i !== n)
        }
    }

    const titulo = document.getElementById("titulo-etapa-" + n)
    if (titulo) {
        titulo.focus()
    }
}

// Iniciar juego
function iniciarJuego() {
    const botonPersonajeJugador = document.getElementById("boton-personaje")
    botonPersonajeJugador.addEventListener("click", seleccionarPersonajeJugador)

    const botonReiniciar = document.getElementById("boton-reiniciar")
    botonReiniciar.addEventListener("click", reiniciarPartida)

    const botonReiniciarModal = document.getElementById("boton-reiniciar-modal")
    botonReiniciarModal.addEventListener("click", reiniciarPartida)

    const botonJugarNuevo = document.getElementById("boton-jugar-nuevo")
    if (botonJugarNuevo) {
        botonJugarNuevo.addEventListener("click", reiniciarPartida)
    }

    const botonVerReglas = document.getElementById("boton-ver-reglas-etapa3")
    if (botonVerReglas) {
        botonVerReglas.addEventListener("click", abrirReglas)
    }

    configurarDialogoReglas()
    renderSeleccion()
    configurarFormularioPersonaje()

    mostrarEtapa(1)
    iniciarCombate()
}

// Dibujar las cartas de selección desde el registro PERSONAJES.
// Soporta una cantidad ilimitada de personajes sin cambiar este código.
function renderSeleccion() {
    const contenedor = document.getElementById("cartas-personajes")
    if (!contenedor) {
        return
    }
    contenedor.innerHTML = PERSONAJES.map(function (p) { return p.cartaHTML() }).join("")
    configurarInclinacionCartas()
    actualizarEstadoFormulario()
}

// Conectar el formulario que agrega personajes en clase sin editar código
function configurarFormularioPersonaje() {
    const formulario = document.getElementById("formulario-personaje")
    if (!formulario || formulario.dataset.configurado === "1") {
        return
    }
    formulario.dataset.configurado = "1"
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault()
        const campoNombre = document.getElementById("nuevo-nombre")
        const campoElemento = document.getElementById("nuevo-elemento")
        const aviso = document.getElementById("aviso-personaje")
        if (limiteAgregadosAlcanzado()) {
            if (aviso) {
                aviso.textContent = "Límite alcanzado: máximo " + MAX_AGREGADOS + " personajes agregados (" + MAX_TOTAL + " en total)."
            }
            actualizarEstadoFormulario()
            return
        }
        const nombre = campoNombre ? campoNombre.value.trim() : ""
        if (!nombre) {
            if (aviso) {
                aviso.textContent = "Escriba un nombre para agregar el personaje."
            }
            if (campoNombre) {
                campoNombre.focus()
            }
            return
        }
        const creado = agregarPersonaje({ id: nombre, nombre: nombre, elemento: campoElemento ? campoElemento.value : "Fuego" })
        if (!creado) {
            if (aviso) {
                aviso.textContent = "Límite alcanzado: máximo " + MAX_AGREGADOS + " personajes agregados (" + MAX_TOTAL + " en total)."
            }
            actualizarEstadoFormulario()
            return
        }
        if (aviso) {
            aviso.textContent = nombre + " se unió a la selección."
        }
        formulario.reset()
        actualizarEstadoFormulario()
        if (campoNombre && !campoNombre.disabled) {
            campoNombre.focus()
        }
    })
}

// Obtener el id del personaje marcado en la selección
function obtenerPersonajeMarcado() {
    const marcado = document.querySelector('input[name="personaje"]:checked')
    return marcado ? marcado.value : ""
}

// Deshabilitar o habilitar todas las cartas de selección
function definirCartasDeshabilitadas(deshabilitar) {
    document.querySelectorAll('input[name="personaje"]').forEach(function (input) {
        input.disabled = deshabilitar
    })
}

// Pintar un lado del marcador con imagen + nombre, sin texto solo.
// Base: silueta (Personaje.imagen) + imagen de nombre (nombreImg).
// Agregado: fondo de nación (Personaje.imagen) + nombre en texto Spell of Asia.
function actualizarMarcador(lado, idPersonaje) {
    const datos = buscarPersonaje(idPersonaje)
    if (!datos) {
        return
    }
    const esEnemigo = lado === "enemigo"
    const img = document.getElementById(esEnemigo ? "personaje-enemigo" : "personaje-jugador")
    const nombre = document.getElementById(esEnemigo ? "nombre-enemigo" : "nombre-jugador")
    if (img) {
        img.src = datos.imagen
        img.alt = datos.nombre
    }
    if (nombre) {
        if (datos.nombreImg) {
            nombre.innerHTML = '<img src="' + datos.nombreImg + '" alt="' + datos.nombre + '" class="marcador-nombre-img">'
        }
        else {
            nombre.innerHTML = '<span class="marcador-nombre-texto" style="color:' + colorNacionAgregada(datos.emblema) + '">' + datos.nombre + "</span>"
        }
    }
}

// Selección del personaje del jugador
function seleccionarPersonajeJugador() {
    const avisoSeleccion = document.getElementById("aviso-seleccion")

    const idElegido = obtenerPersonajeMarcado()
    const elegido = idElegido ? buscarPersonaje(idElegido) : undefined

    if (!elegido) {
        avisoSeleccion.innerHTML = "Primero selecciona un personaje para comenzar el combate"
        return
    }

    personajeJugador = elegido.id

    actualizarMarcador("jugador", personajeJugador)
    avisoSeleccion.innerHTML = ""

    // Deshabilitar selección de personaje para que no se cambie en medio del juego
    definirCartasDeshabilitadas(true)
    document.getElementById("boton-personaje").disabled = true

    habilitarAtaques()
    seleccionarPersonajeEnemigo()
    mostrarEtapa(2)
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

// Selección aleatoria del enemigo desde el registro (permite espejo: puede salir el mismo).
function seleccionarPersonajeEnemigo() {
    const indice = aleatorio(0, PERSONAJES.length - 1)

    personajeEnemigo = PERSONAJES[indice].id

    actualizarMarcador("enemigo", personajeEnemigo)
}

// Abrir y cerrar el cuadro de reglas
function abrirReglas() {
    document.getElementById("dialogo-reglas").showModal()
}

function cerrarReglas() {
    document.getElementById("dialogo-reglas").close()
}

function configurarDialogoReglas() {
    const botonReglas = document.getElementById("boton-reglas")
    const botonCerrarReglas = document.getElementById("boton-cerrar-reglas")

    botonReglas.addEventListener("click", abrirReglas)
    botonCerrarReglas.addEventListener("click", cerrarReglas)
}

// Reiniciar la partida restableciendo el estado sin recargar la página
function reiniciarPartida() {
    const dialogo = document.getElementById("dialogo-resultado")
    if (dialogo && dialogo.open) {
        dialogo.close()
    }

    vidasJugador = 3
    vidasEnemigo = 3
    rondas = 0
    personajeJugador = ""
    personajeEnemigo = ""
    ataqueJugador = undefined
    ataqueEnemigo = undefined

    document.getElementById("vidas-jugador").innerHTML = vidasJugador
    document.getElementById("vidas-enemigo").innerHTML = vidasEnemigo
    document.getElementById("mensajes").innerHTML = ""
    document.getElementById("aviso-seleccion").innerHTML = ""

    const imgJugador = document.getElementById("personaje-jugador")
    imgJugador.removeAttribute("src")
    imgJugador.alt = ""
    const nombreJugador = document.getElementById("nombre-jugador")
    if (nombreJugador) {
        nombreJugador.innerHTML = ""
    }
    const imgEnemigo = document.getElementById("personaje-enemigo")
    imgEnemigo.removeAttribute("src")
    imgEnemigo.alt = ""
    const nombreEnemigo = document.getElementById("nombre-enemigo")
    if (nombreEnemigo) {
        nombreEnemigo.innerHTML = ""
    }

    definirCartasDeshabilitadas(false)
    document.querySelectorAll('input[name="personaje"]').forEach(function (input) {
        input.checked = false
    })
    document.getElementById("boton-personaje").disabled = false

    deshabilitarAtaques()
    document.getElementById("reiniciar").hidden = true

    mostrarEtapa(1)
}

// Iniciar combate
function iniciarCombate() {
    const botonPunetazo = document.getElementById("boton-punetazo")
    botonPunetazo.addEventListener("click", ataquePunetazo)

    const botonPatada = document.getElementById("boton-patada")
    botonPatada.addEventListener("click", ataquePatada)

    const botonBarrida = document.getElementById("boton-barrida")
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
    const ataqueAleatorio = aleatorio(1, 3)

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

// Terminar la partida y mostrar la etapa de clasificación
function terminarPartida() {
    deshabilitarAtaques()
    document.getElementById("reiniciar").hidden = true

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

    mostrarResultadoFinal(resultado)
    actualizarRanking(resultado)
    mostrarEtapa(3)
}

// Leer el ranking persistente o devolver valores iniciales
function leerRanking() {
    const inicial = { victorias: 0, derrotas: 0, empates: 0, partidas: 0 }
    try {
        const guardado = window.localStorage.getItem(claveRanking)
        if (!guardado) {
            return inicial
        }
        const datos = JSON.parse(guardado)
        return {
            victorias: Number(datos.victorias) || 0,
            derrotas: Number(datos.derrotas) || 0,
            empates: Number(datos.empates) || 0,
            partidas: Number(datos.partidas) || 0
        }
    }
    catch (error) {
        return inicial
    }
}

// Actualizar el ranking con el resultado y volver a dibujarlo
function actualizarRanking(resultado) {
    const ranking = leerRanking()
    ranking.partidas++
    if (resultado === "GANASTE") {
        ranking.victorias++
    }
    else if (resultado === "PERDISTE") {
        ranking.derrotas++
    }
    else {
        ranking.empates++
    }

    try {
        window.localStorage.setItem(claveRanking, JSON.stringify(ranking))
    }
    catch (error) {
        // Sin almacenamiento disponible: se muestra igual la clasificación de la sesión
    }

    renderizarRanking(ranking)
}

// Dibujar la clasificación y el resumen de la partida desde #mensajes y rondas
function renderizarRanking(ranking) {
    const datos = ranking || leerRanking()

    document.getElementById("ranking-partidas").innerHTML = datos.partidas
    document.getElementById("ranking-victorias").innerHTML = datos.victorias
    document.getElementById("ranking-derrotas").innerHTML = datos.derrotas
    document.getElementById("ranking-empates").innerHTML = datos.empates

    const victoriasRonda = document.querySelectorAll("#mensajes .mensaje-victoria").length
    const derrotasRonda = document.querySelectorAll("#mensajes .mensaje-derrota").length
    let empatesRonda = rondas - victoriasRonda - derrotasRonda
    if (empatesRonda < 0) {
        empatesRonda = 0
    }

    document.getElementById("resumen-partida").innerHTML =
        "Esta partida: " + rondas + " rondas, " +
        victoriasRonda + " victorias, " +
        derrotasRonda + " derrotas y " +
        empatesRonda + " empates."
}

// Mostrar el resultado final dentro de la etapa 3 reutilizando crearCartaModal
function mostrarResultadoFinal(resultado) {
    const titulo = document.getElementById("titulo-etapa-3")
    const mensaje = document.getElementById("resultado-final-mensaje")
    const contenedor = document.getElementById("cartas-final-contenedor")

    mensaje.classList.remove("ganaste", "perdiste", "empate")

    if (resultado === "EMPATE") {
        titulo.innerHTML = "Empate"
        mensaje.innerHTML = "Ambos luchadores caen..."
        mensaje.classList.add("empate")
    }
    else if (resultado === "GANASTE") {
        const perdedor = personajeEnemigo
        titulo.innerHTML = "Victoria"
        mensaje.innerHTML = "¡" + perdedor + " ha sido derrotad" + generoPersonajes[perdedor] + "!"
        mensaje.classList.add("ganaste")
    }
    else {
        const caido = personajeJugador
        titulo.innerHTML = "Derrota"
        mensaje.innerHTML = caido + " ha caído en batalla"
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
            '<div class="duelo-carta ' + claseJugador + '">' + crearCartaModal(personajeJugador) + '</div>' +
            '<div class="duelo-centro">' +
                '<span class="duelo-vs">VS</span>' +
            '</div>' +
            '<div class="duelo-carta ' + claseEnemigo + '">' + crearCartaModal(personajeEnemigo) + '</div>' +
        '</div>'

    requestAnimationFrame(function () {
        const inners = contenedor.querySelectorAll(".carta-resultado-inner")
        inners.forEach(function (el) {
            el.classList.add("animar")
        })
    })
}

// Mostrar el modal con las dos cartas enfrentadas, ganador y perdedor
// Compatibilidad: ahora el resultado vive en la etapa 3; el diálogo queda sin uso.
function mostrarModalResultado(resultado) {
    mostrarResultadoFinal(resultado)
    mostrarEtapa(3)
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

// Crear mensaje en el registro de combate
function crearMensaje(resultado) {
    const seccionMensaje = document.getElementById("mensajes")
    const parrafo = document.createElement("p")

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

// Cargar juego
window.addEventListener("load", iniciarJuego)
