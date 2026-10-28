// Motor de turnos (E2 + E3)
//
// Puro: no conoce el DOM, las imágenes ni el canvas. No usa azar y no toca
// almacenamiento, así que la misma entrada da siempre el mismo resultado.
// Se carga como script clásico en el navegador (queda en el global `Motor`) y
// con require() en Node, que es lo que permite probarlo con `node --test`.
//
// Reglas (specs S3, S4 y S5 del documento de seguimiento):
//   - vida 100 por luchador;
//   - energía 0-5, +1 al empezar cada turno, con tope de 5;
//   - kit de 4 ataques con costo 0 / 1 / 2 / 4; la definitiva recarga 3 turnos;
//   - los dos eligen a la vez, sin ver la elección del otro;
//   - se resuelve ordenado por velocidad: el más rápido golpea primero y, si deja
//     al otro sin vida, el golpe del lento no llega;
//   - rueda elemental Agua -> Fuego -> Aire -> Tierra -> Agua:
//     ventaja x1.5, desventaja x0.75;
//   - estados (quemadura, aturdido) que entran en juego al turno siguiente.
//
// El contenido (qué ataques tiene cada nación) vive en kits.js; acá solo están las
// reglas. El dibujo del duelo llega en E4.

const Motor = (function () {
    const VIDA_MAXIMA = 100
    const ENERGIA_MAXIMA = 5
    // Velocidad de combate por defecto. Cada nación define la suya en kits.js.
    const VELOCIDAD_BASE = 10

    // Rueda elemental: cada elemento le gana al siguiente y pierde contra el anterior.
    const VENTAJAS = {
        agua: "fuego",
        fuego: "aire",
        aire: "tierra",
        tierra: "agua"
    }
    const MULTIPLICADOR_VENTAJA = 1.5
    const MULTIPLICADOR_DESVENTAJA = 0.75

    // Tope de turnos por ronda. Existe para que ninguna ronda pueda quedar sin
    // final: dos luchadores que se curan pueden sostener el intercambio para
    // siempre. Con 24 turnos, la ronda normal (7-8 turnos) no se toca.
    const MAXIMO_TURNOS_RONDA = 24

    // Kit base: cuatro ataques, costos 0 / 1 / 2 / 4. Lo usan los duelos sin nación
    // (pruebas del núcleo) y queda como respaldo si un personaje no tiene emblema.
    const CATALOGO_BASE = [
        { id: "golpe", nombre: "Golpe", costo: 0, dano: 8, recarga: 0 },
        { id: "combo", nombre: "Combo", costo: 1, dano: 14, recarga: 0 },
        { id: "impacto", nombre: "Impacto", costo: 2, dano: 22, recarga: 0 },
        { id: "suprema", nombre: "Técnica suprema", costo: 4, dano: 34, recarga: 3 }
    ]

    function numero(valor, porDefecto) {
        return Number.isFinite(valor) ? valor : porDefecto
    }

    function normalizarEstado(estado) {
        if (!estado || !estado.tipo) {
            return null
        }
        return {
            tipo: String(estado.tipo),
            turnos: Math.max(1, numero(estado.turnos, 1)),
            dano: Math.max(0, numero(estado.dano, 0))
        }
    }

    function normalizarAtaque(ataque) {
        return {
            id: String(ataque.id || ataque.nombre || ""),
            nombre: String(ataque.nombre || ataque.id || ""),
            costo: Math.max(0, numero(ataque.costo, 0)),
            dano: Math.max(0, numero(ataque.dano, 0)),
            recarga: Math.max(0, numero(ataque.recarga, 0)),
            // Efectos propios del ataque. Todos opcionales.
            cura: Math.max(0, numero(ataque.cura, 0)),
            robaEnergia: Math.max(0, numero(ataque.robaEnergia, 0)),
            aplica: normalizarEstado(ataque.aplica)
        }
    }

    // Un luchador arranca con la vida llena y sin energía: la primera ronda solo
    // permite el ataque de costo 0.
    function crearLuchador(datos) {
        const entrada = datos || {}
        const kit = Array.isArray(entrada.ataques) && entrada.ataques.length > 0
            ? entrada.ataques
            : CATALOGO_BASE
        return {
            rol: entrada.rol === "enemigo" ? "enemigo" : "jugador",
            id: String(entrada.id || ""),
            nombre: String(entrada.nombre || entrada.id || ""),
            elemento: String(entrada.elemento || ""),
            velocidad: numero(entrada.velocidad, VELOCIDAD_BASE),
            vida: VIDA_MAXIMA,
            vidaMaxima: VIDA_MAXIMA,
            energia: 0,
            energiaMaxima: ENERGIA_MAXIMA,
            ataques: kit.map(normalizarAtaque),
            // Turno a partir del cual cada ataque vuelve a estar disponible.
            // Se guarda el turno absoluto en vez de un contador para no errarle
            // al off-by-one de "recarga 3": con 3, vuelve en el turno + 4.
            recargas: {},
            estados: []
        }
    }

    function crearDuelo(datos) {
        const entrada = datos || {}
        const jugador = crearLuchador(Object.assign({ rol: "jugador" }, entrada.jugador))
        const enemigo = crearLuchador(Object.assign({ rol: "enemigo" }, entrada.enemigo))
        return {
            turno: 1,
            fase: "esperando",
            luchadores: [jugador, enemigo],
            // Una elección por rol. Cada lado no ve la del otro hasta resolver.
            elecciones: { jugador: null, enemigo: null },
            historial: [],
            ganador: null
        }
    }

    function buscarLuchador(duelo, rol) {
        return duelo.luchadores.find(function (l) { return l.rol === rol }) || null
    }

    function buscarAtaque(luchador, ataqueId) {
        return luchador.ataques.find(function (a) { return a.id === ataqueId }) || null
    }

    function rivalDe(duelo, luchador) {
        if (!luchador) {
            return null
        }
        return duelo.luchadores.find(function (l) { return l.rol !== luchador.rol }) || null
    }

    function estaTerminado(duelo) {
        return duelo.fase === "terminado"
    }

    // Afinidad de la rueda entre dos luchadores.
    function afinidadEntre(atacante, defensor) {
        if (!atacante || !defensor || !atacante.elemento || !defensor.elemento) {
            return { multiplicador: 1, ventaja: "neutral" }
        }
        if (VENTAJAS[atacante.elemento] === defensor.elemento) {
            return { multiplicador: MULTIPLICADOR_VENTAJA, ventaja: "ventaja" }
        }
        if (VENTAJAS[defensor.elemento] === atacante.elemento) {
            return { multiplicador: MULTIPLICADOR_DESVENTAJA, ventaja: "desventaja" }
        }
        return { multiplicador: 1, ventaja: "neutral" }
    }

    // Daño final de un ataque, con la rueda elemental ya aplicada.
    // Lo usan la resolución y la interfaz (para mostrar el daño antes de elegir).
    function danoDe(duelo, rol, ataqueId) {
        const atacante = buscarLuchador(duelo, rol)
        const ataque = atacante ? buscarAtaque(atacante, ataqueId) : null
        if (!ataque) {
            return { dano: 0, base: 0, multiplicador: 1, ventaja: "neutral" }
        }
        const afinidad = afinidadEntre(atacante, rivalDe(duelo, atacante))
        return {
            dano: Math.round(ataque.dano * afinidad.multiplicador),
            base: ataque.dano,
            multiplicador: afinidad.multiplicador,
            ventaja: afinidad.ventaja
        }
    }

    // ¿Puede este luchador usar este ataque en este turno? Devuelve el motivo
    // cuando no, para que la interfaz lo pueda explicar.
    function puedeUsar(duelo, rol, ataqueId) {
        const luchador = buscarLuchador(duelo, rol)
        if (!luchador) {
            return { ok: false, motivo: "sin-luchador" }
        }
        if (estaTerminado(duelo)) {
            return { ok: false, motivo: "terminado" }
        }
        if (luchador.vida <= 0) {
            return { ok: false, motivo: "sin-vida" }
        }
        const ataque = buscarAtaque(luchador, ataqueId)
        if (!ataque) {
            return { ok: false, motivo: "desconocido" }
        }
        const vuelveEn = luchador.recargas[ataque.id]
        if (vuelveEn !== undefined && duelo.turno < vuelveEn) {
            return { ok: false, motivo: "recarga", vuelveEn: vuelveEn }
        }
        if (luchador.energia < ataque.costo) {
            return { ok: false, motivo: "energia" }
        }
        return { ok: true, motivo: "" }
    }

    // Lista lista para pintar: cada ataque con su disponibilidad y el motivo.
    function ataquesDe(duelo, rol) {
        const luchador = buscarLuchador(duelo, rol)
        if (!luchador) {
            return []
        }
        return luchador.ataques.map(function (ataque) {
            const revision = puedeUsar(duelo, rol, ataque.id)
            const calculo = danoDe(duelo, rol, ataque.id)
            return Object.assign({}, ataque, {
                disponible: revision.ok,
                motivo: revision.motivo,
                vuelveEn: revision.vuelveEn,
                danoFinal: calculo.dano,
                ventaja: calculo.ventaja
            })
        })
    }

    // Registrar la elección de un lado. No mira ni pisa la del otro.
    function elegir(duelo, rol, ataqueId) {
        const revision = puedeUsar(duelo, rol, ataqueId)
        if (!revision.ok) {
            return { ok: false, motivo: revision.motivo }
        }
        duelo.elecciones[rol] = String(ataqueId)
        if (duelo.fase === "esperando") {
            duelo.fase = "eligiendo"
        }
        return { ok: true, motivo: "" }
    }

    // Orden de golpe: velocidad de mayor a menor; empate, el jugador primero.
    // Se filtra a los que siguen en pie al momento de golpear, no antes: un
    // luchador puede caer durante la misma resolución.
    function ordenDeAtaque(duelo) {
        return duelo.luchadores.slice().sort(function (a, b) {
            if (b.velocidad !== a.velocidad) {
                return b.velocidad - a.velocidad
            }
            return a.rol === "jugador" ? -1 : 1
        })
    }

    function tieneEstado(luchador, tipo) {
        return luchador.estados.find(function (e) { return e.tipo === tipo }) || null
    }

    // Consumir un estado de un solo uso (aturdido): se aplica una vez y se va.
    function consumirEstado(luchador, tipo) {
        const indice = luchador.estados.findIndex(function (e) { return e.tipo === tipo })
        if (indice < 0) {
            return null
        }
        return luchador.estados.splice(indice, 1)[0]
    }

    function aplicarEstado(luchador, estado) {
        if (!luchador || !estado) {
            return null
        }
        const nuevo = {
            tipo: estado.tipo,
            turnosRestantes: estado.turnos,
            dano: estado.dano
        }
        // Reaplicar el mismo estado lo refresca en vez de apilarlo: dos quemaduras
        // a la vez serían "ardes el doble", y el estado describe una condición, no
        // una cantidad de fuego encima. Sin esto, un ataque barato que queme cada
        // turno haría crecer el daño residual sin techo.
        const indice = luchador.estados.findIndex(function (e) { return e.tipo === nuevo.tipo })
        if (indice >= 0) {
            luchador.estados[indice] = nuevo
        }
        else {
            luchador.estados.push(nuevo)
        }
        return nuevo
    }

    // Pasar turno sobre los estados ya activos: la quemadura pega y todos pierden
    // un turno de duración. Los estados recién aplicados entran después, así que
    // no se descuentan en el mismo turno en que se aplicaron.
    function avanzarEstados(luchador) {
        let danoResidual = 0
        const sobrevivientes = []
        for (const estado of luchador.estados) {
            if (estado.tipo === "quemadura") {
                danoResidual += estado.dano
            }
            estado.turnosRestantes--
            if (estado.turnosRestantes > 0) {
                sobrevivientes.push(estado)
            }
        }
        luchador.estados = sobrevivientes
        return danoResidual
    }

    // Resolver el turno. Exige las dos elecciones: nadie golpea dos veces ni se
    // resuelve a medias.
    function resolver(duelo) {
        if (estaTerminado(duelo)) {
            return { ok: false, motivo: "terminado", golpes: [], cancelados: [], residual: [] }
        }
        if (!duelo.elecciones.jugador || !duelo.elecciones.enemigo) {
            return { ok: false, motivo: "faltan-elecciones", golpes: [], cancelados: [], residual: [] }
        }

        const golpes = []
        const cancelados = []
        // Estados que se aplican al final del turno: entran en juego en el siguiente.
        const pendientes = []

        for (const atacante of ordenDeAtaque(duelo)) {
            const defensor = rivalDe(duelo, atacante)
            if (atacante.vida <= 0) {
                // Ya cayó con el golpe anterior: su ataque no llega.
                cancelados.push({ rol: atacante.rol, motivo: "sin-vida" })
                continue
            }
            if (!defensor || defensor.vida <= 0) {
                cancelados.push({ rol: atacante.rol, motivo: "sin-rival" })
                continue
            }
            if (consumirEstado(atacante, "aturdido")) {
                cancelados.push({ rol: atacante.rol, motivo: "aturdido" })
                continue
            }
            const ataque = buscarAtaque(atacante, duelo.elecciones[atacante.rol])
            if (!ataque) {
                cancelados.push({ rol: atacante.rol, motivo: "desconocido" })
                continue
            }
            // La energía se validó al elegir, pero el rival pudo robarla antes de
            // este golpe. Pagar sin saldo dejaba la energía en negativo y al
            // luchador sin ningún ataque disponible (ni el de costo 0): el turno
            // no volvía a resolverse y la ronda no terminaba nunca.
            if (atacante.energia < ataque.costo) {
                cancelados.push({ rol: atacante.rol, motivo: "sin-energia" })
                continue
            }

            atacante.energia -= ataque.costo
            if (ataque.recarga > 0) {
                // Vuelve a estar disponible recién pasado el turno + recarga.
                atacante.recargas[ataque.id] = duelo.turno + ataque.recarga + 1
            }

            const calculo = danoDe(duelo, atacante.rol, ataque.id)
            let curado = 0
            if (ataque.cura > 0) {
                const vidaPrevia = atacante.vida
                atacante.vida = Math.min(atacante.vidaMaxima, atacante.vida + ataque.cura)
                curado = atacante.vida - vidaPrevia
            }
            if (calculo.dano > 0) {
                defensor.vida = Math.max(0, defensor.vida - calculo.dano)
            }
            let energiaRobada = 0
            if (ataque.robaEnergia > 0) {
                energiaRobada = Math.min(defensor.energia, ataque.robaEnergia)
                defensor.energia -= energiaRobada
            }
            if (ataque.aplica) {
                pendientes.push({ rol: defensor.rol, estado: ataque.aplica })
            }

            golpes.push({
                turno: duelo.turno,
                atacante: atacante.rol,
                defensor: defensor.rol,
                ataque: ataque.id,
                ataqueNombre: ataque.nombre,
                dano: calculo.dano,
                multiplicador: calculo.multiplicador,
                ventaja: calculo.ventaja,
                curado: curado,
                energiaRobada: energiaRobada,
                estadoAplicado: ataque.aplica ? ataque.aplica.tipo : null,
                vidaRestante: defensor.vida
            })
        }

        // Residual de los estados que ya estaban activos antes de este turno.
        const residual = []
        for (const luchador of duelo.luchadores) {
            const dano = avanzarEstados(luchador)
            if (dano > 0) {
                luchador.vida = Math.max(0, luchador.vida - dano)
                residual.push({ rol: luchador.rol, tipo: "quemadura", dano: dano, vidaRestante: luchador.vida })
            }
        }

        // Estados nuevos: entran con la duración completa para el turno siguiente.
        for (const pendiente of pendientes) {
            aplicarEstado(buscarLuchador(duelo, pendiente.rol), pendiente.estado)
        }

        duelo.historial.push({
            turno: duelo.turno,
            golpes: golpes.slice(),
            cancelados: cancelados.slice(),
            residual: residual.slice()
        })
        duelo.elecciones = { jugador: null, enemigo: null }

        const jugador = buscarLuchador(duelo, "jugador")
        const enemigo = buscarLuchador(duelo, "enemigo")
        if (jugador.vida <= 0 || enemigo.vida <= 0) {
            duelo.fase = "terminado"
            if (jugador.vida <= 0 && enemigo.vida <= 0) {
                duelo.ganador = "empate"
            }
            else {
                duelo.ganador = jugador.vida > 0 ? "jugador" : "enemigo"
            }
            return {
                ok: true,
                turno: duelo.historial[duelo.historial.length - 1].turno,
                golpes: golpes,
                cancelados: cancelados,
                residual: residual,
                terminado: true,
                ganador: duelo.ganador
            }
        }

        // Tope de turnos: dos curaciones sostenidas pueden alargar la ronda para
        // siempre (el agua cura 14 por 1 de energía mientras el golpe gratis hace
        // 7). Al agotarse el tope gana quien tiene más vida; con la misma vida la
        // ronda es empate, igual que un K.O. simultáneo. Sin esto la ronda podía
        // no terminar nunca y el jugador no podía ganar ni perder.
        if (duelo.turno >= MAXIMO_TURNOS_RONDA) {
            duelo.fase = "terminado"
            if (jugador.vida === enemigo.vida) {
                duelo.ganador = "empate"
            }
            else {
                duelo.ganador = jugador.vida > enemigo.vida ? "jugador" : "enemigo"
            }
            return {
                ok: true,
                turno: duelo.historial[duelo.historial.length - 1].turno,
                golpes: golpes,
                cancelados: cancelados,
                residual: residual,
                terminado: true,
                ganador: duelo.ganador,
                porTurnos: true
            }
        }

        duelo.fase = "esperando"
        duelo.turno++
        duelo.luchadores.forEach(function (l) {
            l.energia = Math.min(l.energiaMaxima, l.energia + 1)
        })
        return {
            ok: true,
            turno: duelo.historial[duelo.historial.length - 1].turno,
            golpes: golpes,
            cancelados: cancelados,
            residual: residual,
            terminado: false,
            ganador: null
        }
    }

    // ---- IA del rival (E3, ajustada en E6) ----
    //
    // Determinista a propósito: las mismas condiciones dan siempre la misma
    // elección, así se puede probar. No lee duelo.elecciones.jugador: el rival
    // elige sin ver la elección del jugador, como pide S3.
    //
    // E6: dejó de ser un optimizador perfecto. Antes ahorraba energía desde el
    // primer turno para soltar la definitiva en cuanto llegaba a 4, y el jugador
    // no tenía forma de verlo. Simulado sobre las 16 combinaciones de nación, un
    // jugador que usa sus ataques fuertes ganaba 38%. Ahora la IA pega con lo
    // mejor que pueda pagar en el momento y se descuida cada cuarto turno.
    //
    // Prioridades:
    //   1. rematar si algún ataque alcanza (elige el más barato que remata);
    //   2. descuidarse: cada cuarto turno, el ataque más barato;
    //   3. curarse si está por debajo del 30% de vida;
    //   4. usar la definitiva cuando puede pagarla;
    //   5. si no, pegar con lo más fuerte que pueda pagar.
    const TURNOS_ENTRE_DESCUIDOS = 4
    const UMBRAL_CURA_IA = 0.30
    function elegirIA(duelo, rol) {
        const luchador = buscarLuchador(duelo, rol)
        const rival = rivalDe(duelo, luchador)
        if (!luchador || !rival || estaTerminado(duelo)) {
            return { ok: false, motivo: "sin-turno" }
        }
        const opciones = ataquesDe(duelo, rol).filter(function (a) { return a.disponible })
        if (opciones.length === 0) {
            return { ok: false, motivo: "sin-ataques" }
        }

        // 1. Remate: el más barato que alcance para dejar al rival en 0.
        const remates = opciones
            .filter(function (a) { return a.danoFinal >= rival.vida })
            .sort(function (a, b) { return (a.costo - b.costo) || (a.danoFinal - b.danoFinal) })
        if (remates.length > 0) {
            return elegir(duelo, rol, remates[0].id)
        }

        const ofensivas = opciones.filter(function (a) { return a.danoFinal > 0 })

        // 2. Descuido determinista: cada cuarto turno elige lo más barato. Es el
        // respiro que hace ganable la pelea sin volver tonta a la IA.
        if (ofensivas.length > 0 && duelo.turno % TURNOS_ENTRE_DESCUIDOS === 0) {
            const flojo = ofensivas
                .slice()
                .sort(function (a, b) { return (a.costo - b.costo) || (a.danoFinal - b.danoFinal) })[0]
            return elegir(duelo, rol, flojo.id)
        }

        // 3. Curación cuando la vida está comprometida.
        const cura = opciones
            .filter(function (a) { return a.cura > 0 })
            .sort(function (a, b) { return b.cura - a.cura })[0]
        if (cura && luchador.vida <= luchador.vidaMaxima * UMBRAL_CURA_IA) {
            return elegir(duelo, rol, cura.id)
        }

        if (ofensivas.length === 0) {
            return elegir(duelo, rol, opciones[0].id)
        }

        // 4. La definitiva, cuando ya puede pagarla (si está en recarga no está
        // en `opciones` y se cae al paso siguiente).
        const definitiva = ofensivas.find(function (a) { return a.costo === 4 }) || null
        if (definitiva) {
            return elegir(duelo, rol, definitiva.id)
        }

        // 5. Lo más fuerte que pueda pagar en este turno.
        const fuerte = ofensivas
            .slice()
            .sort(function (a, b) { return (b.danoFinal - a.danoFinal) || (a.costo - b.costo) })[0]
        return elegir(duelo, rol, fuerte.id)
    }

    return {
        VIDA_MAXIMA: VIDA_MAXIMA,
        ENERGIA_MAXIMA: ENERGIA_MAXIMA,
        VELOCIDAD_BASE: VELOCIDAD_BASE,
        VENTAJAS: VENTAJAS,
        MULTIPLICADOR_VENTAJA: MULTIPLICADOR_VENTAJA,
        MULTIPLICADOR_DESVENTAJA: MULTIPLICADOR_DESVENTAJA,
        MAXIMO_TURNOS_RONDA: MAXIMO_TURNOS_RONDA,
        CATALOGO_BASE: CATALOGO_BASE,
        crearLuchador: crearLuchador,
        crearDuelo: crearDuelo,
        buscarLuchador: buscarLuchador,
        estaTerminado: estaTerminado,
        afinidadEntre: afinidadEntre,
        danoDe: danoDe,
        puedeUsar: puedeUsar,
        ataquesDe: ataquesDe,
        elegir: elegir,
        resolver: resolver,
        elegirIA: elegirIA,
        tieneEstado: tieneEstado
    }
})()

// Node: permite require() desde las pruebas. En el navegador no existe `module`.
if (typeof module !== "undefined" && module.exports) {
    module.exports = Motor
}
