package Utn.estudiantes;

import Utn.estudiantes.modelo.Estudiantes2022;
import Utn.estudiantes.servicio.EstudianteServicio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.List;
import java.util.Scanner;


@SpringBootApplication
public class EstudiantesApplication implements CommandLineRunner {

	@Autowired
	private EstudianteServicio estudianteServicio;
	private static final Logger logger = LoggerFactory.getLogger(EstudiantesApplication.class);

	String nl = System.lineSeparator();

	public static void main(String[] args) {

			logger.info("Iniciando aplicación");
			//Levantamos la fabrica de Spring
		SpringApplication.run(EstudiantesApplication.class, args);
		logger.info("Aplicación Finalizada");
		}

	@Override
	public void run(String... args) throws Exception {
		logger.info(nl+"Ejecutando el método run de Spring..."+nl);
		var salir = false;
		var consola = new Scanner(System.in);
		while(!salir){
			mostrarMenu();
			salir = ejecutarOpciones(consola);
			logger.info(nl);
		} // fin while
	}

	private void mostrarMenu(){
		//logger.info(nl);
		logger.info("""
				****** Sistema de Estudiantes ******
				1. Listar Estudiantes
				2. Buscar Estudiante
				3. Agregar Estudiantes
				4. Modificar estudiante
				5. Eliminar estudiante
				6. Salir
				Eliga una opción:""");
	}

	private boolean ejecutarOpciones (Scanner consola) {
		var opcion = Integer.parseInt(consola.nextLine());
		var salir = false;
		switch (opcion) {
			case 1 -> { //Listar estudiantes
				logger.info(nl + "Listado de estudiantes: " + nl);
				List<Estudiantes2022> estudiantes = estudianteServicio.listarEstudiantes();
				estudiantes.forEach((estudiante -> logger.info(estudiante.toString() + nl)));
			}
			case 2 -> { // Buscar estudiante por id
				logger.info("Digite el id estudiante a buscar: ");
				var idEstudainte = Integer.parseInt(consola.nextLine());
				Estudiantes2022 estudiante =
						estudianteServicio.buscarEstudiantePorId(idEstudainte);
				if(estudiante != null)
					logger.info("Estudiante encontrado: "+ estudiante +nl);
				else
					logger.info("Estudiante NO encontrado: "+idEstudainte + nl);
			}
			case 3 -> { // Agregar estudiante
				logger.info("Agregar estudiante: "+nl);
				logger.info("Nombre: ");
				var nombre = consola.nextLine();
				logger.info("Apellido: ");
				var apellido = consola.nextLine();
				logger.info("Telefono: ");
				var telefono = consola.nextLine();
				logger.info("Email: ");
				var email = consola.nextLine();
				//Crear el objeto estudiante sin el id
				var estudiante = new Estudiantes2022();
				estudiante.setNombre(nombre);
				estudiante.setApellido(apellido);
				estudiante.setTelefono(telefono);
				estudiante.setEmail(email);
				estudianteServicio.guardarEstudiante(estudiante);
				logger.info("estudiante agregad: "+estudiante+nl);
			}
			case 4 -> { // modificar estudiante
			logger.info("Modificar estudiante: "+nl);
			logger.info("Ingrese el id estudiante: ");
			var idEstudiante = Integer.parseInt(consola.nextLine());
			// buscamos el estudiante a modificar
				Estudiantes2022 estudiante = estudianteServicio.buscarEstudiantePorId((idEstudiante));
				if (estudiante != null){
					logger.info("Nombre: ");
					var nombre = consola.nextLine();
					logger.info("Apellido: ");
					var apellido = consola.nextLine();
					logger.info("Telefono: ");
					var telefono = consola.nextLine();
					logger.info("Email: ");
					var email = consola.nextLine();
					estudiante.setNombre(nombre);
					estudiante.setApellido(apellido);
					estudiante.setTelefono(telefono);
					estudiante.setEmail(email);
					estudianteServicio.guardarEstudiante(estudiante);
					logger.info("Estudiante modificado: "+estudiante+nl);
				}
				else
					logger.info("Estudiante NO encontrado con el id: "+ idEstudiante+nl);
			}
			case 5 -> { //Eliminar estudiante
					logger.info("Eliminar estudiante: "+nl);
					logger.info("Digite el id estudiante: ");
					var idEstudiante = Integer.parseInt(consola.nextLine());
					//Buscamos el id estudiante a eliminar
					var estudiante = estudianteServicio.buscarEstudiantePorId((idEstudiante));
					if (estudiante != null){
						estudianteServicio.eliminarEstudiante(estudiante);
						logger.info("estudiante eliminado: "+estudiante+nl);
					}
					else
						logger.info("Estudiante NO encontrado con el id: "+idEstudiante+nl);
			}
			case 6 -> {
				logger.info("Hasta pronto!"+nl+nl);
				salir = true;
			}
			default -> logger.info("Opción no reconocida: "+ opcion+nl);
		} // Fin switch
		return salir;
	}
}

/*
 * Para ejecutar la aplicacion desde la terminal:
 * cd
 * "d:\UTN\Print-Estoy-Cansado-Jefe-CuartoSemestre\Java\Clase 02\AplicacionSistemaEstudiantes\leccion01\estudiantes\estudiantes"
 * .\mvnw.cmd spring-boot:run
 */
