// Punto de entrada
// Enlaza los botones de la pantalla y arranca el juego. Es el único archivo que se carga al final.
// E0: corte mecánico de avatar.js. Sin cambios de comportamiento.

// Iniciar juego
function iniciarJuego() {
    const botonPersonajeJugador = document.getElementById("boton-personaje")
    botonPersonajeJugador.addEventListener("click", seleccionarPersonajeJugador)

    const botonReiniciar = document.getElementById("boton-reiniciar")
    botonReiniciar.addEventListener("click", reiniciarPartida)

    const botonReiniciarModal = document.getElementById("boton-reiniciar-modal")
    botonReiniciarModal.addEventListener("click", reiniciarPartida)

    const botonJugarNuevo = document.getElementById("boton-jugar-nuevo")
    if (botonJugarNuevo) {
        botonJugarNuevo.addEventListener("click", reiniciarPartida)
    }

    const botonVerReglas = document.getElementById("boton-ver-reglas-etapa4")
    if (botonVerReglas) {
        botonVerReglas.addEventListener("click", abrirReglas)
    }

    configurarDialogoReglas()
    configurarControlesMapa()
    configurarOnline()
    renderSeleccion()
    configurarFormularioPersonaje()
    ocultarMapa()

    mostrarEtapa(1)
    iniciarCombate()
}

// Cargar juego
window.addEventListener("load", iniciarJuego)
