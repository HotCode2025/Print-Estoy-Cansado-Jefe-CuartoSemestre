// Servidor estático mínimo para el juego. Sin dependencias: solo node:http y node:fs.
//
// Por qué existe: abrir el HTML con doble click (file://) funciona hoy, pero bloquea
// módulos ES y fetch(). El destino del proyecto es un host, así que conviene que el
// juego corra igual desde el principio por http.
//
// Uso:  node servidor.mjs          -> http://localhost:5173
//       $env:PORT=8080; node servidor.mjs
import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const RAIZ = resolve(fileURLToPath(new URL("./public", import.meta.url)))
const PUERTO = Number(process.env.PORT) || 5173

const TIPOS = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2"
}

// Traduce la URL a un archivo dentro de public/. Devuelve null si se intenta salir
// de la carpeta raíz (path traversal) o si el recurso no existe.
async function resolverArchivo(url) {
    const ruta = decodeURIComponent(new URL(url, "http://localhost").pathname)
    const relativa = ruta === "/" ? "avatar.html" : ruta.replace(/^\/+/, "")
    const destino = resolve(join(RAIZ, normalize(relativa)))
    if (destino !== RAIZ && !destino.startsWith(RAIZ + sep)) {
        return null
    }
    try {
        const info = await stat(destino)
        if (!info.isFile()) {
            return null
        }
        return destino
    } catch {
        return null
    }
}

const servidor = createServer(async function (peticion, respuesta) {
    const archivo = await resolverArchivo(peticion.url || "/")
    if (!archivo) {
        respuesta.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
        respuesta.end("404: no existe " + (peticion.url || "/"))
        return
    }
    const cuerpo = await readFile(archivo)
    respuesta.writeHead(200, {
        "Content-Type": TIPOS[extname(archivo).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store",
        "Content-Length": cuerpo.length
    })
    respuesta.end(cuerpo)
})

servidor.listen(PUERTO, function () {
    console.log("Avatar-Map en http://localhost:" + PUERTO + "/")
    console.log("Sirviendo " + RAIZ)
})
