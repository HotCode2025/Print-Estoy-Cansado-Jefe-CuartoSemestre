// Modelo de personajes
// Clase Personaje, registro PERSONAJES, imágenes, naciones y alta desde el formulario.
// E0: corte mecánico de avatar.js. Sin cambios de comportamiento.

// Plantilla de personajes: cada luchador es un objeto Personaje.
// Permite registrar una cantidad ilimitada (100, 1000, ...) sin cambiar la lógica del juego.
// Como maximo se pueden agregar 5 personajes debido al poco sentido de tener 1000 luchadores en la selección. Los 4 originales no cuentan para el límite.
class Personaje {
    constructor({ id, nombre, imagen, nombreImg, genero, vidas = 3, ataques = [{ nombre: "Puñetazo", id: "boton-punetazo" }, { nombre: "Patada", id: "boton-patada" }, { nombre: "Barrida", id: "boton-barrida" }], elemento = "", claseCss = "", emblema = "", esAgregado = false }) {
        this.id = id
        this.nombre = nombre || id
        this.imagen = imagen
        this.nombreImg = nombreImg || ""
        this.genero = genero === "a" ? "a" : "o"
        this.vidas = vidas
        this.ataques = normalizarAtaques(ataques)
        this.elemento = elemento
        this.claseCss = claseCss
        this.emblema = emblema
        this.esAgregado = Boolean(esAgregado)

        // Clase 10: estado del personaje en el mapa del encuentro.
        // La posición vive en el objeto porque el movimiento la actualiza cuadro a cuadro.
        this.x = 60
        this.y = 120
        // ancho/alto son el cuadro donde se encaja la imagen: la foto se dibuja
        // centrada y sin deformarse dentro de ese cuadrado.
        this.ancho = 280
        this.alto = 280
        this.velocidadX = 0
        this.velocidadY = 0
        // Imagen propia del mapa: se crea una sola vez por personaje, no en cada cuadro.
        this.mapaFoto = new Image()
        this.mapaFoto.src = this.imagen || ""
    }

    esValido() {
        return Boolean(this.id) && Boolean(this.nombre) && Boolean(this.imagen)
    }

    nombreParaMensaje() {
        return this.nombre
    }

    cartaHTML() {
        const nombreHtml = this.nombreImg
            ? `<img src="${this.nombreImg}" alt="${this.nombre}" class="carta-nombre-img">`
            : `<span class="carta-nombre-img carta-nombre-texto">${this.nombre}</span>`
        const estiloFondo = this.imagen && this.claseCss.split(" ").includes("carta-personalizada")
            ? ` style="background-image:url(${this.imagen})"`
            : ""
        return `<label class="carta ${this.claseCss}"${estiloFondo}>` +
            `<input type="radio" name="personaje" id="${this.id}" value="${this.id}">` +
            `${emblemaSVG(this.emblema)}` +
            `${nombreHtml}` +
            `<span class="carta-elemento">${this.elemento}</span>` +
            `<span class="carta-seleccion">ELEGIDO</span>` +
            `</label>`
    }
}

// Ataques base: arreglo de objetos { nombre, id } como pide la clase.
// Acepta objetos o strings sueltos ("Puñetazo") y los normaliza a objetos.
function normalizarAtaques(ataques) {
    const base = [
        { nombre: "Puñetazo", id: "boton-punetazo" },
        { nombre: "Patada", id: "boton-patada" },
        { nombre: "Barrida", id: "boton-barrida" }
    ]
    if (!Array.isArray(ataques) || ataques.length === 0) {
        return base
    }
    return ataques.map(function (a) {
        if (typeof a === "string") {
            return { nombre: a, id: "boton-" + a.toLowerCase() }
        }
        return { nombre: a.nombre, id: a.id }
    })
}

// Registro de personajes disponibles en la selección.
// Para sumar luchadores basta con agregar `new Personaje(...)` o usar agregarPersonaje(datos).
const NUM_BASE = 4
const MAX_AGREGADOS = 5
const MAX_TOTAL = NUM_BASE + MAX_AGREGADOS
const PERSONAJES = [
    new Personaje({ id: "Zuko", nombre: "Zuko", imagen: "./assets/zuko.webp", nombreImg: "./assets/name-zuko.webp", genero: "o", elemento: "Nación del Fuego", claseCss: "carta-fuego", emblema: "fuego", esAgregado: false }),
    new Personaje({ id: "Aang", nombre: "Aang", imagen: "./assets/aang.webp", nombreImg: "./assets/name-aang.webp", genero: "o", elemento: "Nómadas del Aire", claseCss: "carta-aire", emblema: "aire", esAgregado: false }),
    new Personaje({ id: "Katara", nombre: "Katara", imagen: "./assets/katara.webp", nombreImg: "./assets/name-katara.webp", genero: "a", elemento: "Tribu Agua", claseCss: "carta-agua", emblema: "agua", esAgregado: false }),
    new Personaje({ id: "Toph", nombre: "Toph", imagen: "./assets/toph.webp", nombreImg: "./assets/name-toph.webp", genero: "a", elemento: "Reino Tierra", claseCss: "carta-tierra", emblema: "tierra", esAgregado: false })
]

// Cantidad de personajes agregados por el formulario (los 4 base no cuentan).
function contarAgregados() {
    const marcados = PERSONAJES.filter(function (p) { return p.esAgregado })
    if (marcados.length > 0 || PERSONAJES.length <= NUM_BASE) {
        return marcados.length
    }
    return PERSONAJES.length - NUM_BASE
}

function limiteAgregadosAlcanzado() {
    return contarAgregados() >= MAX_AGREGADOS
}

// Emblemas SVG por nación (los mismos de la selección original)
function emblemaSVG(tipo) {
    if (tipo === "fuego") {
        return '<svg class="emblema" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
            '<path d="M50 14 C56 26 70 33 70 52 C70 68 61 78 50 78 C39 78 30 68 30 52 C30 41 37 36 40 28 C43 36 47 38 49 34 C51 30 47 22 50 14 Z" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M50 46 C54 52 58 55 58 62 C58 69 54 73 50 73 C46 73 42 69 42 62 C42 56 46 53 50 46 Z" stroke="currentColor" stroke-width="5" fill="none" stroke-linejoin="round"/>' +
            "</svg>"
    }
    if (tipo === "aire") {
        return '<svg class="emblema" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
            "<defs>" +
            '<path id="espiral-aire" d="M68 30 C52 18 30 24 24 42 C19 58 30 72 45 72 C57 72 66 64 65 53 C64 44 57 39 50 42 C44 45 43 52 48 56" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
            "</defs>" +
            '<use href="#espiral-aire"/>' +
            '<use href="#espiral-aire" transform="rotate(120 50 50)"/>' +
            '<use href="#espiral-aire" transform="rotate(240 50 50)"/>' +
            "</svg>"
    }
    if (tipo === "agua") {
        return '<svg class="emblema" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
            '<circle cx="50" cy="50" r="36" stroke="currentColor" stroke-width="5" fill="none"/>' +
            '<path d="M22 48 Q30 40 38 48 T54 48 T70 48" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/>' +
            '<path d="M26 62 Q34 54 42 62 T58 62 T74 62" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/>' +
            "</svg>"
    }
    return '<svg class="emblema" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
        '<circle cx="50" cy="50" r="36" stroke="currentColor" stroke-width="5" fill="none"/>' +
        '<rect x="36" y="36" width="28" height="28" stroke="currentColor" stroke-width="5" fill="none" stroke-linejoin="round"/>' +
        "</svg>"
}

// Buscar un personaje del registro por id
function buscarPersonaje(id) {
    return PERSONAJES.find(function (p) { return p.id === id })
}

// Mapas de compatibilidad derivados del registro (misma forma que antes)
const imagenesPersonajes = {}
const imagenesNombres = {}
const generoPersonajes = {}
function sincronizarMapas() {
    PERSONAJES.forEach(function (p) {
        imagenesPersonajes[p.id] = p.imagen
        imagenesNombres[p.id] = p.nombreImg || p.imagen
        generoPersonajes[p.id] = p.genero
    })
}
sincronizarMapas()

// Datos base por elemento para personajes agregados desde el formulario.
// Solo se aplican a tarjetas agregadas: fondo random_*.webp y color de nación
// para el nombre en fuente Spell of Asia. Los 4 originales no cambian.
const datosNacionAgregada = {
    fuego: { elemento: "Nación del Fuego", claseCss: "carta-personalizada carta-nacion-fuego", emblema: "fuego", imagen: "./assets/random_fuego.webp" },
    aire: { elemento: "Nómadas del Aire", claseCss: "carta-personalizada carta-nacion-aire", emblema: "aire", imagen: "./assets/random_aire.webp" },
    agua: { elemento: "Tribu Agua", claseCss: "carta-personalizada carta-nacion-agua", emblema: "agua", imagen: "./assets/random_agua.webp" },
    tierra: { elemento: "Reino Tierra", claseCss: "carta-personalizada carta-nacion-tierra", emblema: "tierra", imagen: "./assets/random_tierra.webp" }
}

// Compatibilidad: alias con las claves capitalizadas que usaba el formulario.
const datosPorElemento = {
    Fuego: datosNacionAgregada.fuego,
    Aire: datosNacionAgregada.aire,
    Agua: datosNacionAgregada.agua,
    Tierra: datosNacionAgregada.tierra
}

// Normalizar el valor del select a una nación válida (insensible a mayúsculas).
function normalizarNacion(valor) {
    const clave = String(valor || "").trim().toLowerCase()
    if (datosNacionAgregada[clave]) {
        return clave
    }
    return "fuego"
}

// Agregar un personaje nuevo y volver a dibujar la selección.
// Las tarjetas agregadas usan nombre como texto (sin nombreImg) con color de nación.
function agregarPersonaje(datos) {
    if (limiteAgregadosAlcanzado()) {
        return null
    }
    const nacion = normalizarNacion(datos.elemento)
    const base = datosNacionAgregada[nacion]
    const id = (datos.id || datos.nombre || "").trim()
    if (!id) {
        return null
    }
    if (buscarPersonaje(id)) {
        return buscarPersonaje(id)
    }
    const personaje = new Personaje({
        id: id,
        nombre: (datos.nombre || id).trim(),
        imagen: datos.imagen || base.imagen,
        nombreImg: "",
        genero: datos.genero || "o",
        elemento: base.elemento,
        claseCss: base.claseCss,
        emblema: base.emblema,
        esAgregado: true
    })
    if (!personaje.esValido()) {
        return null
    }
    PERSONAJES.push(personaje)
    sincronizarMapas()
    renderSeleccion()
    return personaje
}

// Actualizar contador, aviso y estado del formulario según el límite.
function actualizarEstadoFormulario() {
    const agregados = contarAgregados()
    const contador = document.getElementById("contador-personajes")
    if (contador) {
        contador.textContent = "Agregados " + agregados + "/" + MAX_AGREGADOS
    }
    const alLimite = agregados >= MAX_AGREGADOS
    const campoNombre = document.getElementById("nuevo-nombre")
    const campoElemento = document.getElementById("nuevo-elemento")
    const botonAgregar = document.getElementById("boton-agregar-personaje")
    if (campoNombre) {
        campoNombre.disabled = alLimite
    }
    if (campoElemento) {
        campoElemento.disabled = alLimite
    }
    if (botonAgregar) {
        botonAgregar.disabled = alLimite
    }
    const aviso = document.getElementById("aviso-personaje")
    if (aviso && alLimite) {
        aviso.textContent = "Límite alcanzado: máximo " + MAX_AGREGADOS + " personajes agregados (" + MAX_TOTAL + " en total)."
    }
}

