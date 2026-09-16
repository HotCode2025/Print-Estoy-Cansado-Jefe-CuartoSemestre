package UTN.presentacion;

import UTN.conexion.Conexion;
import UTN.datos.EstudianteDAO;
import UTN.dominio.Estudiante;

import java.util.Scanner;

public class SistemaEstudiantesApp {
    public static void main(String[] args) {
        var salir = false;
        var consola = new Scanner(System.in);
        //Se crea una instancia de la clase servicio, esto lo hacemos fuera del ciclo
        var estudianteDao = new EstudianteDAO();
        while(!salir){
            try{
                mostrarMenu();
                salir = ejecutarOpciones(consola, estudianteDao);
            } catch(Exception e){
                System.out.println("Ocurrio un error al ejecutar la operacion: "+e.getMessage());
            }
        }//Fin While
    }//Fin Main

    private static void mostrarMenu(){
        System.out.print("""
                ******* Sistema de Estudiantes *******
                1. Listar estudiantes
                2. Buscar estudiantes
                3. Agregar estudiante
                4. Modificar estudiante
                5. Eliminar estudiante
                6. Salir
                Elige una opcion:
                """);
    }
    //Metodo para ejecutar opciones, va a regresar un valor booleano, ya que es el que
    //puede modificar el valor de la variable salir, si es un verdadero termina el ciclo while
    private static boolean ejecutarOpciones(Scanner consola, EstudianteDAO estudianteDao){
        var opcion = Integer.parseInt(consola.nextLine());
        var salir = false;
        switch (opcion){
            case 1 -> { //Listar estudiantes
                System.out.print("Listado de estudiantes...");
                //No muestra la información, solo recupera la info y regresa una lista
                var estudiantes = estudianteDao.listarEstudiantes();//Recibe el listado
                //Vamos a iterar cada objeto de tipo estudiante
                estudiantes.forEach(System.out::println);//Para imprimer la lista
            } //Fin caso 1
            case 2 -> { //Buscar estudiante por id

                System.out.print("Introduce el ide_estudiante a buscar: ");
                var idEstudiante = Integer.parseInt(consola.nextLine());
                var estudiante = new Estudiante(idEstudiante);
                var encontrado = estudianteDao.buscarEstudiantePorId(estudiante);
                if(encontrado)
                    System.out.println("Estudiante encontrado: "+estudiante);
                else
                    System.out.println("Estudiante no encontrado: "+estudiante);
            }//Fin caso 2
            case 3 -> { //Agregar estudiante
                System.out.println("Agregar estudiante: ");
                System.out.print("Nombre: ");
                var nombre = consola.nextLine();
                System.out.print("Apellido: ");
                var apellido = consola.nextLine();
                System.out.print("Telefono: ");
                var telefono = consola.nextLine();
                System.out.print("Email: ");
                var email = consola.nextLine();
                //Crear objeto estudiante(sin id)
                var estudiante = new Estudiante(nombre, apellido, telefono, email);
                var agregado = estudianteDao.agregarEstudiante(estudiante);
                if (agregado)
                    System.out.println("Estudiante agregado: "+estudiante);
                else
                    System.out.println("Estudiante no agregado: "+estudiante);
            }//Fin caso 3
            case 4 -> { //Modificar estudiante
                System.out.println("Modificar estudiante: ");
                //Aqui lo primero es especificar cual es el id del objeto a modificar
                System.out.print("Id Estudiante: ");
                var idEstudiante =Integer.parseInt(consola.nextLine());
                System.out.print("Nombre: ");
                var nombre = consola.nextLine();
                System.out.print("Apellido: ");
                var apellido = consola.nextLine();
                System.out.print("Telefono: ");
                var telefono = consola.nextLine();
                System.out.print("Email: ");
                var email = consola.nextLine();
                //Crea el objeto estudiante a modificar
                var estudiante =
                        new Estudiante(idEstudiante, nombre, apellido, telefono, email);
                var modificado = estudianteDao.modificarEstudiante(estudiante);
                if(modificado)
                    System.out.println("Estudiante modificado: "+estudiante);
                else
                    System.out.println("Estudiante no modificado: "+estudiante);
            }//Fin caso 4
            case 5 -> {//Eliminar estudiante
                System.out.println("Eliminar estudiante: ");
                System.out.print("Id Estudiante: ");
                var idEstudiante =Integer.parseInt(consola.nextLine());
                var estudiante = new Estudiante(idEstudiante);
                var eliminado = estudianteDao.eliminarEstudiante(estudiante);
                if(eliminado)
                    System.out.println("Estudiante eliminado: "+estudiante);
                else
                    System.out.println("Estudiante no eliminado: "+estudiante);
            }//Fin caso 5
            case 6 -> {//Salir
                System.out.println("Hasta pronto!!!");
                salir = true;
            }//Fin caso 6
            default -> System.out.println("Opcion no reconocida, ingrese otra opcion");
        }//Fin switch
        return salir;
    }

}//Fin clase