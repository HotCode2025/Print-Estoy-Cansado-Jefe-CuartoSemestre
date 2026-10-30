// Servidor estático y coordinador de partidas online para la red local.
import { createServer } from "node:http"
import { randomBytes } from "node:crypto"
import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"
import { WebSocketServer, WebSocket } from "ws"

const require = createRequire(import.meta.url)
const Motor = require("./public/js/motor.js")
const Kits = require("./public/js/kits.js")
const RAIZ = resolve(fileURLToPath(new URL("./public", import.meta.url)))
const PUERTO = Number(process.env.PORT) || 5173
const DURACION_TURNO_MS = 12_000
const ESPERA_ANIMACION_MS = 900
const LIMITE_SALAS = 250
const FONDOS_MAPA = ["./assets/glaciares_bg.webp", "./assets/salon_bg.webp", "./assets/valle_bg.webp"]
const IMAGENES_PERSONAJE = /^\.\/assets\/(?:zuko|aang|katara|toph|random_(?:fuego|aire|agua|tierra))\.webp$/i
const IMAGENES_NOMBRE = /^\.\/assets\/name-(?:zuko|aang|katara|toph)\.webp$/i

const TIPOS = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2"
}

function personajeSeguro(entrada) {
    if (!entrada || typeof entrada !== "object") {
        return null
    }
    const id = typeof entrada.id === "string" ? entrada.id.trim() : ""
    const nombre = typeof entrada.nombre === "string" ? entrada.nombre.trim() : ""
    const emblema = typeof entrada.emblema === "string" ? entrada.emblema.toLowerCase() : ""
    const imagen = typeof entrada.imagen === "string" ? entrada.imagen : ""
    const nombreImg = typeof entrada.nombreImg === "string" ? entrada.nombreImg : ""
    if (!/^[\p{L}\p{N} _'-]{1,24}$/u.test(id) ||
        !/^[\p{L}\p{N} _'-]{1,24}$/u.test(nombre) ||
        !["agua", "fuego", "aire", "tierra"].includes(emblema) ||
        !IMAGENES_PERSONAJE.test(imagen) ||
        (nombreImg && !IMAGENES_NOMBRE.test(nombreImg))) {
        return null
    }
    return {
        id: id,
        nombre: nombre,
        elemento: Kits.nombreDe(emblema),
        emblema: emblema,
        imagen: imagen,
        nombreImg: nombreImg,
        genero: entrada.genero === "a" ? "a" : "o"
    }
}

function crearDueloDeSala(sala) {
    return Motor.crearDuelo({
        jugador: Kits.luchadorDesdePersonaje(sala.selecciones.host),
        enemigo: Kits.luchadorDesdePersonaje(sala.selecciones.guest)
    })
}

function crearCodigo(salas) {
    let codigo
    do {
        codigo = randomBytes(3).toString("hex").toUpperCase()
    } while (salas.has(codigo))
    return codigo
}

export function crearServidorOnline(opciones = {}) {
    const salas = new Map()
    const servidor = createServer(async function (peticion, respuesta) {
        let archivo
        try {
            const ruta = decodeURIComponent(new URL(peticion.url || "/", "http://localhost").pathname)
            const relativa = ruta === "/" ? "avatar.html" : ruta.replace(/^\/+/, "")
            const destino = resolve(join(RAIZ, normalize(relativa)))
            if (destino !== RAIZ && !destino.startsWith(RAIZ + sep)) {
                respuesta.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
                respuesta.end("404: recurso inexistente")
                return
            }
            const info = await stat(destino)
            if (!info.isFile()) {
                throw new Error("No es un archivo")
            }
            archivo = destino
        }
        catch {
            respuesta.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
            respuesta.end("404: recurso inexistente")
            return
        }

        try {
            const cuerpo = await readFile(archivo)
            respuesta.writeHead(200, {
                "Content-Type": TIPOS[extname(archivo).toLowerCase()] || "application/octet-stream",
                "Cache-Control": "no-store",
                "Content-Length": cuerpo.length
            })
            respuesta.end(cuerpo)
        }
        catch (error) {
            console.error("No se pudo leer el recurso solicitado:", error)
            respuesta.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" })
            respuesta.end("500: no se pudo leer el recurso")
        }
    })
    const sockets = new WebSocketServer({ noServer: true, maxPayload: 4096 })

    function enviar(socket, tipo, datos = {}) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ tipo: tipo, ...datos }))
        }
    }

    function difundir(sala, tipo, datos = {}) {
        for (const socket of Object.values(sala.jugadores)) {
            if (socket) {
                enviar(socket, tipo, datos)
            }
        }
    }

    function borrarSala(sala) {
        if (sala.temporizadorTurno) {
            clearTimeout(sala.temporizadorTurno)
        }
        if (sala.temporizadorLimpieza) {
            clearTimeout(sala.temporizadorLimpieza)
        }
        salas.delete(sala.codigo)
        sala.cerrada = true
    }

    function finalizarTurno(sala, rolesPorTiempo = []) {
        if (sala.cerrada || !sala.duelo || sala.turnoEnResolucion) {
            return
        }
        sala.turnoEnResolucion = true
        if (sala.temporizadorTurno) {
            clearTimeout(sala.temporizadorTurno)
            sala.temporizadorTurno = null
        }
        for (const rol of ["jugador", "enemigo"]) {
            if (sala.elecciones[rol]) {
                continue
            }
            const basico = Motor.ataquesDe(sala.duelo, rol).find(function (ataque) {
                return ataque.costo === 0 && ataque.disponible
            })
            const eleccion = basico
                ? Motor.elegir(sala.duelo, rol, basico.id)
                : { ok: false }
            if (!eleccion.ok) {
                difundir(sala, "error", { mensaje: "No se pudo completar el turno a tiempo." })
                borrarSala(sala)
                return
            }
            sala.elecciones[rol] = basico.id
            rolesPorTiempo.push(rol)
        }
        const elecciones = { ...sala.elecciones }
        const resultado = Motor.resolver(sala.duelo)
        if (!resultado.ok) {
            difundir(sala, "error", { mensaje: "El servidor no pudo resolver el turno." })
            borrarSala(sala)
            return
        }
        sala.elecciones = { jugador: null, enemigo: null }
        sala.turnoEnResolucion = false
        sala.rondaTerminada = Motor.estaTerminado(sala.duelo)
        if (sala.rondaTerminada) {
            if (sala.duelo.ganador === "jugador") {
                sala.victorias.host++
            }
            else if (sala.duelo.ganador === "enemigo") {
                sala.victorias.guest++
            }
            sala.listosSiguienteRonda.clear()
        }
        difundir(sala, "turno-resuelto", {
            turno: resultado.turno,
            elecciones: elecciones,
            resultado: resultado,
            porTiempo: rolesPorTiempo,
            estado: {
                jugador: {
                    vida: Motor.buscarLuchador(sala.duelo, "jugador").vida,
                    energia: Motor.buscarLuchador(sala.duelo, "jugador").energia
                },
                enemigo: {
                    vida: Motor.buscarLuchador(sala.duelo, "enemigo").vida,
                    energia: Motor.buscarLuchador(sala.duelo, "enemigo").energia
                }
            }
        })
        if (!sala.rondaTerminada) {
            sala.temporizadorTurno = setTimeout(function () {
                finalizarTurno(sala, [])
            }, DURACION_TURNO_MS + ESPERA_ANIMACION_MS)
        }
    }

    function comenzarPartida(sala) {
        if (!sala.jugadores.host || !sala.jugadores.guest ||
            !sala.selecciones.host || !sala.selecciones.guest || sala.duelo) {
            return
        }
        sala.duelo = crearDueloDeSala(sala)
        sala.ronda = 1
        sala.victorias = { host: 0, guest: 0 }
        sala.elecciones = { jugador: null, enemigo: null }
        sala.rondaTerminada = false
        sala.listosSiguienteRonda = new Set()
        sala.turnoEnResolucion = false
        difundir(sala, "partida-iniciada", {
            codigo: sala.codigo,
            personajes: sala.selecciones,
            ronda: sala.ronda,
            fondo: FONDOS_MAPA[randomBytes(1)[0] % FONDOS_MAPA.length]
        })
        sala.temporizadorTurno = setTimeout(function () {
            finalizarTurno(sala, [])
        }, DURACION_TURNO_MS)
    }

    function manejarMensaje(socket, mensaje) {
        if (!mensaje || typeof mensaje !== "object" || typeof mensaje.tipo !== "string") {
            enviar(socket, "error", { mensaje: "Solicitud inválida." })
            return
        }
        if (!socket.sala) {
            if (mensaje.tipo === "crear-sala") {
                if (salas.size >= LIMITE_SALAS) {
                    enviar(socket, "error", { mensaje: "El servidor alcanzó el límite de salas." })
                    return
                }
                const codigo = crearCodigo(salas)
                const sala = {
                    codigo: codigo,
                    jugadores: { host: socket, guest: null },
                    selecciones: { host: null, guest: null },
                    duelo: null,
                    elecciones: { jugador: null, enemigo: null },
                    victorias: { host: 0, guest: 0 },
                    listosSiguienteRonda: new Set(),
                    ronda: 1,
                    rondaTerminada: false,
                    turnoEnResolucion: false,
                    temporizadorTurno: null,
                    temporizadorLimpieza: null,
                    cerrada: false
                }
                salas.set(codigo, sala)
                socket.sala = sala
                socket.rol = "host"
                enviar(socket, "sala-creada", { codigo: codigo, rol: "host" })
                return
            }
            if (mensaje.tipo === "unirse-sala") {
                const codigo = typeof mensaje.codigo === "string" ? mensaje.codigo.trim().toUpperCase() : ""
                const sala = salas.get(codigo)
                if (!/^[A-F0-9]{6}$/.test(codigo) || !sala || sala.jugadores.guest || sala.cerrada) {
                    enviar(socket, "error", { mensaje: "No existe una sala disponible con ese código." })
                    return
                }
                sala.jugadores.guest = socket
                socket.sala = sala
                socket.rol = "guest"
                enviar(socket, "sala-unida", { codigo: codigo, rol: "guest" })
                enviar(sala.jugadores.host, "rival-conectado")
                for (const rol of ["host", "guest"]) {
                    if (sala.selecciones[rol]) {
                        enviar(socket, "personaje-seleccionado", {
                            rol: rol,
                            personaje: sala.selecciones[rol]
                        })
                    }
                }
                comenzarPartida(sala)
                return
            }
            enviar(socket, "error", { mensaje: "Primero crea una sala o únete con un código." })
            return
        }

        const sala = socket.sala
        const rol = socket.rol
        if (sala.cerrada || sala.jugadores[rol] !== socket) {
            enviar(socket, "error", { mensaje: "La sala ya no está disponible." })
            return
        }
        if (mensaje.tipo === "seleccionar-personaje") {
            if (sala.duelo) {
                enviar(socket, "error", { mensaje: "La partida ya comenzó." })
                return
            }
            const personaje = personajeSeguro(mensaje.personaje)
            if (!personaje) {
                enviar(socket, "error", { mensaje: "El personaje enviado no es válido." })
                return
            }
            sala.selecciones[rol] = personaje
            enviar(sala.jugadores[rol === "host" ? "guest" : "host"], "personaje-seleccionado", {
                rol: rol,
                personaje: personaje
            })
            enviar(socket, "seleccion-confirmada", { mensaje: "Personaje seleccionado. Esperando al rival." })
            comenzarPartida(sala)
            return
        }
        if (mensaje.tipo === "ataque") {
            if (!sala.duelo || sala.rondaTerminada || sala.turnoEnResolucion ||
                mensaje.turno !== sala.duelo.turno) {
                enviar(socket, "error-ataque", { mensaje: "Ese turno ya no está disponible." })
                return
            }
            const rolDuelo = rol === "host" ? "jugador" : "enemigo"
            if (sala.elecciones[rolDuelo]) {
                enviar(socket, "error-ataque", { mensaje: "Ya elegiste un ataque para este turno." })
                return
            }
            if (typeof mensaje.ataqueId !== "string" || mensaje.ataqueId.length > 40) {
                enviar(socket, "error-ataque", { mensaje: "El ataque no es válido." })
                return
            }
            const intento = Motor.elegir(sala.duelo, rolDuelo, mensaje.ataqueId)
            if (!intento.ok) {
                enviar(socket, "error-ataque", { mensaje: "Ese ataque no está disponible." })
                return
            }
            sala.elecciones[rolDuelo] = mensaje.ataqueId
            enviar(socket, "ataque-recibido", { turno: sala.duelo.turno })
            if (sala.elecciones.jugador && sala.elecciones.enemigo) {
                finalizarTurno(sala, [])
            }
            return
        }
        if (mensaje.tipo === "ronda-lista") {
            if (!sala.rondaTerminada || sala.listosSiguienteRonda.has(rol)) {
                return
            }
            sala.listosSiguienteRonda.add(rol)
            if (sala.listosSiguienteRonda.size < 2) {
                enviar(sala.jugadores[rol === "host" ? "guest" : "host"], "esperando-rival")
                return
            }
            if (sala.victorias.host >= 2 || sala.victorias.guest >= 2 || sala.ronda >= 3) {
                sala.partidaTerminada = true
                difundir(sala, "partida-terminada", {
                    victorias: sala.victorias,
                    ganador: sala.victorias.host === sala.victorias.guest
                        ? null
                        : sala.victorias.host > sala.victorias.guest ? "host" : "guest"
                })
                sala.temporizadorLimpieza = setTimeout(function () {
                    borrarSala(sala)
                }, 60_000)
                return
            }
            sala.ronda++
            sala.duelo = crearDueloDeSala(sala)
            sala.elecciones = { jugador: null, enemigo: null }
            sala.rondaTerminada = false
            sala.turnoEnResolucion = false
            sala.listosSiguienteRonda.clear()
            difundir(sala, "siguiente-ronda", { ronda: sala.ronda, victorias: sala.victorias })
            sala.temporizadorTurno = setTimeout(function () {
                finalizarTurno(sala, [])
            }, DURACION_TURNO_MS + ESPERA_ANIMACION_MS)
            return
        }
        if (mensaje.tipo === "salir-sala") {
            desconectar(socket)
            return
        }
        enviar(socket, "error", { mensaje: "Acción online desconocida." })
    }

    function desconectar(socket) {
        const sala = socket.sala
        if (!sala || sala.cerrada) {
            return
        }
        const otroRol = socket.rol === "host" ? "guest" : "host"
        enviar(sala.jugadores[otroRol], "rival-desconectado")
        borrarSala(sala)
        for (const jugador of Object.values(sala.jugadores)) {
            if (jugador && jugador !== socket && jugador.readyState === WebSocket.OPEN) {
                jugador.sala = null
                jugador.rol = null
                jugador.close(1000, "Rival desconectado")
            }
        }
        socket.sala = null
        socket.rol = null
    }

    servidor.on("upgrade", function (peticion, socket, cabeza) {
        const origen = peticion.headers.origin
        if (origen) {
            let hostOrigen
            try {
                hostOrigen = new URL(origen).host
            }
            catch {
                socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n")
                socket.destroy()
                return
            }
            if (hostOrigen !== peticion.headers.host) {
                socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n")
                socket.destroy()
                return
            }
        }
        const ruta = new URL(peticion.url || "/", "http://localhost").pathname
        if (ruta !== "/online") {
            socket.write("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n")
            socket.destroy()
            return
        }
        sockets.handleUpgrade(peticion, socket, cabeza, function (webSocket) {
            sockets.emit("connection", webSocket, peticion)
        })
    })

    sockets.on("connection", function (socket) {
        socket.on("message", function (contenido) {
            let mensaje
            try {
                mensaje = JSON.parse(contenido.toString())
            }
            catch {
                enviar(socket, "error", { mensaje: "El mensaje no tiene un formato válido." })
                return
            }
            manejarMensaje(socket, mensaje)
        })
        socket.on("close", function () {
            desconectar(socket)
        })
        socket.on("error", function (error) {
            console.error("Error en conexión WebSocket:", error.message)
        })
    })

    return { servidor, sockets, salas }
}

export function iniciarServidor() {
    const { servidor } = crearServidorOnline()
    servidor.listen(PUERTO, "0.0.0.0", function () {
        console.log("Avatar-Map en http://localhost:" + PUERTO + "/")
        console.log("Para jugar en la misma red, compartí la IP local de este equipo.")
        console.log("El coordinador WebSocket escucha en el mismo puerto.")
        console.log("Sirviendo " + RAIZ)
    })
    return servidor
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    iniciarServidor()
}
