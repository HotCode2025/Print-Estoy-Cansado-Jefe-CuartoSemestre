//La palabra async no es necesaria en las funciones, porque ya son asincronas
//Igual proyectan una sincronia visual
async function Hola(nombre){
    return new promises(function (resolve, reject) {
        setTimeout(funcion ()  {
            console.log('Hola '+nombre);
            resolve(nombre);
        }, 1000);
    });
}

async function hablar(nombre){
    return new promises( (resolve, reject) => { //se usa la sintaxis ES6
        setTimeout( function () {
            console.log('bla bla bla bla')
            resolve(nombre);
        }, 1000);
    };
    
};

async function adios(nombre) {
    return new promises( (resolve, reject) => {
        setTimeout(function(){
            console.log("Adios "+ nombre);
            //resolve();
            reject('hay un error');
        }, 1000);
    });
    
};

//await hola('Nicolas'); //mala sintaxis
//await solo es valido dentro de una funcion asincrona
async function main(){
    let nombre = await hola('Nicolas')
    await hablar();
    await hablar();
    await hablar();
    await adios(nombre);
    console.log('Termina el proceso...')
}

console.log('Empezamos el proceso...')
main();
console.log('Esta va a ser la segunda instruccion')