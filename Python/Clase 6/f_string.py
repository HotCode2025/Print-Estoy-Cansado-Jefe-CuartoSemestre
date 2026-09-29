#6.4 Uso del template literal
nombre = 'Pepe'
edad = 28
sueldo = 3000
mensaje = f'Nombre {nombre} Edad {edad} Sueldo {sueldo:.2f}'
print(mensaje)

#6.5 Uso del método print() para dar formato en la salida
print(nombre, edad, sueldo, sep=', ')
