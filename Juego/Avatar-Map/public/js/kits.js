// Kits de ataque por nación (E3)
//
// Esto es contenido, no reglas: qué ataques tiene cada nación y con qué números.
// Las reglas (rueda elemental, costos, recarga, estados) viven en motor.js.
//
// Cada nación tiene 4 ataques con costo 0 / 1 / 2 / 4 y una definitiva con recarga
// de 3 turnos. La gracia es que las cuatro no se juegan igual:
//   fuego  - pega fuerte y deja quemadura (daño residual);
//   agua   - aguanta: se cura en lugar de golpear;
//   aire   - el más rápido y aturde (el rival pierde un ataque);
//   tierra - el más lento y el que más pega, y le roba energía al rival.
//
// Igual que motor.js, se carga como script clásico en el navegador (global `Kits`)
// y con require() en Node.

const Kits = (function () {
    const NACIONES = {
        fuego: {
            nombre: "Nación del Fuego",
            velocidad: 11,
            ataques: [
                { id: "chispa", nombre: "Chispa", costo: 0, dano: 8 },
                { id: "llama", nombre: "Llama", costo: 1, dano: 15 },
                { id: "onda-ignea", nombre: "Onda ígnea", costo: 2, dano: 23 },
                {
                    id: "cometa", nombre: "Cometa", costo: 4, dano: 34, recarga: 3,
                    aplica: { tipo: "quemadura", turnos: 2, dano: 4 }
                }
            ]
        },
        agua: {
            nombre: "Tribu Agua",
            velocidad: 10,
            ataques: [
                { id: "latigazo", nombre: "Latigazo", costo: 0, dano: 7 },
                // Marea curativa no hace daño: cambia daño por tiempo de vida.
                { id: "marea-curativa", nombre: "Marea curativa", costo: 1, dano: 0, cura: 14 },
                { id: "lanza-hielo", nombre: "Lanza de hielo", costo: 2, dano: 21 },
                { id: "marea-creciente", nombre: "Marea creciente", costo: 4, dano: 32, recarga: 3, cura: 10 }
            ]
        },
        aire: {
            nombre: "Nómadas del Aire",
            velocidad: 14,
            ataques: [
                { id: "rafaga", nombre: "Ráfaga", costo: 0, dano: 6 },
                { id: "torbellino", nombre: "Torbellino", costo: 1, dano: 13 },
                { id: "patada-giratoria", nombre: "Patada giratoria", costo: 2, dano: 20 },
                {
                    id: "ciclon", nombre: "Ciclón", costo: 4, dano: 28, recarga: 3,
                    aplica: { tipo: "aturdido", turnos: 1, dano: 0 }
                }
            ]
        },
        tierra: {
            nombre: "Reino Tierra",
            velocidad: 8,
            ataques: [
                { id: "punetazo-roca", nombre: "Puñetazo de roca", costo: 0, dano: 9 },
                { id: "avalancha", nombre: "Avalancha", costo: 1, dano: 16 },
                { id: "roca-aplastante", nombre: "Roca aplastante", costo: 2, dano: 22 },
                {
                    id: "terremoto", nombre: "Terremoto", costo: 4, dano: 38, recarga: 3,
                    robaEnergia: 2
                }
            ]
        }
    }

    // Los emblemas de los personajes (personajes.js) usan estas mismas claves.
    const ELEMENTOS = ["agua", "fuego", "aire", "tierra"]

    // Los nombres largos que muestra la selección, por si llega el elemento en vez
    // del emblema ("Nación del Fuego" en lugar de "fuego").
    const POR_NOMBRE = {
        "agua": "agua",
        "tribu agua": "agua",
        "fuego": "fuego",
        "nación del fuego": "fuego",
        "nacion del fuego": "fuego",
        "aire": "aire",
        "nómadas del aire": "aire",
        "nomadas del aire": "aire",
        "tierra": "tierra",
        "reino tierra": "tierra"
    }

    function normalizarElemento(valor) {
        const clave = String(valor || "").trim().toLowerCase()
        if (NACIONES[clave]) {
            return clave
        }
        return POR_NOMBRE[clave] || null
    }

    function copiarAtaque(ataque) {
        const copia = {
            id: ataque.id,
            nombre: ataque.nombre,
            costo: ataque.costo,
            dano: ataque.dano,
            recarga: ataque.recarga || 0,
            cura: ataque.cura || 0,
            robaEnergia: ataque.robaEnergia || 0
        }
        if (ataque.aplica) {
            copia.aplica = {
                tipo: ataque.aplica.tipo,
                turnos: ataque.aplica.turnos,
                dano: ataque.aplica.dano
            }
        }
        return copia
    }

    // Copias: quien reciba estos ataques puede tocarlos sin contaminar el catálogo.
    function ataquesDe(elemento) {
        const clave = normalizarElemento(elemento) || "fuego"
        return NACIONES[clave].ataques.map(copiarAtaque)
    }

    function velocidadDe(elemento) {
        const clave = normalizarElemento(elemento) || "fuego"
        return NACIONES[clave].velocidad
    }

    function nombreDe(elemento) {
        const clave = normalizarElemento(elemento) || "fuego"
        return NACIONES[clave].nombre
    }

    // Puente con el registro de personajes: recibe un objeto con la forma de
    // `Personaje` (solo lee propiedades, así que también sirve un objeto plano en
    // las pruebas) y devuelve los datos que espera Motor.crearDuelo.
    function luchadorDesdePersonaje(personaje) {
        const datos = personaje || {}
        const elemento = normalizarElemento(datos.emblema) || normalizarElemento(datos.elemento) || "fuego"
        return {
            id: datos.id || "",
            nombre: datos.nombre || datos.id || "",
            elemento: elemento,
            velocidad: velocidadDe(elemento),
            ataques: ataquesDe(elemento)
        }
    }

    return {
        NACIONES: NACIONES,
        ELEMENTOS: ELEMENTOS,
        normalizarElemento: normalizarElemento,
        ataquesDe: ataquesDe,
        velocidadDe: velocidadDe,
        nombreDe: nombreDe,
        luchadorDesdePersonaje: luchadorDesdePersonaje
    }
})()

// Node: permite require() desde las pruebas. En el navegador no existe `module`.
if (typeof module !== "undefined" && module.exports) {
    module.exports = Kits
}
