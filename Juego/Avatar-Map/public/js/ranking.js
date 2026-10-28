// Ranking persistente y racha (E5)
//
// Las reglas de qué suma una partida y cómo se corta la racha son puras: no
// conocen el DOM ni el almacenamiento. combate.js se encarga de leer y guardar
// en localStorage; acá solo se calcula el resultado.
//
// Igual que motor.js y kits.js, se carga como script clásico en el navegador
// (global `Ranking`) y con require() en Node.

const Ranking = (function () {
    // Orden estable: sirve para sanear y para comparar en las pruebas.
    const CAMPOS = ["partidas", "victorias", "derrotas", "empates", "racha", "mejorRacha"]

    function inicial() {
        const cero = {}
        for (const campo of CAMPOS) {
            cero[campo] = 0
        }
        return cero
    }

    // Un valor guardado puede venir sucio (texto, negativo, con decimales).
    // Se normaliza a un entero no negativo; si no es un número, vale 0.
    function entero(valor) {
        const numero = Math.round(Number(valor))
        if (!Number.isFinite(numero) || numero < 0) {
            return 0
        }
        return numero
    }

    // Acepta lo que devuelve JSON.parse (o nada) y entrega un ranking completo.
    // Un ranking guardado antes de E5 no tiene racha ni mejorRacha: se completa
    // con 0 en lugar de romper la clasificación.
    function sanear(datos) {
        if (!datos || typeof datos !== "object") {
            return inicial()
        }
        const limpio = inicial()
        for (const campo of CAMPOS) {
            limpio[campo] = entero(datos[campo])
        }
        return limpio
    }

    // Registrar una partida. Devuelve un ranking nuevo: no muta el que recibe.
    // La racha cuenta partidas ganadas seguidas; una derrota o un empate la
    // cortan, pero la mejor racha se conserva como récord.
    function registrar(ranking, resultado) {
        const datos = sanear(ranking)
        datos.partidas += 1
        if (resultado === "GANASTE") {
            datos.victorias += 1
            datos.racha += 1
            if (datos.racha > datos.mejorRacha) {
                datos.mejorRacha = datos.racha
            }
        }
        else if (resultado === "PERDISTE") {
            datos.derrotas += 1
            datos.racha = 0
        }
        else {
            datos.empates += 1
            datos.racha = 0
        }
        return datos
    }

    return {
        inicial: inicial,
        sanear: sanear,
        registrar: registrar
    }
})()

// Node: permite require() desde las pruebas. En el navegador no existe `module`.
if (typeof module !== "undefined" && module.exports) {
    module.exports = Ranking
}
