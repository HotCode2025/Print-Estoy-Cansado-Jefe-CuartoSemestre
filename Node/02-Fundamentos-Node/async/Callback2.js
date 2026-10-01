function soyAsincrona(){
    setTimeout(funcion (miCallback)  {
        console.log("Hola, soy una funcion asincrona");
    }, 1000);
    
}

console.log("Iniciando el proceso");
soyAsincrona(funcion(){
    console.log("Terminando el proceso");
});
