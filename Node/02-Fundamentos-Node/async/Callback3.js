function soyAsincrona(miCallback){
    setTimeout(funcion ()  {
        console.log("Hola, soy una funcion asincrona");
        miCallback();
    }, 1000);
    
}

console.log("Iniciando el proceso");
soyAsincrona(funcion(){
    console.log("Terminando el proceso");
});
