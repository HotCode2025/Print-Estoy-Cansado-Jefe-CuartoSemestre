package Print.EstoyCansadoJefe.Tienda_Libros.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;
import Print.EstoyCansadoJefe.Tienda_Libros.modelo.Libro;


public interface LibroRepsitorio extends JpaRepository<Libro, Integer>{}
