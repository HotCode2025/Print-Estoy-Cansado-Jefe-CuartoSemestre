function Hola(nombre, miCallback){
    setTimeout(funcion ()  {
        console.log("Hola"+nombre);
        miCallback();
    }, 1000);
    
}

funcion adios(nombre, otroCallback) {
    setTimeout(funcion(){
        console.log("Adios", nombre)
        otroCallback();
    }, 1000);
}

console.log("Iniciando el proceso");
Hola("Alberto", funcion() {
    adios("Alberto", funcion(){
        console.log("Terminando el proceso");
    })
    
});
