// Mapa del encuentro (canvas, clases 9-11)
// Encuadre, loop de requestAnimationFrame, movimiento con teclado y botones.
// E0: corte mecánico de avatar.js. Sin cambios de comportamiento.

// Clase 9: mapa del encuentro (canvas). La sección y el canvas son
// estáticos en el HTML y el script corre al final del body, así que
// capturarlos acá arriba es seguro (clase 8: orden de ejecución).
const sectionVerMapa = document.getElementById("ver-mapa")
const mapa = document.getElementById("mapa")
let lienzo = null

// E1: la arena es el juego. El canvas tiene tres fases:
//   acercamiento -> el jugador camina hacia el rival
//   anuncio      -> contacto: se frena el movimiento y entra el cartel ROUND 1
//   duelo        -> turnos sobre el mismo canvas, con el HUD de vida
const FASE_ACERCAMIENTO = "acercamiento"
const FASE_ANUNCIO = "anuncio"
const FASE_DUELO = "duelo"
const DURACION_ANUNCIO_MS = 1100
// Cartel corto entre rondas: K.O. y la presentación de la ronda siguiente.
const DURACION_CORTE_MS = 900
// Cartel del cierre de la partida (VICTORIA / DERROTA / EMPATE): dura un poco
// más que el K.O. para que se lea antes de pasar a la etapa 3.
const DURACION_FINAL_MS = 1500
// Separación horizontal (px) a la que se considera que hay contacto con el rival.
const DISTANCIA_ENCUENTRO = 24
// Banda vertical donde el encuentro cuenta: si el jugador sube o baja demasiado, no hay choque.
const BANDA_ENCUENTRO = 40

const controlesMapa = document.querySelector(".controles-mapa")
const sectionAtaques = document.getElementById("seleccionar-ataque")
const sectionRegistro = document.getElementById("registro-combate")
const avisoArena = document.getElementById("aviso-arena")
// Loop del mapa: id de requestAnimationFrame y tiempo del cuadro anterior
// (se usa para escalar la velocidad al refresco real de la pantalla).
let animacionMapaId = null
let ultimoCuadroMapa = 0
let movimientoReducidoMapa = false
// El personaje está en marcha: la animación flota distinto mientras se mueve.
let moviendoseMapa = false
// Fondo del mapa: rota al azar entre estas imágenes en cada partida.
const FONDOS_MAPA = ["./assets/glaciares_bg.webp", "./assets/salon_bg.webp", "./assets/valle_bg.webp"]
let fondoMapaActual = null

// Clase 10: posición de cada personaje en el canvas (800x600) y velocidad.
// El jugador arranca a la izquierda y el enemigo espera a la derecha.
const CUADRO_JUGADOR = { x: 40, y: 160, lado: 280 }
const CUADRO_ENEMIGO = { x: 480, y: 160, lado: 280 }
// Píxeles por cuadro tomando 60 fps como referencia (la velocidad se ajusta
// al refresco real: 120 Hz o 144 Hz se mueven igual, no el doble).
const VELOCIDAD_MAPA = 5
const CUADRO_REFERENCIA_MS = 1000 / 60

// Instancias que se están pintando en el mapa.
let personajeMapaJugador = null
let personajeMapaEnemigo = null

// Estado de la arena que no pertenece a ningún personaje.
let faseArena = FASE_ACERCAMIENTO
let momentoAnuncio = 0
let textoAnuncio = "ROUND 1"
let duracionAnuncioActual = DURACION_ANUNCIO_MS
// Acción que se ejecuta cuando el cartel termina (empezar el duelo, cambiar de ronda, cerrar).
let accionAnuncio = null
// Vida dibujada (0-1): persigue a la real para que la barra baje suave.
let barraJugador = 1
let barraEnemigo = 1
let destelloJugador = 0
let destelloEnemigo = 0
let vidaJugadorPrevio = 100
let vidaEnemigoPrevio = 100
// Vigneta cacheada: el gradiente se arma una vez por partida, no en cada cuadro.
let vinetaArena = null

// Clase 10 y 11: las dos entradas de movimiento del jugador.
// Se guarda la dirección activa de cada una y se calcula la velocidad una sola vez.
const teclasMapa = new Set()
let botonMapa = null
// Equivalencia tecla -> dirección (es el switch (event.key) de la clase 11, en tabla).
const DIRECCIONES_TECLA = {
    ArrowUp: "arriba",
    ArrowDown: "abajo",
    ArrowLeft: "izquierda",
    ArrowRight: "derecha"
}

// Encajar una imagen en un cuadro cuadrado manteniendo el aspecto y centrada.
// Recibe la posición del cuadro para poder seguir al personaje cuando se mueve.
function encuadrarEnCuadro(x, y, lado, naturalAncho, naturalAlto) {
    const escala = Math.min(lado / naturalAncho, lado / naturalAlto)
    const ancho = naturalAncho * escala
    const alto = naturalAlto * escala
    return { x: x + (lado - ancho) / 2, y: y + (lado - alto) / 2, ancho: ancho, alto: alto }
}

// Radio de las cartas dibujadas en la arena. Es el mismo 20px de --radio-carta
// (las cartas HTML), para que el canvas y la página hablen el mismo idioma.
const RADIO_CARTA_ARENA = 20

// Contorno redondeado reutilizable: sirve para recortar la foto, para la sombra
// y para el borde. `arcTo` anda en cualquier navegador, sin depender de roundRect.
function trazadoCarta(izquierda, arriba, ancho, alto, radio) {
    const r = Math.max(0, Math.min(radio, ancho / 2, alto / 2))
    lienzo.beginPath()
    lienzo.moveTo(izquierda + r, arriba)
    lienzo.lineTo(izquierda + ancho - r, arriba)
    lienzo.arcTo(izquierda + ancho, arriba, izquierda + ancho, arriba + r, r)
    lienzo.lineTo(izquierda + ancho, arriba + alto - r)
    lienzo.arcTo(izquierda + ancho, arriba + alto, izquierda + ancho - r, arriba + alto, r)
    lienzo.lineTo(izquierda + r, arriba + alto)
    lienzo.arcTo(izquierda, arriba + alto, izquierda, arriba + alto - r, r)
    lienzo.lineTo(izquierda, arriba + r)
    lienzo.arcTo(izquierda, arriba, izquierda + r, arriba, r)
    lienzo.closePath()
}

// Pinta un personaje dentro de su cuadro del mapa como una carta: esquinas
// redondeadas, sombra proyectada, bisel y una luz que simula volumen.
// Si la imagen todavía no cargó, deja el marcador con fillRect que pedía la clase 9.
// `desplazamientoX` lo mueve para el ataque y `tinte` lo colorea al recibir o curarse.
function dibujarPersonajeMapa(personaje, x, y, lado, salto, desplazamientoX, tinte) {
    if (!personaje) {
        return
    }
    const foto = personaje.mapaFoto
    if (!foto || !foto.complete || !foto.naturalWidth || !foto.naturalHeight) {
        lienzo.save()
        lienzo.fillStyle = "#2B2118"
        trazadoCarta(x, y, lado, lado, RADIO_CARTA_ARENA)
        lienzo.fill()
        lienzo.restore()
        return
    }
    const encuadre = encuadrarEnCuadro(x, y, lado, foto.naturalWidth, foto.naturalHeight)
    const ancho = encuadre.ancho
    const alto = encuadre.alto
    const arriba = encuadre.y + salto
    const izquierda = encuadre.x + (desplazamientoX || 0)

    // 1. Canto: la misma silueta corrida unos píxeles simula el espesor de la carta.
    lienzo.save()
    lienzo.fillStyle = "#1D1610"
    trazadoCarta(izquierda + 4, arriba + 5, ancho, alto, RADIO_CARTA_ARENA)
    lienzo.fill()
    lienzo.restore()

    // 2. Sombra: la carta se despega del fondo. Es lo que da la profundidad.
    lienzo.save()
    lienzo.shadowColor = "rgba(8, 5, 3, 0.6)"
    lienzo.shadowBlur = 20
    lienzo.shadowOffsetY = 12
    lienzo.fillStyle = "#2B2118"
    trazadoCarta(izquierda, arriba, ancho, alto, RADIO_CARTA_ARENA)
    lienzo.fill()
    lienzo.restore()

    // 3. La foto, recortada por el mismo contorno y con el marco de tinta adentro.
    lienzo.save()
    trazadoCarta(izquierda, arriba, ancho, alto, RADIO_CARTA_ARENA)
    lienzo.clip()
    lienzo.lineWidth = 5
    lienzo.strokeStyle = "#2B2118"
    lienzo.strokeRect(izquierda, arriba, ancho, alto)
    lienzo.drawImage(foto, izquierda, arriba, ancho, alto)
    if (tinte && tinte.alfa > 0.01) {
        lienzo.globalAlpha = Math.min(0.75, tinte.alfa)
        lienzo.fillStyle = "rgb(" + tinte.color + ")"
        lienzo.fillRect(izquierda, arriba, ancho, alto)
        lienzo.globalAlpha = 1
    }
    // 4. Luz de la cara superior y sombra al pie: la superficie se lee curva sin
    //    deformar el dibujo del personaje (la foto queda intacta).
    const luz = lienzo.createLinearGradient(izquierda, arriba, izquierda + ancho * 0.6, arriba + alto)
    luz.addColorStop(0, "rgba(255, 250, 238, 0.22)")
    luz.addColorStop(0.42, "rgba(255, 250, 238, 0.03)")
    luz.addColorStop(1, "rgba(10, 6, 4, 0.32)")
    lienzo.fillStyle = luz
    lienzo.fillRect(izquierda, arriba, ancho, alto)
    lienzo.restore()

    // 5. Bisel: filo oscuro por fuera y brillo de 1.5px por dentro.
    lienzo.save()
    lienzo.lineWidth = 3
    lienzo.strokeStyle = "#2B2118"
    trazadoCarta(izquierda, arriba, ancho, alto, RADIO_CARTA_ARENA)
    lienzo.stroke()
    lienzo.lineWidth = 1.5
    lienzo.strokeStyle = "rgba(255, 246, 232, 0.32)"
    trazadoCarta(izquierda + 2, arriba + 2, ancho - 4, alto - 4, RADIO_CARTA_ARENA - 2)
    lienzo.stroke()
    lienzo.restore()
}

// Número flotante del golpe: sube y se desvanece sobre el luchador que lo recibe.
function dibujarFlotanteArena(flotante, x, y, lado) {
    if (!flotante) {
        return
    }
    lienzo.save()
    lienzo.globalAlpha = flotante.alfa
    lienzo.font = '700 34px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'
    lienzo.textAlign = "center"
    lienzo.textBaseline = "alphabetic"
    lienzo.lineJoin = "round"
    lienzo.lineWidth = 7
    lienzo.strokeStyle = "#2B2118"
    const centro = x + lado / 2
    const linea = y + 70 - flotante.subida
    lienzo.strokeText(flotante.texto, centro, linea)
    lienzo.fillStyle = flotante.color
    lienzo.fillText(flotante.texto, centro, linea)
    lienzo.restore()
}

// ---- Efectos de pelea (E6) ----
//
// Todo se deriva del progreso del evento: no se usa azar, así el mismo turno se
// ve igual siempre y el cuadro se puede reproducir. La intensidad sale del daño
// y de la ventaja elemental.

// Sobrante que se pinta de fondo para que la sacudida no deje bordes vacíos.
const MARGEN_SACUDIDA = 12
const COLORES_IMPACTO = {
    neutral: "255, 122, 92",
    ventaja: "255, 209, 102",
    desventaja: "155, 183, 212"
}

// Sacudida del lienzo: máxima en el impacto y se apaga con el progreso. Se
// desactiva con prefers-reduced-motion.
function sacudidaArena(evento) {
    if (!evento || movimientoReducidoMapa) {
        return { x: 0, y: 0 }
    }
    if (evento.tipo !== "golpe" && evento.tipo !== "residual") {
        return { x: 0, y: 0 }
    }
    const progreso = evento.progreso || 0
    const fuerza = (evento.tipo === "golpe" ? 1 : 0.45) * (1 - progreso)
    return {
        x: Math.sin(progreso * Math.PI * 26) * 6 * fuerza,
        y: Math.cos(progreso * Math.PI * 19) * 4 * fuerza
    }
}

// Chispas que salen en círculo desde el punto del golpe.
function dibujarChispasImpacto(centroX, centroY, progreso, color) {
    const salida = 14 + progreso * 54
    const largo = 14 * (1 - progreso) + 2
    lienzo.save()
    lienzo.globalAlpha = Math.max(0, 1 - progreso)
    lienzo.strokeStyle = "rgb(" + color + ")"
    lienzo.lineWidth = 3
    lienzo.lineCap = "round"
    for (let i = 0; i < 8; i++) {
        const angulo = (Math.PI * 2 * i) / 8 + 0.4
        const dx = Math.cos(angulo)
        const dy = Math.sin(angulo)
        lienzo.beginPath()
        lienzo.moveTo(centroX + dx * salida, centroY + dy * salida)
        lienzo.lineTo(centroX + dx * (salida + largo), centroY + dy * (salida + largo))
        lienzo.stroke()
    }
    lienzo.restore()
}

// Efecto propio de cada tipo de evento, centrado en quien lo recibe.
// `golpe` abre una onda y chispas; `cura` sube destellos verdes; `residual`
// levanta brasas; `estado` cierra un aro amarillo sobre el luchador marcado.
//
// Todo se pinta con mezcla aditiva: justo en el impacto el luchador está teñido
// de rojo, y un trazo normal se le mezclaba con el tinte hasta desaparecer.
function dibujarImpactoArena(evento, x, y, lado) {
    if (!evento || !lado) {
        return
    }
    const progreso = evento.progreso || 0
    const centroX = x + lado / 2
    const centroY = y + lado * 0.46
    const color = COLORES_IMPACTO[evento.ventaja] || COLORES_IMPACTO.neutral

    if (evento.tipo === "golpe") {
        const grande = evento.ventaja === "ventaja"
        const alcance = 18 + progreso * 62 * (grande ? 1.25 : 1)
        lienzo.save()
        lienzo.globalCompositeOperation = "lighter"
        // Núcleo: un destello corto que ancla el punto exacto del golpe.
        const brillo = Math.max(0, 1 - progreso * 1.7)
        if (brillo > 0) {
            const radioNucleo = 14 + 46 * brillo
            const gradiente = lienzo.createRadialGradient(centroX, centroY, 0, centroX, centroY, radioNucleo)
            gradiente.addColorStop(0, "rgba(" + color + ", " + (0.9 * brillo).toFixed(3) + ")")
            gradiente.addColorStop(1, "rgba(" + color + ", 0)")
            lienzo.fillStyle = gradiente
            lienzo.beginPath()
            lienzo.arc(centroX, centroY, radioNucleo, 0, Math.PI * 2)
            lienzo.fill()
        }
        lienzo.globalAlpha = Math.max(0, 1 - progreso) * 0.9
        lienzo.strokeStyle = "rgb(" + color + ")"
        lienzo.lineWidth = 6 * (1 - progreso) + 1.5
        lienzo.beginPath()
        lienzo.arc(centroX, centroY, alcance, 0, Math.PI * 2)
        lienzo.stroke()
        dibujarChispasImpacto(centroX, centroY, progreso, color)
        lienzo.restore()
        return
    }

    if (evento.tipo === "cura") {
        lienzo.save()
        lienzo.globalCompositeOperation = "lighter"
        lienzo.globalAlpha = Math.max(0, 1 - progreso) * 0.9
        lienzo.fillStyle = "rgb(127, 224, 160)"
        for (let i = 0; i < 6; i++) {
            const angulo = (Math.PI * 2 * i) / 6
            const px = centroX + Math.cos(angulo) * 44
            const py = centroY + 46 + Math.sin(angulo) * 16 - progreso * 52
            lienzo.beginPath()
            lienzo.arc(px, py, 3.2, 0, Math.PI * 2)
            lienzo.fill()
        }
        lienzo.restore()
        return
    }

    if (evento.tipo === "residual") {
        lienzo.save()
        lienzo.globalCompositeOperation = "lighter"
        lienzo.globalAlpha = Math.max(0, 1 - progreso) * 0.9
        lienzo.fillStyle = "rgb(255, 150, 60)"
        for (let i = 0; i < 7; i++) {
            const px = centroX - 36 + i * 12 + Math.sin(progreso * 9 + i) * 4
            const py = centroY + 34 - progreso * (40 + i * 5)
            lienzo.beginPath()
            lienzo.arc(px, py, 2.6, 0, Math.PI * 2)
            lienzo.fill()
        }
        lienzo.restore()
        return
    }

    if (evento.tipo === "estado") {
        lienzo.save()
        lienzo.globalCompositeOperation = "lighter"
        lienzo.globalAlpha = Math.max(0, 1 - progreso) * 0.9
        lienzo.strokeStyle = "rgb(242, 193, 78)"
        lienzo.lineWidth = 4
        lienzo.beginPath()
        lienzo.arc(centroX, centroY, 78 - progreso * 46, 0, Math.PI * 2)
        lienzo.stroke()
        lienzo.restore()
    }
}

// El efecto va sobre quien recibe el evento: el defensor en un golpe, el que se
// cura en una cura, el marcado en un estado. Nunca en los dos a la vez.
function dibujarImpactoEnObjetivo(evento, jugador) {
    if (!evento) {
        return
    }
    if (evento.objetivo === "jugador" && jugador) {
        dibujarImpactoArena(evento, jugador.x, jugador.y, jugador.ancho)
        return
    }
    if (evento.objetivo === "enemigo") {
        dibujarImpactoArena(evento, CUADRO_ENEMIGO.x, CUADRO_ENEMIGO.y, CUADRO_ENEMIGO.lado)
    }
}

// Dibujar el fondo cubriendo todo el canvas (cover) manteniendo aspecto.
// Si todavía no cargó, no dibuja nada y queda el fondo CSS.
// `margen` agranda el área pintada para que la sacudida no muestre los bordes.
function dibujarFondoMapa(margen) {
    if (!fondoMapaActual || !fondoMapaActual.naturalWidth || !fondoMapaActual.naturalHeight) {
        return
    }
    const extra = (margen || 0) * 2
    const escala = Math.max(
        (mapa.width + extra) / fondoMapaActual.naturalWidth,
        (mapa.height + extra) / fondoMapaActual.naturalHeight
    )
    const ancho = fondoMapaActual.naturalWidth * escala
    const alto = fondoMapaActual.naturalHeight * escala
    lienzo.drawImage(fondoMapaActual, (mapa.width - ancho) / 2, (mapa.height - alto) / 2, ancho, alto)
}

// Un cuadro de animación: mueve al jugador, limpia, pinta fondo, atmósfera,
// enemigo, jugador y HUD. Quieto flota suave; en marcha rebota más rápido y amplio.
function dibujarCuadroMapa(tiempo, deltaMs) {
    if (!lienzo) {
        return
    }
    moverPersonajeMapa(deltaMs)
    revisarEncuentro(tiempo)
    const cierre = faseArena === FASE_DUELO ? avanzarArena(deltaMs) : null
    if (cierre === "ronda-cerrada") {
        mostrarAnuncio("K.O.", DURACION_CORTE_MS, continuarTrasRonda, tiempo)
    }
    else if (cierre === "tiempo-cerrado") {
        // La ronda se cerró por el tope de turnos, no por K.O.: se avisa distinto.
        mostrarAnuncio("TIEMPO", DURACION_CORTE_MS, continuarTrasRonda, tiempo)
    }
    actualizarBarrasVida(deltaMs)
    const visual = estadoVisualArena()
    const amplitud = moviendoseMapa ? 12 : 6
    const velocidad = moviendoseMapa ? 0.012 : 0.004
    const salto = movimientoReducidoMapa ? 0 : Math.sin(tiempo * velocidad) * amplitud
    const sacudida = sacudidaArena(visual.evento)
    lienzo.clearRect(0, 0, mapa.width, mapa.height)
    // El mundo entero se corre con la sacudida del golpe y el fondo se pinta con
    // sobrante para que no queden bordes vacíos. El HUD y los números van quietos:
    // se leen mejor y no marean.
    lienzo.save()
    lienzo.translate(sacudida.x, sacudida.y)
    dibujarFondoMapa(MARGEN_SACUDIDA)
    dibujarAtmosferaArena(MARGEN_SACUDIDA)
    dibujarPersonajeMapa(
        personajeMapaEnemigo, CUADRO_ENEMIGO.x, CUADRO_ENEMIGO.y, CUADRO_ENEMIGO.lado, 0,
        visual.desplazamientoEnemigo, visual.tinteEnemigo
    )
    if (personajeMapaJugador) {
        dibujarPersonajeMapa(
            personajeMapaJugador, personajeMapaJugador.x, personajeMapaJugador.y, personajeMapaJugador.ancho, salto,
            visual.desplazamientoJugador, visual.tinteJugador
        )
    }
    dibujarImpactoEnObjetivo(visual.evento, personajeMapaJugador)
    lienzo.restore()
    if (personajeMapaJugador) {
        dibujarFlotanteArena(visual.flotanteJugador, personajeMapaJugador.x, personajeMapaJugador.y, personajeMapaJugador.ancho)
    }
    dibujarFlotanteArena(visual.flotanteEnemigo, CUADRO_ENEMIGO.x, CUADRO_ENEMIGO.y, CUADRO_ENEMIGO.lado)
    dibujarHudArena(lienzo, estadoHudArena(tiempo))
}

// Oscurecer y viñetear el fondo para que los luchadores y el HUD resalten.
// La viñeta se cachea porque el canvas no cambia de tamaño. `margen` agranda el
// área pintada para que la sacudida no muestre los bordes.
function dibujarAtmosferaArena(margen) {
    const extra = margen || 0
    const ancho = mapa.width + extra * 2
    const alto = mapa.height + extra * 2
    lienzo.save()
    lienzo.fillStyle = "rgba(18, 12, 8, 0.42)"
    lienzo.fillRect(-extra, -extra, ancho, alto)
    if (!vinetaArena) {
        const gradiente = lienzo.createRadialGradient(
            mapa.width / 2, mapa.height / 2, 140,
            mapa.width / 2, mapa.height / 2, 540
        )
        gradiente.addColorStop(0, "rgba(0, 0, 0, 0)")
        gradiente.addColorStop(1, "rgba(10, 6, 4, 0.62)")
        vinetaArena = gradiente
    }
    lienzo.fillStyle = vinetaArena
    lienzo.fillRect(-extra, -extra, ancho, alto)
    lienzo.restore()
}

// Estado que consume el HUD en cada cuadro. El duelo lo aporta duelo.js.
function estadoHudArena(tiempo) {
    let banner = null
    if (faseArena === FASE_ANUNCIO) {
        banner = {
            texto: textoAnuncio,
            progreso: Math.min(1, (tiempo - momentoAnuncio) / duracionAnuncioActual)
        }
    }
    const duelo = estadoDueloArena()
    const jugador = duelo ? duelo.jugador : null
    const enemigo = duelo ? duelo.enemigo : null
    return {
        jugador: {
            nombre: personajeMapaJugador ? personajeMapaJugador.nombre : "",
            fraccion: barraJugador,
            destello: destelloJugador,
            alineacion: "izquierda",
            vida: jugador ? jugador.vida : 100,
            energia: jugador ? jugador.energia : 0,
            energiaMaxima: jugador ? jugador.energiaMaxima : 5,
            estados: jugador ? jugador.estados : []
        },
        enemigo: {
            nombre: personajeMapaEnemigo ? personajeMapaEnemigo.nombre : "",
            fraccion: barraEnemigo,
            destello: destelloEnemigo,
            alineacion: "derecha",
            vida: enemigo ? enemigo.vida : 100,
            energia: enemigo ? enemigo.energia : 0,
            energiaMaxima: enemigo ? enemigo.energiaMaxima : 5,
            estados: enemigo ? enemigo.estados : []
        },
        ronda: duelo ? duelo.ronda : 0,
        winsJugador: duelo ? duelo.winsJugador : 0,
        winsEnemigo: duelo ? duelo.winsEnemigo : 0,
        reloj: duelo ? duelo.reloj : 0,
        banner: banner
    }
}

// La barra persigue a la vida real en vez de saltar: así se ve el golpe.
function actualizarBarrasVida(deltaMs) {
    const duelo = estadoDueloArena()
    if (duelo) {
        if (duelo.jugador.vida < vidaJugadorPrevio) {
            destelloJugador = 1
        }
        if (duelo.enemigo.vida < vidaEnemigoPrevio) {
            destelloEnemigo = 1
        }
        vidaJugadorPrevio = duelo.jugador.vida
        vidaEnemigoPrevio = duelo.enemigo.vida
    }

    const delta = deltaMs || CUADRO_REFERENCIA_MS
    const suavizado = movimientoReducidoMapa ? 1 : Math.min(1, delta / 90)
    const objetivoJugador = duelo ? duelo.jugador.fraccion : 1
    const objetivoEnemigo = duelo ? duelo.enemigo.fraccion : 1
    barraJugador += (objetivoJugador - barraJugador) * suavizado
    barraEnemigo += (objetivoEnemigo - barraEnemigo) * suavizado
    destelloJugador = Math.max(0, destelloJugador - delta / 320)
    destelloEnemigo = Math.max(0, destelloEnemigo - delta / 320)
}

// Fase de acercamiento: ¿el jugador ya está lo bastante cerca del rival?
function jugadorAlcanzaRival() {
    const jugador = personajeMapaJugador
    if (!jugador || !personajeMapaEnemigo) {
        return false
    }
    const distancia = CUADRO_ENEMIGO.x - (jugador.x + jugador.ancho)
    const arribaJugador = jugador.y
    const abajoJugador = jugador.y + jugador.alto
    const arribaEnemigo = CUADRO_ENEMIGO.y + BANDA_ENCUENTRO
    const abajoEnemigo = CUADRO_ENEMIGO.y + CUADRO_ENEMIGO.lado - BANDA_ENCUENTRO
    return distancia <= DISTANCIA_ENCUENTRO && abajoJugador > arribaEnemigo && arribaJugador < abajoEnemigo
}

// Avanza una sola vez por transición: en los cuadros siguientes ya no entra.
function revisarEncuentro(tiempo) {
    if (faseArena === FASE_ACERCAMIENTO) {
        if (jugadorAlcanzaRival()) {
            iniciarAnuncioDuelo(tiempo)
        }
        return
    }
    if (faseArena === FASE_ANUNCIO && tiempo - momentoAnuncio >= duracionAnuncioActual) {
        const accion = accionAnuncio
        accionAnuncio = null
        if (accion) {
            accion()
        }
        else {
            empezarDuelo()
        }
    }
}

// Cartel con duración y la acción que lo sigue. Centraliza ROUND N, K.O. y el
// cierre de la partida para que no haya tres versiones del mismo temporizador.
function mostrarAnuncio(texto, duracion, accion, tiempo) {
    faseArena = FASE_ANUNCIO
    textoAnuncio = texto
    duracionAnuncioActual = duracion || DURACION_CORTE_MS
    momentoAnuncio = tiempo === undefined ? performance.now() : tiempo
    accionAnuncio = accion || null
    actualizarBotonesArena()
}

// Contacto: se frena al jugador y entra el cartel. Todavía no se puede atacar.
function iniciarAnuncioDuelo(tiempo) {
    teclasMapa.clear()
    botonMapa = null
    aplicarVelocidadMapa()
    if (controlesMapa) {
        controlesMapa.hidden = true
    }
    if (avisoArena) {
        avisoArena.textContent = "¡Empieza el duelo!"
    }
    mostrarAnuncio("ROUND 1", DURACION_ANUNCIO_MS, empezarDuelo, tiempo)
}

// E6: congelar la página durante la pelea. La clase va en <html> porque ahí vive
// el scroll del documento; se saca al cerrar la partida o al salir de la arena.
function bloquearScrollArena() {
    document.documentElement.classList.add("arena-en-duelo")
}

function liberarScrollArena() {
    document.documentElement.classList.remove("arena-en-duelo")
}

// Antes de congelar el scroll hay que dejar los ataques a la vista: con la página
// inmóvil, lo que quede fuera de pantalla ya no se puede alcanzar.
function asegurarArenaVisible() {
    if (!sectionAtaques || typeof sectionAtaques.getBoundingClientRect !== "function") {
        return
    }
    const caja = sectionAtaques.getBoundingClientRect()
    if (caja.top < 0 || caja.bottom > window.innerHeight) {
        sectionAtaques.scrollIntoView({ block: "center" })
    }
}

// El cartel terminó: arranca la ronda 1 y se habilitan los ataques.
function empezarDuelo() {
    faseArena = FASE_DUELO
    iniciarDueloArena()
    if (sectionAtaques) {
        sectionAtaques.hidden = false
    }
    if (sectionRegistro) {
        sectionRegistro.hidden = false
    }
    if (avisoArena) {
        avisoArena.textContent = "Duelo en curso. Elegí uno de tus cuatro ataques."
    }
    asegurarArenaVisible()
    bloquearScrollArena()
    enfocarPrimerAtaque()
}

// Tras el K.O.: o entra la ronda siguiente, o se cierra la partida.
function continuarTrasRonda() {
    const paso = siguientePasoArena()
    if (paso.tipo === "ronda") {
        nuevaRondaArena()
        mostrarAnuncio("ROUND " + paso.numero, DURACION_CORTE_MS, function () {
            faseArena = FASE_DUELO
            reanudarRondaArena()
            if (avisoArena) {
                avisoArena.textContent = "Ronda " + paso.numero + "."
            }
            enfocarPrimerAtaque()
        })
        return
    }
    // Cierre de la partida: el K.O. ya se vio, así que la arena anuncia el
    // resultado antes de pasar a la etapa 3. Sin este cartel el duelo cortaba
    // en seco justo después del golpe final.
    mostrarAnuncio(textoFinalArena(), DURACION_FINAL_MS, terminarPartida)
}

function enfocarPrimerAtaque() {
    const boton = document.querySelector("#acciones-duelo [data-ataque]:not(:disabled)")
    if (boton && typeof boton.focus === "function") {
        boton.focus({ preventScroll: true })
    }
}

// Dejar la arena lista para una partida nueva: acercamiento y barras llenas.
function prepararArena() {
    faseArena = FASE_ACERCAMIENTO
    momentoAnuncio = 0
    textoAnuncio = "ROUND 1"
    duracionAnuncioActual = DURACION_ANUNCIO_MS
    accionAnuncio = null
    reiniciarDueloArena()
    barraJugador = 1
    barraEnemigo = 1
    destelloJugador = 0
    destelloEnemigo = 0
    vidaJugadorPrevio = 100
    vidaEnemigoPrevio = 100
    vinetaArena = null
    if (controlesMapa) {
        controlesMapa.hidden = false
    }
    if (sectionAtaques) {
        sectionAtaques.hidden = true
    }
    if (sectionRegistro) {
        sectionRegistro.hidden = true
    }
    if (avisoArena) {
        avisoArena.textContent = "Acercate al rival para empezar el duelo."
    }
}

// Clase 10: la posición se actualiza sumando la velocidad, y se limita al canvas
// para que el personaje no pueda salirse del mapa.
function moverPersonajeMapa(deltaMs) {
    const jugador = personajeMapaJugador
    if (!jugador) {
        return
    }
    const factor = Math.min(deltaMs || CUADRO_REFERENCIA_MS, 50) / CUADRO_REFERENCIA_MS
    jugador.x += jugador.velocidadX * factor
    jugador.y += jugador.velocidadY * factor
    jugador.x = Math.min(Math.max(jugador.x, 0), Math.max(mapa.width - jugador.ancho, 0))
    jugador.y = Math.min(Math.max(jugador.y, 0), Math.max(mapa.height - jugador.alto, 0))
}

// Loop del mapa con requestAnimationFrame. Se escala por el tiempo real entre
// cuadros para que la velocidad sea la misma en pantallas de 60, 120 o 144 Hz.
function iniciarAnimacionMapa() {
    detenerAnimacionMapa()
    const cuadro = function (tiempo) {
        const delta = ultimoCuadroMapa ? tiempo - ultimoCuadroMapa : CUADRO_REFERENCIA_MS
        ultimoCuadroMapa = tiempo
        dibujarCuadroMapa(tiempo || 0, delta)
        // El cuadro puede detener el loop (fin de partida, cambio de etapa):
        // si pasó, no se reprograma y no queda una animación zombi.
        if (animacionMapaId !== null) {
            animacionMapaId = requestAnimationFrame(cuadro)
        }
    }
    ultimoCuadroMapa = 0
    animacionMapaId = requestAnimationFrame(cuadro)
}

function detenerAnimacionMapa() {
    if (animacionMapaId !== null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(animacionMapaId)
    }
    animacionMapaId = null
}

// La marcha la prenden y apagan las entradas de movimiento (teclas y botones).
function definirMovimientoMapa(enMarcha) {
    moviendoseMapa = Boolean(enMarcha)
}

// Clase 10: los botones del mapa fijan la dirección mientras están apretados
// (mousedown) y detenerMovimiento() la suelta (mouseup o mouseleave).
function moverArriba() {
    fijarBotonMapa("arriba")
}

function moverAbajo() {
    fijarBotonMapa("abajo")
}

function moverIzquierda() {
    fijarBotonMapa("izquierda")
}

function moverDerecha() {
    fijarBotonMapa("derecha")
}

function fijarBotonMapa(direccion) {
    botonMapa = direccion
    aplicarVelocidadMapa()
}

function detenerMovimiento() {
    botonMapa = null
    aplicarVelocidadMapa()
}

// Calcula velocidadX/velocidadY según lo que esté presionado en ese instante.
// Así, al soltar una tecla en diagonal, el otro eje sigue avanzando.
function aplicarVelocidadMapa() {
    const jugador = personajeMapaJugador
    if (!jugador) {
        return
    }
    // Fuera del acercamiento el personaje no se mueve: el duelo es por turnos.
    if (faseArena !== FASE_ACERCAMIENTO) {
        jugador.velocidadX = 0
        jugador.velocidadY = 0
        definirMovimientoMapa(false)
        return
    }
    const activas = new Set(teclasMapa)
    if (botonMapa) {
        activas.add(botonMapa)
    }
    let velocidadX = 0
    let velocidadY = 0
    if (activas.has("izquierda")) {
        velocidadX -= VELOCIDAD_MAPA
    }
    if (activas.has("derecha")) {
        velocidadX += VELOCIDAD_MAPA
    }
    if (activas.has("arriba")) {
        velocidadY -= VELOCIDAD_MAPA
    }
    if (activas.has("abajo")) {
        velocidadY += VELOCIDAD_MAPA
    }
    jugador.velocidadX = velocidadX
    jugador.velocidadY = velocidadY
    definirMovimientoMapa(velocidadX !== 0 || velocidadY !== 0)
}

// Clase 11: teclado. keydown marca la dirección, keyup la suelta.
function sePresionoUnaTecla(event) {
    const direccion = DIRECCIONES_TECLA[event.key]
    if (!direccion) {
        return
    }
    // Durante el anuncio y el duelo las flechas no mueven el personaje, pero
    // tampoco pueden scrollear la página: si no, jugar con el teclado movía la
    // vista y se perdía de vista la arena.
    event.preventDefault()
    if (faseArena !== FASE_ACERCAMIENTO) {
        return
    }
    teclasMapa.add(direccion)
    aplicarVelocidadMapa()
}

function seSoltoUnaTecla(event) {
    const direccion = DIRECCIONES_TECLA[event.key]
    if (!direccion) {
        return
    }
    teclasMapa.delete(direccion)
    aplicarVelocidadMapa()
}

// Botones de dirección del mapa: se enganchan una sola vez al iniciar el juego.
const CONTROLES_MAPA = [
    { id: "boton-mover-arriba", mover: moverArriba },
    { id: "boton-mover-izquierda", mover: moverIzquierda },
    { id: "boton-mover-abajo", mover: moverAbajo },
    { id: "boton-mover-derecha", mover: moverDerecha }
]

function configurarControlesMapa() {
    CONTROLES_MAPA.forEach(function (control) {
        const boton = document.getElementById(control.id)
        if (!boton) {
            return
        }
        boton.addEventListener("mousedown", control.mover)
        boton.addEventListener("mouseup", detenerMovimiento)
        boton.addEventListener("mouseleave", detenerMovimiento)
    })
}

// Devolver al personaje a su cuadro inicial con la velocidad en cero.
function reiniciarPosicionMapa(personaje, cuadro) {
    if (!personaje) {
        return
    }
    personaje.x = cuadro.x
    personaje.y = cuadro.y
    personaje.ancho = cuadro.lado
    personaje.alto = cuadro.lado
    personaje.velocidadX = 0
    personaje.velocidadY = 0
}

// Clase 11: iniciarMapa reúne lo que la clase dejaba suelto en seleccionarPersonajeJugador.
// Resuelve el personaje elegido, prepara el fondo y engancha loop + listeners
// del teclado una sola vez por partida.
function iniciarMapa() {
    if (!sectionVerMapa || !mapa || typeof mapa.getContext !== "function") {
        return
    }
    lienzo = mapa.getContext("2d")
    personajeMapaJugador = buscarPersonaje(personajeJugador) || null
    personajeMapaEnemigo = buscarPersonaje(personajeEnemigo) || null
    if (!personajeMapaJugador) {
        return
    }
    reiniciarPosicionMapa(personajeMapaJugador, CUADRO_JUGADOR)
    teclasMapa.clear()
    botonMapa = null
    prepararArena()
    aplicarVelocidadMapa()
    fondoMapaActual = new Image()
    fondoMapaActual.src = FONDOS_MAPA[aleatorio(0, FONDOS_MAPA.length - 1)]
    movimientoReducidoMapa = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    // La tipografía del HUD puede no estar lista en el primer cuadro: se pide sin bloquear.
    if (document.fonts && typeof document.fonts.load === "function") {
        document.fonts.load('22px "SpellOfAsia"').catch(function () { })
    }
    sectionVerMapa.hidden = false
    window.addEventListener("keydown", sePresionoUnaTecla)
    window.addEventListener("keyup", seSoltoUnaTecla)
    iniciarAnimacionMapa()
}

// Ocultar el mapa (inicio y reinicio de partida). Corta el loop y los listeners:
// si no, al volver a jugar quedan dos loops y dos keydown activos.
function ocultarMapa() {
    detenerAnimacionMapa()
    window.removeEventListener("keydown", sePresionoUnaTecla)
    window.removeEventListener("keyup", seSoltoUnaTecla)
    teclasMapa.clear()
    botonMapa = null
    personajeMapaJugador = null
    personajeMapaEnemigo = null
    moviendoseMapa = false
    // Volver la arena a su estado inicial para la próxima partida.
    faseArena = FASE_ACERCAMIENTO
    momentoAnuncio = 0
    textoAnuncio = "ROUND 1"
    duracionAnuncioActual = DURACION_ANUNCIO_MS
    accionAnuncio = null
    vinetaArena = null
    barraJugador = 1
    barraEnemigo = 1
    destelloJugador = 0
    destelloEnemigo = 0
    vidaJugadorPrevio = 100
    vidaEnemigoPrevio = 100
    reiniciarDueloArena()
    liberarScrollArena()
    if (sectionVerMapa) {
        sectionVerMapa.hidden = true
    }
}
