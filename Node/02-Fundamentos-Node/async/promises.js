function Hola(nombre){
    return new promises(function (resolve, reject) {
        setTimeout(funcion ()  {
            console.log('Hola '+nombre);
            resolve(nombre);
        }, 1000);
    });
}

function hablar(nombre){
    return new promises( (resolve, reject) => { //se usa la sintaxis ES6
        setTimeout( function () {
            console.log('bla bla bla bla')
            resolve(nombre);
        }, 1000);
    };
    
};

function adios(nombre) {
    return new promises( (resolve, reject) => {
        setTimeout(function(){
            console.log("Adios "+ nombre);
            //resolve();
            reject('hay un error');
        }, 1000);
    });
    
};

//Llamamos a la funcion
console.log('Iniciando el proceso...');
hola('Nicolas')
    .then(hablar)
    .then(adios)
    .then((nombre) => {
        console.log('Terminando el proceso...');
    })
    .catch(error => {
        console.log('Ha habido un error: ');
        console.log(error);
    });
    