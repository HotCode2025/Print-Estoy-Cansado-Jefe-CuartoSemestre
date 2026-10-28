// Estado compartido de la partida
// Personajes elegidos y contador de rondas de la partida. La vida, la energía y
// las rondas ganadas viven en el duelo (duelo.js) desde E4.
// E0: corte mecánico de avatar.js. Sin cambios de comportamiento.

// Estado mutable de la partida, son let porque cambian durante el juego
let personajeJugador = ""
let personajeEnemigo = ""
let rondas = 0

// Clave de ranking persistente en localStorage
const claveRanking = "avatarRanking"
