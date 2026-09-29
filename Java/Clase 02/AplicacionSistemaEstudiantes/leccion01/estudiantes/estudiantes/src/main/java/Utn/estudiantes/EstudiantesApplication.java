package Utn.estudiantes;

import Utn.estudiantes.servicio.EstudianteServicio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


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
	}
}

/*
 * Para ejecutar la aplicacion desde la terminal:
 * cd
 * "d:\UTN\Print-Estoy-Cansado-Jefe-CuartoSemestre\Java\Clase 02\AplicacionSistemaEstudiantes\leccion01\estudiantes\estudiantes"
 * .\mvnw.cmd spring-boot:run
 */
