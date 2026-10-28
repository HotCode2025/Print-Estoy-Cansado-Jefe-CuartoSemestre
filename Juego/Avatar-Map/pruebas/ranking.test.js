// Pruebas del ranking persistente (E5)
//
// El ranking vive en localStorage, pero las reglas de qué suma una victoria y
// cómo se comporta la racha son puras: no tocan el DOM ni el almacenamiento.
// Eso es lo que se prueba acá, con require() del mismo archivo que carga el
// navegador como script clásico.

const test = require("node:test")
const assert = require("node:assert/strict")

const Ranking = require("../public/js/ranking.js")

test("el ranking inicial arranca en cero", () => {
    assert.deepEqual(Ranking.inicial(), {
        partidas: 0,
        victorias: 0,
        derrotas: 0,
        empates: 0,
        racha: 0,
        mejorRacha: 0
    })
})

test("una victoria suma partida, victoria y una racha de 1", () => {
    const despues = Ranking.registrar(Ranking.inicial(), "GANASTE")
    assert.equal(despues.partidas, 1)
    assert.equal(despues.victorias, 1)
    assert.equal(despues.derrotas, 0)
    assert.equal(despues.empates, 0)
    assert.equal(despues.racha, 1)
    assert.equal(despues.mejorRacha, 1)
})

test("dos victorias seguidas suben la racha a 2 y la mejor racha también", () => {
    const primera = Ranking.registrar(Ranking.inicial(), "GANASTE")
    const segunda = Ranking.registrar(primera, "GANASTE")
    assert.equal(segunda.racha, 2)
    assert.equal(segunda.mejorRacha, 2)
    assert.equal(segunda.victorias, 2)
})

test("una derrota corta la racha a 0 y conserva la mejor racha", () => {
    const dosVictorias = Ranking.registrar(Ranking.registrar(Ranking.inicial(), "GANASTE"), "GANASTE")
    const derrota = Ranking.registrar(dosVictorias, "PERDISTE")
    assert.equal(derrota.racha, 0)
    assert.equal(derrota.mejorRacha, 2)
    assert.equal(derrota.derrotas, 1)
    assert.equal(derrota.partidas, 3)
})

test("un empate corta la racha a 0 y suma un empate", () => {
    const victoria = Ranking.registrar(Ranking.inicial(), "GANASTE")
    const empate = Ranking.registrar(victoria, "EMPATE")
    assert.equal(empate.racha, 0)
    assert.equal(empate.empates, 1)
    assert.equal(empate.mejorRacha, 1)
})

test("la mejor racha no baja cuando la racha actual cae", () => {
    let ranking = Ranking.inicial()
    ranking = Ranking.registrar(ranking, "GANASTE")
    ranking = Ranking.registrar(ranking, "GANASTE")
    ranking = Ranking.registrar(ranking, "GANASTE")
    ranking = Ranking.registrar(ranking, "PERDISTE")
    ranking = Ranking.registrar(ranking, "GANASTE")
    assert.equal(ranking.racha, 1)
    assert.equal(ranking.mejorRacha, 3)
})

test("un resultado desconocido cuenta como empate, como antes de E5", () => {
    const despues = Ranking.registrar(Ranking.inicial(), "CUALQUIER-COSA")
    assert.equal(despues.empates, 1)
    assert.equal(despues.racha, 0)
})

test("registrar no muta el ranking que recibe", () => {
    const antes = Ranking.inicial()
    Ranking.registrar(antes, "GANASTE")
    assert.deepEqual(antes, Ranking.inicial())
})

test("sanear completa los campos que faltan en un ranking viejo", () => {
    // Un ranking guardado antes de E5 no tiene racha ni mejorRacha.
    const viejo = Ranking.sanear({ partidas: 4, victorias: 2, derrotas: 1, empates: 1 })
    assert.equal(viejo.racha, 0)
    assert.equal(viejo.mejorRacha, 0)
    assert.equal(viejo.victorias, 2)
    assert.equal(viejo.partidas, 4)
})

test("sanear descarta datos corruptos y devuelve el ranking inicial", () => {
    assert.deepEqual(Ranking.sanear(null), Ranking.inicial())
    assert.deepEqual(Ranking.sanear("no es un objeto"), Ranking.inicial())
    assert.deepEqual(Ranking.sanear({ victorias: "muchas" }), Ranking.inicial())
})

test("sanear redondea valores negativos o fraccionarios a un entero válido", () => {
    const sucio = Ranking.sanear({ partidas: -3, victorias: 2.7, derrotas: 1, empates: 0, racha: -1, mejorRacha: 9.9 })
    assert.equal(sucio.partidas, 0)
    assert.equal(sucio.victorias, 3)
    assert.equal(sucio.racha, 0)
    assert.equal(sucio.mejorRacha, 10)
})

test("una partida completa deja el marcador de racha coherente", () => {
    let ranking = Ranking.inicial()
    ranking = Ranking.registrar(ranking, "GANASTE")
    ranking = Ranking.registrar(ranking, "GANASTE")
    ranking = Ranking.registrar(ranking, "GANASTE")
    ranking = Ranking.registrar(ranking, "PERDISTE")
    ranking = Ranking.registrar(ranking, "GANASTE")
    ranking = Ranking.registrar(ranking, "GANASTE")
    assert.equal(ranking.partidas, 6)
    assert.equal(ranking.victorias, 5)
    assert.equal(ranking.derrotas, 1)
    assert.equal(ranking.racha, 2)
    assert.equal(ranking.mejorRacha, 3)
})
