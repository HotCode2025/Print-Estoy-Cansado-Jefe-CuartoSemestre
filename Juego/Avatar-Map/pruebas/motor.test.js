// Pruebas del motor de turnos (S3 y S4).
//
// Correr desde Juego/Avatar-Map:
//     node --test
// No tocan el DOM: el motor se carga con require y se ejercita como dato puro.

const test = require("node:test")
const assert = require("node:assert/strict")
const Motor = require("../public/js/motor.js")

// Duelo de prueba: jugador rápido, enemigo lento.
function dueloBase(velocidadJugador, velocidadEnemigo) {
    return Motor.crearDuelo({
        jugador: { id: "Zuko", nombre: "Zuko", velocidad: velocidadJugador === undefined ? 20 : velocidadJugador },
        enemigo: { id: "Toph", nombre: "Toph", velocidad: velocidadEnemigo === undefined ? 5 : velocidadEnemigo }
    })
}

// Jugar un turno completo con las dos elecciones dadas.
function jugarTurno(duelo, ataqueJugador, ataqueEnemigo) {
    assert.equal(Motor.elegir(duelo, "jugador", ataqueJugador).ok, true)
    assert.equal(Motor.elegir(duelo, "enemigo", ataqueEnemigo).ok, true)
    return Motor.resolver(duelo)
}

test("un luchador arranca con vida 100 y energía 0", function () {
    const duelo = dueloBase()
    for (const luchador of duelo.luchadores) {
        assert.equal(luchador.vida, 100)
        assert.equal(luchador.vidaMaxima, 100)
        assert.equal(luchador.energia, 0)
    }
})

test("el kit base tiene cuatro ataques con costo 0, 1, 2 y 4", function () {
    const duelo = dueloBase()
    const costos = Motor.ataquesDe(duelo, "jugador").map(function (a) { return a.costo })
    assert.deepEqual(costos, [0, 1, 2, 4])
})

test("en el turno 1 solo está disponible el ataque de costo 0", function () {
    const duelo = dueloBase()
    const disponibles = Motor.ataquesDe(duelo, "jugador").filter(function (a) { return a.disponible })
    assert.deepEqual(disponibles.map(function (a) { return a.id }), ["golpe"])
})

test("un ataque sin energía se rechaza con motivo energía", function () {
    const duelo = dueloBase()
    const intento = Motor.elegir(duelo, "jugador", "impacto")
    assert.equal(intento.ok, false)
    assert.equal(intento.motivo, "energia")
    // El rechazo no deja ninguna elección registrada.
    assert.equal(duelo.elecciones.jugador, null)
})

test("un ataque fuera del kit se rechaza con motivo desconocido", function () {
    const duelo = dueloBase()
    assert.equal(Motor.elegir(duelo, "jugador", "inventado").motivo, "desconocido")
})

test("no se puede resolver sin las dos elecciones", function () {
    const duelo = dueloBase()
    Motor.elegir(duelo, "jugador", "golpe")
    const intento = Motor.resolver(duelo)
    assert.equal(intento.ok, false)
    assert.equal(intento.motivo, "faltan-elecciones")
    // Nada se aplicó: ni daño, ni historial, ni avance de turno.
    assert.equal(duelo.historial.length, 0)
    assert.equal(duelo.turno, 1)
    assert.equal(duelo.luchadores[1].vida, 100)
})

test("elegir un lado no revela ni pisa la elección del otro", function () {
    const duelo = dueloBase()
    Motor.elegir(duelo, "jugador", "golpe")
    assert.equal(duelo.elecciones.jugador, "golpe")
    assert.equal(duelo.elecciones.enemigo, null)
    Motor.elegir(duelo, "enemigo", "golpe")
    assert.equal(duelo.elecciones.jugador, "golpe")
    assert.equal(duelo.elecciones.enemigo, "golpe")
})

test("los dos golpes del turno se aplican y el orden es por velocidad", function () {
    const duelo = dueloBase(20, 5)
    const turno = jugarTurno(duelo, "golpe", "golpe")
    assert.equal(turno.ok, true)
    assert.equal(turno.golpes.length, 2)
    assert.equal(turno.golpes[0].atacante, "jugador")
    assert.equal(turno.golpes[1].atacante, "enemigo")
    assert.equal(duelo.luchadores[0].vida, 92)
    assert.equal(duelo.luchadores[1].vida, 92)
})

test("con la misma velocidad golpea primero el jugador", function () {
    const duelo = dueloBase(10, 10)
    const turno = jugarTurno(duelo, "golpe", "golpe")
    assert.equal(turno.golpes[0].atacante, "jugador")
})

test("el más rápido mata primero y el golpe del lento no llega", function () {
    const duelo = dueloBase(20, 5)
    duelo.luchadores[0].energia = 2
    duelo.luchadores[1].vida = 20
    const turno = jugarTurno(duelo, "impacto", "golpe")

    assert.equal(duelo.luchadores[1].vida, 0)
    // El jugador no recibió nada: el enemigo ya estaba en el suelo.
    assert.equal(duelo.luchadores[0].vida, 100)
    assert.equal(turno.golpes.length, 1)
    assert.equal(turno.cancelados.length, 1)
    assert.equal(turno.cancelados[0].rol, "enemigo")
    assert.equal(turno.cancelados[0].motivo, "sin-vida")
})

test("la partida termina cuando la vida llega a 0 y el ganador es el que queda en pie", function () {
    const duelo = dueloBase(20, 5)
    duelo.luchadores[0].vida = 14
    duelo.luchadores[1].energia = 2
    // El lento golpea más fuerte: si el rápido no lo mata, el rápido cae.
    const turno = jugarTurno(duelo, "golpe", "impacto")

    assert.equal(turno.terminado, true)
    assert.equal(turno.ganador, "enemigo")
    assert.equal(duelo.luchadores[0].vida, 0)
    assert.equal(duelo.fase, "terminado")
    assert.equal(Motor.estaTerminado(duelo), true)
})

test("terminada la partida no se puede elegir ni volver a resolver", function () {
    const duelo = dueloBase(20, 5)
    duelo.luchadores[1].vida = 8
    jugarTurno(duelo, "golpe", "golpe")
    assert.equal(Motor.elegir(duelo, "jugador", "golpe").motivo, "terminado")
    assert.equal(Motor.resolver(duelo).motivo, "terminado")
})

test("la energía sube 1 por turno, no más, y se topa en 5", function () {
    const duelo = dueloBase()
    // Se afirma la progresión turno a turno: con solo mirar el tope, un +2 por
    // turno también llegaría a 5 y el test no diría nada.
    for (let turno = 1; turno <= 5; turno++) {
        jugarTurno(duelo, "golpe", "golpe")
        assert.equal(duelo.luchadores[0].energia, turno, "energía tras el turno " + turno)
    }
    jugarTurno(duelo, "golpe", "golpe")
    assert.equal(duelo.luchadores[0].energia, 5)
})

test("usar un ataque descuenta su costo de la energía", function () {
    const duelo = dueloBase()
    duelo.luchadores[0].energia = 5
    jugarTurno(duelo, "impacto", "golpe")
    // 5 - 2 del ataque + 1 de fin de turno.
    assert.equal(duelo.luchadores[0].energia, 4)
    // El rival solo usó el ataque de costo 0: no gastó nada.
    assert.equal(duelo.luchadores[1].energia, 1)
})

test("la definitiva gasta 4 de energía y vuelve recién en el turno + 4", function () {
    const duelo = dueloBase()
    duelo.luchadores[0].energia = 4
    jugarTurno(duelo, "suprema", "golpe")

    assert.equal(duelo.luchadores[0].energia, 1)
    assert.equal(duelo.luchadores[0].recargas.suprema, 5)

    // Turnos 2, 3 y 4: sigue en recarga.
    for (let turno = 2; turno <= 4; turno++) {
        assert.equal(duelo.turno, turno)
        assert.equal(Motor.puedeUsar(duelo, "jugador", "suprema").motivo, "recarga")
        jugarTurno(duelo, "golpe", "golpe")
    }

    // Turno 5: disponible de nuevo (y con energía de sobra para pagarla).
    assert.equal(duelo.turno, 5)
    assert.equal(duelo.luchadores[0].energia, 4)
    assert.equal(Motor.puedeUsar(duelo, "jugador", "suprema").ok, true)
})

test("misma entrada, mismo resultado: el motor no usa azar", function () {
    const jugar = function () {
        const duelo = dueloBase()
        jugarTurno(duelo, "golpe", "golpe")
        duelo.luchadores[0].energia = 2
        jugarTurno(duelo, "impacto", "combo")
        jugarTurno(duelo, "golpe", "golpe")
        return duelo.historial
    }
    assert.deepEqual(jugar(), jugar())
})

test("el estado del duelo no se comparte entre dos partidas", function () {
    const datos = { jugador: { id: "Aang", velocidad: 12 }, enemigo: { id: "Katara", velocidad: 8 } }
    const primera = Motor.crearDuelo(datos)
    const segunda = Motor.crearDuelo(datos)
    jugarTurno(primera, "golpe", "golpe")
    assert.equal(primera.luchadores[0].vida, 92)
    assert.equal(segunda.luchadores[0].vida, 100)
    assert.equal(segunda.historial.length, 0)
})

// ---- Rueda elemental (S5) ----
//
// Estos tests usan kits propios y no los de kits.js: la rueda es una regla del
// motor y tiene que probarse sin depender del contenido de las naciones.

function dueloConKit(elementoJugador, elementoEnemigo, ataquesJugador, ataquesEnemigo) {
    return Motor.crearDuelo({
        jugador: {
            id: "jugador", nombre: "Jugador", elemento: elementoJugador,
            velocidad: 20, ataques: ataquesJugador
        },
        enemigo: {
            id: "enemigo", nombre: "Enemigo", elemento: elementoEnemigo,
            velocidad: 5,
            ataques: ataquesEnemigo || [{ id: "golpe", costo: 0, dano: 8 }]
        }
    })
}

const GOLPE_8 = [{ id: "golpe", nombre: "Golpe", costo: 0, dano: 8 }]

test("la rueda es un ciclo: cada elemento vence al siguiente", function () {
    const esperado = { agua: "fuego", fuego: "aire", aire: "tierra", tierra: "agua" }
    for (const elemento of Object.keys(esperado)) {
        const duelo = dueloConKit(elemento, esperado[elemento], GOLPE_8)
        assert.equal(Motor.afinidadEntre(duelo.luchadores[0], duelo.luchadores[1]).ventaja, "ventaja",
            elemento + " debería vencer a " + esperado[elemento])
        // Y la vuelta: el vencido tiene desventaja.
        assert.equal(Motor.afinidadEntre(duelo.luchadores[1], duelo.luchadores[0]).ventaja, "desventaja",
            esperado[elemento] + " debería perder contra " + elemento)
    }
})

test("la ventaja multiplica el daño por 1.5", function () {
    const duelo = dueloConKit("fuego", "aire", GOLPE_8)
    const calculo = Motor.danoDe(duelo, "jugador", "golpe")
    assert.deepEqual(calculo, { dano: 12, base: 8, multiplicador: 1.5, ventaja: "ventaja" })
})

test("la desventaja multiplica el daño por 0.75", function () {
    const duelo = dueloConKit("fuego", "agua", GOLPE_8)
    const calculo = Motor.danoDe(duelo, "jugador", "golpe")
    assert.deepEqual(calculo, { dano: 6, base: 8, multiplicador: 0.75, ventaja: "desventaja" })
})

test("fuera de la rueda el daño no cambia", function () {
    // Fuego contra tierra no es ni ventaja ni desventaja.
    const duelo = dueloConKit("fuego", "tierra", GOLPE_8)
    const calculo = Motor.danoDe(duelo, "jugador", "golpe")
    assert.deepEqual(calculo, { dano: 8, base: 8, multiplicador: 1, ventaja: "neutral" })
})

test("el daño con multiplicador se redondea al entero más cercano", function () {
    // 7 x 1.5 = 10.5 -> 11; 7 x 0.75 = 5.25 -> 5.
    const ventaja = dueloConKit("fuego", "aire", [{ id: "golpe", costo: 0, dano: 7 }])
    assert.equal(Motor.danoDe(ventaja, "jugador", "golpe").dano, 11)

    const desventaja = dueloConKit("fuego", "agua", [{ id: "golpe", costo: 0, dano: 7 }])
    assert.equal(Motor.danoDe(desventaja, "jugador", "golpe").dano, 5)
})

test("sin elemento el combate es neutral", function () {
    const duelo = dueloConKit("", "", GOLPE_8)
    assert.deepEqual(Motor.danoDe(duelo, "jugador", "golpe"), {
        dano: 8, base: 8, multiplicador: 1, ventaja: "neutral"
    })
})

test("la ventaja de la rueda se aplica al golpe real, no solo al cálculo", function () {
    const duelo = dueloConKit("fuego", "aire", GOLPE_8)
    const turno = jugarTurno(duelo, "golpe", "golpe")
    assert.equal(turno.golpes[0].dano, 12)
    assert.equal(turno.golpes[0].ventaja, "ventaja")
    assert.equal(duelo.luchadores[1].vida, 88)
})

test("consultar los ataques no altera el duelo", function () {
    // La interfaz va a llamar ataquesDe() para pintar botones y daños; si eso
    // moviera el estado, el HUD mentiría.
    const duelo = dueloConKit("fuego", "aire", GOLPE_8)
    const antes = JSON.stringify(duelo)
    Motor.ataquesDe(duelo, "jugador")
    Motor.danoDe(duelo, "jugador", "golpe")
    assert.equal(JSON.stringify(duelo), antes)
})

// ---- Estados (S5) ----

const ATAQUE_QUEMA = [{ id: "fuego", nombre: "Fuego", costo: 0, dano: 10, aplica: { tipo: "quemadura", turnos: 2, dano: 4 } }]
const ATAQUE_ATURDE = [{ id: "viento", nombre: "Viento", costo: 0, dano: 10, aplica: { tipo: "aturdido", turnos: 1, dano: 0 } }]
const ATAQUE_NULO = [{ id: "nada", nombre: "Nada", costo: 0, dano: 0 }]

test("la quemadura entra en juego al turno siguiente, no en el mismo", function () {
    const duelo = dueloConKit("fuego", "tierra", ATAQUE_QUEMA)
    const enemigo = duelo.luchadores[1]

    const turno1 = jugarTurno(duelo, "fuego", "golpe")
    // El golpe hizo 10 y no hubo residual: el estado recién se aplicó al cerrar.
    assert.equal(turno1.residual.length, 0)
    assert.equal(enemigo.vida, 90)
    assert.equal(Motor.tieneEstado(enemigo, "quemadura").turnosRestantes, 2)
})

test("la quemadura hace 4 de daño durante 2 turnos y después se apaga", function () {
    // Dos ataques en el kit: uno que quema y otro que solo golpea, para que el
    // estado no se refresque todos los turnos y se pueda ver cuándo expira.
    const kit = [
        { id: "fuego", nombre: "Fuego", costo: 0, dano: 10, aplica: { tipo: "quemadura", turnos: 2, dano: 4 } },
        { id: "golpe", nombre: "Golpe", costo: 0, dano: 10 }
    ]
    const duelo = dueloConKit("fuego", "tierra", kit)
    const enemigo = duelo.luchadores[1]

    jugarTurno(duelo, "fuego", "golpe")   // turno 1: aplica la quemadura
    assert.equal(enemigo.vida, 90, "100 - 10 del golpe; el residual recién empieza el turno 2")

    // Turno 2: 10 del golpe + 4 de quemadura.
    const turno2 = jugarTurno(duelo, "golpe", "golpe")
    assert.equal(turno2.residual.length, 1)
    assert.deepEqual(turno2.residual[0], { rol: "enemigo", tipo: "quemadura", dano: 4, vidaRestante: 76 })
    assert.equal(enemigo.vida, 76)

    // Turno 3: último turno de quemadura.
    const turno3 = jugarTurno(duelo, "golpe", "golpe")
    assert.equal(turno3.residual[0].dano, 4)
    assert.equal(enemigo.vida, 62)
    assert.equal(Motor.tieneEstado(enemigo, "quemadura"), null, "la quemadura ya se consumió")

    // Turno 4: sin residual.
    const turno4 = jugarTurno(duelo, "golpe", "golpe")
    assert.equal(turno4.residual.length, 0)
    assert.equal(enemigo.vida, 52)
})

test("reaplicar la quemadura la refresca, no la apila", function () {
    const duelo = dueloConKit("fuego", "tierra", ATAQUE_QUEMA)
    const enemigo = duelo.luchadores[1]

    // Dos turnos seguidos quemando: el estado se reemplaza, no se duplica.
    jugarTurno(duelo, "fuego", "golpe")
    jugarTurno(duelo, "fuego", "golpe")
    assert.equal(enemigo.estados.filter(function (e) { return e.tipo === "quemadura" }).length, 1)

    // Y el residual es 4, no 8.
    const turno = jugarTurno(duelo, "fuego", "golpe")
    assert.equal(turno.residual[0].dano, 4)
})

test("el aturdido cancela el ataque del rival y se consume una sola vez", function () {
    // Kit con dos ataques: uno que aturde y otro que solo golpea. Sin el segundo,
    // el turno siguiente volvería a aplicar el estado y no se podría ver que se
    // consumió.
    const kit = [
        { id: "viento", nombre: "Viento", costo: 0, dano: 10, aplica: { tipo: "aturdido", turnos: 1, dano: 0 } },
        { id: "golpe", nombre: "Golpe", costo: 0, dano: 10 }
    ]
    const duelo = dueloConKit("aire", "tierra", kit)
    const enemigo = duelo.luchadores[1]
    const jugador = duelo.luchadores[0]

    // Turno 1: el aturdimiento se aplica, pero el enemigo todavía golpea.
    // Aire vence a tierra: el golpe del enemigo entra con desventaja, 8 x 0.75 = 6.
    jugarTurno(duelo, "viento", "golpe")
    assert.equal(jugador.vida, 94)
    assert.equal(enemigo.vida, 85, "viento hace 10 x 1.5 = 15")

    // Turno 2: el enemigo está aturdido y pierde su ataque.
    const turno2 = jugarTurno(duelo, "golpe", "golpe")
    assert.equal(turno2.golpes.length, 1, "solo golpeó el jugador")
    assert.equal(turno2.cancelados[0].rol, "enemigo")
    assert.equal(turno2.cancelados[0].motivo, "aturdido")
    assert.equal(jugador.vida, 94, "el enemigo no llegó a golpear")
    assert.equal(Motor.tieneEstado(enemigo, "aturdido"), null, "el aturdido se consume al usarse")

    // Turno 3: vuelve a golpear normalmente.
    jugarTurno(duelo, "golpe", "golpe")
    assert.equal(jugador.vida, 88)
})

test("la curación no pasa de la vida máxima", function () {
    const duelo = dueloConKit("agua", "tierra",
        [{ id: "cura", nombre: "Cura", costo: 0, dano: 0, cura: 14 }],
        ATAQUE_NULO)
    duelo.luchadores[0].vida = 95

    const turno = jugarTurno(duelo, "cura", "nada")
    assert.equal(turno.golpes[0].curado, 5, "solo se curó lo que faltaba")
    assert.equal(duelo.luchadores[0].vida, 100)
})

test("el robo de energía no puede quitarle más de la que el rival tiene", function () {
    const duelo = dueloConKit("tierra", "aire",
        [{ id: "robo", nombre: "Robo", costo: 0, dano: 5, robaEnergia: 2 }])
    duelo.luchadores[1].energia = 1

    const turno = jugarTurno(duelo, "robo", "golpe")
    assert.equal(turno.golpes[0].energiaRobada, 1)
})

test("una quemadura que baja la vida a 0 termina la partida", function () {
    const duelo = dueloConKit("fuego", "tierra", ATAQUE_QUEMA, ATAQUE_NULO)
    const enemigo = duelo.luchadores[1]
    enemigo.vida = 4
    enemigo.estados.push({ tipo: "quemadura", turnosRestantes: 2, dano: 4 })

    // Los dos hacen 0 de daño directo: solo el residual puede matar.
    Motor.elegir(duelo, "jugador", "fuego")
    Motor.elegir(duelo, "enemigo", "nada")
    const turno = Motor.resolver(duelo)

    assert.equal(turno.terminado, true)
    assert.equal(turno.ganador, "jugador")
    assert.equal(enemigo.vida, 0)
    assert.equal(turno.residual[0].dano, 4)
})

// ---- E6: el robo de energía no puede dejar a un luchador sin salida ----
//
// El ataque se valida al elegirlo, pero la energía puede cambiar durante la
// resolución: el rival más rápido golpea primero y roba energía antes de que el
// lento pague su ataque. Si se lo deja pagar igual, la energía queda negativa y
// ese luchador no puede usar ningún ataque (ni el de costo 0): el turno no
// vuelve a resolverse nunca y la ronda no termina.

const KIT_ROBO = [
    { id: "robo", nombre: "Robo", costo: 4, dano: 5, robaEnergia: 2 },
    { id: "toque", nombre: "Toque", costo: 0, dano: 1 }
]

const KIT_GRANDE = [
    { id: "grande", nombre: "Grande", costo: 4, dano: 30 },
    { id: "toque", nombre: "Toque", costo: 0, dano: 1 }
]

function dueloConRobo() {
    const duelo = dueloConKit("tierra", "tierra", KIT_ROBO, KIT_GRANDE)
    Motor.buscarLuchador(duelo, "jugador").energia = 4
    Motor.buscarLuchador(duelo, "enemigo").energia = 4
    return duelo
}

test("robar energía cancela el ataque que el rival ya no puede pagar", function () {
    const duelo = dueloConRobo()
    const enemigo = Motor.buscarLuchador(duelo, "enemigo")

    const turno = jugarTurno(duelo, "robo", "grande")

    const cancelado = turno.cancelados.find(function (c) { return c.rol === "enemigo" })
    assert.ok(cancelado, "el ataque del rival tenía que quedar cancelado")
    assert.equal(cancelado.motivo, "sin-energia")
    assert.equal(enemigo.vida, 95, "solo el robo del jugador hizo daño")
    assert.equal(Motor.buscarLuchador(duelo, "jugador").vida, 100, "el golpe cancelado no llega")
})

test("la energía nunca queda negativa después de un robo", function () {
    const duelo = dueloConRobo()
    jugarTurno(duelo, "robo", "grande")

    for (const luchador of duelo.luchadores) {
        assert.ok(luchador.energia >= 0, luchador.rol + " quedó con energía " + luchador.energia)
    }
})

test("después de un robo el rival siempre tiene con qué responder", function () {
    const duelo = dueloConRobo()
    jugarTurno(duelo, "robo", "grande")

    const disponibles = Motor.ataquesDe(duelo, "enemigo").filter(function (a) { return a.disponible })
    assert.ok(disponibles.length > 0, "el rival no debería quedar sin ningún ataque")
    assert.equal(Motor.elegirIA(duelo, "enemigo").ok, true)
})

test("el robo también puede cancelar el ataque del jugador", function () {
    // Acá el enemigo es el rápido: roba antes de que el jugador pague.
    const duelo = Motor.crearDuelo({
        jugador: { id: "jugador", nombre: "Jugador", velocidad: 5, ataques: KIT_GRANDE },
        enemigo: { id: "enemigo", nombre: "Enemigo", velocidad: 20, ataques: KIT_ROBO }
    })
    Motor.buscarLuchador(duelo, "jugador").energia = 4
    Motor.buscarLuchador(duelo, "enemigo").energia = 4

    const turno = jugarTurno(duelo, "grande", "robo")

    const cancelado = turno.cancelados.find(function (c) { return c.rol === "jugador" })
    assert.ok(cancelado, "el ataque del jugador tenía que quedar cancelado")
    assert.equal(cancelado.motivo, "sin-energia")
    assert.equal(Motor.buscarLuchador(duelo, "enemigo").vida, 100)
})

// ---- E6: ninguna ronda puede quedar sin final ----
//
// Dos luchadores que se curan pueden sostener el intercambio para siempre (el
// agua cura 14 por 1 de energía y el golpe gratis hace 7): la ronda no terminaba
// nunca. El tope de turnos cierra la ronda por vida.

const KIT_NULO = [{ id: "nada", nombre: "Nada", costo: 0, dano: 0 }]

function dueloLargo(vidaJugador, vidaEnemigo, turno) {
    const duelo = dueloConKit("fuego", "tierra", KIT_NULO, KIT_NULO)
    Motor.buscarLuchador(duelo, "jugador").vida = vidaJugador
    Motor.buscarLuchador(duelo, "enemigo").vida = vidaEnemigo
    duelo.turno = turno
    return duelo
}

test("al agotarse el tope de turnos gana quien tiene más vida", function () {
    const duelo = dueloLargo(60, 40, Motor.MAXIMO_TURNOS_RONDA)

    const turno = jugarTurno(duelo, "nada", "nada")

    assert.equal(turno.terminado, true)
    assert.equal(turno.ganador, "jugador")
    assert.equal(turno.porTurnos, true, "el cierre se informa como cierre por turnos")
})

test("con la misma vida el tope de turnos es empate", function () {
    const duelo = dueloLargo(50, 50, Motor.MAXIMO_TURNOS_RONDA)

    const turno = jugarTurno(duelo, "nada", "nada")

    assert.equal(turno.terminado, true)
    assert.equal(turno.ganador, "empate")
    assert.equal(turno.porTurnos, true)
})

test("una ronda normal no se corta por el tope de turnos", function () {
    const duelo = dueloLargo(100, 100, 1)

    const turno = jugarTurno(duelo, "nada", "nada")

    assert.equal(turno.terminado, false)
    assert.equal(duelo.turno, 2, "el turno avanza normalmente")
    assert.equal(turno.porTurnos, undefined, "sin tope no se marca el cierre por turnos")
})

