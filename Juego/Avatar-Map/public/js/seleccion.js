// Etapas y selección de personaje
// Mostrar etapas, cartas, marcador, reglas y reinicio de partida.
// E0: corte mecánico de avatar.js. Sin cambios de comportamiento.

// Mostrar una etapa (1-4) sin desmontar la arena, que sigue visible durante la batalla.
// Los listeners se enlazan una sola vez en iniciarJuego/iniciarCombate.
function mostrarEtapa(n) {
    for (let i = 1; i <= 4; i++) {
        const etapa = document.getElementById("etapa-" + i)
        if (etapa) {
            etapa.hidden = i !== n && !(i === 2 && n === 3)
        }
    }

    // La arena queda visible y animada durante el duelo.
    if (n !== 2 && n !== 3) {
        detenerAnimacionMapa()
    }

    const tituloId = n === 2 ? "titulo-mapa" : "titulo-etapa-" + n
    const titulo = document.getElementById(tituloId)
    if (titulo) {
        titulo.focus()
    }
}

// Dibujar las cartas de selección desde el registro PERSONAJES.
// Render dinámico con forEach y templates literales: por cada personaje
// se concatena su carta al contenedor con innerHTML +=.
function renderSeleccion() {
    const contenedor = document.getElementById("cartas-personajes")
    if (!contenedor) {
        return
    }
    contenedor.innerHTML = ""
    PERSONAJES.forEach(function (p) {
        contenedor.innerHTML += p.cartaHTML()
    })
    configurarInclinacionCartas()
    actualizarEstadoFormulario()
}

// Conectar el formulario que agrega personajes en clase sin editar código
function configurarFormularioPersonaje() {
    const formulario = document.getElementById("formulario-personaje")
    if (!formulario || formulario.dataset.configurado === "1") {
        return
    }
    formulario.dataset.configurado = "1"
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault()
        const campoNombre = document.getElementById("nuevo-nombre")
        const campoElemento = document.getElementById("nuevo-elemento")
        const aviso = document.getElementById("aviso-personaje")
        if (limiteAgregadosAlcanzado()) {
            if (aviso) {
                aviso.textContent = "Límite alcanzado: máximo " + MAX_AGREGADOS + " personajes agregados (" + MAX_TOTAL + " en total)."
            }
            actualizarEstadoFormulario()
            return
        }
        const nombre = campoNombre ? campoNombre.value.trim() : ""
        if (!nombre) {
            if (aviso) {
                aviso.textContent = "Escriba un nombre para agregar el personaje."
            }
            if (campoNombre) {
                campoNombre.focus()
            }
            return
        }
        const creado = agregarPersonaje({ id: nombre, nombre: nombre, elemento: campoElemento ? campoElemento.value : "Fuego" })
        if (!creado) {
            if (aviso) {
                aviso.textContent = "Límite alcanzado: máximo " + MAX_AGREGADOS + " personajes agregados (" + MAX_TOTAL + " en total)."
            }
            actualizarEstadoFormulario()
            return
        }
        if (aviso) {
            aviso.textContent = nombre + " se unió a la selección."
        }
        formulario.reset()
        actualizarEstadoFormulario()
        if (campoNombre && !campoNombre.disabled) {
            campoNombre.focus()
        }
    })
}

// Obtener el id del personaje marcado en la selección
function obtenerPersonajeMarcado() {
    const marcado = document.querySelector('input[name="personaje"]:checked')
    return marcado ? marcado.value : ""
}

// Deshabilitar o habilitar todas las cartas de selección
function definirCartasDeshabilitadas(deshabilitar) {
    document.querySelectorAll('input[name="personaje"]').forEach(function (input) {
        input.disabled = deshabilitar
    })
}

// Pintar un lado del marcador con imagen + nombre, sin texto solo.
// Base: silueta (Personaje.imagen) + imagen de nombre (nombreImg).
// Agregado: fondo de nación (Personaje.imagen) + nombre en texto Spell of Asia.
function actualizarMarcador(lado, idPersonaje) {
    const datos = buscarPersonaje(idPersonaje)
    if (!datos) {
        return
    }
    const esEnemigo = lado === "enemigo"
    const img = document.getElementById(esEnemigo ? "personaje-enemigo" : "personaje-jugador")
    const nombre = document.getElementById(esEnemigo ? "nombre-enemigo" : "nombre-jugador")
    if (img) {
        img.src = datos.imagen
        img.alt = datos.nombre
    }
    if (nombre) {
        if (datos.nombreImg) {
            nombre.innerHTML = '<img src="' + datos.nombreImg + '" alt="' + datos.nombre + '" class="marcador-nombre-img">'
        }
        else {
            nombre.innerHTML = '<span class="marcador-nombre-texto" style="color:' + colorNacionAgregada(datos.emblema) + '">' + datos.nombre + "</span>"
        }
    }
}

// Selección del personaje del jugador
function seleccionarPersonajeJugador() {
    const avisoSeleccion = document.getElementById("aviso-seleccion")

    const idElegido = obtenerPersonajeMarcado()
    const elegido = idElegido ? buscarPersonaje(idElegido) : undefined

    if (!elegido) {
        avisoSeleccion.innerHTML = "Primero selecciona un personaje para comenzar el combate"
        return
    }

    if (conexionOnline.codigo) {
        if (!seleccionarPersonajeOnline(elegido)) {
            avisoSeleccion.textContent = "No se pudo enviar la selección. Revisá la conexión con la sala."
            return
        }
        personajeJugador = elegido.id
        avisoSeleccion.textContent = ""
        definirCartasDeshabilitadas(true)
        document.getElementById("boton-personaje").disabled = true
        return
    }

    personajeJugador = elegido.id

    actualizarMarcador("jugador", personajeJugador)
    avisoSeleccion.innerHTML = ""

    // Deshabilitar selección de personaje para que no se cambie en medio del juego
    definirCartasDeshabilitadas(true)
    document.getElementById("boton-personaje").disabled = true

    iniciarMapa()
    mostrarEtapa(2)
}

// Deshabilitar los botones de ataque
function deshabilitarAtaques() {
    document.querySelectorAll("#acciones-duelo [data-ataque]").forEach(function (boton) {
        boton.disabled = true
    })
}

// El rival se define por el personaje con el que el jugador colisiona en el mapa.
function seleccionarPersonajeEnemigo(enemigo) {
    const datos = typeof enemigo === "string" ? buscarPersonaje(enemigo) : enemigo
    if (!datos || datos.id === personajeJugador) {
        return false
    }
    personajeEnemigo = datos.id
    actualizarMarcador("enemigo", personajeEnemigo)
    return true
}

// Abrir y cerrar el cuadro de reglas
function abrirReglas() {
    document.getElementById("dialogo-reglas").showModal()
}

function cerrarReglas() {
    document.getElementById("dialogo-reglas").close()
}

function configurarDialogoReglas() {
    const botonReglas = document.getElementById("boton-reglas")
    const botonCerrarReglas = document.getElementById("boton-cerrar-reglas")

    botonReglas.addEventListener("click", abrirReglas)
    botonCerrarReglas.addEventListener("click", cerrarReglas)
}

// Reiniciar la partida restableciendo el estado sin recargar la página
function reiniciarPartida() {
    const dialogo = document.getElementById("dialogo-resultado")
    if (dialogo && dialogo.open) {
        dialogo.close()
    }

    rondas = 0
    personajeJugador = ""
    personajeEnemigo = ""
    cerrarConexionOnline()
    limpiarPersonajesOnline()
    document.getElementById("boton-personaje").textContent = "Jugar contra la computadora"

    // Las rondas ganadas y los botones de ataque los limpia duelo.js; el registro
    // de combate y la selección se limpian acá.
    document.getElementById("mensajes").innerHTML = ""
    document.getElementById("aviso-seleccion").innerHTML = ""
    const registroVacio = document.getElementById("registro-vacio")
    if (registroVacio) {
        registroVacio.hidden = false
    }

    const imgJugador = document.getElementById("personaje-jugador")
    imgJugador.removeAttribute("src")
    imgJugador.alt = ""
    const nombreJugador = document.getElementById("nombre-jugador")
    if (nombreJugador) {
        nombreJugador.innerHTML = ""
    }
    const imgEnemigo = document.getElementById("personaje-enemigo")
    imgEnemigo.removeAttribute("src")
    imgEnemigo.alt = ""
    const nombreEnemigo = document.getElementById("nombre-enemigo")
    if (nombreEnemigo) {
        nombreEnemigo.innerHTML = ""
    }

    definirCartasDeshabilitadas(false)
    document.querySelectorAll('input[name="personaje"]').forEach(function (input) {
        input.checked = false
    })
    document.getElementById("boton-personaje").disabled = false

    deshabilitarAtaques()
    document.getElementById("reiniciar").hidden = true
    ocultarMapa()

    mostrarEtapa(1)
}

// Iniciar combate
