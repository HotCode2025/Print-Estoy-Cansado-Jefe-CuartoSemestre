// Invariantes del contenido por nación (E3).
//
// No prueban el motor: prueban que los cuatro kits respeten el contrato de S4
// (4 ataques, costos 0/1/2/4, una definitiva con recarga 3) y que las cuatro
// naciones se jueguen distinto de verdad.

const test = require("node:test")
const assert = require("node:assert/strict")
const Kits = require("../public/js/kits.js")
const Motor = require("../public/js/motor.js")

test("cada nación tiene cuatro ataques con costo 0, 1, 2 y 4", function () {
    for (const elemento of Kits.ELEMENTOS) {
        const ataques = Kits.ataquesDe(elemento)
        assert.equal(ataques.length, 4, elemento)
        assert.deepEqual(ataques.map(function (a) { return a.costo }), [0, 1, 2, 4], elemento)
    }
})

test("los ids de ataque son únicos en todo el juego", function () {
    const ids = Kits.ELEMENTOS.flatMap(function (elemento) {
        return Kits.ataquesDe(elemento).map(function (a) { return a.id })
    })
    assert.equal(new Set(ids).size, ids.length)
})

test("cada nación tiene una sola definitiva y recarga 3 turnos", function () {
    for (const elemento of Kits.ELEMENTOS) {
        const definitivas = Kits.ataquesDe(elemento).filter(function (a) { return a.costo === 4 })
        assert.equal(definitivas.length, 1, elemento)
        assert.equal(definitivas[0].recarga, 3, elemento)
    }
})

test("cada nación tiene un ataque de costo 0 que hace daño", function () {
    // Sin esto, el turno 1 (energía 0) no tendría nada que elegir.
    for (const elemento of Kits.ELEMENTOS) {
        const basico = Kits.ataquesDe(elemento).find(function (a) { return a.costo === 0 })
        assert.ok(basico.dano > 0, elemento)
    }
})

test("el daño crece con el costo, salvo las curas", function () {
    for (const elemento of Kits.ELEMENTOS) {
        const ofensivas = Kits.ataquesDe(elemento).filter(function (a) { return a.dano > 0 })
        for (let i = 1; i < ofensivas.length; i++) {
            assert.ok(ofensivas[i].dano > ofensivas[i - 1].dano,
                elemento + ": " + ofensivas[i].id + " pega menos que " + ofensivas[i - 1].id)
        }
    }
})

test("la rueda está completa: cada elemento vence a uno y pierde con otro", function () {
    for (const elemento of Kits.ELEMENTOS) {
        assert.ok(Kits.ELEMENTOS.includes(Motor.VENTAJAS[elemento]), elemento + " no vence a nadie")
        assert.notEqual(Motor.VENTAJAS[elemento], elemento, elemento + " se vence a sí mismo")
    }
    // Cada elemento aparece una sola vez como víctima: es un ciclo de cuatro.
    const victimas = Kits.ELEMENTOS.map(function (e) { return Motor.VENTAJAS[e] })
    assert.equal(new Set(victimas).size, 4)
})

test("las cuatro naciones no juegan igual", function () {
    const firmas = Kits.ELEMENTOS.map(function (elemento) {
        return Kits.ataquesDe(elemento).map(function (a) { return a.id }).join(",")
    })
    assert.equal(new Set(firmas).size, 4)
    const velocidades = Kits.ELEMENTOS.map(function (elemento) { return Kits.velocidadDe(elemento) })
    assert.equal(new Set(velocidades).size, 4)
})

test("ataquesDe devuelve copias: tocarlas no contamina el catálogo", function () {
    const ataques = Kits.ataquesDe("fuego")
    ataques[0].dano = 999
    ataques[0].nombre = "roto"
    assert.equal(Kits.ataquesDe("fuego")[0].dano, 8)
    assert.equal(Kits.ataquesDe("fuego")[0].nombre, "Chispa")
})

test("las copias también separan los estados anidados", function () {
    const ataques = Kits.ataquesDe("fuego")
    const cometa = ataques.find(function (a) { return a.id === "cometa" })
    cometa.aplica.dano = 999
    assert.equal(Kits.ataquesDe("fuego")[3].aplica.dano, 4)
})

test("luchadorDesdePersonaje toma el emblema del personaje", function () {
    const luchador = Kits.luchadorDesdePersonaje({ id: "Toph", nombre: "Toph", emblema: "tierra" })
    assert.equal(luchador.elemento, "tierra")
    assert.equal(luchador.velocidad, 8)
    assert.equal(luchador.ataques.length, 4)
    assert.equal(luchador.nombre, "Toph")
})

test("luchadorDesdePersonaje acepta el nombre largo de la nación", function () {
    const luchador = Kits.luchadorDesdePersonaje({ id: "Katara", elemento: "Tribu Agua" })
    assert.equal(luchador.elemento, "agua")
    assert.equal(luchador.velocidad, 10)
})

test("un personaje sin emblema reconocible cae en fuego", function () {
    assert.equal(Kits.luchadorDesdePersonaje({ id: "X", emblema: "" }).elemento, "fuego")
})
