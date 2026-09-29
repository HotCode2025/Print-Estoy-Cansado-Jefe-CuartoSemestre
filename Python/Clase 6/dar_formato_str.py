#6.1 Parámetro posicional de tipo String
# dar formato a un string

nombre = 'Pepe'
edad = 45
msj_con_formato = 'Mi nombre es %s y tengo %d años' % (nombre, edad)
print(msj_con_formato)

#6.2 Avanzamos desde una tupla
persona = ('Carla', 'Gomez', 5000.00)
msj_con_formato = 'Hola %s %s. Tu sueldo es %.2f' # % persona # Aqui le pasamos el objeto (que es una tupla)
#print(msj_con_formato % persona)

#6.3 Uso del método format() -> utilizamos place holder 
nombre = 'Juan'
edad = 19
sueldo = 3000
#msj_con_formato = 'Nombre {} Edad {} Sueldo {:.2f}'.format(nombre, edad, sueldo)
#print(msj_con_formato)

mensaje = 'Nombre {0} Edad {1} Sueldo {2:.2f}'.format(nombre, edad, sueldo)
print(mensaje)