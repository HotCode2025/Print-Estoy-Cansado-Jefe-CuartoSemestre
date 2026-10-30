// Cliente de salas WebSocket para partidas uno contra uno.
const conexionOnline = {
    socket: null,
    codigo: "",
    rol: "",
    enPartida: false,
    personajeListo: false,
    cerrarIntencionalmente: false,
    rivalDesconectado: false
}

function esPartidaOnline() {
    return conexionOnline.enPartida
}

function rolLocalArena() {
    return conexionOnline.rol === "guest" ? "enemigo" : "jugador"
}

function idPersonajeLocal() {
    return conexionOnline.rol === "guest" ? personajeEnemigo : personajeJugador
}

function idPersonajeRival() {
    return conexionOnline.rol === "guest" ? personajeJugador : personajeEnemigo
}

function actualizarInterfazOnline(mensaje) {
    const estado = document.getElementById("estado-online")
    const codigoVisible = document.getElementById("codigo-sala-visible")
    const entrada = document.getElementById("codigo-sala")
    const crear = document.getElementById("boton-crear-sala")
    const unirse = document.getElementById("boton-unirse-sala")
    const copiar = document.getElementById("boton-copiar-sala")
    const botonPersonaje = document.getElementById("boton-personaje")
    const conectado = Boolean(conexionOnline.socket && conexionOnline.socket.readyState === WebSocket.OPEN)

    if (estado && mensaje) {
        estado.textContent = mensaje
    }
    if (codigoVisible) {
        codigoVisible.hidden = !conexionOnline.codigo
        codigoVisible.textContent = conexionOnline.codigo
            ? "Código para compartir: " + conexionOnline.codigo
            : ""
    }
    if (copiar) {
        copiar.hidden = !conexionOnline.codigo
    }
    if (crear) {
        crear.disabled = conectado || Boolean(conexionOnline.codigo)
    }
    if (unirse) {
        unirse.disabled = conectado || Boolean(conexionOnline.codigo)
    }
    if (entrada) {
        entrada.disabled = conectado || Boolean(conexionOnline.codigo)
    }
    if (botonPersonaje) {
        botonPersonaje.textContent = conexionOnline.codigo
            ? conexionOnline.personajeListo ? "Esperando al rival…" : "Quedar listo para el duelo"
            : "Jugar contra la computadora"
        botonPersonaje.disabled = conexionOnline.personajeListo
    }
}

function enviarMensajeOnline(tipo, datos = {}) {
    const socket = conexionOnline.socket
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        return false
    }
    socket.send(JSON.stringify({ tipo: tipo, ...datos }))
    return true
}

function abrirConexionOnline(tipo, codigo) {
    if (conexionOnline.socket) {
        actualizarInterfazOnline("Ya hay una conexión online en curso.")
        return
    }
    if (!window.WebSocket) {
        actualizarInterfazOnline("Este navegador no admite conexiones WebSocket.")
        return
    }
    const protocolo = location.protocol === "https:" ? "wss:" : "ws:"
    const socket = new WebSocket(protocolo + "//" + location.host + "/online")
    conexionOnline.socket = socket
    conexionOnline.cerrarIntencionalmente = false
    conexionOnline.rivalDesconectado = false
    actualizarInterfazOnline("Conectando con el servidor de la partida…")

    socket.addEventListener("open", function () {
        if (tipo === "crear-sala") {
            enviarMensajeOnline("crear-sala")
        }
        else {
            enviarMensajeOnline("unirse-sala", { codigo: codigo })
        }
    })
    socket.addEventListener("message", function (evento) {
        let mensaje
        try {
            mensaje = JSON.parse(evento.data)
        }
        catch (error) {
            console.error("El servidor envió un mensaje online inválido.", error)
            actualizarInterfazOnline("No se pudo interpretar la respuesta del servidor.")
            return
        }
        manejarMensajeOnline(mensaje)
    })
    socket.addEventListener("error", function () {
        actualizarInterfazOnline("No se pudo conectar. Verificá que el servidor esté iniciado y que ambos usen la misma dirección.")
    })
    socket.addEventListener("close", function () {
        if (conexionOnline.socket !== socket) {
            return
        }
        const estabaEnPartida = conexionOnline.enPartida
        conexionOnline.socket = null
        if (!conexionOnline.cerrarIntencionalmente && !conexionOnline.rivalDesconectado) {
            if (estabaEnPartida) {
                conexionOnline.enPartida = false
                bloquearBotonesArena()
                anunciarArena("Se perdió la conexión con el servidor. Recargá la página para volver a jugar.")
                actualizarInterfazOnline("Se perdió la conexión con el servidor. Recargá la página para volver a jugar.")
            }
            else {
                conexionOnline.codigo = ""
                conexionOnline.rol = ""
                conexionOnline.personajeListo = false
                definirCartasDeshabilitadas(false)
                actualizarInterfazOnline("La conexión con la sala se cerró. Podés volver a intentarlo.")
            }
        }
        actualizarInterfazOnline()
    })
}

function manejarMensajeOnline(mensaje) {
    if (!mensaje || typeof mensaje.tipo !== "string") {
        actualizarInterfazOnline("El servidor devolvió una respuesta inválida.")
        return
    }
    if (mensaje.tipo === "sala-creada" || mensaje.tipo === "sala-unida") {
        conexionOnline.codigo = mensaje.codigo
        conexionOnline.rol = mensaje.rol
        actualizarInterfazOnline(mensaje.tipo === "sala-creada"
            ? "Sala creada. Elegí tu personaje y compartí el código para que se una el rival."
            : "Te uniste a la sala. Elegí tu personaje para comenzar.")
        return
    }
    if (mensaje.tipo === "rival-conectado") {
        actualizarInterfazOnline("El otro dispositivo se conectó. Cada jugador debe elegir su personaje.")
        return
    }
    if (mensaje.tipo === "personaje-seleccionado") {
        const nombre = mensaje.personaje && mensaje.personaje.nombre
        actualizarInterfazOnline((nombre || "El rival") + " ya eligió. Seleccioná tu personaje para empezar el duelo.")
        return
    }
    if (mensaje.tipo === "seleccion-confirmada") {
        actualizarInterfazOnline(mensaje.mensaje)
        return
    }
    if (mensaje.tipo === "partida-iniciada") {
        conexionOnline.enPartida = true
        actualizarInterfazOnline("Partida online conectada. Elegí tus ataques cuando sea tu turno.")
        iniciarPartidaOnline(mensaje)
        return
    }
    if (mensaje.tipo === "ataque-recibido") {
        actualizarInterfazOnline("Ataque enviado. Esperando la elección del rival…")
        return
    }
    if (mensaje.tipo === "turno-resuelto") {
        aplicarTurnoOnline(mensaje)
        return
    }
    if (mensaje.tipo === "esperando-rival") {
        actualizarInterfazOnline("Ronda terminada. Esperando que el rival continúe…")
        return
    }
    if (mensaje.tipo === "siguiente-ronda") {
        comenzarSiguienteRondaOnline(mensaje)
        return
    }
    if (mensaje.tipo === "partida-terminada") {
        terminarPartidaOnline(mensaje)
        return
    }
    if (mensaje.tipo === "error-ataque") {
        rechazarAtaqueOnline(mensaje.mensaje)
        return
    }
    if (mensaje.tipo === "rival-desconectado") {
        conexionOnline.rivalDesconectado = true
        conexionOnline.enPartida = false
        bloquearBotonesArena()
        const aviso = "El rival se desconectó. Recargá la página para volver a la selección."
        anunciarArena(aviso)
        actualizarInterfazOnline(aviso)
        return
    }
    if (mensaje.tipo === "error") {
        if (!conexionOnline.codigo && conexionOnline.socket) {
            const socket = conexionOnline.socket
            conexionOnline.socket = null
            socket.close()
        }
        else if (conexionOnline.codigo && conexionOnline.personajeListo && !conexionOnline.enPartida) {
            conexionOnline.personajeListo = false
            definirCartasDeshabilitadas(false)
        }
        if (conexionOnline.enPartida) {
            conexionOnline.enPartida = false
            bloquearBotonesArena()
            anunciarArena(mensaje.mensaje || "Error en la partida online. Recargá la página.")
        }
        actualizarInterfazOnline(mensaje.mensaje || "El servidor rechazó la solicitud.")
    }
}

function crearSalaOnline() {
    abrirConexionOnline("crear-sala")
}

function unirseSalaOnline() {
    const entrada = document.getElementById("codigo-sala")
    const codigo = entrada ? entrada.value.trim().toUpperCase() : ""
    if (!/^[A-F0-9]{6}$/.test(codigo)) {
        actualizarInterfazOnline("Ingresá el código de seis caracteres que te compartieron.")
        if (entrada) {
            entrada.focus()
        }
        return
    }
    abrirConexionOnline("unirse-sala", codigo)
}

function seleccionarPersonajeOnline(personaje) {
    if (!conexionOnline.codigo || !conexionOnline.socket) {
        return false
    }
    const enviado = enviarMensajeOnline("seleccionar-personaje", {
        personaje: {
            id: personaje.id,
            nombre: personaje.nombre,
            imagen: personaje.imagen,
            nombreImg: personaje.nombreImg,
            genero: personaje.genero,
            elemento: personaje.elemento,
            emblema: personaje.emblema
        }
    })
    if (enviado) {
        conexionOnline.personajeListo = true
        actualizarInterfazOnline("Enviando tu personaje al rival…")
    }
    return enviado
}

function enviarAtaqueOnline(ataqueId, turno) {
    return enviarMensajeOnline("ataque", { ataqueId: ataqueId, turno: turno })
}

function confirmarRondaOnline() {
    return enviarMensajeOnline("ronda-lista")
}

function cerrarConexionOnline() {
    const entrada = document.getElementById("codigo-sala")
    conexionOnline.cerrarIntencionalmente = true
    if (conexionOnline.socket) {
        enviarMensajeOnline("salir-sala")
        conexionOnline.socket.close()
    }
    conexionOnline.socket = null
    conexionOnline.codigo = ""
    conexionOnline.rol = ""
    conexionOnline.enPartida = false
    conexionOnline.personajeListo = false
    conexionOnline.rivalDesconectado = false
    if (entrada) {
        entrada.value = ""
    }
    actualizarInterfazOnline("También podés seguir jugando contra la computadora.")
}

function configurarOnline() {
    document.getElementById("boton-crear-sala").addEventListener("click", crearSalaOnline)
    document.getElementById("boton-unirse-sala").addEventListener("click", unirseSalaOnline)
    document.getElementById("codigo-sala").addEventListener("keydown", function (evento) {
        if (evento.key === "Enter") {
            evento.preventDefault()
            unirseSalaOnline()
        }
    })
    document.getElementById("boton-copiar-sala").addEventListener("click", async function () {
        try {
            await navigator.clipboard.writeText(conexionOnline.codigo)
            actualizarInterfazOnline("Código copiado. Compartilo con la otra persona.")
        }
        catch (error) {
            console.error("No se pudo copiar el código de la sala.", error)
            actualizarInterfazOnline("No se pudo copiar automáticamente. Compartí el código que aparece en pantalla.")
        }
    })
    actualizarInterfazOnline()
}
