// Pruebas de la IA del rival (E3).
//
// La IA es determinista y no ve la elección del jugador: las mismas condiciones
// dan siempre la misma respuesta. Eso es lo que se prueba acá, con los kits
// reales de kits.js para que el test no viva en un mundo de datos inventados.

const test = require("node:test")
const assert = require("node:assert/strict")
const Motor = require("../public/js/motor.js")
const Kits = require("../public/js/kits.js")

// Arma un duelo donde la IA es el enemigo. Ajusta vida y energía después de
// crear el duelo, que es la única forma de llegar a un estado concreto sin
// jugar diez turnos.
function dueloCon(elementoIA, elementoRival, ajustes) {
    const opciones = ajustes || {}
    const duelo = Motor.crearDuelo({
        jugador: Kits.luchadorDesdePersonaje({ id: "rival", nombre: "Rival", emblema: elementoRival }),
        enemigo: Kits.luchadorDesdePersonaje({ id: "ia", nombre: "IA", emblema: elementoIA })
    })
    const ia = Motor.buscarLuchador(duelo, "enemigo")
    const rival = Motor.buscarLuchador(duelo, "jugador")
    if (opciones.vidaIA !== undefined) ia.vida = opciones.vidaIA
    if (opciones.energiaIA !== undefined) ia.energia = opciones.energiaIA
    if (opciones.vidaRival !== undefined) rival.vida = opciones.vidaRival
    if (opciones.energiaRival !== undefined) rival.energia = opciones.energiaRival
    return duelo
}

// Pide la elección y la devuelve como id, exigiendo que la IA haya podido elegir.
function eleccionIA(duelo) {
    const resultado = Motor.elegirIA(duelo, "enemigo")
    assert.equal(resultado.ok, true, "la IA tiene que poder elegir: " + resultado.motivo)
    return duelo.elecciones.enemigo
}

test("la IA remata con el ataque más barato que alcanza", function () {
    // Fuego contra tierra es neutral: la chispa hace 8 exactos.
    const duelo = dueloCon("fuego", "tierra", { vidaRival: 8, energiaIA: 1 })
    // La llama (15, costo 1) también remata, pero la chispa cuesta 0.
    assert.equal(eleccionIA(duelo), "chispa")
})

test("la IA se cura cuando está por debajo del 30% de vida", function () {
    const duelo = dueloCon("agua", "fuego", { vidaIA: 28, energiaIA: 1, vidaRival: 100 })
    assert.equal(eleccionIA(duelo), "marea-curativa")
})

test("el umbral de curación es el 30%, no más", function () {
    // 30 de 100 entra (<= 30%).
    const justo = dueloCon("agua", "fuego", { vidaIA: 30, energiaIA: 1, vidaRival: 100 })
    assert.equal(eleccionIA(justo), "marea-curativa")

    // 31 de 100 no entra: con 1 de energía solo puede pegar con el latigazo.
    const porEncima = dueloCon("agua", "fuego", { vidaIA: 31, energiaIA: 1, vidaRival: 100 })
    assert.equal(eleccionIA(porEncima), "latigazo")
})

test("la IA remata antes que curarse", function () {
    // Vida baja (entraría en la cura) pero el rival está a un golpe.
    const duelo = dueloCon("agua", "fuego", { vidaIA: 30, energiaIA: 1, vidaRival: 8 })
    // Agua contra fuego es ventaja: latigazo 7 x 1.5 = 11, alcanza para 8.
    assert.equal(eleccionIA(duelo), "latigazo")
})

test("la IA usa la definitiva apenas tiene la energía", function () {
    const duelo = dueloCon("fuego", "tierra", { vidaIA: 100, energiaIA: 4, vidaRival: 100 })
    assert.equal(eleccionIA(duelo), "cometa")
})

test("sin energía para la definitiva la IA pega con lo más fuerte que pueda pagar", function () {
    // Con 3 de energía la cometa (costo 4) no está disponible. La IA ya no
    // ahorra: usa la onda ígnea (23 de daño, costo 2), que es lo más fuerte que
    // puede pagar este turno.
    const duelo = dueloCon("fuego", "tierra", { vidaIA: 100, energiaIA: 3, vidaRival: 100 })
    assert.equal(eleccionIA(duelo), "onda-ignea")
})

test("la IA se descuida cada cuarto turno", function () {
    const duelo = dueloCon("fuego", "tierra", { vidaIA: 100, energiaIA: 4, vidaRival: 100 })

    // Turnos 1 y 3: juega en serio y puede pagar la definitiva.
    assert.equal(eleccionIA(duelo), "cometa")
    duelo.elecciones.enemigo = null
    duelo.turno = 3
    assert.equal(eleccionIA(duelo), "cometa")

    // Turno 4: se descuida y elige el ataque más barato (chispa, costo 0).
    duelo.elecciones.enemigo = null
    duelo.turno = 4
    assert.equal(eleccionIA(duelo), "chispa")

    // Turno 5: vuelve a jugar en serio.
    duelo.elecciones.enemigo = null
    duelo.turno = 5
    assert.equal(eleccionIA(duelo), "cometa")
})

test("con la definitiva en recarga la IA pega con lo más fuerte que pueda pagar", function () {
    const duelo = dueloCon("fuego", "tierra", { vidaIA: 100, energiaIA: 4, vidaRival: 100 })
    assert.equal(eleccionIA(duelo), "cometa")

    // Turno 1: cometa (gasta 4, recarga hasta el turno 5, y queda con 1 de energía).
    Motor.elegir(duelo, "jugador", "punetazo-roca")
    Motor.resolver(duelo)
    const ia = Motor.buscarLuchador(duelo, "enemigo")
    assert.equal(ia.energia, 1, "4 - 4 de la cometa + 1 al cerrar el turno")

    // Turno 2: la cometa sigue en recarga, así que pega con la llama (15, costo 1).
    assert.equal(eleccionIA(duelo), "llama")
})

test("con energía 0 la IA solo puede elegir el ataque de costo 0", function () {
    const duelo = dueloCon("tierra", "aire", { energiaIA: 0, vidaRival: 100 })
    assert.equal(eleccionIA(duelo), "punetazo-roca")
})

test("la IA no lee la elección del jugador", function () {
    // Dos duelos idénticos, con el jugador eligiendo cosas distintas.
    // El rival arranca con 1 de energía para que la avalancha (costo 1) sea legal.
    const primero = dueloCon("fuego", "tierra", { energiaIA: 3, energiaRival: 1, vidaRival: 100 })
    const segundo = dueloCon("fuego", "tierra", { energiaIA: 3, energiaRival: 1, vidaRival: 100 })

    assert.equal(Motor.elegir(primero, "jugador", "punetazo-roca").ok, true)
    assert.equal(Motor.elegir(segundo, "jugador", "avalancha").ok, true)

    assert.equal(eleccionIA(primero), "onda-ignea")
    assert.equal(eleccionIA(segundo), "onda-ignea", "la elección del jugador no puede cambiarla")
})

test("la IA nunca elige un ataque que no puede usar", function () {
    // Se recorren varios estados y en todos la elección tiene que ser legal.
    const casos = [
        { elementoIA: "fuego", energiaIA: 0, vidaIA: 100 },
        { elementoIA: "fuego", energiaIA: 3, vidaIA: 100 },
        { elementoIA: "fuego", energiaIA: 5, vidaIA: 100 },
        { elementoIA: "agua", energiaIA: 1, vidaIA: 20 },
        { elementoIA: "tierra", energiaIA: 2, vidaIA: 100 }
    ]
    for (const caso of casos) {
        const duelo = dueloCon(caso.elementoIA, "tierra", {
            energiaIA: caso.energiaIA,
            vidaIA: caso.vidaIA,
            vidaRival: 100
        })
        const elegido = eleccionIA(duelo)
        const revision = Motor.puedeUsar(duelo, "enemigo", elegido)
        assert.equal(revision.ok, true, caso.elementoIA + " eligió " + elegido + ": " + revision.motivo)
    }
})

test("la IA es determinista: mismas condiciones, misma elección", function () {
    const jugar = function () {
        const duelo = dueloCon("aire", "tierra", { energiaIA: 2, vidaIA: 60 })
        Motor.elegir(duelo, "jugador", "punetazo-roca")
        const elegido = eleccionIA(duelo)
        Motor.resolver(duelo)
        return elegido
    }
    assert.equal(jugar(), jugar())
})

test("sin turno posible la IA lo informa en vez de elegir", function () {
    const duelo = dueloCon("fuego", "tierra", {})
    Motor.buscarLuchador(duelo, "jugador").vida = 0
    duelo.fase = "terminado"
    assert.deepEqual(Motor.elegirIA(duelo, "enemigo"), { ok: false, motivo: "sin-turno" })
})

test("la IA completa varios turnos sin elegir nada ilegal", function () {
    // Pelea larga: la IA juega sola contra un rival que siempre usa su ataque
    // de costo 0. Se valida cada elección antes de resolver.
    const duelo = dueloCon("aire", "tierra", {})
    let turnos = 0
    while (!Motor.estaTerminado(duelo) && turnos < 60) {
        const eleccion = eleccionIA(duelo)
        assert.equal(Motor.puedeUsar(duelo, "enemigo", eleccion).ok, true,
            "turno " + duelo.turno + ": eligió " + eleccion)
        assert.equal(Motor.elegir(duelo, "jugador", "punetazo-roca").ok, true)
        Motor.resolver(duelo)
        turnos++
    }
    assert.ok(turnos > 0, "la pelea tiene que avanzar")
    // Alguien tiene que haber ganado o empatado (nadie queda vivo de los dos).
    assert.ok(Motor.estaTerminado(duelo), "la pelea termina en menos de 60 turnos")
})
