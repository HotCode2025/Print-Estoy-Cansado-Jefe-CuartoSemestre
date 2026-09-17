package Print.EstoyCansadoJefe.Tienda_Libros;

import java.awt.EventQueue;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;
import Print.EstoyCansadoJefe.Tienda_Libros.Vista.LibroFrom;

@SpringBootApplication
public class TiendaLibrosApplication {

	public static void main(String[] args) {
		ConfigurableApplicationContext contextoSpring =
				new SpringApplicationBuilder(TiendaLibrosApplication.class)
						.headless(false)
						.web(WebApplicationType.NONE)
						.run(args);

		EventQueue.invokeLater(() -> {
			LibroFrom libroFrom = contextoSpring.getBean(LibroFrom.class);
			libroFrom.setVisible(true);
		});
	}

}
/*JDK 26
 *cd
 * "Java\Proyecto Tienda de Libros (Clase6)\Tienda_Libros"
 * .\mvnw.cmd spring-boot:run */
