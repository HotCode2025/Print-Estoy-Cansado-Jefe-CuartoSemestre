// HUD de la arena (E1, ampliado en E4)
// Barras de vida, energía, estados, rondas ganadas y reloj de turno dibujados
// sobre el canvas. No conoce el estado del juego: recibe números ya calculados
// por mapa.js (que a su vez los pide a duelo.js).
//
// Distribución (canvas 800x600):
//   izquierda: nombre, barra de vida con el número, pips de energía y estados
//   derecha:   lo mismo, espejado
//   centro:    ronda, reloj del turno y rondas ganadas

const HUD_MARGEN = 26
const HUD_BARRA_ANCHO = 320
const HUD_BARRA_ALTO = 26
const HUD_BARRA_Y = 32
const HUD_NOMBRE_Y = 24
// Fila de energía y estados, debajo de la barra de vida.
const HUD_FILA_Y = 70
const HUD_PIP_RADIO = 5.5
const HUD_PIP_PASO = 16
// Reloj de turno y marcador de rondas del centro.
const HUD_RELOJ_ANCHO = 88
const HUD_RELOJ_ALTO = 6
const HUD_RELOJ_Y = 68
const HUD_VICTORIAS_Y = 92

const HUD_PAPEL = "#F6EDD8"
const HUD_TINTA = "#2B2118"
const HUD_VIDA_CLARA = "#D9553D"
const HUD_VIDA_OSCURA = "#8C2F24"
const HUD_ENERGIA = "#4FA8C7"
const HUD_ENERGIA_VACIA = "rgba(20, 14, 10, 0.55)"
const HUD_ESTADO_QUEMADURA = "#E07A3C"
const HUD_ESTADO_ATURDIDO = "#E8C24A"
const HUD_RELOJ = "#F2C14E"
const HUD_RELOJ_BAJO = "#E0553C"
const HUD_FUENTE_DISPLAY = '"SpellOfAsia", "Ma Shan Zheng", cursive, serif'
const HUD_FUENTE_TEXTO = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'

// Texto con contorno de tinta: se lee sobre cualquier fondo de mapa.
function textoConTinta(ctx, texto, x, y, fuente, alineacion, grosor) {
    ctx.save()
    ctx.font = fuente
    ctx.textAlign = alineacion || "left"
    ctx.textBaseline = "alphabetic"
    ctx.lineJoin = "round"
    ctx.lineWidth = grosor || 4
    ctx.strokeStyle = HUD_TINTA
    ctx.strokeText(texto, x, y)
    ctx.fillStyle = HUD_PAPEL
    ctx.fillText(texto, x, y)
    ctx.restore()
}

// Barra de vida estilo fighting game: se vacía desde el borde exterior hacia
// el centro. `destello` (0-1) es el flash blanco del golpe recibido.
// Desde E4 no hay segmentos: la vida es una fracción continua de 100.
function dibujarBarraVida(ctx, x, y, ancho, alto, fraccion, alineacion, destello, vida) {
    const valor = Math.max(0, Math.min(1, fraccion))
    const relleno = ancho * valor
    const derecha = alineacion === "derecha"

    ctx.save()
    ctx.fillStyle = "rgba(20, 14, 10, 0.86)"
    ctx.fillRect(x, y, ancho, alto)

    if (relleno > 0.5) {
        const desde = derecha ? x + ancho - relleno : x
        const gradiente = ctx.createLinearGradient(0, y, 0, y + alto)
        gradiente.addColorStop(0, HUD_VIDA_CLARA)
        gradiente.addColorStop(1, HUD_VIDA_OSCURA)
        ctx.fillStyle = gradiente
        ctx.fillRect(desde, y, relleno, alto)
    }

    if (destello > 0) {
        ctx.fillStyle = "rgba(255, 238, 214, " + (destello * 0.65).toFixed(3) + ")"
        ctx.fillRect(x, y, ancho, alto)
    }

    ctx.lineWidth = 3
    ctx.strokeStyle = HUD_TINTA
    ctx.strokeRect(x, y, ancho, alto)
    ctx.restore()

    if (typeof vida === "number") {
        const xVida = derecha ? x + ancho - 10 : x + 10
        textoConTinta(
            ctx, String(Math.max(0, Math.round(vida))), xVida, y + alto - 8,
            "700 15px " + HUD_FUENTE_TEXTO, derecha ? "right" : "left", 4
        )
    }
}

// Pips de energía: se llenan del borde exterior hacia adentro, igual que la vida.
function dibujarEnergia(ctx, x, y, alineacion, energia, maxima) {
    const total = Math.max(1, Math.round(maxima || 5))
    const llenas = Math.max(0, Math.min(total, Math.round(energia || 0)))
    const derecha = alineacion === "derecha"
    for (let i = 0; i < total; i++) {
        const centro = derecha
            ? x - HUD_PIP_RADIO - i * HUD_PIP_PASO
            : x + HUD_PIP_RADIO + i * HUD_PIP_PASO
        ctx.save()
        ctx.beginPath()
        ctx.arc(centro, y, HUD_PIP_RADIO, 0, Math.PI * 2)
        ctx.fillStyle = i < llenas ? HUD_ENERGIA : HUD_ENERGIA_VACIA
        ctx.fill()
        ctx.lineWidth = 2
        ctx.strokeStyle = HUD_TINTA
        ctx.stroke()
        ctx.restore()
    }
}

function nombreEstadoArena(estado) {
    if (estado.tipo === "quemadura") {
        return "QUEMADURA"
    }
    if (estado.tipo === "aturdido") {
        return "ATURDIDO"
    }
    return String(estado.tipo || "").toUpperCase()
}

// Estados activos como etiquetas: "QUEMADURA 2" es "quedan dos turnos".
// Se muestran como mucho dos para no invadir el centro del HUD.
function dibujarEstados(ctx, estados, x, y, alineacion) {
    if (!estados || estados.length === 0) {
        return
    }
    const derecha = alineacion === "derecha"
    let cursor = x
    for (const estado of estados.slice(0, 2)) {
        const texto = nombreEstadoArena(estado) + " " + estado.turnos
        ctx.save()
        ctx.font = "700 12px " + HUD_FUENTE_TEXTO
        const ancho = Math.ceil(ctx.measureText(texto).width) + 14
        const izquierda = derecha ? cursor - ancho : cursor
        ctx.fillStyle = estado.tipo === "quemadura" ? HUD_ESTADO_QUEMADURA : HUD_ESTADO_ATURDIDO
        ctx.fillRect(izquierda, y - 9, ancho, 18)
        ctx.lineWidth = 2
        ctx.strokeStyle = HUD_TINTA
        ctx.strokeRect(izquierda, y - 9, ancho, 18)
        ctx.fillStyle = HUD_TINTA
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(texto, izquierda + ancho / 2, y + 1)
        ctx.restore()
        cursor = derecha ? cursor - ancho - 6 : cursor + ancho + 6
    }
}

// Un lado del HUD: nombre arriba, barra de vida y fila de energía/estados debajo.
function dibujarLadoHud(ctx, lado, anchoCanvas) {
    if (!lado) {
        return
    }
    const derecha = lado.alineacion === "derecha"
    const x = derecha ? anchoCanvas - HUD_MARGEN - HUD_BARRA_ANCHO : HUD_MARGEN
    const xTexto = derecha ? x + HUD_BARRA_ANCHO : x
    const alineacion = derecha ? "derecha" : "izquierda"
    // textAlign de canvas solo acepta left/right/center/start/end: si le llega
    // "derecha" lo ignora y el nombre se escapa del canvas.
    textoConTinta(ctx, lado.nombre, xTexto, HUD_NOMBRE_Y, "22px " + HUD_FUENTE_DISPLAY, derecha ? "right" : "left", 4)
    dibujarBarraVida(ctx, x, HUD_BARRA_Y, HUD_BARRA_ANCHO, HUD_BARRA_ALTO, lado.fraccion, alineacion, lado.destello, lado.vida)

    const borde = derecha ? x + HUD_BARRA_ANCHO : x
    dibujarEnergia(ctx, borde, HUD_FILA_Y, alineacion, lado.energia, lado.energiaMaxima)
    const saltoEstados = Math.max(1, Math.round(lado.energiaMaxima || 5)) * HUD_PIP_PASO + 6
    dibujarEstados(ctx, lado.estados, derecha ? borde - saltoEstados : borde + saltoEstados, HUD_FILA_Y, alineacion)
}

// Contador de ronda entre las dos barras.
function dibujarRonda(ctx, texto, x, y) {
    ctx.save()
    ctx.font = "700 15px " + HUD_FUENTE_TEXTO
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    const ancho = Math.ceil(ctx.measureText(texto).width) + 28
    ctx.fillStyle = "rgba(20, 14, 10, 0.8)"
    ctx.fillRect(x - ancho / 2, y - 15, ancho, 30)
    ctx.lineWidth = 2
    ctx.strokeStyle = HUD_TINTA
    ctx.strokeRect(x - ancho / 2, y - 15, ancho, 30)
    ctx.fillStyle = HUD_PAPEL
    ctx.fillText(texto, x, y + 1)
    ctx.restore()
}

// Reloj del turno (S7): se vacía solo y cambia a rojo en el último cuarto.
function dibujarReloj(ctx, x, y, ancho, alto, fraccion) {
    const valor = Math.max(0, Math.min(1, fraccion || 0))
    ctx.save()
    ctx.fillStyle = "rgba(20, 14, 10, 0.8)"
    ctx.fillRect(x, y, ancho, alto)
    const relleno = ancho * valor
    if (relleno > 0.5) {
        ctx.fillStyle = valor <= 0.25 ? HUD_RELOJ_BAJO : HUD_RELOJ
        ctx.fillRect(x, y, relleno, alto)
    }
    ctx.lineWidth = 2
    ctx.strokeStyle = HUD_TINTA
    ctx.strokeRect(x, y, ancho, alto)
    ctx.restore()
}

// Centro del HUD: la ronda, el reloj del turno y las rondas ganadas.
function dibujarCentroHud(ctx, estado, anchoCanvas) {
    const centro = anchoCanvas / 2
    if (estado.ronda > 0) {
        dibujarRonda(ctx, "RONDA " + estado.ronda, centro, HUD_BARRA_Y + HUD_BARRA_ALTO / 2)
    }
    if (typeof estado.reloj === "number" && estado.reloj > 0) {
        dibujarReloj(ctx, centro - HUD_RELOJ_ANCHO / 2, HUD_RELOJ_Y, HUD_RELOJ_ANCHO, HUD_RELOJ_ALTO, estado.reloj)
    }
    textoConTinta(
        ctx, "RONDAS " + (estado.winsJugador || 0) + " - " + (estado.winsEnemigo || 0),
        centro, HUD_VICTORIAS_Y, "700 13px " + HUD_FUENTE_TEXTO, "center", 4
    )
}

// Cartel ROUND 1 / K.O.: entra chico->grande y se va desvaneciendo.
function dibujarBannerRonda(ctx, texto, progreso) {
    const p = Math.max(0, Math.min(1, progreso))
    let alpha = 1
    if (p < 0.14) {
        alpha = p / 0.14
    }
    else if (p > 0.82) {
        alpha = (1 - p) / 0.18
    }
    const escala = 1 + (1 - Math.min(1, p / 0.22)) * 0.3
    // "ROUND 1" es largo y entra en 74 px; "K.O." se agranda para que pese igual.
    const tamano = texto.length > 5 ? 74 : 96

    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
    ctx.translate(ctx.canvas.width / 2, 300)
    ctx.scale(escala, escala)
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = "800 " + tamano + "px " + HUD_FUENTE_TEXTO
    ctx.lineJoin = "round"
    ctx.lineWidth = 12
    ctx.strokeStyle = HUD_TINTA
    ctx.strokeText(texto, 0, 0)
    ctx.fillStyle = HUD_PAPEL
    ctx.fillText(texto, 0, 0)

    ctx.strokeStyle = HUD_VIDA_CLARA
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(-330, 0)
    ctx.lineTo(-186, 0)
    ctx.moveTo(186, 0)
    ctx.lineTo(330, 0)
    ctx.stroke()
    ctx.restore()
}

// HUD completo. `estado` lo arma mapa.js en cada cuadro.
function dibujarHudArena(ctx, estado) {
    const ancho = ctx.canvas.width
    dibujarLadoHud(ctx, estado.jugador, ancho)
    dibujarLadoHud(ctx, estado.enemigo, ancho)
    dibujarCentroHud(ctx, estado, ancho)
    if (estado.banner) {
        dibujarBannerRonda(ctx, estado.banner.texto, estado.banner.progreso)
    }
}
