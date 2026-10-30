import assert from "node:assert/strict"
import { once } from "node:events"
import test from "node:test"
import WebSocket from "ws"
import { crearServidorOnline } from "../servidor.mjs"

async function iniciarApp() {
    const app = crearServidorOnline()
    app.servidor.listen(0, "127.0.0.1")
    await once(app.servidor, "listening")
    return app
}

async function conectar(url) {
    const socket = new WebSocket(url)
    await once(socket, "open")
    return socket
}

function esperarMensaje(socket, tipo) {
    return new Promise(function (resolve, reject) {
        const temporizador = setTimeout(function () {
            socket.removeListener("message", recibir)
            reject(new Error("Tiempo agotado esperando " + tipo))
        }, 3000)
        function recibir(contenido) {
            const mensaje = JSON.parse(contenido.toString())
            if (mensaje.tipo === tipo) {
                clearTimeout(temporizador)
                socket.removeListener("message", recibir)
                resolve(mensaje)
            }
        }
        socket.on("message", recibir)
    })
}

function enviar(socket, tipo, datos = {}) {
    socket.send(JSON.stringify({ tipo: tipo, ...datos }))
}

async function cerrarApp(app, clientes) {
    clientes.forEach(function (cliente) {
        if (cliente.readyState === WebSocket.OPEN) {
            cliente.close()
        }
    })
    await new Promise(function (resolve) {
        app.sockets.close(function () {
            app.servidor.close(resolve)
        })
    })
}

test("una sala sincroniza personajes y resuelve ataques con el motor autoritativo", async function () {
    const app = await iniciarApp()
    const clientes = []
    try {
        const url = "ws://127.0.0.1:" + app.servidor.address().port + "/online"
        const host = await conectar(url)
        clientes.push(host)
        const salaCreada = esperarMensaje(host, "sala-creada")
        enviar(host, "crear-sala")
        const { codigo } = await salaCreada
        assert.match(codigo, /^[A-F0-9]{6}$/)

        const guest = await conectar(url)
        clientes.push(guest)
        const salaUnida = esperarMensaje(guest, "sala-unida")
        enviar(guest, "unirse-sala", { codigo: codigo.toLowerCase() })
        assert.equal((await salaUnida).rol, "guest")

        const errorPersonaje = esperarMensaje(host, "error")
        enviar(host, "seleccionar-personaje", {
            personaje: { id: "Zuko", nombre: "Zuko", imagen: "https://sitio.invalid/avatar.webp", emblema: "fuego" }
        })
        assert.match((await errorPersonaje).mensaje, /no es válido/)

        const inicioHost = esperarMensaje(host, "partida-iniciada")
        const inicioGuest = esperarMensaje(guest, "partida-iniciada")
        const confirmacionHost = esperarMensaje(host, "seleccion-confirmada")
        enviar(host, "seleccionar-personaje", {
            personaje: {
                id: "Zuko", nombre: "Zuko", imagen: "./assets/zuko.webp",
                nombreImg: "./assets/name-zuko.webp", elemento: "Nación del Fuego", emblema: "fuego"
            }
        })
        await confirmacionHost
        const confirmacionGuest = esperarMensaje(guest, "seleccion-confirmada")
        enviar(guest, "seleccionar-personaje", {
            personaje: {
                id: "Aang", nombre: "Aang", imagen: "./assets/aang.webp",
                nombreImg: "./assets/name-aang.webp", elemento: "Nómadas del Aire", emblema: "aire"
            }
        })
        await confirmacionGuest
        const inicio = await Promise.all([inicioHost, inicioGuest])
        assert.equal(inicio[0].personajes.host.id, "Zuko")
        assert.equal(inicio[1].personajes.guest.id, "Aang")

        const resultadoHost = esperarMensaje(host, "turno-resuelto")
        const resultadoGuest = esperarMensaje(guest, "turno-resuelto")
        const aceptadoHost = esperarMensaje(host, "ataque-recibido")
        enviar(host, "ataque", { turno: 1, ataqueId: "chispa" })
        await aceptadoHost
        const aceptadoGuest = esperarMensaje(guest, "ataque-recibido")
        enviar(guest, "ataque", { turno: 1, ataqueId: "rafaga" })
        await aceptadoGuest

        const turnos = await Promise.all([resultadoHost, resultadoGuest])
        assert.deepEqual(turnos[0].elecciones, { jugador: "chispa", enemigo: "rafaga" })
        assert.deepEqual(turnos[1].estado, turnos[0].estado)
        assert.equal(turnos[0].turno, 1)
        assert.equal(turnos[0].resultado.golpes.length, 2)
    }
    finally {
        await cerrarApp(app, clientes)
    }
})
