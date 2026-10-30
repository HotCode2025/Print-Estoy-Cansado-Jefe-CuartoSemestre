// Arena del duelo (E4)
//
// Une el motor de turnos con la pantalla. El motor no sabe que existe un canvas:
// acá se traduce cada resultado a una cola de eventos visuales que mapa.js
// dibuja cuadro a cuadro, y a los botones de ataque del kit de cada nación.
//
// La partida es al mejor de tres rondas: cada ronda es un duelo a vida 100 con
// el motor, y el que gana la ronda suma un win. Primero en dos, o más wins
// cuando se acaban las tres rondas.
//
// Este archivo no dibuja: expone estado para mapa.js y hud.js, y ejecuta las
// decisiones del motor. Así el dibujo y las reglas se pueden tocar por separado.

const DURACION_GOLPE_MS = 430
const DURACION_CANCELADO_MS = 380
const DURACION_RESIDUAL_MS = 360
// S7: reloj de turno. Al agotarse se ejecuta el ataque básico.
const RELOJ_TURNO_MS = 12000
const RONDAS_PARA_GANAR = 2
const RONDAS_MAXIMAS = 3

// Duelo de la ronda en curso. null antes de empezar y después de reiniciar.
let dueloArena = null
let rondaArena = 1
let winsJugador = 0
let winsEnemigo = 0
// Cola de eventos visuales del turno que se está representando.
let colaArena = []
let eventoArena = null
let eventoArenaRestante = 0
let relojArena = RELOJ_TURNO_MS
// Mientras hay animación o cartel, no se puede elegir: evita dos turnos de golpe.
let turnoBloqueado = true
let rondaCerrada = false
// La ronda en curso cerró por el tope de turnos del motor, no por K.O.
let rondaPorTurnos = false

// ---- Ciclo de la partida ----

function crearLuchadorArena(idPersonaje) {
    const datos = buscarPersonaje(idPersonaje)
    return datos ? Kits.luchadorDesdePersonaje(datos) : null
}

function crearDueloArena() {
    const jugador = crearLuchadorArena(personajeJugador)
    const enemigo = crearLuchadorArena(personajeEnemigo)
    if (!jugador || !enemigo) {
        return null
    }
    return Motor.crearDuelo({ jugador: jugador, enemigo: enemigo })
}

// Arranca la partida: ronda 1, sin wins y con los botones listos.
function iniciarDueloArena() {
    winsJugador = 0
    winsEnemigo = 0
    rondaArena = 1
    dueloArena = crearDueloArena()
    relojArena = RELOJ_TURNO_MS
    colaArena = []
    eventoArena = null
    eventoArenaRestante = 0
    rondaCerrada = false
    rondaPorTurnos = false
    turnoBloqueado = false
    actualizarMarcadorArena()
    actualizarBotonesArena()
    anunciarArena("Elegí tu ataque.")
}

// Ronda nueva: vida 100 y energía 0 otra vez, con el mismo rival.
function nuevaRondaArena(numero) {
    rondaArena = numero || rondaArena + 1
    dueloArena = crearDueloArena()
    relojArena = RELOJ_TURNO_MS
    colaArena = []
    eventoArena = null
    eventoArenaRestante = 0
    rondaCerrada = false
    rondaPorTurnos = false
    turnoBloqueado = true
    actualizarBotonesArena()
    anunciarArena("Ronda " + rondaArena + ": elegí tu ataque.")
}

// El cartel de la ronda terminó: se habilita el primer turno.
function reanudarRondaArena() {
    if (!dueloArena || Motor.estaTerminado(dueloArena)) {
        return
    }
    turnoBloqueado = false
    relojArena = RELOJ_TURNO_MS
    actualizarBotonesArena()
}

// ¿Qué toca después de cerrar la ronda? Lo decide la cuenta de wins.
function siguientePasoArena() {
    if (winsJugador >= RONDAS_PARA_GANAR || winsEnemigo >= RONDAS_PARA_GANAR) {
        return { tipo: "partida" }
    }
    if (rondaArena >= RONDAS_MAXIMAS) {
        return { tipo: "partida" }
    }
    return { tipo: "ronda", numero: rondaArena + 1 }
}

// Resultado de la partida para la etapa 4. Se decide por rondas ganadas, no por
// la vida que quedó: la vida es de cada ronda, las wins son de la partida.
function resultadoPartidaArena() {
    if (esPartidaOnline() && rolLocalArena() === "enemigo") {
        if (winsEnemigo > winsJugador) {
            return "GANASTE"
        }
        if (winsJugador > winsEnemigo) {
            return "PERDISTE"
        }
        return "EMPATE"
    }
    if (winsJugador > winsEnemigo) {
        return "GANASTE"
    }
    if (winsEnemigo > winsJugador) {
        return "PERDISTE"
    }
    return "EMPATE"
}

// Marcador de rondas ganadas para el resumen de cierre.
function marcadorPartidaArena() {
    if (esPartidaOnline() && rolLocalArena() === "enemigo") {
        return { jugador: winsEnemigo, enemigo: winsJugador }
    }
    return { jugador: winsJugador, enemigo: winsEnemigo }
}

// Cartel del cierre: el último K.O. ya se vio, así que la arena anuncia el
// resultado de la partida antes de pasar a la etapa 4.
function textoFinalArena() {
    const resultado = resultadoPartidaArena()
    if (resultado === "GANASTE") {
        return "VICTORIA"
    }
    if (resultado === "PERDISTE") {
        return "DERROTA"
    }
    return "EMPATE"
}

function cerrarRondaArena() {
    if (rondaCerrada || !dueloArena) {
        return
    }
    rondaCerrada = true
    turnoBloqueado = true
    const ganador = dueloArena.ganador
    if (ganador === "jugador") {
        winsJugador++
    }
    else if (ganador === "enemigo") {
        winsEnemigo++
    }
    registrarRondaArena(ganadorLocalArena(ganador))
    actualizarMarcadorArena()
    actualizarBotonesArena()
}

function ganadorLocalArena(ganador) {
    if (esPartidaOnline() && rolLocalArena() === "enemigo") {
        if (ganador === "jugador") {
            return "enemigo"
        }
        if (ganador === "enemigo") {
            return "jugador"
        }
    }
    return ganador
}

// Una línea por ronda terminada en el registro de combate de la página.
function registrarRondaArena(ganador) {
    const seccion = document.getElementById("mensajes")
    if (!seccion) {
        return
    }
    const jugador = dueloArena ? Motor.buscarLuchador(dueloArena, "jugador") : null
    const enemigo = dueloArena ? Motor.buscarLuchador(dueloArena, "enemigo") : null
    const parrafo = document.createElement("p")
    let resultado = "EMPATE"
    if (ganador === "jugador") {
        resultado = "GANASTE"
    }
    else if (ganador === "enemigo") {
        resultado = "PERDISTE"
    }
    const vidaJugador = jugador ? jugador.vida : 0
    const vidaEnemigo = enemigo ? enemigo.vida : 0
    parrafo.innerHTML =
        "Ronda " + rondaArena + ": " +
        resultado + " (" + vidaJugador + " - " + vidaEnemigo + ")" +
        (rondaPorTurnos ? " · por límite de turnos" : "")
    if (resultado === "GANASTE") {
        parrafo.classList.add("mensaje-victoria")
    }
    else if (resultado === "PERDISTE") {
        parrafo.classList.add("mensaje-derrota")
    }
    seccion.appendChild(parrafo)
    seccion.scrollTop = seccion.scrollHeight
    const vacio = document.getElementById("registro-vacio")
    if (vacio) {
        vacio.hidden = true
    }
    // El ranking de la etapa 3 cuenta rondas, no turnos.
    rondas = rondaArena
}

// ---- Turno ----

function motivoArena(motivo) {
    if (motivo === "energia") {
        return "No tenés energía suficiente para ese ataque."
    }
    if (motivo === "recarga") {
        return "Ese ataque todavía está en recarga."
    }
    if (motivo === "terminado") {
        return "La ronda ya terminó."
    }
    if (motivo === "sin-vida") {
        return "Tu personaje no puede atacar."
    }
    return "Ese ataque no está disponible."
}

// Elegir un ataque resuelve el turno completo: jugador y rival. La animación
// se reproduce después, desde la cola, pero el resultado ya está decidido.
// `prefijo` permite avisar algo antes del resumen (por ejemplo, el reloj vencido).
function elegirAtaqueArena(ataqueId, prefijo) {
    if (!dueloArena || turnoBloqueado || Motor.estaTerminado(dueloArena)) {
        return false
    }
    if (esPartidaOnline()) {
        const enviado = enviarAtaqueOnline(ataqueId, dueloArena.turno)
        if (!enviado) {
            anunciarArena("Se perdió la conexión con el servidor.")
            return false
        }
        turnoBloqueado = true
        actualizarBotonesArena()
        anunciarArena("Ataque enviado. Esperando la elección del rival…")
        return true
    }
    const intento = Motor.elegir(dueloArena, "jugador", ataqueId)
    if (!intento.ok) {
        anunciarArena(motivoArena(intento.motivo))
        return false
    }
    const eleccionRival = Motor.elegirIA(dueloArena, "enemigo")
    if (!eleccionRival.ok) {
        // Sin elección del rival no hay turno: se revierte la del jugador.
        dueloArena.elecciones.jugador = null
        anunciarArena("El rival no puede responder.")
        return false
    }

    turnoBloqueado = true
    relojArena = RELOJ_TURNO_MS
    const resultado = Motor.resolver(dueloArena)
    // El motor cierra la ronda por K.O. o por el tope de turnos; la arena tiene
    // que decirlo distinto, no anunciar un K.O. que no hubo.
    rondaPorTurnos = Boolean(resultado.porTurnos)
    colaArena = construirColaArena(resultado)
    eventoArena = null
    eventoArenaRestante = 0
    const resumen = textoUltimoTurno(resultado)
    anunciarArena(prefijo ? prefijo + " " + resumen : resumen)
    actualizarBotonesArena()
    return true
}

function aplicarTurnoOnline(mensaje) {
    if (!dueloArena || !mensaje || mensaje.turno !== dueloArena.turno) {
        anunciarArena("La partida quedó desincronizada. Reiniciá para volver a la selección.")
        bloquearBotonesArena()
        return
    }
    for (const rol of ["jugador", "enemigo"]) {
        const intento = Motor.elegir(dueloArena, rol, mensaje.elecciones[rol])
        if (!intento.ok) {
            anunciarArena("No se pudo sincronizar el turno. Reiniciá la partida.")
            bloquearBotonesArena()
            return
        }
    }
    const resultado = Motor.resolver(dueloArena)
    if (!resultado.ok) {
        anunciarArena("El turno no se pudo resolver. Reiniciá la partida.")
        bloquearBotonesArena()
        return
    }
    turnoBloqueado = true
    relojArena = RELOJ_TURNO_MS
    rondaPorTurnos = Boolean(resultado.porTurnos)
    colaArena = construirColaArena(resultado)
    eventoArena = null
    eventoArenaRestante = 0
    const resultadoServidor = mensaje.resultado
    const estadoLocal = estadoDueloArena()
    const estadoServidor = mensaje.estado
    if (!resultadoServidor ||
        resultadoServidor.ganador !== resultado.ganador ||
        !estadoServidor ||
        estadoLocal.jugador.vida !== estadoServidor.jugador.vida ||
        estadoLocal.jugador.energia !== estadoServidor.jugador.energia ||
        estadoLocal.enemigo.vida !== estadoServidor.enemigo.vida ||
        estadoLocal.enemigo.energia !== estadoServidor.enemigo.energia) {
        console.error("El resultado del motor local difiere del turno confirmado por el servidor.")
    }
    const rolLocal = rolLocalArena()
    const rolesPorTiempo = Array.isArray(mensaje.porTiempo) ? mensaje.porTiempo : []
    const prefijo = rolesPorTiempo.includes(rolLocal)
        ? "Se acabó el tiempo: ataque básico."
        : rolesPorTiempo.length > 0 ? "El rival se quedó sin tiempo." : ""
    anunciarArena(prefijo ? prefijo + " " + textoUltimoTurno(resultado) : textoUltimoTurno(resultado))
    actualizarInterfazOnline("Turno resuelto. Elegí tu próximo ataque.")
    actualizarBotonesArena()
}

function rechazarAtaqueOnline(mensaje) {
    turnoBloqueado = false
    actualizarBotonesArena()
    anunciarArena(mensaje || "El servidor rechazó el ataque. Elegí otra opción.")
}

// Resumen del turno para el aviso de la página. La acción fina se ve en el canvas.
function textoUltimoTurno(resultado) {
    const partes = []
    for (const golpe of resultado.golpes) {
        const rolLocal = esPartidaOnline() ? rolLocalArena() : "jugador"
        const quien = golpe.atacante === rolLocal ? "Usaste" : "El rival usó"
        partes.push(quien + " " + golpe.ataqueNombre + " (-" + golpe.dano + ")")
    }
    for (const cancelado of resultado.cancelados) {
        const rolLocal = esPartidaOnline() ? rolLocalArena() : "jugador"
        if (cancelado.motivo === "aturdido") {
            partes.push((cancelado.rol === rolLocal ? "Quedaste" : "El rival quedó") + " aturdido")
        }
        else if (cancelado.motivo === "sin-energia") {
            partes.push(cancelado.rol === rolLocal
                ? "Te robaron la energía: tu ataque no llegó"
                : "Le robaste la energía al rival: su ataque no llegó")
        }
    }
    if (resultado.residual.length > 0) {
        partes.push("La quemadura hizo " + resultado.residual[0].dano + " de daño")
    }
    if (resultado.terminado) {
        const ganador = ganadorLocalArena(resultado.ganador)
        partes.push(ganador === "jugador" ? "¡Ganaste la ronda!" : ganador === "enemigo" ? "Perdiste la ronda" : "Ronda empatada")
    }
    return partes.join(" · ")
}

// Convierte el resultado del motor en eventos visuales con duración.
function construirColaArena(resultado) {
    const cola = []
    for (const golpe of resultado.golpes) {
        cola.push({
            tipo: "golpe",
            rol: golpe.atacante,
            objetivo: golpe.defensor,
            dano: golpe.dano,
            texto: "-" + golpe.dano,
            ventaja: golpe.ventaja,
            duracion: DURACION_GOLPE_MS
        })
        if (golpe.curado > 0) {
            cola.push({
                tipo: "cura",
                rol: golpe.atacante,
                objetivo: golpe.atacante,
                texto: "+" + golpe.curado,
                duracion: DURACION_RESIDUAL_MS
            })
        }
        if (golpe.estadoAplicado) {
            cola.push({
                tipo: "estado",
                rol: golpe.defensor,
                objetivo: golpe.defensor,
                texto: golpe.estadoAplicado === "quemadura" ? "QUEMADURA" : "ATURDIDO",
                duracion: DURACION_CANCELADO_MS
            })
        }
    }
    for (const cancelado of resultado.cancelados) {
        cola.push({
            tipo: "cancelado",
            rol: cancelado.rol,
            objetivo: cancelado.rol,
            texto: cancelado.motivo === "aturdido"
                ? "ATURDIDO"
                : cancelado.motivo === "sin-energia" ? "SIN ENERGÍA" : "NO LLEGÓ",
            duracion: DURACION_CANCELADO_MS
        })
    }
    for (const residual of resultado.residual) {
        cola.push({
            tipo: "residual",
            rol: residual.rol,
            objetivo: residual.rol,
            dano: residual.dano,
            texto: "-" + residual.dano,
            duracion: DURACION_RESIDUAL_MS
        })
    }
    // El cartel K.O. no va acá: lo muestra mapa.js cuando la cola se vacía, así
    // no hay dos K.O. seguidos (uno de la cola y otro del anuncio de ronda).
    return cola
}

// Un cuadro de animación. Cuando la cola se vacía y el duelo terminó, cierra la
// ronda y avisa con "ronda-cerrada" para que mapa.js muestre el cartel K.O.
// Si no terminó, devuelve el control al jugador y corre el reloj del turno.
function avanzarArena(deltaMs) {
    if (!dueloArena) {
        return
    }
    const delta = deltaMs || 16
    if (eventoArena) {
        eventoArenaRestante -= delta
        eventoArena.progreso = Math.max(0, Math.min(1, 1 - eventoArenaRestante / eventoArena.duracion))
        if (eventoArenaRestante <= 0) {
            eventoArena = null
        }
        return
    }
    if (colaArena.length > 0) {
        eventoArena = colaArena.shift()
        eventoArena.progreso = 0
        eventoArenaRestante = eventoArena.duracion
        return
    }
    if (Motor.estaTerminado(dueloArena)) {
        if (rondaCerrada) {
            return
        }
        const porTurnos = rondaPorTurnos
        cerrarRondaArena()
        // El cierre por tope de turnos no es un K.O.: mapa.js anuncia otro cartel.
        return porTurnos ? "tiempo-cerrado" : "ronda-cerrada"
    }
    if (turnoBloqueado) {
        turnoBloqueado = false
        relojArena = RELOJ_TURNO_MS
        actualizarBotonesArena()
        return
    }
    avanzarRelojArena(delta)
}

function avanzarRelojArena(deltaMs) {
    if (relojArena <= 0) {
        return
    }
    relojArena = Math.max(0, relojArena - deltaMs)
    if (relojArena > 0) {
        return
    }
    if (esPartidaOnline()) {
        return
    }
    const basico = Motor.ataquesDe(dueloArena, "jugador").find(function (a) {
        return a.costo === 0 && a.disponible
    })
    if (basico) {
        elegirAtaqueArena(basico.id, "Se acabó el tiempo: ataque básico.")
    }
}

// ---- Estado para dibujar ----

// Desplazamiento horizontal del luchador según el evento activo. El atacante se
// lanza hacia el rival y vuelve; el defensor se sacude.
function desplazamientoArena(rol) {
    if (!eventoArena || (eventoArena.tipo !== "golpe" && eventoArena.tipo !== "residual")) {
        return 0
    }
    const progreso = eventoArena.progreso || 0
    const direccion = rol === "jugador" ? 1 : -1
    if (eventoArena.tipo === "golpe" && eventoArena.rol === rol) {
        return Math.sin(progreso * Math.PI) * 48 * direccion
    }
    if (eventoArena.objetivo === rol) {
        return Math.sin(progreso * Math.PI * 7) * (1 - progreso) * 9 * direccion
    }
    return 0
}

// Tinte del luchador: rojo al recibir, verde al curarse, naranja en el residual.
function tinteArena(rol) {
    if (!eventoArena) {
        return null
    }
    const progreso = eventoArena.progreso || 0
    const pulso = Math.sin(progreso * Math.PI)
    if (eventoArena.tipo === "golpe" && eventoArena.objetivo === rol) {
        return { color: "255, 92, 64", alfa: pulso * 0.5 }
    }
    if (eventoArena.tipo === "cura" && eventoArena.rol === rol) {
        return { color: "110, 214, 140", alfa: pulso * 0.38 }
    }
    if (eventoArena.tipo === "residual" && eventoArena.rol === rol) {
        return { color: "255, 140, 40", alfa: pulso * 0.45 }
    }
    return null
}

// Texto flotante del evento activo: número de daño, cura o estado.
function flotanteArena(rol) {
    if (!eventoArena || eventoArena.objetivo !== rol || !eventoArena.texto) {
        return null
    }
    const progreso = eventoArena.progreso || 0
    let color = "#F6EDD8"
    if (eventoArena.tipo === "golpe" || eventoArena.tipo === "residual") {
        color = "#FF7A5C"
    }
    else if (eventoArena.tipo === "cura") {
        color = "#7FE0A0"
    }
    else if (eventoArena.tipo === "cancelado" || eventoArena.tipo === "estado") {
        color = "#F2C14E"
    }
    return {
        texto: eventoArena.texto,
        color: color,
        subida: progreso * 54,
        alfa: progreso < 0.7 ? 1 : Math.max(0, (1 - progreso) / 0.3)
    }
}

// Estado que consume mapa.js en cada cuadro.
function estadoVisualArena() {
    return {
        evento: eventoArena,
        desplazamientoJugador: desplazamientoArena("jugador"),
        desplazamientoEnemigo: desplazamientoArena("enemigo"),
        tinteJugador: tinteArena("jugador"),
        tinteEnemigo: tinteArena("enemigo"),
        flotanteJugador: flotanteArena("jugador"),
        flotanteEnemigo: flotanteArena("enemigo")
    }
}

function estadosDeArena(luchador) {
    if (!luchador) {
        return []
    }
    return luchador.estados.map(function (estado) {
        return { tipo: estado.tipo, turnos: estado.turnosRestantes }
    })
}

// Números del HUD. Vida en 0-1 para que la barra siga suavizándose en mapa.js.
function estadoDueloArena() {
    if (!dueloArena) {
        return null
    }
    const jugador = Motor.buscarLuchador(dueloArena, "jugador")
    const enemigo = Motor.buscarLuchador(dueloArena, "enemigo")
    return {
        jugador: {
            vida: jugador.vida,
            vidaMaxima: jugador.vidaMaxima,
            fraccion: jugador.vida / jugador.vidaMaxima,
            energia: jugador.energia,
            energiaMaxima: jugador.energiaMaxima,
            estados: estadosDeArena(jugador)
        },
        enemigo: {
            vida: enemigo.vida,
            vidaMaxima: enemigo.vidaMaxima,
            fraccion: enemigo.vida / enemigo.vidaMaxima,
            energia: enemigo.energia,
            energiaMaxima: enemigo.energiaMaxima,
            estados: estadosDeArena(enemigo)
        },
        ronda: rondaArena,
        winsJugador: winsJugador,
        winsEnemigo: winsEnemigo,
        reloj: relojArena / RELOJ_TURNO_MS,
        terminado: Motor.estaTerminado(dueloArena),
        turno: dueloArena.turno
    }
}

// ---- Botones y avisos ----

function textoCostoArena(costo) {
    return costo === 0 ? "gratis" : costo + " energía"
}

// Los botones se generan desde el kit de la nación elegida: cada personaje trae
// cuatro ataques distintos, así que no pueden ser tres botones fijos en el HTML.
function actualizarBotonesArena() {
    const contenedor = document.getElementById("acciones-duelo")
    if (!contenedor) {
        return
    }
    if (!dueloArena) {
        contenedor.innerHTML = ""
        return
    }
    const rol = esPartidaOnline() ? rolLocalArena() : "jugador"
    const ataques = Motor.ataquesDe(dueloArena, rol)
    const puedeElegir = !turnoBloqueado && !Motor.estaTerminado(dueloArena)
    contenedor.innerHTML = ""
    for (const ataque of ataques) {
        const boton = document.createElement("button")
        boton.type = "button"
        boton.className = "boton boton-ataque"
        boton.dataset.ataque = ataque.id
        boton.disabled = !puedeElegir || !ataque.disponible
        if (!ataque.disponible) {
            boton.title = motivoArena(ataque.motivo)
        }
        else if (!puedeElegir) {
            boton.title = "Esperá a que termine la animación."
        }
        else {
            boton.title = ataque.nombre + ": " + textoCostoArena(ataque.costo) + ", " + ataque.danoFinal + " de daño"
        }
        const marca = ataque.ventaja === "ventaja" ? " ↑" : ataque.ventaja === "desventaja" ? " ↓" : ""
        boton.innerHTML =
            '<span class="ataque-nombre">' + ataque.nombre + marca + "</span>" +
            '<span class="ataque-detalle">' + textoCostoArena(ataque.costo) + " · " + ataque.danoFinal + " daño</span>"
        contenedor.appendChild(boton)
    }
}

function bloquearBotonesArena() {
    const contenedor = document.getElementById("acciones-duelo")
    if (!contenedor) {
        return
    }
    contenedor.querySelectorAll("[data-ataque]").forEach(function (boton) {
        boton.disabled = true
    })
}

function anunciarArena(texto) {
    const aviso = document.getElementById("aviso-turno")
    if (aviso) {
        aviso.textContent = texto || ""
    }
}

function actualizarMarcadorArena() {
    const marcadorJugador = document.getElementById("vidas-jugador")
    const marcadorEnemigo = document.getElementById("vidas-enemigo")
    const marcador = marcadorPartidaArena()
    if (marcadorJugador) {
        marcadorJugador.textContent = String(marcador.jugador)
    }
    if (marcadorEnemigo) {
        marcadorEnemigo.textContent = String(marcador.enemigo)
    }
}

// Un solo listener por delegación: los botones se recrean tras cada turno.
function configurarBotonesArena() {
    const contenedor = document.getElementById("acciones-duelo")
    if (!contenedor || contenedor.dataset.configurado === "1") {
        return
    }
    contenedor.dataset.configurado = "1"
    contenedor.addEventListener("click", function (evento) {
        const boton = evento.target.closest("[data-ataque]")
        if (boton) {
            elegirAtaqueArena(boton.dataset.ataque)
        }
    })
}

// Reinicio de partida: se suelta todo y se deja la arena lista para la próxima.
function reiniciarDueloArena() {
    dueloArena = null
    rondaArena = 1
    winsJugador = 0
    winsEnemigo = 0
    colaArena = []
    eventoArena = null
    eventoArenaRestante = 0
    relojArena = RELOJ_TURNO_MS
    turnoBloqueado = true
    rondaCerrada = false
    actualizarMarcadorArena()
    actualizarBotonesArena()
    anunciarArena("")
}
